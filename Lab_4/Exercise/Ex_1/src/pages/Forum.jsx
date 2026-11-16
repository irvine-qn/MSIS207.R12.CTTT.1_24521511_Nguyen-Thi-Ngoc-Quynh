import { useParams } from 'react-router'
import { useForumMessages } from '../hooks/useForumMessages.js'
import Skeleton from '../components/Skeleton.jsx'
import styles from './Forum.module.css'

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export default function Forum() {
  const { forumId = '' } = useParams()
  const { messages, loading, error } = useForumMessages(forumId)

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
        <ul className={styles.list}>
          {messages.map((message) => (
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
      )}
    </section>
  )
}
