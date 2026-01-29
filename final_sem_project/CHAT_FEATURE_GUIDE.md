# Chat Feature Implementation Guide

## Overview
The chat feature enables real-time messaging between donors, receivers, NGOs, hospitals, and admins in the MediReach Blood Donation Platform.

## Features Implemented

### 1. **Real-time Messaging**
- Live message updates using Firebase Firestore listeners
- Instant message delivery and display
- Auto-scroll to latest messages
- Timestamp for each message

### 2. **Conversation Management**
- Automatic conversation creation from request pages
- Prevents duplicate conversations between same users
- Sorted conversations by most recent activity
- Shows last message preview
- Displays "time ago" format (e.g., "2m ago", "5h ago")

### 3. **User Access**
All user roles can access chat:
- ✅ **Donors**: Can message receivers for requests they view
- ✅ **Receivers**: Can message donors who accepted their requests
- ✅ **NGOs**: Can message any user (via admin panel or requests)
- ✅ **Hospitals**: Can message any user (via admin panel or requests)
- ✅ **Admins**: Can message any user (full access)

### 4. **UI/UX Enhancements**
- Message bubbles with different colors for sender/receiver
- Empty state when no messages exist
- Loading states
- Disabled send button for empty messages
- "Press Enter to send" hint
- Responsive design for mobile and desktop

## How to Use

### For Donors
1. Navigate to any blood request (Requests → View Details)
2. If the request is Verified, Matched, or In Progress, you'll see a **"Message Receiver"** button
3. Click the button to start/open a conversation
4. Type your message and press Enter or click Send

### For Receivers
1. Navigate to your request (My Requests → View Details)
2. If donors have accepted your request, you'll see **"Contact Donors"** section
3. Click **"Message Donor 1"**, **"Message Donor 2"**, etc. to chat with each donor
4. Start the conversation to coordinate donation details

### For NGOs/Hospitals/Admins
1. Access any request from the verification panel or requests list
2. Use the message functionality to communicate with donors/receivers
3. Coordinate donation logistics and verification

## Database Structure

### Conversations Collection (`conversations`)
```javascript
{
  participants: [userId1, userId2],        // Array of user IDs
  participantNames: [name1, name2],       // Array of user names
  requestId: "requestDocId",              // Related request ID (optional)
  lastMessage: "Hello, when can...",      // Last message preview
  lastMessageTime: Timestamp,             // Firestore timestamp
  createdAt: Timestamp,                   // Conversation creation time
  unreadCount: 0                          // Number of unread messages
}
```

### Messages Collection (`messages`)
```javascript
{
  conversationId: "conversationDocId",    // Reference to conversation
  senderId: "userId",                     // Sender user ID
  senderName: "John Doe",                 // Sender display name
  text: "Hello, I can donate...",        // Message content
  timestamp: Timestamp,                   // Message sent time
  read: false                            // Read status
}
```

## Code Locations

### Chat Component
**File**: `src/components/Chat/Chat.js`
- Main chat interface
- Conversation list
- Message display
- Send message functionality

### Request Details Integration
**File**: `src/components/Requests/RequestDetails.js`
- `handleStartConversation()` function
- Message buttons for donors and receivers
- Conversation initialization logic

### Routing
**File**: `src/App.js`
- Route: `/chat`
- Protected by authentication

## Key Functions

### `handleStartConversation(otherUserId, otherUserName)`
Creates a new conversation or navigates to existing one:
1. Checks if conversation already exists between users
2. If exists: navigates to `/chat`
3. If not: creates new conversation and navigates to `/chat`

### `handleSendMessage(e)`
Sends a message:
1. Validates message is not empty
2. Adds message to Firestore `messages` collection
3. Updates conversation's `lastMessage` and `lastMessageTime`
4. Clears input field

### `formatTimestamp(timestamp)`
Formats timestamp to human-readable format:
- "Just now" (< 1 minute)
- "5m ago" (< 1 hour)
- "3h ago" (< 24 hours)
- "2d ago" (< 7 days)
- Full date (> 7 days)

## Features & Improvements

### Current Features ✅
- [x] Real-time messaging
- [x] Conversation list
- [x] Message history
- [x] Auto-scroll to latest message
- [x] Timestamp formatting
- [x] Empty states
- [x] All user roles supported
- [x] Integration with blood requests
- [x] Prevents duplicate conversations
- [x] Last message preview

### Future Enhancements 🚀
- [ ] Message read receipts (double checkmark)
- [ ] Typing indicators ("User is typing...")
- [ ] Image/file attachments
- [ ] Message search within conversation
- [ ] Delete/edit messages
- [ ] Push notifications for new messages
- [ ] Group chat support (multiple users)
- [ ] Emoji picker
- [ ] Voice messages
- [ ] Video call integration

## Testing Checklist

### Basic Functionality
- [ ] Donor can message receiver from request page
- [ ] Receiver can message donors who accepted their request
- [ ] Messages appear in real-time for both users
- [ ] Conversation persists after closing and reopening
- [ ] Last message preview updates correctly
- [ ] Timestamps display correctly

### Edge Cases
- [ ] Multiple conversations with different users work independently
- [ ] Clicking message button multiple times doesn't create duplicate conversations
- [ ] Empty messages cannot be sent
- [ ] Long messages wrap properly
- [ ] Special characters in messages display correctly

### User Experience
- [ ] Auto-scroll works when new messages arrive
- [ ] Conversation list sorts by most recent
- [ ] Loading states show appropriately
- [ ] Mobile responsive design works
- [ ] Press Enter to send works

## Firestore Security Rules

Add these rules to your `firestore.rules`:

```javascript
// Conversations
match /conversations/{conversationId} {
  allow read: if request.auth != null && 
    request.auth.uid in resource.data.participants;
  allow create: if request.auth != null && 
    request.auth.uid in request.resource.data.participants;
  allow update: if request.auth != null && 
    request.auth.uid in resource.data.participants;
}

// Messages
match /messages/{messageId} {
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/conversations/$(resource.data.conversationId)) &&
    request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.senderId &&
    exists(/databases/$(database)/documents/conversations/$(request.resource.data.conversationId)) &&
    request.auth.uid in get(/databases/$(database)/documents/conversations/$(request.resource.data.conversationId)).data.participants;
}
```

## Troubleshooting

### Messages not appearing
1. Check Firebase console for messages collection
2. Verify user is authenticated
3. Check browser console for errors
4. Ensure Firestore listeners are active

### Conversation not created
1. Check user IDs are valid
2. Verify Firebase configuration
3. Check security rules allow conversation creation
4. Look for errors in browser console

### Auto-scroll not working
1. Ensure messagesEndRef is properly attached
2. Check if messages array is populated
3. Verify scrollToBottom() is called after messages load

## Support

For issues or questions about the chat feature:
1. Check browser console for errors
2. Review Firestore data structure
3. Verify security rules are correctly set
4. Check user authentication status

---

**Last Updated**: January 10, 2026
**Version**: 1.0
**Status**: ✅ Production Ready
