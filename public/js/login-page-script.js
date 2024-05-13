document.addEventListener('DOMContentLoaded', function(){
    /*************************** SELECT ELEMENTS ***************************/
    const loginForm = document.querySelector('form[action="/login"]');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const showPasswordIcon = document.getElementById('show-password-icon');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const loginButton = document.getElementById('login-button');

    /***************************** ON PAGE LOAD *****************************/



    /*************************** EVENT LISTENERS ***************************/
    // show/hide password icon
    passwordInput.addEventListener('input', function() {
        if (passwordInput.value.trim() === '') {
            showPasswordIcon.style.display = 'none';
        } else {
            showPasswordIcon.style.display = 'block';
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
        if (usernameInput.value.trim()) {
            usernameError.style.display = 'none';
        }
    });

    // clear error message when input changes
    passwordInput.addEventListener('input', function() {
        if (passwordInput.value.trim()) {
            passwordError.style.display = 'none';
        }
    });

    //
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        loginButton.disabled = true;
        try {
            let isInputEmpty = false;
            if (!usernameInput.value.trim()) {
                usernameError.style.display = 'block';
                isInputEmpty = true;
            }

            if (!passwordInput.value.trim()) {
                invitationInputError.textContent = 'Please enter a password.'
                passwordError.style.display = 'block';
                isInputEmpty = true;
            }

            if (isInputEmpty) {
                return;
            }

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: usernameInput.value.trim(),
                    password: passwordInput.value.trim(),
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                passwordError.textContent = '';
                passwordError.style.display = 'none';
                 window.location.href = '/dashboard';
            } else {
                passwordError.textContent = responseData.error;
                passwordError.style.display = 'block';
            }

        } catch (error) {
            passwordError.textContent = error;
            passwordError.style.display = 'block';
        } finally {
            loginButton.disabled = false;
        }
    });

    // Only digits are allowed; max 1 digit allowed per field
    // After input, jump to next field; after deletion, jump to previous field
    // When input, if previous field is empty, fillin previous
    const inputs = document.querySelectorAll('#invitation-code-inputs input');
    const invitationInputError = document.getElementById('invitation-inputs-error');
    inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            // Ensure only digits are entered
            this.value = this.value.replace(/\D/g, '');
            // Clear message on input change
            invitationInputError.style.display = 'none';

            if (this.value.length === 1) {
                let first = index;
                while (first > 0 && inputs[first - 1].value.length === 0) {
                    first--;
                }

                if (first !== index) {
                    // If previous field is empty, fillin previous
                    inputs[first].value = this.value;
                    inputs[first + 1].focus();
                    inputs[index].value = '';
                } else if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }

            } else if (this.value.length === 0 && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    // submit invitation code
    const invitationForm = document.querySelector('form[action="/verify-invitation-code"]');
    invitationForm.addEventListener('submit', function(event) {
        let isInputValid = true;
        inputs.forEach(input => {
            if (input.value.length !== 1) {
                isInputValid = false;
            }
        });

        if (!isInputValid) {
            event.preventDefault();
            invitationInputError.style.display = 'block';
        }
    });


    /*************************** HELPER FUNCTIONS ***************************/


});
