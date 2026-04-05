import { useState, useEffect, useCallback } from 'react'
import { txAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { fmt, errorMsg } from '../utils/helpers'
import {
  Card, Button, Input, Select, Badge, Modal, Alert,
  Table, Th, Td, EmptyState, Pagination, Spinner,
} from '../components/ui'
import { Plus, Search, Edit2, Trash2, ArrowLeftRight, X } from 'lucide-react'
import Styles from './styles/TransactionsPage.module.css'

const CATEGORIES = ['Salary','Freelance','Investment','Rent','Groceries','Utilities','Transport','Healthcare','Entertainment','Miscellaneous','Other']
const EMPTY_FORM  = { amount: '', type: 'income', category: '', date: '', notes: '' }

export default function TransactionsPage() {
  const { isAdmin } = useAuth()
  const [data, setData]         = useState({ transactions: [], total: 0, totalPages: 1 })
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  // Filters
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '', search: '' })
  const [page, setPage]       = useState(1)
  const LIMIT = 12

  // Modal
  const [modal, setModal]           = useState({ open: false, mode: 'create', tx: null })
  const [form, setForm]             = useState(EMPTY_FORM)
  const [formError, setFormError]   = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchTx = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const { data: res } = await txAPI.getAll(params)
      setData(res.data)
    } catch (e) { setError(errorMsg(e)) }
    finally { setLoading(false) }
  }, [page, filters])

  useEffect(() => { fetchTx() }, [fetchTx])

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal({ open: true, mode: 'create', tx: null }) }
  const openEdit   = (tx) => {
    setForm({ amount: tx.amount, type: tx.type, category: tx.category, date: tx.date?.slice(0, 10) || '', notes: tx.notes || '' })
    setFormError('')
    setModal({ open: true, mode: 'edit', tx })
  }
  const closeModal = () => setModal({ open: false, mode: 'create', tx: null })

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      if (modal.mode === 'create') {
        await txAPI.create({ ...form, amount: Number(form.amount) })
        setSuccess('Transaction created.')
      } else {
        await txAPI.update(modal.tx._id, { ...form, amount: Number(form.amount) })
        setSuccess('Transaction updated.')
      }
      closeModal()
      fetchTx()
    } catch (e) { setFormError(errorMsg(e)) }
    finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await txAPI.delete(deleteTarget._id)
      setSuccess('Transaction deleted.')
      setDeleteTarget(null)
      fetchTx()
    } catch (e) { setError(errorMsg(e)) }
  }

  const setF   = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }))
  const setFrm = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const clearFilters  = () => { setFilters({ type: '', category: '', startDate: '', endDate: '', search: '' }); setPage(1) }
  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <div className={Styles.page}>

      {/* ── Header ── */}
      <div className={`animate-fadeUp ${Styles.header}`}>
        <div>
          <h1 className={Styles.heading}>Transactions</h1>
          {/* <p className={Styles.subheading}>{data.total} records</p> */}
        </div>
        {isAdmin && <Button icon={Plus} onClick={openCreate}>New Transaction</Button>}
      </div>

      {/* ── Alerts ── */}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* ── Filters ── */}
      <Card className={Styles.filterCard}>
        <div className={Styles.filterGrid}>
          <Input placeholder="Search notes…" icon={Search} value={filters.search} onChange={setF('search')} />
          <Select value={filters.type} onChange={setF('type')}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select value={filters.category} onChange={setF('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input type="date" value={filters.startDate} onChange={setF('startDate')} />
          <Input type="date" value={filters.endDate}   onChange={setF('endDate')}   />
          {activeFilters > 0 && (
            <Button variant="ghost" icon={X} onClick={clearFilters}>Clear ({activeFilters})</Button>
          )}
        </div>
      </Card>

      {/* ── Table ── */}
      <Card className={Styles.tableCard}>
        {loading
          ? <div className={Styles.tableLoading}><Spinner /></div>
          : data.transactions.length === 0
          ? <EmptyState icon={ArrowLeftRight} title="No transactions found" description="Try adjusting your filters or create a new record." />
          : <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Category</Th>
                  <Th>Type</Th>
                  <Th>Notes</Th>
                  <Th align="right">Amount</Th>
                  {isAdmin && <Th align="center">Actions</Th>}
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((tx, i) => (
                  <tr
                    key={tx._id}
                    className={Styles.txRow}
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <Td mono>{fmt.date(tx.date)}</Td>
                    <Td><span className={Styles.txCategory}>{tx.category}</span></Td>
                    <Td><Badge variant={tx.type}>{tx.type}</Badge></Td>
                    <Td><span className={Styles.txNotes}>{tx.notes || '—'}</span></Td>
                    <Td align="right" mono>
                      <span className={`${Styles.txAmount} ${tx.type === 'income' ? Styles.txAmountIncome : Styles.txAmountExpense}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt.currency(tx.amount)}
                      </span>
                    </Td>
                    {isAdmin && (
                      <Td align="center">
                        <div className={Styles.actionCell}>
                          <Button variant="ghost"  size="sm" icon={Edit2}  onClick={() => openEdit(tx)} />
                          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTarget(tx)} />
                        </div>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
        }
        {data.totalPages > 1 && (
          <div className={Styles.paginationWrap}>
            <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
          </div>
        )}
      </Card>

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.mode === 'create' ? 'New Transaction' : 'Edit Transaction'}
      >
        {formError && <div className={Styles.formError}><Alert type="error" message={formError} /></div>}
        <form className={Styles.form} onSubmit={handleSave}>
          <div className={Styles.formGrid2}>
            <Input label="Amount (₹)" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={setFrm('amount')} required />
            <Select label="Type" value={form.type} onChange={setFrm('type')}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </div>
          <div className={Styles.formGrid2}>
            <Select label="Category" value={form.category} onChange={setFrm('category')} required>
              <option value="">Select…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Date" type="date" value={form.date} onChange={setFrm('date')} required />
          </div>
          <Input label="Notes (optional)" placeholder="Add a note…" value={form.notes} onChange={setFrm('notes')} />
          <div className={Styles.formActions}>
            <Button variant="ghost" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={formLoading}>
              {modal.mode === 'create' ? 'Create' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete transaction?">
        <p className={Styles.deleteText}>
          This will soft-delete <strong>{deleteTarget?.category}</strong> ({fmt.currency(deleteTarget?.amount)}). The record is preserved in the audit log.
        </p>
        <div className={Styles.deleteActions}>
          <Button variant="ghost"  onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

    </div>
  )
}