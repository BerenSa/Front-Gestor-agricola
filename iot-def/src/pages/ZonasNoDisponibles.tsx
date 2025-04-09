"use client"

import React, { useEffect, useState } from "react"
import { fetchZonasRiegoNoFuncionando } from "../services/api"
import "../styles/ZonasNoDisponiblesNew.css"

interface ZonaRiego {
  id: number;
  nombre: string;
  sector: string;
  tipo_riego: string;
  estado: string;
  fecha: string;
}

const ZonasNoDisponibles: React.FC = () => {
  const [zonasNoFuncionando, setZonasNoFuncionando] = useState<ZonaRiego[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const noFuncionando = await fetchZonasRiegoNoFuncionando()
        setZonasNoFuncionando(noFuncionando)
        setError(null)
      } catch (err) {
        console.error("Error fetching zonas de riego no disponibles:", err)
        setError("No se pudieron cargar las zonas de riego no disponibles.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusClass = (estado: string) => {
    switch(estado.toLowerCase()) {
      case 'mantenimiento':
        return 'status-maintenance';
      case 'averiado':
        return 'status-broken';
      case 'inactivo':
        return 'status-inactive';
      default:
        return 'status-unavailable';
    }
  }

  if (loading) {
    return (
      <div className="zones-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Cargando zonas no disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="zones-container">
      <div className="zones-header">
        <h2>Zonas de Riego No Disponibles</h2>
        <p className="zones-description">
          Listado de zonas que requieren atención o se encuentran fuera de servicio
        </p>
      </div>

      {error && (
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      )}

      {!error && zonasNoFuncionando.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h3>No hay zonas en mantenimiento o fuera de servicio</h3>
          <p>Todas las zonas de riego están funcionando correctamente</p>
        </div>
      ) : (
        <div className="zones-grid">
          {zonasNoFuncionando.map((zona) => (
            <div key={zona.id} className="zone-card">
              <h3 className="zone-name">{zona.nombre}</h3>
              <div className="zone-details">
                <div className="detail-row">
                  <span className="detail-label">Sector:</span>
                  <span className="detail-value">{zona.sector}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tipo de Riego:</span>
                  <span className="detail-value">{zona.tipo_riego}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estado:</span>
                  <span className={`detail-value status ${getStatusClass(zona.estado)}`}>
                    {zona.estado}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Actualizado:</span>
                  <span className="detail-value date">{zona.fecha}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ZonasNoDisponibles
