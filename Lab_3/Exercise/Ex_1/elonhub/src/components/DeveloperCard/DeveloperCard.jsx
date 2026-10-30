import { Fragment, useState } from 'react'
import SkillBadge from '../SkillBadge/SkillBadge'

const AVATAR_SIZE = 96

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
  const showAvatar = avatarUrl?.startsWith('https://') && !avatarFailed

  return (
    <article>
      <header>
        {showAvatar ? (
          <img
            src={avatarUrl}
            alt={`Avatar of ${name}`}
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <abbr title={name} aria-label={`Avatar of ${name}`}>
            {getInitials(name)}
          </abbr>
        )}
        <hgroup>
          <h2>{name}</h2>
          <p>{title}</p>
        </hgroup>
      </header>

      {bio && <p>{bio}</p>}

      <dl>
        {details.map(({ label, value }) => (
          <Fragment key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>

      <ul aria-label="Skills">
        {skills.map((skill) => (
          <SkillBadge key={skill.name} name={skill.name} level={skill.level} />
        ))}
      </ul>
    </article>
  )
}

export default DeveloperCard
