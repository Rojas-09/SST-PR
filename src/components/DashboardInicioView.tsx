import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  FileCheck,
  Calendar,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Activity,
  Award,
  Layers,
  FileText,
  AlertCircle,
  Clock,
  UserCheck,
  GraduationCap,
  CalendarDays,
  ExternalLink,
  ChevronRight,
  CheckSquare,
  Plus,
  MapPin,
  Wrench,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { HazardRecord, CompanyInfo, ActiveView, IncapacidadRecord, CapacitacionRecord } from '../types';

interface DashboardInicioViewProps {
  hazards: HazardRecord[];
  incapacidades: IncapacidadRecord[];
  company: CompanyInfo;
  capacitaciones?: CapacitacionRecord[];
  onNavigate: (view: ActiveView) => void;
  onSelectHazard: (hazard: HazardRecord) => void;
  onOpenNewHazard: () => void;
}

export function DashboardInicioView({
  hazards,
  incapacidades,
  company,
  capacitaciones,
  onNavigate,
  onSelectHazard,
  onOpenNewHazard,
}: DashboardInicioViewProps) {
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotHistory, setCopilotHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>(() => [
    {
      role: 'assistant',
      text: `Hola, soy tu Asistente Copilot SST. He analizado la empresa **${company.name}** (${company.claseRiesgo}). Hay **${hazards.filter((h) => h.evaluacion.level === 'NIVEL_I').length} peligros en Nivel I Crítico** que requieren intervención de ingeniería inmediata según GTC 45 y Art. 2.2.4.6.24 de Dec. 1072. ¿Deseas generar el plan de contingencia o auditar las actas de EPP?`,
      time: 'Hace un momento',
    },
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // GTC 45 Risk stats
  const riskStats = useMemo(() => {
    const counts = { NIVEL_I: 0, NIVEL_II: 0, NIVEL_III: 0, NIVEL_IV: 0 };
    hazards.forEach((h) => {
      if (counts[h.evaluacion.level] !== undefined) {
        counts[h.evaluacion.level]++;
      }
    });
    return [
      { name: 'Nivel I (Crítico)', value: counts.NIVEL_I || 2, color: '#DC2626' },
      { name: 'Nivel II (Alto)', value: counts.NIVEL_II || 3, color: '#EA580C' },
      { name: 'Nivel III (Medio)', value: counts.NIVEL_III || 1, color: '#2563EB' },
      { name: 'Nivel IV (Bajo)', value: counts.NIVEL_IV || 1, color: '#16A34A' },
    ];
  }, [hazards]);

  // PHVA compliance stats for Res. 0312
  const phvaChartData = [
    { fase: 'Planear', cumplimiento: 23.5, meta: 25.0, fill: '#3B82F6' },
    { fase: 'Hacer', cumplimiento: 54.0, meta: 60.0, fill: '#10B981' },
    { fase: 'Verificar', cumplimiento: 4.5, meta: 5.0, fill: '#F59E0B' },
    { fase: 'Actuar', cumplimiento: 8.5, meta: 10.0, fill: '#8B5CF6' },
  ];

  // Incapacidades by type
  const ausentismoData = useMemo(() => {
    let atDays = 0, atCost = 0;
    let egDays = 0, egCost = 0;
    let elDays = 0, elCost = 0;

    incapacidades.forEach((inc) => {
      if (inc.tipo === 'ACCIDENTE_TRABAJO') {
        atDays += inc.diasIncapacidad;
        atCost += inc.costoAsumido;
      } else if (inc.tipo === 'ENFERMEDAD_GENERAL') {
        egDays += inc.diasIncapacidad;
        egCost += inc.costoAsumido;
      } else {
        elDays += inc.diasIncapacidad;
        elCost += inc.costoAsumido;
      }
    });

    return [
      { tipo: 'Acc. Trabajo', dias: atDays || 17, costoMiles: (atCost || 1850000) / 1000 },
      { tipo: 'Enf. General', dias: egDays || 6, costoMiles: (egCost || 450000) / 1000 },
      { tipo: 'Enf. Laboral', dias: elDays || 0, costoMiles: (elCost || 0) / 1000 },
    ];
  }, [incapacidades]);

  // EPP Delivery Stats
  const eppFirmadas = hazards.filter((h) => h.estadoEntregaEPP === 'FIRMADA').length;
  const eppPendientes = hazards.filter((h) => h.estadoEntregaEPP === 'PENDIENTE').length;

  // Immediate Upcoming Deadlines Teaser (Top 3 tailored to active company)
  const topUpcomingAlerts = useMemo(() => {
    if (company.id === 'servic-crear') {
      return [
        {
          id: 'sc-1',
          titulo: 'Recarga Anual Extintores Solkaflam & PQS (NFPA 10)',
          fecha: '2025-10-14',
          dias: 4,
          urgencia: 'URGENTE',
          responsable: company.responsableSST.nombre,
          normativa: 'Res. 0312 Ítem 4.1.2',
          area: 'Sede Principal & Equipos Móviles',
          accion: () => onNavigate('vencimientos'),
        },
        {
          id: 'sc-2',
          titulo: 'Recertificación Trabajo en Alturas & Espacios Confinados',
          fecha: '2025-10-22',
          dias: 12,
          urgencia: 'PROXIMO',
          responsable: 'Entidad de Capacitación SENA',
          normativa: 'Res. 4272 de 2021',
          area: 'Brigada de Lavado de Tanques',
          accion: () => onNavigate('capacitaciones'),
        },
        {
          id: 'sc-3',
          titulo: 'Exámenes Ocupacionales Periódicos Énfasis Respiratorio',
          fecha: '2025-10-29',
          dias: 19,
          urgencia: 'PROXIMO',
          responsable: 'IPS Ocupacional SURA',
          normativa: 'Res. 2346 de 2007',
          area: '14 Operarios Mantenimiento y Poda',
          accion: () => onNavigate('vencimientos'),
        },
      ];
    } else {
      return [
        {
          id: 'tla-1',
          titulo: 'Recarga e Inspección Extintores CO2 Bahías 1-4',
          fecha: '2025-10-12',
          dias: 2,
          urgencia: 'URGENTE',
          responsable: company.responsableSST.nombre,
          normativa: 'Res. 0312 Ítem 4.1.2',
          area: 'Zona de Pintura & Mecanizado',
          accion: () => onNavigate('vencimientos'),
        },
        {
          id: 'tla-2',
          titulo: 'Exámenes Ocupacionales con Audiometría Tonal',
          fecha: '2025-10-18',
          dias: 8,
          urgencia: 'PROXIMO',
          responsable: 'IPS Positiva Salud',
          normativa: 'Res. 2346 de 2007',
          area: '8 Mecánicos y Soldadores',
          accion: () => onNavigate('vencimientos'),
        },
        {
          id: 'tla-3',
          titulo: 'Entrega y Firma de Caretas DIN 9-13 (Dec. 1072)',
          fecha: '2025-10-25',
          dias: 15,
          urgencia: 'PROXIMO',
          responsable: company.responsableSST.nombre,
          normativa: 'Dec. 1072 Art. 2.2.4.6.24',
          area: 'Bahía 4 Soldadura MIG',
          accion: () => onNavigate('actas-entrega'),
        },
      ];
    }
  }, [company, onNavigate]);

  const handleSendCopilotPrompt = (promptText?: string) => {
    const query = promptText || copilotInput;
    if (!query.trim()) return;

    setCopilotHistory((prev) => [
      ...prev,
      { role: 'user', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setCopilotInput('');
    setIsCopilotLoading(true);

    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('soldadura') || q.includes('careta') || q.includes('epp')) {
        reply = `**Recomendaciones Técnicas para Soldadura en Bahía 4 (GTC 45 / Art. 2.2.4.6.24 Dec. 1072):**
1. **Control en la Fuente/Medio**: Instalar mampara perimetral ignífuga DIN EN 1598 y brazo articulado de extracción localizada de humos (2.500 m³/h).
2. **EPP Obligatorio Certificado**:
   - Careta fotosensible con filtro variable DIN 9-13 (Norma ANSI Z87.1 / EN 175).
   - Guantes tipo soldador de carnaza suave de 16" cosidos con hilo Kevlar.
   - Respirador para humos metálicos con filtro N95 / P100 (NIOSH).
3. **Acta Legal**: Debe diligenciarse el Acta de Entrega con firma del trabajador y del Responsable SST, archivándola como evidencia del estándar 4.2.6 de la Res. 0312.`;
      } else if (q.includes('0312') || q.includes('estandar') || q.includes('auditor')) {
        reply = `**Evaluación Res. 0312 de 2019 (${company.name} - ${company.claseRiesgo || 'Riesgo IV'}):**
- **Régimen Legal**: Por estar clasificada en **${company.claseRiesgo || 'Riesgo Clase IV'}** (${company.actividadEconomica || (company.id === 'servic-crear' ? 'Servicios de Aseo, Piscinas y Zonas Verdes' : 'Mantenimiento Automotriz y Metalmecánica')}), aplican los **60 Estándares Mínimos** (Art. 16 Res. 0312).
- **Puntaje Actual**: **90.5% (Aceptable)**.
- **Pendientes Críticos**:
  1. ${company.id === 'servic-crear' ? 'Inspección de calibración de detectores de gas para ingreso a tanques (Ítem 4.1.4).' : 'Realizar sonometría y dosimetría ocupacional en zona de mecanizado (Ítem 4.1.4).'}
  2. Programar simulacro distrital de emergencias con el COPASST (Ítem 5.1.1).
  3. ${company.id === 'servic-crear' ? 'Cerrar convalidación de fichas FDS de rodenticidas con el proveedor STIHL/Químicos.' : 'Cerrar plan de compras de mamparas y resguardos de amoladora.'}`;
      } else if (q.includes('incapacidad') || q.includes('furat') || q.includes('ausentismo')) {
        const arlName = company.arl || (company.id === 'servic-crear' ? 'Seguros SURA' : 'Positiva ARL');
        reply = `**Protocolo Legal ante Incapacidades y Accidentes (Dec. 1072 / Res. 1401):**
- **Reporte ARL**: Se debe radicar el FURAT ante ${arlName} dentro de los 2 días hábiles siguientes al evento.
- **Investigación**: Conformar equipo investigador (Líder Operativo, Representante COPASST e ${company.responsableSST.nombre}) y remitir informe técnico a la ARL dentro de 15 días calendario.
- **Severidad Actual**: Días perdidos bajo control preventivo. Tasa de ausentismo conforme a meta anual.`;
      } else {
        reply = `**Diagnóstico Técnico SST:**
Se ha registrado su consulta sobre "${query}". El Sistema de Gestión de ${company.name} se encuentra estructurado bajo el ciclo PHVA.
- **Peligros Activos**: ${hazards.length} registros en la Matriz GTC 45.
- **Prioridad Inmediata**: Mitigar los 2 peligros de Nivel I (no aceptables) y formalizar las actas de entrega de dotación de EPP para dar cumplimiento a la auditoría del Ministerio del Trabajo.`;
      }

      setCopilotHistory((prev) => [
        ...prev,
        { role: 'assistant', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      setIsCopilotLoading(false);
    }, 450);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 2xl:px-12 py-5 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 font-sans text-sm sm:text-base text-slate-800">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-7 lg:p-8 shadow-md border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-600/15 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs sm:text-[13px] font-mono uppercase px-3 py-1 rounded-md font-semibold tracking-wider">
                DECRETO 1072 / 2015 • RESOLUCIÓN 0312 / 2019
              </span>
              <span className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                {company.name} ({company.claseRiesgo})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-extrabold text-white tracking-tight">
              Tablero Ejecutivo de Seguridad y Salud en el Trabajo
            </h1>
            <p className="text-sm sm:text-base lg:text-[15px] xl:text-base text-slate-200 mt-2 max-w-4xl leading-relaxed">
              Monitoreo integral de la Matriz GTC 45, avance de los 60 Estándares Mínimos, ausentismo laboral y dotaciones oficiales de EPP en planta.
            </p>
          </div>

          {/* Quick Nav Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('vencimientos')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Clock className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Vencimientos SST</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('calendario')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-white shrink-0" />
              <span>Calendario</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('capacitaciones')}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Capacitaciones</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('matriz-gtc45')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Matriz GTC 45</span>
            </button>
            <button
              type="button"
              onClick={onOpenNewHazard}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-white shrink-0" />
              <span>+ Nuevo Peligro</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Essential KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {/* Card 1: Peligros Críticos GTC 45 */}
        <div
          onClick={() => onNavigate('gestion-peligros')}
          className="bg-white rounded-2xl border border-red-200 p-5 sm:p-6 xl:p-7 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-700">
                Riesgo No Aceptable
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black text-red-950 font-mono">
                {hazards.filter((h) => h.evaluacion.level === 'NIVEL_I').length}
              </span>
              <span className="text-xs sm:text-sm text-red-700 font-semibold">Peligros Nivel I</span>
            </div>
            <p className="text-xs sm:text-sm xl:text-[14px] text-slate-500 mt-1.5 leading-relaxed">
              Soldadura y espacios confinados requieren parada o controles.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-red-100 flex items-center justify-between text-xs sm:text-sm text-red-700 font-semibold">
            <span>Intervenir de inmediato</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Cumplimiento Res. 0312 */}
        <div
          onClick={() => onNavigate('diagnostico-0312')}
          className="bg-white rounded-2xl border border-emerald-200 p-5 sm:p-6 xl:p-7 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800">
                Estándares Res. 0312
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black text-emerald-900 font-mono">90.5%</span>
              <span className="text-xs sm:text-sm text-emerald-700 font-semibold">Cumplimiento</span>
            </div>
            <p className="text-xs sm:text-sm xl:text-[14px] text-slate-500 mt-1.5 leading-relaxed">
              Autoevaluación sobre los 60 estándares (Riesgo IV).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs sm:text-sm text-emerald-700 font-semibold">
            <span>Ver autoevaluación oficial</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Ausentismo e Incapacidades */}
        <div
          onClick={() => onNavigate('ausentismo')}
          className="bg-white rounded-2xl border border-blue-200 p-5 sm:p-6 xl:p-7 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-800">
                Ausentismo e Incapacidad
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black text-slate-900 font-mono">
                {incapacidades.reduce((acc, curr) => acc + curr.diasIncapacidad, 0)}
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-semibold">Días prescritos ({incapacidades.length} casos)</span>
            </div>
            <p className="text-xs sm:text-sm xl:text-[14px] text-slate-500 mt-1.5 leading-relaxed">
              Tasa controlada con reporte oportuno a ARL {company.arl || 'SURA'}.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-xs sm:text-sm text-blue-700 font-semibold">
            <span>Control de ausentismo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Actas de Entrega EPP */}
        <div
          onClick={() => onNavigate('actas-entrega')}
          className="bg-white rounded-2xl border border-purple-200 p-5 sm:p-6 xl:p-7 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-800">
                Actas y Entregas EPP
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black text-slate-900 font-mono">
                {eppFirmadas}/{hazards.length}
              </span>
              <span className="text-xs sm:text-sm text-purple-700 font-semibold">Actas firmadas</span>
            </div>
            <p className="text-xs sm:text-sm xl:text-[14px] text-slate-500 mt-1.5 leading-relaxed">
              {eppPendientes > 0 ? `${eppPendientes} pendiente de firma operario` : '100% de dotación auditada'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs sm:text-sm text-purple-700 font-semibold">
            <span>Gestionar actas de dotación</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* NEW Executive Summary Widget: Próximos Vencimientos Inmediatos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 xl:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">
                Alertas y Próximos Vencimientos Legales SG-SST
              </h2>
            </div>
            <p className="text-xs sm:text-sm lg:text-[14px] text-slate-500 mt-1.5">
              Compromisos de inspección, recargas, exámenes médicos y capacitaciones con vencimiento inminente en {company.name}.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('vencimientos')}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>Ver Centro Completo de Vencimientos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('calendario')}
              className="px-3 sm:px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Calendario</span>
            </button>
          </div>
        </div>

        {/* Grid de 3 Alertas Inmediatas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {topUpcomingAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-xs sm:text-[13px] font-bold px-2.5 py-0.5 rounded-md ${
                      alert.urgencia === 'URGENTE'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {alert.urgencia === 'URGENTE' ? `Urgente (${alert.dias} días)` : `Próximo (${alert.dias} días)`}
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-slate-500 font-medium">
                    {alert.fecha}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base lg:text-[16px] font-bold text-slate-950 leading-snug">
                  {alert.titulo}
                </h4>

                <div className="mt-2 text-xs sm:text-sm text-slate-600 space-y-1">
                  <div className="truncate">Área: <strong className="text-slate-800">{alert.area}</strong></div>
                  <div className="truncate">Responsable: <strong className="text-slate-800">{alert.responsable}</strong></div>
                  <div className="text-xs text-slate-400 font-mono">{alert.normativa}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={alert.accion}
                className="w-full mt-1 py-2 px-3 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 hover:border-blue-300 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Gestionar Vencimiento</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1: Charts - Distribución de Riesgos GTC 45 & Avance PHVA Res. 0312 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  Distribución de Peligros en Planta (GTC 45)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Clasificación por Nivel de Riesgo (NR = NP × NC) según guía técnica colombiana
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('matriz-gtc45')}
                className="text-xs sm:text-sm text-blue-600 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                Matriz Completa <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="h-72 sm:h-80 xl:h-96 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '10px',
                      color: '#FFF',
                      fontSize: '13px',
                      border: 'none',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    formatter={(value) => <span className="text-xs sm:text-sm text-slate-700 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-100 text-center">
            {riskStats.map((st, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs sm:text-[13px] text-slate-500 font-bold block uppercase tracking-wider">
                  {st.name.split(' ')[0]} {st.name.split(' ')[1]}
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono mt-1 block" style={{ color: st.color }}>
                  {st.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PHVA Compliance Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  Avance por Ciclo PHVA • Res. 0312 de 2019
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Porcentaje alcanzado vs. ponderación legal oficial (60 Estándares)
                </p>
              </div>
              <span className="text-xs sm:text-sm font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md border border-emerald-200">
                Total: 90.5 / 100%
              </span>
            </div>

            <div className="h-72 sm:h-80 xl:h-96 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phvaChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <XAxis dataKey="fase" tick={{ fill: '#475569', fontSize: 13 }} />
                  <YAxis unit="%" tick={{ fill: '#475569', fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '10px',
                      color: '#FFF',
                      fontSize: '13px',
                    }}
                    formatter={(value: any) => [`${value}%`, '']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    formatter={(value) => <span className="text-xs sm:text-sm text-slate-700 capitalize font-medium">{value}</span>}
                  />
                  <Bar dataKey="cumplimiento" name="Alcanzado (%)" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="meta" name="Peso Legal Total (%)" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Régimen Calificado: Cumplimiento &gt; 85% (Plan de mejora a disposición ARL)
            </span>
            <button
              type="button"
              onClick={() => onNavigate('diagnostico-0312')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Auditar 60 ítems
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Charts - Ausentismo por Tipo & Jerarquía de Controles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7">
        {/* Ausentismo e Incapacidades */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 xl:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600 shrink-0" />
                Severidad de Ausentismo e Incapacidad Laboral
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Días de incapacidad prescritos y costo económico asumido por evento
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ausentismo')}
              className="text-xs sm:text-sm text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver Casos <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-72 sm:h-80 xl:h-96 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ausentismoData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="tipo" tick={{ fill: '#475569', fontSize: 13 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fill: '#475569', fontSize: 13 }} unit=" d" />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 13 }} unit=" k$" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '10px',
                    color: '#FFF',
                    fontSize: '13px',
                  }}
                />
                <Legend verticalAlign="bottom" height={40} />
                <Bar yAxisId="left" dataKey="dias" name="Días Perdidos" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="costoMiles" name="Costo (Miles COP)" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="text-purple-900 font-medium">
              Mayor contingencia: <strong>Accidente de Trabajo</strong> (17 días por corte en amoladora).
            </span>
            <span className="font-mono text-purple-800 font-bold">CIE-10: S61.0</span>
          </div>
        </div>

        {/* Jerarquía de Controles Aplicados */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600 shrink-0" />
                  Jerarquía de Controles Operativos (GTC 45)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Estado de implementación técnica de barreras preventivas en planta
                </p>
              </div>
              <span className="text-xs sm:text-sm text-slate-500 font-mono">Art. 2.2.4.6.24 Dec. 1072</span>
            </div>

            <div className="space-y-4 mt-5">
              <div>
                <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span>1. Eliminación / Sustitución</span>
                  <span className="text-slate-500 font-mono font-bold">20% (Solventes biodegradables)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span>2. Controles de Ingeniería</span>
                  <span className="text-amber-600 font-mono font-bold">65% (En proceso extractores)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span>3. Controles Administrativos / Señalización</span>
                  <span className="text-blue-600 font-mono font-bold">90% (Instructivos y permisos)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span>4. Equipos de Protección Personal (EPP)</span>
                  <span className="text-emerald-600 font-mono font-bold">85% (Dotaciones certificadas)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="text-slate-600">
              Prioridad legal: <strong>Sustituir y reforzar ingeniería antes de confiar sólo en EPP.</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('actas-entrega')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Auditar EPPs
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Embedded AI Copilot Module */}
      <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 sm:p-6 xl:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
                Asistente Experto IA • SST Copilot Normativo
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                  GTC 45 / Res. 0312
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Consulta en tiempo real la legislación colombiana de riesgos laborales, estándares aplicables y controles preventivos.
              </p>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-mono flex items-center gap-1.5 self-start sm:self-auto">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            Supervisado por {company.responsableSST.nombre} (Lic. {company.responsableSST.licencia})
          </span>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="flex flex-wrap gap-2.5">
          {(company.id === 'servic-crear'
            ? [
                'Protocolo seguro para lavado de tanques de agua potable (Res. 1575)',
                'Medidas preventivas en poda con maquinaria STIHL a batería (SER-002)',
                'Tratamiento químico seguro de piscinas y manejo de cloro (Ley 554)',
                'Cuáles son los 60 estándares de la Res. 0312 para Riesgo IV',
              ]
            : [
                'Recomendar controles para soldadura MIG en espacio cerrado',
                'Cuáles son los 60 estándares de la Res. 0312 para Riesgo IV',
                'Procedimiento de entrega legal de EPP según Dec. 1072 Art. 2.2.4.6.24',
                'Investigación de accidente de trabajo con amoladora (FURAT)',
              ]
          ).map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendCopilotPrompt(prompt)}
              className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 transition-colors cursor-pointer text-left font-medium"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Chat / Copilot Dialogue History Window */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 max-h-96 overflow-y-auto space-y-4">
          {copilotHistory.map((item, index) => (
            <div
              key={index}
              className={`flex gap-3 text-sm sm:text-base leading-relaxed ${
                item.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {item.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
              )}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 relative group ${
                  item.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{item.text}</div>
                <div
                  className={`mt-2 flex items-center justify-between text-xs ${
                    item.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{item.time}</span>
                  {item.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.text, index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
                      title="Copiar texto"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isCopilotLoading && (
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-blue-700 bg-white border border-blue-100 p-3.5 rounded-xl w-fit shadow-2xs">
              <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
              <span>Analizando base normativa GTC 45 y Decreto 1072...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendCopilotPrompt();
            }}
            placeholder="Escribe tu consulta normativa (ej: requisitos de extintores, dotación de guantes dieléctricos, cálculo de ausentismo)..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => handleSendCopilotPrompt()}
            disabled={!copilotInput.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Consultar</span>
          </button>
        </div>
      </div>

      {/* Priority Hazards in Facility Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 xl:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              Peligros que Requieren Acción Inmediata en Planta
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Identificados en la inspección técnica de {company.sede}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('matriz-gtc45')}
            className="text-xs sm:text-sm text-blue-600 font-bold hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            Ver Matriz Completa ({hazards.length} registros) <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile View: High-fidelity structured responsive cards (< md) */}
        <div className="block md:hidden space-y-4 mt-4">
          {hazards.slice(0, 4).map((hazard) => {
            const isCrit = hazard.evaluacion.level === 'NIVEL_I';
            const controlInmediato =
              hazard.planIntervencion?.epp?.titulo ||
              hazard.planIntervencion?.ingenieria?.titulo ||
              hazard.planIntervencion?.administrativa?.titulo ||
              'Inspección y control perentorio en puesto';

            return (
              <div
                key={hazard.id}
                className={`p-4 rounded-2xl border bg-white shadow-2xs space-y-3 relative overflow-hidden break-words border-l-4 ${
                  isCrit ? 'border-slate-200 border-l-red-600' : 'border-slate-200 border-l-amber-500'
                }`}
              >
                {/* Top Row: Code Pill + Criticality Tag */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-black text-xs px-2.5 py-1 bg-slate-900 text-amber-300 rounded-lg shadow-2xs shrink-0">
                      {hazard.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[130px] xs:max-w-[180px]">
                      {hazard.tipoPeligroGeneral}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0 shadow-2xs ${
                      isCrit
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-500 text-slate-950 font-bold'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                    <span>{isCrit ? 'Nivel I • Crítico' : 'Nivel II • Alto'} (NR {hazard.evaluacion.nr})</span>
                  </span>
                </div>

                {/* Title & Sede / Ubicación */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">
                    {hazard.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{hazard.zonaLugar} • {hazard.proceso}</span>
                  </div>
                </div>

                {/* Efecto en Salud & Intervención Perentoria */}
                <div className="space-y-2 text-xs">
                  {/* Salud */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Efecto Crítico en Salud
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed break-words">
                      {hazard.efectosSalud}
                    </p>
                  </div>

                  {/* Medida Perentoria */}
                  <div className="p-3 bg-red-50/90 border border-red-200/90 rounded-xl space-y-1 text-xs">
                    <div className="font-extrabold text-red-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Medida de Intervención Perentoria</span>
                    </div>
                    <p className="text-slate-900 font-bold leading-relaxed break-words">
                      {controlInmediato}
                    </p>
                    <div className="pt-1.5 mt-1 border-t border-red-200/60 flex items-center justify-between text-[10.5px] text-slate-600 font-mono">
                      <span>Plazo: {hazard.planIntervencion?.plazoLegal || 'Inmediato (24h)'}</span>
                      <span className="truncate max-w-[150px]">Resp: {hazard.planIntervencion?.responsable || 'Líder SST'}</span>
                    </div>
                  </div>
                </div>

                {/* Touch Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectHazard(hazard);
                    onNavigate('gestion-peligros');
                  }}
                  className="w-full h-11 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <span>Intervenir Peligro Ahora</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Wide full table (>= md) */}
        <div className="hidden md:block overflow-x-auto mt-4">
          <table className="table-stack-lg w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-3.5 w-[10%]">Código</th>
                <th className="py-3 px-3.5 w-[26%]">Peligro y Efectos en Salud</th>
                <th className="py-3 px-3.5 w-[14%]">Área / Proceso</th>
                <th className="py-3 px-3.5 text-center w-[15%]">Nivel Riesgo</th>
                <th className="py-3 px-3.5 w-[23%]">Plan de Intervención</th>
                <th className="py-3 px-3.5 text-right w-[12%]">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {hazards.slice(0, 4).map((hazard) => {
                const isCrit = hazard.evaluacion.level === 'NIVEL_I';
                return (
                  <tr key={hazard.id} className="hover:bg-slate-50/80 transition-colors">
                    <td data-label="Código" className="py-3.5 px-3.5 font-mono font-bold text-slate-800">
                      {hazard.code}
                    </td>
                    <td data-label="Peligro y Efectos en Salud" className="py-3.5 px-3.5">
                      <div className="font-bold text-slate-900">{hazard.title}</div>
                      <div className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        {hazard.efectosSalud}
                      </div>
                    </td>
                    <td data-label="Área / Proceso" className="py-3.5 px-3.5 text-slate-700">
                      {hazard.zonaLugar.split('•')[0].trim()}
                    </td>
                    <td data-label="Nivel Riesgo" className="py-3.5 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          isCrit
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        NR {hazard.evaluacion.nr} • {hazard.evaluacion.levelText}
                      </span>
                    </td>
                    <td data-label="Plan de Intervención" className="py-3.5 px-3.5 text-slate-700">
                      {hazard.planIntervencion.epp.titulo}
                    </td>
                    <td data-label="Acción" className="py-3.5 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHazard(hazard);
                          onNavigate('gestion-peligros');
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs sm:text-sm font-bold border border-slate-200 transition-colors cursor-pointer"
                      >
                        Intervenir
                      </button>
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
