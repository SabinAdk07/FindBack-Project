/**
 * Found Items JavaScript
 * Handles found items form submission and display
 */

document.addEventListener('DOMContentLoaded', () => {
    // Setup file upload preview
    setupFileUpload();

    // Setup form submission
    const form = document.getElementById('foundItemForm');
    if (form) {
        form.addEventListener('submit', handleFoundItemSubmit);
    }

    // Load found items
    loadFoundItems();

    // Setup filters
    setupFoundFilters();
});

/**
 * Handle found item form submission
 */
async function handleFoundItemSubmit(e) {
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
        formData.append('dateFound', document.getElementById('dateFound').value);
        formData.append('location', document.getElementById('location').value);
        formData.append('contactPhone', document.getElementById('contactPhone').value);

        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/found-items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Found item reported successfully!', 'success');
            document.getElementById('foundItemForm').reset();
            document.getElementById('fileName').textContent = 'Choose an image (optional)';
            document.getElementById('imagePreview').innerHTML = '';

            // Reload items list
            setTimeout(() => {
                loadFoundItems();
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
 * Load and display found items with potential matches
 */
async function loadFoundItems(filters = {}) {
    const itemsList = document.getElementById('foundItemsList');

    try {
        itemsList.innerHTML = '<div class="loading">Loading items...</div>';

        // Build query string - add includeMatches parameter
        const params = new URLSearchParams({...filters, includeMatches: 'true'});
        const response = await fetch(`${API_URL}/found-items?${params}`);
        const data = await response.json();

        if (response.ok && data.success) {
            if (data.data.length === 0) {
                itemsList.innerHTML = '<p class="loading">No found items posted yet.</p>';
                return;
            }

            itemsList.innerHTML = data.data.map(item => createFoundItemCardWithMatches(item)).join('');
        } else {
            itemsList.innerHTML = '<p class="loading">Failed to load items.</p>';
        }
    } catch (error) {
        console.error('Load items error:', error);
        itemsList.innerHTML = '<p class="loading">Error loading items.</p>';
    }
}

/**
 * Create found item card HTML
 */
function createFoundItemCard(item) {
    const imageUrl = item.image ? `http://localhost:5000${item.image}` : null;
    const icon = getCategoryIcon(item.category);
    
    console.log('Found item image:', item.image, 'Full URL:', imageUrl); // Debug log

    return `
        <div class="item-card" onclick="viewItemDetails('${item._id}', 'found')">
            <div class="item-image">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${item.itemName}" 
                         onerror="console.error('Image load failed:', this.src); this.style.display='none'; this.parentElement.innerHTML='<div class=\\"item-icon-placeholder\\">${icon}</div>';" 
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
                    <span>📅 ${formatDate(item.dateFound)}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create found item card with potential matches
 */
function createFoundItemCardWithMatches(item) {
    const imageUrl = item.image ? `http://localhost:5000${item.image}` : null;
    const icon = getCategoryIcon(item.category);
    const hasMatches = item.potentialMatches && item.potentialMatches.length > 0;
    
    let matchesHTML = '';
    if (hasMatches) {
        const topMatch = item.potentialMatches[0];
        matchesHTML = `
            <div class="match-alert">
                <span class="match-badge">🎯 ${topMatch.similarityScore}% Match Found!</span>
                <div class="matched-item">
                    <strong>${topMatch.lostItem.itemName}</strong>
                    <small>Lost on ${formatDate(topMatch.lostItem.dateLost)} at ${topMatch.lostItem.location}</small>
                </div>
            </div>
        `;
    }

    return `
        <div class="item-card ${hasMatches ? 'has-match' : ''}" onclick="viewItemDetails('${item._id}', 'found')">
            ${hasMatches ? '<div class="match-indicator">✓ Match</div>' : ''}
            <div class="item-image">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${item.itemName}" 
                         onerror="console.error('Image load failed:', this.src); this.style.display='none'; this.parentElement.innerHTML='<div class=\\"item-icon-placeholder\\">${icon}</div>';" 
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
                ${matchesHTML}
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    <span>📍 ${item.location}</span>
                    <span>📅 ${formatDate(item.dateFound)}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Setup filters for found items
 */
function setupFoundFilters() {
    const searchBox = document.getElementById('searchBox');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchBox) {
        searchBox.addEventListener('input', debounce(() => {
            applyFoundFilters();
        }, 500));
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFoundFilters);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', applyFoundFilters);
    }
}

/**
 * Apply filters and reload found items
 */
function applyFoundFilters() {
    const filters = {};

    const search = document.getElementById('searchBox')?.value;
    const category = document.getElementById('categoryFilter')?.value;
    const status = document.getElementById('statusFilter')?.value;

    if (search) filters.search = search;
    if (category) filters.category = category;
    if (status) filters.status = status;

    loadFoundItems(filters);
}
