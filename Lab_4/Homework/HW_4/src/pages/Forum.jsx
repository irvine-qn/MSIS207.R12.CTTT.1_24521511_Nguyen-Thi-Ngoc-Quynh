import { useParams, useSearchParams } from 'react-router'
import { useForumMessages } from '../hooks/useForumMessages.js'
import Skeleton from '../components/Skeleton.jsx'
import styles from './Forum.module.css'

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const PAGE_SIZE = 5

export default function Forum() {
  const { forumId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { messages, loading, error } = useForumMessages(forumId)

  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE))
  const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const page = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1
  const pageMessages = messages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goToPage = (nextPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (nextPage === 1) {
        next.delete('page')
      } else {
        next.set('page', String(nextPage))
      }
      return next
    })
  }

  if (loading) {
    return <Skeleton />
  }

  if (error) {
    return (
      <section role="alert" className={styles.card}>
        <h1>Could not load forum {forumId}</h1>
        <p>{error}</p>
      </section>
    )
  }

  return (
    <section className={styles.card}>
      <h1>Forum: {forumId}</h1>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <>
          <ul className={styles.list}>
            {pageMessages.map((message) => (
              <li key={message._id}>
                <article className={styles.message}>
                  <header className={styles.meta}>
                    <strong>{message.author}</strong>
                    <time dateTime={message.createdAt}>{dateFormatter.format(new Date(message.createdAt))}</time>
                  </header>
                  <p>{message.text}</p>
                </article>
              </li>
            ))}
          </ul>
          <nav aria-label="Forum pages" className={styles.pagination}>
            <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <output aria-live="polite">
              Page {page} of {totalPages}
            </output>
            <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
              Next
            </button>
          </nav>
        </>
      )}
    </section>
  )
}
