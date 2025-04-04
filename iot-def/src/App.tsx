"use client"

import type React from "react"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ParcelaDetail from "./pages/ParcelaDetail"
import HistorialGeneral from "./pages/HistorialGeneral"
import Graficas from "./pages/Graficas"
import GraficasParcela from "./pages/GraficasParcela"
import ParcelasEliminadas from "./pages/ParcelasEliminadas"
import Layout from "./components/Layout"
import "./App.css"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div className="loading-container">Cargando...</div>
  }

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="parcela/:id" element={<ParcelaDetail />} />
        <Route path="historial" element={<HistorialGeneral />} />
        <Route path="graficas" element={<Graficas />} />
        <Route path="graficas-parcela/:id" element={<GraficasParcela />} />
        <Route path="parcelas-eliminadas" element={<ParcelasEliminadas />} />
      </Route>
    </Routes>
  )
}

export default App

