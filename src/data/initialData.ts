import { CompanyInfo, HazardRecord, CapacitacionRecord, IncapacidadRecord } from '../types';
import {
  tallerLosAndesCompany,
  tallerLosAndesHazards,
  tallerLosAndesIncapacidades,
  tallerLosAndesCapacitaciones,
  tallerLosAndesEmployees,
} from './companiesData';

export const initialCompany: CompanyInfo = tallerLosAndesCompany;
export const initialHazards: HazardRecord[] = tallerLosAndesHazards;
export const initialIncapacidades: IncapacidadRecord[] = tallerLosAndesIncapacidades;
export const initialCapacitaciones: CapacitacionRecord[] = tallerLosAndesCapacitaciones;
export const workshopEmployees = tallerLosAndesEmployees;

export const commonCIE10Codes = [
  { code: 'M54.5', desc: 'Lumbago no especificado (Esfuerzo mecánico de carga)' },
  { code: 'S61.0', desc: 'Herida de dedo(s) de la mano sin daño de uña' },
  { code: 'H10.1', desc: 'Conjuntivitis atópica aguda / queratoconjuntivitis por arco' },
  { code: 'T20.0', desc: 'Quemadura de muñeca y mano, grado no especificado' },
  { code: 'S93.4', desc: 'Esguince y desgarro del tobillo' },
  { code: 'J00', desc: 'Rinofaringitis aguda (Resfriado común)' },
  { code: 'G43.9', desc: 'Migraña, no especificada' },
];
