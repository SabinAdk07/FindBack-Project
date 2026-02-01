/**
 * Main JavaScript - Common functionality
 * Handles navigation, mobile menu, and utilities
 */

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Update auth link based on login status
    updateAuthLink();
});

/**
 * Update navigation auth link
 */
function updateAuthLink() {
    const authLink = document.getElementById('authLink');
    const token = localStorage.getItem('token');

    if (authLink) {
        if (token) {
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        } else {
            authLink.textContent = 'Login/Signup';
            authLink.href = 'index.html';
        }
    }
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, error, info)
 */
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Get auth headers for API requests
 * @returns {Object} Headers object
 */
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
}

/**
 * Handle file upload preview
 */
function setupFileUpload() {
    const fileInput = document.getElementById('image');
    const fileName = document.getElementById('fileName');
    const imagePreview = document.getElementById('imagePreview');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;

                // Show image preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

/**
 * Require authentication
 * Redirect to login if not authenticated
 */
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
    showAlert('Logged out successfully', 'success');
}

/**
 * Get category icon
 * @param {string} category - Item category
 * @returns {string} Icon emoji
 */
function getCategoryIcon(category) {
    const icons = {
        'Books': '📚',
        'ID Card': '🪪',
        'Electronics': '💻',
        'Accessories': '🎒',
        'Other': '📱'
    };
    return icons[category] || '📦';
}

/**
 * Debounce function for search
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load stats on home page
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    loadHomeStats();
}

/**
 * Load statistics for home page
 */
async function loadHomeStats() {
    try {
        const [lostResponse, foundResponse] = await Promise.all([
            fetch(`${API_URL}/lost-items`),
            fetch(`${API_URL}/found-items`)
        ]);

        const lostData = await lostResponse.json();
        const foundData = await foundResponse.json();

        const totalItems = lostData.count + foundData.count;
        const resolvedItems = lostData.data.filter(item => item.status === 'Resolved').length +
                             foundData.data.filter(item => item.status === 'Resolved').length;

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('resolvedItems').textContent = resolvedItems;
        document.getElementById('activeUsers').textContent = Math.floor(totalItems * 0.6); // Estimate
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
