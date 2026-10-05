import React from 'react';
import { X, Printer, ExternalLink } from 'lucide-react';
import {
  PlanCapacitacion,
  SesionEjecutada,
  AsistenciaCalificacion,
  PrintTemplateType,
} from '../../types/capacitaciones';
import { CompanyInfo, HazardRecord } from '../../types';
import { PrintTemplates } from './PrintTemplates';

interface DocumentoImpresionModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: PrintTemplateType;
  plan?: PlanCapacitacion;
  sesion?: SesionEjecutada;
  asistencias?: AsistenciaCalificacion[];
  planes?: PlanCapacitacion[];
  company: CompanyInfo;
  hazards?: HazardRecord[];
}

export function DocumentoImpresionModal({
  isOpen,
  onClose,
  template,
  plan,
  sesion,
  asistencias = [],
  planes = [],
  company,
  hazards = [],
}: DocumentoImpresionModalProps) {
  if (!isOpen) return null;

  const titleMap: Record<PrintTemplateType, { title: string; subtitle: string; landscape?: boolean }> = {
    ACTA_OFICIAL: {
      title: `Acta Oficial de Capacitación y Evaluación • ${plan?.codigo || 'SG-SST'}`,
      subtitle: 'Formato institucional conforme al Decreto 1072/2015 y Resolución 0312/2019 Est. 2.2.1',
    },
    LISTA_ASISTENCIA: {
      title: `Planilla de Asistencia en Campo (Sin Notas) • ${plan?.codigo || 'SG-SST'}`,
      subtitle: 'Formato físico para registro autógrafo de operarios en talleres y fosas de mantenimiento',
    },
    CRONOGRAMA_ANUAL: {
      title: `Cronograma Anual de Capacitación (2026 - 2027) • ${company.name}`,
      subtitle: 'Matriz anual de 12 meses para auditoría de ARL y Ministerio del Trabajo',
      landscape: true,
    },
    REPORTE_COBERTURA: {
      title: `Informe Ejecutivo de Cobertura y Eficacia • ${company.name}`,
      subtitle: 'Tablero oficial de indicadores cuantitativos del SG-SST (Horas, Cobertura, Eficacia)',
    },
  };

  const currentInfo = titleMap[template];

  const getCleanDocumentHtml = (innerHtml: string, autoPrint: boolean = false) => {
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${currentInfo.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      margin: 8mm;
      color: #000;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11.5px; }
    th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; }
    .avoid-break, tr { page-break-inside: avoid; break-inside: avoid; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: bold; }
    .font-extrabold { font-weight: 800; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    .grid { display: grid; }
    .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
    .col-span-12 { grid-column: span 12 / span 12; }
    .col-span-6 { grid-column: span 6 / span 6; }
    .col-span-4 { grid-column: span 4 / span 4; }
    .col-span-3 { grid-column: span 3 / span 3; }
    .col-span-2 { grid-column: span 2 / span 2; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-8 { gap: 2rem; }
    .p-1 { padding: 0.25rem; }
    .p-1\\.5 { padding: 0.375rem; }
    .p-2 { padding: 0.5rem; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .border { border: 1px solid #000; }
    .border-black { border-color: #000; }
    .border-dotted { border-style: dotted; }
    .border-t { border-top: 1px solid #000; }
    .border-b { border-bottom: 1px solid #000; }
    .border-b-2 { border-bottom: 2px solid #000; }
    .pt-1 { padding-top: 0.25rem; }
    .pt-1\\.5 { padding-top: 0.375rem; }
    .pt-2 { padding-top: 0.5rem; }
    .pt-4 { padding-top: 1rem; }
    .pt-5 { padding-top: 1.25rem; }
    .pt-6 { padding-top: 1.5rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .pb-3 { padding-bottom: 0.75rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mt-0\\.5 { margin-top: 0.125rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-1\\.5 { margin-top: 0.375rem; }
    .text-xs { font-size: 11px; }
    .text-sm { font-size: 13px; }
    .text-base { font-size: 15px; }
    .text-lg { font-size: 17px; }
    .text-xl { font-size: 20px; }
    .text-2xl { font-size: 24px; }
    .leading-tight { line-height: 1.25; }
    .leading-snug { line-height: 1.35; }
    .leading-relaxed { line-height: 1.5; }
    .w-full { width: 100%; }
    .w-1\\/4 { width: 25%; }
    .w-2\\/4 { width: 50%; }
    .w-3\\/4 { width: 75%; }
    .w-10 { width: 2.5rem; }
    .w-16 { width: 4rem; }
    .w-20 { width: 5rem; }
    .w-24 { width: 6rem; }
    .w-28 { width: 7rem; }
    .w-32 { width: 8rem; }
    .w-56 { width: 14rem; }
    .h-11 { height: 2.75rem; }
    .align-middle { vertical-align: middle; }
    .align-bottom { vertical-align: bottom; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .space-y-1 > * + * { margin-top: 0.25rem; }
    .space-y-1\\.5 > * + * { margin-top: 0.375rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .bg-white { background-color: #ffffff; }
    .bg-slate-200 { background-color: #e2e8f0; }
    .bg-slate-100 { background-color: #f1f5f9; }
    .text-slate-900 { color: #0f172a; }
    .text-slate-800 { color: #1e293b; }
    .text-slate-700 { color: #334155; }
    .text-slate-600 { color: #475569; }
    .text-slate-500 { color: #64748b; }
    .text-slate-400 { color: #94a3b8; }
    .text-emerald-800 { color: #065f46; }
    .text-amber-800 { color: #92400e; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    @page {
      size: ${currentInfo.landscape ? 'landscape' : 'portrait'};
      margin: 8mm;
    }
    @media print {
      .clean-toolbar-actions { display: none !important; }
      body { margin: 0; padding: 0; }
    }
  </style>
  ${
    autoPrint
      ? `<script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    });
  </script>`
      : ''
  }
</head>
<body>
  {/* Floating Header Actions only visible on screen, hidden on print */}
  <div class="clean-toolbar-actions" style="background:#0f172a; color:#fff; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; font-family:sans-serif; margin-bottom:16px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.15);">
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:16px;">📄</span>
      <div>
        <div style="font-weight:bold; font-size:13.5px; color:#fff;">${currentInfo.title}</div>
        <div style="font-size:11.5px; color:#94a3b8;">${currentInfo.subtitle}</div>
      </div>
    </div>
    <div style="display:flex; gap:10px;">
      <button onclick="window.print()" style="background:#2563eb; color:#fff; border:none; padding:8px 18px; border-radius:8px; font-weight:bold; font-size:12.5px; cursor:pointer; display:flex; align-items:center; gap:6px;">
        🖨️ Imprimir Esta Hoja
      </button>
      <button onclick="window.close()" style="background:#334155; color:#cbd5e1; border:none; padding:8px 14px; border-radius:8px; font-weight:bold; font-size:12.5px; cursor:pointer;">
        ✕ Cerrar Ventana
      </button>
    </div>
  </div>

  ${innerHtml}
</body>
</html>`;
  };

  // Botón 1: Abrir en Ventana Limpia independiente (previsualización aislada)
  const handleOpenCleanWindow = () => {
    const printContent = document.getElementById('printable-sheet-target');
    if (!printContent) return;

    try {
      const printWindow = window.open('', '_blank', 'width=1000,height=850,menubar=no,toolbar=no');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(getCleanDocumentHtml(printContent.innerHTML, false));
        printWindow.document.close();
      }
    } catch (e) {
      console.error('Error abriendo ventana limpia:', e);
    }
  };

  // Botón 2: Imprimir (Abre la ventana limpia y dispara inmediatamente window.print() de esa sola hoja)
  // ESTO GARANTIZA QUE SE IMPRIMA 1 SOLA HOJA (EL DOCUMENTO LIMPIO) Y NUNCA LAS 3 HOJAS DEL DASHBOARD
  const handleExecutePrint = () => {
    const printContent = document.getElementById('printable-sheet-target');
    if (!printContent) return;

    try {
      const printWindow = window.open('', '_blank', 'width=1000,height=850,menubar=no,toolbar=no');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(getCleanDocumentHtml(printContent.innerHTML, true));
        printWindow.document.close();
      }
    } catch (e) {
      console.error('Error al imprimir documento:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 font-sans text-sm print-modal-backdrop">
      <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden flex flex-col h-[96vh] sm:h-[94vh]">
        {/* Header Bar con EXACTAMENTE DOS BOTONES DE ACCIÓN: "Ventana Limpia" e "Imprimir" */}
        <div className="px-3.5 sm:px-7 py-3 sm:py-4 bg-slate-900 text-white flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Printer className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-white flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">{currentInfo.title}</span>
                {currentInfo.landscape && (
                  <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30 shrink-0 font-bold">
                    Horizontal
                  </span>
                )}
              </h2>
              <p className="text-[11px] sm:text-sm text-slate-400 truncate mt-0.5">{currentInfo.subtitle}</p>
            </div>
          </div>

          {/* EXACTLY TWO BUTTONS as requested: "Ventana Limpia" y "Imprimir" */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {/* Botón 1: Ventana Limpia */}
            <button
              type="button"
              onClick={handleOpenCleanWindow}
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer border border-slate-700 shadow-xs"
              title="Abrir el documento aislado en una ventana o pestaña limpia"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
              <span>Ventana Limpia</span>
            </button>

            {/* Botón 2: Imprimir */}
            <button
              type="button"
              onClick={handleExecutePrint}
              className="px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-md hover:shadow-blue-500/25"
              title="Imprimir únicamente la hoja del documento oficial (1 hoja)"
            >
              <Printer className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
              <span>Imprimir</span>
            </button>

            {/* Cerrar modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer ml-0.5"
              title="Cerrar vista previa"
            >
              <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-8 flex justify-center bg-slate-200/80">
          <div
            id="printable-sheet-target"
            className={`bg-white shadow-xl border border-slate-300 rounded-sm p-4 sm:p-10 w-full text-black transition-all overflow-x-auto ${
              currentInfo.landscape ? 'max-w-[1100px]' : 'max-w-[850px]'
            }`}
          >
            {/* The Print Templates content rendered visibly inside this paper preview */}
            <div className="font-sans text-black bg-white">
              <PrintTemplates
                template={template}
                plan={plan}
                sesion={sesion}
                asistencias={asistencias}
                planes={planes}
                company={company}
                hazards={hazards}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
