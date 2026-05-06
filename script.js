// NAVIGATION LOGIC
function showPage(pageId, element) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    window.scrollTo(0,0);
}

// REAL-TIME LISTINGS FETCH
db.collection("listings").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
    const list = document.getElementById('listings');
    list.innerHTML = "";
    snapshot.forEach((doc) => {
        const item = doc.data();
        const docId = doc.id; // Get the unique ID for each item
        
        list.innerHTML += `
            <div class="card">
                <div class="card-info">
                    <h3 style="font-size: 1.1rem;">${item.name}</h3>
                    <div class="card-price">GHS ${item.price}</div>
                    <p style="font-size: 0.8rem; color: #888;">${item.category}</p>
                </div>
                <button class="view-btn" onclick="openDetails('${docId}')">View</button>
            </div>
        `;
    });
});

// THE FIXED VIEW LOGIC
function openDetails(docId) {
    db.collection("listings").doc(docId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const modalContent = document.getElementById('modalContent');
            
            modalContent.innerHTML = `
                <h2 style="color:var(--primary); margin-bottom:10px;">${data.name}</h2>
                <h3 style="color:var(--accent); margin-bottom:15px;">GHS ${data.price}</h3>
                
                <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
                    <strong style="display:block; margin-bottom:5px;">Product Details:</strong>
                    <p style="font-size:0.95rem; line-height:1.5; color:#555;">
                        ${data.description || "No specific details provided for this item."}
                    </p>
                </div>

                <a href="https://wa.me/${data.phone}" target="_blank" 
                   style="display:block; background:#25d366; color:white; text-align:center; padding:16px; border-radius:12px; text-decoration:none; font-weight:bold; font-size:1.1rem;">
                   CHAT WITH SELLER
                </a>
            `;
            document.getElementById('detailsModal').style.display = 'flex';
        }
    }).catch((error) => console.log("Error fetching details: ", error));
}

function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// FORM SUBMISSION (With Status Updates)
document.getElementById('postItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    btn.innerText = "⏳ Posting to Campus...";
    btn.disabled = true;

    db.collection("listings").add({
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: document.getElementById('itemPrice').value,
        description: document.getElementById('itemDescription').value,
        phone: document.getElementById('sellerPhone').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Success! Your item is now live at UENR.");
        this.reset();
        btn.innerText = "LIST ITEM NOW";
        btn.disabled = false;
        showPage('home-page', document.querySelector('.nav-btn'));
    });
});
