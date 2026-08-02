import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  User, Mail, Lock, Scale, Ruler, ArrowRight, ChevronLeft,
  Activity, AlertCircle, Target, Heart, Brain, GraduationCap,
  Stethoscope, Upload, FileText, Wallet, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { registerUser, registerDieteticien, getPlatformPaymentInfo } from "../api/userApi";
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import { useTranslation } from 'react-i18next';
import './SignUpPage.css';

function SignUpPage() {
  const { setTimeoutSafe } = useSafeTimeout();
  const { t } = useTranslation();
  const [mode, setMode] = useState("client"); // "client" or "dieteticien"
  const [userType, setUserType] = useState("client"); // "client" or "student" (only in client mode)
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [previewMetrics, setPreviewMetrics] = useState(null);
  const [diplomaFile, setDiplomaFile] = useState(null);
  const [diplomaPreview, setDiplomaPreview] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [loadingPlatformInfo, setLoadingPlatformInfo] = useState(false);
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

  useEffect(() => {
    if (mode !== "dieteticien") return;
    let cancelled = false;
    setLoadingPlatformInfo(true);
    getPlatformPaymentInfo()
      .then((res) => { if (!cancelled) setPlatformInfo(res.data); })
      .catch(() => { if (!cancelled) setPlatformInfo(null); })
      .finally(() => { if (!cancelled) setLoadingPlatformInfo(false); });
    return () => { cancelled = true; };
  }, [mode]);

  const handlePaymentProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProofFile(file);
      setPaymentProofPreview(URL.createObjectURL(file));
    }
  };

  const activityOptions = [
    { value: "Sedentary", label: t('signup.sedentary'), multiplier: "1.2" },
    { value: "Lightly Active", label: t('signup.lightlyActive'), multiplier: "1.375" },
    { value: "Moderate", label: t('signup.moderate'), multiplier: "1.55" },
    { value: "Active", label: t('signup.active'), multiplier: "1.725" },
    { value: "Very Active", label: t('signup.veryActive'), multiplier: "1.9" }
  ];

  const validateForm = (values) => {
    const errors = {};
    if (!values.fullName?.trim()) errors.fullName = t('signup.errors.fullNameRequired');
    if (!values.email?.trim()) errors.email = t('signup.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = t('signup.errors.invalidEmail');
    if (!values.password) errors.password = t('signup.errors.passwordRequired');
    else if (values.password.length < 8) errors.password = t('signup.errors.passwordMin');
    if (values.password !== values.confirmPassword) errors.confirmPassword = t('signup.errors.passwordsDontMatch');
    if (!values.age) errors.age = t('signup.errors.ageRequired');
    if (!values.gender) errors.gender = t('signup.errors.genderRequired');

    if (mode === "client") {
      if (userType === "client") {
        if (!values.heightCm) errors.heightCm = t('signup.errors.heightRequired');
        if (!values.weightKg) errors.weightKg = t('signup.errors.weightRequired');
        if (!values.activityLevel) errors.activityLevel = t('signup.errors.activityRequired');
      } else {
        if (!values.studentCardNumber?.trim()) errors.studentCardNumber = t('signup.errors.studentCardRequired');
      }
    } else {
      if (!values.specialty?.trim()) errors.specialty = t('signup.errors.specialtyRequired');
      if (!diplomaFile) errors.diploma = t('signup.errors.diplomaRequired');
      if (!paymentProofFile) errors.paymentProof = t('signup.errors.paymentProofRequired');
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
        toast.success(t('signup.accountCreated'), {
          description: t('signup.welcomeUser', { name: response.user?.fullName || values.fullName }),
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
        if (paymentProofFile) formData.append('paymentProof', paymentProofFile);

        await registerDieteticien(formData);

        toast.success(t('signup.requestSubmitted'), {
          description: t('signup.approvalEmail'),
          duration: 6000,
        });
        setTimeoutSafe(() => navigate('/login'), 3000);
      }
    } catch (err) {
      toast.error(t('signup.registrationFailed'), {
        description: err.response?.data?.message || t('signup.tryAgain'),
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
            <Heart size={16} style={{ display: 'inline', marginRight: '8px' }} /> {t('signup.aiNutritionPro')}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            {mode === "client" ? t('signup.startTransformation') : t('signup.joinAsDieteticien')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ marginTop: '16px', fontSize: '16px', opacity: 0.9 }}>
            {mode === "client" ? t('signup.joinThousands') : t('signup.shareExpertise')}
          </motion.p>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="signup-benefits">
            {mode === "client" ? (
              t('signup.benefitsClient', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)
            ) : (
              t('signup.benefitsDieteticien', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)
            )}
          </motion.ul>
        </div>
      </div>

      <div className="split-form-side scrollable-form">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="form-wrapper-stripe-wide">
          <div className="header-stripe">
            <h2>{mode === "client" ? t('signup.createAccount') : t('signup.dieteticienRegistration')}</h2>
            <p>{mode === "client" ? t('signup.fillDetails') : t('signup.submitForReview')}</p>
          </div>

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
              <User size={18} /> {t('signup.clientStudent')}
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
              <Stethoscope size={18} /> {t('signup.dieteticien')}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-stripe">
            <div className="form-section-title required">{t('signup.accountInformation')} *</div>

            <div className="input-group-stripe">
              <label>{t('signup.fullName')} *</label>
              <div className={clsx("input-container-stripe", errors.fullName && "error")}>
                <User className="input-icon-stripe" size={18} />
                <input {...register("fullName")} placeholder={t('signup.fullNamePlaceholder')} disabled={loading} autoComplete="name" />
              </div>
            </div>

            <div className="input-group-stripe">
              <label>{t('signup.emailAddress')} *</label>
              <div className={clsx("input-container-stripe", errors.email && "error")}>
                <Mail className="input-icon-stripe" size={18} />
                <input {...register("email")} type="email" placeholder={t('signup.emailPlaceholder')} disabled={loading} autoComplete="email" />
              </div>
            </div>

            <div className="form-row-stripe">
              <div className="input-group-stripe">
                <label>{t('signup.password')} *</label>
                <div className={clsx("input-container-stripe", errors.password && "error")}>
                  <Lock className="input-icon-stripe" size={18} />
                  <input type="password" {...register("password")} placeholder={t('signup.passwordPlaceholder') || '••••••••'} disabled={loading} autoComplete="new-password" />
                </div>
              </div>
              <div className="input-group-stripe">
                <label>{t('signup.confirmPassword')} *</label>
                <div className={clsx("input-container-stripe", errors.confirmPassword && "error")}>
                  <Lock className="input-icon-stripe" size={18} />
                  <input type="password" {...register("confirmPassword")} placeholder={t('signup.passwordPlaceholder') || '••••••••'} disabled={loading} autoComplete="new-password" />
                </div>
              </div>
            </div>

            <div className="form-section-title required">{t('signup.personalInfo')} *</div>

            <div className="form-row-stripe">
              <div className="input-group-stripe">
                <label>{t('signup.age')} *</label>
                <div className={clsx("input-container-stripe", errors.age && "error")}>
                  <input type="number" {...register("age")} placeholder={t('signup.agePlaceholder')} disabled={loading} />
                </div>
              </div>
              <div className="input-group-stripe">
                <label>{t('signup.gender')} *</label>
                <div className={clsx("input-container-stripe", errors.gender && "error")}>
                  <select {...register("gender")} disabled={loading}>
                    <option value="">{t('signup.selectGender')}</option>
                    <option value="Male">{t('signup.male')}</option>
                    <option value="Female">{t('signup.female')}</option>
                  </select>
                </div>
              </div>
            </div>

            {mode === "client" && (
              <>
                <div className="form-section-title">{t('signup.accountType')} *</div>
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
                    <div style={{ fontWeight: 700, color: '#2D5A27' }}>{t('signup.client')}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{t('signup.clientDesc')}</div>
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
                    <div style={{ fontWeight: 700, color: '#2D5A27' }}>{t('signup.student')}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{t('signup.studentDesc')}</div>
                  </label>
                </div>

                {userType === "client" && (
                  <>
                    <div className="form-section-title required">{t('signup.physicalProfile')} *</div>
                    <div className="form-row-stripe">
                      <div className="input-group-stripe">
                        <label>{t('signup.heightCm')} *</label>
                        <div className={clsx("input-container-stripe", errors.heightCm && "error")}>
                          <Ruler className="input-icon-stripe" size={18} />
                          <input type="number" {...register("heightCm")} placeholder={t('signup.heightPlaceholder')} disabled={loading} />
                        </div>
                      </div>
                      <div className="input-group-stripe">
                        <label>{t('signup.weightKg')} *</label>
                        <div className={clsx("input-container-stripe", errors.weightKg && "error")}>
                          <Scale className="input-icon-stripe" size={18} />
                          <input type="number" {...register("weightKg")} placeholder={t('signup.weightPlaceholder')} disabled={loading} step="0.1" />
                        </div>
                      </div>
                    </div>

                    <div className="input-group-stripe">
                      <label>{t('signup.activityLevel')} *</label>
                      <div className={clsx("activity-selector-container", errors.activityLevel && "error")}>
                        <Activity className="input-icon-stripe" size={18} />
                        <select
                          {...register("activityLevel")}
                          className={clsx("activity-select", !selectedActivity && "placeholder")}
                          onChange={(e) => { setValue("activityLevel", e.target.value); trigger("activityLevel"); }}
                          disabled={loading}
                        >
                          <option value="">{t('signup.selectActivity')}</option>
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
                          <Brain size={20} /><strong>{t('signup.yourHealthMetrics')}</strong>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>{t('signup.bmr')}</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.bmr} {t('signup.calPerDay')}</div></div>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>{t('signup.tdee')}</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.tdee} {t('signup.calPerDay')}</div></div>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>{t('signup.bmi')}</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.bmi} ({t('signup.bmiCategories.' + previewMetrics.bmiCategory.toLowerCase())})</div></div>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>{t('signup.idealWeight')}</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.idealWeightKg} kg</div></div>
                          <div><div style={{ opacity: 0.8, fontSize: '12px' }}>{t('signup.bodyFat')}</div><div style={{ fontWeight: 'bold' }}>{previewMetrics.bodyFatPercentage}%</div></div>
                        </div>
                      </motion.div>
                    )}

                    <div className="form-section-title">{t('signup.healthDetails')}</div>

                    <div className="input-group-stripe">
                      <label>{t('signup.medicalConditions')}</label>
                      <div className={clsx("input-container-stripe", errors.medicalConditions && "error")}>
                        <AlertCircle className="input-icon-stripe" size={18} />
                        <input {...register("medicalConditions")} placeholder={t('signup.medicalPlaceholder')} disabled={loading} />
                      </div>
                      <small className="helper-text">{t('signup.commaSeparated')}</small>
                    </div>

                    <div className="input-group-stripe">
                      <label>{t('signup.allergies')}</label>
                      <div className={clsx("input-container-stripe", errors.allergies && "error")}>
                        <AlertCircle className="input-icon-stripe" size={18} />
                        <input {...register("allergies")} placeholder={t('signup.allergiesPlaceholder')} disabled={loading} />
                      </div>
                      <small className="helper-text">{t('signup.commaSeparated')}</small>
                    </div>

                    <div className="input-group-stripe">
                      <label>{t('signup.yourGoals')}</label>
                      <div className={clsx("input-container-stripe", errors.goals && "error")}>
                        <Target className="input-icon-stripe" size={18} />
                        <textarea {...register("goals")} placeholder={t('signup.goalsPlaceholder')} rows="3" disabled={loading} />
                      </div>
                      <small className="helper-text">{t('signup.optional')}</small>
                    </div>
                  </>
                )}

                {userType === "student" && (
                  <div className="input-group-stripe">
                    <label>{t('signup.studentCardNumber')} *</label>
                    <div className={clsx("input-container-stripe", errors.studentCardNumber && "error")}>
                      <GraduationCap className="input-icon-stripe" size={18} />
                      <input {...register("studentCardNumber")} placeholder={t('signup.studentCardPlaceholder')} disabled={loading} />
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === "dieteticien" && (
              <>
                <div className="form-section-title required">{t('signup.professionalInfo')} *</div>

                <div className="input-group-stripe">
                  <label>{t('signup.specialty')} *</label>
                  <div className={clsx("input-container-stripe", errors.specialty && "error")}>
                    <Stethoscope className="input-icon-stripe" size={18} />
                    <input {...register("specialty")} placeholder={t('signup.specialtyPlaceholder')} disabled={loading} />
                  </div>
                </div>

                <div className="input-group-stripe">
                  <label>{t('signup.uploadDiploma')} *</label>
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
                        <img src={diplomaPreview} alt="Diploma preview" className="diploma-preview-img" loading="lazy" />
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
                        <p className="upload-text"><strong>{t('signup.clickToUpload')}</strong> {t('signup.dragAndDrop')}</p>
                        <p className="upload-hint">{t('signup.pdfOrImage')}</p>
                      </div>
                    )}
                  </div>
                  {errors.diploma && <span className="error-message-stripe">{t('signup.diplomaRequired')}</span>}
                </div>

                <div className="form-section-title required">{t('signup.joinFeeTitle')} *</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                  {t('signup.joinFeeDesc')}
                </div>

                <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Wallet size={22} style={{ color: '#34D399', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.85 }}>{t('signup.joinFeeLabel')}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800 }}>{t('signup.joinFeeAmount')}</div>
                  </div>
                </div>

                {loadingPlatformInfo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13, marginBottom: '16px' }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('signup.loadingPaymentInfo')}
                  </div>
                ) : platformInfo && (platformInfo.ccpNumber || platformInfo.baridiMob) ? (
                  <div className="payment-info-card" style={{ background: '#F0FDF4', borderRadius: '12px', padding: '16px', border: '1px solid #BBF7D0', marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>{t('signup.transferTo')}</div>
                    {platformInfo.ccpNumber && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DCFCE7' }}>
                          <span style={{ color: '#374151' }}>{t('signup.ccpNumber')}</span>
                          <span style={{ fontWeight: 700, color: '#166534' }}>{platformInfo.ccpNumber}</span>
                        </div>
                        {platformInfo.ccpKey && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DCFCE7' }}>
                            <span style={{ color: '#374151' }}>{t('signup.ccpKey')}</span>
                            <span style={{ fontWeight: 700, color: '#166534' }}>{platformInfo.ccpKey}</span>
                          </div>
                        )}
                      </>
                    )}
                    {platformInfo.baridiMob && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ color: '#374151' }}>{t('signup.baridiMobNumber')}</span>
                        <span style={{ fontWeight: 700, color: '#166534' }}>{platformInfo.baridiMob}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#EF4444', fontSize: 13, marginBottom: '16px' }}>{t('signup.paymentInfoNotAvailable')}</div>
                )}

                <div className="input-group-stripe">
                  <label>{t('signup.uploadPaymentProof')} *</label>
                  <div
                    className={clsx("diploma-upload-zone", errors.paymentProof && "error", paymentProofFile && "has-file")}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('dragover'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('dragover');
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const input = document.getElementById('payment-proof-input');
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        input.files = dt.files;
                        const event = new Event('change', { bubbles: true });
                        input.dispatchEvent(event);
                      }
                    }}
                    onClick={() => document.getElementById('payment-proof-input')?.click()}
                  >
                    <input
                      id="payment-proof-input"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePaymentProofChange}
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                    {paymentProofPreview ? (
                      <div className="diploma-preview-wrapper">
                        <img src={paymentProofPreview} alt={t('signup.uploadPaymentProof')} className="diploma-preview-img" loading="lazy" />
                        <div className="diploma-file-info">
                          <FileText size={16} />
                          <span>{paymentProofFile?.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="diploma-upload-placeholder">
                        <div className="upload-icon-circle">
                          <Upload size={28} />
                        </div>
                        <p className="upload-text"><strong>{t('signup.clickToUpload')}</strong> {t('signup.dragAndDrop')}</p>
                        <p className="upload-hint">{t('signup.pdfOrImage')}</p>
                      </div>
                    )}
                  </div>
                  {errors.paymentProof && <span className="error-message-stripe">{t('signup.paymentProofRequired')}</span>}
                </div>

                <div className="form-section-title">{t('signup.paymentInfo')}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                  {t('signup.paymentInfoDesc')}
                </div>

                <div className="form-row-stripe">
                  <div className="input-group-stripe">
                    <label>{t('signup.ccpNumber')}</label>
                    <div className={clsx("input-container-stripe")}>
                      <input {...register("ccpNumber")} placeholder={t('signup.ccpNumberPlaceholder')} disabled={loading} />
                    </div>
                  </div>
                  <div className="input-group-stripe">
                    <label>{t('signup.ccpKey')}</label>
                    <div className={clsx("input-container-stripe")}>
                      <input {...register("ccpKey")} placeholder={t('signup.ccpKeyPlaceholder')} maxLength={2} disabled={loading} />
                    </div>
                  </div>
                </div>

                <div className="input-group-stripe">
                  <label>{t('signup.baridiMob')}</label>
                  <div className={clsx("input-container-stripe")}>
                    <input type="number" {...register("baridiMob")} placeholder={t('signup.baridiMobPlaceholder')} disabled={loading} />
                  </div>
                </div>

                <div style={{ background: '#FFF3CD', border: '1px solid #FFEAA7', borderRadius: '12px', padding: '16px', margin: '16px 0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <FileText size={20} style={{ color: '#856404', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '13px', color: '#856404' }}>
                    <strong>{t('signup.note')}:</strong> {t('signup.submissionNote')}
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn-stripe-primary" disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? (
                <><span className="spinner"></span>{t('signup.processing')}</>
              ) : (
                <>{mode === "client" ? t('signup.createAccountBtn') : t('signup.submitRequest')} <ArrowRight size={18} /></>
              )}
            </button>

            <div className="footer-stripe">
              <p>{t('signup.alreadyHaveAccount')} <NavLink to="/login">{t('signup.signIn')}</NavLink></p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default SignUpPage;