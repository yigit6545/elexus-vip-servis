// VIP Servis Uygulaması - Veritabanı Entegrasyonu
class VIPService {
    constructor() {
        this.guests = [];
        this.filteredGuests = [];
        this.currentUser = null;
        this.authToken = null;
        this.apiBaseUrl = '/api';
        this.apiUrl = '/api'; // Admin fonksiyonları için
        this.isSubmitting = false; // Duplicate submit önleme flag'i
        this.init();
    }

    async init() {
        console.log('🚀 VIP Service başlatılıyor...');
        this.setupEventListeners();
        
        // Sadece ana sayfada authentication kontrolü yap
        if (document.getElementById('mainContent')) {
            console.log('🏠 Ana sayfa tespit edildi, authentication kontrolü yapılıyor...');
            const isAuthenticated = await this.checkAuthStatus();
            if (!isAuthenticated) {
                console.log('⚠️ Kullanıcı giriş yapmamış, login ekranı gösteriliyor');
                this.showLoginModal();
                return;
            }
            this.loadGuests();
        } else {
            console.log('📄 Diğer sayfa, authentication kontrolü atlanıyor...');
            this.loadPageContent();
        }
    }
    


    // Event listener'ları kurma
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Sayfa yenilendiğinde authentication'ı koru
        window.addEventListener('beforeunload', () => {
            if (this.authToken && this.currentUser) {
                localStorage.setItem('authPreserved', 'true');
            }
        });
        
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

        // Fotoğraf temizleme (admin)
        const cleanupPhotosBtn = document.getElementById('cleanupPhotosBtn');
        if (cleanupPhotosBtn) {
            cleanupPhotosBtn.addEventListener('click', () => this.cleanupAllPhotos());
        }

