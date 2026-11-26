import mongoose from 'mongoose'
import { REASON_MAX_LENGTH, REASON_MIN_LENGTH } from '../../../shared/appealRules.js'

const appealSchema = new mongoose.Schema(
  {
    playerID: { type: String, required: true, trim: true, index: true },
    reason: { type: String, required: true, trim: true, minlength: REASON_MIN_LENGTH, maxlength: REASON_MAX_LENGTH },
    evidenceUrl: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
)

export default mongoose.model('Appeal', appealSchema)
