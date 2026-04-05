import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Styles from './styles/AppLayout.module.css'

export default function AppLayout() {
  return (
    <div className={Styles.layout}>
      <Sidebar />
      <main className={Styles.main}>
        <Outlet />
      </main>
    </div>
  )
}