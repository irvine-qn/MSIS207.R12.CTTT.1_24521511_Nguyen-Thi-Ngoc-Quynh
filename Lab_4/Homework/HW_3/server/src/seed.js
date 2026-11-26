import mongoose from 'mongoose'
import Dossier from './models/Dossier.js'

const { MONGODB_URI } = process.env
if (!MONGODB_URI) throw new Error('MONGODB_URI missing')

const DAY_MS = 24 * 60 * 60 * 1000

const dossiers = [
  {
    playerID: 'himass',
    name: 'Himass',
    team: 'TODO team',
    violations: [
      { code: 'TODO-01', description: 'TODO mô tả vi phạm', matchDate: new Date('2026-10-01'), severity: 2, penaltyMatches: 6 },
    ],
    appealDeadline: Date.now() + 3 * DAY_MS,
  },
  {
    playerID: 'tanvuu',
    name: 'TanVuu',
    team: 'TODO team',
    violations: [
      { code: 'TODO-01', description: 'TODO mô tả vi phạm', matchDate: new Date('2026-10-01'), severity: 3, penaltyMatches: 4 },
    ],
    appealDeadline: Date.now() + 2 * DAY_MS,
  },
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    await Dossier.bulkWrite(
      dossiers.map((dossier) => ({
        replaceOne: { filter: { playerID: dossier.playerID }, replacement: dossier, upsert: true },
      }))
    )
    console.log(`Seeded ${dossiers.length} dossiers`)
  } catch (err) {
    console.error('Seed failed', err)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

seed()
