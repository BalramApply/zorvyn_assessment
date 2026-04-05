import { TrendingUp, TrendingDown } from 'lucide-react'
import Styles from './styles/StatCard.module.css'

export default function StatCard({ label, value, icon: Icon, trend, trendLabel, color = 'var(--gold)', delay = 0 }) {
  const isPositive = trend >= 0

  return (
    <div
      className={`animate-fadeUp ${Styles.card}`}
      style={{ '--card-color': color, animationDelay: `${delay}ms` }}
    >
      <div className={Styles.glow} />

      <div className={Styles.body}>
        <div>
          <p className={Styles.label}>{label}</p>
          <p className={Styles.value}>{value}</p>

          {trendLabel && (
            <div className={Styles.trend}>
              {isPositive
                ? <TrendingUp  size={12} color="var(--green)" />
                : <TrendingDown size={12} color="var(--red)"  />}
              <span className={isPositive ? Styles.trendUp : Styles.trendDown}>
                {trendLabel}
              </span>
            </div>
          )}
        </div>

        <div className={Styles.iconBox}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}