import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import profilesRouter from './routes/profiles.js'
import swipeRouter from './routes/swipe.js'

const CLIENT_ORIGIN = 'http://localhost:5173'
const { MONGODB_URI, PORT = 3001 } = process.env

if (!MONGODB_URI) throw new Error('MONGODB_URI missing')

const app = express()

app.use(cors({ origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] }))
app.use(express.json({ limit: '10kb' }))
app.use('/api/profiles', profilesRouter)
app.use('/api/swipe', swipeRouter)

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
  try {
    await mongoose.connect(MONGODB_URI)
    app.listen(PORT, (err) => {
      if (err) {
        console.error('Could not start server', err)
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
