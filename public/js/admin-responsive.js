// Admin Responsive Navigation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    // Check if elements exist before adding event listeners
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('show');
            }
            
            // Update ARIA attributes for accessibility
            const isExpanded = sidebar.classList.contains('show');
            sidebarToggle.setAttribute('aria-expanded', isExpanded);
        });
    }
    
    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
            if (sidebarToggle) {
                sidebarToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Close sidebar when clicking navigation links on mobile
    const navLinks = sidebar ? sidebar.querySelectorAll('.nav-link') : [];
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 767) {
                sidebar.classList.remove('show');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('show');
                }
                if (sidebarToggle) {
                    sidebarToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 767) {
            // Reset mobile menu state on desktop
            if (sidebar) {
                sidebar.classList.remove('show');
            }
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('show');
            }
            if (sidebarToggle) {
                sidebarToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });
    
    // Handle escape key to close mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && window.innerWidth <= 767) {
            if (sidebar && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('show');
                }
                if (sidebarToggle) {
                    sidebarToggle.setAttribute('aria-expanded', 'false');
                    sidebarToggle.focus(); // Return focus to toggle button
                }
            }
        }
    });
    
    // Responsive table enhancements
    const tables = document.querySelectorAll('.table-responsive table');
    tables.forEach(table => {
        makeTableResponsive(table);
    });
    
    // Form validation and UX improvements
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        enhanceFormUX(form);
    });
    
    // Initialize tooltips and other Bootstrap components
    initializeBootstrapComponents();
});

// Function to make tables responsive by adding data labels
function makeTableResponsive(table) {
    const headers = table.querySelectorAll('thead th');
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (headers[index]) {
                cell.setAttribute('data-label', headers[index].textContent.trim());
            }
        });
    });
}

// Function to enhance form UX
function enhanceFormUX(form) {
    // Add loading state to form submissions
    form.addEventListener('submit', function() {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
    });
    
    // Auto-resize textareas
    const textareas = form.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
    
    // File input improvements
    const fileInputs = form.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const label = this.nextElementSibling;
            if (label && this.files.length > 0) {
                label.textContent = this.files[0].name;
            }
        });
    });
}

// Function to initialize Bootstrap components
function initializeBootstrapComponents() {
    // Initialize tooltips
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        // Initialize popovers
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }
}

// Utility function to detect touch devices
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Add touch-specific classes
if (isTouchDevice()) {
    document.body.classList.add('touch-device');
} else {
    document.body.classList.add('no-touch');
}

// Performance optimizations for mobile
if (window.innerWidth <= 767) {
    // Disable hover effects on mobile
    document.body.classList.add('mobile-device');
    
    // Optimize scroll performance
    let ticking = false;
    
    function updateScrollPosition() {
        // Add scroll-based optimizations here
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    });
}

// Export functions for use in other scripts
window.AdminResponsive = {
    makeTableResponsive,
    enhanceFormUX,
    initializeBootstrapComponents,
    isTouchDevice
};