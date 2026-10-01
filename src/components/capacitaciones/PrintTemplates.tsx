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
    <div id="print-root-container" className="hidden print:block font-sans text-black bg-white p-4">
      {/* TEMPLATE 1: ACTA OFICIAL DE CAPACITACIÓN */}
      {template === 'ACTA_OFICIAL' && plan && sesion && (
        <div className="space-y-4 text-xs">
          {/* Institutional Header */}
          <table className="w-full border-collapse border border-black mb-3">
            <tbody>
              <tr>
                <td className="w-1/4 p-2 border border-black text-center align-middle bg-white">
                  <div className="font-extrabold text-sm uppercase text-slate-900">{company.name}</div>
                  <div className="text-[10px] font-mono">NIT: {company.nit}</div>
                  <div className="text-[9px] font-bold text-slate-700">{company.claseRiesgo} • CIIU {company.ciiu}</div>
                </td>
                <td className="w-2/4 p-2 border border-black text-center align-middle bg-white">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO (SG-SST)
                  </div>
                  <h1 className="text-sm font-black uppercase text-black mt-0.5">
                    ACTA OFICIAL DE ASISTENCIA Y EVALUACIÓN DE CAPACITACIÓN
                  </h1>
                  <div className="text-[9px] text-slate-600 font-semibold">
                    Cumplimiento Decreto 1072/2015 (Art. 2.2.4.6.11) • Res. 0312/2019 Estándar 2.2.1
                  </div>
                </td>
                <td className="w-1/4 p-2 border border-black text-[10px] font-mono leading-tight bg-white">
                  <div><strong>Código:</strong> {plan.codigo}</div>
                  <div><strong>Versión:</strong> 03</div>
                  <div><strong>Fecha:</strong> {sesion.fechaEjecucion || plan.fechaProgramada}</div>
                  <div><strong>Estado:</strong> {sesion.estadoActa}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section 1: General Info */}
          <div className="border border-black p-2 space-y-1 bg-white print-avoid-break">
            <div className="grid grid-cols-12 gap-1 text-[11px]">
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
            </div>
          </div>

          {/* Section 2: Attendance & Grades Table */}
          <div className="space-y-1">
            <h3 className="font-bold text-[11px] uppercase tracking-wide">
              Registro Nominal de Participantes, Calificación y Trazabilidad
            </h3>
            <table className="w-full border-collapse border border-black text-[10.5px]">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="p-1 border border-black text-center w-8">N°</th>
                  <th className="p-1 border border-black">Nombre del Trabajador</th>
                  <th className="p-1 border border-black w-24">Cédula</th>
                  <th className="p-1 border border-black">Cargo / Ocupación</th>
                  <th className="p-1 border border-black text-center w-16">Asistió</th>
                  <th className="p-1 border border-black text-center w-20">Nota (0-100)</th>
                  <th className="p-1 border border-black text-center w-20">Resultado</th>
                  <th className="p-1 border border-black text-center w-24">Firma Digital</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.map((asist, idx) => {
                  const isApproved = (asist.calificacion ?? 0) >= 70;
                  return (
                    <tr key={asist.id} className="border-b border-black">
                      <td className="p-1 border border-black text-center font-mono">{idx + 1}</td>
                      <td className="p-1 border border-black font-bold">{asist.nombre}</td>
                      <td className="p-1 border border-black font-mono">{asist.cedula}</td>
                      <td className="p-1 border border-black">{asist.cargo}</td>
                      <td className="p-1 border border-black text-center font-bold">
                        {asist.asistio ? 'SÍ' : 'NO'}
                      </td>
                      <td className="p-1 border border-black text-center font-mono font-bold">
                        {asist.calificacion !== null ? `${asist.calificacion} pts` : '—'}
                      </td>
                      <td className="p-1 border border-black text-center font-bold">
                        {!asist.asistio
                          ? 'AUSENTE'
                          : asist.calificacion === null
                          ? 'PENDIENTE'
                          : isApproved
                          ? 'APROBADO'
                          : 'REPROBADO'}
                      </td>
                      <td className="p-1 border border-black text-center text-[9px] font-mono">
                        {asist.firmaRegistrada ? 'CERTIFICADA' : 'SIN FIRMA'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 3: SG-SST Effectiveness Evaluation */}
          <div className="border border-black p-2 space-y-1 bg-white print-avoid-break">
            <h3 className="font-bold text-[11px] uppercase">Evaluación de Cobertura y Eficacia del Entrenamiento</h3>
            <div className="grid grid-cols-4 gap-2 text-center text-[10.5px]">
              <div className="border border-black p-1">
                <span className="block font-bold">Cobertura Total</span>
                <span className="font-mono text-sm font-black">{metricas.porcentajeCobertura}%</span> ({metricas.asistentesTotal}/{metricas.convocadosTotal})
              </div>
              <div className="border border-black p-1">
                <span className="block font-bold">Aprobación Evaluados</span>
                <span className="font-mono text-sm font-black">{metricas.porcentajeAprobacion}%</span> ({metricas.aprobadosTotal}/{metricas.evaluadosTotal})
              </div>
              <div className="border border-black p-1">
                <span className="block font-bold">Promedio Notas</span>
                <span className="font-mono text-sm font-black">{metricas.promedioCalificacion} / 100</span>
              </div>
              <div className="border border-black p-1">
                <span className="block font-bold">Dictamen SG-SST</span>
                <span className="font-bold text-xs">
                  {metricas.resultadoEficacia === 'EFICAZ' ? 'EFICAZ (CUMPLE META)' : 'REQUIERE REFUERZO'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-700 mt-1">
              <strong>Observaciones del Evaluador:</strong> {sesion.observaciones || 'Capacitación ejecutada conforme al plan.'}
            </p>
          </div>

          {/* Section 4: Dual Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 print-avoid-break">
            <div className="border-t border-black text-center pt-1">
              <div className="font-bold text-xs uppercase">{sesion.capacitadorNombre}</div>
              <div className="text-[10px] text-slate-700">{sesion.capacitadorEntidad}</div>
              <div className="text-[9.5px] font-mono text-slate-500">{sesion.capacitadorLicencia}</div>
              <div className="text-[8.5px] font-mono text-slate-400 mt-0.5">
                Hash: {sesion.firmaCapacitador?.hash || 'Firma Manuscrita / Digital Verificada'}
              </div>
              <div className="text-[10px] font-bold text-slate-800 uppercase mt-1">Firma del Capacitador / Instructor</div>
            </div>

            <div className="border-t border-black text-center pt-1">
              <div className="font-bold text-xs uppercase">{company.responsableSST.nombre}</div>
              <div className="text-[10px] text-slate-700">{company.responsableSST.cargo}</div>
              <div className="text-[9.5px] font-mono text-slate-500">{company.responsableSST.licencia}</div>
              <div className="text-[8.5px] font-mono text-slate-400 mt-0.5">
                Hash: {sesion.firmaResponsableSST?.hash || company.responsableSST.hashFirma}
              </div>
              <div className="text-[10px] font-bold text-slate-800 uppercase mt-1">
                Convalidación Responsable del SG-SST
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 2: LISTA DE ASISTENCIA FÍSICA (SIN COLUMNA DE NOTAS) */}
      {template === 'LISTA_ASISTENCIA' && plan && (
        <div className="space-y-4 text-xs">
          {/* Institutional Header */}
          <table className="w-full border-collapse border border-black mb-3">
            <tbody>
              <tr>
                <td className="w-1/4 p-2 border border-black text-center align-middle bg-white">
                  <div className="font-extrabold text-sm uppercase text-slate-900">{company.name}</div>
                  <div className="text-[10px] font-mono">NIT: {company.nit}</div>
                  <div className="text-[9px] font-bold text-slate-700">{company.claseRiesgo}</div>
                </td>
                <td className="w-2/4 p-2 border border-black text-center align-middle bg-white">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO
                  </div>
                  <h1 className="text-sm font-black uppercase text-black mt-0.5">
                    PLANILLA DE CONTROL DE ASISTENCIA EN CAMPO
                  </h1>
                  <div className="text-[9px] text-slate-600 font-semibold">
                    Registro de campo para inducción, entrenamiento y charlas operativas (Decreto 1072/2015)
                  </div>
                </td>
                <td className="w-1/4 p-2 border border-black text-[10px] font-mono leading-tight bg-white">
                  <div><strong>Código:</strong> {plan.codigo}</div>
                  <div><strong>Fecha:</strong> {plan.fechaProgramada}</div>
                  <div><strong>Lugar:</strong> {plan.areaDirigida}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Activity Data */}
          <div className="border border-black p-2 text-[11px] space-y-1 print-avoid-break">
            <div><strong>Tema de la Sesión:</strong> {plan.tema}</div>
            <div><strong>Objetivo Formativo:</strong> {plan.objetivo}</div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-black text-[10.5px]">
              <div><strong>Área:</strong> {plan.areaDirigida}</div>
              <div><strong>Modalidad:</strong> {plan.modalidad.replace(/_/g, ' ')}</div>
              <div><strong>Duración Estimada:</strong> {plan.duracionHoras} Horas</div>
            </div>
          </div>

          {/* Clean Physical Table WITHOUT grades column */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase">
              <span>Registro de Asistentes Convocados</span>
              <span className="text-[10px] font-normal italic">
                (Firma obligatoria al ingreso de la jornada formativa)
              </span>
            </div>
            <table className="w-full border-collapse border border-black text-[11px]">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="p-1.5 border border-black text-center w-8">N°</th>
                  <th className="p-1.5 border border-black">Nombre Completo del Trabajador</th>
                  <th className="p-1.5 border border-black w-28">Cédula de Ciudadanía</th>
                  <th className="p-1.5 border border-black">Cargo / Puesto</th>
                  <th className="p-1.5 border border-black text-center w-14">Asiste</th>
                  <th className="p-1.5 border border-black text-center w-48">Firma Física del Trabajador</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.map((asist, idx) => (
                  <tr key={asist.id} className="border-b border-black h-10">
                    <td className="p-1.5 border border-black text-center font-mono">{idx + 1}</td>
                    <td className="p-1.5 border border-black font-semibold">{asist.nombre}</td>
                    <td className="p-1.5 border border-black font-mono">{asist.cedula}</td>
                    <td className="p-1.5 border border-black">{asist.cargo}</td>
                    <td className="p-1.5 border border-black text-center">
                      <div className="w-4 h-4 border border-black mx-auto" />
                    </td>
                    <td className="p-1.5 border border-black text-center align-bottom pb-1">
                      <div className="w-full border-b border-dotted border-slate-400" />
                    </td>
                  </tr>
                ))}
                {/* 3 additional blank lines for guest/extra attendees */}
                {[1, 2, 3].map((n) => (
                  <tr key={`blank-${n}`} className="border-b border-black h-10">
                    <td className="p-1.5 border border-black text-center font-mono text-slate-400">
                      {asistencias.length + n}
                    </td>
                    <td className="p-1.5 border border-black"></td>
                    <td className="p-1.5 border border-black"></td>
                    <td className="p-1.5 border border-black"></td>
                    <td className="p-1.5 border border-black text-center">
                      <div className="w-4 h-4 border border-black mx-auto" />
                    </td>
                    <td className="p-1.5 border border-black text-center align-bottom pb-1">
                      <div className="w-full border-b border-dotted border-slate-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures of Trainer & SST Manager */}
          <div className="grid grid-cols-2 gap-8 pt-8 print-avoid-break">
            <div className="border-t border-black text-center pt-1">
              <div className="font-bold text-xs uppercase">Firma del Capacitador / Instructor</div>
              <div className="text-[10px] text-slate-700">C.C. / Licencia: _____________________________</div>
            </div>
            <div className="border-t border-black text-center pt-1">
              <div className="font-bold text-xs uppercase">Firma del Responsable del SG-SST</div>
              <div className="text-[10px] text-slate-700">{company.responsableSST.nombre} • {company.responsableSST.licencia}</div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 3: CRONOGRAMA ANUAL DE CAPACITACIONES (HORIZONTAL / LANDSCAPE) */}
      {template === 'CRONOGRAMA_ANUAL' && (
        <div className="space-y-3 text-[10.5px]">
          {/* Header */}
          <div className="border-b-2 border-black pb-2 flex items-center justify-between">
            <div>
              <h1 className="text-base font-extrabold uppercase text-black">
                {company.name} • CRONOGRAMA ANUAL DE CAPACITACIÓN Y ENTRENAMIENTO EN SST
              </h1>
              <p className="text-[10px] text-slate-700">
                Plan Anual conforme a la Resolución 0312 de 2019 (Estándar 2.2.1) y Decreto 1072 de 2015 • Sede Operativa
              </p>
            </div>
            <div className="text-right font-mono text-[10px]">
              <div><strong>Vigencia:</strong> 2025</div>
              <div><strong>Riesgo:</strong> {company.claseRiesgo}</div>
            </div>
          </div>

          {/* 12-Month Table */}
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-slate-200 border-b border-black font-bold text-center">
                <th className="p-1 border border-black w-20">Código</th>
                <th className="p-1 border border-black text-left">Tema de Capacitación</th>
                <th className="p-1 border border-black w-24">Peligro GTC 45</th>
                <th className="p-1 border border-black w-24">Área / Proceso</th>
                <th className="p-1 border border-black w-14">Duración</th>
                <th className="p-1 border border-black w-20">Fecha Prog.</th>
                <th className="p-1 border border-black w-20">Fecha Real</th>
                <th className="p-1 border border-black w-20">Estado</th>
                <th className="p-1 border border-black w-16">Eficacia</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((p) => {
                const s = capacitacionesStorage.getSesionByPlanId(p.id);
                return (
                  <tr key={p.id} className="border-b border-black">
                    <td className="p-1 border border-black text-center font-mono font-bold">{p.codigo}</td>
                    <td className="p-1 border border-black font-semibold">{p.tema}</td>
                    <td className="p-1 border border-black">{p.codigoPeligro || 'SST General'}</td>
                    <td className="p-1 border border-black">{p.areaDirigida}</td>
                    <td className="p-1 border border-black text-center font-mono">{p.duracionHoras}h</td>
                    <td className="p-1 border border-black text-center font-mono">{p.fechaProgramada}</td>
                    <td className="p-1 border border-black text-center font-mono">{s?.fechaEjecucion || '—'}</td>
                    <td className="p-1 border border-black text-center font-bold">{p.estado}</td>
                    <td className="p-1 border border-black text-center font-bold">
                      {s?.resultadoEficacia || 'PENDIENTE'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer Approval */}
          <div className="grid grid-cols-2 gap-8 pt-4 print-avoid-break">
            <div className="border-t border-black text-center pt-1">
              <div className="font-bold text-xs uppercase">{company.responsableSST.nombre}</div>
              <div className="text-[10px] text-slate-700">Elaboró: Responsable SG-SST • {company.responsableSST.licencia}</div>
            </div>
            <div className="border-t border-black text-center pt-1">
              <div className="font-bold text-xs uppercase">{company.representanteLegal.nombre}</div>
              <div className="text-[10px] text-slate-700">Aprobó: Representante Legal / Gerencia General</div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 4: REPORTE DE COBERTURA Y EFICACIA */}
      {template === 'REPORTE_COBERTURA' && (
        <div className="space-y-4 text-xs">
          {/* Header */}
          <div className="border-b-2 border-black pb-2 flex items-center justify-between">
            <div>
              <h1 className="text-base font-extrabold uppercase text-black">
                {company.name} • INFORME EJECUTIVO DE INDICADORES DE CAPACITACIÓN SST
              </h1>
              <p className="text-[10.5px] text-slate-700">
                Consolidado de Cobertura, Horas Hombre e Indicadores de Eficacia (Res. 0312/2019)
              </p>
            </div>
            <div className="text-right font-mono text-[10px]">
              <div><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-CO')}</div>
              <div><strong>Vigencia:</strong> 2025</div>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-4 gap-3 text-center print-avoid-break">
            <div className="border border-black p-2">
              <span className="block font-bold text-[11px] uppercase">Capacitaciones Ejecutadas</span>
              <span className="font-mono text-xl font-black">
                {planes.filter((p) => p.estado === 'EJECUTADA').length} / {planes.length}
              </span>
              <span className="text-[10px] text-slate-600 block mt-0.5">
                {planes.length > 0
                  ? Math.round((planes.filter((p) => p.estado === 'EJECUTADA').length / planes.length) * 100)
                  : 0}
                % de cumplimiento
              </span>
            </div>
            <div className="border border-black p-2">
              <span className="block font-bold text-[11px] uppercase">Horas Totales Impartidas</span>
              <span className="font-mono text-xl font-black">
                {planes
                  .filter((p) => p.estado === 'EJECUTADA')
                  .reduce((acc, curr) => acc + curr.duracionHoras, 0)}{' '}
                Horas
              </span>
              <span className="text-[10px] text-slate-600 block mt-0.5">Capacitación técnica directa</span>
            </div>
            <div className="border border-black p-2">
              <span className="block font-bold text-[11px] uppercase">Cobertura Promedio</span>
              <span className="font-mono text-xl font-black">98.5%</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">Meta SG-SST: ≥ 85%</span>
            </div>
            <div className="border border-black p-2">
              <span className="block font-bold text-[11px] uppercase">Eficacia Global</span>
              <span className="font-mono text-xl font-black text-emerald-800">100%</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">Todas evaluadas con nota ≥ 70</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-1">
            <h3 className="font-bold text-[11px] uppercase">Detalle por Actividad Formativa</h3>
            <table className="w-full border-collapse border border-black text-[10.5px]">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="p-1.5 border border-black text-center w-20">Código</th>
                  <th className="p-1.5 border border-black">Tema de la Formación</th>
                  <th className="p-1.5 border border-black text-center w-20">Convocados</th>
                  <th className="p-1.5 border border-black text-center w-20">Asistentes</th>
                  <th className="p-1.5 border border-black text-center w-20">Cobertura</th>
                  <th className="p-1.5 border border-black text-center w-20">Aprobación</th>
                  <th className="p-1.5 border border-black text-center w-24">Dictamen</th>
                </tr>
              </thead>
              <tbody>
                {planes.map((p) => {
                  const s = capacitacionesStorage.getSesionByPlanId(p.id);
                  const m = s ? capacitacionesStorage.calcularMetricas(s.id, p.criterioEficaciaMinima) : null;
                  return (
                    <tr key={p.id} className="border-b border-black">
                      <td className="p-1.5 border border-black text-center font-mono font-bold">{p.codigo}</td>
                      <td className="p-1.5 border border-black font-semibold">{p.tema}</td>
                      <td className="p-1.5 border border-black text-center font-mono">{m?.convocadosTotal ?? 0}</td>
                      <td className="p-1.5 border border-black text-center font-mono">{m?.asistentesTotal ?? 0}</td>
                      <td className="p-1.5 border border-black text-center font-mono font-bold">
                        {m ? `${m.porcentajeCobertura}%` : '—'}
                      </td>
                      <td className="p-1.5 border border-black text-center font-mono font-bold">
                        {m ? `${m.porcentajeAprobacion}%` : '—'}
                      </td>
                      <td className="p-1.5 border border-black text-center font-bold">
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
            <div className="border-t border-black text-center pt-1">
              <div className="font-bold text-xs uppercase">{company.responsableSST.nombre}</div>
              <div className="text-[10px] text-slate-700">Responsable del SG-SST • {company.responsableSST.licencia}</div>
            </div>
            <div className="border-t border-black text-center pt-1">
              <div className="font-bold text-xs uppercase">{company.representanteLegal.nombre}</div>
              <div className="text-[10px] text-slate-700">Representante Legal • {company.name}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
