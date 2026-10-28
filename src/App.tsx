import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import Layout from './components/Layout';
import Login from './pages/Login';
import RegistroDevolucao from './pages/RegistroDevolucao';
import ConsultaDevolucoes from './pages/ConsultaDevolucoes';
import CadastroEquipamentos from './pages/CadastroEquipamentos';
import CadastroTecnicos from './pages/CadastroTecnicos';
import Administracao from './pages/Administracao';
import ResultadoTeste from './pages/ResultadoTeste';
import ConsultaTestes from './pages/ConsultaTestes';
import BlocoNotas from './pages/BlocoNotas';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/devolucao"
              element={
                <RotaProtegida>
                  <Layout>
                    <RegistroDevolucao />
                  </Layout>
                </RotaProtegida>
              }
            />

            <Route
              path="/consulta"
              element={
                <RotaProtegida>
                  <Layout>
                    <ConsultaDevolucoes />
                  </Layout>
                </RotaProtegida>
              }
            />

            <Route
              path="/equipamentos"
              element={
                <RotaProtegida>
                  <Layout>
                    <CadastroEquipamentos />
                  </Layout>
                </RotaProtegida>
              }
            />

            <Route
              path="/tecnicos"
              element={
                <RotaProtegida>
                  <Layout>
                    <CadastroTecnicos />
                  </Layout>
                </RotaProtegida>
              }
            />

            <Route
              path="/administracao"
              element={
                <RotaProtegida somenteAdmin>
                  <Layout>
                    <Administracao />
                  </Layout>
                </RotaProtegida>
              }
            />

            <Route
              path="/resultado-teste"
              element={
                <RotaProtegida>
                  <Layout>
                    <ResultadoTeste />
                  </Layout>
                </RotaProtegida>
              }
            />

            <Route
              path="/consulta-testes"
              element={
                <RotaProtegida>
                  <Layout>
                    <ConsultaTestes />
                  </Layout>
                </RotaProtegida>
              }
            />

            <Route path="*" element={<Navigate to="/devolucao" replace />} />

            <Route
              path="/bloco-notas"
              element={
                <RotaProtegida>
                  <Layout>
                    <BlocoNotas />
                  </Layout>
                </RotaProtegida>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;