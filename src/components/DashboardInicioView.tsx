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
import { ProximosVencimientosSection } from './ProximosVencimientosSection';
import { CalendarioVencimientos } from './CalendarioVencimientos';

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
  const [vistaAgenda, setVistaAgenda] = useState<'CALENDARIO' | 'LISTA'>('CALENDARIO');
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotHistory, setCopilotHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Hola, soy tu Asistente Copilot SST. He analizado la planta de **${company.name}** (Riesgo IV). Tienes **2 peligros en Nivel I Crítico** (Soldadura Bahía 4 y Tablero 220V) que requieren intervención de ingeniería inmediata según GTC 45 y Art. 2.2.4.6.24 de Dec. 1072. ¿Deseas generar el plan de contingencia o auditar las actas de EPP?`,
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
        reply = `**Evaluación Res. 0312 de 2019 (${company.name} - Riesgo IV):**
- **Régimen Legal**: Por estar clasificada en **Riesgo Clase IV** (Mantenimiento automotriz / soldadura), aplican los **60 Estándares Mínimos** (Art. 16 Res. 0312).
- **Puntaje Actual**: **90.5% (Aceptable)**.
- **Pendientes Críticos**:
  1. Realizar sonometría y dosimetría ocupacional en zona de mecanizado (Ítem 4.1.4).
  2. Programar simulacro distrital de emergencias con el COPASST (Ítem 5.1.1).
  3. Cerrar plan de compras de mamparas y resguardos de amoladora.`;
      } else if (q.includes('incapacidad') || q.includes('furat') || q.includes('ausentismo')) {
        reply = `**Protocolo Legal ante Incapacidades y Accidentes (Dec. 1072 / Res. 1401):**
