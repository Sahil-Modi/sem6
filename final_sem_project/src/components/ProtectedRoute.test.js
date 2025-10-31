import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

const TestComponent = () => <div>Protected Content</div>;

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  it('should redirect to login when user is not authenticated', () => {
    useAuth.mockReturnValue({
      currentUser: null,
      userData: null
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: '123' },
      userData: { role: 'donor' }
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show access denied for wrong role', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: '123' },
      userData: { role: 'donor' }
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['admin']}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user has correct role', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: '123' },
      userData: { role: 'admin' }
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['admin', 'ngo']}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
