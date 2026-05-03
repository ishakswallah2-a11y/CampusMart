// --- 1. THE REAL-TIME LISTENER ---
db.collection("listings").orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
        const listingsContainer = document.getElementById('listings');
        if (!listingsContainer) return; 

        listingsContainer.innerHTML = ""; 

        snapshot.forEach((doc) => {
            const item = doc.data();
            if (!item.name) return; 

            const sellerPhone = item.phone || "";
            const itemName = item.name || "Unnamed Item";
            const itemPrice = item.price || "0";
            const itemCategory = item.category || "General";

            // LOGIC: Choose emoji based on category
            let categoryEmoji = "📦"; 
            if (itemCategory === "Hostel Essentials") categoryEmoji = "🛌";
            if (itemCategory === "Academic Gear") categoryEmoji = "📚";
            if (itemCategory === "Electronics") categoryEmoji = "🔌";

            const whatsappLink = `https://wa.me/${sellerPhone}?text=Hello, I saw your listing for ${itemName} on CampusMart!`;

            const newCard = document.createElement('div');
            newCard.className = 'card';
            newCard.innerHTML = `
                <div class="badge">New</div>
                <div class="product-img">${categoryEmoji}</div> 
                <div class="card-content">
                    <div class="info-group">
                        <h3>${itemName}</h3>
                        <p class="category">${itemCategory}</p>
                    </div>
                    <p class="price">GHS ${itemPrice}</p>
                    <a href="${whatsappLink}" target="_blank" class="buy-btn">
                        Chat
                    </a>
                </div>
            `;
            listingsContainer.appendChild(newCard);
        });
    }, (error) => {
        console.error("Listener Error: ", error);
    });

// --- 2. GLOBAL UI FUNCTIONS ---
window.showSuccess = function(message = "Your request has been processed!") {
    const modal = document.getElementById('successModal');
    if (modal) {
        const p = modal.querySelector('p');
        if(p) p.innerText = message;
        modal.style.display = 'flex';
    }
};

window.closeModal = function() {
    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'none';
};

window.closeWelcome = function() {
    const welcomeModal = document.getElementById('welcomeModal');
    if(welcomeModal) {
        welcomeModal.style.opacity = '0';
        setTimeout(() => {
            welcomeModal.style.display = 'none';
        }, 300);
    }
};

// --- 3. HANDLE THE "SELL ITEM" FORM ---
const postForm = document.getElementById('postItemForm');
if (postForm) {
    postForm.addEventListener('submit', function(e) {
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

        db.collection("listings").add({
            name: itemName,
            price: itemPrice,
            category: itemCategory,
            phone: sellerPhone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp() 
        })
        .then(() => {
            this.reset();
            submitBtn.disabled = false;
            submitBtn.innerText = "List Item Now";
            window.showSuccess("Listing Live! Your item is now saved in the UENR Cloud!");
        })
        .catch((error) => {
            console.error("Firebase Error: ", error);
            submitBtn.disabled = false;
            submitBtn.innerText = "List Item Now";
            alert("Error uploading. Check your internet connection.");
        });
    });
}
