import { useState, useEffect, useCallback } from 'react'
import { usersAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { fmt, errorMsg } from '../utils/helpers'
import {
  Card, Button, Select, Badge, Modal, Alert,
  Table, Th, Td, EmptyState, Pagination, Spinner,
} from '../components/ui'
import { Users, Edit2, Trash2, Shield } from 'lucide-react'
import Styles from './styles/UsersPage.module.css'

const ROLE_LEGEND = [
  { role: 'admin',   desc: 'Full access — records & user management' },
  { role: 'analyst', desc: 'Read + dashboard insights' },
  { role: 'viewer',  desc: 'Read-only access' },
]

export default function UsersPage() {
  const { user: me, isAdmin } = useAuth()
  const [data, setData]       = useState({ users: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage]       = useState(1)
  const LIMIT = 15

  // Create Admin modal
  const [createOpen, setCreateOpen]       = useState(false)
  const [createForm, setCreateForm]       = useState({ name: '', email: '', password: '', role: 'admin' })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError]     = useState('')

  // Edit modal
  const [editTarget, setEditTarget]   = useState(null)
  const [editForm, setEditForm]       = useState({ role: '', status: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError]     = useState('')

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await usersAPI.getAll({ page, limit: LIMIT })
      setData(res.data)
    } catch (e) { setError(errorMsg(e)) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openEdit = (u) => {
    setEditTarget(u)
    setEditForm({ role: u.role, status: u.status })
    setEditError('')
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError('')
    try {
      await usersAPI.update(editTarget._id, editForm)
      setSuccess('User updated.')
      setEditTarget(null)
      fetchUsers()
    } catch (e) { setEditError(errorMsg(e)) }
    finally { setEditLoading(false) }
  }

  const handleDelete = async () => {
    try {
      await usersAPI.delete(deleteTarget._id)
      setSuccess('User deleted.')
      setDeleteTarget(null)
      fetchUsers()
    } catch (e) { setError(errorMsg(e)) }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')
    try {
      await authAPI.registerAdmin(createForm)
      setSuccess('Admin created successfully.')
      setCreateOpen(false)
      setCreateForm({ name: '', email: '', password: '', role: 'admin' })
      fetchUsers()
    } catch (e) { setCreateError(errorMsg(e)) }
    finally { setCreateLoading(false) }
  }

  if (!isAdmin) return (
    <div className={Styles.centered}>
      <EmptyState icon={Shield} title="Admin access required" description="Only admins can manage users." />
    </div>
  )

  const totalPages = Math.ceil(data.total / LIMIT)

  return (
    <div className={Styles.page}>

      {/* ── Header ── */}
      <div className={`animate-fadeUp ${Styles.header}`}>
        <div>
          <h1 className={Styles.heading}>Users</h1>
          <p className={Styles.subheading}>{data.total} accounts</p>
        </div>
        <Button icon={Shield} onClick={() => setCreateOpen(true)}>Create Admin</Button>
      </div>

      {/* ── Alerts ── */}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* ── Role Legend ── */}
      <div className={`animate-fadeUp ${Styles.legend}`}>
        {ROLE_LEGEND.map(({ role, desc }) => (
          <div key={role} className={Styles.legendItem}>
            <Badge variant={role}>{role}</Badge>
            <span>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <Card className={Styles.tableCard}>
        {loading
          ? <div className={Styles.tableLoading}><Spinner /></div>
          : data.users.length === 0
          ? <EmptyState icon={Users} title="No users found" />
          : <Table>
              <thead>
                <tr>
                  <Th>User</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th align="center">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u, i) => {
                  const isSelf = u._id === me?._id
                  return (
                    <tr
                      key={u._id}
                      className={Styles.userRow}
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <Td>
                        <div className={Styles.userCell}>
                          <div className={Styles.avatar}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span className={Styles.userName}>{u.name}</span>
                            {isSelf && <span className={Styles.selfTag}>YOU</span>}
                          </div>
                        </div>
                      </Td>
                      <Td mono><span className={Styles.mutedText}>{u.email}</span></Td>
                      <Td><Badge variant={u.role}>{u.role}</Badge></Td>
                      <Td><Badge variant={u.status}>{u.status}</Badge></Td>
                      <Td mono><span className={Styles.mutedText}>{fmt.date(u.createdAt)}</span></Td>
                      <Td align="center">
                        <div className={Styles.actionCell}>
                          <Button variant="ghost"  size="sm" icon={Edit2}  onClick={() => openEdit(u)} />
                          {!isSelf && (
                            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTarget(u)} />
                          )}
                        </div>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
        }
        {totalPages > 1 && (
          <div className={Styles.paginationWrap}>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </Card>

      {/* ── Edit Modal ── */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`}>
        {editError && <div className={Styles.modalError}><Alert type="error" message={editError} /></div>}
        <form className={Styles.form} onSubmit={handleEdit}>
          <Select label="Role" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
            <option value="viewer">Viewer</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </Select>
          <Select label="Status" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <div className={Styles.formActions}>
            <Button variant="ghost" type="button" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button type="submit" loading={editLoading}>Save changes</Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete user?">
        <p className={Styles.deleteText}>
          Permanently delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? This cannot be undone.
        </p>
        <div className={Styles.formActions}>
          <Button variant="ghost"  onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete user</Button>
        </div>
      </Modal>

      {/* ── Create Admin Modal ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Admin">
        {createError && <div className={Styles.modalError}><Alert type="error" message={createError} /></div>}
        <form className={Styles.form} onSubmit={handleCreateAdmin}>
          <input
            className={Styles.rawInput}
            placeholder="Name"
            value={createForm.name}
            onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
          />
          <input
            className={Styles.rawInput}
            placeholder="Email"
            value={createForm.email}
            onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
          />
          <input
            className={Styles.rawInput}
            type="password"
            placeholder="Password"
            value={createForm.password}
            onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
          />
          <Select label="Role" value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
          </Select>
          <div className={Styles.formActions}>
            <Button variant="ghost" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createLoading}>Create</Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}