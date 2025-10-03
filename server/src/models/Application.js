import mongoose from 'mongoose';
const { Schema } = mongoose;

const AnswerSchema = new Schema(
  {
    key: String,
    value: String,
  },
  { _id: false }
);

const ApplicationSchema = new Schema({
  registration: { type: Schema.Types.ObjectId, ref: 'Registration', required: true, index: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeUrl: String,
  answers: { type: [AnswerSchema], default: [] },
  registeredAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['registered', 'withdrawn'], default: 'registered' },
});

ApplicationSchema.index({ registration: 1, student: 1 }, { unique: true });

export default mongoose.model('Application', ApplicationSchema);


