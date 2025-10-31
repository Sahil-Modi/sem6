import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../../context/AuthContext';

// Mock Firebase
jest.mock('../../firebase/config', () => ({
  auth: {},
  db: {}
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    loginWithGoogle: jest.fn()
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('should render login form', () => {
    renderLogin();
    
    expect(screen.getByText('🏥 MediReach')).toBeInTheDocument();
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should allow user to type email and password', () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should have Google login button', () => {
    renderLogin();
    
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('should have link to register page', () => {
    renderLogin();
    
    expect(screen.getByText('Register here')).toBeInTheDocument();
  });

  it('should show loading state when submitting', async () => {
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();
  });
});
