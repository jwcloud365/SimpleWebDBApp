// Minimal Detail Page JavaScript - Button Functionality Only
console.log('[DETAIL] Clean JS Loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DETAIL] DOM Content Loaded');

    // Get buttons
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    console.log('[DETAIL] Edit button found:', !!editBtn);
    console.log('[DETAIL] Delete button found:', !!deleteBtn);

    if (editBtn) {
        editBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[DETAIL] Edit button clicked!');
            alert('Edit button works! (This would open edit form)');
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[DETAIL] Delete button clicked!');
            const pictureId = this.dataset.id || window.location.pathname.split('/').pop();
            console.log('[DETAIL] Picture ID:', pictureId);

            if (confirm('Are you sure you want to delete this picture?')) {
                console.log('[DETAIL] Starting delete operation...');

                fetch('/api/pictures/' + pictureId, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    console.log('[DETAIL] Delete successful:', data);
                    alert('Picture deleted successfully!');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                })
                .catch(error => {
                    console.error('[DETAIL] Delete failed:', error);
                    alert('Error deleting picture: ' + error.message);
                });
            }
        });
    }

    console.log('[DETAIL] Event listeners attached');
});
