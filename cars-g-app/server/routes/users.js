const express = require('express');
const { getDb } = require('../config/firebase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { role, limit = 50, offset = 0 } = req.query;
    
    let query = db.collection('users').orderBy('createdAt', 'desc');
    
    if (role) {
      query = query.where('role', '==', role);
    }
    
    const snapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const db = getDb();
    const { limit = 10 } = req.query;
    
    const snapshot = await db.collection('users')
      .orderBy('points', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const leaderboard = snapshot.docs.map(doc => ({
      id: doc.id,
      displayName: doc.data().displayName,
      points: doc.data().points || 0,
      role: doc.data().role,
      photoURL: doc.data().photoURL
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const userDoc = await db.collection('users').doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Only allow users to see their own profile or admins to see any profile
    if (req.params.id !== req.user.uid && !['admin', 'superAdmin'].includes(req.userProfile.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user role (admin only)
router.put('/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const db = getDb();
    
    if (!role || !['user', 'patrol', 'admin', 'superAdmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent demoting superAdmin
    if (req.userProfile.role !== 'superAdmin' && role === 'superAdmin') {
      return res.status(403).json({ error: 'Only superAdmin can assign superAdmin role' });
    }

    await db.collection('users').doc(req.params.id).update({
      role,
      updatedAt: new Date()
    });

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Ban/Unban user (admin only)
router.put('/:id/ban', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isBanned } = req.body;
    const db = getDb();
    
    if (typeof isBanned !== 'boolean') {
      return res.status(400).json({ error: 'isBanned must be a boolean' });
    }

    // Prevent banning superAdmin
    const userDoc = await db.collection('users').doc(req.params.id).get();
    if (userDoc.exists && userDoc.data().role === 'superAdmin') {
      return res.status(403).json({ error: 'Cannot ban superAdmin' });
    }

    await db.collection('users').doc(req.params.id).update({
      isBanned,
      updatedAt: new Date()
    });

    res.json({ 
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully` 
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    res.status(500).json({ error: 'Failed to update user ban status' });
  }
});

// Update user points (admin only)
router.put('/:id/points', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { points, reason } = req.body;
    const db = getDb();
    
    if (typeof points !== 'number') {
      return res.status(400).json({ error: 'Points must be a number' });
    }

    const admin = require('firebase-admin');
    await db.collection('users').doc(req.params.id).update({
      points: admin.firestore.FieldValue.increment(points),
      updatedAt: new Date()
    });

    // Log points change
    await db.collection('points_log').add({
      userId: req.params.id,
      points: points,
      reason: reason || 'Manual points adjustment',
      timestamp: new Date(),
      addedBy: req.user.uid
    });

    res.json({ message: `${points} points ${points > 0 ? 'added to' : 'removed from'} user` });
  } catch (error) {
    console.error('Error updating user points:', error);
    res.status(500).json({ error: 'Failed to update user points' });
  }
});

// Get user statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const userId = req.params.id;
    
    // Check if user can access this data
    if (userId !== req.user.uid && !['admin', 'superAdmin'].includes(req.userProfile.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user's reports
    const reportsSnapshot = await db.collection('reports')
      .where('userId', '==', userId)
      .get();
    
    const reports = reportsSnapshot.docs.map(doc => doc.data());
    
    const stats = {
      totalReports: reports.length,
      reportsByStatus: reports.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {}),
      reportsByCategory: reports.reduce((acc, report) => {
        acc[report.category] = (acc[report.category] || 0) + 1;
        return acc;
      }, {}),
      totalPoints: reports.filter(r => r.status === 'resolved').length * 10
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router;
