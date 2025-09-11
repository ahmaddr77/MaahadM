// مصادقة المستخدم وإدارة الأكواد
const SUPABASE_URL = 'https://jhhbbzdhmtpeizfiqpzt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaGJiemRobXRwZWl6ZmlxcHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjE3NTgsImV4cCI6MjA3MzEzNzc1OH0.Bx4Uu8NznDi5TmykukSHZTPDswaPtIODRFbL7gk6EB4';

// معلومات Telegram
const TELEGRAM_BOT_TOKEN = '7878476136:AAFFjkUAsWHMvS-EFv0XO6ll3ZgWlrRwNGQ';
const TELEGRAM_CHAT_ID = '5956432771';

// تهيئة Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// دالة التحقق من الكود
async function validateCode() {
    const code = document.getElementById('activationCode').value;
    const messageEl = document.getElementById('message');
    
    if (!code) {
        messageEl.textContent = 'يرجى إدخال كود التفعيل';
        messageEl.className = 'message error';
        return;
    }
    
    // الحصول على معرف الجهاز الفريد
    const deviceId = await getDeviceId();
    
    try {
        // التحقق من الكود في قاعدة البيانات
        const { data, error } = await supabase
            .from('activation_codes')
            .select('*')
            .eq('code', code)
            .single();
            
        if (error) throw error;
        
        if (data.is_used && data.device_id !== deviceId) {
            messageEl.textContent = 'هذا الكود مستخدم بالفعل على جهاز آخر';
            messageEl.className = 'message error';
            
            // إرسال إشعار إلى التلغرام
            sendTelegramNotification(`محاولة استخدام كود مستخدم: ${code} على جهاز: ${deviceId}`);
            return;
        }
        
        if (!data.is_used) {
            // تحديث الكود كمستخدم
            const { error: updateError } = await supabase
                .from('activation_codes')
                .update({ 
                    is_used: true, 
                    used_at: new Date(), 
                    device_id: deviceId 
                })
                .eq('code', code);
                
            if (updateError) throw updateError;
            
            // إرسال إشعار إلى التلغرام
            sendTelegramNotification(`تم تفعيل كود جديد: ${code} على جهاز: ${deviceId}`);
        }
        
        // حفظ حالة المستخدم في localStorage
        localStorage.setItem('userAccess', 'full');
        localStorage.setItem('deviceId', deviceId);
        localStorage.setItem('activationCode', code);
        
        // توجيه المستخدم إلى صفحة التخصصات
        window.location.href = 'departments.html';
        
    } catch (error) {
        messageEl.textContent = 'كود التفعيل غير صحيح';
        messageEl.className = 'message error';
        console.error('Error validating code:', error);
    }
}

// دالة للحصول على معرف فريد للجهاز
async function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
        try {
            // محاولة إنشاء معرف فريد باستخدام Supabase Functions (إذا كان متاحاً)
            const { data, error } = await supabase.functions.invoke('generate-device-id');
            
            if (!error && data && data.deviceId) {
                deviceId = data.deviceId;
            } else {
                // Fallback إذا فشل الاتصال بالسيرفر
                deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
            }
        } catch (error) {
            // Fallback في حالة الخطأ
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
        }
        
        localStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
}

// دالة إرسال إشعار إلى التلغرام
async function sendTelegramNotification(message) {
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
}
