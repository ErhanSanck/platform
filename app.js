/**
 * DersPlatformu - Genel Uygulama Mantığı (Dinamik Fiyatlar ve Başvurular)
 */

// FIREBASE CONFIG
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
    
	const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        
        let count = 0;
        const speed = target / 50;
        
        const updateCount = () => {
            count += speed;
            if (count < target) {
                counter.innerText = prefix + Math.floor(count) + suffix;
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = prefix + target + suffix;
            }
        };
        updateCount();
    });
    // ── 0. İLETİŞİM VE HAKKIMIZDA YAZILARINI GÜNCELLE ──
    function loadContactInfo() {
        database.ref('contact').on('value', (snap) => {
            const data = snap.val();
            if (data) {
                // İletişim sayfasında telefon ve adres güncelle
                const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
                const addressElements = document.querySelectorAll('[itemprop="streetAddress"]');
                
                if (phoneLinks.length > 0 && data.phone) {
                    phoneLinks.forEach(link => {
                        link.href = `tel:${data.phone}`;
                        link.textContent = data.phone;
                    });
                }
                if (addressElements.length > 0 && data.address) {
                    addressElements.forEach(el => el.textContent = data.address);
                }
            }
        });
    }

    function loadAboutContent() {
        database.ref('aboutContent').on('value', (snap) => {
            const data = snap.val();
            if (data && data.text) {
                // Hakkımızda sayfasında yazı güncelle
                const aboutSection = document.querySelector('section[aria-labelledby="about-heading"]');
                if (aboutSection) {
                    const paragraphs = aboutSection.querySelectorAll('p');
                    if (paragraphs.length > 0) {
                        paragraphs[0].innerHTML = data.text.replace(/\n/g, '<br>');
                    }
                }
            }
        });
    }
    
    // ── 1. HAKKIMIZDA SAYFASI TABLOLARINI GÜNCELLE ──
    function updateAboutTables() {
        database.ref('aboutTables').on('value', (snap) => {
            const data = snap.val();
            if (!data) return;
            const mapping = {
				'ilkOnline': 'aboutOnlineilkokulTable',
                'ilkLive': 'aboutLiveilkokulTable',
                'OrtaOnline': 'aboutOnlineOrtaokulTable',
                'OrtaLive': 'aboutLiveOrtaokulTable',
                'LiseOnline': 'aboutOnlineLiseTable',
                'LiseLive': 'aboutLiveLiseTable'
            };
            Object.keys(mapping).forEach(key => {
                const tbody = document.getElementById(mapping[key]);
                if (tbody && data[key]) {
                    tbody.innerHTML = '';
                    data[key].forEach(row => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `<td>Haftada <strong>${row.hours} Saat</strong></td><td>Ayda ${row.hours * 4} Saat</td><td><strong>${row.price} TL</strong></td>`;
                        tbody.appendChild(tr);
                    });
                }
            });
        });
    }

    // ── 2. FİYAT HESAPLAMA MOTORU ──
    let livePrices = { ortaokul_online: 200, ortaokul_live: 300, lise_online: 250, lise_live: 350 };
    database.ref('prices').on('value', (snap) => {
        const d = snap.val();
        if (d) {
            livePrices = {
                ortaokul_online: parseInt(d.ortaokul_online) || 200,
                ortaokul_live: parseInt(d.ortaokul_live) || 300,
                lise_online: parseInt(d.lise_online) || 250,
                lise_live: parseInt(d.lise_live) || 350
            };
        }
    });

    function getRate(grade, mode) {
        const g = parseInt(grade) || 0;
        const segment = (g >= 5 && g <= 8) ? 'ortaokul' : 'lise';
        const channel = (mode === 'online') ? 'online' : 'live';
        return livePrices[`${segment}_${channel}`];
    }

    // ── 3. ÖZEL DERSLER HESAPLAMA VE MODAL ──
    let currentMode = 'online';

    function buildHoursOptions() {
        let html = '';
        for (let i = 0; i <= 20; i++) html += `<option value="${i}">${i} Ders</option>`;
        return html;
    }

    function buildGradeOptions() {
        return `<option value="">-- Seçiniz --</option><option value="1">1. Sınıf</option><option value="2">2. Sınıf</option><option value="3">3. Sınıf</option><option value="4">4. Sınıf</option><option value="5">5. Sınıf</option><option value="6">6. Sınıf</option><option value="7">7. Sınıf</option><option value="8">8. Sınıf</option><option value="9">9. Sınıf</option><option value="10">10. Sınıf</option><option value="11">11. Sınıf</option><option value="12">12. Sınıf / Mezun</option>`;
    }

    const courseCatalog = {
        first:  ['Matematik', 'Hayat Bilgisi', 'Türkçe', 'İngilizce', 'Hızlı Okuma'],
        junior: ['Matematik', 'Fen Bilimleri', 'Sosyal Bilimler', 'İngilizce', 'Hızlı Okuma', 'Türkçe'],
        high:   ['Matematik', 'Türkçe', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya'],
        senior: ['TYT Matematik', 'AYT Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Edebiyat', 'Tarih', 'Coğrafya']
    };

    function getCatalogByGrade(grade) {
        const g = parseInt(grade);
        
        if (g >= 1 && g <= 4) return courseCatalog.first;
        if (g >= 5 && g <= 8) return courseCatalog.junior;
        if (g >= 9 && g <= 11) return courseCatalog.high;
        if (g === 12) return courseCatalog.senior;
        return [];
    }

   window.calculateTotalPrice = (mode) => {
    const m = (mode === 'yuz-yuze') ? 'yuz-yuze' : 'online';
    const personsWrapper = document.querySelector(`.persons-wrapper[data-mode="${m}"]`);
    if (!personsWrapper) return 0;
    
    // Kişi sayısını hesapla
    const personCount = personsWrapper.querySelectorAll('.person-block').length;
    
    // Toplam ders sayısını hesapla
    let totalLessonCount = 0;
    personsWrapper.querySelectorAll('.hours-select').forEach(sel => {
        totalLessonCount += parseInt(sel.value) || 0;
    });
    
    // Ders sayısına göre indirim hesapla
    let lessonDiscount = 0;
    if (totalLessonCount > 2 && totalLessonCount < 4) {
        lessonDiscount = 300; // 2-4 ders arası: 100 TL indirim
    } else if (totalLessonCount >= 4 && totalLessonCount < 6) {
        lessonDiscount = 400; // 4-6 ders arası: 200 TL indirim
    } else if (totalLessonCount >= 6 && totalLessonCount < 8) {
        lessonDiscount = 500; // 6-8 ders arası: 300 TL indirim
    } else if (totalLessonCount >= 8) {
        lessonDiscount = 600; // 8+ ders: 300 TL indirim (veya daha fazla ekleyebilirsiniz)
    }
    
    
    
    // İndirim uygula
    let personDiscount = 0;
    if (personCount > 1) {
        personDiscount = (personCount - 1) * 400; // 2. kişiden itibaren her kişi 400 TL indirim
    }
    
    let totalCost = 0;
    personsWrapper.querySelectorAll('.person-block').forEach(block => {
        const grade = block.querySelector('.person-grade-selector')?.value || '';
        const rate  = getRate(grade, m);
        block.querySelectorAll('.hours-select').forEach(sel => {
            totalCost += (parseInt(sel.value) || 0) * rate;
        });
    });
    
    // Toplam indirim (ders sayısı + kişi sayısı)
    const totalDiscount = lessonDiscount + personDiscount;
    const finalCost = Math.max(0, totalCost - totalDiscount);
    
    const span = document.querySelector(`.total-price-span[data-mode="${m}"]`);
    if (span) span.textContent = `${finalCost} TL`;
    
    return finalCost;
};


    function addCourseRow(wrapper, grade, mode) {
        const catalog = getCatalogByGrade(grade);
        const row = document.createElement('div');
        row.className = 'course-row';
        row.innerHTML = `
            <select class="course-name-select">${catalog.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
            <select class="hours-select">${buildHoursOptions()}</select>
            <button type="button" class="remove-course-btn">×</button>
        `;
        row.querySelector('.hours-select').addEventListener('change', () => calculateTotalPrice(mode));
        row.querySelector('.remove-course-btn').addEventListener('click', () => { row.remove(); calculateTotalPrice(mode); });
        wrapper.appendChild(row);
    }

    function buildPersonBlock(index, mode) {
        const block = document.createElement('div');
        block.className = 'step-container person-block';
        block.innerHTML = `
            <div class="step-title">${index}. Kişi</div>
            <div class="step-container">
                <div class="step-title">Sınıf Seviyesi Seçin</div>
                <select class="grade-selector person-grade-selector">${buildGradeOptions()}</select>
            </div>
            <div class="step-container dynamic-courses-step hidden">
                <div class="step-title">Ders ve Saat Seçin</div>
                <div class="course-rows-wrapper"></div>
                <button type="button" class="add-course-row-btn">+ Yeni Ders Ekle</button>
            </div>
        `;
        const gradeSel = block.querySelector('.person-grade-selector');
        gradeSel.addEventListener('change', () => {
            const step = block.querySelector('.dynamic-courses-step');
            const wrapper = block.querySelector('.course-rows-wrapper');
            if (gradeSel.value) {
                step.classList.remove('hidden');
                wrapper.innerHTML = '';
                addCourseRow(wrapper, gradeSel.value, mode);
            } else {
                step.classList.add('hidden');
            }
            calculateTotalPrice(mode);
        });
        block.querySelector('.add-course-row-btn').addEventListener('click', () => addCourseRow(block.querySelector('.course-rows-wrapper'), gradeSel.value, mode));
        return block;
    }

    document.querySelectorAll('.person-count-selector').forEach(sel => {
        sel.addEventListener('change', function() {
            const mode = this.dataset.mode;
            const count = parseInt(this.value) || 0;
            const wrapper = document.querySelector(`.persons-wrapper[data-mode="${mode}"]`);
            const footer = document.querySelector(`.calc-footer[data-mode="${mode}"]`);
            const currentBlocks = wrapper.querySelectorAll('.person-block');
            const currentCount = currentBlocks.length;
            if (count > currentCount) {
                for (let i = currentCount + 1; i <= count; i++) wrapper.appendChild(buildPersonBlock(i, mode));
            } else if (count < currentCount) {
                for (let i = currentCount; i > count; i--) currentBlocks[i-1].remove();
            }
            if (count > 0) {
                wrapper.classList.remove('hidden');
                footer.classList.remove('hidden');
            } else {
                wrapper.classList.add('hidden');
                footer.classList.add('hidden');
            }
            calculateTotalPrice(mode);
        });
    });

    // ── ÖZEL DERSLER MODAL AÇMA ──
    document.querySelectorAll('.launch-register-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;
            const modal = document.getElementById('pageRegisterModal');
            if (modal) modal.style.display = 'flex';
        });
    });

    const closePageModal = document.getElementById('closePageModal');
    if (closePageModal) closePageModal.onclick = () => document.getElementById('pageRegisterModal').style.display = 'none';

    // ── ÖZEL DERSLER FORM GÖNDERME ──
    const pageForm = document.getElementById('pageRegisterForm');
    if (pageForm) {
        pageForm.onsubmit = (e) => {
            e.preventDefault();
            const m = (currentMode === 'live') ? 'live' : 'online';
            const wrapper = document.querySelector(`.persons-wrapper[data-mode="${m}"]`);
            const persons = [];
            wrapper.querySelectorAll('.person-block').forEach((b, i) => {
                const grade = b.querySelector('.person-grade-selector').value;
                const lessons = [];
                b.querySelectorAll('.course-row').forEach(r => {
                    const h = parseInt(r.querySelector('.hours-select').value) || 0;
                    if (h > 0) lessons.push(`${r.querySelector('.course-name-select').value} (${h} Saat)`);
                });
                persons.push(`${i+1}. Kişi (${grade}. Sınıf): ${lessons.join(', ') || 'Ders seçilmedi'}`);
            });

            const data = {
                date: new Date().toLocaleString('tr-TR'),
                veliName: document.getElementById('pVeliName').value,
                ogrenciName: document.getElementById('pOgrenciName').value,
                phone: document.getElementById('pPhone').value,
                metaModel: currentMode === 'online' ? 'Online' : 'Yüz Yüze',
                kisiDetay: persons.join(' | '),
                totalPrice: calculateTotalPrice(currentMode) + " TL",
                address: 'Özel Dersler Sayfası'
            };

            database.ref('registrations').push(data).then(() => {
                alert('Başvurunuz başarıyla alındı!');
                pageForm.reset();
                document.getElementById('pageRegisterModal').style.display = 'none';
            }).catch(err => alert('Hata: ' + err.message));
        };
    }

    // ── ANA SAYFA HIZLI MODAL ──
    const quickModal = document.getElementById('quickRegisterModal');
    const quickForm = document.getElementById('quickRegisterForm');

    document.querySelectorAll('.open-quick-modal').forEach(btn => {
        btn.onclick = () => {
            if (quickModal) {
                quickModal.style.display = 'flex';
                const subject = btn.dataset.subject || 'Genel';
                const subjectInput = document.getElementById('qSubject');
                const titleInput = document.getElementById('quickModalTitle');
                if (subjectInput) subjectInput.value = subject;
                if (titleInput) titleInput.textContent = `${subject} Özel Dersi Başvurusu`;
            }
        };
    });

    const closeQuickModal = document.getElementById('closeQuickModal');
    if (closeQuickModal) closeQuickModal.onclick = () => quickModal.style.display = 'none';

    if (quickForm) {
        quickForm.onsubmit = (e) => {
            e.preventDefault();
            const data = {
                date: new Date().toLocaleString('tr-TR'),
                veliName: document.getElementById('qVeliName').value,
                ogrenciName: document.getElementById('qOgrenciName').value,
                phone: document.getElementById('qPhone').value,
                metaModel: 'Hızlı Başvuru',
                kisiDetay: `Ders: ${document.getElementById('qSubject').value}`,
                totalPrice: 'İletişime Geçilecek',
                address: 'Ana Sayfa'
            };
            database.ref('registrations').push(data).then(() => {
                alert('Başvurunuz alındı!');
                quickForm.reset();
                quickModal.style.display = 'none';
            });
        };
    }

    // ── SEKME GEÇİŞLERİ ──
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tc => {
                tc.classList.remove('active');
                if (tc.id === `tab-${target}`) tc.classList.add('active');
            });
        });
    });

    // Mobil Menü
    const menuToggle = document.getElementById('menuToggle');
    const navLinks   = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('mobile-active'));
        // Mobil Menü Kapatılması (link tıklandığında)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
            });
        });
    }

    loadContactInfo();
    loadAboutContent();
    updateAboutTables();
});
