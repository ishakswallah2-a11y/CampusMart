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

let isLoginMode = false;

// --- 2. SPLASH SCREEN LOGIC ---
window.addEventListener('load', () => {
    const progress = document.querySelector('.loading-progress');
    const splash = document.getElementById('splash-screen');
    if (progress) progress.style.width = '100%';
    setTimeout(() => {
        if (splash) {
            splash.classList.add('fade-out');
            setTimeout(() => { splash.style.display = 'none'; }, 800);
        }
    }, 3000);
});

// --- 3. NAVIGATION (FIXED FOR SELL BUTTON) ---
function showPage(pageId, el) {
    const user = auth.currentUser;
    // If user tries to sell without login, show the Join box
    if (pageId === 'sell-page' && !user) {
        document.getElementById('auth-modal').style.display = 'flex';
        return;
    }
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const target = document.getElementById(pageId);
    if (target) target.style.display = 'block';
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    if (el) el.classList.add('active');
    window.scrollTo(0,0);
}

// --- 4. AUTH LOGIC (FIXED EMAIL FORMATTING) ---
async function handleAuth() {
    const email = document.getElementById('reg-email').value.trim(); // TRIMS EXTRA SPACES
    const pass = document.getElementById('reg-pass').value;
    const name = document.getElementById('reg-name').value;

    if (!email || !pass) { alert("Please fill all fields."); return; }

    const btn = document.getElementById('auth-submit-btn');
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        if (isLoginMode) {
            await auth.signInWithEmailAndPassword(email, pass);
        } else {
            const res = await auth.createUserWithEmailAndPassword(email, pass);
            await res.user.updateProfile({ displayName: name });
        }
        location.reload();
    } catch (err) { alert(err.message); } finally { btn.disabled = false; }
}

function openAuth() { document.getElementById('auth-modal').style.display = 'flex'; }
function closeAuth() { document.getElementById('auth-modal').style.display = 'none'; }
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Welcome Back" : "Join CampusMart";
    document.getElementById('reg-name').style.display = isLoginMode ? "none" : "block";
}

// --- 5. AUTH STATE ---
auth.onAuthStateChanged(user => {
    const nameEl = document.getElementById('user-display-name');
    const emailEl = document.getElementById('user-display-email');
    const initialEl = document.getElementById('user-initial');
    if (user) {
        nameEl.innerText = user.displayName || "UENR Student";
        emailEl.innerText = user.email;
        initialEl.innerText = (user.displayName || user.email).charAt(0).toUpperCase();
    }
});

function handleLogout() {
    if(confirm("Logout?")) { auth.signOut().then(() => location.reload()); }
}

// --- 6. DATA ENGINE ---
db.collection("listings").orderBy("createdAt", "desc").onSnapshot(snap => {
    const container = document.getElementById('listings');
    if (!container) return;
    container.innerHTML = "";
    snap.forEach(doc => {
        const item = doc.data();
        container.innerHTML += `
            <div class="card">
                <div class="card-img-container"><img src="${item.imageUrl || 'https://via.placeholder.com/150'}" class="card-img"></div>
                <div class="card-content">
                    <p style="font-weight:600;">${item.name}</p>
                    <div class="card-price">₵${item.price}</div>
                </div>
            </div>`;
    });
});

// --- 7. POSTING AD LOGIC ---
async function handlePost() {
    const file = document.getElementById('itemImage').files[0];
    if (!file) { alert("Photo required."); return; }
    const btn = document.getElementById('submitBtn');
    btn.innerText = "UPLOADING...";
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
            sellerId: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Posted successfully!");
        location.reload();
    } catch (err) { alert(err.message); } finally { btn.disabled = false; }
}
