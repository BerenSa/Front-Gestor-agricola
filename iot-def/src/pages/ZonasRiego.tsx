"use client"

import React, { useEffect, useState } from "react"
import { fetchZonasRiego, fetchZonasRiegoByEstado } from "../services/api"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import MapaUbicaciones from "../components/dashboard/MapaUbicaciones"
import "../styles/Dashboard.css"
import "../styles/ZonasRiego.css"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

const ZonasRiego: React.FC = () => {
  const [zonasRiego, setZonasRiego] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [zonasPorEstado, setZonasPorEstado] = useState<Record<string, number>>({})
  const [selectedEstado, setSelectedEstado] = useState<string>("todos")
  const [filteredZonas, setFilteredZonas] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Status card color mapping
  const statusColors = {
    encendido: "#4caf50",
    apagado: "#f44336",
    mantenimiento: "#ff9800",
    descompuesto: "#ff5722",
    fuera_de_servicio: "#9c27b0"
  };

  // Status labels mapping for better readability
  const statusLabels = {
    encendido: "Encendido",
    apagado: "Apagado",
    mantenimiento: "Mantenimiento",
    descompuesto: "Descompuesto",
    fuera_de_servicio: "Fuera de servicio"
  };

  // Function to fetch data
  const fetchData = async (showRefreshing = true) => {
    if (showRefreshing) setIsRefreshing(true)
    try {
      // Use fetchZonasRiego to get all zones, not just functioning ones
      const zonas = await fetchZonasRiego()
      
      // Add fade-in animation by applying class changes
      setZonasRiego(zonas)
      setFilteredZonas(zonas)
      
      // Calculate zones by status
      const counts: Record<string, number> = {}
      zonas.forEach(zona => {
        const estadoLower = zona.estado.toLowerCase();
        counts[estadoLower] = (counts[estadoLower] || 0) + 1;
      });
      setZonasPorEstado(counts)
      
      // Set last updated time
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error("Error fetching zonas de riego:", err)
      setError("No se pudieron cargar las zonas de riego. Intente nuevamente más tarde.")
    } finally {
      setLoading(false)
      if (showRefreshing) {
        setTimeout(() => setIsRefreshing(false), 500) // Clear refreshing state after a short delay for visual feedback
      }
    }
  }

  useEffect(() => {
    fetchData(false)
    
    // Update every 60 seconds (60000ms) instead of 10 seconds
    const intervalId = setInterval(() => fetchData(true), 60000)

    return () => clearInterval(intervalId)
  }, [])

  // Handle manual refresh
  const handleManualRefresh = () => {
    fetchData(true)
  }

  useEffect(() => {
    if (selectedEstado === "todos") {
      setFilteredZonas(zonasRiego)
    } else {
      setFilteredZonas(zonasRiego.filter(zona => zona.estado.toLowerCase() === selectedEstado))
    }
  }, [selectedEstado, zonasRiego])

  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Nunca";
    
    return lastUpdated.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get total count of zonas
  const totalZonas = Object.values(zonasPorEstado).reduce((sum, count) => sum + count, 0)

  // Prepare data for the doughnut chart
  const chartData = {
    labels: Object.values(statusLabels),
    datasets: [
      {
        data: Object.keys(statusLabels).map(key => zonasPorEstado[key] || 0),
        backgroundColor: Object.keys(statusLabels).map(key => statusColors[key as keyof typeof statusColors]),
        hoverBackgroundColor: Object.keys(statusLabels).map(key => {
          const color = statusColors[key as keyof typeof statusColors];
          // Create slightly lighter version for hover effect
          return color.replace(/[0-9a-f]{2}$/i, 'bb');
        }),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false, // Hide default legend, we'll use custom interactive one
        position: 'right' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 6,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = totalZonas > 0 ? Math.round((value / totalZonas) * 100) : 0;
            return `${label}: ${value} zonas (${percentage}% del total)`;
          }
        }
      },
      datalabels: {
        display: false  // We'll use the tooltip instead for clarity
      }
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true
    },
    maintainAspectRatio: false,
    responsive: true,
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const estado = Object.keys(statusLabels)[index];
        handleEstadoClick(estado);
      }
    }
  };

  const handleEstadoClick = (estado: string) => {
    setSelectedEstado(estado === selectedEstado ? "todos" : estado);
  };

  return (
    <div className={`dashboard-container ${isRefreshing ? 'refreshing' : ''}`}>
      <div className="page-header">
        <h1 className="page-title">Panel de Zonas de Riego</h1>
        <div className="refresh-controls">
          <span className="last-updated">
            Última actualización: {formatLastUpdated()}
          </span>
          <button 
            onClick={handleManualRefresh} 
            className="refresh-button"
            disabled={isRefreshing || loading}
          >
            {isRefreshing ? 'Actualizando...' : 'Actualizar datos'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleManualRefresh} className="refresh-button">
            Reintentar
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="loading-indicator">Cargando información de zonas de riego...</div>
      ) : (
        <>
          <div className="stats-summary">
            <div className="stat-card total">
              <div className="stat-icon">🌱</div>
              <div className="stat-info">
                <h3>Total Zonas</h3>
                <p className="stat-value">{totalZonas}</p>
              </div>
            </div>
            
            {Object.entries(statusColors).map(([estado, color]) => (
              <div 
                key={estado}
                className={`stat-card ${selectedEstado === estado ? 'selected' : ''}`}
                onClick={() => handleEstadoClick(estado)}
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <div className="stat-info">
                  <h3>{estado.replace("_", " ").charAt(0).toUpperCase() + estado.replace("_", " ").slice(1)}</h3>
                  <p className="stat-value">{zonasPorEstado[estado] || 0}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="filter-controls">
            <label htmlFor="estado-filter">Filtrar por estado: </label>
            <select 
              id="estado-filter" 
              value={selectedEstado} 
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="encendido">Encendido</option>
              <option value="apagado">Apagado</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="descompuesto">Descompuesto</option>
              <option value="fuera_de_servicio">Fuera de servicio</option>
            </select>
          </div>

          <div className="dashboard-content">
            <div className="map-section">
              <div className="section-header">
                <h2>Mapa de Zonas de Riego</h2>
                {selectedEstado !== "todos" && (
                  <span className="filter-badge">
                    Filtrando: {selectedEstado.charAt(0).toUpperCase() + selectedEstado.slice(1).replace("_", " ")}
                  </span>
                )}
              </div>
              
              {filteredZonas.length === 0 ? (
                <div className="empty-state">
                  <p>No hay zonas de riego que coincidan con el filtro seleccionado</p>
                </div>
              ) : (
                <MapaUbicaciones
                  parcelas={filteredZonas.map((zona) => {
                    const estadoLower = zona.estado.toLowerCase();
                    let markerColor;
                    
                    // Use AI-managed colors for "encendido" status, our defined colors for others
                    if (estadoLower === "encendido" && zona.color) {
                      markerColor = zona.color; // Use the AI-assigned color for "encendido"
                    } else {
                      markerColor = statusColors[estadoLower as keyof typeof statusColors] || "#000";
                    }
                    
                    return {
                      id: zona.id,
                      nombre: zona.nombre,
                      longitud: zona.longitud,
                      latitud: zona.latitud,
                      is_deleted: 0,
                      color: markerColor, // Apply the marker color based on status
                      popupContent: `
                        <div class="map-popup">
                          <h3>${zona.nombre}</h3>
                          <div class="popup-details">
                            <p><strong>Sector:</strong> ${zona.sector}</p>
                            <p><strong>Tipo de Riego:</strong> ${zona.tipo_riego}</p>
                            <p><strong>Estado:</strong> <span class="status-badge" style="background-color:${markerColor};">${zona.estado}</span></p>
                            <p><strong>Actualización:</strong> ${zona.fecha}</p>
                          </div>
                        </div>
                      `,
                    };
                  })}
                  zoom={15}
                  center={
                    filteredZonas.length > 0
                      ? [Number(filteredZonas[0].longitud), Number(filteredZonas[0].latitud)]
                      : [-86.865825, 21.069046]
                  }
                />
              )}
            </div>

            <div className="chart-section">
              <h2>Distribución por Estado</h2>
              <div className="chart-container">
                <Doughnut data={chartData} options={chartOptions} />
                {totalZonas === 0 && (
                  <div className="no-data-overlay">
                    <p>No hay datos disponibles</p>
                  </div>
                )}
                {totalZonas > 0 && (
                  <div className="chart-center-info">
                    <div className="total-number">{totalZonas}</div>
                    <div className="total-label">Total Zonas</div>
                  </div>
                )}
              </div>
              
              <div className="chart-legend-interactive" aria-label="Leyenda de estados de zonas de riego">
                {Object.entries(statusLabels).map(([estado, label]) => {
                  const count = zonasPorEstado[estado] || 0;
                  const percentage = totalZonas > 0 ? Math.round((count / totalZonas) * 100) : 0;
                  
                  return (
                    <div 
                      key={estado} 
                      className={`legend-item ${selectedEstado === estado ? 'selected' : ''}`}
                      onClick={() => handleEstadoClick(estado)}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedEstado === estado}
                      aria-label={`Filtrar por ${label}: ${count} zonas (${percentage}%)`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleEstadoClick(estado);
                          e.preventDefault();
                        }
                      }}
                    >
                      <div className="legend-color" style={{ backgroundColor: statusColors[estado as keyof typeof statusColors] }}></div>
                      <div className="legend-info">
                        <div className="legend-label">{label}</div>
                        <div className="legend-stats">
                          <span className="legend-count">{count}</span>
                          <span className="legend-percentage">{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ZonasRiego;
