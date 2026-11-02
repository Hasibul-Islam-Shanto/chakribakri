export interface SessionData {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  username: string;
  isEmailVerified?: boolean;
  loginTimestamp?: number;
}
