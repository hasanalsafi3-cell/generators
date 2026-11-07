// 1. إعداد الاتصال بقاعدة البيانات السحابية
var supabase = window.supabase.createClient('https://mbukheyuiuiadjkchhrs.supabase.co', 'sb_publishable_eElmjfXNtwo8sauLjU3yEw_Bc4h9MPQ');

// 2. دالة التنقل (تشتغل لما تدوس على أي كارت)
function goTo(pageName) {
    alert('أنت الآن تنتقل إلى: ' + pageName + '\n(سيتم بناء هذه الشاشة قريباً)');
}

// 3. دالة لجلب البيانات وتحديث الأرقام في الواجهة
async function loadDashboardData() {
    try {
        // جلب المشتركين
        var subsRes = await supabase.from('subscribers').select('*');
        // جلب الدفعات
        var paysRes = await supabase.from('payments').select('*');

        if (subsRes.data) {
            // تحديث عدد المشتركين في لوحة صاحب المولد
            document.getElementById('owner-subs-count').innerText = subsRes.data.length;
            // تحديث إجمالي المشتركين في لوحة مالك المنصة
            document.getElementById('admin-subs-count').innerText = subsRes.data.length;
        }

        if (paysRes.data) {
            // حساب إجمالي الإيرادات
            var total = 0;
            for (var i = 0; i < paysRes.data.length; i++) {
                total += Number(paysRes.data[i].amount);
            }
            // تحديث الإيرادات في لوحة مالك المنصة
            document.getElementById('admin-revenue-count').innerText = total.toLocaleString() + ' د.ع';
        }
    } catch (e) {
        console.log('خطأ في جلب البيانات: ' + e.message);
    }
}

// تشغيل جلب البيانات بمجرد فتح الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});