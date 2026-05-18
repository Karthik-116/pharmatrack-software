import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, Loader2, XCircle } from 'lucide-react';

const SCANNER_ID = 'dual-scanner-camera';

export default function DualScanner({ onScanSuccess, variant = 'dark' }) {
  const [mode, setMode] = useState('upload');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  const isDark = variant === 'dark';
  const accent = isDark ? 'lime' : 'sage';

  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) await html5QrCodeRef.current.stop();
      } catch (e) { /* cleanup */ }
    }
  }, []);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setError('');
    setScanning(true);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(SCANNER_ID);
      }
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopCamera();
          setScanning(false);
          onScanSuccess(decodedText);
        },
        () => {}
      );
    } catch {
      setScanning(false);
      setError('Camera access denied. Use file upload instead.');
    }
  }, [onScanSuccess, stopCamera]);

  const handleModeSwitch = async (newMode) => {
    if (newMode === mode) return;
    await stopCamera();
    setScanning(false);
    setError('');
    setMode(newMode);
  };

  useEffect(() => {
    if (mode === 'camera') {
      const t = setTimeout(() => startCamera(), 300);
      return () => clearTimeout(t);
    }
  }, [mode, startCamera]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setError('');
    setScanning(true);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(SCANNER_ID + '-file-temp');
      }
      const result = await html5QrCodeRef.current.scanFile(file, true);
      setScanning(false);
      onScanSuccess(result);
    } catch {
      setScanning(false);
      setError('Could not decode QR from image. Ensure it is clear and well-lit.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  return (
    <div className={`w-full border ${isDark ? 'border-bone/10 bg-steel' : 'border-sage bg-white'}`}>
      {/* Mode Toggle — two sharp horizontal strips */}
      <div className="flex">
        <button
          onClick={() => handleModeSwitch('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono uppercase tracking-widest border-r cursor-pointer transition-colors ${
            isDark ? 'border-bone/10' : 'border-sage'
          } ${
            mode === 'camera'
              ? isDark ? 'bg-lime text-void' : 'bg-sage text-void'
              : isDark ? 'bg-transparent text-ash hover:text-bone' : 'bg-transparent text-ash hover:text-void'
          }`}
        >
          <Camera size={14} />
          Camera
        </button>
        <button
          onClick={() => handleModeSwitch('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono uppercase tracking-widest cursor-pointer transition-colors ${
            mode === 'upload'
              ? isDark ? 'bg-lime text-void' : 'bg-sage text-void'
              : isDark ? 'bg-transparent text-ash hover:text-bone' : 'bg-transparent text-ash hover:text-void'
          }`}
        >
          <Upload size={14} />
          File Upload
        </button>
      </div>

      {/* Camera View */}
      {mode === 'camera' && (
        <div className="relative">
          <div id={SCANNER_ID} className="w-full min-h-[300px] bg-void" />
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-48 h-48 border ${isDark ? 'border-lime/50' : 'border-sage'}`}>
                <div className={`w-full h-0.5 ${isDark ? 'bg-lime' : 'bg-sage'} animate-scan-line`} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload View */}
      {mode === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-4 py-16 mx-4 my-4 border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? isDark ? 'border-lime bg-lime/5' : 'border-sage bg-sage/20'
              : isDark ? 'border-bone/15 hover:border-lime/40' : 'border-sage/50 hover:border-sage'
          }`}
        >
          {scanning ? (
            <>
              <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-lime' : 'text-sage'}`} />
              <p className="text-xs font-mono uppercase tracking-widest text-ash">Decoding...</p>
            </>
          ) : (
            <>
              <Upload className={`w-6 h-6 ${isDark ? 'text-bone/30' : 'text-ash'}`} />
              <div className="text-center">
                <p className={`text-sm font-body font-medium ${isDark ? 'text-bone/60' : 'text-void/60'}`}>
                  Drop QR image here
                </p>
                <p className="text-xs text-ash mt-1">or click to browse</p>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Hidden container for file scanning */}
      <div id={SCANNER_ID + '-file-temp'} className="hidden" />

      {/* Error */}
      {error && (
        <div className={`mx-4 mb-4 flex items-start gap-2 p-3 text-xs font-mono ${
          isDark
            ? 'bg-crimson/10 border border-crimson/30 text-crimson'
            : 'bg-crimson/5 border border-crimson/20 text-crimson'
        }`}>
          <XCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
