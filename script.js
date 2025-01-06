document.getElementById("accept-btn").addEventListener("click", function() {
    alert("Yay! Can't wait for our special date! 💖");
    // Hide invitation page and show itinerary page
    document.getElementById('invitationPage').style.display = 'none';
    document.getElementById('itineraryPage').style.display = 'block';
});

document.getElementById('itineraryForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form from submitting the default way
    
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
