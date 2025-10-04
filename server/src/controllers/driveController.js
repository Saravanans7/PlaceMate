import Drive from '../models/Drive.js';
import Registration from '../models/Registration.js';

export async function listDrives(req, res, next) {
  try {
    const { date } = req.query;
    const q = {};
    if (date === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      q.date = { $gte: start, $lte: end };
    }
    const drives = await Drive.find(q).populate('company registration');
    res.json({ success: true, data: drives });
  } catch (e) { next(e); }
}

export async function createDrive(req, res, next) {
  try {
    const { registration: registrationId } = req.body;
    const reg = await Registration.findById(registrationId).populate('company');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    const drive = await createDriveFromRegistration(reg);
    res.status(201).json({ success: true, data: drive });
  } catch (e) { next(e); }
}

export async function getDrive(req, res, next) {
  try {
    const drive = await Drive.findById(req.params.id).populate('company registration');
    if (!drive) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: drive });
  } catch (e) { next(e); }
}

export async function addAnnouncement(req, res, next) {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Not found' });
    drive.announcements.push({ text: req.body.text, postedBy: req.user._id, postedAt: new Date() });
    await drive.save();
    res.json({ success: true, data: drive });
  } catch (e) { next(e); }
}

export async function shortlistRound(req, res, next) {
  try {
    const { roundIndex } = req.params;
    const { studentIds } = req.body;
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Not found' });
    drive.rounds[roundIndex].shortlisted = studentIds;
    await drive.save();
    res.json({ success: true, data: drive });
  } catch (e) { next(e); }
}

export async function roundResults(req, res, next) {
  try {
    const { roundIndex } = req.params;
    const { results } = req.body;
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Not found' });
    drive.rounds[roundIndex].results = results;
    await drive.save();
    res.json({ success: true, data: drive });
  } catch (e) { next(e); }
}

export async function finalizeDrive(req, res, next) {
  try {
    const { finalSelected, close } = req.body;
    const drive = await Drive.findById(req.params.id).populate('company');
    if (!drive) return res.status(404).json({ success: false, message: 'Not found' });
    drive.finalSelected = finalSelected || [];
    if (close) drive.isClosed = true;
    await drive.save();
    res.json({ success: true, data: drive });
  } catch (e) { next(e); }
}

// Helper to create a drive document from a populated registration
export async function createDriveFromRegistration(reg) {
  return await Drive.create({
    registration: reg._id,
    company: reg.company?._id,
    date: reg.driveDate,
    rounds: (reg.company?.roundsTemplate || []).map((r) => ({ name: r.name, description: r.description, shortlisted: [], results: [] })),
  });
}

// Backfill today's drives for registrations that don't yet have a drive
export async function backfillTodayDrives(req, res, next) {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const regs = await Registration.find({ driveDate: { $gte: start, $lte: end }, status: 'open' }).populate('company');
    const created = [];
    for (const reg of regs) {
      const exists = await Drive.findOne({ registration: reg._id });
      if (!exists) {
        const d = await createDriveFromRegistration(reg);
        created.push(d._id);
      }
    }
    res.json({ success: true, createdCount: created.length, createdIds: created });
  } catch (e) { next(e); }
}


