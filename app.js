// برمجة زر التشغيل / الإيقاف
function togglePower() {
    var powerBtn = document.querySelector('.action-btn.power');
    if (powerBtn.style.background === 'rgb(16, 185, 129)') {
        // إيقاف
        powerBtn.style.background = '#1e293b'; // يرجع للون الكحلي
        powerBtn.innerHTML = '<span class="action-icon">⏻</span>تشغيل / إيقاف';
        alert('تم إيقاف المولد 🔴');
    } else {
        // تشغيل
        powerBtn.style.background = '#10b981'; // لون أخضر
        powerBtn.innerHTML = '<span class="action-icon">⚡</span>المولد يعمل';
        alert('تم تشغيل المولد ⚡');
    }
}