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
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* User Identity Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {currentUser.nombre.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-[13px]">{currentUser.nombre}</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
              >
                {currentBadge.label}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">({currentUser.cargo} • {currentUser.entidad})</span>
            </div>
            <p className="text-[11.5px] text-slate-600 mt-0.5">{currentBadge.desc}</p>
          </div>
        </div>

        {/* Quick Role Switcher for Testing RBAC Opción A */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-slate-400" />
            <span>Simular Rol:</span>
          </span>
          {(['ADMINISTRADOR', 'RESPONSABLE_SST', 'INSTRUCTOR_EXTERNO', 'LECTURA'] as UserRole[]).map((r) => {
            const isCurrent = currentUser.rol === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
  );
}
