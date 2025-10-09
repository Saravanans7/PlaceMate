import Blacklist from '../models/Blacklist.js';
import User from '../models/User.js';

export async function addToBlacklist(req, res, next) {
  try {
    const { studentId, reason } = req.body;
    
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
    
    await blacklistEntry.populate('student addedBy', 'name email');
    
    res.status(201).json({ 
      success: true, 
      data: blacklistEntry,
      message: 'Student has been added to blacklist'
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFromBlacklist(req, res, next) {
  try {
    const { blacklistId, reason } = req.body;
    
    const blacklistEntry = await Blacklist.findById(blacklistId);
    if (!blacklistEntry || !blacklistEntry.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blacklist entry not found' 
      });
    }
    
    blacklistEntry.isActive = false;
    blacklistEntry.removedBy = req.user._id;
    blacklistEntry.removedAt = new Date();
    blacklistEntry.removedReason = reason || 'No reason provided';
    
    await blacklistEntry.save();
    await blacklistEntry.populate('student addedBy removedBy', 'name email');
    
    res.json({ 
      success: true, 
      data: blacklistEntry,
      message: 'Student has been removed from blacklist'
    });
  } catch (error) {
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
    const { query } = req.query;
    
    if (!query || query.length < 2) {
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
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { rollNumber: { $regex: query, $options: 'i' } }
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
