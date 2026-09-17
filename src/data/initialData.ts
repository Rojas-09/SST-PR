import { CompanyInfo, HazardRecord } from '../types';
import { calculateGTC45 } from '../utils/gtc45Calculator';

export const initialCompany: CompanyInfo = {
  name: 'Taller Los Andes S.A.S.',
  nit: '901.458.210-3',
  claseRiesgo: 'RIESGO CLASE IV',
  ciiu: 'CIIU 4520: Mantenimiento y reparación de vehículos automotores',
  sede: 'Sede Operativa Principal - Patio 2 (Bogotá D.C.)',
  responsableSST: {
    nombre: 'Ing. Carlos Méndez',
    cargo: 'Especialista en Seguridad y Salud en el Trabajo',
    licencia: '18492-2018 (DDS)',
    curso50h: 'Vigente',
    hashFirma: '7a9c8b21...4e',
    estado: 'ACTIVO',
  },
  representanteLegal: {
    nombre: 'Rodrigo Gómez Mendoza',
    cargo: 'Gerente General',
    cedula: '79.432.190 de Bogotá',
    estadoAprobacion: 'PENDIENTE CONVALIDACIÓN',
  },
};

export const initialHazards: HazardRecord[] = [
  {
    id: 'PEL-2024-001',
    code: 'GTC45-TLA-2024-09',
    title: 'Falta de EPP específico (careta fotosensible y guantes de carnaza 16") en zona de soldadura y corte',
    subtitle: 'Riesgo severo de queratoconjuntivitis actínica irreversible, cataratas y quemaduras por radiación ultravioleta/infrarroja durante ensamble de chasises.',
    macroproceso: 'OPERATIVO / PRODUCCIÓN TÉCNICA AUTOMOTRIZ',
    proceso: 'Operativo',
    zonaLugar: 'Zona de Soldadura y Corte • Bahía 4 - Taller Principal',
    actividadEspecifica: 'Soldadura MIG/SMAW de vigas estructurales, cardanes y chasises de camiones pesados',
    rutinaria: true,
    operariosExpuestos: 4,
    tipoPeligroGeneral: 'Condiciones de Seguridad / Físico-Químico',
    factorEspecifico: 'Radiación UV y humos metálicos de óxido de hierro y manganeso',
    descripcionDetallada: 'Operarios realizando uniones de vigas estructurales mediante arco eléctrico con caretas convencionales de vidrio fijo que presentan fracturas estructurales o visores descalibrados. Ausencia total de guantes de carnaza tipo soldador de 16 pulgadas y mangas térmicas de protección contra proyecciones de escoria y radiación lumínica continua.',
    efectosSalud: 'Queratoconjuntivitis actínica, quemaduras corneales, siderosis pulmonar e intoxicación crónica por vapores metálicos.',
    patologiasPrevistas: [
      {
        titulo: 'Queratoconjuntivitis actínica aguda',
        descripcion: 'Daño ocular severo por exposición directa al destello de arco sin filtro DIN adecuado; riesgo elevado de cataratas precoces y pérdida progresiva de la agudeza visual.',
      },
      {
        titulo: 'Quemaduras dérmicas de 2° y 3° grado',
        descripcion: 'Lesiones en antebrazos, manos y cuello provocadas por radiación ultravioleta sostenida y proyecciones de escoria a más de 1.200°C.',
      },
      {
        titulo: 'Inhalación de humos metálicos y ozono',
        descripcion: 'Irritación del tracto respiratorio superior y riesgo de fiebre por humos de soldadura de metales galvanizados/pesados.',
      },
    ],
    controles: {
      fuente: {
        status: 'INEXISTENTE',
        description: 'Ninguno. No se cuenta con brazos de extracción localizada de humos ni mesas de aspiración perimetral para humos de corte.',
      },
      medio: {
        status: 'INSUFICIENTE',
        description: 'Una sola mampara móvil deteriorada con lona perforada que no ofrece confinamiento perimetral hacia los pasillos de tránsito de otros trabajadores.',
      },
      individuo: {
        status: 'CRÍTICO',
        description: 'Gafas transparentes básicas de policarbonato estándar (no aptas para arco eléctrico). Carentes de guantes largos térmicos y pecheras de descarne.',
      },
    },
    evaluacion: calculateGTC45(5, 4), // NP 5 x NC 4 = 20 (Nivel I Crítico)
    planIntervencion: {
      administrativa: {
        titulo: 'Suspensión Temporal de Operación de Soldadura',
        estado: 'En curso',
        descripcion: 'Detención preventiva del corte y electro-unión en el patio 2 hasta la recepción, prueba de ajuste y entrega formal documentada de los kits de protección visual y térmica certificados.',
      },
      epp: {
        titulo: 'Dotación Técnica Especificada',
        prioridad: 'Prioridad Alta',
        items: [
          { id: 'epp-1', text: '3 Caretas electrónicas fotosensibles regulables (DIN 9 a 13, ANSI Z87.1 / CE)', checked: true },
          { id: 'epp-2', text: '4 Pares de guantes soldador carnaza vacuno curtida al cromo de 16" con costuras de Kevlar', checked: true },
          { id: 'epp-3', text: '4 Mandiles (delantales) de carnaza gruesa y 4 juegos de polainas protectoras de empeine', checked: false },
        ],
      },
      ingenieria: {
        titulo: 'Aislamiento Perimetral & Extracción',
        fase: 'Fase 2',
        descripcion: 'Adquisición de biombos / mamparas con cortinas vinílicas retardantes de llama certificadas (color ámbar translúcido con filtro UV) para blindar el corredor principal y evaluación de campana extractora móvil.',
      },
      responsable: 'Ing. Carlos Méndez (Especialista SST)',
      plazoLegal: '48 Horas (26/10/2025 - 18:00)',
    },
    evidenciaFotos: [
      {
        url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        caption: 'Operario en banco de armado con visor no calibrado y sin guante largo',
      },
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        caption: 'Careta de vidrio fijo fisurada hallada en puesto de trabajo',
      },
    ],
    estadoEntregaEPP: 'PENDIENTE',
    fechaInspeccion: '24/OCT/2025',
  },
  {
    id: 'PEL-2024-002',
    code: 'GTC45-TLA-2024-10',
    title: 'Red eléctrica 220V expuesta a humedad y cables sueltos sin canalizar',
    subtitle: 'Riesgo inminente de electrocución de alto voltaje, choque de arco eléctrico e incendio por conductores desprotegidos expuestos a condensación en muro norte.',
    macroproceso: 'OPERATIVO / PRODUCCIÓN TÉCNICA AUTOMOTRIZ',
    proceso: 'Operativo',
    zonaLugar: 'Bodega de Insumos • Muro Norte - Depósito Central',
    actividadEspecifica: 'Almacenamiento y logística interna de repuestos, lubricantes y baterías pesadas',
    rutinaria: true,
    operariosExpuestos: 3,
    tipoPeligroGeneral: 'Condiciones de Seguridad',
    factorEspecifico: 'Eléctrico (Riesgo de arco y choque directo)',
    descripcionDetallada: 'Tablero de distribución y alimentador principal de 220V con borneras descubiertas sin cerramiento estanco, ubicado debajo de ducto de condensación con goteo esporádico. Conductores calibre 10 con empalmes en cinta aislante suelta a ras de suelo.',
    efectosSalud: 'Electrocución de alto voltaje, fibrilación ventricular, paro cardiorrespiratorio, quemaduras profundas y conflagración estructural.',
    patologiasPrevistas: [
      {
        titulo: 'Fibrilación ventricular y paro cardíaco',
        descripcion: 'Contacto accidental directo con fase viva de 220V bajo condiciones de piso con humedad.',
      },
      {
        titulo: 'Quemaduras por arco eléctrico (Flash)',
        descripcion: 'Fogonazo por cortocircuito al manipular piezas metálicas cerca de terminales desnudas.',
      },
    ],
    controles: {
      fuente: {
        status: 'INEXISTENTE',
        description: 'Caja de breakers genérica sin tapa frontal ni certificación RETIE visible.',
      },
      medio: {
        status: 'INEXISTENTE',
        description: 'Ninguno. No hay canaleta metálica ni señalización de advertencia de alto voltaje.',
      },
      individuo: {
        status: 'INSUFICIENTE',
        description: 'Calzado de seguridad dieléctrico estándar. Guantes de electricista ausentes.',
      },
    },
    evaluacion: calculateGTC45(4, 4), // NP 4 x NC 4 = 16 (Nivel I Crítico)
    planIntervencion: {
      administrativa: {
        titulo: 'Desenergización Parcial y Señalización RETIE',
        estado: 'En curso',
        descripcion: 'Bloqueo temporal de derivaciones no esenciales y demarcación con cinta perimetral de peligro eléctrico.',
      },
      epp: {
        titulo: 'Guantes Dieléctricos Clase 0',
        prioridad: 'Prioridad Alta',
        items: [
          { id: 'epp-4', text: 'Guantes dieléctricos Clase 0 (1000V) con sobreguantes de cuero', checked: false },
          { id: 'epp-5', text: 'Calzado dieléctrico certificado ASTM F2413', checked: true },
        ],
      },
      ingenieria: {
        titulo: 'Adecuación de Tablero y Canalización NEMA 4X',
        fase: 'Fase 1',
        descripcion: 'Instalación de gabinete estanco NEMA 4X y canalización rígida de conductores.',
      },
      responsable: 'Ing. Carlos Méndez / Técnico Electricista Matriculado',
      plazoLegal: '72 Horas (27/10/2025)',
    },
    evidenciaFotos: [
      {
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        caption: 'Caja eléctrica sin tapa protectora y cables sin canaleta',
      },
    ],
    estadoEntregaEPP: 'PENDIENTE',
    fechaInspeccion: '24/OCT/2025',
  },
  {
    id: 'PEL-2024-003',
    code: 'GTC45-TLA-2024-11',
    title: 'Piso liso con acumulación de grasa y derrames continuos de agua',
    subtitle: 'Peligro locativo por superficie resbaladiza durante el lavado de menaje y preparación de alimentos.',
    macroproceso: 'BIENESTAR / SERVICIOS • SEDE OPERATIVA',
    proceso: 'Bienestar / Servicios',
    zonaLugar: 'Cocina y Comedor • Área de Servicios Generales',
    actividadEspecifica: 'Lavado de menaje y preparación de café/alimentos para el personal',
    rutinaria: true,
    operariosExpuestos: 2,
    tipoPeligroGeneral: 'Condiciones de Seguridad / Locativo',
    factorEspecifico: 'Caídas a mismo nivel (Superficie resbaladiza)',
    descripcionDetallada: 'Piso cerámico liso sin acabado antideslizante en zona húmeda de poceta, con acumulación de residuos jabonosos y grasa proveniente del lavado de utensilios. Falta de rejilla perimetral de desagüe rápido.',
    efectosSalud: 'Traumatismos en extremidades, fracturas de muñeca/cadera, esguinces de tobillo y contusiones graves por impacto.',
    patologiasPrevistas: [
      {
        titulo: 'Traumatismo craneoencefálico leve/moderado',
        descripcion: 'Caída de espaldas por resbalón inesperado contra el borde de mesón de concreto.',
      },
      {
        titulo: 'Esguince y fractura de radio distal',
        descripcion: 'Apoyo brusco de mano al perder adherencia en el suelo mojado.',
      },
    ],
    controles: {
      fuente: {
        status: 'INSUFICIENTE',
        description: 'Piso cerámico convencional genérico sin rugosidad ni tratamiento antideslizante.',
      },
      medio: {
        status: 'INSUFICIENTE',
        description: 'Trapeado manual esporádico dos veces al día sin delimitación de suelo mojado.',
      },
      individuo: {
        status: 'INSUFICIENTE',
        description: 'Calzado deportivo personal sin suela antideslizante certificada para cocinas.',
      },
    },
    evaluacion: calculateGTC45(3, 2), // NP 3 x NC 2 = 6 (Nivel II / III Mejorable)
    planIntervencion: {
      administrativa: {
        titulo: 'Protocolo de Limpieza Inmediata y Señalización',
        estado: 'Implementado',
        descripcion: 'Disposición de conos amarillos de advertencia "Piso Mojado" y desengrasante biodegradable.',
      },
      epp: {
        titulo: 'Calzado Antideslizante Ocupacional',
        prioridad: 'Media',
        items: [
          { id: 'epp-6', text: 'Zuecos ocupacionales impermeables con suela antideslizante SRC', checked: true },
        ],
      },
      ingenieria: {
        titulo: 'Recubrimiento Epóxico Antideslizante',
        fase: 'Fase 3',
        descripcion: 'Aplicación de resina epóxica con grano de cuarzo en el perímetro de la poceta.',
      },
      responsable: 'Ing. Carlos Méndez',
      plazoLegal: '15 Días hábiles',
    },
    evidenciaFotos: [
      {
        url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        caption: 'Piso cerámico mojado cerca de la zona de preparación',
      },
    ],
    estadoEntregaEPP: 'FIRMADA',
    fechaInspeccion: '24/OCT/2025',
  },
];
