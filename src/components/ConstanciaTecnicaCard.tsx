import { useState } from 'react';
import { Check, Copy, CheckCheck, ShieldCheck } from 'lucide-react';
import { CompanyInfo } from '../types';

interface ConstanciaTecnicaCardProps {
  company: CompanyInfo;
  onUpdateCompany?: (updated: CompanyInfo) => void;
  className?: string;
}

export function ConstanciaTecnicaCard({
  company,
  onUpdateCompany,
  className = '',
}: ConstanciaTecnicaCardProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  const fullHash = '739c8b21e84a2f019bca40291e0f3128b9c7e012fa19e8c401bca9104e';

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(fullHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleToggleAprobacion = () => {
    if (!onUpdateCompany) return;

    const currentStatus = company.representanteLegal.estadoAprobacion;
    const nextStatus = currentStatus === 'APROBADO' ? 'PENDIENTE CONVALIDACIÓN' : 'APROBADO';

    onUpdateCompany({
      ...company,
      representanteLegal: {
        ...company.representanteLegal,
        estadoAprobacion: nextStatus,
      },
    });
    setShowSignModal(false);
  };

  const isAprobado = company.representanteLegal.estadoAprobacion === 'APROBADO';

  return (
    <div
      id="constancia-tecnica-juridica"
      className={`bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4 ${className}`}
    >
      {/* Top Header matching exact screenshot */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <h3 className="text-[12.5px] font-bold uppercase tracking-wide text-slate-800">
          CONSTANCIA TÉCNICA Y RESPONSABILIDAD JURÍDICA
        </h3>
        <span className="text-[11.5px] text-slate-500">
          Art. 10 - Perfil idóneo según nivel de riesgo
        </span>
      </div>

      {/* Two Signatory Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-1">
        {/* Signer 1: Responsable SST */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              RESPONSABLE DE ELABORACIÓN Y CALIFICACIÓN SST
            </span>
            <h4 className="text-[13.5px] font-bold text-slate-900 mt-1">
              {company.responsableSST.nombre}
            </h4>
            <p className="text-[12.5px] text-slate-600 font-medium">
              {company.responsableSST.cargo}
            </p>
            <p className="text-[11.5px] text-slate-500 mt-1">
              Licencia SST: 18492-2018 (SDS) • Curso 50h:{' '}
              <span className="text-blue-700 font-semibold">Vigente</span>
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <span className="text-[12px] text-slate-700 font-medium">
              Firma electrónica registrada
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              title="Copiar HASH criptográfico de firma"
              className="text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedHash ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado</span>
                </>
              ) : (
                <>
                  <span>HASH: 739c8b21...4E</span>
                  <Copy className="w-3 h-3 text-slate-400" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Signer 2: Representante Legal */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              REPRESENTANTE LEGAL DE LA ORGANIZACIÓN
            </span>
            <h4 className="text-[13.5px] font-bold text-slate-900 mt-1">
              {company.representanteLegal.nombre}
            </h4>
            <p className="text-[12.5px] text-slate-600 font-medium">
              {company.representanteLegal.cargo} • {company.name}
            </p>
            <p className="text-[11.5px] text-slate-500 mt-1">
              C.C.: {company.representanteLegal.cedula} • NIT: {company.nit}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <span className="text-[12px] text-slate-700 font-medium">
              Firma y aprobación directiva
            </span>
            {isAprobado ? (
              <button
                type="button"
                onClick={handleToggleAprobacion}
                title="Haga clic para revertir firma directiva si es necesario"
                className="text-[11px] font-semibold text-white bg-[#1877F2] hover:bg-[#1464CC] px-3 py-1 rounded-lg border border-[#1877F2] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>APROBADO DIRECTIVA</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleAprobacion}
                title="Convalidar y firmar directivamente como Representante Legal"
                className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1 rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-2xs"
              >
                PENDIENTE CONVALIDACIÓN
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="pt-3 border-t border-slate-200 text-center text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
        Diagnóstico técnico parametrizado conforme a la Tabla de Valores y Calificación de la{' '}
        <strong className="text-slate-700">Resolución 0312 de 2019</strong> y{' '}
        <strong className="text-slate-700">Decreto 1072 de 2015</strong> del Ministerio del Trabajo de la
        República de Colombia.
      </div>
    </div>
  );
}
