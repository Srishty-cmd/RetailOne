export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters, and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
