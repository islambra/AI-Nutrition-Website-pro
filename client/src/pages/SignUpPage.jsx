import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  User, Mail, Lock, Scale, Ruler, ArrowRight, ChevronRight, ChevronLeft 
} from 'lucide-react';
import { clsx } from 'clsx';

import { registerUser } from "../api/userApi";
import './SignUpPage.css';

// Simplified Schema for patient profile fields
const signupSchema = z.object({
  role: z.literal('user').default('user'),
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  // Profile Fields (Patient)
  age: z.coerce.number().min(1, "Age is required").max(120).optional(),
  gender: z.string().optional(),
  height: z.coerce.number().min(40, "Height must be valid").optional(),
  weight: z.coerce.number().min(2, "Weight must be valid").optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function SignUpPage() {
  const role = 'user'; // Fixed role
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'user', gender: 'other' }
  });

  const watchHeight = useWatch({ control, name: 'height' });
  const watchWeight = useWatch({ control, name: 'weight' });

  // Automatic BMI Calculation
  const bmi = useMemo(() => {
    if (watchHeight && watchWeight) {
      const heightInMeters = watchHeight / 100;
      return (watchWeight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  }, [watchHeight, watchWeight]);

  useEffect(() => {
    setValue('role', role);
  }, [role, setValue]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values, bmi };
      await registerUser(payload);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#34C759', '#000000', '#ffffff']
      });

      toast.success('Account created!', {
        description: 'Your health journey starts now. Please log in.',
      });
      
      setTimeout(() => navigate('/Login'), 2000);
    } catch (err) {
      toast.error('Registration failed', {
        description: err.response?.data?.message || 'Please check your information.',
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
        onClick={() => navigate(-1)}
        aria-label="Go Back"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </button>

      {/* Left Side: Visual */}
      <div className="split-image-side signup-visual">
        <div className="overlay-content">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="brand-badge"
          >
            AI Nutrition Pro
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Start Your Transformation
          </motion.h1>
          <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="signup-benefits"
          >
            <li><ChevronRight size={18} /> AI Calorie Estimation</li>
            <li><ChevronRight size={18} /> Professional Consultations</li>
            <li><ChevronRight size={18} /> Smart Meal Planning</li>
          </motion.ul>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="split-form-side scrollable-form">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="form-wrapper-stripe-wide"
        >
          <div className="header-stripe">
            <h2>User Sign Up</h2>
            <p>Join thousands of users tracking their success.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-stripe">
            
            <div className="form-section-title">Account Information</div>
            
            <div className="input-group-stripe">
              <label>Full Name</label>
              <div className={clsx("input-container-stripe", errors.name && "error")}>
                <User className="input-icon-stripe" size={18} />
                <input {...register("name")} placeholder="John Doe" disabled={loading} />
              </div>
              {errors.name && <span className="error-message-stripe">{errors.name.message}</span>}
            </div>

            <div className="input-group-stripe">
              <label>Email Address</label>
              <div className={clsx("input-container-stripe", errors.email && "error")}>
                <Mail className="input-icon-stripe" size={18} />
                <input {...register("email")} placeholder="you@example.com" disabled={loading} />
              </div>
              {errors.email && <span className="error-message-stripe">{errors.email.message}</span>}
            </div>

            <div className="form-row-stripe">
              <div className="input-group-stripe">
                <label>Password</label>
                <div className={clsx("input-container-stripe", errors.password && "error")}>
                  <Lock className="input-icon-stripe" size={18} />
                  <input type="password" {...register("password")} placeholder="••••••••" disabled={loading} />
                </div>
                {errors.password && <span className="error-message-stripe">{errors.password.message}</span>}
              </div>
              <div className="input-group-stripe">
                <label>Confirm</label>
                <div className={clsx("input-container-stripe", errors.confirmPassword && "error")}>
                  <Lock className="input-icon-stripe" size={18} />
                  <input type="password" {...register("confirmPassword")} placeholder="••••••••" disabled={loading} />
                </div>
                {errors.confirmPassword && <span className="error-message-stripe">{errors.confirmPassword.message}</span>}
              </div>
            </div>

            <div className="user-only-section">
              <div className="form-section-title">Physical Profile</div>

              <div className="form-row-stripe triple">
                <div className="input-group-stripe">
                  <label>Age</label>
                  <div className="input-container-stripe">
                    <input type="number" {...register("age")} placeholder="25" />
                  </div>
                </div>
                <div className="input-group-stripe">
                  <label>Gender</label>
                  <div className="input-container-stripe">
                    <select {...register("gender")}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="input-group-stripe">
                  <label>BMI</label>
                  <div className="input-container-stripe readonly-highlight">
                    <input value={bmi || '--'} readOnly placeholder="BMI" />
                  </div>
                </div>
              </div>

              <div className="form-row-stripe">
                <div className="input-group-stripe">
                  <label>Height (cm)</label>
                  <div className="input-container-stripe">
                    <Ruler className="input-icon-stripe" size={18} />
                    <input type="number" {...register("height")} placeholder="175" />
                  </div>
                </div>
                <div className="input-group-stripe">
                  <label>Weight (kg)</label>
                  <div className="input-container-stripe">
                    <Scale className="input-icon-stripe" size={18} />
                    <input type="number" {...register("weight")} placeholder="70" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-stripe-primary" disabled={loading}>
              {loading ? "Processing..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div className="footer-stripe">
              <p>Already have an account? <NavLink to="/login">Sign In</NavLink></p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default SignUpPage;
