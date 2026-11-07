var supabase = window.supabase.createClient('https://mbukheyuiuiadjkchhrs.supabase.co', 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ');
var subsList = [];

// 1. تحميل الأرقام في الصفحة الرئيسية
async function loadData() {
    var resSubs = await supabase.from('subscribers').select('*');
    var resPays = await supabase.from('payments').select('*');
    
    if (resSubs.data) {
        subsList = resSubs.data;
        document.getElementById('owner-subs-count').innerText = subsList.length;
        document.getElementById('admin-subs-count').innerText = subsList.length;
    }
    if (resPays.data) {
        var total = 0;
        for (var i = 0; i < resPays.data.length; i++) {
            total += Number(resPays.data[i].amount);
        }
        document.getElementById('admin-revenue-count').innerText = total.toLocaleString() + ' د.ع';
    }
}
document.addEventListener('DOMContentLoaded', loadData);

// 2. الانتقال للشاشات
function goTo(pageName) {
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('backBtn').classList.remove('hidden');
    
    var screenView = document.getElementById('screen-view');
    screenView.classList.remove('hidden');

    if (pageName === 'إدارة المشتركين') {
        renderSubscribersScreen();
    } else {
        screenView.innerHTML = '<div class="inner-screen"><h2>' + pageName + '</h2><p style="text-align:center;">هذه الشاشة قيد التطوير...</p></div>';
    }
}

// 3. دالة الرجوع للرئيسية
function goBack() {
    document.getElementById('screen-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.getElementById('backBtn').classList.add('hidden');
    loadData(); // تحديث الأرقام عند الرجوع
}

// 4. بناء شاشة المشتركين (إضافة وقائمة)
async function renderSubscribersScreen() {
    var screenView = document.getElementById('screen-view');
    screenView.innerHTML = '<p style="text-align:center;">جاري التحميل...</p>';

    var res = await supabase.from('subscribers').select('*');
    if (res.data) subsList = res.data;

    var html = '<div class="inner-screen">';
    html += '<h2>👥 إدارة المشتركين</h2>';

    // --- فورم الإضافة ---
    html += '<div style="background:#1e293b; padding:15px; border-radius:12px; margin-bottom:20px;">';
    html += '<div class="input-group"><label>اسم المشترك:</label><input type="text" id="inpName" class="input-field" placeholder="مثال: أبو أحمد"></div>';
    html += '<div class="input-group"><label>عدد الأمبير:</label><input type="number" id="inpAmps" class="input-field" value="5"></div>';
    html += '<button class="btn-save" onclick="addNewSub()">+ حفظ المشترك في السحابة</button>';
    html += '</div>';

    // --- قائمة المشتركين ---
    html += '<h3 style="margin-bottom:15px; color:#94a3b8;">القائمة الحالية (' + subsList.length + ')</h3>';
    if (subsList.length === 0) {
        html += '<p style="text-align:center; color:#64748b;">لا يوجد مشتركين مسجلين.</p>';
    }
    for (var i = 0; i < subsList.length; i++) {
        var s = subsList[i];
        html += '<div class="sub-list-item">';
        html += '<div><b style="font-size:16px;">' + s.name + '</b><br><span style="color:#94a3b8; font-size:13px;">' + s.amps + ' أمبير</span></div>';
        html += '<button class="btn-del" onclick="deleteSubscriber(&quot;' + s.id + '&quot;)">حذف 🗑️</button>';
        html += '</div>';
    }

    html += '</div>';
    screenView.innerHTML = html;
}

// 5. إضافة مشترك جديد
async function addNewSub() {
    var name = document.getElementById('inpName').value;
    var amps = document.getElementById('inpAmps').value;

    if (!name || !amps) {
        return alert('الرجاء إدخال الاسم وعدد الأمبير');
    }

    // إرسال البيانات للسحابة
    var res = await supabase.from('subscribers').insert([{ name: name, amps: amps, phone: '-' }]);
    
    if (res.error) {
        alert('خطأ في الحفظ: ' + res.error.message);
    } else {
        alert('✅ تم إضافة المشترك بنجاح!');
        renderSubscribersScreen(); // تحديث القائمة فوراً
    }
}

// 6. حذف مشترك
async function deleteSubscriber(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المشترك نهائياً؟')) return;

    var res = await supabase.from('subscribers').delete().eq('id', id);
    if (res.error) {
        alert('خطأ في الحذف: ' + res.error.message);
    } else {
        renderSubscribersScreen(); // تحديث القائمة
    }
}