const supabaseUrl = 'https://mbukheyuiuiadjkchhrs.supabase.co';
const supabaseKey = 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
var DB = { subs: [] };
var currentRole = '';
var currentTab = '';

function login(role) {
    currentRole = role;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    navigate('home');
}

function logout() {
    window.location.reload();
}

function navigate(tab) {
    currentTab = tab;
    renderNav();
    renderContent();
}

function renderNav() {
    var nav = document.getElementById('bottomNav');
    var html = '';
    
    if (currentRole === 'owner') {
        html += getNavBtn('home', '🏠', 'الرئيسية');
        html += getNavBtn('subs', '👥', 'المشتركين');
        html += getNavBtn('collect', '💵', 'التحصيل');
        html += getNavBtn('expenses', '🧾', 'المصاريف');
        html += getNavBtn('settings', '⚙️', 'الإعدادات');
    } else if (currentRole === 'citizen') {
        html += getNavBtn('home', '⚡', 'المولدة');
        html += getNavBtn('invoice', '🧾', 'فاتورتي');
    } else if (currentRole === 'admin') {
        html += getNavBtn('home', '📊', 'الإحصائيات');
        html += getNavBtn('owners', '🏭', 'المولدات');
    }
    nav.innerHTML = html;
}

function getNavBtn(id, icon, text) {
    var active = (currentTab === id) ? 'active' : '';
    // استخدمنا &quot; بدل العلامات العادية عشان ما يخربطها الموبايل
    return "<button class='nav-btn " + active + "' onclick='navigate(&quot;" + id + "&quot;)'><span>" + icon + "</span>" + text + "</button>";
}

async function renderContent() {
    var content = document.getElementById('mainContent');
    var title = document.getElementById('pageTitle');
    
    content.innerHTML = '<p style="text-align:center; padding:20px;">جاري التحميل...</p>';
    
    try {
        var res = await supabase.from('subscribers').select('*');
        if (res.data) DB.subs = res.data;
    } catch(e) {
        console.log(e);
    }

    var html = '';

    if (currentRole === 'owner') {
        if (currentTab === 'home') {
            title.innerText = 'لوحة التحكم';
            html += '<div class="card"><h3>عدد المشتركين</h3><div class="stat-num">' + DB.subs.length + '</div></div>';
            html += '<div class="card"><h3>المحصّل اليوم</h3><div class="stat-num" style="color:#10b981;">0 د.ع</div></div>';
        } 
        else if (currentTab === 'subs') {
            title.innerText = 'إدارة المشتركين';
            html += '<button class="btn-add" onclick="showAddModal()">+ إضافة مشترك جديد</button>';
            
            if (DB.subs.length === 0) {
                html += '<p style="text-align:center;">لا يوجد مشتركين.</p>';
            }
            
            for (var i = 0; i < DB.subs.length; i++) {
                var s = DB.subs[i];
                html += '<div class="sub-item">';
                html += '<div class="sub-info"><h4>' + s.name + '</h4><p>' + s.amps + ' أمبير</p></div>';
                // هنا بعد استخدمنا &quot; عشان الحذف
                html += '<button class="btn-danger" onclick="deleteSub(&quot;' + s.id + '&quot;)">حذف 🗑️</button>';
                html += '</div>';
            }
        }
        else if (currentTab === 'collect') {
            title.innerText = 'التحصيل';
            html += '<div class="card"><h3>سجل الدفعات</h3><p>قريباً...</p></div>';
        }
        else if (currentTab === 'expenses') {
            title.innerText = 'المصاريف';
            html += '<div class="card"><h3>سجل المصاريف</h3><p>قريباً...</p></div>';
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
    }
    else if (currentRole === 'admin') {
        title.innerText = 'لوحة المنصة';
        html += '<div class="card"><h3>إجمالي المولدات</h3><div class="stat-num">1</div></div>';
    }

    content.innerHTML = html;
}

function showAddModal() {
    var modalHtml = '';
    modalHtml += '<h3>إضافة مشترك</h3>';
    modalHtml += '<input type="text" id="mName" placeholder="اسم المشترك" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px;">';
    modalHtml += '<input type="number" id="mAmps" placeholder="عدد الأمبير" value="5" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px;">';
    modalHtml += '<button onclick="saveSub()" style="background:#10b981; color:white; padding:10px; width:100%; border:none; border-radius:8px; font-weight:bold; margin-bottom:10px;">حفظ</button>';
    modalHtml += '<button onclick="closeModal()" style="background:#94a3b8; color:white; padding:10px; width:100%; border:none; border-radius:8px; font-weight:bold;">إلغاء</button>';
    
    document.getElementById('modalContent').innerHTML = modalHtml;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

async function saveSub() {
    var name = document.getElementById('mName').value;
    var amps = document.getElementById('mAmps').value;
    if (!name) return alert('اكتب الاسم');

    var res = await supabase.from('subscribers').insert([{ name: name, amps: amps, phone: '-' }]);
    if (res.error) return alert('خطأ: ' + res.error.message);
    
    closeModal();
    renderContent();
    alert('✅ تم الإضافة بنجاح');
}

async function deleteSub(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    var res = await supabase.from('subscribers').delete().eq('id', id);
    if (res.error) return alert('خطأ في الحذف: ' + res.error.message);
    
    renderContent();
}