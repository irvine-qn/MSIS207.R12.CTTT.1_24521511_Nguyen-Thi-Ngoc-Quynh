import { Fragment, useState } from 'react'
import SkillBadge from '../SkillBadge/SkillBadge'
import styles from './DeveloperCard.module.css'

const AVATAR_SIZE = 96

// Chi chap nhan anh HTTPS hoac anh noi bo trong thu muc public
function isSafeAvatarUrl(url) {
  return Boolean(url) && (url.startsWith('https://') || url.startsWith('/'))
}

// Lay chu cai dau cua ten de lam avatar du phong
function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

function DeveloperCard({ name, title, bio, avatarUrl, details = [], skills = [] }) {
  const [avatarFailed, setAvatarFailed] = useState(false)
  const showAvatar = isSafeAvatarUrl(avatarUrl) && !avatarFailed

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        {showAvatar ? (
          <img
            className={styles.avatar}
            src={avatarUrl}
            alt={`Avatar of ${name}`}
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <abbr
            className={styles.initials}
            title={name}
            role="img"
            aria-label={`Avatar of ${name}`}
          >
            {getInitials(name)}
          </abbr>
        )}
        <hgroup>
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.title}>{title}</p>
        </hgroup>
      </header>

      {bio && <p className={styles.bio}>{bio}</p>}

      {/* Danh sach thong tin lien he va thong ke */}
      <dl className={styles.details}>
        {details.map(({ label, value }) => (
          <Fragment key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>

      {/* Danh sach ky nang */}
      <ul className={styles.skills} aria-label="Skills">
        {skills.map((skill) => (
          <SkillBadge key={skill.name} name={skill.name} level={skill.level} />
        ))}
      </ul>
    </article>
  )
}

export default DeveloperCard
