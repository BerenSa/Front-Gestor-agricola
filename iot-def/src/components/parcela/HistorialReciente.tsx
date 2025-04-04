import { Link } from "react-router-dom"
import { Thermometer, Droplets, Cloud, Sun, History } from "lucide-react"
import type { HistorialItem } from "../../types"
import "../../styles/ParcelaDetail.css"

interface HistorialRecienteProps {
  historial: HistorialItem[]
  parcelaId: string
}

function HistorialReciente({ historial, parcelaId }: HistorialRecienteProps) {
  return (
    <div className="parcela-historial">
      <div className="historial-header">
        <h2>
          <History size={20} />
          Historial Reciente
        </h2>
      </div>

      {historial.length > 0 ? (
        <div className="historial-list">
          {historial.slice(0, 5).map((item) => (
            <div key={item.id} className="historial-item">
              <div className="historial-date">
                {new Date(item.fecha).toLocaleDateString()} {new Date(item.fecha).toLocaleTimeString()}
              </div>
              <div className="historial-values">
                <span>
                  <Thermometer size={16} /> {item.temperatura}°C
                </span>
                <span>
                  <Droplets size={16} /> {item.humedad}%
                </span>
                <span>
                  <Cloud size={16} /> {item.lluvia} mm {item.lluvia > 5 ? "(Lluvia)" : "(Sin lluvia)"}
                </span>
                <span>
                  <Sun size={16} /> UV: {item.intensidadSol}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">No hay datos de historial disponibles</div>
      )}

      <Link to={`/graficas-parcela/${parcelaId}`} className="ver-mas-link">
        Ver historial completo y gráficas
      </Link>
    </div>
  )
}

export default HistorialReciente

