import { Sun } from "lucide-react"
import "../../styles/Dashboard.css"

interface IntensidadSolCardProps {
  intensidadSol: number
}

function IntensidadSolCard({ intensidadSol }: IntensidadSolCardProps) {
  // Asegurar que el valor sea un número
  const intensidad = typeof intensidadSol === "number" ? intensidadSol : 0

  // Determinar la clase de intensidad (1-5)
  const intensidadClase = Math.min(Math.round(intensidad / 2), 5)

  return (
    <div className="widget">
      <div className="widget-header">
        <Sun size={24} />
        <h3>Intensidad Solar</h3>
      </div>
      <div className="widget-content">
        <div className="sun-value">
          <span className="widget-value">{intensidad}%</span>
        </div>
        <div className="sun-intensity">
          <Sun size={48} className={`intensity-${intensidadClase}`} />
        </div>
      </div>
    </div>
  )
}

export default IntensidadSolCard

