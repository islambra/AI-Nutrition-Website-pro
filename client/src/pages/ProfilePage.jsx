// pages/ProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Shield, Edit3, Camera, Save, X,
  Activity, Target, Loader2, Info, AlertTriangle,
  Thermometer, TrendingUp, Zap, Award,
  Scale, Ruler, Calendar, Fingerprint, Droplets,
  UserCheck, Clock, Flame, Heart, FileText,
  Video, MessageCircle, ShoppingBag, ArrowRight, AlertCircle,
  Trash2, Eye, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUser as updateUserService } from '../api/userApi';
import { getUserPlans } from '../api/paymentApi';
import {
  bookConsultation,
  getConsultationsByUserPlan,
  getUserConsultations,
  cancelConsultation,     
  deleteConsultation,
} from '../api/consultationApi';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import './ProfilePage.css';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
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

  // Plans & consultations
  const [userPlans, setUserPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [consultationsMap, setConsultationsMap] = useState({});

  // Booking modal
  const [bookingModal, setBookingModal] = useState({ open: false, userPlanId: null });
  const [bookingDateTime, setBookingDateTime] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // All bookings for the "MY BOOKINGS" tab
  const [allConsultations, setAllConsultations] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      const client = user.clientProfile || {};
      const dieteticien = user.dieteticienProfile || {};
      const student = user.studentProfile || {};
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        password: '',
        age: client.age || '',
        weightKg: client.weightKg || '',
        heightCm: client.heightCm || '',
        goals: client.goals || '',
        gender: client.gender || 'Male',
        activityLevel: client.activityLevel || 'Moderate',
        medicalConditions: Array.isArray(client.medicalConditions) ? client.medicalConditions.join(', ') : '',
        allergies: Array.isArray(client.allergies) ? client.allergies.join(', ') : '',
        ccpNumber: dieteticien.ccpNumber || '',
        ccpKey: dieteticien.ccpKey || '',
        baridiMob: dieteticien.baridiMob || '',
        studentCardNumber: student.studentCardNumber || ''
      });

      if (user.role === 'client') {
        fetchUserPlans();
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'bookings' && user?.role === 'client') {
      fetchAllConsultationsForUser();
    }
  }, [activeTab, user]);

  const fetchUserPlans = async () => {
    try {
      setPlansLoading(true);
      const res = await getUserPlans();
      if (res.success) {
        const plans = res.data || [];
        setUserPlans(plans);
        fetchAllConsultations(plans);
      }
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchAllConsultations = async (plans) => {
    const map = {};
    for (const userPlan of plans) {
      try {
        const res = await getConsultationsByUserPlan(userPlan._id);
        if (res.success) map[userPlan._id] = res.data;
      } catch (err) {
        console.error(err);
      }
    }
    setConsultationsMap(map);
  };

  const fetchAllConsultationsForUser = async () => {
    try {
      setBookingsLoading(true);
      const res = await getUserConsultations();
      if (res.success) setAllConsultations(res.data || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const openBookingModal = (userPlanId) => {
    setBookingModal({ open: true, userPlanId });
    setBookingDateTime('');
    setBookingNote('');
  };

  const handleBookNow = async () => {
    if (!bookingDateTime) return toast.error('Please select date and time');
    setBookingLoading(true);
    try {
      await bookConsultation(
        bookingModal.userPlanId,
        new Date(bookingDateTime).toISOString(),
        bookingNote
      );
      toast.success('Consultation booked!');
      setBookingModal({ open: false, userPlanId: null });
      fetchUserPlans();
      fetchAllConsultationsForUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (consultationId) => {
    const confirmed = window.confirm('Cancel this booking? A session will be refunded.');
    if (!confirmed) return;
    try {
      await cancelConsultation(consultationId);
      toast.success('Booking cancelled – session restored');
      fetchUserPlans();
      fetchAllConsultationsForUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling');
    }
  };

  const handleDeleteConsultation = async (consultationId) => {
    const confirmed = window.confirm('Permanently delete this consultation record?');
    if (!confirmed) return;
    try {
      await deleteConsultation(consultationId);
      toast.success('Consultation deleted');
      fetchAllConsultationsForUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting');
    }
  };

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
      toast.error('Invalid file type. Please select an image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum 5MB allowed.');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading profile picture...');

    try {
      const result = await updateUserService(user._id, {}, file);
      if (updateUser) {
        updateUser(result.user);
      }
      toast.dismiss(loadingToast);
      toast.success('Profile picture updated successfully');
    } catch (err) {
      console.error('Upload error:', err);
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validateForm = () => {
    if (!formData.fullName?.trim()) {
      toast.error('Full name is required');
      return false;
    }
    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (user?.role === "client") {
      if (!formData.age || formData.age < 1 || formData.age > 150) {
        toast.error('Age must be between 1 and 150');
        return false;
      }
      if (!formData.heightCm || formData.heightCm < 50 || formData.heightCm > 300) {
        toast.error('Height must be between 50 and 300 cm');
        return false;
      }
      if (!formData.weightKg || formData.weightKg < 10 || formData.weightKg > 500) {
        toast.error('Weight must be between 10 and 500 kg');
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
    
    const loadingToast = toast.loading('Saving your profile...');

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
      toast.success('Profile updated successfully');
      
      if (result.healthMetrics) {
        setTimeout(() => {
          toast.success('Health metrics recalculated', { duration: 3000 });
        }, 1000);
      }
      
      setIsEditing(false);
      setIsMetricsLoading(false);
    } catch (err) {
      console.error('Update error:', err);
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'Update failed');
      setIsMetricsLoading(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      const client = user.clientProfile || {};
      const dieteticien = user.dieteticienProfile || {};
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        password: '',
        age: client.age || '',
        weightKg: client.weightKg || '',
        heightCm: client.heightCm || '',
        goals: client.goals || '',
        gender: client.gender || 'Male',
        activityLevel: client.activityLevel || 'Moderate',
        medicalConditions: Array.isArray(client.medicalConditions) ? client.medicalConditions.join(', ') : '',
        allergies: Array.isArray(client.allergies) ? client.allergies.join(', ') : '',
        ccpNumber: dieteticien.ccpNumber || '',
        ccpKey: dieteticien.ccpKey || '',
        baridiMob: dieteticien.baridiMob || ''
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
    if (isMetricsLoading) return 'CALCULATING';
    switch(clientProfile.bmiCategory) {
      case 'Normal': return 'OPTIMAL';
      case 'Overweight': return 'ELEVATED';
      case 'Underweight': return 'LOW';
      case 'Obesity': return 'HIGH';
      default: return 'PENDING';
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
                MY <span className="VXPR-Highlight">PROFILE</span>
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
                    <img src={getAvatar()} alt="Profile" className="VXPR-AvatarImage" />
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
                    title="Update profile picture"
                    type="button"
                  >
                    {isUploading ? <Loader2 size={18} className="VXPR-Spin" /> : <Camera size={18} />}
                  </button>
                </div>
                
                <h2 className="VXPR-UserName">{user?.fullName || 'User'}</h2>
                
                <div className="VXPR-RoleBadge">
                  <span className="VXPR-RoleLabel">{user?.role?.toUpperCase()}</span>
                </div>
                
                <div className="VXPR-QuickStatsGrid">
                  <div className="VXPR-QuickStatItem">
                    <UserCheck size={16} />
                    <div className="VXPR-QuickStatInfo">
                      <span className="VXPR-QuickStatLabel">STATUS</span>
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
                      <span className="VXPR-QuickStatLabel">MEMBER SINCE</span>
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
                    HEALTH METRICS
                  </h3>
                  <div className="VXPR-MetricsList">
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconBmi">
                        <Scale size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <div className="VXPR-MetricRowHeader">
                          <span className="VXPR-MetricRowLabel">BMI</span>
                          <span className={`VXPR-MetricRowBadge ${getStatusColor()}`}>
                            {clientProfile.bmiCategory || 'Pending'}
                          </span>
                        </div>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.bmi)}</span>
                          <span className="VXPR-MetricRowSubtext">kg/m²</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconBmr">
                        <Flame size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">BMR</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.bmr)}</span>
                          <span className="VXPR-MetricRowSubtext">kcal/day</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconTdee">
                        <Zap size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">TDEE</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.tdee)}</span>
                          <span className="VXPR-MetricRowSubtext">Active Burn</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconIdeal">
                        <Target size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">IDEAL WT</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.idealWeightKg)}</span>
                          <span className="VXPR-MetricRowSubtext">kg Optimal</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconFat">
                        <Thermometer size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">FAT %</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue">{formatMetric(clientProfile.bodyFatPercentage)}</span>
                          <span className="VXPR-MetricRowSubtext">Estimated</span>
                        </div>
                      </div>
                    </div>
                    <div className="VXPR-MetricDivider" />
                    <div className="VXPR-MetricRow VXPR-MetricRowStatus">
                      <div className="VXPR-MetricRowIcon VXPR-MetricIconStatus">
                        <TrendingUp size={18} />
                      </div>
                      <div className="VXPR-MetricRowInfo">
                        <span className="VXPR-MetricRowLabel">STATUS</span>
                        <div className="VXPR-MetricRowValueRow">
                          <span className="VXPR-MetricRowValue VXPR-StatusText">{getStatusText()}</span>
                          <span className="VXPR-MetricRowSubtext">Current Assessment</span>
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
                    ACCESS LEVEL
                  </h3>
                  <div className="VXPR-MetricsGrid">
                    <div className="VXPR-MetricBox">
                      <Shield size={20} />
                      <span className="VXPR-MetricLabel">ROLE</span>
                      <span className="VXPR-MetricValue VXPR-TextLarge">{user?.role?.toUpperCase()}</span>
                      <span className="VXPR-MetricSubtext">Authorization</span>
                    </div>
                    <div className="VXPR-MetricBox">
                      <Mail size={20} />
                      <span className="VXPR-MetricLabel">EMAIL</span>
                      <span className="VXPR-MetricValue VXPR-TextSmall">{user?.email || 'N/A'}</span>
                      <span className="VXPR-MetricSubtext">Verified</span>
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
                    BIOGRAPHIC RECORDS
                  </button>
                  {user?.role === "client" && (
                    <button 
                      className={`VXPR-TabBtn ${activeTab === 'risk' ? 'VXPR-TabActive' : ''}`}
                      onClick={() => setActiveTab('risk')}
                      type="button"
                    >
                      <AlertTriangle size={18} />
                      RISK SENSITIVITIES
                    </button>
                  )}
                  {user?.role === "client" && (
                    <button 
                      className={`VXPR-TabBtn ${activeTab === 'plans' ? 'VXPR-TabActive' : ''}`}
                      onClick={() => setActiveTab('plans')}
                      type="button"
                    >
                      <ShoppingBag size={18} />
                      MY PLANS
                    </button>
                  )}
                  {user?.role === "client" && (
                    <button 
                      className={`VXPR-TabBtn ${activeTab === 'bookings' ? 'VXPR-TabActive' : ''}`}
                      onClick={() => setActiveTab('bookings')}
                      type="button"
                    >
                      <Eye size={18} />
                      MY BOOKINGS
                    </button>
                  )}
                </div>

                {/* Form Header */}
                {activeTab !== 'plans' && activeTab !== 'bookings' && (
                  <div className="VXPR-FormHeader">
                    <div className="VXPR-FormTitle">
                      <Info size={22} />
                      <h3>
                        {activeTab === 'biographic' ? 'PERSONAL INFORMATION' : 'HEALTH RISK FACTORS'}
                      </h3>
                    </div>
                    <button 
                      className={`VXPR-EditBtn ${isEditing ? 'VXPR-Editing' : ''}`}
                      onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                      disabled={isSaving}
                      type="button"
                    >
                      {isEditing ? (
                        <><X size={16} /> CANCEL</>
                      ) : (
                        <><Edit3 size={16} /> EDIT {activeTab === 'biographic' ? 'RECORDS' : 'RISKS'}</>
                      )}
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="VXPR-Form">
                  {/* Biographic Records Tab */}
                  {activeTab === 'biographic' && (
                    <div className="VXPR-FormGrid">
                      <div className="VXPR-FormGroup">
                        <label htmlFor="fullName">FULL NAME</label>
                        <div className="VXPR-InputWrapper">
                          <User className="VXPR-InputIcon" size={18} />
                          <input 
                            type="text" 
                            id="fullName" 
                            value={formData.fullName} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder="John Doe" 
                            className="VXPR-FormInput"
                          />
                        </div>
                      </div>

                      <div className="VXPR-FormGroup">
                        <label htmlFor="email">EMAIL ADDRESS</label>
                        <div className="VXPR-InputWrapper">
                          <Mail className="VXPR-InputIcon" size={18} />
                          <input 
                            type="email" 
                            id="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder="john@example.com" 
                            className="VXPR-FormInput"
                          />
                        </div>
                      </div>

                      {user?.role === "student" && (
                        <div className="VXPR-FormGroup">
                          <label htmlFor="studentCardNumber">STUDENT CARD NUMBER</label>
                          <div className="VXPR-InputWrapper">
                            <Fingerprint className="VXPR-InputIcon" size={18} />
                            <input 
                              type="text" 
                              id="studentCardNumber" 
                              value={formData.studentCardNumber} 
                              onChange={handleChange} 
                              disabled={!isEditing || isSaving} 
                              placeholder="e.g. STU2024001" 
                              className="VXPR-FormInput"
                            />
                          </div>
                        </div>
                      )}

                      {user?.role === "client" && (
                        <>
                          <div className="VXPR-FormGroup">
                            <label htmlFor="age">AGE</label>
                            <div className="VXPR-InputWrapper">
                              <Calendar className="VXPR-InputIcon" size={18} />
                              <input 
                                type="number" 
                                id="age" 
                                value={formData.age} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder="25" 
                                min="1"
                                max="150"
                                className="VXPR-FormInput"
                              />
                            </div>
                          </div>

                          <div className="VXPR-FormGroup">
                            <label htmlFor="gender">GENDER</label>
                            <div className="VXPR-InputWrapper">
                              <UserCheck className="VXPR-InputIcon" size={18} />
                              <select 
                                id="gender" 
                                value={formData.gender} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving}
                                className="VXPR-FormSelect"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>
                          </div>

                          <div className="VXPR-FormGroup">
                            <label htmlFor="heightCm">HEIGHT (CM)</label>
                            <div className="VXPR-InputWrapper">
                              <Ruler className="VXPR-InputIcon" size={18} />
                              <input 
                                type="number" 
                                id="heightCm" 
                                value={formData.heightCm} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder="180" 
                                min="50"
                                max="300"
                                className="VXPR-FormInput"
                              />
                            </div>
                          </div>

                          <div className="VXPR-FormGroup">
                            <label htmlFor="weightKg">WEIGHT (KG)</label>
                            <div className="VXPR-InputWrapper">
                              <Scale className="VXPR-InputIcon" size={18} />
                              <input 
                                type="number" 
                                id="weightKg" 
                                value={formData.weightKg} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder="75" 
                                min="10"
                                max="500"
                                step="0.1"
                                className="VXPR-FormInput"
                              />
                            </div>
                          </div>

                          <div className="VXPR-FormGroup">
                            <label htmlFor="activityLevel">ACTIVITY LEVEL</label>
                            <div className="VXPR-InputWrapper">
                              <Activity className="VXPR-InputIcon" size={18} />
                              <select 
                                id="activityLevel" 
                                value={formData.activityLevel} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving}
                                className="VXPR-FormSelect"
                              >
                                <option value="Sedentary">Sedentary</option>
                                <option value="Lightly Active">Lightly Active</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Active">Active</option>
                                <option value="Very Active">Very Active</option>
                              </select>
                            </div>
                          </div>

                          <div className="VXPR-FormGroup">
                            <label htmlFor="goals">FITNESS GOAL</label>
                            <div className="VXPR-InputWrapper">
                              <Target className="VXPR-InputIcon" size={18} />
                              <input 
                                type="text" 
                                id="goals" 
                                value={formData.goals} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder="Improve body composition" 
                                className="VXPR-FormInput"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {isEditing && (
                        <div className="VXPR-FormGroup VXPR-FullWidth">
                          <label htmlFor="password">NEW PASSWORD (OPTIONAL)</label>
                          <div className="VXPR-InputWrapper">
                            <Shield className="VXPR-InputIcon" size={18} />
                            <input 
                              type="password" 
                              id="password" 
                              onChange={handleChange} 
                              disabled={isSaving} 
                              placeholder="Leave blank to keep current password" 
                              className="VXPR-FormInput"
                            />
                          </div>
                        </div>
                      )}

                      {user?.role === "dieteticien" && (
                        <div className="VXPR-FullWidth" style={{ marginTop: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <CreditCard size={18} />
                            <h3 style={{ margin: 0, fontSize: '14px', letterSpacing: '0.5px' }}>PAYMENT INFORMATION</h3>
                          </div>
                          <div className="VXPR-FormGrid">
                            <div className="VXPR-FormGroup">
                              <label htmlFor="ccpNumber">CCP NUMBER</label>
                              <div className="VXPR-InputWrapper">
                                <input 
                                  type="text" 
                                  id="ccpNumber" 
                                  value={formData.ccpNumber} 
                                  onChange={handleChange} 
                                  disabled={!isEditing || isSaving} 
                                  placeholder="e.g. 12345678" 
                                  className="VXPR-FormInput"
                                />
                              </div>
                            </div>
                            <div className="VXPR-FormGroup">
                              <label htmlFor="ccpKey">CCP KEY (2 DIGITS)</label>
                              <div className="VXPR-InputWrapper">
                                <input 
                                  type="text" 
                                  id="ccpKey" 
                                  value={formData.ccpKey} 
                                  onChange={handleChange} 
                                  disabled={!isEditing || isSaving} 
                                  placeholder="12" 
                                  maxLength={2}
                                  className="VXPR-FormInput"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="VXPR-FormGroup VXPR-FullWidth">
                            <label htmlFor="baridiMob">BARIDIMOB NUMBER</label>
                            <div className="VXPR-InputWrapper">
                              <input 
                                type="number" 
                                id="baridiMob" 
                                value={formData.baridiMob} 
                                onChange={handleChange} 
                                disabled={!isEditing || isSaving} 
                                placeholder="e.g. 12345678901234567890" 
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
                        <label htmlFor="medicalConditions">MEDICAL CONDITIONS</label>
                        <p className="VXPR-FieldHint">Enter comma-separated list of medical conditions</p>
                        <div className="VXPR-InputWrapper">
                          <Thermometer className="VXPR-InputIcon" size={18} />
                          <input 
                            type="text" 
                            id="medicalConditions" 
                            value={formData.medicalConditions} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder="Asthma, Diabetes, Hypertension" 
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
                              <span className="VXPR-EmptyState">No medical conditions recorded</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="VXPR-FormGroup VXPR-FullWidth">
                        <label htmlFor="allergies">ALLERGIES</label>
                        <p className="VXPR-FieldHint">Enter comma-separated list of allergies</p>
                        <div className="VXPR-InputWrapper">
                          <AlertTriangle className="VXPR-InputIcon" size={18} />
                          <input 
                            type="text" 
                            id="allergies" 
                            value={formData.allergies} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder="Peanuts, Shellfish, Gluten" 
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
                              <span className="VXPR-EmptyState">No allergies recorded</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="VXPR-FormGroup VXPR-FullWidth">
                        <label htmlFor="goals">FITNESS GOAL</label>
                        <p className="VXPR-FieldHint">Your primary fitness or health goal</p>
                        <div className="VXPR-InputWrapper">
                          <Target className="VXPR-InputIcon" size={18} />
                          <input 
                            type="text" 
                            id="goals" 
                            value={formData.goals} 
                            onChange={handleChange} 
                            disabled={!isEditing || isSaving} 
                            placeholder="Improve body composition" 
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
                                <h4>Medical Conditions</h4>
                                <p>{formData.medicalConditions.split(',').filter(s => s.trim()).length || 0} conditions recorded</p>
                              </div>
                            </div>
                            <div className="VXPR-RiskSummaryItem">
                              <div className="VXPR-RiskSummaryIcon VXPR-RiskSummaryWarning">
                                <AlertTriangle size={20} />
                              </div>
                              <div className="VXPR-RiskSummaryContent">
                                <h4>Allergies</h4>
                                <p>{formData.allergies.split(',').filter(s => s.trim()).length || 0} allergies recorded</p>
                              </div>
                            </div>
                            <div className="VXPR-RiskSummaryItem">
                              <div className="VXPR-RiskSummaryIcon VXPR-RiskSummarySuccess">
                                <Target size={20} />
                              </div>
                              <div className="VXPR-RiskSummaryContent">
                                <h4>Goal</h4>
                                <p>{formData.goals || 'No goal set'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MY PLANS TAB */}
                  {activeTab === 'plans' && user?.role === "client" && (
                    <div className="VXPR-PlansContainer">
                      {plansLoading ? (
                        <div className="VXPR-PlansLoading">
                          <Loader2 className="VXPR-Spin" size={40} />
                          <p>Loading your plans...</p>
                        </div>
                      ) : userPlans.length === 0 ? (
                        <div className="VXPR-EmptyPlans">
                          <ShoppingBag size={60} opacity={0.3} />
                          <h3>No plans purchased yet</h3>
                          <p>Buy a nutrition plan to start booking consultations.</p>
                          <button
                            className="VXPR-BrowsePlansBtn"
                            onClick={() => window.location.href = '/allPlans'}
                          >
                            Browse Plans <ArrowRight size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="VXPR-PlansGrid">
                          {userPlans.map((userPlan) => {
                            const consultations = consultationsMap[userPlan._id] || [];
                            const latestConsultation = consultations[0];

                            return (
                              <motion.div
                                key={userPlan._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="VXPR-PlanCard"
                              >
                                <div className="VXPR-PlanCardHeader">
                                  <div>
                                    <h4>{userPlan.plan?.planName || 'Nutrition Plan'}</h4>
                                    <span className="VXPR-PlanCategory">
                                      {userPlan.plan?.planCategory}
                                    </span>
                                  </div>
                                  <div className="VXPR-SessionsBadge">
                                    <MessageCircle size={14} />
                                    <span>{userPlan.sessionsRemaining} sessions left</span>
                                  </div>
                                </div>

                                {/* Consultation Status */}
                                {latestConsultation && (
                                  <div className="VXPR-ConsultationInfo">
                                    <div className={`VXPR-ConsultBadge ${
                                      latestConsultation.status === 'accepted'
                                        ? 'accepted'
                                        : latestConsultation.status === 'rejected'
                                        ? 'rejected'
                                        : 'pending'
                                    }`}>
                                      {latestConsultation.status.toUpperCase()}
                                    </div>
                                    <span className="VXPR-ConsultDate">
                                      {new Date(latestConsultation.requestedDateTime).toLocaleString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    {latestConsultation.status === 'accepted' && latestConsultation.zoomLink && (
                                      <a
                                        href={latestConsultation.zoomLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="VXPR-ZoomLink"
                                      >
                                        <Video size={14} /> Join Zoom
                                      </a>
                                    )}
                                  </div>
                                )}

                                <div className="VXPR-PlanCardFooter">
                                  <span className="VXPR-PurchaseDate">
                                    Purchased {new Date(userPlan.purchasedAt).toLocaleDateString()}
                                  </span>
                                  {userPlan.sessionsRemaining > 0 && (
                                    <button
                                      className="VXPR-BookSessionBtn"
                                      onClick={() => openBookingModal(userPlan._id)}
                                    >
                                      <Video size={14} /> Book Session
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MY BOOKINGS TAB */}
                  {activeTab === 'bookings' && user?.role === "client" && (
                    <div className="UPBK-Container">
                      {bookingsLoading ? (
                        <div className="UPBK-Loading">
                          <Loader2 className="VXPR-Spin" size={40} />
                          <p>Loading your bookings...</p>
                        </div>
                      ) : allConsultations.length === 0 ? (
                        <div className="UPBK-Empty">
                          <Eye size={60} opacity={0.3} />
                          <h3>No bookings yet</h3>
                          <p>Your consultation history will appear here.</p>
                        </div>
                      ) : (
                        <div className="UPBK-List">
                          {allConsultations.map((booking) => (
                            <motion.div
                              key={booking._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="UPBK-Card"
                            >
                              <div className="UPBK-CardHeader">
                                <div>
                                  <h4>{booking.plan?.planName || 'Consultation'}</h4>
                                  <span className="UPBK-PlanCategory">
                                    {booking.plan?.planCategory || 'N/A'}
                                  </span>
                                </div>
                                <span className={`UPBK-StatusBadge UPBK-${booking.status}`}>
                                  {booking.status.toUpperCase()}
                                </span>
                              </div>

                              <div className="UPBK-Details">
                                <div className="UPBK-DetailItem">
                                  <Calendar size={14} />
                                  <span>
                                    {new Date(booking.requestedDateTime).toLocaleString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {booking.note && (
                                  <div className="UPBK-DetailItem">
                                    <MessageCircle size={14} />
                                    <span>{booking.note}</span>
                                  </div>
                                )}
                              </div>

                              {booking.status === 'accepted' && booking.zoomLink && (
                                <a
                                  href={booking.zoomLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="UPBK-ZoomLink"
                                >
                                  <Video size={14} /> Join Zoom Meeting
                                </a>
                              )}

                              {/* Cancel only if pending */}
                              {booking.status === 'pending' && (
                                <button
                                  className="UPBK-CancelBtn"
                                  onClick={() => handleCancelBooking(booking._id)}
                                >
                                  <Trash2 size={14} /> Cancel Booking
                                </button>
                              )}

                              {/* Delete for any non-pending status (completed, cancelled, rejected) */}
                              {booking.status !== 'pending' && (
                                <button
                                  className="UPBK-DeleteBtn"
                                  onClick={() => handleDeleteConsultation(booking._id)}
                                >
                                  <Trash2 size={14} /> Delete Record
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button (only for biographic/risk editing) */}
                  <AnimatePresence>
                    {isEditing && activeTab !== 'plans' && activeTab !== 'bookings' && (
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
                              <Loader2 size={18} className="VXPR-Spin" /> SAVING
                            </>
                          ) : (
                            <>
                              <Save size={18} /> SAVE ALL CHANGES
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

        {/* Booking Modal */}
        <AnimatePresence>
          {bookingModal.open && (
            <motion.div
              className="VXPR-ModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingModal({ open: false, userPlanId: null })}
            >
              <motion.div
                className="VXPR-BookingModal"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="VXPR-BookingClose"
                  onClick={() => setBookingModal({ open: false, userPlanId: null })}
                >
                  <X size={20} />
                </button>
                <h3>Book a Consultation Session</h3>
                <p className="VXPR-BookingSubtext">
                  Choose a date and time for your session. The nutritionist will review your request.
                </p>
                <div className="VXPR-FormGroup">
                  <label>Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={bookingDateTime}
                    onChange={(e) => setBookingDateTime(e.target.value)}
                    className="VXPR-DateInput"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="VXPR-FormGroup">
                  <label>Note (optional)</label>
                  <textarea
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    placeholder="Any specific topics or questions..."
                    rows={3}
                    className="VXPR-NoteInput"
                  />
                </div>
                <div className="VXPR-BookingActions">
                  <button
                    className="VXPR-BookingCancelBtn"
                    onClick={() => setBookingModal({ open: false, userPlanId: null })}
                  >
                    Cancel
                  </button>
                  <button
                    className="VXPR-BookingConfirmBtn"
                    onClick={handleBookNow}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <Loader2 size={18} className="VXPR-Spin" />
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

export default ProfilePage;