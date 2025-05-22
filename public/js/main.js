/**
 * Main JavaScript file for the Simple Picture Database
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Simple Picture Database initialized');
  
  // Initialize alert close functionality
  initAlerts();
  
  // Initialize gallery functionality if on the gallery page
  const pictureGrid = document.getElementById('pictureGrid');
  if (pictureGrid) {
    initGallery();
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
  const alert = this.closest('.alert');
  if (alert) {
    alert.style.opacity = '0';
    setTimeout(() => {
      alert.style.display = 'none';
    }, 300);
  }
};

/**
 * Initialize gallery functionality
 */
const initGallery = () => {
  // Gallery delete buttons
  const deleteButtons = document.querySelectorAll('.gallery .delete-btn');
  const deleteModal = document.getElementById('deleteModal');
  
  if (deleteButtons.length && deleteModal) {
    let pictureIdToDelete = null;
    
    // Delete button click
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        pictureIdToDelete = button.dataset.id;
        openModal(deleteModal);
      });
      
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pictureIdToDelete = button.dataset.id;
          openModal(deleteModal);
        }
      });
    });
    
    // Modal close button
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => closeModal(deleteModal));
      closeModalBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeModal(deleteModal);
        }
      });
    }
    
    // Cancel delete button
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModal));
      cancelDeleteBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeModal(deleteModal);
        }
      });
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (pictureIdToDelete) {
          deletePicture(pictureIdToDelete);
        }
      });
      confirmDeleteBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (pictureIdToDelete) {
            deletePicture(pictureIdToDelete);
          }
        }
      });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        closeModal(deleteModal);
      }
    });
    
    // Close modal with Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && deleteModal.style.display === 'flex') {
        closeModal(deleteModal);
      }
    });
  }
};

/**
 * Open a modal dialog
 * @param {HTMLElement} modal - The modal element to open
 */
const openModal = (modal) => {
  modal.style.display = 'flex';
  // Focus the first focusable element
  const focusableElements = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
  if (focusableElements.length) {
    focusableElements[0].focus();
  }
};

/**
 * Close a modal dialog
 * @param {HTMLElement} modal - The modal element to close
 */
const closeModal = (modal) => {
  modal.style.display = 'none';
};

/**
 * Delete a picture via AJAX
 * @param {string} id - The ID of the picture to delete
 */
const deletePicture = (id) => {
  fetch(`/api/pictures/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete picture');
      }
      return response.json();
    })
    .then(data => {
      console.log('Delete successful:', data);
      // Remove the picture card from the DOM
      const pictureCard = document.querySelector(`.picture-card[data-id="${id}"]`);
      if (pictureCard) {
        pictureCard.style.opacity = '0';
        pictureCard.style.transform = 'scale(0.9)';
        setTimeout(() => {
          pictureCard.remove();
          
          // Check if grid is empty and show empty state if needed
          const pictureGrid = document.getElementById('pictureGrid');
          if (pictureGrid && pictureGrid.children.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
              <p>No pictures yet. Start by uploading one!</p>
              <a href="/upload" class="btn btn-primary" aria-label="Upload new picture" tabindex="0">Upload Picture</a>
            `;
            pictureGrid.replaceWith(emptyState);
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
      console.error('Error deleting picture:', error);
      alert('Error deleting picture. Please try again.');
      
      // Close the modal
      const deleteModal = document.getElementById('deleteModal');
      if (deleteModal) {
        closeModal(deleteModal);
      }
    });
};
