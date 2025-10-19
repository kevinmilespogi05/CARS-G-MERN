const express = require('express');
const { getDb } = require('../config/firebase');
const { authenticateToken, requireAdmin, requirePatrol } = require('../middleware/auth');

const router = express.Router();

// Get all reports (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = db.collection('reports').orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ reports, total: reports.length });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get user's own reports
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('reports')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ error: 'Failed to fetch user reports' });
  }
});

// Get assigned reports (patrol only)
router.get('/assigned', authenticateToken, requirePatrol, async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('reports')
      .where('patrolUserId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching assigned reports:', error);
    res.status(500).json({ error: 'Failed to fetch assigned reports' });
  }
});

// Get single report
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const reportDoc = await db.collection('reports').doc(req.params.id).get();
    
    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = reportDoc.data();
    
    // Check if user can access this report
    const isOwner = reportData.userId === req.user.uid;
    const isAssignedPatrol = reportData.patrolUserId === req.user.uid;
    const isAdmin = ['admin', 'superAdmin'].includes(req.userProfile.role);
    
    if (!isOwner && !isAssignedPatrol && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: reportDoc.id,
      ...reportData
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create new report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, isAnonymous, location, imageUrls } = req.body;
    
    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();
    const caseNumber = `CARS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const reportData = {
      caseNumber,
      title,
      description,
      category,
      isAnonymous: isAnonymous || false,
      location,
      imageUrls: imageUrls || [],
      status: 'verifying',
      priorityLevel: 1,
      userId: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('reports').add(reportData);
    
    res.status(201).json({
      id: docRef.id,
      ...reportData,
      message: 'Report created successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Update report status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const reportDoc = await db.collection('reports').doc(req.params.id).get();
    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = reportDoc.data();
    
    // Check permissions
    const isOwner = reportData.userId === req.user.uid;
    const isAssignedPatrol = reportData.patrolUserId === req.user.uid;
    const isAdmin = ['admin', 'superAdmin'].includes(req.userProfile.role);
    
    if (!isOwner && !isAssignedPatrol && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.collection('reports').doc(req.params.id).update({
      status,
      updatedAt: new Date()
    });

    // Award points if report is resolved
    if (status === 'resolved') {
    const admin = require('firebase-admin');
    await db.collection('users').doc(reportData.userId).update({
      points: admin.firestore.FieldValue.increment(10)
    });
    }

    res.json({ message: 'Report status updated successfully' });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

// Assign report to patrol
router.put('/:id/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { patrolUserId } = req.body;
    const db = getDb();
    
    if (!patrolUserId) {
      return res.status(400).json({ error: 'Patrol user ID is required' });
    }

    // Verify patrol user exists
    const patrolDoc = await db.collection('users').doc(patrolUserId).get();
    if (!patrolDoc.exists || patrolDoc.data().role !== 'patrol') {
      return res.status(400).json({ error: 'Invalid patrol user' });
    }

    await db.collection('reports').doc(req.params.id).update({
      patrolUserId,
      updatedAt: new Date()
    });

    res.json({ message: 'Report assigned successfully' });
  } catch (error) {
    console.error('Error assigning report:', error);
    res.status(500).json({ error: 'Failed to assign report' });
  }
});

// Update report priority
router.put('/:id/priority', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { priorityLevel } = req.body;
    const db = getDb();
    
    if (!priorityLevel || priorityLevel < 1 || priorityLevel > 5) {
      return res.status(400).json({ error: 'Priority level must be between 1 and 5' });
    }

    await db.collection('reports').doc(req.params.id).update({
      priorityLevel,
      updatedAt: new Date()
    });

    res.json({ message: 'Report priority updated successfully' });
  } catch (error) {
    console.error('Error updating report priority:', error);
    res.status(500).json({ error: 'Failed to update report priority' });
  }
});

module.exports = router;
