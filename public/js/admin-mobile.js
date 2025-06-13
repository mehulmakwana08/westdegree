// Enhanced mobile functionality for admin interface
document.addEventListener('DOMContentLoaded', function() {
    // Mobile detection
    const isMobile = window.innerWidth <= 768;
    
    // Enhanced mobile navigation
    function initMobileNavigation() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (sidebarToggle && sidebar && sidebarOverlay) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('show');
                sidebarOverlay.classList.toggle('show');
                document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
            });
            
            sidebarOverlay.addEventListener('click', function() {
                sidebar.classList.remove('show');
                sidebarOverlay.classList.remove('show');
                document.body.style.overflow = '';
            });
            
            // Close sidebar when clicking nav links on mobile
            const navLinks = sidebar.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('show');
                        sidebarOverlay.classList.remove('show');
                        document.body.style.overflow = '';
                    }
                });
            });
        }
    }
    
    // Responsive table enhancements
    function enhanceTablesForMobile() {
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            // Add touch scrolling indicators
            const tableWrapper = table.closest('.table-responsive');
            if (tableWrapper && isMobile) {
                tableWrapper.style.position = 'relative';
                
                // Add scroll indicator
                const scrollIndicator = document.createElement('div');
                scrollIndicator.className = 'scroll-indicator';
                scrollIndicator.innerHTML = '<i class="fas fa-chevron-right"></i>';
                scrollIndicator.style.cssText = `
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0,0,0,0.1);
                    padding: 5px;
                    border-radius: 3px;
                    font-size: 12px;
                    opacity: 0.7;
                `;
                tableWrapper.appendChild(scrollIndicator);
                
                // Hide indicator when scrolled to end
                tableWrapper.addEventListener('scroll', function() {
                    const isAtEnd = this.scrollLeft >= (this.scrollWidth - this.clientWidth - 10);
                    scrollIndicator.style.opacity = isAtEnd ? '0' : '0.7';
                });
            }
        });
    }
    
    // Form enhancements for mobile
    function enhanceFormsForMobile() {
        // Auto-resize textareas
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        });
        
        // Improve select dropdowns on mobile
        const selects = document.querySelectorAll('select.form-select, select.form-control');
        selects.forEach(select => {
            if (isMobile) {
                select.style.fontSize = '16px'; // Prevent zoom on iOS
            }
        });
    }
    
    // Modal enhancements for mobile
    function enhanceModalsForMobile() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('shown.bs.modal', function() {
                if (isMobile) {
                    // Prevent background scrolling
                    document.body.style.overflow = 'hidden';
                    
                    // Focus first input in modal
                    const firstInput = modal.querySelector('input, textarea, select');
                    if (firstInput) {
                        setTimeout(() => firstInput.focus(), 100);
                    }
                }
            });
            
            modal.addEventListener('hidden.bs.modal', function() {
                if (isMobile) {
                    document.body.style.overflow = '';
                }
            });
        });
    }
    
    // Touch-friendly button groups
    function enhanceButtonGroupsForMobile() {
        const buttonGroups = document.querySelectorAll('.btn-group');
        buttonGroups.forEach(group => {
            if (isMobile) {
                group.classList.add('btn-group-vertical');
                const buttons = group.querySelectorAll('.btn');
                buttons.forEach(btn => {
                    btn.style.marginBottom = '5px';
                    btn.style.borderRadius = '0.375rem';
                });
            }
        });
    }
    
    // Initialize all enhancements
    initMobileNavigation();
    enhanceTablesForMobile();
    enhanceFormsForMobile();
    enhanceModalsForMobile();
    enhanceButtonGroupsForMobile();
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            // Recalculate layouts after orientation change
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                const sidebarOverlay = document.getElementById('sidebarOverlay');
                if (sidebarOverlay) sidebarOverlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        }, 100);
    });
    
    // Add swipe gestures for mobile navigation
    if (isMobile) {
        let startX = 0;
        let currentX = 0;
        let startY = 0;
        let currentY = 0;
        
        document.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', function(e) {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', function(e) {
            const diffX = currentX - startX;
            const diffY = Math.abs(currentY - startY);
            const sidebar = document.getElementById('sidebar');
            const sidebarOverlay = document.getElementById('sidebarOverlay');
            
            // Swipe right to open sidebar (from left edge)
            if (diffX > 50 && diffY < 100 && startX < 50 && sidebar && !sidebar.classList.contains('show')) {
                sidebar.classList.add('show');
                if (sidebarOverlay) sidebarOverlay.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
            
            // Swipe left to close sidebar
            if (diffX < -50 && diffY < 100 && sidebar && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                if (sidebarOverlay) sidebarOverlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
});