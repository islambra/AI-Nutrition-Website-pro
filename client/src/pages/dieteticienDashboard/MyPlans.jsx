import React, { useState, useEffect } from 'react';
import { getMyPlans, updatePlan, deletePlan, getPlanCategories, getFollowUpOptions, validateMacronutrients } from '../../api/planApi';
import {
  FiPlus, FiEdit, FiSave, FiX, FiTrash2, FiCalendar,
  FiDollarSign, FiFolder, FiImage, FiRefreshCw, FiUser,
  FiChevronRight, FiCheck, FiAlertCircle, FiClock,
  FiTarget, FiShoppingBag, FiDroplet, FiCoffee,
  FiHeart, FiTrendingUp, FiActivity, FiArrowLeft,
  FiInfo
} from 'react-icons/fi';
import './MyPlans.css';

const PlanDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        notify('Failed to get user information', 'error');
      }
    } else {
      notify('User not found. Please login again.', 'error');
    }
  }, []);

  const fetchPlans = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const response = await getMyPlans();
      if (response.success) {
        setPlans(response.data);
      } else {
        notify(response.message || 'Failed to load plans', 'error');
      }
    } catch (err) {
      notify(err.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchPlans();
  }, [currentUser]);

  const notify = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsEditing(false);
    setError(null);
  };

  const handleStartEdit = () => {
    setFormData(JSON.parse(JSON.stringify(selectedPlan)));
    setImagePreview(selectedPlan.planImage || null);
    setImageFile(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(null);
    setImagePreview(null);
    setImageFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalorieChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      dailyCalorieRange: { ...prev.dailyCalorieRange, [field]: parseInt(value) || 0 }
    }));
  };

  const handleMacroChange = (macro, value) => {
    setFormData(prev => ({
      ...prev,
      macronutrientRatio: { ...prev.macronutrientRatio, [macro]: parseInt(value) || 0 }
    }));
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const handleMealStructureChange = (meal, value) => {
    setFormData(prev => ({
      ...prev,
      mealStructure: { ...prev.mealStructure, [meal]: value.split(',').map(s => s.trim()).filter(Boolean) }
    }));
  };

  const handleAddMeal = () => {
    setFormData(prev => ({
      ...prev,
      mealStructure: { ...prev.mealStructure, 'New Meal': [] }
    }));
  };

  const handleRemoveMeal = (meal) => {
    const updated = { ...formData.mealStructure };
    delete updated[meal];
    setFormData(prev => ({ ...prev, mealStructure: updated }));
  };

  const handleUpdateMealName = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    const updated = { ...formData.mealStructure };
    updated[newName] = updated[oldName];
    delete updated[oldName];
    setFormData(prev => ({ ...prev, mealStructure: updated }));
  };

  const handleGroceryChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      weeklyGroceryList: {
        ...prev.weeklyGroceryList,
        [category]: value.split(',').map(s => s.trim()).filter(Boolean)
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify('Image size must be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { carbs, protein, fat } = formData.macronutrientRatio;
    const validation = validateMacronutrients(carbs, protein, fat);
    if (!validation.valid) {
      notify(validation.message, 'error');
      return;
    }
    setUpdateLoading(true);
    try {
      const payload = { ...formData };
      if (imageFile) payload.planImage = imageFile;
      const response = await updatePlan(selectedPlan._id, payload);
      if (response.success) {
        await fetchPlans();
        setSelectedPlan(response.data);
        setIsEditing(false);
        notify('Plan updated successfully!', 'success');
      } else {
        notify(response.message || 'Update failed', 'error');
      }
    } catch (err) {
      notify(err.message || 'An error occurred', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteConfirm(null);
    try {
      const response = await deletePlan(selectedPlan._id);
      if (response.success) {
        await fetchPlans();
        setSelectedPlan(null);
        notify('Plan deleted successfully!', 'success');
      } else {
        notify(response.message || 'Delete failed', 'error');
      }
    } catch (err) {
      notify(err.message || 'An error occurred', 'error');
    }
  };

  const getMacroTotal = () => {
    if (!formData) return 0;
    return formData.macronutrientRatio.carbs + formData.macronutrientRatio.protein + formData.macronutrientRatio.fat;
  };

  if (!currentUser) {
    return <div className="dash-error">Please login to view your plans</div>;
  }

  if (loading && plans.length === 0) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading your plans...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* Notifications */}
      {error && (
        <div className="dash-notification error">
          <FiAlertCircle /><span>{error}</span>
          <button onClick={() => setError(null)}><FiX /></button>
        </div>
      )}
      {success && (
        <div className="dash-notification success">
          <FiCheck /><span>{success}</span>
          <button onClick={() => setSuccess(null)}><FiX /></button>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="dash-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-head">
              <FiAlertCircle /> Delete Plan
            </div>
            <div className="dash-modal-body">
              <p>Are you sure you want to delete <strong>{selectedPlan?.planName}</strong>?</p>
              <p className="dash-modal-warn">This action cannot be undone.</p>
            </div>
            <div className="dash-modal-foot">
              <button className="dash-modal-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="dash-modal-confirm" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <div className="dash-avatar">
            {currentUser.photo ? (
              <img src={currentUser.photo} alt={currentUser.fullName} />
            ) : (
              currentUser.fullName?.charAt(0).toUpperCase() || <FiUser size={18} />
            )}
          </div>
          <div className="dash-user-info">
            <h3>{currentUser.fullName}</h3>
            <p>{currentUser.role} &middot; {currentUser.email}</p>
          </div>
        </div>
        <div className="dash-topbar-right">
          <span className="dash-plan-count">{plans.length} {plans.length === 1 ? 'Plan' : 'Plans'}</span>
          <button className="dash-refresh-btn" onClick={fetchPlans} title="Refresh">
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="dash-body">

        {/* Left: Plan List */}
        <div className="dash-plans-panel">
          <div className="dash-plans-header">
            <h2><FiFolder size={15} /> My Plans</h2>
          </div>
          <div className="dash-plans-scroll">
            {plans.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon"><FiFolder size={44} /></div>
                <p>You haven't created any plans yet.</p>
                <button className="dash-empty-btn" onClick={() => window.location.href = '/dieteticien/create-plan'}>
                  <FiPlus size={16} /> Create Your First Plan
                </button>
              </div>
            ) : (
              plans.map(plan => (
                <div
                  key={plan._id}
                  className={`dash-plan-card ${selectedPlan?._id === plan._id ? 'active' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.planImage ? (
                    <img src={plan.planImage} alt={plan.planName} className="dash-plan-card-img" />
                  ) : (
                    <div className="dash-plan-card-img-placeholder"><FiImage size={18} /></div>
                  )}
                  <div className="dash-plan-card-body">
                    <h4>{plan.planName}</h4>
                    <div className="dash-plan-card-meta">
                      <span><FiCalendar size={11} /> {plan.duration}w</span>
                      <span><FiDollarSign size={11} /> ${plan.price}</span>
                    </div>
                    <div className="dash-plan-card-category">{plan.planCategory}</div>
                  </div>
                  <FiChevronRight size={16} className="dash-plan-card-arrow" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="dash-detail-panel">
          {!selectedPlan ? (
            <div className="dash-no-selection">
              <FiFolder size={56} />
              <h3>No Plan Selected</h3>
              <p>Select a plan from the list to view its details</p>
            </div>
          ) : isEditing ? (
            /* ── Edit Mode ── */
            <form onSubmit={handleUpdate} className="dash-edit">
              <div className="dash-edit-header">
                <div className="dash-edit-header-left">
                  <button type="button" className="dash-back-btn" onClick={handleCancelEdit}>
                    <FiArrowLeft size={16} />
                  </button>
                  <h2>Edit: {selectedPlan.planName}</h2>
                </div>
                <div className="dash-edit-actions">
                  <button type="button" className="dash-btn dash-btn-cancel" onClick={handleCancelEdit}>
                    <FiX size={14} /> Cancel
                  </button>
                  <button type="submit" className="dash-btn dash-btn-save" disabled={updateLoading}>
                    <FiSave size={14} /> {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="dash-edit-section">
                <h4 className="dash-edit-section-title"><FiInfo size={15} /> Basic Information</h4>
                <div className="dash-field">
                  <label>Plan Name *</label>
                  <input type="text" name="planName" value={formData.planName} onChange={handleInputChange} required />
                </div>
                <div className="dash-field-row">
                  <div className="dash-field">
                    <label>Category *</label>
                    <select name="planCategory" value={formData.planCategory} onChange={handleInputChange} required>
                      <option value="">Select</option>
                      {getPlanCategories().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="dash-field">
                    <label>Target User *</label>
                    <input type="text" name="targetUserProfile" value={formData.targetUserProfile} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="dash-field">
                  <label>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required />
                </div>
                <div className="dash-field">
                  <label>Plan Image</label>
                  <div className="dash-image-upload">
                    {imagePreview ? (
                      <div className="dash-image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button type="button" className="dash-image-remove" onClick={() => { setImagePreview(null); setImageFile(null); setFormData(prev => ({ ...prev, planImage: null })); }}>
                          <FiX size={10} />
                        </button>
                      </div>
                    ) : (
                      <label className="dash-image-label">
                        <FiImage size={18} /> Click to upload image
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="dash-field-row">
                  <div className="dash-field">
                    <label>Duration (weeks) *</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} required min="1" />
                  </div>
                  <div className="dash-field">
                    <label>Price ($) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" />
                  </div>
                </div>
                <div className="dash-field-row">
                  <div className="dash-field">
                    <label>Consultations</label>
                    <input type="number" name="consultationIncluded" value={formData.consultationIncluded} onChange={handleInputChange} min="0" />
                  </div>
                  <div className="dash-field">
                    <label>Follow-up Frequency</label>
                    <select name="followUpFrequency" value={formData.followUpFrequency} onChange={handleInputChange}>
                      {getFollowUpOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Nutrition */}
              <div className="dash-edit-section">
                <h4 className="dash-edit-section-title"><FiTarget size={15} /> Nutrition Parameters</h4>
                <div className="dash-field-row">
                  <div className="dash-field">
                    <label>Min Calories</label>
                    <input type="number" value={formData.dailyCalorieRange.min} onChange={e => handleCalorieChange('min', e.target.value)} />
                  </div>
                  <div className="dash-field">
                    <label>Max Calories</label>
                    <input type="number" value={formData.dailyCalorieRange.max} onChange={e => handleCalorieChange('max', e.target.value)} />
                  </div>
                </div>
                <div className="dash-field-triple">
                  <div className="dash-field">
                    <label>Carbs %</label>
                    <input type="number" value={formData.macronutrientRatio.carbs} onChange={e => handleMacroChange('carbs', e.target.value)} min="0" max="100" />
                  </div>
                  <div className="dash-field">
                    <label>Protein %</label>
                    <input type="number" value={formData.macronutrientRatio.protein} onChange={e => handleMacroChange('protein', e.target.value)} min="0" max="100" />
                  </div>
                  <div className="dash-field">
                    <label>Fat %</label>
                    <input type="number" value={formData.macronutrientRatio.fat} onChange={e => handleMacroChange('fat', e.target.value)} min="0" max="100" />
                  </div>
                </div>
                <div className={`dash-macro-total ${getMacroTotal() === 100 ? 'success' : 'error'}`}>
                  Total: {getMacroTotal()}% {getMacroTotal() === 100 ? '✓ Perfect' : '⚠ Must be 100%'}
                </div>
                <div className="dash-field">
                  <label>Meals per Day</label>
                  <input type="number" name="mealsPerDay" value={formData.mealsPerDay} onChange={handleInputChange} min="1" max="6" />
                </div>
                <div className="dash-field">
                  <label>Recommended Foods (comma separated)</label>
                  <input type="text" value={formData.recommendedFoods.join(', ')} onChange={e => handleArrayChange('recommendedFoods', e.target.value)} placeholder="e.g. Chicken, Rice, Broccoli" />
                </div>
                <div className="dash-field">
                  <label>Foods to Avoid (comma separated)</label>
                  <input type="text" value={formData.foodsToAvoid.join(', ')} onChange={e => handleArrayChange('foodsToAvoid', e.target.value)} placeholder="e.g. Sugar, Processed foods" />
                </div>
              </div>

              {/* Meal Structure */}
              <div className="dash-edit-section">
                <h4 className="dash-edit-section-title"><FiCoffee size={15} /> Meal Structure</h4>
                {Object.entries(formData.mealStructure).map(([meal, items]) => (
                  <div key={meal} className="dash-meal-edit">
                    <div className="dash-meal-edit-top">
                      <input type="text" value={meal} onChange={e => handleUpdateMealName(meal, e.target.value)} placeholder="Meal name" className="dash-meal-name" />
                      <button type="button" className="dash-meal-remove" onClick={() => handleRemoveMeal(meal)}>
                        <FiX size={14} />
                      </button>
                    </div>
                    <input type="text" value={items.join(', ')} onChange={e => handleMealStructureChange(meal, e.target.value)} placeholder="Food items (comma separated)" className="dash-meal-items" />
                  </div>
                ))}
                <button type="button" className="dash-add-btn" onClick={handleAddMeal}>
                  <FiPlus size={14} /> Add Meal
                </button>
              </div>

              {/* Grocery List */}
              <div className="dash-edit-section">
                <h4 className="dash-edit-section-title"><FiShoppingBag size={15} /> Weekly Grocery List</h4>
                {['protein', 'vegetables', 'carbs', 'fats', 'fruits', 'other'].map(cat => (
                  <div key={cat} className="dash-grocery-field">
                    <label>{cat.charAt(0).toUpperCase() + cat.slice(1)}</label>
                    <input type="text" value={formData.weeklyGroceryList[cat]?.join(', ') || ''} onChange={e => handleGroceryChange(cat, e.target.value)} placeholder={`${cat} items`} />
                  </div>
                ))}
              </div>

              {/* Supplements & Exercise */}
              <div className="dash-edit-section">
                <h4 className="dash-edit-section-title"><FiDroplet size={15} /> Supplements & Exercise</h4>
                <div className="dash-field">
                  <label>Supplements (comma separated)</label>
                  <input type="text" value={formData.supplementsSuggested.join(', ')} onChange={e => handleArrayChange('supplementsSuggested', e.target.value)} placeholder="e.g. Vitamin D, Omega-3" />
                </div>
                <div className="dash-field">
                  <label>Exercise Recommendation</label>
                  <textarea name="exerciseRecommendation" value={formData.exerciseRecommendation || ''} onChange={handleInputChange} rows="2" placeholder="e.g. 30 min cardio daily" />
                </div>
              </div>
            </form>
          ) : (
            /* ── View Mode ── */
            <div className="dash-view">
              <div className="dash-view-top">
                <div>
                  <h2>{selectedPlan.planName}</h2>
                  <p className="dash-view-date">Created {new Date(selectedPlan.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="dash-view-actions">
                  <button className="dash-btn dash-btn-edit" onClick={handleStartEdit}>
                    <FiEdit size={14} /> Update Plan
                  </button>
                  <button className="dash-btn dash-btn-delete" onClick={() => setDeleteConfirm(true)}>
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {/* Hero Image */}
              {selectedPlan.planImage && (
                <div className="dash-hero">
                  <img src={selectedPlan.planImage} alt={selectedPlan.planName} />
                  <div className="dash-hero-overlay" />
                </div>
              )}

              {/* Stats */}
              <div className="dash-stats">
                <div className="dash-stat">
                  <div className="dash-stat-icon"><FiCalendar size={18} /></div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-value">{selectedPlan.duration}</span>
                    <span className="dash-stat-label">Weeks</span>
                  </div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-icon"><FiDollarSign size={18} /></div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-value">${selectedPlan.price}</span>
                    <span className="dash-stat-label">Price</span>
                  </div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-icon"><FiTarget size={18} /></div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-value">{selectedPlan.dailyCalorieRange.min}-{selectedPlan.dailyCalorieRange.max}</span>
                    <span className="dash-stat-label">Calories</span>
                  </div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-icon"><FiActivity size={18} /></div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-value">{selectedPlan.mealsPerDay}</span>
                    <span className="dash-stat-label">Meals/Day</span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="dash-info-grid">
                <div className="dash-info-card">
                  <h5><FiFolder size={14} /> Category</h5>
                  <p>{selectedPlan.planCategory}</p>
                </div>
                <div className="dash-info-card">
                  <h5><FiUser size={14} /> Target User</h5>
                  <p>{selectedPlan.targetUserProfile}</p>
                </div>
                <div className="dash-info-card full">
                  <h5><FiInfo size={14} /> Description</h5>
                  <p>{selectedPlan.description}</p>
                </div>
                <div className="dash-info-card">
                  <h5><FiClock size={14} /> Consultations</h5>
                  <p>{selectedPlan.consultationIncluded} included</p>
                </div>
                <div className="dash-info-card">
                  <h5><FiCalendar size={14} /> Follow-up</h5>
                  <p>{selectedPlan.followUpFrequency || 'None'}</p>
                </div>
                <div className="dash-info-card">
                  <h5><FiTrendingUp size={14} /> Macronutrients</h5>
                  <div className="dash-macro-bars">
                    <div className="dash-macro-row">
                      <span>Carbs {selectedPlan.macronutrientRatio.carbs}%</span>
                      <div className="dash-macro-track">
                        <div className="dash-macro-fill carbs" style={{ width: `${selectedPlan.macronutrientRatio.carbs}%` }} />
                      </div>
                    </div>
                    <div className="dash-macro-row">
                      <span>Protein {selectedPlan.macronutrientRatio.protein}%</span>
                      <div className="dash-macro-track">
                        <div className="dash-macro-fill protein" style={{ width: `${selectedPlan.macronutrientRatio.protein}%` }} />
                      </div>
                    </div>
                    <div className="dash-macro-row">
                      <span>Fat {selectedPlan.macronutrientRatio.fat}%</span>
                      <div className="dash-macro-track">
                        <div className="dash-macro-fill fat" style={{ width: `${selectedPlan.macronutrientRatio.fat}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dash-info-card full">
                  <h5><FiHeart size={14} /> Recommended Foods</h5>
                  <div className="dash-tags">
                    {selectedPlan.recommendedFoods.map((food, i) => (
                      <span key={i} className="dash-tag dash-tag-green">{food}</span>
                    ))}
                    {selectedPlan.recommendedFoods.length === 0 && <p style={{ color: '#9ca3af', fontSize: 13 }}>None specified</p>}
                  </div>
                </div>
                <div className="dash-info-card full">
                  <h5><FiX size={14} /> Foods to Avoid</h5>
                  <div className="dash-tags">
                    {selectedPlan.foodsToAvoid.map((food, i) => (
                      <span key={i} className="dash-tag dash-tag-red">{food}</span>
                    ))}
                    {selectedPlan.foodsToAvoid.length === 0 && <p style={{ color: '#9ca3af', fontSize: 13 }}>None specified</p>}
                  </div>
                </div>
                <div className="dash-info-card full">
                  <h5><FiCoffee size={14} /> Meal Structure</h5>
                  {Object.entries(selectedPlan.mealStructure).length > 0 ? (
                    <div className="dash-meals">
                      {Object.entries(selectedPlan.mealStructure).map(([meal, items]) => (
                        <div key={meal} className="dash-meal-item">
                          <h6>{meal}</h6>
                          <p>{items.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>No meals defined</p>
                  )}
                </div>
                {selectedPlan.weeklyGroceryList && Object.values(selectedPlan.weeklyGroceryList).some(arr => arr?.length) && (
                  <div className="dash-info-card full">
                    <h5><FiShoppingBag size={14} /> Weekly Grocery List</h5>
                    <div className="dash-grocery">
                      {Object.entries(selectedPlan.weeklyGroceryList).map(([cat, items]) =>
                        items?.length > 0 ? (
                          <div key={cat} className="dash-grocery-cat">
                            <h6>{cat}</h6>
                            <p>{items.join(', ')}</p>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
                {selectedPlan.supplementsSuggested?.length > 0 && (
                  <div className="dash-info-card full">
                    <h5><FiDroplet size={14} /> Supplements</h5>
                    <div className="dash-tags">
                      {selectedPlan.supplementsSuggested.map((s, i) => (
                        <span key={i} className="dash-tag dash-tag-blue">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPlan.exerciseRecommendation && (
                  <div className="dash-info-card full">
                    <h5><FiActivity size={14} /> Exercise</h5>
                    <p>{selectedPlan.exerciseRecommendation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDashboard;
