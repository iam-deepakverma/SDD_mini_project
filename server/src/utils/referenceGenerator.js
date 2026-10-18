import crypto from 'crypto';

export const generateRegistrationReference = (prefix = 'REG') => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${year}-${randomHex}`;
};
