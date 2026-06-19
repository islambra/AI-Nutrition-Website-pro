const NODE_ENV = process.env.NODE_ENV || 'development';

export const securityLogger = {
  log(event, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      ...details
    };
    console.log(`[SECURITY] ${JSON.stringify(entry)}`);
    if (NODE_ENV === 'production') {
      // In production, send to logging service (e.g., stdout for Winston/Pino)
    }
  },

  loginAttempt(email, ip, success, userId = null) {
    this.log('LOGIN_ATTEMPT', {
      email: email ? email.replace(/(.{2})(.*)(@)/, '$1***$3') : 'unknown',
      ip,
      success,
      userId
    });
  },

  adminAction(adminId, action, targetId = null, details = '') {
    this.log('ADMIN_ACTION', { adminId, action, targetId, details });
  },

  suspiciousActivity(ip, userId, reason) {
    this.log('SUSPICIOUS_ACTIVITY', { ip, userId, reason });
  },

  fileUpload(userId, fileName, size, status) {
    this.log('FILE_UPLOAD', {
      userId,
      fileName: fileName ? fileName.replace(/\.[^.]+$/, '.***') : 'unknown',
      size,
      status
    });
  },

  rateLimitHit(ip, path) {
    this.log('RATE_LIMIT_HIT', { ip, path });
  },

  passwordReset(email, ip, success) {
    this.log('PASSWORD_RESET', {
      email: email ? email.replace(/(.{2})(.*)(@)/, '$1***$3') : 'unknown',
      ip,
      success
    });
  }
};
