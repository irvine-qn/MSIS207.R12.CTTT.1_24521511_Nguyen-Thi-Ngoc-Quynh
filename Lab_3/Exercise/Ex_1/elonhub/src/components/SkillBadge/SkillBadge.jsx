import styles from './SkillBadge.module.css'

// Mot ky nang hien thi trong danh sach ky nang
function SkillBadge({ name, level }) {
  return (
    <li className={styles.badge}>
      {name}
      {level && <span className={styles.level}> {level}</span>}
    </li>
  )
}

export default SkillBadge
