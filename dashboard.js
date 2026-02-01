/**
 * Dashboard JavaScript
 * Handles user dashboard functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!requireAuth()) return;

    // Display user name
    displayUserName();

    // Setup tabs
    setupTabs();

    // Load dashboard data
    loadMyLostItems();
    loadMyFoundItems();
    loadAllItems();

    // Setup filters
    setupDashboardFilters();
});

/**
 * Display user name in header
 */
function displayUserName() {
    const user = getCurrentUser();
    const userNameElement = document.getElementById('userName');
    if (user && userNameElement) {
        userNameElement.textContent = user.name;
    }
}

/**
 * Setup tab functionality
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Remove active class from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

/**
 * Load user's lost items
 */
async function loadMyLostItems(status = '') {
    const itemsList = document.getElementById('myLostItemsList');

    try {
        itemsList.innerHTML = '<div class="loading">Loading your lost items...</div>';

        const params = new URLSearchParams();
        if (status) params.append('status', status);

        const token = localStorage.getItem('token');
        console.log('Loading my lost items, token exists:', !!token);

        const response = await fetch(`${API_URL}/lost-items/user/my-items?${params}`, {
            headers: getAuthHeaders(),
        });

        console.log('My lost items response status:', response.status);
        const data = await response.json();
        console.log('My lost items data:', data);

        if (response.ok && data.success) {
            if (data.data.length === 0) {
                itemsList.innerHTML = '<p class="loading">You haven\'t posted any lost items yet.</p>';
                return;
            }

            itemsList.innerHTML = data.data.map(item => createDashboardItemCard(item, 'lost')).join('');
        } else {
            console.error('Failed to load my lost items:', data);
            itemsList.innerHTML = `<p class="loading">Failed to load items. ${data.message || ''}</p>`;
        }
    } catch (error) {
        console.error('Load my lost items error:', error);
        itemsList.innerHTML = '<p class="loading">Error loading items. Please check console.</p>';
    }
}

/**
 * Load user's found items
 */
async function loadMyFoundItems(status = '') {
    const itemsList = document.getElementById('myFoundItemsList');

    try {
        itemsList.innerHTML = '<div class="loading">Loading your found items...</div>';

        const params = new URLSearchParams();
        if (status) params.append('status', status);

        const token = localStorage.getItem('token');
        console.log('Loading my found items, token exists:', !!token);

        const response = await fetch(`${API_URL}/found-items/user/my-items?${params}`, {
            headers: getAuthHeaders(),
        });

        console.log('My found items response status:', response.status);
        const data = await response.json();
        console.log('My found items data:', data);

        if (response.ok && data.success) {
            if (data.data.length === 0) {
                itemsList.innerHTML = '<p class="loading">You haven\'t posted any found items yet.</p>';
                return;
            }

            itemsList.innerHTML = data.data.map(item => createDashboardItemCard(item, 'found')).join('');
        } else {
            console.error('Failed to load my found items:', data);
            itemsList.innerHTML = `<p class="loading">Failed to load items. ${data.message || ''}</p>`;
        }
    } catch (error) {
        console.error('Load my found items error:', error);
        itemsList.innerHTML = '<p class="loading">Error loading items. Please check console.</p>';
    }
}

/**
 * Load all items for browsing
 */
async function loadAllItems(type = 'lost', filters = {}) {
    const itemsList = document.getElementById('allItemsList');

    try {
        itemsList.innerHTML = '<div class="loading">Loading items...</div>';

        const endpoint = type === 'lost' ? 'lost-items' : 'found-items';
        const params = new URLSearchParams(filters);

        const response = await fetch(`${API_URL}/${endpoint}?${params}`);
        const data = await response.json();

        if (response.ok && data.success) {
            if (data.data.length === 0) {
                itemsList.innerHTML = '<p class="loading">No items found.</p>';
                return;
            }

            itemsList.innerHTML = data.data.map(item => createDashboardItemCard(item, type)).join('');
        } else {
            itemsList.innerHTML = '<p class="loading">Failed to load items.</p>';
        }
    } catch (error) {
        console.error('Load all items error:', error);
        itemsList.innerHTML = '<p class="loading">Error loading items.</p>';
    }
}

/**
 * Create dashboard item card with actions
 */
