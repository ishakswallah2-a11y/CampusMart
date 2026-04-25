// Function to show the success message with custom text
function showSuccess(message = "Your request has been processed!") {
    const modal = document.getElementById('successModal');
    // Optional: If you want to change the text inside the modal dynamically
    const p = modal.querySelector('p');
    if(p) p.innerText = message;
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Attach to "Chat with Seller" buttons
document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showSuccess("Redirecting you to the seller... (In a real app, this would open WhatsApp)");
    });
});

// Handle the "Sell Item" Form
document.getElementById('postItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('itemName').value;
    const itemPrice = document.getElementById('itemPrice').value;
    const sellerPhone = document.getElementById('sellerPhone').value;

    console.log(`New Listing: ${itemName} for ${itemPrice} GHS. Seller: ${sellerPhone}`);
    
    this.reset(); 
    showSuccess("Listing Live! Your item is now live for all UENR students to see. Check your whatsapp for buyers!"); 
});