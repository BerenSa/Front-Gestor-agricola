"use client"

import { useState, useEffect } from "react"
import { fetchParcelas } from "../services/api"
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

  // Datos promedio para mostrar en el dashboard
  const [promedios, setPromedios] = useState({
    temperatura: 0,
    humedad: 0,
    lluvia: false,
    intensidadSol: 0,
  })

  useEffect(() => {
    const loadParcelas = async () => {
      try {
        setLoading(true)
        const data = await fetchParcelas()

        // Filtrar parcelas no eliminadas
        const parcelasActivas = data.filter((p) => p.is_deleted === 0)
        setParcelas(parcelasActivas)

        // Calcular promedios
        if (parcelasActivas.length > 0) {
          // Obtener el último registro histórico para cada parcela
          const ultimosRegistros = parcelasActivas.map((parcela) => {
            // Buscar el último registro histórico para esta parcela
            return {
              temperatura: parcela.temperatura || 0,
              humedad: parcela.humedad || 0,
              lluvia: parcela.lluvia || false,
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
      } catch (err) {
        console.error("Error al cargar parcelas:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadParcelas()
  }, [])

  if (loading) {
    return <div className="loading">Cargando datos...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="dashboard">
      <h1>Mapa de Ubicaciones</h1>

      <div className="dashboard-content">
        <MapaUbicaciones parcelas={parcelas} />

        <div className="dashboard-widgets">
          <TemperaturaCard temperatura={promedios.temperatura} />
          <HumedadCard humedad={promedios.humedad} />
          <LluviaCard lluvia={promedios.lluvia} />
          <IntensidadSolCard intensidadSol={promedios.intensidadSol} />
        </div>
      </div>

      <div className="parcelas-list">
        <h2>Listado de Parcelas</h2>
        <div className="parcelas-grid">
          {parcelas.map((parcela) => (
            <ParcelaCard key={parcela.id} parcela={parcela} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

