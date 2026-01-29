import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
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
import { Link } from 'react-router-dom';

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
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        senderName: userData.name,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update conversation's last message
      const conversationRef = doc(db, 'conversations', selectedConversation.id);
      await updateDoc(conversationRef, {
        lastMessage: newMessage.trim().substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
        lastMessageTime: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Chat with donors, receivers, and organizations</p>
        </div>
        <button
          onClick={() => setShowNewConversation(true)}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
        >
          <span className="mr-2">➕</span>
          New Conversation
        </button>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">New Conversation</h2>
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  placeholder="Search by name, email, or role..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <button
                  onClick={searchUsers}
                  disabled={searching}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {searchResults.length === 0 && searchQuery && !searching && (
                <p className="text-center text-gray-500 py-8">No users found</p>
              )}
              {searchResults.length === 0 && !searchQuery && (
                <p className="text-center text-gray-500 py-8">
                  Enter a name, email, or role to search for users
                </p>
              )}
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => startNewConversation(user)}
                  className="p-4 border border-gray-200 rounded-lg mb-3 cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded">
                        {user.role}
                      </span>
                    </div>
                    <span className="text-primary-600 text-xl">💬</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          </div>
          <div className="overflow-y-auto h-[600px]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="font-semibold text-gray-700 mb-2">No conversations yet</p>
                <p className="text-sm mt-2 mb-4">Start a new conversation with donors, receivers, or organizations</p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-semibold"
                >
                  Start Conversation
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800">
                        {getOtherParticipantName(conv)}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(conv.lastMessageTime)}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center ml-2 flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">
                  {getOtherParticipantName(selectedConversation)}
                </h2>
                {selectedConversation.requestId && (
                  <Link
                    to={`/requests`}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Related to request #{selectedConversation.requestId.slice(0, 8)}
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 h-[500px] space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">👋</div>
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 ${
                        msg.senderId === currentUser.uid ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.senderId === currentUser.uid
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">{msg.senderName}</p>
                        <p className="break-words">{msg.text}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {msg.timestamp?.toDate
                            ? msg.timestamp.toDate().toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send</p>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
