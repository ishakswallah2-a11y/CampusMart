:root { 
    --primary: #2e7d32; 
    --accent: #ff9800; 
    --bg: #f5f7f6; 
    --white: #ffffff;
    --gray: #888888;
}

* { margin:0; padding:0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }

body { 
    background: var(--bg); 
    padding-top: 135px; padding-bottom: 100px; 
    overflow-x: hidden;
}

.page { display: none; width: 100%; min-height: calc(100vh - 225px); }
#home-page { display: block; }

/* --- SPLASH SCREEN --- */
#splash-screen {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
    display: flex; justify-content: center; align-items: center; z-index: 9999;
}
.splash-content { text-align: center; color: white; width: 80%; }
.splash-logo span { font-size: 60px !important; margin: 0 5px; }
.graduation-icon { color: white; }
.trolley-icon { color: var(--accent); }
.splash-text { font-size: 32px; font-weight: 900; margin: 15px 0; }
.splash-text span { color: var(--accent); }

.loading-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin-top: 20px; }
.loading-progress { width: 0%; height: 100%; background: var(--accent); transition: width 2.5s ease-in-out; }
.fade-out { opacity: 0; visibility: hidden; pointer-events: none; transition: 0.8s; }

/* --- HEADER --- */
.main-header { position: fixed; top: 0; width: 100%; background: var(--white); z-index: 1000; padding: 15px; border-bottom: 2px solid #eee; }
.header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.brand-logo { font-size: 26px; font-weight: 900; color: var(--primary); }
.brand-logo span { color: var(--accent); }

.search-container { background: #f0f2f1; display: flex; align-items: center; padding: 12px 15px; border-radius: 25px; border: 1px solid #ddd; }
.search-container input { border: none; background: transparent; width: 100%; margin-left: 10px; font-size: 16px; outline: none; }

/* --- SELL PAGE & MODALS --- */
.pro-form input, .pro-form select, .pro-form textarea { 
    width: 100%; padding: 15px; margin-bottom: 15px; border-radius: 12px; border: 1px solid #ddd; font-size: 16px; outline: none;
}
.primary-btn { width: 100%; background: var(--primary); color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 800; cursor: pointer; }

.modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; align-items: center; justify-content: center; }
.modal-box { background: white; padding: 25px; border-radius: 20px; width: 90%; max-width: 400px; }

/* --- ACCOUNT PAGE --- */
.account-header { display: flex; justify-content: space-between; align-items: center; padding: 25px 15px; background: var(--white); }
.avatar { width: 60px; height: 60px; background: var(--primary); border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-right: 15px; }
.account-menu { background: var(--white); border-radius: 15px; margin-top: 15px; overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 18px; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.menu-item span { margin-right: 15px; color: #555; }
.logout { color: #d32f2f; font-weight: bold; }

/* --- NAVIGATION --- */
.bottom-nav { position: fixed; bottom: 0; width: 100%; background: var(--white); height: 85px; display: flex; justify-content: space-around; align-items: center; border-top: 2px solid #eee; z-index: 1000; }
.nav-tab { text-align: center; color: #777; flex: 1; cursor: pointer; }
.nav-tab.active { color: var(--primary); }
.nav-tab span { font-size: 28px; }
.nav-tab p { font-size: 10px; font-weight: bold; }
.sell-btn { color: var(--accent); }

/* --- PRODUCT GRID --- */
.container { padding: 10px 15px; }
.product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px; }
.card { background: var(--white); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.card-img-container { width: 100%; aspect-ratio: 1/1; background: #eee; }
.card-img { width: 100%; height: 100%; object-fit: cover; }
.card-content { padding: 10px; }
.card-price { color: var(--primary); font-weight: 800; }
