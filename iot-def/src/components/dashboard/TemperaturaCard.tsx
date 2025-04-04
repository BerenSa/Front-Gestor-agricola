import { Thermometer } from "lucide-react"
import "../../styles/Dashboard.css"

interface TemperaturaCardProps {
  temperatura: number
}

function TemperaturaCard({ temperatura }: TemperaturaCardProps) {
  return (
    <div className="widget">
      <div className="widget-header">
        <Thermometer size={24} />
        <h3>Temperatura</h3>
      </div>
      <div className="widget-content">
        <span className="widget-value">{temperatura} °C</span>
      </div>
    </div>
  )
}

export default TemperaturaCard

