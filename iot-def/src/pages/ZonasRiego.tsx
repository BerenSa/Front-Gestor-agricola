"use client"

import React, { useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import { fetchZonasRiegoFuncionando, fetchZonasRiegoNoFuncionando, fetchZonasRiegoByEstado } from "../services/api"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import "mapbox-gl/dist/mapbox-gl.css"
import "../styles/Dashboard.css"
import "../styles/ZonasRiego.css"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

// Configurar token de Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoiZGF2aWRzaXN4IiwiYSI6ImNtNGdoNjkzMzFsODgyaXBzbXQxdHdjdXcifQ.cbBB4nPaDF9XmhdD-Hdolw"

// Define colors for different states
const stateColors: Record<string, string> = {
  activo: "#4caf50",
  inactivo: "#f44336",
  mantenimiento: "#ff9800",
}

const ZonasRiego: React.FC = () => {
  const [zonasRiego, setZonasRiego] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
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
        const estados = ["mantenimiento", "descompuesto", "fuera_de_servicio", "encendido"]
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

  useEffect(() => {
    const mapContainer = document.getElementById("zonas-riego-map")
    if (!mapContainer) return

    const newMap = new mapboxgl.Map({
      container: "zonas-riego-map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-86.84654829666589, 21.049696912777954],
      zoom: 16,
    })

    newMap.addControl(new mapboxgl.NavigationControl())
    setMap(newMap)

    return () => {
      newMap.remove()
    }
  }, [])

  useEffect(() => {
    if (!map || zonasRiego.length === 0) return

    zonasRiego.forEach((zona) => {
      const lat = parseFloat(zona.latitud)
      const lng = parseFloat(zona.longitud)

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid coordinates for zona: ${zona.nombre}`, { lat, lng })
        return
      }

      const markerColor = zona.color || "#000"

      // Use the default Mapbox marker
      const popup = new mapboxgl.Popup().setHTML(`
        <div style="padding: 10px; max-width: 250px;">
          <strong style="font-size: 16px; color: #2196f3;">${zona.nombre}</strong>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 8px 0;" />
          <p style="margin: 0;">
            <strong>Sector:</strong> ${zona.sector} <br />
            <strong>Tipo de Riego:</strong> ${zona.tipo_riego} <br />
            <strong>Estado Actual:</strong> <span style="color: ${markerColor};">${zona.estado}</span> <br />
            <strong>Fecha de Actualización:</strong> ${zona.fecha} <br />
          </p>
        </div>
      `);

      new mapboxgl.Marker({ color: markerColor })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
    })
  }, [map, zonasRiego])

  // Prepare data for the pie chart
  const pieChartData = {
    labels: ["Encendido", "Apagado", "Mantenimiento", "Descompuesto", "Fuera de servicio"],
    datasets: [
      {
        data: [
          zonasPorEstado["encendido"] || 0,
          zonasPorEstado["apagado"] || 0,
          zonasPorEstado["mantenimiento"] || 0,
          zonasPorEstado["descompuesto"] || 0,
          zonasPorEstado["fuera_de_servicio"] || 0,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800", "#ff5722", "#9c27b0"], // Updated "Descompuesto" to orange-red
        hoverBackgroundColor: ["#66bb6a", "#e57373", "#ffb74d", "#ff7043", "#ba68c8"], // Updated hover color for orange-red
      },
    ],
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="map-section">
          <h2>Mapa de Zonas de Riego</h2>
          <div id="zonas-riego-map" className="map-container"></div>
        </div>

        {/* Pie Chart Section */}
        <div style={{ flex: 1, backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "1rem" }}>
          <h2>Distribución por Estado</h2>
          <Pie data={pieChartData} />
        </div>
      </div>

      {/* List of irrigation zones not functioning */}
      <div style={{ marginTop: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "1rem" }}>
      </div>
    </div>
  )
}

export default ZonasRiego
