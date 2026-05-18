import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContourField from './components/ContourField';
import ManufacturerZone from './components/ManufacturerZone';
import LogisticsZone from './components/LogisticsZone';
import ConsumerZone from './components/ConsumerZone';
import AuthGateway from './components/AuthGateway';

const ZONES = [
  { id: 'manufacturer', num: '01', label: 'SECURE BATCH' },
  { id: 'logistics', num: '02', label: 'TRANSIT HUB' },
  { id: 'consumer', num: '03', label: 'THE PATIENT' },
];

const zoneTransition = {
  initial: { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)', opacity: 0 },
  animate: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', opacity: 1 },
  exit: { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', opacity: 0 },
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeZone, setActiveZone] = useState('manufacturer');
  const [navExpanded, setNavExpanded] = useState(true);
  const isConsumer = activeZone === 'consumer';

  if (!isAuthenticated) {
    return <AuthGateway onEnterSystem={() => setIsAuthenticated(true)} />;
  }

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden"
      animate={{ backgroundColor: isConsumer ? '#FFF8F0' : '#050505' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* ── Topographic Contour Background ── */}
      <ContourField variant={isConsumer ? 'organic' : 'dark'} />

      {/* ── Zone Content — Full Viewport ── */}
      <AnimatePresence mode="wait">
        {activeZone === 'manufacturer' && (
          <motion.div
            key="manufacturer"
            variants={zoneTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ManufacturerZone />
          </motion.div>
        )}
        {activeZone === 'logistics' && (
          <motion.div
            key="logistics"
            variants={zoneTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <LogisticsZone />
          </motion.div>
        )}
        {activeZone === 'consumer' && (
          <motion.div
            key="consumer"
            variants={zoneTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ConsumerZone />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fixed Bottom-Right Navigation Widget ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          layout
          className={`border backdrop-blur-sm overflow-hidden ${isConsumer
              ? 'bg-white/90 border-sage'
              : 'bg-steel/95 border-bone/10'
            }`}
          style={{ minWidth: navExpanded ? 200 : 48 }}
        >
          {/* Brand Header */}
          <button
            onClick={() => setNavExpanded(!navExpanded)}
            className={`w-full flex items-center gap-2 px-4 py-3 border-b cursor-pointer transition-colors ${isConsumer
                ? 'border-sage/50 hover:bg-sage/10'
                : 'border-bone/10 hover:bg-bone/5'
              }`}
          >
            {navExpanded ? (
              <div className="text-left">
                <div className={`text-[10px] font-mono uppercase tracking-[0.25em] ${isConsumer ? 'text-void/40' : 'text-ash'
                  }`}>
                  Pharma
                </div>
                <div className={`text-xs font-display font-bold tracking-tight ${isConsumer ? 'text-void' : 'text-bone'
                  }`}>
                  TRACK
                </div>
              </div>
            ) : (
              <div className={`text-xs font-display font-bold ${isConsumer ? 'text-void' : 'text-lime'
                }`}>
                PT
              </div>
            )}
          </button>

          {/* Zone Buttons */}
          <AnimatePresence>
            {navExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {ZONES.map((zone) => {
                  const isActive = activeZone === zone.id;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setActiveZone(zone.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-all relative ${isConsumer
                          ? isActive
                            ? 'bg-sage/20'
                            : 'hover:bg-sage/10'
                          : isActive
                            ? 'bg-lime/10'
                            : 'hover:bg-bone/5'
                        }`}
                    >
                      {/* Active left bar */}
                      {isActive && (
                        <motion.div
                          layoutId="navActiveBar"
                          className={`absolute left-0 top-0 bottom-0 w-[3px] ${isConsumer ? 'bg-sage' : 'bg-lime'
                            }`}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}

                      <span className={`text-[10px] font-mono ${isActive
                          ? isConsumer ? 'text-void' : 'text-lime'
                          : isConsumer ? 'text-void/30' : 'text-ash'
                        }`}>
                        {zone.num}
                      </span>
                      <span className={`text-[10px] font-mono uppercase tracking-[0.15em] ${isActive
                          ? isConsumer ? 'text-void font-bold' : 'text-bone font-bold'
                          : isConsumer ? 'text-void/40' : 'text-bone/40'
                        }`}>
                        {zone.label}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default App;
