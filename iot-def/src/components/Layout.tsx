import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import "../styles/Layout.css"

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

