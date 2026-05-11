import { getCookie } from "../utils/cookieUtils";

const API_BASE_URL = "http://localhost:5000/api";

// Books API
export const fetchBooks = async (category = null) => {
  try {
    const url = category 
      ? `${API_BASE_URL}/books?category=${category}`
      : `${API_BASE_URL}/books`;
    const response = await fetch(url);
    const result = await response.json();
    if (result.success === false) {
      console.warn("API returned error:", result.message);
      return [];
    }
    return result.data?.books || [];
  } catch (error) {
    console.error("fetchBooks error:", error);
    return [];
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/categories`);
    const result = await response.json();
    if (result.success === false) {
      console.warn("API returned error:", result.message);
      return [];
    }
    return result.data || [];
  } catch (error) {
    console.error("fetchCategories error:", error);
    return [];
  }
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

// Upload book image
export const uploadBookImage = async (file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('hinh_anh', file);
  
  const response = await fetch(`${API_BASE_URL}/books/upload`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
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

export const fetchCTVOrders = async (ctvId) => {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}/books/orders?ctv_id=${ctvId}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result.data?.orders || [];
};

export const fetchOrderStats = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/books/orders/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result.data || { all: 0, cho_tt: 0, da_tt: 0, dang_giao: 0, da_giao: 0, da_huy: 0 };
};

// Update order status (admin)
export const updateOrderStatus = async (orderId, status) => {
  const token = localStorage.getItem('token');
  // Backend expects: { trang_thai: "da_tt" }
  const response = await fetch(`${API_BASE_URL}/books/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ trang_thai: status }),
  });
  const result = await response.json();
  return result;
};

export const fetchOrderById = async (id) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/books/orders/${id}`, { headers });
  const result = await response.json();
  return result.data || null;
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

// Demo login - for testing without password
export const loginDemo = async (email, userId) => {
  const response = await fetch(`${API_BASE_URL}/auth/login-demo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, userId }),
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
  // Get ref code from cookie if not provided in data
  let refCode = data.ma_gioi_thieu;
  if (!refCode) {
    refCode = getCookie("ref");
  }
  
  const payload = { ...data };
  if (refCode) {
    payload.ma_gioi_thieu = refCode;
  }
  
  const response = await fetch(`${API_BASE_URL}/affiliate/register-new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  return result;
};

export const loginCTV = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login-ctv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, mat_khau: password }),
  });
  const result = await response.json();
  return result;
};

export const fetchAffiliateStats = () => {
  const token = localStorage.getItem("ctv_token") || localStorage.getItem("token");

  return fetch(`${API_BASE_URL}/affiliate/stats`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }).then(res => res.json());
};

export const fetchAffiliateCommissions = async (params = {}) => {
  const token = localStorage.getItem('ctv_token') || localStorage.getItem('token');
  const queryString = new URLSearchParams(params).toString();
  const url = queryString 
    ? `${API_BASE_URL}/affiliate/commissions?${queryString}`
    : `${API_BASE_URL}/affiliate/commissions`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

export const fetchAffiliateDownline = async () => {
  const token = localStorage.getItem('ctv_token') || localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/affiliate/downline`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

export const fetchAffiliateWithdrawals = async (params = {}) => {
  const token = localStorage.getItem('ctv_token') || localStorage.getItem('token');
  const queryString = new URLSearchParams(params).toString();
  const url = queryString 
    ? `${API_BASE_URL}/affiliate/withdrawals?${queryString}`
    : `${API_BASE_URL}/affiliate/withdrawals`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

export const createAffiliateWithdraw = async (data) => {
  const token = localStorage.getItem('ctv_token') || localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/affiliate/withdraw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Admin: Backfill hoa hồng cho đơn da_tt chưa có
export const backfillCommissions = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/backfill-commissions`, {
    method: "POST",
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

export const fetchAllWithdrawals = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/withdrawals`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
};

// Admin: Duyệt rút tiền (CTV đã chọn phương thức rồi)
export const approveWithdrawal = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/withdrawals/${id}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  const result = await response.json();
  return result;
};

// Admin: Từ chối rút tiền
export const rejectWithdrawal = async (id, reason = '') => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/withdrawals/${id}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  const result = await response.json();
  return result;
};