        // Ana menü dropdown
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        const menuItems = document.querySelectorAll('.menu-item');
        
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMainMenu();
            });
        }

        // Menü item'larına tıklama
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMenuNavigation(item.dataset.page);
            });
        });

        // Sayfa dışına tıklandığında menüyü kapat
        document.addEventListener('click', () => {
            this.closeMainMenu();
        });
    }
    
    // Sayfa türüne göre içerik yükleme
    loadPageContent() {
        const currentPage = this.getCurrentPage();
        console.log('📄 Mevcut sayfa:', currentPage);
        
        switch (currentPage) {
            case 'index':
                console.log('🏠 Ana sayfa içeriği yükleniyor...');
                this.loadGuests();
                break;
            case 'birthday':
                console.log('🎂 Doğum günleri sayfası içeriği yükleniyor...');
                this.loadBirthdays();
                break;
            case 'events':
                console.log('🎵 Etkinlikler sayfası içeriği yükleniyor...');
                this.loadEvents();
                break;
            default:
                console.log('❓ Bilinmeyen sayfa:', currentPage);
        }
    }
    
    // Mevcut sayfayı tespit et
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('birthday.html')) return 'birthday';
        if (path.includes('events.html')) return 'events';
        return 'index';
    }
    
    // Event listener'ları kurma
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Sayfa yenilendiğinde authentication'ı koru
        window.addEventListener('beforeunload', () => {
            if (this.authToken && this.currentUser) {
                localStorage.setItem('authPreserved', 'true');
            }
        });
        
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
            addGuestForm.addEventListener('click', (e) => this.handleAddGuest(e));
        }
        
        // Çıkış
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Fotoğraf temizleme (admin)
        const cleanupPhotosBtn = document.getElementById('cleanupPhotosBtn');
        if (cleanupPhotosBtn) {
            cleanupPhotosBtn.addEventListener('click', () => this.cleanupAllPhotos());
        }

        // Ana menü dropdown
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        const menuItems = document.querySelectorAll('.menu-item');
        
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMainMenu();
            });
        }

        // Menü item'larına tıklama
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMenuNavigation(item.dataset.page);
            });
        });

        // Sayfa dışına tıklandığında menüyü kapat
        document.addEventListener('click', () => {
            this.closeMainMenu();
        });
    }
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
        
        // Detay sayfasından dönüyorsa veya authentication korunuyorsa, token kontrolü yapmadan ana sayfayı göster
        const returningFromDetail = localStorage.getItem('returningFromDetail');
        const authPreserved = localStorage.getItem('authPreserved');
        
        if (returningFromDetail === 'true' || authPreserved === 'true') {
            console.log('🔄 Detay sayfasından dönüş veya authentication korunuyor, flag temizleniyor...');
            localStorage.removeItem('returningFromDetail');
            localStorage.removeItem('authPreserved');
            
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
        const lastLoginTime = localStorage.getItem('lastLoginTime');
        
        console.log('📱 Token var mı:', !!token);
        console.log('👤 Kullanıcı var mı:', !!user);
        console.log('🔑 Token değeri:', token ? token.substring(0, 20) + '...' : 'YOK');
        console.log('⏰ Son giriş zamanı:', lastLoginTime);
        
        // 24 saat kontrolü
        if (token && user && lastLoginTime) {
            const now = new Date().getTime();
            const loginTime = parseInt(lastLoginTime);
            const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60); // Saat cinsinden
            
            console.log('⏰ Son girişten bu yana geçen süre:', hoursSinceLogin.toFixed(2), 'saat');
            
            // 2 saatten fazla geçtiyse, localStorage'ı temizle
            if (hoursSinceLogin > 2) {
                console.log('⚠️ 2 saat geçti, localStorage temizleniyor...');
                this.clearAuthData();
                this.hideMainContent();
                this.showLoginModal();
                return false;
            }
        }
        
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
                
                // Arka planda token geçerliliğini kontrol et (sessizce)
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
                // Token geçersiz, ama kullanıcıyı hemen logout yapma
                // Sadece log ve uyarı ver
                console.log('⚠️ Token geçersiz, ancak kullanıcı deneyimi korunuyor');
                
                // Eğer 401 (Unauthorized) ise, token'ı yenilemeye çalış
                if (response.status === 401) {
                    console.log('🔄 Token yenilenmeye çalışılıyor...');
                    // Şimdilik sadece log, kullanıcıyı rahatsız etme
                }
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
            // Network hatası olabilir, token'ı geçersiz sayma
        }
    }

    // Kimlik verilerini temizle
    clearAuthData() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('lastLoginTime');
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
            localStorage.setItem('lastLoginTime', new Date().getTime().toString());

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

        // Admin kullanıcılar için temizlik butonunu göster
        const cleanupPhotosBtn = document.getElementById('cleanupPhotosBtn');
        if (cleanupPhotosBtn) {
            if (this.currentUser.role === 'admin') {
                cleanupPhotosBtn.style.display = 'inline-block';
            } else {
                cleanupPhotosBtn.style.display = 'none';
            }
        }
    }

    // Misafirleri yükle
    async loadGuests() {
        try {
            const guests = await this.apiRequest('/guests');
            this.guests = guests;
            this.filteredGuests = [...guests];
            this.renderGuests();
            this.updateGuestCount();
        } catch (error) {
            this.showNotification('Misafirler yüklenirken hata oluştu!', 'error');
        }
    }

    // Misafir sayısını güncelle
    updateGuestCount() {
        const totalCountElement = document.getElementById('totalGuestCount');
        if (totalCountElement) {
            const totalCount = this.guests.length;
            const filteredCount = this.filteredGuests.length;
            
            // Eğer filtreleme yapılmışsa, hem toplam hem de filtrelenmiş sayıyı göster
            if (filteredCount !== totalCount) {
                totalCountElement.textContent = `${filteredCount}/${totalCount}`;
            } else {
                totalCountElement.textContent = totalCount;
            }
            
            // Misafir sayısına göre renk değişimi
            const guestCountDiv = totalCountElement.closest('.guest-count');
            if (guestCountDiv) {
                const displayCount = filteredCount !== totalCount ? filteredCount : totalCount;
                
                if (displayCount === 0) {
                    guestCountDiv.style.background = '#ffebee';
                    guestCountDiv.style.color = '#c62828';
                    guestCountDiv.style.borderColor = '#ffcdd2';
                } else if (displayCount < 10) {
                    guestCountDiv.style.background = '#fff3e0';
                    guestCountDiv.style.color = '#ef6c00';
                    guestCountDiv.style.borderColor = '#ffcc02';
                } else {
                    guestCountDiv.style.background = '#e3f2fd';
                    guestCountDiv.style.color = '#2a5298';
                    guestCountDiv.style.borderColor = '#bbdefb';
                }
            }
        }
    }

    // Arama işlemi
    async searchGuests() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        
        if (!searchTerm) {
            this.filteredGuests = [...this.guests];
            this.renderGuests();
            this.updateGuestCount();
            return;
        }

        try {
            const guests = await this.apiRequest(`/guests?search=${encodeURIComponent(searchTerm)}`);
            this.filteredGuests = guests;
            this.renderGuests();
            this.updateGuestCount();
        } catch (error) {
            this.showNotification('Arama yapılırken hata oluştu!', 'error');
        }
    }

    // Arama input değişikliği
    handleSearchInput(e) {
        if (e.target.value === '') {
            this.filteredGuests = [...this.guests];
            this.renderGuests();
            this.updateGuestCount();
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
            const filterUrl = `/guests?class_filter=${encodeURIComponent(classFilter)}`;
            console.log('🔍 Filtreleme yapılıyor:', classFilter);
            console.log('🔍 Filtreleme URL:', filterUrl);
            
            const guests = await this.apiRequest(filterUrl);
            
            if (guests && Array.isArray(guests)) {
                this.filteredGuests = guests;
                this.renderGuests();
                this.updateGuestCount();
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
        
        // Edit mode flag'ini temizle
        const form = document.getElementById('addGuestForm');
        if (form) {
            delete form.dataset.editMode;
            delete form.dataset.editGuestId;
        }
        
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

        // Edit mode kontrolü
        const form = document.getElementById('addGuestForm');
        const isEditMode = form && form.dataset.editMode === 'true';
        const editGuestId = form && form.dataset.editGuestId;

        if (isEditMode && editGuestId) {
            console.log('🔍 Misafir güncelleniyor:', { guestId: editGuestId, name, guestClass });
            await this.handleUpdateGuest(e, editGuestId);
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
                    <div class="guest-photo">
                        ${guest.photo_path ? 
                            `<img src="${guest.photo_path}" alt="${guest.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                             <button class="photo-delete-btn" onclick="event.stopPropagation(); window.vipService.deleteGuestPhoto(${guest.id})" title="Fotoğrafı Sil">
                                 <i class="fas fa-trash"></i>
                             </button>` : 
                            ''
                        }
                        <div class="guest-photo-placeholder" style="${guest.photo_path ? 'display: none;' : 'display: flex;'}">
                            <span>${guest.name.substring(0, 2).toUpperCase()}</span>
                        </div>
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
                    <div class="detail-item">
                        <span class="detail-label">Marketing:</span>
                        <span class="detail-value">${guest.marketing_info || 'Yok'}</span>
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

        console.log('🔍 Misafir düzenleme modu:', { guestId, guestName: guest.name });

        // Form'u doldur
        document.getElementById('guestName').value = guest.name;
        document.getElementById('guestClass').value = guest.class;
        document.getElementById('guestAlcohol').value = guest.alcohol || '';
        document.getElementById('guestCigarette').value = guest.cigarette || '';
        document.getElementById('guestCigar').value = guest.cigar || '';
        document.getElementById('guestSpecialRequests').value = guest.special_requests || '';
        document.getElementById('guestOtherInfo').value = guest.other_info || '';
        document.getElementById('guestMarketing').value = guest.marketing_info || '';

        // Edit mode flag'i ekle
        const form = document.getElementById('addGuestForm');
        if (form) {
            form.dataset.editMode = 'true';
            form.dataset.editGuestId = guestId;
        }

        // Modal'ı düzenleme modunda aç
        const modal = document.getElementById('addGuestModal');
        if (modal) {
            const title = modal.querySelector('h2');
            const saveBtn = modal.querySelector('.submit-btn');

            if (title) title.textContent = 'Misafir Düzenle';
            if (saveBtn) saveBtn.textContent = 'Güncelle';
            
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

    // Misafir fotoğrafını silme
    async deleteGuestPhoto(guestId) {
        try {
            const confirmed = confirm('Bu misafirin fotoğrafını silmek istediğinizden emin misiniz?');
            if (!confirmed) return;

            const response = await fetch(`${this.apiUrl}/guests/${guestId}/photo`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Misafir listesini güncelle
                await this.loadGuests();
                this.showNotification('Fotoğraf başarıyla silindi', 'success');
            } else {
                const error = await response.json();
                this.showNotification(`Fotoğraf silinemedi: ${error.message}`, 'error');
            }
        } catch (error) {
            console.error('Fotoğraf silme hatası:', error);
            this.showNotification('Fotoğraf silinirken bir hata oluştu', 'error');
        }
    }

    // Tüm eksik fotoğrafları temizle (admin fonksiyonu)
    async cleanupAllPhotos() {
        try {
            const confirmed = confirm('Tüm eksik fotoğraf kayıtlarını temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
            if (!confirmed) return;

            this.showNotification('Fotoğraf temizliği başlatılıyor...', 'info');

            const response = await fetch(`${this.apiUrl}/admin/cleanup-photos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(`Fotoğraf temizliği tamamlandı! ${result.cleaned} eksik fotoğraf temizlendi.`, 'success');
                
                // Misafir listesini güncelle
                await this.loadGuests();
            } else {
                const error = await response.json();
                this.showNotification(`Temizlik hatası: ${error.message}`, 'error');
            }
        } catch (error) {
            console.error('Fotoğraf temizliği hatası:', error);
            this.showNotification('Fotoğraf temizliği sırasında bir hata oluştu', 'error');
        }
    }

    // Kullanıcıyı admin yap (geçici fonksiyon)
    async makeUserAdmin(username) {
        try {
            const response = await fetch(`${this.apiUrl}/admin/make-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(result.message, 'success');
                console.log('✅ Admin yapıldı:', result.user);
            } else {
                const error = await response.json();
                this.showNotification(`Admin yapma hatası: ${error.message}`, 'error');
            }
        } catch (error) {
            console.error('Admin yapma hatası:', error);
            this.showNotification('Admin yapma sırasında bir hata oluştu', 'error');
        }
    }

    // Ana menü işlevleri
    toggleMainMenu() {
        const dropdown = document.querySelector('.dropdown-content');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    }

    closeMainMenu() {
        const dropdown = document.querySelector('.dropdown-content');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    handleMenuNavigation(page) {
        // Aktif menü item'ını güncelle
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Sayfa navigasyonu
        switch (page) {
            case 'guests':
                this.showGuestsPage();
                break;
            case 'birthdays':
                this.showBirthdaysPage();
                break;
            case 'events':
                this.showEventsPage();
                break;
            default:
                this.showGuestsPage();
        }

        // Menüyü kapat
        this.closeMainMenu();
    }

    showGuestsPage() {
        // Ana sayfaya yönlendir
        window.location.href = 'index.html';
    }

    showBirthdaysPage() {
        // Doğum günü sayfasına yönlendir
        window.location.href = 'birthday.html';
    }

    showEventsPage() {
        // Etkinlik sayfasına yönlendir
        window.location.href = 'events.html';
    }

    // Login modal'ını gizleme
    hideLoginModal() {
        document.getElementById('loginModal').style.display = 'none';
    }

    // Ana içeriği gösterme
    showMainContent() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
    }

    // Login modal'ını gösterme
    showLoginModal() {
        document.getElementById('loginModal').style.display = 'flex';
    }

    // Ana içeriği gizleme
    hideMainContent() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.classList.add('hidden');
        }
    }

    // Doğum günü sayfası fonksiyonları
    async loadBirthdays() {
        try {
            // Sadece doğum günü sayfasında çalışsın
            if (!document.getElementById('birthdayList')) {
                console.log('Doğum günü sayfası değil, yükleme atlanıyor');
                return;
            }

            const response = await fetch(`${this.apiBaseUrl}/birthdays`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (!response.ok) throw new Error('Doğum günleri yüklenemedi');
            
            const birthdays = await response.json();
            this.renderBirthdays(birthdays);
            this.updateBirthdayCount(birthdays.length);
        } catch (error) {
            console.error('Doğum günleri yükleme hatası:', error);
            this.showNotification('Doğum günleri yüklenirken hata oluştu', 'error');
        }
    }

    renderBirthdays(birthdays) {
        const birthdayList = document.getElementById('birthdayList');
        if (!birthdayList) return;

        if (birthdays.length === 0) {
            birthdayList.innerHTML = '<div class="no-data">Henüz doğum günü eklenmemiş</div>';
            return;
        }

        birthdayList.innerHTML = birthdays.map(birthday => `
            <div class="guest-card" onclick="window.vipService.editBirthday(${birthday.id})">
                <div class="guest-photo">
                    ${birthday.photo_path ? 
                        `<img src="${birthday.photo_path}" alt="${birthday.guest_name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="no-photo" style="display: none;">
                             <i class="fas fa-user"></i>
                         </div>` :
                        `<div class="no-photo">
                             <i class="fas fa-user"></i>
                         </div>`
                    }
                </div>
                <div class="guest-info">
                    <h3>${birthday.guest_name}</h3>
                    <div class="detail-item">
                        <span class="detail-label">Doğum Günü:</span>
                        <span class="detail-value">${new Date(birthday.birth_date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">VIP Sınıfı:</span>
                        <span class="detail-value">${birthday.vip_class || 'Belirtilmemiş'}</span>
                    </div>
                    ${birthday.notes ? `
                        <div class="detail-item">
                            <span class="detail-label">Notlar:</span>
                            <span class="detail-value">${birthday.notes}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="guest-actions">
                    <button class="edit-btn" onclick="event.stopPropagation(); window.vipService.editBirthday(${birthday.id})" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="event.stopPropagation(); window.vipService.deleteBirthday(${birthday.id})" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateBirthdayCount(count) {
        const countElement = document.getElementById('totalBirthdayCount');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    // Etkinlik sayfası fonksiyonları
    async loadEvents() {
        try {
            // Sadece etkinlik sayfasında çalışsın
            if (!document.getElementById('eventList')) {
                console.log('Etkinlik sayfası değil, yükleme atlanıyor');
                return;
            }

            const response = await fetch(`${this.apiBaseUrl}/events`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (!response.ok) throw new Error('Etkinlikler yüklenemedi');
            
            const events = await response.json();
            this.renderEvents(events);
            this.updateEventCount(events.length);
        } catch (error) {
            console.error('Etkinlikler yükleme hatası:', error);
            this.showNotification('Etkinlikler yüklenirken hata oluştu', 'error');
        }
    }

    renderEvents(events) {
        const eventList = document.getElementById('eventList');
        if (!eventList) return;

        if (events.length === 0) {
            eventList.innerHTML = '<div class="no-data">Henüz etkinlik eklenmemiş</div>';
            return;
        }

        eventList.innerHTML = events.map(event => `
            <div class="guest-card" onclick="window.vipService.editEvent(${event.id})">
                <div class="guest-photo">
                    ${event.photo_path ? 
                        `<img src="${event.photo_path}" alt="${event.event_name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="no-photo" style="display: none;">
                             <i class="fas fa-music"></i>
                         </div>` :
                        `<div class="no-photo">
                             <i class="fas fa-music"></i>
                         </div>`
                    }
                </div>
                <div class="guest-info">
                    <h3>${event.event_name}</h3>
                    <div class="detail-item">
                        <span class="detail-label">Tür:</span>
                        <span class="detail-value">${this.getEventTypeLabel(event.event_type)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tarih:</span>
                        <span class="detail-value">${new Date(event.event_date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    ${event.event_time ? `
                        <div class="detail-item">
                            <span class="detail-label">Saat:</span>
                            <span class="detail-value">${event.event_time}</span>
                        </div>
                    ` : ''}
                    <div class="detail-item">
                        <span class="detail-label">Yer:</span>
                        <span class="detail-value">${event.location}</span>
                    </div>
                    ${event.description ? `
                        <div class="detail-item">
                            <span class="detail-label">Açıklama:</span>
                            <span class="detail-value">${event.description}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="guest-actions">
                    <button class="edit-btn" onclick="event.stopPropagation(); window.vipService.editEvent(${event.id})" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="event.stopPropagation(); window.vipService.deleteEvent(${event.id})" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateEventCount(count) {
        const countElement = document.getElementById('totalEventCount');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    getEventTypeLabel(type) {
        const labels = {
            'concert': 'Konser',
            'party': 'Parti',
            'show': 'Show',
            'other': 'Diğer'
        };
        return labels[type] || type;
    }

    // Modal işlemleri
    showAddBirthdayModal() {
        const modal = document.getElementById('addBirthdayModal');
        if (modal) modal.style.display = 'flex';
    }

    closeAddBirthdayModal() {
        const modal = document.getElementById('addBirthdayModal');
        if (modal) modal.style.display = 'none';
    }

    showAddEventModal() {
        const modal = document.getElementById('addEventModal');
        if (modal) modal.style.display = 'flex';
    }

    closeAddEventModal() {
        const modal = document.getElementById('addEventModal');
        if (modal) modal.style.display = 'none';
    }

    // Doğum günü CRUD işlemleri
    async addBirthday(formData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/birthdays`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Doğum günü eklenemedi');

            const newBirthday = await response.json();
            this.showNotification('Doğum günü başarıyla eklendi!', 'success');
            this.closeAddBirthdayModal();
            this.loadBirthdays(); // Listeyi yenile

            return newBirthday;
        } catch (error) {
            console.error('Doğum günü ekleme hatası:', error);
            this.showNotification('Doğum günü eklenirken hata oluştu', 'error');
            throw error;
        }
    }

    async editBirthday(birthdayId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/birthdays/${birthdayId}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error('Doğum günü bilgileri alınamadı');

            const birthday = await response.json();
            this.showEditBirthdayModal(birthday);
        } catch (error) {
            console.error('Doğum günü düzenleme hatası:', error);
            this.showNotification('Doğum günü düzenlenirken hata oluştu', 'error');
        }
    }

    async updateBirthday(birthdayId, formData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/birthdays/${birthdayId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Doğum günü güncellenemedi');

            const updatedBirthday = await response.json();
            this.showNotification('Doğum günü başarıyla güncellendi!', 'success');
            this.closeEditBirthdayModal();
            this.loadBirthdays(); // Listeyi yenile

            return updatedBirthday;
        } catch (error) {
            console.error('Doğum günü güncelleme hatası:', error);
            this.showNotification('Doğum günü güncellenirken hata oluştu', 'error');
            throw error;
        }
    }

    async deleteBirthday(birthdayId) {
        if (!confirm('Bu doğum gününü silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/birthdays/${birthdayId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error('Doğum günü silinemedi');

            this.showNotification('Doğum günü başarıyla silindi!', 'success');
            this.loadBirthdays(); // Listeyi yenile
        } catch (error) {
            console.error('Doğum günü silme hatası:', error);
            this.showNotification('Doğum günü silinirken hata oluştu', 'error');
        }
    }

    // Etkinlik CRUD işlemleri
    async addEvent(formData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Etkinlik eklenemedi');

            const newEvent = await response.json();
            this.showNotification('Etkinlik başarıyla eklendi!', 'success');
            this.closeAddEventModal();
            this.loadEvents(); // Listeyi yenile

            return newEvent;
        } catch (error) {
            console.error('Etkinlik ekleme hatası:', error);
            this.showNotification('Etkinlik eklenirken hata oluştu', 'error');
            throw error;
        }
    }

    async editEvent(eventId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error('Etkinlik bilgileri alınamadı');

            const event = await response.json();
            this.showEditEventModal(event);
        } catch (error) {
            console.error('Etkinlik düzenleme hatası:', error);
            this.showNotification('Etkinlik düzenlenirken hata oluştu', 'error');
        }
    }

    async updateEvent(eventId, formData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Etkinlik güncellenemedi');

            const updatedEvent = await response.json();
            this.showNotification('Etkinlik başarıyla güncellendi!', 'success');
            this.closeEditEventModal();
            this.loadEvents(); // Listeyi yenile

            return updatedEvent;
        } catch (error) {
            console.error('Etkinlik güncelleme hatası:', error);
            this.showNotification('Etkinlik güncellenirken hata oluştu', 'error');
            throw error;
        }
    }

    async deleteEvent(eventId) {
        if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error('Etkinlik silinemedi');

            this.showNotification('Etkinlik başarıyla silindi!', 'success');
            this.loadEvents(); // Listeyi yenile
        } catch (error) {
            console.error('Etkinlik silme hatası:', error);
            this.showNotification('Etkinlik silinirken hata oluştu', 'error');
        }
    }

    // Form işleme yardımcı fonksiyonları
    createFormData(form) {
        const formData = new FormData();
        
        // Form alanlarını FormData'ya ekle
        const formElements = form.elements;
        for (let element of formElements) {
            if (element.name && element.value) {
                if (element.type === 'file' && element.files[0]) {
                    formData.append(element.name, element.files[0]);
                } else if (element.type !== 'file') {
                    formData.append(element.name, element.value);
                }
            }
        }
        
        return formData;
    }

    // Modal gösterme/gizleme yardımcı fonksiyonları
    showEditBirthdayModal(birthday) {
        const modal = document.getElementById('editBirthdayModal');
        if (!modal) return;
        
        // Form alanlarını doldur
        document.getElementById('editBirthdayId').value = birthday.id;
        document.getElementById('editBirthdayName').value = birthday.guest_name;
        document.getElementById('editBirthdayDate').value = birthday.birth_date;
        document.getElementById('editBirthdayClass').value = birthday.vip_class || '';
        document.getElementById('editBirthdayNotes').value = birthday.notes || '';
        
        // Modal'ı göster
        modal.style.display = 'block';
    }

    closeEditBirthdayModal() {
        const modal = document.getElementById('editBirthdayModal');
        if (modal) modal.style.display = 'none';
    }

    showEditEventModal(event) {
        const modal = document.getElementById('editEventModal');
        if (!modal) return;
        
        // Form alanlarını doldur
        document.getElementById('editEventName').value = event.event_name;
        document.getElementById('editEventType').value = event.event_type;
        document.getElementById('editEventDate').value = event.event_date;
        document.getElementById('editEventTime').value = event.event_time || '';
        document.getElementById('editEventLocation').value = event.location;
        document.getElementById('editEventDescription').value = event.description || '';
        
        // Modal'ı göster
        modal.style.display = 'block';
    }

    closeEditEventModal() {
        const modal = document.getElementById('editEventModal');
        if (modal) modal.style.display = 'none';
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