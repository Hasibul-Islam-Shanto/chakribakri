export interface VerificationTokenRecord {
  id: string;
  userId: string;
  email: string;
  codeHash: string;
  attemptsCount: number;
  expiresAt: Date;
  createdAt: Date;
}

export interface VerificationActionResult {
  isSuccess: boolean;
  hasError: boolean;
  errorMessage?: string;
  isVerified?: boolean;
  cooldownSeconds?: number;
}

export interface ResendCodeActionResult {
  isSuccess: boolean;
  hasError: boolean;
  errorMessage?: string;
  cooldownSeconds?: number;
  devOtpCode?: string;
}

export interface OtpInputProps {
  digitCount?: number;
  currentValue: string;
  onOtpChange: (newOtpValue: string) => void;
  isDisabled?: boolean;
  hasError?: boolean;
  isAutoFocused?: boolean;
}
