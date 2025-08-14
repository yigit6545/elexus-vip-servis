const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Render.com için port binding
const HOST = '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JWT secret key (production'da environment variable kullanın)
const JWT_SECRET = process.env.JWT_SECRET || 'elexus-vip-service-secret-key-2024';

// PostgreSQL veritabanı bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Veritabanı bağlantısını test et
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('PostgreSQL veritabanına bağlanırken hata:', err.message);
    } else {
        console.log('PostgreSQL veritabanına başarıyla bağlandı.');
        console.log(`Sunucu ${PORT} portunda çalışıyor`);
    }
});

// Fotoğraf yükleme konfigürasyonu
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'guest-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları kabul edilir!'), false);
        }
    }
});

// JWT token doğrulama middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token gerekli' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Geçersiz token' });
        }
        req.user = user;
        next();
    });
};

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Misafir detay sayfası
app.get('/guest-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'guest-detail.html'));
});

// Kullanıcı girişi
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }

    pool.query('SELECT * FROM users WHERE username = $1', [username], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const user = result.rows[0];

        try {
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
            }

            // Son giriş zamanını güncelle
            pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

            // JWT token oluştur
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username, 
                    role: user.role,
                    fullName: user.full_name
                }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    fullName: user.full_name,
                    role: user.role
                }
            });

        } catch (error) {
            res.status(500).json({ error: 'Şifre doğrulama hatası' });
        }
    });
});

// Tüm misafirleri getir
app.get('/api/guests', authenticateToken, (req, res) => {
    const { search, class_filter } = req.query;
    
    let query = 'SELECT * FROM guests';
    let params = [];
    let conditions = [];

    if (search) {
        conditions.push(`(name LIKE $${params.length + 1} OR alcohol LIKE $${params.length + 2} OR cigarette LIKE $${params.length + 3} OR cigar LIKE $${params.length + 4} OR special_requests LIKE $${params.length + 5} OR other_info LIKE $${params.length + 6})`);
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (class_filter) {
        const classes = class_filter.split(',');
        conditions.push(`class IN (${classes.map(() => '$').join(',')})`);
        params.push(...classes);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    pool.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        res.json(result.rows);
    });
});

// Misafir ekle
app.post('/api/guests', authenticateToken, upload.single('photo'), (req, res) => {
    const { name, class: guestClass, alcohol, cigarette, cigar, specialRequests, otherInfo } = req.body;
    
    if (!name || !guestClass) {
        return res.status(400).json({ error: 'Ad ve sınıf gerekli' });
    }

    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
        INSERT INTO guests (name, class, photo_path, alcohol, cigarette, cigar, special_requests, other_info, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;

    pool.query(query, [
        name, guestClass, photoPath, alcohol || '', cigarette || '', cigar || '', 
        specialRequests || '', otherInfo || '', req.user.id
    ], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Misafir eklenirken hata oluştu' });
        }

        // Eklenen misafiri getir
        pool.query('SELECT * FROM guests WHERE id = $1', [result.rows[0].id], (err, guestResult) => {
            if (err) {
                return res.status(500).json({ error: 'Misafir bilgileri alınamadı' });
            }
            res.status(201).json(guestResult.rows[0]);
        });
    });
});

// Misafir güncelle
app.put('/api/guests/:id', authenticateToken, upload.single('photo'), (req, res) => {
    const { id } = req.params;
    const { name, class: guestClass, alcohol, cigarette, cigar, specialRequests, otherInfo } = req.body;
    
    if (!name || !guestClass) {
        return res.status(400).json({ error: 'Ad ve sınıf gerekli' });
    }

    let photoPath = null;
    if (req.file) {
        photoPath = `/uploads/${req.file.filename}`;
    }

    const query = `
        UPDATE guests 
        SET name = $1, class = $2, alcohol = $3, cigarette = $4, cigar = $5, 
            special_requests = $6, other_info = $7, updated_at = CURRENT_TIMESTAMP
        ${photoPath ? ', photo_path = $8' : ''}
        WHERE id = $9
        RETURNING *
    `;

    const params = photoPath ? 
        [name, guestClass, alcohol || '', cigarette || '', cigar || '', specialRequests || '', otherInfo || '', photoPath, id] :
        [name, guestClass, alcohol || '', cigarette || '', cigar || '', specialRequests || '', otherInfo || '', id];

    pool.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Misafir güncellenirken hata oluştu' });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Misafir bulunamadı' });
        }

        res.json(result.rows[0]);
    });
});

