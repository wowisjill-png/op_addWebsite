// ==========================================
// MODIFIED BY AI ASSISTANT - 2026/03/05
// Script version for debugging - v2.1
// ==========================================
console.log('=== SCRIPT LOADED v2.1 ===', new Date().toLocaleTimeString());
console.log('AI Assistant modification test - If you see this, the file was modified successfully');

// DOM Elements
const form = document.getElementById('websiteForm');
const updateBtn = document.getElementById('updateBtn');
const statusMessage = document.getElementById('statusMessage');
const globalStatusMessage = document.getElementById('globalStatusMessage');
const environmentElement = document.getElementById('environment');
const listResults = document.getElementById('listResults');
const refreshBtn = document.getElementById('refreshBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Storage for saved data - now supports multiple entries
let savedDataList = [];
let lastUpdateDate = null;
let statusMessageTimer = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Add event listeners
    form.addEventListener('submit', handleFormSubmit);
    refreshBtn.addEventListener('click', handleRefresh);
    
    // Tab functionality - default to list tab
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Initialize with list tab active
    switchTab('list');
    
    // Validate form in real-time
    form.addEventListener('input', validateForm);
    form.addEventListener('change', validateForm);
    
    // Event delegation for dynamically generated buttons
    listResults.addEventListener('click', handleListButtonClick);
    
    // Load saved data from localStorage if available
    loadSavedData();
    
    // Ensure validation runs immediately to set initial button state
    validateForm();

    console.log('Add Website application initialized');
}

function updateLastSuccessDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    lastUpdateDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    
    const updateDateElement = document.getElementById('updateDate');
    if (updateDateElement) {
        updateDateElement.textContent = lastUpdateDate;
    }
    
    // Save to localStorage
    localStorage.setItem('lastUpdateDate', lastUpdateDate);
}

function loadSavedData() {
    // Load saved form data - now as array
    const storedData = localStorage.getItem('websiteDataList');
    if (storedData) {
        savedDataList = JSON.parse(storedData);
        
        // Backfill certcode for existing entries that don't have one
        let updated = false;
        savedDataList.forEach(data => {
            if (!data.certcode) {
                data.certcode = generateCertcode();
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('websiteDataList', JSON.stringify(savedDataList));
        }
        
        displayListResults();
    }
}

function switchTab(tabName) {
    // Update tab buttons
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab panes
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
    });
    
    const targetPane = document.getElementById(tabName + 'Tab');
    if (targetPane) {
        targetPane.classList.add('active');
    }
    
    // If switching to list tab, refresh the data
    if (tabName === 'list') {
        displayListResults();
    }
}

function validateForm() {
    const websiteName = document.getElementById('websiteName').value.trim();
    const endpoint = document.getElementById('endpoint').value.trim();
    const walletModeRadios = document.querySelectorAll('input[name="walletMode"]');
    
    let selectedWalletMode = '';
    walletModeRadios.forEach(radio => {
        if (radio.checked) {
            selectedWalletMode = radio.value;
        }
    });

    const validationResult = getEntryValidation({
        websiteName,
        endpoint,
        walletMode: selectedWalletMode
    }, { skipDuplicateCheck: true, skipFormatCheck: true });

    updateBtn.disabled = !validationResult.isValid;
    if (validationResult.isValid) {
        updateBtn.removeAttribute('disabled');
    } else {
        updateBtn.setAttribute('disabled', '');
    }
    updateBtn.style.opacity = validationResult.isValid ? '1' : '0.6';

    console.log('Form validation:', {
        websiteName: websiteName || 'empty',
        endpoint: endpoint || 'empty', 
        walletMode: selectedWalletMode || 'not selected',
        isValid: validationResult.isValid,
        buttonDisabled: updateBtn.disabled
    });

    return validationResult.isValid;
}



