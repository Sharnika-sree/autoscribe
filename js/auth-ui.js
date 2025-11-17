// js/auth-ui.js
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.tab;
            
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding form
            authForms.forEach(form => {
                form.classList.toggle('active', form.dataset.role === target);
            });
        });
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            this.innerHTML = isPassword ? 
                '<i class="far fa-eye-slash"></i>' : 
                '<i class="far fa-eye"></i>';
            
            this.setAttribute('aria-label', 
                isPassword ? 'Hide password' : 'Show password');
        });
    });

    // Form submission loading state
    document.querySelectorAll('.auth-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.classList.add('loading');
            
            // Get form data
            const formData = {
                email: this.querySelector('input[type="email"]').value,
                password: this.querySelector('input[type="password"]').value,
                role: this.dataset.role
            };
            
            // Call login function
            handleLogin(formData.email, formData.password, formData.role)
                .then(data => {
                    showToast('Login successful!', 'success');
                    // Redirect after successful login
                    setTimeout(() => {
                        window.location.href = `${data.user.role}-dashboard.html`;
                    }, 1000);
                })
                .catch(error => {
                    showToast(error.message || 'Login failed', 'error');
                    submitButton.classList.remove('loading');
                });
        });
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'Microsoft';
            showToast(`Sign in with ${provider} clicked`, 'info');
        });
    });

    // Forgot password link
    document.querySelectorAll('.forgot-password').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.closest('form').querySelector('input[type="email"]').value;
            if (email) {
                showToast(`Password reset link sent to ${email}`, 'info');
            } else {
                showToast('Please enter your email first', 'error');
            }
        });
    });
});

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger reflow
    void toast.offsetWidth;
    
    // Show toast
    toast.classList.add('show');
    
    // Auto-remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
