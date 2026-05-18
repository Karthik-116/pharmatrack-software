import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Search, PackagePlus, Download, ArrowRight, HelpCircle, 
  RotateCcw, Loader2, Check, Sliders, Database, Filter 
} from 'lucide-react';
import api from '../api';

const MASTER_CATALOG = [
  { product_id: "DOLO-0", brand_name: "Dolo", generic_name: "Paracetamol", composition: "250mg", manufacturer_name: "Micro Labs", category: "Antipyretic" },
  { product_id: "CROCIN-ADVANCE-1", brand_name: "Crocin Advance", generic_name: "Paracetamol", composition: "187mg", manufacturer_name: "GSK", category: "Antipyretic" },
  { product_id: "COMBIFLAM-2", brand_name: "Combiflam", generic_name: "Ibuprofen + Paracetamol", composition: "398mg", manufacturer_name: "Sanofi", category: "Analgesic" },
  { product_id: "ULTRACET-3", brand_name: "Ultracet", generic_name: "Tramadol + Paracetamol", composition: "226mg", manufacturer_name: "Dr. Reddy", category: "Analgesic" },
  { product_id: "AUGMENTIN-625-0", brand_name: "Augmentin 625", generic_name: "Amoxicillin + Clavulanate", composition: "485mg", manufacturer_name: "GSK", category: "Antibiotic" },
  { product_id: "AZITHRAL-500-1", brand_name: "Azithral 500", generic_name: "Azithromycin", composition: "422mg", manufacturer_name: "Alembic", category: "Antibiotic" },
  { product_id: "MONOCEF-O-2", brand_name: "Monocef-O", generic_name: "Cefpodoxime", composition: "497mg", manufacturer_name: "Aristo", category: "Antibiotic" },
  { product_id: "ACIVIR-3", brand_name: "Acivir", generic_name: "Acyclovir", composition: "303mg", manufacturer_name: "Cipla", category: "Antiviral" },
  { product_id: "TELMIKIND-H-0", brand_name: "Telmikind-H", generic_name: "Telmisartan + Hydrochlorothiazide", composition: "211mg", manufacturer_name: "Mankind", category: "Cardiovascular" },
  { product_id: "GLYCOMET-GP-2-1", brand_name: "Glycomet-GP 2", generic_name: "Glimepiride + Metformin", composition: "2mg/500mg", manufacturer_name: "USV", category: "Antidiabetic" },
  { product_id: "CONCOR-5-2", brand_name: "Concor 5", generic_name: "Bisoprolol", composition: "5mg", manufacturer_name: "Merck", category: "Cardiovascular" },
  { product_id: "ATORVA-20-3", brand_name: "Atorva 20", generic_name: "Atorvastatin", composition: "20mg", manufacturer_name: "Zydus", category: "Lipid-Lowering" },
  { product_id: "PAN-D-0", brand_name: "Pan-D", generic_name: "Pantoprazole + Domperidone", composition: "40mg/30mg", manufacturer_name: "Alkem", category: "Gastrointestinal" },
  { product_id: "OMEE-1", brand_name: "Omee", generic_name: "Omeprazole", composition: "20mg", manufacturer_name: "Alkem", category: "Gastrointestinal" },
  { product_id: "GELUSIL-2", brand_name: "Gelusil", generic_name: "Magnesium Hydroxide + Aluminium Hydroxide", composition: "164mg", manufacturer_name: "Pfizer", category: "Antacid" },
  { product_id: "RIFAGUT-3", brand_name: "Rifagut", generic_name: "Rifaximin", composition: "250mg", manufacturer_name: "Sun Pharma", category: "Gastrointestinal" },
  { product_id: "ALLEGRA-120-0", brand_name: "Allegra 120", generic_name: "Fexofenadine", composition: "120mg", manufacturer_name: "Sanofi", category: "Antihistamine" },
  { product_id: "MONTAIR-LC-1", brand_name: "Montair-LC", generic_name: "Montelukast + Levocetirizine", composition: "10mg/5mg", manufacturer_name: "Cipla", category: "Asthma / Allergy" },
  { product_id: "ASTHALIN-2", brand_name: "Asthalin", generic_name: "Salbutamol", composition: "4mg", manufacturer_name: "Cipla", category: "Bronchodilator" },
  { product_id: "CHESTON-COLD-3", brand_name: "Cheston Cold", generic_name: "Cetirizine + Paracetamol + Phenylephrine", composition: "5mg/325mg/10mg", manufacturer_name: "Cipla", category: "Cold & Flu" }
];

