import React, { useState } from 'react';
import { X, Unlock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { SesionEjecutada } from '../../types/capacitaciones';
import { useAuthRole } from '../../context/AuthRoleContext';
import { capacitacionesStorage } from '../../services/capacitacionesStorage';

interface ReaperturaActaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sesion: SesionEjecutada;
  codigoCapacitacion: string;
  onReopened: () => void;
}

export function ReaperturaActaModal({
  isOpen,
  onClose,
  sesion,
  codigoCapacitacion,
  onReopened,
}: ReaperturaActaModalProps) {
  const { currentUser } = useAuthRole();
  const [justificacion, setJustificacion] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (justificacion.trim().length < 10) {
      setError('La justificación técnica de reapertura es obligatoria (mínimo 10 caracteres).');
      return;
    }

    const success = capacitacionesStorage.reabrirSesion(
      sesion.id,
      justificacion.trim(),
      currentUser.nombre
    );

    if (success) {
      onReopened();
      onClose();
    } else {
      setError('No se pudo reabrir el acta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 font-sans text-[13px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-amber-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-800 border border-amber-600/50 flex items-center justify-center text-amber-200">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Reapertura Excepcional de Acta
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/50">
                  {codigoCapacitacion}
                </span>
              </h2>
              <p className="text-[11px] text-amber-200">
                Acción restringida a la Gerencia / Rol ADMINISTRADOR
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11.5px] leading-relaxed">
              El acta actual cuenta con estado <strong>{sesion.estadoActa}</strong>. La reapertura habilitará temporalmente la edición de calificaciones y asistencias. Esta acción quedará indexada de forma irreversible en la pista de auditoría con su usuario (<strong>{currentUser.nombre}</strong>).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Justificación de Reapertura <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={justificacion}
              onChange={(e) => {
                setJustificacion(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ejemplo: Se autoriza reapertura para corregir calificación del operario Carlos Silva tras revisión de la prueba práctica complementaria."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 outline-none"
            />
            {error && <p className="text-[11px] text-red-600 mt-1 font-semibold">{error}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Confirmar y Reabrir Acta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
