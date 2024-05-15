document.addEventListener('DOMContentLoaded', function(){
    /*************************** SELECT ELEMENTS ***************************/
    const navLogout = document.getElementById("nav-logout");
    const logoutOverlay = document.getElementById("logout-overlay");
    const logoutForm = document.querySelector('form[action="/logout"]');
    const cancelLogout = document.getElementById('cancel-logout');
    const confirmLogout = document.getElementById('confirm-logout');
    const logoutError = document.getElementById('logout-error');

    /*************************** EVENT LISTENERS ***************************/
    navLogout.addEventListener('click', openLogoutOverlay);

    cancelLogout.addEventListener('click', function(event) {
        event.preventDefault();
        closeLogoutOverlay();
    });

    logoutForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        cancelLogout.disabled = true;
        confirmLogout.disabled = true;

        try {
            const csrfToken = document.querySelector('form[action="/logout"] input[name="_csrf"]').value;

            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken,
                },
            });

            const responseData = await response.json();
            if (response.ok) {
                logoutError.textContent = '';
                logoutError.style.display = 'none';
                window.location.href = '/';
            } else {
                logoutError.textContent = responseData.error || 'An error occurred. Please try again later.';
                logoutError.style.display = 'block';
            }
        } catch (error) {
            logoutError.textContent = 'An error occurred. Please try again later.';
            logoutError.style.display = 'block';
        } finally {
            cancelLogout.disabled = false;
            confirmLogout.disabled = false;
        }
    });

    /*************************** HELPER FUNCTIONS ***************************/
    function openLogoutOverlay() {
        logoutOverlay.style.display = 'block';
    }

    function closeLogoutOverlay() {
        logoutOverlay.style.display = 'none';
    }

    const tabLinks = document.querySelectorAll('.tab-link');
    // remove previous active link and section
    function removePreviousActiveLink() {
        const activeLink = document.querySelector('.current-tab');
        if (activeLink) {
            activeLink.classList.remove('current-tab');

            const activeSectionId = activeLink.getAttribute('href').slice(1);
            const activeSection = document.getElementById(activeSectionId);
            if (activeSection) {
                activeSection.classList.remove('active');
            }
        }
    }

    function setActiveLink(link) {
        if (link.classList.contains('current-tab')) {
            return;
        }

        removePreviousActiveLink();

        // set current active link and section
        link.classList.add('current-tab');
        const sectionId = link.getAttribute('href').slice(1);
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
            // Store the ID of the active tab-link in sessionStorage
            sessionStorage.setItem('activeSectionId', sectionId);
        }
    }

    // Add click event listener to each tab-link
    tabLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveLink(this);
        });
    });

    // Retrieve the ID of the active tab-link from sessionStorage
    const sectionId = sessionStorage.getItem('activeSectionId');
    if (sectionId) {
        // Find the tab-link with the retrieved ID and trigger a click event
        const link = document.querySelector(`.tab-link[href="#${sectionId}"]`);
        if (link) {
            link.click();
        }
    }
});
