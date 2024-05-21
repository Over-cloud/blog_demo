document.addEventListener('DOMContentLoaded', function(){
    /*************************** SELECT ELEMENTS ***************************/
    // Login form elements
    const loginForm = document.querySelector('form[action="/login"]');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const showPasswordIcon = document.getElementById('show-password-icon');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const loginButton = document.getElementById('login-button');
    // Invitation code form elements
    const invitationForm = document.querySelector('form[action="/verify-invitation-code"]');
    const inputList = invitationForm.querySelectorAll('.invitation-code-inputs input');
    const invitationInputError = invitationForm.querySelector('#invitation-inputs-error');
    // Toast notification elements
    const toastNotification = document.getElementById('login-toast-notification');
    const toastNotificationMessage = toastNotification.querySelector('span');
    const toastNotificationClose = toastNotification.querySelector('button');


    /***************************** ON PAGE LOAD *****************************/
    $(loginForm).parsley();

    const { message } = getQueryParams();
    const messageContent = getMessageText(message);
    if (messageContent != '') {
        showToastNotification(messageContent);
    }
    /*************************** EVENT LISTENERS ***************************/
    // show/hide password icon
    passwordInput.addEventListener('input', function() {
        if (passwordInput.value.trim()) {
            showPasswordIcon.style.display = 'block';
        } else {
            showPasswordIcon.style.display = 'none';
        }
    });

    // show/hide the password
    showPasswordIcon.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.style.backgroundImage = 'url(/img/hide_password_icon.png)';
        } else {
            passwordInput.type = 'password';
            this.style.backgroundImage = 'url(/img/show_password_icon.png)';
        }
    });

    // clear error message when input changes
    usernameInput.addEventListener('input', function() {
        passwordError.style.display = 'none';
    });

    // clear error message when input changes
    passwordInput.addEventListener('input', function() {
        passwordError.style.display = 'none';
    });

    //
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        loginButton.disabled = true;
        try {
            const sanitizedUsername = DOMPurify.sanitize(usernameInput.value.trim());
            const sanitizedPassword = DOMPurify.sanitize(passwordInput.value.trim());
            const csrfToken = document.querySelector('form[action="/login"] input[name="_csrf"]').value;

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    username: sanitizedUsername,
                    password: sanitizedPassword,
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                passwordError.textContent = '';
                passwordError.style.display = 'none';
                loginForm.reset();
                showPasswordIcon.style.display = 'none';
                window.location.href = '/dashboard';
            } else {
                passwordError.textContent = responseData.error || 'An error occurred. Please try again later.';
                passwordError.style.display = 'block';
            }

        } catch (error) {
            passwordError.textContent = 'An error occurred. Please try again later.';
            passwordError.style.display = 'block';
        } finally {
            loginButton.disabled = false;
        }
    });

    // Only digits are allowed; max 1 digit allowed per field
    // After input, jump to next field; after deletion, jump to previous field
    // When input, if previous field is empty, fillin previous
    inputList.forEach((input, index) => {
        input.addEventListener('input', function() {
            // Ensure only digits are entered
            this.value = this.value.replace(/\D/g, '');
            // Clear message on input change
            invitationInputError.style.display = 'none';

            if (this.value.length === 1) {
                let first = index;
                while (first > 0 && inputList[first - 1].value.length === 0) {
                    first--;
                }

                if (first !== index) {
                    // If previous field is empty, fillin previous
                    inputList[first].value = this.value;
                    inputList[first + 1].focus();
                    inputList[index].value = '';
                } else if (index < inputList.length - 1) {
                    inputList[index + 1].focus();
                }

            } else if (this.value.length === 0 && index > 0) {
                inputList[index - 1].focus();
            }
        });
    });

    // submit invitation code
    invitationForm.addEventListener('submit', function(event) {
        if (hasEmptyfields(inputList)) {
            event.preventDefault();
            invitationInputError.style.display = 'block';
        }
    });

    toastNotificationClose.addEventListener('click', hideNotification);


    /*************************** HELPER FUNCTIONS ***************************/
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            message: params.get('message')
        };
    }

    function getMessageText(message) {
        switch(message) {
            case 'TokenExpired':
                return 'Your session has expired. Please log in again.';
            case 'InvalidToken':
                return 'Invalid credentials. Please retry log in.';
            default:
                return '';
        }
    }

    function hasEmptyfields(nodeList) {
        return Array.from(nodeList).some(ele => ele.value.length === 0);
    }

    function showToastNotification(messageData) {
        toastNotification.style.display = 'block';
        toastNotificationMessage.textContent = messageData;

        setTimeout(() => hideNotification(), 5000);
    }

    function hideNotification() {
        toastNotification.style.display = 'none';
    }
});
