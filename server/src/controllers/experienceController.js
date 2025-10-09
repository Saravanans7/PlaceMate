import InterviewExperience from '../models/InterviewExperience.js';
import Company from '../models/Company.js';
import User from '../models/User.js';

export async function createExperience(req, res, next) {
  try {
    const { companyName, experience } = req.body;
    
    // Find company by name
    const company = await Company.findOne({ name: companyName });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    // Check if user is placed at this company
    const user = await User.findById(req.user._id);
    if (!user.isPlaced || user.placedCompany.toString() !== company._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only write interview experiences for companies where you have been placed' 
      });
    }
    
    const exp = await InterviewExperience.create({ 
      student: req.user._id,
      company: company._id,
      companyNameCached: companyName,
      content: experience,
      status: 'pending'
    });
    res.status(201).json({ success: true, data: exp });
  } catch (e) { next(e); }
}

export async function listExperiences(req, res, next) {
  try {
    const { status, companyName } = req.query;
    const q = {};
    
    if (status) q.status = status;
    if (companyName) {
      // Support both exact match and case-insensitive search
      q.companyNameCached = { $regex: companyName, $options: 'i' };
    }
    
    // If no status specified and user is student, only show approved experiences
    if (!status && req.user?.role === 'student') {
      q.status = 'approved';
    }
    
    const exps = await InterviewExperience.find(q).populate('student').sort({ createdAt: -1 });
    res.json({ success: true, data: exps });
  } catch (e) { next(e); }
}

export async function approveExperience(req, res, next) {
  try {
    const exp = await InterviewExperience.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    );
    if (!exp) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: exp });
  } catch (e) { next(e); }
}

export async function rejectExperience(req, res, next) {
  try {
    const exp = await InterviewExperience.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    );
    if (!exp) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: exp });
  } catch (e) { next(e); }
}

export async function deleteExperience(req, res, next) {
  try {
    const exp = await InterviewExperience.findByIdAndDelete(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (e) { next(e); }
}


