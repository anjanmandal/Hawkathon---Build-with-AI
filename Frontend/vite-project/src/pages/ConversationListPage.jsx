import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Divider,
  InputAdornment,
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import api from '../config/apiConfig';

// Helper to build initials from first/last name
function getInitials(user) {
  if (!user) return '';
  const f = user.firstName ? user.firstName[0].toUpperCase() : '';
  const l = user.lastName ? user.lastName[0].toUpperCase() : '';
  return f + l;
}

function MessengerPage() {
  // Pretend we have the current user's ID from context or local storage:
  const currentUserId = 'someUserId';

  // Left panel (search & chat list)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // Right panel (selected chat & messages)
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch user's existing chats on mount
  useEffect(() => {
    fetchMyChats();
  }, []);

  const fetchMyChats = async () => {
    try {
      setLoadingChats(true);
      // e.g. GET /chat/myChats => { chats: [...] }
      const res = await api.get('/chat/myChats');
      setChats(res.data.chats || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  // Filter out the current user from search results
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
      const allUsers = res.data.users || [];
      // Filter out the current logged-in user
      const filtered = allUsers.filter((u) => u._id !== currentUserId);
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  // Open or create a one-to-one chat upon selecting a user from search
  const handleSelectUser = async (user) => {
    try {
      // e.g. POST /chat/createOneToOne => { chat: {...} }
      const res = await api.post('/chat/createOneToOne', { participantId: user._id });
      const chat = res.data.chat;
      // Add new chat to our list if not already present
      setChats((prev) => {
        const found = prev.find((c) => c._id === chat._id);
        if (!found) return [...prev, chat];
        return prev;
      });

      // Load messages in right panel
      selectChat(chat);

      // Clear search UI
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Error opening/creating chat:', err);
    }
  };

  // Selecting an existing chat from the list
  const handleSelectChat = (chat) => {
    selectChat(chat);
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    setMessages([]);
    try {
      setLoadingMessages(true);
      // e.g. GET /chat/:chatId/messages => { messages: [...] }
      const res = await api.get(`/chat/${chat._id}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Convert a one-to-one or expand a group by adding participants
  const handleAddParticipants = async () => {
    if (!selectedChat) return;
    const participantIds = prompt('Enter user IDs (comma separated) to add:');
    if (!participantIds) return;
    const idsArray = participantIds.split(',').map((id) => id.trim());

    try {
      // e.g. POST /chat/addParticipants => returns updated chat
      const res = await api.post('/chat/addParticipants', {
        chatId: selectedChat._id,
        participantIds: idsArray
      });
      const updatedChat = res.data.chat;
      // Update local state
      setChats((prev) => prev.map((c) => (c._id === updatedChat._id ? updatedChat : c)));
      setSelectedChat(updatedChat);
    } catch (err) {
      console.error('Error adding participants:', err);
    }
  };

  // Send new message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const text = newMessage.trim();
    setNewMessage('');
    try {
      // e.g. POST /chat/:chatId/message => { message: {...} }
      const res = await api.post(`/chat/${selectedChat._id}/message`, { text });
      const msg = res.data.message;
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // For listing chats on the left: show other person's name if 1-on-1, or groupName if group
  const getChatDisplayName = (chat) => {
    if (chat.isGroup) {
      return chat.groupName || 'Untitled Group';
    } else {
      // find the "other" participant
      const otherUser = chat.participants.find((u) => u._id !== currentUserId);
      if (!otherUser) return 'One-to-One Chat';
      return `${otherUser.firstName} ${otherUser.lastName}`.trim();
    }
  };

  // The top bar in the right panel
  const getChatTitleBar = () => {
    if (!selectedChat) return 'No chat selected';
    if (selectedChat.isGroup) {
      return selectedChat.groupName || 'Group Chat';
    }
    // one-to-one
    const otherUser = selectedChat.participants.find((u) => u._id !== currentUserId);
    if (!otherUser) return 'One-to-One Chat';
    return `${otherUser.firstName} ${otherUser.lastName}`.trim();
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Left panel: search + chat list */}
      <Box sx={{ width: 300, borderRight: '1px solid #ccc', p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Conversations
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ mb: 1 }}
        />

        {/* Search results */}
        {searchResults.length > 0 && (
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Search Results
              </Typography>
              {searchResults.map((user) => (
                <Box
                  key={user._id}
                  sx={{
                    cursor: 'pointer',
                    p: 1,
                    ':hover': { backgroundColor: '#f0f0f0' }
                  }}
                  onClick={() => handleSelectUser(user)}
                >
                  <Typography>
                    {user.firstName} {user.lastName} ({user.email})
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* My Chats */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          My Chats
        </Typography>
        {loadingChats ? (
          <Typography>Loading chats...</Typography>
        ) : (
          <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {chats.map((chat) => {
              const displayName = getChatDisplayName(chat);
              const isSelected = selectedChat && selectedChat._id === chat._id;

              return (
                <Card
                  key={chat._id}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#e6f7ff' : '#fff'
                  }}
                  onClick={() => handleSelectChat(chat)}
                >
                  <CardContent>
                    <Typography variant="body2">{displayName}</Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Right panel: active chat */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedChat ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Select or create a conversation</Typography>
          </Box>
        ) : (
          <>
            {/* Chat top bar */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="h6">{getChatTitleBar()}</Typography>
              <IconButton onClick={handleAddParticipants}>
                <AddIcon />
              </IconButton>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
              {loadingMessages ? (
                <Typography>Loading messages...</Typography>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender._id === currentUserId;

                  if (isMe) {
                    // My outgoing message (on the right)
                    return (
                      <Box
                        key={msg._id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row-reverse',
                          mb: 2
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: '#d4f8e8',
                            borderRadius: 2,
                            p: 1,
                            maxWidth: '60%'
                          }}
                        >
                          <Typography variant="body2">{msg.text}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  } else {
                    // Another user's message (incoming, on the left)
                    const initials = getInitials(msg.sender);
                    return (
                      <Box
                        key={msg._id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          mb: 2,
                          alignItems: 'flex-start'
                        }}
                      >
                        <Avatar sx={{ mr: 1 }}>{initials}</Avatar>
                        <Box
                          sx={{
                            backgroundColor: '#f0f0f0',
                            borderRadius: 2,
                            p: 1,
                            maxWidth: '60%'
                          }}
                        >
                          {/* Optionally show the sender's name */}
                          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                            {msg.sender.firstName} {msg.sender.lastName}
                          </Typography>
                          <Typography variant="body2">{msg.text}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }
                })
              )}
            </Box>

            {/* Message input */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #ccc',
                display: 'flex',
                gap: 1
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSend();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSend}>
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default MessengerPage;
