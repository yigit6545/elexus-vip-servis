@echo off
echo ========================================
echo Elexus VIP Servis Kurulum Script'i
echo ========================================
echo.

echo Node.js kontrol ediliyor...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Node.js bulunamadi!
    echo Lütfen https://nodejs.org adresinden Node.js'i indirin ve kurun.
    echo Kurulumdan sonra bu script'i tekrar çalıştırın.
    pause
    exit /b 1
)

echo Node.js bulundu: 
node --version
echo.

echo NPM paketleri yükleniyor...
npm install
if %errorlevel% neq 0 (
    echo HATA: Paket yükleme başarısız!
    pause
    exit /b 1
)

echo.
echo Veritabanı başlatılıyor...
npm run init-db
if %errorlevel% neq 0 (
    echo HATA: Veritabanı başlatılamadı!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Kurulum tamamlandı!
echo ========================================
echo.
echo Sunucuyu başlatmak için:
echo   npm start
echo.
echo Geliştirme modunda başlatmak için:
echo   npm run dev
echo.
echo Tarayıcıda açmak için:
echo   http://localhost:3000
echo.
echo Giriş bilgileri:
echo   Admin: admin / admin123
echo   Staff: staff / admin123
echo.
pause 