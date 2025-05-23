/**
 * JavaScript for the Picture Detail page functionality
 */
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

document.addEventListener('DOMContentLoaded', () => {
  logger.log('Detail page initialized');
  initEditFunctionality();
  initDeleteFunctionality();
  handleDetailPageImages();
  checkAndFixEditForm();
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
  const editBtn = document.getElementById('editBtn');
  const descriptionDisplay = document.getElementById('descriptionDisplay');
  const editForm = document.getElementById('editForm');
  const updateForm = document.getElementById('updateForm');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  if (!editBtn || !descriptionDisplay || !editForm || !updateForm || !cancelEditBtn) {
    logger.error('Missing required elements for edit functionality');
    return;
  }

  logger.log('Edit functionality elements found', {
    editBtnExists: !!editBtn,
    descriptionDisplayExists: !!descriptionDisplay,
    editFormExists: !!editForm,
    updateFormExists: !!updateForm,
    cancelEditBtnExists: !!cancelEditBtn
  });

  // Show edit form
  const handleShowEditForm = () => {
    logger.log('Edit button clicked, showing edit form');
    // Make sure the form is visible by removing any hidden classes
    descriptionDisplay.classList.add('hidden');
    editForm.classList.remove('hidden');
    
    // Set display property explicitly to ensure visibility
    editForm.style.display = 'block';
    
    // Focus the textarea for better UX
    const editDescription = document.getElementById('editDescription');
    if (editDescription) {
      editDescription.focus();
    }
    logger.log('Edit form displayed', {
      descriptionDisplayHidden: descriptionDisplay.classList.contains('hidden'),
      editFormHidden: editForm.classList.contains('hidden'),
      editFormDisplay: editForm.style.display
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
  const deleteBtn = document.getElementById('deleteBtn');
  const deleteModal = document.getElementById('deleteModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  if (deleteBtn && deleteModal && closeModalBtn && cancelDeleteBtn && confirmDeleteBtn) {
    logger.log('Delete functionality elements found', {
      deleteBtnExists: !!deleteBtn,
      deleteModalExists: !!deleteModal,
      closeModalBtnExists: !!closeModalBtn,
      cancelDeleteBtnExists: !!cancelDeleteBtn,
      confirmDeleteBtnExists: !!confirmDeleteBtn
    });

    // Show delete modal
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(deleteModal);
    });

    // Close modal using close button
    closeModalBtn.addEventListener('click', () => {
      closeModal(deleteModal);
    });

    // Cancel delete
    cancelDeleteBtn.addEventListener('click', () => {
      closeModal(deleteModal);
    });

    // Confirm delete
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

    // Close modal on click outside
    window.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        closeModal(deleteModal);
      }
    });

    // Keyboard navigation
    deleteBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(deleteModal);
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
const handleConfirmDelete = () => {
  const pictureId = window.location.pathname.split('/').pop();
  logger.log(`Confirming deletion of picture ${pictureId}`);
  
  // Show that we're processing
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.textContent = 'Deleting...';
    confirmDeleteBtn.disabled = true;
    logger.log('Delete button set to loading state');
  }

  fetch(`/api/pictures/${pictureId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        logger.error(`Delete failed with status: ${response.status}`);
        throw new Error(`Failed to delete picture: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      logger.log('Delete successful:', data);
      // Redirect to gallery with deleted=true parameter
      window.location.href = '/?deleted=true';
    })
    .catch(error => {
      logger.error('Error deleting picture:', error);
      // Reset button state
      if (confirmDeleteBtn) {
        confirmDeleteBtn.textContent = 'Delete';
        confirmDeleteBtn.disabled = false;
      }
      // Close the modal
      const deleteModal = document.getElementById('deleteModal');
      if (deleteModal) {
        closeModal(deleteModal);
      }
      // Show error message
      const errorAlert = document.createElement('div');
      errorAlert.className = 'alert alert-error';
      errorAlert.setAttribute('role', 'alert');
      errorAlert.innerHTML = `
        Error deleting picture: ${error.message}
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
};
