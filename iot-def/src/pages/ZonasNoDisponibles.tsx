"use client"

import React, { useEffect, useState } from "react"
import { fetchZonasRiegoNoFuncionando } from "../services/api"
import "../styles/ZonasRiego.css"

const ZonasNoDisponibles: React.FC = () => {
  const [zonasNoFuncionando, setZonasNoFuncionando] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const noFuncionando = await fetchZonasRiegoNoFuncionando()
        setZonasNoFuncionando(noFuncionando)
      } catch (err) {
        console.error("Error fetching zonas de riego no disponibles:", err)
        setError("No se pudieron cargar las zonas de riego no disponibles.")
      }
    }

    fetchData()
  }, [])

  return (
    <div className="dashboard-content">
      <div className="zones-grid">
        {zonasNoFuncionando.map((zona) => (
          <div key={zona.id} className="zone-card">
            <h3 className="zone-name">{zona.nombre}</h3>
            <p><strong>Sector:</strong> {zona.sector}</p>
            <p><strong>Tipo de Riego:</strong> {zona.tipo_riego}</p>
            <p>
              <strong>Estado Actual:</strong>{" "}
              <span className="zone-status">{zona.estado}</span>
            </p>
            <p><strong>Fecha de Actualización:</strong> {zona.fecha}</p>
          </div>
        ))}
        {zonasNoFuncionando.length === 0 && (
          <p className="no-zones-message">No hay zonas en mantenimiento o fuera de servicio.</p>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}

export default ZonasNoDisponibles
