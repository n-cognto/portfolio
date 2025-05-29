import os
import django
import sys

# Set up Django environment
sys.path.append('/home/ncognto/Documents/portfolio/portfolio')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')
django.setup()

from django.contrib.auth.models import User
from blogs.models import Category, Post
from django.utils.text import slugify

def create_sample_blog_content():
    # Get the admin user (or first superuser)
    admin_user = User.objects.filter(is_superuser=True).first()
    
    if not admin_user:
        print("No admin user found. Please create a superuser first.")
        return
    
    # Create blog categories
    categories = [
        {"name": "Cybersecurity", "slug": "cybersecurity"},
        {"name": "Web Development", "slug": "web-development"},
        {"name": "Programming", "slug": "programming"},
        {"name": "Ethical Hacking", "slug": "ethical-hacking"},
    ]
    
    created_categories = []
    for category_data in categories:
        category, created = Category.objects.get_or_create(
            slug=category_data["slug"],
            defaults={"name": category_data["name"]}
        )
        created_categories.append(category)
        if created:
            print(f"Created category: {category.name}")
        else:
            print(f"Category already exists: {category.name}")
    
    # Create sample blog posts
    posts = [
        {
            "title": "Introduction to Web Security",
            "content": """
Web security is a critical aspect of modern web development. As websites and web applications become more complex and handle increasingly sensitive data, the importance of implementing robust security measures cannot be overstated.

## Common Web Security Threats

1. **Cross-Site Scripting (XSS)**: Occurs when attackers inject malicious client-side scripts into web pages viewed by other users.
2. **SQL Injection**: Takes place when attackers insert malicious SQL code into queries, potentially gaining unauthorized access to databases.
3. **Cross-Site Request Forgery (CSRF)**: Forces authenticated users to execute unwanted actions on a web application where they're currently authenticated.
4. **Broken Authentication**: Weaknesses in authentication mechanisms that allow attackers to compromise passwords, keys, or session tokens.

## Best Practices for Web Security

- Implement proper input validation and sanitization
- Use HTTPS for all connections
- Employ Content Security Policy (CSP)
- Keep software and dependencies updated
- Utilize parameterized queries to prevent SQL injection
- Implement proper session management
- Use strong password policies
- Regular security testing and code reviews

By implementing these security measures, you can significantly reduce the risk of your web application being compromised.
            """,
            "category": "Cybersecurity",
            "status": "published"
        },
        {
            "title": "Modern JavaScript Frameworks: A Comparison",
            "content": """
JavaScript frameworks have revolutionized web development, making it easier to build interactive and complex web applications. In this post, we'll compare some of the most popular frameworks.

## React

Developed by Facebook, React is a library for building user interfaces with a component-based architecture. It uses a virtual DOM to optimize rendering performance.

**Pros:**
- Flexible and adaptable
- Strong ecosystem and community support
- Virtual DOM for efficient updates
- React Native for mobile development

**Cons:**
- Not a full framework (requires additional libraries)
- Steeper learning curve for beginners

## Vue.js

Vue is known for its simplicity and ease of integration. It's a progressive framework that can be adopted incrementally.

**Pros:**
- Easy to learn and integrate
- Comprehensive documentation
- Gentle learning curve
- Flexible and lightweight

**Cons:**
- Smaller ecosystem compared to React and Angular
- Fewer large-scale implementations

## Angular

Angular is a complete framework with everything built-in, developed by Google.

**Pros:**
- Complete solution with built-in tools
- TypeScript integration
- Powerful CLI
- Good for large enterprise applications

**Cons:**
- Steeper learning curve
- Heavier and more complex than alternatives

## Which Framework Should You Choose?

The best framework depends on your project requirements, team expertise, and personal preferences. React excels in large, complex applications, Vue is great for smaller projects or gradual adoption, and Angular works well for enterprise-level applications that benefit from TypeScript and strong conventions.
            """,
            "category": "Web Development",
            "status": "published"
        },
        {
            "title": "Getting Started with Penetration Testing",
            "content": """
Penetration testing, often referred to as "pen testing," is an authorized simulated attack on a computer system to evaluate its security. This blog post will introduce you to the basics of penetration testing.

## What is Penetration Testing?

Penetration testing is a systematic process of probing for vulnerabilities in networks and systems. Unlike malicious hacking, penetration testing is authorized, legal, and aims to improve security.

## The Penetration Testing Process

1. **Planning and Reconnaissance**: Define the scope and gather information about the target.
2. **Scanning**: Use technical tools to better understand how the target will respond to various intrusion attempts.
3. **Gaining Access**: Use various techniques to exploit vulnerabilities and gain access.
4. **Maintaining Access**: Determine if the vulnerability can be used to achieve persistent access.
5. **Analysis and Reporting**: Compile the results and provide recommendations.

## Essential Tools for Beginners

1. **Kali Linux**: A Linux distribution designed for digital forensics and penetration testing.
2. **Metasploit**: A penetration testing framework that makes discovering, exploiting, and sharing vulnerabilities easier.
3. **Wireshark**: A network protocol analyzer that examines data from a live network or from a capture file.
4. **Nmap**: A network scanner used to discover hosts and services on a computer network.
5. **Burp Suite**: A platform for performing security testing of web applications.

## Ethical Considerations

Penetration testing should always be conducted ethically and legally. Always:
- Obtain proper authorization before testing
- Respect the scope of the test
- Handle sensitive data appropriately
- Avoid causing damage or disruption

Remember, the goal of penetration testing is to improve security, not to cause harm.
            """,
            "category": "Ethical Hacking",
            "status": "published"
        },
        {
            "title": "Python for Automation: Simplify Your Workflow",
            "content": """
Python has become one of the most popular languages for automation due to its simplicity, readability, and vast ecosystem of libraries. In this post, we'll explore how you can use Python to automate various tasks and improve your productivity.

## Why Python for Automation?

- Easy to read and write
- Extensive standard library
- Rich ecosystem of third-party packages
- Cross-platform compatibility
- Strong community support

## Common Automation Use Cases

### 1. File System Operations

```python
import os
import shutil

# Create directories
os.makedirs("new_directory", exist_ok=True)

# Copy files
shutil.copy2("source.txt", "destination.txt")

# Move files
shutil.move("old_location.txt", "new_location.txt")

# Find all Python files in a directory
python_files = [f for f in os.listdir() if f.endswith('.py')]
```

### 2. Web Scraping with BeautifulSoup and Requests

```python
import requests
from bs4 import BeautifulSoup

response = requests.get('https://example.com')
soup = BeautifulSoup(response.text, 'html.parser')

# Extract all links
links = [a.get('href') for a in soup.find_all('a')]

# Extract text from specific elements
titles = [h2.text for h2 in soup.find_all('h2', class_='article-title')]
```

### 3. Working with APIs

```python
import requests
import json

# Get data from an API
response = requests.get('https://api.github.com/users/username/repos')
repos = response.json()

# Work with the data
for repo in repos:
    print(f"Repository: {repo['name']}, Stars: {repo['stargazers_count']}")
```

### 4. Automating Repetitive Tasks with Schedule

```python
import schedule
import time

def backup_database():
    print("Backing up database...")
    # Actual backup code here

# Run daily at midnight
schedule.every().day.at("00:00").do(backup_database)

while True:
    schedule.run_pending()
    time.sleep(1)
```

## Getting Started with Automation

1. **Identify repetitive tasks** in your workflow
2. **Break down the task** into smaller steps
3. **Find the right libraries** to help with each step
4. **Start small** and gradually expand your automation
5. **Document your scripts** for future reference

Python automation can save you countless hours by handling repetitive tasks, allowing you to focus on more creative and meaningful work.
            """,
            "category": "Programming",
            "status": "published"
        }
    ]
    
    for post_data in posts:
        # Get the category
        category_name = post_data.pop("category")
        category = Category.objects.get(name=category_name)
        
        # Create a slug from the title
        title = post_data["title"]
        slug = slugify(title)
        
        # Create the post if it doesn't exist
        post, created = Post.objects.get_or_create(
            slug=slug,
            defaults={
                "title": title,
                "content": post_data["content"],
                "author": admin_user,
                "category": category,
                "status": post_data["status"]
            }
        )
        
        if created:
            print(f"Created post: {post.title}")
        else:
            print(f"Post already exists: {post.title}")

if __name__ == "__main__":
    create_sample_blog_content()
    print("Sample blog content creation completed!")