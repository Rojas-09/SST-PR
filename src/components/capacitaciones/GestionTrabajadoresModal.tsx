import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  X,
  AlertTriangle,
  Briefcase,
  BadgeCheck,
  Plus,
} from 'lucide-react';
import { CompanyInfo } from '../../types';
import { workersStorage, WorkerRecord } from '../../services/workersStorage';
import { useAuthRole } from '../../context/AuthRoleContext';

interface GestionTrabajadoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyInfo;
  onWorkersChanged?: () => void;
  onOpenBlankSheet?: (blankRows?: number) => void;
}

export function GestionTrabajadoresModal({
  isOpen,
  onClose,
  company,
  onWorkersChanged,
  onOpenBlankSheet,
}: GestionTrabajadoresModalProps) {
  const { currentUser } = useAuthRole();
  const canManage = currentUser.rol === 'ADMINISTRADOR' || currentUser.rol === 'RESPONSABLE_SST';

  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [customBlankRows, setCustomBlankRows] = useState(10);

  // Form state
  const [formNombre, setFormNombre] = useState('');
  const [formCedula, setFormCedula] = useState('');
  const [formCargo, setFormCargo] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formEPS, setFormEPS] = useState('SURA EPS');
  const [formARL, setFormARL] = useState(company.arl || 'Positiva');
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadWorkers();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, company.id]);

  const loadWorkers = () => {
    const list = workersStorage.getWorkers(company.id);
    setWorkers(list);
  };

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsEditing(null);
    setFormNombre('');
    setFormCedula('');
    setFormCargo('');
    setFormArea(company.id === 'servic-crear' ? 'Mantenimiento y Piscinas' : 'Taller Mecánico y Carrocería');
    setFormEPS('SURA EPS');
    setFormARL(company.arl || (company.id === 'servic-crear' ? 'Seguros SURA' : 'Positiva'));
    setIsCreating(true);
  };

  const handleStartEdit = (w: WorkerRecord) => {
    setIsCreating(false);
    setIsEditing(w.id);
    setFormNombre(w.nombre);
    setFormCedula(w.cedula);
    setFormCargo(w.cargo);
    setFormArea(w.area || '');
    setFormEPS(w.eps || 'SURA EPS');
    setFormARL(w.arl || company.arl || 'Positiva');
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formCedula.trim() || !formCargo.trim()) {
      setFormFeedback('Por favor diligencie todos los campos requeridos (*)');
      return;
    }

    if (isEditing) {
      workersStorage.updateWorker(company.id, isEditing, {
        nombre: formNombre.trim(),
        cedula: formCedula.trim(),
        cargo: formCargo.trim(),
        area: formArea.trim(),
        eps: formEPS.trim(),
        arl: formARL.trim(),
      });
      setFormFeedback('Trabajador actualizado exitosamente');
    } else {
      workersStorage.createWorker(company.id, {
        nombre: formNombre.trim(),
        cedula: formCedula.trim(),
        cargo: formCargo.trim(),
        area: formArea.trim(),
        eps: formEPS.trim(),
        arl: formARL.trim(),
        estado: 'ACTIVO',
      });
      setFormFeedback('Trabajador registrado en la nómina SST exitosamente');
    }

    loadWorkers();
    setIsCreating(false);
    setIsEditing(null);
    if (onWorkersChanged) onWorkersChanged();

    setTimeout(() => setFormFeedback(null), 3000);
  };

  const handleDeleteWorker = (id: string, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar a "${nombre}" de la nómina de trabajadores del SG-SST?`)) {
      workersStorage.deleteWorker(company.id, id);
      loadWorkers();
      if (onWorkersChanged) onWorkersChanged();
    }
  };

  const filteredWorkers = workers.filter((w) => {
    const q = searchQuery.toLowerCase();
    return (
      w.nombre.toLowerCase().includes(q) ||
      w.cedula.toLowerCase().includes(q) ||
      w.cargo.toLowerCase().includes(q) ||
      (w.area && w.area.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">
                Gestión de Trabajadores y Nómina SG-SST
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                Empresa activa: {company.name} • Rol autorizado: Responsable SST / Administrador
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors text-lg font-bold cursor-pointer"
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body - Single unified fluid scroll container */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4">
          {/* Quick Choice Banner: Digital vs Blank Paper with Fields Selector */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Modalidad de Planillas y Nómina
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {currentUser.rol === 'ADMINISTRADOR'
                    ? 'Rol: Administrador (Gerencia)'
                    : currentUser.rol === 'RESPONSABLE_SST'
                    ? 'Rol: Responsable SG-SST'
                    : 'Modo Consulta (Solo Lectura)'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Gestiona con CRUD a los trabajadores vinculados al SG-SST <strong>o genera la planilla física con campos en blanco</strong> para que firmen con esfero a mano en campo.
              </p>
            </div>

            {onOpenBlankSheet && (
              <div className="flex items-center gap-2 shrink-0 bg-white p-1.5 rounded-xl border border-blue-200">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">Campos:</span>
                  {[5, 10, 15].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCustomBlankRows(n)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                        customBlankRows === n ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBlankSheet(customBlankRows);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Imprimir {customBlankRows} Vacíos</span>
                </button>
              </div>
            )}
          </div>

          {/* Feedback Alert */}
          {formFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{formFeedback}</span>
            </div>
          )}

          {/* Create or Edit Form Box */}
          {(isCreating || isEditing) && (
            <form onSubmit={handleSaveWorker} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>{isEditing ? 'Editar Trabajador' : 'Registrar Nuevo Trabajador'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Ej: Pedro Antonio Pérez"
                    className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cédula de Ciudadanía *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCedula}
                    onChange={(e) => setFormCedula(e.target.value)}
                    placeholder="Ej: 80.123.456"
                    className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cargo / Ocupación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCargo}
                    onChange={(e) => setFormCargo(e.target.value)}
                    placeholder="Ej: Soldador MIG / Operario de Patio"
                    className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Área o Proceso Asignado
                  </label>
                  <input
                    type="text"
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    placeholder="Ej: Taller Mecánico • Zona 2"
                    className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    EPS
                  </label>
                  <input
                    type="text"
                    value={formEPS}
                    onChange={(e) => setFormEPS(e.target.value)}
                    placeholder="Ej: SURA EPS, Sanitas, Nueva EPS"
                    className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ARL
                  </label>
                  <input
                    type="text"
                    value={formARL}
                    onChange={(e) => setFormARL(e.target.value)}
                    placeholder="Ej: Positiva, Seguros SURA, Colmena"
                    className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {isEditing ? 'Guardar Cambios' : 'Registrar Trabajador'}
                </button>
              </div>
            </form>
          )}

          {/* Controls Bar: Search & + Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, cédula o cargo..."
                className="w-full text-xs sm:text-sm py-2 pl-9 pr-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none"
              />
            </div>

            {!isCreating && !isEditing && (
              <button
                type="button"
                onClick={handleStartCreate}
                disabled={!canManage}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 ${
                  canManage
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title={canManage ? 'Añadir nuevo trabajador a nómina' : 'Permiso exclusivo para Administrador y Responsable SST'}
              >
                <Plus className="w-4 h-4" />
                <span>+ Añadir Trabajador</span>
              </button>
            )}
          </div>

          {/* Workers List / Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Trabajadores Registrados ({filteredWorkers.length})</span>
              <span className="font-normal text-slate-500 text-[11px]">
                {company.name} ({company.claseRiesgo})
              </span>
            </div>

            {filteredWorkers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs sm:text-sm italic space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300" />
                <p>No se encontraron trabajadores en este registro.</p>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs cursor-pointer mt-2"
                >
                  Registrar primer trabajador
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredWorkers.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-xs sm:text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {w.nombre}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          {w.cedula}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span className="font-medium text-slate-700">{w.cargo}</span>
                        {w.area && (
                          <>
                            <span>•</span>
                            <span className="truncate">{w.area}</span>
                          </>
                        )}
                        {w.eps && (
                          <>
                            <span>•</span>
                            <span className="text-[11px] text-slate-400 font-mono">{w.eps}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(w)}
                          className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors"
                          title="Editar trabajador"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorker(w.id, w.nombre)}
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
                          title="Eliminar trabajador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Total activos: <strong>{workers.length}</strong> operarios
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors text-center"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
