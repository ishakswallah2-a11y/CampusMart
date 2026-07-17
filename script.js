// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDWcC4KAKKsiKWKSbn2yJiDHePlXZm1Ywk",
    authDomain: "campusmart-5c975.firebaseapp.com",
    projectId: "campusmart-5c975",
    storageBucket: "campusmart-5c975.firebasestorage.app",
    messagingSenderId: "184864282111",
    appId: "1:184864282111:web:3a0e0c9a7bafa68fea03ca"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global System State
let currentUser = null;
let allListings = [];
let currentCategoryFilter = '';
let activeProductDetails = null;

// Categories Directory Structure
const CATEGORIES = [
    { name: 'Electronics', icon: 'devices' },
    { name: 'Books', icon: 'menu_book' },
    { name: 'Hostel Essentials', icon: 'home' },
    { name: 'Clothing', icon: 'shopping_bag' },
    { name: 'Services', icon: 'miscellaneous_services' }
];

// --- AUTH SYSTEM OBSERVER ---
auth.onAuthStateChanged(user => {
    currentUser = user;
    updateUserUI();
    loadLiveListings();
});

// INITIAL APPLICATION LOAD
window.addEventListener('DOMContentLoaded', () => {
    // Hide splash screen after 2.5 seconds
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.classList.add('hidden'), 500);
        }
    }, 2500);

    loadCategoriesSidebar();
});

// --- CLIENT SIDE NOTIFICATION SYSTEMS ---
function showNotification(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3500);
}

// --- RENDERING ROUTER ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
    
    // Bottom navigation indicator updater
    const mapping = {
        'home-page': 'nav-home',
        'category-page': 'nav-category',
        'sell-page': 'nav-sell',
        'ads-page': 'nav-ads',
        'account-page': 'nav-account'
    };
    const activeNavId = mapping[pageId];
    if (activeNavId) {
        document.getElementById(activeNavId).classList.add('active');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkAuthAndNavigate(pageId) {
    if (!currentUser) {
        showNotification("Authentication required to access this service.");
        openAuthModal();
        return;
    }
    showPage(pageId);
    if (pageId === 'ads-page') {
        loadMyAds();
    }
}

// --- USER STATUS INTERFACE ---
function updateUserUI() {
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    const userAvatarEl = document.getElementById('user-avatar');
    const authActionSec = document.getElementById('auth-action-section');

    if (currentUser) {
        userNameEl.innerText = currentUser.displayName || "UENR Student";
        userEmailEl.innerText = currentUser.email;
        userAvatarEl.innerText = (currentUser.displayName || "U").charAt(0).toUpperCase();

        authActionSec.innerHTML = `
            <div class="menu-item logout-item" onclick="handleLogout()">
                <span class="material-symbols-outlined icon-box red">logout</span>
                <div class="menu-text">
                    <p style="color: #f44336;">Logout</p>
                    <small>Log out of your secure session</small>
                </div>
            </div>
        `;
    } else {
        userNameEl.innerText = "Guest Student";
        userEmailEl.innerText = "Log in to sell items";
        userAvatarEl.innerText = "?";

        authActionSec.innerHTML = `
            <div class="menu-item login-item" onclick="openAuthModal()">
                <span class="material-symbols-outlined icon-box green">login</span>
                <div class="menu-text">
                    <p>Login / Sign Up</p>
                    <small>Access verified trading features</small>
                </div>
            </div>
        `;
    }
}

// --- CATEGORY SIDEBAR IMPLEMENTATION ---
function loadCategoriesSidebar() {
    const sidebar = document.getElementById('categories-sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';

    CATEGORIES.forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = `sidebar-item ${index === 0 ? 'active' : ''}`;
        div.innerHTML = `
            <span class="material-symbols-outlined">${cat.icon}</span>
            <p>${cat.name}</p>
        `;
        div.onclick = () => selectCategory(cat.name, div);
        sidebar.appendChild(div);
    });

    // Load first category list by default
    selectCategory(CATEGORIES[0].name);
}

function selectCategory(name, element) {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
    
    currentCategoryFilter = name;
    document.getElementById('category-display-name').innerText = name;
    renderCategoryProducts();
}

// --- RENDER DYNAMIC CARD LAYOUTS ---
function createListingCardHTML(item) {
    return `
        <div class="listing-card" onclick="openProductModal('${item.id}')">
            <img class="listing-card-img" src="${item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}" alt="${item.title}">
            <div class="listing-card-info">
                <span class="listing-card-category">${item.category}</span>
                <p class="listing-card-title">${item.title}</p>
                <p class="listing-card-price">₵${parseFloat(item.price).toFixed(2)}</p>
            </div>
        </div>
    `;
}

// --- DATA ACCESS & STREAMING ---
function loadLiveListings() {
    db.collection('listings').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        allListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Render Home page items
        const homeContainer = document.getElementById('listings-container');
        if (homeContainer) {
            homeContainer.innerHTML = '';
            if (allListings.length === 0) {
                homeContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#888;">No items listed on Campus yet.</p>`;
            } else {
                allListings.forEach(item => {
                    homeContainer.innerHTML += createListingCardHTML(item);
                });
            }
        }
        
        renderCategoryProducts();
    }, error => {
        console.error("Listing loading encountered error:", error);
    });
}

