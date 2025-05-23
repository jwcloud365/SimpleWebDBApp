/**
 * Main JavaScript file for the Simple Picture Database
 */

// Simple console logger
const logger = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Main script initialized');
  
  try {
    // Initialize alert close functionality
    initAlerts();
    
    // Initialize gallery functionality if on the gallery page - do this with a small delay
    // to avoid blocking the main thread during page load
    setTimeout(() => {
      const pictureGrid = document.getElementById('pictureGrid');
      if (pictureGrid) {
        console.log('Initializing gallery with delay');
        initGallery();
      }
    }, 100);
  } catch (error) {
    console.error('Error initializing main script:', error);
  }
});

/**
 * Initialize alert message functionality
 */
const initAlerts = () => {
  const alertCloseButtons = document.querySelectorAll('.alert-close');
  alertCloseButtons.forEach(button => {
    button.addEventListener('click', handleAlertClose);
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAlertClose.call(button);
      }
    });
  });
};

/**
 * Handle closing an alert message
 */
const handleAlertClose = function() {
  try {
    const alert = this.closest('.alert');
    if (alert) {
      console.log('Closing alert message');
      alert.style.opacity = '0';
      setTimeout(() => {
        alert.style.display = 'none';
      }, 300);
    }
  } catch (error) {
    console.error('Error closing alert:', error);
  }
};

/**
 * Handle image loading errors
 */
const handleImageErrors = () => {
  try {
    const galleryImages = document.querySelectorAll('.picture-thumbnail img, .detail-image, .thumbnail-image');
    console.log(`Setting up error handlers for ${galleryImages.length} images`);
    
    // Process images in small batches to avoid blocking the main thread
    const processImageBatch = (startIndex, batchSize) => {
      const endIndex = Math.min(startIndex + batchSize, galleryImages.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        const img = galleryImages[i];
        // Add error handler if not already present
        if (!img.hasAttribute('data-error-handled')) {
          img.setAttribute('data-error-handled', 'true');
          
          img.addEventListener('error', function() {
            console.warn(`Failed to load image: ${this.src}`);
            
            // Try to get the original image if this is a thumbnail
            if (this.src.includes('thumb-')) {
              const originalSrc = this.src.replace('thumb-', '');
              this.src = originalSrc;
            } else {
              // Fall back to placeholder
              this.src = '/images/no-image.svg';
            }
          });
        }
      }
      
      // Process next batch if there are more images
      if (endIndex < galleryImages.length) {
        setTimeout(() => {
          processImageBatch(endIndex, batchSize);
        }, 0);
      }
    };
    
    // Start processing images in batches of 10
    processImageBatch(0, 10);
  } catch (error) {
    console.error('Error setting up image error handlers:', error);
  }
};

/**
 * Initialize gallery functionality
 */
const initGallery = () => {
  try {
    // Handle image loading errors - do this with a slight delay
    setTimeout(() => {
      handleImageErrors();
    }, 100);
    
    // Gallery delete buttons
    const deleteButtons = document.querySelectorAll('.gallery .delete-btn');
    const deleteModal = document.getElementById('deleteModal');
    
    if (deleteButtons.length && deleteModal) {
      console.log(`Found ${deleteButtons.length} delete buttons and delete modal`);
      let pictureIdToDelete = null;
      
      // Delete button click
      deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        pictureIdToDelete = button.dataset.id;
        logger.log(`Delete button clicked for picture ID: ${pictureIdToDelete}`);
        openModal(deleteModal);
      });
      
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pictureIdToDelete = button.dataset.id;
          logger.log(`Delete button activated via keyboard for picture ID: ${pictureIdToDelete}`);
          openModal(deleteModal);
        }
      });
    });
    
    // Modal close button
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        logger.log('Close modal button clicked');
        closeModal(deleteModal);
      });
      
      closeModalBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          logger.log('Close modal button activated via keyboard');
          closeModal(deleteModal);
        }
      });
    }
    
    // Cancel delete button
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', () => {
        logger.log('Cancel delete button clicked');
        closeModal(deleteModal);
      });
      
      cancelDeleteBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          logger.log('Cancel delete button activated via keyboard');
          closeModal(deleteModal);
        }
      });
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (pictureIdToDelete) {
          logger.log(`Confirm delete button clicked for picture ID: ${pictureIdToDelete}`);
          deletePicture(pictureIdToDelete);
        } else {
          logger.error('Attempted to delete but no picture ID was set');
        }
      });
      
      confirmDeleteBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (pictureIdToDelete) {
            logger.log(`Confirm delete button activated via keyboard for picture ID: ${pictureIdToDelete}`);
            deletePicture(pictureIdToDelete);
          } else {
            logger.error('Attempted to delete via keyboard but no picture ID was set');
          }
        }
      });
    }
    
    // Close modal on click outside
    window.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        logger.log('Clicked outside modal, closing');
        closeModal(deleteModal);
      }
    });
      // Close modal with Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && deleteModal.style.display === 'flex') {
        console.log('Escape key pressed, closing modal');
        closeModal(deleteModal);
      }
    });
  } else {
    // Log if components are missing on gallery pages
    if (document.querySelector('.gallery')) {
      console.warn('Gallery found but missing delete components');
    }
  }
  } catch (error) {
    console.error('Error initializing gallery:', error);
  }
};

