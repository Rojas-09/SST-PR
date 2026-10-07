import { getCompanyDataset } from '../data/companiesData';

export interface WorkerRecord {
  id: string;
  nombre: string;
  cedula: string;
  cargo: string;
  area?: string;
  eps?: string;
  arl?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
  fechaIngreso?: string;
}

const getStorageKey = (companyId: string) => `sst_trabajadores_${companyId}_v2`;

export const workersStorage = {
  getWorkers(companyId: string = 'taller-los-andes'): WorkerRecord[] {
    const key = getStorageKey(companyId);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error al leer trabajadores de localStorage:', e);
    }

    // Seed from company dataset
    const dataset = getCompanyDataset(companyId);
    const initialWorkers: WorkerRecord[] = (dataset.employees || []).map((emp, idx) => ({
      id: emp.id || `emp-${idx + 1}`,
      nombre: emp.nombre,
      cedula: emp.cedula,
      cargo: emp.cargo,
      area: companyId === 'servic-crear' ? 'Mantenimiento y Piscinas' : 'Taller Mecánico y Carrocería',
      eps: emp.eps || 'SURA EPS',
      arl: emp.arl || (companyId === 'servic-crear' ? 'Seguros SURA' : 'Positiva Compañía de Seguros'),
      estado: 'ACTIVO',
    }));

    try {
      localStorage.setItem(key, JSON.stringify(initialWorkers));
    } catch (e) {
      console.error('Error al guardar trabajadores iniciales:', e);
    }

    return initialWorkers;
  },

  createWorker(companyId: string, data: Omit<WorkerRecord, 'id'>): WorkerRecord {
    const list = this.getWorkers(companyId);
    const newWorker: WorkerRecord = {
      ...data,
      id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      estado: data.estado || 'ACTIVO',
    };
    const updated = [newWorker, ...list];
    try {
      localStorage.setItem(getStorageKey(companyId), JSON.stringify(updated));
    } catch (e) {
      console.error('Error al guardar trabajador:', e);
    }
    return newWorker;
  },

  updateWorker(companyId: string, id: string, updates: Partial<WorkerRecord>): WorkerRecord | null {
    const list = this.getWorkers(companyId);
    const index = list.findIndex((w) => w.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    try {
      localStorage.setItem(getStorageKey(companyId), JSON.stringify(list));
    } catch (e) {
      console.error('Error al actualizar trabajador:', e);
    }
    return list[index];
  },

  deleteWorker(companyId: string, id: string): boolean {
    const list = this.getWorkers(companyId);
    const filtered = list.filter((w) => w.id !== id);
    try {
      localStorage.setItem(getStorageKey(companyId), JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Error al eliminar trabajador:', e);
      return false;
    }
  },
};
