// Отримання елементів з форми та списку
const nameInput = document.getElementById('nameInput');
const groupInput = document.getElementById('groupInput');
const courseInput = document.getElementById('courseInput');
const genderSelect = document.getElementById('genderSelect');
const groupSelect = document.getElementById('groupSelect');
const examNameInput = document.getElementById('examNameInput');
const examGroupSelect = document.getElementById('examGroupSelect');
const studentList = document.getElementById('studentList');
const examList = document.getElementById('examList');

// Відображення вкладки за замовчуванням (реєстрація студентів)
document.addEventListener('DOMContentLoaded', () => {
    openTab('registration');
});

// Функція для перемикання вкладок
function openTab(tabName) {
    const tabs = document.getElementsByClassName('tab');
    for (const tab of tabs) {
        tab.style.display = 'none';
    }
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'students') {
        displayStudentGroups(); // Оновлення списку груп для вкладки "Перегляд студентів"
    } else if (tabName === 'exams') {
        displayStudentGroups(); // Оновлення списку груп для вкладки "Створення іспитів"
        displayExams(); // Відображення іспитів при переході до вкладки "Створення іспитів"
    }
}

// Функція для додавання студента
function addStudent() {
    const name = nameInput.value.trim();
    const group = groupInput.value.trim();
    const course = parseInt(courseInput.value);
    const gender = genderSelect.value;

    if (name === '' || group === '' || isNaN(course)) {
        alert('Будь ласка, заповніть всі поля коректно.');
        return;
    }

    const student = { name, group, course, gender };
    saveStudent(student);
    displayStudents();
    displayStudentGroups(); // Оновлення списку груп після додавання нового студента
    clearForm();
}

// Функція для збереження студента в локальному сховищі
function saveStudent(student) {
    let students = localStorage.getItem('students') ? JSON.parse(localStorage.getItem('students')) : [];
    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));
}

// Функція для відображення списку студентів за обраною групою
function displayStudentsByGroup() {
    const selectedGroup = groupSelect.value;
    const students = JSON.parse(localStorage.getItem('students')) || [];

    studentList.innerHTML = '';
    students.forEach(student => {
        if (selectedGroup === '' || student.group === selectedGroup) {
            const li = document.createElement('li');
            li.textContent = `${student.name} - Група: ${student.group}, Курс: ${student.course}, Стать: ${student.gender}`;
            studentList.appendChild(li);
        }
    });
}

// Функція для відображення унікальних груп студентів у випадаючому списку
function displayStudentGroups() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const groups = [...new Set(students.map(student => student.group))]; // Отримуємо унікальні групи

    groupSelect.innerHTML = '<option value="">Усі групи</option>';
    examGroupSelect.innerHTML = '<option value="">Оберіть групу</option>';

    groups.forEach(group => {
        const option1 = document.createElement('option');
        option1.value = group;
        option1.textContent = group;
        groupSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = group;
        option2.textContent = group;
        examGroupSelect.appendChild(option2);
    });
}

// Функція для додавання іспиту
function addExam() {
    const examName = examNameInput.value.trim();
    const examGroup = examGroupSelect.value;

    if (examName === '' || examGroup === '') {
        alert('Будь ласка, заповніть всі поля для додавання іспиту.');
        return;
    }

    const exam = { name: examName, group: examGroup, scores: {} };
    saveExam(exam);
    displayExams();
    clearExamForm();
}

// Функція для збереження або оновлення іспиту в локальному сховищі
function saveExam(exam) {
    let exams = JSON.parse(localStorage.getItem('exams')) || [];

    // Пошук існуючого іспиту для даної групи
    const existingExamIndex = exams.findIndex(e => e.group === exam.group);

    if (existingExamIndex !== -1) {
        // Якщо іспит для групи вже існує, оновлюємо існуючий
        exams[existingExamIndex] = exam;
    } else {
        // Якщо іспит для групи не існує, додаємо новий іспит до списку
        exams.push(exam);
    }

    localStorage.setItem('exams', JSON.stringify(exams));
}

