import cron from 'node-cron';
import Drive from '../models/Drive.js';
import { createDriveFromRegistration } from '../controllers/driveController.js';

export function scheduleCronJobs() {
  // Every day at 00:05, auto-create today's drives if missing (but respect manual deletions)
  cron.schedule('5 0 * * *', async () => {
    try {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      const Registration = (await import('../models/Registration.js')).default;
      const regs = await Registration.find({
        driveDate: { $gte: start, $lte: end },
        status: 'open'
      }).populate('company');
      for (const reg of regs) {
        const exists = await Drive.findOne({ registration: reg._id });
        if (!exists) await createDriveFromRegistration(reg);
      }
    } catch (err) {
      console.error('Cron backfill error', err);
    }
  });
}


