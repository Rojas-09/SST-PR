import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Award,
  Sparkles,
  X,
  FileText,
  Calendar,
  Layers,
  Check,
  ArrowLeftRight,
  ShieldAlert,
  Users,
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
  const { currentUser } = useAuthRole();
  const isSSTLeader = currentUser.rol === 'RESPONSABLE_SST';

  // Si no es líder SST, solo puede ver Ficha Legal y Servicios de su empresa vinculada
  const [activeTab, setActiveTab] = useState<'SELECCION' | 'DATOS_LEGAL' | 'SERVICIOS'>(() => {
    return isSSTLeader ? 'SELECCION' : 'DATOS_LEGAL';
  });

  // Empresa inspeccionada en la pestaña de ficha legal / servicios:
  // Para el líder SST, permite alternar entre empresas para auditar; para miembros regulares, estrictamente su empresa
  const [inspectedCompanyId, setInspectedCompanyId] = useState<string>(currentCompany.id || 'servic-crear');

  if (!isOpen) return null;

  const targetCompanyId = isSSTLeader ? inspectedCompanyId : (currentCompany.id || 'servic-crear');
  const targetCompany = AVAILABLE_COMPANIES.find((c) => c.id === targetCompanyId) || currentCompany;

  // Servic Crear y Taller Los Andes para el líder SST
  const servicCrear = AVAILABLE_COMPANIES.find((c) => c.id === 'servic-crear') || AVAILABLE_COMPANIES[1];
  const tallerLosAndes = AVAILABLE_COMPANIES.find((c) => c.id === 'taller-los-andes') || AVAILABLE_COMPANIES[0];

  const handleSelect = (companyId: string) => {
    if (!isSSTLeader) return;
    onSwitchCompany(companyId);
    setInspectedCompanyId(companyId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans text-[13px]">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs font-black text-white text-base ${
              targetCompany.id === 'servic-crear'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                : 'bg-slate-900 text-amber-400'
            }`}>
              {isSSTLeader ? <Building2 className="w-5 h-5 text-white" /> : (targetCompany.id === 'servic-crear' ? 'SC' : 'TLA')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {isSSTLeader ? 'Selector Multi-Empresa SG-SST' : `Ficha Institucional • ${currentCompany.name}`}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Res. 0312 / Dec. 1072
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSSTLeader
                  ? 'Gestión centralizada y auditoría de matrices GTC 45, capacitaciones y ausentismo por empresa'
                  : `Información legal, alcance operativo y protocolos de seguridad para ${currentCompany.name}`}
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

        {/* Navigation Tabs inside Modal */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          {/* Solo el líder SST puede ver la pestaña de alternar entre empresas */}
          {isSSTLeader && (
            <button
              type="button"
              onClick={() => setActiveTab('SELECCION')}
              className={`pb-2.5 px-3 font-semibold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'SELECCION'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Alternar Entre Empresas (2)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('DATOS_LEGAL')}
            className={`pb-2.5 px-3 font-semibold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'DATOS_LEGAL'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              {isSSTLeader ? 'Ficha Legal SG-SST' : `Ficha Legal (${currentCompany.name})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SERVICIOS')}
            className={`pb-2.5 px-3 font-semibold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'SERVICIOS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Portafolio de Servicios</span>
          </button>
        </div>

        {/* Sub-selector para el líder SST en Ficha Legal y Servicios */}
        {isSSTLeader && activeTab !== 'SELECCION' && (
          <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <span>Examinando datos de:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInspectedCompanyId('servic-crear')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                  targetCompany.id === 'servic-crear'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                SERVIC CREAR S.A.S.
              </button>
              <button
                type="button"
                onClick={() => setInspectedCompanyId('taller-los-andes')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                  targetCompany.id === 'taller-los-andes'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Taller Los Andes S.A.S.
              </button>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* TAB 1: SELECCION DE EMPRESA (Solo accesible para Líder SST) */}
          {activeTab === 'SELECCION' && isSSTLeader && (
            <div className="space-y-4 anim-page-view">
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
                        <span>ARL: Positiva Compañía de Seguros</span>
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
                      disabled={currentCompany.id === 'taller-los-andes'}
                      onClick={() => handleSelect('taller-los-andes')}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        currentCompany.id === 'taller-los-andes'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>
                        {currentCompany.id === 'taller-los-andes'
                          ? 'Empresa Seleccionada'
                          : 'Seleccionar Taller Los Andes'}
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
                        <span className="truncate">ARL: Seguros SURA • Aliado STIHL</span>
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
                      disabled={currentCompany.id === 'servic-crear'}
                      onClick={() => handleSelect('servic-crear')}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        currentCompany.id === 'servic-crear'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>
                        {currentCompany.id === 'servic-crear'
                          ? 'Empresa Seleccionada'
                          : 'Seleccionar SERVIC CREAR S.A.S.'}
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
                    cronograma anual de capacitaciones, los indicadores de ausentismo médico, las actas de entrega de EPP
                    y la dotación técnica.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FICHA LEGAL SG-SST (Dinámica para la empresa activa o seleccionada) */}
          {activeTab === 'DATOS_LEGAL' && (
            <div className="space-y-4 anim-page-view">
              {/* Explicación de qué función cumple esta ficha técnica */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/90 rounded-2xl p-4 text-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>¿Qué función cumple esta Ficha de Datos en el SG-SST?</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Conforme al <strong>Decreto 1072 de 2015 (Art. 2.2.4.6.8)</strong> y la <strong>Resolución 0312 de 2019</strong>, el Sistema de Gestión debe individualizar formalmente la persona jurídica y sus centros de trabajo. Esta información cumple 4 funciones críticas:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="bg-white/85 p-2.5 rounded-xl border border-blue-100 shadow-2xs">
                    <span className="font-bold text-blue-900 block">1. Validez Legal y Auditorías:</span>
                    <span className="text-slate-600">
                      Identifica al empleador, sedes operativas, clase de riesgo y ARL ({targetCompany.arl || 'Afiliada'}) ante inspecciones del Ministerio del Trabajo.
                    </span>
                  </div>
                  <div className="bg-white/85 p-2.5 rounded-xl border border-blue-100 shadow-2xs">
                    <span className="font-bold text-blue-900 block">2. Emisión Oficial de Actas:</span>
                    <span className="text-slate-600">
                      Alimenta automáticamente los membretes de las <strong>Actas de Entrega de EPP</strong>, <strong>Cronogramas Anuales</strong> y <strong>Firmas Digitales</strong>.
                    </span>
                  </div>
                  <div className="bg-white/85 p-2.5 rounded-xl border border-blue-100 shadow-2xs">
                    <span className="font-bold text-blue-900 block">3. Peligros y Procesos Reales:</span>
                    <span className="text-slate-600">
                      Parametriza la Matriz GTC 45 para que evalúe actividades reales de {targetCompany.name} y no actividades ajenas.
                    </span>
                  </div>
                  <div className="bg-white/85 p-2.5 rounded-xl border border-blue-100 shadow-2xs">
                    <span className="font-bold text-blue-900 block">4. Activación de Emergencias:</span>
                    <span className="text-slate-600">
                      Centraliza los contactos corporativos directos para notificación y reporte inmediato de accidentes laborales.
                    </span>
                  </div>
                </div>
              </div>

              {/* Ficha Legal Tabular Oficial de la Empresa */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      targetCompany.id === 'servic-crear'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      Ficha Oficial Verificada
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Información Institucional, Tributaria y Operativa • {targetCompany.name}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-bold">NIT {targetCompany.nit}</span>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-2.5 px-3 font-bold w-1/3">Dato del Sistema SG-SST</th>
                        <th className="py-2.5 px-3 font-bold w-2/3">Registro Oficial en el Sistema</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Razón Social Oficial</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{targetCompany.name}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Número de Identificación Tributaria (NIT)</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{targetCompany.nit}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Tipo Societario</td>
                        <td className="py-2.5 px-3 text-slate-900">Sociedad por Acciones Simplificada (S.A.S.)</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Actividad Económica Principal (CIIU)</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{targetCompany.ciiu}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Clase de Riesgo SG-SST</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {targetCompany.claseRiesgo}
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Administradora de Riesgos Laborales (ARL)</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {targetCompany.arl || (targetCompany.id === 'servic-crear' ? 'Seguros SURA Colombia' : 'Positiva Compañía de Seguros S.A.')}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Sede Principal / Patio Operativo</td>
                        <td className="py-2.5 px-3 text-slate-900">{targetCompany.sede}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Dirección Sede Principal</td>
                        <td className="py-2.5 px-3 text-slate-900">{targetCompany.direccion1 || 'Dirección registrada en Cámara de Comercio'}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Dirección Sede Alterna / Bahías</td>
                        <td className="py-2.5 px-3 text-slate-900">{targetCompany.direccion2 || 'N/A'}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Teléfono Fijo / Conmutador</td>
                        <td className="py-2.5 px-3 text-slate-900 font-mono">{targetCompany.telefonoFijo || '+57 (601) 420 9800'}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Celular Corporativo / Recepción</td>
                        <td className="py-2.5 px-3 text-slate-900 font-mono font-bold">{targetCompany.celularContacto}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Correo Electrónico Institucional</td>
                        <td className="py-2.5 px-3 text-blue-600 font-medium hover:underline">
                          {targetCompany.correoContacto}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Representante Legal</td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold">
                          {targetCompany.representanteLegal?.nombre} ({targetCompany.representanteLegal?.cargo} • C.C. {targetCompany.representanteLegal?.cedula})
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Líder Responsable SG-SST</td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold">
                          {targetCompany.responsableSST?.nombre} ({targetCompany.responsableSST?.licencia})
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Total Trabajadores de Planta</td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold">
                          {targetCompany.trabajadores} operarios directos
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Cobertura Operativa Regional</td>
                        <td className="py-2.5 px-3 text-slate-900">{targetCompany.coberturaPrincipal}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Proyección de Expansión Territorial</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">{targetCompany.proyeccionExpansion}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Canal Digital Oficial</td>
                        <td className="py-2.5 px-3 text-slate-900 flex items-center gap-1.5">
                          <span>{targetCompany.canalDigital1}</span>
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                            Verificado
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Alianza Tecnológica Estratégica</td>
                        <td className="py-2.5 px-3 font-bold text-amber-700">
                          {targetCompany.aliadoTecnologico}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botón de activación solo para el líder SST si está examinando otra empresa */}
              {isSSTLeader && currentCompany.id !== targetCompany.id && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelect(targetCompany.id!)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Activar {targetCompany.name} en el Sistema</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATALOGO DE SERVICIOS (Dinámico según la empresa) */}
          {activeTab === 'SERVICIOS' && (
            <div className="space-y-4 anim-page-view">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                      Portafolio Acreditado
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Servicios Especializados y Operaciones • {targetCompany.name}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {targetCompany.servicios?.length || 0} Líneas Certificadas
                  </span>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-2.5 px-3 font-bold w-[12%]">Código</th>
                        <th className="py-2.5 px-3 font-bold w-[22%]">Línea de Servicio</th>
                        <th className="py-2.5 px-3 font-bold w-[36%]">Descripción Técnica</th>
                        <th className="py-2.5 px-3 font-bold w-[15%]">Frecuencia Sugerida</th>
                        <th className="py-2.5 px-3 font-bold w-[15%]">Normatividad SG-SST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {targetCompany.servicios?.map((s) => (
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
              <div className={`border rounded-xl p-3.5 text-xs flex items-start gap-3 shadow-2xs ${
                targetCompany.id === 'servic-crear'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}>
                <Award className={`w-5 h-5 shrink-0 mt-0.5 ${
                  targetCompany.id === 'servic-crear' ? 'text-emerald-600' : 'text-amber-600'
                }`} />
                <div className="space-y-1">
                  <div className={`font-bold ${
                    targetCompany.id === 'servic-crear' ? 'text-emerald-900' : 'text-amber-900'
                  }`}>
                    Aliado Tecnológico Estratégico: {targetCompany.aliadoTecnologico}
                  </div>
                  <p className="leading-relaxed text-[12px]">
                    {targetCompany.id === 'servic-crear'
                      ? 'Operación con maquinaria eco-eficiente a batería STIHL (guadañadoras FSA 135, cortasetos HLA 86 y podadoras telescópicas HTA 86). Cero emisiones de hidrocarburos, reducción drástica de ruido (cumplimiento Res. 0312 / Res. 2400) y baja exposición a vibraciones.'
                      : 'Equipamiento de soldadura inversora de arco pulsado Fronius TPS/i con antorchas refrigeradas y módulos de aspiración localizada perimetral Lincoln Electric. Disminución de un 80% en emisión de humos metálicos y radiación lumínica controlada según norma ANSI Z49.1.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              {isSSTLeader ? 'Empresa activa en la sesión:' : 'Tu empresa vinculada:'}
            </span>
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
