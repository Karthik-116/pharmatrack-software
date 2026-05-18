import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import DualScanner from './DualScanner';
import api from '../api';

const timelineNodes = [
  { label: 'MANUFACTURED', active: true },
  { label: 'IN TRANSIT', active: true },
  { label: 'WAREHOUSE', active: false },
  { label: 'DISPENSED', active: false },
];

export default function LogisticsZone() {
  const [state, setState] = useState('scanning');
  const [message, setMessage] = useState('');

  const handleScan = async (uuid) => {
    setState('loading');
    setMessage('');
    try {
      const res = await api.post('/api/scan/transit', {
        item_uuid: uuid,
        scanned_by: 'Hub_Alpha_Logistics',
        location: 'Transit_Warehouse_B',
      });
      setMessage(res.data.message || 'Cascade update applied.');
      setState('success');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Scan failed.');
      setState('error');
    }
  };

  const reset = () => {
    setState('scanning');
    setMessage('');
  };

  return (
    <div className="min-h-screen relative z-10">
      <AnimatePresence mode="wait">
        {/* ── Scanning State ── */}
        {state === 'scanning' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen flex flex-col lg:flex-row"
          >
            {/* Left — Typography */}
            <div className="lg:w-[50%] flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-0">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-mono uppercase tracking-[0.3em] text-lime mb-4"
              >
                02 — Transit Hub
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                className="text-6xl sm:text-7xl lg:text-[100px] font-display font-extrabold leading-[0.85] tracking-tighter text-bone mb-2"
              >
                TRANSIT
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                className="text-6xl sm:text-7xl lg:text-[100px] font-display font-extrabold leading-[0.85] tracking-tighter text-outline text-lime mb-8"
              >
                HUB
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-bone/50 text-sm leading-relaxed max-w-md font-body"
              >
                You are a warehouse worker receiving a shipment. Scan the{' '}
                <span className="text-lime font-semibold">outer Box QR code</span>.
                The system will instantly <span className="text-lime font-semibold">cascade</span>{' '}
                the location update to all nested strips inside.
              </motion.p>
            </div>

            {/* Right — Scanner */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:w-[50%] flex items-center justify-center p-8 lg:p-16"
            >
              <div className="w-full max-w-md">
                <DualScanner onScanSuccess={handleScan} variant="dark" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-lime animate-spin" />
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-ash">
                Processing cascade...
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Success — Full-Screen Kinetic Reveal ── */}
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden"
          >
            {/* Giant kinetic text */}
            <motion.h1
              initial={{ x: '100vw', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.1 }}
              className="text-[80px] sm:text-[120px] lg:text-[200px] font-display font-extrabold text-lime leading-none tracking-tighter whitespace-nowrap"
            >
              CASCADE
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm font-mono text-bone/60 mt-6 mb-12 text-center max-w-lg"
            >
              {message}
            </motion.p>

            {/* Timeline Strip */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-0 mb-12"
            >
              {timelineNodes.map((node, i) => (
                <React.Fragment key={node.label}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-4 h-4 border-2 ${
                      node.active
                        ? 'border-lime bg-lime'
                        : 'border-bone/20 bg-transparent'
                    }`} />
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${
                      node.active ? 'text-lime' : 'text-ash'
                    }`}>
                      {node.label}
                    </span>
                  </div>
                  {i < timelineNodes.length - 1 && (
                    <div className={`w-12 sm:w-20 h-px ${
                      node.active && timelineNodes[i + 1]?.active
                        ? 'bg-lime'
                        : 'bg-bone/10'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </motion.div>

            {/* Reset */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 border border-bone/20 text-bone/60 text-xs font-mono uppercase tracking-widest hover:bg-bone/5 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              Scan Another
            </motion.button>
          </motion.div>
        )}

        {/* ── Error ── */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-8"
          >
            <AlertTriangle className="w-12 h-12 text-crimson mb-6" />
            <h2 className="text-3xl font-display font-bold text-crimson mb-3">SCAN FAILED</h2>
            <p className="text-sm font-mono text-crimson/70 mb-8 text-center max-w-md">{message}</p>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 border border-crimson/30 text-crimson text-xs font-mono uppercase tracking-widest hover:bg-crimson/10 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
