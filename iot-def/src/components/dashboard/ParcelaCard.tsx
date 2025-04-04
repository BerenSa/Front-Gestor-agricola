import { Link } from "react-router-dom"
import { Thermometer, Droplets, Cloud, Sun } from "lucide-react"
import type { Parcela } from "../../types"
import "../../styles/Dashboard.css"

interface ParcelaCardProps {
  parcela: Parcela
}

function ParcelaCard({ parcela }: ParcelaCardProps) {
  // Obtener los valores de temperatura y humedad
  const temperatura = parcela.temperatura || 0
  const humedad = parcela.humedad || 0

  // Para lluvia, mostrar el valor numérico
  const lluviaValor = typeof parcela.lluvia === "boolean" ? (parcela.lluvia ? 10 : 0) : parcela.lluvia || 0

  // Para intensidad del sol, mostrar el valor numérico
  const intensidadSol = parcela.intensidadSol || 0

  return (
    <Link to={`/parcela/${parcela.id}`} className="parcela-card">
      <h3 className="parcela-title">{parcela.nombre}</h3>

      <div className="parcela-info">
        <div className="info-row">
          <Thermometer size={18} className="info-icon" />
          <span className="info-label">Temperatura:</span>
          <span className="info-value">{temperatura}°C</span>
        </div>

        <div className="info-row">
          <Droplets size={18} className="info-icon" />
          <span className="info-label">Humedad:</span>
          <span className="info-value">{humedad}%</span>
        </div>

        <div className="info-row">
          <Cloud size={18} className="info-icon" />
          <span className="info-label">Lluvia:</span>
          <span className="info-value">
            {lluviaValor} mm {lluviaValor > 5 ? "(Lluvia)" : "(Sin lluvia)"}
          </span>
        </div>

        <div className="info-row">
          <Sun size={18} className="info-icon" />
          <span className="info-label">UV:</span>
          <span className="info-value">{intensidadSol}</span>
        </div>
      </div>
    </Link>
  )
}

export default ParcelaCard

