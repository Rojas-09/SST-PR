import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  FileCheck,
  ShieldAlert,
  HardDrive,
} from 'lucide-react';
import {
  EvidenciaExpediente,
  SesionEjecutada,
  PlanCapacitacion,
  TipoEvidencia,
} from '../../types/capacitaciones';
import { useAuthRole } from '../../context/AuthRoleContext';
import {
  validateFileMagicBytes,
  computeFileHash,
  MAX_FILE_SIZE_BYTES,
  MAX_SESSION_ACCUMULATED_BYTES,
} from '../../utils/fileValidation';
import { capacitacionesStorage } from '../../services/capacitacionesStorage';

interface CargaEvidenciasModalProps {
  isOpen: boolean;
  onClose: () => void;
  sesion: SesionEjecutada;
  plan: PlanCapacitacion;
  evidencias: EvidenciaExpediente[];
  onEvidenciasChanged: () => void;
}

export function CargaEvidenciasModal({
  isOpen,
  onClose,
  sesion,
  plan,
  evidencias,
  onEvidenciasChanged,
}: CargaEvidenciasModalProps) {
  const { currentUser, canUploadEvidence } = useAuthRole();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadPermission = canUploadEvidence(sesion);

  const [selectedTipo, setSelectedTipo] = useState<TipoEvidencia>('FOTOGRAFIA');
  const [customName, setCustomName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewEvidencia, setPreviewEvidencia] = useState<EvidenciaExpediente | null>(null);

  if (!isOpen) return null;

  // Calculate accumulated session quota
  const totalBytesUsed = evidencias.reduce((sum, e) => sum + e.tamanoBytes, 0);
  const usedMB = (totalBytesUsed / (1024 * 1024)).toFixed(2);
  const maxMB = (MAX_SESSION_ACCUMULATED_BYTES / (1024 * 1024)).toFixed(0);
  const quotaPct = Math.min(100, Math.round((totalBytesUsed / MAX_SESSION_ACCUMULATED_BYTES) * 100));

  const hasPhoto = evidencias.some((e) => e.tipoEvidencia === 'FOTOGRAFIA');
  const requiresPhoto =
    plan.modalidad === 'TALLER_PUESTO_TRABAJO' || plan.modalidad === 'VIRTUAL_ARL';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsProcessing(true);

    try {
      // 1. Validate magic bytes (binary signature)
      const validation = await validateFileMagicBytes(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Archivo inválido.');
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // 2. Check accumulated quota
      if (totalBytesUsed + file.size > MAX_SESSION_ACCUMULATED_BYTES) {
        setErrorMessage(
          `La carga supera el límite acumulado de 50 MB por sesión. (Espacio disponible: ${(
            (MAX_SESSION_ACCUMULATED_BYTES - totalBytesUsed) /
            (1024 * 1024)
          ).toFixed(2)} MB)`
        );
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // 3. Compute hash and create object URL
      const hash = await computeFileHash(file);
      const objectUrl = URL.createObjectURL(file);

      const nuevaEvidencia: EvidenciaExpediente = {
        id: `EVI-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sesionId: sesion.id,
        nombre: customName.trim() || file.name,
        nombreArchivo: file.name,
        mimeType: validation.mimeType,
        tamanoBytes: file.size,
        url: objectUrl,
        tipoEvidencia: selectedTipo,
        subidoPor: currentUser.nombre,
        subidoRol: currentUser.rol,
        subidoFecha: new Date().toISOString(),
        validaMagicBytes: true,
        sha256Hash: hash,
      };

      const result = capacitacionesStorage.addEvidencia(nuevaEvidencia);
      if (!result.success) {
        setErrorMessage(result.error || 'Error al almacenar evidencia.');
      } else {
        setSuccessMessage(`Archivo "${file.name}" validado e incorporado exitosamente.`);
        setCustomName('');
        onEvidenciasChanged();
      }
    } catch (err: any) {
      setErrorMessage(`Error en el procesamiento del archivo: ${err.message || 'Desconocido'}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string) => {
    if (!uploadPermission.allowed) return;
    capacitacionesStorage.deleteEvidencia(id);
    onEvidenciasChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 font-sans text-[13px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2 truncate">
                <span className="truncate">Expediente y Evidencias</span>
                <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
                  {plan.codigo}
                </span>
              </h2>
              <p className="text-[10.5px] sm:text-[11px] text-slate-400 truncate">
                Soporte probatorio para el Estándar 2.2.1 de la Resolución 0312 de 2019
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Requirement Banner for Puesto de Trabajo or Virtual */}
          {requiresPhoto && (
            <div
              className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                hasPhoto
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 text-xs min-w-0">
                {hasPhoto ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  Modalidad <strong>{plan.modalidad.replace(/_/g, ' ')}</strong>:{' '}
                  {hasPhoto
                    ? 'Cumple requisito mínimo de evidencia fotográfica adjunta.'
                    : 'Exige al menos una evidencia fotográfica de campo antes del paso a estado EJECUTADA.'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit shrink-0 ${
                  hasPhoto ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                }`}
              >
                {hasPhoto ? 'REQUISITO CUMPLIDO' : 'FALTA FOTOGRAFÍA'}
              </span>
            </div>
          )}

          {/* Session Quota Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                <span>Almacenamiento de Sesión: {usedMB} MB / {maxMB} MB</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">{quotaPct}% ocupado</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  quotaPct > 80 ? 'bg-red-500' : quotaPct > 50 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <p className="text-[10.5px] text-slate-400">
              Límites por archivo: 10 MB. Formatos permitidos: PDF, JPG, PNG con validación de magic bytes.
            </p>
          </div>

          {/* Upload Area (Disabled if read-only or not authorized) */}
          {uploadPermission.allowed ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tipo de Evidencia
                  </label>
                  <select
                    value={selectedTipo}
                    onChange={(e) => setSelectedTipo(e.target.value as TipoEvidencia)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="FOTOGRAFIA">Fotografía de Campo / Registro Gráfico</option>
                    <option value="LISTA_ASISTENCIA_FISICA">Planilla de Asistencia Física Firmada (PDF)</option>
                    <option value="EVALUACION_ESCRITA">Evaluación o Prueba Escrita Calificada</option>
                    <option value="CERTIFICADO">Certificado de ARL / Entidad Externa</option>
                    <option value="OTRO">Otro Soporte Técnico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Descripción / Título Opcional
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ej: Registro fotográfico del uso de biombos en Bahía 4"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="evidence-file-input"
                />
                <label
                  htmlFor="evidence-file-input"
                  className={`px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs w-full sm:w-auto ${
                    isProcessing ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isProcessing ? 'Validando binarios...' : 'Seleccionar Archivo (PDF, JPG, PNG)'}</span>
                </label>
                <span className="text-[10.5px] sm:text-[11px] text-slate-400">
                  Validación instantánea por firmas binarias (Anti-malware / No HEIC)
                </span>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs">
              <strong>Carga restringida:</strong> {uploadPermission.reason}
            </div>
          )}

          {/* List of Attached Evidences */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center justify-between">
              <span>Evidencias Custodiadas ({evidencias.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Verificadas con Magic Bytes
              </span>
            </h3>

            {evidencias.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                No hay evidencias adjuntas para esta sesión.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                {evidencias.map((evi) => {
                  const sizeKB = (evi.tamanoBytes / 1024).toFixed(0);
                  const isPdf = evi.mimeType.includes('pdf');

                  return (
                    <div
                      key={evi.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isPdf
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}
                        >
                          {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-xs truncate flex items-center gap-2">
                            <span>{evi.nombre}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {evi.tipoEvidencia}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{sizeKB} KB</span>
                            <span>•</span>
                            <span>Subido por {evi.subidoPor} ({evi.subidoRol})</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                              <FileCheck className="w-3 h-3 text-emerald-600" />
                              Firma Binaria Válida
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewEvidencia(evi)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Visualizar documento / imagen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {uploadPermission.allowed && (
                          <button
                            type="button"
                            onClick={() => handleDelete(evi.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar evidencia"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>

      {/* Lightbox / Preview Modal */}
      {previewEvidencia && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in zoom-in-95 duration-150">
          <div className="bg-white rounded-xl max-w-2xl w-full p-4 space-y-3 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-xs text-slate-900">{previewEvidencia.nombre}</span>
              <button
                type="button"
                onClick={() => setPreviewEvidencia(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-100 rounded-lg p-2">
              {previewEvidencia.mimeType.startsWith('image') ? (
                <img
                  src={previewEvidencia.url}
                  alt={previewEvidencia.nombre}
                  className="max-h-[65vh] max-w-full rounded object-contain"
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-12 h-12 text-red-600 mx-auto" />
                  <p className="font-bold text-xs text-slate-900">{previewEvidencia.nombreArchivo}</p>
                  <p className="text-xs text-slate-500 font-mono">
                    Documento PDF custodiado con Hash SHA-256: {previewEvidencia.sha256Hash || 'Verificado'}
                  </p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg">
                    Expediente Digital Certificado
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
