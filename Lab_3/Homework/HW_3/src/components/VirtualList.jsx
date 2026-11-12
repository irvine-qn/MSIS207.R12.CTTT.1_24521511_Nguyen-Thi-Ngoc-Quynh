import { useLayoutEffect, useRef, useState } from 'react'
import styles from './VirtualList.module.css'

function VirtualList({ items, rowHeight, getKey, renderItem, label, viewportRows = 6, overscan = 2 }) {
  const viewportRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endIndex = Math.min(items.length, Math.ceil(scrollTop / rowHeight) + viewportRows + overscan)
  const visibleItems = items.slice(startIndex, endIndex)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    viewport.style.setProperty('--row-height', `${rowHeight}px`)
    viewport.style.setProperty('--viewport-height', `${Math.min(items.length, viewportRows) * rowHeight}px`)
    viewport.style.setProperty('--total-height', `${items.length * rowHeight}px`)
    viewport.style.setProperty('--start-offset', `${startIndex * rowHeight}px`)
  }, [items.length, rowHeight, viewportRows, startIndex])

  return (
    <section
      ref={viewportRef}
      className={styles.viewport}
      aria-label={label}
      tabIndex={0}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <ol className={styles.rows} start={startIndex + 1}>
        {visibleItems.map((item) => (
          <li key={getKey(item)} className={styles.row}>
            {renderItem(item)}
          </li>
        ))}
      </ol>
    </section>
  )
}

export default VirtualList
