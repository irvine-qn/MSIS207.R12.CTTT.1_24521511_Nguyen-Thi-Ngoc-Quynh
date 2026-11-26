import { Router } from 'express'
import mongoose from 'mongoose'
import { Swipe, SWIPE_DIRECTIONS } from '../models/Swipe.js'

const router = Router()

function validateSwipe(body) {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a JSON object'
  }
  const { profileId, direction } = body
  if (typeof profileId !== 'string' || !mongoose.isValidObjectId(profileId)) {
    return 'profileId is invalid'
  }
  if (!SWIPE_DIRECTIONS.includes(direction)) {
    return `direction must be one of ${SWIPE_DIRECTIONS.join(', ')}`
  }
  return null
}

router.post('/', async (req, res) => {
  const validationError = validateSwipe(req.body)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }
  try {
    const swipe = await Swipe.create({
      profileId: req.body.profileId,
      direction: req.body.direction,
    })
    return res.status(201).json(swipe)
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: err.message })
    }
    console.error(err)
    return res.status(500).json({ error: 'Could not save swipe' })
  }
})

export default router
