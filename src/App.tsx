import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './routes/PrivateRoute'
import Layout from './components/Layout'

import Login               from './pages/Login'
import Registro            from './pages/Registro'
import RegistroDevolucao   from './pages/RegistroDevolucao'
import ConsultaDevolucoes  from './pages/ConsultaDevolucoes'
import CadastroEquipamentos from './pages/CadastroEquipamentos'
import CadastroTecnicos    from './pages/CadastroTecnicos'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Privadas — envolvidas pelo Layout (sidebar) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <RegistroDevolucao />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/consulta"
            element={
              <PrivateRoute>
                <Layout>
                  <ConsultaDevolucoes />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/equipamentos"
            element={
              <PrivateRoute>
                <Layout>
                  <CadastroEquipamentos />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tecnicos"
            element={
              <PrivateRoute>
                <Layout>
                  <CadastroTecnicos />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App