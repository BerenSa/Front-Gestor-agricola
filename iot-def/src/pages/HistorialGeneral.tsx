"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Thermometer, Droplets, Cloud, Sun, Search } from "lucide-react"
import { fetchHistorialGeneral } from "../services/api"
import type { HistorialItem } from "../types"
import "../styles/HistorialGeneral.css"

function HistorialGeneral() {
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [filteredHistorial, setFilteredHistorial] = useState<HistorialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    const loadHistorial = async () => {
      try {
        setLoading(true)
        const data = await fetchHistorialGeneral()
        setHistorial(data)
        setFilteredHistorial(data)
      } catch (err) {
        console.error("Error al cargar historial:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadHistorial()
  }, [])

  useEffect(() => {
    // Filtrar historial basado en búsqueda y fecha
    let filtered = historial

    if (searchTerm) {
      filtered = filtered.filter((item) => item.parcelaNombre.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.fecha)
        return (
          itemDate.getFullYear() === filterDate.getFullYear() &&
          itemDate.getMonth() === filterDate.getMonth() &&
          itemDate.getDate() === filterDate.getDate()
        )
      })
    }

    setFilteredHistorial(filtered)
  }, [searchTerm, dateFilter, historial])

  if (loading) {
    return <div className="loading">Cargando datos...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="historial-general">
      <h1>Historial General</h1>

      <div className="filtros">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre de parcela..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="date-filter">
          <label htmlFor="date-filter">Filtrar por fecha:</label>
          <input type="date" id="date-filter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>

        {(searchTerm || dateFilter) && (
          <button
            className="clear-filters"
            onClick={() => {
              setSearchTerm("")
              setDateFilter("")
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filteredHistorial.length > 0 ? (
        <div className="historial-table-container">
          <table className="historial-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Parcela</th>
                <th>Temperatura</th>
                <th>Humedad</th>
                <th>Lluvia</th>
                <th>Intensidad Sol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistorial.map((item) => (
                <tr key={item.id}>
                  <td>
                    {new Date(item.fecha).toLocaleDateString()} {new Date(item.fecha).toLocaleTimeString()}
                  </td>
                  <td>{item.parcelaNombre}</td>
                  <td>
                    <Thermometer size={16} className="icon" />
                    {item.temperatura}°C
                  </td>
                  <td>
                    <Droplets size={16} className="icon" />
                    {item.humedad}%
                  </td>
                  <td>
                    <Cloud size={16} className="icon" />
                    {item.lluvia ? "Sí" : "No"}
                  </td>
                  <td>
                    <Sun size={16} className="icon" />
                    {item.intensidadSol}
                  </td>
                  <td>
                    <Link to={`/parcela/${item.parcelaId}`} className="action-link">
                      Ver parcela
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">No se encontraron registros que coincidan con los filtros aplicados</div>
      )}
    </div>
  )
}

export default HistorialGeneral

