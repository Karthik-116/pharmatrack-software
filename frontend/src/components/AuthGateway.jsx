import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, User, Lock, Mail, CheckCircle2, Sparkles, Activity } from 'lucide-react';
import api from '../api';

export default function AuthGateway({ onEnterSystem }) {
  const [phase, setPhase] = useState('locked'); // 'locked' | 'splitting' | 'open' | 'slamming'
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlockClick = () => {
    if (phase !== 'locked') return;
    setPhase('splitting');
    setTimeout(() => {
      setPhase('open');
    }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phase === 'slamming' || isLoading) return;
    
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    if (mode === 'login') {
      try {
        const res = await api.post("/api/auth/login", { email, password });
        localStorage.setItem("access_token", res.data.access_token);
        
        // Trigger reverse-swallow cinematic animation
        setPhase('slamming');
        setTimeout(() => {
          onEnterSystem(email);
        }, 800);
      } catch (err) {
        setErrorMessage("ERROR: Incorrect credentials. Handshake denied.");
        setIsLoading(false);
      }
    } else {
      // Signup mode
      try {
        await api.post("/api/auth/signup", { email, password });
        // On Success: Clear form, set UI back to Login, display green success message
        setEmail('');
        setPassword('');
        setName('');
        setMode('login');
        setSuccessMessage("Credentials minted. Proceed to login.");
        setIsLoading(false);
      } catch (err) {
        setErrorMessage("ERROR: Operator email already registered.");
        setIsLoading(false);
      }
    }
  };

  const handleQuickFill = () => {
    setEmail('jane.doe@example.com');
    setPassword('consumer-secure-2026');
    setName('Jane Doe');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // ── PREMIUM EDITORIAL MONOLITH CONTENT (UMANI RONCHI + LANDO NORRIS HYBRID) ──
  const MonolithContent = (
    <div className="w-screen h-screen flex flex-col items-center justify-center px-4 relative z-20 select-none">
      {/* Subtle vertical center seam line */}
      <div className="absolute top-0 left-[50vw] w-[1px] h-full bg-bone/10 pointer-events-none z-10" />

      {/* Top Editorial Subtitle */}
      <div className="text-center font-mono text-[10px] sm:text-xs text-bone/60 tracking-[0.6em] uppercase mb-6 sm:mb-8 font-semibold">
        [ CONSUMER VERIFICATION GATEWAY ]
      </div>

      {/* Massive Editorial Display Typography */}
      <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 font-display text-6xl sm:text-8xl lg:text-[120px] font-black tracking-tight select-none leading-none">
        <span className="text-bone">PHARMA</span>
        <span className="text-lime font-light">TRACK</span>
      </div>

      {/* Thin elegant divider line */}
      <div className="w-24 sm:w-32 h-[1px] bg-lime/40 my-6 sm:my-8" />

      {/* Bottom Editorial Description */}
      <div className="text-center font-mono text-[10px] sm:text-xs text-bone/40 tracking-[0.4em] uppercase font-medium max-w-md leading-relaxed">
        AUTHENTIC MEDICINE // TRANSPARENT LEDGER
      </div>
    </div>
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-void font-body select-none">
      {/* ── BASE LAYER: THE FLAWLESS LANDO NORRIS BRUTALIST ARCHITECTURE ── */}
      <motion.div 
        className="absolute inset-0 w-full h-full bg-bone text-void flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-[1800px] mx-auto overflow-y-auto overflow-x-hidden"
        initial={{ scale: 0.92 }}
        animate={{ scale: phase === 'locked' ? 0.92 : phase === 'slamming' ? 0.92 : 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Navigation / Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-void pb-6 w-full shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-lime border-2 border-void animate-spin shrink-0" />
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-void/60 font-bold">PHARMATRACK // v4.0</div>
              <div className="text-base font-display font-extrabold text-void tracking-tight">CONSUMER VERIFICATION PORTAL</div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleQuickFill}
            className="group flex items-center gap-3 px-5 py-2.5 bg-void text-bone hover:bg-lime hover:text-void border-2 border-void font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-[4px_4px_0px_0px_#888888] hover:shadow-[2px_2px_0px_0px_#050505] cursor-pointer shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-lime group-hover:bg-void animate-pulse" />
            <span>[ Demo Quick Fill ]</span>
          </button>
        </div>

        {/* Main Content Area: 50/50 Flex/Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center my-auto py-8 w-full max-w-7xl mx-auto">
          {/* Left Column: Lando Norris Kinetic Typography & Editorial Showcase */}
          <div className="flex flex-col justify-center min-w-0 w-full">
            {/* Background giant watermark badge */}
            <div className="inline-block px-4 py-1 bg-lime text-void font-mono font-bold text-[10px] sm:text-xs uppercase tracking-[0.3em] border-2 border-void mb-6 shadow-[4px_4px_0px_0px_#050505] w-max">
              100% SECURE VERIFICATION
            </div>
            
            <h1 className="text-[48px] sm:text-[70px] xl:text-[90px] font-display font-extrabold text-void leading-[0.9] tracking-tight uppercase whitespace-nowrap">
              PHARMA<br />TRACK
            </h1>

            {/* Kinetic Sub-headline Container */}
            <div className="mt-8 bg-void text-bone p-6 sm:p-8 border-l-8 border-lime border-y-2 border-r-2 border-void shadow-[8px_8px_0px_0px_#888888] relative overflow-hidden group">
              <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 text-[80px] font-mono font-bold text-bone/5 select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
                LN4
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <Sparkles className="w-8 h-8 text-lime shrink-0 animate-pulse mt-1" />
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] sm:text-sm font-mono font-bold text-lime uppercase tracking-widest">
                    CONSUMER PROTECTION PROTOCOL
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-body text-bone/90 leading-relaxed max-w-xl">
                    INSTANT CONSUMER MEDICINE VERIFICATION. ACCESS THE PLATFORM TO SCAN QR STRIPS, VERIFY BATCH AUTHENTICITY, AND PREVENT COUNTERFEIT PRODUCTS.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Kinetic Ticker Bar */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-mono font-bold text-void/80">
              <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 border border-void/20">
                <Activity className="w-3.5 h-3.5 text-lime animate-bounce" />
                <span>ACTIVE NODES: 1,429</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 border border-void/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-void" />
                <span>REPLAY PROTECTION: ACTIVE</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 border border-void/20 hidden sm:flex">
                <Shield className="w-3.5 h-3.5 text-void" />
                <span>SUPPLY CHAIN: VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Right Column: Flawless Brutalist Login/Signup Form container */}
          <div className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
            <div className="bg-bone border-4 border-void p-6 sm:p-10 shadow-[12px_12px_0px_0px_#050505] relative">
              {/* Corner accent blocks */}
              <div className="absolute top-0 right-0 w-6 h-6 bg-void border-l-2 border-b-2 border-bone flex items-center justify-center text-[10px] text-lime font-mono font-bold">
                ✦
              </div>

              {/* Segmented State Toggle Bar */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-void/10 border-2 border-void mb-8">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`py-3 text-[10px] sm:text-sm font-mono font-bold tracking-widest uppercase cursor-pointer transition-all duration-300 relative ${
                    mode === 'login' ? 'bg-lime text-void border-2 border-void shadow-[2px_2px_0px_0px_#050505]' : 'text-void/60 hover:text-void'
                  }`}
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`py-3 text-[10px] sm:text-sm font-mono font-bold tracking-widest uppercase cursor-pointer transition-all duration-300 relative ${
                    mode === 'signup' ? 'bg-lime text-void border-2 border-void shadow-[2px_2px_0px_0px_#050505]' : 'text-void/60 hover:text-void'
                  }`}
                >
                  SIGN UP
                </button>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="bg-[#800000] text-bone border-2 border-void p-4 font-mono text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#050505] mb-6 animate-pulse">
                  {errorMessage}
                </div>
              )}

              {/* Success Message Display */}
              {successMessage && (
                <div className="bg-lime text-void border-2 border-void p-4 font-mono text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#050505] mb-6 font-bold">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Full Name Input (Signup Only) */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-2 overflow-hidden"
                    >
                      <label className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-void font-bold flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-void" />
                        <span>FULL NAME</span>
                      </label>
                      <input 
                        type="text"
                        required={mode === 'signup'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-white/80 border-2 border-void p-3 sm:p-4 text-sm sm:text-lg font-mono text-void placeholder:text-void/30 focus:border-lime focus:bg-white transition-all outline-none rounded-none shadow-[4px_4px_0px_0px_#888888] focus:shadow-[4px_4px_0px_0px_#050505]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-void font-bold flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-void" />
                    <span>EMAIL ADDRESS</span>
                  </label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-white/80 border-2 border-void p-3 sm:p-4 text-sm sm:text-lg font-mono text-void placeholder:text-void/30 focus:border-lime focus:bg-white transition-all outline-none rounded-none shadow-[4px_4px_0px_0px_#888888] focus:shadow-[4px_4px_0px_0px_#050505]"
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-void font-bold flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-void" />
                    <span>PASSWORD</span>
                  </label>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-white/80 border-2 border-void p-3 sm:p-4 text-sm sm:text-lg font-mono text-void placeholder:text-void/30 focus:border-lime focus:bg-white transition-all outline-none rounded-none shadow-[4px_4px_0px_0px_#888888] focus:shadow-[4px_4px_0px_0px_#050505]"
                  />
                </div>

                {/* Submit Button Monolith */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full bg-void text-bone py-4 sm:py-5 px-6 sm:px-8 font-mono text-sm sm:text-base font-bold tracking-[0.2em] uppercase hover:bg-lime hover:text-void transition-all duration-300 flex items-center justify-between overflow-hidden border-2 border-void cursor-pointer rounded-none mt-4 shadow-[6px_6px_0px_0px_#CDFF00] active:shadow-[2px_2px_0px_0px_#050505] active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {isLoading ? 'VERIFYING CREDENTIALS...' : mode === 'login' ? 'LOGIN TO PLATFORM' : 'CREATE ACCOUNT'}
                  </span>
                  <div className="relative z-10 flex items-center gap-2 transform group-hover:translate-x-2 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  {/* Background accent slider */}
                  <div className="absolute inset-0 w-0 bg-lime group-hover:w-full transition-all duration-300 z-0" />
                </button>

                {/* Text Toggle at Bottom */}
                <div className="text-center mt-2 border-t border-void/10 pt-4">
                  <button
                    type="button"
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="text-[10px] sm:text-xs font-mono text-void/60 hover:text-void font-bold underline tracking-wider cursor-pointer transition-colors"
                  >
                    {mode === 'login' ? (
                      "Don't have an account? Sign Up"
                    ) : (
                      "Already have an account? Login"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t-4 border-void pt-6 w-full shrink-0 text-[10px] sm:text-xs font-mono text-void/60 font-bold">
          <div>SYSTEM STATUS: <span className="text-lime font-bold bg-void px-2 py-0.5 text-bone border border-void">ONLINE // SECURED</span></div>
          <div>CONSUMER MEDICINE AUTHENTICATOR // BRUTALIST-EDITORIAL HYBRID</div>
        </div>
      </motion.div>

      {/* ── OVERLAY LAYER: THE TWO MASSIVE BLACK DOORS (EDITORIAL LUXURY SPLIT) ── */}
      {/* Left Door */}
      <motion.div 
        className="absolute top-0 left-0 w-[50vw] h-full bg-void z-30 overflow-hidden shadow-[20px_0px_50px_rgba(0,0,0,0.8)] border-r border-bone/10"
        initial={{ x: 0 }}
        animate={{ 
          x: (phase === 'splitting' || phase === 'open') ? '-100vw' : phase === 'slamming' ? 0 : 0 
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute top-0 left-0 w-screen h-screen flex items-center justify-center pointer-events-none">
          {MonolithContent}
        </div>
      </motion.div>

      {/* Right Door */}
      <motion.div 
        className="absolute top-0 right-0 w-[50vw] h-full bg-void z-30 overflow-hidden shadow-[-20px_0px_50px_rgba(0,0,0,0.8)] border-l border-bone/10"
        initial={{ x: 0 }}
        animate={{ 
          x: (phase === 'splitting' || phase === 'open') ? '100vw' : phase === 'slamming' ? 0 : 0 
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute top-0 right-0 w-screen h-screen flex items-center justify-center pointer-events-none">
          {MonolithContent}
        </div>
      </motion.div>

      {/* Central Interactive Click Target: [ ENTER VERIFICATION PORTAL ] Button */}
      {phase === 'locked' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto">
          <div className="flex flex-col items-center justify-center translate-y-[150px] sm:translate-y-[180px]">
            <motion.button
              onClick={handleUnlockClick}
              className="group relative flex items-center gap-4 px-8 sm:px-10 py-4 sm:py-5 bg-void/90 border-2 border-bone/30 hover:border-lime text-bone hover:text-lime font-mono text-xs sm:text-sm tracking-[0.3em] uppercase transition-all duration-500 overflow-hidden cursor-pointer backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Enter Verification Portal"
            >
              <span className="relative z-10">[ ENTER VERIFICATION PORTAL ]</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 transform group-hover:translate-x-2 transition-transform duration-500" />
              <div className="absolute inset-0 bg-bone/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
