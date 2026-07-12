import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllClients } from '../../api/userApi';
import './ClientsPage.css';

// Icon components (using SVG instead of emojis)
const Icons = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Activity: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Heart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Target: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Weight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Ruler: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="m22 12-4 4-4-4"/><path d="M10 8h4"/><path d="M12 6v4"/></svg>,
  Flame: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Droplet: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  AlertCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Grid: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  List: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Sparkles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3L14 8L19 9L15.5 12.5L17 18L12 15L7 18L8.5 12.5L5 9L10 8L12 3Z"/></svg>,
  CheckCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ChevronDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>,
  Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3"/></svg>,
  Download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Refresh: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/></svg>
};

const ClientsPage = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [filters, setFilters] = useState({
    bmiCategory: '',
    gender: '',
    activityLevel: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getAllClients();
      const data = Array.isArray(response) ? response : (response.data || []);
      
      const transformedData = data.map(client => {
        const profile = client.clientProfile || {};
        const studentProfile = client.studentProfile || {};
        const isStudent = client.role === 'student';
        return {
          ...client,
          ...profile,
          studentCardNumber: studentProfile.studentCardNumber || null,
          age: isStudent ? (studentProfile.age ?? null) : (profile.age ?? null),
          gender: isStudent ? (studentProfile.gender ?? null) : (profile.gender ?? null),
          heightCm: profile.heightCm ?? null,
          weightKg: profile.weightKg ?? null,
          activityLevel: profile.activityLevel ?? null,
          bmr: profile.bmr ?? null,
          tdee: profile.tdee ?? null,
          bmi: profile.bmi ?? null,
          bmiCategory: profile.bmiCategory ?? null,
          idealWeightKg: profile.idealWeightKg ?? null,
          bodyFatPercentage: profile.bodyFatPercentage ?? null,
          medicalConditions: profile.medicalConditions ?? [],
          allergies: profile.allergies ?? [],
          goals: profile.goals ?? null,
          updatedAt: profile.updatedAt || client.updatedAt || null
        };
      });
      
      setPatients(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesRole = roleFilter === 'all' || patient.role === roleFilter;
    const matchesSearch = patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBMI = !filters.bmiCategory || patient.bmiCategory === filters.bmiCategory;
    const matchesGender = !filters.gender || patient.gender === filters.gender;
    const matchesActivity = !filters.activityLevel || patient.activityLevel === filters.activityLevel;
    
    return matchesRole && matchesSearch && matchesBMI && matchesGender && matchesActivity;
  });

  const clientCount = patients.filter(p => p.role === 'client').length;
  const studentCount = patients.filter(p => p.role === 'student').length;

  const getBMIColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'underweight': return '#3b82f6';
      case 'normal': return '#10b981';
      case 'overweight': return '#f59e0b';
      case 'obese': return '#ef4444';
      case 'obesity': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getBMIGradient = (category) => {
    switch(category?.toLowerCase()) {
      case 'underweight': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'normal': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'overweight': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'obese': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'obesity': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  };

  const getActivityLabel = (level) => {
    const levels = {
      'sedentary': 'Sedentary',
      'lightly active': 'Lightly Active',
      'light': 'Light',
      'moderate': 'Moderate',
      'active': 'Active',
      'very active': 'Very Active'
    };
    return levels[level?.toLowerCase()] || level || 'Not set';
  };

  const clearFilters = () => {
    setFilters({
      bmiCategory: '',
      gender: '',
      activityLevel: ''
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon"><Icons.AlertCircle /></div>
        <h3>Error Loading Patients</h3>
        <p>{error}</p>
        <button onClick={fetchPatients} className="retry-btn">{t("common.tryAgain")}</button>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Client Management</h1>
            <p className="page-subtitle">View and manage all registered clients and students</p>
          </div>
          <div className="header-actions">
            <button onClick={fetchPatients} className="action-btn" title="Refresh">
              <Icons.Refresh />
            </button>
            <div className="stats-badge">
              <span className="stats-number">{patients.length}</span>
              <span className="stats-label">
                {roleFilter === 'all' ? 'Total' : roleFilter === 'client' ? 'Clients' : 'Students'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="role-tabs">
        <button
          className={`role-tab ${roleFilter === 'all' ? 'active' : ''}`}
          onClick={() => setRoleFilter('all')}
        >
          {t("common.all")} <span className="role-tab-count">{patients.length}</span>
        </button>
        <button
          className={`role-tab ${roleFilter === 'client' ? 'active' : ''}`}
          onClick={() => setRoleFilter('client')}
        >
          Clients <span className="role-tab-count">{clientCount}</span>
        </button>
        <button
          className={`role-tab ${roleFilter === 'student' ? 'active' : ''}`}
          onClick={() => setRoleFilter('student')}
        >
          Students <span className="role-tab-count">{studentCount}</span>
        </button>
      </div>

      <div className="filters-section">
        <div className="search-wrapper">
          <span className="search-icon"><Icons.Search /></span>
          <input
            type="text"
            placeholder={t("dashboard.dieteticien.clients.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search"><Icons.Close /></button>
          )}
        </div>

        {roleFilter !== 'student' && (
          <div className="filter-group">
            <button 
              className={`filter-trigger ${filterOpen ? 'active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Icons.Filter /> Filter
            </button>
            
            {filterOpen && (
              <div className="filter-dropdown">
                <div className="filter-item">
                  <label>BMI Category</label>
                  <select value={filters.bmiCategory} onChange={(e) => setFilters({...filters, bmiCategory: e.target.value})}>
                    <option value="">{t("common.all")}</option>
                    <option value="underweight">Underweight</option>
                    <option value="normal">Normal</option>
                    <option value="overweight">Overweight</option>
                    <option value="obese">Obese</option>
                  </select>
                </div>
                <div className="filter-item">
                  <label>Gender</label>
                  <select value={filters.gender} onChange={(e) => setFilters({...filters, gender: e.target.value})}>
                    <option value="">{t("common.all")}</option>
                    <option value="male">{t("dashboard.dieteticien.clients.male")}</option>
                    <option value="female">{t("dashboard.dieteticien.clients.female")}</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="filter-item">
                  <label>Activity Level</label>
                  <select value={filters.activityLevel} onChange={(e) => setFilters({...filters, activityLevel: e.target.value})}>
                    <option value="">{t("common.all")}</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly active">Lightly Active</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very active">Very Active</option>
                  </select>
                </div>
                <button onClick={clearFilters} className="clear-filters-btn">Clear All</button>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="results-count">
        Showing {filteredPatients.length} of {roleFilter === 'all' ? patients.length : roleFilter === 'client' ? clientCount : studentCount} {roleFilter === 'all' ? 'people' : roleFilter === 'client' ? 'clients' : 'students'}
      </div>

      {filteredPatients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Icons.User /></div>
          <h3>No {roleFilter === 'student' ? 'students' : 'clients'} found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="patients-grid">
          {filteredPatients.map((patient) => (
            patient.role === 'student' ? (
              <StudentCard
                key={patient._id}
                patient={patient}
                onClick={() => setSelectedPatient(patient)}
              />
            ) : (
              <PatientCard
                key={patient._id}
                patient={patient}
                onClick={() => setSelectedPatient(patient)}
                getBMIColor={getBMIColor}
                getActivityLabel={getActivityLabel}
              />
            )
          ))}
        </div>
      )}

      {selectedPatient && (
        selectedPatient.role === 'student' ? (
          <StudentModal
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        ) : (
          <ModernPatientModal
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            getBMIColor={getBMIColor}
            getBMIGradient={getBMIGradient}
            getActivityLabel={getActivityLabel}
          />
        )
      )}
    </div>
  );
};

// Modern Redesigned Patient Card
const PatientCard = ({ patient, onClick, getBMIColor, getActivityLabel }) => {
  const activityLabel = getActivityLabel(patient.activityLevel);
  const bmiColor = getBMIColor(patient.bmiCategory);

  return (
    <div className="patient-card" onClick={onClick}>
      <div className="card-header">
        <div className="patient-avatar">
          {patient.photo ? (
            <img src={patient.photo} alt={patient.fullName} className="avatar-img" loading="lazy" />
          ) : (
            <div className="avatar-placeholder" style={{ background: `linear-gradient(135deg, ${bmiColor}, ${bmiColor}dd)` }}>
              {patient.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="patient-badge" style={{ backgroundColor: bmiColor + '15', color: bmiColor }}>
          {patient.bmiCategory || 'Not assessed'}
        </div>
      </div>

      <div className="card-body">
        <h3 className="patient-name">{patient.fullName}</h3>
        <p className="patient-email"><Icons.Mail /> {patient.email}</p>

        <div className="metrics-row">
          <div className="metric">
            <span className="metric-value">{patient.age || '—'}</span>
            <span className="metric-label">Age</span>
          </div>
          <div className="metric">
            <span className="metric-value">{patient.gender?.charAt(0) || '—'}</span>
            <span className="metric-label">Gender</span>
          </div>
          <div className="metric">
            <span className="metric-value">{patient.bmi || '—'}</span>
            <span className="metric-label">BMI</span>
          </div>
        </div>

        <div className="health-stats">
          <div className="stat">
            <div className="stat-icon"><Icons.Flame /></div>
            <div>
              <div className="stat-value">{patient.bmr || '—'}</div>
              <div className="stat-label">BMR</div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon"><Icons.Zap /></div>
            <div>
              <div className="stat-value">{patient.tdee || '—'}</div>
              <div className="stat-label">TDEE</div>
            </div>
          </div>
        </div>

        <div className="activity-tag">
          <Icons.Activity /> {activityLabel}
        </div>
      </div>

      <div className="card-footer">
        <span className="goal-text">
          <Icons.Target /> {patient.goals || 'No goal set'}
        </span>
        <span className="view-detail">Details <Icons.ArrowRight /></span>
      </div>
    </div>
  );
};

// Student Card
const StudentCard = ({ patient, onClick }) => {
  return (
    <div className="student-card" onClick={onClick}>
      <div className="student-card-top">
        <div className="student-avatar">
          {patient.photo ? (
            <img src={patient.photo} alt={patient.fullName} className="avatar-img" loading="lazy" />
          ) : (
            <div className="avatar-placeholder" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              {patient.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="student-role-badge">Student</span>
      </div>
      <div className="card-body">
        <h3 className="student-name">{patient.fullName}</h3>
        <p className="patient-email"><Icons.Mail /> {patient.email}</p>
        <div className="metrics-row">
          <div className="metric">
            <span className="metric-value">{patient.age || '—'}</span>
            <span className="metric-label">Age</span>
          </div>
          <div className="metric">
            <span className="metric-value">{patient.gender?.charAt(0) || '—'}</span>
            <span className="metric-label">Gender</span>
          </div>
        </div>
        <div className="student-meta">
          <span className="student-meta-item">
            <Icons.Calendar /> Joined {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
          </span>
          {patient.studentCardNumber && (
            <span className="student-meta-item">
              <Icons.User /> ID: {patient.studentCardNumber}
            </span>
          )}
        </div>
      </div>
      <div className="card-footer">
        <span className="view-detail">Details <Icons.ArrowRight /></span>
      </div>
    </div>
  );
};

// Student Modal
const StudentModal = ({ patient, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="student-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modern-modal-close" onClick={onClose}><Icons.Close /></button>
        <div className="student-modal-hero">
          <div className="hero-avatar-wrapper">
            {patient.photo ? (
              <img src={patient.photo} alt={patient.fullName} className="hero-avatar" loading="lazy" />
            ) : (
              <div className="hero-avatar-placeholder" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {patient.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="hero-content">
            <h1 className="hero-name">{patient.fullName}</h1>
            <p className="hero-role">Student</p>
            <div className="hero-badge-group">
              <span className="hero-badge"><Icons.Mail /> {patient.email}</span>
              {patient.studentCardNumber && (
                <span className="hero-badge"><Icons.User /> ID: {patient.studentCardNumber}</span>
              )}
              <span className="hero-badge"><Icons.Calendar /> Joined {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="modern-modal-body">
          <div className="info-card">
            <div className="info-card-header">
              <Icons.User /> <h3>Personal Information</h3>
            </div>
            <div className="info-card-content">
              <div className="info-row">
                <span className="info-label">Age</span>
                <span className="info-value">{patient.age || 'Not specified'} years</span>
              </div>
              <div className="info-row">
                <span className="info-label">Gender</span>
                <span className="info-value">{patient.gender || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-header">
              <Icons.Clock /> <h3>Account Timeline</h3>
            </div>
            <div className="info-card-content">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div>
                  <div className="timeline-title">Member Since</div>
                  <div className="timeline-date">{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div>
                  <div className="timeline-title">Last Updated</div>
                  <div className="timeline-date">{patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// COMPLETELY REDESIGNED MODERN PATIENT DETAIL MODAL
const ModernPatientModal = ({ patient, onClose, getBMIColor, getBMIGradient, getActivityLabel }) => {
  const activityLabel = getActivityLabel(patient.activityLevel);
  const bmiColor = getBMIColor(patient.bmiCategory);
  const bmiGradient = getBMIGradient(patient.bmiCategory);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modern-modal-close" onClick={onClose}><Icons.Close /></button>

        {/* Hero Section with Gradient Background */}
        <div className="modern-modal-hero" style={{ background: bmiGradient }}>
          <div className="hero-avatar-wrapper">
            {patient.photo ? (
              <img src={patient.photo} alt={patient.fullName} className="hero-avatar" loading="lazy" />
            ) : (
              <div className="hero-avatar-placeholder">
                {patient.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="hero-content">
            <h1 className="hero-name">{patient.fullName}</h1>
            <p className="hero-role">{patient.role || 'Client'}</p>
            <div className="hero-badge-group">
              <span className="hero-badge"><Icons.Mail /> {patient.email}</span>
              <span className="hero-badge"><Icons.Calendar /> Joined {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="modern-modal-body">
          {/* BMI Status Card */}
          <div className="bmi-status-card" style={{ borderLeftColor: bmiColor }}>
            <div className="bmi-status-left">
              <div className="bmi-value-large">{patient.bmi || '—'}</div>
              <div className="bmi-category" style={{ color: bmiColor }}>{patient.bmiCategory || 'Not assessed'}</div>
            </div>
            <div className="bmi-status-right">
              <div className="bmi-range">
                <div className="bmi-range-track">
                  <div className="bmi-range-fill" style={{ width: patient.bmi ? `${Math.min(100, (patient.bmi / 40) * 100)}%` : '0%', background: bmiGradient }}></div>
                </div>
                <div className="bmi-range-labels">
                  <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout for better organization */}
          <div className="modal-two-columns">
            {/* Left Column */}
            <div className="modal-column">
              <div className="info-card">
                <div className="info-card-header">
                  <Icons.User /> <h3>Personal Information</h3>
                </div>
                <div className="info-card-content">
                  <div className="info-row">
                    <span className="info-label">Age</span>
                    <span className="info-value">{patient.age || 'Not specified'} years</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{patient.gender || 'Not specified'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label"><Icons.Ruler /> Height</span>
                    <span className="info-value">{patient.heightCm ? `${patient.heightCm} cm` : 'Not specified'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label"><Icons.Weight /> Weight</span>
                    <span className="info-value">{patient.weightKg ? `${patient.weightKg} kg` : 'Not specified'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label"><Icons.Activity /> Activity Level</span>
                    <span className="info-value highlight">{activityLabel}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <Icons.Heart /> <h3>Medical Conditions</h3>
                </div>
                <div className="info-card-content">
                  <div className="tags-container">
                    {patient.medicalConditions?.length > 0 ? (
                      patient.medicalConditions.map((condition, idx) => (
                        <span key={idx} className="tag tag-red">{condition}</span>
                      ))
                    ) : (
                      <span className="info-value muted">None reported</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <Icons.AlertCircle /> <h3>Allergies</h3>
                </div>
                <div className="info-card-content">
                  <div className="tags-container">
                    {patient.allergies?.length > 0 ? (
                      patient.allergies.map((allergy, idx) => (
                        <span key={idx} className="tag tag-orange">{allergy}</span>
                      ))
                    ) : (
                      <span className="info-value muted">None reported</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="modal-column">
              <div className="info-card">
                <div className="info-card-header">
                  <Icons.Target /> <h3>Health Goals</h3>
                </div>
                <div className="info-card-content">
                  <div className="goal-card">
                    <Icons.Sparkles />
                    <span className="goal-text-large">{patient.goals || 'No specific goals set'}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <Icons.Flame /> <h3>Metabolic Metrics</h3>
                </div>
                <div className="metrics-modern">
                  <div className="metric-modern-item">
                    <div className="metric-modern-icon"><Icons.Flame /></div>
                    <div className="metric-modern-info">
                      <span className="metric-modern-label">Basal Metabolic Rate (BMR)</span>
                      <span className="metric-modern-value">{patient.bmr || '—'} <small>kcal/day</small></span>
                      <span className="metric-modern-desc">Energy burned at rest</span>
                    </div>
                  </div>
                  <div className="metric-modern-item">
                    <div className="metric-modern-icon"><Icons.Zap /></div>
                    <div className="metric-modern-info">
                      <span className="metric-modern-label">Total Daily Energy Expenditure</span>
                      <span className="metric-modern-value">{patient.tdee || '—'} <small>kcal/day</small></span>
                      <span className="metric-modern-desc">Total calories burned daily</span>
                    </div>
                  </div>
                  <div className="metric-modern-item">
                    <div className="metric-modern-icon"><Icons.Droplet /></div>
                    <div className="metric-modern-info">
                      <span className="metric-modern-label">Body Fat Percentage</span>
                      <span className="metric-modern-value">{patient.bodyFatPercentage || '—'} <small>%</small></span>
                      <span className="metric-modern-desc">Estimated body composition</span>
                    </div>
                  </div>
                  <div className="metric-modern-item">
                    <div className="metric-modern-icon"><Icons.CheckCircle /></div>
                    <div className="metric-modern-info">
                      <span className="metric-modern-label">Ideal Weight Range</span>
                      <span className="metric-modern-value">{patient.idealWeightKg || '—'} <small>kg</small></span>
                      <span className="metric-modern-desc">Recommended healthy weight</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <Icons.Clock /> <h3>Account Timeline</h3>
                </div>
                <div className="info-card-content">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div>
                      <div className="timeline-title">Member Since</div>
                      <div className="timeline-date">{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div>
                      <div className="timeline-title">Last Updated</div>
                      <div className="timeline-date">{patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;