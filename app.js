document.addEventListener('DOMContentLoaded', () => {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const carouselImages = document.querySelectorAll('.carousel-item img');
    let currentIndex = 0;
    let isImageEnlarged = false;
    let overlay; // Reuse overlay instead of creating it repeatedly

    // Show 6 carousel items at once
    const showCarousel = () => {
        carouselItems.forEach((item, index) => {
            item.style.display = (index >= currentIndex && index < currentIndex + 6) ? 'block' : 'none';
        });
    };

    // Show the initial set of 6 carousel items
    showCarousel();

    // Navigate between sets of 6 items
    const nextSlideSet = () => {
        currentIndex = (currentIndex + 6) % carouselItems.length;
        showCarousel();
    };

    const prevSlideSet = () => {
        currentIndex = (currentIndex - 6 + carouselItems.length) % carouselItems.length;
        showCarousel();
    };

    // Enlarge image with an overlay
    const enlargeImage = (src) => {
        if (!overlay) {
            overlay = createOverlay(); // Create overlay only once and reuse it
        }
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = `
            width: auto; 
            max-width: 90%; 
            max-height: 90%; 
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(img);

        isImageEnlarged = true;

        // Close overlay and image on click
        const closeImage = () => {
            if (img) {
                document.body.removeChild(img);
            }
            if (overlay) {
                document.body.removeChild(overlay);
            }
            isImageEnlarged = false;
        };

        overlay.addEventListener('click', closeImage); // Close on overlay click
        img.addEventListener('click', closeImage); // Close on image click
    };

    // Helper function to create or reuse overlay
    const createOverlay = () => {
        const overlayElement = document.createElement('div');
        overlayElement.style.cssText = `
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100vh; 
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
        `;
        return overlayElement;
    };

    // Event listener to enlarge carousel image when clicked
    carouselImages.forEach((image, index) => {
        image.addEventListener('click', () => {
            currentIndex = index;
            enlargeImage(image.src);
        });
    });

    // Handle arrow key navigation for carousel and modals
    document.addEventListener('keydown', (event) => {
        if (isImageEnlarged) {
            if (event.key === 'ArrowRight') nextEnlargedSlide();
            if (event.key === 'ArrowLeft') prevEnlargedSlide();
        } else {
            if (event.key === 'ArrowRight') nextSlideSet();
            if (event.key === 'ArrowLeft') prevSlideSet();
        }
    });

    // Handle enlarged image slide navigation
    const nextEnlargedSlide = () => {
        currentIndex = (currentIndex + 1) % carouselImages.length;
        enlargeImage(carouselImages[currentIndex].src);
    };

    const prevEnlargedSlide = () => {
        currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
        enlargeImage(carouselImages[currentIndex].src);
    };

    // Expandable "Meie teenused" items with modals
    document.querySelector('#services ul').addEventListener('click', (e) => {
        const item = e.target.closest('.service-item');
        if (item) {
            const modal = createModal(item.dataset.img, item.dataset.description, item.dataset.alt);
            document.body.appendChild(modal);

            // Add event listener to close the modal on clicking anywhere outside the modal content
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }
    });

    // Create modal for service items
    const createModal = (imgSrc, description, altText) => {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <img src="${imgSrc}" alt="${altText}" />
                <p>${description}</p>
                <button class="close-modal">Sulge</button>
            </div>
        `;

        // Close modal when clicking the close button
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        return modal;
    };

    // Header disappear when scrolling down and reappear only when scrolling back to the top
    const header = document.querySelector('header');
    let isHeaderHidden = false; // Track header visibility

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 0 && !isHeaderHidden) {
            // Scrolling down, hide header
            header.style.top = '-100px'; // Adjust based on header height
            isHeaderHidden = true;
        } else if (scrollTop === 0 && isHeaderHidden) {
            // Scrolled back to the top, show header
            header.style.top = '0';
            isHeaderHidden = false;
        }
    });

    // Smooth scroll to contact section
    const contactButton = document.getElementById('scrollToContact');
    const contactSection = document.getElementById('contact');

    contactButton.addEventListener('click', () => {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Formspree form submission handling
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.querySelector('.form-success');
    const formError = document.querySelector('.form-error');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const actionUrl = contactForm.action;

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (response.ok) {
                formSuccess.style.display = 'block';
                contactForm.reset(); // Clear the form after successful submission
                formError.style.display = 'none';
            } else {
                formError.style.display = 'block';
                formSuccess.style.display = 'none';
            }
        } catch (error) {
            formError.style.display = 'block';
            formSuccess.style.display = 'none';
        }
    });
});
