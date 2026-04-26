import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Shield, Edit3, Camera, Save, X, Leaf, 
  Activity, Target, Heart, Loader2, Info, AlertTriangle, 
  Thermometer, TrendingUp, Zap, ChevronRight, Award,
  Scale, Ruler, Calendar, Fingerprint, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUser as updateUserService } from '../api/userApi';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import './ProfilePage.css';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    weightKg: '',
    heightCm: '',
    goals: '',
    gender: '',
    activityLevel: '',
    medicalConditions: '',
    allergies: ''
  });

  useEffect(() => {
    if (user) {
      const client = user.clientProfile || {};
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        age: client.age || '',
        weightKg: client.weightKg || '',
        heightCm: client.heightCm || '',
        goals: client.goals || '',
        gender: client.gender || 'Male',
        activityLevel: client.activityLevel || 'Moderate',
        medicalConditions: Array.isArray(client.medicalConditions) ? client.medicalConditions.join(', ') : '',
        allergies: Array.isArray(client.allergies) ? client.allergies.join(', ') : ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('INVALID_FILE_TYPE: Please select an image.');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Syncing biometric visual...', {
      style: { fontFamily: 'JetBrains Mono', fontSize: '12px' }
    });

    try {
      const result = await updateUserService(user._id, {}, file);
      if (updateUser) updateUser(result.user);
      toast.dismiss(loadingToast);
      toast.success('AVATAR_SYNCHRONIZED');
    } catch (err) {
      console.error('Upload error:', err);
      toast.dismiss(loadingToast);
      toast.error('UPLOAD_FAILED');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Processing biological sync...', {
      style: { fontFamily: 'JetBrains Mono', fontSize: '12px' }
    });

    try {
      const submissionData = {
        ...formData,
        medicalConditions: formData.medicalConditions.split(',').map(s => s.trim()).filter(s => s),
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(s => s)
      };

      const result = await updateUserService(user._id, submissionData);
      if (updateUser) updateUser(result.user);
      
      toast.dismiss(loadingToast);
      toast.success('DATA_INTEGRATED', { icon: '🧬' });
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'SYNC_ERROR');
    }
  };

  const getAvatar = () => {
    return user?.photo || user?.profilePicture || null;
  };

  const clientProfile = user?.clientProfile || {};

  return (
    <PageTransition>
      <div className="VPR-Wrapper">
        <div className="VPR-OrganicContainer">
          <motion.div 
            animate={{ opacity: [0, 0.08, 0], scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="VPR-Floater"
            style={{ top: '5%', right: '10%' }}
          >
            <Leaf size={180} strokeWidth={0.5} />
          </motion.div>
        </div>

        <div className="VPR-Container">
          <header className="VPR-Header">
            
            <ScrollReveal delay={0.1}>
              <h1 className="VPR-Title">CORE <span className="VPR-Highlight">RECORDS_</span></h1>
            </ScrollReveal>
          </header>

          <div className="VPR-Content">
            {/* Sidebar Section */}
            <aside className="VPR-Sidebar">
              <ScrollReveal direction="left" className="VPR-AvatarCard">
                <div className="VPR-AvatarWrapper">
                  {getAvatar() ? (
                    <img src={getAvatar()} alt="Profile" className="VPR-AvatarImg" />
                  ) : (
                    <div className="VPR-AvatarPlaceholder">
                      <Fingerprint size={80} strokeWidth={0.5} />
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                  <button className="VPR-AvatarEdit" onClick={handleImageClick} disabled={isUploading}>
                    {isUploading ? <Loader2 size={18} className="VPR-Spin" /> : <Camera size={18} />}
                  </button>
                </div>
                <h2 className="VPR-UserName">{user?.fullName || 'UNREGISTERED_ENTITY'}</h2>
                <div className="VPR-UserRoleBadge">
                  <span className="VPR-RoleText">{user?.role?.toUpperCase()}</span>
                </div>
                
                <div className="VPR-QuickStats">
                  <div className="VPR-QuickStat">
                    <Activity size={16} />
                    <div className="VPR-StatContent">
                      <span className="VPR-StatLabel">HEALTH_INDEX</span>
                      <span className="VPR-StatValue">{clientProfile.bmiCategory?.toUpperCase() || 'PNDG'}</span>
                    </div>
                  </div>
                  <div className="VPR-QuickStat">
                    <Award size={16} />
                    <div className="VPR-StatContent">
                      <span className="VPR-StatLabel">LOG_YEAR</span>
                      <span className="VPR-StatValue">{new Date(user?.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {user?.role === "Client" && (
                <>
                  <ScrollReveal direction="left" delay={0.2} className="VPR-HealthMetrics">
                    <h3 className="VPR-SidebarHeading">SYNTHESIZED_METRICS</h3>
                    <div className="VPR-MetricsFullGrid">
                      <div className="VPR-MetricCard">
                        <Scale size={20} />
                        <span className="v-m-label">BMI_INDEX</span>
                        <span className="v-m-value">{clientProfile.bmi || '--'}</span>
                        <span className="v-m-sub">{clientProfile.bmiCategory || 'Wait...'}</span>
                      </div>
                      <div className="VPR-MetricCard">
                        <Zap size={20} />
                        <span className="v-m-label">BMR_RATE</span>
                        <span className="v-m-value">{clientProfile.bmr || '--'}</span>
                        <span className="v-m-sub">kcal/d</span>
                      </div>
                      <div className="VPR-MetricCard">
                        <Activity size={20} />
                        <span className="v-m-label">TDEE_ENERGY</span>
                        <span className="v-m-value">{clientProfile.tdee || '--'}</span>
                        <span className="v-m-sub">Active Burn</span>
                      </div>
                      <div className="VPR-MetricCard">
                        <Target size={20} />
                        <span className="v-m-label">TARGET_MASS</span>
                        <span className="v-m-value">{clientProfile.idealWeightKg || '--'}</span>
                        <span className="v-m-sub">kg (Optimum)</span>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={0.3} className="VPR-VitalWarning">
                    <h3 className="VPR-SidebarHeading">RISK_SENSITIVITY</h3>
                    <div className="VPR-WarningBox is-alert">
                      <AlertTriangle size={20} className="VPR-WarningIcon" />
                      <div className="VPR-WarningContent">
                        <strong className="VPR-WarningLabel">ALLERGIES_DETECTED</strong>
                        <p className="VPR-WarningText">{clientProfile.allergies?.length > 0 ? clientProfile.allergies.join(', ') : 'ZERO_RECORDS'}</p>
                      </div>
                    </div>
                    <div className="VPR-WarningBox is-info">
                      <Thermometer size={20} className="VPR-WarningIcon" />
                      <div className="VPR-WarningContent">
                        <strong className="VPR-WarningLabel">MEDICAL_HISTORY</strong>
                        <p className="VPR-WarningText">{clientProfile.medicalConditions?.length > 0 ? clientProfile.medicalConditions.join(', ') : 'STABLE_STATUS'}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                </>
              )}
            </aside>

            {/* Main Records Section */}
            <main className="VPR-Main">
              <ScrollReveal direction="right" className="VPR-FormCard">
                <div className="VPR-FormHeader">
                  <div className="VPR-FormHeaderTitle">
                    <Info size={20} />
                    <h3>BIO_CORE_RECORDS</h3>
                  </div>
                  <button 
                    className={`VPR-EditBtn ${isEditing ? 'is-editing' : ''}`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <><X size={16} /> CANCEL</> : <><Edit3 size={16} /> MODIFY_DATA</>}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="VPR-Form">
                  <div className="VPR-FormGrid">
                    <div className="VPR-FormGroup">
                      <label htmlFor="fullName">LEGAL_IDENTITY</label>
                      <div className="VPR-InputWrapper">
                        <User className="input-icon" size={18} />
                        <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} placeholder="John Doe" />
                      </div>
                    </div>

                    <div className="VPR-FormGroup">
                      <label htmlFor="email">COMMS_ENDPOINT</label>
                      <div className="VPR-InputWrapper">
                        <Mail className="input-icon" size={18} />
                        <input type="email" id="email" value={formData.email} onChange={handleChange} disabled={!isEditing} placeholder="entity@vital.com" />
                      </div>
                    </div>

                    {user?.role === "Client" && (
                      <>
                        <div className="VPR-FormGroup">
                          <label htmlFor="age">TEMPORAL_AGE</label>
                          <div className="VPR-InputWrapper">
                            <Calendar className="input-icon" size={18} />
                            <input type="number" id="age" value={formData.age} onChange={handleChange} disabled={!isEditing} placeholder="25" />
                          </div>
                        </div>

                        <div className="VPR-FormGroup">
                          <label htmlFor="gender">GENETIC_BIOTYPE</label>
                          <div className="VPR-InputWrapper">
                            <Activity className="input-icon" size={18} />
                            <select id="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing}>
                              <option value="Male">XY_MALE</option>
                              <option value="Female">XX_FEMALE</option>
                            </select>
                          </div>
                        </div>

                        <div className="VPR-FormGroup">
                          <label htmlFor="heightCm">HEIGHT_STATURE (CM)</label>
                          <div className="VPR-InputWrapper">
                            <Ruler className="input-icon" size={18} />
                            <input type="number" id="heightCm" value={formData.heightCm} onChange={handleChange} disabled={!isEditing} placeholder="180" />
                          </div>
                        </div>

                        <div className="VPR-FormGroup">
                          <label htmlFor="weightKg">TOTAL_MASS (KG)</label>
                          <div className="VPR-InputWrapper">
                            <Scale className="input-icon" size={18} />
                            <input type="number" id="weightKg" value={formData.weightKg} onChange={handleChange} disabled={!isEditing} placeholder="75" />
                          </div>
                        </div>

                        <div className="VPR-FormGroup">
                          <label htmlFor="activityLevel">METABOLIC_OUTPUT</label>
                          <div className="VPR-InputWrapper">
                            <Zap className="input-icon" size={18} />
                            <select id="activityLevel" value={formData.activityLevel} onChange={handleChange} disabled={!isEditing}>
                              <option value="Sedentary">MIN_OUTPUT</option>
                              <option value="Lightly Active">LOW_OUTPUT</option>
                              <option value="Moderate">MOD_OUTPUT</option>
                              <option value="Active">HIGH_OUTPUT</option>
                              <option value="Very Active">MAX_OUTPUT</option>
                            </select>
                          </div>
                        </div>

                        <div className="VPR-FormGroup">
                          <label htmlFor="goals">EVOLUTION_GOAL</label>
                          <div className="VPR-InputWrapper">
                            <Target className="input-icon" size={18} />
                            <input type="text" id="goals" value={formData.goals} onChange={handleChange} disabled={!isEditing} placeholder="Optimize mass" />
                          </div>
                        </div>

                        <div className="VPR-FormGroup is-full">
                          <label htmlFor="medicalConditions">PATHOLOGICAL_HISTORY (LIST)</label>
                          <div className="VPR-InputWrapper">
                            <Thermometer className="input-icon" size={18} />
                            <input type="text" id="medicalConditions" value={formData.medicalConditions} onChange={handleChange} disabled={!isEditing} placeholder="Asthma, Diabetes..." />
                          </div>
                        </div>

                        <div className="VPR-FormGroup is-full">
                          <label htmlFor="allergies">IMMUNE_SENSITIVITIES (LIST)</label>
                          <div className="VPR-InputWrapper">
                            <AlertTriangle className="input-icon" size={18} />
                            <input type="text" id="allergies" value={formData.allergies} onChange={handleChange} disabled={!isEditing} placeholder="Gluten, Peanuts..." />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <AnimatePresence>
                    {isEditing && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="VPR-FormActions"
                      >
                        <button type="submit" className="VPR-SaveBtn">
                          <Save size={18} /> EXECUTE_BIO_SYNC
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
