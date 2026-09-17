import { useState, FormEvent } from 'react';
import { X, CheckSquare, ShieldCheck, PenTool, CheckCircle2 } from 'lucide-react';
import { HazardRecord, CompanyInfo } from '../types';
import { SignatureCarlosMendez } from './SignatureSvgs';

interface ActaEntregaModalProps {
  isOpen: boolean;
  onClose: () => void;
  hazard: HazardRecord;
  company: CompanyInfo;
  onConfirmDelivery: (hazardId: string, recipientName: string, recipientId: string) => void;
}

export function ActaEntregaModal({
  isOpen,
  onClose,
  hazard,
  company,
  onConfirmDelivery,
}: ActaEntregaModalProps) {
  const [operarioNombre, setOperarioNombre] = useState('Pedro Morales Arango');
  const [operarioCedula, setOperarioCedula] = useState('1.020.458.912');
  const [cargoOperario, setCargoOperario] = useState('Operario Soldador - Patio 2');
  const [observaciones, setObservaciones] = useState(
    'Se realiza prueba de oscurecimiento automático de careta electrónica fotosensible y verificación de costuras de Kevlar en guantes largos de 16".'
  );
  const [acknowledged, setAcknowledged] = useState(true);

  if (!isOpen) return null;

  const handleSignAndConfirm = (e: FormEvent) => {
    e.preventDefault();
    onConfirmDelivery(hazard.id, operarioNombre, operarioCedula);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#0F172A] text-amber-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-chivo leading-tight">
                Acta Oficial de Dotación y Entrega de EPP
              </h3>
              <p className="text-[10px] font-mono text-slate-500">
                Cumplimiento Art. 2.2.4.6.24 Dec. 1072 / Res. 0312 • Código: ACT-EPP-2025-04
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSignAndConfirm} className="p-6 space-y-5 text-xs">
          {/* Target Hazard Info */}
          <div className="p-3 bg-red-50/70 border border-red-200 rounded">
            <span className="text-[10px] font-mono uppercase text-red-700 font-bold block">
              PELIGRO ASOCIADO A INTERVENIR:
            </span>
            <h4 className="font-bold text-slate-900 text-xs mt-0.5">{hazard.title}</h4>
            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2 font-mono">
              <span>ID: {hazard.code}</span> • <span>Nivel: {hazard.evaluacion.levelText}</span> • <span>Área: {hazard.zonaLugar}</span>
            </div>
          </div>

          {/* List of EPP Equipment delivered */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Elementos de Protección Personal Entregados e Inspeccionados:
            </label>
            <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded">
              {hazard.planIntervencion.epp.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Worker Receiving */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Trabajador Receptor:
              </label>
              <input
                type="text"
                value={operarioNombre}
                onChange={(e) => setOperarioNombre(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cédula de Ciudadanía (C.C.):
              </label>
              <input
                type="text"
                value={operarioCedula}
                onChange={(e) => setOperarioCedula(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-medium font-mono"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo / Bahía Operativa:
              </label>
              <input
                type="text"
                value={cargoOperario}
                onChange={(e) => setCargoOperario(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-medium"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones y Verificación Técnica de Ajuste:
              </label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 leading-relaxed"
              />
            </div>
          </div>

          {/* Signature Previews */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">
                FIRMA RESPONSABLE SST (EMISOR)
              </span>
              <div className="h-12 flex items-center">
                <SignatureCarlosMendez className="w-40 h-10" />
              </div>
              <span className="font-bold text-slate-800 block leading-tight">{company.responsableSST.nombre}</span>
              <span className="text-[10px] font-mono text-slate-500">Lic. {company.responsableSST.licencia}</span>
            </div>

            <div className="border-l border-slate-200 pl-4">
              <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">
                FIRMA TRABAJADOR BENEFICIARIO
              </span>
              <div className="h-12 flex items-center font-mono text-[11px] text-slate-500 italic">
                [ Firma digital biométrica registrada ]
              </div>
              <span className="font-bold text-slate-800 block leading-tight">{operarioNombre}</span>
              <span className="text-[10px] font-mono text-slate-500">C.C. {operarioCedula}</span>
            </div>
          </div>

          <label className="flex items-start gap-2 p-2 bg-blue-50/60 border border-blue-200 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#D97706] focus:ring-[#D97706]"
              required
            />
            <span className="text-[11px] text-slate-700 leading-snug">
              Certifico que los elementos cumplen con las especificaciones técnicas homologadas y que el trabajador ha recibido inducción sobre su uso obligatorio, mantenimiento y reposición.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!acknowledged}
              className="px-5 py-2 bg-[#8D4B00] hover:bg-[#6E3900] disabled:opacity-50 text-white font-bold rounded text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <CheckSquare className="w-4 h-4 text-white" />
              <span>Convalidar y Foliar Entrega EPP</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
