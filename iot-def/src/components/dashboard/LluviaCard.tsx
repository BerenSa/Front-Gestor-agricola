import { Cloud } from "lucide-react"
import "../../styles/Dashboard.css"

interface LluviaCardProps {
  lluvia: boolean | number
}

function LluviaCard({ lluvia }: LluviaCardProps) {
  // Si lluvia es un booleano, convertirlo a número para mostrar
  const lluviaValor = typeof lluvia === "boolean" ? (lluvia ? 10 : 0) : lluvia

  return (
    <div className="widget">
      <div className="widget-header">
        <Cloud size={24} />
        <h3>Lluvia</h3>
      </div>
      <div className="widget-content">
        <div className="rain-value">
          <span className="widget-value">{lluviaValor}</span>
          <span className="widget-unit">mm</span>
        </div>
        {lluviaValor > 5 ? (
          <div className="rain-icon">
            <Cloud size={48} />
            <div className="rain-drops"></div>
          </div>
        ) : (
          <div className="no-rain-icon">
            <Cloud size={48} />
          </div>
        )}
      </div>
    </div>
  )
}

export default LluviaCard

