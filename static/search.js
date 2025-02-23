document.addEventListener('DOMContentLoaded', function () {
    const searchBar = document.getElementById('search-bar');
    const suggestionsBox = document.getElementById('suggestions');
    const dataItems = document.querySelectorAll('.data-item'); // Ensure this matches your artist cards

    // Cache for search results
    const searchCache = {};

    function formatLocation(location) {
        // Replace underscores with spaces
        let formattedLocation = location.replace(/_/g, ' ');
    
        // Remove asterisks
        formattedLocation = formattedLocation.replace(/\*/g, '');
    
        // Split into parts (city and country)
        let parts = formattedLocation.split('-');
    
        // Capitalize each word in the city and country
        parts = parts.map(part => {
            return part.split(' ').map(word => {
                // Skip capitalization for 'usa' and 'uk' (already handled)
                if (word.toLowerCase() === 'usa' || word.toLowerCase() === 'uk') {
                    return word.toUpperCase();
                }
                // Capitalize the first letter of each word
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');
        });
    
        // Join city and country with a hyphen
        formattedLocation = parts.join('-');
    
        return formattedLocation;
    }

    // Function to fetch search suggestions from the Go backend
    function fetchSuggestions(searchTerm) {
        if (searchTerm === '') {
            suggestionsBox.style.display = 'none';
            showAllArtists(); // Show all artists when the search bar is cleared
            return;
        }

        // Check if the result is already cached
        if (searchCache[searchTerm]) {
            displaySuggestions(searchCache[searchTerm]);
            return;
        }

        // Send search request to the Go backend
        fetch(`/search?query=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                // Cache the result
                searchCache[searchTerm] = data;
                displaySuggestions(data);
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
            });
    }

    function displaySuggestions(data) {
        if (data.length > 0) {
            suggestionsBox.innerHTML = data.map(item => {
                // Format the type if it contains a location or concert date
                let type = item.type;
                if (type.startsWith('Location: ') || type.startsWith('Concert Date: ')) {
                    const value = type.replace('Location: ', '').replace('Concert Date: ', '');
                    type = `${type.split(': ')[0]}: ${formatLocation(value)}`;
                }
    
                return `
                    <div class="suggestion-item" data-value="${item.label}" data-type="${type}">
                        <span class="suggestion-text">${item.label}</span>
                        <span class="suggestion-type">${type}</span>
                    </div>
                `;
            }).join('');
            suggestionsBox.style.display = 'block';
        } else {
            suggestionsBox.style.display = 'none';
        }
    }

    // Function to show all artists
    function showAllArtists() {
        dataItems.forEach(item => {
            item.style.display = 'block'; // Show all artist cards
        });
    }

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Handle search input for suggestions
    searchBar.addEventListener('input', debounce(function (e) {
        const searchTerm = e.target.value;
        fetchSuggestions(searchTerm);
    }, 300)); // Adjust the debounce delay as needed

    // Handle suggestion clicks
    suggestionsBox.addEventListener('click', function (e) {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
            const value = suggestionItem.dataset.value;
            const type = suggestionItem.dataset.type;
            searchBar.value = suggestionItem.querySelector('.suggestion-text').textContent;
            suggestionsBox.style.display = 'none';

            // Filter artists based on the selected suggestion
            filterArtists(value, type);
        }
    });

    // Handle Enter key press
    searchBar.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const searchTerm = searchBar.value;
            suggestionsBox.style.display = 'none';

            // Filter all artists based on the search term across all fields
            filterArtists(searchTerm, 'all');
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function (e) {
        if (!searchBar.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });

    // Function to filter artists based on search term and type
    function filterArtists(searchTerm, type) {
        const searchTermLower = searchTerm.toLowerCase().trim(); // Case-insensitive search

        dataItems.forEach(item => {
            const artistName = item.querySelector('h3').textContent; // Preserve original casing
            const artistNameLower = artistName.toLowerCase(); // Case-insensitive comparison
            const members = item.getAttribute('data-members') || ''; // Preserve original casing
            const membersLower = members.toLowerCase(); // Case-insensitive comparison
            const creationDate = item.getAttribute('data-creation-date') || '';
            const firstAlbum = item.getAttribute('data-first-album') || ''; // Preserve original casing
            const firstAlbumLower = firstAlbum.toLowerCase(); // Case-insensitive comparison
            const locations = item.getAttribute('data-locations') || ''; // Preserve original casing
            const locationsLower = locations.toLowerCase(); // Case-insensitive comparison
            const concertDates = item.getAttribute('data-concert-dates') || ''; // Preserve original casing
            const concertDatesLower = concertDates.toLowerCase(); // Case-insensitive comparison

            let matches = false;

            switch (type) {
                case 'Artist':
                    matches = artistNameLower === searchTermLower;
                    break;
                case 'Member':
                    matches = membersLower.split(',').some(member => member.trim() === searchTermLower);
                    break;
                case 'Creation Date':
                    matches = creationDate === searchTermLower;
                    break;
                case 'First Album':
                    matches = firstAlbumLower === searchTermLower;
                    break;
                case 'Location':
                    matches = locationsLower.split(',').some(location => location.trim() === searchTermLower);
                    break;
                case 'Concert Date':
                    matches = concertDatesLower.split(',').some(date => date.trim() === searchTermLower);
                    break;
                case 'all': // New case for filtering across all fields
                    matches =
                        artistNameLower.includes(searchTermLower) ||
                        membersLower.includes(searchTermLower) ||
                        creationDate.includes(searchTermLower) ||
                        firstAlbumLower.includes(searchTermLower) ||
                        locationsLower.includes(searchTermLower) ||
                        concertDatesLower.includes(searchTermLower);
                    break;
                default:
                    matches = artistNameLower.includes(searchTermLower) || membersLower.includes(searchTermLower) || creationDate.includes(searchTermLower) || firstAlbumLower.includes(searchTermLower) || locationsLower.includes(searchTermLower) || concertDatesLower.includes(searchTermLower);
            }

            item.style.display = matches ? 'block' : 'none';
        });
    }
});