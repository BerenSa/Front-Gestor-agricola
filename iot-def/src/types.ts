// Tipo para una parcela
export interface Parcela {
  id: string | number
  nombre: string
  ubicacion: string
  responsable: string
  tipo_cultivo: string
  ultimo_riego: string
  latitud: string
  longitud: string
  is_deleted: number
  // Datos del último registro
  temperatura?: number
  humedad?: number
  lluvia?: number | boolean // Puede ser número o booleano
  intensidadSol?: number
}

// Tipo para un elemento del historial
export interface HistorialItem {
  id: string
  parcelaId: string
  parcelaNombre: string
  fecha: string
  temperatura: number
  humedad: number
  lluvia: number // Cambiado de boolean a number
  intensidadSol: number
}

// Tipo para una parcela eliminada
export interface ParcelaEliminada {
  id: string
  nombre: string
  latitud: string
  longitud: string
  ultimaTemperatura: number
  ultimaHumedad: number
  fechaEliminacion: string
  responsable: string
  ultimoRiego: string
}

