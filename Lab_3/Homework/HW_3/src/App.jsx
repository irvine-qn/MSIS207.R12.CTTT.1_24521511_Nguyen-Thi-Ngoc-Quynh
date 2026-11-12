import { useId, useState } from 'react'
import AirdropCountdown from './components/AirdropCountdown.jsx'
import CrateCard from './components/CrateCard.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import { createCrateDrops } from './data/crateDrops.js'
import { squadStandings } from './data/squadStandings.js'
import { useCrateClaim } from './hooks/useCrateClaim.js'
import { usePubgAirdropTimer } from './hooks/usePubgAirdropTimer.js'
import { getDropPhase } from './utils/getDropPhase.js'
import styles from './App.module.css'

const WARMUP_DURATION_MS = 60_000
const LIVE_DURATION_MS = 5 * 60_000

function App() {
  const cratesHeadingId = useId()
  const [dropEpochMs] = useState(() => Date.now() + WARMUP_DURATION_MS)
  const { drops, claim, alertMessage } = useCrateClaim(() => createCrateDrops(dropEpochMs))
  const closeEpochMs = dropEpochMs + LIVE_DURATION_MS
  const { remainingMs: liveRemainingMs } = usePubgAirdropTimer(closeEpochMs)
  const warmupRemainingMs = Math.max(0, liveRemainingMs - LIVE_DURATION_MS)
  const totalStock = drops.reduce((sum, drop) => sum + drop.remainingStock, 0)
  const arenaPhase = getDropPhase({ warmupRemainingMs, liveRemainingMs, remainingStock: totalStock })

  return (
    <main className={styles.arena}>
      <h1>PUBG VN Airdrop Arena</h1>
      <AirdropCountdown
        targetEpochMs={arenaPhase === 'WARMUP' ? dropEpochMs : closeEpochMs}
        phase={arenaPhase}
      />
      <section className={styles.crates} aria-labelledby={cratesHeadingId}>
        <h2 id={cratesHeadingId} className={styles.sectionHeading}>Crate Drops</h2>
        <output className={styles.alert} role="alert">{alertMessage}</output>
        <div className={styles.crateGrid}>
          {drops.map((drop) => (
            <CrateCard
              key={drop.id}
              drop={drop}
              phase={getDropPhase({
                warmupRemainingMs,
                liveRemainingMs,
                remainingStock: drop.remainingStock,
              })}
              onClaim={claim}
            />
          ))}
        </div>
      </section>
      <Leaderboard standings={squadStandings} />
    </main>
  )
}

export default App
