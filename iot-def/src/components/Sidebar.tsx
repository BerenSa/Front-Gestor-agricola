import { Link, NavLink } from "react-router-dom"
import { Home, History, BarChart2, Trash2, MapPin, AlertTriangle } from "lucide-react"
import "../styles/Sidebar.css"

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard-IOT</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            
          </li>
          <li>
            <NavLink to="/graficas" className={({ isActive }) => (isActive ? "active" : "")}>
              <BarChart2 size={20} />
              <span>Gráficas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/parcelas-eliminadas" className={({ isActive }) => (isActive ? "active" : "")}>
              <Trash2 size={20} />
              <span>Parcelas Eliminadas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/zonas-riego" className={({ isActive }) => (isActive ? "active" : "")}>
              <MapPin size={20} />
              <span>Zonas de Riego</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/zonas-no-disponibles" className={({ isActive }) => (isActive ? "active" : "")}>
              <AlertTriangle size={20} />
              <span>Zonas No Disponibles</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>© 2025 Berenice Sánchez</p>
      </div>
    </aside>
  )
}

export default Sidebar

