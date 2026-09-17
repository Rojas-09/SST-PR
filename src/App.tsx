import { useState } from 'react';
import { initialCompany, initialHazards } from './data/initialData';
import { HazardRecord, CompanyInfo, ActiveView } from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { HazardDetail } from './components/HazardDetail';
import { MatrixView } from './components/MatrixView';
import { NewHazardForm } from './components/NewHazardForm';
import { HazardsList } from './components/HazardsList';
import { DiagnosticoRes0312 } from './components/DiagnosticoRes0312';
import { ActaEntregaModal } from './components/ActaEntregaModal';

export default function App() {
  const [company, setCompany] = useState<CompanyInfo>(initialCompany);
  const [hazards, setHazards] = useState<HazardRecord[]>(initialHazards);
  const [activeView, setActiveView] = useState<ActiveView>('peligro-detalle');
  const [selectedHazard, setSelectedHazard] = useState<HazardRecord>(initialHazards[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Critical hazards count
  const criticalCount = hazards.filter((h) => h.evaluacion.level === 'NIVEL_I').length;

  const handleSelectHazard = (hazard: HazardRecord) => {
    setSelectedHazard(hazard);
    setActiveView('peligro-detalle');
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

  const handleFilterCritical = () => {
    const firstCritical = hazards.find((h) => h.evaluacion.level === 'NIVEL_I');
    if (firstCritical) {
      handleSelectHazard(firstCritical);
    } else {
      setActiveView('peligros-lista');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Desktop & Mobile Sidebar */}
      <div className={`${isMobileSidebarOpen ? 'block' : 'hidden'} md:block fixed md:static inset-y-0 left-0 z-40`}>
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            setIsMobileSidebarOpen(false);
          }}
          company={company}
          hazardCount={hazards.length}
        />
      </div>

      {/* Backdrop for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <TopHeader
          company={company}
          criticalCount={criticalCount}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q && activeView !== 'peligros-lista') {
              setActiveView('peligros-lista');
            }
          }}
          onFilterCritical={handleFilterCritical}
        />

        {/* Dynamic Views */}
        <main className="flex-1 pb-16">
          {activeView === 'peligro-detalle' && (
            <HazardDetail
              hazard={selectedHazard}
              company={company}
              onBack={() => setActiveView('peligros-lista')}
              onNavigate={setActiveView}
              onUpdateHazard={handleUpdateHazard}
              onOpenActaModal={() => setIsActaModalOpen(true)}
            />
          )}

          {activeView === 'matriz-gtc45' && (
            <MatrixView
              hazards={hazards}
              company={company}
              onSelectHazard={handleSelectHazard}
              onNavigate={setActiveView}
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
              searchQuery={searchQuery}
              onSelectHazard={handleSelectHazard}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'diagnostico-0312' && (
            <DiagnosticoRes0312
              company={company}
              onUpdateCompany={setCompany}
            />
          )}
        </main>
      </div>

      {/* EPP Official Delivery Modal */}
      <ActaEntregaModal
        isOpen={isActaModalOpen}
        onClose={() => setIsActaModalOpen(false)}
        hazard={selectedHazard}
        company={company}
        onConfirmDelivery={handleConfirmDelivery}
      />
    </div>
  );
}
