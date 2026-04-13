import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Camera, Save, X, Leaf, Activity, Target, Heart, Loader2 } from 'lucide-react';
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
    phone: '',
    address: '',
    bio: '',
    age: '',
    weightKg: '',
    heightCm: '',
    goal: '',
    gender: '',
    activityLevel: ''
  });

  useEffect(() => {
    if (user) {
      const client = user.clientProfile || {};
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        age: client.age || '',
        weightKg: client.weightKg || '',
        heightCm: client.heightCm || '',
        goal: client.goals || 'Weight Loss',
        gender: client.gender || 'Male',
        activityLevel: client.activityLevel || 'Moderate'
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('INVALID_FILE_TYPE: Please select an image.');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading biometric visual...', {
      style: { fontFamily: 'JetBrains Mono', fontSize: '12px' }
    });

    try {
      // Use the existing updateUserService which handles FormData
      const result = await updateUserService(user._id, {}, file);
      
      if (updateUser) updateUser(result.user);
      
      toast.dismiss(loadingToast);
      toast.success('AVATAR_SYNCHRONIZED', {
        icon: '📸',
        style: { fontFamily: 'JetBrains Mono', fontSize: '12px' }
      });
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
    const loadingToast = toast.loading('Syncing biological data...', {
      style: { fontFamily: 'JetBrains Mono', fontSize: '12px' }
    });

    try {
      const result = await updateUserService(user._id, formData);
      
      if (updateUser) updateUser(result.user);
      
      toast.dismiss(loadingToast);
      toast.success('PROFILE_SYNCHRONIZED', {
        icon: '🧬',
        style: { fontFamily: 'JetBrains Mono', fontSize: '12px' }
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'SYNC_INTERRUPTED');
    }
  };

  const getAvatar = () => {
    return user?.photo || user?.profilePicture || null;
  };

  return (
    <PageTransition>
      <div className="ProfilePage-Wrapper">
        <div className="ProfilePage-Organic-Container">
          <motion.div 
            animate={{ opacity: [0, 0.1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="ProfilePage-Floater"
            style={{ top: '10%', right: '15%' }}
          >
            <Leaf size={120} strokeWidth={0.5} />
          </motion.div>
        </div>

        <div className="ProfilePage-Container">
          <header className="ProfilePage-Header">
            <ScrollReveal direction="down">
              <span className="ProfilePage-Badge">BIO_IDENTIFICATION</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="ProfilePage-Title">USER <span className="ProfilePage-Highlight">PROFILE_</span></h1>
            </ScrollReveal>
          </header>

          <div className="ProfilePage-Content">
            {/* Left Column: Avatar & Quick Stats */}
            <div className="ProfilePage-Sidebar">
              <ScrollReveal direction="left" className="ProfilePage-Avatar-Card">
                <div className="ProfilePage-Avatar-Wrapper">
                  {getAvatar() ? (
                    <img src={getAvatar()} alt="Profile" className="ProfilePage-Avatar-Img" />
                  ) : (
                    <div className="ProfilePage-Avatar-Placeholder">
                      <User size={80} strokeWidth={1} />
                    </div>
                  )}
                  
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                  />
                  
                  <button 
                    className="ProfilePage-Avatar-Edit" 
                    onClick={handleImageClick}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                  </button>
                </div>
                <h2 className="ProfilePage-User-Name">{formData.fullName || 'VITAL_USER'}</h2>
                <span className="ProfilePage-User-Role">{user?.role?.toUpperCase() || 'CLIENT'}</span>
                
                <div className="ProfilePage-Quick-Stats">
                  <div className="ProfilePage-Quick-Stat">
                    <Activity size={16} />
                    <div>
                      <span className="stat-label">STATUS</span>
                      <span className="stat-value">ACTIVE</span>
                    </div>
                  </div>
                  <div className="ProfilePage-Quick-Stat">
                    <Shield size={16} />
                    <div>
                      <span className="stat-label">SECURITY</span>
                      <span className="stat-value">VERIFIED</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.2} className="ProfilePage-Health-Metrics">
                <h3>VITAL_METRICS</h3>
                <div className="ProfilePage-Metrics-Grid">
                  <div className="ProfilePage-Metric">
                    <span className="metric-label">WEIGHT</span>
                    <span className="metric-value">{formData.weightKg || '--'} kg</span>
                  </div>
                  <div className="ProfilePage-Metric">
                    <span className="metric-label">HEIGHT</span>
                    <span className="metric-value">{formData.heightCm || '--'} cm</span>
                  </div>
                  <div className="ProfilePage-Metric">
                    <span className="metric-label">AGE</span>
                    <span className="metric-value">{formData.age || '--'} yrs</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Information Form */}
            <div className="ProfilePage-Main">
              <ScrollReveal direction="right" className="ProfilePage-Form-Card">
                <div className="ProfilePage-Form-Header">
                  <h3>BIOLOGICAL_RECORDS</h3>
                  <button 
                    className={`ProfilePage-Edit-Btn ${isEditing ? 'active' : ''}`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <><X size={16} /> CANCEL</> : <><Edit3 size={16} /> EDIT_RECORDS</>}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="ProfilePage-Form">
                  <div className="ProfilePage-Form-Grid">
                    <div className="ProfilePage-Form-Group">
                      <label htmlFor="fullName">FULL_NAME</label>
                      <div className="ProfilePage-Input-Wrapper">
                        <User className="input-icon" size={16} />
                        <input 
                          type="text" 
                          id="fullName" 
                          value={formData.fullName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Legal Identity"
                        />
                      </div>
                    </div>

                    <div className="ProfilePage-Form-Group">
                      <label htmlFor="email">EMAIL_ENDPOINT</label>
                      <div className="ProfilePage-Input-Wrapper">
                        <Mail className="input-icon" size={16} />
                        <input 
                          type="email" 
                          id="email" 
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Primary Communication Link"
                        />
                      </div>
                    </div>

                    {user?.role === "Client" && (
                      <>
                        <div className="ProfilePage-Form-Group">
                          <label htmlFor="age">AGE_VAL</label>
                          <div className="ProfilePage-Input-Wrapper">
                            <Calendar className="input-icon" size={16} />
                            <input 
                              type="number" 
                              id="age" 
                              value={formData.age}
                              onChange={handleChange}
                              disabled={!isEditing}
                              placeholder="Biological Age"
                            />
                          </div>
                        </div>

                        <div className="ProfilePage-Form-Group">
                          <label htmlFor="heightCm">HEIGHT_CM</label>
                          <div className="ProfilePage-Input-Wrapper">
                            <ArrowRight className="input-icon" size={16} style={{transform: 'rotate(-90deg)'}} />
                            <input 
                              type="number" 
                              id="heightCm" 
                              value={formData.heightCm}
                              onChange={handleChange}
                              disabled={!isEditing}
                              placeholder="Stature in CM"
                            />
                          </div>
                        </div>

                        <div className="ProfilePage-Form-Group">
                          <label htmlFor="weightKg">WEIGHT_KG</label>
                          <div className="ProfilePage-Input-Wrapper">
                            <Activity className="input-icon" size={16} />
                            <input 
                              type="number" 
                              id="weightKg" 
                              value={formData.weightKg}
                              onChange={handleChange}
                              disabled={!isEditing}
                              placeholder="Mass in KG"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="ProfilePage-Form-Group full">
                      <label htmlFor="bio">BIOGRAPHY_DATA</label>
                      <div className="ProfilePage-Input-Wrapper">
                        <Edit3 className="input-icon top" size={16} />
                        <textarea 
                          id="bio" 
                          value={formData.bio}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Brief biological summary..."
                          rows="4"
                        ></textarea>
                      </div>
                    </div>

                    {user?.role === "Client" && (
                      <div className="ProfilePage-Form-Group">
                        <label htmlFor="goal">PRIMARY_HEALTH_GOAL</label>
                        <div className="ProfilePage-Input-Wrapper">
                          <Target className="input-icon" size={16} />
                          <select 
                            id="goal" 
                            value={formData.goal}
                            onChange={handleChange}
                            disabled={!isEditing}
                          >
                            <option value="Weight Loss">WEIGHT_LOSS</option>
                            <option value="Muscle Gain">MUSCLE_GAIN</option>
                            <option value="Energy Optimization">ENERGY_OPTIMIZATION</option>
                            <option value="Longevity">LONGEVITY_EXTENSION</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isEditing && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ProfilePage-Form-Actions"
                      >
                        <button type="submit" className="ProfilePage-Save-Btn">
                          <Save size={18} /> SYNCHRONIZE_CHANGES
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

const ArrowRight = ({ size, className, style }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default ProfilePage;