function handleFormSubmit(event) {
    event.preventDefault();
    
    // Show loading state
    updateBtn.classList.add('loading');
    updateBtn.disabled = true;
    
    // Hide previous status messages
    hideStatusMessage();
    
    // Collect form data
    const formData = collectFormData();
    
    // Validate form data
    const validationResult = validateFormData(formData);
    if (!validationResult.isValid) {
        updateBtn.classList.remove('loading');
        updateBtn.disabled = false;
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
        showStatusMessage(validationResult.message || 'Update failed - Please check all required fields', 'error');
        return;
    }
    
    // Check Website Name uniqueness
    const duplicateName = savedDataList.find(
        entry => entry.websiteName.toLowerCase() === formData.websiteName.toLowerCase()
    );
    if (duplicateName) {
        updateBtn.classList.remove('loading');
        updateBtn.disabled = false;
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
        showStatusMessage(`Website Name "${formData.websiteName}" already exists. Please use a different name.`, 'error');
        return;
    }
    
    // Simulate API call
    setTimeout(() => {
        // Remove loading state
        updateBtn.classList.remove('loading');
        
        // Always succeed for better user experience
        const isSuccess = true;
        
        if (isSuccess) {
            // Update last success date
            updateLastSuccessDate();
            
            // Add new data to array instead of overwriting
            formData.id = Date.now(); // Add unique ID for editing
            formData.certcode = generateCertcode(); // Auto-generate certcode
            savedDataList.push(formData);
            localStorage.setItem('websiteDataList', JSON.stringify(savedDataList));
            
            showStatusMessage('Update successful', 'success');
            console.log('Form submitted successfully:', formData);
            console.log('Total entries:', savedDataList.length);
            
            // Clear form after successful submission
            form.reset();
            validateForm(); // Revalidate after reset
            
            // Auto switch to list tab after successful update
            setTimeout(() => {
                switchTab('list');
            }, 1500);
        } else {
            showStatusMessage('Update failed - Server error', 'error');
            console.error('Form submission failed');
        }
        
        // Re-enable button after delay
        setTimeout(() => {
            updateBtn.disabled = false;
            validateForm(); // Re-validate to ensure proper button state
        }, 1000);
        
    }, 2000); // Simulate 2-second API call
}

function generateCertcode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function collectFormData() {
    const websiteName = document.getElementById('websiteName').value.trim();
    const endpoint = document.getElementById('endpoint').value.trim();
    const walletModeRadios = document.querySelectorAll('input[name="walletMode"]:checked');
    
    // Get selected wallet mode
    const walletMode = walletModeRadios.length > 0 ? walletModeRadios[0].value : '';
    
    return {
        websiteName,
        endpoint,
        walletMode,
        updator: 'Admin User', // Default updator
        updateDate: lastUpdateDate || new Date().toLocaleString(),
        status: 'enabled' // Default status
    };
}

function validateFormData(data) {
    const validationResult = getEntryValidation(data);
    console.log('Validating form data:', data);
    console.log('Validation result:', {
        websiteName: !!data.websiteName,
        endpoint: !!data.endpoint, 
        walletMode: !!data.walletMode,
        isValid: validationResult.isValid,
        message: validationResult.message || 'Valid'
    });
    return validationResult;
}

function getEntryValidation(entry, options = {}) {
    if (!entry.websiteName || !entry.endpoint || !entry.walletMode) {
        return { isValid: false, message: 'Please fill all required fields' };
    }

    if (!options.skipFormatCheck && !isValidUrl(entry.endpoint)) {
        return { isValid: false, message: 'Invalid URL format' };
    }

    if (!options.skipDuplicateCheck) {
        const duplicate = savedDataList.some((item, idx) => {
            if (typeof options.currentIndex === 'number' && idx === options.currentIndex) {
                return false;
            }
            return item.websiteName.toLowerCase() === entry.websiteName.toLowerCase();
        });

        if (duplicate) {
            return { isValid: false, message: `Website Name "${entry.websiteName}" already exists. Please use a different name.` };
        }
    }

    return { isValid: true };
}

function isValidUrl(value) {
    try {
        new URL(value);
        return true;
    } catch (error) {
        return false;
    }
}

