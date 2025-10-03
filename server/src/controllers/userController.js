import User from '../models/User.js';

export async function getMe(req, res) {
  res.json({ success: true, data: sanitize(req.user) });
}

export async function updateMe(req, res, next) {
  try {
    const up = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json({ success: true, data: sanitize(up) });
  } catch (e) { next(e); }
}

export async function uploadResume(req, res, next) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file' });
    const user = await User.findById(req.user._id);
    if (user.resumes.length >= 3) return res.status(400).json({ success: false, message: 'Max 3 resumes' });
    const url = file.location || `/uploads/${file.filename}`;
    const key = file.key || file.filename;
    user.resumes.push({ url, key, uploadedAt: new Date() });
    await user.save();
    res.status(201).json({ success: true, data: sanitize(user) });
  } catch (e) { next(e); }
}

export async function deleteResume(req, res, next) {
  try {
    const idx = Number(req.params.index);
    const user = await User.findById(req.user._id);
    if (idx < 0 || idx >= user.resumes.length) return res.status(400).json({ success: false, message: 'Invalid index' });
    user.resumes.splice(idx, 1);
    if (user.defaultResumeIndex >= user.resumes.length) user.defaultResumeIndex = 0;
    await user.save();
    res.json({ success: true, data: sanitize(user) });
  } catch (e) { next(e); }
}

export async function setDefaultResume(req, res, next) {
  try {
    const { index } = req.body;
    const user = await User.findById(req.user._id);
    if (index < 0 || index >= user.resumes.length) return res.status(400).json({ success: false, message: 'Invalid index' });
    user.defaultResumeIndex = index;
    await user.save();
    res.json({ success: true, data: sanitize(user) });
  } catch (e) { next(e); }
}

function sanitize(user) {
  const u = user.toObject();
  delete u.passwordHash;
  delete u.__v;
  return u;
}


