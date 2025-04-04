import { Calendar, User, Droplets } from "lucide-react"
import type { ParcelaEliminada } from "../../types"
import "../../styles/ParcelasEliminadas.css"

interface ParcelasEliminadasCardProps {
  parcela: ParcelaEliminada
}

function ParcelasEliminadasCard({ parcela }: ParcelasEliminadasCardProps) {
  // Verificar que parcela existe antes de acceder a sus propiedades
  if (!parcela) {
    return <div className="parcela-card">No hay datos disponibles</div>
  }

  return (
    <div className="parcela-card">
      <h3 className="parcela-title">{parcela.nombre || "Sin nombre"}</h3>
      <div className="eliminada-label">
        Eliminada el:{" "}
        {parcela.fechaEliminacion ? new Date(parcela.fechaEliminacion).toLocaleDateString() : "Fecha desconocida"}
      </div>

      <div className="parcela-info">
        <div className="info-row">
          <User size={18} className="info-icon" />
          <span className="info-label">Responsable:</span>
          <span className="info-value">{parcela.responsable || "No especificado"}</span>
        </div>

        <div className="info-row">
          <Calendar size={18} className="info-icon" />
          <span className="info-label">Último riego:</span>
          <span className="info-value">
            {parcela.ultimoRiego ? new Date(parcela.ultimoRiego).toLocaleDateString() : "No registrado"}
          </span>
        </div>

        <div className="info-row">
          <Droplets size={18} className="info-icon" />
          <span className="info-label">Última humedad:</span>
          <span className="info-value">{parcela.ultimaHumedad || 0}%</span>
        </div>
      </div>
    </div>
  )
}

export default ParcelasEliminadasCard

