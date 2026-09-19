import React, { useState } from 'react';
import { Printer, RotateCw, ShieldCheck, Sparkles } from 'lucide-react';

export default function GuardianIdCard({ 
  guardianName = 'Naveen Sharma',
  memberId = 'TRV-IND-2026-4821',
  treeId = 'TRV-TREE-8092',
  species = 'Peepal Tree (Ficus religiosa)',
  plantedDate = '15 Aug 2026',
  location = 'Sector 4 Green Park, Delhi NCR',
  verifiedMonths = 3,
  photoUrl = null,
  isBulk = false,
  orgName = null,
  treeCount = 1,
  treeStatus = 'approved'
}) {
  const [showBack, setShowBack] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Generate QR code data URL
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://taruvar.org/journey/${treeId}&color=0d2b1a&bgcolor=ffffff`;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      
      {/* Interactive Controls Bar */}
      <div className="flex items-center justify-between gap-3 bg-taruvar-bg p-3.5 rounded-2xl border border-taruvar-border">
        <button
          onClick={() => setShowBack(!showBack)}
          className="px-4 py-2.5 bg-white text-taruvar-dark hover:text-taruvar-secondary border border-taruvar-border rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <RotateCw className="w-4 h-4 text-taruvar-secondary" />
          <span>{showBack ? 'View Front Side' : 'Flip to Back Side'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            title="Print Physical PVC ID Card"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {/* Printable Card Container */}
      <div id="printable-guardian-card" className="perspective-1000 w-full">
        {!showBack ? (
          /* CARD FRONT */
          <div className="w-full min-h-[290px] sm:min-h-[310px] bg-gradient-to-br from-[#0a1f13] via-[#143a24] to-[#0d2819] text-white rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-taruvar-accent/35 relative overflow-hidden flex flex-col justify-between select-none">
            
            {/* Background Decorative Lighting */}
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-taruvar-primary/15 blur-2xl pointer-events-none"></div>
            <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-taruvar-accent/15 blur-2xl pointer-events-none"></div>

            {/* Top Header: Logo + Brand + Official Stamp */}
            <div className="flex items-center justify-between border-b border-white/20 pb-3 gap-2">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.jpg" 
                  alt="TARUVAR Logo" 
                  className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl object-contain bg-white p-0.5 shadow-sm shrink-0" 
                />
                <div>
                  <h4 className="text-base sm:text-xl font-black tracking-wider text-white leading-none font-sans">
                    TARUVAR
                  </h4>
                  <p className="text-[9px] sm:text-[11px] font-bold text-taruvar-accent tracking-widest uppercase mt-0.5">
                    One Person. One Tree.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-3 py-1 bg-taruvar-accent/20 border border-taruvar-accent/50 text-taruvar-accent text-[9px] sm:text-[11px] font-extrabold rounded-full uppercase tracking-wider inline-block">
                  {isBulk ? '🏢 Org Master Badge' : 'Official Eco-Guardian'}
                </span>
                <p className="text-[8px] sm:text-[9px] text-white/70 font-mono mt-1">taruvar.org</p>
              </div>
            </div>

            {/* Middle Content: Avatar + Information + Scannable QR */}
            <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center my-3">
              
              {/* Photo / Avatar */}
              <div className="col-span-3 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-taruvar-light to-white p-1 shadow-md flex items-center justify-center overflow-hidden border-2 border-taruvar-accent/60">
                  {photoUrl ? (
                    <img src={photoUrl} alt={guardianName} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-3xl sm:text-4xl">{isBulk ? '🏢' : '🌱'}</span>
                  )}
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-taruvar-accent font-bold mt-1 tracking-wider uppercase">
                  VERIFIED ID
                </span>
              </div>

              {/* Data Details (Spacious, No Clipping) */}
              <div className="col-span-6 space-y-1.5 text-left pl-1">
                <div>
                  <p className="text-[8px] sm:text-[9px] text-white/70 uppercase tracking-wider font-bold">
                    {isBulk ? 'Organization / Coordinator' : 'Guardian Name'}
                  </p>
                  <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-white leading-tight break-words">
                    {guardianName} {orgName && <span className="text-[11px] font-normal text-taruvar-accent block">({orgName})</span>}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <p className="text-[7px] sm:text-[8px] text-white/70 uppercase font-bold">Member ID</p>
                    <p className="text-[9px] sm:text-[11px] font-mono font-black text-taruvar-accent break-all">{memberId}</p>
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] text-white/70 uppercase font-bold">{isBulk ? 'Batch Trees' : 'Tree ID'}</p>
                    <p className="text-[9px] sm:text-[11px] font-mono font-black text-white break-all">
                      {isBulk ? `${treeCount} Trees (${treeId})` : treeId}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[7px] sm:text-[8px] text-white/70 uppercase font-bold">Species & Location</p>
                  <p className="text-[9px] sm:text-[11px] font-semibold text-white/95 leading-tight">{species}</p>
                  <p className="text-[8px] sm:text-[10px] text-white/70 leading-tight mt-0.5">{location}</p>
                </div>
              </div>

              {/* Scannable Live QR Code */}
              <div className="col-span-3 text-center flex flex-col items-center justify-center">
                <div className="bg-white p-1.5 rounded-xl shadow-md inline-block">
                  <img src={qrDataUrl} alt="QR Code" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
                </div>
                <p className="text-[7px] sm:text-[8px] text-white/80 font-medium tracking-tight mt-1">Scan to Verify</p>
              </div>

            </div>

            {/* Bottom Footer: Verification Level & Admin Status */}
            <div className="flex items-center justify-between border-t border-white/20 pt-2.5 text-[8px] sm:text-[10px] text-white/80">
              <div className="flex items-center gap-1.5 font-sans">
                <span className="font-bold text-taruvar-accent">Status:</span>
                <span className={treeStatus === 'pending' ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'}>
                  {treeStatus === 'pending' ? '⏳ Pending Admin Review' : `✓ Certified (${verifiedMonths}/5 Mo)`}
                </span>
              </div>
              <span className="font-mono text-[7px] sm:text-[9px] text-white/60 uppercase">SECURE PASSPORT • TRV-2026</span>
            </div>

          </div>
        ) : (
          /* CARD BACK */
          <div className="w-full min-h-[290px] sm:min-h-[310px] bg-gradient-to-br from-[#0d2819] via-[#143a24] to-[#0a1f13] text-white rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-taruvar-accent/35 relative overflow-hidden flex flex-col justify-between select-none">
            
            <div className="border-b border-white/20 pb-2.5 flex items-center justify-between">
              <h5 className="text-xs sm:text-sm font-black text-taruvar-accent uppercase tracking-wider">
                5-Month Milestone Verification Log
              </h5>
              <span className="text-[9px] sm:text-[10px] text-white/70 font-mono">ID: {treeId}</span>
            </div>

            {/* 5 Milestone Verification Circles */}
            <div className="grid grid-cols-5 gap-2 text-center my-3">
              {[1, 2, 3, 4, 5].map((m) => {
                const isChecked = m <= verifiedMonths;
                return (
                  <div key={m} className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    isChecked 
                      ? 'bg-taruvar-primary/25 border-taruvar-accent text-white shadow-xs' 
                      : 'bg-black/25 border-white/15 text-white/40'
                  }`}>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase">Month {m}</span>
                    <span className="text-xs sm:text-base font-black mt-0.5">{isChecked ? '✓' : '○'}</span>
                    <span className="text-[7px] sm:text-[8px] text-white/70">{isChecked ? 'Verified' : 'Pending'}</span>
                  </div>
                );
              })}
            </div>

            {/* Official Guardian Oath */}
            <div className="bg-black/35 p-3 rounded-2xl border border-white/15 text-[8px] sm:text-[10px] text-white/90 leading-relaxed italic text-center">
              "I hereby promise to protect, water, and document this tree under the philosophy of Paalna (देखभाल). One person can start a movement; one tree can build a forest."
            </div>

            {/* Signatures & Contact */}
            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[8px] sm:text-[10px] text-white/70">
              <span>Auth: Taruvar Foundation</span>
              <span>Help: teamtaruvar@gmail.com • +91 8543964107</span>
            </div>

          </div>
        )}
      </div>

      <p className="text-[11px] text-taruvar-muted text-center leading-relaxed">
        🖨️ <strong>Print Ready:</strong> Sized for standard physical PVC cards. Tapping <strong>Print ID Card</strong> automatically formats for ID card printers and badges.
      </p>

    </div>
  );
}
