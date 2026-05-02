// --- 1. THE REAL-TIME LISTENER (The "Sync" Fix) ---
// This part runs as soon as the page loads and watches for new posts
db.collection("listings").orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
        const listingsContainer = document.getElementById('listings');
        listingsContainer.innerHTML = ""; // Clear existing cards to avoid duplicates

        snapshot.forEach((doc) => {
            const item = doc.data();
            const sellerPhone = item.phone;
            const itemName = item.name;
            const itemPrice = item.price;
            const itemCategory = item.category;

            const whatsappLink = `https://wa.me/${sellerPhone}?text=Hello, I saw your listing for ${itemName} on CampusMart!`;

            const newCard = document.createElement('div');
            newCard.className = 'card';
            newCard.innerHTML = `
                <div class="badge">New</div>
                <div class="product-img">📦</div> 
                <div class="card-content">
                    <h3>${itemName}</h3>
                    <p class="category" style="font-size: 0.8rem; color: gray;">${itemCategory}</p>
                    <p class="price">GHS ${itemPrice}</p>
                    <a href="${whatsappLink}" target="_blank" class="buy-btn" style="text-decoration: none; display: block; text-align: center;">
                        Chat with Seller
                    </a>
                </div>
            `;
            listingsContainer.appendChild(newCard);
        });
    }, (error) => {
        console.error("Listener Error: ", error);
    });

// --- 2. UI FUNCTIONS ---
function showSuccess(message = "Your request has been processed!") {
    const modal = document.getElementById('successModal');
    const p = modal.querySelector('p');
    if(p) p.innerText = message;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

function closeWelcome() {
    const welcomeModal = document.getElementById('welcomeModal');
    if(welcomeModal) {
        welcomeModal.style.opacity = '0';
        setTimeout(() => {
            welcomeModal.style.display = 'none';
        }, 300);
    }
}

// --- 3. HANDLE THE "SELL ITEM" FORM ---
document.getElementById('postItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('itemName').value;
    const itemPrice = document.getElementById('itemPrice').value;
    const itemCategory = document.getElementById('itemCategory').value;
    
    let rawPhone = document.getElementById('sellerPhone').value.replace(/\D/g, ''); 
    if (rawPhone.startsWith('0')) {
        rawPhone = '233' + rawPhone.substring(1);
    }
    const sellerPhone = rawPhone;

    const submitBtn = this.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerText = "Uploading to Cloud...";

    // Save to Firebase
    db.collection("listings").add({
        name: itemName,
        price: itemPrice,
        category: itemCategory,
        phone: sellerPhone,
        createdAt: firebase.firestore.FieldValue.serverTimestamp() 
    })
    .then(() => {
        // We don't need to manually create the card here anymore!
        // The .onSnapshot() above will see the new data and add it for us.
        this.reset();
        submitBtn.disabled = false;
        submitBtn.innerText = "List Item Now";
        showSuccess("Listing Live! Your item is now saved in the UENR Cloud!");
    })
    .catch((error) => {
        console.error("Firebase Error: ", error);
        submitBtn.disabled = false;
        submitBtn.innerText = "List Item Now";
        alert("Permission Denied: Check your Firebase Rules 'Allow read, write: if true;'");
    });
});
