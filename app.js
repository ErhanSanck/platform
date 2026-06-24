/**
 * DersPlatformu - Genel Uygulama Mantığı (Dinamik Fiyatlar ve Başvurular)
 */

// FIREBASE CONFIG (Mevcut ayarlarınız korunmuştur)
const firebaseConfig = {
    apiKey: "AIzaSyApt0bbo_D1m6knPjr1eO5e-KmKidVCzD8",
    authDomain: "flutter-6c452.firebaseapp.com",
    databaseURL: "https://flutter-6c452-default-rtdb.firebaseio.com",
    projectId: "flutter-6c452",
    storageBucket: "flutter-6c452.firebasestorage.app",
    messagingSenderId: "76508626341",
    appId: "1:76508626341:web:3609cbb9be3692a3acbc4c",
    measurementId: "G-LWDJ2X8PGH"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    
    // ── İLETİŞİM BİLGİLERİNİ GÜNCELLE ──
    function loadContactInfo() {
        database.ref('contact').on('value', (snap) => {
            const data = snap.val();
            if (data) {
                // Telefon Bağlantıları
                const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
                if (phoneLinks.length > 0 && data.phone) {
                    phoneLinks.forEach(link => {
                        link.href = `tel:${data.phone}`;
                        link.textContent = data.phone;
                    });
                }
                const contactPhoneEl = document.getElementById('contactPhone');
                if (contactPhoneEl && data.phone) {
                    contactPhoneEl.href = `tel:${data.phone}`;
                    contactPhoneEl.textContent = data.phone;
                }

                // Adres Bilgisi
                const addressElements = document.querySelectorAll('[itemprop="streetAddress"]');
                if (addressElements.length > 0 && data.address) {
                    addressElements.forEach(el => el.textContent = data.address);
                }
                const contactAddressEl = document.getElementById('contactAddress');
                if (contactAddressEl && data.address) {
                    contactAddressEl.textContent = data.address;
                }
                
                // WhatsApp Bilgisi
                const whatsappEl = document.getElementById('contactWhatsapp');
                if (whatsappEl && data.whatsapp) {
                    const cleanPhone = data.whatsapp.replace(/\D/g, '');
                    whatsappEl.href = `https://wa.me/${cleanPhone}`;
                    whatsappEl.textContent = data.whatsapp;
                }
                
                // Instagram Bilgisi
                const instagramEl = document.getElementById('contactInstagram');
                if (instagramEl && data.instagram) {
                    const handle = data.instagram.startsWith('@') ? data.instagram.slice(1) : data.instagram;
                    instagramEl.href = `https://instagram.com/${handle}`;
                    instagramEl.textContent = data.instagram;
                }

                // Harita Linki Güncellemesi
                const mapsLink = document.getElementById('mapsLink');
                if (mapsLink && data.address) {
                    mapsLink.href = `https://maps.google.com/?q=${encodeURIComponent(data.address)}`;
                }
            }
        });
    }

    // ── HAKKIMIZDA SAYFASI TABLOLARINI GÜNCELLE ──
    function updateAboutTables() {
        database.ref('priceTable').on('value', (snapshot) => {
            const data = snapshot.val() || {};
            
            const levels = ['ilkokul', 'ortaokul', 'lise'];
            const types = [
                { key: 'Online', id: 'Online' },
                { key: 'Live', id: 'Live' }
            ];
            
            levels.forEach(level => {
                const rows = data[level] || [];
                types.forEach(typeObj => {
                    const tableId = `about${typeObj.id}${level.charAt(0).toUpperCase() + level.slice(1)}Table`;
                    const tbody = document.getElementById(tableId);
                    if (tbody) {
                        tbody.innerHTML = '';
                        rows.forEach(row => {
                            const tr = document.createElement('tr');
                            const typeKey = typeObj.key === 'Online' ? 'online' : 'yuzyuze';
                            const hourlyPrice = parseFloat(row[typeKey]) || 0;
                            
                            // Metinsel girilen ders saatini işleme (Örn: "0-10" veya "15-20")
                            const hoursStr = String(row.hours || "0");
                            let monthlyHoursStr = "";
                            let minHours = 0;

                            if (hoursStr.includes('-')) {
                                const parts = hoursStr.split('-');
                                const startHours = parseInt(parts[0]) || 0;
                                const endHours = parseInt(parts[1]) || 0;
                                
                                minHours = startHours; // En küçük ders saati aralığın başıdır
                                monthlyHoursStr = `${startHours * 4}-${endHours * 4} saat`;
                            } else {
                                minHours = parseInt(hoursStr) || 0;
                                monthlyHoursStr = `${minHours * 4} saat`;
                            }

                            // Toplam fiyat = En küçük ders saati * girilen saatlik ücret
                            const totalPrice = minHours * hourlyPrice;
                            
                            tr.innerHTML = `
                                <td>${hoursStr} saat</td>
                                <td>${monthlyHoursStr}</td>
                                <td class="price-cell">${totalPrice > 0 ? totalPrice.toFixed(0) + ' TL' : 'İletişime Geçiniz'}</td>
                            `;
                            tbody.appendChild(tr);
                        });
                    }
                });
            });
        });
    }

    // Fonksiyonları Tetikle
    loadContactInfo();
    updateAboutTables();
});