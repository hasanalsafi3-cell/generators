const supabase = window.supabase.createClient('https://mbukheyuiuiadjkchhrs.supabase.co', 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ');
let DB = { subs: [], status: false };

async function login(role) {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    await syncData();
    render();
}

async function syncData() {
    const { data } = await supabase.from('subscribers').select('*');
    if (data) DB.subs = data;
}

function logout() {
    window.location.reload();
}

function render() {
    var content = document.getElementById('content');
    var html = '<div class="card">';
    html += '<h3>المشتركين: ' + DB.subs.length + '</h3>';
    html += '<button class="btn" onclick="addSub()">إضافة مشترك</button>';
    for (var i = 0; i < DB.subs.length; i++) {
        html += '<div style="padding:10px; border-bottom:1px solid #ccc;">' + DB.subs[i].name + ' - ' + DB.subs[i].amps + ' أمبير</div>';
    }
    html += '</div>';
    content.innerHTML = html;
}

async function addSub() {
    var name = prompt('اسم المشترك:');
    if (!name) return;
    var amps = prompt('عدد الأمبير:', '5');
    if (!amps) return;
    
    await supabase.from('subscribers').insert([{ name: name, amps: amps, phone: '-' }]);
    alert('تم الحفظ بنجاح!');
    await syncData();
    render();
}