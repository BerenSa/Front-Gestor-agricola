import { Droplets } from "lucide-react"
import "../../styles/Dashboard.css"

interface HumedadCardProps {
  humedad: number
}

function HumedadCard({ humedad }: HumedadCardProps) {
  return (
    <div className="widget">
      <div className="widget-header">
        <Droplets size={24} />
        <h3>Humedad</h3>
      </div>
      <div className="widget-content">
        <span className="widget-value">{humedad}%</span>
      </div>
    </div>
  )
}

export default HumedadCard

