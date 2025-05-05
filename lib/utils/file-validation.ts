import { addLog } from './logs/logger';

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

const ALLOWED_FILE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
] as const;

type AllowedMimeType = typeof ALLOWED_FILE_TYPES[number];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_FILE_SIZE = 100; // 100 bytes
const MAX_FILENAME_LENGTH = 200;

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function isValidMimeType(type: string): type is AllowedMimeType {
  return ALLOWED_FILE_TYPES.includes(type as AllowedMimeType);
}

function validateFileType(file: File): boolean {
  if (!isValidMimeType(file.type)) {
    addLog(`Invalid file type attempted: ${file.type}`, 'warn');
    return false;
  }

  // Additional check for file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_FILE_EXTENSIONS.some(ext => 
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    addLog(`Invalid file extension: ${fileName}`, 'warn');
    return false;
  }

  return true;
}

function validateFileSize(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    addLog(`File too large: ${formatFileSize(file.size)}`, 'warn');
    return false;
  }

  if (file.size < MIN_FILE_SIZE) {
    addLog(`File too small: ${formatFileSize(file.size)}`, 'warn');
    return false;
  }

  return true;
}

function sanitizeFileName(fileName: string): string {
  // Remove any path traversal attempts
  const name = fileName.replace(/^.*[/\\]/, '');
  
  // Remove any non-alphanumeric characters except for - . _
  return name
    .replace(/[^a-zA-Z0-9-._]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, MAX_FILENAME_LENGTH);
}

function validateFileName(fileName: string): boolean {
  // Check for suspicious patterns
  const suspicious = [
    /^\./, // Hidden files
    /\.{2,}/, // Path traversal attempts
    /^\s+|\s+$/, // Leading/trailing whitespace
    /[<>:"/\\|?*\x00-\x1F]/g, // Invalid characters
  ];

  if (suspicious.some(pattern => pattern.test(fileName))) {
    addLog(`Suspicious filename detected: ${fileName}`, 'warn');
    return false;
  }

  if (fileName.length > MAX_FILENAME_LENGTH) {
    addLog(`Filename too long: ${fileName}`, 'warn');
    return false;
  }

  return true;
}

async function validateImageContent(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
      const header = Array.from(arr).map(byte => byte.toString(16)).join('');
      
      // Check file signatures
      const signatures = {
        'image/jpeg': ['ffd8ff'],
        'image/png': ['89504e47'],
        'image/gif': ['47494638'],
        'image/webp': ['52494646'],
      };
      
      const declaredType = file.type as keyof typeof signatures;
      const validSignature = signatures[declaredType]?.some(sig => 
        header.startsWith(sig)
      );

      if (!validSignature && declaredType in signatures) {
        addLog(`Invalid file signature for type ${declaredType}`, 'warn');
      }
      
      resolve(!!validSignature);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file);
  });
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  sanitizedName?: string;
}

export async function validateFile(file: File): Promise<ValidationResult> {
  // Validate filename first
  if (!validateFileName(file.name)) {
    return {
      valid: false,
      message: 'Invalid filename',
      sanitizedName: sanitizeFileName(file.name),
    };
  }

  // Check file type
  if (!validateFileType(file)) {
    return {
      valid: false,
      message: `Unsupported file type. Please upload one of: ${ALLOWED_FILE_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (!validateFileSize(file)) {
    return {
      valid: false,
      message: `File size must be between ${formatFileSize(MIN_FILE_SIZE)} and ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  // Validate image content
  if (!(await validateImageContent(file))) {
    return {
      valid: false,
      message: 'Invalid image content',
    };
  }

  return {
    valid: true,
    sanitizedName: sanitizeFileName(file.name),
  };
}

export default {
  validateFile,
  validateFileType,
  validateFileSize,
  sanitizeFileName,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  MIN_FILE_SIZE,
  formatFileSize,
};