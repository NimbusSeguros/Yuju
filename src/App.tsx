import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './layout/Layout';
import { HomePage } from './pages/Home/HomePage';
import { AutoCotizador } from './pages/Cotizadores/AutoCotizador';
import { MotoCotizador } from './pages/Cotizadores/MotoCotizador';
import { HogarCotizador } from './pages/Cotizadores/HogarCotizador';
import { MonopatinCotizador } from './pages/Cotizadores/MonopatinCotizador';
import { BicicletaCotizador } from './pages/Cotizadores/BicicletaCotizador';
import { NotebookCotizador } from './pages/Cotizadores/NotebookCotizador';
import { InstitutionalPage } from './pages/Institutional/InstitutionalPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { SEOHelmet } from './components/SEO/SEOHelmet';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect, useState } from 'react';
import { initAuth } from './services/auth';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initAuth().finally(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <HelmetProvider>
        <ErrorBoundary>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={
                <Layout>
                  <SEOHelmet 
                    title="Inicio" 
                    description="Yuju Seguros: La plataforma de seguros más moderna de Argentina. Cotizá auto, moto y hogar en segundos." 
                    jsonLd={{
                      "@context": "https://schema.org",
                      "@type": "InsuranceAgency",
                      "name": "Yuju Seguros",
                      "description": "Plataforma digital de seguros moderna y elegante.",
                      "url": "https://yuju.com.ar"
                    }}
                  />
                  <HomePage />
                </Layout>
              } />
              <Route path="/institucional" element={
                <Layout>
                  <InstitutionalPage />
                </Layout>
              } />
              <Route path="/cotizar/seguro-auto" element={<AutoCotizador />} />
              <Route path="/cotizar/seguro-moto" element={<MotoCotizador />} />
              <Route path="/cotizar/seguro-hogar" element={<HogarCotizador />} />
              <Route path="/cotizar/seguro-monopatin" element={<MonopatinCotizador />} />
              <Route path="/cotizar/seguro-bicicleta" element={<BicicletaCotizador />} />
              <Route path="/cotizar/seguro-notebook" element={<NotebookCotizador />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
