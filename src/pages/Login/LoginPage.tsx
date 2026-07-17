import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, FormField, Input } from '../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { consumeAuthNotice, toApiClientError } from '../../api/errors';
import './login.css';

export default function LoginPage() {
  const { login, isAuthenticated, permissionsLoaded, currentUser } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const notice = consumeAuthNotice();
    if (notice) setError(notice);
  }, []);

  if (permissionsLoaded && isAuthenticated && currentUser?.role !== 'organizer') {
    return <Navigate to="/console" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login({ identifier: identifier.trim(), password });
      if (!user) return;
      navigate('/console', { replace: true });
    } catch (err) {
      setError(toApiClientError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__panel">
        <div className="login-page__brand">
          <div className="login-page__logo">DYL</div>
          <h1 className="login-page__title">Design Your Life</h1>
          <p className="login-page__subtitle">内部运营后台</p>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <FormField label="手机号或账号" htmlFor="identifier" required>
            <Input
              id="identifier"
              name="identifier"
              autoComplete="username"
              placeholder="手机号或账号"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField label="密码" htmlFor="password" required>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          {error && <div className="login-page__error">{error}</div>}

          <Button type="submit" variant="primary" block disabled={submitting}>
            {submitting ? '登录中…' : '登录'}
          </Button>
        </form>

        {import.meta.env.VITE_AUTH_MOCK === 'true' && (
          <p className="login-page__mock-hint">
            Mock 已开启。可用账号：admin / content / event / no_permission /
            organizer，密码均为 123456
          </p>
        )}
      </div>
    </div>
  );
}
