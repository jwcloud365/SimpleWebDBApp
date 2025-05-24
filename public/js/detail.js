/**
 * JavaScript for the Picture Detail page functionality
 */

// IMMEDIATE DEBUG LOG - This should show up immediately when the script loads
console.log('🚨 DETAIL.JS SCRIPT LOADING - This message should appear immediately!');
console.log('🚨 Current timestamp:', new Date().toISOString());
console.log('🚨 Page location:', window.location.href);

// Create a logger to help debug issues
const logger = {
  log: (message, data = null) => {
    if (data) {
      console.log(`[Picture DB][${new Date().toISOString()}] ${message}`, data);
    } else {
      console.log(`[Picture DB][${new Date().toISOString()}] ${message}`);
    }
  },
  error: (message, error = null) => {
    if (error) {
      console.error(`[Picture DB][${new Date().toISOString()}] ERROR: ${message}`, error);
    } else {
      console.error(`[Picture DB][${new Date().toISOString()}] ERROR: ${message}`);
    }
  },
  warn: (message, data = null) => {
    if (data) {
      console.warn(`[Picture DB][${new Date().toISOString()}] WARN: ${message}`, data);
    } else {
      console.warn(`[Picture DB][${new Date().toISOString()}] WARN: ${message}`);
    }
  }
};

// IMMEDIATE TEST - Try to find buttons NOW before DOM ready
console.log('🧪 IMMEDIATE BUTTON TEST:');
console.log('🧪 Delete button (immediate):', document.getElementById('deleteBtn'));
console.log('🧪 Edit button (immediate):', document.getElementById('editBtn'));
console.log('🧪 DOM ready state:', document.readyState);

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM fully loaded and parsed - detail.js is executing!');
  logger.log('Detail page initialized');
  
  // Test if buttons exist immediately
  const testDeleteBtn = document.getElementById('deleteBtn');
  const testEditBtn = document.getElementById('editBtn');
  console.log('🔍 Button test during DOM ready:', {
    deleteBtn: testDeleteBtn,
    editBtn: testEditBtn,
    deleteDataId: testDeleteBtn ? testDeleteBtn.dataset.id : 'N/A'
  });
  
  // Log all elements with IDs for debugging
  console.log('All elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => ({
    id: el.id,
    tagName: el.tagName,
    className: el.className
  })));
  
  // Initialize functionality with error handling
  try {
    initEditFunctionality();
    console.log('✅ Edit functionality initialized');
  } catch (e) {
    console.error('❌ Error initializing edit functionality:', e);
  }
  
  try {
    initDeleteFunctionality();
    console.log('✅ Delete functionality initialized');
  } catch (e) {
    console.error('❌ Error initializing delete functionality:', e);
  }
  
  try {
    handleDetailPageImages();
    checkAndFixEditForm();
  } catch (e) {
    console.error('Error initializing other functionality:', e);
  }
});

/**
 * Handle image errors for the detail page
 */
const handleDetailPageImages = () => {
  // Get the main detail image
  const detailImage = document.querySelector('.detail-image');
  if (detailImage) {
    detailImage.addEventListener('error', function() {
      logger.warn(`Failed to load detail image: ${this.src}`);
      this.src = '/images/no-image.svg';
    });
  }

  // Handle thumbnail images
  const thumbnailImages = document.querySelectorAll('.thumbnail-image');
  thumbnailImages.forEach(img => {
    img.addEventListener('error', function() {
      logger.warn(`Failed to load thumbnail image: ${this.src}`);

      // Try to get the original image if this is a thumbnail
      if (this.src.includes('thumb-')) {
        const originalSrc = this.src.replace('thumb-', '');
        logger.log(`Attempting to load original image: ${originalSrc}`);
        this.src = originalSrc;
      } else {
        // Fall back to placeholder
        this.src = '/images/no-image.svg';
      }
    });
  });
};

/**
 * Initialize the edit functionality
 */
