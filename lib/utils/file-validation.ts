const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFileType(file: File): boolean {
  return ALLOWED_FILE_TYPES.includes(file.type);
}

function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

function validateFile(file: File): { valid: boolean; message?: string } {
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
      message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export default {
  validateFile,
  validateFileType,
  validateFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
};