// إدارة التنقل بين الصفحات
function goBack() {
    window.history.back();
}

// منع النسخ والطباعة
document.addEventListener('keydown', function(e) {
    // منع Ctrl+C, Ctrl+U, F12
    if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 85) || e.keyCode === 123) {
        e.preventDefault();
        alert('هذا الإجراء غير مسموح به');
    }
});

// منع النقر الأيمن
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert('هذا الإجراء غير مسموح به');
});

// اختيار التخصص
function selectDepartment(departmentId) {
    localStorage.setItem('selectedDepartment', departmentId);
    window.location.href = 'years.html';
}

// اختيار السنة
function selectYear(yearId) {
    localStorage.setItem('selectedYear', yearId);
    window.location.href = 'semesters.html';
}

// اختيار الفصل
function selectSemester(semesterId) {
    localStorage.setItem('selectedSemester', semesterId);
    window.location.href = 'subjects.html';
}

// اختيار المادة
function selectSubject(subjectId) {
    localStorage.setItem('selectedSubject', subjectId);
    window.location.href = 'lessons.html';
}

// التحقق من صلاحية الوصول
function checkAccess() {
    const access = localStorage.getItem('userAccess');
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode !== 'free' && access !== 'full') {
        alert('ليس لديك صلاحية الوصول إلى هذا المحتوى');
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// تحميل الدروس بناءً على المادة المحددة
async function loadLessons() {
    if (!checkAccess()) return;
    
    const subjectId = localStorage.getItem('selectedSubject');
    const isFreeMode = new URLSearchParams(window.location.search).get('mode') === 'free';
    
    try {
        let query = supabase
            .from('lessons')
            .select('*')
            .eq('subject_id', subjectId)
            .order('order_index', { ascending: true });
            
        if (isFreeMode) {
            query = query.eq('is_free', true);
        }
        
        const { data: lessons, error } = await query;
        
        if (error) throw error;
        
        const lessonsContainer = document.getElementById('lessonsContainer');
        lessonsContainer.innerHTML = '';
        
        lessons.forEach(lesson => {
            const lessonElement = document.createElement('div');
            lessonElement.className = 'lesson-card';
            lessonElement.innerHTML = `
                <h3>${lesson.title}</h3>
                <p>${lesson.content.substring(0, 100)}...</p>
                <button onclick="viewLesson(${lesson.id})">عرض الدرس</button>
            `;
            lessonsContainer.appendChild(lessonElement);
        });
        
    } catch (error) {
        console.error('Error loading lessons:', error);
        alert('حدث خطأ في تحميل الدروس');
    }
}

// عرض الدرس
function viewLesson(lessonId) {
    localStorage.setItem('selectedLesson', lessonId);
    
    // هنا يمكنك فتح الدرس في نافذة منبثقة أو صفحة جديدة
    // مع تطبيق إجراءات الحماية الإضافية
    window.open(`lesson-viewer.html?lessonId=${lessonId}`, '_blank');
}
