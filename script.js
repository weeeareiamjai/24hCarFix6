// script.js - ไฟล์ JavaScript ส่วนกลางสำหรับทุกหน้าในโปรเจกต์ 24hCarFix6

// -------------------------------------------------------------
// *************** 0. Global Variables & Config ***************
// -------------------------------------------------------------

let customAlert; 
const SERVER_URL = ''; // URL ของ Server

// -------------------------------------------------------------
// *************** 1. Custom Alert System ***************
// -------------------------------------------------------------

function showCustomAlert(message, type = 'info') {
    if (!customAlert) {
        customAlert = document.getElementById('customAlert');
        if (!customAlert) return;
    }
    
    customAlert.textContent = message;
    customAlert.className = ''; // Reset class
    customAlert.classList.add('alert-show', `alert-${type}`);

    setTimeout(() => {
        customAlert.classList.remove('alert-show');
    }, 3000);
}

// -------------------------------------------------------------
// *************** 2. Theme & UI System ***************
// -------------------------------------------------------------

const body = document.body;

function toggleTheme() {
    const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const iconElement = document.getElementById('theme-icon');
    if (iconElement) {
        iconElement.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// -------------------------------------------------------------
// *************** 3. User & Points System (Login Logic) ***************
// -------------------------------------------------------------

function updateUI() {
    // 1. Theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // 2. Points
    const userPoints = localStorage.getItem('userPoints') || 0;
    const pointsElements = document.querySelectorAll('#userPoints');
    pointsElements.forEach(el => el.textContent = parseInt(userPoints).toLocaleString());

    // 3. Username (Login Check)
    const currentUser = localStorage.getItem('currentUser');
    const welcomeMsg = document.querySelector('.user-info h2');
    
    // ถ้าอยู่ในหน้า Login ไม่ต้องเช็ค
    if (!window.location.href.includes('login.html')) {
        if (welcomeMsg) {
            if (currentUser) {
                welcomeMsg.textContent = `ยินดีต้อนรับ, ${currentUser}`;
            } else {
                // ถ้ายังไม่ล็อกอิน ให้เด้งไปหน้า Login (เปิดบรรทัดล่างถ้าต้องการบังคับล็อกอิน)
                // window.location.href = 'login.html';
                welcomeMsg.textContent = `ยินดีต้อนรับ, Guest`;
            }
        }
    }
}

function addPoints(amount) {
    let currentPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    const newPoints = currentPoints + amount;
    localStorage.setItem('userPoints', newPoints);
    updateUI();
    showCustomAlert(`✅ ได้รับ ${amount} แต้ม!`, 'success');
}

function redeem(cost) {
    let currentPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    if (currentPoints >= cost) {
        localStorage.setItem('userPoints', currentPoints - cost);
        updateUI();
        showCustomAlert(`🎁 แลกรางวัลสำเร็จ! หัก ${cost} แต้ม`, 'info');
    } else {
        showCustomAlert(`❌ แต้มไม่พอ! ขาดอีก ${(cost - currentPoints).toLocaleString()} แต้ม`, 'error');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
// ทำให้ logout เรียกผ่าน onclick ได้
window.logout = logout; 


// -------------------------------------------------------------
// *************** 4. Feed & Comment System ***************
// -------------------------------------------------------------

async function handlePostSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // ส่งชื่อผู้ใช้ไปด้วย
    const currentUser = localStorage.getItem('currentUser') || 'Guest';
    formData.append('user', currentUser);

    try {
        const response = await fetch(`${SERVER_URL}/api/posts`, {
            method: 'POST',
            body: formData 
        });
        const data = await response.json();

        if (response.ok) {
            showCustomAlert('🚀 โพสต์สำเร็จ!', 'success');
            form.reset(); 
            fetchFeed(); 
            addPoints(10);
        } else {
            showCustomAlert(`❌ ${data.message}`, 'error');
        }
    } catch (error) {
        console.error(error);
        showCustomAlert('❌ เชื่อมต่อ Server ไม่ได้', 'error');
    }
}

async function handleCommentSubmission(event, postId) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('.comment-input');
    const commentText = input.value.trim();

    if (!commentText) return;

    const currentUser = localStorage.getItem('currentUser') || 'Guest';

    try {
        const response = await fetch(`${SERVER_URL}/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                comment_text: commentText,
                user: currentUser 
            })
        });

        if (response.ok) {
            showCustomAlert('💬 คอมเมนต์เรียบร้อย!', 'success');
            input.value = ''; 
            fetchFeed(); 
        } else {
            showCustomAlert('❌ ส่งคอมเมนต์ไม่ได้', 'error');
        }
    } catch (error) {
        console.error(error);
    }
}

async function fetchFeed() {
    const feedContainer = document.getElementById('feedContent');
    if (!feedContainer) return; 

    try {
        const response = await fetch(`${SERVER_URL}/api/posts`);
        const posts = await response.json();
        feedContainer.innerHTML = ''; 

        if (posts.length === 0) {
             feedContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">ยังไม่มีโพสต์</p>';
             return;
        }

        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            
            let mediaHtml = '';
            if (post.media_url) {
                if (post.type.startsWith('video')) {
                    mediaHtml = `<video controls src="${post.media_url}" style="width: 100%; border-radius: 8px; margin-bottom: 10px;"></video>`;
                } else {
                    mediaHtml = `<img src="${post.media_url}" alt="Post Media" style="width: 100%; border-radius: 8px; margin-bottom: 10px;">`;
                }
            }
            
            let commentsHtml = '';
            if (post.comments && post.comments.length > 0) {
                commentsHtml = post.comments.map(c => `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="comment-user">${c.user}</span>
                            <span class="comment-time">${new Date(c.timestamp).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div class="comment-text">${c.text}</div>
                    </div>
                `).join('');
            } else {
                commentsHtml = '<p style="font-size: 0.8rem; color: var(--text-muted);">ยังไม่มีความคิดเห็น</p>';
            }

            postCard.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 5px;">👤 ${post.user}</div>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">${new Date(post.timestamp).toLocaleString('th-TH')}</p>
                ${mediaHtml}
                <p style="margin-bottom: 15px;">${post.text}</p>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button class="btn-action" style="background: #3fcf2e; width: auto; flex: 1;">👍 Like</button>
                </div>
                <div class="comments-section">
                    <div class="comment-list">${commentsHtml}</div>
                    <form class="comment-form" onsubmit="handleCommentSubmission(event, ${post.id})">
                        <input type="text" class="comment-input" placeholder="เขียนความคิดเห็น..." required>
                        <button type="submit" class="btn-comment-submit">➤</button>
                    </form>
                </div>
            `;
            feedContainer.appendChild(postCard);
        });
    } catch (error) {
        feedContainer.innerHTML = '<p style="color: red; text-align: center;">❌ เชื่อมต่อ Server ไม่ได้</p>';
    }
}
// ประกาศให้ HTML เรียกใช้ได้
window.handleCommentSubmission = handleCommentSubmission;


// -------------------------------------------------------------
// *************** 5. ระบบร้านค้า (Shop System) ***************
// -------------------------------------------------------------

let allProducts = []; 

async function fetchProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return; // ไม่ใช่หน้าร้านค้า

    productList.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">กำลังโหลดสินค้า...</p>';

    try {
        const response = await fetch(`${SERVER_URL}/api/products`);
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (error) {
        productList.innerHTML = '<p style="color: red; text-align: center; grid-column: 1/-1;">❌ โหลดสินค้าไม่ได้ (เช็ค Server)</p>';
        console.error(error);
    }
}

function renderProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">ไม่พบสินค้า</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'card-item';
        productCard.style.textAlign = 'left';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            <span class="product-brand">${product.brand}</span>
            <h4 style="margin: 5px 0;">${product.name}</h4>
            <p class="text-muted" style="font-size: 0.9rem; height: 40px; overflow: hidden;">${product.description}</p>
            <div class="product-price">${product.price.toLocaleString()} แต้ม</div>
            <button class="btn-action" onclick="buyProduct('${product.name}', ${product.price})">🛒 ซื้อเลย</button>
        `;
        productList.appendChild(productCard);
    });
}

function buyProduct(name, price) {
    if (confirm(`คุณต้องการซื้อ "${name}" ในราคา ${price.toLocaleString()} แต้ม ใช่หรือไม่?`)) {
        redeem(price); 
    }
}

function filterProducts() {
    const query = document.getElementById('search-product').value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query)
    );
    renderProducts(filtered);
}
// ประกาศให้ HTML เรียกใช้ได้
window.buyProduct = buyProduct;
window.filterProducts = filterProducts;


// -------------------------------------------------------------
// *************** 6. ระบบ Chatbot ***************
// -------------------------------------------------------------

function displayMessage(text, sender) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return; 
    const div = document.createElement('div');
    div.className = `message ${sender}-message`;
    div.innerHTML = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getBotResponse(msg) {
    msg = msg.toLowerCase();
    let res = "กูไม่รู้";
    if (msg.includes('สวัสดี')) res = "สวัสดีครับ มีอะไรให้ช่วยไหมครับ?";
    else if (msg.includes('อะไหล่') || msg.includes('ร้านค้า')) res = "ดูอะไหล่ได้ที่เมนู 'ร้านค้าอะไหล่' ครับ";
    else if (msg.includes('แต้ม')) res = "เช็คแต้มได้ที่มุมขวาบนครับ";
    else if (msg.includes('เกม')) res = "ไปที่เมนู 'มินิเกม' เพื่อเล่น XO ได้เลย!";
    
    setTimeout(() => displayMessage(res, 'bot'), 800);
}

function handleChatSubmission(e) {
    e.preventDefault();
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;
    displayMessage(msg, 'user');
    getBotResponse(msg);
    input.value = '';
}


// -------------------------------------------------------------
// *************** 7. ระบบ Mini-Game (XO) - แก้ไขชื่อฟังก์ชันให้ตรง ***************
// -------------------------------------------------------------

let board, currentPlayer, aiPlayer, gameActive;
const winConditions = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

function initializeGame() {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    // รีเซ็ตตัวแปร
    board = Array(9).fill(null);
    currentPlayer = '🟢'; 
    aiPlayer = '🔴'; 
    gameActive = true;
    
    gameBoard.innerHTML = ''; // เคลียร์กระดานเก่า
    document.getElementById('game-status').textContent = 'เริ่มเกม! รถเขียว 🟢 ตาคุณ!';

    // สร้างช่อง 9 ช่อง
    for(let i=0; i<9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('data-index', i);
        // *** สำคัญ: ใช้ชื่อ handleGameClick ให้ตรงกับฟังก์ชันด้านล่าง ***
        cell.addEventListener('click', handleGameClick); 
        gameBoard.appendChild(cell);
    }
}

function handleGameClick(e) {
    const idx = parseInt(e.target.getAttribute('data-index'));
    
    // ถ้าช่องไม่ว่าง หรือเกมจบแล้ว ไม่ต้องทำอะไร
    if (board[idx] !== null || !gameActive) return;
    
    // ผู้เล่นเดิน
    makeMove(idx, currentPlayer);
    
    // เช็คผล ถ้ายังไม่จบ ให้ AI เดินต่อ
    if (!checkWin()) {
        document.getElementById('game-status').textContent = 'รถแดง 🔴 กำลังคิด...';
        gameActive = false; // ล็อกกระดานแป๊บนึงตอน AI คิด
        setTimeout(aiMove, 700);
    }
}

function aiMove() {
    // หาช่องว่าง
    const emptyCells = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    
    if (emptyCells.length > 0) {
        // สุ่มช่องเดิน
        const randomIdx = Math.floor(Math.random() * emptyCells.length);
        const move = emptyCells[randomIdx];
        
        makeMove(move, aiPlayer);
        gameActive = true; // ปลดล็อกให้ผู้เล่นเดินต่อได้
        checkWin();
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`.cell[data-index='${index}']`);
    if (cell) cell.textContent = player;
    
    if (player === aiPlayer) {
        document.getElementById('game-status').textContent = 'รถเขียว 🟢 ตาคุณ!';
    }
}

function checkWin() {
    let won = false;
    let winner = null;

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            won = true;
            winner = board[a];
            // ไฮไลท์ช่องที่ชนะ
            condition.forEach(idx => {
                const cell = document.querySelector(`.cell[data-index='${idx}']`);
                if (cell) cell.style.backgroundColor = 'rgba(63,207,46,0.4)';
            });
            break;
        }
    }
    
    const status = document.getElementById('game-status');
    
    if (won) {
        gameActive = false; // จบเกม
        if (winner === currentPlayer) {
             status.textContent = '🎉 รถเขียว 🟢 ชนะ! (+100 แต้ม)'; 
             addPoints(100);
        } else {
             status.textContent = '❌ รถแดง 🔴 ชนะ! ลองใหม่นะ';
        }
        return true;
    }
    
    if (!board.includes(null)) {
        gameActive = false; 
        status.textContent = '👔 เสมอ! (+50 แต้ม)'; 
        addPoints(50); 
        return true;
    }
    
    return false;
}

// ประกาศให้ HTML เรียกใช้ปุ่ม "เริ่มเกมใหม่" ได้
window.resetGame = initializeGame;


// -------------------------------------------------------------
// *************** 8. Mobile Sidebar ***************
// -------------------------------------------------------------

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('active');
}

// คลิกข้างนอกเพื่อปิด
document.addEventListener('click', (event) => {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.menu-toggle');
    if (sidebar && sidebar.classList.contains('active') && 
        !sidebar.contains(event.target) && 
        !toggleBtn.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});


// -------------------------------------------------------------
// *************** 9. Initialization (Main) ***************
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Create Alert & Disclaimer
    document.body.insertAdjacentHTML('beforeend', '<div id="customAlert"></div>');
    customAlert = document.getElementById('customAlert'); 
    
    const disclaimerDiv = document.createElement('div');
    disclaimerDiv.id = 'disclaimerBox';
    disclaimerDiv.innerHTML = '<strong>⚠️ เว็บไซต์นี้ถูกจัดทำขึ้นมาเพื่อการส่งงานเพียงเท่านั้น ไม่ใช่ของบริษัทแต่อย่างใด</strong>';
    document.body.appendChild(disclaimerDiv);

    // 2. Run UI Updates
    updateUI();
    
    // 3. Page Specific Logic
    // -- Index (Feed)
    if (document.getElementById('postForm')) {
        document.getElementById('postForm').addEventListener('submit', handlePostSubmission);
        fetchFeed();
    }
    // -- Chatbot
    if (document.getElementById('chatForm')) {
        document.getElementById('chatForm').addEventListener('submit', handleChatSubmission);
    }
    // -- XO Game
    if (document.getElementById('game-board')) {
        initializeGame();
    }
    // -- Shop
    if (document.getElementById('product-list')) {
        fetchProducts();
    }
});



//AiChatbot(Monkla🫠)
const API_KEY = "AIzaSyD9ISa2Y_gzng75ZpKP-jOo777ZhfMZXRA"; // คีย์เดิมของเรา

async function askGemini(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    const systemInstruction = `
        บทบาท: คุณคือ "พี่ช่าง 24CarFix" ผู้เชี่ยวชาญด้านรถยนต์
        หน้าที่: วิเคราะห์อาการรถเสียจากข้อความที่ลูกค้าบอก
        ข้อจำกัด: ตอบสั้นๆ เข้าใจง่าย (3-5 บรรทัด) เน้นวิธีเช็กเบื้องต้น มีอีโมจิ 🔧🚗
    `;
    
    const requestBody = {
        contents: [{
            parts: [{ text: systemInstruction + "\n\nลูกค้าถาม: " + userMessage }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        return data.candidates?.[0]?.content.parts[0].text || "ขอโทษครับ พี่ช่างมึนหัวนิดหน่อย 😵‍💫";
    } catch (error) {
        console.error(error);
        return "ระบบขัดข้อง! (เน็ตหลุดหรือโควต้าเต็ม) 😭";
    }
}

async function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const chatBox = document.getElementById('chat-window');
    const text = input.value.trim();
    
    if (!text) return;

    // 1. ฝั่งเราพิมพ์
    chatBox.innerHTML += `
        <div class="chat-msg user-msg">
            ${text}
        </div>`;
    
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight; // เลื่อนลงล่างสุด

    // 2. ขึ้นสถานะกำลังพิมพ์...
    const loadingId = "loading-" + Date.now();
    chatBox.innerHTML += `
        <div id="${loadingId}" class="chat-msg ai-msg">
            กำลังวิเคราะห์... 🔧
        </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    // 3. เรียก AI
    const reply = await askGemini(text);
    
    // 4. เอาตัวโหลดออก แล้วใส่คำตอบจริง
    const loadingEl = document.getElementById(loadingId);
    if(loadingEl) loadingEl.remove();

    chatBox.innerHTML += `
        <div class="chat-msg ai-msg">
            ${reply}
        </div>`;
    
    chatBox.scrollTop = chatBox.scrollHeight;
}




//Map(MoNkla🫠)
function initLeafletMap() {
    const mapElement = document.getElementById('real-leaflet-map');
    if (!mapElement) return;
    const map = L.map('real-leaflet-map').setView([13.7563, 100.5018], 12);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    var redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var blueIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const pins = [
        { lat: 13.7563, long: 100.5018, type: "⚠️ อุบัติเหตุ", msg: "รถชนกัน 3 คัน โปรดเลี่ยงเส้นทาง" },
        { lat: 13.7450, long: 100.5320, type: "🔧 ช่างสมชาย", msg: "บริการ 24 ชม. โทร 081-xxxx" },
        { lat: 13.7800, long: 100.5500, type: "🔧 อู่ลุงแดง", msg: "ซ่อมไว ไว้ใจได้" }
    ];

    pins.forEach(pin => {
        const customIcon = pin.type.includes("อุบัติเหตุ") ? redIcon : blueIcon;       
        L.marker([pin.lat, pin.long], { icon: customIcon }).addTo(map)
            .bindPopup(`
                <div style="text-align:center;">
                    <b style="font-size:1.1rem;">${pin.type}</b><br>
                    <span style="color:#666;">${pin.msg}</span>
                </div>
            `);
    });
}