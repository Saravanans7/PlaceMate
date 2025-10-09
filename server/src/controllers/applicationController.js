import Application from '../models/Application.js';
import Registration from '../models/Registration.js';

export async function applyToRegistration(req, res, next) {
  try {
    const regId = req.params.id;
    const { answers = [] } = req.body;
    const reg = await Registration.findById(regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    
    // Create application without resume
    const app = await Application.create({
      registration: reg._id,
      student: req.user._id,
      resumeUrl: null, // No resume required
      answers,
    });
    res.status(201).json({ success: true, data: app });
  } catch (e) { next(e); }
}

export async function listMyApplications(req, res, next) {
  try {
    const apps = await Application.find({ student: req.params.id, status: 'registered' }).populate('registration');
    res.json({ success: true, data: apps });
  } catch (e) { next(e); }
}

export async function listApplicants(req, res, next) {
  try {
    const apps = await Application.find({ registration: req.params.id, status: 'registered' }).populate('student');
    res.json({ success: true, data: apps });
  } catch (e) { next(e); }
}


