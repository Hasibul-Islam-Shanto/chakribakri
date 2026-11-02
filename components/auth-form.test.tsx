import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from '@/components/auth-form';
import { AuthActionResult } from '@/actions/auth-actions';

describe('Auth View Switcher Component (components/auth-form.test.tsx)', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('toggles seamlessly between "Sign In" and "Sign Up" view states', () => {
    render(<AuthForm />);

    // Initial state: Sign In
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sign in');
    expect(screen.getByRole('button', { name: /switch to sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Confirm Password/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign in/i })).toBeInTheDocument();

    // Toggle to Sign Up state
    const switchToSignUpButton = screen.getByRole('button', { name: /switch to create account/i });
    fireEvent.click(switchToSignUpButton);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create an account');
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Create account/i })).toBeInTheDocument();

    // Toggle back to Sign In state
    const switchToSignInButton = screen.getByRole('button', { name: /switch to sign in/i });
    fireEvent.click(switchToSignInButton);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sign in');
    expect(screen.queryByLabelText(/Confirm Password/i)).not.toBeInTheDocument();
  });

  it('triggers client-side validation errors upon invalid inputs without submitting', async () => {
    const mockSignInHandler = vi.fn().mockResolvedValue({
      hasError: false,
      isSuccess: true,
    } as AuthActionResult);

    render(<AuthForm onSignIn={mockSignInHandler} />);

    const submitButtonElement = screen.getByRole('button', { name: /^Sign in/i });

    // Submit with empty fields
    fireEvent.click(submitButtonElement);

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mockSignInHandler).not.toHaveBeenCalled();

    // Fill valid username but keep password empty
    const usernameInputElement = screen.getByLabelText(/^Username/i);
    fireEvent.change(usernameInputElement, { target: { value: 'johndoe' } });
    fireEvent.click(submitButtonElement);

    expect(screen.queryByText('Username is required.')).not.toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mockSignInHandler).not.toHaveBeenCalled();
  });

  it('triggers sign-up specific validation for short passwords and mismatched confirmation', async () => {
    const mockSignUpHandler = vi.fn().mockResolvedValue({
      hasError: false,
      isSuccess: true,
    } as AuthActionResult);

    render(<AuthForm initialMode="sign-up" onSignUp={mockSignUpHandler} />);

    const usernameInputElement = screen.getByLabelText(/^Username/i);
    const passwordInputElement = screen.getByLabelText(/^Password/i);
    const confirmPasswordInputElement = screen.getByLabelText(/Confirm Password/i);
    const submitButtonElement = screen.getByRole('button', { name: /^Create account/i });

    // Too short username and password
    fireEvent.change(usernameInputElement, { target: { value: 'ab' } });
    fireEvent.change(passwordInputElement, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInputElement, { target: { value: '123456' } });
    fireEvent.click(submitButtonElement);

    expect(screen.getByText('Username must be at least 3 characters long.')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockSignUpHandler).not.toHaveBeenCalled();

    // Fix username and password length but keep mismatch
    fireEvent.change(usernameInputElement, { target: { value: 'alexsmith' } });
    fireEvent.change(passwordInputElement, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInputElement, { target: { value: 'password999' } });
    fireEvent.click(submitButtonElement);

    expect(
      screen.queryByText('Username must be at least 3 characters long.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Password must be at least 6 characters long.')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockSignUpHandler).not.toHaveBeenCalled();
  });

  it('displays retry countdown and disables submission when server returns rate-limit error', async () => {
    const rateLimitResponse: AuthActionResult = {
      hasError: true,
      errorMessage: 'Too many attempts. Please try again in 15 minutes.',
    };

    const mockSignInHandler = vi.fn().mockResolvedValue(rateLimitResponse);

    render(<AuthForm onSignIn={mockSignInHandler} />);

    const usernameInputElement = screen.getByLabelText(/^Username/i);
    const passwordInputElement = screen.getByLabelText(/^Password/i);
    const submitButtonElement = screen.getByRole('button', { name: /^Sign in/i });

    fireEvent.change(usernameInputElement, { target: { value: 'validuser' } });
    fireEvent.change(passwordInputElement, { target: { value: 'secretpass' } });

    fireEvent.click(submitButtonElement);

    await waitFor(() => {
      expect(mockSignInHandler).toHaveBeenCalledTimes(1);
    });

    // Check alert banner with countdown display
    const alertBannerElement = await screen.findByRole('alert');
    expect(alertBannerElement).toHaveTextContent(/Too many attempts/i);
    expect(alertBannerElement).toHaveTextContent(/Retry in/i);
    expect(alertBannerElement).toHaveTextContent(/15m/i);

    // Verify submit button is disabled
    expect(submitButtonElement).toBeDisabled();
    expect(submitButtonElement).toHaveAttribute('aria-disabled', 'true');
  });

  it('initializes in rate-limited state when initialFormState contains a throttle message', () => {
    const throttledInitialState: AuthActionResult = {
      hasError: true,
      errorMessage: 'Too many attempts. Please try again in 5 minutes.',
    };

    render(<AuthForm initialFormState={throttledInitialState} />);

    const alertBannerElement = screen.getByRole('alert');
    expect(alertBannerElement).toHaveTextContent(/Too many attempts/i);
    expect(alertBannerElement).toHaveTextContent(/5m/i);

    const submitButtonElement = screen.getByRole('button', { name: /^Sign in/i });
    expect(submitButtonElement).toBeDisabled();
  });
});
