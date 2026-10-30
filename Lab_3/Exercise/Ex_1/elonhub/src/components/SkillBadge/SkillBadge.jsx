function SkillBadge({ name, level }) {
  return (
    <li>
      {name}
      {level && <span> {level}</span>}
    </li>
  )
}

export default SkillBadge