const initEditFunctionality = () => {
  console.log('Initializing edit functionality...');
  
  // Log all elements with IDs to help with debugging
  console.log('All elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => ({
    id: el.id,
    tagName: el.tagName,
    className: el.className
  })));
  
  const editBtn = document.getElementById('editBtn');
  const descriptionDisplay = document.getElementById('descriptionDisplay');
  const editForm = document.getElementById('editForm');
  const updateForm = document.getElementById('updateForm');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const editDescription = document.getElementById('editDescription');

  // Log the elements we found
  console.log('Edit elements:', {
    editBtn: {
      exists: !!editBtn,
      id: editBtn ? editBtn.id : null,
      className: editBtn ? editBtn.className : null,
      html: editBtn ? editBtn.outerHTML : null
    },
    descriptionDisplay: {
      exists: !!descriptionDisplay,
      id: descriptionDisplay ? descriptionDisplay.id : null,
      className: descriptionDisplay ? descriptionDisplay.className : null
    },
    editForm: {
      exists: !!editForm,
      id: editForm ? editForm.id : null,
      className: editForm ? editForm.className : null,
      hidden: editForm ? editForm.classList.contains('hidden') : null
    },
    updateForm: {
      exists: !!updateForm,
      id: updateForm ? updateForm.id : null
    },
    cancelEditBtn: {
      exists: !!cancelEditBtn,
      id: cancelEditBtn ? cancelEditBtn.id : null
    },
    editDescription: {
      exists: !!editDescription,
      id: editDescription ? editDescription.id : null
    }
  });

  if (!editBtn) console.error('Edit button not found!');
  if (!descriptionDisplay) console.error('Description display not found!');
  if (!editForm) console.error('Edit form not found!');
  if (!updateForm) console.error('Update form not found!');
  if (!cancelEditBtn) console.error('Cancel button not found!');
  if (!editDescription) console.error('Edit description textarea not found!');

  if (!editBtn || !descriptionDisplay || !editForm || !updateForm || !cancelEditBtn || !editDescription) {
    logger.error('Missing required elements for edit functionality');
    return;
  }
  
  // Add a direct click handler to the edit button for testing
  editBtn.onclick = function(e) {
    console.log('Direct click handler triggered on edit button', e);
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle visibility
    if (descriptionDisplay) descriptionDisplay.classList.toggle('hidden');
    if (editForm) editForm.classList.toggle('hidden');
    
    console.log('After toggle:', {
      descriptionDisplayHidden: descriptionDisplay ? descriptionDisplay.classList.contains('hidden') : 'N/A',
      editFormHidden: editForm ? editForm.classList.contains('hidden') : 'N/A',
      editFormDisplay: editForm ? window.getComputedStyle(editForm).display : 'N/A'
    });
  };
  
  console.log('Direct click handler added to edit button');

  logger.log('Edit functionality elements found', {
    editBtnExists: !!editBtn,
    descriptionDisplayExists: !!descriptionDisplay,
    editFormExists: !!editForm,
    updateFormExists: !!updateForm,
    cancelEditBtnExists: !!cancelEditBtn
  });

  // Show edit form
  const handleShowEditForm = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Edit button clicked, showing edit form');
    logger.log('Edit button clicked, showing edit form');
    
    // Make sure the form is visible by removing any hidden classes
    if (descriptionDisplay) {
      descriptionDisplay.classList.add('hidden');
      console.log('Hid description display');
    } else {
      console.error('Description display element not found when trying to hide it');
    }
    
    if (editForm) {
      editForm.classList.remove('hidden');
      // Set display property explicitly to ensure visibility
      editForm.style.display = 'block';
      console.log('Showed edit form');
    } else {
      console.error('Edit form element not found when trying to show it');
    }
    
    // Focus the textarea for better UX
    if (editDescription) {
      editDescription.focus();
      console.log('Focused edit description field');
    } else {
      console.error('Edit description field not found when trying to focus it');
    }
    
    // Log the current state
    console.log('Edit form state:', {
      descriptionDisplay: {
        hidden: descriptionDisplay ? descriptionDisplay.classList.contains('hidden') : 'N/A',
        display: descriptionDisplay ? window.getComputedStyle(descriptionDisplay).display : 'N/A'
      },
      editForm: {
        hidden: editForm ? editForm.classList.contains('hidden') : 'N/A',
        display: editForm ? window.getComputedStyle(editForm).display : 'N/A'
      }
    });
    
    logger.log('Edit form displayed', {
      descriptionDisplayHidden: descriptionDisplay ? descriptionDisplay.classList.contains('hidden') : 'N/A',
      editFormHidden: editForm ? editForm.classList.contains('hidden') : 'N/A',
      editFormDisplay: editForm ? editForm.style.display : 'N/A'
    });
  };

  editBtn.addEventListener('click', handleShowEditForm);
  editBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logger.log('Edit button activated via keyboard');
      handleShowEditForm();
    }
  });

  // Cancel edit
  const handleCancelEdit = () => {
    logger.log('Cancel edit button clicked');
    editForm.classList.add('hidden');
    descriptionDisplay.classList.remove('hidden');
  };

  cancelEditBtn.addEventListener('click', handleCancelEdit);
  cancelEditBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logger.log('Cancel edit button activated via keyboard');
      handleCancelEdit();
    }
  });

  // Submit edit form
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    logger.log('Update form submitted');
    const editDescription = document.getElementById('editDescription');
    const pictureId = window.location.pathname.split('/').pop();
    logger.log('Updating picture description', {
      pictureId: pictureId,
      newDescription: editDescription.value
    });

    // Show loading state
    const saveBtn = updateForm.querySelector('.save-btn');
    if (saveBtn) {
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;
    }

    fetch(`/api/pictures/${pictureId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: editDescription.value
      })
    })
      .then(response => {
        if (!response.ok) {
          logger.error(`Update failed with status: ${response.status}`);
          throw new Error(`Update failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        logger.log('Update successful:', data);
        // Update the display
        const descriptionDisplay = document.getElementById('descriptionDisplay');
        const descriptionContent = descriptionDisplay.querySelector('p');
        if (descriptionContent) {
          if (data.description) {
            descriptionContent.textContent = data.description;
            descriptionContent.classList.remove('no-description');
          } else {
            descriptionContent.textContent = 'No description provided';
            descriptionContent.classList.add('no-description');
          }
        }
        // Hide edit form
        editForm.classList.add('hidden');
        descriptionDisplay.classList.remove('hidden');
        // Show success message
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success';
        successAlert.setAttribute('role', 'alert');
        successAlert.innerHTML = `
          Description updated successfully.
          <button type="button" class="alert-close" aria-label="Close" tabindex="0">×</button>
        `;
        const mainContainer = document.querySelector('main.container');
        if (mainContainer) {
          mainContainer.insertBefore(successAlert, mainContainer.firstChild);
          // Initialize alert close button
          const alertCloseButton = successAlert.querySelector('.alert-close');
          if (alertCloseButton) {
            alertCloseButton.addEventListener('click', function() {
              const alert = this.closest('.alert');
              if (alert) {
                alert.style.opacity = '0';
                setTimeout(() => {
                  alert.style.display = 'none';
                }, 300);
              }
            });
          }
        }
        // Reset button state
        if (saveBtn) {
          saveBtn.textContent = 'Save Changes';
          saveBtn.disabled = false;
        }
      })
      .catch(error => {
        logger.error('Error updating description:', error);
        // Reset button state
        if (saveBtn) {
          saveBtn.textContent = 'Save Changes';
          saveBtn.disabled = false;
        }
        // Show error message
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-error';
        errorAlert.setAttribute('role', 'alert');
        errorAlert.innerHTML = `
          Error updating description: ${error.message}
          <button type="button" class="alert-close" aria-label="Close" tabindex="0">×</button>
        `;
        const mainContainer = document.querySelector('main.container');
        if (mainContainer) {
          mainContainer.insertBefore(errorAlert, mainContainer.firstChild);
          // Initialize alert close button
          const alertCloseButton = errorAlert.querySelector('.alert-close');
          if (alertCloseButton) {
            alertCloseButton.addEventListener('click', function() {
              const alert = this.closest('.alert');
              if (alert) {
                alert.style.opacity = '0';
                setTimeout(() => {
                  alert.style.display = 'none';
                }, 300);
              }
            });
          }
        }
      });
  });
};

