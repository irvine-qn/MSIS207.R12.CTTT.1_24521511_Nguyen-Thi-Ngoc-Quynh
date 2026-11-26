import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18 },
    bio: { type: String, default: '' },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
)

export const Profile = mongoose.model('Profile', profileSchema)
