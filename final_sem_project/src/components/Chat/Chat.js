import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FaComments, FaPaperPlane, FaSearch, FaTimes, FaUser, 
  FaCircle, FaEllipsisV, FaPlus 
} from 'react-icons/fa';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FAQ_KB } from '../../utils/bulkAddFAQs';
import { Link } from 'react-router-dom';

const BOT_USER_ID = 'medibot';
const BOT_NAME = 'MediBot';
const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const isBotMessage = (message) => Boolean(message?.isBot || message?.senderRole === 'bot');

const fetchPublicKnowledgeReply = async (messageText) => {
  try {
    const encodedQuery = encodeURIComponent(messageText);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const abstract = (data?.AbstractText || '').trim();
    const answer = (data?.Answer || '').trim();
    const related = Array.isArray(data?.RelatedTopics)
      ? data.RelatedTopics.find((topic) => topic?.Text)?.Text
      : '';

    const best = answer || abstract || related || '';
    if (!best) {
      return null;
    }

    return `${best}\n\nI can also guide you through how to do this inside MediReach.`;
  } catch (error) {
    console.error('Public API fallback failed:', error);
    return null;
  }
};

const FAQ_STOPWORDS = new Set([
  'the', 'is', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with',
  'i', 'you', 'me', 'my', 'it', 'this', 'that', 'how', 'what', 'when', 'where',
  'why', 'can', 'do', 'does', 'am', 'are', 'be', 'as', 'at', 'from'
]);

const tokenizeFaqQuery = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !FAQ_STOPWORDS.has(token));

const getFaqBasedReply = (messageText, userRole) => {
  const tokens = tokenizeFaqQuery(messageText);
  if (tokens.length === 0) {
    return null;
  }

  const eligibleFaqs = FAQ_KB.filter((faq) => {
    const roles = Array.isArray(faq.roles) ? faq.roles : [];
    return roles.includes('all') || (userRole && roles.includes(userRole));
  });

  let bestFaq = null;
  let bestScore = 0;

  for (const faq of eligibleFaqs) {
    const questionText = (faq.question || '').toLowerCase();
    const answerText = (faq.answer || '').toLowerCase();
    let score = 0;

    for (const token of tokens) {
      if (questionText.includes(token)) {
        score += 2;
      } else if (answerText.includes(token)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
  }

  if (!bestFaq || bestScore < 2) {
    return null;
  }

  return `${bestFaq.answer}\n\nRelated FAQ: ${bestFaq.question}`;
};

const buildFallbackReply = (messageText) => {
  const lower = messageText.toLowerCase();

  if (lower.includes('donate') || lower.includes('donation')) {
    return 'To donate, make sure your donor profile is complete, your availability is turned on, and your blood group is updated. If you want, tell me your blood group and city and I can guide you on the next steps.';
  }

  if (lower.includes('request') || lower.includes('need blood') || lower.includes('need donor')) {
    return 'To request blood, open the Requests section, create a request with blood group, units, urgency, and location, then submit it for verification. If you tell me the situation, I can help you phrase the request clearly.';
  }

  if (lower.includes('eligible') || lower.includes('can i donate') || lower.includes('am i eligible')) {
    return 'Most donors should be in good health, meet the age and weight requirements, and not have donated too recently. If you want, tell me your age and last donation timing and I can give general guidance.';
  }

  if (lower.includes('verify') || lower.includes('verification')) {
    return 'Verification usually means checking user or request details before matching. If you tell me whether this is about an account, organization, or blood request, I can guide you more precisely.';
  }

  if (lower.includes('chat') || lower.includes('message')) {
    return 'You can use chat to coordinate with donors, receivers, and support. If messages are not updating or sending properly, tell me what you see and I can help troubleshoot it.';
  }

  if (lower.includes('login') || lower.includes('register') || lower.includes('account')) {
    return 'For account help, use Register to create a new profile or Login if you already have one. If there is an auth issue, tell me the exact problem and I will guide you step by step.';
  }

  if (lower.includes('urgent') || lower.includes('emergency')) {
    return 'If this is a medical emergency, contact emergency services immediately. I can also help you draft a high-priority blood request in the app.';
  }

  if (lower.includes('blood group') || lower.includes('blood type')) {
    return 'Share the required blood group, city, and urgency. I can help you format that into a clear request message for donors.';
  }

  return 'I am here to help with requests, donor coordination, and platform guidance. Please share your need in one line and I will suggest the next best step.';
};

const generateBotReply = async (messageText, history, userRole) => {
  if (!GEMINI_API_KEY) {
    const faqReply = getFaqBasedReply(messageText, userRole);
    if (faqReply) {
      return faqReply;
    }

    const publicReply = await fetchPublicKnowledgeReply(messageText);
    return publicReply || buildFallbackReply(messageText);
  }

  const contents = [
    ...history
      .slice(-8)
      .map((entry) => ({
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: entry.text }]
      })),
    {
      role: 'user',
      parts: [{ text: messageText }]
    }
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: 'You are MediBot for MediReach. Provide concise, safe guidance on donor coordination, request clarity, and platform usage. Keep replies under 120 words.'
              }
            ]
          },
          contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 220
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini request failed:', errorText);

      const faqReply = getFaqBasedReply(messageText, userRole);
      if (faqReply) {
        return faqReply;
      }

      const publicReply = await fetchPublicKnowledgeReply(messageText);
      return publicReply || buildFallbackReply(messageText);
    }

    const result = await response.json();
    const reply = result?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      ?.trim();

    return reply || buildFallbackReply(messageText);
  } catch (error) {
    console.error('Gemini request error:', error);

    const faqReply = getFaqBasedReply(messageText, userRole);
    if (faqReply) {
      return faqReply;
    }

    const publicReply = await fetchPublicKnowledgeReply(messageText);
    return publicReply || buildFallbackReply(messageText);
  }
};

