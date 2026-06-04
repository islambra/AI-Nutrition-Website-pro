// src/pages/dashboard/PlanDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getMyPlans, updatePlan, deletePlan } from '../../api/planApi';
import { getPlanCategories, getFollowUpOptions, validateMacronutrients } from '../../api/planApi';
import {
  FiPlus, FiEdit, FiSave, FiX, FiTrash2, FiCalendar,
  FiDollarSign, FiFolder, FiImage, FiRefreshCw, FiUser,
  FiChevronRight, FiCheck, FiAlertCircle, FiInfo, FiClock,
  FiTarget, FiActivity, FiShoppingBag, FiDroplet, FiCoffee,
  FiHeart, FiTrendingUp, FiZap, FiHome, FiArrowLeft
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

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (err) {
        console.error('Error parsing user from localStorage', err);
        showNotification('Failed to get user information', 'error');
      }
    } else {
      showNotification('User not found. Please login again.', 'error');
    }
  }, []);

  // Fetch plans
  const fetchPlans = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await getMyPlans();
      
      if (response.success) {
        setPlans(response.data);
      } else {
        showNotification(response.message || 'Failed to load plans', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPlans();
    }
  }, [currentUser]);

  const showNotification = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Select a plan to view
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsEditing(false);
    setError(null);
  };

  // Start editing
  const handleStartEdit = () => {
    setFormData(JSON.parse(JSON.stringify(selectedPlan)));
    setImagePreview(selectedPlan.planImage || null);
    setImageFile(null);
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(null);
    setImagePreview(null);
    setImageFile(null);
  };

  // Form input handlers
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
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: arrayValue }));
  };

  const handleMealStructureChange = (meal, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      mealStructure: { ...prev.mealStructure, [meal]: items }
    }));
  };

  const handleAddMeal = () => {
    setFormData(prev => ({
      ...prev,
      mealStructure: { ...prev.mealStructure, ['New Meal']: [] }
    }));
  };

  const handleRemoveMeal = (mealToRemove) => {
    const newMealStructure = { ...formData.mealStructure };
    delete newMealStructure[mealToRemove];
    setFormData(prev => ({
      ...prev,
      mealStructure: newMealStructure
    }));
  };

  const handleUpdateMealName = (oldName, newName) => {
    if (oldName === newName || !newName.trim()) return;
    const newMealStructure = { ...formData.mealStructure };
    newMealStructure[newName] = newMealStructure[oldName];
    delete newMealStructure[oldName];
    setFormData(prev => ({
      ...prev,
      mealStructure: newMealStructure
    }));
  };

  const handleGroceryChange = (category, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      weeklyGroceryList: { ...prev.weeklyGroceryList, [category]: items }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Update plan
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validate macronutrients sum to 100
    const { carbs, protein, fat } = formData.macronutrientRatio;
    const validation = validateMacronutrients(carbs, protein, fat);
    if (!validation.valid) {
      showNotification(validation.message, 'error');
      return;
    }

    setUpdateLoading(true);
    try {
      const updatePayload = { ...formData };
      if (imageFile) updatePayload.planImage = imageFile;
      
      const response = await updatePlan(selectedPlan._id, updatePayload);
      
      if (response.success) {
        await fetchPlans();
        setSelectedPlan(response.data);
        setIsEditing(false);
        showNotification('Plan updated successfully!', 'success');
      } else {
        showNotification(response.message || 'Update failed', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'An error occurred', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete plan
  const handleDelete = async () => {
    setDeleteConfirm(null);
    try {
      const response = await deletePlan(selectedPlan._id);
      
      if (response.success) {
        await fetchPlans();
        setSelectedPlan(null);
        showNotification('Plan deleted successfully!', 'success');
      } else {
        showNotification(response.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'An error occurred', 'error');
    }
  };

  const getMacroTotal = () => {
    if (!formData) return 0;
    return formData.macronutrientRatio.carbs + formData.macronutrientRatio.protein + formData.macronutrientRatio.fat;
  };

  if (!currentUser) {
    return <div className="dashboard-error">Please login to view your plans</div>;
  }

  if (loading && plans.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your plans...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Notifications */}
      {error && (
        <div className="notification notification-error">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}><FiX /></button>
        </div>
      )}
      {success && (
        <div className="notification notification-success">
          <FiCheck />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}><FiX /></button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FiAlertCircle />
              <h3>Delete Plan</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedPlan?.planName}</strong>?</p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="modal-confirm" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel - Plans List */}
      <div className="plans-panel">
        <div className="user-info">
          <div className="user-avatar">
            {currentUser.photo ? (
              <img src={currentUser.photo} alt={currentUser.fullName} />
            ) : (
              <FiUser size={24} />
            )}
          </div>
          <div className="user-details">
            <h3>{currentUser.fullName}</h3>
            <p>{currentUser.role}</p>
            <p className="user-email">{currentUser.email}</p>
          </div>
        </div>
        
        <div className="plans-header">
          <h2>
            <FiFolder size={18} />
            My Plans ({plans.length})
          </h2>
          <button className="refresh-btn" onClick={fetchPlans} title="Refresh Plans">
            <FiRefreshCw />
          </button>
        </div>
        
        {plans.length === 0 ? (
          <div className="empty-plans">
            <div className="empty-icon"><FiFolder size={48} /></div>
            <p>You haven't created any plans yet.</p>
            <button 
              className="create-plan-btn" 
              onClick={() => window.location.href = '/dashboard/plans/new'}
            >
              <FiPlus /> Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="plans-list">
            {plans.map(plan => (
              <div
                key={plan._id}
                className={`plan-list-item ${selectedPlan?._id === plan._id ? 'active' : ''}`}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.planImage ? (
                  <img src={plan.planImage} alt={plan.planName} className="list-image" />
                ) : (
                  <div className="list-image-placeholder"><FiImage size={20} /></div>
                )}
                <div className="list-info">
                  <h4>{plan.planName}</h4>
                  <div className="list-meta">
                    <span><FiCalendar size={12} /> {plan.duration} weeks</span>
                    <span><FiDollarSign size={12} /> ${plan.price}</span>
                  </div>
                  <p className="list-category">{plan.planCategory}</p>
                </div>
                <FiChevronRight size={16} className="list-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Plan Details */}
      <div className="detail-panel">
        {!selectedPlan ? (
          <div className="no-selection">
            <div className="no-selection-icon"><FiFolder size={64} /></div>
            <h3>No Plan Selected</h3>
            <p>Select a plan from the left to view its details</p>
          </div>
        ) : isEditing ? (
          // EDIT MODE - Full Edit Form
          <form onSubmit={handleUpdate} className="edit-form">
            <div className="form-header">
              <div>
                <button type="button" onClick={handleCancelEdit} className="back-btn">
                  <FiArrowLeft /> Back to Details
                </button>
                <h2>Editing: {selectedPlan.planName}</h2>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  <FiX /> Cancel
                </button>
                <button type="submit" disabled={updateLoading} className="save-btn">
                  <FiSave /> {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">
                <FiInfo /> Basic Information
              </h3>
              <div className="form-group">
                <label>Plan Name *</label>
                <input type="text" name="planName" value={formData.planName} onChange={handleInputChange} required />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="planCategory" value={formData.planCategory} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    {getPlanCategories().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Target User Profile *</label>
                  <input type="text" name="targetUserProfile" value={formData.targetUserProfile} onChange={handleInputChange} required />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required />
              </div>

              <div className="form-group">
                <label>Plan Image</label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview-wrapper">
                      <img src={imagePreview} alt="Preview" className="edit-preview" />
                      <button type="button" onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setFormData(prev => ({ ...prev, planImage: null }));
                      }} className="remove-image-btn"><FiX /></button>
                    </div>
                  ) : (
                    <label className="image-upload-label">
                      <FiImage /> Click to upload image
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (weeks) *</label>
                  <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} required min="1" />
                </div>
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Consultations Included</label>
                  <input type="number" name="consultationIncluded" value={formData.consultationIncluded} onChange={handleInputChange} min="0" />
                </div>
                <div className="form-group">
                  <label>Follow-up Frequency</label>
                  <select name="followUpFrequency" value={formData.followUpFrequency} onChange={handleInputChange}>
                    {getFollowUpOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Nutrition Parameters */}
            <div className="form-section">
              <h3 className="section-title">
                <FiTarget /> Nutrition Parameters
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Calories</label>
                  <input type="number" value={formData.dailyCalorieRange.min} onChange={(e) => handleCalorieChange('min', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Maximum Calories</label>
                  <input type="number" value={formData.dailyCalorieRange.max} onChange={(e) => handleCalorieChange('max', e.target.value)} />
                </div>
              </div>

              <div className="macro-inputs">
                <div className="form-group">
                  <label>Carbs %</label>
                  <input type="number" value={formData.macronutrientRatio.carbs} onChange={(e) => handleMacroChange('carbs', e.target.value)} min="0" max="100" />
                </div>
                <div className="form-group">
                  <label>Protein %</label>
                  <input type="number" value={formData.macronutrientRatio.protein} onChange={(e) => handleMacroChange('protein', e.target.value)} min="0" max="100" />
                </div>
                <div className="form-group">
                  <label>Fat %</label>
                  <input type="number" value={formData.macronutrientRatio.fat} onChange={(e) => handleMacroChange('fat', e.target.value)} min="0" max="100" />
                </div>
              </div>
              <div className={`macro-total ${getMacroTotal() === 100 ? 'success' : 'error'}`}>
                Total: {getMacroTotal()}% {getMacroTotal() === 100 ? '✓ Perfect' : '⚠ Must be 100%'}
              </div>
              
              <div className="form-group">
                <label>Meals per Day</label>
                <input type="number" name="mealsPerDay" value={formData.mealsPerDay} onChange={handleInputChange} min="1" max="6" />
              </div>
              
              <div className="form-group">
                <label>Recommended Foods (comma separated)</label>
                <input type="text" value={formData.recommendedFoods.join(', ')} onChange={(e) => handleArrayChange('recommendedFoods', e.target.value)} placeholder="e.g., Chicken, Rice, Broccoli, Oats" />
              </div>
              
              <div className="form-group">
                <label>Foods to Avoid (comma separated)</label>
                <input type="text" value={formData.foodsToAvoid.join(', ')} onChange={(e) => handleArrayChange('foodsToAvoid', e.target.value)} placeholder="e.g., Sugar, Processed foods, Fried items" />
              </div>
            </div>

            {/* Meal Structure */}
            <div className="form-section">
              <h3 className="section-title">
                <FiCoffee /> Meal Structure
              </h3>
              {Object.entries(formData.mealStructure).map(([meal, items]) => (
                <div key={meal} className="meal-field-group">
                  <div className="meal-header">
                    <input 
                      type="text" 
                      value={meal} 
                      onChange={(e) => handleUpdateMealName(meal, e.target.value)} 
                      placeholder="Meal name"
                      className="meal-name-input"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMeal(meal)} 
                      className="remove-meal-btn"
                      title="Remove meal"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={items.join(', ')} 
                    onChange={(e) => handleMealStructureChange(meal, e.target.value)} 
                    placeholder="Food items (comma separated)"
                    className="meal-items-input"
                  />
                </div>
              ))}
              <button type="button" onClick={handleAddMeal} className="add-btn">
                <FiPlus /> Add Meal
              </button>
            </div>

            {/* Grocery List */}
            <div className="form-section">
              <h3 className="section-title">
                <FiShoppingBag /> Weekly Grocery List
              </h3>
              {['protein', 'vegetables', 'carbs', 'fats', 'fruits', 'other'].map(cat => (
                <div key={cat} className="grocery-field">
                  <label className="grocery-label">{cat.charAt(0).toUpperCase() + cat.slice(1)}</label>
                  <input 
                    type="text" 
                    value={formData.weeklyGroceryList[cat]?.join(', ') || ''} 
                    onChange={(e) => handleGroceryChange(cat, e.target.value)} 
                    placeholder={`${cat} items (comma separated)`}
                  />
                </div>
              ))}
            </div>

            {/* Supplements & Exercise */}
            <div className="form-section">
              <h3 className="section-title">
                <FiDroplet /> Supplements & Exercise
              </h3>
              <div className="form-group">
                <label>Supplements Suggested (comma separated)</label>
                <input type="text" value={formData.supplementsSuggested.join(', ')} onChange={(e) => handleArrayChange('supplementsSuggested', e.target.value)} placeholder="e.g., Vitamin D, Omega-3, Protein powder" />
              </div>
              
              <div className="form-group">
                <label>Exercise Recommendation</label>
                <textarea name="exerciseRecommendation" value={formData.exerciseRecommendation || ''} onChange={handleInputChange} rows="2" placeholder="e.g., 30 min cardio daily, Strength training 3x per week" />
              </div>
            </div>
          </form>
        ) : (
          // VIEW MODE - Plan Details with Update/Delete Buttons
          <div className="view-mode">
            <div className="view-header">
              <div>
                <h2>{selectedPlan.planName}</h2>
                <p className="view-subtitle">Created on {new Date(selectedPlan.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="view-actions">
                <button onClick={handleStartEdit} className="edit-btn">
                  <FiEdit /> Update Plan
                </button>
                <button onClick={() => setDeleteConfirm(true)} className="delete-btn">
                  <FiTrash2 /> Delete Plan
                </button>
              </div>
            </div>
            
            {selectedPlan.planImage && (
              <div className="view-image-wrapper">
                <img src={selectedPlan.planImage} alt={selectedPlan.planName} className="view-image" />
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="view-stats">
              <div className="stat-card">
                <FiCalendar />
                <div>
                  <span className="stat-value">{selectedPlan.duration}</span>
                  <span className="stat-label">Weeks</span>
                </div>
              </div>
              <div className="stat-card">
                <FiDollarSign />
                <div>
                  <span className="stat-value">${selectedPlan.price}</span>
                  <span className="stat-label">Price</span>
                </div>
              </div>
              <div className="stat-card">
                <FiTarget />
                <div>
                  <span className="stat-value">{selectedPlan.dailyCalorieRange.min}-{selectedPlan.dailyCalorieRange.max}</span>
                  <span className="stat-label">Calories</span>
                </div>
              </div>
              <div className="stat-card">
                <FiActivity />
                <div>
                  <span className="stat-value">{selectedPlan.mealsPerDay}</span>
                  <span className="stat-label">Meals/Day</span>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="view-grid">
              <div className="view-section">
                <strong><FiFolder /> Category</strong>
                <p>{selectedPlan.planCategory}</p>
              </div>
              <div className="view-section">
                <strong><FiUser /> Target User</strong>
                <p>{selectedPlan.targetUserProfile}</p>
              </div>
              <div className="view-section full-width">
                <strong><FiInfo /> Description</strong>
                <p>{selectedPlan.description}</p>
              </div>
              <div className="view-section">
                <strong><FiClock /> Consultations</strong>
                <p>{selectedPlan.consultationIncluded} included</p>
              </div>
              <div className="view-section">
                <strong><FiCalendar /> Follow-up</strong>
                <p>{selectedPlan.followUpFrequency}</p>
              </div>
              <div className="view-section">
                <strong><FiTrendingUp /> Macronutrients</strong>
                <div className="macro-bars">
                  <div className="macro-bar">
                    <span>Carbs {selectedPlan.macronutrientRatio.carbs}%</span>
                    <div className="bar-track">
                      <div className="bar-fill carbs" style={{ width: `${selectedPlan.macronutrientRatio.carbs}%` }}></div>
                    </div>
                  </div>
                  <div className="macro-bar">
                    <span>Protein {selectedPlan.macronutrientRatio.protein}%</span>
                    <div className="bar-track">
                      <div className="bar-fill protein" style={{ width: `${selectedPlan.macronutrientRatio.protein}%` }}></div>
                    </div>
                  </div>
                  <div className="macro-bar">
                    <span>Fat {selectedPlan.macronutrientRatio.fat}%</span>
                    <div className="bar-track">
                      <div className="bar-fill fat" style={{ width: `${selectedPlan.macronutrientRatio.fat}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="view-section full-width">
                <strong><FiHeart /> Recommended Foods</strong>
                <div className="tags-container">
                  {selectedPlan.recommendedFoods.map((food, idx) => (
                    <span key={idx} className="tag tag-green">{food}</span>
                  ))}
                </div>
              </div>
              <div className="view-section full-width">
                <strong><FiX /> Foods to Avoid</strong>
                <div className="tags-container">
                  {selectedPlan.foodsToAvoid.map((food, idx) => (
                    <span key={idx} className="tag tag-red">{food}</span>
                  ))}
                </div>
              </div>
              <div className="view-section full-width">
                <strong><FiCoffee /> Meal Structure</strong>
                {Object.entries(selectedPlan.mealStructure).length > 0 ? (
                  Object.entries(selectedPlan.mealStructure).map(([meal, items]) => (
                    <div key={meal} className="meal-item">
                      <strong>{meal}:</strong> {items.join(', ')}
                    </div>
                  ))
                ) : (
                  <p>No meals defined</p>
                )}
              </div>
              {selectedPlan.weeklyGroceryList && Object.values(selectedPlan.weeklyGroceryList).some(arr => arr && arr.length) && (
                <div className="view-section full-width">
                  <strong><FiShoppingBag /> Weekly Grocery List</strong>
                  {Object.entries(selectedPlan.weeklyGroceryList).map(([cat, items]) => 
                    items && items.length > 0 && (
                      <div key={cat} className="grocery-item">
                        <strong>{cat}:</strong> {items.join(', ')}
                      </div>
                    )
                  )}
                </div>
              )}
              {selectedPlan.supplementsSuggested && selectedPlan.supplementsSuggested.length > 0 && (
                <div className="view-section full-width">
                  <strong><FiDroplet /> Suggested Supplements</strong>
                  <div className="tags-container">
                    {selectedPlan.supplementsSuggested.map((supp, idx) => (
                      <span key={idx} className="tag tag-blue">{supp}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedPlan.exerciseRecommendation && (
                <div className="view-section full-width">
                  <strong><FiActivity /> Exercise Recommendation</strong>
                  <p>{selectedPlan.exerciseRecommendation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanDashboard;