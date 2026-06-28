import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  User, Mail, Lock, Scale, Ruler, ArrowRight, ChevronLeft,
  Activity, AlertCircle, Target, Heart, Brain, GraduationCap,
  Stethoscope, Upload, FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { registerUser, registerDieteticien } from "../api/userApi";
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import './SignUpPage.css';

function SignUpPage() {
  const { setTimeoutSafe } = useSafeTimeout();
  const [mode, setMode] = useState("client"); // "client" or "dieteticien"
  const [userType, setUserType] = useState("client"); // "client" or "student" (only in client mode)
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [previewMetrics, setPreviewMetrics] = useState(null);
  const [diplomaFile, setDiplomaFile] = useState(null);
  const [diplomaPreview, setDiplomaPreview] = useState(null);
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
    defaultValues: {
      fullName: '', email: '', password: '', confirmPassword: '',
      age: '', gender: '', heightCm: '', weightKg: '', activityLevel: '',
      medicalConditions: '', allergies: '', goals: '',
      studentCardNumber: '', specialty: '',
      ccpNumber: '', ccpKey: '', baridiMob: ''
    }
  });

  const watchActivityLevel = watch('activityLevel');
  const watchAge = watch('age');
  const watchGender = watch('gender');
  const watchHeightCm = watch('heightCm');
  const watchWeightKg = watch('weightKg');

  useEffect(() => {
    setSelectedActivity(watchActivityLevel || '');
  }, [watchActivityLevel]);

  // Live health metrics preview (client mode only)
  useEffect(() => {
    if (userType === "client" && watchAge && watchGender && watchHeightCm && watchWeightKg && watchActivityLevel) {
      const age = Number(watchAge);
      const heightCm = Number(watchHeightCm);
      const weightKg = Number(watchWeightKg);

      let bmr;
      if (watchGender === "Male") {
        bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.33 * age);
      }

      const activityMultipliers = {
        "Sedentary": 1.2, "Lightly Active": 1.375, "Moderate": 1.55,
        "Active": 1.725, "Very Active": 1.9
      };
      const tdee = bmr * (activityMultipliers[watchActivityLevel] || 1.2);
      const heightMeters = heightCm / 100;
      const bmi = weightKg / (heightMeters * heightMeters);

      let bmiCategory;
      if (bmi < 18.5) bmiCategory = "Underweight";
      else if (bmi < 25) bmiCategory = "Normal";
      else if (bmi < 30) bmiCategory = "Overweight";
      else bmiCategory = "Obesity";

      let idealWeightKg;
      if (watchGender === "Male") {
        idealWeightKg = heightCm - 100 - ((heightCm - 150) / 4);
      } else {
        idealWeightKg = heightCm - 100 - ((heightCm - 150) / 2.5);
      }

      const genderCoefficient = watchGender === "Male" ? 1 : 0;
      let bodyFatPercentage = -44.988 + (0.503 * age) + (10.689 * genderCoefficient) + (3.172 * bmi) - (0.026 * bmi * bmi);
      bodyFatPercentage = Math.max(5, Math.min(50, bodyFatPercentage));

      setPreviewMetrics({
        bmr: Math.round(bmr), tdee: Math.round(tdee),
        bmi: bmi.toFixed(1), bmiCategory,
        idealWeightKg: idealWeightKg.toFixed(1),
        bodyFatPercentage: bodyFatPercentage.toFixed(1)
      });
    } else {
      setPreviewMetrics(null);
    }
  }, [watchAge, watchGender, watchHeightCm, watchWeightKg, watchActivityLevel, userType]);

  const handleDiplomaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDiplomaFile(file);
      setDiplomaPreview(URL.createObjectURL(file));
    }
  };

  const activityOptions = [
    { value: "Sedentary", label: "Sedentary", multiplier: "1.2" },
    { value: "Lightly Active", label: "Lightly Active", multiplier: "1.375" },
    { value: "Moderate", label: "Moderate", multiplier: "1.55" },
    { value: "Active", label: "Active", multiplier: "1.725" },
    { value: "Very Active", label: "Very Active", multiplier: "1.9" }
  ];

  const validateForm = (values) => {
    const errors = {};
    if (!values.fullName?.trim()) errors.fullName = "Full name is required";
    if (!values.email?.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = "Invalid email";
    if (!values.password) errors.password = "Password is required";
    else if (values.password.length < 8) errors.password = "At least 8 characters";
    if (values.password !== values.confirmPassword) errors.confirmPassword = "Passwords don't match";
    if (!values.age) errors.age = "Age is required";
    if (!values.gender) errors.gender = "Gender is required";

    if (mode === "client") {
      if (userType === "client") {
        if (!values.heightCm) errors.heightCm = "Height is required";
        if (!values.weightKg) errors.weightKg = "Weight is required";
        if (!values.activityLevel) errors.activityLevel = "Activity level is required";
      } else {
        if (!values.studentCardNumber?.trim()) errors.studentCardNumber = "Student card number is required";
      }
    } else {
      if (!values.specialty?.trim()) errors.specialty = "Specialty is required";
      if (!diplomaFile) errors.diploma = "Diploma file is required";
    }
    return errors;
  };

  const onSubmit = async (values) => {
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach(msg => toast.error(msg));
      return;
    }

    setLoading(true);
    try {
      if (mode === "client") {
        const payload = {
          fullName: values.fullName, email: values.email, password: values.password,
          age: values.age, gender: values.gender, role: userType
        };

        if (userType === "client") {
          payload.heightCm = values.heightCm;
          payload.weightKg = values.weightKg;
          payload.activityLevel = values.activityLevel;
          payload.medicalConditions = values.medicalConditions
            ? values.medicalConditions.split(',').map(s => s.trim()).filter(Boolean) : [];
          payload.allergies = values.allergies
            ? values.allergies.split(',').map(s => s.trim()).filter(Boolean) : [];
          payload.goals = values.goals || "";
        } else {
          payload.studentCardNumber = values.studentCardNumber;
        }

        const response = await registerUser(payload);

        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#34C759', '#000000', '#5856D6'] });
        setTimeoutSafe(() => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6, x: 0.3 }, colors: ['#34C759', '#FF9500'] }), 150);
        toast.success('Account created successfully!', {
          description: `Welcome ${response.user?.fullName || values.fullName}!`,
          duration: 5000,
        });
        setTimeoutSafe(() => navigate('/login'), 2000);
      } else {
        const formData = new FormData();
        formData.append('fullName', values.fullName);
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('age', values.age);
        formData.append('gender', values.gender);
        formData.append('specialty', values.specialty);
        if (values.ccpNumber) formData.append('ccpNumber', values.ccpNumber);
        if (values.ccpKey) formData.append('ccpKey', values.ccpKey);
        if (values.baridiMob) formData.append('baridiMob', Number(values.baridiMob));
        if (diplomaFile) formData.append('diploma', diplomaFile);

        await registerDieteticien(formData);

        toast.success('Request submitted!', {
          description: 'You will receive an email once your account is approved.',
          duration: 6000,
        });
        setTimeoutSafe(() => navigate('/login'), 3000);
      }
    } catch (err) {
      toast.error('Registration failed', {
        description: err.response?.data?.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-split-container">
      <button className="back-btn-stripe" onClick={() => navigate('/')} aria-label="Go Back">
        <ChevronLeft size={20} /><span>Back to Home</span>
      </button>

      <div className="split-image-side signup-visual">
        <div className="overlay-content">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="brand-badge">
            <Heart size={16} style={{ display: 'inline', marginRight: '8px' }} /> AI Nutrition Pro
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            {mode === "client" ? "Start Your Transformation" : "Join as a Dieteticien"}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ marginTop: '16px', fontSize: '16px', opacity: 0.9 }}>
            {mode === "client" ? "Join thousands achieving their health goals" : "Share your expertise and grow your practice"}
          </motion.p>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="signup-benefits">
            {mode === "client" ? (
              <>
                <li>AI Calorie Estimation</li>
                <li>Professional Consultations</li>
                <li>Smart Meal Planning</li>
              </>
            ) : (
              <>
                <li>Create Meal Plans</li>
                <li>Manage Client Consultations</li>
                <li>Write Nutrition Blogs</li>
              </>
            )}
          </motion.ul>
        </div>
      </div>

      <div className="split-form-side scrollable-form">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="form-wrapper-stripe-wide">
          <div className="header-stripe">
            <h2>{mode === "client" ? "Create Account" : "Dieteticien Registration"}</h2>
            <p>{mode === "client" ? "Fill in your details to get started" : "Submit your information for review"}</p>
          </div>

          {/* Mode Toggle */}
          <div className="mode-toggle" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setMode("client")}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '12px', border: '2px solid',
                borderColor: mode === "client" ? '#2D5A27' : '#e0e0e0',
                background: mode === "client" ? '#E8F5E9' : 'white',
                cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <User size={18} /> Client / Student
            </button>
            <button
              type="button"
              onClick={() => setMode("dieteticien")}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '12px', border: '2px solid',
                borderColor: mode === "dieteticien" ? '#2D5A27' : '#e0e0e0',
                background: mode === "dieteticien" ? '#E8F5E9' : 'white',
                cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <Stethoscope size={18} /> Dieteticien
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-stripe">
            {/* Basic Info - same for both modes */}
            <div className="form-section-title required">Account Information *</div>

            <div className="input-group-stripe">
              <label>Full Name *</label>
              <div className={clsx("input-container-stripe", errors.fullName && "error")}>
                <User className="input-icon-stripe" size={18} />
                <input {...register("fullName")} placeholder="John Doe" disabled={loading} autoComplete="name" />
              </div>
            </div>

            <div className="input-group-stripe">
              <label>Email Address *</label>
              <div className={clsx("input-container-stripe", errors.email && "error")}>
                <Mail className="input-icon-stripe" size={18} />
                <input {...register("email")} type="email" placeholder="you@example.com" disabled={loading} autoComplete="email" />
              </div>
            </div>

            <div className="form-row-stripe">
              <div className="input-group-stripe">
                <label>Password *</label>
                <div className={clsx("input-container-stripe", errors.password && "error")}>
                  <Lock className="input-icon-stripe" size={18} />
                  <input type="password" {...register("password")} placeholder="••••••••" disabled={loading} autoComplete="new-password" />
                </div>
              </div>
              <div className="input-group-stripe">
                <label>Confirm Password *</label>
                <div className={clsx("input-container-stripe", errors.confirmPassword && "error")}>
                  <Lock className="input-icon-stripe" size={18} />
                  <input type="password" {...register("confirmPassword")} placeholder="••••••••" disabled={loading} autoComplete="new-password" />
                </div>
              </div>
            </div>

            <div className="form-section-title required">Personal Info *</div>

            <div className="form-row-stripe">
              <div className="input-group-stripe">
                <label>Age *</label>
                <div className={clsx("input-container-stripe", errors.age && "error")}>
                  <input type="number" {...register("age")} placeholder="25" disabled={loading} />
                </div>
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
              </div>
            </div>

            {/* Client/Student Mode Fields */}
            {mode === "client" && (
              <>
                {/* User Type Toggle */}
                <div className="form-section-title">Account Type *</div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <label
                    onClick={() => setUserType("client")}
                    style={{
                      flex: 1, padding: '16px', borderRadius: '12px', border: '2px solid',
                      borderColor: userType === "client" ? '#2D5A27' : '#e0e0e0',
                      background: userType === "client" ? '#E8F5E9' : 'white',
                      cursor: 'pointer', textAlign: 'center'
                    }}
                  >
                    <input type="radio" name="userType" checked={userType === "client"} readOnly style={{ display: 'none' }} />
                    <div style={{ fontWeight: 700, color: '#2D5A27' }}>Client</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Full health tracking & meal plans</div>
                  </label>
                  <label
                    onClick={() => setUserType("student")}
                    style={{
                      flex: 1, padding: '16px', borderRadius: '12px', border: '2px solid',
                      borderColor: userType === "student" ? '#2D5A27' : '#e0e0e0',
                      background: userType === "student" ? '#E8F5E9' : 'white',
                      cursor: 'pointer', textAlign: 'center'
                    }}
                  >
                    <input type="radio" name="userType" checked={userType === "student"} readOnly style={{ display: 'none' }} />
                    <div style={{ fontWeight: 700, color: '#2D5A27' }}>Student</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Student card required</div>
                  </label>
                </div>

                {/* Client Fields */}
                {userType === "client" && (
                  <>
                    <div className="form-section-title required">Physical Profile *</div>
                    <div className="form-row-stripe">
                      <div className="input-group-stripe">
                        <label>Height (cm) *</label>
                        <div className={clsx("input-container-stripe", errors.heightCm && "error")}>
                          <Ruler className="input-icon-stripe" size={18} />
                          <input type="number" {...register("heightCm")} placeholder="175" disabled={loading} />
                        </div>
                      </div>
                      <div className="input-group-stripe">
                        <label>Weight (kg) *</label>
                        <div className={clsx("input-container-stripe", errors.weightKg && "error")}>
                          <Scale className="input-icon-stripe" size={18} />
                          <input type="number" {...register("weightKg")} placeholder="70" disabled={loading} step="0.1" />
                        </div>
                      </div>
                    </div>

                    <div className="input-group-stripe">
                      <label>Activity Level *</label>
                      <div className={clsx("activity-selector-container", errors.activityLevel && "error")}>
                        <Activity className="input-icon-stripe" size={18} />
                        <select
                          {...register("activityLevel")}
                          className={clsx("activity-select", !selectedActivity && "placeholder")}
                          onChange={(e) => { setValue("activityLevel", e.target.value); trigger("activityLevel"); }}
                          disabled={loading}
                        >
                          <option value="">Select your activity level</option>
                          {activityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label} (x{opt.multiplier})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {previewMetrics && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '16px', borderRadius: '12px', margin: '16px 0', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <Brain size={20} /><strong>Your Health Metrics</strong>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>BMR</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.bmr} cal/day</div></div>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>TDEE</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.tdee} cal/day</div></div>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>BMI</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.bmi} ({previewMetrics.bmiCategory})</div></div>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>Ideal Weight</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.idealWeightKg} kg</div></div>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>Body Fat</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.bodyFatPercentage}%</div></div>
                        </div>
                      </motion.div>
                    )}

                    <div className="form-section-title">Health Details (Optional)</div>

                    <div className="input-group-stripe">
                      <label>Medical Conditions</label>
                      <div className={clsx("input-container-stripe", errors.medicalConditions && "error")}>
                        <AlertCircle className="input-icon-stripe" size={18} />
                        <input {...register("medicalConditions")} placeholder="e.g., Diabetes, PCOS (comma separated)" disabled={loading} />
                      </div>
                      <small className="helper-text">Optional - Separate with commas</small>
                    </div>

                    <div className="input-group-stripe">
                      <label>Allergies</label>
                      <div className={clsx("input-container-stripe", errors.allergies && "error")}>
                        <AlertCircle className="input-icon-stripe" size={18} />
                        <input {...register("allergies")} placeholder="e.g., Peanuts, Lactose (comma separated)" disabled={loading} />
                      </div>
                      <small className="helper-text">Optional - Separate with commas</small>
                    </div>

                    <div className="input-group-stripe">
                      <label>Your Goals</label>
                      <div className={clsx("input-container-stripe", errors.goals && "error")}>
                        <Target className="input-icon-stripe" size={18} />
                        <textarea {...register("goals")} placeholder="e.g., Weight loss, muscle gain..." rows="3" disabled={loading} />
                      </div>
                      <small className="helper-text">Optional</small>
                    </div>
                  </>
                )}

                {/* Student Fields */}
                {userType === "student" && (
                  <div className="input-group-stripe">
                    <label>Student Card Number *</label>
                    <div className={clsx("input-container-stripe", errors.studentCardNumber && "error")}>
                      <GraduationCap className="input-icon-stripe" size={18} />
                      <input {...register("studentCardNumber")} placeholder="e.g., STU-2024-0001" disabled={loading} />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Dieteticien Mode Fields */}
            {mode === "dieteticien" && (
              <>
                <div className="form-section-title required">Professional Info *</div>

                <div className="input-group-stripe">
                  <label>Specialty *</label>
                  <div className={clsx("input-container-stripe", errors.specialty && "error")}>
                    <Stethoscope className="input-icon-stripe" size={18} />
                    <input {...register("specialty")} placeholder="e.g., Sports Nutrition, Clinical Dietetics" disabled={loading} />
                  </div>
                </div>

                <div className="input-group-stripe">
                  <label>Upload Diploma *</label>
                  <div
                    className={clsx("diploma-upload-zone", errors.diploma && "error", diplomaFile && "has-file")}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('dragover'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('dragover');
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const input = document.getElementById('diploma-input');
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        input.files = dt.files;
                        const event = new Event('change', { bubbles: true });
                        input.dispatchEvent(event);
                      }
                    }}
                    onClick={() => document.getElementById('diploma-input')?.click()}
                  >
                    <input
                      id="diploma-input"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDiplomaChange}
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                    {diplomaPreview ? (
                      <div className="diploma-preview-wrapper">
                        <img src={diplomaPreview} alt="Diploma preview" className="diploma-preview-img" />
                        <div className="diploma-file-info">
                          <FileText size={16} />
                          <span>{diplomaFile?.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="diploma-upload-placeholder">
                        <div className="upload-icon-circle">
                          <Upload size={28} />
                        </div>
                        <p className="upload-text"><strong>Click to upload</strong> or drag and drop</p>
                        <p className="upload-hint">PDF or Image (max 10MB)</p>
                      </div>
                    )}
                  </div>
                  {errors.diploma && <span className="error-message-stripe">Diploma file is required</span>}
                </div>

                <div className="form-section-title">Payment Information (Optional)</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                  Add your payment details to receive payouts from clients. You can also add these later from your profile.
                </div>

                <div className="form-row-stripe">
                  <div className="input-group-stripe">
                    <label>CCP Number</label>
                    <div className={clsx("input-container-stripe")}>
                      <input {...register("ccpNumber")} placeholder="e.g., 12345678" disabled={loading} />
                    </div>
                  </div>
                  <div className="input-group-stripe">
                    <label>CCP Key (2 digits)</label>
                    <div className={clsx("input-container-stripe")}>
                      <input {...register("ccpKey")} placeholder="12" maxLength={2} disabled={loading} />
                    </div>
                  </div>
                </div>

                <div className="input-group-stripe">
                  <label>BaridiMob Number</label>
                  <div className={clsx("input-container-stripe")}>
                    <input type="number" {...register("baridiMob")} placeholder="e.g., 12345678901234567890" disabled={loading} />
                  </div>
                </div>

                <div style={{ background: '#FFF3CD', border: '1px solid #FFEAA7', borderRadius: '12px', padding: '16px', margin: '16px 0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <FileText size={20} style={{ color: '#856404', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '13px', color: '#856404' }}>
                    <strong>Note:</strong> After submitting, your request will be reviewed by an administrator.
                    You will receive an email notification once your account is approved.
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn-stripe-primary" disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? (
                <><span className="spinner"></span>Processing...</>
              ) : (
                <>{mode === "client" ? "Create Account" : "Submit Request"} <ArrowRight size={18} /></>
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