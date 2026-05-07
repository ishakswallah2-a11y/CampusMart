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
        const storageRef = storage.ref(`campus_items/${Date.now()}_${imageFile.name}`);
        const snapshot = await storageRef.put(imageFile);
        const downloadURL = await snapshot.ref.getDownloadURL();

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

// FIXED MODAL VIEW WITH WHATSAPP BRANDING
function openDetails(docId) {
    db.collection("listings").doc(docId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const modalBody = document.getElementById('modalBody');
            
            // This section now includes the WhatsApp SVG icon for uniqueness
            modalBody.innerHTML = `
                <img src="${data.imageUrl}" style="width:100%; border-radius:15px; margin-bottom:20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h2 style="color:var(--primary);">${data.name}</h2>
                <h3 style="color:var(--accent); margin:10px 0;">GHS ${data.price}</h3>
                <div style="background:#f9f9f9; padding:20px; border-radius:12px; margin-top:15px;">
                    <strong>Seller Details:</strong>
                    <p style="margin-top:8px; line-height:1.6; color:#555;">${data.description}</p>
                </div>
                
                <a href="https://wa.me/${data.phone}" target="_blank" class="wa-contact-btn">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                   </svg>
                   <span>CHAT ON WHATSAPP</span>
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
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        // Safe check for the <p> tag text content
        const pTag = this.querySelector('p');
        if (!pTag) return;
        
        const action = pTag.innerText.trim();

        switch(action) {
            case 'My Ads':
                showPage('ads-page', document.querySelector('.nav-tab:nth-child(4)'));
                break;
            case 'Wishlist':
                alert("Wishlist feature coming soon!");
                break;
            case 'Recently Viewed':
                alert("Recently viewed items will appear here soon.");
                break;
            case 'Help & Support':
                // Update with your real number so students can reach you
                window.location.href = "https://wa.me/233540000000?text=Hello%20Ishak,%20I%20need%20help%20with%20CampusMart";
                break;
            case 'Logout':
                if(confirm("Are you sure you want to logout?")) {
                    location.reload();
                }
                break;
        }
    });
});