/**
 * Enhanced checkAndFixEditForm function to ensure edit form always displays correctly
 */
const checkAndFixEditForm = () => {
  // Wait for page to fully load
  setTimeout(() => {
    const editBtn = document.getElementById('editBtn');
    const descriptionDisplay = document.getElementById('descriptionDisplay');
    const editForm = document.getElementById('editForm');

    if (editBtn && descriptionDisplay && editForm) {
      logger.log('Checking edit form and button status during page load');

      // Ensure the edit form has the correct initial styles
      editForm.style.cssText = editForm.classList.contains('hidden') ? 
        'display: none !important;' : 'display: block !important;';
      
      // Make sure hidden class works properly
      let hiddenRuleExists = false;
      
      // Try to dynamically add a style rule to ensure .hidden works properly
      try {
        const style = document.createElement('style');
        document.head.appendChild(style);
        const sheet = style.sheet;
        sheet.insertRule('.hidden { display: none !important; }', 0);
        sheet.insertRule('.edit-form.hidden { display: none !important; }', 0);
        logger.log('Added enhanced .hidden CSS rules with !important');
      } catch (err) {
        logger.error('Failed to add CSS rule for .hidden class', err);
      }

      // Add direct click handler to edit button as backup
      editBtn.onclick = function(e) {
        e.preventDefault();
        logger.log('Edit button clicked via direct onclick handler');

        // Force the correct display state
        descriptionDisplay.style.display = 'none';
        descriptionDisplay.classList.add('hidden');

        editForm.style.display = 'block';
        editForm.classList.remove('hidden');

        // Focus the textarea
        const editDescription = document.getElementById('editDescription');
        if (editDescription) {
          editDescription.focus();
        }

        // Log the result
        logger.log('Edit form display forced via direct handler', {
          descriptionDisplayHidden: descriptionDisplay.classList.contains('hidden'),
          descriptionDisplayStyle: descriptionDisplay.style.display,
          editFormHidden: editForm.classList.contains('hidden'),
          editFormStyle: editForm.style.display
        });
      };

      logger.log('Direct onclick handler added to edit button as backup');
    } else {
      logger.error('Could not find edit form elements during initialization');
    }
  }, 500);
};

