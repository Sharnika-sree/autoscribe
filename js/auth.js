// API base URL
const API_URL = 'http://localhost:5000/api';

/**
 * Handle user login
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} role - User's role (teacher/student)
 * @returns {Promise<Object>} Response data
 */
async function handleLogin(email, password, role) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

/**
 * Get current user data
 * @returns {Object|null} User object or null if not authenticated
 */
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

/**
 * Logout user and redirect to login page
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/**
 * Check authentication and role for protected routes
 * @param {string} [role] - Required role (optional)
 * @returns {boolean} True if user is authorized
 */
function requireAuth(role = null) {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (role && user.role !== role) {
        window.location.href = `${user.role}-dashboard.html`;
        return false;
    }
    
    return true;
}

// Export functions
window.auth = {
    handleLogin,
    isAuthenticated,
    getCurrentUser,
    logout,
    requireAuth
};
