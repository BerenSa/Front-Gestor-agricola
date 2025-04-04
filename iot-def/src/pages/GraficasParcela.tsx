"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Line, Bar, Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  type ChartOptions,
} from "chart.js"
import { ArrowLeft } from "lucide-react"
import { fetchParcelaById, fetchHistorialParcela } from "../services/api"
import type { Parcela, HistorialItem } from "../types"
import "../styles/GraficasParcela.css"
import Modal from "../components/Modal"

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
)

// Función para formatear fecha y hora
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
}

// Función para agrupar datos por intervalos de tiempo
const groupDataByTimeInterval = (data: HistorialItem[], intervalMinutes = 30) => {
  const grouped: Record<
    string,
    {
      temperatura: number[]
      humedad: number[]
      lluvia: number[]
      intensidadSol: number[]
      count: number
      timestamp: number
    }
  > = {}

  // Ordenar datos por fecha
  const sortedData = [...data].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  sortedData.forEach((item) => {
    const date = new Date(item.fecha)
    // Redondear al intervalo más cercano
    const minutes = date.getMinutes()
    const roundedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes
    date.setMinutes(roundedMinutes, 0, 0)

    const timeKey = date.toISOString()
    const timestamp = date.getTime()

    if (!grouped[timeKey]) {
      grouped[timeKey] = {
        temperatura: [],
        humedad: [],
        lluvia: [],
        intensidadSol: [],
        count: 0,
        timestamp,
      }
    }

    grouped[timeKey].temperatura.push(item.temperatura)
    grouped[timeKey].humedad.push(item.humedad)
    grouped[timeKey].lluvia.push(item.lluvia)
    grouped[timeKey].intensidadSol.push(item.intensidadSol)
    grouped[timeKey].count++
  })

  return grouped
}

