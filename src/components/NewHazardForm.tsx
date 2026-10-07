import { useState, useMemo, FormEvent } from 'react';
import { RotateCcw, Shield, Save, CheckCircle2 } from 'lucide-react';
import { HazardRecord, CompanyInfo, ActiveView } from '../types';
import { calculateGTC45, NP_LABELS, NC_LABELS } from '../utils/gtc45Calculator';
import { Gtc45MatrixGrid } from './Gtc45MatrixGrid';

interface NewHazardFormProps {
  company: CompanyInfo;
  onSaveHazard: (newHazard: HazardRecord) => void;
  onNavigate: (view: ActiveView) => void;
}

export function NewHazardForm({
  company,
  onSaveHazard,
  onNavigate,
}: NewHazardFormProps) {
  const isServicCrear = company.id === 'servic-crear';

  const defaultArea = isServicCrear
    ? 'SER-001 Limpieza y Desinfección — Lavado técnico de tanques de agua potable e interiores'
    : 'Zona de Soldadura y Corte — Soldadura de estructuras y chasis';

  const defaultDesc = isServicCrear
    ? 'Ingreso y permanencia en espacio confinado para lavado y desinfección de tanques de agua potable con atmósfera confinada y uso de hipoclorito.'
    : 'Generación continua de humos metálicos y chispas durante el ensamble y soldadura de chasises pesados sin extractor focalizado.';

  const defaultEfectos = isServicCrear
    ? 'Asfixia por deficiencia de oxígeno, intoxicación por vapores clorados, traumatismos por caída en altura al interior del tanque.'
    : 'Quemaduras de segundo grado en extremidades superiores, conjuntivitis actínica ("ojo de soldador") e intoxicación por vapores de zinc.';

  const defaultFuente = isServicCrear
    ? 'Mantenimiento preventivo a equipos de bombeo y motobombas'
    : 'Ajuste preventivo en bornes de soldadora eléctrica';

  const defaultMedio = isServicCrear
    ? 'Extractor de aire portátil y trípode de anclaje certificado'
    : 'Biombo de lona ignífuga estándar móvil en patio';

  const defaultTrabajador = isServicCrear
    ? 'Arnés de cuerpo entero, línea de vida y máscara con filtro para gases ácidos'
    : 'Careta fotosensible básica, guantes carnaza desgastados';

  const defaultMedidas = isServicCrear
    ? 'Monitoreo de atmósfera previa con multidetector de 4 gases certificado y protocolo estricto de permiso de trabajo en espacio confinado.'
    : 'Instalar campana de extracción localizada en el banco de soldadura e implementar protocolo estricto de EPP certificado.';

  // Form state
  const [areaProceso, setAreaProceso] = useState(defaultArea);
  const [esRutinaria, setEsRutinaria] = useState(true);
  const [tipoPeligro, setTipoPeligro] = useState(isServicCrear ? 'Peligro Químico y Espacio Confinado' : 'Condiciones de Seguridad');
  const [factorEspecifico, setFactorEspecifico] = useState(isServicCrear ? 'Químico (Gases y Vapores / Confinado)' : 'Mecánico (Proyección de partículas)');
  const [descripcionPeligro, setDescripcionPeligro] = useState(defaultDesc);
  const [efectosSalud, setEfectosSalud] = useState(defaultEfectos);
  const [controlFuente, setControlFuente] = useState(defaultFuente);
  const [controlMedio, setControlMedio] = useState(defaultMedio);
  const [controlTrabajador, setControlTrabajador] = useState(defaultTrabajador);
  const [medidasRecomendadas, setMedidasRecomendadas] = useState(defaultMedidas);

  // GTC 45 interactive numbers matching Screenshot 2 (NP 4, NC 4 -> NR 16 Nivel I)
  const [np, setNp] = useState(4);
  const [nc, setNc] = useState(4);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dynamic GTC 45 evaluation
  const evaluacion = useMemo(() => calculateGTC45(np, nc), [np, nc]);

  const handleReset = () => {
    setAreaProceso(defaultArea);
    setDescripcionPeligro(defaultDesc);
    setEfectosSalud(defaultEfectos);
    setControlFuente(defaultFuente);
    setControlMedio(defaultMedio);
    setControlTrabajador(defaultTrabajador);
    setMedidasRecomendadas(defaultMedidas);
    setEsRutinaria(true);
    setTipoPeligro(isServicCrear ? 'Peligro Químico y Espacio Confinado' : 'Condiciones de Seguridad');
    setFactorEspecifico(isServicCrear ? 'Químico (Gases y Vapores / Confinado)' : 'Mecánico (Proyección de partículas)');
    setNp(4);
    setNc(4);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newRecord: HazardRecord = {
      id: `PEL-${company.id === 'servic-crear' ? 'SC-' : ''}2026-${Date.now().toString().slice(-4)}`,
      code: `GTC45-${company.id === 'servic-crear' ? 'SC' : 'TLA'}-2026-${Math.floor(Math.random() * 90 + 10)}`,
      title: descripcionPeligro.slice(0, 70) || 'Nuevo Peligro Registrado',
      subtitle: efectosSalud.slice(0, 110) || 'Riesgo evaluado según GTC 45.',
      macroproceso: areaProceso.includes('Cocina') ? 'BIENESTAR / SERVICIOS • SEDE OPERATIVA' : 'OPERATIVO / PRODUCCIÓN TÉCNICA AUTOMOTRIZ',
      proceso: areaProceso.includes('Cocina') ? 'Bienestar / Servicios' : 'Operativo',
      zonaLugar: areaProceso.split('—')[0]?.trim() || areaProceso,
      actividadEspecifica: areaProceso.split('—')[1]?.trim() || 'Operación regular en planta',
      rutinaria: esRutinaria,
      operariosExpuestos: 4,
      tipoPeligroGeneral: tipoPeligro,
      factorEspecifico: factorEspecifico,
      descripcionDetallada: descripcionPeligro,
      efectosSalud: efectosSalud,
      patologiasPrevistas: [
        {
          titulo: 'Efecto Directo Evaluado',
          descripcion: efectosSalud,
        },
      ],
      controles: {
        fuente: {
          status: controlFuente ? 'INSUFICIENTE' : 'INEXISTENTE',
          description: controlFuente || 'Ninguno implementado.',
        },
        medio: {
          status: controlMedio ? 'INSUFICIENTE' : 'INEXISTENTE',
          description: controlMedio || 'Ninguno implementado.',
        },
        individuo: {
          status: evaluacion.level === 'NIVEL_I' ? 'CRÍTICO' : 'INSUFICIENTE',
          description: controlTrabajador || 'EPP básico no certificado.',
        },
      },
      evaluacion: evaluacion,
      planIntervencion: {
        administrativa: {
          titulo: evaluacion.level === 'NIVEL_I' ? 'Paralización Preventiva' : 'Capacitación Operativa',
          estado: 'En curso',
          descripcion: evaluacion.normativaText,
        },
        epp: {
          titulo: 'Dotación EPP Homologado',
          prioridad: evaluacion.level === 'NIVEL_I' ? 'Prioridad Alta' : 'Media',
          items: [
            { id: `epp-${Date.now()}-1`, text: 'Kits de protección individual certificados bajo norma técnica', checked: false },
          ],
        },
        ingenieria: {
          titulo: 'Medidas de Ingeniería en Fuente',
          fase: 'Fase 1',
          descripcion: medidasRecomendadas,
        },
        responsable: company.responsableSST.nombre,
        plazoLegal: evaluacion.level === 'NIVEL_I' ? '24 Horas' : '5 Días hábiles',
      },
      evidenciaFotos: [
        {
          url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
          caption: 'Registro fotográfico in situ durante inspección',
        },
      ],
      estadoEntregaEPP: 'PENDIENTE',
      fechaInspeccion: 'Hoy',
    };

    onSaveHazard(newRecord);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onNavigate('matriz-gtc45');
    }, 1200);
  };

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 py-5 sm:py-6 space-y-6 text-sm sm:text-base">
      {/* Top Header Section matching Screenshot 2 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block font-semibold">
            MATRIZ GTC 45 • DECRETO 1072 • Inspección Operativa
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Registrar Nuevo Peligro
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Estandarización de valoración de riesgos para <strong className="text-slate-800">{company.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('diagnostico-0312')}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" /> SG-SST Res. 0312
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Limpiar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inspection Form) - 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Physical Location Verification Banner with Image matching Screenshot 2 */}
          <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-900 shadow-xs">
            <div className="h-32 sm:h-40 w-full relative">
              <img
                src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
                alt="Taller Central Nave Principal Mecanizado"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent flex items-center p-5">
                <div className="max-w-md">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    UBICACIÓN FÍSICA VERIFICADA
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Taller Central - Nave Principal Mecanizado
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Inspección de campo requerida para validar la fuente directa y la exposición de los colaboradores en turno.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Área y Actividad Operativa */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">🏢</span>
                <h3 className="text-[13px] font-bold text-slate-900">
                  1. Área y Actividad Operativa
                </h3>
              </div>
              <span className="text-[10px] font-mono text-red-600 font-semibold">* Obligatorio</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Área o Proceso Estandarizado
              </label>
              <select
                value={areaProceso}
                onChange={(e) => setAreaProceso(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706] font-sans"
              >
                {isServicCrear ? (
                  <>
                    <option value="SER-001 Limpieza y Desinfección — Lavado técnico de tanques de agua potable e interiores">
                      SER-001 Limpieza y Desinfección — Lavado técnico de tanques de agua potable e interiores
                    </option>
                    <option value="SER-002 Zonas Verdes y Paisajismo — Sostenimiento de jardines y poda con equipos STIHL">
                      SER-002 Zonas Verdes y Paisajismo — Sostenimiento de jardines y poda con equipos STIHL
                    </option>
                    <option value="SER-003 Mantenimiento de Piscinas — Tratamiento químico, cloración y recirculación">
                      SER-003 Mantenimiento de Piscinas — Tratamiento químico, cloración y recirculación
                    </option>
                    <option value="SER-004 Mantenimiento Locativo — Obras civiles menores, plomería y redes hidráulicas">
                      SER-004 Mantenimiento Locativo — Obras civiles menores, plomería y redes hidráulicas
                    </option>
                    <option value="SER-005 Sanidad Ambiental — Fumigación integral, desinsectación y control de plagas">
                      SER-005 Sanidad Ambiental — Fumigación integral, desinsectación y control de plagas
                    </option>
                    <option value="Bodega de Químicos y Equipos — Custodia de cloro, plaguicidas y maquinaria STIHL">
                      Bodega de Químicos y Equipos — Custodia de cloro, plaguicidas y maquinaria STIHL
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Zona de Soldadura y Corte — Soldadura de estructuras y chasis">
                      Zona de Soldadura y Corte — Soldadura de estructuras y chasis
                    </option>
                    <option value="Bodega de Insumos — Almacenamiento y logística interna">
                      Bodega de Insumos — Almacenamiento y logística interna
                    </option>
                    <option value="Mecánica Rápida — Mantenimiento preventivo">
                      Mecánica Rápida — Mantenimiento preventivo
                    </option>
                    <option value="Pintura y Cabina — Aplicación electrostática">
                      Pintura y Cabina — Aplicación electrostática
                    </option>
                    <option value="Cocina y Comedor — Servicios generales">
                      Cocina y Comedor — Servicios generales
                    </option>
                  </>
                )}
              </select>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span className="font-mono">ⓘ</span> Catálogo oficial de {company.name}. Evita duplicados para no fragmentar el histórico de inspecciones.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ¿La actividad es rutinaria?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEsRutinaria(true)}
                  className={`py-2 px-3 text-xs font-semibold rounded border text-center transition-all cursor-pointer ${
                    esRutinaria
                      ? 'bg-amber-50/80 border-[#D97706] text-[#92400E] shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Sí (Operación Rutinaria)
                </button>
                <button
                  type="button"
                  onClick={() => setEsRutinaria(false)}
                  className={`py-2 px-3 text-xs font-semibold rounded border text-center transition-all cursor-pointer ${
                    !esRutinaria
                      ? 'bg-amber-50/80 border-[#D97706] text-[#92400E] shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  No (Ocasional / Emergencia)
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Clasificación del Peligro (GTC 45) */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold">⚠️</span>
                <h3 className="text-[13px] font-bold text-slate-900">
                  2. Clasificación del Peligro (GTC 45)
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                Tabla A.1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Peligro General
                </label>
                <select
                  value={tipoPeligro}
                  onChange={(e) => setTipoPeligro(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]"
                >
                  <option value="Condiciones de Seguridad">Condiciones de Seguridad</option>
                  <option value="Físico / Químico">Físico / Químico</option>
                  <option value="Físico">Físico</option>
                  <option value="Químico">Químico</option>
                  <option value="Biológico">Biológico</option>
                  <option value="Biomecánico">Biomecánico</option>
                  <option value="Locativo">Locativo</option>
                  <option value="Psicosocial">Psicosocial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Factor Específico / Fuente
                </label>
                <select
                  value={factorEspecifico}
                  onChange={(e) => setFactorEspecifico(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]"
                >
                  <option value="Mecánico (Proyección de partículas)">Mecánico (Proyección de partículas)</option>
                  <option value="Radiación UV y humos metálicos">Radiación UV y humos metálicos</option>
                  <option value="Eléctrico (Alta tensión / Arco)">Eléctrico (Alta tensión / Arco)</option>
                  <option value="Locativo (Superficies resbaladizas)">Locativo (Superficies resbaladizas)</option>
                  <option value="Ruido continuo > 85 dB">Ruido continuo &gt; 85 dB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción Detallada del Peligro In Situ
              </label>
              <textarea
                rows={3}
                value={descripcionPeligro}
                onChange={(e) => setDescripcionPeligro(e.target.value)}
                placeholder="Describe la condición peligrosa observada..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706] leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Posibles Efectos en la Salud / Consecuencias
              </label>
              <textarea
                rows={2}
                value={efectosSalud}
                onChange={(e) => setEfectosSalud(e.target.value)}
                placeholder="Consecuencias en los trabajadores expuestos..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706] leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Section 3: Jerarquía de Controles Existentes */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-bold">🛡️</span>
                <h3 className="text-[13px] font-bold text-slate-900">
                  3. Jerarquía de Controles Existentes
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Art. 2.2.4.6.24 Dec. 1072
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  ⎇ En la Fuente
                </label>
                <input
                  type="text"
                  value={controlFuente}
                  onChange={(e) => setControlFuente(e.target.value)}
                  placeholder="Controles en la máquina o fuente..."
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  🛡️ En el Medio
                </label>
                <input
                  type="text"
                  value={controlMedio}
                  onChange={(e) => setControlMedio(e.target.value)}
                  placeholder="Aislamiento o mamparas..."
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  👤 En el Trabajador (EPP)
                </label>
                <input
                  type="text"
                  value={controlTrabajador}
                  onChange={(e) => setControlTrabajador(e.target.value)}
                  placeholder="Equipos de protección actual..."
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medidas de Intervención Recomendadas (Plan Correctivo)
              </label>
              <textarea
                rows={2}
                value={medidasRecomendadas}
                onChange={(e) => setMedidasRecomendadas(e.target.value)}
                placeholder="Acciones preventivas y correctivas a implementar..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706] leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Live GTC 45 Risk Evaluator matching Screenshot 2) - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold font-mono">🧮</span>
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900 leading-tight">
                    Evaluación GTC 45
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Valoración matemática en vivo</span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600 font-bold">
                NP × NC = NR
              </span>
            </div>

            {/* Stepper 1: Nivel de Probabilidad (NP) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-800">
                  Nivel de Probabilidad (NP)
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-700">
                  {NP_LABELS[np]?.desc}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = np === val;
                  return (
                    <button
                      key={`np-${val}`}
                      type="button"
                      onClick={() => setNp(val)}
                      className={`py-2 px-1 rounded flex flex-col items-center justify-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#B15F00] text-white border-[#B15F00] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-base font-extrabold font-mono">{val}</span>
                      <span className="text-[8px] font-mono uppercase font-bold tracking-tight">
                        {NP_LABELS[val]?.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper 2: Nivel de Consecuencia / Severidad (NC) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-800">
                  Nivel de Consecuencia / Severidad (NC)
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-700">
                  {NC_LABELS[nc]?.desc}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = nc === val;
                  return (
                    <button
                      key={`nc-${val}`}
                      type="button"
                      onClick={() => setNc(val)}
                      className={`py-2 px-1 rounded flex flex-col items-center justify-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#B15F00] text-white border-[#B15F00] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-base font-extrabold font-mono">{val}</span>
                      <span className="text-[8px] font-mono uppercase font-bold tracking-tight">
                        {NC_LABELS[val]?.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Result Card matching Screenshot 2 */}
            <div className="bg-[#FEE2E2] border border-red-300/80 rounded-md p-4 text-slate-900 shadow-xs">
              <div className="flex items-center justify-between border-b border-red-200/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-red-600 font-bold text-sm">✱</span>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-red-700 font-bold block">
                      NIVEL DE RIESGO (NR)
                    </span>
                    <h4 className="text-[13px] font-bold text-red-950 uppercase tracking-wide">
                      {evaluacion.levelText}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-red-600 block leading-tight">{np} × {nc}</span>
                  <span className="text-2xl font-black font-mono text-red-950 leading-none">
                    {evaluacion.nr}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono">
                <span className="bg-red-200/80 text-red-950 font-bold px-2 py-0.5 rounded">
                  {evaluacion.aceptabilidad}
                </span>
                <span className="text-slate-500 font-semibold">GTC 45 Ed. 2012</span>
              </div>

              <p className="mt-2 text-[11px] text-red-950 leading-relaxed">
                {evaluacion.normativaText}
              </p>
            </div>

            {/* Submit Action Button matching Screenshot 2 */}
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#1464CC] active:scale-[0.99] text-white font-semibold rounded-lg text-[13.5px] tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>¡Peligro Guardado con Éxito!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Guardar Peligro y Actualizar Matriz</span>
                  </>
                )}
              </button>
              <div className="mt-2 text-center text-[10px] font-mono text-slate-400">
                🕒 Última actualización de matriz: Hoy, 08:30 AM
              </div>
            </div>

            {/* Interactive Heatmap */}
            <div className="pt-1">
              <Gtc45MatrixGrid
                currentNp={np}
                currentNc={nc}
                onSelectCell={(selectedNp, selectedNc) => {
                  setNp(selectedNp);
                  setNc(selectedNc);
                }}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
