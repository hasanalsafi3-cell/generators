function enterApp(role) {
    // 1. نخفي شاشة البداية
    document.getElementById('loginScreen').classList.add('hidden');
    
    // 2. نظهر شاشة التطبيق
    document.getElementById('appScreen').classList.remove('hidden');

    // 3. نخفي كل اللوحات أول شي
    document.getElementById('ownerDashboard').classList.add('hidden');
    document.getElementById('citizenDashboard').classList.add('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');

    // 4. نفتح اللوحة اللي اختارها المستخدم
    if (role === 'owner') {
        document.getElementById('ownerDashboard').classList.remove('hidden');
    } else if (role === 'citizen') {
        document.getElementById('citizenDashboard').classList.remove('hidden');
    } else if (role === 'admin') {
        document.getElementById('adminDashboard').classList.remove('hidden');
    }
}

function logout() {
    // نرجع كل شي زي ما كان
    document.getElementById('appScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}