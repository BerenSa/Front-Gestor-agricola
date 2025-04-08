import type { Parcela, HistorialItem, ParcelaEliminada } from "../types"

const API_URL = "http://localhost:3001/api"

// Función para manejar errores de fetch
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `Error: ${response.status}`)
  }
  return response.json()
}

// Obtener todas las parcelas
export const fetchParcelas = async (): Promise<Parcela[]> => {
  try {
    const response = await fetch(`${API_URL}/dump`)
    const data = await handleResponse(response)

    // Obtener el último registro histórico para cada parcela
    const parcelas = data.parcelas.map((parcela: any) => {
      // Buscar el último registro histórico para esta parcela
      const ultimoRegistro = data.historico
        .filter((h: any) => h.parcela_id.toString() === parcela.id.toString())
        .sort((a: any, b: any) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())[0]

      return {
        id: parcela.id.toString(),
        nombre: parcela.nombre,
        ubicacion: parcela.ubicacion,
        responsable: parcela.responsable,
        tipo_cultivo: parcela.tipo_cultivo,
        ultimo_riego: parcela.ultimo_riego,
        latitud: parcela.latitud,
        longitud: parcela.longitud,
        is_deleted: parcela.is_deleted,
        // Agregar datos del último registro
        temperatura: ultimoRegistro ? Number.parseFloat(ultimoRegistro.temperatura) : 0,
        humedad: ultimoRegistro ? Number.parseFloat(ultimoRegistro.humedad) : 0,
        lluvia: ultimoRegistro ? Number.parseFloat(ultimoRegistro.lluvia) : 0, // Guardar el valor numérico
        intensidadSol: ultimoRegistro ? Number.parseFloat(ultimoRegistro.sol) : 0,
      }
    })

    return parcelas || []
  } catch (error) {
    console.error("Error fetching parcelas:", error)
    throw error
  }
}

// Obtener una parcela por ID
export const fetchParcelaById = async (id: string): Promise<Parcela> => {
  try {
    const response = await fetch(`${API_URL}/dump`)
    const data = await handleResponse(response)

    const parcela = data.parcelas.find((p: any) => p.id.toString() === id.toString())

    if (!parcela) {
      throw new Error("Parcela no encontrada")
    }

    // Buscar el último registro histórico para esta parcela
    const ultimoRegistro = data.historico
      .filter((h: any) => h.parcela_id.toString() === parcela.id.toString())
      .sort((a: any, b: any) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())[0]

    return {
      id: parcela.id.toString(),
      nombre: parcela.nombre,
      ubicacion: parcela.ubicacion,
      responsable: parcela.responsable,
      tipo_cultivo: parcela.tipo_cultivo,
      ultimo_riego: parcela.ultimo_riego,
      latitud: parcela.latitud,
      longitud: parcela.longitud,
      is_deleted: parcela.is_deleted,
      // Agregar datos del último registro
      temperatura: ultimoRegistro ? Number.parseFloat(ultimoRegistro.temperatura) : 0,
      humedad: ultimoRegistro ? Number.parseFloat(ultimoRegistro.humedad) : 0,
      lluvia: ultimoRegistro ? Number.parseFloat(ultimoRegistro.lluvia) : 0, // Guardar el valor numérico
      intensidadSol: ultimoRegistro ? Number.parseFloat(ultimoRegistro.sol) : 0,
    }
  } catch (error) {
    console.error(`Error fetching parcela ${id}:`, error)
    throw error
  }
}

