import os
import re

nav_html = """<nav>
    <div class="nav-logo"><a href="index.html">SafeKart</a></div>
    <ul class="nav-links">
        <li><a href="shopping.html">Shop</a></li>
        <li><a href="verify.html">Verify</a></li>
        <li><a href="qr_reader.html">Scan</a></li>
        <li><a href="qr_generator.html">Generate QR</a></li>
        <li><a href="track.html">Track</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="admin.html">Admin</a></li>
    </ul>
    <label class="theme-switch" for="theme-toggle">
        <input type="checkbox" id="theme-toggle" />
        <span class="slider"></span>
    </label>
</nav>"""

directory = "/Users/sakshamjindal/Desktop/coding/safekart_iot_verification/frontend"

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, "r") as f:
            content = f.read()

        # Replace nav
        content = re.sub(r'<nav>.*?</nav>', nav_html, content, flags=re.DOTALL)
        
        with open(filepath, "w") as f:
            f.write(content)

print("Updated nav in all HTML files to include About page.")