// Функція для відображення списку іспитів з можливістю видалення
function displayExams() {
    const examList = document.getElementById('examList');
    examList.innerHTML = '';

    const exams = JSON.parse(localStorage.getItem('exams')) || [];

    exams.forEach(exam => {
        const examDiv = document.createElement('div');
        examDiv.innerHTML = `<h3>${exam.name} (Група: ${exam.group})</h3>`;

        const students = JSON.parse(localStorage.getItem('students')) || [];
        students.forEach(student => {
            if (student.group === exam.group) {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = exam.scores[student.name] || 0;
                input.addEventListener('change', () => {
                    exam.scores[student.name] = parseInt(input.value);
                    saveExam(exam);
                });

                examDiv.appendChild(document.createTextNode(`${student.name}: `));
                examDiv.appendChild(input);
                examDiv.appendChild(document.createElement('br'));
            }
        });

        // Додавання кнопки для видалення іспиту
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Видалити';
        deleteButton.addEventListener('click', () => {
            if (confirm(`Ви впевнені, що хочете видалити іспит "${exam.name}"?`)) {
                deleteExam(exam);
                displayExams(); // Оновлюємо список після видалення
            }
        });

        examDiv.appendChild(deleteButton);
        examList.appendChild(examDiv);
    });
}

// Функція для видалення іспиту з локального сховища
function deleteExam(examToDelete) {
    let exams = JSON.parse(localStorage.getItem('exams')) || [];
    exams = exams.filter(exam => !(exam.name === examToDelete.name && exam.group === examToDelete.group));
    localStorage.setItem('exams', JSON.stringify(exams));
}

// Оновлення списку іспитів при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    displayExams();
});

// Функція для очищення форми додавання студента
function clearForm() {
    nameInput.value = '';
    groupInput.value = '';
    courseInput.value = '';
    genderSelect.value = 'male'; // скидаємо значення "Чоловік" за замовчуванням
}

// Функція для очищення форми додавання іспиту
function clearExamForm() {
    examNameInput.value = '';
    examGroupSelect.value = '';
}

// Функція для відображення оцінок студентів за обраною групою
function displayStudentGrades() {
    const selectedGroup = document.getElementById('gradeGroupSelect').value;
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const gradeList = document.getElementById('gradeList');
    gradeList.innerHTML = '';

    students.forEach(student => {
        if (selectedGroup === '' || student.group === selectedGroup) {
            const studentDiv = document.createElement('div');
            studentDiv.innerHTML = `<h3>${student.name} (Група: ${student.group})</h3>`;

            exams.forEach(exam => {
                if (exam.group === student.group) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.value = exam.scores[student.name] || 0;
                    input.addEventListener('change', () => {
                        // Оновлюємо оцінку в іспиті для студента
                        exam.scores[student.name] = parseInt(input.value);
                        saveExam(exam); // Зберігаємо оновлений іспит
                    });

                    studentDiv.appendChild(document.createTextNode(`${exam.name}: `));
                    studentDiv.appendChild(input);
                    studentDiv.appendChild(document.createElement('br'));
                }
            });

            gradeList.appendChild(studentDiv);
        }
    });
}

// Оновлення списку груп для вкладки "Оцінки студентів" при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    displayGradeGroups();
});

// Функція для відображення унікальних груп студентів у випадаючому списку для оцінок
function displayGradeGroups() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const gradeGroupSelect = document.getElementById('gradeGroupSelect');
    gradeGroupSelect.innerHTML = '<option value="">Усі групи</option>';

    const uniqueGroups = [...new Set(students.map(student => student.group))];
    uniqueGroups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        gradeGroupSelect.appendChild(option);
    });
}

// Функція для відображення списку студентів з можливістю видалення
function displayStudents() {
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '';

    const students = JSON.parse(localStorage.getItem('students')) || [];

    students.forEach(student => {
        const studentDiv = document.createElement('div');
        studentDiv.innerHTML = `<h3>${student.name} (Група: ${student.group}, Курс: ${student.course}, Стать: ${student.gender})</h3>`;

        // Додавання кнопки для видалення студента
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Видалити';
        deleteButton.addEventListener('click', () => {
            if (confirm(`Ви впевнені, що хочете видалити студента "${student.name}"?`)) {
                deleteStudent(student);
                displayStudents(); // Оновлюємо список після видалення
            }
        });

        studentDiv.appendChild(deleteButton);
        studentList.appendChild(studentDiv);
    });
}

// Функція для видалення студента з локального сховища
function deleteStudent(studentToDelete) {
    let students = JSON.parse(localStorage.getItem('students')) || [];
    students = students.filter(student => student.name !== studentToDelete.name);
    localStorage.setItem('students', JSON.stringify(students));
}

// Оновлення списку студентів при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    displayStudents();
});

// Відображення студентів, груп та іспитів при завантаженні сторінки
displayStudents();
displayStudentGroups();
displayExams(); // Додано відображення іспитів при завантаженні