// Obtener historial de una parcela
export const fetchHistorialParcela = async (id: string): Promise<HistorialItem[]> => {
  try {
    const response = await fetch(`${API_URL}/dump`)
    const data = await handleResponse(response)

    // Filtrar el historial por ID de parcela
    const historial = data.historico?.filter((item: any) => item.parcela_id.toString() === id.toString()) || []

    // Mapear los datos al formato esperado
    return historial
      .map((item: any) => ({
        id: item.id.toString(),
        parcelaId: item.parcela_id.toString(),
        parcelaNombre: data.parcelas.find((p: any) => p.id.toString() === item.parcela_id.toString())?.nombre || "",
        fecha: item.fecha_registro,
        temperatura: Number.parseFloat(item.temperatura),
        humedad: Number.parseFloat(item.humedad),
        lluvia: Number.parseFloat(item.lluvia), // Guardar el valor numérico
        intensidadSol: Number.parseFloat(item.sol),
      }))
      .sort((a: HistorialItem, b: HistorialItem) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  } catch (error) {
    console.error(`Error fetching historial for parcela ${id}:`, error)
    throw error
  }
}

// Obtener historial general de todas las parcelas
export const fetchHistorialGeneral = async (): Promise<HistorialItem[]> => {
  try {
    const response = await fetch(`${API_URL}/dump`)
    const data = await handleResponse(response)

    // Mapear los datos al formato esperado
    return (data.historico || [])
      .map((item: any) => {
        const parcela = data.parcelas.find((p: any) => p.id.toString() === item.parcela_id.toString())
        return {
          id: item.id.toString(),
          parcelaId: item.parcela_id.toString(),
          parcelaNombre: parcela?.nombre || "",
          fecha: item.fecha_registro,
          temperatura: Number.parseFloat(item.temperatura),
          humedad: Number.parseFloat(item.humedad),
          lluvia: Number.parseFloat(item.lluvia), // Guardar el valor numérico
          intensidadSol: Number.parseFloat(item.sol),
        }
      })
      .sort((a: HistorialItem, b: HistorialItem) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  } catch (error) {
    console.error("Error fetching historial general:", error)
    throw error
  }
}

// Obtener parcelas eliminadas
export const fetchParcelasEliminadas = async (): Promise<ParcelaEliminada[]> => {
  try {
    const response = await fetch(`${API_URL}/dump`)
    const data = await handleResponse(response)

    // Filtrar parcelas eliminadas (is_deleted = 1)
    const parcelasEliminadas = data.parcelas
      .filter((p: any) => p.is_deleted === 1)
      .map((parcela: any) => {
        // Buscar el último registro histórico para esta parcela
        const ultimoRegistro = data.historico
          .filter((h: any) => h.parcela_id.toString() === parcela.id.toString())
          .sort((a: any, b: any) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())[0]

        return {
          id: parcela.id.toString(),
          nombre: parcela.nombre,
          latitud: parcela.latitud,
          longitud: parcela.longitud,
          ultimaTemperatura: ultimoRegistro ? Number.parseFloat(ultimoRegistro.temperatura) : 0,
          ultimaHumedad: ultimoRegistro ? Number.parseFloat(ultimoRegistro.humedad) : 0,
          fechaEliminacion: parcela.ultimo_riego || new Date().toISOString(),
          responsable: parcela.responsable,
          ultimoRiego: parcela.ultimo_riego || new Date().toISOString(),
        }
      })

    return parcelasEliminadas
  } catch (error) {
    console.error("Error fetching parcelas eliminadas:", error)
    throw error
  }
}

// Helper function to format estado
const formatEstado = (estado: string): string => {
  return estado
    .replace(/_/g, " ") // Replace underscores with spaces
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize the first letter
}

// Helper function to format dates
const formatFecha = (fecha: string | null): string => {
  if (!fecha || fecha === "No disponible") return "No disponible"
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(fecha))
}

// Obtener todas las zonas de riego
export const fetchZonasRiego = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/zonas-riego`)
    const data = await handleResponse(response)

    // Format the response to ensure consistent structure
    return data.map((zona: any) => ({
      id: zona.id,
      sector: zona.sector || "No especificado",
      nombre: zona.nombre,
      tipo_riego: zona.tipo_riego,
      estado: formatEstado(zona.estado), // Format estado
      fecha: formatFecha(zona.fecha), // Format fecha
      latitud: zona.latitud,
      longitud: zona.longitud,
      color: zona.color || "#2196f3",
    }))
  } catch (error) {
    console.error("Error fetching zonas de riego:", error)
    throw error
  }
}

// Obtener zonas de riego que no están funcionando
export const fetchZonasRiegoNoFuncionando = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/zonas-riego/no-funcionando`)
    const data = await handleResponse(response)

    // Format the response to ensure consistent structure
    return data.map((zona: any) => ({
      id: zona.id,
      sector: zona.sector || "No especificado",
      nombre: zona.nombre,
      tipo_riego: zona.tipo_riego,
      estado: formatEstado(zona.estado), // Format estado
      fecha: formatFecha(zona.fecha), // Format fecha
      latitud: zona.latitud,
      longitud: zona.longitud,
      color: zona.color || "#f44336", // Default color for non-functioning zones
    }))
  } catch (error) {
    console.error("Error fetching zonas de riego no funcionando:", error)
    throw error
  }
}

// Obtener zonas de riego que están funcionando
export const fetchZonasRiegoFuncionando = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/zonas-riego/funcionando`)
    const data = await handleResponse(response)

    // Format the response to ensure consistent structure
    return data.map((zona: any) => ({
      id: zona.id,
      sector: zona.sector || "No especificado",
      nombre: zona.nombre,
      tipo_riego: zona.tipo_riego,
      estado: formatEstado(zona.estado), // Format estado
      fecha: formatFecha(zona.fecha), // Format fecha
      latitud: zona.latitud,
      longitud: zona.longitud,
      color: zona.color || "#4caf50", // Default color for functioning zones
    }))
  } catch (error) {
    console.error("Error fetching zonas de riego funcionando:", error)
    throw error
  }
}

// Obtener zonas de riego por estado
export const fetchZonasRiegoByEstado = async (estado: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/zonas-riego/estado/${estado}`)
    const data = await handleResponse(response)

    // Format the response to ensure consistent structure
    return data.map((zona: any) => ({
      id: zona.id,
      sector: zona.sector || "No especificado",
      nombre: zona.nombre,
      tipo_riego: zona.tipo_riego,
      estado: formatEstado(zona.estado), // Format estado
      fecha: formatFecha(zona.fecha), // Format fecha
      latitud: zona.latitud,
      longitud: zona.longitud,
      color: zona.color || "#2196f3", // Default color
    }))
  } catch (error) {
    console.error(`Error fetching zonas de riego con estado ${estado}:`, error)
    throw error
  }
}

