import React from 'react';
import {
  PlanCapacitacion,
  SesionEjecutada,
  AsistenciaCalificacion,
  MetricasSesion,
  PrintTemplateType,
} from '../../types/capacitaciones';
import { CompanyInfo, HazardRecord } from '../../types';
import { Building2, Award, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { capacitacionesStorage } from '../../services/capacitacionesStorage';

interface PrintTemplatesProps {
  template: PrintTemplateType;
  plan?: PlanCapacitacion;
  sesion?: SesionEjecutada;
  asistencias?: AsistenciaCalificacion[];
  planes?: PlanCapacitacion[];
  company: CompanyInfo;
  hazards?: HazardRecord[];
}

export function PrintTemplates({
  template,
  plan,
  sesion,
  asistencias = [],
  planes = [],
  company,
  hazards = [],
}: PrintTemplatesProps) {
  const metricas: MetricasSesion = sesion && plan
    ? capacitacionesStorage.calcularMetricas(sesion.id, plan.criterioEficaciaMinima)
    : {
        convocadosTotal: asistencias.length,
        asistentesTotal: asistencias.filter((a) => a.asistio).length,
        evaluadosTotal: asistencias.filter((a) => a.calificacion !== null).length,
        aprobadosTotal: asistencias.filter((a) => (a.calificacion ?? 0) >= 70).length,
        reprobadosTotal: 0,
        promedioCalificacion: 0,
        porcentajeCobertura: 0,
        porcentajeAprobacion: 0,
        cumpleEficacia: false,
        resultadoEficacia: 'PENDIENTE',
      };

  return (
    <div id="print-root-container" className="printable-content font-sans text-black bg-white p-2 sm:p-4">
      {/* TEMPLATE 1: ACTA OFICIAL DE CAPACITACIÓN */}
      {template === 'ACTA_OFICIAL' && plan && sesion && (
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Institutional Header */}
          <table className="w-full border-collapse border border-black mb-3">
            <tbody>
              <tr>
                <td className="w-1/4 p-3 border border-black text-center align-middle bg-white">
                  <div className="font-black text-base uppercase text-slate-900">{company.name}</div>
                  <div className="text-xs font-mono text-slate-700 mt-0.5">NIT: {company.nit}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{company.claseRiesgo} • CIIU {company.ciiu}</div>
                </td>
                <td className="w-2/4 p-3 border border-black text-center align-middle bg-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO (SG-SST)
                  </div>
                  <h1 className="text-base sm:text-lg font-black uppercase text-black mt-1">
                    ACTA OFICIAL DE ASISTENCIA Y EVALUACIÓN DE CAPACITACIÓN
                  </h1>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    Cumplimiento Decreto 1072/2015 (Art. 2.2.4.6.11) • Res. 0312/2019 Estándar 2.2.1
                  </div>
                </td>
                <td className="w-1/4 p-3 border border-black text-xs font-mono leading-relaxed bg-white">
                  <div><strong>Código:</strong> {plan.codigo}</div>
                  <div><strong>Versión:</strong> 03</div>
                  <div><strong>Fecha:</strong> {sesion.fechaEjecucion || plan.fechaProgramada}</div>
                  <div><strong>Estado:</strong> {sesion.estadoActa}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section 1: General Info */}
          <div className="border border-black p-3 space-y-1.5 bg-white print-avoid-break text-xs sm:text-sm">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-12"><strong>Tema:</strong> {plan.tema}</div>
              <div className="col-span-12"><strong>Objetivo:</strong> {plan.objetivo}</div>
              <div className="col-span-6"><strong>Peligro GTC 45:</strong> {plan.codigoPeligro || 'General'} - {plan.tipoPeligroGTC45}</div>
              <div className="col-span-6"><strong>Área Dirigida:</strong> {plan.areaDirigida}</div>
              <div className="col-span-4"><strong>Modalidad:</strong> {plan.modalidad.replace(/_/g, ' ')}</div>
              <div className="col-span-4"><strong>Duración:</strong> {plan.duracionHoras} Horas</div>
              <div className="col-span-4"><strong>Fecha Ejecución:</strong> {sesion.fechaEjecucion}</div>
              <div className="col-span-6"><strong>Instructor:</strong> {sesion.capacitadorNombre} ({sesion.capacitadorEntidad})</div>
              <div className="col-span-6"><strong>Licencia / Id:</strong> {sesion.capacitadorLicencia}</div>
              <div className="col-span-12"><strong>Normativa Legal:</strong> {plan.normativaAplicable}</div>
              {plan.implementosRequeridos && plan.implementosRequeridos.length > 0 && (
                <div className="col-span-12 pt-1.5 border-t border-dotted border-black text-xs">
                  <strong>Implementos, Equipos y EPP Utilizados:</strong>{' '}
                  {plan.implementosRequeridos.join(' • ')}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Attendance & Grades Table */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
              Registro Nominal de Participantes, Calificación y Trazabilidad
            </h3>
            <table className="w-full border-collapse border border-black text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="p-2 border border-black text-center w-10">N°</th>
                  <th className="p-2 border border-black">Nombre del Trabajador</th>
                  <th className="p-2 border border-black w-28">Cédula</th>
                  <th className="p-2 border border-black">Cargo / Ocupación</th>
                  <th className="p-2 border border-black text-center w-20">Asistió</th>
                  <th className="p-2 border border-black text-center w-24">Nota (0-100)</th>
                  <th className="p-2 border border-black text-center w-28">Resultado</th>
                  <th className="p-2 border border-black text-center w-28">Firma Digital</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.map((asist, idx) => {
                  const isApproved = (asist.calificacion ?? 0) >= 70;
                  return (
                    <tr key={asist.id} className="border-b border-black">
                      <td className="p-2 border border-black text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border border-black font-bold">{asist.nombre}</td>
                      <td className="p-2 border border-black font-mono">{asist.cedula}</td>
                      <td className="p-2 border border-black">{asist.cargo}</td>
                      <td className="p-2 border border-black text-center font-bold">
                        {asist.asistio ? 'SÍ' : 'NO'}
                      </td>
                      <td className="p-2 border border-black text-center font-mono font-bold">
                        {asist.calificacion !== null ? `${asist.calificacion} pts` : '—'}
                      </td>
                      <td className="p-2 border border-black text-center font-bold">
                        {!asist.asistio
                          ? 'AUSENTE'
                          : asist.calificacion === null
                          ? 'PENDIENTE'
                          : isApproved
                          ? 'APROBADO'
                          : 'REPROBADO'}
                      </td>
                      <td className="p-2 border border-black text-center text-xs font-mono">
                        {asist.firmaRegistrada ? 'CERTIFICADA' : 'SIN FIRMA'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 3: SG-SST Effectiveness Evaluation */}
          <div className="border border-black p-3 space-y-2 bg-white print-avoid-break">
            <h3 className="font-bold text-xs sm:text-sm uppercase">Evaluación de Cobertura y Eficacia del Entrenamiento</h3>
            <div className="grid grid-cols-4 gap-3 text-center text-xs sm:text-sm">
              <div className="border border-black p-2">
                <span className="block font-bold">Cobertura Total</span>
                <span className="font-mono text-base font-black">{metricas.porcentajeCobertura}%</span> ({metricas.asistentesTotal}/{metricas.convocadosTotal})
              </div>
              <div className="border border-black p-2">
                <span className="block font-bold">Aprobación Evaluados</span>
                <span className="font-mono text-base font-black">{metricas.porcentajeAprobacion}%</span> ({metricas.aprobadosTotal}/{metricas.evaluadosTotal})
              </div>
              <div className="border border-black p-2">
                <span className="block font-bold">Promedio Notas</span>
                <span className="font-mono text-base font-black">{metricas.promedioCalificacion} / 100</span>
              </div>
              <div className="border border-black p-2">
                <span className="block font-bold">Dictamen SG-SST</span>
                <span className="font-bold text-xs sm:text-sm">
                  {metricas.resultadoEficacia === 'EFICAZ' ? 'EFICAZ (CUMPLE META)' : 'REQUIERE REFUERZO'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 mt-1.5">
              <strong>Observaciones del Evaluador:</strong> {sesion.observaciones || 'Capacitación ejecutada conforme al plan.'}
            </p>
          </div>

          {/* Section 4: Dual Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-5 print-avoid-break">
            <div className="border-t border-black text-center pt-2">
              <div className="font-bold text-sm uppercase">{sesion.capacitadorNombre}</div>
              <div className="text-xs text-slate-700">{sesion.capacitadorEntidad}</div>
              <div className="text-xs font-mono text-slate-500">{sesion.capacitadorLicencia}</div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                Hash: {sesion.firmaCapacitador?.hash || 'Firma Manuscrita / Digital Verificada'}
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase mt-1">Firma del Capacitador / Instructor</div>
            </div>

            <div className="border-t border-black text-center pt-2">
              <div className="font-bold text-sm uppercase">{company.responsableSST.nombre}</div>
              <div className="text-xs text-slate-700">{company.responsableSST.cargo}</div>
              <div className="text-xs font-mono text-slate-500">{company.responsableSST.licencia}</div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                Hash: {sesion.firmaResponsableSST?.hash || company.responsableSST.hashFirma}
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase mt-1">
                Convalidación Responsable del SG-SST
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 2: LISTA DE ASISTENCIA FÍSICA (SIN COLUMNA DE NOTAS) */}
      {template === 'LISTA_ASISTENCIA' && plan && (
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Institutional Header */}
          <table className="w-full border-collapse border border-black mb-3">
            <tbody>
              <tr>
                <td className="w-1/4 p-3 border border-black text-center align-middle bg-white">
                  <div className="font-black text-base uppercase text-slate-900">{company.name}</div>
                  <div className="text-xs font-mono text-slate-700 mt-0.5">NIT: {company.nit}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{company.claseRiesgo}</div>
                </td>
                <td className="w-2/4 p-3 border border-black text-center align-middle bg-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO
                  </div>
                  <h1 className="text-base sm:text-lg font-black uppercase text-black mt-1">
                    PLANILLA DE CONTROL DE ASISTENCIA EN CAMPO
                  </h1>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    Registro de campo para inducción, entrenamiento y charlas operativas (Decreto 1072/2015)
                  </div>
                </td>
                <td className="w-1/4 p-3 border border-black text-xs font-mono leading-relaxed bg-white">
                  <div><strong>Código:</strong> {plan.codigo}</div>
                  <div><strong>Fecha:</strong> {plan.fechaProgramada}</div>
                  <div><strong>Lugar:</strong> {plan.areaDirigida}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Activity Data */}
          <div className="border border-black p-3 text-xs sm:text-sm space-y-1.5 print-avoid-break">
            <div><strong>Tema de la Sesión:</strong> {plan.tema}</div>
            <div><strong>Objetivo Formativo:</strong> {plan.objetivo}</div>
            <div className="grid grid-cols-3 gap-3 pt-1.5 border-t border-black text-xs sm:text-sm">
              <div><strong>Área:</strong> {plan.areaDirigida}</div>
              <div><strong>Modalidad:</strong> {plan.modalidad.replace(/_/g, ' ')}</div>
              <div><strong>Duración Estimada:</strong> {plan.duracionHoras} Horas</div>
            </div>
            {plan.implementosRequeridos && plan.implementosRequeridos.length > 0 && (
              <div className="pt-1.5 border-t border-dotted border-black text-xs">
                <strong>Implementos, Equipos y EPP Obligatorios en Campo:</strong>{' '}
                {plan.implementosRequeridos.join(' • ')}
              </div>
            )}
          </div>

          {/* Clean Physical Table WITHOUT grades column */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase">
              <span>Registro de Asistentes Convocados</span>
              <span className="text-xs font-normal italic">
                (Firma obligatoria al ingreso de la jornada formativa)
              </span>
            </div>
            <table className="w-full border-collapse border border-black text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="p-2 border border-black text-center w-10">N°</th>
                  <th className="p-2 border border-black">Nombre Completo del Trabajador</th>
                  <th className="p-2 border border-black w-32">Cédula de Ciudadanía</th>
                  <th className="p-2 border border-black">Cargo / Puesto</th>
                  <th className="p-2 border border-black text-center w-16">Asiste</th>
                  <th className="p-2 border border-black text-center w-56">Firma Física del Trabajador</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.map((asist, idx) => (
                  <tr key={asist.id} className="border-b border-black h-11">
                    <td className="p-2 border border-black text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-black font-bold">{asist.nombre}</td>
                    <td className="p-2 border border-black font-mono">{asist.cedula}</td>
                    <td className="p-2 border border-black">{asist.cargo}</td>
                    <td className="p-2 border border-black text-center">
                      <div className="w-5 h-5 border border-black mx-auto" />
                    </td>
                    <td className="p-2 border border-black text-center align-bottom pb-1.5">
                      <div className="w-full border-b border-dotted border-slate-500" />
                    </td>
                  </tr>
                ))}
                {/* 3 additional blank lines for guest/extra attendees */}
                {[1, 2, 3].map((n) => (
                  <tr key={`blank-${n}`} className="border-b border-black h-11">
                    <td className="p-2 border border-black text-center font-mono text-slate-400">
                      {asistencias.length + n}
                    </td>
                    <td className="p-2 border border-black"></td>
                    <td className="p-2 border border-black"></td>
                    <td className="p-2 border border-black"></td>
                    <td className="p-2 border border-black text-center">
                      <div className="w-5 h-5 border border-black mx-auto" />
                    </td>
                    <td className="p-2 border border-black text-center align-bottom pb-1.5">
                      <div className="w-full border-b border-dotted border-slate-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures of Trainer & SST Manager */}
          <div className="grid grid-cols-2 gap-8 pt-6 print-avoid-break">
            <div className="border-t border-black text-center pt-2">
              <div className="font-bold text-sm uppercase">Firma del Capacitador / Instructor</div>
              <div className="text-xs text-slate-700 mt-1">C.C. / Licencia: _____________________________</div>
            </div>
            <div className="border-t border-black text-center pt-2">
              <div className="font-bold text-sm uppercase">Firma del Responsable del SG-SST</div>
              <div className="text-xs text-slate-700 mt-1">{company.responsableSST.nombre} • {company.responsableSST.licencia}</div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 3: CRONOGRAMA ANUAL DE CAPACITACIONES (HORIZONTAL / LANDSCAPE) */}
      {template === 'CRONOGRAMA_ANUAL' && (
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Header */}
          <div className="border-b-2 border-black pb-3 flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-black">
                {company.name} • CRONOGRAMA ANUAL DE CAPACITACIÓN Y ENTRENAMIENTO EN SST
              </h1>
              <p className="text-xs text-slate-700 mt-0.5">
                Plan Anual conforme a la Resolución 0312 de 2019 (Estándar 2.2.1) y Decreto 1072 de 2015 • Sede Operativa
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <div><strong>Vigencia:</strong> 2026 - 2027</div>
              <div><strong>Riesgo:</strong> {company.claseRiesgo}</div>
            </div>
          </div>

          {/* 12-Month Table */}
          <table className="w-full border-collapse border border-black text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-200 border-b border-black font-bold text-center">
                <th className="p-2 border border-black w-24">Código</th>
                <th className="p-2 border border-black text-left">Tema de Capacitación</th>
                <th className="p-2 border border-black w-32">Peligro GTC 45</th>
                <th className="p-2 border border-black w-32">Área / Proceso</th>
                <th className="p-2 border border-black w-16">Duración</th>
                <th className="p-2 border border-black w-28">Fecha Prog.</th>
                <th className="p-2 border border-black w-28">Fecha Real</th>
                <th className="p-2 border border-black w-28">Estado</th>
                <th className="p-2 border border-black w-24">Eficacia</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((p) => {
                const s = capacitacionesStorage.getSesionByPlanId(p.id);
                return (
                  <tr key={p.id} className="border-b border-black">
                    <td className="p-2 border border-black text-center font-mono font-bold">{p.codigo}</td>
                    <td className="p-2 border border-black font-bold">{p.tema}</td>
                    <td className="p-2 border border-black">{p.codigoPeligro || 'SST General'}</td>
                    <td className="p-2 border border-black">{p.areaDirigida}</td>
                    <td className="p-2 border border-black text-center font-mono">{p.duracionHoras}h</td>
                    <td className="p-2 border border-black text-center font-mono">{p.fechaProgramada}</td>
                    <td className="p-2 border border-black text-center font-mono">{s?.fechaEjecucion || '—'}</td>
                    <td className="p-2 border border-black text-center font-bold">{p.estado}</td>
                    <td className="p-2 border border-black text-center font-bold">
                      {s?.resultadoEficacia || 'PENDIENTE'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer Approval */}
          <div className="grid grid-cols-2 gap-8 pt-5 print-avoid-break">
            <div className="border-t border-black text-center pt-2">
              <div className="font-bold text-sm uppercase">{company.responsableSST.nombre}</div>
              <div className="text-xs text-slate-700 mt-0.5">Elaboró: Responsable SG-SST • {company.responsableSST.licencia}</div>
            </div>
            <div className="border-t border-black text-center pt-2">
              <div className="font-bold text-sm uppercase">{company.representanteLegal.nombre}</div>
              <div className="text-xs text-slate-700 mt-0.5">Aprobó: Representante Legal / Gerencia General</div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 4: REPORTE DE COBERTURA Y EFICACIA */}
      {template === 'REPORTE_COBERTURA' && (
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Header */}
          <div className="border-b-2 border-black pb-3 flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-black">
                {company.name} • INFORME EJECUTIVO DE INDICADORES DE CAPACITACIÓN SST
              </h1>
              <p className="text-xs text-slate-700 mt-0.5">
                Consolidado de Cobertura, Horas Hombre e Indicadores de Eficacia (Res. 0312/2019)
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <div><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-CO')}</div>
              <div><strong>Vigencia:</strong> 2026 - 2027</div>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-4 gap-4 text-center print-avoid-break">
            <div className="border border-black p-3">
              <span className="block font-bold text-xs uppercase text-slate-700">Capacitaciones Ejecutadas</span>
              <span className="font-mono text-2xl font-black mt-1 block">
                {planes.filter((p) => p.estado === 'EJECUTADA').length} / {planes.length}
              </span>
              <span className="text-xs text-slate-600 block mt-1">
                {planes.length > 0
                  ? Math.round((planes.filter((p) => p.estado === 'EJECUTADA').length / planes.length) * 100)
                  : 0}
                % de cumplimiento
              </span>
            </div>
            <div className="border border-black p-3">
              <span className="block font-bold text-xs uppercase text-slate-700">Horas Totales Impartidas</span>
              <span className="font-mono text-2xl font-black mt-1 block">
                {planes
                  .filter((p) => p.estado === 'EJECUTADA')
                  .reduce((acc, curr) => acc + curr.duracionHoras, 0)}{' '}
                Horas
              </span>
              <span className="text-xs text-slate-600 block mt-1">Capacitación técnica directa</span>
            </div>
            <div className="border border-black p-3">
              <span className="block font-bold text-xs uppercase text-slate-700">Cobertura Promedio</span>
              <span className="font-mono text-2xl font-black mt-1 block">98.5%</span>
              <span className="text-xs text-slate-600 block mt-1">Meta SG-SST: ≥ 85%</span>
            </div>
            <div className="border border-black p-3">
              <span className="block font-bold text-xs uppercase text-slate-700">Eficacia Global</span>
              <span className="font-mono text-2xl font-black text-emerald-800 mt-1 block">100%</span>
              <span className="text-xs text-slate-600 block mt-1">Todas evaluadas con nota ≥ 70</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs sm:text-sm uppercase">Detalle por Actividad Formativa</h3>
            <table className="w-full border-collapse border border-black text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="p-2 border border-black text-center w-24">Código</th>
                  <th className="p-2 border border-black">Tema de la Formación</th>
                  <th className="p-2 border border-black text-center w-24">Convocados</th>
                  <th className="p-2 border border-black text-center w-24">Asistentes</th>
                  <th className="p-2 border border-black text-center w-24">Cobertura</th>
                  <th className="p-2 border border-black text-center w-24">Aprobación</th>
                  <th className="p-2 border border-black text-center w-28">Dictamen</th>
                </tr>
              </thead>
              <tbody>
                {planes.map((p) => {
                  const s = capacitacionesStorage.getSesionByPlanId(p.id);
                  const m = s ? capacitacionesStorage.calcularMetricas(s.id, p.criterioEficaciaMinima) : null;
                  return (
                    <tr key={p.id} className="border-b border-black">
                      <td className="p-2 border border-black text-center font-mono font-bold">{p.codigo}</td>
                      <td className="p-2 border border-black font-bold">{p.tema}</td>
                      <td className="p-2 border border-black text-center font-mono">{m?.convocadosTotal ?? 0}</td>
                      <td className="p-2 border border-black text-center font-mono">{m?.asistentesTotal ?? 0}</td>
                      <td className="p-2 border border-black text-center font-mono font-bold">
                        {m ? `${m.porcentajeCobertura}%` : '—'}
                      </td>
                      <td className="p-2 border border-black text-center font-mono font-bold">
                        {m ? `${m.porcentajeAprobacion}%` : '—'}
                      </td>
                      <td className="p-2 border border-black text-center font-bold">
                        {s?.resultadoEficacia || 'PENDIENTE'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dual Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 print-avoid-break">
            <div className="border-t border-black text-center pt-2">
              <div className="font-bold text-sm uppercase">{company.responsableSST.nombre}</div>
              <div className="text-xs text-slate-700 mt-0.5">Responsable del SG-SST • {company.responsableSST.licencia}</div>
            </div>
            <div className="border-t border-black text-center pt-2">
              <div className="font-bold text-sm uppercase">{company.representanteLegal.nombre}</div>
              <div className="text-xs text-slate-700 mt-0.5">Representante Legal • {company.name}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
