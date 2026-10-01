import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  AsistenciaCalificacion,
  SesionEjecutada,
  PlanCapacitacion,
  MetricasSesion,
} from '../../types/capacitaciones';
import { useAuthRole } from '../../context/AuthRoleContext';
import { capacitacionesStorage } from '../../services/capacitacionesStorage';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Users,
  Award,
  History,
  TrendingUp,
  Percent,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface EditableGradesGridProps {
  plan: PlanCapacitacion;
  sesion: SesionEjecutada;
  asistencias: AsistenciaCalificacion[];
  onOpenAuditoria: () => void;
  onOpenReapertura: () => void;
  onDataChanged: () => void;
}

export function EditableGradesGrid({
  plan,
  sesion,
  asistencias,
  onOpenAuditoria,
  onOpenReapertura,
  onDataChanged,
}: EditableGradesGridProps) {
  const { currentUser, canEditGrades, canReopenActa } = useAuthRole();

  const editPermission = canEditGrades(sesion);
  const reopenPermission = canReopenActa(sesion);

  // References to grade inputs for keyboard navigation
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Local draft state for grade values while typing
  const [draftGrades, setDraftGrades] = useState<Record<string, string>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{ id: string; success: boolean; msg?: string } | null>(null);

  // Initialize draft grades
  useEffect(() => {
    const drafts: Record<string, string> = {};
    asistencias.forEach((a) => {
      drafts[a.id] = a.calificacion !== null && a.calificacion !== undefined ? String(a.calificacion) : '';
    });
    setDraftGrades(drafts);
  }, [asistencias]);

  // Calculate live metrics
  const metricas: MetricasSesion = useMemo(() => {
    return capacitacionesStorage.calcularMetricas(sesion.id, plan.criterioEficaciaMinima);
  }, [asistencias, sesion.id, plan.criterioEficaciaMinima]);

  const handleToggleAttendance = (asistenciaId: string) => {
    if (!editPermission.allowed) return;
    capacitacionesStorage.toggleAsistencia(asistenciaId);
    onDataChanged();
  };

  const handleGradeChange = (asistenciaId: string, value: string) => {
    // Only allow numbers between 0 and 100
    if (value === '' || (/^\d+$/.test(value) && Number(value) <= 100)) {
      setDraftGrades((prev) => ({ ...prev, [asistenciaId]: value }));
    }
  };

  const handleSaveGrade = (asistencia: AsistenciaCalificacion) => {
    const rawVal = draftGrades[asistencia.id];
    const numVal = rawVal === '' || rawVal === undefined ? null : Number(rawVal);

    if (numVal !== null && (numVal < 0 || numVal > 100)) {
      setSaveFeedback({ id: asistencia.id, success: false, msg: 'Debe ser entre 0 y 100' });
      return;
    }

    const result = capacitacionesStorage.updateCalificacion(
      asistencia.id,
      numVal,
      currentUser.nombre,
      currentUser.rol,
      sesion.estadoActa === 'REABIERTA' ? `Corrección autorizada tras reapertura: ${sesion.reabiertaMotivo || ''}` : undefined
    );

    if (result.success) {
      setSaveFeedback({ id: asistencia.id, success: true });
      setTimeout(() => setSaveFeedback(null), 2000);
      onDataChanged();
    } else {
      setSaveFeedback({ id: asistencia.id, success: false, msg: result.error });
    }
    setEditingRowId(null);
  };

  // Keyboard navigation handler: ArrowUp, ArrowDown, Enter, Escape
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    asistencia: AsistenciaCalificacion
  ) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Find next attendee that is present
      for (let i = index + 1; i < asistencias.length; i++) {
        if (asistencias[i].asistio) {
          const nextInput = inputRefs.current.get(asistencias[i].id);
          nextInput?.focus();
          nextInput?.select();
          break;
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Find previous attendee that is present
      for (let i = index - 1; i >= 0; i--) {
        if (asistencias[i].asistio) {
          const prevInput = inputRefs.current.get(asistencias[i].id);
          prevInput?.focus();
          prevInput?.select();
          break;
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveGrade(asistencia);
      // Advance to next row
      for (let i = index + 1; i < asistencias.length; i++) {
        if (asistencias[i].asistio) {
          const nextInput = inputRefs.current.get(asistencias[i].id);
          nextInput?.focus();
          nextInput?.select();
          break;
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Restore previous value
      setDraftGrades((prev) => ({
        ...prev,
        [asistencia.id]:
          asistencia.calificacion !== null && asistencia.calificacion !== undefined
            ? String(asistencia.calificacion)
            : '',
      }));
      setEditingRowId(null);
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-4 font-sans text-[13px]">
      {/* Lockout Notice / Reopening Banner */}
      {!editPermission.allowed && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold text-xs text-amber-900">
                Calificaciones y Asistencia Bloqueadas
              </span>
              <p className="text-[11.5px] text-amber-700 mt-0.5">{editPermission.reason}</p>
            </div>
          </div>
          {reopenPermission.allowed && (
            <button
              type="button"
              onClick={onOpenReapertura}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Reabrir Acta (Admin)</span>
            </button>
          )}
        </div>
      )}

      {/* If reopened, show justification tag */}
      {sesion.estadoActa === 'REABIERTA' && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between gap-3 text-purple-900">
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold text-xs">Acta Reabierta para Corrección</span>
              <span className="text-xs text-purple-700 ml-2">
                Motivo: "{sesion.reabiertaMotivo}" por {sesion.reabiertaPor}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-purple-200 text-purple-800 rounded">
            Modo Edición Habilitado
          </span>
        </div>
      )}

      {/* Live Calculated SG-SST KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Cobertura */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Cobertura en Vivo
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {metricas.porcentajeCobertura}%
            </span>
            <span className="text-xs text-slate-500">
              ({metricas.asistentesTotal}/{metricas.convocadosTotal} asistentes)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                metricas.porcentajeCobertura >= 80
                  ? 'bg-emerald-500'
                  : metricas.porcentajeCobertura >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${metricas.porcentajeCobertura}%` }}
            />
          </div>
        </div>

        {/* Aprobación */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Aprobación Teórica
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {metricas.porcentajeAprobacion}%
            </span>
            <span className="text-xs text-slate-500">
              ({metricas.aprobadosTotal}/{metricas.evaluadosTotal} aprobados)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                metricas.porcentajeAprobacion >= 80 ? 'bg-blue-600' : 'bg-amber-500'
              }`}
              style={{ width: `${metricas.porcentajeAprobacion}%` }}
            />
          </div>
        </div>

        {/* Promedio General */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Promedio Notas (0-100)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {metricas.promedioCalificacion}
            </span>
            <span className="text-xs text-slate-500">/ 100 pts</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Criterio aprobatorio legal: ≥ 70 pts
          </p>
        </div>

        {/* Eficacia SG-SST */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Eficacia SG-SST
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            {metricas.resultadoEficacia === 'EFICAZ' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                EFICAZ (≥{plan.criterioEficaciaMinima}%)
              </span>
            ) : metricas.resultadoEficacia === 'REQUIERE_REFUERZO' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                REFUERZO REQUERIDO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300">
                EVALUACIÓN PENDIENTE
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Meta mínima: {plan.criterioEficaciaMinima}% de aprobación
          </p>
        </div>
      </div>

      {/* Attendees & Grades Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Lista de Asistencia y Calificación Individual
            </h3>
            <span className="text-[11px] text-slate-500">
              (Navegación rápida: Flechas ↑/↓, Enter para guardar, Esc para cancelar)
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenAuditoria}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Ver Auditoría de Notas</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-stack">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12 text-center">Asistió</th>
                <th className="py-2.5 px-3">Trabajador / Cédula</th>
                <th className="py-2.5 px-3">Cargo / Área</th>
                <th className="py-2.5 px-3 w-36 text-center">Calificación (0-100)</th>
                <th className="py-2.5 px-3 w-28 text-center">Estado</th>
                <th className="py-2.5 px-3 w-28 text-center">Firma Digital</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {asistencias.map((asistente, index) => {
                const isEditing = editingRowId === asistente.id;
                const draftVal = draftGrades[asistente.id] ?? '';
                const isPresent = asistente.asistio;
                const numericGrade = asistente.calificacion;
                const isApproved = numericGrade !== null && numericGrade >= 70;
                const isFailed = numericGrade !== null && numericGrade < 70;
                const feedback = saveFeedback?.id === asistente.id ? saveFeedback : null;

                return (
                  <tr
                    key={asistente.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !isPresent ? 'opacity-70 bg-slate-50/30' : ''
                    }`}
                  >
                    {/* Attendance Checkbox (Separated from grade!) */}
                    <td className="py-2.5 px-3 text-center" data-label="Asistió">
                      <input
                        type="checkbox"
                        checked={isPresent}
                        disabled={!editPermission.allowed}
                        onChange={() => handleToggleAttendance(asistente.id)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                        title={
                          editPermission.allowed
                            ? isPresent
                              ? 'Marcar como no asistente'
                              : 'Registrar asistencia'
                            : editPermission.reason
                        }
                      />
                    </td>

                    {/* Employee Info */}
                    <td className="py-2.5 px-3" data-label="Trabajador">
                      <div className="font-semibold text-slate-900 text-xs">{asistente.nombre}</div>
                      <div className="text-[11px] text-slate-500 font-mono">C.C. {asistente.cedula}</div>
                    </td>

                    {/* Cargo / Area */}
                    <td className="py-2.5 px-3" data-label="Cargo">
                      <div className="text-slate-800 text-xs font-medium">{asistente.cargo}</div>
                      <div className="text-[11px] text-slate-500">{asistente.area}</div>
                    </td>

                    {/* Calificación Editable Grid Cell */}
                    <td className="py-2.5 px-3 text-center" data-label="Nota (0-100)">
                      {isPresent ? (
                        <div className="relative inline-flex items-center justify-center">
                          <input
                            ref={(el) => {
                              if (el) inputRefs.current.set(asistente.id, el);
                              else inputRefs.current.delete(asistente.id);
                            }}
                            type="text"
                            inputMode="numeric"
                            value={draftVal}
                            disabled={!editPermission.allowed}
                            placeholder="0-100"
                            onFocus={() => {
                              setEditingRowId(asistente.id);
                              inputRefs.current.get(asistente.id)?.select();
                            }}
                            onChange={(e) => handleGradeChange(asistente.id, e.target.value)}
                            onBlur={() => handleSaveGrade(asistente)}
                            onKeyDown={(e) => handleKeyDown(e, index, asistente)}
                            className={`w-20 text-center py-1 px-2 font-mono font-bold text-xs rounded-md border transition-all ${
                              !editPermission.allowed
                                ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                                : isEditing
                                ? 'border-blue-600 ring-2 ring-blue-100 bg-white shadow-xs'
                                : 'border-slate-300 bg-white hover:border-slate-400'
                            }`}
                          />
                          {feedback && (
                            <span
                              className={`absolute -right-6 top-1.5 ${
                                feedback.success ? 'text-emerald-600' : 'text-red-500'
                              }`}
                              title={feedback.msg || 'Guardado'}
                            >
                              {feedback.success ? (
                                <Check className="w-4 h-4 animate-in zoom-in" />
                              ) : (
                                <AlertTriangle className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No asistió</span>
                      )}
                    </td>

                    {/* Estado Badge */}
                    <td className="py-2.5 px-3 text-center" data-label="Estado">
                      {!isPresent ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-500">
                          Ausente
                        </span>
                      ) : numericGrade === null ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Sin calificar
                        </span>
                      ) : isApproved ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aprobado
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          Reprobado
                        </span>
                      )}
                    </td>

                    {/* Firma Digital */}
                    <td className="py-2.5 px-3 text-center" data-label="Firma">
                      {asistente.firmaRegistrada ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Registrada</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Sin firma</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
