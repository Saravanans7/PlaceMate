import Application from '../models/Application.js';
import Registration from '../models/Registration.js';

export async function applyToRegistration(req, res, next) {
  try {
    const regId = req.params.id;
    const { resumeIndex = 0, answers = [] } = req.body;
    const reg = await Registration.findById(regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    const resume = req.user.resumes?.[resumeIndex];
    const app = await Application.create({
      registration: reg._id,
      student: req.user._id,
      resumeUrl: resume?.url,
      answers,
    });
    res.status(201).json({ success: true, data: app });
  } catch (e) { next(e); }
}

export async function listMyApplications(req, res, next) {
  try {
    const apps = await Application.find({ student: req.params.id }).populate('registration');
    res.json({ success: true, data: apps });
  } catch (e) { next(e); }
}

export async function listApplicants(req, res, next) {
  try {
    const apps = await Application.find({ registration: req.params.id }).populate('student');
    res.json({ success: true, data: apps });
  } catch (e) { next(e); }
}


