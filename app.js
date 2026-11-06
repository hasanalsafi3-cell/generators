const supabaseUrl = 'https://mbukheyuiuiadjkchhrs.supabase.co';
const supabaseKey = 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ';
let supabaseClient = null;
let DB = { subs: [], status: false };
let currentRole = '';

try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch(e) {
    alert("فشل الاتصال بالسحابة: " + e.message);
}

async function syncData() {
    if(!supabaseClient) return;
    const { data, error } = await supabaseClient.from('subscribers').select('*');
    if (error) throw new Error(error.message);
    DB.subs = data;
}

async function login(role) {
    currentRole = role;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    
    // 1. افتح الشاشة أولاً (حتى لا تتجمد)
    render();

    // 2. جيب البيانات في الخلفية وحدث الشاشة
    try {
        await syncData();
        render();
    } catch(e) {
        alert("خطأ في جلب البيانات: " + e.message);
    }
}

function logout() {
    document.getElementById('appScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}

function render() {
    const content = document.getElementById('content');
    if(!content) return;
    document.getElementById('headerTitle').innerText = currentRole === 'owner' ? 'أبو المولدة' : 'المواطن';

    if (currentRole === 'owner') {
        content.innerHTML = `
            <button class="btn" style="background:${DB.status?'#10b981':'#ef4444'}; padding:20px;" onclick="DB.status=!DB.status; render()">
                ${DB.status ? '⚡ المولدة شغالة' : '🔴 المولدة مطفية'}
            </button>
            <div class="card">
                <h3>المشتركين (${DB.subs.length})</h3>
                <button class="btn" style="background: #10b981; padding: 10px;" onclick="showAddForm()">+ إضافة مشترك</button>
                ${DB.subs.map(s => `<div style="border-bottom:1px solid #eee; padding:10px 0;">${s.name} - ${s.amps} أمبير</div>`).join('')}
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="card" style="text-align:center;">
                <h1 style="font-size: 60px; margin: 0;">${DB.status ? '⚡' : '🔴'}</h1>
                <h2>${DB.status ? 'المولدة شغالة' : 'المولدة مطفية'}</h2>
            </div>
        `;
    }
}

function showAddForm() {
    document.getElementById('modalContent').innerHTML = `
        <h3>إضافة مشترك جديد</h3>
        <input type="text" id="name" class="input" placeholder="اسم المشترك">
        <input type="number" id="amps" class="input" value="5">
        <button class="btn" style="background: #10b981; margin-bottom: 10px;" onclick="saveSub()">حفظ</button>
        <button class="btn" style="background: #6b7280;" onclick="document.getElementById('modal').classList.add('hidden')">إلغاء</button>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

async function saveSub() {
    const name = document.getElementById('name').value;
    const amps = document.getElementById('amps').value;
    if (!name) return alert('اكتب الاسم');
    
    try {
        const { error } = await supabaseClient.from('subscribers').insert([{ name, amps, phone: '-' }]);
        if (error) throw error;
        
        document.getElementById('modal').classList.add('hidden');
        await syncData();
        render();
        alert('✅ تم الحفظ!');
    } catch(e) {
        alert("فشل الحفظ: " + e.message);
    }
}