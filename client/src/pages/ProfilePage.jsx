import React, { useState, useEffect, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Shield, Edit3, Camera, Save, X,
  Activity, Target, Loader2, Info, AlertTriangle,
  Thermometer, TrendingUp, Zap, Award,
  Scale, Ruler, Calendar, Fingerprint, Droplets,
  UserCheck, Clock, Flame, Heart, FileText,
  AlertCircle, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUser as updateUserService } from '../api/userApi';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import ScrollReveal from '../components/ScrollReveal';
import './ProfilePage.css';

function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const { setTimeoutSafe } = useSafeTimeout();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('biographic');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '',
    weightKg: '',
    heightCm: '',
    goals: '',
    gender: 'Male',
    activityLevel: 'Moderate',
    medicalConditions: '',
    allergies: '',
    ccpNumber: '',
    ccpKey: '',
    baridiMob: '',
    studentCardNumber: ''
  });



  // Load user data
  useEffect(() => {
    if (user) {
      const client = user.clientProfile || {};
      const dieteticien = user.dieteticienProfile || {};
      const student = user.studentProfile || {};
      const profile = user.role === 'client' ? client : student;
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        password: '',
        age: profile.age || client.age || '',
        weightKg: client.weightKg || '',
        heightCm: client.heightCm || '',
        goals: client.goals || '',
        gender: profile.gender || 'Male',
        activityLevel: client.activityLevel || 'Moderate',
        medicalConditions: Array.isArray(client.medicalConditions) ? client.medicalConditions.join(', ') : '',
        allergies: Array.isArray(client.allergies) ? client.allergies.join(', ') : '',
        ccpNumber: dieteticien.ccpNumber || '',
        ccpKey: dieteticien.ccpKey || '',
        baridiMob: dieteticien.baridiMob || '',
        studentCardNumber: student.studentCardNumber || ''
      });

      if (user.role === 'client') {
        // Plans now managed in /client/dashboard
      }
    }
  }, [user]);

  // unchanged handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('common.error'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('common.error'));
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading(t('common.loading'));

    try {
      const result = await updateUserService(user._id, {}, file);
      if (updateUser) {
        updateUser(result.user);
      }
      toast.dismiss(loadingToast);
      toast.success(t('common.success'));
    } catch (err) {
      console.error('Upload error:', err);
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validateForm = () => {
    if (!formData.fullName?.trim()) {
      toast.error(t('signup.errors.fullNameRequired'));
      return false;
    }
    if (!formData.email?.trim()) {
      toast.error(t('signup.errors.emailRequired'));
      return false;
    }
    if (user?.role === "client" || user?.role === "student") {
      if (!formData.age || formData.age < 1 || formData.age > 150) {
        toast.error(t('signup.errors.ageRequired'));
        return false;
      }
    }
    if (user?.role === "client") {
      if (!formData.heightCm || formData.heightCm < 50 || formData.heightCm > 300) {
        toast.error(t('signup.errors.heightRequired'));
        return false;
      }
      if (!formData.weightKg || formData.weightKg < 10 || formData.weightKg > 500) {
        toast.error(t('signup.errors.weightRequired'));
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);
    setIsMetricsLoading(true);
    
    const loadingToast = toast.loading(t('common.loading'));

    try {
      const submissionData = {
        fullName: formData.fullName,
        email: formData.email,
        age: formData.age ? Number(formData.age) : undefined,
        weightKg: formData.weightKg ? Number(formData.weightKg) : undefined,
        heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        goals: formData.goals,
        medicalConditions: formData.medicalConditions
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
        allergies: formData.allergies
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
        ccpNumber: formData.ccpNumber || undefined,
        ccpKey: formData.ccpKey || undefined,
        baridiMob: formData.baridiMob ? Number(formData.baridiMob) : undefined,
        studentCardNumber: formData.studentCardNumber || undefined
      };

      if (formData.password) {
        submissionData.password = formData.password;
      }

      const result = await updateUserService(user._id, submissionData);
      
      if (updateUser) {
        updateUser(result.user);
      }
      
      toast.dismiss(loadingToast);
      toast.success(t('profile.save'));
      
      if (result.healthMetrics) {
        setTimeoutSafe(() => {
          toast.success(t('profile.healthMetrics'), { duration: 3000 });
        }, 1000);
      }
      
      setIsEditing(false);
      setIsMetricsLoading(false);
    } catch (err) {
      console.error('Update error:', err);
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || t('common.error'));
      setIsMetricsLoading(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      const client = user.clientProfile || {};
      const dieteticien = user.dieteticienProfile || {};
      const student = user.studentProfile || {};
      const profile = user.role === 'client' ? client : student;
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        password: '',
        age: profile.age || client.age || '',
        weightKg: client.weightKg || '',
        heightCm: client.heightCm || '',
        goals: client.goals || '',
        gender: profile.gender || 'Male',
        activityLevel: client.activityLevel || 'Moderate',
        medicalConditions: Array.isArray(client.medicalConditions) ? client.medicalConditions.join(', ') : '',
        allergies: Array.isArray(client.allergies) ? client.allergies.join(', ') : '',
        ccpNumber: dieteticien.ccpNumber || '',
        ccpKey: dieteticien.ccpKey || '',
        baridiMob: dieteticien.baridiMob || '',
        studentCardNumber: student.studentCardNumber || ''
      });
    }
    setIsEditing(false);
    setActiveTab('biographic');
  };

  const getAvatar = () => {
    return user?.photo || user?.profilePicture || null;
  };

  const clientProfile = user?.clientProfile || {};

  const formatMetric = (value, unit = '') => {
    if (isMetricsLoading) return <Loader2 size={16} className="VXPR-Spin" />;
    if (value === undefined || value === null) return '--';
    return `${value}${unit}`;
  };

  const getStatusText = () => {
    if (isMetricsLoading) return t('profile.calculating');
    switch(clientProfile.bmiCategory) {
      case 'Normal': return t('profile.optimal');
      case 'Overweight': return t('profile.elevated');
      case 'Underweight': return t('profile.low');
      case 'Obesity': return t('profile.high');
      default: return t('profile.pending');
    }
  };

  const getStatusColor = () => {
    switch(clientProfile.bmiCategory) {
      case 'Normal': return 'VXPR-StatusOptimal';
      case 'Overweight': return 'VXPR-StatusWarning';
      case 'Underweight': return 'VXPR-StatusWarning';
      case 'Obesity': return 'VXPR-StatusDanger';
      default: return '';
    }
  };

  return (
    <PageTransition>
      <div className="VXPR-Wrapper">
        {/* Background Elements */}
        <div className="VXPR-OrganicBg">
          <motion.div 
            animate={{ opacity: [0.02, 0.04, 0.02], scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="VXPR-FloaterShape VXPR-FloaterTop"
          >
            <Droplets size={200} strokeWidth={1} />
          </motion.div>
          <motion.div 
            animate={{ opacity: [0.04, 0.02, 0.04], scale: [1.05, 1, 1.05], rotate: [3, 0, 3] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="VXPR-FloaterShape VXPR-FloaterBottom"
          >
            <Droplets size={160} strokeWidth={1} />
          </motion.div>
        </div>

        <div className="VXPR-Container">
          {/* Header */}
          <header className="VXPR-Header">
            <ScrollReveal delay={0.1}>
              <h1 className="VXPR-Title">
                <Trans i18nKey="profile.myProfile" components={{1: <span className="VXPR-Highlight" />}} />
              </h1>
            </ScrollReveal>
          </header>

          {/* Main Grid */}
          <div className="VXPR-ContentGrid">
            {/* Left Sidebar */}
            <aside className="VXPR-SidebarColumn">
              {/* Profile Card */}
              <ScrollReveal direction="left" className="VXPR-ProfileCard">
                <div className="VXPR-AvatarContainer">
                  {getAvatar() ? (
                    <img src={getAvatar()} alt="Profile" className="VXPR-AvatarImage" loading="lazy" />
                  ) : (
                    <div className="VXPR-AvatarFallback">
                      <Fingerprint size={80} strokeWidth={1.5} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                  />
                  <button 
                    className="VXPR-AvatarUploadBtn" 
                    onClick={handleImageClick} 
                    disabled={isUploading}
                    title={t('profile.edit')}
                    type="button"
                  >
                    {isUploading ? <Loader2 size={18} className="VXPR-Spin" /> : <Camera size={18} />}
                  </button>
                </div>
                
                <h2 className="VXPR-UserName">{user?.fullName || t('common.unknown')}</h2>
                
                <div className="VXPR-RoleBadge">
                  <span className="VXPR-RoleLabel">{user?.role?.toUpperCase()}</span>
                </div>
                
                <div className="VXPR-QuickStatsGrid">
                  <div className="VXPR-QuickStatItem">
                    <UserCheck size={16} />
                    <div className="VXPR-QuickStatInfo">
                      <span className="VXPR-QuickStatLabel">{t('profile.status')}</span>
                      <span className="VXPR-QuickStatValue">
                        {isMetricsLoading ? (
                          <Loader2 size={12} className="VXPR-Spin" />
                        ) : (
                          clientProfile.bmiCategory?.toUpperCase() || 'ACTIVE'
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="VXPR-QuickStatItem">
                    <Clock size={16} />
                    <div className="VXPR-QuickStatInfo">
                      <span className="VXPR-QuickStatLabel">{t('profile.memberSince')}</span>
                      <span className="VXPR-QuickStatValue">
                        {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Health Metrics - Client Only */}
              {user?.role === "client" && (
                <ScrollReveal direction="left" delay={0.2} className="VXPR-MetricsPanel">
                  <h3 className="VXPR-PanelHeading">
                    <Activity size={18} />
                    {t('profile.healthMetrics')}
                  </h3>
                  <div className="VXPR-MetricsList">
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconBmi">
                        <Scale size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <div className="VXPR-MetricRowHeader">
                          <span className="VXPR-MetricRowLabel">{t('profile.bmi')}</span>
                          <span className={`VXPR-MetricRowBadge ${getStatusColor()}`}>
                            {clientProfile.bmiCategory || t('profile.pending')}
                          </span>
                        </div>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.bmi)}</span>
                          <span className="VXPR-MetricRowSubtext">{t('profile.kgM2')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconBmr">
                        <Flame size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">{t('profile.bmr')}</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.bmr)}</span>
                          <span className="VXPR-MetricRowSubtext">{t('profile.kcalDay')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconTdee">
                        <Zap size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">{t('profile.tdee')}</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.tdee)}</span>
                          <span className="VXPR-MetricRowSubtext">{t('profile.activeBurn')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconIdeal">
                        <Target size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">{t('profile.idealWeight')}</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.idealWeightKg)}</span>
                          <span className="VXPR-MetricRowSubtext">{t('profile.kgOptimal')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconFat">
                        <Thermometer size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">{t('profile.bodyFat')}</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.bodyFatPercentage)}</span>
                          <span className="VXPR-MetricRowSubtext">{t('profile.estimated')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow VXPR-MetricRowStatus">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconStatus">
                        <TrendingUp size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">{t('profile.statusMetric')}</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue VXPR-StatusText">{getStatusText()}</span>
                          <span className="VXPR-MetricRowSubtext">{t('profile.currentAssessment')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Staff Info */}
              {(user?.role === "dieteticien" || user?.role === "admin") && (
                <ScrollReveal direction="left" delay={0.2} className="VXPR-MetricsPanel">
                  <h3 className="VXPR-PanelHeading">
                    <Shield size={18} />
                    {t('profile.accessLevel')}
                  </h3>
                  <div className="VXPR-MetricsGrid">
                    <div className="VXPR-MetricBox">
                      <Shield size={20} />
                      <span className="VXPR-MetricLabel">{t('profile.accessRole')}</span>
                      <span className="VXPR-MetricValue VXPR-TextLarge">{user?.role?.toUpperCase()}</span>
                      <span className="VXPR-MetricSubtext">{t('profile.authorization')}</span>
                    </div>
                    <div className="VXPR-MetricBox">
                      <Mail size={20} />
                      <span className="VXPR-MetricLabel">{t('profile.emailLabel')}</span>
                      <span className="VXPR-MetricValue VXPR-TextSmall">{user?.email || 'N/A'}</span>
                      <span className="VXPR-MetricSubtext">{t('profile.verified')}</span>
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </aside>

            {/* Main Content */}
            <main className="VXPR-MainColumn">
              <ScrollReveal direction="right" className="VXPR-FormCard">
                {/* Tab Navigation */}
                <div className="VXPR-TabNav">
                  <button 
                    className={`VXPR-TabBtn ${activeTab === 'biographic' ? 'VXPR-TabActive' : ''}`}
                    onClick={() => setActiveTab('biographic')}
                    type="button"
                  >
                    <FileText size={18} />
                    {t('profile.biographicRecords')}
                  </button>
                  {user?.role === "client" && (
                    <button 
                      className={`VXPR-TabBtn ${activeTab === 'risk' ? 'VXPR-TabActive' : ''}`}
                      onClick={() => setActiveTab('risk')}
                      type="button"
                    >
                      <AlertTriangle size={18} />
                      {t('profile.riskSensitivities')}
                    </button>
                  )}

                </div>

                {/* Form Header */}
                <div className="VXPR-FormHeader">
                    <div className="VXPR-FormTitle">
                      <Info size={22} />
                      <h3>
                        {activeTab === 'biographic' ? t('profile.personalInformation') : t('profile.healthRiskFactors')}
                      </h3>
                    </div>
                    <button 
                      className={`VXPR-EditBtn ${isEditing ? 'VXPR-Editing' : ''}`}
                      onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                      disabled={isSaving}
                      type="button"
                    >
                      {isEditing ? (
                        <><X size={16} /> {t('profile.cancel')}</>
                      ) : (
                        <><Edit3 size={16} /> {activeTab === 'biographic' ? t('profile.editRecords') : t('profile.editRisks')}</>
                      )}
                    </button>
                  </div>

                <form onSubmit={handleSubmit} className="VXPR-Form">
                  {/* Biographic Records Tab */}
                  {activeTab === 'biographic' && (
                    <div className="VXPR-FormGrid">
                      <div className="VXPR-FormGroup">
                        <label htmlFor="fullName">{t('profile.fullName')}</label>
                        <div className="VXPR-InputWrapper">
                          <User className="VXPR-InputIcon" size={18} />
                          <input 
                            type="text" 
                            id="fullName" 
                            value={formData.fullName} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder={t('profile.fullNamePlaceholder')} 
                            className="VXPR-FormInput"
                          />
                        </div>
                      </div>

                      <div className="VXPR-FormGroup">
                        <label htmlFor="email">{t('profile.emailAddress')}</label>
                        <div className="VXPR-InputWrapper">
                          <Mail className="VXPR-InputIcon" size={18} />
                          <input 
                            type="email" 
                            id="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder={t('profile.emailPlaceholder')} 
                            className="VXPR-FormInput"
                          />
                        </div>
                      </div>

                      {user?.role === "student" && (
                        <div className="VXPR-FormGroup">
                          <label htmlFor="studentCardNumber">{t('profile.studentCardNumber')}</label>
                          <div className="VXPR-InputWrapper">
                            <Fingerprint className="VXPR-InputIcon" size={18} />
                            <input 
                              type="text" 
                              id="studentCardNumber" 
                              value={formData.studentCardNumber} 
                              onChange={handleChange} 
                              disabled={!isEditing || isSaving} 
                              placeholder={t('profile.studentCardPlaceholder')} 
                              className="VXPR-FormInput"
                            />
                          </div>
                        </div>
                      )}

                      {(user?.role === "client" || user?.role === "student") && (
                        <>
                          <div className="VXPR-FormGroup">
                            <label htmlFor="age">{t('profile.age')}</label>
                            <div className="VXPR-InputWrapper">
                              <Calendar className="VXPR-InputIcon" size={18} />
                              <input 
                                type="number" 
                                id="age" 
                                value={formData.age} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder={t('profile.agePlaceholder')} 
                                min="1"
                                max="150"
                                className="VXPR-FormInput"
                              />
                            </div>
                          </div>

                          <div className="VXPR-FormGroup">
                            <label htmlFor="gender">{t('profile.gender')}</label>
                            <div className="VXPR-InputWrapper">
                              <UserCheck className="VXPR-InputIcon" size={18} />
                              <select 
                                id="gender" 
                                value={formData.gender} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving}
                                className="VXPR-FormSelect"
                              >
                                <option value="Male">{t('signup.male')}</option>
                                <option value="Female">{t('signup.female')}</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {user?.role === "client" && (
                        <>
                          <div className="VXPR-FormGroup">
                            <label htmlFor="heightCm">{t('profile.heightCm')}</label>
                            <div className="VXPR-InputWrapper">
                              <Ruler className="VXPR-InputIcon" size={18} />
                              <input 
                                type="number" 
                                id="heightCm" 
                                value={formData.heightCm} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder={t('profile.heightPlaceholder')} 
                                min="50"
                                max="300"
                                className="VXPR-FormInput"
                              />
                            </div>
                          </div>

                          <div className="VXPR-FormGroup">
                            <label htmlFor="weightKg">{t('profile.weightKg')}</label>
                            <div className="VXPR-InputWrapper">
                              <Scale className="VXPR-InputIcon" size={18} />
                              <input 
                                type="number" 
                                id="weightKg" 
                                value={formData.weightKg} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder={t('profile.weightPlaceholder')} 
                                min="10"
                                max="500"
                                step="0.1"
                                className="VXPR-FormInput"
                              />
                            </div>
                          </div>

                          <div className="VXPR-FormGroup">
                            <label htmlFor="activityLevel">{t('profile.activityLevel')}</label>
                            <div className="VXPR-InputWrapper">
                              <Activity className="VXPR-InputIcon" size={18} />
                              <select 
                                id="activityLevel" 
                                value={formData.activityLevel} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving}
                                className="VXPR-FormSelect"
                              >
                                <option value="Sedentary">{t('signup.sedentary')}</option>
                                <option value="Lightly Active">{t('signup.lightlyActive')}</option>
                                <option value="Moderate">{t('signup.moderate')}</option>
                                <option value="Active">{t('signup.active')}</option>
                                <option value="Very Active">{t('signup.veryActive')}</option>
                              </select>
                            </div>
                          </div>

                          <div className="VXPR-FormGroup">
                            <label htmlFor="goals">{t('profile.fitnessGoal')}</label>
                            <div className="VXPR-InputWrapper">
                              <Target className="VXPR-InputIcon" size={18} />
                              <input 
                                type="text" 
                                id="goals" 
                                value={formData.goals} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder={t('profile.goalsPlaceholder')} 
                                className="VXPR-FormInput"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {isEditing && (
                        <div className="VXPR-FormGroup VXPR-FullWidth">
                          <label htmlFor="password">{t('profile.newPassword')}</label>
                          <div className="VXPR-InputWrapper">
                            <Shield className="VXPR-InputIcon" size={18} />
                            <input 
                              type="password" 
                              id="password" 
                              onChange={handleChange} 
                              disabled={isSaving} 
                              placeholder={t('profile.passwordPlaceholder')} 
                              className="VXPR-FormInput"
                            />
                          </div>
                        </div>
                      )}

                      {user?.role === "dieteticien" && (
                        <div className="VXPR-FullWidth" style={{ marginTop: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <CreditCard size={18} />
                            <h3 style={{ margin: 0, fontSize: '14px', letterSpacing: '0.5px' }}>{t('profile.paymentInformation')}</h3>
                          </div>
                          <div className="VXPR-FormGrid">
                            <div className="VXPR-FormGroup">
                              <label htmlFor="ccpNumber">{t('profile.ccpNumber')}</label>
                              <div className="VXPR-InputWrapper">
                                <input 
                                  type="text" 
                                  id="ccpNumber" 
                                  value={formData.ccpNumber} 
                                  onChange={handleChange} 
                                  disabled={!isEditing || isSaving} 
                                  placeholder={t('profile.ccpNumberPlaceholder')} 
                                  className="VXPR-FormInput"
                                />
                              </div>
                            </div>
                            <div className="VXPR-FormGroup">
                              <label htmlFor="ccpKey">{t('profile.ccpKey')}</label>
                              <div className="VXPR-InputWrapper">
                                <input 
                                  type="text" 
                                  id="ccpKey" 
                                  value={formData.ccpKey} 
                                  onChange={handleChange} 
                                  disabled={!isEditing || isSaving} 
                                  placeholder={t('profile.ccpKeyPlaceholder')} 
                                  maxLength={2}
                                  className="VXPR-FormInput"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="VXPR-FormGroup VXPR-FullWidth">
                            <label htmlFor="baridiMob">{t('profile.baridiMob')}</label>
                            <div className="VXPR-InputWrapper">
                              <input 
                                type="number" 
                                id="baridiMob" 
                                value={formData.baridiMob} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder={t('profile.baridiMobPlaceholder')} 
                                className="VXPR-FormInput"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Risk Sensitivities Tab */}
                  {activeTab === 'risk' && user?.role === "client" && (
                    <div className="VXPR-FormGrid">
                      <div className="VXPR-FormGroup VXPR-FullWidth">
                        <label htmlFor="medicalConditions">{t('profile.medicalConditions')}</label>
                        <p className="VXPR-FieldHint">{t('profile.medicalConditionsHint')}</p>
                        <div className="VXPR-InputWrapper">
                          <Thermometer className="VXPR-InputIcon" size={18} />
                          <input 
                            type="text" 
                            id="medicalConditions" 
                            value={formData.medicalConditions} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder={t('profile.medicalPlaceholder')} 
                            className="VXPR-FormInput"
                          />
                        </div>
                        {!isEditing && (
                          <div className="VXPR-TagContainer">
                            {formData.medicalConditions.split(',').filter(s => s.trim()).length > 0 ? (
                              formData.medicalConditions.split(',').filter(s => s.trim()).map((condition, idx) => (
                                <span key={idx} className="VXPR-Tag VXPR-TagDanger">{condition.trim()}</span>
                              ))
                            ) : (
                              <span className="VXPR-EmptyState">{t('profile.noMedicalConditions')}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="VXPR-FormGroup VXPR-FullWidth">
                        <label htmlFor="allergies">{t('profile.allergies')}</label>
                        <p className="VXPR-FieldHint">{t('profile.allergiesHint')}</p>
                        <div className="VXPR-InputWrapper">
                          <AlertTriangle className="VXPR-InputIcon" size={18} />
                          <input 
                            type="text" 
                            id="allergies" 
                            value={formData.allergies} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder={t('profile.allergiesPlaceholder')} 
                            className="VXPR-FormInput"
                          />
                        </div>
                        {!isEditing && (
                          <div className="VXPR-TagContainer">
                            {formData.allergies.split(',').filter(s => s.trim()).length > 0 ? (
                              formData.allergies.split(',').filter(s => s.trim()).map((allergy, idx) => (
                                <span key={idx} className="VXPR-Tag VXPR-TagWarning">{allergy.trim()}</span>
                              ))
                            ) : (
                              <span className="VXPR-EmptyState">{t('profile.noAllergies')}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="VXPR-FormGroup VXPR-FullWidth">
                        <label htmlFor="goals">{t('profile.fitnessGoal')}</label>
                        <p className="VXPR-FieldHint">{t('profile.goalHint')}</p>
                        <div className="VXPR-InputWrapper">
                          <Target className="VXPR-InputIcon" size={18} />
                          <input 
                            type="text" 
                            id="goals" 
                            value={formData.goals} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder={t('profile.goalsPlaceholderRisk')} 
                            className="VXPR-FormInput"
                          />
                        </div>
                      </div>

                      {/* Risk Summary */}
                      {!isEditing && (
                        <div className="VXPR-FormGroup VXPR-FullWidth">
                          <div className="VXPR-RiskSummary">
                            <div className="VXPR-RiskSummaryItem">
                              <div className="VXPR-RiskSummaryIcon VXPR-RiskSummaryDanger">
                                <AlertTriangle size={20} />
                              </div>
                              <div className="VXPR-RiskSummaryContent">
                                <h4>{t('profile.conditionsHeading')}</h4>
                                <p>{t('profile.riskSummaryDesc', {count: formData.medicalConditions.split(',').filter(s => s.trim()).length || 0})}</p>
                              </div>
                            </div>
                            <div className="VXPR-RiskSummaryItem">
                              <div className="VXPR-RiskSummaryIcon VXPR-RiskSummaryWarning">
                                <AlertTriangle size={20} />
                              </div>
                              <div className="VXPR-RiskSummaryContent">
                                <h4>{t('profile.allergiesHeading')}</h4>
                                <p>{t('profile.allergySummaryDesc', {count: formData.allergies.split(',').filter(s => s.trim()).length || 0})}</p>
                              </div>
                            </div>
                            <div className="VXPR-RiskSummaryItem">
                              <div className="VXPR-RiskSummaryIcon VXPR-RiskSummarySuccess">
                                <Target size={20} />
                              </div>
                              <div className="VXPR-RiskSummaryContent">
                                <h4>{t('profile.goalHeading')}</h4>
                                <p>{formData.goals || t('profile.noGoal')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button (only for biographic/risk editing) */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.3 }}
                        className="VXPR-FormActions"
                      >
                        <button 
                          type="submit" 
                          className="VXPR-SubmitBtn"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={18} className="VXPR-Spin" /> {t('profile.saving')}
                            </>
                          ) : (
                            <>
                              <Save size={18} /> {t('profile.saveAllChanges')}
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </ScrollReveal>
            </main>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}

export default ProfilePage;