/**
 * Initialize delete functionality
 */
const initDeleteFunctionality = () => {
  console.log('🔧 Initializing delete functionality...');
  
  // Define the picture ID to delete (extracted from button data or URL)
  let pictureIdToDelete = null;
  
  const deleteBtn = document.getElementById('deleteBtn');
  const deleteModal = document.getElementById('deleteModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // Log the elements we found
  console.log('🔍 Delete elements search results:', {
    deleteBtn: {
      exists: !!deleteBtn,
      id: deleteBtn ? deleteBtn.id : null,
      className: deleteBtn ? deleteBtn.className : null,
      html: deleteBtn ? deleteBtn.outerHTML : null
    },
    deleteModal: {
      exists: !!deleteModal,
      id: deleteModal ? deleteModal.id : null,
      className: deleteModal ? deleteModal.className : null,
      hidden: deleteModal ? deleteModal.classList.contains('hidden') : null
    },
    closeModalBtn: {
      exists: !!closeModalBtn,
      id: closeModalBtn ? closeModalBtn.id : null
    },
    cancelDeleteBtn: {
      exists: !!cancelDeleteBtn,
      id: cancelDeleteBtn ? cancelDeleteBtn.id : null
    },
    confirmDeleteBtn: {
      exists: !!confirmDeleteBtn,
      id: confirmDeleteBtn ? confirmDeleteBtn.id : null
    }
  });

  if (!deleteBtn) console.error('Delete button not found!');
  if (!deleteModal) console.error('Delete modal not found!');
  if (!closeModalBtn) console.error('Close modal button not found!');
  if (!cancelDeleteBtn) console.error('Cancel delete button not found!');
  if (!confirmDeleteBtn) console.error('Confirm delete button not found!');

  if (deleteBtn && deleteModal && closeModalBtn && cancelDeleteBtn && confirmDeleteBtn) {
    logger.log('Delete functionality elements found', {
      deleteBtnExists: !!deleteBtn,
      deleteModalExists: !!deleteModal,
      closeModalBtnExists: !!closeModalBtn,
      cancelDeleteBtnExists: !!cancelDeleteBtn,
      confirmDeleteBtnExists: !!confirmDeleteBtn
    });
    
    // Add close modal functionality
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => closeModal(deleteModal));
    }
    
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModal));
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        closeModal(deleteModal);
      }
    });
    
    console.log('Delete modal event handlers added');

    // Show delete modal and capture the picture ID
    deleteBtn.addEventListener('click', (e) => {
      console.log('🎯 DELETE BUTTON CLICKED! Event triggered:', e);
      e.preventDefault();
      pictureIdToDelete = deleteBtn.dataset.id || window.location.pathname.split('/').pop();
      logger.log('Delete button clicked for picture ID:', pictureIdToDelete);
      console.log('📋 Picture ID to delete:', pictureIdToDelete);
      openModal(deleteModal);
    });

    // Keyboard support for delete button
    deleteBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        console.log('⌨️ DELETE BUTTON KEYBOARD ACTIVATED!', e.key);
        e.preventDefault();
        pictureIdToDelete = deleteBtn.dataset.id || window.location.pathname.split('/').pop();
        logger.log(`Delete button activated via keyboard for picture ID: ${pictureIdToDelete}`);
        openModal(deleteModal);
      }
    });

    // Confirm delete button
    confirmDeleteBtn.addEventListener('click', () => {
      if (pictureIdToDelete) {
        logger.log(`Confirm delete button clicked for picture ID: ${pictureIdToDelete}`);
        handleConfirmDelete(pictureIdToDelete, deleteModal);
      } else {
        logger.error('Attempted to delete but no picture ID was set');
      }
    });

    // Keyboard support for confirm delete button
    confirmDeleteBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (pictureIdToDelete) {
          logger.log(`Confirm delete button activated via keyboard for picture ID: ${pictureIdToDelete}`);
          handleConfirmDelete(pictureIdToDelete, deleteModal);
        }
      }
    });
  } else {
    logger.error('Missing required elements for delete functionality');
  }
};

