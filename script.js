// --- 1. REAL-TIME LISTENER ---
db.collection("listings").orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
        const listingsContainer = document.getElementById('listings');
        if (!listingsContainer) return; 

        listingsContainer.innerHTML = ""; 

        snapshot.forEach((doc) => {
            const item = doc.data();
            const sellerPhone = item.phone || "";
            const itemName = item.name || "Unnamed Item";
            const itemPrice = item.price || "0";
            const itemCategory = item.category || "General";
            const itemDescription = item.description || "No specific details provided.";

            let categoryEmoji = "📦"; 
            if (itemCategory === "Hostel Essentials") categoryEmoji = "🛌";
            if (itemCategory === "Academic Gear") categoryEmoji = "📚";
            if (itemCategory === "Electronics") categoryEmoji = "🔌";

            // Escape quotes to prevent JS errors
            const safeName = itemName.replace(/'/g, "\\'");
            const safeDesc = itemDescription.replace(/'/g, "\\'");

            const newCard = document.createElement('div');
            newCard.className = 'card';
            newCard.innerHTML = `
                <div class="product-img">${categoryEmoji}</div> 
                <div class="card-content">
                    <div class="info-group">
                        <h3>${itemName}</h3>
                        <p class="category">${itemCategory}</p>
                    </div>
                    <p class="price">GHS ${itemPrice}</p>
                    <button onclick="openDetails('${safeName}', '${itemPrice}', '${safeDesc}', '${sellerPhone}')" class="buy-btn">View</button>
                </div>
            `;
            listingsContainer.appendChild(newCard);
        });
    });

// --- 2. NAVIGATION LOGIC ---
function showPage(pageId) {
    const pages = ['home-page', 'sell-page', 'account-page', 'categories-page'];
    pages.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    document.getElementById(pageId).style.display = 'block';
    window.scrollTo(0,0);
}

// --- 3. MODAL FUNCTIONS ---
function openDetails(name, price, specs, phone) {
    const modal = document.getElementById('detailsModal');
    const body = document.getElementById('modalDetailsBody');
    
    body.innerHTML = `
        <h2 style="color:#2e7d32;">${name}</h2>
        <p style="font-weight:bold; color:#ffa000; font-size:1.2rem;">GHS ${price}</p>
        <div style="background:#f4f7f6; padding:15px; border-radius:10px; margin:15px 0;">
            <strong>Details:</strong>
            <p style="color:#555; font-size:0.9rem;">${specs}</p>
        </div>
        <a href="https://wa.me/${phone}" target="_blank" class="submit-btn" style="display:block; text-align:center; text-decoration:none; background:#2e7d32;">Chat on WhatsApp</a>
    `;
    modal.style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// --- 4. SELL FORM ---
const postForm = document.getElementById('postItemForm');
if (postForm) {
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button');
        btn.disabled = true;
        btn.innerText = "Posting...";

        let phone = document.getElementById('sellerPhone').value.replace(/\D/g, ''); 
        if (phone.startsWith('0')) phone = '233' + phone.substring(1);

        db.collection("listings").add({
            name: document.getElementById('itemName').value,
            price: document.getElementById('itemPrice').value,
            category: document.getElementById('itemCategory').value,
            description: document.getElementById('itemDescription').value,
            phone: phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp() 
        }).then(() => {
            this.reset();
            btn.disabled = false;
            btn.innerText = "List Item Now";
            showPage('home-page');
            alert("Listed Successfully!");
        });
    });
}