function createDashboardItemCard(item, type) {
    const imageUrl = item.image ? `http://localhost:5000${item.image}` : null;
    const icon = getCategoryIcon(item.category);
    const user = getCurrentUser();
    const isOwner = user && item.postedBy._id === user._id;

    return `
        <div class="item-card">
            <div class="item-image">
                ${imageUrl ? `<img src="${imageUrl}" alt="${item.itemName}" onerror="this.style.display='none'; this.parentElement.innerHTML='${icon}';" style="width:100%;height:100%;object-fit:cover;">` : `<div class="item-icon-placeholder">${icon}</div>`}
            </div>
            <div class="item-content">
                <div class="item-header">
                    <div>
                        <h3 class="item-title">${item.itemName}</h3>
                        <span class="item-category">${item.category}</span>
                    </div>
                </div>
                <span class="item-status status-${item.status.toLowerCase()}">${item.status}</span>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    <span>📍 ${item.location}</span>
                    <span>📅 ${formatDate(item.dateLost || item.dateFound)}</span>
                    ${item.contactPhone ? `<span>📞 ${item.contactPhone}</span>` : ''}
                </div>
                ${isOwner ? `
                    <div class="item-actions">
                        <button class="btn btn-secondary" onclick="updateItemStatus('${item._id}', '${type}')">
                            Update Status
                        </button>
                        <button class="btn" style="background:#ef4444;color:white;" onclick="deleteItem('${item._id}', '${type}')">
                            Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Update item status
 */
async function updateItemStatus(itemId, type) {
    const statuses = ['Pending', 'Claimed', 'Resolved'];
    const newStatus = prompt(`Update status to:\n1. Pending\n2. Claimed\n3. Resolved\n\nEnter 1, 2, or 3:`);

    if (!newStatus || !['1', '2', '3'].includes(newStatus)) {
        return;
    }

    const status = statuses[parseInt(newStatus) - 1];

    try {
        const endpoint = type === 'lost' ? 'lost-items' : 'found-items';
        const response = await fetch(`${API_URL}/${endpoint}/${itemId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Status updated successfully', 'success');
            // Reload items
            loadMyLostItems();
            loadMyFoundItems();
        } else {
            showAlert(data.message || 'Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Update status error:', error);
        showAlert('Error updating status', 'error');
    }
}

/**
 * Delete item
 */
async function deleteItem(itemId, type) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const endpoint = type === 'lost' ? 'lost-items' : 'found-items';
        const response = await fetch(`${API_URL}/${endpoint}/${itemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Item deleted successfully', 'success');
            // Reload items
            loadMyLostItems();
            loadMyFoundItems();
        } else {
            showAlert(data.message || 'Failed to delete item', 'error');
        }
    } catch (error) {
        console.error('Delete item error:', error);
        showAlert('Error deleting item', 'error');
    }
}

/**
 * Contact item owner
 */
function contactOwner(email) {
    window.location.href = `mailto:${email}`;
}

/**
 * Setup dashboard filters
 */
function setupDashboardFilters() {
    // Lost items status filter
    const lostStatusFilter = document.getElementById('lostStatusFilter');
    if (lostStatusFilter) {
        lostStatusFilter.addEventListener('change', (e) => {
            loadMyLostItems(e.target.value);
        });
    }

    // Found items status filter
    const foundStatusFilter = document.getElementById('foundStatusFilter');
    if (foundStatusFilter) {
        foundStatusFilter.addEventListener('change', (e) => {
            loadMyFoundItems(e.target.value);
        });
    }

    // All items filters
    const typeFilter = document.getElementById('typeFilter');
    const categoryFilterAll = document.getElementById('categoryFilterAll');
    const searchAll = document.getElementById('searchAll');

    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            applyAllItemsFilters();
        });
    }

    if (categoryFilterAll) {
        categoryFilterAll.addEventListener('change', () => {
            applyAllItemsFilters();
        });
    }

    if (searchAll) {
        searchAll.addEventListener('input', debounce(() => {
            applyAllItemsFilters();
        }, 500));
    }
}

/**
 * Apply filters for all items tab
 */
function applyAllItemsFilters() {
    const type = document.getElementById('typeFilter')?.value || 'lost';
    const filters = {};

    const search = document.getElementById('searchAll')?.value;
    const category = document.getElementById('categoryFilterAll')?.value;

    if (search) filters.search = search;
    if (category) filters.category = category;

    loadAllItems(type, filters);
}
