import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  User, Mail, Lock, Activity, Scale, Ruler, 
  AlertCircle, Target, Camera, ArrowRight, ChevronRight 
} from 'lucide-react';
import { clsx } from 'clsx';

import { registerUser } from "../api/userApi";
import './SignUpPage.css';

// Enhanced Schema for all profile fields
const signupSchema = z.object({
  role: z.enum(['user', 'nutritionist']),
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  // Profile Fields (User Only)
  age: z.coerce.number().min(1, "Age is required").max(120).optional(),
  gender: z.string().optional(),
  height: z.coerce.number().min(40, "Height must be valid").optional(),
  weight: z.coerce.number().min(2, "Weight must be valid").optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  goals: z.string().optional(),
  specialization: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'nutritionist' && !data.specialization) return false;
  return true;
}, {
  message: "Specialization is required for professionals",
  path: ["specialization"],
});

function SignUpPage() {
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicture(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values, bmi, profilePicture: profilePreview };
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
            {role === 'user' ? 'Start Your Transformation' : 'Join as a Professional'}
          </motion.h1>
          <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="signup-benefits"
          >
            <li><ChevronRight size={18} /> {role === 'user' ? 'AI Calorie Estimation' : 'Expand your reach'}</li>
            <li><ChevronRight size={18} /> {role === 'user' ? 'Professional Consultations' : 'Manage your clients'}</li>
            <li><ChevronRight size={18} /> {role === 'user' ? 'Smart Meal Planning' : 'Provide expert guidance'}</li>
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
            <h2>{role === 'user' ? 'User Sign Up' : 'Nutritionist Sign Up'}</h2>
            <p>{role === 'user' ? 'Join thousands of users tracking their success.' : 'Help others achieve their health goals.'}</p>
          </div>

          <div className="role-selector-stripe">
            <button 
              type="button" 
              className={clsx("role-btn-stripe", role === 'user' && "active")}
              onClick={() => { setRole('user'); reset({ role: 'user' }); }}
            >
              I am a Client
            </button>
            <button 
              type="button" 
              className={clsx("role-btn-stripe", role === 'nutritionist' && "active")}
              onClick={() => { setRole('nutritionist'); reset({ role: 'nutritionist' }); }}
            >
              I am a Nutritionist
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-stripe">
            
            {/* Profile Picture Upload */}
            <div className="profile-upload-section">
              <div className="avatar-preview">
                {profilePreview ? (
                  <img src={profilePreview} alt="Preview" />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
                <label htmlFor="pfp-upload" className="upload-badge">
                  <Camera size={16} />
                </label>
              </div>
              <input 
                id="pfp-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                hidden 
              />
              <p className="upload-label">Upload Profile Picture</p>
            </div>

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

            {role === 'nutritionist' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="input-group-stripe"
              >
                <label>Specialization</label>
                <div className={clsx("input-container-stripe", errors.specialization && "error")}>
                  <Target className="input-icon-stripe" size={18} />
                  <input {...register("specialization")} placeholder="e.g. Sports Nutrition" disabled={loading} />
                </div>
                {errors.specialization && <span className="error-message-stripe">{errors.specialization.message}</span>}
              </motion.div>
            )}

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

            <AnimatePresence mode="wait">
              {role === 'user' && (
                <motion.div 
                  key="user-specific-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="user-only-section"
                >
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

                  <div className="form-section-title">Health Details</div>

                  <div className="input-group-stripe">
                    <label>Medical Conditions</label>
                    <div className="input-container-stripe">
                      <Activity className="input-icon-stripe" size={18} />
                      <input {...register("medicalConditions")} placeholder="e.g. Diabetes, PCOS" />
                    </div>
                  </div>

                  <div className="input-group-stripe">
                    <label>Allergies</label>
                    <div className="input-container-stripe">
                      <AlertCircle className="input-icon-stripe" size={18} />
                      <input {...register("allergies")} placeholder="e.g. Peanuts, Lactose" />
                    </div>
                  </div>

                  <div className="input-group-stripe">
                    <label>Your Goals</label>
                    <div className="input-container-stripe">
                      <textarea {...register("goals")} placeholder="e.g. Weight loss, muscle gain..." rows={3} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
