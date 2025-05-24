/**
 * Optimized Main JavaScript for the Simple Picture Database
 * This version has performance improvements and reliability fixes
 */

// Simple logger for debugging
const logger = {
  log: (message, data = null) => {
    if (data) {
      console.log(`[Gallery][${new Date().toISOString()}] ${message}`, data);
    } else {
      console.log(`[Gallery][${new Date().toISOString()}] ${message}`);
    }
  },
  error: (message, error = null) => {
    if (error) {
      console.error(`[Gallery][${new Date().toISOString()}] ERROR: ${message}`, error);
    } else {
      console.error(`[Gallery][${new Date().toISOString()}] ERROR: ${message}`);
    }
  },
  warn: (message, data = null) => {
    if (data) {
      console.warn(`[Gallery][${new Date().toISOString()}] WARN: ${message}`, data);
    } else {
      console.warn(`[Gallery][${new Date().toISOString()}] WARN: ${message}`);
    }
  }
};

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Main script initialized');
  
  // Initialize alert close functionality
  initAlerts();
  
  // Initialize gallery functionality with a slight delay to avoid blocking the main thread
  setTimeout(() => {
    const pictureGrid = document.getElementById('pictureGrid');
    if (pictureGrid) {
      initGallery();
    }
  }, 100);
});

/**
 * Initialize alert message functionality
 */
const initAlerts = () => {
  const alertCloseButtons = document.querySelectorAll('.alert-close');
  if (!alertCloseButtons.length) return;
  
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
 * Process gallery images in batches to avoid UI blocking
 * @param {NodeList} images - The gallery images to process
 * @param {number} startIndex - The starting index for the current batch
 * @param {number} batchSize - The number of images to process in this batch
 */
const processImageBatch = (images, startIndex, batchSize) => {
  const endIndex = Math.min(startIndex + batchSize, images.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    const img = images[i];
    if (!img.hasAttribute('data-error-handled')) {
      img.setAttribute('data-error-handled', 'true');
      img.addEventListener('error', function() {
        if (this.src.includes('thumb-')) {
          this.src = this.src.replace('thumb-', '');
        } else {
          this.src = '/images/no-image.svg';
        }
      });
    }
  }
  
  // Process next batch if there are more images
  if (endIndex < images.length) {
    setTimeout(() => {
      processImageBatch(images, endIndex, batchSize);
    }, 0);
  }
};

/**
 * Initialize gallery functionality
 */
const initGallery = () => {
  try {
    // Handle image loading errors efficiently in batches
    const galleryImages = document.querySelectorAll('.picture-thumbnail img');
    if (galleryImages.length) {
      processImageBatch(galleryImages, 0, 10); // Process 10 images at a time
    }
    
    // Gallery delete buttons
    const deleteButtons = document.querySelectorAll('.gallery .delete-btn');
    const deleteModal = document.getElementById('deleteModal');
    
    if (!deleteButtons.length || !deleteModal) {
      return;
    }
    
    let pictureIdToDelete = null;
    
    // Set up delete button click handlers
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        pictureIdToDelete = button.dataset.id;
        logger.log('Gallery delete button clicked for picture ID:', pictureIdToDelete);
        openModal(deleteModal);
      });
    });
    
    // Set up close button handler
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => closeModal(deleteModal));
    }
    
    // Set up cancel button handler
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModal));
    }
    
    // Set up confirm delete button handler
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (pictureIdToDelete) {
          deletePicture(pictureIdToDelete);
        }
      });
    }
    
    // Close modal on click outside
    window.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        closeModal(deleteModal);
      }
    });
    
  } catch (error) {
    console.error('Error initializing gallery:', error);
  }
};

/**
 * Open a modal dialog
 * @param {HTMLElement} modal - The modal element to open
 */
const openModal = (modal) => {
  if (!modal) return;
  
  modal.style.display = 'flex';
  modal.classList.remove('hidden');
  
  // Focus the first focusable element
  const focusableElement = modal.querySelector('button, [tabindex]:not([tabindex="-1"])');
  if (focusableElement) {
    focusableElement.focus();
  }
};

/**
 * Close a modal dialog
 * @param {HTMLElement} modal - The modal element to close
 */
const closeModal = (modal) => {
  if (!modal) return;
  
  modal.style.display = 'none';
  modal.classList.add('hidden');
};

/**
 * Delete a picture by ID
 * @param {string|number} id - The ID of the picture to delete
 */
const deletePicture = (id) => {
  if (!id) {
    console.error('No picture ID provided for deletion');
    return;
  }
  
  console.log('Starting delete process for picture ID:', id);
  
  // Show that we're processing
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.textContent = 'Deleting...';
    confirmDeleteBtn.disabled = true;
  }
  
  // Delete the picture via AJAX
  fetch(`/api/pictures/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to delete picture: ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      // Success! Redirect to home with deleted parameter
      window.location.href = '/?deleted=true';
    })
    .catch(error => {
      console.error('Error deleting picture:', error);
      
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
      alert('Error deleting picture. Please try again.');
    });
};
