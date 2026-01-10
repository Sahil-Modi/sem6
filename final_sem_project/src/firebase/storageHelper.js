import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'verification-docs/ngo123.pdf')
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload verification document for NGO/Hospital
 * @param {File} file - Document file
 * @param {string} userId - User ID
 * @param {string} userRole - User role (ngo/hospital)
 * @returns {Promise<string>} Download URL
 */
export const uploadVerificationDocument = async (file, userId, userRole) => {
  const timestamp = Date.now();
  const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const path = `verification-docs/${userRole}/${userId}/${timestamp}_${fileName}`;
  
  return await uploadFile(file, path);
};

/**
 * Upload profile picture
 * @param {File} file - Image file
 * @param {string} userId - User ID
 * @returns {Promise<string>} Download URL
 */
export const uploadProfilePicture = async (file, userId) => {
  const path = `profile-pictures/${userId}/${Date.now()}_${file.name}`;
  return await uploadFile(file, path);
};

/**
 * Upload request attachment
 * @param {File} file - Attachment file
 * @param {string} requestId - Request ID
 * @returns {Promise<string>} Download URL
 */
export const uploadRequestAttachment = async (file, requestId) => {
  const path = `request-attachments/${requestId}/${Date.now()}_${file.name}`;
  return await uploadFile(file, path);
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} {valid: boolean, error: string}
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
  } = options;

  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `File size must be less than ${maxMB}MB` };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Accepted: ${allowedExtensions.join(', ')}` };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
    return { valid: false, error: `File extension not allowed. Accepted: ${allowedExtensions.join(', ')}` };
  }

  return { valid: true, error: null };
};
