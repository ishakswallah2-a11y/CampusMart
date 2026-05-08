// CONFIG - EXACTLY AS YOU REQUESTED
const firebaseConfig = {
    apiKey: "AIzaSyDWcC4KAKKsiKWKSbn2yJiDHePlXZm1Ywk",
    authDomain: "campusmart-5c975.firebaseapp.com",
    projectId: "campusmart-5c975",
    storageBucket: "campusmart-5c975.firebasestorage.app",
    messagingSenderId: "184864282111",
    appId: "1:184864282111:web:3a0e0c9a7bafa68fea03ca"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const CATEGORIES = [
    { name: 'Electronics', icon: 'devices' },
    { name: 'Books', icon: 'menu_book' },
    { name: 'Hostel Gear', icon: 'bed' },
    { name: 'Fashion', icon: 'checkroom' },
    { name: 'Services', icon: 'handyman' },
    { name: 'Other', icon: 'category' }
];

// 1. Splash Screen Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('fade-out');
    }, 2000);
});

// 2. Navigation & Page Handling
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if (nav.getAttribute('onclick').includes(pageId)) nav.classList.add('active');
    });
    window.scrollTo(0,0);
}

// 3. User Authentication State
auth.onAuthStateChanged(user => {
    const nameEl = document.getElementById('user-name');
    const authBtn = document.getElementById('auth-btn');
    if (user) {
        nameEl.innerText = user.displayName || "UENR Student";
        document.getElementById('user-email').innerText = user.email;
        document.getElementById('user-avatar').innerText = (user.displayName || "U")[0].toUpperCase();
        authBtn.innerText = "Logout";
        authBtn.className = "btn-danger";
    } else {
        nameEl.innerText = "Guest Student";
        authBtn.innerText = "Login / Sign Up";
        authBtn.className = "btn-primary";
    }
});

function handleAuthAction() {
    if (auth.currentUser) {
        auth.signOut();
    } else {
        // Redirect to a login flow or prompt
        const email = prompt("Enter UENR Email:");
        const pass = prompt("Enter Password:");
        if(email && pass) auth.signInWithEmailAndPassword(email, pass).catch(e => alert(e.message));
    }
}

function checkAuthAndNavigate(pageId) {
    if (!auth.currentUser) {
        alert("Please login to access this section.");
        showPage('account-page');
    } else {
        showPage(pageId);
        if(pageId === 'ads-page') loadMyAds();
    }
}

// 4. THE FIX: Faster Posting Logic
document.getElementById('sell-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const loader = document.getElementById('global-loader');
    loader.classList.remove('hidden');

    const newItem = {
        title: document.getElementById('item-title').value,
        category: document.getElementById('item-category').value,
        price: parseFloat(document.getElementById('item-price').value),
        imageUrl: document.getElementById('item-image').value || "https://via.placeholder.com/300",
        description: document.getElementById('item-description').value,
        sellerId: auth.currentUser.uid,
        sellerName: auth.currentUser.displayName || "Student",
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Faster than manual Date()
    };

    try {
        // Optimized Firestore call
        await db.collection('listings').add(newItem);
        alert("Item Listed Successfully! 🚀");
        document.getElementById('sell-form').reset();
        showPage('home-page');
    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        loader.classList.add('hidden');
    }
});

// 5. Loading Content (Real-time listener)
function initApp() {
    // Load Categories
    const catGrid = document.getElementById('categories-grid');
    const catSelect = document.getElementById('item-category');
    CATEGORIES.forEach(c => {
        catGrid.innerHTML += `<div class="cat-item" onclick="filterByCategory('${c.name}')"><span class="material-symbols-outlined">${c.icon}</span><p>${c.name}</p></div>`;
        catSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });

    // Load Global Listings
    db.collection('listings').orderBy('createdAt', 'desc').onSnapshot(snap => {
        const container = document.getElementById('listings-container');
        container.innerHTML = '';
        snap.forEach(doc => {
            const data = doc.data();
            container.innerHTML += `
                <div class="listing-card">
                    <img src="${data.imageUrl}">
                    <div class="listing-info">
                        <h4>${data.title}</h4>
                        <p class="price-tag">GHS ${data.price}</p>
                    </div>
                </div>`;
        });
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

initApp();
