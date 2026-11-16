import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    forum: { type: String, required: true, index: true },
    author: { type: String, required: true, maxlength: 50 },
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true, versionKey: false }
)

export const Message = mongoose.model('Message', messageSchema)
