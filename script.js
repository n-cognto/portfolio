        // Smooth scrolling and active link management
        document.querySelectorAll('a.nav-link').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });

                document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });
        // Sticky navigation
        window.addEventListener('scroll', function() {
            const nav = document.querySelector('.nav');
            if (window.scrollY > 100) {
                nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            } else {
                nav.style.backgroundColor = 'white';
            }
        });
        

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

        // Project Modal Functionality
        const modal = document.getElementById('projectModal');
        const previewButtons = document.querySelectorAll('.preview-btn');
        

        previewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = button.dataset.project;
                showProjectPreview(projectId);
            });
        });
        
        
        function showProjectPreview(projectId) {
            // Add your project preview content here
            const projectData = {
                'campus-interaction': {
                    title: 'Campus Interaction Platform',
                    content: `
                        <img src="/api/placeholder/700/400" alt="Project Preview" style="width: 100%; margin-bottom: 20px;">
                        <h3>Features</h3>
                        <ul>
                            <li>Real-time discussion forums</li>
                            <li>Event management system</li>
                            <li>Resource sharing platform</li>
                            <li>User authentication and authorization</li>
                        </ul>
                    `
                }
                // Add more projects
            };

            document.getElementById('modalTitle').textContent = projectData[projectId].title;
            document.getElementById('modalContent').innerHTML = projectData[projectId].content;
            modal.style.display = 'flex';
        }
         
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
         // Lazy loading implementation
         document.addEventListener('DOMContentLoaded', () => {
            const lazyImages = document.querySelectorAll('.lazy-image');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        });

      // Enhanced JavaScript functionality
      document.addEventListener('DOMContentLoaded', function() {
            // Initialize skill circles
            document.querySelectorAll('.skill-circle').forEach(circle => {
                const progress = circle.dataset.progress;
                const circumference = 2 * Math.PI * 54;
                const progressCircle = circle.querySelector('.progress');
                const offset = circumference - (progress / 100 * circumference);
                
                progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
                progressCircle.style.strokeDashoffset = circumference;
                
                // Animate on scroll
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            progressCircle.style.strokeDashoffset = offset;
                        }
                    });
                });
                
                observer.observe(circle);
            });

           


            // Dark mode toggle with enhanced transitions
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
           
        });   

     
  // Enhanced form validation and submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Form validation
      const formData = new FormData(e.target);
      const formFields = Object.fromEntries(formData.entries());
      
      try {
        // Basic validation
        for (const [key, value] of Object.entries(formFields)) {
          if (!value.trim()) {
            throw new Error(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
          }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formFields.email)) {
          throw new Error('Please enter a valid email address');
        }

        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Success handling
        contactForm.reset();
        alert('Message sent successfully!');

      } catch (error) {
        // Error handling
        alert(error.message || 'Failed to send message. Please try again.');
      } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }
   