const getMessageTimeLabel = (timestamp) => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return '';
};

const Chat = () => {
  const { currentUser, userData } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch conversations where user is a participant
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort conversations by last message time
      convos.sort((a, b) => {
        const timeA = a.lastMessageTime?.toMillis?.() || 0;
        const timeB = b.lastMessageTime?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedConversation) return;

    // Listen to messages in selected conversation
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', selectedConversation.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      // Auto-scroll to bottom when new messages arrive
      setTimeout(scrollToBottom, 100);
    }, (error) => {
      console.error('Error listening to messages:', error);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    const shouldAutoReply = selectedConversation.isBot;
    const localMessageTime = new Date();
    const optimisticUserMessageId = `local-user-${Date.now()}`;
    const history = messages
      .slice(-8)
      .map((msg) => ({
        role: isBotMessage(msg) ? 'assistant' : 'user',
        text: msg.text
      }));

    setMessages((prevMessages) => ([
      ...prevMessages,
      {
        id: optimisticUserMessageId,
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        senderName: userData.name,
        text: messageText,
        timestamp: localMessageTime,
        read: false,
        pending: true
      }
    ]));
    setNewMessage('');
    setTimeout(scrollToBottom, 50);

    try {
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        senderName: userData.name,
        text: messageText,
        timestamp: serverTimestamp(),
        read: false
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update conversation's last message
      const conversationRef = doc(db, 'conversations', selectedConversation.id);
      await updateDoc(conversationRef, {
        lastMessage: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
        lastMessageTime: serverTimestamp()
      });

      if (shouldAutoReply) {
        setBotTyping(true);
        const botReply = await generateBotReply(messageText, history, userData?.role);
        const optimisticBotMessageId = `local-bot-${Date.now()}`;

        setMessages((prevMessages) => ([
          ...prevMessages,
          {
            id: optimisticBotMessageId,
            conversationId: selectedConversation.id,
            senderId: currentUser.uid,
            senderName: BOT_NAME,
            senderRole: 'bot',
            isBot: true,
            text: botReply,
            timestamp: new Date(),
            read: true,
            pending: true
          }
        ]));
        setTimeout(scrollToBottom, 50);

        await addDoc(collection(db, 'messages'), {
          conversationId: selectedConversation.id,
          senderId: currentUser.uid,
          senderName: BOT_NAME,
          senderRole: 'bot',
          isBot: true,
          text: botReply,
          timestamp: serverTimestamp(),
          read: true
        });

        await updateDoc(conversationRef, {
          lastMessage: botReply.substring(0, 50) + (botReply.length > 50 ? '...' : ''),
          lastMessageTime: serverTimestamp()
        });
      }
    } catch (error) {
      setMessages((prevMessages) => prevMessages.filter((message) => !message?.pending));
      console.error('Error sending message:', error);
      alert(selectedConversation.isBot
        ? 'Bot reply failed. Refresh the page and try again.'
        : 'Failed to send message. Please try again.');
    } finally {
      setBotTyping(false);
    }
  };

  const getOtherParticipantName = (conversation) => {
    return conversation.participantNames?.find(
      name => name !== userData.name
    ) || 'Unknown User';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp?.toDate) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const snapshot = await getDocs(q);
      
      const users = [];
      snapshot.forEach((doc) => {
        const user = { id: doc.id, ...doc.data() };
        // Filter out current user and search by name/email
        if (user.id !== currentUser.uid) {
          const searchLower = searchQuery.toLowerCase();
          if (
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.role?.toLowerCase().includes(searchLower)
          ) {
            users.push(user);
          }
        }
      });
      
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Failed to search users. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const startNewConversation = async (otherUser) => {
    try {
      // Check if conversation already exists
      const existingConvo = conversations.find(conv => 
        conv.participants.includes(otherUser.id)
      );

      if (existingConvo) {
        setSelectedConversation(existingConvo);
        setShowNewConversation(false);
        setSearchQuery('');
        setSearchResults([]);
        return;
      }

      // Create new conversation
      const newConvo = await addDoc(collection(db, 'conversations'), {
        participants: [currentUser.uid, otherUser.id],
        participantNames: [userData.name, otherUser.name],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        unreadCount: 0
      });

      // Select the new conversation
      setSelectedConversation({
        id: newConvo.id,
        participants: [currentUser.uid, otherUser.id],
        participantNames: [userData.name, otherUser.name],
        lastMessage: '',
        unreadCount: 0
      });
      
      setShowNewConversation(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
    }
  };

  const startBotConversation = async () => {
    try {
      const existingBotConvo = conversations.find((conv) => conv.isBot);
      if (existingBotConvo) {
        setSelectedConversation(existingBotConvo);
        return;
      }

      const newConvo = await addDoc(collection(db, 'conversations'), {
        participants: [currentUser.uid, BOT_USER_ID],
        participantNames: [userData.name, BOT_NAME],
        lastMessage: 'Ask me anything about donation flow, FAQs, or support.',
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        unreadCount: 0,
        isBot: true
      });

      setSelectedConversation({
        id: newConvo.id,
        participants: [currentUser.uid, BOT_USER_ID],
        participantNames: [userData.name, BOT_NAME],
        lastMessage: 'Ask me anything about donation flow, FAQs, or support.',
        unreadCount: 0,
        isBot: true
      });
    } catch (error) {
      console.error('Error creating bot conversation:', error);
      alert('Failed to start AI chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <FaComments className="text-primary-600" />
                Messages
              </h1>
              <p className="text-gray-600 mt-2 ml-12">Connect with donors, receivers, and healthcare organizations</p>
            </div>
            <button
              onClick={() => setShowNewConversation(true)}
              className="group bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
              New Chat
            </button>
            <button
              onClick={startBotConversation}
              className="ml-3 group bg-white border-2 border-primary-600 text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <FaComments className="group-hover:scale-110 transition-transform duration-300" />
              Chat with MediBot
            </button>
          </div>
        </div>

      {/* Enhanced New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] flex flex-col transform animate-slide-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaComments />
                  Start New Conversation
                </h2>
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  placeholder="Search by name, email, or role..."
                  className="w-full pl-12 pr-24 py-3 rounded-xl border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white placeholder-blue-100 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 transition-all duration-200"
                  autoFocus
                />
                <button
                  onClick={searchUsers}
                  disabled={searching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-primary-600 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition font-semibold text-sm disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            {/* Search Results */}
            <div className="overflow-y-auto flex-1 p-6">
              {searchResults.length === 0 && searchQuery && !searching && (
                <div className="text-center py-12">
                  <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No users found</p>
                  <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                </div>
              )}
              {searchResults.length === 0 && !searchQuery && (
                <div className="text-center py-12">
                  <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Search for users to start chatting</p>
                  <p className="text-sm text-gray-400 mt-2">Enter a name, email, or role above</p>
                </div>
              )}
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => startNewConversation(user)}
                    className="group bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:shadow-lg transition-all duration-200 transform hover:scale-102"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          <FaUser />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <span className="inline-block mt-1 px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <FaComments className="text-2xl text-primary-500 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaComments />
              Conversations
            </h2>
          </div>
          <div className="overflow-y-auto h-[600px]">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaComments className="text-5xl text-primary-600" />
                </div>
                <p className="font-bold text-gray-800 mb-2 text-lg">No conversations yet</p>
                <p className="text-sm text-gray-600 mb-6">Start chatting with donors, receivers, or healthcare organizations</p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold transform hover:scale-105"
                >
                  Start Your First Chat
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 ${
                    selectedConversation?.id === conv.id 
                      ? 'bg-gradient-to-r from-primary-100 to-purple-100 border-l-4 border-l-primary-600' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        <FaUser />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 truncate">
                          {getOtherParticipantName(conv)}
                        </h3>
                        {conv.unreadCount > 0 && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 shadow-md animate-pulse">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(conv.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Enhanced Chat Header */}
              <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 font-bold shadow-lg">
                        <FaUser />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-primary-600 rounded-full"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedConversation.isBot ? BOT_NAME : getOtherParticipantName(selectedConversation)}
                      </h2>
                      {selectedConversation.requestId ? (
                        <Link
                          to={`/requests`}
                          className="text-sm text-blue-100 hover:text-white hover:underline flex items-center gap-1"
                        >
                          Related to request #{selectedConversation.requestId.slice(0, 8)}
                        </Link>
                      ) : (
                        <p className="text-sm text-blue-100 flex items-center gap-1">
                          <FaCircle className="text-xs text-green-400" />
                          {selectedConversation.isBot ? 'AI Assistant Online' : 'Online'}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>

              {/* Enhanced Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 h-[500px] bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaComments className="text-4xl text-primary-600" />
                      </div>
                      <p className="text-gray-600 font-medium">No messages yet</p>
                      <p className="text-sm text-gray-400 mt-2">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const botMessage = isBotMessage(msg);
                      const isCurrentUserMessage = msg.senderId === currentUser.uid && !botMessage;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isCurrentUserMessage ? 'justify-end' : 'justify-start'
                          } animate-slide-up`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md ${
                              isCurrentUserMessage
                                ? 'bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-t-2xl rounded-l-2xl shadow-lg'
                                : 'bg-white text-gray-800 rounded-t-2xl rounded-r-2xl shadow-md border border-gray-200'
                            } px-5 py-3 transform transition-all duration-200 hover:scale-102 hover:shadow-xl`}
                          >
                            <p className={`text-xs font-semibold mb-1 ${
                              isCurrentUserMessage ? 'text-blue-100' : 'text-primary-600'
                            }`}>{msg.senderName}</p>
                            <p className="break-words leading-relaxed">{msg.text}</p>
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <p className={`text-xs ${
                                isCurrentUserMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {getMessageTimeLabel(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {botTyping && selectedConversation.isBot && (
                      <div className="flex justify-start animate-slide-up">
                        <div className="bg-white text-gray-800 rounded-t-2xl rounded-r-2xl shadow-md border border-gray-200 px-5 py-3">
                          <p className="text-xs font-semibold mb-1 text-primary-600">{BOT_NAME}</p>
                          <p className="italic text-gray-500">Typing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <form onSubmit={handleSendMessage} className="p-5 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 group"
                  >
                    <FaPaperPlane className="text-lg group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1">Press Enter to send • Shift + Enter for new line</p>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FaComments className="text-6xl text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Select a Conversation</h3>
                <p className="text-gray-600">Choose from your conversations or start a new chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Chat;
