// --- 1. FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDWcC4KAKKsiKWKSbn2yJiDHePlXZm1Ywk", 
  authDomain: "campusmart-5c975.firebaseapp.com",
  projectId: "campusmart-5c975",
  storageBucket: "campusmart-5c975.firebasestorage.app",
  messagingSenderId: "184864282111",
  appId: "1:184864282111:web:3a0e0c9a7bafa68fea03ca"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// --- 2. SPLASH SCREEN ---
window.addEventListener('load', () => {
    document.querySelector('.loading-progress').style.width = '100%';
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.classList.add('fade-out');
        setTimeout(() => { splash.style.display = 'none'; }, 800);
    }, 2800);
});

// --- 3. NAVIGATION ---
function showPage(pageId, el) {
    const user = auth.currentUser;
    // Protect Sell and Account
    if ((pageId === 'sell-page' || pageId === 'account-page') && !user) {
        document.getElementById('auth-modal').style.display = 'flex';
        return;
    }
    
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    
    if (el) {
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        el.classList.add('active');
    }
}

// --- 4. CATEGORY FILTERING ---
function filterCat(cat, el) {
    document.querySelectorAll('.side-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    loadProducts(cat);
}

function loadProducts(filter = 'All') {
    let ref = db.collection("listings").orderBy("createdAt", "desc");
    if (filter !== 'All') ref = ref.where("category", "==", filter);

    ref.onSnapshot(snap => {
        const containers = [document.getElementById('listings'), document.getElementById('cat-listings')];
        containers.forEach(c => {
            if (!c) return;
            c.innerHTML = "";
            snap.forEach(doc => {
                const item = doc.data();
                c.innerHTML += `
                    <div class="card">
                        <img src="${item.imageUrl}" class="card-img">
                        <div style="padding:10px;">
                            <p style="font-size:14px; color:#333; font-weight:500;">${item.name}</p>
                            <p style="color:var(--primary); font-weight:bold; margin-top:5px;">₵${item.price}</p>
                        </div>
                    </div>`;
            });
        });
    });
}
loadProducts();

// --- 5. AUTH LOGIC (FIXED) ---
async function handleAuth() {
    const email = document.getElementById('reg-email').value.trim(); // TRIMS SPACES
    const pass = document.getElementById('reg-pass').value;
    const name = document.getElementById('reg-name').value;
    
    if (!email || !pass) return alert("Fill all fields");

    try {
        await auth.signInWithEmailAndPassword(email, pass);
        location.reload();
    } catch (e) {
        try {
            const res = await auth.createUserWithEmailAndPassword(email, pass);
            await res.user.updateProfile({ displayName: name });
            location.reload();
        } catch (err) { alert(err.message); }
    }
}

// --- 6. UPLOAD ---
async function handlePost() {
    const file = document.getElementById('itemImage').files[0];
    if (!file) return alert("Select a photo");
    const btn = document.getElementById('submitBtn');
    btn.innerText = "UPLOADING..."; btn.disabled = true;

    try {
        const ref = storage.ref(`items/${Date.now()}`);
        await ref.put(file);
        const url = await ref.getDownloadURL();
        await db.collection("listings").add({
            name: document.getElementById('itemName').value,
            price: document.getElementById('itemPrice').value,
            category: document.getElementById('itemCategory').value,
            imageUrl: url,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Live on Market!"); location.reload();
    } catch (err) { alert(err.message); btn.disabled = false; }
}

function handleLogout() { if(confirm("Logout?")) auth.signOut().then(()=>location.reload()); }
function closeAuth() { document.getElementById('auth-modal').style.display = 'none'; }

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('user-display-name').innerText = user.displayName || "UENR Student";
        document.getElementById('user-display-email').innerText = user.email;
        document.getElementById('user-initial').innerText = user.email[0].toUpperCase();
    }
});
