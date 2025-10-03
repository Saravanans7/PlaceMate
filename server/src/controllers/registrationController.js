import Registration from '../models/Registration.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { sendRegistrationOpenEmail } from '../services/emailService.js';

export async function createRegistration(req, res, next) {
  try {
    const { company: companyId } = req.body;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    const reg = await Registration.create({
      ...req.body,
      companyNameCached: company.name,
      createdBy: req.user._id,
    });
    // Email eligible students now
    const eligibleEmails = await findEligibleStudentEmails(reg);
    await sendRegistrationOpenEmail(reg, eligibleEmails);
    res.status(201).json({ success: true, data: reg, recipients: eligibleEmails.length });
  } catch (e) { next(e); }
}

export async function listRegistrations(req, res, next) {
  try {
    const { batch, status, range } = req.query;
    const q = {};
    if (batch) q.batch = Number(batch);
    if (status) q.status = status;
    if (range === 'next30') {
      const now = new Date();
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      q.driveDate = { $gte: now, $lte: end };
    }
    const regs = await Registration.find(q).sort({ driveDate: 1 }).populate('company');
    res.json({ success: true, data: regs });
  } catch (e) { next(e); }
}

export async function getRegistration(req, res, next) {
  try {
    const reg = await Registration.findById(req.params.id).populate('company');
    if (!reg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: reg });
  } catch (e) { next(e); }
}

export async function updateRegistration(req, res, next) {
  try {
    const reg = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: reg });
  } catch (e) { next(e); }
}

export async function deleteRegistration(req, res, next) {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (e) { next(e); }
}

async function findEligibleStudentEmails(reg) {
  const q = { role: 'student' };
  const e = reg.eligibility || {};
  if (Array.isArray(e.acceptedBatches) && e.acceptedBatches.length) {
    q.batch = { $in: e.acceptedBatches };
  } else if (reg.batch) q.batch = reg.batch;
  const students = await User.find(q);
  // Basic filtering on CGPA/arrears
  const filtered = students.filter((s) => {
    if (e.minCgpa != null && (s.cgpa ?? 0) < e.minCgpa) return false;
    if (e.maxArrears != null && (s.arrears ?? 0) > e.maxArrears) return false;
    if (e.maxHistoryArrears != null && (s.historyOfArrears ?? 0) > e.maxHistoryArrears) return false;
    if (e.minTenthPercent != null && (s.tenthPercent ?? 0) < e.minTenthPercent) return false;
    if (e.minTwelfthPercent != null && (s.twelfthPercent ?? 0) < e.minTwelfthPercent) return false;
    return true;
  });
  return filtered.map((s) => s.email).filter(Boolean);
}


