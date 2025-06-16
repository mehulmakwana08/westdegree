/**
 * Contact Management JavaScript
 * Handles contact management functionality including reply button
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle reply button clicks
    const replyButtons = document.querySelectorAll('.reply-btn');
    
    if (replyButtons && replyButtons.length > 0) {
        replyButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const email = this.getAttribute('data-email');
                const name = this.getAttribute('data-name') || 'there';
                
                if (email) {
                    // Format the email with proper encoding
                    const subject = encodeURIComponent('Re: Your inquiry');
                    const body = encodeURIComponent(`Hi ${name},\n\nThank you for contacting us.\n\n`);
                    
                    // Use window.open with user gesture (within click handler)
                    // This prevents the "Not allowed to launch" error
                    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
                } else {
                    console.error('No email address found for reply');
                    alert('Unable to reply: No email address found.');
                }
            });
        });
    }
    
    // Handle bulk actions
    const bulkActionForm = document.getElementById('bulk-action-form');
    const selectAllCheckbox = document.getElementById('select-all');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.contact-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // Handle mobile sidebar toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('show');
            }
        });
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function() {
                sidebar.classList.remove('show');
                sidebarOverlay.classList.remove('show');
            });
        }
    }
    
    // Responsive table handling
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
    
    // Handle contact status updates
    const statusToggles = document.querySelectorAll('.status-toggle');
    if (statusToggles.length > 0) {
        statusToggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const contactId = this.getAttribute('data-id');
                const isRead = this.checked;
                
                // Update contact status via AJAX
                fetch(`/api/contacts/${contactId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ isRead })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Contact updated:', data);
                })
                .catch(error => {
                    console.error('Error updating contact:', error);
                });
            });
        });
    }
});