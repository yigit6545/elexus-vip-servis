const { Pool } = require('pg');

// PostgreSQL veritabanı bağlantısı
const pool = new Pool({
    connectionString: 'postgresql://elexus_vip_db_user:YKiblvBhmWSJMgAxvtxkDhZ5jXnJc9k1@dpg-d2ec7uvdiees73fn446g-a.oregon-postgres.render.com/elexus_vip_db',
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixDatabase() {
    try {
        console.log('🔧 Veritabanı düzeltiliyor...');
        
        const client = await pool.connect();
        console.log('✅ PostgreSQL veritabanına başarıyla bağlandı.');

        // Mevcut tabloları kontrol et
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('📋 Mevcut tablolar:', tablesResult.rows.map(r => r.table_name));

        // Guests tablosunu düzelt
        console.log('🔧 Guests tablosu düzeltiliyor...');
        
        // Eksik kolonları ekle
        try {
            await client.query('ALTER TABLE guests ADD COLUMN IF NOT EXISTS other_info TEXT');
            console.log('✅ other_info kolonu eklendi');
        } catch (error) {
            console.log('ℹ️ other_info kolonu zaten var');
        }

        try {
            await client.query('ALTER TABLE guests ADD COLUMN IF NOT EXISTS photo_path VARCHAR(255)');
            console.log('✅ photo_path kolonu eklendi');
        } catch (error) {
            console.log('ℹ️ photo_path kolonu zaten var');
        }

        try {
            await client.query('ALTER TABLE guests ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)');
            console.log('✅ created_by kolonu eklendi');
        } catch (error) {
            console.log('ℹ️ created_by kolonu zaten var');
        }

        // Tablo yapısını göster
        const columnsResult = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'guests'
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 Guests tablosu yapısı:');
        columnsResult.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        // Mevcut misafirleri kontrol et
        const guestsResult = await client.query('SELECT COUNT(*) as count FROM guests');
        console.log(`\n👥 Toplam misafir sayısı: ${guestsResult.rows[0].count}`);

        // Mevcut kullanıcıları kontrol et
        const usersResult = await client.query('SELECT username, full_name, role FROM users');
        console.log('\n👤 Mevcut kullanıcılar:');
        usersResult.rows.forEach(user => {
            console.log(`  - ${user.username}: ${user.full_name} (${user.role})`);
        });

        client.release();
        console.log('\n🎉 Veritabanı düzeltme tamamlandı!');
        
    } catch (error) {
        console.error('❌ Veritabanı düzeltme hatası:', error);
    } finally {
        await pool.end();
        console.log('🔌 Veritabanı bağlantısı kapatıldı.');
    }
}

fixDatabase();