function renderCategoryProducts() {
    const categoryContainer = document.getElementById('category-products-container');
    if (!categoryContainer) return;
    
    categoryContainer.innerHTML = '';
    const filtered = allListings.filter(item => item.category === currentCategoryFilter);
    
    if (filtered.length === 0) {
        categoryContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#888;">No items in ${currentCategoryFilter} yet.</p>`;
    } else {
        filtered.forEach(item => {
            categoryContainer.innerHTML += createListingCardHTML(item);
        });
    }
}

function loadMyAds() {
    const myAdsContainer = document.getElementById('my-ads-container');
    if (!myAdsContainer) return;
    
    myAdsContainer.innerHTML = '';
    if (!currentUser) return;
    
    const myAds = allListings.filter(item => item.sellerId === currentUser.uid);
    
    if (myAds.length === 0) {
        myAdsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:40px; color:#888;">You haven't posted any items yet.</p>`;
    } else {
        myAds.forEach(item => {
            myAdsContainer.innerHTML += createListingCardHTML(item);
        });
    }
}

// --- LIVE ITEM SUBMISSION ---
function handlePostItem(e) {
    e.preventDefault();
    if (!currentUser) {
        showNotification("Please login to post items.");
        return;
    }

    const title = document.getElementById('item-title').value.trim();
    const category = document.getElementById('item-category').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const description = document.getElementById('item-description').value.trim();
    const imageUrl = document.getElementById('item-image').value.trim();

    db.collection('listings').add({
        title,
        category,
        price,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName || "UENR Student",
        sellerEmail: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showNotification("Ad posted successfully!");
        document.getElementById('sell-form').reset();
        showPage('home-page');
    })
    .catch(error => {
        showNotification("Error posting listing: " + error.message);
    });
}

// --- SEARCH ENGINE ---
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const homeContainer = document.getElementById('listings-container');
    if (!homeContainer) return;

    if (!query) {
        loadLiveListings();
        return;
    }

    const matched = allListings.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );

    homeContainer.innerHTML = '';
    if (matched.length === 0) {
        homeContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:40px; color:#888;">No matches found for "${query}"</p>`;
    } else {
        matched.forEach(item => {
            homeContainer.innerHTML += createListingCardHTML(item);
        });
    }
}

// --- MODAL ENGINE ACTIONS ---
function openProductModal(id) {
    const item = allListings.find(l => l.id === id);
    if (!item) return;

    activeProductDetails = item;
    document.getElementById('product-detail-img').src = item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
    document.getElementById('product-detail-name').innerText = item.title;
    document.getElementById('product-detail-category').innerText = item.category;
    document.getElementById('product-detail-price').innerText = `₵${parseFloat(item.price).toFixed(2)}`;
    document.getElementById('product-detail-description').innerText = item.description || "No details provided.";
    document.getElementById('product-detail-seller-name').innerText = item.sellerName || "Anonymous Seller";
    document.getElementById('product-detail-seller-email').innerText = item.sellerEmail || "Unavailable";

    document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    activeProductDetails = null;
}

function contactSeller() {
    if (!activeProductDetails) return;
    const email = activeProductDetails.sellerEmail;
    const subject = encodeURIComponent(`CampusMart: Interested in your item "${activeProductDetails.title}"`);
    const body = encodeURIComponent(`Hello ${activeProductDetails.sellerName},\n\nI saw your listing for "${activeProductDetails.title}" on CampusMart and I'm interested in buying it. Is it still available?\n\nBest regards!`);
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// --- AUTH MODAL LOGIC & ACTIONS ---
function openAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.getElementById('tab-signup').classList.add('active');
        document.getElementById('signup-form').classList.add('active');
    }
}

function handleSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPass = document.getElementById('signup-confirm').value;

    if (!email.endsWith('@uenr.edu.gh')) {
        alert("Verification error: You must sign up with an official @uenr.edu.gh institutional student email.");
        return;
    }

    if (password !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
            return cred.user.updateProfile({ displayName: name });
        })
        .then(() => {
            showNotification("Account created! Welcome to CampusMart.");
            closeAuthModal();
            document.getElementById('signup-form').reset();
        })
        .catch(err => {
            alert(err.message);
        });
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showNotification("Login successful!");
            closeAuthModal();
            document.getElementById('login-form').reset();
        })
        .catch(err => {
            alert(err.message);
        });
}

function handleLogout() {
    auth.signOut()
        .then(() => {
            showNotification("Logged out successfully.");
            showPage('home-page');
        })
        .catch(err => {
            alert(err.message);
        });
}

// --- ADDITIONAL ACCOUNT FEATURES ---
function handleAccountMenu(action) {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    if (action === 'support') {
        window.location.href = "mailto:support@campusmart.com?subject=CampusMart Support Request";
    } else {
        showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} feature coming up in the next system update!`);
    }
}
