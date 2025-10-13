import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateResumesToLinks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placemate');

    console.log('Starting resume migration...');

    // Find all users with resumes array
    const usersWithResumes = await User.find({
      resumes: { $exists: true, $ne: [] }
    });

    console.log(`Found ${usersWithResumes.length} users with resumes`);

    for (const user of usersWithResumes) {
      // Take the first resume's URL as the resumeLink
      if (user.resumes && user.resumes.length > 0) {
        user.resumeLink = user.resumes[0].url;
        // Remove old resume fields
        user.resumes = undefined;
        user.defaultResumeIndex = undefined;
        await user.save();
        console.log(`Migrated user ${user.email}: ${user.resumeLink}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateResumesToLinks();
