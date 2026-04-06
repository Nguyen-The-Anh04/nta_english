/**
 * Get a cookie value by name
 * @param {string} name - The cookie name
 * @returns {string|null} - The cookie value or null if not found
 */
export const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return value;
  }
  return null;
};

/**
 * Set a cookie with expiration
 * @param {string} name - The cookie name
 * @param {string} value - The cookie value
 * @param {number} days - Days until expiration
 * @param {string} path - Cookie path (default: '/')
 */
export const setCookie = (name, value, days = 7, path = '/') => {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=${path}`;
};

/**
 * Delete a cookie by name
 * @param {string} name - The cookie name
 * @param {string} path - Cookie path (default: '/')
 */
export const deleteCookie = (name, path = '/') => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
};