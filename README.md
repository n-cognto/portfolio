# Personal Portfolio Website

A modern, responsive portfolio website built with Django, showcasing projects, skills, blog posts, and providing newsletter functionality.

## Live Demo

Check out the live demo at [https://portfolio-production-32d7.up.railway.app/](https://portfolio-production-32d7.up.railway.app/)

## Features

- **Portfolio Showcase**: Display and categorize your projects
- **Blog System**: Create and publish blog posts with rich text editing
- **Contact Form**: Allow visitors to send messages directly
- **Newsletter**: Let visitors subscribe to updates
- **Responsive Design**: Mobile-friendly interface
- **Admin Dashboard**: Easily manage content
- **CORS Support**: Configured for cross-origin requests
- **WhiteNoise Integration**: Efficient static file serving

## Tech Stack

- **Backend**: Django 5.2
- **Database**: SQLite (default), compatible with PostgreSQL for production
- **Frontend**: HTML5, CSS3, JavaScript
- **Text Editor**: CKEditor integration for rich text editing
- **Static Files**: WhiteNoise for serving static files
- **Security**: Django CSP (Content Security Policy) implementation

## Installation

### Prerequisites

- Python 3.9+
- pip (Python package manager)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables (optional)**
   Create a `.env` file in the project root:
   ```
   DEBUG=True
   SECRET_KEY=your-secret-key
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-email-password
   ```

5. **Apply migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

8. **Run the development server**
   ```bash
   python manage.py runserver
   ```

9. **Visit the site**
   Open your browser and navigate to `http://127.0.0.1:8000`

## Project Structure

- `main/`: Core application with portfolio pages and contact functionality
- `blogs/`: Blog application
- `newsletter/`: Newsletter subscription application
- `static/`: Static assets (CSS, JS, images)
- `templates/`: HTML templates
- `portfolio/`: Main project folder with settings

## Deployment

This project is configured for easy deployment to platforms like Railway:

1. Ensure `DEBUG=False` in production
2. Configure your production database
3. Set up environment variables on your hosting platform
4. Configure WhiteNoise for static file serving (already set up in settings.py)

## Customization

1. Update personal information in the admin panel
2. Customize templates in the `templates/` directory
3. Modify styles in `static/main/css/styles.css`
4. Add or remove sections by editing templates and corresponding views

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

If you have any questions or suggestions, feel free to reach out.

---

Created with ❤️ using Django