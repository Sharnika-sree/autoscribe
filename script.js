// Global variables
let currentUser = null;
let speechSynthesis = window.speechSynthesis;
let recognition = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSpeechRecognition();
    setupEventListeners();
    announcePageLoad();
});

// Simple toast helper
function showToast(message, variant = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (variant === 'error') toast.style.background = '#991b1b';
    if (variant === 'success') toast.style.background = '#065f46';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity .2s ease, transform .2s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 250);
    }, 2200);
}

// Inline Sign Up toggles
function showInlineSignup(userType) {
    // Hide any login forms and two-panel cards
    document.querySelectorAll('.login-form').forEach(f => f.classList.add('hidden'));
    const authCard = document.getElementById('auth-signup');
    if (authCard) authCard.classList.add('hidden');

    // Ensure the options grid is visible
    const options = document.querySelector('.login-options');
    if (options) options.style.display = 'grid';

    // Hide both inline containers first
    const tInline = document.getElementById('teacher-inline-signup');
    const sInline = document.getElementById('student-inline-signup');
    if (tInline) tInline.classList.add('hidden');
    if (sInline) sInline.classList.add('hidden');

    const target = userType === 'teacher' ? tInline : sInline;
    if (target) {
        target.classList.remove('hidden');
        const first = target.querySelector('input');
        setTimeout(() => first && first.focus(), 50);
        speak(`Create your ${userType} account`);
    }
}

function cancelInlineSignup(userType) {
    const el = document.getElementById(userType === 'teacher' ? 'teacher-inline-signup' : 'student-inline-signup');
    if (el) el.classList.add('hidden');
}

// Inline handlers reuse same validation rules
function handleTeacherSignupInline() {
    const nameEl = document.getElementById('t2-name');
    const emailEl = document.getElementById('t2-email');
    const passEl = document.getElementById('t2-password');
    const confirmEl = document.getElementById('t2-confirm');
    const termsEl = document.getElementById('t2-terms');
    const name = (nameEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const password = (passEl?.value || '');

    [nameEl, emailEl, passEl, confirmEl].forEach(el => el && el.setCustomValidity(''));
    if (!name || !email || !password) {
        showToast('Please complete all required fields.', 'error');
        (nameEl && !name) ? nameEl.reportValidity() : (emailEl && !email) ? emailEl.reportValidity() : passEl?.reportValidity();
        return;
    }
    if (password.length < 8) {
        passEl.setCustomValidity('Password must be at least 8 characters.');
        passEl.reportValidity();
        showToast('Password must be at least 8 characters.', 'error');
        return;
    }
    if ((confirmEl?.value || '') !== password) {
        confirmEl.setCustomValidity('Passwords do not match.');
        confirmEl.reportValidity();
        showToast('Passwords do not match.', 'error');
        return;
    }
    if (!(termsEl?.checked)) {
        showToast('Please accept the Terms and Privacy Policy.', 'error');
        return;
    }

    currentUser = {
        type: 'teacher',
        id: 'T_' + btoa(email).replace(/=+/g, ''),
        email,
        name,
        department: ''
    };
    storeUserData(currentUser);
    speak('Teacher account created. Redirecting to dashboard.');
    showToast('Teacher account created!', 'success');
    setTimeout(() => { window.location.href = 'teacher-dashboard.html'; }, 800);
}

function handleStudentSignupInline() {
    const nameEl = document.getElementById('s2-name');
    const emailEl = document.getElementById('s2-email');
    const passEl = document.getElementById('s2-password');
    const confirmEl = document.getElementById('s2-confirm');
    const termsEl = document.getElementById('s2-terms');
    const name = (nameEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const password = (passEl?.value || '');

    [nameEl, emailEl, passEl, confirmEl].forEach(el => el && el.setCustomValidity(''));
    if (!name || !email || !password) {
        showToast('Please complete all required fields.', 'error');
        (nameEl && !name) ? nameEl.reportValidity() : (emailEl && !email) ? emailEl.reportValidity() : passEl?.reportValidity();
        return;
    }
    if (password.length < 8) {
        passEl.setCustomValidity('Password must be at least 8 characters.');
        passEl.reportValidity();
        showToast('Password must be at least 8 characters.', 'error');
        return;
    }
    if ((confirmEl?.value || '') !== password) {
        confirmEl.setCustomValidity('Passwords do not match.');
        confirmEl.reportValidity();
        showToast('Passwords do not match.', 'error');
        return;
    }
    if (!(termsEl?.checked)) {
        showToast('Please accept the Terms and Privacy Policy.', 'error');
        return;
    }

    currentUser = {
        type: 'student',
        id: 'S_' + btoa(email).replace(/=+/g, ''),
        email,
        name,
        class: ''
    };
    storeUserData(currentUser);
    speak('Student account created. Redirecting to dashboard.');
    showToast('Student account created!', 'success');
    setTimeout(() => { window.location.href = 'student-dashboard.html'; }, 800);
}

// Initialize speech recognition for accessibility
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
    }
}

