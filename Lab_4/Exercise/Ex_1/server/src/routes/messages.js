import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { Message } from '../models/Message.js'

const FORUM_PATTERN = /^[a-z0-9-]{1,40}$/i
const MAX_AUTHOR_LENGTH = 50
const MAX_TEXT_LENGTH = 1000

const router = Router()

function validatePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a JSON object'
  }
  const { author, text } = body
  if (typeof author !== 'string' || author.trim().length === 0) {
    return 'author is required'
  }
  if (author.trim().length > MAX_AUTHOR_LENGTH) {
    return `author must be at most ${MAX_AUTHOR_LENGTH} characters`
  }
  if (typeof text !== 'string' || text.trim().length === 0) {
    return 'text is required'
  }
  if (text.trim().length > MAX_TEXT_LENGTH) {
    return `text must be at most ${MAX_TEXT_LENGTH} characters`
  }
  return null
}

router.get('/:forum', async (req, res) => {
  const { forum } = req.params
  if (!FORUM_PATTERN.test(forum)) {
    return res.status(400).json({ error: 'Invalid forum name' })
  }
  try {
    const messages = await Message.find({ forum }).sort({ createdAt: 1 }).lean()
    return res.json(messages)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not load messages' })
  }
})

router.post('/:forum', async (req, res) => {
  const { forum } = req.params
  if (!FORUM_PATTERN.test(forum)) {
    return res.status(400).json({ error: 'Invalid forum name' })
  }
  const validationError = validatePayload(req.body)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }
  try {
    const message = await Message.create({
      _id: randomUUID(),
      forum,
      author: req.body.author.trim(),
      text: req.body.text.trim(),
    })
    return res.status(201).json(message)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not save message' })
  }
})

export default router
