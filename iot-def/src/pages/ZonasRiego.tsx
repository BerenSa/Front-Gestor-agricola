"use client"

import React, { useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import { fetchZonasRiego } from "../services/api"
import "mapbox-gl/dist/mapbox-gl.css"
import "../styles/Dashboard.css"
import "../styles/ZonasRiego.css"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchZonasRiego()
        setZonasRiego(data)
      } catch (err) {
        console.error("Error fetching zonas de riego:", err)
        setError("No se pudieron cargar las zonas de riego.")
      }
    }

    // Fetch data initially
    fetchData()

    // Set up polling for real-time updates
    const intervalId = setInterval(fetchData, 10000) // Update every 10 seconds

    return () => clearInterval(intervalId) // Cleanup on unmount
  }, [])

  useEffect(() => {
    const mapContainer = document.getElementById("zonas-riego-map")
    if (!mapContainer) return

    // Inicializar mapa
    const newMap = new mapboxgl.Map({
      container: "zonas-riego-map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-86.84654829666589, 21.049696912777954], // Coorde21.049696912777954, -86.84654829666589nadas por defecto
      zoom: 16, // Set zoom level to 14
    })

    // Agregar controles de navegación
    newMap.addControl(new mapboxgl.NavigationControl())

    setMap(newMap)

    return () => {
      newMap.remove()
    }
  }, [])

  useEffect(() => {
    console.log(zonasRiego)
    if (!map || zonasRiego.length === 0) return
    zonasRiego.forEach((zona) => {
      console.log("Zona object:", zona) // Log the entire zona object for debugging

      // Ensure latitud and longuitud are defined
      const rawLatitud = zona.latitud ?? "undefined"
      const rawLonguitud = zona.longuitud ?? zona.longitud ?? "undefined" // Check for alternative property names

      // Convert latitud and longuitud to float
      const lat = parseFloat(rawLatitud)
      const lng = parseFloat(rawLonguitud)

      // Validate lat and lng
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid coordinates for zona: ${zona.nombre}`, {
          rawLatitud,
          rawLonguitud,
          lat,
          lng,
        })
        return
      }

      // Format the date
      const formattedDate = new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(zona.fecha))

      // Crear elemento HTML para el popup
      const popupContent = document.createElement("div")
      popupContent.innerHTML = `
        <strong>Nombre:</strong> ${zona.nombre} <br />
        <strong>Tipo de Riego:</strong> ${zona.tipo_riego} <br />
        <strong>Estado:</strong> ${zona.estado} <br />
        <strong>Fecha:</strong> ${formattedDate} <br />
      `

      // Use the color provided by the API or fallback to a default color
      const markerColor = zona.color || "#2196f3"

      // Crear marcador con popup
      new mapboxgl.Marker({ color: markerColor })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setDOMContent(popupContent))
        .addTo(map)
    })
  }, [map, zonasRiego])

  // Prepare data for the pie chart
  const pieChartData = {
    labels: ["Encendido", "Apagado", "Mantenimiento", "Descompuesto", "Fuera de Servicio"],
    datasets: [
      {
        data: [
          zonasRiego.filter((zona) => zona.estado?.toLowerCase() === "encendido").length,
          zonasRiego.filter((zona) => zona.estado?.toLowerCase() === "apagado").length,
          zonasRiego.filter((zona) => zona.estado?.toLowerCase() === "mantenimiento").length,
          zonasRiego.filter((zona) => zona.estado?.toLowerCase() === "descompuesto").length,
          zonasRiego.filter((zona) => zona.estado?.toLowerCase() === "fuera de servicio").length,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800", "#ff5722", "#9c27b0"], // Updated "Descompuesto" to orange-red
        hoverBackgroundColor: ["#66bb6a", "#e57373", "#ffb74d", "#ff7043", "#ba68c8"], // Updated hover color for orange-red
      },
    ],
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Zonas de Riego</h1>
      <div style={{ display: "flex", gap: "30px" }}>
        {/* Map Section */}
        <div style={{ flex: 2, backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "1rem" }}>
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
        <h2>Zonas de Riego</h2>
        {zonasRiego
          .filter((zona) => zona.estado?.toLowerCase() !== "encendido")
          .map((zona) => (
            <div
              key={zona.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor:
                  zona.estado.toLowerCase() === "descompuesto"
                    ? "#ffe7ef" // Light orange for "Descompuesto"
                    : zona.estado.toLowerCase() === "fuera de servicio"
                    ? "#ffe7ef" // Light violet for "Fuera de Servicio"
                    : "#ffe7ef",
              }}
            >
              <strong>Nombre:</strong> {zona.nombre} <br />
              <strong>Estado:</strong>{" "}
              <span
                style={{
                  color: "#f50c8c", // Pink color for all states
                  fontWeight: "bold",
                  textTransform: "lowercase", // Ensure lowercase
                }}
              >
                {zona.estado.toLowerCase()}
              </span>{" "}
              <br />
              <strong>Motivo:</strong> {zona.motivo || "No especificado"} <br />
              <strong>Fecha:</strong> {new Intl.DateTimeFormat("es-ES").format(new Date(zona.fecha))} <br />
              <strong>Tipo de Riego:</strong> {zona.tipo_riego} <br />
            </div>
          ))}
        {zonasRiego.filter((zona) => zona.estado?.toLowerCase() !== "encendido").length === 0 && (
          <p>No hay zonas de riego disponibles (excluyendo encendidas).</p>
        )}
      </div>
    </div>
  )
}

export default ZonasRiego