// Handle Teacher Sign Up
function handleTeacherSignup() {
    const nameEl = document.getElementById('t-name');
    const emailEl = document.getElementById('t-email');
    const passEl = document.getElementById('t-password');
    const confirmEl = document.getElementById('t-confirm');
    const termsEl = document.getElementById('t-terms');
    const name = (nameEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const password = (passEl?.value || '');

    // Clear previous validity
    [nameEl, emailEl, passEl, confirmEl].forEach(el => el && el.setCustomValidity(''));
    // Basic required
    if (!name || !email || !password) {
        showToast('Please complete all required fields.', 'error');
        (nameEl && !name) ? nameEl.reportValidity() : (emailEl && !email) ? emailEl.reportValidity() : passEl?.reportValidity();
        return;
    }
    // Password length
    if (password.length < 8) {
        passEl.setCustomValidity('Password must be at least 8 characters.');
        passEl.reportValidity();
        showToast('Password must be at least 8 characters.', 'error');
        return;
    }
    // Confirm match
    if ((confirmEl?.value || '') !== password) {
        confirmEl.setCustomValidity('Passwords do not match.');
        confirmEl.reportValidity();
        showToast('Passwords do not match.', 'error');
        return;
    }
    // Terms required
    if (termsEl && !termsEl.checked) {
        showToast('Please accept the Terms and Privacy Policy.', 'error');
        return;
    }

    currentUser = {
        type: 'teacher',
        id: 'T_' + btoa(email).replace(/=+/g, ''),
        email,
        name
    };
    storeUserData(currentUser);
    speak('Teacher account created. Redirecting to dashboard.');
    showToast('Teacher account created!', 'success');
    setTimeout(() => { window.location.href = 'teacher-dashboard.html'; }, 800);
}

// Handle Student Sign Up
function handleStudentSignup() {
    const nameEl = document.getElementById('s-name');
    const emailEl = document.getElementById('s-email');
    const passEl = document.getElementById('s-password');
    const confirmEl = document.getElementById('s-confirm');
    const termsEl = document.getElementById('s-terms');
    const name = (nameEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const password = (passEl?.value || '');
    const sclass = (document.getElementById('s-class')?.value || '').trim();

    [nameEl, emailEl, passEl, confirmEl].forEach(el => el && el.setCustomValidity(''));
    if (!name || !email || !password) {
        showToast('Please complete all required fields.', 'error');
        (nameEl && !name) ? nameEl.reportValidity() : (emailEl && !email) ? emailEl.reportValidity() : passEl?.reportValidity();
        return;
    }
    if (password.length < 8) {
        passEl.setCustomValidity('Password must be at least 8 characters.');
        passEl.reportValidity();
        showToast('Password must be at least 8 characters.', 'error');
        return;
    }
    if ((confirmEl?.value || '') !== password) {
        confirmEl.setCustomValidity('Passwords do not match.');
        confirmEl.reportValidity();
        showToast('Passwords do not match.', 'error');
        return;
    }
    if (!(termsEl?.checked)) {
        showToast('Please accept the Terms and Privacy Policy.', 'error');
        return;
    }

    currentUser = {
        type: 'student',
        id: 'S_' + btoa(email).replace(/=+/g, ''),
        email,
        name,
        class: sclass
    };
    storeUserData(currentUser);
    speak('Student account created. Redirecting to dashboard.');
    showToast('Student account created!', 'success');
    setTimeout(() => { window.location.href = 'student-dashboard.html'; }, 800);
}

// Setup event listeners
function setupEventListeners() {
    // Teacher form submission
    const teacherForm = document.getElementById('teacher-form');
    if (teacherForm) {
        teacherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleTeacherLogin();
        });
    }

    // Student form submission
    const studentForm = document.getElementById('student-form');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleStudentLogin();
        });
    }

    // Sign Up form submission (if present)
    const teacherSignupEl = document.getElementById('teacher-signup-form');
    if (teacherSignupEl) {
        teacherSignupEl.addEventListener('submit', function(e) {
            e.preventDefault();
            handleTeacherSignup();
        });
    }
    const studentSignupEl = document.getElementById('student-signup-form');
    if (studentSignupEl) {
        studentSignupEl.addEventListener('submit', function(e) {
            e.preventDefault();
            handleStudentSignup();
        });
    }


    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideLogin();
        }
    });
}

