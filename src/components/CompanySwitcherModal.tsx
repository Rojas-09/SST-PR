import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Smartphone,
  Globe,
  Award,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Calendar,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { CompanyInfo } from '../types';
import { AVAILABLE_COMPANIES } from '../data/companiesData';
import { useAuthRole } from '../context/AuthRoleContext';

interface CompanySwitcherModalProps {
  currentCompany: CompanyInfo;
  isOpen: boolean;
  onClose: () => void;
  onSwitchCompany: (companyId: string) => void;
}

export function CompanySwitcherModal({
  currentCompany,
  isOpen,
  onClose,
  onSwitchCompany,
}: CompanySwitcherModalProps) {
  const { currentUser, switchRole } = useAuthRole();
  const [activeTab, setActiveTab] = useState<'SELECCION' | 'DATOS_SERVIC' | 'SERVICIOS_SERVIC'>('SELECCION');

  if (!isOpen) return null;

  const isSSTLeader = currentUser.rol === 'RESPONSABLE_SST';

  // Servic Crear specific company data
  const servicCrear = AVAILABLE_COMPANIES.find((c) => c.id === 'servic-crear') || AVAILABLE_COMPANIES[1];
  const tallerLosAndes = AVAILABLE_COMPANIES.find((c) => c.id === 'taller-los-andes') || AVAILABLE_COMPANIES[0];

  const handleSelect = (companyId: string) => {
    if (!isSSTLeader) return;
    onSwitchCompany(companyId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 font-sans text-[13px]">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Selector Multi-Empresa SG-SST
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Resolución 0312 / Decreto 1072
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Gestión centralizada de matrices GTC 45, capacitaciones y ausentismo por empresa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RBAC Security Bar */}
        <div
          className={`px-5 py-3 border-b text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
            isSSTLeader
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isSSTLeader ? (
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Unlock className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>{isSSTLeader ? 'Control Exclusivo Habilitado:' : 'Acceso Restringido:'}</span>
                <span className="font-semibold underline">
                  {isSSTLeader
                    ? 'Líder de SG-SST (Responsable del Sistema)'
                    : 'Solo el Líder de SG-SST puede alternar empresas'}
                </span>
              </div>
              <p className="text-[11.5px] opacity-90 mt-0.5">
                {isSSTLeader
                  ? `Usuario actual: ${currentUser.nombre} (${currentUser.cargo}) • Licencia verificada.`
                  : `Actualmente en rol: ${currentUser.rol}. Para alternar la empresa activa, asume el rol de Líder de SG-SST.`}
              </p>
            </div>
          </div>

          {!isSSTLeader && (
            <button
              type="button"
              onClick={() => switchRole('RESPONSABLE_SST')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Asumir Rol Líder SG-SST</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('SELECCION')}
            className={`pb-2.5 px-3 font-semibold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SELECCION'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Alternar Entre Empresas (2)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DATOS_SERVIC')}
            className={`pb-2.5 px-3 font-semibold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DATOS_SERVIC'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Datos Generales (servic_crear_general)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SERVICIOS_SERVIC')}
            className={`pb-2.5 px-3 font-semibold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SERVICIOS_SERVIC'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Catálogo de Servicios (servic_crear_servicios)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {activeTab === 'SELECCION' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Taller Los Andes Card */}
                <div
                  className={`bg-white rounded-2xl border-2 p-5 transition-all flex flex-col justify-between relative shadow-xs ${
                    currentCompany.id === 'taller-los-andes'
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {currentCompany.id === 'taller-los-andes' && (
                    <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      Activa Ahora
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                        TLA
                      </div>
                      <div className="min-w-0 pr-16">
                        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                          Empresa 1 • Talleres Mecánicos
                        </span>
                        <h4 className="font-bold text-slate-900 text-base leading-tight">
                          {tallerLosAndes.name}
                        </h4>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          NIT {tallerLosAndes.nit}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{tallerLosAndes.sede}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Clase IV • 8 Trabajadores • CIIU 4520</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">Líder SST: {tallerLosAndes.responsableSST.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Vigencia Operativa: 2026 • Proyecciones lejanas: 2027</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11.5px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800">Servicios Clave:</div>
                      <div>• Mantenimiento y Reparación de Flotas Automotrices</div>
                      <div>• Soldadura Estructural y Fabricación de Chasises</div>
                      <div>• Latonería, Corte y Pintura Electrostática</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={currentCompany.id === 'taller-los-andes' || !isSSTLeader}
                      onClick={() => handleSelect('taller-los-andes')}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        currentCompany.id === 'taller-los-andes'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isSSTLeader
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>
                        {currentCompany.id === 'taller-los-andes'
                          ? 'Empresa Seleccionada'
                          : isSSTLeader
                          ? 'Seleccionar Taller Los Andes'
                          : 'Solo Líder SG-SST'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. SERVIC CREAR S.A.S. Card */}
                <div
                  className={`bg-white rounded-2xl border-2 p-5 transition-all flex flex-col justify-between relative shadow-xs ${
                    currentCompany.id === 'servic-crear'
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {currentCompany.id === 'servic-crear' && (
                    <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Activa Ahora
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                        SC
                      </div>
                      <div className="min-w-0 pr-16">
                        <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                          Empresa 2 • Servicios & Paisajismo STIHL
                        </span>
                        <h4 className="font-bold text-slate-900 text-base leading-tight">
                          {servicCrear.name}
                        </h4>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          NIT {servicCrear.nit}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{servicCrear.sede}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Clase IV / III • 26 Trabajadores • CIIU 8121</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">Líder SST: {servicCrear.responsableSST.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Aliado: {servicCrear.aliadoTecnologico}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Vigencia Operativa: 2026 • Proyecciones lejanas: 2027</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/80 text-[11.5px] text-emerald-950 space-y-1">
                      <div className="font-bold text-emerald-900">Cobertura & Expansión:</div>
                      <div>• Cobertura: Tolima y Alto Magdalena (7 municipios)</div>
                      <div>• Proyección Expansión: Pereira, Risaralda</div>
                      <div>• Servicios: Tanques (Dec. 1575), Piscinas (Ley 554), Jardinería STIHL</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={currentCompany.id === 'servic-crear' || !isSSTLeader}
                      onClick={() => handleSelect('servic-crear')}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        currentCompany.id === 'servic-crear'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isSSTLeader
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>
                        {currentCompany.id === 'servic-crear'
                          ? 'Empresa Seleccionada'
                          : isSSTLeader
                          ? 'Seleccionar SERVIC CREAR S.A.S.'
                          : 'Solo Líder SG-SST'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Efecto del cambio de empresa:</div>
                  <p className="text-blue-800 leading-relaxed text-[12px]">
                    Al alternar la empresa, toda la aplicación se adapta de forma instantánea: la Matriz GTC 45, el
                    cronograma anual de capacitaciones (con fechas de 2026 y proyecciones lejanas para 2027), los
                    indicadores de ausentismo médico, las actas de entrega de EPP y la información institucional.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATOS GENERALES (servic_crear_general) */}
          {activeTab === 'DATOS_SERVIC' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      servic_crear_general
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      1. Datos Generales de la Empresa (SERVIC CREAR S.A.S.)
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">NIT 901306354-9</span>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-2.5 px-3 font-bold w-1/3">Campo</th>
                        <th className="py-2.5 px-3 font-bold w-2/3">Valor Registrado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Razon_Social</td>
                        <td className="py-2 px-3 font-bold text-slate-900">SERVIC CREAR S.A.S.</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">NIT</td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-700">901306354-9</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Sede_Principal</td>
                        <td className="py-2 px-3 text-slate-900">Ibagué, Tolima, Colombia</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Direccion_1</td>
                        <td className="py-2 px-3 text-slate-900">Carrera 6A N° 45-30, Barrio Villa Marlen 1</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Direccion_2</td>
                        <td className="py-2 px-3 text-slate-900">Carrera 7B N° 50-50</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Telefono_Fijo</td>
                        <td className="py-2 px-3 text-slate-900 font-mono">+57 (608) 2617679</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Celular_Contacto</td>
                        <td className="py-2 px-3 text-slate-900 font-mono font-bold">+57 316 6228165</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Correo_Contacto</td>
                        <td className="py-2 px-3 text-blue-600 font-medium hover:underline">
                          talentohumanoserviccrear@gmail.com
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Cobertura_Principal</td>
                        <td className="py-2 px-3 text-slate-900">
                          Tolima y Alto Magdalena (Ibagué, Espinal, Purificación, Melgar, Girardot, Flandes, Ricaurte)
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Proyeccion_Expansion</td>
                        <td className="py-2 px-3 font-bold text-emerald-700">Pereira, Risaralda</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Canal_Digital_1</td>
                        <td className="py-2 px-3 text-slate-900 flex items-center gap-1.5">
                          <span>Facebook Oficial</span>
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                            Página Corporativa
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-700">Aliado_Tecnologico</td>
                        <td className="py-2 px-3 font-bold text-amber-700">
                          STIHL Colombia (Maquinaria eco-eficiente a batería)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {currentCompany.id !== 'servic-crear' && isSSTLeader && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSelect('servic-crear')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Activar SERVIC CREAR S.A.S. en el Sistema</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATALOGO DE SERVICIOS (servic_crear_servicios) */}
          {activeTab === 'SERVICIOS_SERVIC' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      servic_crear_servicios
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      2. Catálogo Oficial de Servicios (SERVIC CREAR S.A.S.)
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">5 Líneas Certificadas</span>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-2.5 px-3 font-bold w-[12%]">ID_Servicio</th>
                        <th className="py-2.5 px-3 font-bold w-[22%]">Nombre_Servicio</th>
                        <th className="py-2.5 px-3 font-bold w-[36%]">Descripcion</th>
                        <th className="py-2.5 px-3 font-bold w-[15%]">Frecuencia_Sugerida</th>
                        <th className="py-2.5 px-3 font-bold w-[15%]">Normativa_Asociada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {servicCrear.servicios?.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{s.id}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{s.nombre}</td>
                          <td className="py-2.5 px-3 text-slate-600 leading-relaxed">{s.descripcion}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{s.frecuenciaSugerida}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                                s.normativaAsociada && s.normativaAsociada !== 'N/A'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200/80 font-semibold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {s.normativaAsociada || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Machinery & Technology Banner */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-3">
                <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-900">
                    Aliado Tecnológico Estratégico: STIHL Colombia
                  </div>
                  <p className="text-amber-800 leading-snug">
                    Operación con maquinaria eco-eficiente a batería (guadañadoras FSA 135, cortasetos HLA 86 y
                    podadoras telescópicas HTA 86). Cero emisiones de hidrocarburos, reducción drástica de ruido
                    (cumplimiento Res. 0312 / Res. 2400) y baja exposición a vibraciones.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Empresa activa en la sesión:</span>
            <span className="font-bold text-blue-700">{currentCompany.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors shadow-2xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
