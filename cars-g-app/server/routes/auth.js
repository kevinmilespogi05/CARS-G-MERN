const express = require('express');
const { getDb } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      ...userData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    const db = getDb();
    
    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (photoURL) updateData.photoURL = photoURL;
    updateData.lastActive = new Date();

    await db.collection('users').doc(req.user.uid).update(updateData);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user points
router.get('/points', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();
    res.json({ 
      points: userData.points || 0,
      displayName: userData.displayName,
      role: userData.role
    });
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ error: 'Failed to fetch user points' });
  }
});

// Add points to user (admin only)
router.post('/points', authenticateToken, async (req, res) => {
  try {
    const { points, reason } = req.body;
    const db = getDb();
    
    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Invalid points value' });
    }

    await db.collection('users').doc(req.user.uid).update({
      points: admin.firestore.FieldValue.increment(points),
      lastActive: new Date()
    });

    // Log points addition
    await db.collection('points_log').add({
      userId: req.user.uid,
      points: points,
      reason: reason || 'Manual points addition',
      timestamp: new Date(),
      addedBy: req.user.uid
    });

    res.json({ message: `${points} points added successfully` });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

module.exports = router;
