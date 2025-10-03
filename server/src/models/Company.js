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
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  roundsTemplate: { type: [RoundTemplateSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Company', CompanySchema);


