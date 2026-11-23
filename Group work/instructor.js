// --- 1. MOCK DATABASE (Browser Storage Mock) ---
// In a real app, this would come from an API or LocalStorage.
const mockDatabase = {
    "web-dev": [
        { id: "2101234", name: "John Doe", assignment: 0, midterm: 0, final: 0 },
        { id: "2105678", name: "Jane Smith", assignment: 0, midterm: 0, final: 0 },
        { id: "2109012", name: "Abigail Williams", assignment: 0, midterm: 0, final: 0 }
    ],
    "db-sys": [
        { id: "2101111", name: "Alice Brown", assignment: 0, midterm: 0, final: 0 },
        { id: "2102222", name: "Charlie Davis", assignment: 0, midterm: 0, final: 0 }
    ],
    "oop": [
        { id: "2103333", name: "Eve White", assignment: 0, midterm: 0, final: 0 }
    ]
};

// --- 2. DOM ELEMENTS ---
const subjectFilter = document.getElementById('subjectFilter');
const gradeSection = document.getElementById('gradeSection');
const metricsSection = document.getElementById('metricsSection');
const currentSubjectName = document.getElementById('currentSubjectName');
const gradeTableBody = document.querySelector('#gradeTable tbody');

// --- 3. EVENT LISTENERS ---

// Handle Subject Routing (Dropdown Filter)
subjectFilter.addEventListener('change', function(e) {
    const selectedSubject = e.target.value;
    
    if (selectedSubject === "") {
        // Hide everything if no subject selected
        gradeSection.style.display = 'none';
        metricsSection.style.display = 'none';
        return;
    }

    // Show sections and load data
    gradeSection.style.display = 'block';
    metricsSection.style.display = 'block';
    
    // Update Header Text
    const selectedOptionText = subjectFilter.options[subjectFilter.selectedIndex].text;
    currentSubjectName.textContent = selectedOptionText;

    // Load the data into the table
    loadGradeTable(selectedSubject);
});


// --- 4. CORE FUNCTIONS ---

// Render the table for the selected subject
function loadGradeTable(subjectKey) {
    gradeTableBody.innerHTML = ""; // Clear old data
    const students = mockDatabase[subjectKey];

    students.forEach((student, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td><input type="number" min="0" max="100" value="${student.assignment}" data-index="${index}" class="grade-input assignment-input"></td>
            <td><input type="number" min="0" max="100" value="${student.midterm}" data-index="${index}" class="grade-input midterm-input"></td>
            <td><input type="number" min="0" max="100" value="${student.final}" data-index="${index}" class="grade-input final-input"></td>
            <td class="final-grade-display"><strong>0%</strong></td>
        `;

        gradeTableBody.appendChild(row);
    });

    // Attach event listeners to the new inputs for live calculation
    const inputs = document.querySelectorAll('.grade-input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateStudentGrade(subjectKey, this);
        });
    });

    // Initial calculation to display existing grades (if any)
    inputs.forEach(input => updateStudentGrade(subjectKey, input));
}

// Process calculations for individual student when inputs change
function updateStudentGrade(subjectKey, inputElement) {
    const row = inputElement.closest('tr');
    const index = inputElement.getAttribute('data-index');
    
    // Get values from the row inputs
    const assignment = Number(row.querySelector('.assignment-input').value) || 0;
    const midterm = Number(row.querySelector('.midterm-input').value) || 0;
    const final = Number(row.querySelector('.final-input').value) || 0;

    // Calculate weighted grade
    // Assignment = 30%, Midterm = 30%, Final = 40%
    const finalGrade = (assignment * 0.30) + (midterm * 0.30) + (final * 0.40);
    
    // Update the display
    row.querySelector('.final-grade-display strong').textContent = finalGrade.toFixed(2) + '%';

    // Save to our mock database so metrics can update
    mockDatabase[subjectKey][index].assignment = assignment;
    mockDatabase[subjectKey][index].midterm = midterm;
    mockDatabase[subjectKey][index].final = final;
    mockDatabase[subjectKey][index].calculatedFinal = finalGrade;

    // Recalculate class metrics
    calculateClassMetrics(subjectKey);
}

// Calculate Academic Metrics for the whole class
function calculateClassMetrics(subjectKey) {
    const students = mockDatabase[subjectKey];
    if (students.length === 0) return;

    let totalScore = 0;
    let highestGrade = 0;
    let passCount = 0;

    students.forEach(student => {
        const score = student.calculatedFinal || 0;
        totalScore += score;
        
        if (score > highestGrade) highestGrade = score;
        if (score >= 50) passCount++; // Assuming 50 is pass mark
    });

    const classAverage = totalScore / students.length;
    const passRate = (passCount / students.length) * 100;

    // Update DOM elements
    document.getElementById('classAverage').textContent = classAverage.toFixed(2) + '%';
    document.getElementById('highestGrade').textContent = highestGrade.toFixed(2) + '%';
    document.getElementById('passRate').textContent = passRate.toFixed(2) + '%';
}