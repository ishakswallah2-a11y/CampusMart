// PAGE NAVIGATION
function showPage(pageId, el) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    el.classList.add('active');
    window.scrollTo(0,0);
}

// IMAGE PREVIEW BEFORE UPLOAD
document.getElementById('itemImage').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const preview = document.getElementById('imagePreview');
            preview.src = reader.result;
            preview.style.display = "block";
            document.getElementById('upload-text').style.display = "none";
            document.querySelector('.upload-container span').style.display = "none";
        };
        reader.readAsDataURL(file);
    }
};

// FETCH LISTINGS (AliExpress Grid)
db.collection("listings").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
    const listingsDiv = document.getElementById('listings');
    listingsDiv.innerHTML = "";
    snapshot.forEach((doc) => {
        const item = doc.data();
        const id = doc.id;
        listingsDiv.innerHTML += `
            <div class="card" onclick="openDetails('${id}')">
                <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" class="card-img">
                <div class="card-content">
                    <p style="font-size:0.9rem; color:#444; height:38px; overflow:hidden;">${item.name}</p>
                    <div class="card-price">GHS ${item.price}</div>
                </div>
            </div>
        `;
    });
});

// SUBMIT WITH IMAGE UPLOAD
document.getElementById('postItemForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const imageFile = document.getElementById('itemImage').files[0];
    
    if (!imageFile) return alert("Please select a photo of your item!");

    btn.innerText = "⏳ Uploading to Campus...";
    btn.disabled = true;

    try {
        // 1. Upload to Firebase Storage
        const storageRef = storage.ref(`campus_items/${Date.now()}_${imageFile.name}`);
        const snapshot = await storageRef.put(imageFile);
        const downloadURL = await snapshot.ref.getDownloadURL();

        // 2. Save Data to Firestore
        await db.collection("listings").add({
            name: document.getElementById('itemName').value,
            price: document.getElementById('itemPrice').value,
            description: document.getElementById('itemDescription').value,
            phone: document.getElementById('sellerPhone').value,
            imageUrl: downloadURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Post successful! It's now live at UENR.");
        location.reload(); 
    } catch (err) {
        console.error(err);
        alert("Upload failed. Check your Firebase Storage rules.");
        btn.disabled = false;
        btn.innerText = "POST LISTING";
    }
};

// FIXED MODAL VIEW
function openDetails(docId) {
    db.collection("listings").doc(docId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <img src="${data.imageUrl}" style="width:100%; border-radius:15px; margin-bottom:20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h2 style="color:var(--primary);">${data.name}</h2>
                <h3 style="color:var(--accent); margin:10px 0;">GHS ${data.price}</h3>
                <div style="background:#f9f9f9; padding:20px; border-radius:12px; margin-top:15px;">
                    <strong>Seller Details:</strong>
                    <p style="margin-top:8px; line-height:1.6; color:#555;">${data.description}</p>
                </div>
                <a href="https://wa.me/${data.phone}" target="_blank" 
                   style="display:block; background:#25d366; color:white; text-align:center; padding:18px; border-radius:15px; margin-top:25px; text-decoration:none; font-weight:bold; font-size:1.1rem;">
                   CHAT WITH SELLER
                </a>
            `;
            document.getElementById('viewModal').style.display = "flex";
        }
    });
}

function closeModal() {
    document.getElementById('viewModal').style.display = "none";
}
// --- ACCOUNT PAGE LOGIC ---

// Selecting all menu items in the account page
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        const action = this.querySelector('p').innerText;

        switch(action) {
            case 'My Ads':
                showPage('ads-page', document.querySelector('.nav-tab:nth-child(4)'));
                break;
            case 'Wishlist':
                alert("Wishlist feature coming soon! You'll be able to save your favorite campus deals here.");
                break;
            case 'Recently Viewed':
                alert("History feature coming soon!");
                break;
            case 'Help & Support':
                // Opens WhatsApp directly to you for support
                window.location.href = "https://wa.me/233540000000?text=I%20need%20help%20with%20CampusMart";
                break;
            case 'Logout':
                if(confirm("Are you sure you want to logout?")) {
                    location.reload(); // Simple reset for now
                }
                break;
        }
    });
});
