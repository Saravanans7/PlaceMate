import cron from 'node-cron';
import Registration from '../models/Registration.js';
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
}


