import mongoose from 'mongoose';
const { Schema } = mongoose;

const BlacklistSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  addedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  removedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  removedAt: Date,
  removedReason: String
});

// Index for efficient queries - compound index to ensure only one active blacklist per student
BlacklistSchema.index({ student: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.model('Blacklist', BlacklistSchema);
