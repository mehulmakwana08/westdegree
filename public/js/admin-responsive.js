/**
 * Admin Responsive JavaScript
 * Handles mobile navigation and responsive behavior for admin panel
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');
    
    // Mobile toggle button functionality
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('show');
            }
        });
    }
    
    // Close sidebar when clicking overlay
    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
        });
    }
    
    // Close sidebar when clicking nav links on mobile
    if (sidebar) {
        const navLinks = sidebar.querySelectorAll('.nav-link, a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 767) {
                    sidebar.classList.remove('show');
                    if (sidebarOverlay) {
                        sidebarOverlay.classList.remove('show');
                    }
                }
            });
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (sidebar && sidebarOverlay) {
            if (window.innerWidth > 767) {
                sidebar.classList.remove('show');
                sidebarOverlay.classList.remove('show');
            }
        }
    });
    
    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            if (bootstrap && bootstrap.Alert) {
                const bsAlert = new bootstrap.Alert(alert);
                if (bsAlert && typeof bsAlert.close === 'function') {
                    bsAlert.close();
                }
            }
        });
    }, 5000);
});