import { Router } from 'express'
import Dossier from '../models/Dossier.js'

const router = Router()

router.get('/:playerID', async (req, res, next) => {
  try {
    const dossier = await Dossier.findOne({ playerID: req.params.playerID }).select('-_id -__v').lean()
    if (!dossier) return res.status(404).json({ error: 'Dossier not found' })
    res.json(dossier)
  } catch (err) {
    next(err)
  }
})

export default router
