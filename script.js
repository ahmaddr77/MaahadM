document.addEventListener('DOMContentLoaded', () => {
    const quizQuestionsContainer = document.getElementById('quiz-questions');
    const quizResults = document.getElementById('quiz-results');
    let quizData = []; // To store questions from Excel

    // Function to fetch and parse the Excel file
    async function fetchExcelData() {
        try {
            // Adjust the path if your Excel file is not in the same directory
            const response = await fetch('questions.xlsx'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            // Assuming the first sheet contains the questions
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert sheet to JSON
            // header: 1 means the first row will be used as keys for JSON objects
            quizData = XLSX.utils.sheet_to_json(worksheet);

            renderQuestions(); // Render questions after data is loaded

        } catch (error) {
            console.error('Error fetching or parsing Excel file:', error);
            quizQuestionsContainer.innerHTML = '<p>Failed to load quiz questions. Please ensure "questions.xlsx" is in the correct directory.</p>';
        }
    }

    // Function to render questions on the page
    function renderQuestions() {
        quizQuestionsContainer.innerHTML = ''; // Clear previous questions
        quizData.forEach((questionObj, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.classList.add('question-block');
            questionBlock.setAttribute('data-question-index', index); // Add index for easy reference

            const questionText = document.createElement('p');
            questionText.classList.add('question-text');
            questionText.textContent = `${index + 1}. ${questionObj.Question}`; // Use 'Question' column header
            questionBlock.appendChild(questionText);

            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('options');

            // Assuming options are in columns named OptionA, OptionB, OptionC
            ['OptionA', 'OptionB', 'OptionC'].forEach(optionKey => {
                if (questionObj[optionKey]) { // Check if option exists
                    const label = document.createElement('label');
                    const radioInput = document.createElement('input');
                    radioInput.type = 'radio';
                    radioInput.name = `question-${index}`; // Group radio buttons by question
                    radioInput.value = questionObj[optionKey];
                    
                    label.appendChild(radioInput);
                    label.appendChild(document.createTextNode(questionObj[optionKey])); // Display option text
                    optionsDiv.appendChild(label);
                }
            });
            questionBlock.appendChild(optionsDiv);

            const feedbackDiv = document.createElement('div');
            feedbackDiv.classList.add('feedback');
            questionBlock.appendChild(feedbackDiv); // Add feedback div

            quizQuestionsContainer.appendChild(questionBlock);
        });
    }

    // Function to submit the quiz and check answers
    window.submitQuiz = function() {
        let score = 0;
        quizData.forEach((questionObj, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            const feedbackDiv = document.querySelector(`.question-block[data-question-index="${index}"] .feedback`);

            if (feedbackDiv) {
                feedbackDiv.style.display = 'block'; // Show feedback
                feedbackDiv.classList.remove('correct', 'incorrect'); // Clear previous states
            }

            if (selectedOption) {
                const userAnswer = selectedOption.value;
                const correctAnswer = questionObj.CorrectAnswer; // Use 'CorrectAnswer' column header

                if (userAnswer === correctAnswer) {
                    score++;
                    if (feedbackDiv) {
                        feedbackDiv.textContent = 'Correct!';
                        feedbackDiv.classList.add('correct');
                    }
                } else {
                    if (feedbackDiv) {
                        feedbackDiv.textContent = `Incorrect. Correct answer was: ${correctAnswer}`;
                        feedbackDiv.classList.add('incorrect');
                    }
                }
            } else {
                if (feedbackDiv) {
                    feedbackDiv.textContent = `You didn't answer this question. Correct answer was: ${correctAnswer}`;
                    feedbackDiv.classList.add('incorrect');
                }
            }
        });

        quizResults.textContent = `You scored ${score} out of ${quizData.length} questions.`;
        quizResults.style.display = 'block'; // Show results
    };

    // Initial fetch of data when the page loads
    fetchExcelData();
});
