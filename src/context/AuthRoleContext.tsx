import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, SesionEjecutada } from '../types/capacitaciones';

// 1. Usuarios Oficiales de TALLER LOS ANDES S.A.S. (Bogotá D.C. • Metalmecánica • Positiva ARL)
export const TALLER_LOS_ANDES_USERS: UserProfile[] = [
  {
    id: 'usr-tla-sst',
    nombre: 'Ing. Carlos Méndez',
    email: 'sst@tallerlosandes.com.co',
    rol: 'RESPONSABLE_SST',
    cargo: 'Especialista y Responsable del SG-SST',
    entidad: 'Taller Los Andes S.A.S.',
    licenciaOId: 'Lic. 18492-2018 (DDS)',
    capacitadorId: 'cap-carlos-mendez',
  },
  {
    id: 'usr-tla-admin',
    nombre: 'Rodrigo Gómez V.',
    email: 'gerencia@tallerlosandes.com.co',
    rol: 'ADMINISTRADOR',
    cargo: 'Representante Legal / Gerente General',
    entidad: 'Taller Los Andes S.A.S.',
  },
  {
    id: 'usr-tla-ext-1',
    nombre: 'Ft. Claudia Marcela Vega',
    email: 'cvega.ergonomia@positiva.gov.co',
    rol: 'INSTRUCTOR_EXTERNO',
    cargo: 'Especialista en Ergonomía Ocupacional',
    entidad: 'Positiva ARL',
    licenciaOId: 'Reg. Nacional Fisioterapia 39481',
    capacitadorId: 'cap-claudia-vega',
  },
  {
    id: 'usr-tla-ext-2',
    nombre: 'Ing. Mauricio Peñaloza',
    email: 'mpenaloza@positiva.gov.co',
    rol: 'INSTRUCTOR_EXTERNO',
    cargo: 'Consultor Técnico en Riesgos Eléctricos',
    entidad: 'Positiva ARL',
    licenciaOId: 'Mat. Profesional CN-84910',
    capacitadorId: 'cap-mauricio-penaloza',
  },
  {
    id: 'usr-tla-lectura',
    nombre: 'Dra. Elena Santamaría',
    email: 'inspeccion.sst@mintrabajo.gov.co',
    rol: 'LECTURA',
    cargo: 'Inspectora Laboral / Auditora SST',
    entidad: 'Ministerio del Trabajo (Mintrabajo)',
  },
];

// 2. Usuarios Oficiales de SERVIC CREAR S.A.S. (Ibagué, Tolima • Servicios Generales • Seguros SURA / STIHL)
export const SERVIC_CREAR_USERS: UserProfile[] = [
  {
    id: 'usr-sc-sst',
    nombre: 'Ing. Andrea Morales Peña',
    email: 'talentohumanoserviccrear@gmail.com',
    rol: 'RESPONSABLE_SST',
    cargo: 'Líder SG-SST / Especialista SST',
    entidad: 'SERVIC CREAR S.A.S.',
    licenciaOId: 'Lic. 24890-SST Tolima',
    capacitadorId: 'cap-andrea-morales',
  },
  {
    id: 'usr-sc-admin',
    nombre: 'Dra. Claudia Patricia Varón',
    email: 'gerencia@serviccrear.com.co',
    rol: 'ADMINISTRADOR',
    cargo: 'Representante Legal / Gerente General',
    entidad: 'SERVIC CREAR S.A.S.',
  },
  {
    id: 'usr-sc-ext-1',
    nombre: 'Ing. Marcos Beltrán',
    email: 'capacitacion@stihl.com.co',
    rol: 'INSTRUCTOR_EXTERNO',
    cargo: 'Asesor Técnico en Maquinaria a Batería y Poda',
    entidad: 'STIHL Colombia • Soporte Especializado',
    licenciaOId: 'Cert. Máster STIHL N° 2026-CO-841',
    capacitadorId: 'cap-stihl-colombia',
  },
  {
    id: 'usr-sc-ext-2',
    nombre: 'Dra. Pilar Gómez Cárdenas',
    email: 'prevencion@sura.com.co',
    rol: 'INSTRUCTOR_EXTERNO',
    cargo: 'Consultora de Prevención y Riesgos Laborales',
    entidad: 'Seguros SURA ARL',
    licenciaOId: 'Lic. SURA-8841-BOG',
    capacitadorId: 'cap-sura-asesor',
  },
  {
    id: 'usr-sc-lectura',
    nombre: 'Dr. Hernando Prieto Mendoza',
    email: 'inspeccion.tolima@mintrabajo.gov.co',
    rol: 'LECTURA',
    cargo: 'Auditor SST / Inspector Territorial Tolima',
    entidad: 'Ministerio del Trabajo - D.T. Tolima',
  },
];

