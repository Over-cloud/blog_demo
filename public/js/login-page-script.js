document.addEventListener('DOMContentLoaded', function(){
    /*************************** SELECT ELEMENTS ***************************/
    // Login form elements
    const loginForm = document.querySelector('form[action="/login"]');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const showPasswordIcon = document.getElementById('show-password-icon');
    const loginMessage = loginForm.querySelector('.message');
    const loginButton = document.getElementById('login-button');
    // Invitation code form elements
    const invitationForm = document.querySelector('form[action="/verify-invitation-code"]');
    const inputList = invitationForm.querySelectorAll('.invitation-code-inputs input');
    const codeMessage = invitationForm.querySelector('.message');
    // Toast notification elements
    const toastNotification = document.getElementById('login-toast-notification');
    const toastNotificationMessage = toastNotification.querySelector('span');
    const toastNotificationClose = toastNotification.querySelector('button');


    /***************************** ON PAGE LOAD *****************************/
    $(loginForm).parsley();

    const { message } = getQueryParams();
    const converted = convertToToastNotification(message);
    if (converted.content != '') {
        showToastNotification(converted.content, converted.style);
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
    usernameInput.addEventListener('input', function () {
        hideMessage(loginMessage);
    });

    // clear error message when input changes
    passwordInput.addEventListener('input', function () {
        hideMessage(loginMessage);
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
                hideMessage(loginMessage);
                loginForm.reset();
                showPasswordIcon.style.display = 'none';
                window.location.href = '/dashboard';
            } else {
                messageContent = responseData.error || 'An error occurred. Please try again later.';
                showMessage(loginMessage, messageContent, 'error');
            }

        } catch (error) {
            showMessage(loginMessage, 'An error occurred. Please try again later.', 'error');
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
            hideMessage();

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
    invitationForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (hasEmptyfields(inputList)) {
            showMessage(codeMessage, "Must be a 4-digit code.", 'error');
            return;
        }

        const code = Array.from(inputList).map(input => input.value).join('');
        const csrfToken = invitationForm.querySelector('input[name="_csrf"]').value;

        try {
            const response = await fetch('/verify-invitation-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken,
                },
                body: JSON.stringify({ code }),
            });

            const responseData = await response.json();
            if (response.ok) {
                hideMessage();
                invitationForm.reset();
                window.location.href = '/signup';
            } else {
                showMessage(codeMessage, responseData.message, responseData.type);
            }
        } catch (error) {
            showMessage(codeMessage, error, 'error');
        } finally {

        }
    });

    toastNotificationClose.addEventListener('click', hideToastNotification);


    /*************************** HELPER FUNCTIONS ***************************/
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            message: params.get('message')
        };
    }

    function convertToToastNotification(message) {
        if (message === 'TokenExpired') {
            const content = 'Your session has expired. Please log in again.';
            const style = 'warning';
            return { content, style };
        } else if (message === 'InvalidToken') {
            const content = 'Invalid credentials. Please retry log in.';
            const style = 'error';
            return { content, style };
        } else {
            const content = '';
            const style = '';
            return { content, style };
        }
    }

    function hasEmptyfields(nodeList) {
        return Array.from(nodeList).some(ele => ele.value.length === 0);
    }

    function showToastNotification(content, style) {
        if (toastNotification.classList.contains('show')) {
            hideToastNotification();
        }

        toastNotificationMessage.textContent = content;
        toastNotification.classList.add(style, 'show');

        setTimeout(() => hideToastNotification(), 5000);
    }

    function hideToastNotification() {
        toastNotification.classList.remove('show');
        toastNotification.addEventListener('transitionend', function onTransitionEnd() {
            toastNotification.classList.remove('success', 'notification', 'warning', 'error');
            toastNotificationMessage.textContent = '';

            toastNotification.removeEventListener('transitionend', onTransitionEnd);
        });
    }

    function showMessage(node, content, style) {
        node.textContent = content;
        node.classList.add(style);
        node.style.display = 'block';
    }

    function hideMessage(node) {
        node.style.display = 'none';
        node.textContent = '';
        node.classList.remove('success', 'notification', 'warning', 'error');
    }
});
