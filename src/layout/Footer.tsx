import { useTheme } from '../hooks/useTheme';

export const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="relative bg-bg-secondary pt-24 pb-12 overflow-hidden border-t border-border-primary transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-yuju-blue/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <a href="https://yuju.com.ar" target="_blank" rel="noopener noreferrer" className="flex items-center group">
              <img
                src={theme === 'dark'
                  ? "https://yuju.com.ar/assets/webBlanco-SASFsG6e.png"
                  : "https://yuju.com.ar/assets/logoYujuAzul-DE5urkwK.png"
                }
                alt="Yuju Logo"
                className="h-9 md:h-10 w-auto object-contain transition-all hover:scale-105"
              />
            </a>
            <div className="w-px h-8 bg-border-primary hidden md:block" />
            <a href="https://nimbusseguros.com" target="_blank" rel="noopener noreferrer" className="transition-all hover:scale-105">
              <img
                src="https://res.cloudinary.com/dewcgbpvp/image/upload/q_auto/f_auto/v1744826112/Nimbus_logo_ce8g6g.png"
                alt="Nimbus Logo"
                className={`h-8 md:h-10 w-auto object-contain transition-all ${theme === 'dark' ? 'brightness-0 invert' : 'opacity-80'}`}
              />
            </a>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
            Expertos en simplificar tu vida. La plataforma de seguros más innovadora de Argentina, diseñada para el usuario conectado.
          </p>
        </div>

        <div>
          <h4 className="text-text-primary font-bold mb-8 font-accent tracking-widest text-xs">Asegurá tu mundo</h4>
          <ul className="space-y-4 text-text-secondary text-sm font-medium">
            <li><a href="/cotizar/seguro-auto" className="hover:text-yuju-blue transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-yuju-blue opacity-0 group-hover:opacity-100 transition-opacity" /> Seguro de Auto</a></li>
            <li><a href="/cotizar/seguro-moto" className="hover:text-orange-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Seguro de Moto</a></li>
            <li><a href="/cotizar/seguro-hogar" className="hover:text-emerald-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /> Seguro de Hogar</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-text-primary font-bold mb-8 font-accent tracking-widest text-xs">Sobre Nosotros</h4>
          <ul className="space-y-4 text-text-secondary text-sm font-medium">
            <li><a href="/institucional" className="hover:text-yuju-blue transition-colors">Institucional</a></li>
            <li><a href="/institucional#mision" className="hover:text-yuju-blue transition-colors">Misión y Visión</a></li>
          </ul>
        </div>


      </div>

      {/* REGULATORY COMPLIANCE BAR */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-border-primary">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center py-8 border-b border-border-primary/50 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest leading-none">Inscripción</span>
            <span className="text-sm font-bold text-text-primary">SSN 1347</span>
          </div>
          <p className="text-[10px] font-bold text-text-secondary/60 leading-tight uppercase col-span-2 md:col-span-1">
            Departamento de Orientación y Asistencia al Asegurado
          </p>
          <a href="tel:08006668400" className="text-yuju-blue font-black text-lg hover:underline decoration-2 underline-offset-4">0800-666-8400</a>
          <a href="https://www.argentina.gob.ar/ssn" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-yuju-blue font-bold text-sm transition-colors decoration-1 underline-offset-4">www.argentina.gob.ar/ssn</a>
          <div className="col-span-2 md:col-span-1 flex justify-center md:justify-end">
            <a href="https://www.argentina.gob.ar/ssn" target="_blank" rel="noopener noreferrer" className="transition-all hover:scale-105">
              <img
                src="https://res.cloudinary.com/dewcgbpvp/image/upload/v1722608965/SSN_afnmvf.png"
                alt="SSN Logo"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-12">
          <div className="lg:col-span-2">
            <div className="p-8 rounded-3xl bg-bg-primary border border-border-primary shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yuju-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <p className="text-[11px] md:text-xs leading-relaxed text-text-secondary font-medium italic">
                La entidad aseguradora dispone de un Servicio de Atención al Asegurado que atenderá las consultas y reclamos que presenten los tomadores de seguros, asegurados, beneficiarios y/o derechohabientes. En caso de que existiera un reclamo ante la entidad aseguradora y que el mismo no haya sido resuelto o haya sido desestimado, total o parcialmente, o que haya sido denegada su admisión, podrá comunicarse con la Superintendencia de Seguros de la Nación por teléfono al 0800-666-8400, correo electrónico a consultas@ssn.gob.ar o formulario disponible en la página argentina.gob.ar/ssn.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black tracking-[0.3em] text-yuju-blue">Atención al Asegurado</h5>
            <div className="space-y-5">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest mb-1">Responsable</span>
                <span className="text-xs font-black text-text-primary uppercase">Felipe Ricardo Luis Perdomo</span>
                <a href="tel:+5493442571364" className="text-xs font-bold text-text-secondary hover:text-yuju-blue transition-colors">+54 9 3442 57 1364</a>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest mb-1">Suplente</span>
                <span className="text-xs font-black text-text-primary uppercase">Guillermo Jose Joannas</span>
                <a href="tel:+5493442461715" className="text-xs font-bold text-text-secondary hover:text-yuju-blue transition-colors">+54 9 3442 46 1715</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 pt-8 border-t border-border-primary text-center text-text-secondary text-[11px] font-bold uppercase tracking-widest">
        <p>&copy; 2026 Yuju Seguros.</p>
      </div>
    </footer>
  );
};
