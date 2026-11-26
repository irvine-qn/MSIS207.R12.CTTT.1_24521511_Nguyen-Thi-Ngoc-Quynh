import mongoose from 'mongoose'

export const SWIPE_DIRECTIONS = ['left', 'right', 'up']

const swipeSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    direction: { type: String, enum: SWIPE_DIRECTIONS, required: true },
  },
  { timestamps: true, versionKey: false }
)

export const Swipe = mongoose.model('Swipe', swipeSchema)
