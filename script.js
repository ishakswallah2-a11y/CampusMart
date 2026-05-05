// UI Helpers
window.showSuccess = (msg) => {
    const modal = document.getElementById('successModal');
    modal.querySelector('p').innerText = msg;
    modal.style.display = 'flex';
};
window.closeModal = () => document.getElementById('successModal').style.display = 'none';
window.closeWelcome = () => document.getElementById('welcomeModal').style.display = 'none';
window.closeAuthModal = () => document.getElementById('authModal').style.display = 'none';

// Account Button Logic
document.getElementById('accountBtn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('authModal').style.display = 'flex';
});

// Post Item Logic
document.getElementById('postItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    btn.disabled = true;
    btn.innerText = "Listing...";

    let phone = document.getElementById('sellerPhone').value.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '233' + phone.substring(1);

    db.collection("listings").add({
        name: document.getElementById('itemName').value,
        price: document.getElementById('itemPrice').value,
        category: document.getElementById('itemCategory').value,
        phone: phone,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        this.reset();
        btn.disabled = false;
        btn.innerText = "List Item Now";
        showSuccess("Item is live on Campus!");
    });
});

// Real-time Fetch
db.collection("listings").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    const container = document.getElementById('listings');
    container.innerHTML = "";
    snapshot.forEach(doc => {
        const item = doc.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="product-img">📦</div>
            <h3>${item.name}</h3>
            <p style="color:gray; font-size:0.8rem;">${item.category}</p>
            <p class="price">GHS ${item.price}</p>
            <a href="https://wa.me/${item.phone}" target="_blank" class="buy-btn">Chat with Seller</a>
        `;
        container.appendChild(card);
    });
});
