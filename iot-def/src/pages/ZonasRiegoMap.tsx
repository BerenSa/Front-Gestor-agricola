"use client"

import React, { useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import { fetchZonasRiego } from "../services/api"
import "mapbox-gl/dist/mapbox-gl.css"

// Configurar token de Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoiZGF2aWRzaXN4IiwiYSI6ImNtNGdoNjkzMzFsODgyaXBzbXQxdHdjdXcifQ.cbBB4nPaDF9XmhdD-Hdolw"

// Define colors for different states
const stateColors: Record<string, string> = {
  activo: "#4caf50",
  inactivo: "#f44336",
  mantenimiento: "#ff9800",
  "fuera de servicio": "#9c27b0",
}

const ZonasRiegoMap: React.FC = () => {
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
    fetchData()
  }, [])

  useEffect(() => {
    const mapContainer = document.getElementById("zonas-riego-map")
    if (!mapContainer) return

    // Inicializar mapa
    const newMap = new mapboxgl.Map({
      container: "zonas-riego-map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-86.865825, 21.069046], // Coordenadas por defecto
      zoom: 3, 
    })

    // Agregar controles de navegación
    newMap.addControl(new mapboxgl.NavigationControl())

    setMap(newMap)

    return () => {
      newMap.remove()
    }
  }, [])

  useEffect(() => {
    if (!map || zonasRiego.length === 0) return

    zonasRiego.forEach((zona) => {
      // Validar coordenadas
      const longitud = Number.parseFloat(zona.longuitud)
      const latitud = Number.parseFloat(zona.latitud)
      if (isNaN(longitud) || isNaN(latitud)) {
        console.warn(`Zona con coordenadas inválidas: ${zona.nombre}`, zona)
        return
      }

      // Crear elemento HTML para el popup
      const popupContent = document.createElement("div")
      popupContent.innerHTML = `
        <strong>Nombre:</strong> ${zona.nombre} <br />
        <strong>Tipo de Riego:</strong> ${zona.tipo_riego} <br />
        <strong>Estado:</strong> ${zona.estado} <br />
        <strong>Fecha:</strong> ${zona.fecha} <br />
        <strong>Ubicación:</strong> ${zona.latitud}, ${zona.longuitud}
      `

      // Crear marcador con popup
      new mapboxgl.Marker({ color: stateColors[zona.estado] || "#2196f3" })
        .setLngLat([longitud, latitud])
        .setPopup(new mapboxgl.Popup().setDOMContent(popupContent))
        .addTo(map)
    })
  }, [map, zonasRiego])

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <h1>Zonas de Riego</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div id="zonas-riego-map" style={{ height: "90%", width: "100%" }}></div>

      {/* List of irrigation zones in maintenance or out of service */}
      <div style={{ padding: "1rem", backgroundColor: "#f9f9f9" }}>
        <h2>Zonas en Mantenimiento o Fuera de Servicio</h2>
        {zonasRiego
          .filter((zona) =>
            ["mantenimiento", "descompuesto", "fuera de servicio"].includes(zona.estado.toLowerCase())
          )
          .map((zona) => (
            <div key={zona.id} style={{ marginBottom: "1rem", padding: "0.5rem", border: "1px solid #ccc" }}>
              <strong>Nombre:</strong> {zona.nombre} <br />
              <strong>Estado:</strong>{" "}
              <span
                style={{
                  color:
                    zona.estado.toLowerCase() === "descompuesto"
                      ? "#ff5722"
                      : zona.estado.toLowerCase() === "fuera de servicio"
                      ? "#9c27b0"
                      : "#ff9800",
                  fontWeight: "bold",
                }}
              >
                {zona.estado}
              </span>{" "}
              <br />
              <strong>Motivo:</strong> {zona.motivo || "No especificado"} <br />
            </div>
          ))}
        {zonasRiego.filter((zona) =>
          ["mantenimiento", "descompuesto", "fuera de servicio"].includes(zona.estado.toLowerCase())
        ).length === 0 && <p>No hay zonas en mantenimiento, descompuestas o fuera de servicio.</p>}
      </div>
    </div>
  )
}

export default ZonasRiegoMap
