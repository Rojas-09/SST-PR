import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  AlertTriangle,
  Stethoscope,
  ShieldCheck,
  Building2,
  Clock,
  UserCheck,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  CalendarDays,
  FileText,
  MapPin,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  HazardRecord,
  IncapacidadRecord,
  CompanyInfo,
  ActiveView,
  CapacitacionRecord,
  CalendarEventItem,
  CalendarEventCategory,
} from '../types';

interface CalendarioVencimientosProps {
  hazards: HazardRecord[];
  incapacidades: IncapacidadRecord[];
  company: CompanyInfo;
  capacitaciones?: CapacitacionRecord[];
  onNavigate: (view: ActiveView) => void;
  onSelectHazard?: (hazard: HazardRecord) => void;
  compact?: boolean;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function CalendarioVencimientos({
  hazards,
  incapacidades,
  company,
  capacitaciones = [],
  onNavigate,
  onSelectHazard,
  compact = false,
}: CalendarioVencimientosProps) {
  // Default to March 2026 where rich operational activities are scheduled
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(2); // 0-indexed: 2 = March
  const [selectedDate, setSelectedDate] = useState<string>('2026-03-05'); // YYYY-MM-DD
  const [filtroCategoria, setFiltroCategoria] = useState<CalendarEventCategory | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  // 1. Build unified master list of calendar events
  const allEvents: CalendarEventItem[] = useMemo(() => {
    const events: CalendarEventItem[] = [];

    // A. Capacitaciones SST
    capacitaciones.forEach((cap) => {
      const fecha = cap.fechaProgramada || cap.fechaEjecucion || '2026-03-18';
      events.push({
        id: `event-cap-${cap.id}`,
        fecha: fecha,
        hora: cap.modalidad === 'CHARLA_5_MIN' ? '07:30 AM' : '09:00 AM',
        titulo: cap.tema,
        subtitulo: `${cap.modalidad.replace(/_/g, ' ')} (${cap.duracionHoras}h) • Facilitador: ${cap.capacitador.nombre}`,
        categoria: 'CAPACITACION',
        estado: cap.estado,
        responsable: cap.capacitador.nombre,
        lugar: cap.areaAfectada,
        normativa: cap.normativaAplicable || 'Res. 0312 Est. 2.2.1',
        relacionadoId: cap.id,
        tipoAccion: 'IR_CAPACITACIONES',
      });
    });

    const isServicCrear = company.id === 'servic-crear';

    // B. Inspecciones de Peligros y Seguridad Industrial GTC 45 (2026 y 2027)
    if (isServicCrear) {
      events.push(
        {
          id: 'event-insp-tanques-multigas',
          fecha: '2026-03-12',
          hora: '08:00 AM',
          titulo: 'Inspección de Trípode de Rescate y Calibración Detector Multigás 4 Gases',
          subtitulo: 'Verificación de sensor de O2, LEL, CO y H2S para lavado técnico de tanques según Decreto 1575 / Res. 0491',
          categoria: 'INSPECCION',
          estado: 'URGENTE',
          responsable: company.responsableSST.nombre,
          lugar: 'Sede Ibagué • Base Operativa SER-001',
          normativa: 'Res. 0491 de 2020 / Dec. 1575 de 2007',
          tipoAccion: 'IR_PELIGRO',
        },
        {
          id: 'event-insp-stihl-bateria',
          fecha: '2026-03-15',
          hora: '10:30 AM',
          titulo: 'Mantenimiento Preventivo y Afilado de Maquinaria STIHL a Batería',
          subtitulo: 'Inspección de guadañadoras FSA 135, cortasetos HLA 86 y podadoras telescópicas con soporte oficial STIHL',
          categoria: 'INSPECCION',
          estado: 'PROXIMO',
          responsable: 'Instructor Técnico STIHL & Ing. Andrea Morales',
          lugar: 'Taller de Equipos • Condominios Melgar y Girardot',
          normativa: 'Aliado STIHL Colombia / Res. 2400',
          tipoAccion: 'IR_PELIGRO',
        },
        {
          id: 'event-insp-piscinas-quimicos',
          fecha: '2026-03-22',
          hora: '02:00 PM',
          titulo: 'Monitoreo de Calidad de Agua en Piscinas y Kit DPD Cloro / pH',
          subtitulo: 'Control de parámetros de seguridad acuática y dosificación segura de reactivos en Alto Magdalena',
          categoria: 'INSPECCION',
          estado: 'PROGRAMADA',
          responsable: 'Operario de Piscinas y Tanques',
          lugar: 'Cuartos de Bombas • Condominios Recreacionales',
          normativa: 'Ley 554 de 2015 / Res. 1618 de 2012',
          tipoAccion: 'IR_PELIGRO',
        },
        {
          id: 'event-insp-botiquin-sc',
          fecha: '2026-03-10',
          hora: '09:00 AM',
          titulo: 'Inspección de Dotación de Botiquines y Kit de Antídotos / Lavaojos',
          subtitulo: 'Revisión de fechas de vencimiento de soluciones neutralizantes y lavaojos portátil para cloro',
          categoria: 'INSPECCION',
          estado: 'PROGRAMADA',
          responsable: 'Brigada de Primeros Auxilios SERVIC CREAR',
          lugar: 'Sede Principal Ibagué (Villa Marlen)',
          normativa: 'Res. 0705 de 2007 MinSalud',
          tipoAccion: 'ACCION_INTERNA',
        },
        {
          id: 'event-insp-sanidad-plagas',
          fecha: '2026-03-28',
          hora: '11:00 AM',
          titulo: 'Auditoría Fitosanitaria y Rotación de Plaguicidas (Sanidad Ambiental)',
          subtitulo: 'Control de hojas de datos de seguridad FDS, certificados de fumigación y bodegaje de químicos',
          categoria: 'INSPECCION',
          estado: 'PROGRAMADA',
          responsable: company.responsableSST.nombre,
          lugar: 'Bodega de Químicos • Ibagué',
          normativa: 'Decreto 1843 de 1991 / Res. 2115',
          tipoAccion: 'IR_PELIGRO',
        },
        // Evento lejano 2027
        {
          id: 'event-exp-pereira-2027',
          fecha: '2027-03-15',
          hora: '09:00 AM',
          titulo: 'Auditoría de Apertura SG-SST • Expansión Pereira, Risaralda (2027)',
          subtitulo: 'Evaluación de estándares mínimos Res. 0312 y cobertura ARL para el nuevo frente de trabajo en el Eje Cafetero',
          categoria: 'AUDITORIA',
          estado: 'PROGRAMADA',
          responsable: `${company.representanteLegal.nombre} y Líder SG-SST`,
          lugar: 'Nueva Sede Proyectada • Pereira, Risaralda',
          normativa: 'Res. 0312 de 2019 / Dec. 1072',
          tipoAccion: 'IR_0312',
        }
      );
    } else {
      // Taller Los Andes (2026 y proyecciones 2027)
      events.push(
        {
          id: 'event-insp-extintores',
          fecha: '2026-03-12',
          hora: '08:00 AM',
          titulo: 'Inspección y Prueba de Extintores de Planta (10 Unidades)',
          subtitulo: 'Verificación de manómetros, precintos y prueba hidrostática (6 PQS 20lbs + 4 Solkaflam)',
          categoria: 'INSPECCION',
          estado: 'URGENTE',
          responsable: company.responsableSST.nombre,
          lugar: 'Patios 1 y 2, Bahía 4 y Bodega',
          normativa: 'NFPA 10 / Res. 2400 de 1979 Art. 220',
          tipoAccion: 'IR_PELIGRO',
        },
        {
          id: 'event-insp-amoladoras',
          fecha: '2026-03-15',
          hora: '10:30 AM',
          titulo: 'Inspección Preoperacional de Amoladoras y Discos Abrasivos',
          subtitulo: 'Revisión técnica de guardas de 180°, RPM y prueba de sonido en bahía de desbaste',
          categoria: 'INSPECCION',
          estado: 'PROXIMO',
          responsable: 'Líder de Mantenimiento & Ing. Carlos Méndez',
          lugar: 'Bahía 3 • Área de Latonería',
          normativa: 'GTC 45 / OSHA 1910.215 / Res. 2400',
          tipoAccion: 'IR_PELIGRO',
        },
        {
          id: 'event-insp-tablero220',
          fecha: '2026-03-22',
          hora: '02:00 PM',
          titulo: 'Termografía e Inspección Tablero Eléctrico Principal 220V',
          subtitulo: 'Medición de puntos calientes, torque de bornes y verificación de enclavamiento LOTO',
          categoria: 'INSPECCION',
          estado: 'PROGRAMADA',
          responsable: 'Téc. Electricista Javier Ortiz',
          lugar: 'Tablero Principal • Bahía 2',
          normativa: 'RETIE Art. 18 / GTC 45 Riesgo Eléctrico',
          tipoAccion: 'IR_PELIGRO',
        },
        {
          id: 'event-insp-botiquin',
          fecha: '2026-03-10',
          hora: '09:00 AM',
          titulo: 'Inspección de Dotación de Botiquines y Camilla Rígida',
          subtitulo: 'Control de fechas de vencimiento de antisépticos, gasas estériles e inmovilizadores cervicales',
          categoria: 'INSPECCION',
          estado: 'PROGRAMADA',
          responsable: 'Brigada de Primeros Auxilios',
          lugar: 'Sede Operativa Principal',
          normativa: 'Res. 0705 de 2007 MinSalud',
          tipoAccion: 'ACCION_INTERNA',
        },
        {
          id: 'event-insp-soldadura',
          fecha: '2026-03-28',
          hora: '11:00 AM',
          titulo: 'Auditoría a Mamparas de Soldadura y Filtros de Extracción',
          subtitulo: 'Monitoreo de opacidad de cortinas vinílicas ámbar UV y renovación de filtros de aspiración',
          categoria: 'INSPECCION',
          estado: 'PROGRAMADA',
          responsable: company.responsableSST.nombre,
          lugar: 'Bahía 4 • Soldadura Estructural',
          normativa: 'GTC 45 / Dec. 1072 Art. 2.2.4.6.24',
          tipoAccion: 'IR_PELIGRO',
        },
        // Evento lejano 2027
        {
          id: 'event-recert-alturas-2027',
          fecha: '2027-02-15',
          hora: '08:00 AM',
          titulo: 'Recertificación Anual de Trabajo Seguro en Alturas en Fosa (2027)',
          subtitulo: 'Renovación obligatoria de competencias operativas para mecánicos y soldadores según Res. 4272/2021',
          categoria: 'CAPACITACION',
          estado: 'PROGRAMADA',
          responsable: 'Ing. Carlos Méndez',
          lugar: 'Centro de Entrenamiento Acreditado',
          normativa: 'Resolución 4272 de 2021',
          tipoAccion: 'IR_CAPACITACIONES',
        }
      );
    }

    // C. Incapacidades y Reintegros Médicos
    incapacidades.forEach((inc) => {
      // Reintegro post-incapacidad
      events.push({
        id: `event-inc-reintegro-${inc.id}`,
        fecha: inc.fechaFin,
        hora: '07:00 AM',
        titulo: `Examen de Reintegro Ocupacional: ${inc.empleado}`,
        subtitulo: `Valoración de aptitud post-incapacidad (${inc.diagnostico}) tras ${inc.diasIncapacidad} días`,
        categoria: 'INCAPACIDAD',
        estado: inc.codigo.includes('003') ? 'URGENTE' : 'PROGRAMADA',
        responsable: 'Médico Ocupacional / Líder SG-SST',
        lugar: 'Consultorio IPS Ocupacional',
        normativa: 'Res. 2346 de 2007 Art. 6',
        relacionadoId: inc.id,
        tipoAccion: 'IR_AUSENTISMO',
      });

      // Radicación de cobro
      if (inc.estado === 'EN_COBRO_ARL_EPS') {
        events.push({
          id: `event-inc-cobro-${inc.id}`,
          fecha: '2026-03-20',
          hora: '03:00 PM',
          titulo: `Radicación Cobro Subsidio ARL: ${inc.codigo}`,
          subtitulo: `Cobro de incapacidad de ${inc.empleado} ante ${inc.entidadExpide} ($${inc.costoAsumido.toLocaleString('es-CO')})`,
          categoria: 'INCAPACIDAD',
          estado: 'URGENTE',
          responsable: 'Gestión Humana & Financiera',
          lugar: 'Oficina Administrativa',
          normativa: 'Ley 776 de 2002 / Dec. 019 de 2012',
          relacionadoId: inc.id,
          tipoAccion: 'IR_AUSENTISMO',
        });
      }
    });

    // D. Actas EPP y Compromisos Legales SST (2026 y 2027)
    if (isServicCrear) {
      events.push(
        {
          id: 'event-epp-stihl-poda',
          fecha: '2026-03-06',
          hora: '08:30 AM',
          titulo: 'Convalidación y Firma de Acta EPP: Kit Forestal STIHL Zonas Verdes',
          subtitulo: 'Entrega certificada de perneras anticorte Clase 1, careta de malla y guantes antivibración',
          categoria: 'EPP',
          estado: 'URGENTE',
          responsable: company.responsableSST.nombre,
          lugar: 'Sede Ibagué • Cuadrilla STIHL',
          normativa: 'Art. 2.2.4.6.24 Dec. 1072 / Res. 0312',
          tipoAccion: 'IR_ACTAS',
        },
        {
          id: 'event-copasst-mensual-sc',
          fecha: '2026-03-28',
          hora: '04:00 PM',
          titulo: 'Reunión Ordinaria Mensual COPASST SERVIC CREAR (Acta Marzo 2026)',
          subtitulo: 'Seguimiento a prevención de golpes de calor en Girardot/Flandes y protocolos de tanques',
          categoria: 'LEGAL',
          estado: 'PROGRAMADA',
          responsable: 'Presidente y Secretario COPASST',
          lugar: 'Sede Principal Ibagué / Virtual',
          normativa: 'Res. 2013 de 1986 / Dec. 1072 Art. 2.2.4.6.11',
          tipoAccion: 'ACCION_INTERNA',
        },
        {
          id: 'event-cierre-phva-sc',
          fecha: '2026-03-31',
          hora: '05:00 PM',
          titulo: 'Cierre Trimestral y Seguimiento PHVA Res. 0312 (Vigencia 2026)',
          subtitulo: 'Consolidación de indicadores de frecuencia, severidad y avance del catálogo de servicios',
          categoria: 'AUDITORIA',
          estado: 'PROGRAMADA',
          responsable: `${company.representanteLegal.nombre} y Responsable SST`,
          lugar: 'Gerencia General SERVIC CREAR',
          normativa: 'Res. 0312 de 2019 Est. 6.1.1',
          tipoAccion: 'IR_0312',
        },
        {
          id: 'event-epp-cuatrimestral-sc',
          fecha: '2026-04-15',
          hora: '08:00 AM',
          titulo: 'Entrega Cuatrimestral de Dotación y Calzado Antideslizante SRC',
          subtitulo: 'Suministro legal de uniformes de alta visibilidad y calzado impermeable para 26 operarios',
          categoria: 'EPP',
          estado: 'PROGRAMADA',
          responsable: 'Talento Humano SERVIC CREAR',
          lugar: 'Almacén Central Ibagué',
          normativa: 'Código Sustantivo del Trabajo Arts. 230 y 232',
          tipoAccion: 'IR_ACTAS',
        }
      );
    } else {
      events.push(
        {
          id: 'event-epp-soldadura',
          fecha: '2026-03-06',
          hora: '08:30 AM',
          titulo: 'Convalidación y Firma de Acta EPP: Soldador Bahía 4',
          subtitulo: 'Entrega certificada de caretas fotosensibles DIN 9-13 y guantes de carnaza 16"',
          categoria: 'EPP',
          estado: 'URGENTE',
          responsable: company.responsableSST.nombre,
          lugar: 'Bahía 4 • Taller Principal',
          normativa: 'Art. 2.2.4.6.24 Dec. 1072 / Res. 0312',
          tipoAccion: 'IR_ACTAS',
        },
        {
          id: 'event-copasst-mensual',
          fecha: '2026-03-28',
          hora: '04:00 PM',
          titulo: 'Reunión Ordinaria Mensual COPASST (Acta Marzo 2026)',
          subtitulo: 'Informe de accidentalidad del mes, seguimiento a amoladora y verificación de mamparas',
          categoria: 'LEGAL',
          estado: 'PROGRAMADA',
          responsable: 'Presidente y Secretario COPASST',
          lugar: 'Sala de Capacitaciones',
          normativa: 'Res. 2013 de 1986 / Dec. 1072 Art. 2.2.4.6.11',
          tipoAccion: 'ACCION_INTERNA',
        },
        {
          id: 'event-cierre-phva',
          fecha: '2026-03-31',
          hora: '05:00 PM',
          titulo: 'Cierre Trimestral y Seguimiento PHVA Res. 0312 (Vigencia 2026)',
          subtitulo: 'Consolidación de indicadores de frecuencia, severidad y avance del plan de trabajo anual',
          categoria: 'AUDITORIA',
          estado: 'PROGRAMADA',
          responsable: `${company.representanteLegal.nombre} y Responsable SST`,
          lugar: 'Dirección General',
          normativa: 'Res. 0312 de 2019 Est. 6.1.1',
          tipoAccion: 'IR_0312',
        },
        {
          id: 'event-epp-cuatrimestral',
          fecha: '2026-04-15',
          hora: '08:00 AM',
          titulo: 'Entrega Cuatrimestral de Dotación y Calzado de Seguridad',
          subtitulo: 'Suministro legal de overoles y botas dieléctricas con puntera para los 8 operarios de taller',
          categoria: 'EPP',
          estado: 'PROGRAMADA',
          responsable: 'Gerencia General & Talento Humano',
          lugar: 'Almacén de Planta',
          normativa: 'Código Sustantivo del Trabajo Arts. 230 y 232',
          tipoAccion: 'IR_ACTAS',
        }
      );
    }

    return events;
  }, [capacitaciones, hazards, incapacidades, company]);

  // 2. Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const matchCat = filtroCategoria === 'TODOS' || ev.categoria === filtroCategoria;
      const matchSearch =
        !busqueda.trim() ||
        ev.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (ev.subtitulo && ev.subtitulo.toLowerCase().includes(busqueda.toLowerCase())) ||
        (ev.lugar && ev.lugar.toLowerCase().includes(busqueda.toLowerCase())) ||
        (ev.responsable && ev.responsable.toLowerCase().includes(busqueda.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [allEvents, filtroCategoria, busqueda]);

  // 3. Map events by date (YYYY-MM-DD) for fast lookup in cells
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    filteredEvents.forEach((ev) => {
      const current = map.get(ev.fecha) || [];
      current.push(ev);
      map.set(ev.fecha, current);
    });
    return map;
  }, [filteredEvents]);

