/**
 * Show loading state on a button
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Text to show while loading
 * @returns {Function} Function to restore the button state
 */
export function showLoading(button, loadingText = 'Processing...') {
    const buttonText = button.innerHTML;
    const buttonWidth = button.offsetWidth;
    
    button.style.width = `${buttonWidth}px`;
    button.disabled = true;
    button.innerHTML = `
        <span class="spinner"></span>
        <span class="loading-text">${loadingText}</span>
    `;
    
    return () => {
        button.disabled = false;
        button.style.width = '';
        button.innerHTML = buttonText;
    };
}

// Add spinner styles
const style = document.createElement('style');
style.textContent = `
    .spinner {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
    }
    
    .loading-text {
        vertical-align: middle;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
