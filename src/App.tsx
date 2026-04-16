import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './layout/Layout';
import { HomePage } from './pages/Home/HomePage';
import { AutoCotizador } from './pages/Cotizadores/AutoCotizador';
import { MotoCotizador } from './pages/Cotizadores/MotoCotizador';
import { HogarCotizador } from './pages/Cotizadores/HogarCotizador';
import { InstitutionalPage } from './pages/Institutional/InstitutionalPage';
import { SEOHelmet } from './components/SEO/SEOHelmet';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
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
          </Routes>
        </Router>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
