document.addEventListener('DOMContentLoaded', function(){
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
            // Store the ID of the active tab-link in localStorage
            localStorage.setItem('activeSectionId', sectionId);
        }
    }

    // Add click event listener to each tab-link
    tabLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveLink(this);
        });
    });

    // Retrieve the ID of the active tab-link from localStorage
    const sectionId = localStorage.getItem('activeSectionId');
    if (sectionId) {
        // Find the tab-link with the retrieved ID and trigger a click event
        const link = document.querySelector(`.tab-link[href="#${sectionId}"]`);
        if (link) {
            link.click();
        }
    }
});
