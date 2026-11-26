import { Router } from 'express'
import { Profile } from '../models/Profile.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().lean()
    return res.json(profiles)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not load profiles' })
  }
})

export default router
