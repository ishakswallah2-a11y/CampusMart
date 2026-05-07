// --- NAVIGATION LOGIC ---
function showPage(pageId, el) {
    const user = firebase.auth().currentUser;

    // SELLER GATE: Must login to sell
    if (pageId === 'sell-page' && !user) {
        openAuth();
        return;
    }

    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    if(el) el.classList.add('active');

    // Header Bell Logic
    const globalBell = document.getElementById('main-noti');
    globalBell.style.display = (pageId === 'account-page') ? 'none' : 'block';

    window.scrollTo(0,0);
}

// --- AUTH LOGIC ---
let isLoginMode = false;
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Welcome Back" : "Join CampusMart";
    document.getElementById('auth-submit-btn').innerText = isLoginMode ? "LOGIN" : "CREATE ACCOUNT";
    document.getElementById('reg-name').style.display = isLoginMode ? "none" : "block";
    document.getElementById('auth-toggle-text').innerText = isLoginMode ? "New here?" : "Already have an account?";
    document.getElementById('auth-toggle-link').innerText = isLoginMode ? "Sign Up" : "Login";
}

async function handleAuth() {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const name = document.getElementById('reg-name').value;
    const btn = document.getElementById('auth-submit-btn');

    btn.innerText = "Authenticating...";
    btn.disabled = true;

    try {
        if (isLoginMode) {
            await firebase.auth().signInWithEmailAndPassword(email, pass);
        } else {
            const res = await firebase.auth().createUserWithEmailAndPassword(email, pass);
            await res.user.updateProfile({ displayName: name });
        }
        closeAuth();
    } catch (err) {
        alert(err.message);
    } finally {
        btn.innerText = isLoginMode ? "LOGIN" : "CREATE ACCOUNT";
        btn.disabled = false;
    }
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        document.getElementById('user-display-name').innerText = user.displayName || "Student";
        document.getElementById('user-display-email').innerText = user.email;
        document.getElementById('user-initial').innerText = user.displayName ? user.displayName[0].toUpperCase() : "U";
        document.getElementById('my-listings-container').innerHTML = `<p style="text-align:center; color:#2e7d32;">Logged in as ${user.displayName}</p>`;
    } else {
        document.getElementById('user-display-name').innerText = "Guest Student";
        document.getElementById('user-display-email').innerText = "Login to see your profile";
        document.getElementById('user-initial').innerText = "?";
    }
});

function handleLogout() {
    firebase.auth().signOut().then(() => {
        alert("Logged out");
        showPage('home-page', document.querySelector('.nav-tab'));
    });
}

function openAuth() { document.getElementById('auth-modal').style.display = 'flex'; }
function closeAuth() { document.getElementById('auth-modal').style.display = 'none'; }

// --- NOTIFICATION LOGIC (NO DEFAULT NUMBERS) ---
db.collection("listings").onSnapshot(snap => {
    const badge = document.getElementById('noti-count');
    const newItems = snap.size; 
    if (newItems > 0) {
        badge.innerText = newItems;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
});

// --- LISTING LOGIC ---
db.collection("listings").orderBy("createdAt", "desc").onSnapshot(snap => {
    const container = document.getElementById('listings');
    container.innerHTML = "";
    snap.forEach(doc => {
        const item = doc.data();
        container.innerHTML += `
            <div class="card" onclick="openDetails('${doc.id}')">
                <img src="${item.imageUrl || ''}" class="card-img">
                <div class="card-content">
                    <p style="font-size:0.9rem; color:#333; margin-bottom:5px;">${item.name}</p>
                    <div class="card-price">GHS ${item.price}</div>
                </div>
            </div>`;
    });
});

// --- POSTING LOGIC ---
document.getElementById('postItemForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const file = document.getElementById('itemImage').files[0];
    if (!file) return alert("Select a photo!");

    btn.innerText = "⏳ UPLOADING...";
    btn.disabled = true;

    try {
        const ref = storage.ref(`items/${Date.now()}_${file.name}`);
        const task = await ref.put(file);
        const url = await task.ref.getDownloadURL();

        await db.collection("listings").add({
            name: document.getElementById('itemName').value,
            price: document.getElementById('itemPrice').value,
            category: document.getElementById('itemCategory').value,
            description: document.getElementById('itemDescription').value,
            phone: document.getElementById('sellerPhone').value,
            imageUrl: url,
            sellerId: firebase.auth().currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Posted!");
        location.reload();
    } catch (err) {
        alert("Error uploading.");
        btn.disabled = false;
    }
};

// --- UTILS ---
function openDetails(id) {
    db.collection("listings").doc(id).get().then(doc => {
        const data = doc.data();
        document.getElementById('modalBody').innerHTML = `
            <img src="${data.imageUrl}" style="width:100%; border-radius:15px;">
            <h2 style="margin-top:15px;">${data.name}</h2>
            <h3 style="color:var(--primary); margin:10px 0;">GHS ${data.price}</h3>
            <p>${data.description}</p>
            <a href="https://wa.me/${data.phone}" class="wa-contact-btn">CHAT ON WHATSAPP</a>`;
        document.getElementById('viewModal').style.display = 'flex';
    });
}
function closeModal() { document.getElementById('viewModal').style.display = 'none'; }

document.getElementById('itemImage').onchange = (e) => {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const preview = document.getElementById('imagePreview');
            preview.src = reader.result;
            preview.style.display = "block";
            document.getElementById('upload-text').style.display = "none";
        };
        reader.readAsDataURL(file);
    }
};
