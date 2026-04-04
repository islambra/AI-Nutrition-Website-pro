import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  User, Mail, Lock, Scale, Ruler, ArrowRight, ChevronRight, ChevronLeft, 
  Activity, AlertCircle, Target, Heart, Dumbbell, Apple, TrendingUp, 
  Flame, Activity as ActivityIcon, Weight, Brain
} from 'lucide-react';
import { clsx } from 'clsx';

import { registerUser } from "../api/userApi";
import './SignUpPage.css';

// Updated Schema - BMI removed, gender only Male/Female
const signupSchema = z.object({
  // Account Information (Required)
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  
  // Physical Profile (Required)
  age: z.coerce.number().min(1, "Age is required").max(120),
  gender: z.enum(["Male", "Female"], {
    required_error: "Gender is required"
  }),
  heightCm: z.coerce.number().min(40, "Height must be between 40-300cm").max(300),
  weightKg: z.coerce.number().min(2, "Weight must be between 2-500kg").max(500),
  activityLevel: z.enum(["Sedentary", "Light", "Moderate", "Active", "Very Active"], {
    required_error: "Activity level is required"
  }),
  
  // Health Details (Required)
  medicalConditions: z.string().min(1, "Medical conditions are required"),
  allergies: z.string().min(1, "Allergies information is required"),
  goals: z.string().min(1, "Goals are required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [previewMetrics, setPreviewMetrics] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      gender: '',
      activityLevel: '',
      medicalConditions: '',
      allergies: '',
      goals: ''
    }
  });

  const watchActivityLevel = useWatch({ control, name: 'activityLevel' });
  const watchAge = watch('age');
  const watchGender = watch('gender');
  const watchHeightCm = watch('heightCm');
  const watchWeightKg = watch('weightKg');

  // Calculate preview health metrics in real-time
  useEffect(() => {
    if (watchAge && watchGender && watchHeightCm && watchWeightKg && watchActivityLevel) {
      const age = Number(watchAge);
      const heightCm = Number(watchHeightCm);
      const weightKg = Number(watchWeightKg);
      
      // Calculate BMR (Mifflin-St Jeor Equation)
      let bmr;
      if (watchGender === "Male") {
        bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.33 * age);
      }
      
      // Calculate TDEE
      const activityMultipliers = {
        "Sedentary": 1.2,
        "Light": 1.375,
        "Moderate": 1.55,
        "Active": 1.725,
        "Very Active": 1.9
      };
      const tdee = bmr * (activityMultipliers[watchActivityLevel] || 1.2);
      
      // Calculate BMI
      const heightMeters = heightCm / 100;
      const bmi = weightKg / (heightMeters * heightMeters);
      
      // Determine BMI Category
      let bmiCategory;
      if (bmi < 18.5) bmiCategory = "Underweight";
      else if (bmi < 25) bmiCategory = "Normal";
      else if (bmi < 30) bmiCategory = "Overweight";
      else bmiCategory = "Obesity";
      
      // Calculate Ideal Weight
      let idealWeightKg;
      if (watchGender === "Male") {
        idealWeightKg = heightCm - 100 - ((heightCm - 150) / 4);
      } else {
        idealWeightKg = heightCm - 100 - ((heightCm - 150) / 2.5);
      }
      
      // Calculate Body Fat Percentage
      const genderCoefficient = watchGender === "Male" ? 1 : 0;
      let bodyFatPercentage = -44.988 + (0.503 * age) + (10.689 * genderCoefficient) + (3.172 * bmi) - (0.026 * bmi * bmi);
      bodyFatPercentage = Math.max(5, Math.min(50, bodyFatPercentage));
      
      setPreviewMetrics({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        bmi: bmi.toFixed(1),
        bmiCategory,
        idealWeightKg: idealWeightKg.toFixed(1),
        bodyFatPercentage: bodyFatPercentage.toFixed(1)
      });
    } else {
      setPreviewMetrics(null);
    }
  }, [watchAge, watchGender, watchHeightCm, watchWeightKg, watchActivityLevel]);

  // Update selected activity display
  useEffect(() => {
    setSelectedActivity(watchActivityLevel || '');
  }, [watchActivityLevel]);

  const activityOptions = [
    { value: "Sedentary", label: "Sedentary — Office work, no exercise", calories: "Low", multiplier: "1.2" },
    { value: "Light", label: "Light — 1–3 workouts/week", calories: "Moderate", multiplier: "1.375" },
    { value: "Moderate", label: "Moderate — 3–5 workouts/week", calories: "Active", multiplier: "1.55" },
    { value: "Active", label: "Active — Daily workouts", calories: "High", multiplier: "1.725" },
    { value: "Very Active", label: "Very Active — Physical job + training", calories: "Very High", multiplier: "1.9" }
  ];

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        age: values.age,
        gender: values.gender,
        heightCm: values.heightCm,
        weightKg: values.weightKg,
        activityLevel: values.activityLevel,
        medicalConditions: values.medicalConditions ? values.medicalConditions.split(',').map(item => item.trim()).filter(item => item) : [],
        allergies: values.allergies ? values.allergies.split(',').map(item => item.trim()).filter(item => item) : [],
        goals: values.goals || ""
      };
      
      const response = await registerUser(payload);
      
      // Trigger confetti animation
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#34C759', '#000000', '#ffffff', '#5856D6']
      });
      
      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6, x: 0.3 },
          colors: ['#34C759', '#FF9500']
        });
      }, 150);

      // Show success toast with health metrics
      toast.success('Account created successfully!', {
        description: `Welcome to AI Nutrition Pro! Your BMR: ${response.healthMetrics?.bmr} cal/day | BMI: ${response.healthMetrics?.bmi}`,
        duration: 5000,
      });
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration failed', {
        description: err.response?.data?.message || 'Please check your information and try again.',
        duration: 5000,
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

      {/* Left Side: Visual */}
      <div className="split-image-side signup-visual">
        <div className="overlay-content">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="brand-badge"
          >
            <Heart size={16} style={{ display: 'inline', marginRight: '8px' }} />
            AI Nutrition Pro
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Start Your Transformation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ marginTop: '16px', fontSize: '16px', opacity: 0.9 }}
          >
            Join thousands of users achieving their health goals
          </motion.p>
          <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="signup-benefits"
          >
            <li><ChevronRight size={18} /> <Dumbbell size={16} /> AI Calorie Estimation</li>
            <li><ChevronRight size={18} /> <Apple size={16} /> Professional Consultations</li>
            <li><ChevronRight size={18} /> <Heart size={16} /> Smart Meal Planning</li>
          </motion.ul>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="split-form-side scrollable-form">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="form-wrapper-stripe-wide"
        >
          <div className="header-stripe">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-stripe">
            
            {/* Account Information Section - Required */}
            <div className="form-section-title required">Account Information *</div>
            
            <div className="input-group-stripe">
              <label>Full Name *</label>
              <div className={clsx("input-container-stripe", errors.fullName && "error")}>
                <User className="input-icon-stripe" size={18} />
                <input 
                  {...register("fullName")} 
                  placeholder="John Doe" 
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <span className="error-message-stripe">{errors.fullName.message}</span>}
            </div>

            <div className="input-group-stripe">
              <label>Email Address *</label>
              <div className={clsx("input-container-stripe", errors.email && "error")}>
                <Mail className="input-icon-stripe" size={18} />
                <input 
                  {...register("email")} 
                  type="email"
                  placeholder="you@example.com" 
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="error-message-stripe">{errors.email.message}</span>}
            </div>

            <div className="form-row-stripe">
              <div className="input-group-stripe">
                <label>Password *</label>
                <div className={clsx("input-container-stripe", errors.password && "error")}>
                  <Lock className="input-icon-stripe" size={18} />
                  <input 
                    type="password" 
                    {...register("password")} 
                    placeholder="••••••••" 
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && <span className="error-message-stripe">{errors.password.message}</span>}
              </div>
              <div className="input-group-stripe">
                <label>Confirm Password *</label>
                <div className={clsx("input-container-stripe", errors.confirmPassword && "error")}>
                  <Lock className="input-icon-stripe" size={18} />
                  <input 
                    type="password" 
                    {...register("confirmPassword")} 
                    placeholder="••••••••" 
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && <span className="error-message-stripe">{errors.confirmPassword.message}</span>}
              </div>
            </div>

            {/* Physical Profile Section - Required */}
            <div className="form-section-title required">Physical Profile *</div>

            <div className="form-row-stripe">
              <div className="input-group-stripe">
                <label>Age *</label>
                <div className={clsx("input-container-stripe", errors.age && "error")}>
                  <input 
                    type="number" 
                    {...register("age")} 
                    placeholder="25" 
                    disabled={loading}
                  />
                </div>
                {errors.age && <span className="error-message-stripe">{errors.age.message}</span>}
              </div>
              <div className="input-group-stripe">
                <label>Gender *</label>
                <div className={clsx("input-container-stripe", errors.gender && "error")}>
                  <select {...register("gender")} disabled={loading}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {errors.gender && <span className="error-message-stripe">{errors.gender.message}</span>}
              </div>
            </div>

            <div className="form-row-stripe">
              <div className="input-group-stripe">
                <label>Height (cm) *</label>
                <div className={clsx("input-container-stripe", errors.heightCm && "error")}>
                  <Ruler className="input-icon-stripe" size={18} />
                  <input 
                    type="number" 
                    {...register("heightCm")} 
                    placeholder="175" 
                    disabled={loading}
                    step="1"
                  />
                </div>
                {errors.heightCm && <span className="error-message-stripe">{errors.heightCm.message}</span>}
              </div>
              <div className="input-group-stripe">
                <label>Weight (kg) *</label>
                <div className={clsx("input-container-stripe", errors.weightKg && "error")}>
                  <Scale className="input-icon-stripe" size={18} />
                  <input 
                    type="number" 
                    {...register("weightKg")} 
                    placeholder="70" 
                    disabled={loading}
                    step="0.1"
                  />
                </div>
                {errors.weightKg && <span className="error-message-stripe">{errors.weightKg.message}</span>}
              </div>
            </div>

            {/* Activity Level Selection */}
            <div className="input-group-stripe">
              <label>Activity Level *</label>
              <div className={clsx("activity-selector-container", errors.activityLevel && "error")}>
                <Activity className="input-icon-stripe" size={18} />
                <select 
                  {...register("activityLevel")} 
                  className={clsx("activity-select", !selectedActivity && "placeholder")}
                  onChange={(e) => {
                    setValue("activityLevel", e.target.value);
                    trigger("activityLevel");
                  }}
                  disabled={loading}
                >
                  <option value="">Select your activity level</option>
                  {activityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.calories} activity (x{option.multiplier})
                    </option>
                  ))}
                </select>
              </div>
              {errors.activityLevel && <span className="error-message-stripe">{errors.activityLevel.message}</span>}
            </div>

            {/* Live Health Metrics Preview */}
            {previewMetrics && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="health-metrics-preview"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  margin: '16px 0',
                  color: 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Brain size={20} />
                  <strong>Your Health Metrics (will be saved)</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <div style={{ opacity: 0.8, fontSize: '12px' }}>BMR</div>
                    <div style={{ fontWeight: 'bold' }}>{previewMetrics.bmr} cal/day</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.8, fontSize: '12px' }}>TDEE</div>
                    <div style={{ fontWeight: 'bold' }}>{previewMetrics.tdee} cal/day</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.8, fontSize: '12px' }}>BMI</div>
                    <div style={{ fontWeight: 'bold' }}>{previewMetrics.bmi} ({previewMetrics.bmiCategory})</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.8, fontSize: '12px' }}>Ideal Weight</div>
                    <div style={{ fontWeight: 'bold' }}>{previewMetrics.idealWeightKg} kg</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.8, fontSize: '12px' }}>Body Fat</div>
                    <div style={{ fontWeight: 'bold' }}>{previewMetrics.bodyFatPercentage}%</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Health Details Section - Required */}
            <div className="form-section-title required">Health Details *</div>

            <div className="input-group-stripe">
              <label>Medical Conditions *</label>
              <div className={clsx("input-container-stripe", errors.medicalConditions && "error")}>
                <AlertCircle className="input-icon-stripe" size={18} />
                <input 
                  {...register("medicalConditions")} 
                  placeholder="e.g., Diabetes, PCOS (comma separated)" 
                  disabled={loading}
                />
              </div>
              {errors.medicalConditions && <span className="error-message-stripe">{errors.medicalConditions.message}</span>}
              <small className="helper-text">Separate multiple conditions with commas</small>
            </div>

            <div className="input-group-stripe">
              <label>Allergies *</label>
              <div className={clsx("input-container-stripe", errors.allergies && "error")}>
                <AlertCircle className="input-icon-stripe" size={18} />
                <input 
                  {...register("allergies")} 
                  placeholder="e.g., Peanuts, Lactose (comma separated)" 
                  disabled={loading}
                />
              </div>
              {errors.allergies && <span className="error-message-stripe">{errors.allergies.message}</span>}
              <small className="helper-text">Separate multiple allergies with commas</small>
            </div>

            <div className="input-group-stripe">
              <label>Your Goals *</label>
              <div className={clsx("input-container-stripe", errors.goals && "error")}>
                <Target className="input-icon-stripe" size={18} />
                <textarea 
                  {...register("goals")} 
                  placeholder="e.g., Weight loss, muscle gain, better nutrition..." 
                  rows="3" 
                  disabled={loading}
                />
              </div>
              {errors.goals && <span className="error-message-stripe">{errors.goals.message}</span>}
            </div>

            <button type="submit" className="btn-stripe-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
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