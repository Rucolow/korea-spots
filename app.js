// Service Worker登録
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker registration failed', err));
  }
  
  // データ管理
  let places = JSON.parse(localStorage.getItem('koreaSpots')) || [];
  
  // 初期化
  document.addEventListener('DOMContentLoaded', () => {
    renderPlaces();
    
    document.getElementById('addBtn').addEventListener('click', addPlace);
    document.getElementById('mapUrl').addEventListener('input', extractPlaceName);
  });
  
  // Google Map URLから場所名を抽出
  function extractPlaceName(e) {
    const url = e.target.value;
    const placeNameInput = document.getElementById('placeName');
    
    try {
      const urlObj = new URL(url);
      const query = urlObj.searchParams.get('query');
      
      if (query) {
        // URLのqueryパラメータから場所名を取得
        placeNameInput.value = decodeURIComponent(query);
      } else if (url.includes('/place/')) {
        // /place/の後の文字列を取得
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
      id: Date.now(),
      name: placeName,
      memo: placeMemo,
      mapUrl: mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`
    };
    
    places.push(place);
    savePlaces();
    renderPlaces();
    
    // フォームをクリア
    document.getElementById('mapUrl').value = '';
    document.getElementById('placeName').value = '';
    document.getElementById('placeMemo').value = '';
  }
  
  // 場所を削除
  function deletePlace(id) {
    if (confirm('この場所を削除しますか?')) {
      places = places.filter(p => p.id !== id);
      savePlaces();
      renderPlaces();
    }
  }
  
  // メモを更新
  function updateMemo(id, memo) {
    const place = places.find(p => p.id === id);
    if (place) {
      place.memo = memo;
      savePlaces();
    }
  }
  
  // 場所名を更新
  function updateName(id, name) {
    const place = places.find(p => p.id === id);
    if (place) {
      place.name = name;
      savePlaces();
    }
  }
  
  // LocalStorageに保存
  function savePlaces() {
    localStorage.setItem('koreaSpots', JSON.stringify(places));
  }
  
  // 場所リストを描画
  function renderPlaces() {
    const placesList = document.getElementById('placesList');
    const emptyState = document.getElementById('emptyState');
    
    if (places.length === 0) {
      placesList.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    placesList.innerHTML = places.map((place, index) => `
      <div class="place-card">
        <div class="place-header">
          <div class="place-number">${index + 1}</div>
          <input 
            type="text" 
            value="${place.name}" 
            class="place-name-input"
            onchange="updateName(${place.id}, this.value)"
          >
          <button class="delete-btn" onclick="deletePlace(${place.id})">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        <textarea 
          class="place-memo"
          placeholder="メモを追加..."
          onchange="updateMemo(${place.id}, this.value)"
        >${place.memo || ''}</textarea>
        <a href="${place.mapUrl}" target="_blank" rel="noopener noreferrer" class="map-btn">
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