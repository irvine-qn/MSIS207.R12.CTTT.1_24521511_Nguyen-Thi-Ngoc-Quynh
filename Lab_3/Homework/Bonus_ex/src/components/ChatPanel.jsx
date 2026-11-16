import { useEffect, useId, useRef, useState } from 'react'
import { waitForReply } from '../utils/waitForReply.js'
import styles from './ChatPanel.module.css'

const REPLY_TIMEOUT_MS = 5000

function ChatPanel({ phase = 'FRIENDS', onSend = () => {}, onGhosted = () => {} }) {
  const messageId = useId()
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const onGhostedRef = useRef(onGhosted)

  const canChat = phase === 'DATING_NO_LOVE'
  const lastMessageId = messages.at(-1)?.id ?? null
  const isWaiting = canChat && lastMessageId !== null

  useEffect(() => {
    onGhostedRef.current = onGhosted
  }, [onGhosted])

  useEffect(() => {
    if (!isWaiting) return undefined
    const controller = new AbortController()
    waitForReply(REPLY_TIMEOUT_MS, controller.signal)
      .then(() => onGhostedRef.current())
      .catch((err) => {
        if (err.name === 'AbortError') return
        throw err
      })
    return () => controller.abort()
  }, [isWaiting, lastMessageId])

  function handleSubmit(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!canChat || text === '') return
    const message = { id: crypto.randomUUID(), text }
    setMessages((prev) => [...prev, message])
    setDraft('')
    onSend(message)
  }

  return (
    <section className={styles.panel} aria-label="Tin nhắn">
      <ol className={styles.messages}>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ol>
      <output className={styles.status} role="status" aria-live="polite">
        {isWaiting ? 'Đã xem, đang chờ rep' : ''}
      </output>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor={messageId}>Tin nhắn</label>
        <input
          id={messageId}
          type="text"
          value={draft}
          disabled={!canChat}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" disabled={!canChat || draft.trim() === ''}>
          Gửi
        </button>
        <button type="button" disabled={!canChat} onClick={() => onGhostedRef.current()}>
          Chọn Ai đó
        </button>
      </form>
    </section>
  )
}

export default ChatPanel
