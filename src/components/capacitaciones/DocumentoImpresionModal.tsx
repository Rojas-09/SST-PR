import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText, ExternalLink } from 'lucide-react';
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
      title: `Cronograma Anual de Capacitación 2025 • ${company.name}`,
      subtitle: 'Matriz anual de 12 meses para auditoría de ARL y Ministerio del Trabajo',
      landscape: true,
    },
    REPORTE_COBERTURA: {
      title: `Informe Ejecutivo de Cobertura y Eficacia • ${company.name}`,
      subtitle: 'Tablero oficial de indicadores cuantitativos del SG-SST (Horas, Cobertura, Eficacia)',
    },
  };

  const currentInfo = titleMap[template];

  const handleExecutePrint = () => {
    window.print();
  };

  // Direct clean window print fallback (useful if iframe suppresses dialogs)
  const handleDirectPrintWindow = () => {
    const printContent = document.getElementById('printable-sheet-target');
    if (!printContent) {
      window.print();
      return;
    }

    try {
      const printWindow = window.open('', '_blank', 'width=950,height=800');
      if (printWindow) {
        printWindow.document.write(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${currentInfo.title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 11px; margin: 10mm; color: #000; background: #fff; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px; }
    th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; }
    .avoid-break { page-break-inside: avoid; break-inside: avoid; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    @page { size: ${currentInfo.landscape ? 'landscape' : 'portrait'}; margin: 8mm; }
  </style>
</head>
<body>
  ${printContent.innerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 font-sans text-[13px] print-modal-backdrop">
      <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden flex flex-col h-[94vh] print-modal-container">
        {/* Header Bar (hidden on print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print-modal-header no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentInfo.title}</span>
                {currentInfo.landscape && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    Orientación Horizontal (Landscape)
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">{currentInfo.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExecutePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-blue-500/20"
              title="Abrir cuadro de diálogo de impresión / Guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDirectPrintWindow}
              className="hidden sm:flex px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              title="Abrir en ventana limpia de impresión"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ventana Limpia</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-1"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-200/70 print-sheet-wrapper">
          <div
            id="printable-sheet-target"
            className={`bg-white shadow-xl border border-slate-300 rounded-sm p-6 sm:p-8 w-full text-black transition-all print-paper-sheet ${
              currentInfo.landscape ? 'max-w-[1100px]' : 'max-w-[850px]'
            }`}
          >
            {/* The Print Templates content rendered visibly inside this paper preview */}
            <div className="font-sans text-black bg-white printable-content">
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

        {/* Footer info bar (hidden on print) */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0 print-modal-footer no-print">
          <span className="flex items-center gap-1.5 text-[11.5px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Documento oficial de SG-SST • {company.name} (NIT {company.nit})</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[11px] text-slate-400">
              Elija "Guardar como PDF" o seleccione su impresora en el diálogo.
            </span>
            <button
              type="button"
              onClick={handleExecutePrint}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Documento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
