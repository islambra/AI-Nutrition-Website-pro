import React, { useState, useEffect } from 'react';
import { getAllPatients } from '../../api/userApi';
import './PatientsPage.css';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getAllPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getBMIColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'underweight': return '#3b82f6';
      case 'normal': return '#10b981';
      case 'overweight': return '#f59e0b';
      case 'obese': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getActivityLabel = (level) => {
    const levels = {
      'sedentary': 'Sedentary',
      'light': 'Light',
      'moderate': 'Moderate',
      'active': 'Active',
      'very active': 'Very Active'
    };
    return levels[level?.toLowerCase()] || level || 'Not set';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Patients</h3>
        <p>{error}</p>
        <button onClick={fetchPatients} className="retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Patient Management</h1>
            <p className="page-subtitle">View and manage all registered patients</p>
          </div>
          <div className="stats-badge">
            <span className="stats-number">{patients.length}</span>
            <span className="stats-label">Total Patients</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">×</button>
          )}
        </div>

        <div className="view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            List View
          </button>
        </div>
      </div>

      <div className="results-count">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>

      {filteredPatients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No patients found</h3>
          <p>Try adjusting your search</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="patients-grid">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              onClick={() => setSelectedPatient(patient)}
              getBMIColor={getBMIColor}
              getActivityLabel={getActivityLabel}
            />
          ))}
        </div>
      ) : (
        <div className="patients-list">
          {filteredPatients.map((patient) => (
            <PatientListItem
              key={patient._id}
              patient={patient}
              onClick={() => setSelectedPatient(patient)}
              getBMIColor={getBMIColor}
            />
          ))}
        </div>
      )}

      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          getBMIColor={getBMIColor}
          getActivityLabel={getActivityLabel}
        />
      )}
    </div>
  );
};

