import express from 'express';
import passport from 'passport';
import { authRateLimiter } from '../middleware/rateLimit.js';
import { authMiddleware } from '../middleware/auth.js';
import { register, login, googleCallbackIssueJwt, googleTokenLogin, me, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', authRateLimiter, login);
router.post('/google', googleTokenLogin);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallbackIssueJwt);

router.get('/me', authMiddleware, me);
router.post('/logout', logout);

export default router;


