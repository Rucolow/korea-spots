// Firebase設定（ここを自分の設定に書き換える！）
const firebaseConfig = {
    apiKey: "AIzaSyCSeOkF2DPnKlCCjKjs7TZBwIJcvJWnFHA",
    authDomain: "korea-spots.firebaseapp.com",
    databaseURL: "https://korea-spots-default-rtdb.firebaseio.com",
    projectId: "korea-spots",
    storageBucket: "korea-spots.firebasestorage.app",
    messagingSenderId: "37678170793",
    appId: "1:37678170793:web:bb9be60d6ac583fecb9fb8",
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const placesRef = database.ref('places');

// Service Worker登録
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .catch(err => console.error('Service Worker registration failed', err));
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  loadPlaces();
  
  document.getElementById('addBtn').addEventListener('click', addPlace);
  document.getElementById('mapUrl').addEventListener('input', extractPlaceName);
});

// Firebaseからデータをリアルタイムで読み込む
function loadPlaces() {
  placesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const places = data ? Object.entries(data).map(([id, place]) => ({
      id,
      ...place
    })) : [];
    
    renderPlaces(places);
  });
}

// Google Map URLから場所名を抽出
function extractPlaceName(e) {
  const url = e.target.value;
  const placeNameInput = document.getElementById('placeName');
  
  try {
    const urlObj = new URL(url);
    const query = urlObj.searchParams.get('query');
    
    if (query) {
      placeNameInput.value = decodeURIComponent(query);
    } else if (url.includes('/place/')) {
      const match = url.match(/\/place\/([^\/]+)/);
      if (match) {
        placeNameInput.value = decodeURIComponent(match[1].replace(/\+/g, ' '));
      }
    }
  } catch (e) {
    // URLが不正な場合は何もしない
  }
}

// 場所を追加
function addPlace() {
  const mapUrl = document.getElementById('mapUrl').value.trim();
  const placeName = document.getElementById('placeName').value.trim();
  const placeMemo = document.getElementById('placeMemo').value.trim();
  
  if (!placeName) {
    alert('場所の名前を入力してください');
    return;
  }
  
  const place = {
    name: placeName,
    memo: placeMemo,
    mapUrl: mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`,
    timestamp: Date.now()
  };
  
  // Firebaseに追加
  placesRef.push(place);
  
  // フォームをクリア
  document.getElementById('mapUrl').value = '';
  document.getElementById('placeName').value = '';
  document.getElementById('placeMemo').value = '';
}

// 場所を削除
function deletePlace(id) {
  if (confirm('この場所を削除しますか?')) {
    placesRef.child(id).remove();
  }
}

// メモを更新
function updateMemo(id, memo) {
  placesRef.child(id).update({ memo });
}

// 場所名を更新
function updateName(id, name) {
  placesRef.child(id).update({ name });
}

// 場所リストを描画
function renderPlaces(places) {
  const placesList = document.getElementById('placesList');
  const emptyState = document.getElementById('emptyState');
  
  if (places.length === 0) {
    placesList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // タイムスタンプでソート（新しい順）
  places.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  
  placesList.innerHTML = places.map((place, index) => `
    <div class="place-card">
      <div class="place-header">
        <div class="place-number">${index + 1}</div>
        <input 
          type="text" 
          value="${place.name || ''}" 
          class="place-name-input"
          onchange="updateName('${place.id}', this.value)"
        >
        <button class="delete-btn" onclick="deletePlace('${place.id}')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
      <textarea 
        class="place-memo"
        placeholder="メモを追加..."
        onchange="updateMemo('${place.id}', this.value)"
      >${place.memo || ''}</textarea>
      <a href="${place.mapUrl || '#'}" target="_blank" rel="noopener noreferrer" class="map-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        Google Mapで開く
      </a>
    </div>
  `).join('');
}