function GraficasParcela() {
  const { id } = useParams<{ id: string }>()
  const [parcela, setParcela] = useState<Parcela | null>(null)
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 días atrás
    end: new Date().toISOString().split("T")[0], // Hoy
  })
  const [timeInterval, setTimeInterval] = useState<number>(30) // Intervalo en minutos
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", content: "" })

  useEffect(() => {
    const loadData = async () => {
      if (!id) return

      try {
        setLoading(true)
        const parcelaData = await fetchParcelaById(id)
        setParcela(parcelaData)

        const historialData = await fetchHistorialParcela(id)
        setHistorial(historialData)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  // Filtrar historial por rango de fechas
  const filteredHistorial = historial.filter((item) => {
    const itemDate = new Date(item.fecha)
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    endDate.setHours(23, 59, 59) // Incluir todo el día final

    return itemDate >= startDate && itemDate <= endDate
  })

  // Agrupar datos por intervalo de tiempo
  const groupedByTime = groupDataByTimeInterval(filteredHistorial, timeInterval)

  // Ordenar las claves por timestamp
  const timeKeys = Object.keys(groupedByTime).sort((a, b) => groupedByTime[a].timestamp - groupedByTime[b].timestamp)

  // Preparar datos para las gráficas
  const labels = timeKeys.map((key) => formatDateTime(key))

  const temperaturaData = timeKeys.map((key) => {
    const sum = groupedByTime[key].temperatura.reduce((a, b) => a + b, 0)
    return Math.round((sum / groupedByTime[key].count) * 10) / 10 // Redondear a 1 decimal
  })

  const humedadData = timeKeys.map((key) => {
    const sum = groupedByTime[key].humedad.reduce((a, b) => a + b, 0)
    return Math.round((sum / groupedByTime[key].count) * 10) / 10 // Redondear a 1 decimal
  })

  const lluviaData = timeKeys.map((key) => {
    const sum = groupedByTime[key].lluvia.reduce((a, b) => a + b, 0)
    return Math.round((sum / groupedByTime[key].count) * 10) / 10 // Redondear a 1 decimal
  })

  const intensidadSolData = timeKeys.map((key) => {
    const sum = groupedByTime[key].intensidadSol.reduce((a, b) => a + b, 0)
    return Math.round((sum / groupedByTime[key].count) * 10) / 10 // Redondear a 1 decimal
  })

  // Configuración de gráficas
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: parcela ? `Datos Históricos de Temperatura - ${parcela.nombre}` : "Datos Históricos de Temperatura",
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return context[0].label
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => value,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 20,
        },
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5,
      },
      line: {
        tension: 0.2,
      },
    },
  }

  // Actualizar las opciones de la gráfica de humedad
  const humedadChartOptions: ChartOptions<"line"> = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      title: {
        display: true,
        text: parcela ? `Datos Históricos de Humedad - ${parcela.nombre}` : "Datos Históricos de Humedad",
      },
    },
  }

  // Actualizar las opciones de la gráfica de lluvia
  const barChartOptions: ChartOptions<"bar"> = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      title: {
        display: true,
        text: parcela
          ? `Registro Histórico de Precipitaciones - ${parcela.nombre}`
          : "Registro Histórico de Precipitaciones",
      },
    },
  }

  // Datos para gráfica de línea - Temperatura
  const temperaturaChartData = {
    labels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: temperaturaData,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.2,
      },
    ],
  }

  // Datos para gráfica de línea - Humedad
  const humedadChartData = {
    labels,
    datasets: [
      {
        label: "Humedad (%)",
        data: humedadData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.2,
      },
    ],
  }

  // Datos para gráfica de barras - Lluvia
  const lluviaChartData = {
    labels,
    datasets: [
      {
        label: "Lluvia (mm)",
        data: lluviaData,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
      },
    ],
  }

  // Datos para gráfica de radar - Comparativa
  const radarChartData = {
    labels: ["Temperatura", "Humedad", "Lluvia", "Intensidad UV"],
    datasets: [
      {
        label: "Valores actuales",
        data: [
          temperaturaData.length > 0 ? temperaturaData[temperaturaData.length - 1] : 0,
          humedadData.length > 0 ? humedadData[humedadData.length - 1] : 0,
          lluviaData.length > 0 ? lluviaData[lluviaData.length - 1] : 0,
          intensidadSolData.length > 0 ? intensidadSolData[intensidadSolData.length - 1] : 0,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
      {
        label: "Valores promedio",
        data: [
          temperaturaData.length > 0 ? temperaturaData.reduce((a, b) => a + b, 0) / temperaturaData.length : 0,
          humedadData.length > 0 ? humedadData.reduce((a, b) => a + b, 0) / humedadData.length : 0,
          lluviaData.length > 0 ? lluviaData.reduce((a, b) => a + b, 0) / lluviaData.length : 0,
          intensidadSolData.length > 0 ? intensidadSolData.reduce((a, b) => a + b, 0) / intensidadSolData.length : 0,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgb(54, 162, 235)",
        pointBackgroundColor: "rgb(54, 162, 235)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(54, 162, 235)",
      },
    ],
  }

  const openHelpModal = (type: string) => {
    let title = ""
    let content = ""

    switch (type) {
      case "temperatura":
        title = "Gráfica de Temperatura"
        content =
          "Esta gráfica muestra la evolución de la temperatura a lo largo del tiempo para esta parcela específica. El eje X representa el tiempo y el eje Y la temperatura en grados Celsius. Los picos indican momentos de mayor temperatura, mientras que los valles representan períodos más frescos. Es útil para identificar patrones y tendencias de temperatura que pueden afectar el desarrollo de los cultivos en esta parcela."
        break
      case "humedad":
        title = "Gráfica de Humedad"
        content =
          "Esta gráfica muestra los niveles de humedad a lo largo del tiempo para esta parcela. El eje X representa el tiempo y el eje Y el porcentaje de humedad. Valores más altos indican mayor humedad en el ambiente o suelo. Monitorear estos niveles es crucial para determinar cuándo es necesario regar los cultivos y para prevenir problemas relacionados con exceso o falta de humedad en esta parcela específica."
        break
      case "lluvia":
        title = "Gráfica de Lluvia"
        content =
          "Esta gráfica de barras muestra la cantidad de precipitación en milímetros durante diferentes períodos para esta parcela. Cada barra representa la cantidad de lluvia en un momento específico. Esta información es vital para planificar actividades agrícolas y para entender los patrones de precipitación que afectan a los cultivos en esta ubicación."
        break
      case "radar":
        title = "Gráfica de Radar Comparativa"
        content =
          "Esta gráfica de radar compara los valores actuales con los valores promedio de temperatura, humedad, lluvia e intensidad UV para esta parcela. Cada eje representa una variable diferente, y las áreas coloreadas muestran la magnitud de cada valor. Es útil para tener una visión general del estado actual de las condiciones ambientales en comparación con los promedios históricos de esta parcela específica."
        break
      default:
        title = "Información de la Gráfica"
        content =
          "Esta gráfica muestra datos importantes para el monitoreo y análisis de las condiciones ambientales que afectan a los cultivos en esta parcela."
    }

    setModalContent({ title, content })
    setModalOpen(true)
  }

  if (loading) {
    return <div className="loading">Cargando datos...</div>
  }

  if (error || !parcela) {
    return <div className="error">{error || "Parcela no encontrada"}</div>
  }

  return (
    <div className="graficas-parcela">
      <div className="graficas-header">
        <Link to={`/parcela/${id}`} className="back-link">
          <ArrowLeft size={20} />
          <span>Volver a la parcela</span>
        </Link>
        <h1>Gráficas - {parcela.nombre}</h1>
      </div>

      <div className="filtros">
        <div className="filtro-fecha">
          <label htmlFor="fecha-inicio">Desde:</label>
          <input
            type="date"
            id="fecha-inicio"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
          />

          <label htmlFor="fecha-fin">Hasta:</label>
          <input
            type="date"
            id="fecha-fin"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
          />
        </div>

        <div className="filtro-intervalo">
          <label htmlFor="intervalo-select">Intervalo:</label>
          <select id="intervalo-select" value={timeInterval} onChange={(e) => setTimeInterval(Number(e.target.value))}>
          <option value="5">5 minutos</option>
            <option value="15">15 minutos</option>
    
            <option value="30">30 minutos</option>
            <option value="60">1 hora</option>
            <option value="120">2 horas</option>
            <option value="360">6 horas</option>
            <option value="720">12 horas</option>
            <option value="1440">24 horas</option>
          </select>
        </div>
      </div>

      {filteredHistorial.length > 0 ? (
        <>
          <div className="graficas-container">
            <div className="grafica">
              <h2>Temperatura</h2>
              <button className="help-button" onClick={() => openHelpModal("temperatura")}>
                ?
              </button>
              <div className="chart-container">
                <Line options={lineChartOptions} data={temperaturaChartData} />
              </div>
            </div>

            <div className="grafica">
              <h2>Humedad</h2>
              <button className="help-button" onClick={() => openHelpModal("humedad")}>
                ?
              </button>
              <div className="chart-container">
                <Line options={humedadChartOptions} data={humedadChartData} />
              </div>
            </div>
          </div>

          <div className="graficas-container">
            <div className="grafica">
              <h2>Lluvia</h2>
              <button className="help-button" onClick={() => openHelpModal("lluvia")}>
                ?
              </button>
              <div className="chart-container">
                <Bar options={barChartOptions} data={lluviaChartData} />
              </div>
            </div>

            <div className="grafica">
              <h2>Comparativa de valores</h2>
              <button className="help-button" onClick={() => openHelpModal("radar")}>
                ?
              </button>
              <div className="chart-container">
                <Radar
                  data={radarChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: `Comparativa de Valores Actuales vs Promedio - ${parcela.nombre}`,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-data">No hay datos disponibles para los filtros seleccionados</div>
      )}

      <div className="historial-completo">
        <h2>Historial Completo</h2>

        {filteredHistorial.length > 0 ? (
          <div className="historial-table-container">
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Temperatura</th>
                  <th>Humedad</th>
                  <th>Lluvia</th>
                  <th>Intensidad Sol</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistorial.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.fecha).toLocaleDateString()} {new Date(item.fecha).toLocaleTimeString()}
                    </td>
                    <td>{item.temperatura}°C</td>
                    <td>{item.humedad}%</td>
                    <td>
                      {item.lluvia} mm {item.lluvia > 5 ? "(Lluvia)" : "(Sin lluvia)"}
                    </td>
                    <td>UV: {item.intensidadSol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">No hay datos disponibles para los filtros seleccionados</div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalContent.title}>
        <p className="modal-description">{modalContent.content}</p>
      </Modal>
    </div>
  )
}

export default GraficasParcela

