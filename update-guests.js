const { Pool } = require('pg');

// PostgreSQL veritabanı bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://elexus_vip_db_user:YKiblvBhmWSJMgAxvtxkDhZ5jXnJc9k1@dpg-d2ec7uvdiees73fn446g-a.oregon-postgres.render.com/elexus_vip_db',
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com') ? {
        rejectUnauthorized: false
    } : false
});

async function updateGuests() {
    try {
        console.log('🔧 Misafirler güncelleniyor...');
        
        const client = await pool.connect();
        console.log('✅ PostgreSQL veritabanına başarıyla bağlandı.');

        // Hüseyin kullanıcısının ID'sini al
        const userResult = await client.query('SELECT id FROM users WHERE username = $1', ['hüseyin']);
        if (userResult.rows.length === 0) {
            throw new Error('Hüseyin kullanıcısı bulunamadı!');
        }
        
        const userId = userResult.rows[0].id;
        console.log(`👤 Hüseyin kullanıcı ID: ${userId}`);

        // Mevcut misafirleri güncelle
        const updateResult = await client.query(`
            UPDATE guests 
            SET created_by = $1, updated_at = CURRENT_TIMESTAMP
            WHERE created_by IS NULL
        `, [userId]);
        
        console.log(`✅ ${updateResult.rowCount} misafir güncellendi`);

        // Güncellenmiş misafirleri göster
        const guestsResult = await client.query(`
            SELECT id, name, class, created_by, created_at 
            FROM guests 
            ORDER BY id
        `);
        
        console.log('\n📊 Güncellenmiş misafirler:');
        guestsResult.rows.forEach(guest => {
            console.log(`  - ID: ${guest.id}, Ad: ${guest.name}, Sınıf: ${guest.class}, Oluşturan: ${guest.created_by}, Tarih: ${guest.created_at}`);
        });

        client.release();
        console.log('\n🎉 Misafir güncelleme tamamlandı!');
        
    } catch (error) {
        console.error('❌ Misafir güncelleme hatası:', error);
    } finally {
        await pool.end();
        console.log('🔌 Veritabanı bağlantısı kapatıldı.');
    }
}

updateGuests();
