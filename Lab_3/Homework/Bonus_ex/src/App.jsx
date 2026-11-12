import { useReducer } from 'react'
import PhaseBadge from './components/PhaseBadge.jsx'
import { PHASES, canTransition, initialRelationshipState, relationshipReducer } from './utils/relationshipReducer.js'
import styles from './App.module.css'

function App() {
  const [state, dispatch] = useReducer(relationshipReducer, initialRelationshipState)

  return (
    <main className={styles.analyzer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Situationship Analyzer</h1>
        <PhaseBadge phase={state.phase} />
      </header>
      <section className={styles.actions} aria-label="Chuyển trạng thái">
        <button
          type="button"
          disabled={!canTransition(state.phase, PHASES.DATING_NO_LOVE)}
          onClick={() => dispatch({ type: 'TRANSITION', to: PHASES.DATING_NO_LOVE })}
        >
          Bắt đầu hẹn hò
        </button>
        <button
          type="button"
          disabled={!canTransition(state.phase, PHASES.OFFICIAL_LOVE)}
          onClick={() => dispatch({ type: 'TRANSITION', to: PHASES.OFFICIAL_LOVE })}
        >
          Xác nhận cả hai
        </button>
      </section>
    </main>
  )
}

export default App
