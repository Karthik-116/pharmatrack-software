import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ShieldAlert, RotateCcw, Loader2,
  Pill, AlertTriangle, Info, Thermometer, CheckCircle, HeartPulse,
  MessageSquare, Send, Sparkles, HelpCircle
} from 'lucide-react';
import DualScanner from './DualScanner';
import api from '../api';

export default function ConsumerZone() {
  const [state, setState] = useState('scanning');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // AI Consultation States
  const [chatQuery, setChatQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResult, setChatResult] = useState(null);
  const [chatError, setChatError] = useState('');

  const handleScan = async (uuid) => {
    setState('loading');
    setResult(null);
    setErrorMsg('');
    setChatResult(null);
    setChatError('');
    try {
      const res = await api.post('/api/scan/verify', {
        item_uuid: uuid,
        scanned_by: 'Patient_Device',
        location: 'Consumer_Home',
      });
      setResult(res.data);
      setState('authentic');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Verification failed.');
      setState('counterfeit');
    }
  };

  const handleChat = async (overrideQuery) => {
    const q = overrideQuery || chatQuery;
    if (!q.trim()) return;
    setChatLoading(true);
    setChatResult(null);
    setChatError('');
    try {
      const res = await api.post('/api/chat', {
        product_id: result?.product_id || 'PARA-PLX',
        query: q
      });
      setChatResult(res.data);
      if (!overrideQuery) setChatQuery('');
    } catch (err) {
      setChatError(err.response?.data?.detail || 'Failed to connect to AI Pharmacist consultation service.');
    } finally {
      setChatLoading(false);
    }
  };

  const reset = () => {
    setState('scanning');
    setResult(null);
    setErrorMsg('');
    setChatQuery('');
    setChatResult(null);
    setChatError('');
  };

  return (
    <div className="min-h-screen relative z-10">
      <AnimatePresence mode="wait">
        {/* ── Scanning State — Organic / Cream ── */}
        {state === 'scanning' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen flex flex-col items-center justify-center px-8 py-16 relative"
          >
            {/* Floating pastel circle accent */}
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-sage/30 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-sage/20 blur-[100px] pointer-events-none" />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs font-mono uppercase tracking-[0.3em] text-sage mb-6"
            >
              03 — The Patient
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-void text-center leading-tight tracking-tight mb-4"
            >
              Verify Your
              <br />
              Medicine
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-void/50 text-sm text-center max-w-md mb-10 font-body leading-relaxed"
            >
              Scan the hidden QR strip inside your medicine packaging.
              Then try scanning the <strong className="text-void/70">same image again</strong> to
              simulate a counterfeiter cloning the code.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-md relative z-10"
            >
              <DualScanner onScanSuccess={handleScan} variant="organic" />
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
              <Loader2 className="w-10 h-10 text-sage animate-spin" />
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-void/40">
                Verifying cryptographic sequence...
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Authentic — Elegant Editorial Profile ── */}
        {state === 'authentic' && result && (
          <motion.div
            key="authentic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Shield Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex items-center justify-center gap-3 py-6 bg-sage/30 border-b border-sage"
            >
              <ShieldCheck className="w-6 h-6 text-void" />
              <span className="text-sm font-mono uppercase tracking-[0.3em] text-void font-bold">
                Authentic Product
              </span>
            </motion.div>

            {/* Two-Column Editorial Layout */}
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-70px)]">
              {/* Left Column — Medicine Identity */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:w-[45%] flex flex-col justify-center px-8 lg:px-16 py-12 relative"
              >
                {/* Pastel circle accent behind name */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-sage/20 blur-[80px] pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-6">
                    <Pill className="w-5 h-5 text-void/50" />
                    <span className="text-xs font-mono uppercase tracking-[0.25em] text-void/40">
                      Verified Medicine
                    </span>
                  </div>

                  <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-void leading-[0.9] tracking-tight mb-3">
                    {result.medicine_details?.brand_name}
                  </h1>
                  <p className="text-lg text-void/50 font-body mb-8">
                    {result.medicine_details?.generic_name}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-sage p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-void/40 mb-1">Batch</p>
                      <p className="text-sm font-display font-bold text-void">{result.medicine_details?.batch_number}</p>
                    </div>
                    <div className="border border-sage p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-void/40 mb-1">Expiry</p>
                      <p className="text-sm font-display font-bold text-void">{result.medicine_details?.expiry_date}</p>
                    </div>
                    <div className="col-span-2 border border-sage p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-void/40 mb-1">Manufacturer</p>
                      <p className="text-sm font-display font-bold text-void">{result.medicine_details?.manufacturer}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column — Usage Info */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:w-[55%] border-l border-sage/50 flex flex-col"
              >
                <div className="flex-1 p-8 lg:p-12 space-y-0">
                  {/* Primary Use */}
                  <div className="border-b border-sage/50 py-6 flex gap-4">
                    <CheckCircle className="w-5 h-5 text-void/40 shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-void/50 mb-2">Primary Use</h3>
                      <p className="text-sm text-void/80 leading-relaxed font-body">{result.usage_instructions?.primary_use}</p>
                    </div>
                  </div>

                  {/* How to Use */}
                  <div className="border-b border-sage/50 py-6 flex gap-4">
                    <Info className="w-5 h-5 text-void/40 shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-void/50 mb-2">Dosage & Usage</h3>
                      <p className="text-sm text-void/80 leading-relaxed font-body">{result.usage_instructions?.how_to_use}</p>
                    </div>
                  </div>

                  {/* Warnings */}
                  <div className="border-b border-sage/50 py-6 flex gap-4">
                    <AlertTriangle className="w-5 h-5 text-void/40 shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-void/50 mb-2">Safety Warnings</h3>
                      <p className="text-sm text-void/80 leading-relaxed font-body">{result.usage_instructions?.warnings}</p>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="py-6 flex gap-4">
                    <Thermometer className="w-5 h-5 text-void/40 shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-void/50 mb-2">Storage</h3>
                      <p className="text-sm text-void/80 leading-relaxed font-body">{result.usage_instructions?.storage}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-sage/50 px-8 lg:px-12 py-5 flex items-center justify-between">
                  <p className="text-[10px] font-mono text-void/30">
                    {result.security?.message} · Scan #{result.security?.scan_count}
                  </p>
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-5 py-2.5 bg-void text-cream text-xs font-mono uppercase tracking-widest hover:bg-void/80 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    Scan Again
                  </button>
                </div>
              </motion.div>
            </div>

            {/* AI Pharmacist Consultation Section (RAG-Enabled) */}
            <div className="border-t border-sage/50 bg-sage/10 px-8 lg:px-16 py-12">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-void text-cream flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-sage" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-display font-extrabold text-void tracking-tight">
                        AI Pharmacist Consultation
                      </h2>
                      <span className="px-2.5 py-0.5 bg-sage/30 text-void text-[10px] font-mono uppercase tracking-widest font-bold">
                        RAG Engine
                      </span>
                    </div>
                    <p className="text-xs text-void/60 font-body mt-0.5">
                      Hallucination-free clinical advice grounded strictly in verified pharmaceutical knowledge blocks.
                    </p>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div className="mb-6">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-void/40 mb-3">
                    Suggested Clinical Inquiries
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "What is the recommended dosage and maximum daily limit?",
                      "What should I do if I miss a dose?",
                      "Are there any food, beverage, or alcohol interactions?",
                      "What are the severe warning signs or side effects?"
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChat(prompt)}
                        disabled={chatLoading}
                        className="text-left px-4 py-2 bg-bone border border-sage/50 hover:border-void/50 text-void/80 hover:text-void text-xs font-body transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-void/40 shrink-0" />
                        <span className="truncate max-w-[280px] sm:max-w-none">{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Query Input */}
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-void/40" />
                    <input
                      type="text"
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                      placeholder="Ask the AI Pharmacist any specific question about this medication..."
                      disabled={chatLoading}
                      className="w-full pl-11 pr-4 py-3 bg-bone border border-sage/50 focus:border-void text-void placeholder:text-void/40 text-xs font-body outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={() => handleChat()}
                    disabled={chatLoading || !chatQuery.trim()}
                    className="px-6 py-3 bg-void text-cream hover:bg-void/80 text-xs font-mono uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {chatLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-sage" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-sage" />
                        <span className="hidden sm:inline">Consult</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results Display */}
                <AnimatePresence mode="wait">
                  {chatLoading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-8 bg-bone border border-sage/50 flex flex-col items-center justify-center gap-3"
                    >
                      <Loader2 className="w-8 h-8 text-void animate-spin" />
                      <p className="text-xs font-mono uppercase tracking-widest text-void/50 text-center">
                        Synthesizing clinical knowledge blocks...
                      </p>
                    </motion.div>
                  )}

                  {chatError && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-6 bg-crimson/10 border border-crimson text-crimson text-xs font-mono leading-relaxed"
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <ShieldAlert className="w-4 h-4" />
                        Consultation Error
                      </div>
                      {chatError}
                    </motion.div>
                  )}

                  {chatResult && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-6 sm:p-8 bg-bone border border-void/20 relative"
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-sage/20 border border-sage text-void/70 text-[10px] font-mono uppercase tracking-widest">
                        <ShieldCheck className="w-3.5 h-3.5 text-void" />
                        Verified Source
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-void animate-pulse" />
                        <h3 className="text-xs font-mono uppercase tracking-widest text-void font-bold">
                          AI Pharmacist Response
                        </h3>
                      </div>

                      <div className="text-sm text-void/90 font-body leading-relaxed whitespace-pre-line border-l-2 border-void pl-4 py-1 my-4">
                        {chatResult.answer}
                      </div>

                      <div className="mt-6 pt-4 border-t border-sage/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-void/50">
                        <div>
                          <span className="font-bold text-void/70">Grounding Metadata:</span> Product ID {chatResult.product_id}
                        </div>
                        <div>
                          <span className="font-bold text-void/70">Confidence:</span> {chatResult.confidence_score}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Counterfeit — Brutal Glitch ── */}
        {state === 'counterfeit' && (
          <motion.div
            key="counterfeit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Full-screen void takeover with red border frame */}
            <motion.div
              initial={{ backgroundColor: '#FFF8F0' }}
              animate={{ backgroundColor: '#050505' }}
              transition={{ duration: 0.3 }}
              className="min-h-screen flex flex-col items-center justify-center px-8 relative border-4 border-crimson glitch-frame"
            >
              {/* Glitch heading */}
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                className="animate-glitch"
              >
                <h1
                  className="text-5xl sm:text-7xl lg:text-[120px] font-display font-extrabold text-crimson leading-none tracking-tighter text-center animate-glitch-text"
                  style={{
                    textShadow: '3px 0 #FF003C, -3px 0 #00FFFF',
                  }}
                >
                  COUNTERFEIT
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 mb-4"
              >
                <ShieldAlert className="w-12 h-12 text-crimson mx-auto" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs font-mono uppercase tracking-[0.3em] text-crimson mb-6"
              >
                Replay Attack Detected
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="max-w-lg border border-crimson/30 p-6 mb-8"
              >
                <p className="text-crimson/80 text-xs font-mono leading-relaxed mb-3">
                  {errorMsg}
                </p>
                <p className="text-bone/30 text-xs font-mono leading-relaxed">
                  This QR code was already consumed. A legitimate code can only be
                  verified once. Any subsequent scan is flagged as a potential
                  counterfeit or cloned product.
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-crimson text-void text-xs font-mono uppercase tracking-widest font-bold hover:bg-crimson/80 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                Retry
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
