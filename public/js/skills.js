// Dynamic Skills Section
class SkillsManager {
    constructor() {
        this.skillsContainer = document.querySelector('.skills-widget');
        this.init();
    }    async init() {
        try {
            await this.loadSkills();
        } catch (error) {
            // Silently handle errors in production
            // Error logging should be handled server-side
        }
    }

    async loadSkills() {
        try {
            const response = await fetch('/api/skills');
            const skills = await response.json();
            
            if (skills && skills.length > 0) {
                this.renderSkills(skills);
                this.initAnimations();
            }        } catch (error) {
            // Silently handle errors in production
            // Error logging should be handled server-side
        }
    }

    renderSkills(skills) {
        if (!this.skillsContainer) return;

        const skillsHTML = skills.map((skill, index) => {
            const delay = (index + 1) * 0.1; // Stagger animation delays
            return `
                <div class="skill-item wow fadeInUp" data-wow-delay="${delay}s">
                    <div class="skill-inner">
                        <div class="icon-box">
                            <img src="/assets/img/icons/${skill.icon}" alt="${skill.name}">
                        </div>
                        <div class="number">${skill.percentage}%</div>
                    </div>
                    <p>${skill.name}</p>
                </div>
            `;
        }).join('');

        this.skillsContainer.innerHTML = skillsHTML;
    }

    initAnimations() {
        // Reinitialize WOW.js for new elements if it exists
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }

        // Add scroll-triggered percentage animation
        this.animatePercentages();
    }

    animatePercentages() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numberElement = entry.target.querySelector('.number');
                    if (numberElement && !numberElement.classList.contains('animated')) {
                        const finalValue = parseInt(numberElement.textContent);
                        this.animateNumber(numberElement, 0, finalValue, 2000);
                        numberElement.classList.add('animated');
                    }
                }
            });
        }, { threshold: 0.5 });

        skillItems.forEach(item => observer.observe(item));
    }

    animateNumber(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current) + '%';
        }, 16);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SkillsManager();
});