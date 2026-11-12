import { useId, useState } from 'react'
import SquadRow from './SquadRow.jsx'
import VirtualList from './VirtualList.jsx'
import styles from './Leaderboard.module.css'

const ROW_HEIGHT_PX = 72
const VIEWPORT_ROWS = 2

const SORT_OPTIONS = [
  { value: 'wwcdCount', label: 'WWCD' },
  { value: 'placementPts', label: 'Placement Points' },
  { value: 'killPts', label: 'Kill Points' },
]

function Leaderboard({ standings = [] }) {
  const headingId = useId()
  const searchId = useId()
  const minWwcdId = useId()
  const sortId = useId()
  const [searchText, setSearchText] = useState('')
  const [minWwcd, setMinWwcd] = useState(0)
  const [sortKey, setSortKey] = useState('wwcdCount')

  const keyword = searchText.trim().toLowerCase()
  const wwcdThreshold = Number.isNaN(minWwcd) ? 0 : Math.max(0, minWwcd)
  const visibleStandings = standings
    .filter((squad) => squad.squadName.toLowerCase().includes(keyword) && squad.wwcdCount >= wwcdThreshold)
    .toSorted((a, b) => b[sortKey] - a[sortKey] || a.squadName.localeCompare(b.squadName))

  const handleMinWwcdChange = (e) => {
    setMinWwcd(e.target.valueAsNumber)
  }

  return (
    <section className={styles.leaderboard} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>PUBG VN Leaderboard</h2>
      <form className={styles.filters} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={searchId} className={styles.field}>
          Tìm squad
          <input id={searchId} type="search" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </label>
        <label htmlFor={minWwcdId} className={styles.field}>
          WWCD tối thiểu
          <input id={minWwcdId} type="number" min="0" value={Number.isNaN(minWwcd) ? '' : minWwcd} onChange={handleMinWwcdChange} />
        </label>
        <label htmlFor={sortId} className={styles.field}>
          Sắp xếp theo
          <select id={sortId} value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </form>
      <output className={styles.summary} role="status">
        Hiển thị {visibleStandings.length} / {standings.length} squad
      </output>
      {visibleStandings.length > 0 && (
        <VirtualList
          items={visibleStandings}
          rowHeight={ROW_HEIGHT_PX}
          viewportRows={VIEWPORT_ROWS}
          overscan={0}
          getKey={(squad) => squad.squadId}
          renderItem={(squad) => <SquadRow squad={squad} />}
          label="Bảng xếp hạng squad"
        />
      )}
    </section>
  )
}

export default Leaderboard
