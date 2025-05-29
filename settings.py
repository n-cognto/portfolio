# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'  # Changed to SMTP backend
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'ncogntotech@gmail.com'
EMAIL_HOST_PASSWORD = "Itbwt yrkv jaen avrj"  # App password for Gmail
DEFAULT_FROM_EMAIL = 'ncogntotech@gmail.com'
SITE_URL = 'http://localhost:8000'  # Change in production