function showStatusMessage(message, type) {
    // Use globalStatusMessage for list operations, statusMessage for form operations
    const targetElement = globalStatusMessage || statusMessage;
    targetElement.textContent = message;
    targetElement.className = `status-message ${type}`;
    targetElement.style.display = 'block';
    
    if (statusMessageTimer) {
        clearTimeout(statusMessageTimer);
    }
    statusMessageTimer = setTimeout(() => {
        hideStatusMessage();
    }, 5000);
}

function hideStatusMessage() {
    if (statusMessageTimer) {
        clearTimeout(statusMessageTimer);
        statusMessageTimer = null;
    }
    if (statusMessage) {
        statusMessage.style.display = 'none';
        statusMessage.className = 'status-message';
    }
    if (globalStatusMessage) {
        globalStatusMessage.style.display = 'none';
        globalStatusMessage.className = 'status-message';
    }
}

// Utility function to format data for display/logging
function formatFormDataForDisplay(data) {
    return `
Website Configuration:
- Name: ${data.websiteName}
- Endpoint: ${data.endpoint}
- Wallet Mode: ${data.walletMode}
- Environment: ${data.environment}
- Updated by: ${data.updator}
- Update Date: ${data.updateDate}
    `.trim();
}

function handleRefresh() {
    displayListResults();
    showStatusMessage('Data refreshed', 'success');
}

// Event delegation handler for list buttons
function handleListButtonClick(event) {
    const target = event.target;
    
    // Find the data item container
    const dataItem = target.closest('.data-item');
    if (!dataItem) return;
    
    // Extract index from data item ID
    const index = parseInt(dataItem.id.split('-')[1]);
    if (isNaN(index)) return;
    
    // Handle different button types
    if (target.classList.contains('edit-btn')) {
        enterEditMode(index);
    } else if (target.classList.contains('update-btn-list')) {
        saveChanges(index);
    } else if (target.classList.contains('cancel-btn')) {
        exitEditMode(index);
    } else if (target.classList.contains('status-btn')) {
        toggleStatus(index);
    }
}

// Edit mode functions for list tab - now supports multiple entries
function enterEditMode(index) {
    console.log('Entering edit mode for entry:', index);
    
    // Hide display values and show inputs for specific entry
    document.getElementById(`websiteNameValue-${index}`).style.display = 'none';
    document.getElementById(`endpointValue-${index}`).style.display = 'none';
    document.getElementById(`walletModeValue-${index}`).style.display = 'none';
    
    document.getElementById(`websiteNameInput-${index}`).style.display = 'inline-block';
    document.getElementById(`endpointInput-${index}`).style.display = 'inline-block';
    document.getElementById(`walletModeSelect-${index}`).style.display = 'inline-block';
    
    // Hide edit and status buttons, show update and cancel buttons
    const dataItem = document.getElementById(`dataItem-${index}`);
    const editBtn = dataItem.querySelector('.edit-btn');
    const statusBtn = dataItem.querySelector('.status-btn');
    const updateBtn = dataItem.querySelector('.update-btn-list');
    const cancelBtn = dataItem.querySelector('.cancel-btn');
    
    editBtn.style.display = 'none';
    statusBtn.style.display = 'none';
    updateBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    updateBtn.disabled = false;
}

