// Improved JavaScript file for the Django portfolio project
document.addEventListener('DOMContentLoaded', function() {
    // Show page content (fix for white screen)
    document.body.classList.add('loaded');
    
    // Initialize portfolio functionality
    initSmoothScrolling();
    initFooterLinks();
    initStickyNavigation();
    initSectionObservers();
    initMobileNavigation();
    initThemeToggle();
    initProjectFilter();
    initProjectModal();
    initScrollToTop();
    initSkillsCarousel(); // Initialize the skills carousel
    
    // Launch certificate carousel if present
    if (document.getElementById('carouselTrack')) {
        initCertificateCarousel();
    }
    
    // Initialize project carousel if present
    if (document.getElementById('projectTrack')) {
        initProjectCarousel();
    }
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    // Handle internal links (anchor links)
    document.querySelectorAll('a.nav-link.internal-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const isCurrentPage = !href.includes('/') || window.location.pathname === '/' || window.location.pathname === '/home/' || window.location.pathname === '/index.html';
            
            // Only use smooth scrolling if we're already on the main page
            if (isCurrentPage) {
                e.preventDefault();
                const targetId = href.split('#')[1];
                const targetSection = document.querySelector('#' + targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(nav => 
                        nav.classList.remove('active'));
                    this.classList.add('active');
                }
            }
            // If not on the main page, let the browser handle the navigation to the URL with the anchor
        });
    });
    
    // External links should work normally with their href without preventDefault
    document.querySelectorAll('a.nav-link.external-link').forEach(link => {
        link.addEventListener('click', function() {
            // No preventDefault here, allowing normal link behavior
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(nav => 
                nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Handle footer internal links for smooth scrolling
function initFooterLinks() {
    document.querySelectorAll('.footer-links .internal-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const isCurrentPage = !href.includes('/') || window.location.pathname === '/' || window.location.pathname === '/home/' || window.location.pathname === '/index.html';
            
            // Only use smooth scrolling if we're already on the main page
            if (isCurrentPage) {
                e.preventDefault();
                const targetId = href.split('#')[1];
                const targetSection = document.querySelector('#' + targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            // If not on the main page, let the browser handle the navigation to the URL with the anchor
        });
    });
    
    // External links in footer should work normally (no preventDefault)
}

// Sticky navigation on scroll
function initStickyNavigation() {
    const nav = document.querySelector('.nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('sticky', window.scrollY > 100);
        });
    }
}

// Section animations on scroll
function initSectionObservers() {
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
    
    // Special animation for quick stats in about section
    const quickStats = document.querySelector('.quick-stats');
    if (quickStats) {
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    quickStats.classList.add('visible');
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statObserver.observe(quickStats);
    }
}

// Mobile navigation functionality
function initMobileNavigation() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            nav.classList.toggle('mobile-active');
            
            // Toggle ARIA expanded state
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Prevent scrolling when menu is open
            document.body.style.overflow = nav.classList.contains('mobile-active') ? 'hidden' : '';
        });
        
        // Close mobile menu when link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                nav.classList.remove('mobile-active');
                document.body.style.overflow = '';
            });
        });
    }
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (themeToggle) {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Show theme toggle with animation
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
            themeToggle.style.opacity = '1';
        }, 500);
        
        // Toggle theme on click
        themeToggle.addEventListener('click', () => {
            if (document.documentElement.getAttribute('data-theme') === 'light') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
        
        // System preference change event
        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                }
            }
        });
    }
}

// Project filtering functionality
function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectSlides = document.querySelectorAll('.project-slide');
    
    if (filterButtons.length && projectSlides.length) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get filter value
                const filterValue = button.getAttribute('data-filter');
                
                // Filter projects
                let visibleProjects = [];
                
                projectSlides.forEach((slide, index) => {
                    const category = slide.getAttribute('data-category');
                    
                    // Show slide if filter is 'all' or slide category matches filter
                    const isVisible = filterValue === 'all' || filterValue === category;
                    
                    // Store visible project indices
                    if (isVisible) {
                        visibleProjects.push(index);
                    }
                    
                    // Apply visibility styles
                    slide.classList.toggle('hidden-project', !isVisible);
                });
                
                // If carousel is initialized, update it
                if (visibleProjects.length > 0 && typeof updateProjectCarousel === 'function') {
                    updateProjectCarousel(visibleProjects[0]);
                }
            });
        });
    }
}

