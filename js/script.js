
// ============================================
// NAVIGATION LOGIC
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');
    const mainContent = document.querySelector('.main-content');

    // Parent Containers
    const portfolioContainer = document.querySelector('.portfolio-section');
    const remainingContainer = document.querySelector('.remaining-sections');

    // Function to switch sections
    function switchSection(sectionId) {
        // 1. Update Navigation State
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        // 2. Manage Parent Container Visibility
        if (['home', 'portfolio'].includes(sectionId)) {
            // Show Portfolio Container (contains Home and Portfolio)
            if (portfolioContainer) portfolioContainer.classList.remove('container-hidden');
            // Hide Remaining Container (contains Experience, Skills, etc.) - OPTIONAL
            // Actually, if we want to "toggle" between views, we should hide .remaining-sections
            // when viewing Home/Portfolio to get a clean view?
            if (remainingContainer) remainingContainer.classList.add('container-hidden');

            // Re-enable particles if they were somehow paused (not needed if just CSS display)

        } else {
            // Content Sections (Experience, Skills, etc.)
            // Hide Portfolio Container to remove the "Blank Page" at the top
            if (portfolioContainer) portfolioContainer.classList.add('container-hidden');
            // Show Remaining Container
            if (remainingContainer) remainingContainer.classList.remove('container-hidden');
        }

        // 3. Handle Content Section Visibility (Inner Sections)
        pageSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                setTimeout(() => {
                    section.classList.add('active');
                }, 10);
            }
        });

        // 4. Layout Adjustments
        if (['experience', 'skills', 'projects', 'education', 'certifications'].includes(sectionId)) {
            if (mainContent) mainContent.classList.add('single-view-mode');
        } else {
            if (mainContent) mainContent.classList.remove('single-view-mode');
        }

        // 5. Trigger Scroll/Animation Updates
        window.dispatchEvent(new Event('scroll'));
    }

    // Add click event listeners to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                switchSection(sectionId);
            }
        });
    });

    // Initialize with Home
    switchSection('home');

    console.log('Navigation refined initialized');
});