function exitEditMode(index) {
    console.log('Exiting edit mode for entry:', index);
    
    try {
        // Show display values and hide inputs for specific entry
        document.getElementById(`websiteNameValue-${index}`).style.display = 'inline-block';
        document.getElementById(`endpointValue-${index}`).style.display = 'inline-block';
        document.getElementById(`walletModeValue-${index}`).style.display = 'inline-block';
        
        document.getElementById(`websiteNameInput-${index}`).style.display = 'none';
        document.getElementById(`endpointInput-${index}`).style.display = 'none';
        document.getElementById(`walletModeSelect-${index}`).style.display = 'none';
        
        console.log('Updated display styles');
        
        // Show edit and status buttons, hide update and cancel buttons
        const dataItem = document.getElementById(`dataItem-${index}`);
        const editBtn = dataItem.querySelector('.edit-btn');
        const statusBtn = dataItem.querySelector('.status-btn');
        const updateBtn = dataItem.querySelector('.update-btn-list');
        const cancelBtn = dataItem.querySelector('.cancel-btn');
        
        console.log('Found buttons:', { editBtn, statusBtn, updateBtn, cancelBtn });
        
        editBtn.style.display = 'inline-block';
        statusBtn.style.display = 'inline-block';
        updateBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        
        console.log('Updated button displays');
        
        // Reset inputs to original values
        const originalData = savedDataList[index];
        document.getElementById(`websiteNameInput-${index}`).value = originalData.websiteName;
        document.getElementById(`endpointInput-${index}`).value = originalData.endpoint;
        document.getElementById(`walletModeSelect-${index}`).value = originalData.walletMode;
        
        console.log('Reset input values');
    } catch (error) {
        console.error('Error in exitEditMode:', error);
        throw error;
    }
}


function saveChanges(index) {
    console.log('saveChanges called for index:', index);
    
    // Get new values from inputs for specific entry
    const newWebsiteName = document.getElementById(`websiteNameInput-${index}`).value.trim();
    const newEndpoint = document.getElementById(`endpointInput-${index}`).value.trim();
    const newWalletMode = document.getElementById(`walletModeSelect-${index}`).value;
    
    console.log('New values:', { newWebsiteName, newEndpoint, newWalletMode });
    
    const entryValidation = getEntryValidation({
        websiteName: newWebsiteName,
        endpoint: newEndpoint,
        walletMode: newWalletMode
    }, { currentIndex: index });
    if (!entryValidation.isValid) {
        showStatusMessage(entryValidation.message, 'error');
        return;
    }
    
    // Update specific entry in the array
    savedDataList[index].websiteName = newWebsiteName;
    savedDataList[index].endpoint = newEndpoint;
    savedDataList[index].walletMode = newWalletMode;
    
    // Update timestamp
    updateLastSuccessDate();
    savedDataList[index].updateDate = lastUpdateDate;
    
    // Save to localStorage
    localStorage.setItem('websiteDataList', JSON.stringify(savedDataList));
    
    // Update display values for specific entry
    document.getElementById(`websiteNameValue-${index}`).textContent = newWebsiteName;
    document.getElementById(`endpointValue-${index}`).textContent = newEndpoint;
    document.getElementById(`walletModeValue-${index}`).textContent = newWalletMode === 'single' ? 'Single Wallet' : 'Multiple Wallets';
    
    // Update last update time in display for this entry
    const dataItem = document.getElementById(`dataItem-${index}`);
    const lastUpdateElement = dataItem.querySelectorAll('.data-value')[dataItem.querySelectorAll('.data-value').length - 1];
    lastUpdateElement.textContent = lastUpdateDate;
    
    // Exit edit mode
    console.log('About to exit edit mode');
    exitEditMode(index);
    console.log('Finished exiting edit mode');
    
    console.log('About to show success message');
    try {
        // Show success message
        showStatusMessage('Changes saved successfully', 'success');
        console.log('Successfully called showStatusMessage');
    } catch (error) {
        console.error('Error in showStatusMessage:', error);
    }
}

