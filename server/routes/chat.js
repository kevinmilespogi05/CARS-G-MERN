const express = require('express');
const { getDb } = require('../config/firebase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get messages
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { limit = 50, offset = 0 } = req.query;
    
    let query = db.collection('messages').orderBy('createdAt', 'asc');
    
    // Regular users only see their messages and admin replies
    if (!['admin', 'superAdmin'].includes(req.userProfile.role)) {
      query = query.where('userId', '==', req.user.uid);
    }
    
    const snapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const db = getDb();
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
    }

    const messageData = {
      text: text.trim(),
      userId: req.user.uid,
      userDisplayName: req.userProfile.displayName,
      userRole: req.userProfile.role,
      isAdminReply: ['admin', 'superAdmin'].includes(req.userProfile.role),
      createdAt: new Date()
    };

    const docRef = await db.collection('messages').add(messageData);
    
    res.status(201).json({
      id: docRef.id,
      ...messageData,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation with specific user (admin only)
router.get('/conversation/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { userId } = req.params;
    const { limit = 100 } = req.query;
    
    const snapshot = await db.collection('messages')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'asc')
      .limit(parseInt(limit))
      .get();
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get all conversations (admin only)
router.get('/conversations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    
    // Get all unique user IDs who have sent messages
    const messagesSnapshot = await db.collection('messages')
      .orderBy('createdAt', 'desc')
      .get();
    
    const userIds = [...new Set(messagesSnapshot.docs.map(doc => doc.data().userId))];
    
    const conversations = await Promise.all(
      userIds.map(async (userId) => {
        const userDoc = await db.collection('users').doc(userId).get();
        const lastMessageSnapshot = await db.collection('messages')
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
        
        const userData = userDoc.exists ? userDoc.data() : null;
        const lastMessage = lastMessageSnapshot.docs[0]?.data();
        
        return {
          userId,
          userDisplayName: userData?.displayName || 'Unknown User',
          userRole: userData?.role || 'user',
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            createdAt: lastMessage.createdAt
          } : null,
          isOnline: false // This would need to be implemented with WebSocket or similar
        };
      })
    );

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Delete message (admin only)
router.delete('/:messageId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { messageId } = req.params;
    
    await db.collection('messages').doc(messageId).delete();
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Mark messages as read (admin only)
router.put('/:userId/read', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { userId } = req.params;
    
    // This would typically update a read status field
    // For now, we'll just return success
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;
