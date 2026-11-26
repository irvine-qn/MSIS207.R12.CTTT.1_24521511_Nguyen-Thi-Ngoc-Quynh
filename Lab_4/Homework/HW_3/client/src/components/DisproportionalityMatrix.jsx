import { useMemo } from 'react'
import { computeMatrix, EXPECTED_MATCHES_PER_SEVERITY } from '../utils/computeMatrix.js'
import panel from './Panel.module.css'
import styles from './DisproportionalityMatrix.module.css'

const formatDelta = (value) => (value > 0 ? `+${value}` : String(value))

export default function DisproportionalityMatrix({ dossier }) {
  const matrix = useMemo(() => computeMatrix(dossier), [dossier])

  return (
    <section className={panel.panel} aria-labelledby="matrix-title">
      <h2 id="matrix-title">Ma trận bất cân xứng</h2>
      <p className={styles.note}>Mức chuẩn bằng mức độ nhân {EXPECTED_MATCHES_PER_SEVERITY} trận.</p>
      <section className={styles.scroller} tabIndex={0} aria-labelledby="matrix-caption">
        <table className={styles.table}>
          <caption id="matrix-caption">So sánh án phạt thực tế với mức chuẩn theo từng vi phạm</caption>
          <thead>
            <tr>
              <th scope="col">Mã</th>
              <th scope="col">Mô tả</th>
              <th scope="col">Mức độ</th>
              <th scope="col">Án phạt</th>
              <th scope="col">Mức chuẩn</th>
              <th scope="col">Chênh lệch</th>
              <th scope="col">Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row, index) => (
              <tr key={`${row.code}-${index}`}>
                <th scope="row">{row.code}</th>
                <td>{row.description}</td>
                <td>{row.severity}</td>
                <td>{row.penaltyMatches}</td>
                <td>{row.expectedMatches}</td>
                <td>{formatDelta(row.delta)}</td>
                <td className={row.isDisproportionate ? styles.flag : styles.ok}>
                  {row.isDisproportionate ? 'Bất cân xứng' : 'Tương xứng'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3}>Tổng</th>
              <td>{matrix.totals.penaltyMatches}</td>
              <td>{matrix.totals.expectedMatches}</td>
              <td>{formatDelta(matrix.totals.delta)}</td>
              <td>{matrix.totals.disproportionateCount} bất cân xứng</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </section>
  )
}
