// Function to show the success message
function showSuccess(message = "Your request has been processed!") {
    const modal = document.getElementById('successModal');
    const p = modal.querySelector('p');
    if(p) p.innerText = message;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Function to close the Welcome Popup
function closeWelcome() {
    const welcomeModal = document.getElementById('welcomeModal');
    welcomeModal.style.opacity = '0';
    setTimeout(() => {
        welcomeModal.style.display = 'none';
    }, 300);
}

// Handle the "Sell Item" Form
document.getElementById('postItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('itemName').value;
    const itemPrice = document.getElementById('itemPrice').value;
    const sellerPhone = document.getElementById('sellerPhone').value; // Get the number

    // 1. Create the WhatsApp Link dynamically
    // This uses the phone number typed in the form
    const whatsappLink = `https://wa.me/${sellerPhone}?text=Hello, I saw your listing for ${itemName} on CampusMart and I'm interested!`;

    // 2. Create the New Product Card
    const listingsContainer = document.getElementById('listings');
    const newCard = document.createElement('div');
    newCard.className = 'card';

    newCard.innerHTML = `
        <div class="badge">New</div>
        <div class="product-img">📦</div> 
        <div class="card-content">
            <h3>${itemName}</h3>
            <p class="price">GHS ${itemPrice}</p>
            <a href="${whatsappLink}" target="_blank" class="buy-btn" style="text-decoration: none; display: block; text-align: center;">
                Chat with Seller
            </a>
        </div>
    `;

    // 3. Add the card to the top of the list
    listingsContainer.prepend(newCard);
    
    // 4. Reset and Show Success
    this.reset();
    showSuccess("Listing Live! Your item is now live for all UENR students!");
});