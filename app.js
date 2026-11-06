const supabaseUrl = 'https://mbukheyuiuiadjkchhrs.supabase.co';
const supabaseKey = 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ';
let supabaseClient = null;
let DB = { subs: [], payments: [], status: false };

try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch(e) {
    alert("فشل الاتصال بالسحابة: " + e.message);
}

async function login() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    renderDashboard(); 
    await loadData();
    renderDashboard();
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
    } catch(e) {
        console.log(e);
    }
}

function toggleGen() {
    DB.status = !DB.status;
    renderDashboard();
}

function isToday(dateStr) {
    if(!dateStr) return false;
    var d = new Date(dateStr);
    var today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

function renderDashboard() {
    var content = document.getElementById('content');
    if(!content) return;

    var todayCash = 0;
    for(var i = 0; i < DB.payments.length; i++) {
        if(isToday(DB.payments[i].date) && DB.payments[i].status === 'paid') {
            todayCash += Number(DB.payments[i].amount);
        }
    }

    var totalSubs = DB.subs.length;
    
    var html = '';
    
    // زر المولدة
    var statusColor = DB.status ? '#10b981' : '#ef4444';
    var statusText = DB.status ? '⚡ المولدة شغالة' : '🔴 المولدة مطفية';
    html += '<button onclick="toggleGen()" style="width:100%; padding: 30px; border:none; border-radius:15px; background:' + statusColor + '; color:white; font-size:22px; font-weight:bold; margin-bottom:15px; cursor:pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">';
    html += statusText;
    html += '</button>';

    // كارت المحصل اليوم
    html += '<div style="background:white; padding:20px; border-radius:15px; margin-bottom:15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align:right;">';
    html += '<h3 style="margin:0; color:#6b7280; font-size:14px;">المحصّل اليوم</h3>';
    html += '<h1 style="margin:10px 0 0 0; color:#d97706; font-size:32px;">' + todayCash.toLocaleString() + ' د.ع</h1>';
    html += '</div>';

    // كارت المشتركين
    html += '<div style="background:white; padding:20px; border-radius:15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align:right;">';
    html += '<h3 style="margin:0 0 10px 0; color:#6b7280; font-size:14px;">المشتركين</h3>';
    html += '<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:10px 0;">';
    html += '<span>المجموع</span><b>' + totalSubs + '</b>';
    html += '</div>';
    html += '<div style="display:flex; justify-content:space-between; padding:10px 0;">';
    html += '<span>المتأخرين</span><b style="color:#ef4444;">' + totalSubs + '</b>'; // مبسط حالياً
    html += '</div>';
    html += '</div>';

    content.innerHTML = html;
}