// Fallback compatible list
export const PRESET_USERS: UserProfile[] = [...TALLER_LOS_ANDES_USERS, ...SERVIC_CREAR_USERS];

interface AuthRoleContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  
  // RBAC Permission Helpers
  canManagePlan: () => boolean;
  canCreatePlan: () => boolean;
  canReschedulePlan: () => boolean;
  canAnnulPlan: () => boolean;
  canDeletePhysicalPlan: () => boolean;
  
  isTrainerOfSession: (sesion: SesionEjecutada) => boolean;
  canEditGrades: (sesion: SesionEjecutada) => { allowed: boolean; reason?: string };
  canReopenActa: (sesion: SesionEjecutada) => { allowed: boolean; reason?: string };
  canSignActa: (sesion: SesionEjecutada, role: 'CAPACITADOR' | 'RESPONSABLE') => { allowed: boolean; reason?: string };
  canUploadEvidence: (sesion: SesionEjecutada) => { allowed: boolean; reason?: string };
  canExecuteSession: (sesion: SesionEjecutada) => { allowed: boolean; reason?: string };
  canSwitchCompany: () => boolean;
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export interface AuthRoleProviderProps {
  children: React.ReactNode;
  activeCompanyId?: string;
}

export const AuthRoleProvider: React.FC<AuthRoleProviderProps> = ({ children, activeCompanyId = 'servic-crear' }) => {
  // Determine isolated user roster based on activeCompanyId
  const getCompanyUsers = (compId: string): UserProfile[] => {
    return compId === 'servic-crear' ? SERVIC_CREAR_USERS : TALLER_LOS_ANDES_USERS;
  };

  const [activeUsers, setActiveUsers] = useState<UserProfile[]>(() => getCompanyUsers(activeCompanyId));

  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    const users = getCompanyUsers(activeCompanyId);
    return users.find((u) => u.rol === 'RESPONSABLE_SST') || users[0];
  });

  // Whenever activeCompanyId changes, immediately enforce strict isolation:
  useEffect(() => {
    const companyUsers = getCompanyUsers(activeCompanyId);
    setActiveUsers(companyUsers);

    // Keep the current role if possible, else default to RESPONSABLE_SST in the new company
    setCurrentUserState((prev) => {
      const matchInNewCompany = companyUsers.find((u) => u.rol === prev.rol);
      return matchInNewCompany || companyUsers.find((u) => u.rol === 'RESPONSABLE_SST') || companyUsers[0];
    });
  }, [activeCompanyId]);

  const setCurrentUser = (user: UserProfile) => {
    // Only accept user if it belongs to the current company
    const belongs = activeUsers.some((u) => u.id === user.id);
    if (belongs) {
      setCurrentUserState(user);
    }
  };

  const switchRole = (role: UserRole) => {
    const targetUser = activeUsers.find((u) => u.rol === role);
    if (targetUser) {
      setCurrentUserState(targetUser);
    }
  };

  // Plan level permissions
  const canManagePlan = () => {
    return currentUser.rol === 'ADMINISTRADOR' || currentUser.rol === 'RESPONSABLE_SST';
  };

  const canCreatePlan = () => canManagePlan();
  const canReschedulePlan = () => canManagePlan();
  const canAnnulPlan = () => canManagePlan();
  const canDeletePhysicalPlan = () => canManagePlan();

  // Session level permissions
  const isTrainerOfSession = (sesion: SesionEjecutada) => {
    if (currentUser.rol === 'INSTRUCTOR_EXTERNO') {
      return (
        sesion.capacitadorId === currentUser.capacitadorId ||
        sesion.capacitadorNombre.toLowerCase().includes(currentUser.nombre.toLowerCase()) ||
        currentUser.nombre.toLowerCase().includes(sesion.capacitadorNombre.toLowerCase())
      );
    }
    return false;
  };

  const canEditGrades = (sesion: SesionEjecutada): { allowed: boolean; reason?: string } => {
    if (currentUser.rol === 'LECTURA') {
      return { allowed: false, reason: 'El rol de LECTURA solo tiene permisos de consulta.' };
    }

    if (sesion.estadoActa === 'FIRMADA' || sesion.estadoActa === 'CONVALIDADA') {
      return {
        allowed: false,
        reason: 'El acta está firmada y convalidada. Solo el ADMINISTRADOR puede reabrirla registrando una justificación formal.',
      };
    }

    if (currentUser.rol === 'ADMINISTRADOR' || currentUser.rol === 'RESPONSABLE_SST') {
      return { allowed: true };
    }

    if (currentUser.rol === 'INSTRUCTOR_EXTERNO') {
      if (isTrainerOfSession(sesion)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Los instructores externos únicamente pueden calificar y gestionar sesiones asignadas a su registro.',
      };
    }

    return { allowed: false, reason: 'Sin privilegios suficientes.' };
  };

  const canReopenActa = (sesion: SesionEjecutada): { allowed: boolean; reason?: string } => {
    if (currentUser.rol !== 'ADMINISTRADOR') {
      return {
        allowed: false,
        reason: 'Privilegio exclusivo del rol ADMINISTRADOR para garantizar la trazabilidad legal del acta.',
      };
    }
    if (sesion.estadoActa !== 'FIRMADA' && sesion.estadoActa !== 'CONVALIDADA') {
      return {
        allowed: false,
        reason: 'El acta no requiere reapertura porque aún no ha sido firmada o convalidada.',
      };
    }
    return { allowed: true };
  };

  const canSignActa = (
    sesion: SesionEjecutada,
    role: 'CAPACITADOR' | 'RESPONSABLE'
  ): { allowed: boolean; reason?: string } => {
    if (currentUser.rol === 'LECTURA') {
      return { allowed: false, reason: 'El rol LECTURA no puede firmar actas.' };
    }

    if (role === 'CAPACITADOR') {
      if (currentUser.rol === 'INSTRUCTOR_EXTERNO') {
        if (!isTrainerOfSession(sesion)) {
          return { allowed: false, reason: 'No está asignado como capacitador de esta sesión.' };
        }
        return { allowed: true };
      }
      if (currentUser.rol === 'RESPONSABLE_SST' || currentUser.rol === 'ADMINISTRADOR') {
        return { allowed: true };
      }
    }

    if (role === 'RESPONSABLE') {
      if (currentUser.rol === 'RESPONSABLE_SST' || currentUser.rol === 'ADMINISTRADOR') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'La convalidación técnica requiere rol de Responsable SST o Administrador.',
      };
    }

    return { allowed: false, reason: 'No autorizado para firmar.' };
  };

  const canUploadEvidence = (sesion: SesionEjecutada): { allowed: boolean; reason?: string } => {
    if (currentUser.rol === 'LECTURA') {
      return { allowed: false, reason: 'Rol de solo lectura no puede cargar evidencias.' };
    }
    if (currentUser.rol === 'ADMINISTRADOR' || currentUser.rol === 'RESPONSABLE_SST') {
      return { allowed: true };
    }
    if (currentUser.rol === 'INSTRUCTOR_EXTERNO') {
      if (isTrainerOfSession(sesion)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Solo puede adjuntar evidencias en sus sesiones asignadas.',
      };
    }
    return { allowed: false, reason: 'Sin autorización.' };
  };

  const canExecuteSession = (sesion: SesionEjecutada): { allowed: boolean; reason?: string } => {
    if (currentUser.rol === 'LECTURA') {
      return { allowed: false, reason: 'Solo lectura.' };
    }
    if (currentUser.rol === 'ADMINISTRADOR' || currentUser.rol === 'RESPONSABLE_SST') {
      return { allowed: true };
    }
    if (currentUser.rol === 'INSTRUCTOR_EXTERNO' && isTrainerOfSession(sesion)) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'No autorizado para ejecutar esta sesión.' };
  };

  return (
    <AuthRoleContext.Provider
      value={{
        currentUser,
        availableUsers: activeUsers,
        setCurrentUser,
        switchRole,
        canManagePlan,
        canCreatePlan,
        canReschedulePlan,
        canAnnulPlan,
        canDeletePhysicalPlan,
        isTrainerOfSession,
        canEditGrades,
        canReopenActa,
        canSignActa,
        canUploadEvidence,
        canExecuteSession,
        canSwitchCompany: () => currentUser.rol === 'RESPONSABLE_SST',
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
};
