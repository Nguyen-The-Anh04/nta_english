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

export const createBook = async (bookData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(bookData),
  });
  const result = await response.json();
  return result;
};

export const updateBook = async (id, bookData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(bookData),
  });
  const result = await response.json();
  return result;
};

export const deleteBook = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: "DELETE",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
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
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/books/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
  const result = await response.json();
  return result;
};

export const fetchOrders = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/books/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result.data?.orders || [];
};

export const fetchUserOrders = async () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  
  const url = userId 
    ? `${API_BASE_URL}/books/orders?nguoi_dung_id=${userId}`
    : `${API_BASE_URL}/books/orders`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result.data?.orders || [];
};

export const fetchOrderById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/books/orders/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result.data;
};

export const cancelOrder = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/books/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ trang_thai: 'da_huy' }),
  });
  const result = await response.json();
  return result;
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

// Leads API
export const createLead = async (leadData) => {
  // Map frontend fields to backend expected fields
  const payload = {
    name: leadData.ho_ten,
    phone: leadData.sdt,
    email: leadData.email,
    course: leadData.muc_tieu,
    message: leadData.ghi_chu,
  };
  
  const response = await fetch(`${API_BASE_URL}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  return result;
};

export const fetchLeads = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString 
    ? `${API_BASE_URL}/leads?${queryString}`
    : `${API_BASE_URL}/leads`;
  const response = await fetch(url);
  const result = await response.json();
  return result.data;
};

export const updateLead = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

export const deleteLead = async (id) => {
  const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
    method: "DELETE",
  });
  const result = await response.json();
  return result;
};

export const fetchLeadStats = async () => {
  const response = await fetch(`${API_BASE_URL}/leads/stats`);
  const result = await response.json();
  return result.data;
};

// Reviews API
export const fetchReviewsByBook = async (bookId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/book/${bookId}`);
  const result = await response.json();
  return result.data;
};

export const createReview = async (reviewData) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });
  const result = await response.json();
  return result;
};

export default {
  fetchBooks,
  fetchBookById,
  createBook,
  updateBook,
  deleteBook,
  fetchCourses,
  fetchCourseById,
  createOrder,
  fetchOrders,
  fetchUserOrders,
  fetchOrderById,
  cancelOrder,
  login,
  register,
  registerAffiliate,
  fetchAffiliateStats,
  createLead,
  fetchLeads,
  updateLead,
  deleteLead,
  fetchLeadStats,
  fetchReviewsByBook,
  createReview,
};
