/**
 * JavaScript for the Upload page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Upload page initialized');
  
  initFileUpload();
  initUploadForm();
});

/**
 * Initialize file upload preview functionality
 */
const initFileUpload = () => {
  const fileInput = document.getElementById('picture');
  const imagePreview = document.getElementById('imagePreview');
  const previewPlaceholder = document.querySelector('.preview-placeholder');
  
  if (fileInput && imagePreview && previewPlaceholder) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      
      if (file) {
        // Check if file is an image
        if (!file.type.match('image.*')) {
          alert('Please select an image file (JPEG, PNG, GIF, etc).');
          fileInput.value = '';
          return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size exceeds 5MB. Please select a smaller file.');
          fileInput.value = '';
          return;
        }
        
        // Create a preview
        const reader = new FileReader();
        
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.classList.remove('hidden');
          previewPlaceholder.classList.add('hidden');
        };
        
        reader.readAsDataURL(file);
      } else {
        // No file selected, show placeholder
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        previewPlaceholder.classList.remove('hidden');
      }
    });
  }
};

/**
 * Initialize form upload with progress tracking
 */
const initUploadForm = () => {
  const uploadForm = document.getElementById('uploadForm');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadProgress = document.getElementById('uploadProgress');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressText = document.getElementById('progressText');
  
  if (uploadForm && uploadBtn && uploadProgress && progressBarFill && progressText) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fileInput = document.getElementById('picture');
      if (!fileInput.files.length) {
        alert('Please select an image file to upload.');
        return;
      }
      
      // Prepare form data
      const formData = new FormData(uploadForm);
      
      // Disable the button and show progress
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Uploading...';
      uploadProgress.classList.remove('hidden');
      
      // Use fetch API to upload with progress tracking
      fetch('/api/pictures', {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Upload failed');
          }
          return response.json();
        })        .then(data => {
          console.log('Upload successful:', data);
          
          // Redirect to the detail page for the new picture
          window.location.href = `/pictures/${data.picture.id}?success=true`;
        })
        .catch(error => {
          console.error('Error uploading picture:', error);
          
          // Re-enable the button and hide progress
          uploadBtn.disabled = false;
          uploadBtn.textContent = 'Upload Picture';
          uploadProgress.classList.add('hidden');
          
          // Show error
          alert('Error uploading picture. Please try again.');
        });
    });
    
    // We can't track progress with fetch directly, so this is a simulated progress
    // In a real application, you might use XMLHttpRequest with onprogress event
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        if (progress >= 90) {
          clearInterval(interval);
        } else {
          progress += Math.random() * 10;
          progress = Math.min(progress, 90);
          progressBarFill.style.width = `${progress}%`;
          progressText.textContent = `Uploading: ${Math.round(progress)}%`;
        }
      }, 300);
      
      return interval;
    };
  }
};
