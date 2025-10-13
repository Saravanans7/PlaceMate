import Drive from '../models/Drive.js';
import Registration from '../models/Registration.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { sendDriveNotificationToAllStudents, sendDriveUpdateEmail, sendDriveDeletedEmail } from '../services/emailService.js';

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
    
    // Send email notification to all students
    try {
      await sendDriveNotificationToAllStudents(drive, reg);
    } catch (emailError) {
      console.error('Failed to send drive notification emails:', emailError);
      // Don't fail the drive creation if email fails
    }
    
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

export async function getDriveWithStudentProgress(req, res, next) {
  try {
    const { companyName } = req.params;
    const studentId = req.user._id;
    
    // Find the latest drive for this company
    const drives = await Drive.find({})
      .populate('company registration')
      .sort({ date: -1 });
    
    const drive = drives.find(d => 
      (d.company?.name || d.registration?.companyNameCached) === companyName
    );
    
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found for this company' });
    }
    
    // Check if student has applied for this drive
    const application = await Application.findOne({
      registration: drive.registration._id,
      student: studentId,
      status: 'registered'
    });
    
    if (!application) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not registered for this drive' 
      });
    }
    
    // Calculate student's progress through rounds
    const studentProgress = calculateStudentProgress(drive, studentId);
    
    res.json({ 
      success: true, 
      data: {
        ...drive.toObject(),
        studentProgress,
        isRegistered: true,
        registrationDate: application.registeredAt
      }
    });
  } catch (e) { next(e); }
}

function calculateStudentProgress(drive, studentId) {
  const progress = {
    currentRound: 0,
    status: 'registered',
    rounds: [],
    isSelected: false,
    isEliminated: false
  };
  
  // Check if student is in final selected list
  if (drive.finalSelected && drive.finalSelected.some(id => id.toString() === studentId.toString())) {
    progress.status = 'selected';
    progress.isSelected = true;
    progress.currentRound = drive.rounds.length;
  } else {
    // Check each round to see student's progress
    for (let i = 0; i < drive.rounds.length; i++) {
      const round = drive.rounds[i];
      const roundProgress = {
        roundIndex: i,
        name: round.name,
        description: round.description,
        status: 'pending', // pending, shortlisted, eliminated, completed
        result: null,
        notes: null
      };
      
      // Check if round has results
      if (round.results && round.results.length > 0) {
        const studentResult = round.results.find(r => 
          r.student && r.student.toString() === studentId.toString()
        );
        
        if (studentResult) {
          roundProgress.status = studentResult.status || 'completed';
          roundProgress.result = studentResult.status;
          roundProgress.notes = studentResult.notes;
          
          // If student was eliminated in this round
          if (studentResult.status === 'eliminated' || studentResult.status === 'rejected') {
            progress.status = 'eliminated';
            progress.isEliminated = true;
            progress.currentRound = i;
            progress.rounds.push(roundProgress);
            break;
          } else if (studentResult.status === 'selected' || studentResult.status === 'passed') {
            progress.currentRound = i + 1;
            roundProgress.status = 'completed';
          }
        } else {
          // No result yet, check if in shortlist
          if (round.shortlisted && round.shortlisted.some(id => id.toString() === studentId.toString())) {
            roundProgress.status = 'shortlisted';
            progress.currentRound = i + 1;
          }
        }
      } else {
        // No results yet, check if in shortlist
        if (round.shortlisted && round.shortlisted.some(id => id.toString() === studentId.toString())) {
          roundProgress.status = 'shortlisted';
          progress.currentRound = i + 1;
        } else if (i === drive.currentRoundIndex) {
          roundProgress.status = 'current';
          progress.currentRound = i;
        }
      }
      
      progress.rounds.push(roundProgress);
    }
  }
  
  // Determine overall status
  if (!progress.isSelected && !progress.isEliminated) {
    if (progress.currentRound === drive.rounds.length) {
      progress.status = 'awaiting_final_results';
    } else if (progress.currentRound < drive.currentRoundIndex) {
      progress.status = 'eliminated';
      progress.isEliminated = true;
    } else {
      progress.status = 'in_progress';
    }
  }
  
  return progress;
}

export async function getOrCreateDriveByRegistration(req, res, next) {
  try {
    const reg = await Registration.findById(req.params.id).populate('company');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });

    let drive = await Drive.findOne({ registration: reg._id });
    if (!drive) {
      drive = await createDriveFromRegistration(reg);
    }
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
    const { results, nextRoundIndex } = req.body;
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Not found' });
    drive.rounds[roundIndex].results = results;
    
    // Update current round index if provided
    if (nextRoundIndex !== undefined) {
      drive.currentRoundIndex = nextRoundIndex;
    }
    
    await drive.save();
    res.json({ success: true, data: drive });
  } catch (e) { next(e); }
}

