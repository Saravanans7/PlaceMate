import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';
import Registration from '../src/models/Registration.js';

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing');
  await mongoose.connect(uri, { dbName: 'placemate' });

  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Registration.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    username: 'admin',
    passwordHash: await bcrypt.hash('admin123', 10),
    role: 'staff',
  });

  // Default password for seeded students
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  const students = await User.insertMany([
    { name: 'Alice', email: 'alice@example.com', username: 'student1', passwordHash: studentPasswordHash, role: 'student', batch: 2025, cgpa: 8.1, arrears: 0, tenthPercent: 92, twelfthPercent: 90 },
    { name: 'Bob', email: 'bob@example.com', username: 'student2', passwordHash: studentPasswordHash, role: 'student', batch: 2025, cgpa: 7.5, arrears: 1, tenthPercent: 88, twelfthPercent: 85 },
    { name: 'Carol', email: 'carol@example.com', username: 'student3', passwordHash: studentPasswordHash, role: 'student', batch: 2024, cgpa: 8.7, arrears: 0, tenthPercent: 95, twelfthPercent: 93 },
    { name: 'Dave', email: 'dave@example.com', username: 'student4', passwordHash: studentPasswordHash, role: 'student', batch: 2024, cgpa: 6.9, arrears: 2, tenthPercent: 75, twelfthPercent: 78 },
    { name: 'Eve', email: 'eve@example.com', username: 'student5', passwordHash: studentPasswordHash, role: 'student', batch: 2026, cgpa: 9.1, arrears: 0, tenthPercent: 96, twelfthPercent: 94 },
  ]);

  const companies = await Company.insertMany([
    { name: 'TechNova', role: 'SDE', location: 'Bangalore', salaryLPA: 12, description: 'Product company', roundsTemplate: [{ name: 'Aptitude' }, { name: 'Technical' }, { name: 'HR' }], createdBy: admin._id },
    { name: 'DataWorks', role: 'Data Analyst', location: 'Chennai', salaryLPA: 8, description: 'Analytics firm', roundsTemplate: [{ name: 'Online Test' }, { name: 'Interview' }], createdBy: admin._id },
    { name: 'CloudNine', role: 'DevOps', location: 'Hyderabad', salaryLPA: 10, description: 'Cloud services', roundsTemplate: [{ name: 'Coding' }, { name: 'Ops Round' }], createdBy: admin._id },
  ]);

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const reg = await Registration.create({
    company: companies[0]._id,
    companyNameCached: companies[0].name,
    batch: 2025,
    driveDate: tomorrow,
    eligibility: { minCgpa: 7.0, maxArrears: 1, acceptedBatches: [2025] },
    createdBy: admin._id,
  });

  console.log('Seeded:', { admin: admin.email, students: students.length, companies: companies.length, registration: reg._id.toString() });
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


