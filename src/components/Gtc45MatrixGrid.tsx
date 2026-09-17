interface Gtc45MatrixGridProps {
  currentNp: number;
  currentNc: number;
  onSelectCell?: (np: number, nc: number) => void;
  compact?: boolean;
}

export function Gtc45MatrixGrid({ currentNp, currentNc, onSelectCell, compact = false }: Gtc45MatrixGridProps) {
  // GTC 45 typically maps 5 levels of probability (rows: 5 at top down to 1 at bottom)
  // and 5 levels of severity / consequence (cols: 1 on left to 5 on right)
  const rows = [5, 4, 3, 2, 1];
  const cols = [1, 2, 3, 4, 5];

  const getCellColor = (np: number, nc: number, isSelected: boolean) => {
    const nr = np * nc;
    if (isSelected) {
      if (nr >= 16) return 'bg-[#DC2626] text-white border-2 border-[#0F172A] shadow-sm';
      if (nr >= 9) return 'bg-[#EA580C] text-white border-2 border-[#0F172A] shadow-sm';
      if (nr >= 4) return 'bg-[#CA8A04] text-white border-2 border-[#0F172A] shadow-sm';
      return 'bg-[#16A34A] text-white border-2 border-[#0F172A] shadow-sm';
    }

    if (nr >= 16) return 'bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#991B1B] border border-red-200';
    if (nr >= 9) return 'bg-[#FFEDD5] hover:bg-[#FDBA74] text-[#9A3412] border border-orange-200';
    if (nr >= 4) return 'bg-[#FEF9C3] hover:bg-[#FDE047] text-[#854D0E] border border-yellow-200';
    return 'bg-[#EFF6FF] hover:bg-[#BFDBFE] text-[#1E40AF] border border-blue-200';
  };

  return (
    <div className="w-full bg-white rounded-md p-3 border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-600">
          {compact ? 'Ubicación en Cuadrícula GTC 45' : 'MAPA DE CUADRANTE GTC 45'}
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          NP: {currentNp} × NC: {currentNc} = <strong className="text-slate-800">{currentNp * currentNc}</strong>
        </span>
      </div>

      {/* Grid container */}
      <div className="space-y-1">
        {rows.map((np) => (
          <div key={`row-${np}`} className="flex gap-1 items-center">
            <span className="w-4 text-[9px] font-mono text-slate-400 text-right pr-1">P{np}</span>
            <div className="grid grid-cols-5 gap-1 flex-1">
              {cols.map((nc) => {
                const isSelected = currentNp === np && currentNc === nc;
                const score = np * nc;
                return (
                  <button
                    key={`cell-${np}-${nc}`}
                    type="button"
                    onClick={() => onSelectCell && onSelectCell(np, nc)}
                    disabled={!onSelectCell}
                    className={`h-5 flex items-center justify-center rounded-xs text-[10px] font-mono font-semibold transition-all ${getCellColor(
                      np,
                      nc,
                      isSelected
                    )} ${onSelectCell ? 'cursor-pointer' : 'cursor-default'}`}
                    title={`Probabilidad: ${np}, Severidad: ${nc} (NR: ${score})`}
                  >
                    {isSelected ? `${score}✱` : score}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-100 text-[9px] font-mono text-slate-400">
        <span>Menor Severidad (1)</span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-xs bg-[#EFF6FF] border border-blue-200" title="Aceptable" />
          <span className="inline-block w-2 h-2 rounded-xs bg-[#FEF9C3] border border-yellow-200" title="Mejorable" />
          <span className="inline-block w-2 h-2 rounded-xs bg-[#FFEDD5] border border-orange-200" title="Alto" />
          <span className="inline-block w-2 h-2 rounded-xs bg-[#FEE2E2] border border-red-200" title="Crítico" />
        </span>
        <span>Mayor Severidad (5)</span>
      </div>
    </div>
  );
}

export function CompactSeverityTable({ currentNp, currentNc }: { currentNp: number; currentNc: number }) {
  const tableData = [
    { label: '4 (Grave)', cols: [{ nc: 1, val: 4 }, { nc: 2, val: 8 }, { nc: 3, val: 12 }, { nc: 5, val: 20 }] },
    { label: '3 (Medio)', cols: [{ nc: 1, val: 3 }, { nc: 2, val: 6 }, { nc: 3, val: 9 }, { nc: 5, val: 15 }] },
  ];

  return (
    <div className="w-full bg-white rounded border border-slate-200 p-2.5">
      <div className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-tight mb-2 flex items-center justify-between">
        <span>Ubicación en Cuadrícula de Severidad</span>
        <span className="text-[10px] text-red-600 font-mono font-semibold">NR Actual: {currentNp * currentNc}</span>
      </div>

      <div className="border border-slate-200 rounded overflow-hidden text-center text-[10px] font-mono">
        <div className="grid grid-cols-5 bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold py-1">
          <div>NC/NP</div>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>5</div>
        </div>

        {tableData.map((row, idx) => (
          <div key={idx} className="grid grid-cols-5 border-b last:border-b-0 border-slate-200 py-1 items-center">
            <div className="bg-slate-50 text-slate-600 font-medium text-[9px] px-1">{row.label}</div>
            {row.cols.map((col, cIdx) => {
              const isMatch = (currentNc === 4 && row.label.startsWith('4') && ((col.nc === 1 && currentNp === 1) || (col.nc === 2 && currentNp === 2) || (col.nc === 3 && currentNp === 3) || (col.nc === 5 && currentNp >= 4))) ||
                (currentNc === 3 && row.label.startsWith('3') && ((col.nc === 1 && currentNp === 1) || (col.nc === 2 && currentNp === 2) || (col.nc === 3 && currentNp === 3) || (col.nc === 5 && currentNp >= 4)));
              
              let bg = 'bg-yellow-50 text-yellow-900';
              if (col.val >= 16) bg = isMatch ? 'bg-[#DC2626] text-white font-bold' : 'bg-red-100 text-red-800';
              else if (col.val >= 9) bg = isMatch ? 'bg-[#EA580C] text-white font-bold' : 'bg-amber-100 text-amber-800';
              else bg = isMatch ? 'bg-[#CA8A04] text-white font-bold' : 'bg-yellow-50 text-yellow-800';

              return (
                <div key={cIdx} className={`py-1 ${bg} border-l border-slate-200`}>
                  {col.val} {isMatch ? '✱' : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
