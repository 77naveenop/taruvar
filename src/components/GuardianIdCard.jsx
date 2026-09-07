import React, { useState, useRef } from 'react';
import { Download, Printer, QrCode, ShieldCheck, Sparkles, Sprout, CheckCircle2, RotateCw, Award, Calendar, MapPin } from 'lucide-react';

export default function GuardianIdCard({ 
  guardianName = 'Naveen Sharma',
  memberId = 'TRV-IND-2026-4821',
  treeId = 'TRV-TREE-8092',
  species = 'Peepal Tree (Ficus religiosa)',
  plantedDate = '15 Aug 2026',
  location = 'Sector 4 Green Park, Delhi NCR',
  verifiedMonths = 3,
  photoUrl = null
}) {
  const [showBack, setShowBack] = useState(false);
  const cardRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  // Generate QR code data URL using public QR API
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://taruvar.org/journey/${treeId}&color=1b4e31&bgcolor=ffffff`;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      
      {/* Interactive Controls Bar */}
      <div className="flex items-center justify-between gap-3 bg-taruvar-bg p-3 rounded-2xl border border-taruvar-border">
        <button
          onClick={() => setShowBack(!showBack)}
          className="px-3.5 py-2 bg-white text-taruvar-dark hover:text-taruvar-secondary border border-taruvar-border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5 text-taruvar-secondary" />
          <span>{showBack ? 'View Front Side' : 'Flip to Back Side'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-taruvar-secondary hover:bg-taruvar-hover text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
            title="Print Physical PVC ID Card"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {/* Printable Card Container (Exact CR80 PVC Card Aspect Ratio 85.6mm x 53.98mm) */}
      <div id="printable-guardian-card" className="perspective-1000">
        {!showBack ? (
          /* CARD FRONT */
          <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-[#0e2c1c] via-[#1b4e31] to-[#0a1f13] text-white rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-taruvar-accent/30 relative overflow-hidden flex flex-col justify-between select-none">
            
            {/* Background Decorative Rings & Watermark */}
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-taruvar-primary/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-taruvar-accent/10 blur-2xl pointer-events-none"></div>

            {/* Top Bar: Official Header & Holographic Badge */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.jpg" alt="Taruvar" className="w-9 h-9 rounded-xl object-contain bg-white p-1" />
                <div>
                  <h4 className="text-base sm:text-lg font-black tracking-wider text-white leading-none">TARUVAR</h4>
                  <p className="text-[9px] font-bold text-taruvar-accent tracking-widest uppercase">One Person. One Tree.</p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-0.5 bg-taruvar-accent/20 border border-taruvar-accent/40 text-taruvar-accent text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                  Official Eco-Guardian
                </span>
                <p className="text-[8px] text-white/60 font-mono mt-0.5">taruvar.org</p>
              </div>
            </div>

            {/* Middle Content: Member & Tree Credentials */}
            <div className="grid grid-cols-12 gap-3 items-center my-auto">
              
              {/* Caretaker Avatar / Icon */}
              <div className="col-span-3 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-taruvar-light to-white p-1 shadow-lg mx-auto flex items-center justify-center overflow-hidden border-2 border-taruvar-accent/50">
                  {photoUrl ? (
                    <img src={photoUrl} alt={guardianName} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-3xl sm:text-4xl">🌱</span>
                  )}
                </div>
                <span className="text-[8px] font-mono text-taruvar-accent/80 block mt-1">VERIFIED ID</span>
              </div>

              {/* Data Fields */}
              <div className="col-span-6 space-y-1 text-left pl-1">
                <div>
                  <p className="text-[8px] text-white/60 uppercase tracking-wider font-bold">Guardian Name</p>
                  <h3 className="text-sm sm:text-base font-extrabold text-white truncate leading-tight">{guardianName}</h3>
                </div>

                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <div>
                    <p className="text-[7px] text-white/60 uppercase font-bold">Member ID</p>
                    <p className="text-[9px] sm:text-[10px] font-mono font-bold text-taruvar-accent">{memberId}</p>
                  </div>
                  <div>
                    <p className="text-[7px] text-white/60 uppercase font-bold">Tree ID</p>
                    <p className="text-[9px] sm:text-[10px] font-mono font-bold text-white">{treeId}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[7px] text-white/60 uppercase font-bold">Species & Location</p>
                  <p className="text-[9px] font-semibold text-white/90 truncate">{species}</p>
                  <p className="text-[8px] text-white/60 truncate">{location}</p>
                </div>
              </div>

              {/* Scannable Live QR Code */}
              <div className="col-span-3 text-center">
                <div className="bg-white p-1 rounded-xl shadow-md inline-block">
                  <img src={qrDataUrl} alt="QR Code" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
                </div>
                <p className="text-[7px] text-white/70 tracking-tight mt-0.5">Scan to Verify</p>
              </div>

            </div>

            {/* Bottom Bar: Verification Level & Micro-Security Text */}
            <div className="flex items-center justify-between border-t border-white/15 pt-2 text-[8px] text-white/70">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-taruvar-accent">Status:</span>
                <span>{verifiedMonths}/5 Months Verified ({verifiedMonths >= 5 ? '★ Level 5 Champion' : `Level ${verifiedMonths} Guardian`})</span>
              </div>
              <span className="font-mono text-[7px] text-white/50">SECURE PASSPORT • TRV-GOV-2026</span>
            </div>

          </div>
        ) : (
          /* CARD BACK */
          <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-[#0a1f13] via-[#133822] to-[#0e2c1c] text-white rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-taruvar-accent/30 relative overflow-hidden flex flex-col justify-between select-none">
            
            <div className="border-b border-white/15 pb-2 flex items-center justify-between">
              <h5 className="text-xs font-bold text-taruvar-accent uppercase tracking-wider">5-Month Milestone Verification Log</h5>
              <span className="text-[8px] text-white/60 font-mono">ID: {treeId}</span>
            </div>

            {/* 5 Milestone Verification Circles */}
            <div className="grid grid-cols-5 gap-2 text-center my-2">
              {[1, 2, 3, 4, 5].map((m) => {
                const isChecked = m <= verifiedMonths;
                return (
                  <div key={m} className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                    isChecked 
                      ? 'bg-taruvar-primary/20 border-taruvar-accent text-white' 
                      : 'bg-black/20 border-white/10 text-white/40'
                  }`}>
                    <span className="text-[8px] font-bold uppercase">Month {m}</span>
                    <span className="text-xs sm:text-sm font-bold mt-0.5">{isChecked ? '✓' : '○'}</span>
                    <span className="text-[7px] text-white/60">{isChecked ? 'Verified' : 'Pending'}</span>
                  </div>
                );
              })}
            </div>

            {/* Official Guardian Oath */}
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 text-[8px] sm:text-[9px] text-white/80 leading-relaxed italic">
              "I hereby promise to protect, water, and document this tree under the philosophy of Paalna (देखभाल). One person can start a movement; one tree can build a forest."
            </div>

            {/* Signatures & Contact */}
            <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[8px] text-white/60">
              <span>Auth: Taruvar Movement Foundation</span>
              <span>Help: teamtaruvar@gmail.com • +91 8543964107</span>
            </div>

          </div>
        )}
      </div>

      <p className="text-[11px] text-taruvar-muted text-center leading-relaxed">
        🖨️ <strong>Print Ready:</strong> This ID card is generated with standard PVC card dimensions. Tapping <strong>Print ID Card</strong> opens a print layout sized for physical ID card printers and badges.
      </p>

    </div>
  );
}
