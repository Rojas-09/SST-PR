import { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileDown,
  Scale,
  Check,
  Lock,
  Printer,
  FileCheck,
  Building2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { CompanyInfo } from '../types';
import { ConstanciaTecnicaCard } from './ConstanciaTecnicaCard';
import {
  StandardRow,
  ComplianceStatus,
  standards60Official,
  standards21Official,
  standards7Official,
  defaultEvaluations60,
} from '../data/standardsRes0312';

interface DiagnosticoRes0312Props {
  company: CompanyInfo;
  onUpdateCompany: (updated: CompanyInfo) => void;
}

export function DiagnosticoRes0312({ company, onUpdateCompany }: DiagnosticoRes0312Props) {
  // Helper to parse risk class from string or number
  const parseRiskClassNumber = (clase: string | undefined): number => {
    if (!clase) return 4;
    if (clase.includes('V') && !clase.includes('IV')) return 5;
    if (clase.includes('IV')) return 4;
    if (clase.includes('III')) return 3;
    if (clase.includes('II')) return 2;
    if (clase.includes('I')) return 1;
    return 4;
  };

  // Helper to calculate official regime under Resolution 0312/2019
  const determineLegalRegime = (workers: number, riskClass: number): '60' | '21' | '7' => {
    // 1. Más de 50 trabajadores (cualquier riesgo) -> 60 Estándares (Art. 16)
    // 2. Riesgo IV o V (incluso con 1 a 50 trabajadores) -> 60 Estándares (Art. 16)
    // 3. 11 a 50 trabajadores con Riesgo I, II o III -> 21 Estándares (Art. 9)
    // 4. 1 a 10 trabajadores con Riesgo I, II o III -> 7 Estándares (Art. 3)
    if (workers > 50 || riskClass >= 4) {
      return '60';
    }
    if (workers >= 11) {
      return '21';
    }
    return '7';
  };

  const initialRisk = parseRiskClassNumber(company.claseRiesgo);
  const initialWorkers = company.trabajadores || 8;

  // Classification parameters state
  const [workerCount, setWorkerCount] = useState<number>(initialWorkers);
  const [threshold, setThreshold] = useState<'1_10' | '11_50' | 'mas_50'>(() => {
    if (initialWorkers <= 10) return '1_10';
    if (initialWorkers <= 50) return '11_50';
    return 'mas_50';
  });
  const [selectedRiskClass, setSelectedRiskClass] = useState<number>(initialRisk);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<boolean>(false);

  // Economic activity
  const economicActivity = '4520 - Mantenimiento y reparación de vehículos automotores (CIIU Rev. 4 A.C.)';

  // Risk classes definition according to Decreto 768 / MinTrabajo
  const riskClasses = [
    {
      id: 1,
      label: 'Clase I',
      desc: 'Riesgo Mínimo (Comercial, financiero, oficinas)',
      rate: '0.522%',
    },
    {
      id: 2,
      label: 'Clase II',
      desc: 'Riesgo Bajo (Manufactura liviana, almacenes)',
      rate: '1.044%',
    },
    {
      id: 3,
      label: 'Clase III',
      desc: 'Riesgo Medio (Logística, alimentos, metalmecánica liviana)',
      rate: '2.436%',
    },
    {
      id: 4,
      label: 'Clase IV',
      desc: 'Riesgo Alto (Talleres mecánicos, carrocería, corte/soldadura)',
      rate: '4.350%',
    },
    {
      id: 5,
      label: 'Clase V',
      desc: 'Riesgo Máximo (Minería, construcción mayor, alta tensión)',
      rate: '6.960%',
    },
  ];

  // Regime selection state: automatically defaults to legal resolution 0312 requirement
  const [selectedRegime, setSelectedRegime] = useState<'60' | '21' | '7'>(() =>
    determineLegalRegime(initialWorkers, initialRisk)
  );

  // Sincronización si la configuración de la empresa se actualiza externamente (ej. modal ajustes)
  useEffect(() => {
    const updatedRisk = parseRiskClassNumber(company.claseRiesgo);
    const updatedWorkers = company.trabajadores || 8;
    setWorkerCount(updatedWorkers);
    setSelectedRiskClass(updatedRisk);
    if (updatedWorkers <= 10) setThreshold('1_10');
    else if (updatedWorkers <= 50) setThreshold('11_50');
    else setThreshold('mas_50');
    setSelectedRegime(determineLegalRegime(updatedWorkers, updatedRisk));
  }, [company.trabajadores, company.claseRiesgo]);

  // Dynamic calculation of legal regime
  let applicableStandardsCount = selectedRegime === '60' ? 60 : selectedRegime === '21' ? 21 : 7;
  let legalArticle =
    selectedRegime === '60'
      ? 'Artículo 16 de la Res. 0312/2019 (Empresas de más de 50 trabajadores o riesgo IV/V)'
      : selectedRegime === '21'
      ? 'Artículo 9 de la Res. 0312/2019 (Empresas de 11 a 50 trabajadores)'
      : 'Artículo 3 de la Res. 0312/2019 (Régimen simplificado de 7 estándares)';
  let isExceptionApplied = selectedRegime === '21' && workerCount <= 10 && selectedRiskClass >= 4;

  const activeStandards = useMemo(() => {
    if (selectedRegime === '60') return standards60Official;
    if (selectedRegime === '7') return standards7Official;
    return standards21Official;
  }, [selectedRegime]);

  // The official 21 standards exact table from Resolution 0312 for automotive / metalworking workshop
  const standards21: StandardRow[] = [
    {
      item: '1.1.1',
      ciclo: 'Planear',
      estandar: 'Responsable del SG-SST',
      criterio: 'Asignación formal de persona con licencia SST vigente y certificación de curso de 50 horas.',
      modoVerificacion: 'Documental',
      peso: '0.5%',
    },
    {
      item: '1.1.2',
      ciclo: 'Planear',
      estandar: 'Responsabilidades en el SG-SST',
      criterio: 'Definición clara y divulgación documentada de responsabilidades SST en todos los niveles operativos.',
      modoVerificacion: 'Documental',
      peso: '0.5%',
    },
    {
      item: '1.1.3',
      ciclo: 'Planear',
      estandar: 'Asignación de recursos',
      criterio: 'Definición de presupuesto anual específico (recursos financieros, técnicos y humanos).',
      modoVerificacion: 'Documental',
      peso: '0.5%',
    },
    {
      item: '1.1.4',
      ciclo: 'Planear',
      estandar: 'Afiliación a Seguridad Social',
      criterio: 'Planilla PILA al día con cobertura al 100% de los operarios en ARL (Riesgo IV), EPS y AFP.',
      modoVerificacion: 'Físico / Digital',
      peso: '0.5%',
    },
    {
      item: '1.1.5',
      ciclo: 'Planear',
      estandar: 'Identificación de alto riesgo',
      criterio: 'Identificación y reporte de actividades con cotización especial en pensión (Dec. 2090/2003).',
      modoVerificacion: 'Documental',
      peso: '0.5%',
    },
    {
      item: '1.1.6',
      ciclo: 'Planear',
      estandar: 'Conformación de Vigía SST',
      criterio: 'Acta de elección formal del Vigía de Seguridad y Salud en el Trabajo (aplicable por ser <10 trab.).',
      modoVerificacion: 'Físico / Acta',
      peso: '0.5%',
    },
    {
      item: '1.1.7',
      ciclo: 'Planear',
      estandar: 'Capacitación en SST',
      criterio: 'Programa estructurado de inducción, reinducción y entrenamiento en riesgos de taller mecánico.',
      modoVerificacion: 'Físico / Registro',
      peso: '2.0%',
    },
    {
      item: '1.2.1',
      ciclo: 'Planear',
      estandar: 'Programa Anual de Trabajo',
      criterio: 'Plan anual fechado y firmado por el Representante Legal con cronograma, metas e indicadores.',
      modoVerificacion: 'Documental',
      peso: '2.0%',
    },
    {
      item: '2.1.1',
      ciclo: 'Hacer',
      estandar: 'Política de SST',
      criterio: 'Política documentada, fechada, firmada y debidamente comunicada al personal operativo.',
      modoVerificacion: 'Documental',
      peso: '1.0%',
    },
    {
      item: '2.2.1',
      ciclo: 'Hacer',
      estandar: 'Objetivos de SST',
      criterio: 'Objetivos medibles y cuantificables congruentes con los peligros prioritarios del taller.',
      modoVerificacion: 'Documental',
      peso: '1.0%',
    },
    {
      item: '2.3.1',
      ciclo: 'Hacer',
      estandar: 'Evaluación inicial del SG-SST',
      criterio: 'Diagnóstico de línea base documentado según la tabla técnica de la Res. 0312/2019.',
      modoVerificacion: 'Documental',
      peso: '1.0%',
    },
    {
      item: '2.4.1',
      ciclo: 'Hacer',
      estandar: 'Plan de Mejoramiento',
      criterio: 'Plan correctivo formulado a partir de los hallazgos de la autoevaluación inmediatamente anterior.',
      modoVerificacion: 'Documental',
      peso: '2.0%',
    },
    {
      item: '2.5.1',
      ciclo: 'Hacer',
      estandar: 'Conservación de documentos',
      criterio: 'Procedimiento y archivo seguro (físico/digital) garantizando custodia de registros por 20 años.',
      modoVerificacion: 'Registro',
      peso: '2.0%',
    },
    {
      item: '2.6.1',
      ciclo: 'Hacer',
      estandar: 'Rendición de cuentas',
      criterio: 'Informe formal de rendición de cuentas sobre el desempeño del SG-SST presentado anualmente.',
      modoVerificacion: 'Documental',
      peso: '1.0%',
    },
    {
      item: '2.7.1',
      ciclo: 'Hacer',
      estandar: 'Matriz legal',
      criterio: 'Compilación de normas SST nacionales y sectoriales automotrices debidamente actualizadas.',
      modoVerificacion: 'Documental',
      peso: '2.0%',
    },
    {
      item: '3.1.1',
      ciclo: 'Hacer',
      estandar: 'Identificación de peligros (GTC 45)',
      criterio: 'Matriz GTC 45 actualizada con participación de trabajadores para soldadura, químicos y mecánicos.',
      modoVerificacion: 'Físico / Matriz',
      peso: '15.0%',
      isPrioritario: true,
    },
    {
      item: '3.2.1',
      ciclo: 'Hacer',
      estandar: 'Medidas de prevención y control',
      criterio: 'Aplicación de jerarquía de controles (guardas, extractores de gases) y registro de dotación de EPP certificado.',
      modoVerificacion: 'Físico en Planta',
      peso: '15.0%',
      isPrioritario: true,
    },
    {
      item: '4.1.1',
      ciclo: 'Hacer',
      estandar: 'Plan de Emergencias y Brigada',
      criterio: 'Plano de rutas de evacuación, extintores multipropósito vigentes, botiquín tipo A y simulacro anual.',
      modoVerificacion: 'Físico / Planta',
      peso: '10.0%',
    },
    {
      item: '5.1.1',
      ciclo: 'Verificar',
      estandar: 'Investigación de ATEL',
      criterio: 'Reporte de accidentes dentro de 2 días hábiles a ARL/EPS e investigación con equipo investigador.',
      modoVerificacion: 'Documental / ARL',
      peso: '5.0%',
    },
    {
      item: '6.1.1',
      ciclo: 'Actuar',
      estandar: 'Auditoría interna anual',
      criterio: 'Auditoría planificada al menos una vez al año con informe de revisión gerencial documentado.',
      modoVerificacion: 'Documental',
      peso: '5.0%',
    },
    {
      item: '6.1.2',
      ciclo: 'Actuar',
      estandar: 'Acciones preventivas / correctivas',
      criterio: 'Planes de acción definidos a partir de no conformidades detectadas en auditorías e investigaciones.',
      modoVerificacion: 'Documental',
      peso: '2.5%',
    },
  ];

  // Interactive audit state initialized with full 60 standards data
  const [activePhvaTab, setActivePhvaTab] = useState<'TODOS' | 'Planear' | 'Hacer' | 'Verificar' | 'Actuar'>('TODOS');
  const [evaluaciones, setEvaluaciones] = useState<Record<string, { status: ComplianceStatus; justificacion: string }>>(
    defaultEvaluations60
  );

  const { currentScore, totalWeight, compliancePercentage, phaseStats } = useMemo(() => {
    let earned = 0;
    let total = 0;

    const stats = {
      Planear: { total: 0, cumplidos: 0, weightEarned: 0, weightTotal: 0 },
      Hacer: { total: 0, cumplidos: 0, weightEarned: 0, weightTotal: 0 },
      Verificar: { total: 0, cumplidos: 0, weightEarned: 0, weightTotal: 0 },
      Actuar: { total: 0, cumplidos: 0, weightEarned: 0, weightTotal: 0 },
    };

    activeStandards.forEach((std) => {
      const evaluation = evaluaciones[std.item] || { status: 'NO_CUMPLE', justificacion: '' };
      const weightNum = parseFloat(std.peso.replace('%', '')) || 0;
      total += weightNum;
      stats[std.ciclo].total += 1;
      stats[std.ciclo].weightTotal += weightNum;

      if (evaluation.status === 'CUMPLE' || evaluation.status === 'NO_APLICA') {
        earned += weightNum;
        stats[std.ciclo].cumplidos += 1;
        stats[std.ciclo].weightEarned += weightNum;
      }
    });

    const pct = total > 0 ? (earned / total) * 100 : 0;
    return {
      currentScore: earned,
      totalWeight: total,
      compliancePercentage: Math.round(pct * 10) / 10,
      phaseStats: stats,
    };
  }, [evaluaciones, activeStandards]);

  const handleStatusChange = (itemCode: string, newStatus: ComplianceStatus) => {
    setEvaluaciones((prev) => ({
      ...prev,
      [itemCode]: {
        ...prev[itemCode],
        status: newStatus,
      },
    }));
  };

  const handleJustificacionChange = (itemCode: string, text: string) => {
    setEvaluaciones((prev) => ({
      ...prev,
      [itemCode]: {
        ...prev[itemCode],
        justificacion: text,
      },
    }));
  };

  const filteredStandards = useMemo(() => {
    if (activePhvaTab === 'TODOS') return activeStandards;
    return activeStandards.filter((s) => s.ciclo === activePhvaTab);
  }, [activePhvaTab, activeStandards]);

  const valoracionCualitativa = useMemo(() => {
    if (compliancePercentage >= 85) {
      return {
        label: 'Aceptable (≥ 85%)',
        textColor: 'text-emerald-700',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
        barColor: 'bg-emerald-500',
        desc: 'Mantener el plan de trabajo anual y enviar reporte a la ARL.',
      };
    }
    if (compliancePercentage >= 60) {
      return {
        label: 'Moderadamente Aceptable (60% - 85%)',
        textColor: 'text-amber-700',
        badgeBg: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
        barColor: 'bg-amber-500',
        desc: 'Plan de mejoramiento inmediato con reporte semestral obligatorio.',
      };
    }
    return {
      label: 'Crítico (< 60%)',
      textColor: 'text-red-700',
      badgeBg: 'bg-red-500/10 text-red-700 border-red-500/20',
      barColor: 'bg-red-500',
      desc: 'Plan de mejoramiento con envío obligatorio en un plazo máximo de 3 meses.',
    };
  }, [compliancePercentage]);

  const applyClassificationChange = (newWorkers: number, newRiskClass: number) => {
    setWorkerCount(newWorkers);
    setSelectedRiskClass(newRiskClass);

    if (newWorkers <= 10) setThreshold('1_10');
    else if (newWorkers <= 50) setThreshold('11_50');
    else setThreshold('mas_50');

    // Modificación automática del régimen Res. 0312 según tamaño y riesgo
    const autoRegime = determineLegalRegime(newWorkers, newRiskClass);
    setSelectedRegime(autoRegime);

    // Sincronizar persistentemente con la información central de la empresa
    const riskMap: Record<number, string> = {
      1: 'RIESGO CLASE I',
      2: 'RIESGO CLASE II',
      3: 'RIESGO CLASE III',
      4: 'RIESGO CLASE IV',
      5: 'RIESGO CLASE V',
    };

    onUpdateCompany({
      ...company,
      trabajadores: newWorkers,
      claseRiesgo: riskMap[newRiskClass] || `RIESGO CLASE ${newRiskClass}`,
    });
  };

  const handleSelectThreshold = (selected: '1_10' | '11_50' | 'mas_50') => {
    let targetWorkers = 8;
    if (selected === '1_10') targetWorkers = 8;
    if (selected === '11_50') targetWorkers = 25;
    if (selected === 'mas_50') targetWorkers = 65;
    applyClassificationChange(targetWorkers, selectedRiskClass);
  };

  const handleWorkerInputChange = (val: string) => {
    const num = parseInt(val, 10);
    const clamped = isNaN(num) ? 1 : Math.max(1, Math.min(999, num));
    applyClassificationChange(clamped, selectedRiskClass);
  };

  const handleSelectRiskClass = (riskId: number) => {
    applyClassificationChange(workerCount, riskId);
  };

  const handleSaveActa = () => {
    setSaveSuccessNotification(true);
    setTimeout(() => {
      setSaveSuccessNotification(false);
    }, 4000);
  };

  const [pdfDownloaded, setPdfDownloaded] = useState<boolean>(false);

  const handleDownloadPdf = () => {
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-[#F8F9FF] min-h-screen text-slate-800">
      {/* Toast Notification on Save */}
      {saveSuccessNotification && (
        <div className="fixed top-5 right-5 left-5 sm:left-auto sm:max-w-[calc(100vw-2.5rem)] z-50 bg-[#0F172A] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Diagnóstico Guardado y Acta Convalidada</p>
            <p className="text-slate-300 text-[11px]">Se registró la constancia formal en el expediente de Taller Los Andes S.A.S.</p>
          </div>
        </div>
      )}

      {/* Toast Notification on PDF Download */}
      {pdfDownloaded && (
        <div className="fixed top-5 right-5 left-5 sm:left-auto sm:max-w-[calc(100vw-2.5rem)] z-50 bg-[#0F172A] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-2">
          <FileDown className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Formato Técnico Generado (.pdf)</p>
            <p className="text-slate-300 text-[11px]">Expediente documental preparado para inspección de MinTrabajo y ARL.</p>
          </div>
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1.5 max-w-4xl">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>SISTEMA DE GESTIÓN SG-SST • DIAGNÓSTICO TÉCNICO</span>
          </div>

          <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
            Diagnóstico Inicial de Estándares Mínimos
          </h1>

          <p className="text-[13px] text-slate-600 leading-relaxed">
            Determinación de aplicabilidad según la Resolución 0312 de 2019 del Ministerio del Trabajo (Decreto 1072 de 2015).
          </p>

          <div className="text-[12px] text-slate-500 pt-1 leading-normal">
            Razón Social: <strong className="text-slate-700">{company.name}</strong> • NIT: <strong className="text-slate-700">{company.nit}</strong> • Actividad Económica: <span className="text-slate-700">CIIU 4520 – Mantenimiento mecánico y carrocería</span> • Sede: <span className="text-slate-700">{company.sede}</span>
          </div>
        </div>

        {/* Action Buttons: Clay Styled */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-1">
          <button
            type="button"
            onClick={handleSaveActa}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#1464CC] text-white rounded-lg text-[13px] font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Guardar Diagnóstico y Generar Acta</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[13px] font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Descargar Formato Técnico (.pdf)</span>
          </button>
        </div>
      </div>

      {/* MÓDULO 1: PARÁMETROS DE CLASIFICACIÓN DE LA ORGANIZACIÓN */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Module Header */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-bold text-slate-900">
              MÓDULO 1 / Parámetros de Clasificación de la Organización
            </span>
          </div>
          <span className="text-[12px] text-slate-500">
            Artículos 3, 9 y 16 Res. 0312/2019
          </span>
        </div>

        {/* Form Body: 2 Columns */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 text-[13px]">
          {/* Columna 1 — Número de Trabajadores y Actividad Económica */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between pb-1.5">
                <label className="text-[12.5px] font-semibold text-slate-900 block">
                  1. Número total de trabajadores directos y contratistas
                </label>
                <span className="text-[11.5px] text-slate-500">
                  Base de cálculo SG-SST
                </span>
              </div>

              {/* Number input and 3 quick threshold selector buttons */}
              <div className="flex items-center gap-2 pt-1">
                {/* Number input box */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 w-32 shadow-2xs focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={workerCount}
                    onChange={(e) => handleWorkerInputChange(e.target.value)}
                    className="w-full font-bold text-[13px] text-slate-900 bg-transparent outline-none text-left"
                  />
                  <span className="text-[12px] text-slate-400 pl-1">oper.</span>
                </div>

                {/* Threshold selectors */}
                <div className="flex items-center gap-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => handleSelectThreshold('1_10')}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[12.5px] font-medium transition-colors border cursor-pointer text-center ${
                      threshold === '1_10'
                        ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    1 a 10
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectThreshold('11_50')}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[12.5px] font-medium transition-colors border cursor-pointer text-center ${
                      threshold === '11_50'
                        ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    11 a 50
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectThreshold('mas_50')}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[12.5px] font-medium transition-colors border cursor-pointer text-center ${
                      threshold === 'mas_50'
                        ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Más de 50
                  </button>
                </div>
              </div>
            </div>

            {/* Actividad Económica Verificada */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-[12.5px] font-semibold text-slate-900 block">
                Actividad Económica Verificada (Decreto 768 de 2022 / CIIU)
              </label>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[13px] text-slate-800 flex items-center justify-between">
                <span className="truncate">{economicActivity}</span>
                <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0 ml-2">
                  cod. principal
                </span>
              </div>
            </div>
          </div>

          {/* Columna 2 — Clase de Riesgo ARL Asignada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <label className="text-[12.5px] font-semibold text-slate-900 block">
                2. Clase de Riesgo ARL Asignada
              </label>
              <span className="text-[11.5px] text-slate-500">
                Tabla MinTrabajo
              </span>
            </div>

            {/* List of 5 risk classes */}
            <div className="space-y-1.5">
              {riskClasses.map((item) => {
                const isSelected = selectedRiskClass === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectRiskClass(item.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Radio Circle */}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`text-[12.5px] font-bold ${
                              isSelected ? 'text-blue-950' : 'text-slate-800'
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="text-[12px] text-slate-600 truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[12px] font-medium text-slate-500 pl-3 shrink-0">
                      {item.rate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel de Régimen Determinado Automáticamente por Ley */}
        <div className="px-5 py-3.5 bg-blue-50/80 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
              ✓
            </div>
            <div>
              <span className="font-semibold text-blue-950">
                Régimen Determinado Automáticamente:
              </span>{' '}
              <span className="font-bold text-blue-700">
                {applicableStandardsCount} Estándares Mínimos
              </span>{' '}
              <span className="text-slate-600 font-normal">
                ({legalArticle})
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-800 text-[11.5px] font-medium shadow-2xs self-start sm:self-auto shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronizado con nómina ({workerCount}) y riesgo (Clase {selectedRiskClass})</span>
          </div>
        </div>

        {/* Fundamentación Legal Inmediata */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-[12px] text-slate-600 leading-relaxed flex items-start gap-2">
          <span className="text-blue-600 font-bold">◇</span>
          <p>
            <strong className="text-slate-800">Fundamentación Legal:</strong> Conforme al Artículo 3, 9 y 16 de la Resolución 0312 de 2019, la combinación de tamaño de nómina y la clase de riesgo asignada por la ARL fija de forma ineludible el régimen de exigibilidad técnica (7, 21 o 60 estándares). No rige únicamente el número de colaboradores.
          </p>
        </div>
      </section>

      {/* REAL-TIME PROGRESS & COMPLIANCE SCORECARD */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
        {/* Header with Title and Exigencia Legal Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium uppercase tracking-wide">
              <Scale className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.5} />
              <span>DICTAMEN JURÍDICO VINCULANTE EN TIEMPO REAL</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                {compliancePercentage.toFixed(1)}%
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${valoracionCualitativa.badgeBg}`}>
                {valoracionCualitativa.label}
              </span>
            </div>

            <p className="text-[12.5px] text-slate-600">
              Marco Aplicable: {applicableStandardsCount} Estándares Mínimos ({legalArticle})
            </p>
          </div>

          {/* Exigencia Legal Box */}
          <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-right">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 block">
                PUNTAJE PONDERADO
              </span>
              <div className="text-[15px] font-bold text-slate-900 leading-tight">
                {currentScore.toFixed(1)} <span className="text-slate-400 text-[12px] font-normal">/ {totalWeight.toFixed(1)} pts</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Criterio Legal Callout */}
        <div className="p-3.5 bg-slate-50/90 rounded-lg border border-slate-200 flex items-start gap-2.5 text-[12.5px] text-slate-700 leading-relaxed">
          <Scale className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <strong className="text-slate-900 font-semibold">
              Régimen Jurídico Aplicable ({applicableStandardsCount} Estándares Mínimos):
            </strong>{' '}
            {selectedRegime === '60' && (
              <>
                Conforme al <strong className="text-slate-900">Artículo 16 de la Resolución 0312 de 2019</strong>, se auditan los <strong className="text-slate-900">60 estándares integrales</strong> requeridos para empresas de más de 50 trabajadores o empresas de cualquier tamaño clasificadas en Riesgo IV o V que decidan o requieran la implementación completa del SG-SST.
              </>
            )}
            {selectedRegime === '21' && (
              <>
                Conforme al <strong className="text-slate-900">Artículo 9 de la Resolución 0312 de 2019</strong>, se auditan los <strong className="text-slate-900">21 estándares</strong> aplicables para empresas de 11 a 50 trabajadores (o talleres de 1 a 10 trabajadores en Riesgo IV con excepción calificada).
              </>
            )}
            {selectedRegime === '7' && (
              <>
                Conforme al <strong className="text-slate-900">Artículo 3 de la Resolución 0312 de 2019</strong>, se auditan los <strong className="text-slate-900">7 estándares básicos</strong> de régimen simplificado para microempresas de 1 a 10 trabajadores en Riesgo I, II o III.
              </>
            )}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[11.5px] text-slate-500">
            <span>Cumplimiento Global Res. 0312</span>
            <span className="font-medium text-slate-700">{currentScore.toFixed(1)}% de 100% ponderado</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${valoracionCualitativa.barColor} transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(100, Math.max(0, compliancePercentage))}%` }}
            />
          </div>
        </div>

        {/* PHVA CYCLE METRICS (4 CARDS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          {(['Planear', 'Hacer', 'Verificar', 'Actuar'] as const).map((phase) => {
            const stat = phaseStats[phase];
            const pct = stat.weightTotal > 0 ? Math.round((stat.weightEarned / stat.weightTotal) * 100) : 0;
            return (
              <div key={phase} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 uppercase">{phase}</span>
                  <span className="text-slate-500 font-medium">{stat.cumplidos}/{stat.total}</span>
                </div>
                <div className="text-[18px] font-bold text-slate-900">
                  {pct}%
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MATRIZ TÉCNICA AUDITADA CON TABS PHVA Y CONTROLES INTERACTIVOS */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Selector de Régimen de Estándares (60, 21 o 7) */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50/90 to-indigo-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              Régimen Res. 0312:
            </span>
            <div className="inline-flex rounded-lg bg-white p-1 border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedRegime('60')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  selectedRegime === '60'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                60 Estándares (Art. 16 - Integral)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegime('21')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  selectedRegime === '21'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                21 Estándares (Art. 9)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegime('7')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  selectedRegime === '7'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                7 Estándares (Art. 3)
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Visualizando: <span className="font-bold text-blue-700">{activeStandards.length} estándares exigibles</span>
          </div>
        </div>

        {/* PHVA Filter Tabs */}
        <div className="px-3.5 pt-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="wrap-chips items-center gap-1.5 pb-2.5">
            {[
              { id: 'TODOS', label: 'Todos los Estándares', count: `${activeStandards.filter(s => evaluaciones[s.item]?.status === 'CUMPLE' || evaluaciones[s.item]?.status === 'NO_APLICA').length}/${activeStandards.length}` },
              { id: 'Planear', label: 'Planear', count: `${phaseStats.Planear.cumplidos}/${phaseStats.Planear.total}` },
              { id: 'Hacer', label: 'Hacer', count: `${phaseStats.Hacer.cumplidos}/${phaseStats.Hacer.total}` },
              { id: 'Verificar', label: 'Verificar', count: `${phaseStats.Verificar.cumplidos}/${phaseStats.Verificar.total}` },
              { id: 'Actuar', label: 'Actuar', count: `${phaseStats.Actuar.cumplidos}/${phaseStats.Actuar.total}` },
            ].map((tab) => {
              const isActive = activePhvaTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePhvaTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-600 border border-slate-200 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[12px] text-slate-500 pb-2.5">
            {applicableStandardsCount} Estándares Exigibles • Modo Auditoría
          </div>
        </div>

        {/* Interactive Standards List */}
        <div className="divide-y divide-slate-100">
          {filteredStandards.map((std) => {
            const evalData = evaluaciones[std.item] || { status: 'NO_CUMPLE', justificacion: '' };
            return (
              <div
                key={std.item}
                className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px]"
              >
                {/* Left: Code, Ciclo, Name, Criterion & Inline Justification */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[12.5px] text-blue-600">
                      {std.item}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 uppercase px-1.5 py-0.5 bg-slate-100 rounded">
                      {std.ciclo}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-900">
                      {std.estandar}
                    </span>
                    {std.isPrioritario && (
                      <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-medium">
                        PRIORITARIO (15%)
                      </span>
                    )}
                    <span className="text-[11.5px] text-slate-500">
                      Peso: {std.peso}%
                    </span>
                    <span className="text-[11.5px] text-slate-400">
                      • {std.modoVerificacion}
                    </span>
                  </div>

                  <p className="text-[12.5px] text-slate-600 leading-snug">
                    {std.criterio}
                  </p>

                  {/* Inline Justification field */}
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[11.5px] font-medium text-slate-500 shrink-0">
                      Evidencia:
                    </span>
                    <input
                      type="text"
                      value={evalData.justificacion}
                      onChange={(e) => handleJustificacionChange(std.item, e.target.value)}
                      placeholder="Ingrese evidencia técnica o soporte verificado..."
                      className="w-full text-[12.5px] bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-600 rounded-lg px-2.5 py-1 text-slate-800 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Right: Segmented Binary Switch (Cumple / No Cumple / No Aplica) */}
                <div className="shrink-0 flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-center">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(std.item, 'CUMPLE')}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                      evalData.status === 'CUMPLE'
                        ? 'bg-white text-emerald-700 shadow-2xs font-semibold border border-emerald-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cumple
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(std.item, 'NO_CUMPLE')}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                      evalData.status === 'NO_CUMPLE'
                        ? 'bg-white text-red-700 shadow-2xs font-semibold border border-red-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    No Cumple
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(std.item, 'NO_APLICA')}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                      evalData.status === 'NO_APLICA'
                        ? 'bg-white text-slate-700 shadow-2xs font-semibold border border-slate-300'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    No Aplica
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[12px] text-slate-500">
          <div>
            Mostrando {filteredStandards.length} de {standards21.length} estándares
          </div>
          <div>
            Puntaje ponderado acumulado: <strong className="text-slate-800">{currentScore.toFixed(1)}% / 100%</strong>
          </div>
        </div>
      </section>

      {/* CONSTANCIA TÉCNICA Y RESPONSABILIDAD JURÍDICA */}
      <ConstanciaTecnicaCard company={company} onUpdateCompany={onUpdateCompany} />
    </div>
  );
}
