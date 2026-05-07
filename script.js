// --- 1. FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDWcC4KAKKsiKWKSbn2yJiDHePlXZm1Ywk", 
  authDomain: "campusmart-5c975.firebaseapp.com",
  projectId: "campusmart-5c975",
  storageBucket: "campusmart-5c975.firebasestorage.app",
  messagingSenderId: "184864282111",
  appId: "1:184864282111:web:3a0e0c9a7bafa68fea03ca"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global Auth State
let isLoginMode = false;

// --- 2. NAVIGATION & AUTH UI ---
function showPage(pageId, el) {
    const user = auth.currentUser;
    // Protect the "Sell" page - must be logged in
    if (pageId === 'sell-page' && !user) {
        openAuth();
        return;
    }
    
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    if(el) el.classList.add('active');
    window.scrollTo(0,0);
}

function openAuth() { document.getElementById('auth-modal').style.display = 'flex'; }
function closeAuth() { document.getElementById('auth-modal').style.display = 'none'; }

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Welcome Back" : "Join CampusMart";
    document.getElementById('auth-submit-btn').innerText = isLoginMode ? "LOGIN" : "CREATE ACCOUNT";
    document.getElementById('reg-name').style.display = isLoginMode ? "none" : "block";
    document.getElementById('auth-toggle-text').innerText = isLoginMode ? "New here?" : "Already have an account?";
    document.getElementById('auth-toggle-link').innerText = isLoginMode ? "Sign Up" : "Login";
}

// --- 3. CORE FUNCTIONALITY (SETTINGS & NOTIFICATIONS) ---
function openSettings() {
    const user = auth.currentUser;
    if(!user) {
        alert("Please login to manage your account.");
        openAuth();
    } else {
        alert(`Account: ${user.email}\nStatus: UENR Verified\n\nProfile editing and security settings are coming in the next update.`);
    }
}

function checkNotifications() {
    alert("You're all caught up! No new buyer messages for your items.");
    const badge = document.getElementById('noti-count');
    if(badge) badge.style.display = 'none';
}

function handleLogout() {
    auth.signOut().then(() => {
        alert("Logged out successfully.");
        location.reload();
    });
}

// --- 4. AUTHENTICATION LOGIC ---
async function handleAuth() {
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const name = document.getElementById('reg-name').value;

    if (!email || !pass) {
        alert("Please fill in all fields.");
        return;
    }

    const btn = document.getElementById('auth-submit-btn');
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        if (isLoginMode) {
            await auth.signInWithEmailAndPassword(email, pass);
        } else {
            const res = await auth.createUserWithEmailAndPassword(email, pass);
            await res.user.updateProfile({ displayName: name });
            await db.collection('users').doc(res.user.uid).set({
                name: name,
                email: email,
                joined: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        closeAuth();
        location.reload();
    } catch (err) {
        alert(err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = isLoginMode ? "LOGIN" : "CREATE ACCOUNT";
    }
}

// --- 5. DATA ENGINE (LISTINGS) ---
db.collection("listings").orderBy("createdAt", "desc").onSnapshot(snap => {
    const container = document.getElementById('listings');
    if (!container) return;
    
    container.innerHTML = "";
    if (snap.empty) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">No items found. Be the first to sell!</div>`;
        return;
    }

    snap.forEach(doc => {
        const item = doc.data();
        container.innerHTML += `
            <div class="card" onclick="openDetails('${doc.id}')">
                <div class="card-img-container">
                    <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" class="card-img">
                </div>
                <div class="card-content">
                    <p style="font-weight:600; margin-bottom:4px;">${item.name}</p>
                    <div class="card-price">GHS ${item.itemPrice || item.price}</div>
                </div>
            </div>`;
    });
});

// --- 6. POSTING LOGIC ---
if (postForm) {
    postForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const file = document.getElementById('itemImage').files[0];
        
        if (!file) { alert("Please add a photo of the item."); return; }

        btn.innerText = "POSTING...";
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

            alert("Item posted to UENR Market!");
            location.reload();
        } catch (err) {
            alert(err.message);
        } finally {
            btn.disabled = false;
        }
    };
}

// --- 7. UTILS & MODALS ---
function openDetails(id) {
    db.collection("listings").doc(id).get().then(doc => {
        const data = doc.data();
        const whatsappURL = `https://wa.me/${data.phone}?text=Hi,%20I'm%20interested%20in%20your%20${data.name}%20on%20CampusMart.`;
        document.getElementById('modalBody').innerHTML = `
            <img src="${data.imageUrl}" style="width:100%; border-radius:12px;">
            <h2 style="margin:15px 0 5px 0;">${data.name}</h2>
            <h3 style="color:#2e7d32; margin-bottom:10px;">GHS ${data.price}</h3>
            <p style="color:#555; line-height:1.5;">${data.description}</p>
            <a href="${whatsappURL}" target="_blank" class="wa-contact-btn">CONTACT VIA WHATSAPP</a>`;
        document.getElementById('viewModal').style.display = 'flex';
    });
}

function closeModal() { document.getElementById('viewModal').style.display = 'none'; }

// Image Preview for Selling
const imageInput = document.getElementById('itemImage');
if(imageInput) {
    imageInput.onchange = (e) => {
        const [file] = imageInput.files;
        if (file) {
            const preview = document.getElementById('imagePreview');
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
            document.getElementById('upload-text').style.display = 'none';
        }
    };
}

// User UI Sync
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('user-display-name').innerText = user.displayName || "Student User";
        document.getElementById('user-display-email').innerText = user.email;
        document.getElementById('user-initial').innerText = (user.displayName || "S").charAt(0).toUpperCase();
        
        // Show user ads count
        db.collection('listings').where('sellerId', '==', user.uid).get().then(snap => {
             const adContainer = document.getElementById('my-listings-container');
             if(adContainer) {
                 adContainer.innerHTML = snap.empty ? `<p style="text-align:center; padding:20px;">You haven't posted any ads yet.</p>` : `<p style="text-align:center; padding:20px;">You have ${snap.size} active listings.</p>`;
             }
        });
    }
});

// Splash screen removal
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.classList.add('fade-out');
    }, 2000);
});
