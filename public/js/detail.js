/**
 * JavaScript for the Picture Detail page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Detail page initialized');
  
  initEditFunctionality();
  initDeleteFunctionality();
});

/**
 * Initialize edit functionality for picture description
 */
const initEditFunctionality = () => {
  const editBtn = document.getElementById('editBtn');
  const descriptionDisplay = document.getElementById('descriptionDisplay');
  const editForm = document.getElementById('editForm');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const updateForm = document.getElementById('updateForm');
  
  if (editBtn && descriptionDisplay && editForm && cancelEditBtn && updateForm) {
    // Show edit form
    const handleShowEditForm = () => {
      descriptionDisplay.classList.add('hidden');
      editForm.classList.remove('hidden');
    };
    
    editBtn.addEventListener('click', handleShowEditForm);
    editBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleShowEditForm();
      }
    });
    
    // Cancel edit
    const handleCancelEdit = () => {
      editForm.classList.add('hidden');
      descriptionDisplay.classList.remove('hidden');
    };
    
    cancelEditBtn.addEventListener('click', handleCancelEdit);
    cancelEditBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCancelEdit();
      }
    });
    
    // Submit edit form
    updateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const editDescription = document.getElementById('editDescription');
      const pictureId = window.location.pathname.split('/').pop();
      
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
            throw new Error('Update failed');
          }
          return response.json();
        })
        .then(data => {
          console.log('Update successful:', data);
          
          // Update the display
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
        })
        .catch(error => {
          console.error('Error updating description:', error);
          alert('Error updating description. Please try again.');
        });
    });
  }
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
    // Open delete modal
    const handleOpenModal = () => {
      openModal(deleteModal);
    };
    
    deleteBtn.addEventListener('click', handleOpenModal);
    deleteBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpenModal();
      }
    });
    
    // Close modal button
    closeModalBtn.addEventListener('click', () => closeModal(deleteModal));
    closeModalBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeModal(deleteModal);
      }
    });
    
    // Cancel delete button
    cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModal));
    cancelDeleteBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeModal(deleteModal);
      }
    });
    
    // Confirm delete button
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    confirmDeleteBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleConfirmDelete();
      }
    });
    
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
 * Handle confirm delete button click
 */
const handleConfirmDelete = () => {
  const pictureId = window.location.pathname.split('/').pop();
  
  fetch(`/api/pictures/${pictureId}`, {
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
      
      // Redirect to gallery
      window.location.href = '/?deleted=true';
    })
    .catch(error => {
      console.error('Error deleting picture:', error);
      
      // Close the modal
      const deleteModal = document.getElementById('deleteModal');
      if (deleteModal) {
        closeModal(deleteModal);
      }
      
      // Show error
      alert('Error deleting picture. Please try again.');
    });
};
