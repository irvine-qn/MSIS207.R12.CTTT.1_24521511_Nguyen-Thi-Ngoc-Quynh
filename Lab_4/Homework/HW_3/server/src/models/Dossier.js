import mongoose from 'mongoose'

const violationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    matchDate: { type: Date, required: true },
    severity: { type: Number, required: true, min: 1, max: 5 },
    penaltyMatches: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const dossierSchema = new mongoose.Schema({
  playerID: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  team: { type: String, required: true, trim: true },
  violations: { type: [violationSchema], default: [] },
  appealDeadline: { type: Number, required: true },
})

export default mongoose.model('Dossier', dossierSchema)
