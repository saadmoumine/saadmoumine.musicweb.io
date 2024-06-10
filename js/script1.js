//Carousel
function initializeCarousel(wrapperSelector, carouselSelector) {
    const wrapper = document.querySelector(wrapperSelector);
    const carousel = document.querySelector(carouselSelector);
    const firstCardWidth = carousel.querySelector(".card").offsetWidth;
    const arrowBtns = wrapper.querySelectorAll("i");
    const carouselChildren = [...carousel.children];

    let isDragging = false, isAutoPlay = true, startX, startScrollLeft, timeoutId;

    // Get the number of cards that can fit in the carousel at once
    let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

    // Insert copies of the last few cards to beginning of carousel for infinite scrolling
    carouselChildren.slice(-cardPerView).reverse().forEach(card => {
        carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
    });

    // Insert copies of the first few cards to end of carousel for infinite scrolling
    carouselChildren.slice(0, cardPerView).forEach(card => {
        carousel.insertAdjacentHTML("beforeend", card.outerHTML);
    });

    // Scroll the carousel at appropriate position to hide first few duplicate cards on Firefox
    carousel.classList.add("no-transition");
    carousel.scrollLeft = carousel.offsetWidth;
    carousel.classList.remove("no-transition");

    // Add event listeners for the arrow buttons to scroll the carousel left and right
    arrowBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Identify direction
            let direction = btn.id == "left" ? -1 : 1;
            // Simulate dragging
            simulateDrag(direction * firstCardWidth);
        });
    });


    // simulate the drag event when the btn gets clicked 
    const simulateDrag = (distance) => {
        const start = carousel.scrollLeft;
        const end = start + distance;
        const step = distance / 10;
        let current = start;
        let stepCount = 0;

        const simulateDragging = () => {
            if ((step > 0 && current < end) || (step < 0 && current > end)) {
                current += step;
                stepCount++;
                const fakeEvent = { pageX: startX - stepCount * step };
                dragging(fakeEvent);
                requestAnimationFrame(simulateDragging);
            } else {
                const fakeEvent = { pageX: startX - (end - start) };
                dragging(fakeEvent);
                dragStop();
                infiniteScroll();
            }
        };

        // Initialize dragging state
        startX = start;
        startScrollLeft = carousel.scrollLeft;
        isDragging = true;
        carousel.classList.add("dragging");

        simulateDragging();
    };

    const dragStart = (e) => {
        isDragging = true;
        carousel.classList.add("dragging");
        // Records the initial cursor and scroll position of the carousel
        startX = e.pageX;
        startScrollLeft = carousel.scrollLeft;
    };

    const dragging = (e) => {
        if (!isDragging) return; // if isDragging is false return from here
        // Updates the scroll position of the carousel based on the cursor movement
        carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
    };

    const dragStop = () => {
        isDragging = false;
        carousel.classList.remove("dragging");
    };

    const infiniteScroll = () => {
        // If the carousel is at the beginning, scroll to the end
        if (carousel.scrollLeft === 0) {
            carousel.classList.add("no-transition");
            carousel.scrollLeft = carousel.scrollWidth - (2 * carousel.offsetWidth);
            carousel.classList.remove("no-transition");
        }
        // If the carousel is at the end, scroll to the beginning
        else if (Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {
            carousel.classList.add("no-transition");
            carousel.scrollLeft = carousel.offsetWidth;
            carousel.classList.remove("no-transition");
        }

        // Clear existing timeout & start autoplay if mouse is not hovering over carousel
        clearTimeout(timeoutId);
        if (!wrapper.matches(":hover")) autoPlay();
    };

    const autoPlay = () => {
        if (window.innerWidth < 800 || !isAutoPlay) return; // Return if window is smaller than 800 or isAutoPlay is false
        // Autoplay the carousel after every 4000 ms
        timeoutId = setTimeout(() => simulateDrag(firstCardWidth), 400000);

    };
    autoPlay();


    carousel.addEventListener("mousedown", dragStart);
    carousel.addEventListener("mousemove", dragging);
    document.addEventListener("mouseup", dragStop);
    carousel.addEventListener("scroll", infiniteScroll);
    wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
    wrapper.addEventListener("mouseleave", autoPlay);
}

// Initialize each carousel separately
initializeCarousel("#services-carousel", "#services-carousel .carousel");
initializeCarousel("#team-carousel", "#team-carousel .carousel");


