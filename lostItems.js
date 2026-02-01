/**
 * Lost Items JavaScript
 * Handles lost items form submission and display
 */

document.addEventListener('DOMContentLoaded', () => {
    // Setup file upload preview
    setupFileUpload();

    // Setup form submission
    const form = document.getElementById('lostItemForm');
    if (form) {
        form.addEventListener('submit', handleLostItemSubmit);
    }

    // Load lost items
    loadLostItems();

    // Setup filters
    setupFilters();
});

/**
 * Handle lost item form submission
 */
async function handleLostItemSubmit(e) {
    e.preventDefault();

    if (!requireAuth()) return;

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;

    try {
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('itemName', document.getElementById('itemName').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('dateLost', document.getElementById('dateLost').value);
        formData.append('location', document.getElementById('location').value);
        formData.append('contactPhone', document.getElementById('contactPhone').value);

        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/lost-items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Lost item reported successfully!', 'success');
            document.getElementById('lostItemForm').reset();
            document.getElementById('fileName').textContent = 'Choose an image (optional)';
            document.getElementById('imagePreview').innerHTML = '';

            // Reload items list
            setTimeout(() => {
                loadLostItems();
            }, 1000);
        } else {
            showAlert(data.message || 'Failed to submit item', 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showAlert('An error occurred while submitting', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Load and display lost items
 */
async function loadLostItems(filters = {}) {
    const itemsList = document.getElementById('lostItemsList');

    try {
        itemsList.innerHTML = '<div class="loading">Loading items...</div>';

        // Build query string
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_URL}/lost-items?${params}`);
        const data = await response.json();

        if (response.ok && data.success) {
            if (data.data.length === 0) {
                itemsList.innerHTML = '<p class="loading">No lost items found.</p>';
                return;
            }

            itemsList.innerHTML = data.data.map(item => createItemCard(item, 'lost')).join('');
        } else {
            itemsList.innerHTML = '<p class="loading">Failed to load items.</p>';
        }
    } catch (error) {
        console.error('Load items error:', error);
        itemsList.innerHTML = '<p class="loading">Error loading items.</p>';
    }
}

/**
 * Create item card HTML
 */
function createItemCard(item, type) {
    const imageUrl = item.image ? `http://localhost:5000${item.image}` : null;
    const icon = getCategoryIcon(item.category);
    
    console.log('Item image:', item.image, 'Full URL:', imageUrl); // Debug log

    return `
        <div class="item-card" onclick="viewItemDetails('${item._id}', '${type}')">
            <div class="item-image">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${item.itemName}" 
                         onerror="console.error('Image load failed:', this.src); this.style.display='none'; this.parentElement.innerHTML='<div class=\"item-icon-placeholder\">${icon}</div>';" 
                         style="width:100%;height:100%;object-fit:cover;">` 
                    : `<div class="item-icon-placeholder">${icon}</div>`}
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
                </div>
            </div>
        </div>
    `;
}

/**
 * View item details
 */
async function viewItemDetails(itemId, type) {
    const modal = document.getElementById('itemModal');
    const modalBody = document.getElementById('modalBody');

    if (!modal) {
        // If no modal on current page, go to dashboard
        window.location.href = `dashboard.html?item=${itemId}&type=${type}`;
        return;
    }

    try {
        const endpoint = type === 'lost' ? 'lost-items' : 'found-items';
        const response = await fetch(`${API_URL}/${endpoint}/${itemId}`);
        const data = await response.json();

        if (response.ok && data.success) {
            const item = data.data;
            const imageUrl = item.image ? `http://localhost:5000${item.image}` : '';

            modalBody.innerHTML = `
                <h2>${item.itemName}</h2>
                <span class="item-category">${item.category}</span>
                <span class="item-status status-${item.status.toLowerCase()}">${item.status}</span>
                
                ${imageUrl ? `<img src="${imageUrl}" alt="${item.itemName}" style="max-width:100%;margin:20px 0;border-radius:8px;">` : `<div style="font-size:80px;text-align:center;margin:20px 0;">${getCategoryIcon(item.category)}</div>`}
                
                <div style="margin:20px 0;">
                    <h3>Description</h3>
                    <p>${item.description}</p>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:20px 0;">
                    <div>
                        <strong>Location:</strong><br>
                        📍 ${item.location}
                    </div>
                    <div>
                        <strong>Date:</strong><br>
                        📅 ${formatDate(item.dateLost || item.dateFound)}
                    </div>
                </div>
                
                <div style="margin:20px 0;padding:15px;background:#f8fafc;border-radius:8px;">
                    <h3>Contact Information</h3>
                    <p><strong>Posted by:</strong> ${item.postedBy.name}</p>
                    <p><strong>Email:</strong> ${item.contactEmail}</p>
                    ${item.contactPhone ? `<p><strong>Phone:</strong> ${item.contactPhone}</p>` : ''}
                </div>
                
                <div style="display:flex;gap:10px;margin-top:20px;">
                    <a href="mailto:${item.contactEmail}" class="btn btn-primary">Contact via Email</a>
                    <button onclick="closeModal()" class="btn btn-secondary">Close</button>
                </div>
            `;

            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('View details error:', error);
        showAlert('Failed to load item details', 'error');
    }
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('itemModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Close modal with X button
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
});

/**
 * Setup filters
 */
function setupFilters() {
    const searchBox = document.getElementById('searchBox');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchBox) {
        searchBox.addEventListener('input', debounce(() => {
            applyFilters();
        }, 500));
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
}

/**
 * Apply filters and reload items
 */
function applyFilters() {
    const filters = {};

    const search = document.getElementById('searchBox')?.value;
    const category = document.getElementById('categoryFilter')?.value;
    const status = document.getElementById('statusFilter')?.value;

    if (search) filters.search = search;
    if (category) filters.category = category;
    if (status) filters.status = status;

    loadLostItems(filters);
}