// Show login form based on user type
function showLogin(userType) {
    // Hide all login forms
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.add('hidden');
    });
    // Hide auth card if visible
    const authCard = document.getElementById('auth-signup');
    if (authCard) authCard.classList.add('hidden');
    
    // Hide login options
    document.querySelector('.login-options').style.display = 'none';
    
    // Show selected login form
    document.getElementById(`${userType}-login`).classList.remove('hidden');
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = document.querySelector(`#${userType}-login input`);
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
    
    // Announce to screen readers
    speak(`Please enter your ${userType} credentials`);
}

// Hide login form and show options
function hideLogin() {
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.add('hidden');
    });
    const authCard = document.getElementById('auth-signup');
    if (authCard) authCard.classList.add('hidden');
    
    document.querySelector('.login-options').style.display = 'grid';
    
    // Announce to screen readers
    speak('Returned to login options');
}

// Show the Sign Up form
function showSignup(userType) {
    // Hide all login forms
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.add('hidden');
    });
    // Hide login options
    const options = document.querySelector('.login-options');
    if (options) options.style.display = 'none';
    // Hide the two-panel card if present
    const authCard = document.getElementById('auth-signup');
    if (authCard) authCard.classList.add('hidden');
    // Show role-specific form
    const targetId = userType === 'teacher' ? 'teacher-signup' : 'student-signup';
    const form = document.getElementById(targetId);
    if (form) form.classList.remove('hidden');
    // Focus first input of the shown form
    setTimeout(() => {
        const firstInput = form ? form.querySelector('input, select') : null;
        if (firstInput) firstInput.focus();
    }, 100);
    speak(`Create your ${userType || 'student'} account by filling the sign up form`);
}

// Handle teacher login
function handleTeacherLogin() {
    const email = document.getElementById('teacher-email').value;
    const password = document.getElementById('teacher-password').value;
    
    console.log('Attempting teacher login:', { email });
    if (!email || !password) {
        speak('Please enter email and password.');
        alert('Please enter email and password.');
        return;
    }
    // Accept any non-empty credentials and create a basic teacher profile
    const nameGuess = email.split('@')[0].replace(/\W+/g, ' ').trim() || 'Teacher';
    currentUser = {
        type: 'teacher',
        id: 'T_' + btoa(email).replace(/=+/g, ''),
        email: email,
        name: nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1),
        department: ''
    };
    storeUserData(currentUser);
    speak('Login successful. Redirecting to teacher dashboard.');
    setTimeout(() => {
        window.location.href = 'teacher-dashboard.html';
    }, 800);
}

// Handle student login
function handleStudentLogin() {
    const studentId = document.getElementById('student-id').value;
    const password = document.getElementById('student-password').value;
    const language = document.getElementById('language-select').value;
    
    console.log('Attempting student login:', { studentId, language });
    if (!studentId || !password) {
        speak('Please enter student ID and password.');
        alert('Please enter student ID and password.');
        return;
    }
    currentUser = {
        type: 'student',
        id: studentId,
        name: 'Student ' + studentId,
        email: '',
        class: '',
        language: language
    };
    storeUserData(currentUser);
    speak('Login successful. Redirecting to student dashboard.');
    setTimeout(() => {
        window.location.href = 'student-dashboard.html';
    }, 800);
}


