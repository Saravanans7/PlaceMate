import mongoose from 'mongoose';
const { Schema } = mongoose;

const RoundTemplateSchema = new Schema(
  {
    name: String,
    description: String,
  },
  { _id: false }
);

const CompanySchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  role: { type: String },
  location: { type: String },
  salaryLPA: { type: Number },
  description: { type: String },
  lastYearPlaced: { type: Number, default: 0 },
  lastDriveDate: { type: Date },
  // Placement stats
  totalPlaced: { type: Number, default: 0 },
  totalDrives: { type: Number, default: 0 },
  avgPlacedPerDrive: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  roundsTemplate: { type: [RoundTemplateSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Company', CompanySchema);


