import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Bike, Home, Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/utils';
import { useTheme } from '../hooks/useTheme';

const navItems = [
  { 
    name: 'Seguro de Auto', 
    icon: Car, 
    href: '/cotizar/seguro-auto',
    activeColor: 'text-yuju-blue',
    iconColor: 'text-yuju-blue',
    indicatorColor: 'from-yuju-blue to-yuju-cyan'
  },
  { 
    name: 'Seguro de Moto', 
    icon: Bike, 
    href: '/cotizar/seguro-moto',
    activeColor: 'text-orange-500',
    iconColor: 'text-orange-500',
    indicatorColor: 'from-orange-500 to-orange-400'
  },
  { 
    name: 'Seguro de Hogar', 
    icon: Home, 
    href: '/cotizar/seguro-hogar',
    activeColor: 'text-emerald-500',
    iconColor: 'text-emerald-500',
    indicatorColor: 'from-emerald-500 to-emerald-400'
  },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isHomePage = location.pathname === '/';
  const isCotizador = location.pathname.includes('/cotizar/');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      isCotizador ? "absolute" : "fixed",
      "top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out",
      scrolled ? "py-3 md:py-4 px-6" : "py-4 md:py-6 px-6 md:px-8"
    )}>
      <motion.div 
        layout
        className={cn(
          "max-w-7xl mx-auto flex items-center justify-between transition-all duration-500",
          scrolled
            ? "glass-card rounded-[2rem] px-10 py-4 shadow-2xl shadow-yuju-blue/5 border-white/10" 
            : "bg-transparent px-0 py-0 border-transparent shadow-none"
        )}
      >
        {/* Logo Section */}
        <Link to="/" className="flex items-center group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={cn(
              "relative transition-all duration-500",
              !scrolled ? "h-9 md:h-10 lg:h-11 xl:h-14" : "h-7 md:h-8"
            )}
          >
            <img 
              src={((!scrolled && isHomePage) || theme === 'dark') 
                ? "https://yuju.com.ar/assets/webBlanco-SASFsG6e.png"
                : "https://yuju.com.ar/assets/logoYujuAzul-DE5urkwK.png"
              } 
              alt="Yuju Logo" 
              className="h-full w-auto object-contain transition-all"
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          <div className="flex items-center gap-10">
            {navItems.map((item, i) => (
              <motion.div 
                key={item.name} 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={item.href}
                   className={cn(
                    "group relative flex items-center gap-2.5 transition-all text-[15px] font-semibold tracking-tight",
                    (!scrolled && isHomePage)
                      ? "text-white/90 hover:text-white" 
                      : (location.pathname === item.href ? item.activeColor : "text-text-secondary hover:text-text-primary")
                  )}
                >
                  <item.icon size={18} className={cn(
                    "transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                    (!scrolled && isHomePage)
                      ? "text-white/40 group-hover:text-white/70" 
                      : (location.pathname === item.href ? item.iconColor : `${item.iconColor}/40`)
                  )} />
                  <span className="flex items-center gap-1">
                    <span className="hidden xl:inline whitespace-nowrap">Seguro de</span>
                    <span>{item.name.replace('Seguro de ', '')}</span>
                  </span>
                  {location.pathname === item.href && (
                    <motion.div 
                      layoutId="nav-active"
                      className={cn("absolute -bottom-1.5 left-0 right-0 h-0.5 bg-gradient-to-r rounded-full", item.indicatorColor)}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-4 pl-10 border-l border-border-primary/50">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={cn(
                "p-2.5 rounded-2xl transition-all group border",
                !scrolled && isHomePage
                  ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
                  : "bg-bg-secondary hover:bg-yuju-blue/10 border-border-primary text-text-secondary hover:text-yuju-blue"
              )}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? 
                <Moon size={20} className="group-hover:rotate-12 transition-transform" /> : 
                <Sun size={20} className="group-hover:rotate-90 transition-transform" />
              }
            </motion.button>

            {/* Social Icons Group */}
            <div className="flex items-center gap-3">
              {[
                { 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.032c0 2.12.554 4.189 1.605 6.006L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.632 0 12.028-5.396 12.031-12.032a11.777 11.777 0 00-3.528-8.508z"/></svg>, 
                  name: 'WhatsApp', 
                  href: 'https://wa.me/5491156307246',
                  customClass: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
                },
                { 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>, 
                  name: 'Instagram', 
                  href: 'https://www.instagram.com/segurosyuju?igsh=djkyZWxkZ3pvcXJn' 
                },
                { 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, 
                  name: 'Facebook', 
                  href: 'https://www.facebook.com/segurosyuju?rdid=hooJkOBqHzBZS2mq&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BtqRdRJeQ%2F#' 
                }
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all border",
                    !scrolled && isHomePage
                      ? "bg-white/10 border-white/20 text-white hover:bg-white/30 hover:border-white/40" 
                      : "bg-bg-secondary border-border-primary text-text-secondary hover:text-yuju-blue hover:bg-yuju-blue/5",
                    social.customClass
                  )}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Navbar Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl bg-bg-secondary text-text-secondary border border-border-primary"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className={cn(
               "p-2.5 transition-all border rounded-xl",
               !scrolled && isHomePage
                 ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
                 : "bg-bg-secondary border-border-primary text-text-primary"
            )}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-primary/60 backdrop-blur-2xl z-[60] md:hidden p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <img 
                  src={theme === 'dark' ? "https://yuju.com.ar/assets/webBlanco-SASFsG6e.png" : "https://yuju.com.ar/assets/logoYujuAzul-DE5urkwK.png"} 
                  alt="Yuju Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(false)} 
                className="p-3 rounded-2xl bg-bg-secondary border border-border-primary text-text-primary"
              >
                <X size={24}/>
              </motion.button>
            </div>

            <div className="flex flex-col gap-4">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    to={item.href}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border transition-all",
                      location.pathname === item.href 
                        ? `bg-bg-secondary border-${item.iconColor.split('-')[1] === 'orange' ? 'orange' : (item.iconColor.split('-')[1] === 'emerald' ? 'emerald' : 'yuju-blue')}-500/30 ${item.activeColor}` 
                        : "bg-bg-secondary/50 border-border-primary text-text-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        location.pathname === item.href 
                          ? `bg-${item.iconColor.split('-')[1] === 'yuju' ? 'yuju-blue' : (item.iconColor.split('-')[1] === 'orange' ? 'orange-500' : 'emerald-500')} text-white` 
                          : "bg-bg-primary text-text-secondary opacity-40"
                      )}>
                        <item.icon size={20} />
                      </div>
                      <span className="text-lg font-bold tracking-tight">{item.name}</span>
                    </div>
                    <ChevronRight size={18} className="opacity-40" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pt-10 pb-6 flex items-center justify-center gap-6">
              {[
                { 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.032c0 2.12.554 4.189 1.605 6.006L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.632 0 12.028-5.396 12.031-12.032a11.777 11.777 0 00-3.528-8.508z"/></svg>, 
                  name: 'WhatsApp', 
                  href: 'https://wa.me/5491156307246',
                  activeClass: "hover:bg-[#25D366] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
                },
                { 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>, 
                  name: 'Instagram', 
                  href: 'https://www.instagram.com/segurosyuju?igsh=djkyZWxkZ3pvcXJn',
                  activeClass: "hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888]"
                },
                { 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, 
                  name: 'Facebook', 
                  href: 'https://www.facebook.com/segurosyuju?rdid=hooJkOBqHzBZS2mq&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BtqRdRJeQ%2F#',
                  activeClass: "hover:bg-[#1877F2]"
                }
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border",
                    "bg-bg-secondary border-border-primary text-text-secondary hover:text-white hover:border-transparent shadow-sm",
                    social.activeClass
                  )}
                  aria-label={social.name}
                >
                  <social.icon className="w-6 h-6" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