// Text-to-speech function
function speak(text, rate = 0.8, pitch = 1) {
    if (speechSynthesis) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1;
        
        // Set voice if available
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Female')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
    }
}

// Announce page load for accessibility
function announcePageLoad() {
    setTimeout(() => {
        speak('Welcome to Autoscribe. Please select your login option: Teacher or Student.');
    }, 1000);
}

// Voice command recognition
function startVoiceCommand() {
    if (!recognition) {
        speak('Voice recognition is not supported in your browser');
        return;
    }
    
    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        processVoiceCommand(command);
    };
    
    recognition.onerror = function(event) {
        speak('Sorry, I could not understand that. Please try again.');
    };
    
    recognition.start();
    speak('Listening for voice command...');
}

// Process voice commands
function processVoiceCommand(command) {
    if (command.includes('teacher') || command.includes('teacher login')) {
        showLogin('teacher');
    } else if (command.includes('student') || command.includes('student login')) {
        showLogin('student');
    } else if (command.includes('back') || command.includes('return')) {
        hideLogin();
    } else if (command.includes('help')) {
        speak('You can say: Teacher login, Student login, Back, or Help');
    } else {
        speak('Command not recognized. Say help for available commands.');
    }
}

// Microphone test function
function testMicrophone() {
    if (!recognition) {
        speak('Voice recognition is not supported in your browser');
        return false;
    }
    
    speak('Please say "Hello" to test your microphone');
    
    recognition.onresult = function(event) {
        const result = event.results[0][0].transcript.toLowerCase().trim();
        if (result.includes('hello') || result.includes('hi')) {
            speak('Microphone test successful! Your voice is clear.');
            return true;
        } else {
            speak('Please try saying "Hello" again');
            return false;
        }
    };
    
    recognition.start();
}

// Accessibility helper functions
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// High contrast mode toggle
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    const isHighContrast = document.body.classList.contains('high-contrast');
    speak(isHighContrast ? 'High contrast mode enabled' : 'High contrast mode disabled');
}

// Font size adjustment
function adjustFontSize(direction) {
    const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
    const newSize = direction === 'increase' ? currentSize + 2 : currentSize - 2;
    
    if (newSize >= 12 && newSize <= 24) {
        document.body.style.fontSize = newSize + 'px';
        speak(`Font size ${direction === 'increase' ? 'increased' : 'decreased'}`);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + T for teacher login
    if (e.altKey && e.key === 't') {
        e.preventDefault();
        showLogin('teacher');
    }
    
    // Alt + S for student login
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        showLogin('student');
    }
    
    // Alt + V for voice commands
    if (e.altKey && e.key === 'v') {
        e.preventDefault();
        startVoiceCommand();
    }
    
    // Alt + H for help
    if (e.altKey && e.key === 'h') {
        e.preventDefault();
        speak('Keyboard shortcuts: Alt+T for teacher login, Alt+S for student login, Alt+V for voice commands, Alt+H for help');
    }
    
    // Alt + + for increase font size
    if (e.altKey && e.key === '+') {
        e.preventDefault();
        adjustFontSize('increase');
    }
    
    // Alt + - for decrease font size
    if (e.altKey && e.key === '-') {
        e.preventDefault();
        adjustFontSize('decrease');
    }
});

// Store user data in localStorage for session management
function storeUserData(userData) {
    // Store with both keys for compatibility
    localStorage.setItem('autoscribe_user', JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.type,
        class: userData.class || '',
        language: userData.language || 'en'
    }));
    
    // Also store preferred language
    if (userData.language) {
        localStorage.setItem('preferredLanguage', userData.language);
    }
}

function getUserData() {
    const userData = localStorage.getItem('autoscribe_user') || localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function clearUserData() {
    localStorage.removeItem('autoscribe_user');
    localStorage.removeItem('currentUser');
}

// Export functions for use in other pages
window.AutoscribeUtils = {
    speak,
    startVoiceCommand,
    testMicrophone,
    storeUserData,
    getUserData,
    clearUserData,
    toggleHighContrast,
    adjustFontSize
};
