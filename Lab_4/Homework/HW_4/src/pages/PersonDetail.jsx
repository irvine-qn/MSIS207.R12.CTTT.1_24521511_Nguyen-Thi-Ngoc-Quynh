import { useParams } from 'react-router'
import { people } from '../data/people.js'
import styles from './PersonDetail.module.css'

const fields = [
  { key: 'genre', label: 'Genre' },
  { key: 'country', label: 'Country' },
  { key: 'website', label: 'Website' },
]

export default function PersonDetail() {
  const { personId = '' } = useParams()
  const person = people.find((item) => item.id === personId)

  if (!person) {
    return (
      <section role="alert" className={styles.card}>
        <h2>Person not found</h2>
        <p>No person matches the id {personId}.</p>
      </section>
    )
  }

  return (
    <article className={styles.card}>
      <h2>{person.name}</h2>
      <dl className={styles.list}>
        {fields.map(({ key, label }) => (
          <div key={key} className={styles.row}>
            <dt>{label}</dt>
            <dd>
              {key === 'website' ? (
                <a href={person.website} target="_blank" rel="noreferrer">
                  {person.website}
                </a>
              ) : (
                person[key]
              )}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
