// Variable to store the single click sound
let clickSound = new Audio("/static/sound2.wav"); // Replace with your sound file

// Function to open the modal
function openModal(name, image, members, firstAlbum, creationDate, relations, locations, dates) {
    const modal = document.getElementById("myModal");
    const modalTitle = document.getElementById("modal-title");
    const modalImage = document.getElementById("modal-image");

    modalTitle.textContent = name;
    modalImage.src = image;
    modal.style.display = "block";

    // Set members list
    const membersList = document.getElementById("modal-members");
    membersList.innerHTML = members.split(", ").map(member =>
        `<div class="member-item">${member}</div>`
    ).join("");

    // Set album date
    document.getElementById("modal-first-album").textContent = firstAlbum;
    
    // Set creation date
    document.getElementById("modal-creation-date").textContent = creationDate;

    // Parse relations data for both locations and concert dates
    const relationsData = JSON.parse(relations);

    // Handle Locations
    const locationsList = Object.keys(relationsData).map(loc => formatLocation(loc));
    locationsList.sort();

    // Populate modal with locations
    const locationsContainer = document.getElementById('modal-locations');
    locationsContainer.innerHTML = '';
    if (locationsList.length > 0) {
        locationsList.forEach(location => {
            const locationDiv = document.createElement('div');
            locationDiv.className = 'location-item';
            locationDiv.textContent = location;
            locationsContainer.appendChild(locationDiv);
        });
    }

    // Handle Concert Dates
    const tourDatesContainer = document.getElementById('modal-tour-dates');
    tourDatesContainer.innerHTML = '';

    if (Object.keys(relationsData).length > 0) {
        Object.entries(relationsData).forEach(([location, dates]) => {
            const formattedLocation = formatLocation(location);
            dates.forEach(date => {
                const dateDiv = document.createElement('div');
                dateDiv.className = 'tour-date';
                dateDiv.textContent = `${formattedLocation}: ${date}`;
                tourDatesContainer.appendChild(dateDiv);
            });
        });
    } else {
        tourDatesContainer.innerHTML = "<div class='tour-date'>No concert dates available</div>";
    }

    console.log("Dates received:", dates);

    // Handle Dates
    const datesContainer = document.getElementById('modal-dates');
    datesContainer.innerHTML = ''; // Clear existing content

    if (dates && dates.length > 0) {
        const datesArray = dates.split(',').filter(date => date.trim() !== '');
        if (datesArray.length > 0) {
            datesArray.forEach(date => {
                const dateDiv = document.createElement('div');
                dateDiv.className = 'date-item';
                dateDiv.textContent = date.trim().replace(/\*/g, '');
                datesContainer.appendChild(dateDiv);
            });
        } else {
            datesContainer.innerHTML = "<div class='date-item'>No dates available</div>";
        }
    } else {
        datesContainer.innerHTML = "<div class='date-item'>No dates available</div>";
    }

    // Close all accordions initially
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    // Add click handlers for accordion headers
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = function() {
            const content = this.nextElementSibling;
            if (content.style.display === 'none') {
                document.querySelectorAll('.accordion-content').forEach(item => {
                    item.style.display = 'none';
                    item.classList.remove('active');
                });
                content.style.display = 'block';
                content.classList.add('active');
            } else {
                content.style.display = 'none';
                content.classList.remove('active');
            }
        };
    });

    // Play single sound when modal opens
    playClickSound();

    // Initialize accordion
    setTimeout(() => {
        initializeAccordion();
    }, 0);
}

// Function to play the single click sound
function playClickSound() {
    clickSound.pause();          // Stop any currently playing sound
    clickSound.currentTime = 0;  // Reset to the beginning
    clickSound.play().catch(error => {
        console.error("Error playing sound:", error);
    });
}


// Function to format locations (City, COUNTRY)
function formatLocation(location) {
    const [city, country] = location.split('-');
    const formattedCity = city.split('_').map(word => capitalize(word)).join(' ');
    const formattedCountry = country.split('_').map(word => word.toUpperCase()).join(' ');
    return `${formattedCity}, ${formattedCountry}`;
}

// Function to capitalize words
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Function to close modal and stop sound
function closeModal() {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";

    // Close all accordion sections when modal is closed
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    // Stop the sound when closing the modal
    clickSound.pause();
    clickSound.currentTime = 0;
}

// Event listeners for closing the modal
document.addEventListener("DOMContentLoaded", function() {
    const closeButton = document.getElementById("close-modal");
    if (closeButton) {
        closeButton.addEventListener("click", closeModal);
    }

    window.onclick = function(event) {
        const modal = document.getElementById("myModal");
        if (event.target === modal) {
            closeModal();
        }
    };
});

// Toggle the display of tour dates when the header is clicked
document.getElementById("toggle-tour-dates").addEventListener("click", function() {
    const tourDatesList = document.getElementById("modal-tour-dates");
    if (tourDatesList.style.display === "none") {
        tourDatesList.style.display = "block";
    } else {
        tourDatesList.style.display = "none";
    }
});

// Function to initialize accordion functionality
function initializeAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    // Remove existing event listeners by cloning elements
    accordionHeaders.forEach(header => {
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
    });

    // Add new event listeners
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            if (content.style.display === 'none') {
                document.querySelectorAll('.accordion-content').forEach(item => {
                    item.style.display = 'none';
                    item.classList.remove('active');
                });
                content.style.display = 'block';
                content.classList.add('active');
            } else {
                content.style.display = 'none';
                content.classList.remove('active');
            }
        });
    });
}

// Update accordion click handler
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('accordion-header')) {
        const content = e.target.nextElementSibling;
        if (e.target.closest('.modal-left')) {
            content.classList.toggle('active');
        } else {
            content.classList.add('active');
        }
    }
});