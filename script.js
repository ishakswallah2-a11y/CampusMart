// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDWcC4KAKKsiKWKSbn2yJiDHePlXZm1Ywk",
  authDomain: "campusmart-5c975.firebaseapp.com",
  projectId: "campusmart-5c975",
  storageBucket: "campusmart-5c975.firebasestorage.app",
  messagingSenderId: "184864282111",
  appId: "1:184864282111:web:3a0e0c9a7bafa68fea03ca"
};

// --- 2. INITIALIZE FIREBASE ---
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Global shortcuts
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// --- 3. SPLASH SCREEN LOGIC ---
window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        // Show splash for 3 seconds, then hide smoothly
        setTimeout(() => {
            splash.classList.add('fade-out');
        }, 3000); 
    }
});

// --- 4. NAVIGATION LOGIC ---
function showPage(pageId, el) {
    const user = auth.currentUser;

    // SELLER GATE: Must login to sell
    if (pageId === 'sell-page' && !user) {
        openAuth();
        return;
    }

    // Hide all pages and show the selected one
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';
    
    // Update active tab styling
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    if(el) el.classList.add('active');

    // Header Bell Logic
    const globalBell = document.getElementById('main-noti');
    if (globalBell) {
        globalBell.style.display = (pageId === 'account-page') ? 'none' : 'block';
    }

    window.scrollTo(0,0);
}

// --- 5. AUTH LOGIC ---
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
            await auth.signInWithEmailAndPassword(email, pass);
        } else {
            const res = await auth.createUserWithEmailAndPassword(email, pass);
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

// Global Auth State Observer
auth.onAuthStateChanged(user => {
    const nameLabel = document.getElementById('user-display-name');
    const emailLabel = document.getElementById('user-display-email');
    const initialLabel = document.getElementById('user-initial');

    if (user) {
        if (nameLabel) nameLabel.innerText = user.displayName || "Student";
        if (emailLabel) emailLabel.innerText = user.email;
        if (initialLabel) initialLabel.innerText = user.displayName ? user.displayName[0].toUpperCase() : "U";
    } else {
        if (nameLabel) nameLabel.innerText = "Guest Student";
        if (emailLabel) emailLabel.innerText = "Login to see your profile";
        if (initialLabel) initialLabel.innerText = "?";
    }
});

function handleLogout() {
    auth.signOut().then(() => {
        alert("Logged out successfully");
        showPage('home-page', document.querySelector('.nav-tab'));
    });
}

function openAuth() { document.getElementById('auth-modal').style.display = 'flex'; }
function closeAuth() { document.getElementById('auth-modal').style.display = 'none'; }

// --- 6. LISTING & NOTIFICATION LOGIC ---
db.collection("listings").onSnapshot(snap => {
    const badge = document.getElementById('noti-count');
    // Logic for new item badge can be added here
    if (badge) badge.style.display = "none"; 
});

// Home Feed Real-time listener
db.collection("listings").orderBy("createdAt", "desc").onSnapshot(snap => {
    const container = document.getElementById('listings');
    if (!container) return;
    
    container.innerHTML = "";
    if (snap.empty) {
        container.innerHTML = "<p style='padding:20px; text-align:center; color:#888;'>No listings available yet.</p>";
        return;
    }
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

// --- 7. CATEGORY FILTER LOGIC ---
function filterCategory(cat, el) {
    document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');
    
    const catHeader = document.getElementById('selected-cat-name');
    if (catHeader) catHeader.innerText = cat;

    const resultsContainer = document.getElementById('category-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = "<p style='text-align:center; padding:20px;'>Loading...</p>";

    let query = db.collection("listings");
    if (cat !== 'All') {
        query = query.where("category", "==", cat);
    }

    query.get().then(snap => {
        resultsContainer.innerHTML = "";
        if (snap.empty) {
            resultsContainer.innerHTML = "<p style='padding:40px; text-align:center; color:#888;'>No items found in this category.</p>";
            return;
        }
        snap.forEach(doc => {
            const item = doc.data();
            resultsContainer.innerHTML += `
                <div class="card" onclick="openDetails('${doc.id}')">
                    <img src="${item.imageUrl}" class="card-img">
                    <div class="card-content">
                        <p style="font-size:0.9rem; margin-bottom:5px;">${item.name}</p>
                        <div class="card-price">GHS ${item.price}</div>
                    </div>
                </div>`;
        });
    });
}

// --- 8. POSTING LOGIC ---
const postForm = document.getElementById('postItemForm');
if (postForm) {
    postForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const file = document.getElementById('itemImage').files[0];
        
        if (!file) return alert("Please select a photo of your item!");
        if (!auth.currentUser) return alert("You must be logged in to post.");

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
                sellerId: auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("Success! Your item is now live on CampusMart.");
            postForm.reset();
            document.getElementById('imagePreview').style.display = "none";
            document.getElementById('upload-text').style.display = "block";
            showPage('home-page', document.querySelector('.nav-tab'));
            
        } catch (err) {
            console.error(err);
            alert("Error uploading. Please try again.");
        } finally {
            btn.innerText = "POST AD";
            btn.disabled = false;
        }
    };
}

// --- 9. UTILS & MODALS ---
function openDetails(id) {
    db.collection("listings").doc(id).get().then(doc => {
        const data = doc.data();
        const message = encodeURIComponent(`Hello, I saw your item "${data.name}" on CampusMart. Is it still available?`);
        const whatsappURL = `https://wa.me/${data.phone}?text=${message}`;

        document.getElementById('modalBody').innerHTML = `
            <img src="${data.imageUrl}" style="width:100%; border-radius:15px; margin-bottom:15px;">
            <h2>${data.name}</h2>
            <h3 style="color:#2e7d32; margin:10px 0;">GHS ${data.price}</h3>
            <p style="color:#555; line-height:1.5;">${data.description}</p>
            <a href="${whatsappURL}" target="_blank" class="wa-contact-btn">CHAT ON WHATSAPP</a>`;
        document.getElementById('viewModal').style.display = 'flex';
    });
}

function closeModal() { document.getElementById('viewModal').style.display = 'none'; }

// Image Preview Utility
const imageInput = document.getElementById('itemImage');
if (imageInput) {
    imageInput.onchange = (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = () => {
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.src = reader.result;
                    preview.style.display = "block";
                }
                const uploadText = document.getElementById('upload-text');
                if (uploadText) uploadText.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    };
}
