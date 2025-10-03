import mongoose from 'mongoose';
const { Schema } = mongoose;

const ResultSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User' },
    status: String,
    notes: String,
  },
  { _id: false }
);

const RoundSchema = new Schema(
  {
    name: String,
    description: String,
    shortlisted: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    results: { type: [ResultSchema], default: [] },
  },
  { _id: false }
);

const AnnouncementSchema = new Schema(
  {
    text: String,
    postedBy: Schema.Types.ObjectId,
    postedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DriveSchema = new Schema({
  registration: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  date: Date,
  announcements: { type: [AnnouncementSchema], default: [] },
  rounds: { type: [RoundSchema], default: [] },
  finalSelected: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isClosed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Drive', DriveSchema);


