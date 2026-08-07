export const PRICING = {
  AI_TOOL_SUBSCRIPTION: 499.99,
  COURSE_SUBSCRIPTION: 2499.99,
  DIETETICIEN_SUBSCRIPTION: 3000.00,
};

export const CURRENCY = 'DZD';

export const formatPrice = (price) => `${price.toLocaleString()} ${CURRENCY}`;
