import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Alert } from '../components/ui'
import { Mail, Lock, TrendingUp } from 'lucide-react'
import Styles from './styles/LoginPage.module.css'

const DEMO_USERS = [
  { label: 'Admin',   email: 'admin@financeapp.dev',   pw: 'Admin@1234'   },
  { label: 'Analyst', email: 'analyst@financeapp.dev', pw: 'Analyst@1234' },
  { label: 'Viewer',  email: 'viewer@financeapp.dev',  pw: 'Viewer@1234'  },
]

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(form.email, form.password)
    if (res.ok) navigate('/')
    else setError(res.message)
  }

  const fill = (email, password) => setForm({ email, password })

  return (
    <div className={Styles.page}>

      {/* ── Left panel — decorative ── */}
      <div className={Styles.leftPanel}>
        <div className={Styles.leftContent}>
          <div className={Styles.logo}>
            <div className={`${Styles.logoIcon} ${Styles.logoIconLg}`}>
              <TrendingUp size={22} color="#06060f" strokeWidth={2.5} />
            </div>
            <span className={`${Styles.logoName} ${Styles.logoNameLg}`}>FinVault</span>
          </div>
        </div>

        <div className={Styles.leftContent}>
          <p className={Styles.leftQuote}>
            "Financial clarity starts with<br />
            <em>clean, structured data.</em>"
          </p>
          <p className={Styles.leftTagline}>Role-based access. Real-time insights.</p>
        </div>

        <div className={Styles.leftGrid} />
        <div className={Styles.leftOrb} />
      </div>

      {/* ── Right panel — form ── */}
      <div className={Styles.rightPanel}>
        <div className={`animate-fadeUp ${Styles.formCard}`}>

          <div className={Styles.logo}>
            <div className={Styles.logoIcon}>
              <TrendingUp size={18} color="#06060f" strokeWidth={2.5} />
            </div>
            <span className={Styles.logoName}>FinVault</span>
          </div>

          <h1 className={Styles.heading}>Welcome back</h1>
          <p className={Styles.subheading}>Sign in to access your finance dashboard</p>

          {error && (
            <div className={Styles.alertWrap}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form className={Styles.form} onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <Button type="submit" size="lg" loading={loading} className={Styles.submitBtn}>
              Sign in
            </Button>
          </form>

          <p className={Styles.footer}>
            No account?{' '}
            <Link to="/register" className={Styles.link}>Create one</Link>
          </p>

          {/* Demo credentials */}
          <div className={Styles.demoBox}>
            <p className={Styles.demoLabel}>Demo Credentials</p>
            <div className={Styles.demoList}>
              {DEMO_USERS.map(({ label, email, pw }) => (
                <button
                  key={label}
                  type="button"
                  className={Styles.demoBtn}
                  onClick={() => fill(email, pw)}
                >
                  <span className={Styles.demoBtnRole}>{label}</span>
                  {email}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}