import cron from 'node-cron';
import Registration from '../models/Registration.js';
import Drive from '../models/Drive.js';
import { createDriveFromRegistration } from '../controllers/driveController.js';
import { sendDriveReminderEmail } from '../services/emailService.js';

export function scheduleCronJobs() {
  // Run daily at 02:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const start = new Date(tomorrow);
      start.setHours(0, 0, 0, 0);
      const end = new Date(tomorrow);
      end.setHours(23, 59, 59, 999);

      const regs = await Registration.find({
        driveDate: { $gte: start, $lte: end },
        status: 'open',
      }).populate('company');

      for (const reg of regs) {
        await sendDriveReminderEmail(reg);
      }
    } catch (err) {
      console.error('Cron job error', err);
    }
  });

  // Every day at 00:05, auto-create today's drives if missing
  cron.schedule('5 0 * * *', async () => {
    try {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      const regs = await Registration.find({ driveDate: { $gte: start, $lte: end }, status: 'open' }).populate('company');
      for (const reg of regs) {
        const exists = await Drive.findOne({ registration: reg._id });
        if (!exists) await createDriveFromRegistration(reg);
      }
    } catch (err) {
      console.error('Cron backfill error', err);
    }
  });
}