const PatientCard = ({ patient, onClick, getBMIColor, getActivityLabel }) => {
  const activityLabel = getActivityLabel(patient.activityLevel);
  const bmiColor = getBMIColor(patient.bmiCategory);

  return (
    <div className="patient-card" onClick={onClick}>
      <div className="card-header">
        <div className="patient-avatar">
          {patient.photo ? (
            <img src={patient.photo} alt={patient.fullName} className="avatar-img" />
          ) : (
            <div className="avatar-placeholder" style={{ backgroundColor: bmiColor }}>
              {patient.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="patient-badge" style={{ backgroundColor: bmiColor + '20', color: bmiColor }}>
          {patient.bmiCategory || 'Not assessed'}
        </div>
      </div>

      <div className="card-body">
        <h3 className="patient-name">{patient.fullName}</h3>
        <p className="patient-email">{patient.email}</p>

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

        <div className="divider"></div>

        <div className="health-stats">
          <div className="stat">
            <div className="stat-icon">⚡</div>
            <div>
              <div className="stat-value">{patient.bmr || '—'}</div>
              <div className="stat-label">BMR (kcal)</div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon">🏃</div>
            <div>
              <div className="stat-value">{patient.tdee || '—'}</div>
              <div className="stat-label">TDEE (kcal)</div>
            </div>
          </div>
        </div>

        <div className="activity-tag">
          {activityLabel}
        </div>
      </div>

      <div className="card-footer">
        <span className="goal-text">
          Goal: {patient.goals || 'No goal set'}
        </span>
        <span className="view-detail">View Details →</span>
      </div>
    </div>
  );
};

const PatientListItem = ({ patient, onClick, getBMIColor }) => {
  const bmiColor = getBMIColor(patient.bmiCategory);

  return (
    <div className="patient-list-item" onClick={onClick}>
      <div className="list-avatar">
        {patient.photo ? (
          <img src={patient.photo} alt={patient.fullName} className="list-avatar-img" />
        ) : (
          <div className="list-avatar-placeholder" style={{ backgroundColor: bmiColor }}>
            {patient.fullName?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="list-info">
        <div className="list-name-row">
          <h4 className="list-name">{patient.fullName}</h4>
          <span className="list-bmi-badge" style={{ backgroundColor: bmiColor + '20', color: bmiColor }}>
            BMI: {patient.bmi || '—'} ({patient.bmiCategory || 'N/A'})
          </span>
        </div>
        <p className="list-email">{patient.email}</p>
        <div className="list-details">
          <span>Age: {patient.age || '—'} yrs</span>
          <span>Gender: {patient.gender || '—'}</span>
          <span>BMR: {patient.bmr || '—'}</span>
          <span>TDEE: {patient.tdee || '—'}</span>
          <span>Goal: {patient.goals || 'No goal'}</span>
        </div>
      </div>

      <div className="list-arrow">→</div>
    </div>
  );
};

const PatientModal = ({ patient, onClose, getBMIColor, getActivityLabel }) => {
  const activityLabel = getActivityLabel(patient.activityLevel);
  const bmiColor = getBMIColor(patient.bmiCategory);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <div className="modal-avatar">
            {patient.photo ? (
              <img src={patient.photo} alt={patient.fullName} className="modal-avatar-img" />
            ) : (
              <div className="modal-avatar-placeholder" style={{ backgroundColor: bmiColor }}>
                {patient.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="modal-title-section">
            <h2 className="modal-name">{patient.fullName}</h2>
            <p className="modal-email">{patient.email}</p>
            <div className="modal-role-badge">{patient.role || 'Patient'}</div>
          </div>
        </div>

        <div className="modal-body">
          <div className="info-section">
            <h3 className="section-title">Physical Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{patient.age || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{patient.gender || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Height</span>
                <span className="info-value">{patient.heightCm ? `${patient.heightCm} cm` : 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Weight</span>
                <span className="info-value">{patient.weightKg ? `${patient.weightKg} kg` : 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Activity Level</span>
                <span className="info-value">{activityLabel}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title">Health Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card" style={{ borderTopColor: '#3b82f6' }}>
                <div className="metric-card-label">BMR</div>
                <div className="metric-card-value">{patient.bmr || '—'} <span className="metric-unit">kcal/day</span></div>
                <div className="metric-card-desc">Basal Metabolic Rate</div>
              </div>
              <div className="metric-card" style={{ borderTopColor: '#10b981' }}>
                <div className="metric-card-label">TDEE</div>
                <div className="metric-card-value">{patient.tdee || '—'} <span className="metric-unit">kcal/day</span></div>
                <div className="metric-card-desc">Total Daily Energy Expenditure</div>
              </div>
              <div className="metric-card" style={{ borderTopColor: bmiColor }}>
                <div className="metric-card-label">BMI</div>
                <div className="metric-card-value">{patient.bmi || '—'}</div>
                <div className="metric-card-desc" style={{ color: bmiColor }}>{patient.bmiCategory || 'Not assessed'}</div>
              </div>
              <div className="metric-card" style={{ borderTopColor: '#8b5cf6' }}>
                <div className="metric-card-label">Ideal Weight</div>
                <div className="metric-card-value">{patient.idealWeightKg || '—'} <span className="metric-unit">kg</span></div>
                <div className="metric-card-desc">Recommended weight range</div>
              </div>
              <div className="metric-card" style={{ borderTopColor: '#ec489a' }}>
                <div className="metric-card-label">Body Fat</div>
                <div className="metric-card-value">{patient.bodyFatPercentage || '—'} <span className="metric-unit">%</span></div>
                <div className="metric-card-desc">Estimated body fat</div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title">Medical Information</h3>
            <div className="info-grid">
              <div className="info-item full-width">
                <span className="info-label">Medical Conditions</span>
                <div className="tags-container">
                  {patient.medicalConditions?.length > 0 ? (
                    patient.medicalConditions.map((condition, idx) => (
                      <span key={idx} className="tag tag-red">{condition}</span>
                    ))
                  ) : (
                    <span className="info-value">None reported</span>
                  )}
                </div>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Allergies</span>
                <div className="tags-container">
                  {patient.allergies?.length > 0 ? (
                    patient.allergies.map((allergy, idx) => (
                      <span key={idx} className="tag tag-orange">{allergy}</span>
                    ))
                  ) : (
                    <span className="info-value">None reported</span>
                  )}
                </div>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Health Goals</span>
                <span className="info-value highlight">{patient.goals || 'No specific goals set'}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title">Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated</span>
                <span className="info-value">{patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;