// Tek misafir getir
app.get('/api/guests/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT g.*, u.full_name as created_by_name
        FROM guests g
        LEFT JOIN users u ON g.created_by = u.id
        WHERE g.id = $1
    `;

    pool.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Misafir bulunamadı' });
        }

        res.json(result.rows[0]);
    });
});

// Misafir sil
app.delete('/api/guests/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    // Önce misafir bilgilerini al (fotoğraf silmek için)
    pool.query('SELECT photo_path FROM guests WHERE id = $1', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Misafir bulunamadı' });
        }

        const guest = result.rows[0];

        // Fotoğrafı sil
        if (guest.photo_path) {
            const photoPath = path.join(__dirname, guest.photo_path);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        // Misafiri sil
        pool.query('DELETE FROM guests WHERE id = $1', [id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Misafir silinirken hata oluştu' });
            }

            res.json({ message: 'Misafir başarıyla silindi' });
        });
    });
});

// Misafir ziyareti ekle
app.post('/api/guests/:id/visits', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    const query = 'INSERT INTO guest_visits (guest_id, notes, created_by) VALUES ($1, $2, $3) RETURNING *';

    pool.query(query, [id, notes || '', req.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Ziyaret kaydı eklenirken hata oluştu' });
        }

        res.status(201).json(result.rows[0]);
    });
});

// Misafir ziyaretlerini getir
app.get('/api/guests/:id/visits', authenticateToken, (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT gv.*, u.full_name as created_by_name
        FROM guest_visits gv
        LEFT JOIN users u ON gv.created_by = u.id
        WHERE gv.guest_id = $1
        ORDER BY gv.visit_date DESC
    `;

    pool.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        res.json(result.rows);
    });
});

// Kullanıcı profilini getir
app.get('/api/profile', authenticateToken, (req, res) => {
    pool.query('SELECT id, username, full_name, role, created_at, last_login FROM users WHERE id = $1', 
        [req.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        res.json(result.rows[0]);
    });
});

// İstatistikler
app.get('/api/stats', authenticateToken, (req, res) => {
    const queries = {
        totalGuests: 'SELECT COUNT(*) as count FROM guests',
        vipGuests: 'SELECT COUNT(*) as count FROM guests WHERE class = \'VIP\'',
        totalVisits: 'SELECT COUNT(*) as count FROM guest_visits',
        recentVisits: 'SELECT COUNT(*) as count FROM guest_visits WHERE visit_date >= CURRENT_DATE - INTERVAL \'7 days\'',
        classDistribution: 'SELECT class, COUNT(*) as count FROM guests GROUP BY class'
    };

    const stats = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    Object.keys(queries).forEach(key => {
        pool.query(queries[key], (err, result) => {
            if (err) {
                console.error(`${key} sorgusu hatası:`, err);
            } else {
                if (key === 'classDistribution') {
                    pool.query(queries[key], (err, results) => {
                        if (!err) {
                            stats[key] = results.rows;
                        }
                        completedQueries++;
                        if (completedQueries === totalQueries) {
                            res.json(stats);
                        }
                    });
                } else {
                    stats[key] = result.rows[0].count;
                    completedQueries++;
                    if (completedQueries === totalQueries) {
                        res.json(stats);
                    }
                }
            }
        });
    });
});

// Uploads klasörü için statik dosya servisi
app.use('/uploads', express.static('uploads'));

// Hata yakalama middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Sunucu hatası' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Sunucuyu başlat
app.listen(PORT, HOST, () => {
    console.log(`🚀 Elexus VIP Servis API sunucusu ${PORT} portunda çalışıyor`);
    console.log(`🌐 Host: ${HOST}`);
    console.log(`📋 Kullanım:`);
    console.log(`- npm run init-db: Veritabanını başlat`);
    console.log(`- npm start: Sunucuyu başlat`);
    console.log(`- npm run dev: Geliştirme modunda başlat`);
}); 