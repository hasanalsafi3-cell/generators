const supabase = window.supabase.createClient('https://mbukheyuiuiadjkchhrs.supabase.co', 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ');
let DB = { subs: [], payments: [], status: false };
let currentRole = '';
let currentTab = 'home';

async function syncData() {
    const s = await supabase.from('subscribers').select('*');
    const p = await supabase.from('payments').select('*');
    if (s.data) DB.subs = s.data;
    if (p.data) DB.payments = p.data;
}

async function login(role) {
    currentRole = role;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    
    // إذا كان مواطن، نخفي القائمة السفلية
    document.getElementById('bottomNav').style.display = (role === 'citizen') ? 'none' : 'flex';
    
    render();
    await syncData();
    render();
}

function logout() {
    document.getElementById('appScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}

function switchTab(tab, btn) {
    currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    const titles = { home: 'الرئيسية', subs: 'المشتركين', collect: 'التحصيل' };
    document.getElementById('headerTitle').innerText = titles[tab];
    render();
}

function render() {
    const content = document.getElementById('content');
    
    if (currentRole === 'citizen') {
        content.innerHTML = `
            <div class="card" style="text-align:center; padding: 40px 20px;">
                <h1 style="font-size: 60px; margin: 0;">${DB.status ? '⚡' : '🔴'}</h1>
                <h2 style="color:${DB.status ? '#10b981' : '#ef4444'}">${DB.status ? 'المولدة شغالة' : 'المولدة مطفية'}</h2>
            </div>
        `;
        return;
    }

    if (currentTab === 'home') {
        content.innerHTML = `
            <button class="btn" style="background:${DB.status?'#10b981':'#ef4444'};" onclick="DB.status=!DB.status; render()">
                ${DB.status ? '⚡ المولدة شغالة' : '🔴 المولدة مطفية'}
            </button>
            <div class="card">
                <h3>إحصائيات اليوم</h3>
                <p>عدد المشتركين: <b>${DB.subs.length}</b></p>
            </div>
        `;
    } 
    else if (currentTab === 'subs') {
        content.innerHTML = `
            <button class="btn" style="background: #10b981;" onclick="showAddForm()">+ إضافة مشترك</button>
            ${DB.subs.map(s => `<div class="card"><b>${s.name}</b> - ${s.amps} أمبير</div>`).join('')}
        `;
    }
    else if (currentTab === 'collect') {
        content.innerHTML = `
            <div class="card">
                <h3>التحصيل</h3>
                <p style="color:#6b7280; font-size:14px;">اضغط على اسم المشترك لدفع الكاش</p>
                ${DB.subs.map(s => `
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:10px 0;">
                        <span>${s.name}</span>
                        <button onclick="paySub('${s.id}')" style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:5px;">استلمت</button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function showAddForm() {
    document.getElementById('modalContent').innerHTML = `
        <h3>إضافة مشترك جديد</h3>
        <input type="text" id="name" class="input" placeholder="اسم المشترك">
        <input type="number" id="amps" class="input" value="5" placeholder="الأمبير">
        <button class="btn" style="background: #10b981; margin-bottom: 10px;" onclick="saveSub()">حفظ</button>
        <button class="btn" style="background: #6b7280;" onclick="document.getElementById('modal').classList.add('hidden')">إلغاء</button>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

async function saveSub() {
    const name = document.getElementById('name').value;
    const amps = document.getElementById('amps').value;
    if (!name) return alert('اكتب الاسم');
    
    const { error } = await supabase.from('subscribers').insert([{ name, amps, phone: '-' }]);
    if (error) return alert('خطأ: ' + error.message);
    
    document.getElementById('modal').classList.add('hidden');
    await syncData();
    render();
    alert('✅ تم الحفظ!');
}

async function paySub(subId) {
    if(!confirm('تأكيد استلام المبلغ؟')) return;
    const sub = DB.subs.find(s => s.id === subId);
    const amount = sub.amps * 5000; // نفترض سعر الأمبير 5000 دينار

    const { error } = await supabase.from('payments').insert([{ sub_id: subId, amount: amount, method: 'cash', status: 'paid' }]);
    if (error) return alert('خطأ: ' + error.message);
    
    alert('✅ تم تسجيل الدفعة بنجاح!');
    await syncData();
    render();
}