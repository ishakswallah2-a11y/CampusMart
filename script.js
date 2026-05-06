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
            
            // DATA BACKUP: Checks 'description' or 'specs' so old items aren't blank
            const itemDetails = item.description || item.specs || "No specific details provided.";

            let emoji = "📦"; 
            if (itemCategory === "Hostel Essentials") emoji = "🛌";
            if (itemCategory === "Academic Gear") emoji = "📚";
            if (itemCategory === "Electronics") emoji = "🔌";

            const safeDesc = itemDetails.replace(/'/g, "\\'");

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="product-img">${emoji}</div> 
                <div class="card-content">
                    <div class="info-group">
                        <h3>${itemName}</h3>
                        <p class="category">${itemCategory}</p>
                    </div>
                    <p class="price">GHS ${itemPrice}</p>
                    <button onclick="openDetails('${itemName}', '${itemPrice}', '${safeDesc}', '${sellerPhone}')" class="buy-btn">View</button>
                </div>
            `;
            listingsContainer.appendChild(card);
        });
    });

// --- 2. NAVIGATION LOGIC ---
function showPage(pageId) {
    const pages = ['home-page', 'sell-page', 'categories-page'];
    pages.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
    window.scrollTo(0,0);
}

// --- 3. MODAL LOGIC ---
function openDetails(name, price, details, phone) {
    const body = document.getElementById('modalDetailsBody');
    body.innerHTML = `
        <h2 style="color:#2e7d32;">${name}</h2>
        <p style="font-weight:bold; color:#ffa000; margin: 10px 0;">GHS ${price}</p>
        <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
            <strong>Details:</strong>
            <p style="font-size:0.9rem; color:#666; margin-top:5px;">${details}</p>
        </div>
        <a href="https://wa.me/${phone}" target="_blank" class="submit-btn" style="display:block; text-align:center; text-decoration:none;">Chat on WhatsApp</a>
    `;
    document.getElementById('detailsModal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// --- 4. SELL FORM LOGIC ---
document.getElementById('postItemForm').addEventListener('submit', function(e) {
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
        alert("Listing successful!");
    });
});
