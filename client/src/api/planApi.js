// services/planService.js
import axiosInstance from './axiosInstance';

// ==================== PLAN CRUD OPERATIONS ====================

export const createPlan = async (planData) => {
  const formData = new FormData();
  
  // Basic Information
  formData.append('planName', planData.planName);
  formData.append('planCategory', planData.planCategory);
  formData.append('targetUserProfile', planData.targetUserProfile);
  formData.append('description', planData.description);
  
  // Duration & Price
  formData.append('duration', planData.duration);
  formData.append('price', planData.price);
  
  // Consultation & Follow-up
  formData.append('consultationIncluded', planData.consultationIncluded);
  formData.append('followUpFrequency', planData.followUpFrequency);
  
  // Nutrition Parameters (send as JSON strings)
  formData.append('dailyCalorieRange', JSON.stringify(planData.dailyCalorieRange));
  formData.append('macronutrientRatio', JSON.stringify(planData.macronutrientRatio));
  formData.append('recommendedFoods', JSON.stringify(planData.recommendedFoods));
  formData.append('mealsPerDay', planData.mealsPerDay);
  
  // Food Plan Details
  formData.append('mealStructure', JSON.stringify(planData.mealStructure));
  if (planData.weeklyGroceryList) {
    formData.append('weeklyGroceryList', JSON.stringify(planData.weeklyGroceryList));
  }
  formData.append('foodsToAvoid', JSON.stringify(planData.foodsToAvoid));
  
  // Supplements & Exercise
  if (planData.supplementsSuggested) {
    formData.append('supplementsSuggested', JSON.stringify(planData.supplementsSuggested));
  }
  if (planData.exerciseRecommendation) {
    formData.append('exerciseRecommendation', planData.exerciseRecommendation);
  }
  
  // Plan Image
  if (planData.planImage) {
    formData.append('planImage', planData.planImage);
  }
  
  const response = await axiosInstance.post("/plans", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updatePlan = async (planId, planData) => {
  const formData = new FormData();
  
  // Basic Information
  if (planData.planName) formData.append('planName', planData.planName);
  if (planData.planCategory) formData.append('planCategory', planData.planCategory);
  if (planData.targetUserProfile) formData.append('targetUserProfile', planData.targetUserProfile);
  if (planData.description) formData.append('description', planData.description);
  
  // Duration & Price
  if (planData.duration) formData.append('duration', planData.duration);
  if (planData.price) formData.append('price', planData.price);
  
  // Consultation & Follow-up
  if (planData.consultationIncluded) formData.append('consultationIncluded', planData.consultationIncluded);
  if (planData.followUpFrequency) formData.append('followUpFrequency', planData.followUpFrequency);
  
  // Nutrition Parameters (send as JSON strings)
  if (planData.dailyCalorieRange) {
    formData.append('dailyCalorieRange', JSON.stringify(planData.dailyCalorieRange));
  }
  if (planData.macronutrientRatio) {
    formData.append('macronutrientRatio', JSON.stringify(planData.macronutrientRatio));
  }
  if (planData.recommendedFoods) {
    formData.append('recommendedFoods', JSON.stringify(planData.recommendedFoods));
  }
  if (planData.mealsPerDay) formData.append('mealsPerDay', planData.mealsPerDay);
  
  // Food Plan Details
  if (planData.mealStructure) {
    formData.append('mealStructure', JSON.stringify(planData.mealStructure));
  }
  if (planData.weeklyGroceryList) {
    formData.append('weeklyGroceryList', JSON.stringify(planData.weeklyGroceryList));
  }
  if (planData.foodsToAvoid) {
    formData.append('foodsToAvoid', JSON.stringify(planData.foodsToAvoid));
  }
  
  // Supplements & Exercise
  if (planData.supplementsSuggested) {
    formData.append('supplementsSuggested', JSON.stringify(planData.supplementsSuggested));
  }
  if (planData.exerciseRecommendation) {
    formData.append('exerciseRecommendation', planData.exerciseRecommendation);
  }
  
  // Plan Image
  if (planData.planImage) {
    formData.append('planImage', planData.planImage);
  }
  
  const response = await axiosInstance.put(`/plans/${planId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deletePlan = async (planId) => {
  const response = await axiosInstance.delete(`/plans/${planId}`);
  return response.data;
};

// ==================== FETCH PLANS ====================

export const getAllPlans = async (filters = {}) => {
  const { category, minPrice, maxPrice, minDuration, maxDuration } = filters;
  
  // Build query string
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (minPrice) params.append('minPrice', minPrice);
  if (maxPrice) params.append('maxPrice', maxPrice);
  if (minDuration) params.append('minDuration', minDuration);
  if (maxDuration) params.append('maxDuration', maxDuration);
  
  const queryString = params.toString();
  const url = queryString ? `/plans?${queryString}` : '/plans';
  
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getPlanById = async (planId) => {
  const response = await axiosInstance.get(`/plans/${planId}`);
  return response.data;
};

export const getMyPlans = async () => {
  const response = await axiosInstance.get("/plans/my-plans/list");
  return response.data;
};

// ==================== HELPER FUNCTIONS FOR UI ====================

// Get plan categories (for dropdowns/filters)
export const getPlanCategories = () => {
  return [
    "Diabetes",
    "Weight Loss",
    "Weight Gain",
    "Muscle Gain",
    "PCOS & Hormonal Balance",
    "Postpartum Recovery",
    "Complete Healthy Food",
    "Ramadan",
    "Summer Shape-Up",
    "Other"
  ];
};

// Get follow-up frequency options
export const getFollowUpOptions = () => {
  return ["Daily", "Weekly", "Every 2 weeks", "Monthly", "None"];
};

// Validate macronutrients before sending to API
export const validateMacronutrients = (carbs, protein, fat) => {
  const total = carbs + protein + fat;
  if (total !== 100) {
    return {
      valid: false,
      message: `Macronutrients must sum to 100%. Current total: ${total}%`
    };
  }
  return {
    valid: true,
    message: "Valid"
  };
};

// Helper to create default empty plan structure (for forms)
export const getEmptyPlanTemplate = () => {
  return {
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
      other: []
    },
    foodsToAvoid: [],
    supplementsSuggested: [],
    exerciseRecommendation: "",
    planImage: null
  };
};