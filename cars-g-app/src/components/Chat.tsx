import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { Send, MessageCircle, Users, Shield } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  userId: string;
  userDisplayName: string;
  userRole: string;
  createdAt: any;
  isAdminReply?: boolean;
}

interface ChatProps {
  isAdminView?: boolean;
}

const Chat: React.FC<ChatProps> = ({ isAdminView = false }) => {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Query messages based on user role
    let messagesQuery;
    if (isAdminView) {
      // Admins see all messages
      messagesQuery = query(
        collection(db, 'messages'),
        orderBy('createdAt', 'asc')
      );
    } else {
      // Regular users see only their messages and admin replies
      messagesQuery = query(
        collection(db, 'messages'),
        orderBy('createdAt', 'asc')
      );
    }

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      // Filter messages for regular users (only their messages and admin replies)
      if (!isAdminView) {
        const filteredMessages = messagesData.filter(message => 
          message.userId === currentUser.uid || message.isAdminReply
        );
        setMessages(filteredMessages);
      } else {
        setMessages(messagesData);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, isAdminView]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !userProfile) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage.trim(),
        userId: currentUser.uid,
        userDisplayName: userProfile.displayName,
        userRole: userProfile.role,
        createdAt: serverTimestamp(),
        isAdminReply: isAdminView
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Community Chat
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Community Chat
          {isAdminView && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Admin View
            </span>
          )}
        </h3>

        {/* Messages */}
        <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isAdminView ? 'No user messages to review' : 'Start a conversation with the community'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isCurrentUser = message.userId === currentUser?.uid;
                const isAdmin = message.userRole === 'admin' || message.userRole === 'superAdmin';
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : isAdmin
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.userDisplayName}
                          </span>
                          {isAdmin && (
                            <Shield className="h-3 w-3" />
                          )}
                          <span className="text-xs opacity-75">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isAdminView ? "Reply to user..." : "Type your message..."}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={!currentUser}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !currentUser}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Chat Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {isAdminView ? (
              <>
                <Users className="inline h-3 w-3 mr-1" />
                Admin view - See all community conversations
              </>
            ) : (
              <>
                <MessageCircle className="inline h-3 w-3 mr-1" />
                Your messages are visible to admins for support
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
