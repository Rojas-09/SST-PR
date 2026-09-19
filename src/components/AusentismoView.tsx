import { useState, FormEvent } from 'react';
import {
  Calendar,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  Download,
  Filter,
  Plus,
  FileCheck,
  User,
  ShieldAlert,
  Building2,
  X,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import { CompanyInfo, IncapacidadRecord } from '../types';
import { workshopEmployees, commonCIE10Codes } from '../data/initialData';

interface AusentismoViewProps {
  company: CompanyInfo;
  incapacidades: IncapacidadRecord[];
  onAddIncapacidad: (nueva: IncapacidadRecord) => void;
}

export function AusentismoView({ company, incapacidades, onAddIncapacidad }: AusentismoViewProps) {
  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState<string>(workshopEmployees[0].id);
  const [tipo, setTipo] = useState<'ACCIDENTE_TRABAJO' | 'ENFERMEDAD_GENERAL' | 'ENFERMEDAD_LABORAL'>('ACCIDENTE_TRABAJO');
  const [codigoCIE10, setCodigoCIE10] = useState<string>('M54.5');
  const [diagnostico, setDiagnostico] = useState<string>('Lumbago no especificado por sobreesfuerzo en foso mecánico');
  const [fechaInicio, setFechaInicio] = useState<string>('2025-02-15');
  const [fechaFin, setFechaFin] = useState<string>('2025-02-18');
  const [soporteFile, setSoporteFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedDocModal, setSelectedDocModal] = useState<IncapacidadRecord | null>(null);

  // Auto calculate days
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const diasCalculados = calculateDays(fechaInicio, fechaFin);

  const handleSelectCIE10 = (code: string) => {
    setCodigoCIE10(code);
    const found = commonCIE10Codes.find((c) => c.code === code);
    if (found) {
      setDiagnostico(found.desc);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const emp = workshopEmployees.find((e) => e.id === selectedEmpId) || workshopEmployees[0];
    const newId = `INC-2025-00${incapacidades.length + 1}`;
    
    const nuevaIncapacidad: IncapacidadRecord = {
      id: newId,
      codigo: newId,
      empleado: emp.nombre,
      cedula: emp.cedula,
      cargo: emp.cargo,
      tipo,
      codigoCIE10,
      diagnostico,
      fechaInicio,
      fechaFin,
      diasIncapacidad: diasCalculados,
      entidadExpide: tipo === 'ACCIDENTE_TRABAJO' ? emp.arl : emp.eps,
      soporteNombre: soporteFile || `Soporte_Medico_${emp.nombre.replace(/\s+/g, '_')}_${newId}.pdf`,
      estado: 'RADICADO',
      costoAsumido: diasCalculados * 48500,
      fechaRegistro: new Date().toISOString().split('T')[0],
    };

    onAddIncapacidad(nuevaIncapacidad);
    setSuccessToast(`Incapacidad ${newId} radicada exitosamente en el sistema.`);
    setTimeout(() => setSuccessToast(null), 3500);
    setSoporteFile(null);
  };

  // KPIs
  const totalDias = incapacidades.reduce((acc, curr) => acc + curr.diasIncapacidad, 0);
  const totalAccidentes = incapacidades.filter((i) => i.tipo === 'ACCIDENTE_TRABAJO').length;
  const totalEnfermedades = incapacidades.filter((i) => i.tipo === 'ENFERMEDAD_GENERAL').length;
  const totalCosto = incapacidades.reduce((acc, curr) => acc + curr.costoAsumido, 0);
  const horasHombreMes = 8 * 240;
  const indiceSeveridad = ((totalDias * 240000) / horasHombreMes).toFixed(1);

  const filteredIncapacidades = incapacidades.filter((inc) => {
    if (filterTipo === 'TODOS') return true;
    return inc.tipo === filterTipo;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-5 bg-white min-h-screen text-[13px] text-slate-800 font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 text-[13px] shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header matching Clay styling */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono-data text-slate-400 uppercase tracking-wide">
            <span>SG-SST COLOMBIA</span>
            <span>•</span>
            <span>DECRETO 1072 ART. 2.2.4.6.21 / RES. 0312</span>
          </div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
            Control de Ausentismo e Incapacidades Laborales
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Registro oficial de eventos de salud, diagnóstico CIE-10, cálculo de días perdidos e indicadores de severidad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-mono-data text-slate-700">
            {company.name} • Riesgo IV
          </span>
        </div>
      </div>

      {/* 4 Clay-style KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Días Perdidos Totales</span>
          <div className="text-[22px] font-bold text-slate-900 font-mono-data">{totalDias}</div>
          <span className="text-[11px] text-slate-400">Jornadas laborales no laboradas</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Casos Radicados</span>
          <div className="text-[22px] font-bold text-blue-600 font-mono-data">{incapacidades.length}</div>
          <span className="text-[11px] text-slate-400">{totalAccidentes} accidentes / {totalEnfermedades} enf. común</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Índice de Severidad (IS)</span>
          <div className="text-[22px] font-bold text-slate-900 font-mono-data">{indiceSeveridad}</div>
          <span className="text-[11px] text-slate-400">Días por cada 240.000 HHT</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Impacto Financiero Estimado</span>
          <div className="text-[22px] font-bold text-slate-900 font-mono-data">${totalCosto.toLocaleString('es-CO')}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Reconocido ARL/EPS</span>
        </div>
      </div>

      {/* Formulario de Registro con Botón Azul Clay */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              +
            </div>
            <h2 className="font-semibold text-slate-900 text-[14px]">
              Radicar Nueva Incapacidad Médica
            </h2>
          </div>
          <span className="text-[12px] text-slate-400">
            Formulario conforme a lineamientos SURA y MinSalud
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Empleado */}
            <div>
              <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                Trabajador Afectado
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {workshopEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} ({emp.cargo})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Incapacidad */}
            <div>
              <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                Origen del Evento
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="ACCIDENTE_TRABAJO">Accidente de Trabajo (ARL)</option>
                <option value="ENFERMEDAD_GENERAL">Enfermedad General (EPS)</option>
                <option value="ENFERMEDAD_LABORAL">Enfermedad Laboral (Calificada)</option>
              </select>
            </div>

            {/* Código CIE-10 */}
            <div>
              <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                Código CIE-10
              </label>
              <select
                value={codigoCIE10}
                onChange={(e) => handleSelectCIE10(e.target.value)}
                className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2.5 text-[13px] font-mono-data text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {commonCIE10Codes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.desc.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Fechas y Días Calculados */}
            <div>
              <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                Período ({diasCalculados} días)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="h-9 bg-white border border-slate-200 rounded-lg px-2 text-[12px] font-mono-data text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="h-9 bg-white border border-slate-200 rounded-lg px-2 text-[12px] font-mono-data text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
            {/* Diagnóstico */}
            <div className="lg:col-span-2">
              <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                Diagnóstico / Detalle Clínico Específico
              </label>
              <input
                type="text"
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Detalle clínico o descripción del evento..."
                className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Clay-style Vibrant Blue Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full h-9 bg-[#1877F2] hover:bg-[#1464CC] text-white rounded-lg font-medium text-[13px] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Radicar Incapacidad Médica</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabla de Historial con Formato Clay */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-3.5 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-[14px]">
              Historial de Incapacidades Radicadas ({filteredIncapacidades.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-500">Filtrar por origen:</span>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[12px] text-slate-700 focus:outline-none"
            >
              <option value="TODOS">Todos los orígenes</option>
              <option value="ACCIDENTE_TRABAJO">Accidentes de Trabajo</option>
              <option value="ENFERMEDAD_GENERAL">Enfermedad General</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[12.5px] font-semibold text-slate-700">
                <th className="py-3 px-3.5 whitespace-nowrap">Código</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Trabajador</th>
                <th className="py-3 px-4 text-center whitespace-nowrap min-w-[170px]">Origen / ARL</th>
                <th className="py-3 px-3.5 min-w-[220px]">CIE-10 & Diagnóstico</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Días</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Vigencia</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Estado</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Costo Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncapacidades.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3.5 font-medium text-blue-600 whitespace-nowrap">
                    {inc.codigo}
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="font-medium text-slate-900 block text-[13px]">{inc.empleado}</span>
                    <span className="text-[11.5px] text-slate-500">{inc.cargo} • C.C. {inc.cedula}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border shadow-2xs whitespace-nowrap ${
                          inc.tipo === 'ACCIDENTE_TRABAJO'
                            ? 'bg-amber-50 text-amber-900 border-amber-300/80'
                            : 'bg-indigo-50 text-indigo-900 border-indigo-200/80'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${inc.tipo === 'ACCIDENTE_TRABAJO' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                        <span>{inc.tipo === 'ACCIDENTE_TRABAJO' ? 'Accidente laboral' : 'Enfermedad común'}</span>
                      </span>
                      <span className="text-[11.5px] font-medium text-slate-500">
                        {inc.entidadExpide}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="font-semibold text-slate-900 text-[12.5px]">
                      [{inc.codigoCIE10}]
                    </span>{' '}
                    <span className="text-slate-700 text-[13px]">{inc.diagnostico}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-900 text-[13px]">
                    {inc.diasIncapacidad} d
                  </td>
                  <td className="py-3.5 px-3.5 text-[12.5px] text-slate-600 whitespace-nowrap">
                    {inc.fechaInicio} al {inc.fechaFin}
                  </td>
                  <td className="py-3.5 px-3.5 text-center">
                    <span className="inline-flex items-center justify-center gap-1 text-[11.5px] px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {inc.estado === 'RECONOCIDO' ? 'Reconocido' : inc.estado === 'EN_COBRO_ARL_EPS' ? 'En cobro ARL' : 'Radicado'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-medium text-slate-900 text-[13px] whitespace-nowrap">
                    ${inc.costoAsumido.toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