- **Reporte ARL**: Se debe radicar el FURAT ante ARL Sura dentro de los 2 días hábiles siguientes al evento.
- **Investigación**: Conformar equipo investigador (Jefe de Taller, Representante COPASST e Ing. Carlos Méndez) y remitir informe técnico a la ARL dentro de 15 días calendario.
- **Severidad Actual**: 23 días perdidos acumulados en el año. Indicador de severidad en 4.2 días/trabajador.`;
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
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-[13px] text-slate-800">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold tracking-wider">
                DECRETO 1072 / 2015 • RESOLUCIÓN 0312 / 2019
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistema Operativo en Línea
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Tablero Ejecutivo de Seguridad y Salud en el Trabajo
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Monitoreo integral de la Matriz de Riesgos GTC 45, avance de los 60 Estándares Mínimos, ausentismo laboral y dotaciones oficiales de EPP en planta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setVistaAgenda('CALENDARIO');
                const el = document.getElementById('seccion-cronograma-sst') || document.getElementById('seccion-calendario-sst');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-[12.5px] shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-white" />
              <span>Calendario SST</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVistaAgenda('LISTA');
                const el = document.getElementById('seccion-cronograma-sst') || document.getElementById('seccion-proximos-vencimientos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-[12.5px] shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Clock className="w-4 h-4 text-slate-950" />
              <span>Próximos Vencimientos</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('capacitaciones')}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[12.5px] font-medium shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Capacitaciones SST</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('matriz-gtc45')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[12.5px] font-medium shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Matriz GTC 45</span>
            </button>
            <button
              type="button"
              onClick={onOpenNewHazard}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-[12.5px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>+ Nuevo Peligro</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Essential KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Peligros Críticos GTC 45 */}
        <div
          onClick={() => onNavigate('gestion-peligros')}
          className="bg-white rounded-xl border border-red-200 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-700">
              Riesgo No Aceptable
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-950 font-mono">
              {hazards.filter((h) => h.evaluacion.level === 'NIVEL_I').length}
            </span>
            <span className="text-xs text-red-700 font-medium">Peligros Nivel I</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
            Soldadura y arco eléctrico requieren parada o intervención.
          </p>
          <div className="mt-3 pt-2.5 border-t border-red-100 flex items-center justify-between text-[11px] text-red-700 font-medium">
            <span>Intervenir de inmediato</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Cumplimiento Res. 0312 */}
        <div
          onClick={() => onNavigate('diagnostico-0312')}
          className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
              Estándares Res. 0312
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-900 font-mono">90.5%</span>
            <span className="text-xs text-emerald-700 font-medium">Cumplimiento</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Valoración sobre los 60 estándares (Riesgo IV).
          </p>
          <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
            <span>Ver autoevaluación oficial</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Ausentismo e Incapacidades */}
        <div
          onClick={() => onNavigate('ausentismo')}
          className="bg-white rounded-xl border border-blue-200 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">
              Ausentismo e Incapacidad
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {incapacidades.reduce((acc, curr) => acc + curr.diasIncapacidad, 0)}
            </span>
            <span className="text-xs text-slate-600 font-medium">Días perdidos (3 casos)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            $2.300.000 COP costo estimado en taller.
          </p>
          <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-center justify-between text-[11px] text-blue-700 font-medium">
            <span>Control de ausentismo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Actas de Entrega EPP */}
        <div
          onClick={() => onNavigate('actas-entrega')}
          className="bg-white rounded-xl border border-purple-200 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-800">
              Actas y Entregas EPP
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {eppFirmadas}/{hazards.length}
            </span>
            <span className="text-xs text-purple-700 font-medium">Actas firmadas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {eppPendientes > 0 ? `${eppPendientes} pendiente de firma operario` : '100% de dotación firmada'}
          </p>
          <div className="mt-3 pt-2.5 border-t border-purple-100 flex items-center justify-between text-[11px] text-purple-700 font-medium">
            <span>Gestionar actas de dotación</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Sección Dedicada de Calendario y Próximos Vencimientos SST con Switcher */}
      <div id="seccion-cronograma-sst" className="space-y-3 font-sans">
        <div className="bg-slate-100/90 p-1.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              Cronograma & Vencimientos SG-SST:
            </span>
            <span className="hidden sm:inline text-xs text-slate-500">
              Fechas clave de capacitaciones, inspecciones, incapacidades y compromisos legales
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setVistaAgenda('CALENDARIO')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                vistaAgenda === 'CALENDARIO'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Vista Calendario Mensual</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaAgenda('LISTA')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                vistaAgenda === 'LISTA'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Lista de Vencimientos</span>
            </button>
          </div>
        </div>

        {vistaAgenda === 'CALENDARIO' ? (
          <CalendarioVencimientos
            hazards={hazards}
            incapacidades={incapacidades}
            company={company}
            capacitaciones={capacitaciones}
            onNavigate={onNavigate}
            onSelectHazard={onSelectHazard}
          />
        ) : (
          <ProximosVencimientosSection
            hazards={hazards}
            incapacidades={incapacidades}
            company={company}
            capacitaciones={capacitaciones}
            onNavigate={onNavigate}
            onSelectHazard={onSelectHazard}
          />
        )}
      </div>

      {/* Row 1: Charts - Distribución de Riesgos GTC 45 & Avance PHVA Res. 0312 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Distribución de Peligros en Planta (GTC 45)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clasificación por Nivel de Riesgo (NR = NP × NC) según guía técnica colombiana
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('matriz-gtc45')}
                className="text-[11.5px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                Matriz Completa <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
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
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-[12px] text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
            {riskStats.map((st, i) => (
              <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                  {st.name.split(' ')[0]} {st.name.split(' ')[1]}
                </span>
                <span className="text-base font-bold font-mono" style={{ color: st.color }}>
                  {st.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PHVA Compliance Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Avance por Ciclo PHVA • Res. 0312 de 2019
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Porcentaje alcanzado vs. ponderación legal oficial (60 Estándares)
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                Total: 90.5 / 100%
              </span>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phvaChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <XAxis dataKey="fase" tick={{ fill: '#475569', fontSize: 12 }} />
                  <YAxis unit="%" tick={{ fill: '#475569', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value}%`, '']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-[12px] text-slate-700 capitalize">{value}</span>}
                  />
                  <Bar dataKey="cumplimiento" name="Alcanzado (%)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="meta" name="Peso Legal Total (%)" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Régimen Calificado: Cumplimiento &gt; 85% (Plan de mejora a disposición ARL)
            </span>
            <button
              type="button"
              onClick={() => onNavigate('diagnostico-0312')}
              className="text-blue-600 font-medium hover:underline cursor-pointer"
            >
              Auditar 60 ítems
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Charts - Ausentismo por Tipo & Jerarquía de Controles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ausentismo e Incapacidades */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Severidad de Ausentismo e Incapacidad Laboral
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Días de incapacidad prescritos y costo económico asumido por evento
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ausentismo')}
              className="text-[11.5px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver Casos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ausentismoData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="tipo" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fill: '#475569', fontSize: 12 }} unit=" d" />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 12 }} unit=" k$" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar yAxisId="left" dataKey="dias" name="Días Perdidos" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="costoMiles" name="Costo (Miles COP)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 p-3 bg-purple-50/60 border border-purple-100 rounded-lg flex items-center justify-between text-xs">
            <span className="text-purple-900 font-medium">
              Mayor contingencia: <strong>Accidente de Trabajo</strong> (17 días por corte en amoladora).
            </span>
            <span className="font-mono text-purple-800 font-semibold">CIE-10: S61.0</span>
          </div>
        </div>

        {/* Jerarquía de Controles Aplicados */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Jerarquía de Controles Operativos (GTC 45)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estado de implementación técnica de barreras preventivas en planta
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Art. 2.2.4.6.24 Dec. 1072</span>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>1. Eliminación / Sustitución</span>
                  <span className="text-slate-500 font-mono">20% (Solventes biodegradables)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>2. Controles de Ingeniería</span>
                  <span className="text-amber-600 font-mono">65% (En proceso extractores)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>3. Controles Administrativos / Señalización</span>
                  <span className="text-blue-600 font-mono">90% (Instructivos y permisos)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>4. Equipos de Protección Personal (EPP)</span>
                  <span className="text-emerald-600 font-mono">85% (Dotaciones certificadas)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Prioridad legal: <strong>Sustituir y reforzar ingeniería antes de confiar sólo en EPP.</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('actas-entrega')}
              className="text-blue-600 font-medium hover:underline cursor-pointer"
            >
              Auditar EPPs
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Embedded AI Copilot Module (Directly in Dashboard as requested) */}
      <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                Asistente Experto IA • SST Copilot Normativo
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  GTC 45 / Res. 0312
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Consulta en tiempo real la legislación colombiana de riesgos laborales, estándares aplicables y controles preventivos.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 self-start sm:self-auto">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            Supervisado por Ing. Carlos Méndez (Lic. 18492-2018)
          </span>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            'Recomendar controles para soldadura MIG en espacio cerrado',
            'Cuáles son los 60 estándares de la Res. 0312 para Riesgo IV',
            'Procedimiento de entrega legal de EPP según Dec. 1072 Art. 2.2.4.6.24',
            'Investigación de accidente de trabajo con amoladora (FURAT)',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendCopilotPrompt(prompt)}
              className="text-[11.5px] px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 transition-colors cursor-pointer text-left"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Chat / Copilot Dialogue History Window */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-4 max-h-72 overflow-y-auto space-y-3.5">
          {copilotHistory.map((item, index) => (
            <div
              key={index}
              className={`flex gap-3 text-xs leading-relaxed ${
                item.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {item.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
              )}
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-xl p-3 relative group ${
                  item.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{item.text}</div>
                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    item.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{item.time}</span>
                  {item.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.text, index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      title="Copiar texto"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
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
            <div className="flex items-center gap-2 text-xs text-blue-700 bg-white border border-blue-100 p-3 rounded-lg w-fit shadow-2xs">
              <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
              <span>Analizando base normativa GTC 45 y Decreto 1072...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendCopilotPrompt();
            }}
            placeholder="Escribe tu consulta normativa (ej: requisitos de extintores, dotación de guantes dieléctricos, cálculo de ausentismo)..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => handleSendCopilotPrompt()}
            disabled={!copilotInput.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Consultar</span>
          </button>
        </div>
      </div>

      {/* Quick Action Matrix Table of Priority Hazards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Peligros que Requieren Acción Inmediata en Planta
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identificados en la última inspección de {company.sede}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('matriz-gtc45')}
            className="text-[12px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Ver Matriz Completa ({hazards.length} registros) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="table-stack-lg w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-2.5 px-2.5 w-[10%]">Código</th>
                <th className="py-2.5 px-2.5 w-[26%]">Peligro y Efectos en Salud</th>
                <th className="py-2.5 px-2.5 w-[13%]">Área / Proceso</th>
                <th className="py-2.5 px-2.5 text-center w-[14%]">Nivel Riesgo</th>
                <th className="py-2.5 px-2.5 w-[25%]">Plan de Intervención</th>
                <th className="py-2.5 px-2.5 text-right w-[12%]">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {hazards.slice(0, 4).map((hazard) => {
                const isCrit = hazard.evaluacion.level === 'NIVEL_I';
                return (
                  <tr key={hazard.id} className="hover:bg-slate-50/80 transition-colors">
                    <td data-label="Código" className="py-3 px-2.5 font-mono font-medium text-slate-700">
                      {hazard.code}
                    </td>
                    <td data-label="Peligro y Efectos en Salud" className="py-3 px-2.5">
                      <div className="font-semibold text-slate-900">{hazard.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {hazard.efectosSalud}
                      </div>
                    </td>
                    <td data-label="Área / Proceso" className="py-3 px-2.5 text-slate-600">
                      {hazard.zonaLugar.split('•')[0].trim()}
                    </td>
                    <td data-label="Nivel Riesgo" className="py-3 px-2.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          isCrit
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        NR {hazard.evaluacion.nr} • {hazard.evaluacion.levelText}
                      </span>
                    </td>
                    <td data-label="Plan de Intervención" className="py-3 px-2.5 text-slate-700">
                      {hazard.planIntervencion.epp.titulo}
                    </td>
                    <td data-label="Acción" className="py-3 px-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHazard(hazard);
                          onNavigate('gestion-peligros');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
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
