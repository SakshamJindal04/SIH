document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Function to apply the saved theme or default to light mode
    const applyTheme = () => {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    };

    // Event listener for the toggle switch
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // Apply the theme on initial page load
    applyTheme();

    // --- ROTATING QUOTES ---
    const quotes = [
        "Trust is built with consistency.",
        "Security is not a product, but a process.",
        "Verify first, trust second.",
        "Authenticity is the soul of quality.",
        "Protecting your purchases, one scan at a time."
    ];
    
    const quoteElement = document.getElementById('footer-quote');
    if (quoteElement) {
        // Change quote every 8 seconds
        let quoteIndex = 0;
        setInterval(() => {
            quoteElement.style.opacity = 0;
            setTimeout(() => {
                quoteIndex = (quoteIndex + 1) % quotes.length;
                quoteElement.textContent = quotes[quoteIndex];
                quoteElement.style.opacity = 1;
                quoteElement.style.transition = 'opacity 0.5s ease';
            }, 500);
        }, 8000);
    }

    // --- SCROLL REVEAL ANIMATIONS ---
    const revealElements = document.querySelectorAll('.feature-card');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // --- INTERACTIVE BUBBLE BACKGROUND ---
    const canvas = document.createElement('canvas');
    canvas.id = 'interactive-bubbles';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let bubbles = [];
    const mouse = { x: undefined, y: undefined, radius: 150 };

    // SVG Images to mix in with the bubbles
    const svgImages = [
        // Box
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15zM5 15.91l6 3.38v-6.71L5 9.19v6.72zm14 0v-6.72l-6 3.39v6.71l6-3.38z"/></svg>`,
        // Shield Check
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`,
        // Shopping Cart
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>`
    ];

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    // Reset mouse position when it leaves the window
    window.addEventListener('mouseleave', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Bubble {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            
            // random slight horizontal drift
            this.drift = (Math.random() - 0.5) * 0.5;
            
            // 20% chance to be an image icon instead of a bubble
            if (Math.random() > 0.8) {
                this.isImage = true;
                this.img = new Image();
                this.img.src = svgImages[Math.floor(Math.random() * svgImages.length)];
                this.size = Math.random() * 40 + 30; // larger size for icons
                this.opacity = Math.random() * 0.3 + 0.1; // slightly more transparent for images
                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.02;
                this.density = (Math.random() * 20) + 10;
            } else {
                this.isImage = false;
                this.size = Math.random() * 20 + 10;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.density = (Math.random() * 30) + 1;
            }
            
            this.baseX = this.x;
            this.baseY = this.y;
        }

        draw() {
            if (this.isImage) {
                if (this.img.complete) {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.rotation);
                    ctx.globalAlpha = this.opacity;
                    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
                    ctx.restore();
                    this.rotation += this.rotSpeed;
                }
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                
                const currentIsDark = document.body.classList.contains('dark-mode');
                const color = currentIsDark ? '255, 255, 255' : '59, 130, 246';
                
                ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
                ctx.fill();
            }
        }

        update() {
            // Default drifting slowly upwards and slightly horizontally
            this.baseY -= 0.5;
            this.baseX += this.drift;

            // Wrap around edges
            if (this.baseY < -this.size) {
                this.baseY = height + this.size;
                this.baseX = Math.random() * width;
            }
            if (this.baseX > width + this.size) this.baseX = -this.size;
            if (this.baseX < -this.size) this.baseX = width + this.size;

            this.y = this.baseY;

            // Interact with mouse
            if (mouse.x !== undefined && mouse.y !== undefined) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Push away from mouse
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to base position smoothly
                    if (this.x !== this.baseX) {
                        let dx2 = this.x - this.baseX;
                        this.x -= dx2 / 20;
                    }
                    if (this.y !== this.baseY) {
                        let dy2 = this.y - this.baseY;
                        this.y -= dy2 / 20;
                    }
                }
            } else {
                this.x = this.baseX;
                this.y = this.baseY;
            }
            this.draw();
        }
    }

    function initBubbles() {
        bubbles = [];
        const numBubbles = Math.floor((window.innerWidth * window.innerHeight) / 15000); // Responsive density
        for (let i = 0; i < numBubbles; i++) {
            bubbles.push(new Bubble());
        }
    }
    
    function animateBubbles() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < bubbles.length; i++) {
            bubbles[i].update();
        }
        requestAnimationFrame(animateBubbles);
    }

    initBubbles();
    animateBubbles();
});