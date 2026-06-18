import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Boxes, Lock, User } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/services'
import { useAuthStore, useToastStore } from '../../store'
import './Login.css'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { addToast } = useToastStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ username, password }),
    onSuccess: (res) => {
      const { data } = res.data
      setAuth(data.token, data.refreshToken, data.user)
      localStorage.setItem('token', data.token)
      addToast('success', `Welcome back, ${data.user.firstName || data.user.username}!`)
      navigate('/')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || t('invalidCredentials')
      addToast('error', msg)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    loginMutation.mutate()
  }

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb orb-1" />
        <div className="login-bg-orb orb-2" />
        <div className="login-bg-orb orb-3" />
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Boxes size={28} />
          </div>
          <div>
            <h2 className="login-logo-name">InvManager</h2>
            <p className="login-logo-sub">Inventory Management System</p>
          </div>
        </div>

        {/* Title */}
        <div className="login-header">
          <h1 className="login-title">{t('loginTitle')}</h1>
          <p className="login-subtitle">{t('loginSubtitle')}</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
          <div className="form-group">
            <label className="form-label">{t('username')}</label>
            <div className="input-wrapper">
              <span className="input-icon"><User size={16} /></span>
              <input
                type="text"
                className="form-input with-icon"
                placeholder={t('username')}
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <div className="input-wrapper">
              <span className="input-icon"><Lock size={16} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input with-icon with-icon-right"
                placeholder={t('password')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <span className="spinner" />
                {t('loggingIn')}
              </>
            ) : t('loginBtn')}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          © {new Date().getFullYear()} InvManager · All rights reserved
        </p>
      </div>
    </div>
  )
}
