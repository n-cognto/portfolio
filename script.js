// Smooth scrolling and active link management
document.querySelectorAll('a.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        // Smooth scroll to the target section
        document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });

        // Remove 'active' class from all nav links and add it to the clicked link
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

// Intersection Observer for section visibility animation
document.body.classList.add('transition');
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    },
    { threshold: 0.1 }
);

document.querySelectorAll('.section').forEach((section) => {
    section.classList.add('hidden');
    observer.observe(section);
});

// Animate skill bars on scroll
const observeSkills = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.progress-fill').forEach(fill => {
                const width = fill.parentElement.previousElementSibling.lastElementChild.textContent;
                fill.style.width = width;
            });
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.skill-card').forEach(card => {
    observeSkills.observe(card);
});

// Error logging utility
class ErrorLogger {
    static log(error, context = {}) {
        console.error('Portfolio Error:', error, context);
        // Optionally send errors to a logging service:
        // fetch('/api/log-error', {
        //     method: 'POST',
        //     body: JSON.stringify({ error: error.message, context }),
        // });
    }
}

// Form Validation Utility
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateField(input) {
        if (input.validity.valueMissing) {
            return `${input.name.charAt(0).toUpperCase() + input.name.slice(1)} is required`;
        }
        if (input.validity.typeMismatch && input.type === 'email') {
            return 'Please enter a valid email address';
        }
        if (input.validity.tooShort) {
            return `${input.name.charAt(0).toUpperCase() + input.name.slice(1)} is too short`;
        }
        return '';
    }
}

// Portfolio Interaction Manager
class PortfolioInteractions {
    constructor() {
        this.initSmoothScroll();
        this.initStickyNavigation();
        this.initSectionObservers();
        this.initLazyLoading();
        this.initProjectModal();
        this.initContactForm();
        this.initSkillCircles();
    }

    initSmoothScroll() {
        document.querySelectorAll('a.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = document.querySelector(link.getAttribute('href'));
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                document.querySelectorAll('.nav-link').forEach(nav => 
                    nav.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    initStickyNavigation() {
        const nav = document.querySelector('.nav');
        window.addEventListener('scroll', () => {
            nav.classList.toggle('sticky', window.scrollY > 100);
        });
    }

    initSectionObservers() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle('visible', entry.isIntersecting);
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.section').forEach((section) => {
            section.classList.add('hidden');
            observer.observe(section);
        });
    }

    initLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-image');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    initProjectModal() {
        const modal = document.getElementById('projectModal');
        const closeBtn = modal.querySelector('.close-btn');

