window.onload = function() {
    const acceptBtn = document.getElementById("accept-btn");
    const itineraryPage = document.getElementById("itineraryPage");
    const invitationPage = document.getElementById("invitationPage");
    const itineraryForm = document.getElementById("itineraryForm");

    // Ensure elements exist before adding event listeners
    if (acceptBtn && itineraryPage && invitationPage) {
        acceptBtn.addEventListener("click", function() {
            alert("Yay! Can't wait for our special date! 💖");
            // Hide invitation page and show itinerary page
            invitationPage.style.display = "none";
            itineraryPage.style.display = "block";
        });
    }

    if (itineraryForm) {
        itineraryForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Prevent default form submission
            
            let selectedActivities = [];
            const checkboxes = document.querySelectorAll('input[name="activity"]:checked');
            
            checkboxes.forEach(function(checkbox) {
                selectedActivities.push(checkbox.value);
            });

            // Display the selected activities
            if (selectedActivities.length > 0) {
                alert('You selected: ' + selectedActivities.join(', '));
            } else {
                alert('Please select at least one activity.');
            }
        });
    }
};
