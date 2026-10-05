import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, SesionEjecutada } from '../types/capacitaciones';

export const PRESET_USERS: UserProfile[] = [
  {
    id: 'usr-admin-1',
    nombre: 'Rodrigo Gómez V.',
    email: 'gerencia@tallerlosandes.com.co',
    rol: 'ADMINISTRADOR',
    cargo: 'Representante Legal / Gerente General',
    entidad: 'Taller Los Andes S.A.S.',
  },
  {
    id: 'usr-sst-1',
    nombre: 'Ing. Carlos Méndez',
    email: 'sst@tallerlosandes.com.co',
    rol: 'RESPONSABLE_SST',
    cargo: 'Especialista y Responsable del SG-SST',
    entidad: 'Taller Los Andes S.A.S.',
    licenciaOId: 'Lic. 18492-2018 (DDS)',
    capacitadorId: 'cap-carlos-mendez',
  },
  {
    id: 'usr-sst-sc',
    nombre: 'Ing. Andrea Morales Peña',
    email: 'talentohumanoserviccrear@gmail.com',
    rol: 'RESPONSABLE_SST',
    cargo: 'Especialista y Responsable del SG-SST',
    entidad: 'SERVIC CREAR S.A.S.',
    licenciaOId: 'Lic. 24890-SST Tolima',
    capacitadorId: 'cap-andrea-morales',
  },
  {
    id: 'usr-ext-1',
    nombre: 'Ft. Claudia Marcela Vega',
    email: 'cvega.ergonomia@positiva.gov.co',
    rol: 'INSTRUCTOR_EXTERNO',
    cargo: 'Especialista en Ergonomía Ocupacional',
    entidad: 'Positiva ARL',
    licenciaOId: 'Reg. Nacional Fisioterapia 39481',
    capacitadorId: 'cap-claudia-vega',
  },
  {
    id: 'usr-ext-2',
    nombre: 'Ing. Mauricio Peñaloza',
    email: 'mpenaloza@positiva.gov.co',
    rol: 'INSTRUCTOR_EXTERNO',
    cargo: 'Consultor Técnico en Riesgos Eléctricos',
    entidad: 'Positiva ARL',
    licenciaOId: 'Mat. Profesional CN-84910',
    capacitadorId: 'cap-mauricio-penaloza',
  },
  {
    id: 'usr-lectura-1',
    nombre: 'Dra. Elena Santamaría',
    email: 'inspeccion.sst@mintrabajo.gov.co',
    rol: 'LECTURA',
    cargo: 'Inspectora Laboral / Auditora SST',
    entidad: 'Ministerio del Trabajo (Mintrabajo)',
  },
];

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

const AUTH_USER_STORAGE_KEY = 'sst_active_user_v1';

export const AuthRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = PRESET_USERS.find((u) => u.id === parsed.id);
        if (match) return match;
      }
    } catch {
      // fallback
    }
    return PRESET_USERS[1]; // Default to Responsable SST
  });

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const switchRole = (role: UserRole) => {
    const user = PRESET_USERS.find((u) => u.rol === role);
    if (user) {
      setCurrentUser(user);
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

    // Check lock state: if acta is FIRMADA or CONVALIDADA, editing is strictly blocked
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
        availableUsers: PRESET_USERS,
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
