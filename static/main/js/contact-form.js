// Contact form handling script for Django portfolio
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const spinner = submitButton ? submitButton.querySelector('.spinner') : null;
        
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Basic form validation
            if (!validateForm()) {
                return;
            }
            
            // Show loading spinner
            if (submitButton && spinner) {
                submitButton.disabled = true;
                spinner.style.display = 'inline-block';
            }
            
            try {
                // Get CSRF token from the form
                const csrfToken = contactForm.querySelector('input[name="csrfmiddlewaretoken"]').value;
                
                // Create form data object for JSON submission
                const formData = {
                    name: contactForm.querySelector('#name').value,
                    email: contactForm.querySelector('#email').value,
                    message: contactForm.querySelector('#message').value
                };
                
                // Send AJAX request to the server
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: JSON.stringify(formData),
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Parse the response
                let result;
                try {
                    result = await response.json();
                } catch (err) {
                    // If server didn't return JSON, handle it gracefully
                    if (response.ok) {
                        result = { success: true };
                    } else {
                        throw new Error('Server error');
                    }
                }
                
                if (result.success || response.ok) {
                    // Show success message
                    showMessage('success', 'Thank you for your message! I\'ll get back to you soon.');
                    contactForm.reset();
                } else {
                    // Show error message from server
                    showMessage('error', result.error || 'An error occurred. Please try again.');
                }
            } catch (error) {
                console.error('Contact form error:', error);
                showMessage('error', 'An unexpected error occurred. Please try again later.');
            } finally {
                // Hide loading spinner
                if (submitButton && spinner) {
                    submitButton.disabled = false;
                    spinner.style.display = 'none';
                }
            }
        });
        
        // Add input validation listeners
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                // Clear error when user starts typing again
                const errorSpan = this.nextElementSibling;
                if (errorSpan && errorSpan.classList.contains('error')) {
                    errorSpan.textContent = '';
                    this.classList.remove('invalid');
                }
            });
        });
    }
    
    // Validate the entire form
    function validateForm() {
        const inputs = contactForm.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // Validate individual input
    function validateInput(input) {
        const errorSpan = input.nextElementSibling;
        let errorMessage = '';
        
        if (input.validity.valueMissing) {
            errorMessage = `${getReadableName(input.name)} is required`;
        } else if (input.validity.typeMismatch && input.type === 'email') {
            errorMessage = 'Please enter a valid email address';
        } else if (input.validity.tooShort) {
            errorMessage = `${getReadableName(input.name)} is too short (minimum ${input.minLength} characters)`;
        } else if (input.validity.tooLong) {
            errorMessage = `${getReadableName(input.name)} is too long (maximum ${input.maxLength} characters)`;
        } else if (input.validity.patternMismatch && input.type === 'email') {
            errorMessage = 'Please enter a valid email address';
        }
        
        if (errorMessage && errorSpan) {
            errorSpan.textContent = errorMessage;
            input.classList.add('invalid');
            return false;
        } else if (errorSpan) {
            errorSpan.textContent = '';
            input.classList.remove('invalid');
            return true;
        }
        
        return true;
    }
    
    // Helper to convert field name to readable format
    function getReadableName(name) {
        // Convert camelCase or snake_case to Title Case with spaces
        return name
            .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
    }
    
    // Show form submission message
    function showMessage(type, message) {
        // Check if message container exists, create if not
        let messageContainer = document.querySelector('.form-message');
        
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.className = 'form-message';
            contactForm.insertAdjacentElement('beforebegin', messageContainer);
        }
        
        // Set message type and content
        messageContainer.className = `form-message ${type}`;
        messageContainer.textContent = message;
        messageContainer.style.display = 'block';
        
        // Scroll to message
        messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-hide message after 5 seconds
        setTimeout(() => {
            messageContainer.style.opacity = '0';
            
            // Remove from DOM after fade out
            setTimeout(() => {
                messageContainer.style.display = 'none';
                messageContainer.style.opacity = '1';
            }, 500);
        }, 5000);
    }
});