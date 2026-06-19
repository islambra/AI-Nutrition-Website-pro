import crypto from 'crypto';

export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  maxLength: 128
};

export const validatePasswordStrength = (password) => {
  const errors = [];
  if (!password || password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters`);
  }
  if (password && password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_POLICY.maxLength} characters`);
  }
  if (PASSWORD_POLICY.requireUppercase && password && !/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (PASSWORD_POLICY.requireLowercase && password && !/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (PASSWORD_POLICY.requireNumber && password && !/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (PASSWORD_POLICY.requireSpecial && password && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain a special character');
  }
  return errors;
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