/**
 * Open a modal dialog
 * @param {HTMLElement} modal - The modal element to open
 */
const openModal = (modal) => {
  try {
    console.log(`Opening modal`);
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    
    // Focus the first focusable element
    const focusableElements = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length) {
      focusableElements[0].focus();
    }
  } catch (error) {
    console.error('Error opening modal:', error);
  }
};

/**
 * Close a modal dialog
 * @param {HTMLElement} modal - The modal element to close
 */
const closeModal = (modal) => {
  try {
    console.log(`Closing modal`);
    modal.style.display = 'none';
    modal.classList.add('hidden');
  } catch (error) {
    console.error('Error closing modal:', error);
  }
};

/**
 * Delete a picture via AJAX
 * @param {string} id - The ID of the picture to delete
 */
const deletePicture = (id) => {
  logger.log(`Attempting to delete picture with ID: ${id}`);
  
  // Show that we're processing
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.textContent = 'Deleting...';
    confirmDeleteBtn.disabled = true;
    logger.log('Delete button set to loading state');
  }

  fetch(`/api/pictures/${id}`, {
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
      
      // Remove the picture from the DOM with a fade effect
      const pictureCard = document.querySelector(`.picture-card[data-id="${id}"]`);
      if (pictureCard) {
        logger.log(`Removing picture card from DOM for ID: ${id}`);
        pictureCard.style.opacity = '0';
        
        setTimeout(() => {
          pictureCard.remove();
          
          // Check if grid is empty and show empty state if needed
          const pictureGrid = document.getElementById('pictureGrid');
          if (pictureGrid && pictureGrid.children.length === 0) {
            logger.log('No more pictures, showing empty state');
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
              <p>No pictures yet. Start by uploading one!</p>
              <a href="/upload" class="btn btn-primary" aria-label="Upload new picture" tabindex="0">Upload Picture</a>
            `;
            
            // Create a success message above the empty state
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = `
              Picture deleted successfully!
              <button type="button" class="alert-close" aria-label="Close" tabindex="0">×</button>            `;
            
            const mainContainer = document.querySelector('main.container');
            if (mainContainer) {
              mainContainer.insertBefore(successMessage, mainContainer.firstChild);
              pictureGrid.replaceWith(emptyState);
              
              // Initialize the close button for the success message
              const closeBtn = successMessage.querySelector('.alert-close');
              if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                  successMessage.style.opacity = '0';
                  setTimeout(() => successMessage.remove(), 300);
                });
              }
            } else {
              pictureGrid.replaceWith(emptyState);
            }
          } else {
            // If we still have pictures, just show the success message
            logger.log('Pictures remain, showing success message');
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = `
              Picture deleted successfully!
              <button type="button" class="alert-close" aria-label="Close" tabindex="0">×</button>
            `;
            
            const mainContainer = document.querySelector('main.container');
            if (mainContainer) {
              mainContainer.insertBefore(successMessage, mainContainer.firstChild);
              
              // Initialize the close button for the success message
              const closeBtn = successMessage.querySelector('.alert-close');
              if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                  successMessage.style.opacity = '0';
                  setTimeout(() => successMessage.remove(), 300);
                });
              }
            }
          }
        }, 300);
      }
      
      // Close the modal
      const deleteModal = document.getElementById('deleteModal');
      if (deleteModal) {
        closeModal(deleteModal);
      }
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
