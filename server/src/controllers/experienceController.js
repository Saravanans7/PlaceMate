import InterviewExperience from '../models/InterviewExperience.js';

export async function createExperience(req, res, next) {
  try {
    const exp = await InterviewExperience.create({ ...req.body, student: req.user._id });
    res.status(201).json({ success: true, data: exp });
  } catch (e) { next(e); }
}

export async function listExperiences(req, res, next) {
  try {
    const { status } = req.query;
    const q = {};
    if (status) q.status = status;
    const exps = await InterviewExperience.find(q).sort({ createdAt: -1 });
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

export async function deleteExperience(req, res, next) {
  try {
    const exp = await InterviewExperience.findByIdAndDelete(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (e) { next(e); }
}


