const API_BASE_URL = "http://localhost:5000/api";

// Books API
export const fetchBooks = async (category = null) => {
  const url = category 
    ? `${API_BASE_URL}/books?category=${category}`
    : `${API_BASE_URL}/books`;
  const response = await fetch(url);
  const result = await response.json();
  return result.data.books;
};

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/books/categories`);
  const result = await response.json();
  return result.data;
};

export const fetchBookById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/books/${id}`);
  const result = await response.json();
  return result.data.book;
};

// Courses API
export const fetchCourses = async () => {
  const response = await fetch(`${API_BASE_URL}/courses`);
  const result = await response.json();
  return result.data.courses;
};

export const fetchCourseById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`);
  const result = await response.json();
  return result.data.course;
};

// Orders API
export const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });
  const result = await response.json();
  return result;
};

export const fetchOrders = async () => {
  const response = await fetch(`${API_BASE_URL}/orders`);
  const result = await response.json();
  return result.data.orders;
};

// Auth API
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  return result;
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  const result = await response.json();
  return result;
};

// Affiliate API
export const registerAffiliate = async (data) => {
  const response = await fetch(`${API_BASE_URL}/affiliate/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

export const fetchAffiliateStats = async () => {
  const response = await fetch(`${API_BASE_URL}/affiliate/stats`);
  const result = await response.json();
  return result.data;
};

export default {
  fetchBooks,
  fetchBookById,
  fetchCourses,
  fetchCourseById,
  createOrder,
  fetchOrders,
  login,
  register,
  registerAffiliate,
  fetchAffiliateStats,
};