// Project modal functionality
function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const closeBtn = modal ? modal.querySelector('.close-btn') : null;
    const previewButtons = document.querySelectorAll('.preview-btn');
    
    if (modal && closeBtn && previewButtons.length) {
        previewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                showProjectPreview(button.dataset.project);
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
}

// Show project preview in modal
function showProjectPreview(projectId) {
    const projectData = {
        'campus-interaction': {
            title: 'Campus Interaction Platform',
            content: `
                <img src="/static/main/media/Screenshot From 2024-11-24 08-44-14.png" alt="Project Preview" style="width: 100%; margin-bottom: 20px;">
                <h3>Features</h3>
                <ul>
                    <li>Real-time discussion forums</li>
                    <li>Event management system</li>
                    <li>Resource sharing platform</li>
                    <li>User authentication and authorization</li>
                </ul>
            `
        },
        'easy-letters': {
    title: 'Easy Letters',
    content: `
        <img src="/static/main/media/easy-letter.png" alt="Easy Letters Project Preview" style="width: 100%; margin-bottom: 20px;">
        <div class="modal-project-details">
            <h3>Overview</h3>
            <p>Easy Letters is a user-friendly web application that enables organizations to generate personalized letters from Word templates using data from Excel files. It's designed specifically for non-technical users while delivering powerful functionality.</p>
            
            <h3>Problem Statement</h3>
            <p>Many organizations struggle with creating personalized communications at scale. Traditional methods are time-consuming, error-prone, and lack accessibility features. Easy Letters solves these challenges with an intuitive interface and advanced automation.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>User-friendly template management with version control</li>
                <li>Seamless Excel data integration with dynamic field mapping</li>
                <li>AI-powered grammar checking and content suggestions</li>
                <li>Multi-channel delivery (email, SMS, WhatsApp, postal)</li>
                <li>Digital signatures with DocuSign & Adobe Sign integration</li>
                <li>Accessibility support for large-print and screen readers</li>
                <li>Environmental impact reporting and sustainability metrics</li>
            </ul>
            
            <h3>Technology Stack</h3>
            <div class="tech-badges">
                <span class="tech-badge">Django 5.2+</span>
                <span class="tech-badge">Python 3.x</span>
                <span class="tech-badge">Celery</span>
                <span class="tech-badge">Redis</span>
                <span class="tech-badge">PostgreSQL</span>
                <span class="tech-badge">Docker</span>
                <span class="tech-badge">LibreOffice</span>
            </div>
            
            <h3>Business Impact</h3>
            <p>Easy Letters dramatically reduces the time and resources needed to create personalized communications, while improving engagement through AI-enhanced content and multi-channel delivery options.</p>
            
            <div class="project-cta">
                <p>
                    <a href="https://easy-letters-production.up.railway.app/" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Visit Live Demo
                    </a>
                </p>
            </div>
        </div>
    `
},
        'expense-tracker': {
            title: 'Smart Expense Tracker',
            content: `
                <img src="/static/main/media/Screenshot From 2024-11-24 08-15-12.png" alt="Project Preview" style="width: 100%; margin-bottom: 20px;">
                <h3>Features</h3>
                <ul>
                    <li>Interactive spending analytics dashboard</li>
                    <li>Monthly budget planning tools</li>
                    <li>Export reports in multiple formats</li>
                    <li>Secure data encryption</li>
                </ul>
            `
        },
        'tuunganishe': {
            title: 'Tuunganishe – Reconnecting Lost Connections',
            content: `
                <img src="/static/main/media/tuunganishe-homepage.png" alt="Tuunganishe Project Preview" style="width: 100%; margin-bottom: 20px;">
                <div class="modal-project-details">
                    <h3>Overview</h3>
                    <p>Tuunganishe is a web-based platform designed to help individuals in Kenya and beyond reconnect with lost relatives, friends, or former acquaintances. The project addresses a profound social challenge—disconnection—and provides a compassionate digital solution.</p>
                    
                    <h3>Problem Statement</h3>
                    <p>In many Kenyan communities, people lose contact with loved ones due to migration, family disputes, or lack of communication tools. Traditional methods of reconnecting are often unreliable, scattered, or inaccessible.</p>
                    
                    <h3>Key Features</h3>
                    <ul>
                        <li>Intelligent search algorithms for finding lost connections</li>
                        <li>Emotionally-driven UI/UX focused on reconnection</li>
                        <li>Community support system for collective searching</li>
                        <li>Secure identity verification process</li>
                    </ul>
                    
                    <h3>Technology Stack</h3>
                    <div class="tech-badges">
                        <span class="tech-badge">React.js</span>
                        <span class="tech-badge">Django</span>
                        <span class="tech-badge">PostgreSQL</span>
                        <span class="tech-badge">AWS</span>
                        <span class="tech-badge">Google Cloud</span>
                    </div>
                    
                    <h3>Impact</h3>
                    <p>Tuunganishe is more than a tech product—it's a movement toward restoring human connections. Starting with a focus in Kenya, the platform aims to expand regionally and support diaspora communities.</p>
                    
                    <blockquote>
                        <p>"Tuunganishe – Because lost doesn't mean gone."</p>
                    </blockquote>
                </div>
            `
        }
    };

    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (modal && modalTitle && modalContent) {
        // Check if projectId is a number (from database) or string (hardcoded)
        if (!isNaN(projectId)) {
            // For database projects, make fetch request to get project details
            fetch(`/api/project/${projectId}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Project not found');
                    }
                    return response.json();
                })
                .then(data => {
                    modalTitle.textContent = data.title;
                    modalContent.innerHTML = `
                        <img src="${data.image}" alt="${data.title}" style="width: 100%; margin-bottom: 20px;">
                        <p>${data.description}</p>
                        <h3>Technologies</h3>
                        <p>${data.technologies}</p>
                        ${data.github_url ? `<p><a href="${data.github_url}" target="_blank">GitHub Repository</a></p>` : ''}
                        ${data.url ? `<p><a href="${data.url}" target="_blank">Live Demo</a></p>` : ''}
                    `;
                    modal.style.display = 'flex';
                })
                .catch(error => {
                    console.error('Error fetching project:', error);
                    alert('Could not load project details');
                });
        } else {
            // For hardcoded projects
            const project = projectData[projectId];
            if (project) {
                modalTitle.textContent = project.title;
                modalContent.innerHTML = project.content;
                modal.style.display = 'flex';
            } else {
                console.error('Project not found:', projectId);
            }
        }
    }
}

// Scroll to top button functionality
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    if (scrollTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top on click
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Certificates data
const certificationsData = [
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
    },
    {
        title: "IBM Cyber-Security with Capstone",
        platform: "IBM",
        date: "Apil 2025",
        logo: "media/ibm-logo.jpeg",
        link: "https://www.credly.com/badges/f5dfe17d-fa3c-48e6-b078-64673e19e06f/linked_in?t=smy6uv"
    }
];

// Certificate carousel functionality
function initCertificateCarousel() {
    const carousel = document.getElementById('carousel');
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    const progressBar = document.getElementById('progress');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    if (!carousel || !track || !dotsContainer || !progressBar || !prevButton || !nextButton) {
        console.warn('Certificate carousel elements not found');
        return;
    }
    
    // Load certificates dynamically if track is empty
    if (track.children.length === 0) {
        loadCertificates();
    }
    
    let currentSlide = 0;
    let autoPlayInterval = null;
    let isAnimating = false;
    
    // Get all slides
    const slides = track.querySelectorAll('.cert-slide');
    const totalSlides = slides.length;
    
    if (totalSlides === 0) {
        console.warn('No certificate slides found');
        return;
    }
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Initialize carousel
    updateCarousel();
    startAutoPlay();
    
    // Navigation buttons
    prevButton.addEventListener('click', function(e) {
        e.preventDefault();
        prevSlide();
    });
    
    nextButton.addEventListener('click', function(e) {
        e.preventDefault();
        nextSlide();
    });
    
    // Helper function to load certificates dynamically
    function loadCertificates() {
        // Clear existing content
        track.innerHTML = '';
        
        // Add each certificate from the data
        certificationsData.forEach((cert, index) => {
            const slide = document.createElement('div');
            slide.className = `cert-slide ${index === 0 ? 'active' : ''}`;
            slide.setAttribute('role', 'tabpanel');
            slide.setAttribute('aria-label', `Slide ${index + 1} of ${certificationsData.length}`);
            
            slide.innerHTML = `
                <div class="cert-card ${cert.link ? '' : 'no-link'}" data-link="${cert.link}" role="button" tabindex="0">
                    <img src="/static/main/${cert.logo}" alt="${cert.platform} logo" class="cert-logo" loading="lazy">
                    <div class="cert-info">
                        <h3>${cert.title}</h3>
                        <p>${cert.platform}</p>
                        <p>${cert.date}</p>
                        ${cert.link ? '' : '<p class="visually-hidden">No link available</p>'}
                    </div>
                </div>
            `;
            
            track.appendChild(slide);
        });
    }
    
    let currentSlide = 0;
    let autoPlayInterval = null;
    let isAnimating = false;
    
    // Get all slides
    const slides = track.querySelectorAll('.cert-slide');
    const totalSlides = slides.length;
    
    if (totalSlides === 0) {
        console.warn('No certificate slides found');
        return;
    }
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Initialize carousel
    updateCarousel();
    startAutoPlay();
    
    // Navigation buttons
    prevButton.addEventListener('click', function(e) {
        e.preventDefault();
        prevSlide();
    });
    
    nextButton.addEventListener('click', function(e) {
        e.preventDefault();
        nextSlide();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only respond to keyboard events when focused on certificate section
        if (carousel.contains(document.activeElement)) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        }
    });
    
    // Touch events
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        stopAutoPlay();
    });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
        startAutoPlay();
    });
    
    // Certificate card links
    track.addEventListener('click', (e) => {
        const card = e.target.closest('.cert-card');
        if (card && !card.classList.contains('no-link')) {
            const link = card.dataset.link;
            if (link) window.open(link, '_blank');
        }
    });
    
    // Helper functions
    function updateCarousel() {
        if (isAnimating) {
            requestAnimationFrame(() => {
                updateCarousel();
            });
            return;
        }
        
        isAnimating = true;
        track.style.transition = 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)';
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Let the transition complete before allowing another slide change
        setTimeout(() => {
            isAnimating = false;
        }, 500);
        
        // Update slides
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
            slide.setAttribute('aria-hidden', index !== currentSlide);
        });
        
        // Update dots
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
            dot.setAttribute('aria-selected', index === currentSlide ? 'true' : 'false');
        });
        
        // Update progress
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
        restartAutoPlay();
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
        restartAutoPlay();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
        restartAutoPlay();
    }
    
    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => nextSlide(), 5000);
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }
    
    function restartAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }
}

// Project carousel functionality
let currentProjectSlide = 0;
let projectCarouselInitialized = false;
let projectAutoPlayInterval = null;

function initProjectCarousel() {
    const carouselTrack = document.getElementById('projectTrack');
    const prevButton = document.getElementById('prevProject');
    const nextButton = document.getElementById('nextProject');
    const projectSlides = document.querySelectorAll('.project-slide');
    const indicatorsContainer = document.getElementById('projectIndicators');
    
    if (!carouselTrack || !prevButton || !nextButton || !projectSlides.length || !indicatorsContainer) {
        console.warn('Project carousel elements not found');
        return;
    }
    
    const totalSlides = projectSlides.length;
    let isAnimating = false;
    
    // Create indicators
    createProjectIndicators();
    
    // Add event listeners for navigation
    prevButton.addEventListener('click', function(e) {
        e.preventDefault();
        prevProject();
    });
    
    nextButton.addEventListener('click', function(e) {
        e.preventDefault();
        nextProject();
    });
    
    // Update carousel on start
    updateProjectCarousel();
    
    // Start auto rotation
    startProjectAutoPlay();
    
    // Keyboard navigation (scope to projects section only)
    document.addEventListener('keydown', handleProjectKeyboardNav);
    
    // Touch events for mobile swiping
    let touchStartX = 0;
    let touchEndX = 0;
    
    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        stopProjectAutoPlay();
    });
    
    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleProjectSwipe();
        startProjectAutoPlay();
    });
    
    // Pause auto-rotation when hovering
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
        projectsSection.addEventListener('mouseenter', stopProjectAutoPlay);
        projectsSection.addEventListener('mouseleave', startProjectAutoPlay);
    }
    
    // Mark as initialized
    projectCarouselInitialized = true;
    
    function createProjectIndicators() {
        // Clear existing indicators
        indicatorsContainer.innerHTML = '';
        
        // Create an indicator for each visible slide
        let visibleIndex = 0;
        projectSlides.forEach((slide, index) => {
            if (!slide.classList.contains('hidden-project')) {
                const indicator = document.createElement('button');
                indicator.classList.add('project-indicator');
                indicator.setAttribute('aria-label', `Go to project ${visibleIndex + 1}`);
                indicator.setAttribute('data-index', index);
                
                if (index === currentProjectSlide) {
                    indicator.classList.add('active');
                }
                
                indicator.addEventListener('click', () => {
                    goToProject(index);
                    restartProjectAutoPlay();
                });
                
                indicatorsContainer.appendChild(indicator);
                visibleIndex++;
            }
        });
        
        // Add progress bar
        if (!document.getElementById('project-progress-container')) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-bar';
            progressContainer.id = 'project-progress-container';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress';
            progressBar.id = 'project-progress';
            
            progressContainer.appendChild(progressBar);
            indicatorsContainer.parentNode.appendChild(progressContainer);
        }
    }
    
    function updateProjectCarousel(targetIndex = null) {
        // If a specific target index is provided, use it
        if (targetIndex !== null) {
            currentProjectSlide = targetIndex;
        }
        
        // Apply smooth transition
        carouselTrack.style.transition = 'transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)';
        
        // Update the transform to move to the current slide
        carouselTrack.style.transform = `translateX(-${currentProjectSlide * 100}%)`;
        
        // Update the active class on slides
        projectSlides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentProjectSlide);
            slide.setAttribute('aria-hidden', index !== currentProjectSlide);
        });
        
        // Update indicators
        const indicators = indicatorsContainer.querySelectorAll('.project-indicator');
        indicators.forEach((indicator) => {
            const indicatorIndex = parseInt(indicator.getAttribute('data-index'));
            indicator.classList.toggle('active', indicatorIndex === currentProjectSlide);
        });
        
        // Update progress bar
        const progressBar = document.getElementById('project-progress');
        if (progressBar) {
            // Count visible slides
            const visibleSlides = Array.from(projectSlides).filter(
                slide => !slide.classList.contains('hidden-project')
            );
            const totalVisible = visibleSlides.length;
            const progress = ((currentProjectSlide + 1) / totalSlides) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    function goToProject(index) {
        // Only go to the slide if it's visible
        if (index >= 0 && index < projectSlides.length && !projectSlides[index].classList.contains('hidden-project')) {
            currentProjectSlide = index;
            updateProjectCarousel();
            restartProjectAutoPlay();
        }
    }
    
    function nextProject() {
        // Find the next visible slide
        let newIndex = currentProjectSlide;
        do {
            newIndex = (newIndex + 1) % totalSlides;
        } while (projectSlides[newIndex].classList.contains('hidden-project') && newIndex !== currentProjectSlide);
        
        // Only update if we found a different slide
        if (newIndex !== currentProjectSlide) {
            currentProjectSlide = newIndex;
            updateProjectCarousel();
        }
    }
    
    function prevProject() {
        // Find the previous visible slide
        let newIndex = currentProjectSlide;
        do {
            newIndex = (newIndex - 1 + totalSlides) % totalSlides;
        } while (projectSlides[newIndex].classList.contains('hidden-project') && newIndex !== currentProjectSlide);
        
        // Only update if we found a different slide
        if (newIndex !== currentProjectSlide) {
            currentProjectSlide = newIndex;
            updateProjectCarousel();
        }
    }
    
    function handleProjectKeyboardNav(e) {
        // Only handle keyboard navigation when focused in the projects section
        const projectsSection = document.getElementById('projects');
        if (projectsSection && projectsSection.contains(document.activeElement)) {
            if (e.key === 'ArrowLeft') {
                prevProject();
                e.preventDefault(); // Prevent page scroll
            } else if (e.key === 'ArrowRight') {
                nextProject();
                e.preventDefault(); // Prevent page scroll
            }
        }
    }
    
    function handleProjectSwipe() {
        const diff = touchStartX - touchEndX;
        const threshold = 50; // Minimum distance to trigger swipe
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left, go to next
                nextProject();
            } else {
                // Swipe right, go to previous
                prevProject();
            }
        }
    }
    
    function startProjectAutoPlay() {
        if (!projectAutoPlayInterval) {
            projectAutoPlayInterval = setInterval(() => nextProject(), 8000);
        }
    }
    
    function stopProjectAutoPlay() {
        if (projectAutoPlayInterval) {
            clearInterval(projectAutoPlayInterval);
            projectAutoPlayInterval = null;
        }
    }
    
    function restartProjectAutoPlay() {
        stopProjectAutoPlay();
        startProjectAutoPlay();
    }
    
    // Export functions for use by project filter
    window.updateProjectCarousel = updateProjectCarousel;
    window.createProjectIndicators = createProjectIndicators;
}

// Skills carousel functionality
function initSkillsCarousel() {
    const skillsTrack = document.getElementById('skillsTrack');
    const prevButton = document.getElementById('prevSkill');
    const nextButton = document.getElementById('nextSkill');
    const skillCards = document.querySelectorAll('.skill-card');
    const indicatorsContainer = document.getElementById('skillsIndicators');
    
    if (!skillsTrack || !prevButton || !nextButton || !skillCards.length) {
        console.warn('Skills carousel elements not found');
        return;
    }
    
    let currentSkillIndex = 0;
    let isAnimating = false;
    const totalSkills = skillCards.length;
    
    // Create indicators
    createSkillIndicators();
    
    // Add event listeners for navigation
    prevButton.addEventListener('click', function(e) {
        e.preventDefault();
        prevSkill();
    });
    
    nextButton.addEventListener('click', function(e) {
        e.preventDefault();
        nextSkill();
    });
    
    // Initialize the carousel
    updateSkillCarousel();
    
    // Animate meters on first visible card
    animateSkillMeters(skillCards[0]);
    
    // Touch events for mobile swiping
    let touchStartX = 0;
    let touchEndX = 0;
    
    skillsTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    skillsTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    // Helper Functions
    function createSkillIndicators() {
        if (!indicatorsContainer) return;
        
        // Clear existing indicators
        indicatorsContainer.innerHTML = '';
        
        // Create indicator for each skill card
        skillCards.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.classList.add('skill-indicator');
            indicator.setAttribute('aria-label', `Go to skill ${index + 1}`);
            
            if (index === currentSkillIndex) {
                indicator.classList.add('active');
            }
            
            indicator.addEventListener('click', () => {
                goToSkill(index);
            });
            
            indicatorsContainer.appendChild(indicator);
        });
    }
    
    function updateSkillCarousel() {
        if (isAnimating) return;
        
        isAnimating = true;
        
        // Update transform to show current skill
        skillsTrack.style.transition = 'transform 0.6s ease-in-out';
        skillsTrack.style.transform = `translateX(-${currentSkillIndex * 100}%)`;
        
        // Update indicators
        const indicators = indicatorsContainer ? indicatorsContainer.querySelectorAll('.skill-indicator') : [];
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSkillIndex);
        });
        
        // Animate skill meters for the current card
        animateSkillMeters(skillCards[currentSkillIndex]);
        
        // Reset animation flag after transition
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }
    
    function animateSkillMeters(card) {
        // Animate proficiency bars
        const proficiencyFills = card.querySelectorAll('.proficiency-fill');
        proficiencyFills.forEach(fill => {
            const targetWidth = fill.style.width;
            fill.style.width = '0%';
            
            setTimeout(() => {
                fill.style.width = targetWidth;
            }, 300);
        });
        
        // Animate skill levels
        const skillLevels = card.querySelectorAll('.skill-level');
        skillLevels.forEach(level => {
            const targetWidth = level.style.width;
            level.style.width = '0%';
            
            setTimeout(() => {
                level.style.width = targetWidth;
            }, 300);
        });
    }
    
    function prevSkill() {
        if (isAnimating) return;
        
        currentSkillIndex = (currentSkillIndex - 1 + totalSkills) % totalSkills;
        updateSkillCarousel();
    }
    
    function nextSkill() {
        if (isAnimating) return;
        
        currentSkillIndex = (currentSkillIndex + 1) % totalSkills;
        updateSkillCarousel();
    }
    
    function goToSkill(index) {
        if (isAnimating || index === currentSkillIndex) return;
        
        currentSkillIndex = index;
        updateSkillCarousel();
    }
    
    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        const threshold = 50; // Minimum distance to trigger swipe
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left, go to next
                nextSkill();
            } else {
                // Swipe right, go to previous
                prevSkill();
            }
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only handle keyboard navigation when focused in the skills section
        const skillsSection = document.getElementById('skills');
        if (skillsSection && skillsSection.contains(document.activeElement)) {
            if (e.key === 'ArrowLeft') {
                prevSkill();
                e.preventDefault(); // Prevent page scroll
            } else if (e.key === 'ArrowRight') {
                nextSkill();
                e.preventDefault(); // Prevent page scroll
            }
        }
    });
}
