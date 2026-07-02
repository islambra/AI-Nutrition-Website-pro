// LoginPage.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { useSafeTimeout } from "../hooks/useSafeTimeout";
import { useTranslation, Trans } from "react-i18next";
import "./LoginPage.css";

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { setTimeoutSafe } = useSafeTimeout();
  const { t } = useTranslation();

  const loginSchema = z.object({
    email: z.string().email(t('validation.emailRequired')),
    password: z.string().min(1, t('validation.passwordRequired')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        const user = result.user;
        const userRole = user.role || "client";
        
        const roleDisplay = {
          'admin': t('auth.roleAdmin'),
          'dieteticien': t('auth.roleDieteticien'),
          'client': t('auth.roleClient'),
          'student': t('auth.roleStudent')
        }[userRole] || userRole;
        
        toast.success(t('auth.welcomeBack', { name: user.fullName || 'User' }), {
          description: t('auth.loggedInAs', { role: roleDisplay }),
          duration: 3000,
        });
        
        setTimeoutSafe(() => navigate("/"), 1500);
      } else {
        throw new Error(result.error || t('auth.loginFailed'));
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(t('auth.loginFailed'), {
        description: err.message || t('auth.invalidCredentials'),
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-split-container">
      <button 
        className="back-btn-stripe" 
        onClick={() => navigate('/')}
        aria-label="Go Back"
      >
        <ChevronLeft size={20} />
        <span>{t('auth.backToHome')}</span>
      </button>

      <div className="split-image-side login-visual">
        <div className="overlay-content">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="brand-badge-login"
          >
            {t('auth.aiNutritionPro')}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Trans i18nKey="auth.welcomeBackTitle">
              Welcome Back to <br /><span>Your Health Journey</span>
            </Trans>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {t('auth.welcomeDesc')}
          </motion.p>
        </div>
      </div>

      <div className="split-form-side scrollable-form">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="form-wrapper-stripe"
        >
          <div className="header-stripe">
            <h2>{t('auth.welcomeBackHeading')}</h2>
            <p>{t('auth.signInDetails')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-stripe">
            <div className="input-group-stripe">
              <label>{t('auth.emailAddress')}</label>
              <div className={clsx("input-container-stripe", errors.email && "error")}>
                <Mail className="input-icon-stripe" size={18} />
                <input 
                  {...register("email")} 
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="error-message-stripe">{errors.email.message}</span>}
            </div>

            <div className="input-group-stripe">
              <div className="label-flex-stripe">
                <label>{t('auth.password')}</label>
                <NavLink to="/forgot-password" className="forgot-link-stripe">{t('auth.forgotPassword')}</NavLink>
              </div>
              <div className={clsx("input-container-stripe", errors.password && "error")}>
                <Lock className="input-icon-stripe" size={18} />
                <input 
                  type="password" 
                  {...register("password")} 
                  placeholder={t('auth.passwordPlaceholder')}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <span className="error-message-stripe">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn-signin-stripe" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {t('auth.authenticating')}
                </>
              ) : (
                <>
                  {t('auth.signIn')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="footer-stripe">
              <p>{t('auth.noAccount')} <NavLink to="/signup">{t('auth.createOne')}</NavLink></p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;