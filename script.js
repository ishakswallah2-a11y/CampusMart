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
    }, 2500);
});

// --- 3. NAVIGATION ---
function showPage(pageId, el) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const target = document.getElementById(pageId);
    if (target) target.style.display = 'block';
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    if (el) el.classList.add('active');
    window.scrollTo(0,0);
}

// --- 4. AUTH & USER STATE ---
auth.onAuthStateChanged(user => {
    const nameEl = document.getElementById('user-display-name');
    const emailEl = document.getElementById('user-display-email');
    const initialEl = document.getElementById('user-initial');

    if (user) {
        nameEl.innerText = user.displayName || "UENR Student";
        emailEl.innerText = user.email;
        initialEl.innerText = (user.displayName || user.email).charAt(0).toUpperCase();
    } else {
        nameEl.innerText = "Guest Student";
        emailEl.innerText = "Sign in to sync your data";
        initialEl.innerText = "?";
    }
});

function handleLogout() {
    if(confirm("Do you want to logout?")) {
        auth.signOut().then(() => {
            location.reload();
        });
    }
}

// --- 5. DATA ENGINE (LISTINGS) ---
db.collection("listings").orderBy("createdAt", "desc").onSnapshot(snap => {
    const container = document.getElementById('listings');
    if (!container) return;
    
    container.innerHTML = "";
    if (snap.empty) {
        container.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:40px;">No listings found.</p>`;
        return;
    }

    snap.forEach(doc => {
        const item = doc.data();
        container.innerHTML += `
            <div class="card">
                <div class="card-img-container">
                    <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" class="card-img">
                </div>
                <div class="card-content">
                    <p style="font-weight:600; font-size:0.9rem; margin-bottom:5px;">${item.name}</p>
                    <div class="card-price">₵${item.price}</div>
                </div>
            </div>`;
    });
});

// --- 6. UTILS ---
function checkNotifications() {
    alert("No new notifications.");
}

function openSettings() {
    alert("Settings coming soon!");
}
