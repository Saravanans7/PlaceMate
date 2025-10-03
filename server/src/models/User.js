import mongoose from 'mongoose';

const { Schema } = mongoose;

const ResumeSchema = new Schema(
  {
    url: String,
    key: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['student', 'staff'], required: true },
  batch: { type: Number },
  cgpa: { type: Number, min: 0, max: 10 },
  arrears: { type: Number, default: 0 },
  historyOfArrears: { type: Number, default: 0 },
  tenthPercent: { type: Number, min: 0, max: 100 },
  twelfthPercent: { type: Number, min: 0, max: 100 },
  rollNumber: { type: String },
  phone: { type: String },
  nativePlace: { type: String },
  resumes: { type: [ResumeSchema], default: [], validate: [arr => arr.length <= 3, 'Max 3 resumes'] },
  defaultResumeIndex: { type: Number, default: 0 },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);


