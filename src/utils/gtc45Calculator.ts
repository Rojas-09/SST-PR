import { HazardEvaluation, RiskLevel } from '../types';

export const NP_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: 'BAJA', desc: 'Nivel 1: Baja (Rara vez)' },
  2: { label: 'MEDIA', desc: 'Nivel 2: Media (Ocasional)' },
  3: { label: 'MODER.', desc: 'Nivel 3: Moderada (Periódica)' },
  4: { label: 'ALTA', desc: 'Nivel 4: Alta (Frecuente)' },
  5: { label: 'CONTINUA', desc: 'Nivel 5: Continua (Muy Alta)' },
};

export const NC_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: 'LEVE', desc: 'Nivel 1: Leve (Primeros auxilios)' },
  2: { label: 'MENOR', desc: 'Nivel 2: Menor (Incapacidad temporal)' },
  3: { label: 'MODER.', desc: 'Nivel 3: Moderada (Incapacidad permanente parcial leve)' },
  4: { label: 'GRAVE', desc: 'Nivel 4: Grave (Incapacidad parcial severa)' },
  5: { label: 'MORTAL', desc: 'Nivel 5: Mortal / Catastrófico' },
};

export function calculateGTC45(np: number, nc: number): HazardEvaluation {
  const nr = np * nc;
  let level: RiskLevel = 'NIVEL_IV';
  let levelText = 'NIVEL IV — ACEPTABLE';
  let aceptabilidad = 'ACEPTABLE';
  let normativaText = 'Mantener las medidas de control existentes. Se deben considerar soluciones o mejoras de bajo costo y comprobaciones periódicas para asegurar la eficacia de los controles.';

  if (nr >= 16) {
    level = 'NIVEL_I';
    levelText = 'NIVEL I — CRÍTICO';
    aceptabilidad = 'NO ACEPTABLE (PARO INMEDIATO)';
    normativaText = 'Suspender inmediatamente o no iniciar la actividad hasta que se adopten medidas eficaces de control en la fuente. Plazo de intervención: 24 horas.';
  } else if (nr >= 9) {
    level = 'NIVEL_II';
    levelText = 'NIVEL II — ALTO';
    aceptabilidad = 'NO ACEPTABLE (CONTROL ESPECÍFICO)';
    normativaText = 'Corregir y adoptar medidas de control específicas de forma prioritaria. Plazo perentorio de intervención no mayor a 5 días hábiles.';
  } else if (nr >= 4) {
    level = 'NIVEL_III';
    levelText = 'NIVEL III — MEJORABLE';
    aceptabilidad = 'MEJORABLE';
    normativaText = 'Mejorar si es posible. Sería conveniente justificar la intervención y su rentabilidad mediante controles preventivos programados.';
  }

  return {
    np,
    nc,
    nr,
    level,
    levelText,
    aceptabilidad,
    normativaText,
  };
}

export function getRiskBadgeClasses(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
} {
  switch (level) {
    case 'NIVEL_I':
      return {
        bg: 'bg-[#DC2626]',
        text: 'text-white',
        border: 'border-[#DC2626]',
        badgeBg: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30',
      };
    case 'NIVEL_II':
      return {
        bg: 'bg-[#EA580C]',
        text: 'text-white',
        border: 'border-[#EA580C]',
        badgeBg: 'bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/30',
      };
    case 'NIVEL_III':
      return {
        bg: 'bg-[#CA8A04]',
        text: 'text-white',
        border: 'border-[#CA8A04]',
        badgeBg: 'bg-[#CA8A04]/10 text-[#CA8A04] border-[#CA8A04]/30',
      };
    case 'NIVEL_IV':
      return {
        bg: 'bg-[#16A34A]',
        text: 'text-white',
        border: 'border-[#16A34A]',
        badgeBg: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30',
      };
  }
}