function toggleStatus(index) {
    console.log('Toggling status for entry:', index);
    
    // Toggle status between enabled and disabled
    const currentStatus = savedDataList[index].status || 'enabled';
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    
    // Update status in the data
    savedDataList[index].status = newStatus;
    
    // Update timestamp
    updateLastSuccessDate();
    savedDataList[index].updateDate = lastUpdateDate;
    
    // Save to localStorage
    localStorage.setItem('websiteDataList', JSON.stringify(savedDataList));
    
    // Update the specific button without refreshing entire list
    const statusBtn = document.querySelector(`#dataItem-${index} .status-btn`);
    if (statusBtn) {
        // Update button text and class (use 'enabled'/'disabled' to match CSS)
        statusBtn.textContent = newStatus === 'enabled' ? 'DISABLE' : 'ENABLE';
        statusBtn.className = `status-btn ${newStatus}`;
    }
    
    // Update the last update time display for this specific entry
    const dataItem = document.getElementById(`dataItem-${index}`);
    if (dataItem) {
        const lastUpdateElement = dataItem.querySelectorAll('.data-value')[dataItem.querySelectorAll('.data-value').length - 1];
        if (lastUpdateElement) {
            lastUpdateElement.textContent = lastUpdateDate;
        }
    }
    
    // Toggle gray background on the data item
    if (dataItem) {
        if (newStatus === 'disabled') {
            dataItem.classList.add('item-disabled');
        } else {
            dataItem.classList.remove('item-disabled');
        }
    }
    
    const statusText = newStatus === 'enabled' ? 'enabled' : 'disabled';
    showStatusMessage(`Entry ${statusText} successfully`, 'success');
}

function displayListResults() {
    if (!savedDataList || savedDataList.length === 0) {
        listResults.innerHTML = `
            <div class="no-data">
                <p>No data available</p>
                <p>Please go to Add tab to create data</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="data-list">';
    
    savedDataList.forEach((data, index) => {
        const itemStatus = data.status || 'enabled';
        html += `
            <div class="data-item${itemStatus === 'disabled' ? ' item-disabled' : ''}" id="dataItem-${index}">
                <div class="data-header">
                    <h4>${index + 1}</h4>
                </div>
                <div class="data-row">
                    <span class="data-label">Website Name:</span>
                    <span class="data-value" id="websiteNameValue-${index}">${data.websiteName}</span>
                    <input type="text" class="data-input" id="websiteNameInput-${index}" value="${data.websiteName}" style="display: none;">
                </div>
                <div class="data-row">
                    <span class="data-label">Endpoint:</span>
                    <span class="data-value endpoint" id="endpointValue-${index}">${data.endpoint}</span>
                    <input type="text" class="data-input" id="endpointInput-${index}" value="${data.endpoint}" style="display: none;">
                </div>
                <div class="data-row">
                    <span class="data-label">Wallet Mode:</span>
                    <span class="data-value wallet-mode" id="walletModeValue-${index}">${data.walletMode === 'single' ? 'Single Wallet' : 'Multiple Wallets'}</span>
                    <select class="data-select" id="walletModeSelect-${index}" style="display: none;">
                        <option value="single" ${data.walletMode === 'single' ? 'selected' : ''}>Single Wallet</option>
                        <option value="multiple" ${data.walletMode === 'multiple' ? 'selected' : ''}>Multiple Wallets</option>
                    </select>
                </div>
                <div class="data-row">
                    <span class="data-label">Certcode:</span>
                    <span class="data-value certcode" title="This field cannot be modified">${data.certcode || 'N/A'}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Updated by:</span>
                    <span class="data-value">${data.updator || 'Admin User'}</span>
                </div>
                <div class="data-row last-update-row">
                    <span class="data-label">Last Update:</span>
                    <span class="data-value">${data.updateDate}</span>
                </div>
                <div class="data-actions">
                    <button class=\"edit-btn\">Edit</button>
                    <button class=\"update-btn-list\" style=\"display: none;\">Update</button>
                    <button class=\"cancel-btn\" style=\"display: none;\">Cancel</button>
                    <button class=\"status-btn ${(data.status || 'enabled') === 'enabled' ? 'enabled' : 'disabled'}\">
                        ${(data.status || 'enabled') === 'enabled' ? 'DISABLE' : 'ENABLE'}
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    listResults.innerHTML = html;
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateFormData,
        collectFormData,
        formatFormDataForDisplay
    };
}



// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Force re-layout if needed
    const container = document.querySelector('.container');
    if (container) {
        container.style.minHeight = 'auto';
        setTimeout(() => {
            container.style.minHeight = '100vh';
        }, 0);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!updateBtn.disabled) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to clear status message
    if (event.key === 'Escape') {
        hideStatusMessage();
    }
});