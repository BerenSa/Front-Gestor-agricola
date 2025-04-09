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
      <div className="widget-content" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="widget-value" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{humedad}%</span>
      </div>
    </div>
  )
}

export default HumedadCard

