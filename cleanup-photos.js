const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL veritabanı bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function cleanupPhotos() {
    try {
        console.log('🔍 Fotoğraf temizliği başlatılıyor...');
        
        // Tüm misafirlerin fotoğraf yollarını al
        const result = await pool.query('SELECT id, name, photo_path FROM guests WHERE photo_path IS NOT NULL');
        
        console.log(`📸 ${result.rows.length} misafirde fotoğraf bulundu`);
        
        let cleanedCount = 0;
        
        for (const guest of result.rows) {
            if (guest.photo_path) {
                const photoPath = path.join(__dirname, guest.photo_path);
                
                // Dosya var mı kontrol et
                if (!fs.existsSync(photoPath)) {
                    console.log(`❌ Fotoğraf bulunamadı: ${guest.name} (${guest.photo_path})`);
                    
                    // Veritabanından fotoğraf yolunu temizle
                    await pool.query('UPDATE guests SET photo_path = NULL WHERE id = $1', [guest.id]);
                    cleanedCount++;
                    
                    console.log(`✅ ${guest.name} için fotoğraf yolu temizlendi`);
                } else {
                    console.log(`✅ Fotoğraf mevcut: ${guest.name} (${guest.photo_path})`);
                }
            }
        }
        
        console.log(`🎯 Toplam ${cleanedCount} misafirde eksik fotoğraf temizlendi`);
        
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await pool.end();
    }
}

// Script'i çalıştır
cleanupPhotos();
