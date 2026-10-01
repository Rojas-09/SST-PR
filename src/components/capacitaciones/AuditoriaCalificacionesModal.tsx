import React from 'react';
import { X, History, User, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuditoriaCalificacion } from '../../types/capacitaciones';

interface AuditoriaCalificacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditorias: AuditoriaCalificacion[];
  codigoSesion: string;
}

export function AuditoriaCalificacionesModal({
  isOpen,
  onClose,
  auditorias,
  codigoSesion,
}: AuditoriaCalificacionesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 font-sans text-[13px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Pista de Auditoría Append-Only de Calificaciones
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {codigoSesion}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Registro inmutable de modificaciones normativas según Decreto 1072/2015
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {auditorias.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
              <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-xs text-slate-700">Sin cambios registrados aún</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Todas las calificaciones se mantienen en su valor original o no han sido modificadas.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse table-stack">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    <th className="py-2.5 px-3">Trabajador</th>
                    <th className="py-2.5 px-3 text-center">Cambio de Nota</th>
                    <th className="py-2.5 px-3">Autor y Rol</th>
                    <th className="py-2.5 px-3">Justificación / Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditorias.map((aud) => {
                    const formattedDate = new Date(aud.fecha).toLocaleString('es-CO', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    });

                    return (
                      <tr key={aud.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600" data-label="Fecha">
                          {formattedDate}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 text-xs" data-label="Trabajador">
                          {aud.trabajadorNombre}
                        </td>
                        <td className="py-2.5 px-3 text-center" data-label="Cambio">
                          <div className="inline-flex items-center gap-1 font-mono text-xs font-bold">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {aud.valorPrevio !== null ? `${aud.valorPrevio} pts` : '—'}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              {aud.valorNuevo !== null ? `${aud.valorNuevo} pts` : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3" data-label="Autor">
                          <div className="text-xs font-semibold text-slate-800">{aud.autor}</div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {aud.autorRol}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11.5px] text-slate-700" data-label="Justificación">
                          {aud.justificacion || 'Sin justificación detallada'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Cerrar Auditoría
          </button>
        </div>
      </div>
    </div>
  );
}
