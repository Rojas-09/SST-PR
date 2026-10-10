import { useState, useEffect } from 'react';
import { initialCompany, initialHazards, initialIncapacidades } from './data/initialData';
import { HazardRecord, CompanyInfo, ActiveView, IncapacidadRecord, CapacitacionRecord } from './types';
import { capacitacionesStorage } from './services/capacitacionesStorage';
import { getCompanyDataset } from './data/companiesData';
import { AuthRoleProvider } from './context/AuthRoleContext';
import { Sidebar } from './components/Sidebar';
import { ClayTopHeader } from './components/ClayTopHeader';
import { ClayDashboardView } from './components/ClayDashboardView';
import { DashboardInicioView } from './components/DashboardInicioView';
import { ActasEntregaView } from './components/ActasEntregaView';
import { CapacitacionesView } from './components/CapacitacionesView';
import { CalendarioVencimientos } from './components/CalendarioVencimientos';
import { VencimientosView } from './components/VencimientosView';
import { FloatingAssistant } from './components/FloatingAssistant';
import { ContactsModal } from './components/ContactsModal';
import { SettingsModal } from './components/SettingsModal';
import { CompanySwitcherModal } from './components/CompanySwitcherModal';
import { HazardDetail } from './components/HazardDetail';
import { MatrixView } from './components/MatrixView';
import { NewHazardForm } from './components/NewHazardForm';
import { HazardsList } from './components/HazardsList';
import { DiagnosticoRes0312 } from './components/DiagnosticoRes0312';
import { ActaEntregaModal } from './components/ActaEntregaModal';
import { GestionPeligrosSplitView } from './components/GestionPeligrosSplitView';
import { AusentismoView } from './components/AusentismoView';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [company, setCompany] = useState<CompanyInfo>(initialCompany);
  const [hazards, setHazards] = useState<HazardRecord[]>(initialHazards);
  const [incapacidades, setIncapacidades] = useState<IncapacidadRecord[]>(initialIncapacidades);
  const [capacitaciones, setCapacitaciones] = useState<CapacitacionRecord[]>(() =>
    capacitacionesStorage.getUnifiedCapacitacionRecords()
  );

  useEffect(() => {
    const unsubscribe = capacitacionesStorage.subscribe(() => {
      setCapacitaciones(capacitacionesStorage.getUnifiedCapacitacionRecords());
    });
    return () => unsubscribe();
  }, []);

  const [activeView, setActiveView] = useState<ActiveView>('inicio');
  const [selectedHazard, setSelectedHazard] = useState<HazardRecord>(initialHazards[0]);
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCompanySwitcherOpen, setIsCompanySwitcherOpen] = useState(false);
  
  // Floating Assistant state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Critical hazards count
  const criticalCount = hazards.filter((h) => h.evaluacion.level === 'NIVEL_I').length;

  const handleSwitchCompany = (companyId: string) => {
    const dataset = getCompanyDataset(companyId);
    setCompany(dataset.company);
    setHazards(dataset.hazards);
    setIncapacidades(dataset.incapacidades);
    capacitacionesStorage.setCompany(companyId);
    setCapacitaciones(capacitacionesStorage.getUnifiedCapacitacionRecords());
    if (dataset.hazards.length > 0) {
      setSelectedHazard(dataset.hazards[0]);
    }
  };

  const handleSelectHazard = (hazard: HazardRecord) => {
    setSelectedHazard(hazard);
    setActiveView('gestion-peligros');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateHazard = (updated: HazardRecord) => {
    setHazards((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    if (selectedHazard.id === updated.id) {
      setSelectedHazard(updated);
    }
  };

  const handleSaveNewHazard = (newHazard: HazardRecord) => {
    setHazards((prev) => [newHazard, ...prev]);
    setSelectedHazard(newHazard);
    setActiveView('gestion-peligros');
  };

  const handleAddIncapacidad = (nueva: IncapacidadRecord) => {
    setIncapacidades((prev) => [nueva, ...prev]);
  };

  const handleAddCapacitacion = (nueva: CapacitacionRecord) => {
    setCapacitaciones((prev) => [nueva, ...prev]);
  };

  const handleUpdateCapacitacion = (actualizada: CapacitacionRecord) => {
    setCapacitaciones((prev) =>
      prev.map((c) => (c.id === actualizada.id ? actualizada : c))
    );
  };

  const handleConfirmDelivery = (hazardId: string, recipientName: string, recipientId: string) => {
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          return {
            ...h,
            estadoEntregaEPP: 'FIRMADA',
            planIntervencion: {
              ...h.planIntervencion,
              epp: {
                ...h.planIntervencion.epp,
                items: h.planIntervencion.epp.items.map((it) => ({ ...it, checked: true })),
              },
            },
          };
        }
        return h;
      })
    );

    if (selectedHazard.id === hazardId) {
      setSelectedHazard((prev) => ({
        ...prev,
        estadoEntregaEPP: 'FIRMADA',
        planIntervencion: {
          ...prev.planIntervencion,
          epp: {
            ...prev.planIntervencion.epp,
            items: prev.planIntervencion.epp.items.map((it) => ({ ...it, checked: true })),
          },
        },
      }));
    }
  };

  return (
    <AuthRoleProvider activeCompanyId={company.id}>
      <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans antialiased text-slate-800 text-[13px] relative">
        {/* Desktop Sidebar (hidden on tablet < 1024px and mobile to give 100% width) */}
      <div className="hidden lg:flex flex-col shrink-0 h-screen z-10">
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            setIsMobileSidebarOpen(false);
          }}
          company={company}
          hazardCount={hazards.length}
          incapacidadCount={incapacidades.length}
          criticalCount={criticalCount}
          capacitacionesCount={capacitaciones.length}
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNewHazard={() => setActiveView('registrar-nuevo')}
          onOpenCompanySwitcher={() => setIsCompanySwitcherOpen(true)}
          onSwitchCompany={handleSwitchCompany}
        />
      </div>

      {/* Mobile & Tablet Sliding Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <Sidebar
              activeView={activeView}
              onNavigate={(view) => {
                setActiveView(view);
                setIsMobileSidebarOpen(false);
              }}
              company={company}
              hazardCount={hazards.length}
              incapacidadCount={incapacidades.length}
              criticalCount={criticalCount}
              capacitacionesCount={capacitaciones.length}
              onToggleChat={() => {
                setIsChatOpen((prev) => !prev);
                setIsMobileSidebarOpen(false);
              }}
              onOpenSettings={() => {
                setIsSettingsOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              onOpenNewHazard={() => {
                setActiveView('registrar-nuevo');
                setIsMobileSidebarOpen(false);
              }}
              onClose={() => setIsMobileSidebarOpen(false)}
              onOpenCompanySwitcher={() => {
                setIsCompanySwitcherOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              onSwitchCompany={handleSwitchCompany}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-white">
        {/* Top Header matching Clay */}
        <ClayTopHeader
          company={company}
          criticalCount={criticalCount}
          onNavigate={setActiveView}
          onOpenNewHazard={() => setActiveView('registrar-nuevo')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenCompanySwitcher={() => setIsCompanySwitcherOpen(true)}
          onSwitchCompany={handleSwitchCompany}
        />

        {/* Dynamic Views with single scroll container */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 pb-16 relative z-10">
          <div key={activeView} className="anim-page-view">
            {/* Executive Dashboard with Recharts and Integrated AI Copilot */}
            {activeView === 'inicio' && (
              <DashboardInicioView
                hazards={hazards}
                incapacidades={incapacidades}
                company={company}
                capacitaciones={capacitaciones}
                onNavigate={setActiveView}
                onSelectHazard={handleSelectHazard}
                onOpenNewHazard={() => setActiveView('registrar-nuevo')}
              />
            )}

            {/* Primary GTC 45 Matrix Table / Grid */}
            {activeView === 'matriz-gtc45' && (
              <ClayDashboardView
                hazards={hazards}
                incapacidades={incapacidades}
                company={company}
                onSelectHazard={handleSelectHazard}
                onNavigate={setActiveView}
                onOpenNewHazard={() => setActiveView('registrar-nuevo')}
                onAskCopilot={(query) => {
                  setIsChatOpen(true);
                }}
              />
            )}

            {/* Actas Oficiales de Dotación y Entrega de EPP (Dec. 1072 Art. 2.2.4.6.24) */}
            {activeView === 'actas-entrega' && (
              <ActasEntregaView
                hazards={hazards}
                company={company}
                onSelectHazard={handleSelectHazard}
                onNavigate={setActiveView}
                onOpenActaModalForHazard={(hazard) => {
                  setSelectedHazard(hazard);
                  setIsActaModalOpen(true);
                }}
              />
            )}

            {/* Split Hazard View (Detailed GTC 45 controls & intervention) */}
            {activeView === 'gestion-peligros' && (
              <GestionPeligrosSplitView
                hazards={hazards}
                company={company}
                selectedHazardId={selectedHazard.id}
                onSelectHazard={handleSelectHazard}
                onUpdateHazard={handleUpdateHazard}
                onNavigate={setActiveView}
                onOpenActaModal={() => setIsActaModalOpen(true)}
              />
            )}

            {activeView === 'peligro-detalle' && (
              <HazardDetail
                hazard={selectedHazard}
                company={company}
                onBack={() => setActiveView('gestion-peligros')}
                onNavigate={setActiveView}
                onUpdateHazard={handleUpdateHazard}
                onOpenActaModal={() => setIsActaModalOpen(true)}
                onUpdateCompany={setCompany}
              />
            )}

            {/* Ausentismo e Incapacidades (DIRECTO Y PROMINENTE) */}
            {activeView === 'ausentismo' && (
              <AusentismoView
                company={company}
                incapacidades={incapacidades}
                onAddIncapacidad={handleAddIncapacidad}
              />
            )}

            {activeView === 'registrar-nuevo' && (
              <NewHazardForm
                company={company}
                onSaveHazard={handleSaveNewHazard}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'peligros-lista' && (
              <HazardsList
                hazards={hazards}
                searchQuery=""
                onSelectHazard={handleSelectHazard}
                onNavigate={setActiveView}
                company={company}
                onUpdateCompany={setCompany}
              />
            )}

            {activeView === 'diagnostico-0312' && (
              <DiagnosticoRes0312
                company={company}
                onUpdateCompany={setCompany}
              />
            )}

            {/* Plan Anual de Capacitación y Entrenamiento en Peligros GTC 45 (Res. 0312 Est. 2.2.1) */}
            {activeView === 'capacitaciones' && (
              <CapacitacionesView
                hazards={hazards}
                company={company}
                onNavigate={setActiveView}
                onSelectHazard={handleSelectHazard}
              />
            )}

            {/* Vista Completa de Calendario y Fechas Clave SG-SST */}
            {activeView === 'calendario' && (
              <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 py-5 sm:py-6">
                <CalendarioVencimientos
                  hazards={hazards}
                  incapacidades={incapacidades}
                  company={company}
                  capacitaciones={capacitaciones}
                  onNavigate={setActiveView}
                  onSelectHazard={handleSelectHazard}
                />
              </div>
            )}

            {/* Centro de Control de Vencimientos y Compromisos Legales SG-SST */}
            {activeView === 'vencimientos' && (
              <VencimientosView
                hazards={hazards}
                incapacidades={incapacidades}
                company={company}
                capacitaciones={capacitaciones}
                onNavigate={setActiveView}
                onSelectHazard={handleSelectHazard}
              />
            )}
          </div>
        </main>
        </div>

        {/* Floating AI Assistant Widget */}
        <FloatingAssistant
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          company={company}
          hazards={hazards}
          onSelectHazard={handleSelectHazard}
        />

        {/* Floating trigger button if assistant is closed (never covers modals or mobile footer buttons) */}
        {!isChatOpen && !isSettingsOpen && !isContactsOpen && (
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-5 right-5 z-20 print:hidden hidden sm:flex bg-[#1877F2] hover:bg-[#1464CC] text-white p-2.5 sm:p-3 rounded-full shadow-2xl items-center gap-2 cursor-pointer transition-transform hover:scale-105"
            title="Abrir Asistente SST Copilot"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-[12px] font-medium pr-1">SST Copilot</span>
          </button>
        )}

        {/* Contacts Modal */}
        <ContactsModal
          isOpen={isContactsOpen}
          onClose={() => setIsContactsOpen(false)}
          company={company}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          company={company}
          onUpdateCompany={setCompany}
        />

        {/* Multi-Company Switcher Modal (Líder SG-SST) */}
        <CompanySwitcherModal
          currentCompany={company}
          isOpen={isCompanySwitcherOpen}
          onClose={() => setIsCompanySwitcherOpen(false)}
          onSwitchCompany={handleSwitchCompany}
        />

        {/* EPP Official Delivery Modal */}
        <ActaEntregaModal
          isOpen={isActaModalOpen}
          onClose={() => setIsActaModalOpen(false)}
          hazard={selectedHazard}
          company={company}
          onConfirmDelivery={handleConfirmDelivery}
        />
      </div>
    </AuthRoleProvider>
  );
  }