// Admin: Lấy QR code cho withdrawal
export const getWithdrawalQR = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/withdrawals/${id}/qr`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
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

// Promotions API
export const fetchKhuyenMai = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString 
    ? `${API_BASE_URL}/khuyen-mai?${queryString}`
    : `${API_BASE_URL}/khuyen-mai`;
  const response = await fetch(url);
  const result = await response.json();
  return result.data;
};

export const fetchKhuyenMaiById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/khuyen-mai/${id}`);
  const result = await response.json();
  return result.data;
};

export const createKhuyenMai = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/khuyen-mai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

export const updateKhuyenMai = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/khuyen-mai/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

export const deleteKhuyenMai = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/khuyen-mai/${id}`, {
    method: "DELETE",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
};

export const apDungKhuyenMai = async (data) => {
  const response = await fetch(`${API_BASE_URL}/khuyen-mai/ap-dung`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

// Payment API
export const createMoMoPayment = async (paymentData) => {
  const response = await fetch(`${API_BASE_URL}/payment/momo/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });
  const result = await response.json();
  return result;
};

export const checkMoMoTransactionStatus = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/payment/momo/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  });
  const result = await response.json();
  return result;
};

export const createVNPayPayment = async (paymentData) => {
  const response = await fetch(`${API_BASE_URL}/payment/vnpay/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });
  const result = await response.json();
  return result;
};

// Admin CTV Management API
export const fetchCTVs = async (params = {}, token = localStorage.getItem('token')) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString 
    ? `${API_BASE_URL}/affiliate/admin/ctvs?${queryString}`
    : `${API_BASE_URL}/affiliate/admin/ctvs`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
};

export const updateCTVStatus = async (ctvId, status, token = localStorage.getItem('token')) => {
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/ctvs/${ctvId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ trang_thai: status }),
  });
  const result = await response.json();
  return result;
};

export const deleteCTV = async (ctvId, token = localStorage.getItem('token')) => {
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/ctvs/${ctvId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
};

// Admin Commission Management API
export const fetchCommissions = async (params = {}, token = localStorage.getItem('token')) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString 
    ? `${API_BASE_URL}/affiliate/admin/commissions?${queryString}`
    : `${API_BASE_URL}/affiliate/admin/commissions`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
};

export const updateCommissionStatus = async (commissionId, status, token = localStorage.getItem('token')) => {
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/commissions/${commissionId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ trang_thai: status }),
  });
  const result = await response.json();
  return result;
};

// Admin Commission Products API
export const fetchCommissionProducts = async (token = localStorage.getItem('token')) => {
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/commission-products`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
};

export const createCommissionProduct = async (data, token = localStorage.getItem('token')) => {
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/commission-products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

export const updateCommissionProduct = async (id, data, token = localStorage.getItem('token')) => {
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/commission-products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

export const deleteCommissionProduct = async (id, token = localStorage.getItem('token')) => {
  const response = await fetch(`${API_BASE_URL}/affiliate/admin/commission-products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
};

// User Profile API
export const updateUserProfile = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

export const changePassword = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
};

// Affiliate Link API
export const generateAffiliateLink = async (productId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/affiliate/generate-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId }),
  });
  const result = await response.json();
  return result;
};

export const getAffiliateProducts = async (params = {}) => {
  const token = localStorage.getItem('token');
  const queryString = new URLSearchParams(params).toString();
  const url = queryString 
    ? `${API_BASE_URL}/affiliate/products?${queryString}`
    : `${API_BASE_URL}/affiliate/products`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result;
};

export const getCTVByRefCode = async (refCode) => {
  const response = await fetch(`${API_BASE_URL}/affiliate/by-ref/${refCode}`);
  const result = await response.json();
  return result;
};

// ==================== LMS API ====================
const lmsGet = (path) => {
  // Use admin token if available, otherwise use regular token
  const adminUser = localStorage.getItem('adminUser');
  const token = adminUser ? localStorage.getItem('token') || localStorage.getItem('admin_token') : localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
};
const lmsPost = (path, data) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json());
};
const lmsPut = (path, data) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json());
};

export const lmsAPI = {
  // Khoa hoc
  getKhoaHocs: () => lmsGet('khoa-hoc'),
  createKhoaHoc: (data) => lmsPost('khoa-hoc', data),
  updateKhoaHoc: (id, data) => lmsPut(`khoa-hoc/${id}`, data),

  // Phong hoc & Giao vien
  getPhongHocs: () => lmsGet('phong-hoc'),
  getGiaoViens: () => lmsGet('giao-vien'),

  // Lop hoc
  getLopHocs: (params = {}) => lmsGet(`lop-hoc?${new URLSearchParams(params)}`),
  getLopHocById: (id) => lmsGet(`lop-hoc/${id}`),
  createLopHoc: (data) => lmsPost('lop-hoc', data),
  updateLopHoc: (id, data) => lmsPut(`lop-hoc/${id}`, data),

  // Hoc vien
  getHocViens: (params = {}) => lmsGet(`hoc-vien?${new URLSearchParams(params)}`),
  createHocVien: (data) => lmsPost('hoc-vien', data),
  updateHocVien: (id, data) => lmsPut(`hoc-vien/${id}`, data),
  getGhiChuHocVien: (id) => lmsGet(`hoc-vien/${id}/ghi-chu`),
  createGhiChuHocVien: (id, data) => lmsPost(`hoc-vien/${id}/ghi-chu`, data),
  deleteGhiChuHocVien: (id, gcId) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/lms/hoc-vien/${id}/ghi-chu/${gcId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
  },

  // Dang ky
  getDangKyByLop: (lopId) => lmsGet(`lop-hoc/${lopId}/hoc-vien`),
  addHocVienVaoLop: (data) => lmsPost('dang-ky', data),
  updateDangKy: (id, data) => lmsPut(`dang-ky/${id}`, data),

  // Hop dong & thanh toan
  getHopDongs: (params = {}) => lmsGet(`hop-dong?${new URLSearchParams(params)}`),
  createHopDong: (data) => lmsPost('hop-dong', data),
  createThanhToan: (data) => lmsPost('thanh-toan', data),
};

// ==================== LMS MODULE 2 API ====================
const lmsPost2 = (path, data) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json());
};
const lmsPut2 = (path, data) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json());
};
const lmsGet2 = (path) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
};

export const lmsAPI2 = {
  // Điểm danh
  getDiemDanh: (lopId, ngay) => lmsGet2(`diem-danh/${lopId}?ngay=${ngay}`),
  getLichSuDiemDanh: (lopId) => lmsGet2(`diem-danh/${lopId}/lich-su`),
  diemDanhBulk: (data) => lmsPost2('diem-danh/bulk', data),

  // Bài tập
  getBaiTaps: (params = {}) => lmsGet2(`bai-tap?${new URLSearchParams(params)}`),
  getBaiTapById: (id) => lmsGet2(`bai-tap/${id}`),
  createBaiTap: (data) => lmsPost2('bai-tap', data),
  updateBaiTap: (id, data) => lmsPut2(`bai-tap/${id}`, data),

  // Chấm điểm
  chamDiem: (data) => lmsPost2('cham-diem', data),
  getDiemSoLop: (lopId) => lmsGet2(`diem-so/${lopId}`),

  // Đánh giá giảng viên
  createDanhGia: (data) => fetch(`${API_BASE_URL}/lms/danh-gia-gv`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  getDanhGiaGiaoVien: (giaoVienId) => lmsGet2(`danh-gia-gv/${giaoVienId}`),
};

// ==================== LMS MODULE 3: KE TOAN ====================
const _keToanGet = (path) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
};
const _keToanPost = (path, data) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json());
};

export const keToanAPI = {
  getTongQuan: (thang, nam) => _keToanGet(`ke-toan/tong-quan?thang=${thang}&nam=${nam}`),
  getCongNo: (search = '') => _keToanGet(`ke-toan/cong-no?search=${search}`),
  getPhieuThus: (params = {}) => _keToanGet(`ke-toan/phieu-thu?${new URLSearchParams(params)}`),
  createPhieuThu: (data) => _keToanPost('ke-toan/phieu-thu', data),
  getPhieuChis: (params = {}) => _keToanGet(`ke-toan/phieu-chi?${new URLSearchParams(params)}`),
  createPhieuChi: (data) => _keToanPost('ke-toan/phieu-chi', data),
  getBaoCao: (params = {}) => _keToanGet(`ke-toan/bao-cao?${new URLSearchParams(params)}`),
};

// ==================== LMS MODULE 4: PORTAL HOC VIEN ====================
const _hvGet = (path) => {
  const token = localStorage.getItem('hv_token') || localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
};
const _hvPost = (path, data) => {
  const token = localStorage.getItem('hv_token') || localStorage.getItem('token');
  return fetch(`${API_BASE_URL}/lms/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json());
};

export const hvPortalAPI = {
  getDashboard: () => _hvGet('hoc-vien/portal/dashboard'),
  getLopHoc: () => _hvGet('hoc-vien/portal/lop-hoc'),
  getBaiTap: () => _hvGet('hoc-vien/portal/bai-tap'),
  nopBai: (data) => {
    const token = localStorage.getItem('hv_token');
    const fd = new FormData();
    if (data.bai_tap_id) fd.append('bai_tap_id', data.bai_tap_id);
    if (data.ghi_chu) fd.append('ghi_chu', data.ghi_chu);
    if (data.file_nop) fd.append('file_nop', data.file_nop);
    return fetch(`${API_BASE_URL}/lms/hoc-vien/portal/nop-bai`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    }).then(r => r.json());
  },
  getThongBao: () => _hvGet('thong-bao'),
  danhDauDaDoc: (id) => {
    const token = localStorage.getItem('hv_token');
    return fetch(`${API_BASE_URL}/lms/thong-bao/${id}/doc`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
  },
  getDiemSo: () => _hvGet('hoc-vien/portal/diem-so'),
  getDiemDanh: () => _hvGet('hoc-vien/portal/diem-danh'),
  danhGia: (data) => _hvPost('hoc-vien/portal/danh-gia', data),
  getHocPhi: () => _hvGet('hoc-vien/portal/hoc-phi'),
};

// ==================== TEST APPOINTMENTS API ====================
const _testToken = () => localStorage.getItem('hv_token') || localStorage.getItem('token') || localStorage.getItem('admin_token');
const _testGet = (path) => {
  const token = _testToken();
  return fetch(`${API_BASE_URL}/test/${path}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
};
const _testPost = (path, data) => {
  const token = _testToken();
  return fetch(`${API_BASE_URL}/test/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json());
};
const _testPut = (path, data) => {
  // Use token from localStorage - check both 'token' and admin token
  const adminToken = localStorage.getItem('admin_token');
  const userToken = localStorage.getItem('token');
  const token = adminToken || userToken || localStorage.getItem('hv_token');
  return fetch(`${API_BASE_URL}/test/${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json());
};

export const testAPI = {
  getDeThi: () => _testGet('de-thi'),
  createDeThi: (formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/test/de-thi`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData }).then(r => r.json());
  },
  deleteDeThi: (id) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/test/de-thi/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
  },
  getLichHen: (params = {}) => _testGet(`lich-hen?${new URLSearchParams(params)}`),
  createLichHen: (data) => _testPost('lich-hen', data),
  updateLichHen: (id, data) => _testPut(`lich-hen/${id}`, data),
  deleteLichHen: (id) => {
    // Use token from localStorage - check both 'token' and admin token
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('token');
    const token = adminToken || userToken;
    return fetch(`${API_BASE_URL}/test/lich-hen/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
  },
  updateKetQua: (id, data) => _testPut(`ket-qua/${id}`, data),
  getMyLichTest: () => _testGet('my-lich-test'),
};

// ==================== EXAM API ====================
const _examToken = () => localStorage.getItem('hv_token') || localStorage.getItem('token');
const _examGet = (p) => {
  const t = _examToken();
  return fetch(`${API_BASE_URL}/exam/${p}`, { headers: { 'Authorization': `Bearer ${t}` } }).then(r => r.json());
};
const _examPost = (p, data) => {
  const t = _examToken();
  return fetch(`${API_BASE_URL}/exam/${p}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` }, body: JSON.stringify(data) }).then(r => r.json());
};
const _examDel = (p) => {
  const t = _examToken();
  return fetch(`${API_BASE_URL}/exam/${p}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${t}` } }).then(r => r.json());
};

export const examAPI = {
  // De thi
  getAllDeThi: () => _examGet('de-thi'),
  getDeThiById: (id) => _examGet(`de-thi/${id}`),
  createDeThi: (formData) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/exam/de-thi`, { method: 'POST', headers: { 'Authorization': `Bearer ${t}` }, body: formData }).then(r => r.json());
  },
  deleteDeThi: (id) => _examDel(`de-thi/${id}`),
  addCauHoi: (deThiId, data) => _examPost(`de-thi/${deThiId}/cau-hoi`, data),
  deleteCauHoi: (id) => _examDel(`cau-hoi/${id}`),
  // Publish/Cong bo
  publishDeThi: (id, trang_thai) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/exam/de-thi/${id}/publish`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ trang_thai })
    }).then(r => r.json());
  },
  // Cap nhat de thi
  updateDeThi: (id, formData) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/exam/de-thi/${id}/cap-nhat`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${t}` },
      body: formData
    }).then(r => r.json());
  },
  // Lam bai
  batDau: (data) => _examPost('bat-dau', data),
  traLoi: (data) => _examPost('tra-loi', data),
  nopBai: (data) => _examPost('nop-bai', data),
  // Ket qua
  getKetQua: (id) => _examGet(`ket-qua/${id}`),
  getKetQuaByLich: (lichHenTestId) => _examGet(`ket-qua-by-lich/${lichHenTestId}`),
  getMyResults: () => _examGet('my-results'),
  getAllKetQua: (params = {}) => _examGet(`admin/ket-qua?${new URLSearchParams(params)}`),
};

// ==================== NEW ONLINE EXAM API ====================
export const onlineExamAPI = {
  // Exams
  getAllExams: () => fetch(`${API_BASE_URL}/online-exam/exams`).then(r => r.json()),
  getExamById: (id) => fetch(`${API_BASE_URL}/online-exam/exams/${id}`).then(r => r.json()),
  createExam: (data) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/exams`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },
  updateExam: (id, data) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/exams/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },
  deleteExam: (id) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/exams/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${t}` }
    }).then(r => r.json());
  },
  
  // Sections
  createSection: (data) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/sections`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },
  updateSection: (id, data) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/sections/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },
  deleteSection: (id) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/sections/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${t}` }
    }).then(r => r.json());
  },
  
  // Questions
  createQuestion: (data) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/questions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },
  deleteQuestion: (id) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/questions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${t}` }
    }).then(r => r.json());
  },
  
  // Answers
  createAnswer: (data) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/answers`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },
  deleteAnswer: (id) => {
    const t = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/online-exam/answers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${t}` }
    }).then(r => r.json());
  },
  
  // Exam taking
  startExam: (data) => fetch(`${API_BASE_URL}/online-exam/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  submitExam: (data) => fetch(`${API_BASE_URL}/online-exam/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  getUserResults: (userId) => fetch(`${API_BASE_URL}/online-exam/results/${userId}`).then(r => r.json()),
};

