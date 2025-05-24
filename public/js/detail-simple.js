/**
 * SIMPLIFIED JavaScript for the Picture Detail page functionality
 * This is a simplified version to test if buttons work
 */

console.log('🚀 SIMPLIFIED DETAIL.JS LOADING...');

// Add visible debug info to the page
function addDebugInfo(message) {
    let debugDiv = document.getElementById('debug-info');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'debug-info';
        debugDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: yellow; padding: 10px; border: 2px solid red; z-index: 9999; max-width: 300px; font-size: 12px; font-family: monospace;';
        document.body.appendChild(debugDiv);
    }
    debugDiv.innerHTML += message + '<br>';
}

addDebugInfo('🚀 Script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM ready - Simple version');
    addDebugInfo('✅ DOM ready');
    
    // Find buttons
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    
    console.log('🔍 Buttons found:', { editBtn: !!editBtn, deleteBtn: !!deleteBtn });
    addDebugInfo(`🔍 Edit btn: ${!!editBtn}, Delete btn: ${!!deleteBtn}`);
    
    if (editBtn) {
        console.log('📌 Adding edit button listener...');
        addDebugInfo('📌 Adding edit listener...');
        editBtn.addEventListener('click', function(e) {
            console.log('🎯 EDIT BUTTON CLICKED!');
            addDebugInfo('🎯 EDIT CLICKED!');
            e.preventDefault();
            alert('Edit button works!');
        });
        console.log('✅ Edit button listener added');
        addDebugInfo('✅ Edit listener added');
    } else {
        console.error('❌ Edit button not found');
        addDebugInfo('❌ Edit button NOT FOUND');
    }
    
    if (deleteBtn) {
        console.log('📌 Adding delete button listener...');
        addDebugInfo('📌 Adding delete listener...');
        deleteBtn.addEventListener('click', function(e) {
            console.log('🎯 DELETE BUTTON CLICKED!');
            addDebugInfo('🎯 DELETE CLICKED!');
            e.preventDefault();
            alert('Delete button works!');
        });
        console.log('✅ Delete button listener added');
        addDebugInfo('✅ Delete listener added');
    } else {
        console.error('❌ Delete button not found');
        addDebugInfo('❌ Delete button NOT FOUND');
    }
    
    console.log('🏁 Simple detail.js initialization complete');
    addDebugInfo('🏁 Initialization complete');
});