        document.querySelectorAll('.preview-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showProjectPreview(button.dataset.project);
            });
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    showProjectPreview(projectId) {
        const projectData = {
            'campus-interaction': {
                title: 'Campus Interaction Platform',
                content: `
                    <img src="media/Screenshot_From_2024-11-24_08-44-14.png" alt="Project Preview" style="width: 100%; margin-bottom: 20px;">
                    <h3>Features</h3>
                    <ul>
                        <li>Real-time discussion forums</li>
                        <li>Event management system</li>
                        <li>Resource sharing platform</li>
                        <li>User authentication and authorization</li>
                    </ul>
                `
            },
            'expense-tracker': {
                title: 'Smart Expense Tracker',
                content: `
                    <img src="media/Screenshot_From_2024-11-24_08-15-12.png" alt="Project Preview" style="width: 100%; margin-bottom: 20px;">
                    <h3>Features</h3>
                    <ul>
                        <li>Interactive spending analytics dashboard</li>
                        <li>Monthly budget planning tools</li>
                        <li>Export reports in multiple formats</li>
                        <li>Secure data encryption</li>
                    </ul>
                `
            }
        };

        const project = projectData[projectId];
        if (project) {
            document.getElementById('modalTitle').textContent = project.title;
            document.getElementById('modalContent').innerHTML = project.content;
            document.getElementById('projectModal').style.display = 'flex';
        } else {
            ErrorLogger.log(new Error('Project not found'), { projectId });
        }
    }

    initContactForm() {
        const contactForm = document.getElementById('contactForm');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const spinner = submitButton.querySelector('.spinner');

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            submitButton.disabled = true;
            spinner.style.display = 'inline-block';

            try {
                const inputs = contactForm.querySelectorAll('input, textarea');
                let isValid = true;

                inputs.forEach(input => {
                    const errorSpan = input.nextElementSibling;
                    const errorMessage = FormValidator.validateField(input);

                    if (errorMessage) {
                        errorSpan.textContent = errorMessage;
                        input.setAttribute('aria-invalid', 'true');
                        isValid = false;
                    } else {
                        errorSpan.textContent = '';
                        input.removeAttribute('aria-invalid');
                    }
                });

                if (!isValid) return;

                const formData = Object.fromEntries(new FormData(contactForm));
                await new Promise(resolve => setTimeout(resolve, 2000));

                contactForm.reset();
                alert('Message sent successfully!');

            } catch (error) {
                ErrorLogger.log(error, { formData: formData });
                alert('An error occurred. Please try again.');
            } finally {
                submitButton.disabled = false;
                spinner.style.display = 'none';
            }
        });
    }

    initSkillCircles() {
        document.querySelectorAll('.skill-circle').forEach(circle => {
            const progress = parseFloat(circle.dataset.progress);
            const radius = 54;
            const circumference = 2 * Math.PI * radius;
            const progressCircle = circle.querySelector('.progress');
            const skillLabel = circle.querySelector('.skill-label');

            progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            progressCircle.style.strokeDashoffset = circumference;

            progressCircle.style.setProperty('--progress', progress);
            progressCircle.style.setProperty('--circumference', circumference);

            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const offset = circumference - (progress / 100 * circumference);
                            progressCircle.style.strokeDashoffset = offset;
                            progressCircle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.65, 0, 0.35, 1)';

                            if (skillLabel) {
                                skillLabel.style.transform = 'translateX(-50%) translateY(0)';
                                skillLabel.style.opacity = '1';
                            }

                            this.animateCountUp(circle, progress);
                        }
                    });
                },
                { threshold: 0.5 }
            );

            observer.observe(circle);
        });
    }

    animateCountUp(circle, targetProgress) {
        const percentageElement = document.createElement('span');
        percentageElement.classList.add('skill-percentage');
        percentageElement.style.position = 'absolute';
        percentageElement.style.top = '-25px';
        percentageElement.style.left = '50%';
        percentageElement.style.transform = 'translateX(-50%)';
        percentageElement.style.color = '#1e3c72';
        percentageElement.style.fontWeight = 'bold';

        circle.appendChild(percentageElement);

        let progress = 0;
        const duration = 1500;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const percentage = Math.min(elapsed / duration, 1);

            progress = Math.floor(percentage * targetProgress);
            percentageElement.textContent = `${progress}%`;

            if (percentage < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PortfolioInteractions();
});

class CertificationCarousel {
    constructor() {
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isAnimating = false;

        this.track = document.getElementById('carouselTrack');
        this.dotsContainer = document.getElementById('carouselDots');
        this.progressBar = document.getElementById('progress');
        
        this.initializeCertifications();
        this.setupEventListeners();
        this.startAutoPlay();
        this.updateCarousel();
    }

    async fetchCertifications() {
        return [
            {
                title: "Virtual Assistant",
                platform: "ALX Africa",
                date: "Sep 2024",
                logo: "media/alx-logo.png",
                link: ""
            },
            {
                title: "IBM Cyber Security Fundamentals",
                platform: "IBM",
                date: "Nov 2024",
                logo: "media/ibm-logo.jpeg",
                link: "https://www.credly.com/badges/f5dfe17d-fa3c-48e6-b078-64673e19e06f/linked_in?t=smy6uv"
            },
            {
                title: "Introduction to Exploits",
                platform: "Udemy",
                date: "February 2024",
                logo: "media/udemy-logo.jpeg",
                link: "https://drive.google.com/file/d/151bCSGRgKV_H3iOpW0AznjYVf-81KTgt/view?usp=drive_link"
            },
            {
                title: "Python for Everybody",
                platform: "Try Kibo School",
                date: "March 2024",
                logo: "media/python-logo.jpeg",
                link: ""
            },
            {
                title: "Artificial Intelligence",
                platform: "IBM SkillBuild",
                date: "June 2024",
                logo: "media/ibm-logo.jpeg",
                link: "https://www.credly.com/earner/earned/badge/23be8694-6541-457f-a02f-28e91358bfea"
            },
            {
                title: "Our Future with AI",
                platform: "ALX Africa",
                date: "June 2024",
                logo: "media/alx-logo.png",
                link: "https://drive.google.com/file/d/1HC1PRgQoEXt5lsJBq8oPxPj5dThwOMhe/view?usp=drive_link"
            },
            {
                title: "Python Basics",
                platform: "Hackerrank",
                date: "March 2024",
                logo: "media/python-logo.jpeg",
                link: "https://drive.google.com/file/d/1IWAJQoSBuqPqQG0RZYZERIjor3pSzk8s/view?usp=drive_link"
            },
            {
                title: "Cisco CyberShujaa Ethical Hacking",
                platform: "Cisco",
                date: "Dec 2024",
                logo: "media/cyber-shujaa.jpeg",
                link: "https://www.credly.com/badges/ad9cca44-6a8d-4658-8dac-6d800b0e3170/public_url"
            },
            {
                title: "Web Development, Software Engineering, Database Administration & Python Programming",
                platform: "Power Learn Project",
                date: "Dec 2024",
                logo: "media/power-learn.jpeg",
                link: "https://drive.google.com/file/d/1LF84BkzE0_PFTrdzFbWgLy_ZuOv7G2NT/view?usp=drive_link"
            },
            {
                title: "Information Technology Fundamentals",
                platform: "IBM SkillBuild",
                date: "Dec 2024",
                logo: "media/ibm-logo.jpeg",
                link: "https://www.credly.com/badges/3f0e2914-f90d-461a-bb01-e80b03b3499d/public_url"
            },
            {
                title: "Emerging Tech",
                platform: "IBM SkillBuild",
                date: "Dec 2024",
                logo: "media/ibm-logo.jpeg",
                link: "https://www.credly.com/badges/44131d76-1d84-44a1-b3b4-7a5dd009358b/public_url"
            },
            {
                title: "Advent of Cyber 2024",
                platform: "TryHackMe",
                date: "Dec 2024",
                logo: "media/tryhackme.jpeg",
                link: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-SKFNHTF5K6.pdf"
            }
        ];
    }

