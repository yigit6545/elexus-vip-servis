const { Pool } = require('pg');

// PostgreSQL veritabanı bağlantısı
const pool = new Pool({
    connectionString: 'postgresql://elexus_vip_db_user:YKiblvBhmWSJMgAxvtxkDhZ5jXnJc9k1@dpg-d2ec7uvdiees73fn446g-a.oregon-postgres.render.com/elexus_vip_db',
    ssl: {
        rejectUnauthorized: false
    }
});

async function addNewUsers() {
    try {
        console.log('PostgreSQL veritabanına bağlanılıyor...');
        
        // Veritabanı bağlantısını test et
        const client = await pool.connect();
        console.log('PostgreSQL veritabanına başarıyla bağlandı.');
        
        // Eski kullanıcıları sil
        await client.query('DELETE FROM users WHERE username IN ($1, $2)', ['admin', 'staff']);
        console.log('Eski admin ve staff kullanıcıları silindi.');
        
        // Hüseyin kullanıcısı ekle (şifre: 20252025)
        const bcrypt = require('bcryptjs');
        const hashedPassword1 = await bcrypt.hash('20252025', 10);
        
        await client.query(`
            INSERT INTO users (username, password, full_name, role) 
            VALUES ($1, $2, $3, $4)
        `, ['hüseyin', hashedPassword1, 'Hüseyin - VIP Servis', 'admin']);
        console.log('Hüseyin kullanıcısı eklendi (kullanıcı adı: hüseyin, şifre: 20252025)');
        
        // Yiğit kullanıcısı ekle (şifre: 20252025)
        const hashedPassword2 = await bcrypt.hash('20252025', 10);
        await client.query(`
            INSERT INTO users (username, password, full_name, role) 
            VALUES ($1, $2, $3, $4)
        `, ['yigit', hashedPassword2, 'Yiğit - VIP Servis', 'admin']);
        console.log('Yiğit kullanıcısı eklendi (kullanıcı adı: yigit, şifre: 20252025)');
        
        // Kullanıcıları listele
        const result = await client.query('SELECT username, full_name, role FROM users');
        console.log('\nMevcut kullanıcılar:');
        result.rows.forEach(user => {
            console.log(`- ${user.username}: ${user.full_name} (${user.role})`);
        });
        
        client.release();
        console.log('\nYeni kullanıcılar başarıyla eklendi!');
        
    } catch (error) {
        console.error('Kullanıcı ekleme hatası:', error);
    } finally {
        await pool.end();
        console.log('Veritabanı bağlantısı kapatıldı.');
    }
}

// Script'i çalıştır
addNewUsers();
