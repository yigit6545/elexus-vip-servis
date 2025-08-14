// VIP Servis Uygulaması - Veritabanı Entegrasyonu
class VIPService {
    constructor() {
        this.guests = [];
        this.filteredGuests = [];
        this.currentUser = null;
        this.authToken = null;
        this.apiBaseUrl = '/api';
        this.isSubmitting = false; // Duplicate submit önleme flag'i
        this.init();
    }

    async init() {
        console.log('🚀 VIP Service başlatılıyor...');
        this.setupEventListeners();
        
        // Kimlik doğrulama kontrolü
        const isAuthenticated = await this.checkAuthStatus();
        console.log('🔐 Kimlik doğrulama sonucu:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('⚠️ Kullanıcı giriş yapmamış, login ekranı gösteriliyor');
        }
    }

    // Event listener'ları kurma
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Arama
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchGuests());
        }
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchGuests();
            });
        }
        
        // Filtreleme
        const filterBtn = document.getElementById('filterBtn');
        const applyFilter = document.getElementById('applyFilter');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.toggleFilterPanel());
        }
        if (applyFilter) {
            applyFilter.addEventListener('click', () => this.applyFilters());
        }
        
        // Misafir ekleme
        const addGuestBtn = document.getElementById('addGuestBtn');
        const addGuestForm = document.getElementById('addGuestForm');
        if (addGuestBtn) {
            addGuestBtn.addEventListener('click', () => this.showAddGuestModal());
        }
        if (addGuestForm) {
            addGuestForm.addEventListener('submit', (e) => this.handleAddGuest(e));
        }
        
        // Çıkış
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    // API istekleri için yardımcı fonksiyon
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    // JSON parse hatası durumunda status code kullan
                    console.warn('JSON parse hatası, status code kullanılıyor:', parseError);
                }
                throw new Error(errorMessage);
            }

            try {
                return await response.json();
            } catch (parseError) {
                console.warn('Response JSON parse hatası:', parseError);
                return null;
            }
        } catch (error) {
            console.error('API isteği hatası:', error);
            throw error;
        }
    }

    // Kimlik doğrulama durumunu kontrol et
    async checkAuthStatus() {
        console.log('🔍 Kimlik doğrulama kontrolü başlatılıyor...');
        
        // Detay sayfasından dönüyorsa, token kontrolü yapmadan ana sayfayı göster
        const returningFromDetail = localStorage.getItem('returningFromDetail');
        if (returningFromDetail === 'true') {
            console.log('🔄 Detay sayfasından dönüş tespit edildi, flag temizleniyor...');
            localStorage.removeItem('returningFromDetail');
            
            const token = localStorage.getItem('authToken');
            const user = localStorage.getItem('user');
            
            if (token && user) {
                try {
                    const userData = JSON.parse(user);
                    this.authToken = token;
                    this.currentUser = userData;
                    
                    // Ana sayfayı hemen göster
                    this.showMainContent();
                    this.loadGuests();
                    this.updateUserInfo();
                    
                    console.log('✅ Detay sayfasından dönüş: Ana sayfa gösterildi');
                    return true;
                } catch (error) {
                    console.error('❌ Detay sayfasından dönüş hatası:', error);
                    this.clearAuthData();
                    this.hideMainContent();
                    this.showLoginModal();
                    return false;
                }
            }
        }
        
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        console.log('📱 Token var mı:', !!token);
        console.log('👤 Kullanıcı var mı:', !!user);
        console.log('🔑 Token değeri:', token ? token.substring(0, 20) + '...' : 'YOK');
        
        if (token && user) {
            try {
                // Önce localStorage'daki kullanıcı bilgilerini kullan
                const userData = JSON.parse(user);
                this.authToken = token;
                this.currentUser = userData;
                
                // Ana sayfayı hemen göster (token kontrolü yapmadan)
                this.showMainContent();
                this.loadGuests();
                this.updateUserInfo();
                
                console.log('✅ LocalStorage verileri kullanılarak ana sayfa gösterildi');
                
                // Arka planda token geçerliliğini kontrol et
                this.validateTokenInBackground(token);
                
                return true; // Başarılı
            } catch (error) {
                console.error('❌ LocalStorage veri hatası:', error);
                this.clearAuthData();
                this.hideMainContent();
                this.showLoginModal();
                return false;
            }
        } else {
            // Token yok, login ekranını göster
            console.log('❌ Token veya kullanıcı yok, login ekranı gösteriliyor');
            this.hideMainContent();
            this.showLoginModal();
            return false;
        }
    }

    // Arka planda token geçerliliğini kontrol et
    async validateTokenInBackground(token) {
        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Token geçersiz, localStorage'ı temizle
                console.log('❌ Token geçersiz, localStorage temizleniyor');
                this.clearAuthData();
                this.hideMainContent();
                this.showLoginModal();
            } else {
                // Token geçerli, kullanıcı bilgilerini güncelle
                try {
                    const userData = await response.json();
                    this.currentUser = userData;
                    localStorage.setItem('user', JSON.stringify(userData));
                    this.updateUserInfo();
                    console.log('✅ Token arka planda doğrulandı');
                } catch (parseError) {
                    console.warn('Token doğrulama response JSON parse hatası:', parseError);
                    // JSON parse hatası durumunda mevcut kullanıcı bilgilerini koru
                }
            }
        } catch (error) {
            console.error('❌ Arka plan token doğrulama hatası:', error);
            // Hata durumunda sadece log, kullanıcıyı rahatsız etme
        }
    }

    // Kimlik verilerini temizle
    clearAuthData() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    // Login işlemi
    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showNotification('Lütfen kullanıcı adı ve şifre giriniz!', 'error');
            return;
        }

        try {
            const response = await this.apiRequest('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            this.authToken = response.token;
            this.currentUser = response.user;

            // Token ve kullanıcı bilgilerini localStorage'a kaydet
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('user', JSON.stringify(this.currentUser));

            this.hideLoginModal();
            this.showMainContent();
            this.loadGuests();
            
            this.showNotification(`Hoş geldiniz, ${this.currentUser.fullName}!`, 'success');
            
            // Kullanıcı adını header'da göster
            this.updateUserInfo();

        } catch (error) {
            this.showNotification(error.message || 'Giriş başarısız!', 'error');
        }
    }

    // Kullanıcı bilgilerini güncelle
    updateUserInfo() {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <span><i class="fas fa-user"></i> ${this.currentUser.fullName}</span>
            <span class="user-role">${this.currentUser.role}</span>
        `;
        
        // Mevcut user-info varsa güncelle, yoksa ekle
        const existingUserInfo = document.querySelector('.user-info');
        if (existingUserInfo) {
            existingUserInfo.remove();
        }
        
        document.querySelector('.header-controls').insertBefore(userInfo, document.getElementById('logoutBtn'));
    }

    // Misafirleri yükle
    async loadGuests() {
        try {
            const guests = await this.apiRequest('/guests');
            this.guests = guests;
            this.filteredGuests = [...guests];
            this.renderGuests();
        } catch (error) {
            this.showNotification('Misafirler yüklenirken hata oluştu!', 'error');
        }
    }

    // Arama işlemi
    async searchGuests() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        
        if (!searchTerm) {
            this.filteredGuests = [...this.guests];
            this.renderGuests();
            return;
        }

        try {
            const guests = await this.apiRequest(`/guests?search=${encodeURIComponent(searchTerm)}`);
            this.filteredGuests = guests;
            this.renderGuests();
        } catch (error) {
            this.showNotification('Arama yapılırken hata oluştu!', 'error');
        }
    }

    // Arama input değişikliği
    handleSearchInput(e) {
        if (e.target.value === '') {
            this.filteredGuests = [...this.guests];
            this.renderGuests();
        }
    }

    // Filtre panelini açma/kapama
    toggleFilterPanel() {
        const filterPanel = document.getElementById('filterPanel');
        filterPanel.classList.toggle('hidden');
    }

    // Filtreleri uygulama
    async applyFilters() {
        const selectedClasses = Array.from(document.querySelectorAll('.filter-options input:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedClasses.length === 0) {
            this.showNotification('En az bir sınıf seçmelisiniz!', 'warning');
            return;
        }

        try {
            const classFilter = selectedClasses.join(',');
            console.log('🔍 Filtreleme yapılıyor:', classFilter);
            
            const guests = await this.apiRequest(`/guests?class_filter=${encodeURIComponent(classFilter)}`);
            
            if (guests && Array.isArray(guests)) {
                this.filteredGuests = guests;
                this.renderGuests();
                this.toggleFilterPanel();
                this.showNotification(`${guests.length} misafir bulundu`, 'success');
            } else {
                console.warn('❌ Geçersiz misafir verisi:', guests);
                this.showNotification('Filtreleme sonucu geçersiz!', 'error');
            }
        } catch (error) {
            console.error('❌ Filtreleme hatası:', error);
            this.showNotification('Filtreleme yapılırken hata oluştu!', 'error');
        }
    }

    // Misafir ekleme modal'ını gösterme
    showAddGuestModal() {
        document.getElementById('addGuestModal').style.display = 'flex';
        document.getElementById('guestName').focus();
    }

    // Misafir ekleme modal'ını kapatma
    closeAddGuestModal() {
        document.getElementById('addGuestModal').style.display = 'none';
        this.resetForm();
    }

    // Misafir ekleme işlemi
    async handleAddGuest(e) {
        e.preventDefault();
        
        // Duplicate submit'i önle
        if (this.isSubmitting) {
            console.log('⚠️ Form zaten gönderiliyor, duplicate önlendi');
            return;
        }
        
        this.isSubmitting = true;
        
        const name = document.getElementById('guestName').value.trim();
        const guestClass = document.getElementById('guestClass').value;
        
        if (!name || !guestClass) {
            this.showNotification('Misafir adı ve sınıfı zorunludur!', 'warning');
            this.isSubmitting = false;
            return;
        }

        console.log('🔍 Misafir ekleniyor:', { name, guestClass });
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('class', guestClass);
        formData.append('alcohol', document.getElementById('guestAlcohol').value || '');
        formData.append('cigarette', document.getElementById('guestCigarette').value || '');
        formData.append('cigar', document.getElementById('guestCigar').value || '');
        formData.append('specialRequests', document.getElementById('guestSpecialRequests').value || '');
        formData.append('otherInfo', document.getElementById('guestOtherInfo').value || '');

        // Fotoğraf varsa ekle
        const photoFile = document.getElementById('guestPhoto').files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        try {
            console.log('🔍 API isteği gönderiliyor...');
            
            const response = await fetch(`${this.apiBaseUrl}/guests`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            console.log('🔍 API yanıtı:', response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = 'Misafir eklenirken hata oluştu';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.warn('❌ Error response JSON parse hatası:', parseError);
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Misafir eklendi:', result);

            // Misafir listesini yeniden yükle
            await this.loadGuests();
            
            this.closeAddGuestModal();
            this.showNotification('Misafir başarıyla eklendi!', 'success');
            
        } catch (error) {
            console.error('❌ Misafir ekleme hatası:', error);
            this.showNotification(error.message || 'Misafir eklenirken hata oluştu!', 'error');
        } finally {
            // Submit flag'ini sıfırla
            this.isSubmitting = false;
        }
    }

    // Form'u sıfırla
    resetForm() {
        const form = document.getElementById('addGuestForm');
        if (form) {
            form.reset();
            const nameInput = document.getElementById('guestName');
            if (nameInput) {
                nameInput.focus();
            }
        }
    }








    // Misafirleri render etme
    renderGuests() {
        const guestList = document.getElementById('guestList');
        
        if (this.filteredGuests.length === 0) {
            guestList.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
                    <h3>Misafir bulunamadı</h3>
                    <p>Arama kriterlerinizi değiştirmeyi deneyin</p>
                </div>
            `;
            return;
        }
        
        guestList.innerHTML = this.filteredGuests.map(guest => `
            <div class="guest-card" data-guest-id="${guest.id}" onclick="window.vipService.openGuestDetail(${guest.id})">
                <div class="guest-card-header">
                    <div class="guest-photo-placeholder">
                        <span>${guest.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div class="guest-actions" onclick="event.stopPropagation()">
                        <button class="edit-btn" onclick="window.vipService.editGuest(${guest.id})" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="window.vipService.deleteGuest(${guest.id})" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h3 class="guest-name">${guest.name}</h3>
                <div class="guest-class">${guest.class}</div>
                <div class="guest-details">
                    <div class="detail-item">
                        <span class="detail-label">İçtiği Alkol:</span>
                        <span class="detail-value">${guest.alcohol || 'Belirtilmemiş'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">İçtiği Sigara:</span>
                        <span class="detail-value">${guest.cigarette || 'Belirtilmemiş'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">İçtiği Puro:</span>
                        <span class="detail-value">${guest.cigar || 'Yok'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Özel İstekler:</span>
                        <span class="detail-value">${guest.special_requests || 'Yok'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Diğer Bilgiler:</span>
                        <span class="detail-value">${guest.other_info || 'Yok'}</span>
                    </div>
                </div>
                <div class="guest-footer">
                    <small>Eklenme: ${new Date(guest.created_at).toLocaleDateString('tr-TR')}</small>
                    <button class="visit-btn" onclick="event.stopPropagation(); window.vipService.addVisit(${guest.id})" title="Ziyaret Ekle">
                        <i class="fas fa-plus"></i> Ziyaret
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Misafir düzenleme
    async editGuest(guestId) {
        const guest = this.guests.find(g => g.id === guestId);
        if (!guest) return;

        // Form'u doldur
        document.getElementById('guestName').value = guest.name;
        document.getElementById('guestClass').value = guest.class;
        document.getElementById('guestAlcohol').value = guest.alcohol || '';
        document.getElementById('guestCigarette').value = guest.cigarette || '';
        document.getElementById('guestCigar').value = guest.cigar || '';
        document.getElementById('guestSpecialRequests').value = guest.special_requests || '';
        document.getElementById('guestOtherInfo').value = guest.other_info || '';

        // Modal'ı düzenleme modunda aç
        const modal = document.getElementById('addGuestModal');
        if (modal) {
            const title = modal.querySelector('h2');
            const form = modal.querySelector('#addGuestForm');
            const saveBtn = modal.querySelector('.submit-btn');

            if (title) title.textContent = 'Misafir Düzenle';
            if (saveBtn) saveBtn.textContent = 'Güncelle';
            if (form) form.onsubmit = (e) => this.handleUpdateGuest(e, guestId);
            
            modal.style.display = 'flex';
        }
    }

    // Misafir güncelleme
    async handleUpdateGuest(e, guestId) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('guestName').value);
        formData.append('class', document.getElementById('guestClass').value);
        formData.append('alcohol', document.getElementById('guestAlcohol').value || '');
        formData.append('cigarette', document.getElementById('guestCigarette').value || '');
        formData.append('cigar', document.getElementById('guestCigar').value || '');
        formData.append('specialRequests', document.getElementById('guestSpecialRequests').value || '');
        formData.append('otherInfo', document.getElementById('guestOtherInfo').value || '');

        // Fotoğraf varsa ekle
        const photoFile = document.getElementById('guestPhoto').files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/guests/${guestId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Misafir güncellenirken hata oluştu');
            }

            // Misafir listesini yeniden yükle
            await this.loadGuests();
            
            this.closeAddGuestModal();
            this.showNotification('Misafir başarıyla güncellendi!', 'success');
            
            // Form'u normal haline getir
            this.resetFormForEdit();
            
        } catch (error) {
            this.showNotification(error.message || 'Misafir güncellenirken hata oluştu!', 'error');
        }
    }

    // Misafir silme
    async deleteGuest(guestId) {
        if (!confirm('Bu misafiri silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await this.apiRequest(`/guests/${guestId}`, {
                method: 'DELETE'
            });

            // Misafir listesini yeniden yükle
            await this.loadGuests();
            this.showNotification('Misafir başarıyla silindi!', 'success');
            
        } catch (error) {
            this.showNotification(error.message || 'Misafir silinirken hata oluştu!', 'error');
        }
    }

    // Misafir detay sayfasını aç
    openGuestDetail(guestId) {
        // Mevcut sekmede aç, yeni sekme açma
                    window.location.href = `/guest-detail.html?id=${guestId}`;
    }

    // Ziyaret ekleme
    async addVisit(guestId) {
        const notes = prompt('Ziyaret notları:');
        if (notes === null) return; // İptal edildi

        if (!notes.trim()) {
            this.showNotification('Ziyaret notları boş olamaz!', 'warning');
            return;
        }

        try {
            console.log('🔍 Ziyaret ekleniyor:', { guestId, notes });
            
            const response = await this.apiRequest(`/guests/${guestId}/visits`, {
                method: 'POST',
                body: JSON.stringify({ notes: notes.trim() })
            });

            if (response) {
                this.showNotification('Ziyaret kaydı başarıyla eklendi!', 'success');
                // Misafir listesini yenile
                await this.loadGuests();
            } else {
                this.showNotification('Ziyaret eklenirken beklenmeyen hata!', 'error');
            }
            
        } catch (error) {
            console.error('❌ Ziyaret ekleme hatası:', error);
            this.showNotification(error.message || 'Ziyaret eklenirken hata oluştu!', 'error');
        }
    }

    // Edit mode için form'u sıfırla
    resetFormForEdit() {
        const modal = document.getElementById('addGuestModal');
        if (modal) {
            const title = modal.querySelector('h2');
            const form = document.getElementById('addGuestForm');
            const saveBtn = form.querySelector('.save-btn');

            if (title) title.textContent = 'Yeni Misafir Ekle';
            if (saveBtn) saveBtn.textContent = 'Kaydet';
            if (form) form.onsubmit = (e) => this.handleAddGuest(e);
        }
    }

    // Bildirim gösterme
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        const colorMap = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };

        notification.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colorMap[type] || '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Çıkış işlemi
    logout() {
        this.guests = [];
        this.filteredGuests = [];
        
        // Kimlik verilerini temizle
        this.clearAuthData();
        
        this.hideMainContent();
        this.showLoginModal();
        
        // Form'u sıfırla
        document.getElementById('searchInput').value = '';
        this.resetForm();
        
        this.showNotification('Başarıyla çıkış yapıldı', 'info');
    }

    // Login modal'ını gizleme
    hideLoginModal() {
        document.getElementById('loginModal').style.display = 'none';
    }

    // Ana içeriği gösterme
    showMainContent() {
        document.getElementById('mainContent').classList.remove('hidden');
    }

    // Login modal'ını gösterme
    showLoginModal() {
        document.getElementById('loginModal').style.display = 'flex';
    }

    // Ana içeriği gizleme
    hideMainContent() {
        document.getElementById('mainContent').classList.add('hidden');
    }
}



// CSS animasyonları
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    @keyframes modalSlideIn {
        from { 
            transform: scale(0.8) translateY(-50px); 
            opacity: 0; 
        }
        to { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
        }
    }

    .user-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        color: #1e3c72;
        font-size: 0.9rem;
    }

    .user-role {
        background: #e3f2fd;
        color: #1e3c72;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
    }

    .guest-card-header {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .guest-actions {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        gap: 0.5rem;
    }

    .edit-btn, .delete-btn {
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .edit-btn {
        color: #2196f3;
    }

    .delete-btn {
        color: #f44336;
    }

    .edit-btn:hover, .delete-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .guest-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #f0f0f0;
    }

    .visit-btn {
        background: #4caf50;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }

    .visit-btn:hover {
        background: #45a049;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);

// Uygulamayı başlatma
document.addEventListener('DOMContentLoaded', () => {
    window.vipService = new VIPService();
}); 