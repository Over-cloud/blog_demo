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
})
