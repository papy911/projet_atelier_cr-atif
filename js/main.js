// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // === THREE.JS SCENE ===
    // Since we included Three.js via script tag, 'THREE' is globally available.
    const canvasContainer = document.getElementById('canvas-container');

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.012);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    // Minimalist Geometry: Icosahedron Wireframe
    const geometry = new THREE.IcosahedronGeometry(8, 1);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);

    // Add inner core
    const coreGeometry = new THREE.IcosahedronGeometry(4, 0);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 120;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Scroll interaction
    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Animation loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Rotate main shape
        shape.rotation.y += 0.003;
        shape.rotation.x += 0.002;
        
        // Rotate core
        core.rotation.y -= 0.005;
        core.rotation.z += 0.005;

        // Mouse movement influence with easing
        shape.rotation.y += 0.05 * (targetX - shape.rotation.y);
        shape.rotation.x += 0.05 * (targetY - shape.rotation.x);

        // Particles rotation
        particlesMesh.rotation.y = -elapsedTime * 0.02;
        
        // Parallax effect based on scroll
        camera.position.y = -scrollY * 0.005;
        
        // Morph effect based on scroll
        const scrollFactor = scrollY * 0.001;
        shape.scale.set(1 + scrollFactor*0.1, 1 + scrollFactor*0.1, 1 + scrollFactor*0.1);

        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // === HTML/CSS Interactions ===

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // 3D Slider Logic
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.getElementById('next-slide');
    const prevBtn = document.getElementById('prev-slide');
    let currentSlide = 0;

    function updateSlider() {
        slides.forEach((slide, index) => {
            let relIndex = index - currentSlide;
            
            // Handle wrap around dynamically based on slide count
            if (relIndex < -Math.floor(slides.length / 2)) relIndex += slides.length;
            if (relIndex > Math.floor(slides.length / 2)) relIndex -= slides.length;
            
            if (relIndex === 0) {
                // Center slide
                slide.style.transform = `translateX(0) scale(1) translateZ(0px)`;
                slide.style.opacity = '1';
                slide.style.zIndex = '10';
            } else if (relIndex === 1 || relIndex === -slides.length + 1) {
                // Right slide
                slide.style.transform = `translateX(60%) scale(0.85) translateZ(-150px) rotateY(-15deg)`;
                slide.style.opacity = '0.4';
                slide.style.zIndex = '5';
            } else if (relIndex === -1 || relIndex === slides.length - 1) {
                // Left slide
                slide.style.transform = `translateX(-60%) scale(0.85) translateZ(-150px) rotateY(15deg)`;
                slide.style.opacity = '0.4';
                slide.style.zIndex = '5';
            } else {
                // Hidden slides
                slide.style.transform = `translateX(0) scale(0.5) translateZ(-300px)`;
                slide.style.opacity = '0';
                slide.style.zIndex = '0';
            }
        });
    }

    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    });

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlider();
    });

    // Initialize slider
    updateSlider();

    // GSAP Scroll Animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero animation
    gsap.from(".hero-content h1", {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.2
    });

    gsap.from(".hero-content p", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });

    gsap.from(".hero-actions > *", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        delay: 0.7
    });

    // Section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // About text features
    gsap.from(".features li", {
        scrollTrigger: {
            trigger: ".features",
            start: "top 85%",
        },
        x: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
    });

    // Services Cards
    gsap.from(".service-card", {
        scrollTrigger: {
            trigger: ".services-grid",
            start: "top 85%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
    });

    // Stats Counters
    const counters = document.querySelectorAll('.counter');
    
    ScrollTrigger.create({
        trigger: ".stats",
        start: "top 80%",
        onEnter: () => {
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                
                // Animate number
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    ease: "power2.out",
                    snap: { innerHTML: 1 },
                    onUpdate: function() {
                        counter.innerHTML = Math.round(this.targets()[0].innerHTML);
                    }
                });
            });
        },
        once: true // only animate once
    });

    // Contact Form
    gsap.from(".contact-grid > *", {
        scrollTrigger: {
            trigger: ".contact-grid",
            start: "top 85%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out"
    });

    // Glass panel floating animation
    gsap.to(".glass-panel", {
        y: 15,
        rotation: 1,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
});
