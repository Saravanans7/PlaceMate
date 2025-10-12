import Blacklist from '../models/Blacklist.js';
import User from '../models/User.js';

export async function addToBlacklist(req, res, next) {
  try {
    const { studentId, reason } = req.body;
    
    // Validate input
    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID is required' 
      });
    }
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reason for blacklisting is required' 
      });
    }
    
    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only students can be blacklisted' 
      });
    }
    
    // Check if already blacklisted
    const existingBlacklist = await Blacklist.findOne({ 
      student: studentId, 
      isActive: true 
    });
    
    if (existingBlacklist) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student is already blacklisted' 
      });
    }
    
    const blacklistEntry = await Blacklist.create({
      student: studentId,
      reason: reason.trim(),
      addedBy: req.user._id
    });

    // Populate all related data
    await blacklistEntry.populate([
      { path: 'student', select: 'name email rollNumber' },
      { path: 'addedBy', select: 'name email' }
    ]);
    
    res.status(201).json({ 
      success: true, 
      data: blacklistEntry,
      message: 'Student has been added to blacklist'
    });
  } catch (error) {
    console.error('Error adding student to blacklist:', error);
    next(error);
  }
}

export async function removeFromBlacklist(req, res, next) {
  try {
    const { blacklistId, reason } = req.body;
    
    // Validate input
    if (!blacklistId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Blacklist ID is required' 
      });
    }
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reason for removal is required' 
      });
    }
    
    const blacklistEntry = await Blacklist.findById(blacklistId);
    if (!blacklistEntry || !blacklistEntry.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blacklist entry not found or already removed' 
      });
    }
    
    // Populate all related data before updating
    await blacklistEntry.populate([
      { path: 'student', select: 'name email rollNumber' },
      { path: 'addedBy', select: 'name email' }
    ]);

    blacklistEntry.isActive = false;
    blacklistEntry.removedBy = req.user._id;
    blacklistEntry.removedAt = new Date();
    blacklistEntry.removedReason = reason.trim();

    await blacklistEntry.save(); // Save the updated document
    await blacklistEntry.populate('removedBy', 'name email'); // Populate after save
    
    res.json({ 
      success: true, 
      data: blacklistEntry,
      message: 'Student has been removed from blacklist' 
    });
  } catch (error) {
    console.error('Error removing student from blacklist:', error);
    next(error);
  }
}

export async function getBlacklistedStudents(req, res, next) {
  try {
    const { page = 1, limit = 20, active = true } = req.query;
    
    const query = active === 'true' ? { isActive: true } : {};
    
    const blacklistedStudents = await Blacklist.find(query)
      .populate('student', 'name email rollNumber')
      .populate('addedBy', 'name email')
      .populate('removedBy', 'name email')
      .sort({ addedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Blacklist.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: blacklistedStudents,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    next(error);
  }
}

export async function searchStudents(req, res, next) {
  try {
    // Support both ?q= and ?query=
    const q = (req.query.q || req.query.query || '').toString().trim();
    
    if (!q || q.length < 2) {
      return res.json({ 
        success: true, 
        data: [],
        message: 'Please enter at least 2 characters to search'
      });
    }
    
    // Search students by name, email, or roll number
    const students = await User.find({
      role: 'student',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { rollNumber: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name email rollNumber')
    .limit(10);
    
    // Check which students are already blacklisted
    const studentIds = students.map(s => s._id);
    const blacklistedIds = await Blacklist.find({
      student: { $in: studentIds },
      isActive: true
    }).distinct('student');
    
    const studentsWithStatus = students.map(student => ({
      ...student.toObject(),
      isBlacklisted: blacklistedIds.some(id => id.toString() === student._id.toString())
    }));
    
    res.json({ 
      success: true, 
      data: studentsWithStatus
    });
  } catch (error) {
    next(error);
  }
}
