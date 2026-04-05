import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Select, Button, Alert } from '../components/ui'
import { Mail, Lock, User, TrendingUp } from 'lucide-react'
import Styles from './styles/RegisterPage.module.css'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await register(form)
    if (res.ok) navigate('/')
    else setError(res.message)
  }

  return (
    <div className={Styles.page}>
      <div className={`animate-fadeUp ${Styles.card}`}>

        <div className={Styles.logo}>
          <div className={Styles.logoIcon}>
            <TrendingUp size={18} color="#06060f" strokeWidth={2.5} />
          </div>
          <span className={Styles.logoName}>FinVault</span>
        </div>

        <h1 className={Styles.heading}>Create account</h1>
        <p className={Styles.subheading}>Join the finance dashboard</p>

        {error && (
          <div className={Styles.alertWrap}>
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <form className={Styles.form} onSubmit={handleSubmit}>
          <Input label="Full name"  placeholder="Aarav Mehta"        icon={User} value={form.name}     onChange={set('name')}     required />
          <Input label="Email"      type="email" placeholder="you@example.com" icon={Mail} value={form.email}    onChange={set('email')}    required />
          <Input label="Password"   type="password" placeholder="min. 6 characters" icon={Lock} value={form.password} onChange={set('password')} required minLength={6} />
          <Select label="Role" value={form.role} onChange={set('role')}>
            <option value="viewer">Viewer — read-only access</option>
            <option value="analyst">Analyst — insights access</option>
          </Select>
          <Button type="submit" size="lg" loading={loading} className={Styles.submitBtn}>
            Create account
          </Button>
        </form>

        <p className={Styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={Styles.link}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}