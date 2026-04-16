import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: number;
  title: string;
  subtitle: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  accentColor?: string; // tailwind class e.g. 'text-yuju-blue' or 'text-emerald-500'
  borderColor?: string; // e.g. 'border-yuju-blue/30'
  bgColor?: string;     // e.g. 'bg-yuju-blue/5'
}

export const FAQAccordion = ({
  items,
  accentColor = 'text-yuju-blue',
  borderColor = 'border-yuju-blue/30',
  bgColor = 'bg-yuju-blue/5',
}: FAQAccordionProps) => {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="max-w-6xl mx-auto px-4 pt-16 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <div className={`w-12 h-12 rounded-2xl ${bgColor} ${accentColor} flex items-center justify-center flex-shrink-0`}>
          <HelpCircle size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black font-accent tracking-tighter uppercase text-text-primary">
            Preguntas Frecuentes
          </h2>
          <p className="text-sm text-text-secondary font-medium">Todo lo que necesitás saber antes de asegurarte</p>
        </div>
      </div>

      {/* Accordion Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden
                ${isOpen ? `${borderColor} ${bgColor}` : 'border-border-primary bg-bg-primary hover:border-border-primary/60'}`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span className={`font-bold text-base leading-snug transition-colors ${isOpen ? accentColor : 'text-text-primary'}`}>
                  {item.title}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-shrink-0 ${isOpen ? accentColor : 'text-text-secondary opacity-40'}`}
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed font-medium">
                      {item.subtitle}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