/**
 * Open a modal dialog
 * @param {HTMLElement} modal - The modal element to open
 */
const openModal = (modal) => {
  logger.log(`Opening modal`);
  modal.style.display = 'flex';
  modal.classList.remove('hidden');
  // Log modal state after changes
  logger.log('Modal state after opening', {
    display: modal.style.display,
    containsHiddenClass: modal.classList.contains('hidden'),
    computedDisplay: window.getComputedStyle(modal).display
  });

  // Focus trap - find focusable elements
  const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
    logger.log(`Focused first element in modal: ${focusableElements[0].textContent || 'unnamed element'}`);
  }
};

/**
 * Close a modal dialog
 * @param {HTMLElement} modal - The modal element to close
 */
const closeModal = (modal) => {
  logger.log(`Closing modal`);
  modal.style.display = 'none';
  modal.classList.add('hidden');
  // Log modal state after changes
  logger.log('Modal state after closing', {
    display: modal.style.display,
    containsHiddenClass: modal.classList.contains('hidden'),
    computedDisplay: window.getComputedStyle(modal).display
  });
};

/**
 * Handle confirm delete button click
 */
const handleConfirmDelete = (pictureId, modal) => {
  if (!pictureId) {
    logger.error('No picture ID provided for deletion');
    return;
  }
  
  logger.log('Initiating delete for picture ID:', pictureId);
  
  // Show loading state
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const cancelBtn = document.getElementById('cancelDeleteBtn');
  
  if (confirmBtn) {
    confirmBtn.textContent = 'Deleting...';
    confirmBtn.disabled = true;
  }
  
  if (cancelBtn) {
    cancelBtn.disabled = true;
  }
  
  fetch(`/api/pictures/${pictureId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    if (!response.ok) {
      logger.error('Delete request failed with status:', response.status);
      throw new Error(`Delete failed with status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    logger.log('Delete successful:', data);
    
    // Close the modal
    closeModal(modal);
    
    // Show success message
    const successAlert = document.createElement('div');
    successAlert.className = 'alert alert-success';
    successAlert.setAttribute('role', 'alert');
    successAlert.innerHTML = `
      Picture deleted successfully. Redirecting...
      <button type="button" class="alert-close" aria-label="Close" tabindex="0">×</button>
    `;
    
    const mainContainer = document.querySelector('main.container');
    if (mainContainer) {
      mainContainer.insertBefore(successAlert, mainContainer.firstChild);
      
      // Initialize alert close button
      const closeBtn = successAlert.querySelector('.alert-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          successAlert.style.opacity = '0';
          setTimeout(() => {
            successAlert.style.display = 'none';
          }, 300);
        });
      }
    }
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  })
  .catch(error => {
    logger.error('Error deleting picture:', error);
    
    // Close the modal
    closeModal(modal);
    
    // Show error message
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger';
    errorAlert.setAttribute('role', 'alert');
    errorAlert.innerHTML = `
      Failed to delete picture. Please try again.
      <button type="button" class="alert-close" aria-label="Close" tabindex="0">×</button>
    `;
    
    const mainContainer = document.querySelector('main.container');
    if (mainContainer) {
      mainContainer.insertBefore(errorAlert, mainContainer.firstChild);
      
      // Initialize alert close button
      const closeBtn = errorAlert.querySelector('.alert-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          errorAlert.style.opacity = '0';
          setTimeout(() => {
            errorAlert.style.display = 'none';
          }, 300);
        });
      }
    }
    
    // Reset delete button state
    if (confirmBtn) {
      confirmBtn.textContent = 'Delete';
      confirmBtn.disabled = false;
    }
    
    if (cancelBtn) {
      cancelBtn.disabled = false;
    }
  });
};
