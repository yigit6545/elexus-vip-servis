const { Pool } = require('pg');

// PostgreSQL veritabanı bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com') ? {
        rejectUnauthorized: false
    } : false
});

async function initDatabase() {
    try {
        console.log('PostgreSQL veritabanına bağlanılıyor...');
        
        // Veritabanı bağlantısını test et
        const client = await pool.connect();
        console.log('PostgreSQL veritabanına başarıyla bağlandı.');
        
        // Kullanıcılar tablosu
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT 'staff',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        `);
        console.log('Users tablosu oluşturuldu.');
        
        // Misafirler tablosu
        await client.query(`
            CREATE TABLE IF NOT EXISTS guests (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                class VARCHAR(20) DEFAULT 'Lokal',
                alcohol VARCHAR(100),
                cigarette VARCHAR(100),
                cigar VARCHAR(100),
                special_requests TEXT,
                other_info TEXT,
                marketing_info TEXT,
                photo_path VARCHAR(255),
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Guests tablosu oluşturuldu.');
        
        // Misafir ziyaretleri tablosu
        await client.query(`
            CREATE TABLE IF NOT EXISTS guest_visits (
                id SERIAL PRIMARY KEY,
                guest_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
                visit_date DATE NOT NULL,
                notes TEXT,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Guest visits tablosu oluşturuldu.');
        
        // Doğum günleri tablosu
        await client.query(`
            CREATE TABLE IF NOT EXISTS birthdays (
                id SERIAL PRIMARY KEY,
                guest_name VARCHAR(100) NOT NULL,
                birth_date DATE NOT NULL,
                vip_class VARCHAR(20) DEFAULT 'Lokal',
                photo_path VARCHAR(255),
                notes TEXT,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Birthdays tablosu oluşturuldu.');
        
        // Etkinlikler tablosu
        await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                event_name VARCHAR(100) NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                event_date DATE NOT NULL,
                event_time TIME,
                location VARCHAR(255) NOT NULL,
                photo_path VARCHAR(255),
                description TEXT,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Events tablosu oluşturuldu.');
        
        // Hüseyin kullanıcısı ekle (şifre: 20252025)
        const bcrypt = require('bcryptjs');
        const hashedPassword1 = await bcrypt.hash('20252025', 10);
        
        await client.query(`
            INSERT INTO users (username, password, full_name, role) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (username) DO NOTHING
        `, ['hüseyin', hashedPassword1, 'Hüseyin - VIP Servis', 'admin']);
        console.log('Hüseyin kullanıcısı eklendi (kullanıcı adı: hüseyin, şifre: 20252025)');
        
        // Yiğit kullanıcısı ekle (şifre: 20252025)
        const hashedPassword2 = await bcrypt.hash('20252025', 10);
        await client.query(`
            INSERT INTO users (username, password, full_name, role) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (username) DO NOTHING
        `, ['yigit', hashedPassword2, 'Yiğit - VIP Servis', 'admin']);
        console.log('Yiğit kullanıcısı eklendi (kullanıcı adı: yigit, şifre: 20252025)');
        
        // Örnek misafirler ekle
        const sampleGuests = [
            ['Ahmet Yılmaz', 'VIP', 'Vodka', 'Marlboro', 'Cohiba', 'Özel masada oturmak istiyor'],
            ['Fatma Demir', 'A', 'Şarap', 'Parliament', null, 'Sessiz köşe tercih ediyor'],
            ['Mehmet Kaya', 'B', 'Bira', 'Camel', null, 'Masa 7\'de oturmak istiyor'],
            ['Ayşe Özkan', 'C', 'Gin', 'Menthol', null, 'Pencere kenarı tercih ediyor'],
            ['Can Arslan', 'Lokal', 'Viski', 'Marlboro', 'Montecristo', 'VIP masada oturmak istiyor']
        ];
        
        for (const guest of sampleGuests) {
            await client.query(`
                INSERT INTO guests (name, class, alcohol, cigarette, cigar, special_requests) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `, guest);
        }
        console.log('5 örnek misafir eklendi.');
        
        // Örnek doğum günleri ekle
        const sampleBirthdays = [
            ['Ahmet Yılmaz', '2024-03-15', 'VIP', 'Özel müşteri, her yıl kutlama yapılıyor'],
            ['Fatma Demir', '2024-06-22', 'A', 'Pasta ve mum tercih ediyor'],
            ['Mehmet Kaya', '2024-09-08', 'B', 'Küçük kutlama yeterli']
        ];
        
        for (const birthday of sampleBirthdays) {
            await client.query(`
                INSERT INTO birthdays (guest_name, birth_date, vip_class, notes) 
                VALUES ($1, $2, $3, $4)
            `, birthday);
        }
        console.log('3 örnek doğum günü eklendi.');
        
        // Örnek etkinlikler ekle
        const sampleEvents = [
            ['Yaz Konseri', 'concert', '2024-07-15', '21:00', 'Açık Hava Sahne', 'Büyük yaz konseri'],
            ['VIP Parti', 'party', '2024-08-20', '22:00', 'Ana Salon', 'Özel VIP müşteri partisi'],
            ['Show Gecesi', 'show', '2024-09-10', '20:00', 'Show Sahnesi', 'Dans ve müzik gösterisi']
        ];
        
        for (const event of sampleEvents) {
            await client.query(`
                INSERT INTO events (event_name, event_type, event_date, event_time, location, description) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `, event);
        }
        console.log('3 örnek etkinlik eklendi.');
        
        client.release();
        console.log('Veritabanı tabloları oluşturuldu ve örnek veriler eklendi.');
        
    } catch (error) {
        console.error('Veritabanı başlatma hatası:', error);
    } finally {
        await pool.end();
        console.log('Veritabanı bağlantısı kapatıldı.');
    }
}

// Script'i çalıştır
initDatabase();
