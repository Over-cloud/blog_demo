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

    // show/hide the password
    const passwordInput = document.getElementById('password-input')
    const showPasswordCheckbox = document.getElementById('show-password-checkbox')
    showPasswordCheckbox.addEventListener('change', function() {
        if (this.checked) {
            passwordInput.type = 'text'
        } else {
            passwordInput.type = 'password'
        }
    })
})
