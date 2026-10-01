// Catálogo de implementos, herramientas y EPP específicos para capacitaciones y entrenamientos SST

export interface ImplementoCapacitacion {
  id: string;
  nombre: string;
  categoria: 'EPP_ESPECIFICO' | 'HERRAMIENTAS_SEGURIDAD' | 'EMERGENCIAS_CONTROL' | 'MATERIAL_DIDACTICO';
  descripcion: string;
  normaReferencia?: string;
}

export const CATALOGO_IMPLEMENTOS: ImplementoCapacitacion[] = [
  // 1. Guantes específicos claramente diferenciados entre sí
  {
    id: 'imp-guantes-nitrilo',
    nombre: 'Guantes de nitrilo para manipulación química y disolventes',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Calibre 15 mils, verde, acabado rugoso antiderrapante. Alta resistencia química a disolventes, hidrocarburos, aceites y refrigerantes.',
    normaReferencia: 'EN 374-1 / ANSI 105',
  },
  {
    id: 'imp-guantes-poda',
    nombre: 'Guantes de poda y carnaza reforzada de descarne',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Largo 16 pulgadas con manga extendida, cuero vacuno descarne, costuras en hilo kevlar. Protección alta contra espinas, abrasión y desgarro.',
    normaReferencia: 'EN 388 (4.2.4.3)',
  },
  {
    id: 'imp-guantes-dielectricos',
    nombre: 'Guantes dieléctricos Clase 0 (1.000V) con sobreguantes de vaqueta',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Caucho natural vulcanizado para aislamiento eléctrico hasta 1.000 V AC, acompañado de sobreguante de cuero flor para protección mecánica.',
    normaReferencia: 'ASTM D120 / IEC 60903',
  },
  {
    id: 'imp-guantes-anticorte',
    nombre: 'Guantes anticorte nivel F de fibra Dyneema/Kevlar con acero',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Tejido de punto calibre 13 con filamentos de acero inoxidable para manipulación de láminas de latonería y discos con rebabas vivas.',
    normaReferencia: 'ISO 13997 Nivel F / EN 388',
  },
  {
    id: 'imp-guantes-soldadura',
    nombre: 'Guantes de vaqueta y carnaza para soldador MIG/TIG',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Forro térmico ignífugo, pulgar en ala ergonómico para gatilleo suave y costuras reforzadas resistentes a chispas y calor radiante hasta 250°C.',
    normaReferencia: 'EN 12477 Tipo A',
  },

  // 2. Protección Visual y Facial
  {
    id: 'imp-careta-esmerilar',
    nombre: 'Careta facial de policarbonato alto impacto para esmerilado',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Pantalla curva transparente de 2 mm con barboquejo y casquete ajustable contra esquirlas incandescentes de amoladora angular.',
    normaReferencia: 'ANSI Z87.1 High Impact',
  },
  {
    id: 'imp-careta-fotosensible',
    nombre: 'Careta fotosensible electrónica para soldadura arco DIN 9-13',
    categoria: 'EPP_ESPECIFICO',
    descripcion: '4 sensores de arco independientes, oscurecimiento en 1/25.000 seg, retardo ajustable para procesos SMAW y GMAW.',
    normaReferencia: 'ANSI Z87.1+ / EN 379',
  },
  {
    id: 'imp-gafas-seguridad-uv',
    nombre: 'Gafas de seguridad panorámicas con filtro UV 400 y antiempañante',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Monolente de policarbonato con tratamiento anti-rayaduras y ventilación indirecta contra salpicaduras de líquidos y polvo fino.',
    normaReferencia: 'ANSI Z87.1 / EN 166',
  },

  // 3. Protección Respiratoria y Auditiva
  {
    id: 'imp-respirador-vapores',
    nombre: 'Respirador de media cara con cartuchos para vapores orgánicos',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Pieza facial de elastómero de silicona con doble cartucho 6001 y retenedor con prefiltro para cabina de pintura automotriz.',
    normaReferencia: 'NIOSH OV / P95',
  },
  {
    id: 'imp-mascarilla-n95',
    nombre: 'Mascarilla N95 con válvula de exhalación para humos metálicos',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Filtro electrostático para humos de soldadura y material particulado de lijado y masillado automotriz.',
    normaReferencia: 'NIOSH N95',
  },
  {
    id: 'imp-protector-copa',
    nombre: 'Protector auditivo tipo copa de alta atenuación (NRR 27 dB)',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Almohadillas rellenas de espuma suave y líquido dieléctrico para zona de banco de motores y dinamómetro.',
    normaReferencia: 'ANSI S3.19',
  },

  // 4. Trabajo Seguro en Alturas y Cargas
  {
    id: 'imp-arnes-cuerpo-entero',
    nombre: 'Arnés de cuerpo entero dieléctrico de 4 argollas en H',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Reata de poliéster de 45 mm con herrajes recubiertos de nylon aislante para trabajos en fosa y elevadores hidráulicos.',
    normaReferencia: 'ANSI Z359.11 / NTC 2037',
  },
  {
    id: 'imp-eslinga-absorbedor',
    nombre: 'Eslinga en Y con absorbedor de impacto y ganchos de 2 1/4 pulg.',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Doble terminal para 100% de anclaje continuo, reduce la fuerza de impacto a menos de 4 kN.',
    normaReferencia: 'ANSI Z359.13',
  },
  {
    id: 'imp-cinturon-ergonomico',
    nombre: 'Cinturón biomecánico con tirantes para manipulación de cargas',
    categoria: 'EPP_ESPECIFICO',
    descripcion: 'Faja elástica ventilada con varillas flexibles para entrenamiento postural de levantamiento de cajas de cambio y culatas.',
    normaReferencia: 'Protocolo Biomecánico SG-SST',
  },

  // 5. Control de Emergencias y Seguridad Operativa
  {
    id: 'imp-extintor-solkaflam',
    nombre: 'Extintor multipropósito ABC de 10 lbs para prácticas de fuego',
    categoria: 'EMERGENCIAS_CONTROL',
    descripcion: 'Polvo químico seco presurizado con manómetro y manguera para simulacros de amago de incendio en taller.',
    normaReferencia: 'NFPA 10 / NTC 2885',
  },
  {
    id: 'imp-kit-derrames-20gal',
    nombre: 'Kit de control de derrames de hidrocarburos de 20 galones',
    categoria: 'EMERGENCIAS_CONTROL',
    descripcion: 'Contiene 25 paños oleofílicos, 4 cordones absorbentes, masilla epóxica y bolsas de disposición de residuos peligrosos.',
    normaReferencia: 'Decreto 1076 / EPA',
  },
  {
    id: 'imp-kit-loto',
    nombre: 'Kit de bloqueo y etiquetado LOTO con candados y tarjetas',
    categoria: 'HERRAMIENTAS_SEGURIDAD',
    descripcion: 'Candados dieléctricos de cuerpo rojo, pinzas de bloqueo múltiple de 6 orificios y tarjetas de peligro "No Operar".',
    normaReferencia: 'OSHA 1910.147',
  },
  {
    id: 'imp-camilla-espinal',
    nombre: 'Camilla rígida espinal con inmovilizador de cabeza y correas araña',
    categoria: 'EMERGENCIAS_CONTROL',
    descripcion: 'Fabricada en polietileno translúcido a rayos X con capacidad de 180 kg para brigada de rescate en fosa.',
    normaReferencia: 'Res. 0705 de 2007',
  },
  {
    id: 'imp-botiquin-tipo-a',
    nombre: 'Botiquín industrial de primeros auxilios Tipo A reglamentario',
    categoria: 'EMERGENCIAS_CONTROL',
    descripcion: 'Dotación reglamentaria con gasas estériles, vendas elásticas, solución salina, tijeras de trauma y microporo.',
    normaReferencia: 'Res. 0705 de 2007 MinSalud',
  },
  {
    id: 'imp-conos-viales',
    nombre: 'Conos reflectivos de señalización vial 70 cm con base pesada',
    categoria: 'HERRAMIENTAS_SEGURIDAD',
    descripcion: 'PVC flexible con doble franja reflectiva de alta intensidad para demarcación de zonas de mantenimiento de vehículos pesados.',
    normaReferencia: 'Manual Señalización Vial MinTransporte',
  },
];
