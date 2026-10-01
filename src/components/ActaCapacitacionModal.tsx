import React, { useRef } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  Award,
  AlertTriangle,
  Building2,
  FileText,
} from 'lucide-react';
import { CapacitacionRecord, CompanyInfo } from '../types';
import { DigitalSignatureStamp } from './SignatureSvgs';

interface ActaCapacitacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  capacitacion: CapacitacionRecord;
  company: CompanyInfo;
}

export function ActaCapacitacionModal({
  isOpen,
  onClose,
  capacitacion,
  company,
}: ActaCapacitacionModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 font-sans text-slate-800 text-[13px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-white flex items-center gap-2">
                Acta y Registro Oficial de Capacitación en SST
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {capacitacion.codigo}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Formato legal conforme al Decreto 1072 de 2015 (Art. 2.2.4.6.11) y Resolución 0312 de 2019 (Estándar 2.2.1)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6" ref={printRef}>
          {/* Institutional Document Header */}
          <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-300">
              <div className="md:col-span-3 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-300 bg-slate-50 text-center">
                <Building2 className="w-8 h-8 text-blue-700 mb-1" />
                <span className="font-bold text-slate-900 text-xs">{company.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">NIT: {company.nit}</span>
                <span className="text-[9px] font-semibold text-blue-700 uppercase mt-0.5">
                  {company.claseRiesgo}
                </span>
              </div>
              <div className="md:col-span-6 p-4 flex flex-col justify-center text-center border-b md:border-b-0 md:border-r border-slate-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  SISTEMA DE GESTIÓN DE LA SEGURIDAD Y SALUD EN EL TRABAJO (SG-SST)
                </span>
                <h1 className="text-[15px] font-extrabold text-slate-900 uppercase mt-0.5">
                  FORMATO OFICIAL DE ASISTENCIA Y EVALUACIÓN DE CAPACITACIÓN
                </h1>
                <span className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Plan Anual de Capacitación y Entrenamiento en Prevención de Peligros
                </span>
              </div>
              <div className="md:col-span-3 p-3 text-[10px] text-slate-600 flex flex-col justify-center gap-1 bg-slate-50">
                <div><span className="font-semibold text-slate-700">Código Doc:</span> FOR-SST-CAP-04</div>
                <div><span className="font-semibold text-slate-700">Versión:</span> 03 (Vigente 2025)</div>
                <div><span className="font-semibold text-slate-700">Radicado:</span> {capacitacion.codigo}</div>
                <div><span className="font-semibold text-slate-700">Página:</span> 1 de 1</div>
              </div>
            </div>

            {/* General Training Info Table */}
            <div className="p-4 bg-slate-50/50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Tema Central de la Capacitación
                  </span>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {capacitacion.tema}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {capacitacion.objetivo}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Peligro Asociado (GTC 45):</span>
                    <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                      {capacitacion.codigoPeligro || 'Peligro General'} • {capacitacion.tipoPeligroGTC45}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Área / Proceso Impactado:</span>
                    <span className="font-medium text-slate-800 text-[11.5px]">{capacitacion.areaAfectada}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Modalidad e Intensidad:</span>
                    <span className="font-mono text-slate-800 text-[11.5px]">
                      {capacitacion.modalidad.replace(/_/g, ' ')} • {capacitacion.duracionHoras} Horas
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Fecha de Ejecución / Programación:</span>
                    <span className="font-mono font-bold text-slate-900 text-[11.5px]">
                      {capacitacion.fechaEjecucion || capacitacion.fechaProgramada}
                    </span>
                  </div>
                </div>
              </div>

              {/* Facilitador & Normativa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200/80 flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">
                      Facilitador / Entidad Capacitadora
                    </span>
                    <p className="font-bold text-slate-900 text-[12px]">{capacitacion.capacitador.nombre}</p>
                    <p className="text-[11px] text-slate-600">
                      {capacitacion.capacitador.entidad} • {capacitacion.capacitador.licenciaOId}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200/80 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      Marco Legal Obligatorio
                    </span>
                    <p className="text-[11px] text-slate-800 font-medium">
                      {capacitacion.normativaAplicable}
                    </p>
                    <span className="text-[10px] text-emerald-800 font-medium">
                      Conforme al ciclo PHVA (Hacer - Implementación del Plan de Formación)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Temario Desarrollado */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Contenidos y Competencias Técnicas Abordadas
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
              {capacitacion.temario.map((tema, i) => (
                <li key={i} className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200/80">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{tema}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Registro de Asistencia y Evaluación de Eficacia */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-700" />
                Registro Oficial de Asistencia, Firmas y Evaluación
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-600">
                  Cobertura:{' '}
                  <strong className="text-slate-900 font-mono">
                    {capacitacion.asistentesCount}/{capacitacion.convocadosCount} (
                    {capacitacion.porcentajeCobertura}%)
                  </strong>
                </span>
                <span className="text-slate-600">
                  Aprobación Promedio:{' '}
                  <strong className="text-emerald-700 font-mono">
                    {capacitacion.porcentajeAprobacion}%
                  </strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
              <table className="table-stack w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-2.5 w-[5%]">#</th>
                    <th className="py-2.5 px-2.5 w-[22%]">Nombre del Trabajador</th>
                    <th className="py-2.5 px-2.5 w-[12%]">Cédula</th>
                    <th className="py-2.5 px-2.5 w-[20%]">Cargo / Ocupación</th>
                    <th className="py-2.5 px-2.5 text-center w-[15%]">Asistencia</th>
                    <th className="py-2.5 px-2.5 text-center w-[13%]">Calificación (100)</th>
                    <th className="py-2.5 px-2.5 text-center w-[13%]">Firma Trabajador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {capacitacion.asistentes.map((asistente, index) => (
                    <tr key={asistente.id} className="hover:bg-slate-50/60">
                      <td data-label="#" className="py-2 px-3 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                      <td data-label="Nombre del Trabajador" className="py-2 px-3 font-semibold text-slate-900">{asistente.nombre}</td>
                      <td data-label="Cédula" className="py-2 px-3 font-mono text-slate-600">{asistente.cedula}</td>
                      <td data-label="Cargo / Ocupación" className="py-2 px-3 text-slate-600">{asistente.cargo}</td>
                      <td data-label="Asistencia" className="py-2 px-3 text-center">
                        {asistente.asistio ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Asistió
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Pendiente / Ausente
                          </span>
                        )}
                      </td>
                      <td data-label="Calificación (100)" className="py-2 px-3 text-center font-mono font-bold">
                        {asistente.calificacion !== undefined ? (
                          <span className={asistente.calificacion >= 80 ? 'text-emerald-700' : 'text-amber-700'}>
                            {asistente.calificacion}/100
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td data-label="Firma Trabajador" className="py-2 px-3 text-center">
                        {asistente.firmaRegistrada ? (
                          <span className="font-serif italic text-blue-800 text-[11px] font-semibold border-b border-blue-400 pb-0.5">
                            {asistente.nombre.split(' ')[0]} {asistente.nombre.split(' ')[1]?.[0]}. (Digital)
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Sin registrar</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evaluación de Eficacia (Res. 0312 Est. 2.2.1) */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3 text-xs">
            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block text-[12.5px]">
                Evaluación de la Eficacia y Transferencia al Puesto de Trabajo
              </span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Resultado de Eficacia del Entrenamiento:{' '}
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  {capacitacion.resultadoEficacia || 'PROGRAMADA PARA VERIFICACIÓN EN CAMPO'}
                </span>
                . Se verificará en las próximas 4 semanas la disminución de comportamientos inseguros en el área de{' '}
                <strong>{capacitacion.areaAfectada}</strong> y la no recurrencia de incidentes asociados al peligro{' '}
                <strong>{capacitacion.codigoPeligro}</strong>.
              </p>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            {/* Facilitador */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60 flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Facilitador Técnico</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Firma Certificada
                </span>
              </div>
              <div className="my-auto py-1 flex items-center justify-center">
                <span className="font-serif italic text-xl text-blue-900 font-bold tracking-wider">
                  {capacitacion.capacitador.nombre}
                </span>
              </div>
              <div className="border-t border-slate-300 pt-1 text-[11px] text-slate-600 text-center">
                <p className="font-bold text-slate-800">{capacitacion.capacitador.nombre}</p>
                <p>{capacitacion.capacitador.entidad} • {capacitacion.capacitador.licenciaOId}</p>
              </div>
            </div>

            {/* Responsable SST Empresa */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60 flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Responsable SG-SST de la Empresa</span>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Validado
                </span>
              </div>
              <div className="my-auto py-1 flex items-center justify-center">
                <DigitalSignatureStamp
                  name={company.responsableSST.nombre}
                  role={company.responsableSST.cargo}
                  license={company.responsableSST.licencia}
                />
              </div>
              <div className="border-t border-slate-300 pt-1 text-[11px] text-slate-600 text-center">
                <p className="font-bold text-slate-800">{company.responsableSST.nombre}</p>
                <p>Licencia SST: {company.responsableSST.licencia} • {company.name}</p>
              </div>
            </div>
          </div>

          {/* Legal Note Footer */}
          <div className="text-[10px] text-slate-400 text-center pt-2">
            Documento archivado en el expediente técnico de capacitación del SG-SST (Conservación legal mínima 20 años según Decreto 1072 de 2015, Artículo 2.2.4.6.13).
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Soporte auditado para Estándar 2.2.1 de la Resolución 0312 de 2019
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              Cerrar Vista Previa
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Constancia</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
