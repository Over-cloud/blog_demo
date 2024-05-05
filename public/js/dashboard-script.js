const tabLinks = document.querySelectorAll('.tab-link');
tabLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (link.classList.contains('current-tab')) {
            console.log('nothing need to be changed');
            return;
        }

        let activeSectionId;
        tabLinks.forEach(tab => {
            if (tab.classList.contains('current-tab')) {
                tab.classList.remove('current-tab');
                activeSectionId = tab.getAttribute('href').slice(1);
            }
        });

        if (activeSectionId === undefined || activeSectionId === null) {
            console.log('null section id');
            return;
        }

        let activeSection = document.getElementById(activeSectionId);
        activeSection.classList.remove('active');

        link.classList.add('current-tab');

        activeSectionId = link.getAttribute('href').slice(1);
        if (activeSectionId === undefined || activeSectionId === null) {
            console.log('null section id');
            return;
        }
        activeSection = document.getElementById(activeSectionId);
        activeSection.classList.add('active');
    });
});

// const tabLinks = document.querySelectorAll('.tab-link');
// const sections = document.querySelectorAll('.dashboard-section');
//
// tabLinks.forEach(link => {
//     link.addEventListener('click', (event) => {
//         // Prevent default link behavior
//         event.preventDefault();
//
//         // Remove 'current-tab' class from all tabs
//         tabLinks.forEach(tab => tab.classList.remove('current-tab'));
//         // Remove 'active' class from all sections
//         sections.forEach(section => section.classList.remove('active'));
//
//         // Add 'current-tab' class to the clicked tab
//         link.classList.add('current-tab');
//
//         // Get the ID of the target section from the link's href attribute
//         const targetSectionId = link.getAttribute('href').slice(1);
//         // Find the target section by ID
//         const targetSection = document.getElementById(targetSectionId);
//         // Add 'active' class to the target section
//         targetSection.classList.add('active');
//     });
// });
