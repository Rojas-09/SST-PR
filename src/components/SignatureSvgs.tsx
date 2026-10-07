export function SignatureCarlosMendez({ className = "w-48 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 70" className={className} fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Realistic cursive signature representation for Ing. Carlos Méndez */}
      <path d="M20 45 C 35 15, 45 60, 55 25 C 65 35, 75 42, 85 30 C 95 20, 100 50, 110 35 C 120 40, 130 38, 140 32 C 145 28, 150 48, 160 30 C 170 35, 185 30, 210 28" />
      <path d="M30 55 Q 120 50 220 42" strokeWidth="1.5" />
      <path d="M190 20 L 215 48" strokeWidth="1.8" />
    </svg>
  );
}

export function SignatureRodrigoGomez({ className = "w-48 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 70" className={className} fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Realistic cursive signature representation for Rodrigo Gómez Mendoza */}
      <path d="M25 50 C 30 18, 50 15, 55 35 C 60 55, 70 30, 80 40 C 90 20, 105 52, 115 30 C 130 35, 145 32, 160 35 C 175 25, 190 40, 215 35" />
      <path d="M40 30 Q 90 60 200 45" strokeWidth="1.5" />
      <circle cx="215" cy="35" r="2" fill="#1E293B" />
    </svg>
  );
}

export function SignatureAndreaMorales({ className = "w-48 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 70" className={className} fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Realistic cursive signature representation for Ing. Andrea Morales Peña (SERVIC CREAR) */}
      <path d="M15 50 C 25 15, 38 12, 45 42 C 50 25, 60 20, 70 38 C 80 18, 92 48, 105 32 C 115 28, 125 42, 138 28 C 148 40, 160 25, 175 35 C 190 25, 205 32, 222 28" />
      <path d="M25 54 Q 110 46 225 38" strokeWidth="1.6" />
      <path d="M165 18 C 175 14, 190 16, 200 24" strokeWidth="1.5" />
    </svg>
  );
}

export function SignatureClaudiaVaron({ className = "w-48 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 70" className={className} fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Realistic cursive signature representation for Dra. Claudia Patricia Varón (SERVIC CREAR) */}
      <path d="M20 38 C 30 18, 55 16, 50 48 C 65 32, 75 22, 85 45 C 95 30, 110 25, 120 40 C 135 22, 150 42, 170 30 C 185 36, 200 25, 220 32" />
      <path d="M35 58 Q 120 48 215 44" strokeWidth="1.5" />
    </svg>
  );
}

export function QrAuditStamp({ code = "MINTRAD-2026-V02-BOG" }: { code?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-blue-50/60 border border-blue-200/80 rounded">
      <div className="w-16 h-16 bg-white border border-slate-300 p-1 flex items-center justify-center shadow-xs">
        {/* Stylized QR representation */}
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="#0F172A">
          <rect x="2" y="2" width="12" height="12" fill="none" stroke="#0F172A" strokeWidth="2" />
          <rect x="5" y="5" width="6" height="6" fill="#0F172A" />
          
          <rect x="26" y="2" width="12" height="12" fill="none" stroke="#0F172A" strokeWidth="2" />
          <rect x="29" y="5" width="6" height="6" fill="#0F172A" />
          
          <rect x="2" y="26" width="12" height="12" fill="none" stroke="#0F172A" strokeWidth="2" />
          <rect x="5" y="29" width="6" height="6" fill="#0F172A" />
          
          <rect x="18" y="6" width="4" height="4" />
          <rect x="18" y="18" width="4" height="4" />
          <rect x="26" y="18" width="4" height="4" />
          <rect x="6" y="18" width="4" height="4" />
          <rect x="18" y="26" width="4" height="4" />
          <rect x="26" y="26" width="4" height="4" />
          <rect x="34" y="26" width="4" height="4" />
          <rect x="26" y="34" width="4" height="4" />
          <rect x="34" y="34" width="4" height="4" />
        </svg>
      </div>
      <span className="mt-1 text-[10px] font-mono font-bold tracking-tight text-slate-700">SELLO DE AUDITORÍA SG-SST</span>
      <span className="text-[9px] text-slate-500 font-sans">Res. 0312 / Decreto 1072</span>
      <span className="text-[8px] font-mono text-slate-400 mt-0.5">{code}</span>
      <span className="text-[8px] text-emerald-700 font-medium">Válido para inspectores Mintrabajo y ARL</span>
    </div>
  );
}

export function DigitalSignatureStamp({
  name = "Ing. Carlos Méndez",
  role = "Especialista SST",
  license = "SST-2021-9982"
}: {
  name?: string;
  role?: string;
  license?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <SignatureCarlosMendez className="w-36 h-10 text-slate-800" />
      <div className="hidden sm:flex flex-col border-l border-slate-300 pl-2 text-left">
        <span className="text-[10px] font-bold text-slate-700 font-sans">{name}</span>
        <span className="text-[9px] text-slate-500 font-sans">{role}</span>
        <span className="text-[8.5px] font-mono text-slate-400">Lic. {license}</span>
      </div>
    </div>
  );
}

