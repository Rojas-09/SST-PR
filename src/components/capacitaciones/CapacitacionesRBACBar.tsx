import React from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { ShieldCheck, UserCheck, AlertCircle, KeyRound, Lock, Unlock, Eye, Sparkles } from 'lucide-react';
import { UserRole } from '../../types/capacitaciones';

export function CapacitacionesRBACBar() {
  const { currentUser, switchRole, availableUsers, setCurrentUser } = useAuthRole();

  const roleBadges: Record<UserRole, { label: string; bg: string; text: string; border: string; desc: string }> = {
    ADMINISTRADOR: {
      label: 'Administrador (Gerencia)',
      bg: 'bg-amber-500/10',
      text: 'text-amber-800',
      border: 'border-amber-300',
      desc: 'Control total del SG-SST, aprobación legal, anulación de planes y reapertura exclusiva de actas firmadas.',
    },
    RESPONSABLE_SST: {
      label: 'Responsable SG-SST',
      bg: 'bg-blue-500/10',
      text: 'text-blue-800',
      border: 'border-blue-300',
      desc: 'Gestión técnica de cronogramas, registro de asistencia, convalidación de actas y programación anual.',
    },
    INSTRUCTOR_EXTERNO: {
      label: 'Instructor Externo / ARL',
      bg: 'bg-purple-500/10',
      text: 'text-purple-800',
      border: 'border-purple-300',
      desc: 'Acceso restringido: solo califica, firma y carga evidencias en las sesiones donde figura como capacitador asignado.',
    },
    LECTURA: {
      label: 'Auditoría / Consulta',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      desc: 'Modo solo lectura para auditorías de Mintrabajo y ARL. Todas las acciones de edición están deshabilitadas.',
    },
  };

  const currentBadge = roleBadges[currentUser.rol];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* User Identity Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-xs ring-2 ring-blue-500/20">
            {currentUser.nombre.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-black text-slate-900 text-sm sm:text-base lg:text-lg truncate">{currentUser.nombre}</span>
              <span
                className={`text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
              >
                {currentBadge.label}
              </span>
              <span className="text-xs text-slate-500 font-semibold truncate">({currentUser.cargo} • {currentUser.entidad})</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">{currentBadge.desc}</p>
          </div>
        </div>

        {/* Quick Role Switcher for Testing RBAC Opción A */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-200 w-full lg:w-auto">
          <span className="text-xs font-bold text-slate-600 px-1 sm:px-2 flex items-center gap-1.5 shrink-0">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Simular Rol:</span>
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap flex-1 sm:flex-initial">
            {(['ADMINISTRADOR', 'RESPONSABLE_SST', 'INSTRUCTOR_EXTERNO', 'LECTURA'] as UserRole[]).map((r) => {
              const isCurrent = currentUser.rol === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => switchRole(r)}
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  {r === 'ADMINISTRADOR'
                    ? 'Admin'
                    : r === 'RESPONSABLE_SST'
                    ? 'SST'
                    : r === 'INSTRUCTOR_EXTERNO'
                    ? 'Instructor'
                    : 'Auditor'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
