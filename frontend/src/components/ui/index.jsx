import { clsx } from '../../utils/helpers'
import Styles from './styles/index.module.css';

/* ─── Button ──────────────────────────────────────────────────── */
const VARIANT_CLASS = {
  primary: Styles.btnPrimary,
  ghost:   Styles.btnGhost,
  danger:  Styles.btnDanger,
  outline: Styles.btnOutline,
  success: Styles.btnSuccess,
}
const SIZE_CLASS = {
  sm: Styles.btnSm,
  md: Styles.btnMd,
  lg: Styles.btnLg,
}

export const Button = ({ children, variant = 'primary', size = 'md', className, loading, icon: Icon, ...props }) => (
  <button
    className={clsx(Styles.btn, VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <Spinner size={size === 'sm' ? 14 : 16} /> : Icon && <Icon size={size === 'sm' ? 14 : 16} />}
    {children}
  </button>
)

/* ─── Input ───────────────────────────────────────────────────── */
export const Input = ({ label, error, icon: Icon, className, ...props }) => (
  <div className={clsx(Styles.inputWrapper, className)}>
    {label && <label className={Styles.label}>{label}</label>}
    <div className={Styles.inputContainer}>
      {Icon && (
        <span className={Styles.inputIconSlot}>
          <Icon size={15} />
        </span>
      )}
      <input
        className={clsx(Styles.input, Icon && Styles.inputHasIcon, error && Styles.inputError)}
        {...props}
      />
    </div>
    {error && <span className={Styles.errorText}>{error}</span>}
  </div>
)

/* ─── Select ──────────────────────────────────────────────────── */
export const Select = ({ label, error, className, children, ...props }) => (
  <div className={clsx(Styles.inputWrapper, className)}>
    {label && <label className={Styles.label}>{label}</label>}
    <select
      className={clsx(Styles.select, error && Styles.selectError)}
      {...props}
    >
      {children}
    </select>
    {error && <span className={Styles.errorText}>{error}</span>}
  </div>
)

/* ─── Card ────────────────────────────────────────────────────── */
export const Card = ({ children, className, style, glow }) => (
  <div className={clsx(Styles.card, glow && Styles.cardGlow, className)} style={style}>
    {children}
  </div>
)

/* ─── Badge ───────────────────────────────────────────────────── */
const BADGE_CLASS = {
  default:  Styles.badgeDefault,
  income:   Styles.badgeIncome,
  expense:  Styles.badgeExpense,
  admin:    Styles.badgeAdmin,
  analyst:  Styles.badgeAnalyst,
  viewer:   Styles.badgeViewer,
  active:   Styles.badgeActive,
  inactive: Styles.badgeInactive,
}

export const Badge = ({ children, variant = 'default' }) => (
  <span className={clsx(Styles.badge, BADGE_CLASS[variant] ?? Styles.badgeDefault)}>
    {children}
  </span>
)

/* ─── Spinner ─────────────────────────────────────────────────── */
export const Spinner = ({ size = 20 }) => (
  <span
    className={Styles.spinner}
    style={{ width: size, height: size }}
  />
)

/* ─── Empty State ─────────────────────────────────────────────── */
export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className={Styles.emptyState}>
    {Icon && (
      <div className={Styles.emptyStateIcon}>
        <Icon size={40} />
      </div>
    )}
    <p className={Styles.emptyStateTitle}>{title}</p>
    {description && <p className={Styles.emptyStateDescription}>{description}</p>}
  </div>
)

/* ─── Table ───────────────────────────────────────────────────── */
export const Table = ({ children }) => (
  <div className={Styles.tableWrapper}>
    <table className={Styles.table}>
      {children}
    </table>
  </div>
)

export const Th = ({ children, align = 'left' }) => (
  <th className={clsx(Styles.th, align === 'right' && Styles.thRight, align === 'center' && Styles.thCenter)}>
    {children}
  </th>
)

export const Td = ({ children, align = 'left', mono }) => (
  <td className={clsx(Styles.td, align === 'right' && Styles.tdRight, align === 'center' && Styles.tdCenter, mono && Styles.tdMono)}>
    {children}
  </td>
)

/* ─── Modal ───────────────────────────────────────────────────── */
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div
      className={Styles.modalBackdrop}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={clsx('animate-fadeUp', Styles.modalBox)}>
        <div className={Styles.modalHeader}>
          <h3 className={Styles.modalTitle}>{title}</h3>
          <button className={Styles.modalClose} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ─── Alert ───────────────────────────────────────────────────── */
const ALERT_CLASS = {
  error:   Styles.alertError,
  success: Styles.alertSuccess,
  info:    Styles.alertInfo,
}

export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null
  return (
    <div className={clsx(Styles.alert, ALERT_CLASS[type] ?? Styles.alertError)}>
      <span className={Styles.alertText}>{message}</span>
      {onClose && (
        <button className={Styles.alertClose} onClick={onClose}>✕</button>
      )}
    </div>
  )
}

/* ─── Pagination ──────────────────────────────────────────────── */
export const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null
  return (
    <div className={Styles.pagination}>
      <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>←</Button>
      <span className={Styles.paginationLabel}>{page} / {totalPages}</span>
      <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>→</Button>
    </div>
  )
}