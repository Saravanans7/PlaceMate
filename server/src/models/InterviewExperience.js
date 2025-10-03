import mongoose from 'mongoose';
const { Schema } = mongoose;

const InterviewExperienceSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  companyNameCached: String,
  title: String,
  content: String,
  questions: [String],
  attachments: [String],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('InterviewExperience', InterviewExperienceSchema);


