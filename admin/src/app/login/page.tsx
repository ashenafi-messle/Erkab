'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiClient, ApiError } from '../../lib/api/client';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  WifiOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, refreshUser, connectionError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetryingConnection, setIsRetryingConnection] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ message: string; isError: boolean } | null>(null);

  // Asynchronous redirection: only redirect once authoritative server role is present
  useEffect(() => {
    if (user && user.role) {
      if (user.role === 'SUPER_ADMIN') {
        router.replace('/super-admin/dashboard');
      } else if (user.role === 'SUB_ADMIN') {
        router.replace('/sub-admin/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please enter both your administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login(cleanEmail, cleanPassword);
      // Authoritative redirection based strictly on the role returned by the server
      if (loggedUser.role === 'SUPER_ADMIN') {
        router.replace('/super-admin/dashboard');
      } else if (loggedUser.role === 'SUB_ADMIN') {
        router.replace('/sub-admin/dashboard');
      } else {
        setErrorMessage('Unrecognized organizational role. Please contact system administration.');
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryConnection = async () => {
    setIsRetryingConnection(true);
    try {
      await refreshUser();
    } finally {
      setIsRetryingConnection(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotSubmitting(true);
    setForgotStatus(null);
    try {
      const res = await apiClient<{ success: boolean; message: string }>('/admin/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      setForgotStatus({
        message: res.message || 'If an account exists, password recovery instructions have been dispatched.',
        isError: false,
      });
    } catch (err: any) {
      setForgotStatus({
        message: err.message || 'Unable to process recovery request at this time.',
        isError: true,
      });
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center p-3 p-sm-4"
      style={{
        background: 'linear-gradient(135deg, #071927 0%, #0d2844 50%, #0a1f33 100%)',
      }}
    >
      <div className="w-100" style={{ maxWidth: '440px' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 mb-2 shadow"
            style={{ width: 56, height: 56, fontSize: '1.75rem', fontWeight: 800 }}
          >
            E
          </div>
          <h1 className="h3 fw-bold text-white mb-1">ERKAB PORTAL</h1>
          <p className="text-white-50 small mb-0">
            Skills Training Organization &bull; Staff Authentication
          </p>
        </div>

        {/* Card */}
        <div className="card shadow-lg border-0 rounded-4 p-3 p-sm-4 bg-white">
          <div className="mb-3 text-center">
            <h2 className="h5 fw-bold text-dark mb-1">Administrator Sign In</h2>
            <p className="text-muted small mb-0">
              Enter your authorized organizational credentials to access the portal.
            </p>
          </div>

          {/* Non-blocking API Connection Status Banner if server is unreachable */}
          {connectionError && (
            <div
              className="alert alert-warning py-2 px-3 small rounded-3 mb-3 d-flex align-items-center justify-content-between gap-2"
              role="status"
            >
              <div className="d-flex align-items-center gap-2">
                <WifiOff size={16} className="text-warning flex-shrink-0" />
                <span>Backend service connecting...</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-dark py-0 px-2"
                style={{ fontSize: '0.72rem' }}
                onClick={handleRetryConnection}
                disabled={isRetryingConnection}
              >
                {isRetryingConnection ? 'Connecting...' : 'Retry'}
              </button>
            </div>
          )}

          {errorMessage && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3"
              role="alert"
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary" htmlFor="admin-email">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <Mail size={16} />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  className="form-control border-start-0"
                  placeholder="name@erkab.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-secondary mb-0" htmlFor="admin-password">
                  Password
                </label>
                <button
                  type="button"
                  className="btn btn-link p-0 small text-decoration-none"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => setShowForgotModal(true)}
                  disabled={isSubmitting}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <Lock size={16} />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-light border border-start-0 text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3 mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <p className="text-center text-white-50 mt-4 small" style={{ fontSize: '0.75rem' }}>
          Authorized staff only. Sessions are cryptographically signed and auditable.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={() => setShowForgotModal(false)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow rounded-4 border-0">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-dark">Password Recovery</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotStatus(null);
                    }}
                  />
                </div>
                <div className="modal-body py-3">
                  <p className="text-muted small mb-3">
                    Enter your registered administrator email address to trigger a cryptographic password recovery token.
                  </p>

                  {forgotStatus && (
                    <div
                      className={`alert ${
                        forgotStatus.isError ? 'alert-danger' : 'alert-success'
                      } d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3`}
                    >
                      {forgotStatus.isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                      <span>{forgotStatus.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">
                        Registered Administrator Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="admin@erkab.org"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={forgotSubmitting}
                        required
                      />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-light border"
                        onClick={() => {
                          setShowForgotModal(false);
                          setForgotStatus(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                        disabled={forgotSubmitting}
                      >
                        {forgotSubmitting && <span className="spinner-border spinner-border-sm" />}
                        <span>Send Instructions</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
