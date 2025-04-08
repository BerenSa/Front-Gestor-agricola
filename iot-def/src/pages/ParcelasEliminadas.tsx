"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { fetchParcelasEliminadas } from "../services/api"
import type { ParcelaEliminada } from "../types"
import ParcelasEliminadasCard from "../components/parcela/ParcelasEliminadasCard"
import "../styles/ParcelasEliminadas.css"

function ParcelasEliminadas() {
  const [parcelas, setParcelas] = useState<ParcelaEliminada[]>([])
  const [filteredParcelas, setFilteredParcelas] = useState<ParcelaEliminada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadParcelas = async () => {
      try {
        const data = await fetchParcelasEliminadas()
        const validData = data.filter((parcela) => parcela && parcela.nombre)
        setParcelas(validData)
        setFilteredParcelas(validData)
        if (validData.length === 0) {
          setError("No se encontraron parcelas eliminadas.")
        }
      } catch (err) {
        console.error("Error al cargar parcelas eliminadas:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    // Fetch data initially
    loadParcelas()

    // Set up polling for real-time updates
    const intervalId = setInterval(loadParcelas, 10000) // Update every 10 seconds

    return () => clearInterval(intervalId) // Cleanup on unmount
  }, [])

  useEffect(() => {
    // Filtrar parcelas basado en búsqueda
    if (searchTerm && parcelas.length > 0) {
      const filtered = parcelas.filter(
        (parcela) => parcela.nombre && parcela.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredParcelas(filtered)
    } else {
      setFilteredParcelas(parcelas)
    }
  }, [searchTerm, parcelas])

  if (loading) {
    return <div className="loading">Cargando datos...</div>
  }

  return (
    <div className="parcelas-eliminadas">
      <h1>Parcelas Eliminadas</h1>

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

      {error ? (
        <div className="error-message">{error}</div>
      ) : filteredParcelas.length > 0 ? (
        <div className="parcelas-grid">
          {filteredParcelas.map((parcela) => (
            <ParcelasEliminadasCard key={parcela.id} parcela={parcela} />
          ))}
        </div>
      ) : (
        <div className="no-data">No se encontraron parcelas eliminadas</div>
      )}
    </div>
  )
}

export default ParcelasEliminadas

