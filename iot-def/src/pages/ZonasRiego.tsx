"use client"

import React, { useEffect, useState } from "react"
import { fetchZonasRiegoFuncionando, fetchZonasRiegoByEstado } from "../services/api"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import MapaUbicaciones from "../components/dashboard/MapaUbicaciones"
import "../styles/Dashboard.css"
import "../styles/ZonasRiego.css"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

const ZonasRiego: React.FC = () => {
  const [zonasRiego, setZonasRiego] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [zonasPorEstado, setZonasPorEstado] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const funcionando = await fetchZonasRiegoFuncionando()
        setZonasRiego(funcionando)
      } catch (err) {
        console.error("Error fetching zonas de riego:", err)
        setError("No se pudieron cargar las zonas de riego.")
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 10000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const fetchZonasPorEstado = async () => {
      try {
        const estados = ["mantenimiento", "descompuesto", "fuera_de_servicio", "encendido", "apagado"]
        const counts: Record<string, number> = {}

        for (const estado of estados) {
          const zonas = await fetchZonasRiegoByEstado(estado)
          counts[estado] = zonas.length
        }

        setZonasPorEstado(counts)
      } catch (err) {
        console.error("Error fetching zonas por estado:", err)
      }
    }

    fetchZonasPorEstado()
  }, [])

  // Prepare data for the pie chart
  const pieChartData = {
    labels: ["Encendido", "Apagado", "Mantenimiento", "Descompuesto", "Fuera de servicio"],
    datasets: [
      {
        data: [
          zonasPorEstado["encendido"] || 0,
          zonasPorEstado["apagado"] || 0, // Ensure "apagado" is accessed in lowercase
          zonasPorEstado["mantenimiento"] || 0,
          zonasPorEstado["descompuesto"] || 0,
          zonasPorEstado["fuera_de_servicio"] || 0,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800", "#ff5722", "#9c27b0"],
        hoverBackgroundColor: ["#66bb6a", "#e57373", "#ffb74d", "#ff7043", "#ba68c8"],
      },
    ],
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="map-section">
          <h2>Mapa de Zonas de Riego</h2>
          {/* Use MapaUbicaciones component */}
          <MapaUbicaciones
            parcelas={zonasRiego.map((zona) => ({
              id: zona.id,
              nombre: zona.nombre,
              longitud: zona.longitud,
              latitud: zona.latitud,
              is_deleted: 0, // Ensure all zones are displayed
              color: zona.color || "#000", // Use the color property or fallback to black
              popupContent: `
                <div style="padding: 10px; max-width: 250px;">
                  <strong style="font-size: 16px; color: #2196f3;">${zona.nombre}</strong>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 8px 0;" />
                  <p style="margin: 0;">
                    <strong>Sector:</strong> ${zona.sector} <br />
                    <strong>Tipo de Riego:</strong> ${zona.tipo_riego} <br />
                    <strong>Estado Actual:</strong> <span style="color: ${zona.color || "#000"};">${zona.estado}</span> <br />
                    <strong>Fecha de Actualización:</strong> ${zona.fecha} <br />
                  </p>
                </div>
              `,
            }))}
            zoom={15} // Set zoom level
            center={
              zonasRiego.length > 0
                ? [Number(zonasRiego[0].longitud), Number(zonasRiego[0].latitud)] // Center near the first marker
                : [-86.865825, 21.069046] // Default center
            }
          />
        </div>

        {/* Pie Chart Section */}
        <div style={{ flex: 1, backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "1rem" }}>
          <h2>Distribución por Estado</h2>
          <Pie data={pieChartData} />
        </div>
      </div>
    </div>
  )
}

export default ZonasRiego
