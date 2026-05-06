// PAGE NAVIGATION
function showPage(pageId, element) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    element.classList.add('active');
    window.scrollTo(0,0);
}

// REAL-TIME FETCHING
db.collection("listings").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
    const list = document.getElementById('listings');
    list.innerHTML = "";
    snapshot.forEach((doc) => {
        const item = doc.data();
        const rawDesc = item.description || item.specs || "No specific details provided.";
        const safeDesc = encodeURIComponent(rawDesc); // FIX: Prevents breaking on special characters

        list.innerHTML += `
            <div class="card">
                <div class="card-img">📦</div>
                <div class="card-info">
                    <h3>${item.name}</h3>
                    <p style="font-size:0.8rem; color:#888;">${item.category}</p>
                    <div class="card-price">GHS ${item.price}</div>
                </div>
                <button class="view-btn" onclick="openDetails('${item.name}', '${item.price}', '${safeDesc}', '${item.phone}')">View</button>
            </div>
        `;
    });
});

// VIEW MODAL LOGIC
function openDetails(name, price, desc, phone) {
    const decodedDesc = decodeURIComponent(desc); // FIX: Safely handles your iPhone specs
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 style="color:var(--primary);">${name}</h2>
        <h3 style="color:var(--accent); margin:10px 0;">GHS ${price}</h3>
        <div style="background:#f4f4f4; padding:15px; border-radius:8px; margin:15px 0;">
            <strong>Product Details:</strong><br>
            <p style="margin-top:5px; font-size:0.9rem; line-height:1.4;">${decodedDesc}</p>
        </div>
        <a href="https://wa.me/${phone}" style="display:block; background:#25d366; color:white; text-align:center; padding:15px; border-radius:8px; text-decoration:none; font-weight:bold;">CHAT ON WHATSAPP</a>
    `;
    document.getElementById('detailsModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// SELL FORM SUBMISSION
document.getElementById('postItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    btn.innerText = "Posting...";
    btn.disabled = true;

    db.collection("listings").add({
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: document.getElementById('itemPrice').value,
        description: document.getElementById('itemDescription').value,
        phone: document.getElementById('sellerPhone').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Listing successful!");
        this.reset();
        btn.innerText = "POST NOW";
        btn.disabled = false;
        showPage('home-page', document.querySelector('.nav-item'));
    });
});
