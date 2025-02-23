//For console details
document.addEventListener("DOMContentLoaded", function() {
    console.log("Page Loaded - Ready for interactions");

    // Select all artist images and add click event listeners
    document.querySelectorAll(".artist-image").forEach(img => {
        img.addEventListener("click", function(event) {
            console.log("Artist image clicked:", event.target.src);
        });
    });
});