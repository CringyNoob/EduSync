// Department codes mapping
const DEPT_CODES = {
  '011': 'bscse',   // CSE
  '015': 'bsds',    // Data Science
  '012': 'bsee',    // EEE
  '013': 'bseco',   // Economics
  '014': 'bsmj',    // Media & Journalism
  '016': 'bsbt',    // Biotechnology
};

// Email Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Check for university domain with department prefix
  // Format: studentid@dept.uiu.ac.bd or name@dept.uiu.ac.bd
  const domainPattern = /@[a-z]+\.uiu\.ac\.bd$/;
  return domainPattern.test(email.toLowerCase());
};

export const getEmailError = (email: string): string | undefined => {
  if (!email) return 'Email is required';
  if (!email.includes('@')) return 'Invalid email format';
  
  const domainPattern = /@[a-z]+\.uiu\.ac\.bd$/;
  if (!domainPattern.test(email.toLowerCase())) {
    return 'Use university email (e.g., student@bscse.uiu.ac.bd)';
  }
  return undefined;
};

// Password Validation
export const validatePassword = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('At least 8 characters required');
  }

  if (password.length >= 12) {
    score++;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one special character');
  }

  // Common patterns check
  const commonPatterns = ['password', '12345', 'qwerty', 'abc123'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  // Determine level
  let level: PasswordStrength['level'];
  let color: string;

  if (score <= 2) {
    level = 'weak';
    color = '#EF4444'; // red
  } else if (score <= 4) {
    level = 'medium';
    color = '#F59E0B'; // orange
  } else if (score <= 5) {
    level = 'strong';
    color = '#10B981'; // green
  } else {
    level = 'very-strong';
    color = '#059669'; // darker green
  }

  return {
    score: Math.min(score, 6),
    level,
    feedback,
    color,
    isValid: score >= 4,
  };
};

// Student ID Validation
export const validateStudentId = (id: string): boolean => {
  // Format: 10 digits (e.g., 0112230609)
  if (!/^\d{10}$/.test(id)) return false;
  
  // Validate department code (first 3 digits)
  const deptCode = id.substring(0, 3);
  const validDeptCodes = ['011', '012', '013', '014', '015', '016'];
  if (!validDeptCodes.includes(deptCode)) return false;
  
  // Validate batch year and semester (next 3 digits)
  const batch = id.substring(3, 6);
  const year = parseInt(batch.substring(0, 2));
  const semester = parseInt(batch.substring(2, 3));
  
  // Year should be reasonable (2010-2030)
  if (year < 10 || year > 30) return false;
  
  // Semester: 1=Spring, 2=Summer, 3=Fall
  if (semester < 1 || semester > 3) return false;
  
  return true;
};

export const getStudentIdError = (id: string): string | undefined => {
  if (!id) return 'Student ID is required';
  if (!/^\d{10}$/.test(id)) {
    return 'Student ID must be exactly 10 digits';
  }
  
  const deptCode = id.substring(0, 3);
  const validDeptCodes = ['011', '012', '013', '014', '015', '016'];
  if (!validDeptCodes.includes(deptCode)) {
    return 'Invalid department code (011=CSE, 012=EEE, 013=ECO, 014=MJ, 015=DS, 016=BT)';
  }
  
  const batch = id.substring(3, 6);
  const semester = parseInt(batch.substring(2, 3));
  if (semester < 1 || semester > 3) {
    return 'Invalid semester code (1=Spring, 2=Summer, 3=Fall)';
  }
  
  return undefined;
};

// Phone Validation
export const validatePhone = (phone: string): boolean => {
  // Bangladesh phone format: 01XXXXXXXXX (11 digits)
  return /^01\d{9}$/.test(phone);
};

export const getPhoneError = (phone: string): string | undefined => {
  if (!phone) return undefined; // Phone is optional
  if (!/^01\d{9}$/.test(phone)) {
    return 'Invalid phone number format (e.g., 01712345678)';
  }
  return undefined;
};

// Name Validation
export const validateName = (name: string): boolean => {
  // At least 2 characters, only letters and spaces
  return name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
};

export const getNameError = (name: string, field: string): string | undefined => {
  if (!name) return `${field} is required`;
  if (name.length < 2) return `${field} must be at least 2 characters`;
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return `${field} can only contain letters and spaces`;
  }
  return undefined;
};

// OTP Validation
export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const getOTPError = (otp: string): string | undefined => {
  if (!otp) return 'OTP is required';
  if (!/^\d{6}$/.test(otp)) {
    return 'OTP must be exactly 6 digits';
  }
  return undefined;
};

// Password Match Validation
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): string | undefined => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return undefined;
};

// File Validation (Profile Photo)
export const validateProfilePhoto = (file: File): string | undefined => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed';
  }

  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return undefined;
};

// Batch Validation
export const validateBatch = (batch: string): boolean => {
  // Format: 4 digits (e.g., 2021)
  const year = parseInt(batch);
  const currentYear = new Date().getFullYear();
  return /^\d{4}$/.test(batch) && year >= 2000 && year <= currentYear + 1;
};

export const getBatchError = (batch: string): string | undefined => {
  if (!batch) return 'Batch/Year is required';
  if (!/^\d{4}$/.test(batch)) {
    return 'Batch must be a 4-digit year (e.g., 2021)';
  }
  const year = parseInt(batch);
  const currentYear = new Date().getFullYear();
  if (year < 2000 || year > currentYear + 1) {
    return `Batch must be between 2000 and ${currentYear + 1}`;
  }
  return undefined;
};

// Sanitize Input (prevent XSS)
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

// Check if form is valid
export const isFormValid = (errors: Record<string, string | undefined>): boolean => {
  return Object.values(errors).every(error => !error);
};