function downloadQR(canvasId, filename) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.png';
  a.click();
}

export default function ManufacturerZone() {
  const [selectedMed, setSelectedMed] = useState(MASTER_CATALOG[0]);
  const [stripCount, setStripCount] = useState(4);
  const [isSearching, setIsSearching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState('');
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  const categories = ['All', ...new Set(MASTER_CATALOG.map(m => m.category))];

  const filteredCatalog = MASTER_CATALOG.filter(med => {
    const matchesSearch = med.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.product_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const generate = async () => {
    setLoading(true);
    setError('');
    setBatchData(null);
    try {
      const res = await api.post('/api/generate_batch', {
        product_id: selectedMed.product_id,
        strip_count: parseInt(stripCount),
      });
      setBatchData(res.data);
      setHasGeneratedOnce(true);
      setIsSearching(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setBatchData(null);
    setError('');
    setIsSearching(true);
  };

  return (
    <div className="min-h-screen relative z-10 flex flex-col bg-void text-bone">
      {/* First-Time Operator Banner */}
      {!hasGeneratedOnce && (
        <div className="bg-lime/5 border-b border-lime p-4 flex items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime text-void font-bold font-mono text-xs">
              ALERT
            </div>
            <p className="text-xs font-mono text-bone">
              <span className="text-lime font-bold">FIRST-TIME OPERATOR GUIDE:</span> Select a pharmaceutical target from the Master Ledger, configure the strip count slider, and compile the cryptographic batch bundle.
            </p>
          </div>
          <button 
            onClick={() => setHasGeneratedOnce(true)}
            className="text-[10px] font-mono uppercase tracking-widest text-lime hover:text-bone border border-lime/30 px-3 py-1 cursor-pointer shrink-0"
          >
            DISMISS
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Column — Terminal Controls */}
        <div className="lg:w-[45%] flex flex-col justify-between p-8 lg:p-16 border-r border-bone/10 bg-void">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-lime animate-ping" />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-lime">
                01 — SECURE BATCH TERMINAL
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-bone leading-none tracking-tighter mb-8">
              SECURE BATCH
            </h1>

            {/* Active Production Target Readout */}
            <div className="border border-bone/20 bg-steel/30 p-6 mb-8 relative">
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-lime/10 border border-lime text-lime text-[10px] font-mono uppercase tracking-widest font-bold">
                Active Target
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-ash mb-1">Product ID: {selectedMed.product_id}</p>
              <h3 className="text-2xl font-display font-bold text-bone mb-1">{selectedMed.brand_name}</h3>
              <p className="text-xs font-body text-bone/70 mb-4">{selectedMed.generic_name} ({selectedMed.composition})</p>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-ash border-t border-bone/10 pt-3">
                <div><span className="text-bone/50">MFG:</span> {selectedMed.manufacturer_name}</div>
                <div><span className="text-bone/50">CAT:</span> {selectedMed.category}</div>
              </div>
            </div>

            {/* Tactical Button to Open Master Ledger Explorer */}
            <button
              onClick={() => {
                setIsSearching(true);
                setBatchData(null);
              }}
              className={`w-full flex items-center justify-between p-4 border border-bone/20 text-xs font-mono uppercase tracking-widest transition-all mb-8 cursor-pointer ${
                isSearching && !batchData ? 'bg-bone text-void font-bold border-bone' : 'bg-steel/20 text-bone hover:bg-steel/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-lime" />
                <span>{isSearching && !batchData ? 'Master Ledger Active' : 'Search Master Catalog'}</span>
              </div>
              <span className="text-[10px] text-lime">EXPLORE →</span>
            </button>

            {/* Strip Count Slider */}
            <div className="border border-bone/20 p-6 mb-8 bg-steel/10">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-mono uppercase tracking-widest text-bone flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-lime" />
                  Production Strip Count
                </label>
                <span className="text-sm font-mono font-bold text-lime bg-lime/10 border border-lime/30 px-3 py-1">
                  {stripCount} STRIPS
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={stripCount}
                onChange={(e) => setStripCount(e.target.value)}
                disabled={loading}
                className="w-full accent-lime bg-steel h-2 appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] font-mono text-ash mt-2">
                <span>MIN: 2</span>
                <span>MAX: 10</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              onClick={generate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-lime text-void font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-lime/90 disabled:opacity-50 transition-all cursor-pointer shadow-[4px_4px_0px_0px_#F5F0EB]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Compiling Bundle...
                </>
              ) : (
                <>
                  <PackagePlus size={18} />
                  Compile Batch Bundle
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 border border-crimson/30 bg-crimson/10 text-crimson text-xs font-mono">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Conditionally Renders Explorer OR Bundle Engine */}
        <div className="lg:w-[55%] flex flex-col bg-void min-h-screen">
          {batchData ? (
            /* ── The Cryptographic Bundle Engine (Results Gallery) ── */
            <div className="flex-1 flex flex-col p-8 lg:p-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bone/10 pb-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-lime/20 border border-lime text-lime text-[10px] font-mono uppercase tracking-widest font-bold">
                      SUCCESS
                    </span>
                    <p className="text-xs font-mono uppercase tracking-widest text-ash">Cryptographic Bundle Compiled</p>
                  </div>
                  <h2 className="text-3xl font-display font-extrabold text-bone">{selectedMed.brand_name}</h2>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 border border-bone/20 text-bone text-xs font-mono uppercase tracking-widest hover:bg-bone/10 transition-all cursor-pointer"
                >
                  <RotateCcw size={14} className="text-lime" />
                  Generate New Batch
                </button>
              </div>

              {/* Parent Box Readout */}
              <div className="border border-lime/30 bg-lime/5 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-lime font-bold">
                    [00] Parent Box Container UUID
                  </span>
                  <button
                    onClick={() => downloadQR('qr-box-parent', 'PharmaTrack_Box')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-lime text-void text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-lime/80 transition-colors cursor-pointer"
                  >
                    <Download size={12} />
                    Download Box QR
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-void border border-bone/10 p-6">
                  <div className="bg-bone p-4 shrink-0">
                    <QRCodeCanvas
                      id="qr-box-parent"
                      value={batchData.box_uuid}
                      size={140}
                      level="H"
                      includeMargin={false}
                      bgColor="#F5F0EB"
                      fgColor="#050505"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left overflow-hidden">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-ash mb-1">Cryptographic Identifier</p>
                    <p className="text-xs font-mono text-lime break-all bg-steel/30 p-3 border border-bone/10 mb-3">{batchData.box_uuid}</p>
                    <p className="text-xs font-body text-bone/70">
                      This QR code acts as the master aggregation seal for the outer packaging carton.
                    </p>
                  </div>
                </div>
              </div>

              {/* Child Strips Grid */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-bone/10 pb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-bone font-bold">
                    Child Strips ({batchData.strip_uuids.length} Units Generated)
                  </span>
                  <span className="text-[10px] font-mono text-ash">Click download to export individual PNGs</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {batchData.strip_uuids.map((uuid, idx) => (
                    <div key={uuid} className="border border-bone/15 bg-steel/10 p-6 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-ash bg-steel/40 px-2 py-1 border border-bone/10">
                          Strip 0{idx + 1}
                        </span>
                        <button
                          onClick={() => downloadQR(`qr-strip-${idx}`, `PharmaTrack_Strip_${idx+1}`)}
                          className="flex items-center gap-1.5 px-3 py-1 border border-bone/20 text-bone hover:border-lime hover:text-lime text-[10px] font-mono uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          <Download size={10} />
                          Download
                        </button>
                      </div>

                      <div className="flex flex-col items-center my-4">
                        <div className="bg-bone p-3 mb-4">
                          <QRCodeCanvas
                            id={`qr-strip-${idx}`}
                            value={uuid}
                            size={120}
                            level="H"
                            includeMargin={false}
                            bgColor="#F5F0EB"
                            fgColor="#050505"
                          />
                        </div>
                        <p className="text-[10px] font-mono text-ash break-all text-center px-2">{uuid}</p>
                      </div>

                      <div className="border-t border-bone/10 pt-3 mt-2 text-center">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-lime">Status: CREATED / SECURE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isSearching ? (
            /* ── The Master Ledger Explorer ── */
            <div className="flex-1 flex flex-col p-8 lg:p-16">
              <div className="border-b border-bone/10 pb-6 mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-lime" />
                  <span className="text-xs font-mono uppercase tracking-[0.3em] text-lime">MASTER_CATALOG LEDGER</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-bone">Ledger Explorer</h2>
                <p className="text-xs font-body text-bone/60 mt-1">Search and filter verified pharmaceutical specifications to set the active production target.</p>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ash" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by brand name, generic composition, or product ID..."
                  className="w-full pl-12 pr-4 py-4 bg-steel/20 border border-bone/20 focus:border-lime text-bone placeholder:text-ash text-xs font-mono outline-none transition-colors"
                />
              </div>

              {/* Category Filters */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-3 h-3 text-ash" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-ash">Filter by Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 border text-xs font-mono tracking-widest transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-lime border-lime text-void font-bold'
                          : 'bg-steel/10 border-bone/10 text-bone/70 hover:border-bone/30 hover:text-bone'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Catalog List */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px] ledger-scroll">
                {filteredCatalog.length === 0 ? (
                  <div className="p-8 border border-bone/10 text-center text-ash text-xs font-mono">
                    No matching pharmaceutical products found in the Master Ledger.
                  </div>
                ) : (
                  filteredCatalog.map((med) => {
                    const isSelected = selectedMed.product_id === med.product_id;
                    return (
                      <div
                        key={med.product_id}
                        onClick={() => {
                          setSelectedMed(med);
                          setIsSearching(false);
                        }}
                        className={`p-6 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-lime bg-lime/5'
                            : 'border-bone/10 bg-steel/10 hover:border-bone/30 hover:bg-steel/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-lime bg-steel/40 px-2 py-0.5 border border-bone/10">
                              {med.product_id}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-ash">
                              {med.category}
                            </span>
                          </div>
                          <h4 className="text-xl font-display font-bold text-bone mb-1">{med.brand_name}</h4>
                          <p className="text-xs font-body text-bone/70 mb-2">{med.generic_name} ({med.composition})</p>
                          <p className="text-[10px] font-mono text-ash">MFG: {med.manufacturer_name}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isSelected && (
                            <span className="text-[10px] font-mono uppercase tracking-widest text-lime flex items-center gap-1 font-bold">
                              <Check className="w-3.5 h-3.5" /> Active Target
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMed(med);
                              setIsSearching(false);
                            }}
                            className={`px-4 py-2 border text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-lime text-void border-lime font-bold'
                                : 'bg-void text-bone border-bone/20 hover:border-lime hover:text-lime'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select Target'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* ── Target Locked / Ready State (When Explorer is closed but batch not yet generated) ── */
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 text-center border-t lg:border-t-0 border-bone/10">
              <div className="max-w-md border border-lime/30 bg-lime/5 p-8 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-lime text-void text-[10px] font-mono uppercase tracking-widest font-bold">
                  TARGET LOCKED
                </div>
                <h3 className="text-3xl font-display font-bold text-bone mb-2 mt-2">{selectedMed.brand_name}</h3>
                <p className="text-xs font-body text-bone/70 mb-6">{selectedMed.generic_name} ({selectedMed.composition})</p>
                <div className="border-t border-bone/10 pt-6 mb-6 text-left space-y-2 text-xs font-mono text-ash">
                  <div className="flex justify-between"><span>Product ID:</span> <span className="text-bone">{selectedMed.product_id}</span></div>
                  <div className="flex justify-between"><span>Manufacturer:</span> <span className="text-bone">{selectedMed.manufacturer_name}</span></div>
                  <div className="flex justify-between"><span>Category:</span> <span className="text-bone">{selectedMed.category}</span></div>
                  <div className="flex justify-between"><span>Strip Count:</span> <span className="text-lime font-bold">{stripCount} STRIPS</span></div>
                </div>
                <p className="text-xs font-body text-bone/60 mb-6">
                  Terminal is configured and ready. Click <strong className="text-bone">Compile Batch Bundle</strong> on the left to generate cryptographic UUIDs and QR seals.
                </p>
                <button
                  onClick={() => setIsSearching(true)}
                  className="px-6 py-3 border border-bone/20 text-bone text-xs font-mono uppercase tracking-widest hover:border-lime hover:text-lime transition-colors cursor-pointer w-full"
                >
                  Change Production Target
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

