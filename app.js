const supabase = window.supabase.createClient('https://mbukheyuiuiadjkchhrs.supabase.co', 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ');
let DB = { subs: [] };
let currentRole = '';
let currentTab = '';

// --- 1. الدخول والخروج ---
function login(role) {
    currentRole = role;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    navigate('home');
}

function logout() {
    location.reload();
}

// --- 2. التنقل بين الصفحات ---
function navigate(tab) {
    currentTab = tab;
    renderNav();
    renderContent();
}

// --- 3. رسم الشريط السفلي ---
function renderNav() {
    let nav = document.getElementById('bottomNav');
    let html = '';
    
    if (currentRole === 'owner') {
        html += getNavBtn('home', '🏠', 'الرئيسية');
        html += getNavBtn('subs', '👥', 'المشتركين');
        html += getNavBtn('collect', '💵', 'التحصيل');
        html += getNavBtn('expenses', '🧾', 'المصاريف');
        html += getNavBtn('settings', '⚙️', 'الإعدادات');
    } else if (currentRole === 'citizen') {
        html += getNavBtn('home', '⚡', 'المولدة');
        html += getNavBtn('invoice', '🧾', 'فاتورتي');
        html += getNavBtn('profile', '👤', 'حسابي');
    } else if (currentRole === 'admin') {
        html += getNavBtn('home', '📊', 'الإحصائيات');
        html += getNavBtn('owners', '🏭', 'المولدات');
    }
    
    nav.innerHTML = html;
}

function getNavBtn(id, icon, text) {
    let active = currentTab === id ? 'active' : '';
    return '<button class="nav-btn ' + active + '" onclick="navigate(\'' + id + '\')"><span>' + icon + '</span>' + text + '</button>';
}

// --- 4. رسم المحتوى (الصفحات) ---
async function renderContent() {
    let content = document.getElementById('mainContent');
    let title = document.getElementById('pageTitle');
    
    content.innerHTML = '<p style="text-align:center;">جاري التحميل...</p>';
    
    // جلب البيانات من السحابة
    const res = await supabase.from('subscribers').select('*');
    if (res.data) DB.subs = res.data;

    let html = '';

    if (currentRole === 'owner') {
        if (currentTab === 'home') {
            title.innerText = 'لوحة التحكم';
            html += '<div class="card"><h3>عدد المشتركين</h3><div class="stat-num">' + DB.subs.length + '</div></div>';
            html += '<div class="card"><h3>المحصّل اليوم</h3><div class="stat-num" style="color:#10b981;">0 د.ع</div></div>';
        } 
        else if (currentTab === 'subs') {
            title.innerText = 'إدارة المشتركين';
            html += '<button class="btn-add" onclick="showAddModal()">+ إضافة مشترك جديد</button>';
            if (DB.subs.length === 0) html += '<p style="text-align:center;">لا يوجد مشتركين.</p>';
            for (let i = 0; i < DB.subs.length; i++) {
                let s = DB.subs[i];
                html += '<div class="sub-item">';
                html += '<div class="sub-info"><h4>' + s.name + '</h4><p>' + s.amps + ' أمبير</p></div>';
                html += '<button class="btn-danger" onclick="deleteSub(\'' + s.id + '\')">حذف 🗑️</button>';
                html += '</div>';
            }
        }
        else if (currentTab === 'collect') {
            title.innerText = 'التحصيل';
            html += '<div class="card"><h3>سجل الدفعات</h3><p style="color:#64748b;">قريباً...</p></div>';
        }
        else if (currentTab === 'expenses') {
            title.innerText = 'المصاريف';
            html += '<div class="card"><h3>سجل المصاريف</h3><p style="color:#64748b;">قريباً...</p></div>';
        }
        else if (currentTab === 'settings') {
            title.innerText = 'الإعدادات';
            html += '<div class="card"><h3>سعر الأمبير</h3><p style="font-size:20px; font-weight:bold;">5000 د.ع</p></div>';
        }
    } 
    else if (currentRole === 'citizen') {
        title.innerText = 'واجهة المواطن';
        html += '<div class="card" style="text-align:center;"><h1>⚡</h1><h3 style="color:#10b981;">المولدة شغالة</h3></div>';
        if (currentTab === 'invoice') html += '<div class="card"><h3>فاتورة الشهر</h3><p>عليك: 25,000 د.ع</p></div>';
        if (currentTab === 'profile') html += '<div class="card"><h3>حسابي</h3><p>مشترك رقم #1</p></div>';
    }
    else if (currentRole === 'admin') {
        title.innerText = 'لوحة المنصة';
        html += '<div class="card"><h3>إجمالي المولدات</h3><div class="stat-num">1</div></div>';
    }

    content.innerHTML = html;
}

// --- 5. نافذة الإضافة والحذف ---
function showAddModal() {
    document.getElementById('modalContent').innerHTML = 
        '<h3>إضافة مشترك</h3>' +
        '<input type="text" id="mName" placeholder="اسم المشترك" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px;">' +
        '<input type="number" id="mAmps" placeholder="عدد الأمبير" value="5" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px;">' +
        '<button onclick="saveSub()" style="background:#10b981; color:white; padding:10px; width:100%; border:none; border-radius:8px; font-weight:bold; margin-bottom:10px;">حفظ</button>' +
        '<button onclick="closeModal()" style="background:#94a3b8; color:white; padding:10px; width:100%; border:none; border-radius:8px; font-weight:bold;">إلغاء</button>';
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

async function saveSub() {
    let name = document.getElementById('mName').value;
    let amps = document.getElementById('mAmps').value;
    if (!name) return alert('اكتب الاسم');

    let res = await supabase.from('subscribers').insert([{ name: name, amps: amps, phone: '-' }]);
    if (res.error) return alert('خطأ: ' + res.error.message);
    
    closeModal();
    renderContent();
    alert('✅ تم الإضافة بنجاح');
}

async function deleteSub(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    let res = await supabase.from('subscribers').delete().eq('id', id);
    if (res.error) return alert('خطأ في الحذف: ' + res.error.message);
    
    renderContent();
}