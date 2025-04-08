"use client"

import { useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import type { Parcela } from "../../types"
import "mapbox-gl/dist/mapbox-gl.css"
import "../../styles/Dashboard.css"

// Configurar token de Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoiZGF2aWRzaXN4IiwiYSI6ImNtNGdoNjkzMzFsODgyaXBzbXQxdHdjdXcifQ.cbBB4nPaDF9XmhdD-Hdolw"

interface MapaUbicacionesProps {
  parcelas: Parcela[]
  zoom?: number // Optional zoom level
  center?: [number, number] // Optional center coordinates
}

function MapaUbicaciones({ parcelas, zoom = 12, center = [-86.865825, 21.069046] }: MapaUbicacionesProps) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null)

  useEffect(() => {
    const mapContainer = document.getElementById("mapa-ubicaciones")
    if (!mapContainer) return

    // Inicializar mapa
    const newMap = new mapboxgl.Map({
      container: "mapa-ubicaciones",
      style: "mapbox://styles/mapbox/streets-v11",
      center, // Use the provided center
      zoom, // Use the provided zoom level
    })

    newMap.addControl(new mapboxgl.NavigationControl())

    if (parcelas.length > 0) {
      newMap.on("load", () => {
        parcelas.forEach((parcela) => {
          if (parcela.is_deleted === 1) return

          // Debug log for popup content
          console.log(`Creating marker for parcela: ${parcela.nombre}, Popup Content: ${parcela.popupContent}`)

          // Ensure popupContent is valid
          const popupContent = parcela.popupContent || "<p>No content available</p>"
          const popup = new mapboxgl.Popup().setHTML(popupContent)

          // Use parcela.color if available, otherwise default to red
          new mapboxgl.Marker({ color: parcela.color || "#e53935" })
            .setLngLat([Number.parseFloat(parcela.longitud), Number.parseFloat(parcela.latitud)])
            .setPopup(popup) // Attach popup to marker
            .addTo(newMap)
        })
      })
    }

    setMap(newMap)

    return () => {
      newMap.remove()
    }
  }, [parcelas, zoom, center]) // Add zoom and center to dependencies

  return (
    <div
      id="mapa-ubicaciones"
      className="map-container"
      style={{ width: "100%", height: "400px" }} // Ensure container has dimensions
    ></div>
  )
}

export default MapaUbicaciones

