/**
 * Authentication JavaScript
 * Handles user login, signup, and authentication
 */

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 */
async function login(email, password) {
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.textContent;

    try {
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            showAlert('Login successful! Redirecting...', 'success');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Login failed', 'error');
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('An error occurred during login', 'error');
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
    }
}

/**
 * Signup new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} phone - User phone (optional)
 */
async function signup(name, email, password, phone = '') {
    const signupBtn = document.getElementById('signupBtn');
    const originalText = signupBtn.textContent;

    try {
        // Validate password length
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long', 'error');
            return;
        }

        signupBtn.textContent = 'Signing up...';
        signupBtn.disabled = true;

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, phone }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            showAlert('Account created successfully! Redirecting...', 'success');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Signup failed', 'error');
            signupBtn.textContent = originalText;
            signupBtn.disabled = false;
        }
    } catch (error) {
        console.error('Signup error:', error);
        showAlert('An error occurred during signup', 'error');
        signupBtn.textContent = originalText;
        signupBtn.disabled = false;
    }
}

/**
 * Get current user data
 * @returns {Object|null} User data or null
 */
function getCurrentUser() {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
}

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 */
async function updateProfile(updates) {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            showAlert('Profile updated successfully', 'success');
            return data;
        } else {
            showAlert(data.message || 'Failed to update profile', 'error');
            return null;
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showAlert('An error occurred while updating profile', 'error');
        return null;
    }
}

/**
 * Get user profile from server
 */
async function fetchUserProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } else {
            // Token might be invalid
            if (response.status === 401) {
                logout();
            }
            return null;
        }
    } catch (error) {
        console.error('Fetch profile error:', error);
        return null;
    }
}
