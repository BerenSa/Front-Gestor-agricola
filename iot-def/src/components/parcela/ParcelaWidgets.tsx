import TemperaturaCard from "../dashboard/TemperaturaCard"
import HumedadCard from "../dashboard/HumedadCard"
import LluviaCard from "../dashboard/LluviaCard"
import IntensidadSolCard from "../dashboard/IntensidadSolCard"
import type { Parcela } from "../../types"
import "../../styles/ParcelaDetail.css"

interface ParcelaWidgetsProps {
  parcela: Parcela
}

function ParcelaWidgets({ parcela }: ParcelaWidgetsProps) {
  return (
    <div className="parcela-widgets">
      <TemperaturaCard temperatura={parcela.temperatura || 0} />
      <HumedadCard humedad={parcela.humedad || 0} />
      <LluviaCard lluvia={parcela.lluvia || false} />
      <IntensidadSolCard intensidadSol={parcela.intensidadSol || 0} />
    </div>
  )
}

export default ParcelaWidgets

