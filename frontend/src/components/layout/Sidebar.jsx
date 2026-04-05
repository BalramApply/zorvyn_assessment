import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, ArrowLeftRight, Users,
  LogOut, Shield, TrendingUp,
} from 'lucide-react'
import Styles from './styles/Sidebar.module.css'

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard',    roles: ['viewer', 'analyst', 'admin'] },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions', roles: ['viewer', 'analyst', 'admin'] },
  { to: '/users',        icon: Users,           label: 'Users',        roles: ['admin'] },
]

/* ── Shared nav links — used in both sidebar and drawer ── */
function NavLinks({ user, onNavigate }) {
  return (
    <nav className={Styles.nav}>
      <div className={Styles.navSection}>Navigation</div>
      {NAV.filter(n => n.roles.includes(user?.role)).map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            isActive ? `${Styles.navLink} ${Styles.navLinkActive}` : Styles.navLink
          }
        >
          <Icon size={16} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

/* ── Shared user footer — used in both sidebar and drawer ── */
function UserFooter({ user, isAdmin, onLogout }) {
  return (
    <div className={Styles.footer}>
      <div className={Styles.userRow}>
        <div className={Styles.avatar}>
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className={Styles.userInfo}>
          <div className={Styles.userName}>{user?.name}</div>
          <div className={Styles.userRole}>
            {isAdmin && <Shield size={9} />}
            {user?.role}
          </div>
        </div>
      </div>
      <button className={Styles.logoutBtn} onClick={onLogout}>
        <LogOut size={15} />
        <span>Sign out</span>
      </button>
    </div>
  )
}

/* ── Logo mark — shared ── */
function Logo() {
  return (
    <>
      <div className={Styles.logoIcon}>
        <TrendingUp size={18} color="#06060f" strokeWidth={2.5} />
      </div>
      <div className={Styles.logoText}>
        <span className={Styles.logoName}>FinVault</span>
        <span className={Styles.logoSub}>Finance Dashboard</span>
      </div>
    </>
  )
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const close = () => setOpen(false)

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className={Styles.sidebar}>
        <div className={Styles.logo}><Logo /></div>
        <NavLinks user={user} />
        <UserFooter user={user} isAdmin={isAdmin} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile topbar ── */}
      <header className={Styles.topbar}>
        <div className={Styles.topbarLogo}><Logo /></div>
        <button
          className={`${Styles.hamburger} ${open ? Styles.hamburgerOpen : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className={Styles.hamburgerLine} />
          <span className={Styles.hamburgerLine} />
          <span className={Styles.hamburgerLine} />
        </button>
      </header>

      {/* ── Backdrop ── */}
      {open && <div className={Styles.backdrop} onClick={close} />}

      {/* ── Drawer ── */}
      <div className={`${Styles.drawer} ${open ? Styles.drawerOpen : ''}`}>
        <div className={Styles.logo}><Logo /></div>
        <NavLinks user={user} onNavigate={close} />
        <UserFooter user={user} isAdmin={isAdmin} onLogout={handleLogout} />
      </div>
    </>
  )
}