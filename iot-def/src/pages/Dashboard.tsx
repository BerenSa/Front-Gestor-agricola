"use client"

import { useState, useEffect } from "react"
import { fetchParcelas, fetchSensoresData } from "../services/api"
import type { Parcela } from "../types"
import MapaUbicaciones from "../components/dashboard/MapaUbicaciones"
import TemperaturaCard from "../components/dashboard/TemperaturaCard"
import HumedadCard from "../components/dashboard/HumedadCard"
import LluviaCard from "../components/dashboard/LluviaCard"
import IntensidadSolCard from "../components/dashboard/IntensidadSolCard"
import ParcelaCard from "../components/dashboard/ParcelaCard"
import "../styles/Dashboard.css"

function Dashboard() {
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const [promedios, setPromedios] = useState({
    temperatura: 0,
    humedad: 0,
    lluvia: 0,
    intensidadSol: 0,
  })

  const [sensores, setSensores] = useState({
    temperatura: 0,
    humedad: 0, 
    lluvia: 0,
    intensidadSol: 0
  })

  const loadParcelas = async (showRefreshing = true) => {
    if (showRefreshing) setIsRefreshing(true)
    try {
      const data = await fetchParcelas()

      // Filtrar parcelas no eliminadas y validar coordenadas
      const parcelasActivas = data.filter(
        (p) => p.is_deleted === 0 && !isNaN(parseFloat(p.latitud)) && !isNaN(parseFloat(p.longitud))
      )
      setParcelas(parcelasActivas)

      // Calcular promedios
      if (parcelasActivas.length > 0) {
        // Obtener el último registro histórico para cada parcela
        const ultimosRegistros = parcelasActivas.map((parcela) => {
          // Buscar el último registro histórico para esta parcela
          return {
            temperatura: parcela.temperatura || 0,
            humedad: parcela.humedad || 0,
            lluvia: parcela.lluvia || 0,
            intensidadSol: parcela.intensidadSol || 0,
          }
        })

        const tempSum = ultimosRegistros.reduce((sum, registro) => sum + registro.temperatura, 0)
        const humSum = ultimosRegistros.reduce((sum, registro) => sum + registro.humedad, 0)
        const solSum = ultimosRegistros.reduce((sum, registro) => sum + registro.intensidadSol, 0)
        const lluvia = ultimosRegistros.some((registro) => registro.lluvia)

        setPromedios({
          temperatura: Math.round(tempSum / parcelasActivas.length),
          humedad: Math.round(humSum / parcelasActivas.length),
          lluvia,
          intensidadSol: Math.round(solSum / parcelasActivas.length),
        })
      }
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error al cargar parcelas:", err)
      setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
      if (showRefreshing) {
        setTimeout(() => setIsRefreshing(false), 500)
      }
    }
  }

  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  useEffect(() => {
    loadParcelas(false)
    const intervalId = setInterval(() => loadParcelas(true), 60000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const fetchSensores = async () => {
      try {
        const data = await fetchSensoresData()
        setSensores({
          temperatura: data.temperatura,
          humedad: data.humedad,
          lluvia: data.lluvia,
          intensidadSol: data.sol
        })
      } catch (err) {
        console.error("Error al cargar datos de sensores:", err)
      }
    }

    fetchSensores()
    // Poll sensor data every minute
    const intervalId = setInterval(fetchSensores, 60000)
    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return <div className="loading">Cargando datos...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Estado General</h1>
        <div className="refresh-controls">
          <span className="last-updated">
            Última actualización: {formatLastUpdated()}
          </span>
          <button 
            onClick={() => loadParcelas(true)} 
            className="refresh-button"
            disabled={isRefreshing || loading}
          >
            {isRefreshing ? 'Actualizando...' : 'Actualizar datos'}
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="map-container">
          <MapaUbicaciones
            parcelas={parcelas.map((parcela) => ({
              id: parcela.id,
              nombre: parcela.nombre,
              longitud: parcela.longitud,
              latitud: parcela.latitud,
              is_deleted: parcela.is_deleted,
              popupContent: `
                <div style="padding: 10px; max-width: 250px;">
                  <strong style="font-size: 16px; color: #2196f3;">${parcela.nombre}</strong>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 8px 0;" />
                  <p style="margin: 0;">
                    <strong>Ubicación:</strong> ${parcela.ubicacion} <br />
                    <strong>Responsable:</strong> ${parcela.responsable} <br />
                    <strong>Tipo de Cultivo:</strong> ${parcela.tipo_cultivo} <br />
                    <strong>Último Riego:</strong> ${new Date(parcela.ultimo_riego).toLocaleString()} <br />
                    <strong>Coordenadas:</strong> ${parcela.latitud}, ${parcela.longitud} <br />
                  </p>
                </div>
              `,
            }))}
            zoom={12}
            center={[-86.865825, 21.069046]}
          />
        </div>

        <div className="dashboard-widgets">
          <TemperaturaCard temperatura={sensores.temperatura} />
          <HumedadCard humedad={sensores.humedad} />
          <LluviaCard lluvia={sensores.lluvia} />
          <IntensidadSolCard intensidadSol={sensores.intensidadSol} />
        </div>
      </div>

      <div className="parcelas-list">
        <h2>Listado de Parcelas</h2>
        <div className="parcelas-grid">
          {parcelas ? parcelas.map((parcela) => (
            <ParcelaCard key={parcela.id} parcela={parcela} />
          )) : <p>No hay parcelas disponibles.</p>}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

