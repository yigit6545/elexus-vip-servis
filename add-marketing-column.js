const { Pool } = require('pg');

// PostgreSQL veritabanı bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addMarketingColumn() {
    try {
        console.log('🔍 Marketing bilgisi kolonu ekleniyor...');
        
        // marketing_info kolonunu ekle
        const alterQuery = `
            ALTER TABLE guests 
            ADD COLUMN IF NOT EXISTS marketing_info TEXT
        `;
        
        await pool.query(alterQuery);
        console.log('✅ Marketing bilgisi kolonu eklendi');
        
        // Mevcut misafirlerin marketing_info kolonunu NULL olarak güncelle
        const updateQuery = `
            UPDATE guests 
            SET marketing_info = NULL 
            WHERE marketing_info IS NULL
        `;
        
        const result = await pool.query(updateQuery);
        console.log(`✅ ${result.rowCount} misafir güncellendi`);
        
        console.log('🎉 Marketing bilgisi kolonu başarıyla eklendi!');
        
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await pool.end();
    }
}

addMarketingColumn();
