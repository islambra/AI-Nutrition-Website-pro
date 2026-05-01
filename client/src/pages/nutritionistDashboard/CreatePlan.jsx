import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createPlan,
  validateMacronutrients,
  getPlanCategories,
  getFollowUpOptions,
} from "../../api/planApi";
import "./CreatePlan.css";

const CreatePlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    planName: "",
    planCategory: "",
    targetUserProfile: "",
    description: "",
    duration: 4,
    price: 0,
    consultationIncluded: 0,
    followUpFrequency: "Weekly",
    dailyCalorieRange: { min: 1500, max: 1700 },
    macronutrientRatio: { carbs: 40, protein: 35, fat: 25 },
    recommendedFoods: [],
    mealsPerDay: 3,
    mealStructure: {},
    weeklyGroceryList: {
      protein: [],
      vegetables: [],
      carbs: [],
      fats: [],
      fruits: [],
      other: [],
    },
    foodsToAvoid: [],
    supplementsSuggested: [],
    exerciseRecommendation: "",
    planImage: null,
  });

  // Temporary input states for arrays
  const [recommendedFoodsInput, setRecommendedFoodsInput] = useState("");
  const [foodsToAvoidInput, setFoodsToAvoidInput] = useState("");
  const [supplementsInput, setSupplementsInput] = useState("");
  
  // Meal structure state - with default meals
  const [mealSlots, setMealSlots] = useState([
    { id: 1, name: "Breakfast", time: "08:00", foods: [] },
    { id: 2, name: "Morning Snack", time: "10:30", foods: [] },
    { id: 3, name: "Lunch", time: "13:00", foods: [] },
    { id: 4, name: "Afternoon Snack", time: "16:00", foods: [] },
    { id: 5, name: "Dinner", time: "19:00", foods: [] },
  ]);
  const [currentMealFood, setCurrentMealFood] = useState({});
  const [nextMealId, setNextMealId] = useState(6);
  const [expandedMeal, setExpandedMeal] = useState(null);
  
  // Grocery list state
  const [currentGroceryItem, setCurrentGroceryItem] = useState({
    protein: "",
    vegetables: "",
    carbs: "",
    fats: "",
    fruits: "",
    other: "",
  });

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle nested inputs
  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Handle macronutrients
  const handleMacroChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      macronutrientRatio: {
        ...prev.macronutrientRatio,
        [type]: numValue,
      },
    }));
  };

  // Handle calorie range
  const handleCalorieChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      dailyCalorieRange: {
        ...prev.dailyCalorieRange,
        [type]: numValue,
      },
    }));
  };

  // Update meal structure to formData
  const updateMealStructureInFormData = (updatedSlots) => {
    const mealStructureObj = {};
    updatedSlots.forEach((slot) => {
      mealStructureObj[`${slot.name} (${slot.time})`] = slot.foods;
    });
    setFormData((prev) => ({ ...prev, mealStructure: mealStructureObj }));
  };

  // Meal CRUD operations
  const addNewMealSlot = () => {
    const newId = nextMealId;
    const newSlot = {
      id: newId,
      name: `Meal ${mealSlots.length + 1}`,
      time: "12:00",
      foods: [],
    };
    const updatedSlots = [...mealSlots, newSlot];
    setMealSlots(updatedSlots);
    setNextMealId(newId + 1);
    updateMealStructureInFormData(updatedSlots);
    setExpandedMeal(newId);
  };

  const updateMealName = (index, newName) => {
    const updatedSlots = [...mealSlots];
    updatedSlots[index].name = newName;
    setMealSlots(updatedSlots);
    updateMealStructureInFormData(updatedSlots);
  };

  const updateMealTime = (index, newTime) => {
    const updatedSlots = [...mealSlots];
    updatedSlots[index].time = newTime;
    setMealSlots(updatedSlots);
    updateMealStructureInFormData(updatedSlots);
  };

  const removeMealSlot = (index) => {
    if (mealSlots.length <= 1) {
      setError("You need at least one meal");
      return;
    }
    const updatedSlots = mealSlots.filter((_, i) => i !== index);
    setMealSlots(updatedSlots);
    updateMealStructureInFormData(updatedSlots);
  };

  const addMealFood = (mealIndex, foodItem) => {
    if (foodItem && foodItem.trim()) {
      const updatedSlots = [...mealSlots];
      updatedSlots[mealIndex].foods.push(foodItem.trim());
      setMealSlots(updatedSlots);
      setCurrentMealFood((prev) => ({ ...prev, [mealIndex]: "" }));
      updateMealStructureInFormData(updatedSlots);
    }
  };

  const removeMealFood = (mealIndex, foodIndex) => {
    const updatedSlots = [...mealSlots];
    updatedSlots[mealIndex].foods.splice(foodIndex, 1);
    setMealSlots(updatedSlots);
    updateMealStructureInFormData(updatedSlots);
  };

  // Recommended foods handlers
  const addRecommendedFood = () => {
    if (recommendedFoodsInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        recommendedFoods: [...prev.recommendedFoods, recommendedFoodsInput.trim()],
      }));
      setRecommendedFoodsInput("");
    }
  };

  const removeRecommendedFood = (index) => {
    setFormData((prev) => ({
      ...prev,
      recommendedFoods: prev.recommendedFoods.filter((_, i) => i !== index),
    }));
  };

  // Foods to avoid handlers
  const addFoodToAvoid = () => {
    if (foodsToAvoidInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        foodsToAvoid: [...prev.foodsToAvoid, foodsToAvoidInput.trim()],
      }));
      setFoodsToAvoidInput("");
    }
  };

  const removeFoodToAvoid = (index) => {
    setFormData((prev) => ({
      ...prev,
      foodsToAvoid: prev.foodsToAvoid.filter((_, i) => i !== index),
    }));
  };

  // Supplements handlers
  const addSupplement = () => {
    if (supplementsInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        supplementsSuggested: [...prev.supplementsSuggested, supplementsInput.trim()],
      }));
      setSupplementsInput("");
    }
  };

  const removeSupplement = (index) => {
    setFormData((prev) => ({
      ...prev,
      supplementsSuggested: prev.supplementsSuggested.filter((_, i) => i !== index),
    }));
  };

  // Grocery list handlers
  const addGroceryItem = (category, value) => {
    if (value && value.trim()) {
      setFormData((prev) => ({
        ...prev,
        weeklyGroceryList: {
          ...prev.weeklyGroceryList,
          [category]: [...prev.weeklyGroceryList[category], value.trim()],
        },
      }));
      setCurrentGroceryItem((prev) => ({ ...prev, [category]: "" }));
    }
  };

  const removeGroceryItem = (category, index) => {
    setFormData((prev) => ({
      ...prev,
      weeklyGroceryList: {
        ...prev.weeklyGroceryList,
        [category]: prev.weeklyGroceryList[category].filter((_, i) => i !== index),
      },
    }));
  };

  // Image handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, planImage: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Validate before submit
  const validateForm = () => {
    if (!user) {
      setError("You must be logged in to create a plan");
      return false;
    }
    if (!formData.planName.trim()) {
      setError("Plan name is required");
      return false;
    }
    if (!formData.planCategory) {
      setError("Plan category is required");
      return false;
    }
    if (!formData.targetUserProfile.trim()) {
      setError("Target user profile is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    
    const macroValidation = validateMacronutrients(
      formData.macronutrientRatio.carbs,
      formData.macronutrientRatio.protein,
      formData.macronutrientRatio.fat
    );
    if (!macroValidation.valid) {
      setError(macroValidation.message);
      return false;
    }
    
    if (mealSlots.length === 0) {
      setError("Add at least one meal to the meal structure");
      return false;
    }
    
    return true;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Prepare plan data - creator info will be added by the backend
      const planData = {
        ...formData,
        // The backend will extract user info from the authenticated request
        // and save it as creatorInfo automatically
      };
      
      const response = await createPlan(planData);
      console.log('Plan created with creator info:', response.data?.creatorInfo);
      
      setSuccess("Plan created successfully! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard/plans");
      }, 2000);
    } catch (err) {
      console.error('Error creating plan:', err);
      setError(err.response?.data?.message || "Error creating plan");
    } finally {
      setLoading(false);
    }
  };

  // Calculate macro total
  const macroTotal = formData.macronutrientRatio.carbs + 
                     formData.macronutrientRatio.protein + 
                     formData.macronutrientRatio.fat;

  // Toggle meal expansion
  const toggleMealExpansion = (mealId) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId);
  };

  return (
    <div className="create-plan-container">
      <div className="create-plan-header">
        <h1>
          <i className="fas fa-plus-circle"></i> Create New Nutrition Plan
        </h1>
        <p>
          <i className="fas fa-heartbeat"></i> Design a personalized meal plan for your clients
        </p>
        {user && (
          <div className="creator-info-banner">
            <span>Creating as: <strong>{user.fullName}</strong> ({user.role})</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="create-plan-form">
        {/* Basic Information Section */}
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-info-circle section-icon"></i>
            <h2>Basic Information</h2>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label><i className="fas fa-utensils"></i> Plan Name *</label>
              <input
                type="text"
                name="planName"
                value={formData.planName}
                onChange={handleChange}
                placeholder="e.g., Diabetes Weight Loss"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-tag"></i> Plan Category *</label>
              <select
                name="planCategory"
                value={formData.planCategory}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {getPlanCategories().map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group full-width">
              <label><i className="fas fa-users"></i> Target User Profile *</label>
              <input
                type="text"
                name="targetUserProfile"
                value={formData.targetUserProfile}
                onChange={handleChange}
                placeholder="e.g., Type 2 diabetes, prediabetes, insulin resistance"
              />
            </div>
            <div className="form-group full-width">
              <label><i className="fas fa-align-left"></i> Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the plan benefits and what users can expect..."
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Plan Image Section */}
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-image section-icon"></i>
            <h2>Plan Image</h2>
          </div>
          <div className="image-upload-area">
            {previewImage ? (
              <div className="image-preview">
                <img src={previewImage} alt="Plan preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setPreviewImage(null);
                    setFormData((prev) => ({ ...prev, planImage: null }));
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <label htmlFor="planImage" className="upload-label">
                  <i className="fas fa-cloud-upload-alt upload-icon"></i>
                  <span>Click to upload plan image</span>
                  <span className="upload-hint">PNG, JPG, WEBP (Max 5MB)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="planImage"
                  style={{ display: "none" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Duration & Price Section */}
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-clock section-icon"></i>
            <h2>Duration & Pricing</h2>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label><i className="fas fa-calendar-week"></i> Duration (weeks) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                max="52"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-dollar-sign"></i> Price (USD) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-chalkboard-user"></i> Consultations Included</label>
              <input
                type="number"
                name="consultationIncluded"
                value={formData.consultationIncluded}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-sync-alt"></i> Follow-up Frequency *</label>
              <select
                name="followUpFrequency"
                value={formData.followUpFrequency}
                onChange={handleChange}
              >
                {getFollowUpOptions().map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Nutrition Parameters Section */}
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-apple-alt section-icon"></i>
            <h2>Nutrition Parameters</h2>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label><i className="fas fa-fire"></i> Daily Calories (min)</label>
              <input
                type="number"
                value={formData.dailyCalorieRange.min}
                onChange={(e) => handleCalorieChange("min", e.target.value)}
                min="500"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-fire"></i> Daily Calories (max)</label>
              <input
                type="number"
                value={formData.dailyCalorieRange.max}
                onChange={(e) => handleCalorieChange("max", e.target.value)}
                min="500"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-bread-slice"></i> Carbs (%)</label>
              <input
                type="number"
                value={formData.macronutrientRatio.carbs}
                onChange={(e) => handleMacroChange("carbs", e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-drumstick-bite"></i> Protein (%)</label>
              <input
                type="number"
                value={formData.macronutrientRatio.protein}
                onChange={(e) => handleMacroChange("protein", e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-cheese"></i> Fat (%)</label>
              <input
                type="number"
                value={formData.macronutrientRatio.fat}
                onChange={(e) => handleMacroChange("fat", e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-utensil-spoon"></i> Meals Per Day</label>
              <input
                type="number"
                name="mealsPerDay"
                value={formData.mealsPerDay}
                onChange={handleChange}
                min="1"
                max="6"
              />
            </div>
          </div>
          <div className={`macro-info ${macroTotal !== 100 ? "macro-error" : "macro-success"}`}>
            <i className={macroTotal !== 100 ? "fas fa-exclamation-triangle" : "fas fa-check-circle"}></i>
            <span>Total: {macroTotal}%</span>
            {macroTotal !== 100 && (
              <span className="macro-warning"> Must be 100%</span>
            )}
            {macroTotal === 100 && (
              <span className="macro-check"> Perfect balance</span>
            )}
          </div>
        </div>

        {/* Recommended Foods Section */}
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-check-circle section-icon"></i>
            <h2>Recommended Foods</h2>
          </div>
          <div className="array-input-group">
            <div className="array-input-row">
              <input
                type="text"
                value={recommendedFoodsInput}
                onChange={(e) => setRecommendedFoodsInput(e.target.value)}
                placeholder="e.g., Chicken breast, Salmon, Quinoa"
                onKeyPress={(e) => e.key === "Enter" && addRecommendedFood()}
              />
              <button type="button" onClick={addRecommendedFood} className="add-btn">
                <i className="fas fa-plus"></i> Add
              </button>
            </div>
            <div className="tags-container">
              {formData.recommendedFoods.map((food, index) => (
                <span key={index} className="tag">
                  <i className="fas fa-apple-alt"></i> {food}
                  <button type="button" onClick={() => removeRecommendedFood(index)}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Structure Section */}
        <div className="form-section meal-structure-section">
          <div className="section-title">
            <i className="fas fa-utensils section-icon"></i>
            <h2>Meal Structure (Daily Template)</h2>
            <button type="button" className="add-meal-btn" onClick={addNewMealSlot}>
              <i className="fas fa-plus"></i> Add Meal
            </button>
          </div>

          <div className="meal-structure-container">
            {mealSlots.map((slot, idx) => (
              <div key={slot.id} className={`meal-card ${expandedMeal === slot.id ? 'expanded' : ''}`}>
                <div className="meal-card-header" onClick={() => toggleMealExpansion(slot.id)}>
                  <div className="meal-card-header-left">
                    <div className="meal-number">{idx + 1}</div>
                    <div className="meal-info">
                      <input
                        type="text"
                        value={slot.name}
                        onChange={(e) => updateMealName(idx, e.target.value)}
                        className="meal-name-input"
                        placeholder="Meal name"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="meal-time-badge">
                        <i className="far fa-clock"></i>
                        <input
                          type="time"
                          value={slot.time}
                          onChange={(e) => updateMealTime(idx, e.target.value)}
                          className="meal-time-input"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="meal-card-header-right">
                    <button
                      type="button"
                      className="remove-meal-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMealSlot(idx);
                      }}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                    <i className={`fas fa-chevron-${expandedMeal === slot.id ? 'up' : 'down'} expand-icon`}></i>
                  </div>
                </div>

                {expandedMeal === slot.id && (
                  <div className="meal-card-content">
                    <div className="meal-foods-list">
                      {slot.foods.length === 0 ? (
                        <div className="empty-foods">
                          <i className="fas fa-info-circle"></i>
                          <span>No foods added yet. Add some below.</span>
                        </div>
                      ) : (
                        <div className="foods-grid">
                          {slot.foods.map((food, foodIdx) => (
                            <div key={foodIdx} className="food-item">
                              <i className="fas fa-apple-alt food-icon"></i>
                              <span className="food-name">{food}</span>
                              <button
                                type="button"
                                className="remove-food-btn"
                                onClick={() => removeMealFood(idx, foodIdx)}
                              >
                                <i className="fas fa-times-circle"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="add-food-section">
                      <div className="add-food-wrapper">
                        <input
                          type="text"
                          value={currentMealFood[idx] || ""}
                          onChange={(e) =>
                            setCurrentMealFood((prev) => ({ ...prev, [idx]: e.target.value }))
                          }
                          placeholder={`Add food item for ${slot.name}...`}
                          className="add-food-input"
                          onKeyPress={(e) =>
                            e.key === "Enter" && addMealFood(idx, currentMealFood[idx] || "")
                          }
                        />
                        <button
                          type="button"
                          className="add-food-btn"
                          onClick={() => addMealFood(idx, currentMealFood[idx] || "")}
                        >
                          <i className="fas fa-plus"></i> Add Food
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Grocery List Section */}
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-shopping-cart section-icon"></i>
            <h2>Weekly Grocery List</h2>
          </div>
          <div className="grocery-grid">
            {["protein", "vegetables", "carbs", "fats", "fruits", "other"].map((category) => (
              <div key={category} className="grocery-category">
                <h3>
                  <i className={`fas fa-${category === "protein" ? "drumstick-bite" : 
                                 category === "vegetables" ? "leaf" : 
                                 category === "carbs" ? "bread-slice" : 
                                 category === "fats" ? "cheese" : 
                                 category === "fruits" ? "apple-alt" : "box"}`}>
                  </i>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <div className="grocery-input">
                  <input
                    type="text"
                    value={currentGroceryItem[category]}
                    onChange={(e) =>
                      setCurrentGroceryItem((prev) => ({ ...prev, [category]: e.target.value }))
                    }
                    placeholder={`Add ${category}...`}
                    onKeyPress={(e) =>
                      e.key === "Enter" && addGroceryItem(category, currentGroceryItem[category])
                    }
                  />
                  <button
                    type="button"
                    onClick={() => addGroceryItem(category, currentGroceryItem[category])}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <div className="grocery-items">
                  {formData.weeklyGroceryList[category].map((item, idx) => (
                    <span key={idx} className="grocery-tag">
                      <i className="fas fa-shopping-basket"></i> {item}
                      <button type="button" onClick={() => removeGroceryItem(category, idx)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Foods to Avoid Section */}
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-ban section-icon"></i>
            <h2>Foods to Avoid</h2>
          </div>
          <div className="array-input-group">
            <div className="array-input-row">
              <input
                type="text"
                value={foodsToAvoidInput}
                onChange={(e) => setFoodsToAvoidInput(e.target.value)}
                placeholder="e.g., White bread, Soda, Fried foods"
                onKeyPress={(e) => e.key === "Enter" && addFoodToAvoid()}
              />
              <button type="button" onClick={addFoodToAvoid} className="add-btn">
                <i className="fas fa-plus"></i> Add
              </button>
            </div>
            <div className="tags-container">
              {formData.foodsToAvoid.map((food, index) => (
                <span key={index} className="tag danger-tag">
                  <i className="fas fa-times-circle"></i> {food}
                  <button type="button" onClick={() => removeFoodToAvoid(index)}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Supplements & Exercise Section */}
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-pills section-icon"></i>
            <h2>Supplements & Exercise</h2>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label><i className="fas fa-capsules"></i> Suggested Supplements</label>
              <div className="array-input-group">
                <div className="array-input-row">
                  <input
                    type="text"
                    value={supplementsInput}
                    onChange={(e) => setSupplementsInput(e.target.value)}
                    placeholder="e.g., Vitamin D, Magnesium, Omega-3"
                    onKeyPress={(e) => e.key === "Enter" && addSupplement()}
                  />
                  <button type="button" onClick={addSupplement} className="add-btn">
                    <i className="fas fa-plus"></i> Add
                  </button>
                </div>
                <div className="tags-container">
                  {formData.supplementsSuggested.map((supp, index) => (
                    <span key={index} className="tag">
                      <i className="fas fa-capsules"></i> {supp}
                      <button type="button" onClick={() => removeSupplement(index)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group full-width">
              <label><i className="fas fa-dumbbell"></i> Exercise Recommendation</label>
              <textarea
                name="exerciseRecommendation"
                value={formData.exerciseRecommendation}
                onChange={handleChange}
                placeholder="e.g., Walk 30 minutes daily, strength training 3x per week"
                rows="2"
              />
            </div>
          </div>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        {success && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> {success}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate("/nutritionist/MyPlans")}>
            <i className="fas fa-times"></i> Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
            {loading ? " Creating..." : " Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlan;