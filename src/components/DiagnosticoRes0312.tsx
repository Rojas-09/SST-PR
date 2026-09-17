import { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, Check, Award, FileSpreadsheet } from 'lucide-react';
import { CompanyInfo } from '../types';
import { SignatureCarlosMendez, SignatureRodrigoGomez, QrAuditStamp } from './SignatureSvgs';

interface DiagnosticoRes0312Props {
  company: CompanyInfo;
  onUpdateCompany: (updated: CompanyInfo) => void;
}

interface StandardItem {
  id: string;
  numeral: string;
  criterio: string;
  peso: number;
  cumple: 'CUMPLE' | 'NO_CUMPLE' | 'NO_APLICA';
  modoVerificacion: string;
}

export function DiagnosticoRes0312({ company, onUpdateCompany }: DiagnosticoRes0312Props) {
  const [standards, setStandards] = useState<StandardItem[]>([
    {
      id: 'std-1',
      numeral: '1.1.1',
      criterio: 'Asignación de una persona idónea con licencia en SST para el diseño del SG-SST',
      peso: 4.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Licencia SST 18492-2018 y certificación curso 50 horas vigente.',
    },
    {
      id: 'std-2',
      numeral: '1.1.2',
      criterio: 'Asignación de responsabilidades en SST a todos los niveles de la organización',
      peso: 4.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Manual de funciones y actas de asignación firmadas por gerencia.',
    },
    {
      id: 'std-3',
      numeral: '1.1.3',
      criterio: 'Asignación de recursos financieros, técnicos y humanos para el SG-SST',
      peso: 4.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Presupuesto anual 2025 aprobado por Rodrigo Gómez Mendoza.',
    },
    {
      id: 'std-4',
      numeral: '1.1.4',
      criterio: 'Afiliación vigente a los Sistemas Generales de Seguridad Social en Salud, Pensión y ARL',
      peso: 4.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Planillas PILA al día para los colaboradores operativos de taller.',
    },
    {
      id: 'std-5',
      numeral: '1.1.6',
      criterio: 'Conformación y funcionamiento del Comité Paritario de Seguridad y Salud (COPASST)',
      peso: 4.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Acta de votación, posesión y actas mensuales de reunión.',
    },
    {
      id: 'std-6',
      numeral: '2.1.1',
      criterio: 'Política de Seguridad y Salud en el Trabajo firmada, divulgada y fechada',
      peso: 5.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Publicada en cartelera principal del taller mecánico.',
    },
    {
      id: 'std-7',
      numeral: '2.2.1',
      criterio: 'Objetivos del SG-SST medibles, coherentes con la política y evaluados periódicamente',
      peso: 5.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Matriz de indicadores de estructura, proceso y resultado.',
    },
    {
      id: 'std-8',
      numeral: '4.1.1',
      criterio: 'Metodología para la identificación de peligros y valoración de riesgos (GTC 45)',
      peso: 15.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Matriz MAT-SST-2025-01 estructurada con valoración de severidad y controles.',
    },
    {
      id: 'std-9',
      numeral: '4.1.2',
      criterio: 'Identificación de sustancias catalogadas como cancerígenas o de toxicidad aguda',
      peso: 5.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Fichas FDS de soldadura, solventes dieléctricos y aceites pesados.',
    },
    {
      id: 'std-10',
      numeral: '4.2.1',
      criterio: 'Implementación de medidas de prevención y control con jerarquía en la fuente y medio',
      peso: 15.0,
      cumple: 'NO_CUMPLE',
      modoVerificacion: 'Intervención en curso en banco de soldadura y tablero eléctrico 220V.',
    },
    {
      id: 'std-11',
      numeral: '4.2.3',
      criterio: 'Entrega de Elementos de Protección Personal (EPP), reposición y capacitación',
      peso: 10.0,
      cumple: 'CUMPLE',
      modoVerificacion: 'Actas individuales de entrega con especificaciones técnicas ANSI/DIN.',
    },
  ]);

  const handleToggleStatus = (id: string, newStatus: 'CUMPLE' | 'NO_CUMPLE' | 'NO_APLICA') => {
    setStandards((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cumple: newStatus } : item))
    );
  };

  const handleAprobarDirectiva = () => {
    onUpdateCompany({
      ...company,
      representanteLegal: {
        ...company.representanteLegal,
        estadoAprobacion: 'APROBADO',
      },
    });
  };

  const totalScore = standards.reduce((acc, curr) => {
    if (curr.cumple === 'CUMPLE') return acc + curr.peso;
    if (curr.cumple === 'NO_APLICA') return acc + curr.peso;
    return acc;
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
            EVALUACIÓN DE ESTÁNDARES MÍNIMOS • RESOLUCIÓN 0312 DE 2019
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5 font-chivo">
            Diagnóstico de Cumplimiento Legal SG-SST
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Auditoría de autoevaluación conforme a la Tabla de Valores del Ministerio del Trabajo de Colombia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-2xs text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              PUNTAJE GLOBAL OBTENIDO
            </span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-2xl font-black font-mono text-emerald-700">{totalScore.toFixed(1)}%</span>
              <span className="text-xs text-slate-400 font-mono">/ 100%</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              VALORACIÓN: MODERADAMENTE ACEPTABLE
            </span>
          </div>
        </div>
      </div>

      {/* Standards List Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 font-chivo">
            Estándares Evaluados para Microempresas Riesgo IV (Metalmecánica / Automotriz)
          </h3>
          <span className="text-[10px] font-mono text-slate-500 font-semibold">
            {standards.length} Requisitos auditados
          </span>
        </div>

        <div className="divide-y divide-slate-200 text-xs">
          {standards.map((std) => (
            <div key={std.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 px-1.5 py-0.5 bg-slate-100 rounded">
                    {std.numeral}
                  </span>
                  <h4 className="font-semibold text-slate-800 text-xs">{std.criterio}</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  <strong>Modo de verificación:</strong> {std.modoVerificacion}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  Peso: {std.peso}%
                </span>

                {/* 3-Way Segmented Control */}
                <div className="inline-flex rounded border border-slate-300 p-0.5 bg-slate-100 text-[10px] font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(std.id, 'CUMPLE')}
                    className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                      std.cumple === 'CUMPLE'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    CUMPLE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(std.id, 'NO_CUMPLE')}
                    className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                      std.cumple === 'NO_CUMPLE'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    NO CUMPLE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(std.id, 'NO_APLICA')}
                    className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                      std.cumple === 'NO_APLICA'
                        ? 'bg-slate-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONSTANCIA TÉCNICA Y RESPONSABILIDAD JURÍDICA Card matching Screenshot 1 */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            CONSTANCIA TÉCNICA Y RESPONSABILIDAD JURÍDICA
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            Art. 10 - Perfil idóneo según nivel de riesgo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Signer 1: Responsable SST */}
          <div className="space-y-2 p-4 bg-slate-50/80 rounded border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">
                RESPONSABLE DE ELABORACIÓN Y CALIFICACIÓN SST
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1 font-chivo">
                {company.responsableSST.nombre}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {company.responsableSST.cargo}
              </p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Licencia SST: {company.responsableSST.licencia} • Curso 50h: {company.responsableSST.curso50h}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-700 font-medium">
                Firma electrónica registrada
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                HASH: {company.responsableSST.hashFirma}
              </span>
            </div>
          </div>

          {/* Signer 2: Representante Legal */}
          <div className="space-y-2 p-4 bg-slate-50/80 rounded border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">
                REPRESENTANTE LEGAL DE LA ORGANIZACIÓN
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1 font-chivo">
                {company.representanteLegal.nombre}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {company.representanteLegal.cargo} • {company.name}
              </p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                C.C.: {company.representanteLegal.cedula} • NIT: {company.nit}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-700 font-medium">
                Firma y aprobación directiva
              </span>
              {company.representanteLegal.estadoAprobacion === 'APROBADO' ? (
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" /> APROBADO DIRECTIVA
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleAprobarDirectiva}
                  className="text-[10px] font-mono font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded border border-amber-300 transition-colors cursor-pointer"
                  title="Convalidar y firmar directivamente"
                >
                  PENDIENTE CONVALIDACIÓN (Firmar)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Legal Disclaimer matching Screenshot 1 */}
        <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 leading-relaxed font-sans max-w-3xl mx-auto">
          Diagnóstico técnico parametrizado conforme a la Tabla de Valores y Calificación de la <strong>Resolución 0312 de 2019</strong> y <strong>Decreto 1072 de 2015</strong> del Ministerio del Trabajo de la República de Colombia.
        </div>
      </div>
    </div>
  );
}
