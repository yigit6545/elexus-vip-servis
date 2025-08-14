// Misafir Detay Sayfası JavaScript
class GuestDetailManager {
    constructor() {
        this.currentGuest = null;
        this.visits = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGuestFromURL();
    }

    setupEventListeners() {
        // Ziyaret ekleme formu
        document.getElementById('addVisitForm').addEventListener('submit', (e) => this.handleAddVisit(e));
    }

    // URL'den misafir bilgilerini yükle
    loadGuestFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const guestId = urlParams.get('id');
        
        if (guestId) {
            this.loadGuestDetails(guestId);
        } else {
            this.showError('Misafir ID bulunamadı!');
        }
    }

    // Misafir detaylarını yükle
    async loadGuestDetails(guestId) {
        try {
            // JWT token kontrolü
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                this.showError('Giriş yapmanız gerekiyor!');
                return;
            }

            const response = await fetch(`/api/guests/${guestId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Misafir bulunamadı');
                } else if (response.status === 401) {
                    throw new Error('Yetkilendirme hatası - tekrar giriş yapın');
                } else {
                    throw new Error(`Sunucu hatası: ${response.status}`);
                }
            }

            this.currentGuest = await response.json();
            this.displayGuestDetails();
            this.loadGuestVisits(guestId);
            
        } catch (error) {
            console.error('Misafir yükleme hatası:', error);
            this.showError(error.message);
        }
    }

    // Misafir ziyaretlerini yükle
    async loadGuestVisits(guestId) {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) return;

            const response = await fetch(`/api/guests/${guestId}/visits`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.visits = await response.json();
                this.displayVisits();
            } else {
                console.error('Ziyaretler yüklenemedi:', response.status);
            }
        } catch (error) {
            console.error('Ziyaretler yüklenirken hata:', error);
        }
    }

    // Misafir detaylarını görüntüle
    displayGuestDetails() {
        if (!this.currentGuest) return;

        // Temel bilgiler
        document.getElementById('guestInitials').textContent = this.currentGuest.name.substring(0, 2).toUpperCase();
        document.getElementById('guestName').textContent = this.currentGuest.name;
        document.getElementById('guestClass').textContent = this.currentGuest.class;
        document.getElementById('guestId').textContent = this.currentGuest.id;

        // İçecek tercihleri
        document.getElementById('guestAlcohol').textContent = this.currentGuest.alcohol || 'Belirtilmemiş';
        document.getElementById('guestCigarette').textContent = this.currentGuest.cigarette || 'Belirtilmemiş';
        document.getElementById('guestCigar').textContent = this.currentGuest.cigar || 'Yok';

        // Özel istekler ve diğer bilgiler
        document.getElementById('guestSpecialRequests').textContent = this.currentGuest.special_requests || 'Yok';
        document.getElementById('guestOtherInfo').textContent = this.currentGuest.other_info || 'Yok';

        // Tarih bilgileri
        const createdAt = new Date(this.currentGuest.created_at).toLocaleDateString('tr-TR');
        const updatedAt = this.currentGuest.updated_at ? 
            new Date(this.currentGuest.updated_at).toLocaleDateString('tr-TR') : 'Güncellenmedi';
        
        document.getElementById('guestCreatedAt').textContent = createdAt;
        document.getElementById('guestUpdatedAt').textContent = updatedAt;
        document.getElementById('guestCreatedBy').textContent = 'Admin'; // Şimdilik sabit

        // Sayfa başlığını güncelle
        document.title = `${this.currentGuest.name} - Elexus VIP Servis`;
    }

    // Ziyaretleri görüntüle
    displayVisits() {
        const visitList = document.getElementById('visitList');
        
        if (this.visits.length === 0) {
            visitList.innerHTML = `
                <div class="no-visits">
                    <i class="fas fa-calendar-times"></i>
                    <p>Henüz ziyaret kaydı bulunmuyor</p>
                </div>
            `;
            return;
        }

        visitList.innerHTML = this.visits.map(visit => `
            <div class="visit-item">
                <div class="visit-header">
                    <div class="visit-date">
                        <i class="fas fa-calendar"></i>
                        ${new Date(visit.visit_date).toLocaleDateString('tr-TR')}
                    </div>
                    <div class="visit-time">
                        ${new Date(visit.visit_date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
                <div class="visit-notes">
                    <p>${visit.notes || 'Not eklenmemiş'}</p>
                </div>
                <div class="visit-created-by">
                    <small>Ekleyen: ${visit.created_by_name || 'Bilinmiyor'}</small>
                </div>
            </div>
        `).join('');
    }

    // Yeni ziyaret ekleme
    addNewVisit() {
        document.getElementById('addVisitModal').style.display = 'flex';
        document.getElementById('visitNotes').focus();
    }

    // Ziyaret ekleme modal'ını kapat
    closeAddVisitModal() {
        document.getElementById('addVisitModal').style.display = 'none';
        document.getElementById('addVisitForm').reset();
    }

    // Ziyaret ekleme işlemi
    async handleAddVisit(e) {
        e.preventDefault();
        
        const notes = document.getElementById('visitNotes').value.trim();
        if (!notes) return;

        try {
            const response = await fetch(`/api/guests/${this.currentGuest.id}/visits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ notes })
            });

            if (response.ok) {
                this.closeAddVisitModal();
                this.loadGuestVisits(this.currentGuest.id);
                this.showNotification('Ziyaret başarıyla eklendi!', 'success');
            } else {
                throw new Error('Ziyaret eklenirken hata oluştu');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Misafir düzenleme
    editGuest() {
        // Ana sayfaya yönlendir ve düzenleme modunu aç
        window.location.href = `/?edit=${this.currentGuest.id}`;
    }

    // Misafir silme
    async deleteGuest() {
        if (!confirm(`"${this.currentGuest.name}" misafirini silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/guests/${this.currentGuest.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                this.showNotification('Misafir başarıyla silindi!', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                throw new Error('Misafir silinirken hata oluştu');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Detay sayfasını kapat
    closeGuestDetail() {
        // Ana sayfaya dön, sayfayı yeniden yükleme
        // localStorage'da bir flag koy ki ana sayfa login istemesin
        localStorage.setItem('returningFromDetail', 'true');
        
        // Ana sayfaya yönlendir
                    window.location.href = '/';
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

    // Hata gösterme
    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Global fonksiyonlar
function closeGuestDetail() {
    window.guestDetailManager.closeGuestDetail();
}

function addNewVisit() {
    window.guestDetailManager.addNewVisit();
}

function closeAddVisitModal() {
    window.guestDetailManager.closeAddVisitModal();
}

function editGuest() {
    window.guestDetailManager.editGuest();
}

function deleteGuest() {
    window.guestDetailManager.deleteGuest();
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
`;
document.head.appendChild(style);

// Uygulamayı başlatma
document.addEventListener('DOMContentLoaded', () => {
    window.guestDetailManager = new GuestDetailManager();
}); 