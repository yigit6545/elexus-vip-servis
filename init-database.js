const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Veritabanı dosyası yolu
const dbPath = path.join(__dirname, 'vip_service.db');

// Veritabanı bağlantısı
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata:', err.message);
    } else {
        console.log('SQLite veritabanına başarıyla bağlandı.');
    }
});

// Veritabanını başlat
db.serialize(() => {
    // Kullanıcılar tablosu
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'staff',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    )`);

    // Misafirler tablosu
    db.run(`CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        class TEXT NOT NULL CHECK(class IN ('VIP', 'A', 'B', 'C', 'D', 'Lokal')),
        photo_path TEXT,
        alcohol TEXT,
        cigarette TEXT,
        cigar TEXT,
        special_requests TEXT,
        other_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users (id)
    )`);

    // Misafir ziyaretleri tablosu
    db.run(`CREATE TABLE IF NOT EXISTS guest_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_id INTEGER NOT NULL,
        visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_by INTEGER,
        FOREIGN KEY (guest_id) REFERENCES guests (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
    )`);

    // Örnek kullanıcı ekleme
    const defaultPassword = 'admin123';
    bcrypt.hash(defaultPassword, 10, (err, hash) => {
        if (err) {
            console.error('Şifre hash edilirken hata:', err);
            return;
        }

        // Admin kullanıcısı ekle
        db.run(`INSERT OR IGNORE INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)`,
            ['admin', hash, 'Sistem Yöneticisi', 'admin'],
            function(err) {
                if (err) {
                    console.error('Admin kullanıcısı eklenirken hata:', err);
                } else {
                    console.log('Admin kullanıcısı eklendi (kullanıcı adı: admin, şifre: admin123)');
                    
                    // Staff kullanıcısı ekle
                    db.run(`INSERT OR IGNORE INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)`,
                        ['staff', hash, 'VIP Servis Personeli', 'staff'],
                        function(err) {
                            if (err) {
                                console.error('Staff kullanıcısı eklenirken hata:', err);
                            } else {
                                console.log('Staff kullanıcısı eklendi (kullanıcı adı: staff, şifre: admin123)');
                            }
                            
                            // Misafir verilerini ekle
                            insertSampleGuests();
                        }
                    );
                }
            }
        );
    });

    // Örnek misafir verilerini ekleme fonksiyonu
    function insertSampleGuests() {
        const sampleGuests = [
            {
                name: 'Ahmet Yılmaz',
                class: 'VIP',
                alcohol: 'Whiskey, Vodka',
                cigarette: 'Marlboro Gold',
                cigar: 'Cohiba',
                specialRequests: 'Özel masada oturmak istiyor',
                otherInfo: 'Düzenli müşteri, her hafta geliyor'
            },
            {
                name: 'Fatma Demir',
                class: 'A',
                alcohol: 'Şarap, Kokteyl',
                cigarette: 'Benson & Hedges',
                cigar: '',
                specialRequests: 'Sessiz köşe masası',
                otherInfo: 'İlk kez geldi, özel ilgi gösterilmeli'
            },
            {
                name: 'Mehmet Kaya',
                class: 'B',
                alcohol: 'Bira, Tekila',
                cigarette: 'Camel',
                cigar: '',
                specialRequests: 'Canlı müzik yanında',
                otherInfo: 'Arkadaşlarıyla geliyor'
            },
            {
                name: 'Ayşe Özkan',
                class: 'VIP',
                alcohol: 'Şampanya, Kokteyl',
                cigarette: 'Vogue',
                cigar: 'Montecristo',
                specialRequests: 'VIP masada, özel servis',
                otherInfo: 'Çok önemli müşteri, özel ilgi'
            },
            {
                name: 'Can Arslan',
                class: 'C',
                alcohol: 'Bira, Viski',
                cigarette: 'Lucky Strike',
                cigar: '',
                specialRequests: 'Standart servis',
                otherInfo: 'Ara sıra geliyor'
            }
        ];

        // Örnek misafirleri ekle
        const insertGuest = db.prepare(`INSERT OR IGNORE INTO guests 
            (name, class, alcohol, cigarette, cigar, special_requests, other_info) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`);

        sampleGuests.forEach(guest => {
            insertGuest.run([
                guest.name,
                guest.class,
                guest.alcohol,
                guest.cigarette,
                guest.cigar,
                guest.specialRequests,
                guest.otherInfo
            ], function(err) {
                if (err) {
                    console.error(`${guest.name} eklenirken hata:`, err);
                } else {
                    console.log(`${guest.name} misafiri eklendi`);
                }
            });
        });

        insertGuest.finalize();
        
        // Tüm işlemler tamamlandıktan sonra veritabanını kapat
        setTimeout(() => {
            db.close((err) => {
                if (err) {
                    console.error('Veritabanı kapatılırken hata:', err.message);
                } else {
                    console.log('Veritabanı bağlantısı kapatıldı.');
                }
            });
        }, 1000);
    }



    console.log('Veritabanı tabloları oluşturuldu ve örnek veriler eklendi.');
    console.log('\nKullanım:');
    console.log('- npm start: Sunucuyu başlat');
    console.log('- npm run dev: Geliştirme modunda başlat');
    console.log('- npm run init-db: Veritabanını yeniden başlat');
});

 