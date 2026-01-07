/**
 * Image Upload Utility
 * Handles image uploads for the application
 */

/**
 * Upload image to cloud storage (placeholder - can be replaced with actual cloud service)
 * For now, converts to base64 or uses a mock upload service
 * 
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Invalid file type. Please upload JPG, PNG, WEBP, or GIF'));
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      reject(new Error('File size too large. Maximum size is 10MB'));
      return;
    }

    // For now, we'll use FileReader to convert to base64
    // In production, replace this with actual cloud storage (AWS S3, Cloudinary, etc.)
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64String = e.target.result;
      
      // For production, you would upload to cloud storage here:
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/upload', { method: 'POST', body: formData });
      // const data = await response.json();
      // resolve(data.url);
      
      // For now, return the base64 string or a placeholder URL
      // You can also use a service like imgbb, imgur API, or cloudinary
      resolve(base64String);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Upload multiple images
 * @param {FileList|File[]} files - Array of image files
 * @returns {Promise<string[]>} - Array of uploaded image URLs
 */
export const uploadMultipleImages = async (files) => {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map(file => uploadImage(file));
  
  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

/**
 * Preview image before upload
 * @param {File} file - Image file
 * @returns {Promise<string>} - Data URL for preview
 */
export const previewImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to preview image'));
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, WEBP, or GIF' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 10MB' };
  }

  return { valid: true, error: null };
};
