const { Pool } = require('pg');

// PostgreSQL veritabanı bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
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
                photo_url VARCHAR(255),
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
        
        // Admin kullanıcısı ekle (şifre: admin123)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await client.query(`
            INSERT INTO users (username, password, full_name, role) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (username) DO NOTHING
        `, ['admin', hashedPassword, 'Admin User', 'admin']);
        console.log('Admin kullanıcısı eklendi (kullanıcı adı: admin, şifre: admin123)');
        
        // Staff kullanıcısı ekle (şifre: admin123)
        await client.query(`
            INSERT INTO users (username, password, full_name, role) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (username) DO NOTHING
        `, ['staff', hashedPassword, 'Staff User', 'staff']);
        console.log('Staff kullanıcısı eklendi (kullanıcı adı: staff, şifre: admin123)');
        
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
