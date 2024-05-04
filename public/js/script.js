document.addEventListener('DOMContentLoaded', function(){
    // show/hide the search bar
    const buttonList = document.querySelectorAll('.header__button button')
    const searchBar = document.getElementById('searchBar')

    buttonList.forEach(button => {
        button.addEventListener('click', function() {
            const ariaExpanded = button.getAttribute('aria-expanded')
            if (ariaExpanded === 'false') {
                button.setAttribute('aria-expanded', 'true')
                searchBar.style.visibility = 'visible'
                searchBar.classList.add('open')
            }
        })
    })

    const closeBtn = document.getElementById('closeSearchBtn')
    closeBtn.addEventListener('click', function() {
        buttonList.forEach(button => {
            const ariaExpanded = button.getAttribute('aria-expanded')
            if (ariaExpanded === 'true') {
                button.setAttribute('aria-expanded', 'false')
            }
        })
        searchBar.style.visibility = 'hidden'
        searchBar.classList.remove('open')
    })

    // show/hide password icon
    document.getElementById('password-input').addEventListener('input', function() {
        var passwordInput = document.getElementById('password-input');
        var showPasswordIcon = document.getElementById('show-password-icon');
        if (passwordInput.value.trim() !== '') {
            showPasswordIcon.style.display = 'block';
        } else {
            showPasswordIcon.style.display = 'none';
        }
    });

    // show/hide the password
    document.getElementById('show-password-icon').addEventListener('click', function() {
        var passwordInput = document.getElementById('password-input');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.style.backgroundImage = 'url(/img/hide_password_icon.png)';
        } else {
            passwordInput.type = 'password';
            this.style.backgroundImage = 'url(/img/show_password_icon.png)';
        }
    });

    // check if username and password is empty
    const loginForm = document.querySelector('form[action="/login"]');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    usernameInput.addEventListener('input', function() {
        if (usernameInput.value.trim()) {
            usernameError.style.display = 'none';
        }
    });

    passwordInput.addEventListener('input', function() {
        if (passwordInput.value.trim()) {
            passwordError.style.display = 'none';
        }
    });

    loginForm.addEventListener('submit', function(event) {
        if (!usernameInput.value.trim()) {
            event.preventDefault();
            usernameError.style.display = 'block';
        }

        if (!passwordInput.value.trim()) {
            event.preventDefault();
            passwordError.style.display = 'block';
        }
    });

    // invitation code inputs
    const inputs = document.querySelectorAll('#invitation-code-inputs input');
    const invitationInputError = document.getElementById('invitation-inputs-error');
    inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            // Ensure only digits are entered
            this.value = this.value.replace(/\D/g, '');

            invitationInputError.style.display = 'none';

            if (this.value.length === 1) {
                let first = index;
                while (first > 0 && inputs[first - 1].value.length === 0) {
                    first--;
                }

                if (first === index && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                } else {
                    inputs[first].value = this.value;
                    inputs[first + 1].focus();
                    inputs[index].value = '';
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
})
