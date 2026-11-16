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
  const status = err.status ?? 500
  const message = err.type === 'entity.parse.failed' ? 'Invalid JSON body' : err.expose ? err.message : 'Internal server error'
  res.status(status).json({ error: message })
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection', reason)
})

async function start() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set')
    process.exit(1)
  }
  if (!CLIENT_ORIGIN) {
    console.error('CLIENT_ORIGIN is not set')
    process.exit(1)
  }
  try {
    await mongoose.connect(MONGODB_URI)
    app.listen(PORT, async (err) => {
      if (err) {
        console.error(err.code === 'EADDRINUSE' ? `Port ${PORT} is already in use` : 'Could not start server', err)
        await mongoose.disconnect()
        process.exit(1)
      }
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (err) {
    console.error('Could not connect to MongoDB', err)
    process.exit(1)
  }
}

start()
