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

           if (rejectCount === 3) {
                alert("Nooo please reconsider 😢");
            } else if (rejectCount >= 4) {
                rejectBtn.disabled = true;
                rejectBtn.style.opacity = "0.5";
                rejectBtn.innerText = "Too late, you HAVE to say yes now 😉";

                // Delay before showing a final cute message (but no reload)
                setTimeout(() => {
                    alert("Guess there's no escape now... 💕");
                }, 1000); // 1 second delay

               // Second delayed alert (after 5 seconds)
                setTimeout(() => {
                    alert("But if you really are busy, please tell me 😢");
                }, 5000); // 5 seconds delay
            } else {
                alert("Are you sure? 😢");

                // Increase accept button size
                let acceptSize = parseFloat(window.getComputedStyle(acceptBtn).fontSize);
                acceptBtn.style.fontSize = (acceptSize + 5) + "px";
                acceptBtn.style.padding = (acceptSize + 5) + "px " + (acceptSize + 10) + "px";

                // Decrease reject button size (including padding)
                let rejectSize = parseFloat(window.getComputedStyle(rejectBtn).fontSize);
                let newRejectSize = Math.max(10, rejectSize - 3); // Prevents it from going too small
                let newPadding = Math.max(5, rejectSize - 5) + "px " + Math.max(10, rejectSize - 10) + "px";

                rejectBtn.style.fontSize = newRejectSize + "px";
                rejectBtn.style.padding = newPadding;
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
