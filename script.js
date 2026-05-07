// PAGE NAVIGATION & ICON LOGIC
function showPage(pageId, el) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    
    // Manage Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    el.classList.add('active');

    // AliExpress Layout: Hide global header bell if we are on Account page
    const globalHeaderBell = document.getElementById('main-noti');
    if (pageId === 'account-page') {
        globalHeaderBell.style.visibility = 'hidden';
    } else {
        globalHeaderBell.style.visibility = 'visible';
    }

    window.scrollTo(0,0);
}

// NOTIFICATION LOGIC (Skip first load)
let initialLoad = true;
db.collection("listings").onSnapshot((snapshot) => {
    if (initialLoad) {
        initialLoad = false;
        return;
    }

    let newItemsCount = 0;
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            newItemsCount++;
        }
    });

    if (newItemsCount > 0) {
        const badge = document.getElementById('noti-count');
        let currentCount = parseInt(badge.innerText) || 0;
        badge.innerText = currentCount + newItemsCount;
        badge.style.display = "flex";
    }
});

// IMAGE PREVIEW
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

// FETCH LISTINGS
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

// SUBMIT LISTING
document.getElementById('postItemForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const imageFile = document.getElementById('itemImage').files[0];
    
    if (!imageFile) return alert("Please select a photo of your item!");

    btn.innerText = "⏳ Uploading...";
    btn.disabled = true;

    try {
        const storageRef = storage.ref(`campus_items/${Date.now()}_${imageFile.name}`);
        const snap = await storageRef.put(imageFile);
        const url = await snap.ref.getDownloadURL();

        await db.collection("listings").add({
            name: document.getElementById('itemName').value,
            price: document.getElementById('itemPrice').value,
            description: document.getElementById('itemDescription').value,
            phone: document.getElementById('sellerPhone').value,
            category: document.getElementById('itemCategory').value,
            imageUrl: url,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Post successful!");
        location.reload(); 
    } catch (err) {
        alert("Upload failed.");
        btn.disabled = false;
        btn.innerText = "POST LISTING";
    }
};

// MODAL & WHATSAPP
function openDetails(docId) {
    db.collection("listings").doc(docId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('modalBody').innerHTML = `
                <img src="${data.imageUrl}" style="width:100%; border-radius:15px; margin-bottom:20px;">
                <h2 style="color:var(--primary);">${data.name}</h2>
                <h3 style="color:var(--accent); margin:10px 0;">GHS ${data.price}</h3>
                <p style="background:#f9f9f9; padding:15px; border-radius:10px;">${data.description}</p>
                <a href="https://wa.me/${data.phone}" target="_blank" class="wa-contact-btn">CHAT ON WHATSAPP</a>
            `;
            document.getElementById('viewModal').style.display = "flex";
        }
    });
}
function closeModal() { document.getElementById('viewModal').style.display = "none"; }

// CATEGORY FILTER
function filterCategory(cat, el) {
    document.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('selected-cat-name').innerText = cat;
    const res = document.getElementById('category-results');
    res.innerHTML = "Searching...";

    let q = db.collection("listings");
    if (cat !== 'All') q = q.where("category", "==", cat);

    q.orderBy("createdAt", "desc").get().then(snap => {
        res.innerHTML = "";
        snap.forEach(doc => {
            const item = doc.data();
            res.innerHTML += `
                <div class="card" onclick="openDetails('${doc.id}')">
                    <img src="${item.imageUrl}" class="card-img">
                    <div class="card-content">
                        <p style="font-size:0.8rem;">${item.name}</p>
                        <div class="card-price">GHS ${item.price}</div>
                    </div>
                </div>`;
        });
    });
}
