// --- 1. THE REAL-TIME LISTENER (The "Sync" Fix) ---
db.collection("listings").orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
        const listingsContainer = document.getElementById('listings');
        
        // SAFETY CHECK: If the HTML element doesn't exist, stop here
        if (!listingsContainer) return; 

        listingsContainer.innerHTML = ""; 

        snapshot.forEach((doc) => {
            const item = doc.data();
            
            // If the item is still being created in the cloud, skip it for a split second
            if (!item.name) return; 

            const sellerPhone = item.phone || "";
            const itemName = item.name || "Unnamed Item";
            const itemPrice = item.price || "0";
            const itemCategory = item.category || "General";

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
    if (modal) {
        const p = modal.querySelector('p');
        if(p) p.innerText = message;
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'none';
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
            showSuccess("Listing Live! Your item is now saved in the UENR Cloud!");
        })
        .catch((error) => {
            console.error("Firebase Error: ", error);
            submitBtn.disabled = false;
            submitBtn.innerText = "List Item Now";
            alert("Check your Firebase Rules! Set them to 'allow read, write: if true;'");
        });
    });
}
