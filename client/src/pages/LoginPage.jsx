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
import "./LoginPage.css";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
        const userRole = user.role || "Patient";
        
        toast.success(`Welcome back, ${user.fullName || 'User'}!`, {
          description: `Logged in as ${userRole}`,
          duration: 3000,
        });
        
        // Navigate to home page only
        setTimeout(() => navigate("/"), 1500);
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed", {
        description: err.message || "Invalid email or password. Please try again.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-split-container">
      {/* Back Button */}
      <button 
        className="back-btn-stripe" 
        onClick={() => navigate('/')}
        aria-label="Go Back"
      >
        <ChevronLeft size={20} />
        <span>Back to Home</span>
      </button>

      {/* Left Side: Image */}
      <div className="split-image-side login-visual">
        <div className="overlay-content">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="brand-badge-login"
          >
            AI Nutrition Pro
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Welcome Back to <br /><span>Your Health Journey</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Experience the future of personalized nutrition with our AI-powered tracking and expert guidance.
          </motion.p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="split-form-side">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="form-wrapper-stripe"
        >
          <div className="header-stripe">
            <h2>Welcome Back</h2>
            <p>Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-stripe">
            <div className="input-group-stripe">
              <label>Email Address</label>
              <div className={clsx("input-container-stripe", errors.email && "error")}>
                <Mail className="input-icon-stripe" size={18} />
                <input 
                  {...register("email")} 
                  type="email"
                  placeholder="name@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="error-message-stripe">{errors.email.message}</span>}
            </div>

            <div className="input-group-stripe">
              <div className="label-flex-stripe">
                <label>Password</label>
                <NavLink to="/forgot-password" className="forgot-link-stripe">Forgot Password?</NavLink>
              </div>
              <div className={clsx("input-container-stripe", errors.password && "error")}>
                <Lock className="input-icon-stripe" size={18} />
                <input 
                  type="password" 
                  {...register("password")} 
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <span className="error-message-stripe">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn-stripe-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="footer-stripe">
              <p>Don't have an account? <NavLink to="/signup">Create one for free</NavLink></p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;