  // 4. Calendar Matrix Math for currentYear & currentMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday-based indexing: Sunday is 0 in JS, so convert to Mon=0 ... Sun=6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const prevDays: Array<{ dateStr: string; dayNumber: number; isCurrentMonth: boolean }> = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      prevDays.push({ dateStr, dayNumber: day, isCurrentMonth: false });
    }

    // Current month days
    const currentDays: Array<{ dateStr: string; dayNumber: number; isCurrentMonth: boolean }> = [];
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      currentDays.push({ dateStr, dayNumber: day, isCurrentMonth: true });
    }

    // Next month filler days to complete 35 or 42 grid cells
    const nextDays: Array<{ dateStr: string; dayNumber: number; isCurrentMonth: boolean }> = [];
    const totalRendered = prevDays.length + currentDays.length;
    const remaining = (7 - (totalRendered % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const m = currentMonth + 2 > 12 ? 1 : currentMonth + 2;
      const y = currentMonth + 2 > 12 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      nextDays.push({ dateStr, dayNumber: day, isCurrentMonth: false });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentYear, currentMonth]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter((ev) => ev.fecha === selectedDate);
  }, [filteredEvents, selectedDate]);

  // Monthly stats
  const monthStats = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const inMonth = allEvents.filter((e) => e.fecha.startsWith(prefix));
    const capacitaciones = inMonth.filter((e) => e.categoria === 'CAPACITACION').length;
    const inspecciones = inMonth.filter((e) => e.categoria === 'INSPECCION').length;
    const incapacidades = inMonth.filter((e) => e.categoria === 'INCAPACIDAD').length;
    const urgentes = inMonth.filter((e) => e.estado === 'URGENTE' || e.estado === 'VENCIDA').length;

    return {
      total: inMonth.length,
      capacitaciones,
      inspecciones,
      incapacidades,
      urgentes,
    };
  }, [allEvents, currentYear, currentMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleGoToDefault = () => {
    setCurrentYear(2026);
    setCurrentMonth(2); // Marzo 2026
    setSelectedDate('2026-03-05');
  };

  // Helper for category badge styling
  const getCategoryColor = (cat: CalendarEventCategory) => {
    switch (cat) {
      case 'CAPACITACION':
        return {
          pill: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100',
          dot: 'bg-teal-600',
          border: 'border-l-teal-500',
          icon: <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />,
          label: 'Capacitación SST',
        };
      case 'INSPECCION':
        return {
          pill: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
          dot: 'bg-amber-500',
          border: 'border-l-amber-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
          label: 'Inspección GTC 45',
        };
      case 'INCAPACIDAD':
        return {
          pill: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
          dot: 'bg-purple-600',
          border: 'border-l-purple-500',
          icon: <Stethoscope className="w-3.5 h-3.5 text-purple-600 shrink-0" />,
          label: 'Incapacidad / Reintegro',
        };
      case 'EPP':
        return {
          pill: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
          dot: 'bg-blue-600',
          border: 'border-l-blue-500',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />,
          label: 'Dotación EPP',
        };
      case 'LEGAL':
        return {
          pill: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100',
          dot: 'bg-indigo-600',
          border: 'border-l-indigo-500',
          icon: <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />,
          label: 'Legal / COPASST',
        };
      case 'AUDITORIA':
        return {
          pill: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
          dot: 'bg-emerald-600',
          border: 'border-l-emerald-500',
          icon: <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
          label: 'Auditoría Res. 0312',
        };
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="seccion-calendario-sst" className="font-sans text-[13px] text-slate-800 space-y-4">
      {/* HEADER: Title, Month Navigation & Quick Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                CALENDARIO CRONOLÓGICO SG-SST
              </span>
              <span className="text-slate-300 text-xs hidden sm:inline">•</span>
              <span className="text-[11.5px] text-slate-600 font-medium truncate">
                {company.name} ({company.claseRiesgo || 'Riesgo IV'})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Cronograma Mensual de Vencimientos y Actividades Clave
            </h2>
            <p className="text-[12px] sm:text-[12.5px] text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
              Visualización temporal de capacitaciones obligatorias (Res. 0312), inspecciones técnicas GTC 45, reintegros laborales y actas de EPP.
            </p>
          </div>

          {/* Month Controller Navigation */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleGoToDefault}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              title="Volver al mes operativo actual (Marzo 2026)"
            >
              Mes Operativo
            </button>
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white text-slate-700 rounded-md transition-colors cursor-pointer"
                title="Mes anterior"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 font-bold text-slate-900 text-[13px] min-w-[130px] text-center select-none">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white text-slate-700 rounded-md transition-colors cursor-pointer"
                title="Mes siguiente"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Month Metrics Bar (Responsive for tablet and mobile without collision) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 pt-2 border-t border-slate-100">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              Total Fechas Clave
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono">{monthStats.total}</span>
              <span className="text-xs text-slate-500 font-medium">citas</span>
            </div>
          </div>
          <div className="p-2.5 bg-teal-50/70 rounded-xl border border-teal-100 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-teal-700 uppercase tracking-wider block truncate">
              Capacitaciones
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-teal-800 font-mono">{monthStats.capacitaciones}</span>
              <span className="text-xs text-teal-700 font-medium truncate">programadas</span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 uppercase tracking-wider block truncate">
              Inspecciones
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-amber-800 font-mono">{monthStats.inspecciones}</span>
              <span className="text-xs text-amber-700 font-medium truncate">técnicas</span>
            </div>
          </div>
          <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-100 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 uppercase tracking-wider block truncate">
              Incapacidades
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-purple-800 font-mono">{monthStats.incapacidades}</span>
              <span className="text-xs text-purple-700 font-medium truncate">reintegros</span>
            </div>
          </div>
          <div className="p-2.5 bg-red-50/70 rounded-xl border border-red-100 col-span-2 sm:col-span-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-red-700 uppercase tracking-wider block truncate">
              Atención Inmediata
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-red-800 font-mono">{monthStats.urgentes}</span>
              <span className="text-xs text-red-700 font-medium truncate">urgentes</span>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </span>
            <button
              type="button"
              onClick={() => setFiltroCategoria('TODOS')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroCategoria === 'TODOS'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({allEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('CAPACITACION')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                filtroCategoria === 'CAPACITACION'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                  : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              Capacitaciones
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('INSPECCION')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                filtroCategoria === 'INSPECCION'
                  ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Inspecciones
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('INCAPACIDAD')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                filtroCategoria === 'INCAPACIDAD'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                  : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Stethoscope className="w-3 h-3" />
              Incapacidades
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('EPP')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                filtroCategoria === 'EPP'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                  : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              EPP / Legal
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar evento, operario o área..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: CALENDAR GRID (Left/Main) + DAY DETAILS INSPECTOR (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CALENDAR GRID CONTAINER (8 Columns on desktop) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-semibold text-slate-600 py-2.5">
            {DAYS_OF_WEEK.map((day, i) => (
              <div key={day} className={i >= 5 ? 'text-slate-400' : 'text-slate-700'}>
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 border-b border-slate-100">
            {calendarDays.map((cell) => {
              const events = eventsByDate.get(cell.dateStr) || [];
              const isSelected = selectedDate === cell.dateStr;
              const hasEvents = events.length > 0;
              const hasUrgent = events.some((e) => e.estado === 'URGENTE' || e.estado === 'VENCIDA');

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[86px] sm:min-h-[102px] p-1 sm:p-1.5 flex flex-col transition-all cursor-pointer relative group ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/50 text-slate-400'
                      : isSelected
                      ? 'bg-blue-50/40 ring-2 ring-blue-500 ring-inset z-10'
                      : 'bg-white hover:bg-slate-50/80 text-slate-800'
                  }`}
                >
                  {/* Top Bar inside cell: Day number + dot indicator */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Critical urgency flag dot */}
                    {hasUrgent && (
                      <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" title="Tiene vencimiento urgente" />
                    )}
                  </div>

                  {/* Events list inside cell */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {/* Desktop pills (shows up to 2 items) */}
                    {events.slice(0, 2).map((ev) => {
                      const styling = getCategoryColor(ev.categoria);
                      return (
                        <div
                          key={ev.id}
                          className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium border truncate transition-colors ${styling.pill}`}
                          title={`${ev.hora ? ev.hora + ' • ' : ''}${ev.titulo}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styling.dot}`} />
                          <span className="truncate">{ev.titulo}</span>
                        </div>
                      );
                    })}

                    {/* Mobile dots */}
                    <div className="sm:hidden flex flex-wrap gap-1 mt-1">
                      {events.map((ev) => {
                        const styling = getCategoryColor(ev.categoria);
                        return (
                          <span
                            key={ev.id}
                            className={`w-2 h-2 rounded-full ${styling.dot}`}
                            title={ev.titulo}
                          />
                        );
                      })}
                    </div>

                    {/* Overflow count if more than 2 events on this date */}
                    {events.length > 2 && (
                      <div className="hidden sm:block text-[10px] font-semibold text-slate-500 pl-1">
                        +{events.length - 2} más...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Bottom Legend */}
          <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-700">Convenciones:</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                Capacitación SST
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Inspección Técnica GTC 45
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                Incapacidad / Reintegro
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                EPP & Dotación
              </span>
            </div>
            <span className="text-slate-400 italic">Clic en cualquier día para inspeccionar detalles</span>
          </div>
        </div>

        {/* DAY DETAILS INSPECTOR PANEL (4 Columns on desktop) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Header of selected date */}
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Día Seleccionado
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedDateEvents.length} actividad{selectedDateEvents.length === 1 ? '' : 'es'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 capitalize mt-1">
                {formatDisplayDate(selectedDate)}
              </h3>
            </div>

            {/* List of events on this selected day */}
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {selectedDateEvents.map((ev) => {
                  const styling = getCategoryColor(ev.categoria);
                  const isUrgent = ev.estado === 'URGENTE' || ev.estado === 'VENCIDA';

                  return (
                    <div
                      key={ev.id}
                      className={`p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-2 border-l-4 ${styling.border}`}
                    >
                      {/* Top Row: Category + Urgency badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                          {styling.icon}
                          {styling.label}
                        </span>
                        {isUrgent ? (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Atención Inmediata
                          </span>
                        ) : ev.estado === 'EJECUTADA' ? (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Completada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-700">
                            {ev.hora || 'Programada'}
                          </span>
                        )}
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h4 className="text-[13px] font-bold text-slate-900 leading-snug">
                          {ev.titulo}
                        </h4>
                        {ev.subtitulo && (
                          <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
                            {ev.subtitulo}
                          </p>
                        )}
                      </div>

                      {/* Meta info: Lugar, Responsable, Normativa */}
                      <div className="space-y-1 text-[11.5px] text-slate-500 pt-1.5 border-t border-slate-100">
                        {ev.lugar && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{ev.lugar}</span>
                          </div>
                        )}
                        {ev.responsable && (
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">Responsable: {ev.responsable}</span>
                          </div>
                        )}
                        {ev.normativa && (
                          <div className="flex items-center gap-1.5 text-blue-700">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{ev.normativa}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {ev.tipoAccion && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (ev.tipoAccion === 'IR_CAPACITACIONES') onNavigate('capacitaciones');
                              else if (ev.tipoAccion === 'IR_PELIGRO') onNavigate('gestion-peligros');
                              else if (ev.tipoAccion === 'IR_AUSENTISMO') onNavigate('ausentismo');
                              else if (ev.tipoAccion === 'IR_ACTAS') onNavigate('actas-entrega');
                              else if (ev.tipoAccion === 'IR_0312') onNavigate('diagnostico-0312');
                              else onNavigate('gestion-peligros');
                            }}
                            className="w-full py-1.5 px-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <span>Gestionar en el Sistema</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-200/70 text-slate-400 flex items-center justify-center mx-auto">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <h4 className="text-[13px] font-semibold text-slate-700">
                  Sin eventos agendados para este día
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  No hay capacitaciones ni inspecciones fechadas para el {formatDisplayDate(selectedDate)}.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate('2026-03-05')}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Ver fecha con eventos (05 de Marzo)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick jump to next urgent deadline */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Próximo Hito Crítico en Calendario:</span>
            </div>
            <p className="text-[12px] text-amber-800 leading-snug">
              <strong>05 de Marzo 2026:</strong> Charla 5S, Manejo de Derrames y Prevención de Caídas.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11.5px]">
              <button
                type="button"
                onClick={() => setSelectedDate('2026-03-05')}
                className="text-amber-900 font-semibold hover:underline cursor-pointer"
              >
                Seleccionar en Calendario
              </button>
              <button
                type="button"
                onClick={() => onNavigate('capacitaciones')}
                className="text-blue-700 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                Ver Plan Anual <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
