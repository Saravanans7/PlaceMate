import mongoose from 'mongoose';
const { Schema } = mongoose;

const EligibilitySchema = new Schema(
  {
    minCgpa: Number,
    maxArrears: Number,
    maxHistoryArrears: Number,
    minTenthPercent: Number,
    minTwelfthPercent: Number,
    acceptedBatches: [Number],
  },
  { _id: false }
);

const CustomFieldSchema = new Schema(
  {
    key: String,
    label: String,
    type: String,
    required: Boolean,
  },
  { _id: false }
);

const RegistrationSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  companyNameCached: { type: String },
  batch: { type: Number, required: true },
  driveDate: { type: Date, required: true },
  eligibility: { type: EligibilitySchema },
  customFields: { type: [CustomFieldSchema], default: [] },
  status: { type: String, enum: ['open', 'closed', 'completed'], default: 'open' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  mailSent: { type: Boolean, default: false },
});

export default mongoose.model('Registration', RegistrationSchema);


