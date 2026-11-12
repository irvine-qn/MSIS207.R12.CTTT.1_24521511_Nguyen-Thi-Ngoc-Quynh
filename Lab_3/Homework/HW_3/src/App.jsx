import { useState } from 'react'
import AirdropCountdown from './components/AirdropCountdown.jsx'

const WARMUP_DURATION_MS = 60_000

function App() {
  const [dropEpochMs] = useState(() => Date.now() + WARMUP_DURATION_MS)

  return (
    <main>
      <h1>PUBG VN Airdrop Arena</h1>
      <AirdropCountdown targetEpochMs={dropEpochMs} />
    </main>
  )
}

export default App
