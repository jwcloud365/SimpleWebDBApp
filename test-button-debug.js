/**
 * Quick test to verify the detail page button functionality
 */

const testDetailPageButtons = async () => {
  try {
    console.log('Starting detail page button test...');
    
    // Test if page loads correctly
    const response = await fetch('http://localhost:3000/pictures/48');
    const htmlText = await response.text();
    
    console.log('Page response status:', response.status);
    
    // Check if delete button exists in HTML
    const hasDeleteBtn = htmlText.includes('id="deleteBtn"');
    const hasEditBtn = htmlText.includes('id="editBtn"');
    const hasDetailJS = htmlText.includes('/js/detail.js');
    
    console.log('HTML Analysis:', {
      hasDeleteBtn,
      hasEditBtn,
      hasDetailJS,
      pageSize: htmlText.length
    });
    
    // Check if detail.js is accessible
    const jsResponse = await fetch('http://localhost:3000/js/detail.js');
    console.log('detail.js response status:', jsResponse.status);
    
    if (jsResponse.ok) {
      const jsText = await jsResponse.text();
      const hasInitDelete = jsText.includes('initDeleteFunctionality');
      const hasInitEdit = jsText.includes('initEditFunctionality');
      
      console.log('JavaScript Analysis:', {
        hasInitDelete,
        hasInitEdit,
        jsSize: jsText.length
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testDetailPageButtons();
