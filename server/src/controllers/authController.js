import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { signJwt, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';

export async function register(req, res, next) {
  try {
    const { name, email, username, password, role = 'student', batch } = req.body;
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await User.create({ name, email: email.toLowerCase(), username, passwordHash, role, batch });
    res.status(201).json({ success: true, user: sanitize(user) });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { username: identifier }] });
    if (!user || !user.passwordHash) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = signJwt(user._id.toString());
    setAuthCookie(res, token);
    res.json({ success: true, user: sanitize(user) });
  } catch (e) { next(e); }
}

export async function googleCallbackIssueJwt(req, res) {
  const user = req.user;
  const token = signJwt(user._id.toString());
  setAuthCookie(res, token);
  const redirect = `${process.env.FRONTEND_URL}/dashboard`;
  res.redirect(302, redirect);
}

export async function googleTokenLogin(req, res, next) {
  // Optional: accept idToken from frontend and verify; here we require passport flow
  return res.status(400).json({ success: false, message: 'Use Google OAuth redirect flow' });
}

export async function me(req, res) {
  res.json({ success: true, user: sanitize(req.user) });
}

export async function logout(req, res) {
  clearAuthCookie(res);
  res.json({ success: true });
}

function sanitize(user) {
  const u = user.toObject();
  delete u.passwordHash;
  delete u.__v;
  return u;
}


