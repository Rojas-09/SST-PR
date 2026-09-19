import { useState, FormEvent } from 'react';
import { X, Building2, Save, Check } from 'lucide-react';
import { CompanyInfo } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyInfo;
  onUpdateCompany: (company: CompanyInfo) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  company,
  onUpdateCompany,
}: SettingsModalProps) {
  const [formData, setFormData] = useState<CompanyInfo>(company);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateCompany(formData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900">Configuración de la Empresa</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Razón Social de la Organización
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                NIT
              </label>
              <input
                type="text"
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400 text-xs font-mono-data"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Clase de Riesgo ARL
              </label>
              <select
                value={formData.claseRiesgo}
                onChange={(e) => setFormData({ ...formData, claseRiesgo: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400 text-xs"
              >
                <option value="RIESGO CLASE I">Riesgo Clase I</option>
                <option value="RIESGO CLASE II">Riesgo Clase II</option>
                <option value="RIESGO CLASE III">Riesgo Clase III</option>
                <option value="RIESGO CLASE IV">Riesgo Clase IV</option>
                <option value="RIESGO CLASE V">Riesgo Clase V</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Actividad Económica CIIU
            </label>
            <input
              type="text"
              value={formData.ciiu}
              onChange={(e) => setFormData({ ...formData, ciiu: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400 text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Sede Operativa Principal
            </label>
            <input
              type="text"
              value={formData.sede}
              onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400 text-xs"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#1464CC] text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Guardado</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
