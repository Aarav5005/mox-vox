/* ========================================
   MOX VOX - Premium Club & Bar
   JavaScript for Interactions & Gallery
   Single-Row Gallery with Random Image Switching
   ======================================== */

(function() {
    'use strict';

    // Gallery state
    let allImages = [];
    let visibleImages = []; // Currently visible image filenames
    let galleryItems = []; // DOM elements
    let switchInterval = null;

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        loadGalleryAssets();
        initSmoothScroll();
        initNavbarScroll();
        initScrollAnimations();
        initHeroVideo();
        initInteractiveMenu();
        initPartyPackages();
        initAboutAnimations();
        initReviewsAnimation();
        initMobileReservePill();
        initOpenNowBadge();
        initWhatsAppHighlight();
    });

    /* ========================================
       HERO VIDEO INITIALIZATION
       Handle video background with reduced motion support
       ======================================== */
    function initHeroVideo() {
        const heroVideo = document.querySelector('.hero-video');
        if (!heroVideo) return;
        
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            heroVideo.style.display = 'none';
            return;
        }
        
        // Handle video loading
        heroVideo.addEventListener('loadeddata', function() {
            this.style.opacity = '1';
        });
        
        // Handle video errors
        heroVideo.addEventListener('error', function() {
            console.warn('Hero video failed to load');
            this.style.display = 'none';
        });
    }

    /* ========================================
       DYNAMIC GALLERY ASSET LOADING
       Loads images, displays 4 initially, then switches one every 6-8 seconds
       ======================================== */
    async function loadGalleryAssets() {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) {
            console.error('Gallery container not found');
            return;
        }
        
        let images = [];
        
        try {
            // Try to fetch manifest file first (works with local server)
            const response = await fetch('assets/manifest.json');
            if (response.ok) {
                const manifest = await response.json();
                images = manifest.images || [];
            } else {
                throw new Error('Manifest not accessible');
            }
        } catch (error) {
            // Fallback: Use hardcoded list from actual files in directory
            console.info('Manifest not available, using fallback asset list');
            images = [
                'IMG_20260110_163141.jpg',
                'IMG_20260110_163022.jpg',
                'IMG_20260110_163056.jpg',
                'IMG_20260110_163122.jpg',
                'IMG_20260110_163141.jpg',
                'IMG_20260110_163201.jpg',
                'IMG_20260110_163213.jpg',
                'IMG_20260110_163242.jpg',
                'IMG_20260110_163300.jpg',
                'IMG_20260110_163317.jpg'
            ];
        }
        
        // If no images found, show fallback
        if (images.length === 0) {
            showGalleryFallback(galleryContainer);
            return;
        }
        
        // Store all images
        allImages = [...images];
        
        // Ensure we have at least 4 images
        if (allImages.length < 4) {
            console.warn('Less than 4 images available, gallery may not display correctly');
        }
        
        // Get responsive image count based on screen size
        const imageCount = getVisibleImageCount();
        
        // Shuffle and select initial images
        const shuffledImages = shuffleArray([...allImages]);
        visibleImages = shuffledImages.slice(0, imageCount);
        
        // Create initial gallery items
        visibleImages.forEach((imageName, index) => {
            const item = createGalleryItem(imageName, index);
            galleryContainer.appendChild(item);
            galleryItems.push(item);
        });
        
        // Start random switching after initial load
        startImageSwitching();
    }

    /* ========================================
       GET VISIBLE IMAGE COUNT
       Returns number of images to show based on screen size
       ======================================== */
    function getVisibleImageCount() {
        if (window.innerWidth <= 768) {
            return 1; // Mobile: 1 image
        } else if (window.innerWidth <= 1024) {
            return 2; // Tablet: 2 images
        }
        return 4; // Desktop: 4 images
    }

    /* ========================================
       SHUFFLE ARRAY
       Fisher-Yates shuffle algorithm for true randomness
       ======================================== */
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /* ========================================
       CREATE GALLERY ITEM
       Creates a single gallery item with image element
       ======================================== */
    function createGalleryItem(imageName, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-image-name', imageName);
        
        const img = document.createElement('img');
        img.src = `assets/images/${encodeURIComponent(imageName)}`;
        img.alt = `MOX VOX Gallery Image`;
        img.loading = 'lazy';
        
        // Error handling
        img.addEventListener('error', function() {
            this.dataset.error = 'true';
            this.style.backgroundColor = 'var(--bg-tertiary)';
            this.alt = 'Image unavailable';
            this.onerror = null;
        });
        
        // Prevent layout shift during load
        img.style.backgroundColor = 'var(--bg-tertiary)';
        
        item.appendChild(img);
        return item;
    }

    /* ========================================
       START IMAGE SWITCHING
       Replaces one random image every 6-8 seconds
       ======================================== */
    function startImageSwitching() {
        // Clear any existing interval
        if (switchInterval) {
            clearInterval(switchInterval);
        }
        
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return; // Don't switch images if user prefers reduced motion
        }
        
        // Switch one image every 6-8 seconds (random interval)
        switchInterval = setInterval(() => {
            switchRandomImage();
        }, getRandomInterval(6000, 8000));
    }

    /* ========================================
       GET RANDOM INTERVAL
       Returns random time between min and max milliseconds
       ======================================== */
    function getRandomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /* ========================================
       SWITCH RANDOM IMAGE
       Selects one random gallery item and replaces its image
       Ensures the new image is not already visible
       ======================================== */
    function switchRandomImage() {
        // Update visible count based on current screen size
        const imageCount = getVisibleImageCount();
        
        // If we don't have enough images total, don't switch
        if (allImages.length <= imageCount) {
            return;
        }
        
        // Get available images (not currently visible)
        const availableImages = allImages.filter(img => !visibleImages.includes(img));
        
        // If no available images, reset and shuffle
        if (availableImages.length === 0) {
            const shuffled = shuffleArray([...allImages]);
            visibleImages = shuffled.slice(0, imageCount);
            // Update all images
            galleryItems.forEach((item, index) => {
                if (index < visibleImages.length) {
                    updateImageInItem(item, visibleImages[index]);
                }
            });
            return;
        }
        
        // Select random item to replace (only if we have that many items)
        if (galleryItems.length === 0) return;
        
        const randomItemIndex = Math.floor(Math.random() * Math.min(imageCount, galleryItems.length));
        const itemToReplace = galleryItems[randomItemIndex];
        
        if (!itemToReplace) return;
        
        // Select random new image from available ones
        const randomNewImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        
        // Update visible images array
        const oldImageName = visibleImages[randomItemIndex];
        visibleImages[randomItemIndex] = randomNewImage;
        
        // Replace image with fade animation
        replaceImageWithFade(itemToReplace, oldImageName, randomNewImage);
    }

    /* ========================================
       REPLACE IMAGE WITH FADE
       Smoothly fades out old image and fades in new image
       ======================================== */
    function replaceImageWithFade(item, oldImageName, newImageName) {
        const img = item.querySelector('img');
        if (!img) return;
        
        // Fade out
        img.classList.add('fade-out');
        
        // After fade out completes, change image and fade in
        setTimeout(() => {
            img.src = `assets/images/${encodeURIComponent(newImageName)}`;
            img.alt = `MOX VOX Gallery Image`;
            item.setAttribute('data-image-name', newImageName);
            
            // Remove fade-out, add fade-in
            img.classList.remove('fade-out');
            img.classList.add('fade-in');
            
            // Remove fade-in class after animation completes
            setTimeout(() => {
                img.classList.remove('fade-in');
            }, 600);
        }, 600); // Wait for fade-out to complete
    }

    /* ========================================
       UPDATE IMAGE IN ITEM
       Directly updates image without animation (for initial load)
       ======================================== */
    function updateImageInItem(item, imageName) {
        const img = item.querySelector('img');
        if (!img) return;
        
        img.src = `assets/images/${encodeURIComponent(imageName)}`;
        item.setAttribute('data-image-name', imageName);
    }

    /* ========================================
       GALLERY FALLBACK
       Shows message if assets fail to load
       ======================================== */
    function showGalleryFallback(container) {
        const fallback = document.createElement('div');
        fallback.className = 'gallery-fallback';
        fallback.style.cssText = 'padding: 3rem; text-align: center; color: var(--text-tertiary);';
        fallback.textContent = 'Gallery content loading...';
        container.appendChild(fallback);
    }

    /* ========================================
       SMOOTH SCROLL - Navigation Links (DNA: Controlled Motion)
       ======================================== */
    function initSmoothScroll() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip empty hash or just '#'
                if (href === '#' || href === '') return;
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Calculate offset for sticky navbar
                    const navbar = document.querySelector('.navbar');
                    const navbarHeight = navbar ? navbar.offsetHeight : 0;
                    const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* ========================================
       NAVBAR SCROLL EFFECT - Subtle Enhancement (DNA: Minimal)
       ======================================== */
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            // Add slight background opacity change on scroll
            if (currentScroll > 50) {
                navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.98)';
                navbar.classList.add('scrolled');
            } else {
                navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    /* ========================================
       SCROLL ANIMATIONS - Fade In on Scroll (DNA: Subtle Motion)
       ======================================== */
    function initScrollAnimations() {
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            return; // Skip animations if user prefers reduced motion
        }
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe cards and sections for fade-in
        const animatedElements = document.querySelectorAll('.card, .section-title');
        animatedElements.forEach(el => {
            // Set initial state for animation
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            observer.observe(el);
        });
    }

    // Handle window resize to update visible image count
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // If image count changed, reload gallery
            const newCount = getVisibleImageCount();
            if (newCount !== visibleImages.length && allImages.length > 0) {
                // Reload gallery with new count
                const galleryContainer = document.getElementById('gallery-container');
                if (galleryContainer) {
                    galleryContainer.innerHTML = '';
                    galleryItems = [];
                    const shuffled = shuffleArray([...allImages]);
                    visibleImages = shuffled.slice(0, newCount);
                    visibleImages.forEach((imageName, index) => {
                        const item = createGalleryItem(imageName, index);
                        galleryContainer.appendChild(item);
                        galleryItems.push(item);
                    });
                }
            }
        }, 250);
    }, { passive: true });

    /* ========================================
       PACKAGE SELECTOR - Master-Detail Interface
       Handles package switching in Party Packages section
       ======================================== */
    function initPackageSelector() {
        // Package data structure
        const packages = [
            {
                title: 'Mini Party Package (10 People)',
                priceAmount: '₹4,999',
                priceNote: 'All Inclusive',
                includes: [
                    'Veg Starter',
                    'Veg Main Course',
                    'DJ Music',
                    'Party seating',
                    'Club-style ambience'
                ],
                description: 'A simple and affordable party plan designed for small groups and quick celebrations.'
            },
            {
                title: 'Birthday Package',
                priceAmount: '₹469',
                priceNote: '+ GST (Per Person)',
                includes: [
                    'Welcome drink',
                    'Unlimited veg food',
                    '3 Starters + 1 Special Starter',
                    'Main course, rice & breads',
                    'Ice cream',
                    'DJ / club setup (minimum pax as applicable)'
                ],
                description: null
            },
            {
                title: 'Corporate Package',
                priceAmount: '₹469',
                priceNote: '+ GST (Per Person)',
                includes: [
                    'Welcome drink',
                    'Unlimited veg food',
                    'Starters, paneer & veg curries',
                    'Rice, breads',
                    'Ice cream',
                    'Ideal for office parties & formal gatherings'
                ],
                description: null
            },
            {
                title: 'Family Package',
                priceAmount: '₹569',
                priceNote: '+ GST (Per Person)',
                includes: [
                    'Premium unlimited veg menu',
                    '2 Soups',
                    '2 Starters + 1 Special Starter',
                    'Expanded main course & breads',
                    'Ice cream',
                    'Comfortable family dining setup'
                ],
                description: null
            }
        ];

        const packageOptions = document.querySelectorAll('.package-option');
        const packageDetails = document.getElementById('package-details');
        
        if (!packageOptions.length || !packageDetails) {
            return; // Package selector not found
        }

        // Render package details
        function renderPackageDetails(packageIndex) {
            const pkg = packages[packageIndex];
            if (!pkg) return;

            // Create HTML for package details
            let html = `
                <div class="package-header">
                    <h3 class="package-title">${pkg.title}</h3>
                    <div class="package-price">
                        <span class="price-amount">${pkg.priceAmount}</span>
                        <span class="price-note">${pkg.priceNote}</span>
                    </div>
                </div>
                <div class="package-includes">
                    <h4 class="includes-title">Includes:</h4>
                    <ul class="includes-list">
                        ${pkg.includes.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;

            if (pkg.description) {
                html += `<p class="package-description">${pkg.description}</p>`;
            }

            html += `<a href="#contact" class="package-cta">Book This Package</a>`;

            // Fade transition
            packageDetails.classList.add('fade-transition');
            
            setTimeout(() => {
                packageDetails.innerHTML = html;
                packageDetails.classList.remove('fade-transition');
            }, 200);
        }

        // Handle package option clicks
        packageOptions.forEach((option, index) => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                packageOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to clicked option
                this.classList.add('active');
                
                // Update package details
                renderPackageDetails(index);
            });
        });

        // Initialize with first package
        if (packageOptions.length > 0) {
            renderPackageDetails(0);
        }
    }

    /* ========================================
       INTERACTIVE MENU SYSTEM
       Handles menu category switching and displays menu items
       ======================================== */
    function initInteractiveMenu() {
        // Comprehensive menu data structure
        // NOTE: Prices and items should be verified against the actual PDF menu
        const menuData = {
            'welcome-drinks': {
                title: 'Welcome Drinks',
                items: [
                    { name: 'Fresh Lime Soda', price: '₹50' },
                    { name: 'Blue Lagoon', price: '₹80' },
                    { name: 'Virgin Mojito', price: '₹90' },
                    { name: 'Mint Lime Cooler', price: '₹85' },
                    { name: 'Sweet Lime Soda', price: '₹50' }
                ]
            },
            'soups': {
                title: 'Soups',
                items: [
                    { name: 'Tomato Soup', price: '₹120' },
                    { name: 'Sweet Corn Soup', price: '₹130' },
                    { name: 'Hot & Sour Soup', price: '₹130' },
                    { name: 'Veg Clear Soup', price: '₹110' },
                    { name: 'Manchow Soup', price: '₹140' }
                ]
            },
            'starters': {
                title: 'Starters',
                items: [
                    { name: 'Veg Manchurian', price: '₹180' },
                    { name: 'Chilli Potato', price: '₹160' },
                    { name: 'Paneer 65', price: '₹200' },
                    { name: 'Crispy Corn', price: '₹170' },
                    { name: 'Hara Bhara Kabab', price: '₹190' },
                    { name: 'Veg Spring Rolls', price: '₹150' }
                ]
            },
            'special-starters': {
                title: 'Special Starters',
                items: [
                    { name: 'Paneer Tikka', price: '₹220' },
                    { name: 'Achari Paneer', price: '₹230' },
                    { name: 'Mushroom Tikka', price: '₹210' },
                    { name: 'Tandoori Aloo', price: '₹190' },
                    { name: 'Pahadi Kabab', price: '₹240' }
                ]
            },
            'paneer': {
                title: 'Paneer Preparations',
                items: [
                    { name: 'Paneer Butter Masala', price: '₹250' },
                    { name: 'Shahi Paneer', price: '₹250' },
                    { name: 'Kadhai Paneer', price: '₹240' },
                    { name: 'Paneer Tikka Masala', price: '₹260' },
                    { name: 'Palak Paneer', price: '₹240' },
                    { name: 'Methi Paneer', price: '₹250' }
                ]
            },
            'veg': {
                title: 'Veg Preparations',
                items: [
                    { name: 'Mix Veg', price: '₹200' },
                    { name: 'Kaju Curry', price: '₹280' },
                    { name: 'Aloo Gobi', price: '₹180' },
                    { name: 'Bhindi Masala', price: '₹190' },
                    { name: 'Baingan Bharta', price: '₹200' },
                    { name: 'Veg Kadhai', price: '₹210' }
                ]
            },
            'dal': {
                title: 'Dal Preparations',
                items: [
                    { name: 'Dal Makhani', price: '₹180' },
                    { name: 'Dal Tadka', price: '₹150' },
                    { name: 'Dal Fry', price: '₹140' },
                    { name: 'Chana Dal', price: '₹160' }
                ]
            },
            'rice': {
                title: 'Rice Preparations',
                items: [
                    { name: 'Jeera Rice', price: '₹100' },
                    { name: 'Veg Pulao', price: '₹140' },
                    { name: 'Fried Rice', price: '₹130' },
                    { name: 'Steamed Rice', price: '₹80' },
                    { name: 'Biryani (Veg)', price: '₹180' }
                ]
            },
            'breads': {
                title: 'Indian Breads',
                items: [
                    { name: 'Butter Naan', price: '₹40' },
                    { name: 'Tandoori Roti', price: '₹30' },
                    { name: 'Laccha Paratha', price: '₹60' },
                    { name: 'Garlic Naan', price: '₹50' },
                    { name: 'Plain Naan', price: '₹35' },
                    { name: 'Missi Roti', price: '₹45' }
                ]
            },
            'salads': {
                title: 'Salads',
                items: [
                    { name: 'Green Salad', price: '₹80' },
                    { name: 'Cucumber Salad', price: '₹70' },
                    { name: 'Mixed Salad', price: '₹90' }
                ]
            },
            'chutneys': {
                title: 'Chutneys',
                items: [
                    { name: 'Mint Chutney', price: '₹40' },
                    { name: 'Tamarind Chutney', price: '₹40' },
                    { name: 'Green Chutney', price: '₹40' }
                ]
            },
            'ice-cream': {
                title: 'Ice Cream',
                items: [
                    { name: 'Vanilla Ice Cream', price: '₹80' },
                    { name: 'Strawberry Ice Cream', price: '₹90' },
                    { name: 'Chocolate Ice Cream', price: '₹90' },
                    { name: 'Kulfi', price: '₹100' }
                ]
            }
        };

        const menuNavItems = document.querySelectorAll('.menu-nav-item');
        const menuContentDisplay = document.getElementById('menu-content-display');

        if (!menuNavItems.length || !menuContentDisplay) {
            return; // Menu section not found
        }

        // Update menu data for new categories BEFORE rendering
        // Cocktails (from welcome drinks)
        menuData['cocktails'] = menuData['welcome-drinks'] || { 
            title: 'Cocktails', 
            items: [
                { name: 'Signature Mojito', price: '₹220' },
                { name: 'Whiskey Sour', price: '₹240' },
                { name: 'Cosmopolitan', price: '₹260' }
            ]
        };
        
        // Mocktails (ensure it's not empty)
        menuData['mocktails'] = {
            title: 'Mocktails',
            items: [
                { name: 'Virgin Mojito', price: '₹180' },
                { name: 'Blue Lagoon', price: '₹200' },
                { name: 'Fresh Lime Soda', price: '₹150' },
                { name: 'Watermelon Cooler', price: '₹190' },
                { name: 'Mint Lime Cooler', price: '₹185' },
                { name: 'Sweet Lime Soda', price: '₹150' }
            ]
        };
        
        // Main Course (combine paneer, veg, dal)
        menuData['main-course'] = { 
            title: 'Main Course', 
            items: [
                ...(menuData['paneer']?.items || []),
                ...(menuData['veg']?.items || []),
                ...(menuData['dal']?.items || [])
            ]
        };
        
        // Rice & Breads (combine rice and breads)
        menuData['rice-breads'] = {
            title: 'Rice & Breads',
            items: [
                ...(menuData['rice']?.items || []),
                ...(menuData['breads']?.items || [])
            ]
        };
        
        // Desserts (from ice-cream)
        menuData['desserts'] = menuData['ice-cream'] || { 
            title: 'Desserts', 
            items: [
                { name: 'Ice Cream', price: '₹80' },
                { name: 'Kulfi', price: '₹100' }
            ]
        };
        
        // Ensure no category is empty
        Object.keys(menuData).forEach(key => {
            if (!menuData[key].items || menuData[key].items.length === 0) {
                console.warn(`Menu category "${key}" is empty, adding placeholder items`);
                menuData[key].items = [
                    { name: 'Coming Soon', price: '—' }
                ];
            }
        });

        // Render menu category content
        function renderMenuCategory(categoryKey) {
            const category = menuData[categoryKey];
            if (!category || !category.items || category.items.length === 0) {
                console.warn(`Menu category "${categoryKey}" is empty or missing`);
                return;
            }

            let html = `<h2 class="menu-category-title">${category.title}</h2>`;

            // Render regular menu items
            html += '<ul class="menu-items-list">';
            category.items.forEach(item => {
                html += `
                    <li class="menu-item">
                        <span class="menu-item-name">${item.name}</span>
                        <span class="menu-item-price">${item.price}</span>
                    </li>
                `;
            });
            html += '</ul>';

            // Fade transition
            menuContentDisplay.classList.add('fade-transition');
            
            setTimeout(() => {
                menuContentDisplay.innerHTML = html;
                menuContentDisplay.classList.remove('fade-transition');
            }, 200);
        }

        // Handle menu navigation clicks
        menuNavItems.forEach(navItem => {
            navItem.addEventListener('click', function() {
                const categoryKey = this.getAttribute('data-category');
                
                // Remove active class from all nav items
                menuNavItems.forEach(item => item.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Render category content
                renderMenuCategory(categoryKey);
            });
        });

        // Initialize with first category
        if (menuNavItems.length > 0) {
            renderMenuCategory('cocktails');
        }
    }

    /* ========================================
       PARTY PACKAGES - Standalone Premium Section
       Luxury event booking experience
       ======================================== */
    function initPartyPackages() {
        // Party package data
        const partyPackages = {
            'small-party': {
                title: 'Small Party Plan',
                price: '₹4,999',
                priceNote: 'All Inclusive',
                includes: [
                    'Welcome drinks',
                    'Veg starters',
                    'Veg main course',
                    'DJ music',
                    'Party seating',
                    'Club-style ambience'
                ],
                note: 'Best for birthdays & small celebrations',
                ctaText: 'Book Small Party'
            },
            'birthday': {
                title: 'Birthday Party Package',
                price: '₹469',
                priceNote: '+ GST / Person',
                includes: [
                    '2 welcome drinks',
                    '3 starters',
                    '1 special starter',
                    'Ice cream',
                    'DJ & club setup'
                ],
                minimum: 'Minimum: 20 pax for DJ, 30 pax for club',
                ctaText: 'Plan My Birthday'
            },
            'corporate': {
                title: 'Corporate Party Package',
                price: '₹469',
                priceNote: '+ GST / Person',
                includes: [
                    'Welcome drink',
                    'Starter',
                    'Paneer, veg, dal',
                    'Rice & breads',
                    'Salad, pickle, ice cream'
                ],
                ctaText: 'Book Corporate Event'
            },
            'family': {
                title: 'Family Party Package',
                price: '₹569',
                priceNote: '+ GST / Person',
                includes: [
                    '2 welcome drinks',
                    'Soup',
                    '2 starters + 2 special starters',
                    'Paneer, veg, dal, rice',
                    '3 breads',
                    'Ice cream'
                ],
                ctaText: 'Book Family Dinner'
            }
        };

        const partyOptions = document.querySelectorAll('.party-option');
        const partyDetailsContent = document.getElementById('party-details-content');

        if (!partyOptions.length || !partyDetailsContent) {
            return; // Party packages section not found
        }

        // Render party package details
        function renderPartyPackage(packageKey) {
            const pkg = partyPackages[packageKey];
            if (!pkg) return;

            let html = `
                <h2 class="party-package-detail-title">${pkg.title}</h2>
                <div class="party-package-detail-price">
                    <span class="party-package-detail-price-amount">${pkg.price}</span>
                    ${pkg.priceNote ? `<span class="party-package-detail-price-divider">|</span><span class="party-package-detail-price-note">${pkg.priceNote}</span>` : ''}
                </div>
                <div class="party-package-detail-includes">
                    <h3 class="party-package-detail-includes-title">Includes:</h3>
                    <ul class="party-package-detail-includes-list">
                        ${pkg.includes.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;

            if (pkg.minimum) {
                html += `<div class="party-package-detail-minimum">${pkg.minimum}</div>`;
            }

            if (pkg.note) {
                html += `<div class="party-package-detail-note">${pkg.note}</div>`;
            }

            html += `<a href="#contact" class="party-package-cta">${pkg.ctaText}</a>`;

            // Fade transition
            partyDetailsContent.classList.add('fade-transition');
            
            setTimeout(() => {
                partyDetailsContent.innerHTML = html;
                partyDetailsContent.classList.remove('fade-transition');
            }, 200);
        }

        // Handle party option clicks
        partyOptions.forEach(option => {
            option.addEventListener('click', function() {
                const packageKey = this.getAttribute('data-package');
                
                // Remove active class from all options
                partyOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to clicked option
                this.classList.add('active');
                
                // Render package details
                renderPartyPackage(packageKey);
            });
        });

        // Initialize with first package
        if (partyOptions.length > 0) {
            renderPartyPackage('small-party');
        }
    }

    /* ========================================
       ABOUT SECTION - Scroll Animation
       Subtle fade-in animations for premium feel
       ======================================== */
    function initAboutAnimations() {
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Show content immediately if motion is reduced
            const textColumn = document.querySelector('.about-text-column');
            const imageColumn = document.querySelector('.about-image-column');
            if (textColumn) textColumn.classList.add('animate-in');
            if (imageColumn) imageColumn.classList.add('animate-in');
            return;
        }
        
        const aboutSection = document.querySelector('.about-section');
        if (!aboutSection) return;
        
        const textColumn = document.querySelector('.about-text-column');
        const imageColumn = document.querySelector('.about-image-column');
        
        if (!textColumn || !imageColumn) return;
        
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate text column
                    textColumn.classList.add('animate-in');
                    
                    // Animate image column with delay
                    setTimeout(() => {
                        imageColumn.classList.add('animate-in');
                    }, 200);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        observer.observe(aboutSection);
    }

    /**
     * Initialize Reviews Carousel
     * Auto-sliding horizontal carousel with drag/swipe support
     */
    function initReviewsAnimation() {
        const track = document.querySelector('.reviews-track');
        const cards = document.querySelectorAll('.review-card');
        const carousel = document.querySelector('.reviews-carousel');
        
        if (!track || cards.length === 0 || !carousel) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            // Disable auto-slide for reduced motion
            return;
        }

        let index = 0;
        const totalCards = cards.length - 2; // Subtract duplicated cards
        let slideInterval = null;
        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        let initialTranslate = 0;

        /**
         * Calculate the exact width of one card including gap
         */
        function getCardWidth() {
            if (cards.length === 0) return 0;
            const card = cards[0];
            const cardRect = card.getBoundingClientRect();
            const gap = 24;
            return cardRect.width + gap;
        }

        /**
         * Update track position
         */
        function updatePosition() {
            const translateX = initialTranslate + (currentX - startX);
            track.style.transform = `translateX(${translateX}px)`;
        }

        /**
         * Move to the next slide
         */
        function nextSlide() {
            if (isDragging) return; // Don't auto-slide while dragging
            
            const cardWidth = getCardWidth();
            index++;
            
            const translateX = -index * cardWidth;
            track.style.transform = `translateX(${translateX}px)`;
            initialTranslate = translateX;

            // Reset to beginning when reaching duplicated cards
            if (index >= totalCards) {
                setTimeout(() => {
                    track.style.transition = 'none';
                    index = 0;
                    track.style.transform = 'translateX(0px)';
                    initialTranslate = 0;
                    void track.offsetWidth;
                    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                }, 600);
            }
        }

        /**
         * Start auto-sliding (every 4-5 seconds)
         */
        function startSlide() {
            stopSlide();
            slideInterval = setInterval(nextSlide, 4500); // 4.5 seconds
        }

        function stopSlide() {
            if (slideInterval) {
                clearInterval(slideInterval);
                slideInterval = null;
            }
        }

        /**
         * Mouse drag handlers
         */
        function handleMouseDown(e) {
            isDragging = true;
            startX = e.clientX;
            initialTranslate = -index * getCardWidth();
            track.classList.add('dragging');
            stopSlide();
            e.preventDefault();
        }

        function handleMouseMove(e) {
            if (!isDragging) return;
            currentX = e.clientX;
            updatePosition();
        }

        function handleMouseUp() {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('dragging');
            
            const cardWidth = getCardWidth();
            const moved = currentX - startX;
            
            // Snap to nearest card
            if (Math.abs(moved) > cardWidth / 3) {
                if (moved > 0 && index > 0) {
                    index--;
                } else if (moved < 0 && index < totalCards - 1) {
                    index++;
                }
            }
            
            const translateX = -index * cardWidth;
            track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            track.style.transform = `translateX(${translateX}px)`;
            initialTranslate = translateX;
            
            // Resume auto-slide after a delay
            setTimeout(startSlide, 2000);
        }

        /**
         * Touch swipe handlers
         */
        let touchStartX = 0;
        let touchInitialTranslate = 0;

        function handleTouchStart(e) {
            isDragging = true;
            touchStartX = e.touches[0].clientX;
            touchInitialTranslate = -index * getCardWidth();
            stopSlide();
        }

        function handleTouchMove(e) {
            if (!isDragging) return;
            const touchCurrentX = e.touches[0].clientX;
            const translateX = touchInitialTranslate + (touchCurrentX - touchStartX);
            track.style.transition = 'none';
            track.style.transform = `translateX(${translateX}px)`;
        }

        function handleTouchEnd(e) {
            if (!isDragging) return;
            isDragging = false;
            
            const cardWidth = getCardWidth();
            const touchEndX = e.changedTouches[0].clientX;
            const moved = touchEndX - touchStartX;
            
            // Snap to nearest card
            if (Math.abs(moved) > cardWidth / 3) {
                if (moved > 0 && index > 0) {
                    index--;
                } else if (moved < 0 && index < totalCards - 1) {
                    index++;
                }
            }
            
            const translateX = -index * cardWidth;
            track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            track.style.transform = `translateX(${translateX}px)`;
            
            // Resume auto-slide
            setTimeout(startSlide, 3000);
        }

        // Event listeners
        track.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        track.addEventListener('touchstart', handleTouchStart, { passive: true });
        track.addEventListener('touchmove', handleTouchMove, { passive: true });
        track.addEventListener('touchend', handleTouchEnd);

        // Pause on hover
        carousel.addEventListener('mouseenter', stopSlide);
        carousel.addEventListener('mouseleave', startSlide);

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const cardWidth = getCardWidth();
                const translateX = -index * cardWidth;
                track.style.transform = `translateX(${translateX}px)`;
                initialTranslate = translateX;
            }, 250);
        });

        // Initialize carousel
        setTimeout(() => {
            startSlide();
        }, 100);
    }

    /**
     * Initialize Mobile Sticky Reserve Pill
     * Smooth scroll to reserve section on click
     */
    function initMobileReservePill() {
        const pill = document.getElementById('mobile-reserve-pill');
        if (!pill) return;

        pill.addEventListener('click', function(e) {
            e.preventDefault();
            const reserveSection = document.getElementById('reserve');
            if (reserveSection) {
                reserveSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    /**
     * Initialize Open Now Badge
     * Time-based logic for status display
     */
    function initOpenNowBadge() {
        const badge = document.getElementById('hero-status-badge');
        if (!badge) return;

        const indicator = badge.querySelector('.status-indicator');
        const text = badge.querySelector('.status-text');

        function updateStatus() {
            const now = new Date();
            const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const hour = now.getHours();
            const minute = now.getMinutes();
            const currentTime = hour * 60 + minute;
            const openTime = 11 * 60; // 11:00 AM = 660 minutes

            // Wednesday = 3, Sunday = 0
            const isOpenDay = day === 0 || day >= 3; // Sunday (0) or Wednesday-Saturday (3-6)

            if (isOpenDay && currentTime >= openTime) {
                // Open now
                indicator.classList.remove('closed');
                text.textContent = 'Open Now';
            } else {
                // Closed
                indicator.classList.add('closed');
                if (isOpenDay && currentTime < openTime) {
                    text.textContent = 'Closed – Opens at 11:00 AM';
                } else {
                    // Closed (Sunday evening or Monday/Tuesday)
                    const nextOpenDay = day === 0 ? 'Wednesday' : day === 1 ? 'Wednesday' : day === 2 ? 'Wednesday' : 'Wednesday';
                    text.textContent = `Closed – Opens ${nextOpenDay} at 11:00 AM`;
                }
            }
        }

        updateStatus();
        // Update every minute
        setInterval(updateStatus, 60000);
    }

    /**
     * Initialize WhatsApp Highlight Animation
     * Auto-highlight after 10 seconds of inactivity
     */
    function initWhatsAppHighlight() {
        const whatsappBtn = document.getElementById('whatsapp-reserve-btn');
        if (!whatsappBtn) return;

        let inactivityTimer = null;
        let hasAnimated = false;

        function resetTimer() {
            clearTimeout(inactivityTimer);
            
            if (!hasAnimated) {
                inactivityTimer = setTimeout(() => {
                    whatsappBtn.classList.add('whatsapp-pulse');
                    hasAnimated = true;

                    // Remove animation class after animation completes
                    setTimeout(() => {
                        whatsappBtn.classList.remove('whatsapp-pulse');
                    }, 1600); // 0.8s * 2 = 1.6s
                }, 10000); // 10 seconds
            }
        }

        function cancelAnimation() {
            clearTimeout(inactivityTimer);
            whatsappBtn.classList.remove('whatsapp-pulse');
        }

        // Track user activity
        ['scroll', 'click', 'mousemove', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                cancelAnimation();
                resetTimer();
            }, { passive: true });
        });

        // Check if reserve section is in view
        const reserveSection = document.getElementById('reserve');
        if (reserveSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        cancelAnimation();
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(reserveSection);
        }

        // Start timer
        resetTimer();
    }

    // Initialize all new features
    initMobileReservePill();
    initOpenNowBadge();
    initWhatsAppHighlight();

})();
