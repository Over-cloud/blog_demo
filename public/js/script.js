document.addEventListener('DOMContentLoaded', function(){
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

})
