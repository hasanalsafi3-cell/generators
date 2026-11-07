var supabase = window.supabase.createClient('https://mbukheyuiuiadjkchhrs.supabase.co', 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ');
var DB = { subs: [], payments: [] };
var currentTab = 'home';

// 1. تهيئة التطبيق (تشغيل عند فتح الصفحة)
async function init() {
    await loadData();
    switchTab('home');
}
init();

// 2. جلب البيانات من السحابة
async function loadData() {
    var resSubs = await supabase.from('subscribers').select('*');
    var resPays = await supabase.from('payments').select('*');
    if (resSubs.data) DB.subs = resSubs.data;
    if (resPays.data) DB.payments = resPays.data;
}

// 3. التنقل بين الصفحات
function switchTab(tab) {
    currentTab = tab;
    
    // تلوين الأزرار
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(document.getElementById('nav-' + tab)) {
        document.getElementById('nav-' + tab).classList.add('active');
    }

    var content = document.getElementById('mainContent');
    
    if (tab === 'home') renderHome(content);
    else if (tab === 'subs') renderSubs(content);
    else if (tab === 'collect') renderCollect(content);
    else if (tab === 'settings') renderSettings(content);
}

// ==========================================
// 4. شاشة الرئيسية (Dashboard)
// ==========================================
function renderHome(content) {
    var totalCollected = 0;
    for(var i=0; i<DB.payments.length; i++) {
        if(DB.payments[i].status === 'paid') totalCollected += Number(DB.payments[i].amount);
    }

    var html = '';
    html += '<div class="card">';
    html += '<h3>إجمالي المحصل</h3>';
    html += '<div class="value" style="color:#10b981;">' + totalCollected.toLocaleString() + ' د.ع</div>';
    html += '</div>';

    html += '<div class="card">';
    html += '<h3>عدد المشتركين</h3>';
    html += '<div class="value">' + DB.subs.length + ' مشترك</div>';
    html += '</div>';

    html += '<div class="card">';
    html += '<h3>حالة المولد</h3>';
    html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">';
    html += '<span>يعمل بشكل طبيعي <span class="status-dot status-green"></span></span>';
    html += '<button class="btn-primary" style="width:auto; padding:5px 15px; margin:0;">إيقاف</button>';
    html += '</div></div>';

    // زر إضافة بيانات تجريبية (عشان تضبط التطبيق بسرعة)
    if (DB.subs.length === 0) {
        html += '<button class="btn-primary" style="background:#3b82f6; margin-top:20px;" onclick="addDemoData()">+ إضافة بيانات تجريبية (شخصين)</button>';
    }

    content.innerHTML = html;
}

// 5. إضافة بيانات تجريبية لشخصين
async function addDemoData() {
    var demoUsers = [
        { name: 'أبو علي', amps: 5, phone: '07701111111' },
        { name: 'أبو محمد', amps: 10, phone: '07702222222' }
    ];
    await supabase.from('subscribers').insert(demoUsers);
    await loadData();
    alert('✅ تم إضافة أبو علي وأبو محمد بنجاح!');
    switchTab('home');
}

// ==========================================
// 6. شاشة المشتركين (إضافة وحذف)
// ==========================================
function renderSubs(content) {
    var html = '';
    html += '<div class="card">';
    html += '<h3>➕ إضافة مشترك جديد</h3>';
    html += '<div class="input-group"><input type="text" id="subName" class="input-field" placeholder="اسم المشترك"></div>';
    html += '<div class="input-group"><input type="number" id="subAmps" class="input-field" value="5" placeholder="عدد الأمبير"></div>';
    html += '<button class="btn-primary" onclick="addSub()">حفظ في السحابة</button>';
    html += '</div>';

    html += '<h3 style="margin: 20px 0 10px 0; color:#94a3b8;">القائمة (' + DB.subs.length + ')</h3>';
    
    if (DB.subs.length === 0) {
        html += '<p style="text-align:center;">لا يوجد مشتركين.</p>';
    }

    for (var i = 0; i < DB.subs.length; i++) {
        var s = DB.subs[i];
        html += '<div class="list-item">';
        html += '<div><b>' + s.name + '</b><br><span style="color:#94a3b8; font-size:12px;">' + s.amps + ' أمبير</span></div>';
        html += '<button class="btn-danger" onclick="deleteSub(&quot;' + s.id + '&quot;)">حذف 🗑️</button>';
        html += '</div>';
    }

    content.innerHTML = html;
}

async function addSub() {
    var name = document.getElementById('subName').value;
    var amps = document.getElementById('subAmps').value;
    if (!name || !amps) return alert('أدخل البيانات كاملة');
    
    await supabase.from('subscribers').insert([{ name: name, amps: amps, phone: '-' }]);
    await loadData();
    renderSubs(document.getElementById('mainContent'));
}

async function deleteSub(id) {
    if (!confirm('تأكيد الحذف؟')) return;
    await supabase.from('subscribers').delete().eq('id', id);
    await loadData();
    renderSubs(document.getElementById('mainContent'));
}

// ==========================================
// 7. شاشة التحصيل (الدفع)
// ==========================================
function renderCollect(content) {
    var html = '';
    html += '<h3 style="margin-bottom: 15px; color:#10b981;">💵 سجل التحصيل</h3>';

    var pricePerAmp = 5000; // سعر الأمبير الثابت

    if (DB.subs.length === 0) {
        html += '<p style="text-align:center;">أضف مشتركين أولاً.</p>';
    }

    for (var i = 0; i < DB.subs.length; i++) {
        var s = DB.subs[i];
        var amount = s.amps * pricePerAmp;

        // البحث هل دفع ولا لا
        var paid = false;
        for (var j = 0; j < DB.payments.length; j++) {
            if (DB.payments[j].sub_id === s.id && DB.payments[j].status === 'paid') {
                paid = true; break;
            }
        }

        html += '<div class="list-item" style="border-right: 4px solid ' + (paid ? '#10b981' : '#ef4444') + ';">';
        html += '<div><b>' + s.name + '</b><br><span style="color:#94a3b8; font-size:12px;">' + amount.toLocaleString() + ' د.ع</span></div>';
        
        if (paid) {
            html += '<span style="color:#10b981; font-weight:bold;">✅ مسدد</span>';
        } else {
            html += '<button class="btn-primary" style="width:auto; padding:8px 15px; margin:0;" onclick="paySub(&quot;' + s.id + '&quot;, ' + amount + ')">استلمت</button>';
        }
        html += '</div>';
    }

    content.innerHTML = html;
}

async function paySub(subId, amount) {
    if (!confirm('استلام ' + amount.toLocaleString() + ' د.ع نقداً؟')) return;
    await supabase.from('payments').insert([{ sub_id: subId, amount: amount, method: 'cash', status: 'paid' }]);
    await loadData();
    renderCollect(document.getElementById('mainContent'));
    alert('✅ تم تسجيل الدفعة!');
}

// ==========================================
// 8. شاشة الإعدادات
// ==========================================
function renderSettings(content) {
    var html = '';
    html += '<div class="card">';
    html += '<h3>⚙️ الإعدادات</h3>';
    html += '<div class="input-group"><label>اسم المولد:</label><input type="text" class="input-field" value="مولد النور"></div>';
    html += '<div class="input-group"><label>سعر الأمبير:</label><input type="number" class="input-field" value="5000"></div>';
    html += '<button class="btn-primary" onclick="alert(\'قريباً\')">حفظ التغييرات</button>';
    html += '</div>';
    content.innerHTML = html;
}

// 9. تسجيل الخروج
function logout() {
    window.location.reload();
}