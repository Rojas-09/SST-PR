import { X, Phone, Mail, Award, ShieldCheck, UserCheck } from 'lucide-react';
import { CompanyInfo } from '../types';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyInfo;
}

export function ContactsModal({ isOpen, onClose, company }: ContactsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900">Contactos del SG-SST</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Responsable SST */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Responsable Técnico SST
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono-data bg-emerald-50 text-emerald-700 border border-emerald-200">
                Licencia Vigente
              </span>
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">
              {company.responsableSST.nombre}
            </h4>
            <p className="text-slate-500">{company.responsableSST.cargo}</p>
            <p className="text-[11px] font-mono-data text-slate-600">
              Licencia No. {company.responsableSST.licencia}
            </p>
          </div>

          {/* Representante Legal */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Representante Legal
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono-data bg-amber-50 text-amber-800 border border-amber-200">
                Gerencia
              </span>
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">
              {company.representanteLegal.nombre}
            </h4>
            <p className="text-slate-500">{company.representanteLegal.cargo}</p>
            <p className="text-[11px] font-mono-data text-slate-600">
              C.C. {company.representanteLegal.cedula}
            </p>
          </div>

          {/* ARL & Emergencias */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px]">ARL Afiliada:</span>
              <strong className="text-slate-800">
                {company.id === 'servic-crear' ? 'Seguros SURA' : 'Positiva Compañía de Seguros'}
              </strong>
              <span className="text-slate-500 block text-[10px] mt-0.5">
                {company.id === 'servic-crear' ? 'Línea: 018000 511 414' : 'Línea: 018000 111 170'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px]">COPASST / Veeduría:</span>
              <strong className="text-slate-800">Comité Paritario</strong>
              <span className="text-slate-500 block text-[10px] mt-0.5">Acta No. 04-2026</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-black cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
