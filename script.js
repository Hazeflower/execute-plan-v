window.onload = function() {
    const acceptBtn = document.getElementById("accept-btn");
    const rejectBtn = document.getElementById("reject-btn");
    const itineraryPage = document.getElementById("itineraryPage");
    const invitationPage = document.getElementById("invitationPage");
    const itineraryForm = document.getElementById("itineraryForm");

    let rejectCount = 0; // Counter for tracking rejection clicks

    // Ensure elements exist before adding event listeners
    if (acceptBtn && itineraryPage && invitationPage) {
        acceptBtn.addEventListener("click", function() {
            alert("Yay! Can't wait for our special date! 💖");
            // Hide invitation page and show itinerary page
            invitationPage.style.display = "none";
            itineraryPage.style.display = "block";
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener("click", function() {
            rejectCount++;

            if (rejectCount >= 3) {
                alert("Noooo please reconsider 😭💔");
                location.reload(); // Reloads the page after 3 rejections
            } else {
                alert("Are you sure? 😢");

                // Increase accept button size
                let acceptSize = parseFloat(window.getComputedStyle(acceptBtn).fontSize);
                acceptBtn.style.fontSize = (acceptSize + 5) + "px";
                acceptBtn.style.padding = (acceptSize + 5) + "px " + (acceptSize + 10) + "px";

                // Decrease reject button size (including padding)
                let rejectSize = parseFloat(window.getComputedStyle(rejectBtn).fontSize);
                let newRejectSize = Math.max(10, rejectSize - 3); // Prevents it from becoming too small
                let newPadding = Math.max(5, rejectSize - 5) + "px " + Math.max(10, rejectSize - 10) + "px"; 
        
                rejectBtn.style.fontSize = newRejectSize + "px";
                rejectBtn.style.padding = newPadding;
                
                // Disable reject button if it gets too small
                if (rejectSize <= 10) {
                    rejectBtn.disabled = true;
                    rejectBtn.style.opacity = "0.5";
                    rejectBtn.innerText = "Too late, you HAVE to say yes now 😉";
                }
            }
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
