document.addEventListener('DOMContentLoaded', () => {
    const quizQuestionsContainer = document.getElementById('quiz-questions');
    const quizResults = document.getElementById('quiz-results');
    let quizData = []; // لتخزين الأسئلة من ملف الإكسل

    // دالة لجلب وتحليل ملف الإكسل
    async function fetchExcelData() {
        try {
            const response = await fetch('questions.xlsx'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // تحويل ورقة العمل إلى JSON
            quizData = XLSX.utils.sheet_to_json(worksheet);

            renderQuestions(); // عرض الأسئلة بعد تحميل البيانات

        } catch (error) {
            console.error('حدث خطأ في جلب أو تحليل ملف الإكسل:', error);
            quizQuestionsContainer.innerHTML = '<p>فشل في تحميل الأسئلة. الرجاء التأكد من وجود "questions.xlsx" في المجلد الصحيح.</p>';
        }
    }

    // دالة لعرض الأسئلة على الصفحة
    function renderQuestions() {
        quizQuestionsContainer.innerHTML = ''; // مسح الأسئلة السابقة
        quizData.forEach((questionObj, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.classList.add('question-block');
            questionBlock.setAttribute('data-question-index', index);

            const questionText = document.createElement('p');
            questionText.classList.add('question-text');
            questionText.textContent = `${index + 1}. ${questionObj['السؤال']}`; // استخدام اسم العمود 'السؤال'
            questionBlock.appendChild(questionText);

            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('options');

            // أسماء أعمدة الخيارات
            const optionKeys = ['الخيار1', 'الخيار2', 'الخيار3', 'الخيار4'];
            
            optionKeys.forEach(optionKey => {
                if (questionObj[optionKey] !== undefined && questionObj[optionKey] !== null) {
                    const label = document.createElement('label');
                    const radioInput = document.createElement('input');
                    radioInput.type = 'radio';
                    radioInput.name = `question-${index}`;
                    radioInput.value = optionKey.replace('الخيار', ''); // القيمة هي رقم الخيار (1، 2، 3، إلخ)
                    
                    label.appendChild(radioInput);
                    label.appendChild(document.createTextNode(questionObj[optionKey])); // نص الخيار
                    optionsDiv.appendChild(label);
                }
            });
            questionBlock.appendChild(optionsDiv);

            const feedbackDiv = document.createElement('div');
            feedbackDiv.classList.add('feedback');
            questionBlock.appendChild(feedbackDiv);

            quizQuestionsContainer.appendChild(questionBlock);
        });
    }

    // دالة لتسليم الاختبار والتحقق من الإجابات
    window.submitQuiz = function() {
        let score = 0;
        quizData.forEach((questionObj, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            const feedbackDiv = document.querySelector(`.question-block[data-question-index="${index}"] .feedback`);

            if (feedbackDiv) {
                feedbackDiv.style.display = 'block';
                feedbackDiv.classList.remove('correct', 'incorrect');
            }

            if (selectedOption) {
                const userAnswerOptionNumber = selectedOption.value;
                const correctAnswerNumber = String(questionObj['الإجابة الصحيحة']); // تحويل إلى نص
                
                if (userAnswerOptionNumber === correctAnswerNumber) {
                    score++;
                    if (feedbackDiv) {
                        feedbackDiv.textContent = 'إجابة صحيحة!';
                        feedbackDiv.classList.add('correct');
                    }
                } else {
                    if (feedbackDiv) {
                        const correctAnswerKey = `الخيار${correctAnswerNumber}`;
                        const correctAnswerText = questionObj[correctAnswerKey];
                        feedbackDiv.textContent = `إجابة خاطئة. الإجابة الصحيحة هي: ${correctAnswerText}`;
                        feedbackDiv.classList.add('incorrect');
                    }
                }
            } else {
                if (feedbackDiv) {
                    const correctAnswerNumber = String(questionObj['الإجابة الصحيحة']);
                    const correctAnswerKey = `الخيار${correctAnswerNumber}`;
                    const correctAnswerText = questionObj[correctAnswerKey];
                    feedbackDiv.textContent = `لم تجب على هذا السؤال. الإجابة الصحيحة هي: ${correctAnswerText}`;
                    feedbackDiv.classList.add('incorrect');
                }
            }
        });

        quizResults.textContent = `لقد حصلت على ${score} من أصل ${quizData.length} أسئلة.`;
        quizResults.style.display = 'block';
    };

    // جلب البيانات عند تحميل الصفحة
    fetchExcelData();
});