    async initializeCertifications() {
        const certifications = await this.fetchCertifications();
        this.totalSlides = certifications.length;

        certifications.forEach((cert, index) => {
            this.createSlide(cert, index);
            this.createDot(index);
        });

        this.preloadImages(certifications);
    }

    createSlide(cert, index) {
        const slide = document.createElement('div');
        slide.className = `cert-slide ${index === 0 ? 'active' : ''}`;
        slide.setAttribute('role', 'tabpanel');
        slide.setAttribute('aria-label', `Slide ${index + 1} of ${this.totalSlides}`);

        const cardClass = cert.link ? 'cert-card' : 'cert-card no-link';
        slide.innerHTML = `
            <div class="${cardClass}" data-link="${cert.link || ''}" 
                 role="button" tabindex="0">
                <img src="${cert.logo}" alt="${cert.platform} logo" class="cert-logo"
                     loading="lazy">
                <div class="cert-info">
                    <h3>${cert.title}</h3>
                    <p>${cert.platform}</p>
                    <p>${cert.date}</p>
                    ${!cert.link ? '<p class="visually-hidden">No link available</p>' : ''}
                </div>
            </div>
        `;

        this.track.appendChild(slide);
    }

    createDot(index) {
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => this.goToSlide(index));
        this.dotsContainer.appendChild(dot);
    }

    preloadImages(certifications) {
        certifications.forEach(cert => {
            const img = new Image();
            img.src = cert.logo;
        });
    }

    setupEventListeners() {
        document.getElementById('prevButton').addEventListener('click', () => this.prevSlide());
        document.getElementById('nextButton').addEventListener('click', () => this.nextSlide());
        
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        const carousel = document.getElementById('carousel');
        carousel.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        carousel.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        carousel.addEventListener('touchend', () => this.handleTouchEnd());

        // Handle card clicks
        this.track.addEventListener('click', (e) => {
            const card = e.target.closest('.cert-card');
            if (card && !card.classList.contains('no-link')) {
                const link = card.dataset.link;
                if (link) window.open(link, '_blank');
            }
        });
    }

    updateCarousel() {
        if (this.isAnimating) {
            requestAnimationFrame(() => {
                this.updateCarousel(); // Try again next frame if animating
            });
            return;
        }
        this.isAnimating = true;
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)';
        this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    
        // Let the transition complete before allowing another slide change
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
        
        // Update slides
        document.querySelectorAll('.cert-slide').forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
            dot.setAttribute('aria-selected', index === this.currentSlide ? 'true' : 'false');
        });

        // Update progress
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
        this.restartAutoPlay();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
        this.restartAutoPlay();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
        this.restartAutoPlay();
    }

    handleKeydown(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.prevSlide();
                break;
            case 'ArrowRight':
                this.nextSlide();
                break;
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.stopAutoPlay();
    }

    handleTouchMove(e) {
        if (!this.touchStartX) return;
        
        const currentX = e.touches[0].clientX;
        const diff = this.touchStartX - currentX;
        
        if (Math.abs(diff) > 5) {
            e.preventDefault();
        }
    }

    handleTouchEnd() {
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) this.nextSlide();
            else this.prevSlide();
        }

        this.touchStartX = null;
        this.touchEndX = null;
        this.startAutoPlay();
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    restartAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    new CertificationCarousel();
});
document.addEventListener('DOMContentLoaded', () => {
    const quickStats = document.querySelector('.quick-stats');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                quickStats.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    observer.observe(quickStats);
});
