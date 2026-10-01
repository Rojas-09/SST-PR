// Validation of binary signatures (Magic Bytes) and storage quotas for SST evidences

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_SESSION_ACCUMULATED_BYTES = 50 * 1024 * 1024; // 50 MB

export interface FileValidationResult {
  valid: boolean;
  mimeType: string;
  error?: string;
  magicBytesHex?: string;
}

/**
 * Validates file binary signatures (Magic Bytes) reading the first bytes of the file.
 * Blocks executable files, shell scripts, and explicitly rejects HEIC / dangerous formats.
 */
export async function validateFileMagicBytes(file: File): Promise<FileValidationResult> {
  // Check size limit (10 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      mimeType: file.type,
      error: `El archivo supera el límite máximo permitido de 10 MB (Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  // Read header bytes
  const headerSlice = file.slice(0, 16);
  const buffer = await headerSlice.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  // 1. Check for Executables / Script payloads (MZ for Windows PE/EXE, ELF for Linux, shebang #!)
  if (bytes[0] === 0x4d && bytes[1] === 0x5a) {
    return {
      valid: false,
      mimeType: 'application/x-dosexec',
      error: 'Archivo ejecutable detectado (.exe / .dll). Por seguridad está estrictamente bloqueado.',
      magicBytesHex: hex,
    };
  }
  if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
    return {
      valid: false,
      mimeType: 'application/x-elf',
      error: 'Archivo binario de sistema detectado. Bloqueado.',
      magicBytesHex: hex,
    };
  }
  if (bytes[0] === 0x23 && bytes[1] === 0x21) {
    return {
      valid: false,
      mimeType: 'text/x-shellscript',
      error: 'Script de sistema o comando detectado. Bloqueado.',
      magicBytesHex: hex,
    };
  }

  // 2. Check for HEIC / HEIF (Apple format - rejected per specification)
  // Look for 'ftyp' at bytes 4-7 with 'heic' or 'mif1'
  if (bytes.length >= 12) {
    const brand = String.fromCharCode(...bytes.slice(4, 12));
    if (brand.includes('ftypheic') || brand.includes('ftypmif1') || brand.includes('ftypmsf1')) {
      return {
        valid: false,
        mimeType: 'image/heic',
        error: 'Formato HEIC no admitido. Convierta la imagen a formato estándar JPG o PNG para garantizar interoperabilidad legal.',
        magicBytesHex: hex,
      };
    }
  }

  // 3. Check PDF: 0x25 0x50 0x44 0x46 (%PDF)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return {
      valid: true,
      mimeType: 'application/pdf',
      magicBytesHex: hex,
    };
  }

  // 4. Check PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return {
      valid: true,
      mimeType: 'image/png',
      magicBytesHex: hex,
    };
  }

  // 5. Check JPEG / JPG: 0xFF 0xD8 0xFF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return {
      valid: true,
      mimeType: 'image/jpeg',
      magicBytesHex: hex,
    };
  }

  // If none matched, reject
  return {
    valid: false,
    mimeType: file.type || 'unknown',
    error: 'Firma de archivo no válida. Solo se admiten documentos PDF e imágenes JPG/PNG legítimos.',
    magicBytesHex: hex,
  };
}

/**
 * Computes a pseudo-hash representation for audit and integrity verification
 */
export async function computeFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  } catch {
    return `hash-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
}