export async function finalizeDrive(req, res, next) {
  try {
    const { finalSelected, close } = req.body;
    const drive = await Drive.findById(req.params.id).populate('company registration');
    if (!drive) return res.status(404).json({ success: false, message: 'Not found' });
    drive.finalSelected = finalSelected || [];
    if (close) {
      drive.isClosed = true;
      // Update registration status to completed
      if (drive.registration) {
        await Registration.updateOne({ _id: drive.registration._id || drive.registration }, { $set: { status: 'completed' } });
      }
      
      // Mark selected students as placed
      if (drive.finalSelected && drive.finalSelected.length > 0) {
        const companyId = drive.company._id || drive.company;
        const company = await Company.findById(companyId);
        const companyName = company?.name || drive.registration?.companyNameCached || 'Unknown Company';
        
        await User.updateMany(
          { _id: { $in: drive.finalSelected } },
          { 
            $set: { 
              isPlaced: true,
              placedAt: new Date(),
              placedCompany: companyId,
              placedCompanyName: companyName
            }
          }
        );
      }
      
      // Update company placement stats
      if (drive.company) {
        const placedCount = Array.isArray(drive.finalSelected) ? drive.finalSelected.length : 0;
        const companyId = drive.company._id || drive.company;
        const company = await Company.findById(companyId);
        if (company) {
          const nextTotalDrives = (company.totalDrives || 0) + 1;
          const nextTotalPlaced = (company.totalPlaced || 0) + placedCount;
          const nextAvg = nextTotalDrives > 0 ? nextTotalPlaced / nextTotalDrives : 0;
          company.totalDrives = nextTotalDrives;
          company.totalPlaced = nextTotalPlaced;
          company.avgPlacedPerDrive = Number(nextAvg.toFixed(2));
          company.lastDriveDate = new Date();
          await company.save();
        }
      }
    }
    await drive.save();
    res.json({ success: true, data: drive });
  } catch (e) { next(e); }
}

// Helper to create a drive document from a populated registration
export async function createDriveFromRegistration(reg, sendEmailNotification = true) {
  const drive = await Drive.create({
    registration: reg._id,
    company: reg.company?._id,
    date: reg.driveDate,
    rounds: (reg.company?.roundsTemplate || []).map((r) => ({ name: r.name, description: r.description, shortlisted: [], results: [] })),
  });
  
  // Send email notification if requested
  if (sendEmailNotification) {
    try {
      await sendDriveNotificationToAllStudents(drive, reg);
    } catch (emailError) {
      console.error('Failed to send drive notification emails:', emailError);
      // Don't fail the drive creation if email fails
    }
  }
  
  return drive;
}

// Backfill today's drives for registrations that don't yet have a drive
export async function updateDrive(req, res, next) {
  try {
    const { date, announcements, rounds } = req.body;
    const drive = await Drive.findById(req.params.id);

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    // Only allow updating if drive is not closed
    if (drive.isClosed) {
      return res.status(400).json({ success: false, message: 'Cannot update a closed drive' });
    }

    // Update allowed fields
    if (date !== undefined) {
      drive.date = date;
    }

    if (announcements !== undefined) {
      drive.announcements = announcements;
    }

    if (rounds !== undefined) {
      // Only allow updating rounds if no rounds have started yet (currentRoundIndex is 0)
      if (drive.currentRoundIndex === 0) {
        drive.rounds = rounds;
      } else {
        return res.status(400).json({ success: false, message: 'Cannot update rounds after drive has started' });
      }
    }

    await drive.save();
    const updatedDrive = await Drive.findById(req.params.id).populate('company registration');

    // Send notification email to registered students
    try {
      await sendDriveUpdateEmail(updatedDrive, updatedDrive.registration);
    } catch (emailError) {
      console.error('Failed to send drive update emails:', emailError);
      // Don't fail the update if email fails
    }

    res.json({ success: true, data: updatedDrive });
  } catch (e) { next(e); }
}

export async function deleteDrive(req, res, next) {
  try {
    const drive = await Drive.findById(req.params.id).populate('registration');

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    // Only allow deleting if drive hasn't started (no results in any round)
    const hasResults = drive.rounds.some(round => round.results && round.results.length > 0);
    if (hasResults) {
      return res.status(400).json({ success: false, message: 'Cannot delete drive that has started (has round results)' });
    }

    // Send notification email to registered students before deletion
    try {
      await sendDriveDeletedEmail(drive, drive.registration);
    } catch (emailError) {
      console.error('Failed to send drive deletion emails:', emailError);
      // Continue with deletion even if email fails
    }

    // Delete associated applications first
    const Application = (await import('../models/Application.js')).default;
    await Application.deleteMany({ registration: drive.registration });

    // Delete the registration
    if (drive.registration) {
      await Registration.findByIdAndDelete(drive.registration);
    }

    // Delete the drive
    await Drive.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Drive and associated registration deleted successfully' });
  } catch (e) { next(e); }
}

export async function backfillTodayDrives(req, res, next) {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const regs = await Registration.find({
      driveDate: { $gte: start, $lte: end },
      status: 'open'
    }).populate('company');
    const created = [];
    for (const reg of regs) {
      const exists = await Drive.findOne({ registration: reg._id });
      if (!exists) {
        // Don't send emails for backfilled drives as they're not new announcements
        const d = await createDriveFromRegistration(reg, false);
        created.push(d._id);
      }
    }
    res.json({ success: true, createdCount: created.length, createdIds: created });
  } catch (e) { next(e); }
}


