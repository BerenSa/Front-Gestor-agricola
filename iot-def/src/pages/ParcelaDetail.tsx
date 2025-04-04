"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { BarChart2 } from "lucide-react"
import { fetchParcelaById, fetchHistorialParcela } from "../services/api"
import type { Parcela, HistorialItem } from "../types"
import ParcelaWidgets from "../components/parcela/ParcelaWidgets"
import ParcelaMapa from "../components/parcela/ParcelaMapa"
import HistorialReciente from "../components/parcela/HistorialReciente"
import "../styles/ParcelaDetail.css"

function ParcelaDetail() {
  const { id } = useParams<{ id: string }>()
  const [parcela, setParcela] = useState<Parcela | null>(null)
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadParcelaData = async () => {
      if (!id) return

      try {
        setLoading(true)
        const parcelaData = await fetchParcelaById(id)
        setParcela(parcelaData)

        const historialData = await fetchHistorialParcela(id)
        setHistorial(historialData)
      } catch (err) {
        console.error("Error al cargar datos de la parcela:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadParcelaData()
  }, [id])

  if (loading) {
    return <div className="loading">Cargando datos...</div>
  }

  if (error || !parcela) {
    return <div className="error">{error || "Parcela no encontrada"}</div>
  }

  return (
    <div className="parcela-detail">
      <div className="parcela-header">
        <h1>{parcela.nombre}</h1>
        <div className="parcela-actions">
          <Link to={`/graficas-parcela/${parcela.id}`} className="action-button">
            <BarChart2 size={16} />
            <span>Ver Gráficas</span>
          </Link>
        </div>
      </div>

      <div className="parcela-content">
        <div className="parcela-info-container">
          <ParcelaWidgets parcela={parcela} />
          <ParcelaMapa parcela={parcela} />
        </div>

        <HistorialReciente historial={historial} parcelaId={parcela.id.toString()} />
      </div>
    </div>
  )
}

export default ParcelaDetail