//Scrolling
document.querySelectorAll('.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

//Booking
const instructors = {
    Piano: ["John Smith", "Emily Johnson", "Laura Williams", "Sarah Davis"],
    Guitar: ["John Smith", "Emily Johnson", "Michael Brown"],
    Violin: ["John Smith", "Laura Williams", "David Lee"],
    Drums: ["Emily Johnson", "Michael Brown", "David Lee"],
    Flute: ["Laura Williams", "Sarah Davis"],
    Saxophone: ["Michael Brown", "Sarah Davis", "David Lee"]
};

const instruments = {
    "John Smith": ["Piano", "Guitar", "Violin"],
    "Emily Johnson": ["Piano", "Guitar", "Drums"],
    "Laura Williams": ["Piano", "Flute", "Violin"],
    "Sarah Davis": ["Piano", "Flute", "Saxophone"],
    "Michael Brown": ["Saxophone", "Guitar", "Drums"],
    "David Lee": ["Saxophone", "Drums", "Violin"]
};

function updatePrice() {
    const fromTime = document.getElementById('from').value;
    const toTime = document.getElementById('to').value;
    const level = document.getElementById('level').value;

    if (fromTime && toTime) {
        const [fromHours, fromMinutes] = fromTime.split(':').map(Number);
        const [toHours, toMinutes] = toTime.split(':').map(Number);

        const from = new Date(0, 0, 0, fromHours, fromMinutes, 0);
        const to = new Date(0, 0, 0, toHours, toMinutes, 0);

        let diff = (to - from) / 1000 / 60 / 60; // Difference in hours

        if (diff < 0) {
            diff += 24; // Adjust for crossing midnight
        }

        let pricePerHour = 20;
        if (level === "intermediate") {
            pricePerHour += 5;
        } else if (level === "expert") {
            pricePerHour += 10;
        }

        const price = diff * pricePerHour;
        document.getElementById('price').textContent = `${price.toFixed(2)} $`;
    } else {
        document.getElementById('price').textContent = "0 $";
    }
}

// Initial call to set the price based on default times
document.addEventListener('DOMContentLoaded', updatePrice);

// Add event listeners to update the price automatically when times or level change
document.getElementById('from').addEventListener('change', updatePrice);
document.getElementById('to').addEventListener('change', updatePrice);
document.getElementById('level').addEventListener('change', updatePrice);

document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    if (validateForm()) {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email1').value;
        const subject = document.getElementById('subject').value;
        const instructor = document.getElementById('instructor').value;
        const type = document.querySelector('input[name="type"]:checked').value;
        const level = document.getElementById('level').value;
        const day = document.getElementById('day').value;
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        
        const totalPrice = calculatePrice(level, from, to);
        document.getElementById('price').textContent = `${totalPrice} $`;

        const confirmationMessage = `
            <p>Thank you for booking a session, ${firstName} ${lastName}! Here are your booking details:</p>
            <ul>
                <li>Course: ${subject}</li>
                <li>Instructor: ${instructor}</li>
                <li>Type: ${type}</li>
                <li>Level: ${level}</li>
                <li>Date: ${day}</li>
                <li>Time: From ${from} to ${to}</li>
                <li>Total Price: ${totalPrice} $</li>
            </ul>
            <p>A confirmation email has been sent to ${email} to validate your booking.</p>
            <button type="button" class="btn btn-primary" onclick="closeBothModals()">Close</button>
        `;

        document.getElementById('confirmationMessage').innerHTML = confirmationMessage;

        // Show the confirmation modal
        $('#bookingModal').modal('hide');
        $('#confirmationModal').modal('show');

        // Send confirmation email (this requires server-side implementation)
        sendConfirmationEmail(firstName, lastName, email, subject, instructor, type, level, day, from, to, totalPrice);
    }
});

function validateForm() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const instructor = document.getElementById('instructor').value;
    const type = document.querySelector('input[name="type"]:checked');
    const level = document.getElementById('level').value;
    const day = document.getElementById('day').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    
    if (!firstName || !lastName || !email || !subject || !instructor || !type || !level || !day || !from || !to) {
        alert('Please fill in all required fields.');
        return false;
    }
    return true;
}

function calculatePrice(level, from, to) {
    const baseRate = 20;
    let levelRate = 0;
    if (level === 'intermediate') {
        levelRate = 5;
    } else if (level === 'expert') {
        levelRate = 10;
    }

    const startTime = new Date(`1970-01-01T${from}Z`);
    const endTime = new Date(`1970-01-01T${to}Z`);
    const duration = (endTime - startTime) / (1000 * 60 * 60); // duration in hours

    return (baseRate + levelRate) * duration;
}


function closeBothModals() {
    $('#confirmationModal').modal('hide');
    $('#bookingModal').modal('hide');
}



// Event listener for "Book now" buttons to open the modal and set the selected course and instructors
document.querySelectorAll('.card-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const card = event.target.closest('.card');
        const instructorName = card.querySelector('.instructor-name').textContent.trim();
        const instructorCourses = instruments[instructorName];
        const subjectSelect = document.getElementById('subject');
        const instructorSelect = document.getElementById('instructor');

        // Populate the subject select with the instructor's courses
        subjectSelect.innerHTML = '<option value="">Select a course</option>';
        instructorCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            subjectSelect.appendChild(option);
        });

        // Set the instructor select value
        instructorSelect.innerHTML = `<option value="${instructorName}">${instructorName}</option>`;
        instructorSelect.value = instructorName;

        // Show the modal
        const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
        bookingModal.show();
    });
});

document.getElementById('subject').addEventListener('change', function () {
    const selectedCourse = this.value;
    const instructorSelect = document.getElementById('instructor');
    instructorSelect.innerHTML = '<option value="">Select an instructor</option>';

    if (selectedCourse && instructors[selectedCourse]) {
        instructors[selectedCourse].forEach(function (instructor) {
            const option = document.createElement('option');
            option.value = instructor;
            option.textContent = instructor;
            instructorSelect.appendChild(option);
        });
    }
});

document.querySelectorAll('.button-js').forEach(button => {
    button.addEventListener('click', (event) => {
        const card = event.target.closest('.card');
        const courseTitle = card.querySelector('.card-title').textContent.split('<br>')[0].trim();
        const course = courseTitle.split(' ')[0]; // Extract course name
        document.getElementById('subject').value = course;
        document.getElementById('subject').dispatchEvent(new Event('change'));
        const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
        bookingModal.show();
    });
});

document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
        bookingModal.show();
    });
});

