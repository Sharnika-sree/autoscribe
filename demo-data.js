// Authentication data for Autoscribe platform

// Teacher login credentials
const demoTeachers = [
    {
        id: 'T001',
        email: 'teacher1@autoscribe.edu',
        password: 'teacher123',
        name: 'Demo Teacher',
        department: 'Demo Department'
    }
];

// Student login credentials
const demoStudents = [
    {
        id: 'STU001',
        password: 'student123',
        name: 'Demo Student',
        email: 'student@autoscribe.edu',
        class: 'Demo Class'
    }
];

// Empty data structures for dynamic content
const demoExams = [];
const demoAttendance = {};
const demoResults = {};

// Utility functions for demo data
function getTeacherByEmail(email) {
    return demoTeachers.find(teacher => teacher.email === email);
}

function getStudentById(id) {
    return demoStudents.find(student => student.id === id);
}

function getExamsByTeacher(teacherId) {
    return [];
}

function getAvailableExams() {
    return [];
}

function getScheduledExams() {
    return [];
}

function getCompletedExams() {
    return [];
}

function getExamById(examId) {
    return null;
}

function getAttendanceByExam(examId) {
    return null;
}

function getStudentResults(studentId) {
    return {};
}

// Make functions globally available
window.getTeacherByEmail = getTeacherByEmail;
window.getStudentById = getStudentById;
window.getExamsByTeacher = getExamsByTeacher;
window.getAvailableExams = getAvailableExams;
window.getScheduledExams = getScheduledExams;
window.getCompletedExams = getCompletedExams;
window.getExamById = getExamById;
window.getAttendanceByExam = getAttendanceByExam;
window.getStudentResults = getStudentResults;
