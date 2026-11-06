const supabaseUrl = 'https://mbukheyuiuiadjkchhrs.supabase.co';
const supabaseKey = 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ';
let supabaseClient = null;
let DB = { subs: [], payments: [], status: false };
let currentTab = 'home';

try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch(e) {
    alert("فشل الاتصال بالسحابة");
}

async function login() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    render(); 
    await loadData();
    render();
}

function logout() {
    window.location.reload();
}

async function loadData() {
    if(!supabaseClient) return;
    try {
        var subsRes = await supabaseClient.from('subscribers').select('*');
        var payRes = await supabaseClient.from('payments').select('*');
        if(subsRes.data) DB.subs = subsRes.data;
        if(payRes.data) DB.payments = payRes.data;
    } catch(e) {}
}

function toggleGen() {
    DB.status = !DB.status;
    render();
}

function switchTab(tab) {
    currentTab = tab;
    render();
}

function isToday(dateStr) {
    if(!dateStr) return false;
    var d = new Date(dateStr);
    var today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

function render() {
    var content = document.getElementById('content');
    var title = document.getElementById('headerTitle');
    if(!content) return;

    // تحديث شكل أزرار القائمة السفلية
    var navs = document.querySelectorAll('.nav-item');
    for(var n = 0; n < navs.length; n++) {
        navs[n].classList.remove('active');
    }
    if(document.getElementById('nav-' + currentTab)) {
        document.getElementById('nav-' + currentTab).classList.add('active');
    }

    var html = '';

    if (currentTab === 'home') {
        title.innerText = 'الرئيسية';
        var todayCash = 0;
        for(var i = 0; i < DB.payments.length; i++) {
            if(isToday(DB.payments[i].date) && DB.payments[i].status === 'paid') {
                todayCash += Number(DB.payments[i].amount);
            }
        }
        var statusColor = DB.status ? '#10b981' : '#ef4444';
        var statusText = DB.status ? '⚡ المولدة شغالة' : '🔴 المولدة مطفية';

        html += '<button onclick="toggleGen()" style="width:100%; padding: 30px; border:none; border-radius:15px; background:' + statusColor + '; color:white; font-size:22px; font-weight:bold; margin-bottom:15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">';
        html += statusText + '</button>';

        html += '<div style="background:white; padding:20px; border-radius:15px; margin-bottom:15px; text-align:right;">';
        html += '<h3 style="margin:0; color:#6b7280; font-size:14px;">المحصّل اليوم</h3>';
        html += '<h1 style="margin:10px 0 0 0; color:#d97706; font-size:32px;">' + todayCash.toLocaleString() + ' د.ع</h1>';
        html += '</div>';

        html += '<div style="background:white; padding:20px; border-radius:15px; text-align:right;">';
        html += '<h3 style="margin:0 0 10px 0; color:#6b7280; font-size:14px;">المشتركين</h3>';
        html += '<div style="display:flex; justify-content:space-between; padding:10px 0;">';
        html += '<span>المجموع</span><b>' + DB.subs.length + '</b>';
        html += '</div></div>';
    } 
    else if (currentTab === 'subs') {
        title.innerText = 'المشتركين';
        html += '<button onclick="addSub()" style="width:100%; padding:15px; border:none; border-radius:10px; background:#10b981; color:white; font-size:16px; font-weight:bold; margin-bottom:15px;">+ إضافة مشترك</button>';
        
        for(var j = 0; j < DB.subs.length; j++) {
            html += '<div style="background:white; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between;">';
            html += '<b>' + DB.subs[j].name + '</b>';
            html += '<span style="color:#6b7280;">' + DB.subs[j].amps + ' أمبير</span>';
            html += '</div>';
        }
    }
    else if (currentTab === 'collect') {
        title.innerText = 'التحصيل';
        html += '<div style="background:white; padding:15px; border-radius:10px;">';
        for(var k = 0; k < DB.subs.length; k++) {
            html += '<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:10px 0;">';
            html += '<span>' + DB.subs[k].name + '</span>';
            html += '<button onclick="paySub(\'' + DB.subs[k].id + '\')" style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:5px;">استلمت كاش</button>';
            html += '</div>';
        }
        html += '</div>';
    }

    content.innerHTML = html;
}

async function addSub() {
    var name = prompt('اسم المشترك:');
    if (!name) return;
    var amps = prompt('عدد الأمبير:', '5');
    if (!amps) return;
    
    await supabaseClient.from('subscribers').insert([{ name: name, amps: amps, phone: '-' }]);
    alert('تم الحفظ!');
    await loadData();
    render();
}

async function paySub(id) {
    if(!confirm('تأكيد استلام المبلغ؟')) return;
    var sub = DB.subs.find(s => s.id === id);
    var amount = sub.amps * 5000;
    await supabaseClient.from('payments').insert([{ sub_id: id, amount: amount, method: 'cash', status: 'paid' }]);
    alert('تم تسجيل الدفعة!');
    await loadData();
    render();
}