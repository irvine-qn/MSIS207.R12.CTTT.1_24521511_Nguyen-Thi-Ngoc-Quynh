import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import messagesRouter from './routes/messages.js'

const { MONGODB_URI, CLIENT_ORIGIN, PORT = 3001 } = process.env

const app = express()

app.use(cors({ origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] }))
app.use(express.json({ limit: '10kb' }))
app.use('/api/messages', messagesRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status ?? 500).json({ error: err.status === 400 ? 'Invalid JSON body' : 'Internal server error' })
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection', reason)
})

async function start() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set')
    process.exit(1)
  }
  try {
    await mongoose.connect(MONGODB_URI)
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
  } catch (err) {
    console.error('Could not connect to MongoDB', err)
    process.exit(1)
  }
}

start()
