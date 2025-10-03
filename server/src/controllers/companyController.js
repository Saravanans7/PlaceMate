import Company from '../models/Company.js';

export async function listCompanies(req, res, next) {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const q = search
      ? { name: { $regex: new RegExp(search, 'i') } }
      : {};
    const docs = await Company.find(q)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const count = await Company.countDocuments(q);
    res.json({ success: true, data: docs, total: count });
  } catch (e) { next(e); }
}

export async function getCompany(req, res, next) {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: company });
  } catch (e) { next(e); }
}

export async function createCompany(req, res, next) {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    const company = await Company.create(payload);
    res.status(201).json({ success: true, data: company });
  } catch (e) { next(e); }
}

export async function updateCompany(req, res, next) {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: company });
  } catch (e) { next(e); }
}

export async function deleteCompany(req, res, next) {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (e) { next(e); }
}


