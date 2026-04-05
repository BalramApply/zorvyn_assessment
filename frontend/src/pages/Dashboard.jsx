import { useState, useEffect } from 'react'
import { dashAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { fmt, errorMsg } from '../utils/helpers'
import StatCard from '../components/charts/StatCard'
import { Card, Badge, Spinner, EmptyState } from '../components/ui'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts'
import { Wallet, TrendingUp, TrendingDown, Activity, BarChart2, PieChart as PieIcon } from 'lucide-react'
import Styles from './styles/DashboardPage.module.css'

const COLORS = ['#c9a84c','#2dd4a0','#5b9cf6','#f0616d','#a78bfa','#fb923c','#34d399','#f472b6']

export default function DashboardPage() {
  const { isAnalyst } = useAuth()
  const [overview, setOverview]   = useState(null)
  const [monthly, setMonthly]     = useState(null)
  const [categories, setCategories] = useState([])
  const [recent, setRecent]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (!isAnalyst) { setLoading(false); return }
    const fetch = async () => {
      try {
        const [ov, mo, cat, rec] = await Promise.all([
          dashAPI.overview(),
          dashAPI.monthly(new Date().getFullYear()),
          dashAPI.categories(),
          dashAPI.recent(8),
        ])
        setOverview(ov.data.data)
        setMonthly(mo.data.data)
        setCategories(cat.data.data)
        setRecent(rec.data.data.transactions)
      } catch (e) { setError(errorMsg(e)) }
      finally { setLoading(false) }
    }
    fetch()
  }, [isAnalyst])

  if (!isAnalyst) return (
    <div className={Styles.centered}>
      <EmptyState icon={Activity} title="Analyst access required" description="You need analyst or admin role to view dashboard analytics." />
    </div>
  )

  if (loading) return (
    <div className={Styles.centered}>
      <Spinner size={36} />
    </div>
  )

  const pieData     = categories.slice(0, 8).map(c => ({ name: c.category, value: c.grandTotal }))
  const monthlyData = monthly?.months?.map(m => ({
    name: m.monthName.slice(0, 3), income: m.income, expense: m.expense, net: m.net,
  })) || []

  return (
    <div className={Styles.page}>

      {/* ── Header ── */}
      <div className={`animate-fadeUp ${Styles.header}`}>
        <div>
          <p className={Styles.headerDate}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className={Styles.heading}>Dashboard</h1>
        </div>
        <div className={Styles.headerYear}>FY {monthly?.year || new Date().getFullYear()}</div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={Styles.statGrid}>
        <StatCard label="Total Income"   icon={TrendingUp}   value={fmt.currency(overview?.totalIncome)}   color="var(--green)" delay={0}   trendLabel={`${overview?.incomeCount} records`}  trend={1}  />
        <StatCard label="Total Expenses" icon={TrendingDown}  value={fmt.currency(overview?.totalExpenses)} color="var(--red)"   delay={60}  trendLabel={`${overview?.expenseCount} records`} trend={-1} />
        <StatCard label="Net Balance"    icon={Wallet}        value={fmt.currency(overview?.netBalance)}    color={overview?.netBalance >= 0 ? 'var(--gold)' : 'var(--red)'} delay={120} />
        <StatCard label="Total Records"  icon={Activity}      value={overview?.totalTransactions ?? 0}      color="var(--blue)"  delay={180} />
      </div>

      {/* ── Charts Row ── */}
      <div className={Styles.chartsRow}>

        {/* Monthly area chart */}
        <Card className={Styles.chartCard}>
          <div className={Styles.sectionHeader}>
            <BarChart2 size={16} color="var(--gold)" />
            <span className={Styles.sectionTitle}>Monthly Trends</span>
            <span className={Styles.sectionYear}>{monthly?.year}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2dd4a0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2dd4a0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f0616d" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f0616d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v, n) => [fmt.currency(v), n]}
                contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="income"  stroke="#2dd4a0" fill="url(#gIncome)"  strokeWidth={2} name="Income"  />
              <Area type="monotone" dataKey="expense" stroke="#f0616d" fill="url(#gExpense)" strokeWidth={2} name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category pie */}
        <Card className={Styles.chartCard}>
          <div className={Styles.sectionHeader}>
            <PieIcon size={16} color="var(--gold)" />
            <span className={Styles.sectionTitle}>By Category</span>
          </div>
          {pieData.length === 0
            ? <EmptyState icon={PieIcon} title="No data" />
            : <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      formatter={v => fmt.currency(v)}
                      contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={Styles.pieList}>
                  {pieData.slice(0, 5).map((d, i) => (
                    <div key={d.name} className={Styles.pieRow}>
                      <div className={Styles.pieRowLeft}>
                        <span className={Styles.pieDot} style={{ background: COLORS[i % COLORS.length] }} />
                        <span className={Styles.pieName}>{d.name}</span>
                      </div>
                      <span className={Styles.pieValue}>{fmt.currency(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
          }
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <Card>
        <div className={Styles.sectionHeader}>
          <Activity size={16} color="var(--gold)" />
          <span className={Styles.sectionTitle}>Recent Activity</span>
        </div>
        {recent.length === 0
          ? <EmptyState icon={Activity} title="No recent transactions" />
          : <div className={Styles.txList}>
              {recent.map((tx, i) => (
                <div
                  key={tx._id}
                  className={Styles.txRow}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className={Styles.txLeft}>
                    <div className={`${Styles.txIcon} ${tx.type === 'income' ? Styles.txIconIncome : Styles.txIconExpense}`}>
                      {tx.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className={Styles.txCategory}>{tx.category}</p>
                      <p className={Styles.txDate}>{fmt.date(tx.date)}</p>
                    </div>
                  </div>
                  <div className={Styles.txRight}>
                    <p className={`${Styles.txAmount} ${tx.type === 'income' ? Styles.txAmountIncome : Styles.txAmountExpense}`}>
                      {tx.type === 'income' ? '+' : '-'}{fmt.currency(tx.amount)}
                    </p>
                    <Badge variant={tx.type}>{tx.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
        }
      </Card>

    </div>
  )
}