import { Router } from 'express'
import Appeal from '../models/Appeal.js'
import Dossier from '../models/Dossier.js'
import { normalizeAppeal, validateAppeal } from '../../../shared/appealRules.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const body = req.body ?? {}
    const errors = validateAppeal(body)
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Invalid appeal payload', errors })
    }

    const payload = normalizeAppeal(body)
    const dossier = await Dossier.findOne({ playerID: payload.playerID }).select('appealDeadline').lean()
    if (!dossier) {
      return res.status(400).json({ error: 'Invalid appeal payload', errors: { playerID: 'Không tìm thấy hồ sơ người chơi.' } })
    }
    if (Date.now() > dossier.appealDeadline) {
      return res.status(400).json({ error: 'Đã quá hạn kháng cáo.', errors: {} })
    }

    const appeal = await Appeal.create(payload)
    res.status(201).json({ id: appeal._id.toString(), playerID: appeal.playerID, createdAt: appeal.createdAt })
  } catch (err) {
    next(err)
  }
})

export default router
