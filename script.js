document.addEventListener("DOMContentLoaded", function() {
    const acceptBtn = document.getElementById("accept-btn");
    const rejectBtn = document.getElementById("reject-btn");
    const itineraryPage = document.getElementById("itineraryPage");
    const invitationPage = document.getElementById("invitationPage");

    let rejectCount = 0; // Counter for tracking rejection clicks

    // Ensure elements exist before adding event listeners
    if (acceptBtn && itineraryPage && invitationPage) {
        acceptBtn.addEventListener("click", function() {
            alert("Yay! Can't wait for our special date! 💖");
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

                setTimeout(() => {
                    alert("Guess there's no escape now... 💕");
                }, 1000); 

                setTimeout(() => {
                    alert("But if you really are busy, please tell me 😢");
                }, 5000);
            } else {
                alert("Are you sure? 😢");

                // Increase accept button size
                let acceptSize = parseFloat(window.getComputedStyle(acceptBtn).fontSize);
                acceptBtn.style.fontSize = (acceptSize + 5) + "px";
                acceptBtn.style.padding = (acceptSize + 5) + "px " + (acceptSize + 10) + "px";

                // Decrease reject button size (including padding)
                let rejectSize = parseFloat(window.getComputedStyle(rejectBtn).fontSize);
                let newRejectSize = Math.max(10, rejectSize - 3);
                let newPadding = Math.max(5, rejectSize - 5) + "px " + Math.max(10, rejectSize - 10) + "px";

                rejectBtn.style.fontSize = newRejectSize + "px";
                rejectBtn.style.padding = newPadding;
            }
        });
    }

    // Add event listeners to itinerary selection
    document.querySelectorAll(".itinerary-item").forEach(item => {
        item.addEventListener("click", function () {
            toggleSelection(this); // Correctly toggle the selection
        });
    });


    // Add event listener for submit button
    const submitButton = document.querySelector(".submit-btn");
    if (submitButton) {
        submitButton.addEventListener("click", submitSelection);
    }
});

// Move these functions outside window.onload to ensure they are globally accessible
function toggleSelection(item) {
    item.classList.toggle("selected");

    let checkbox = item.querySelector("input[type='checkbox']");
    if (!checkbox) {
        console.error("Checkbox not found inside item:", item);
        return; // Exit function if checkbox is missing
    }

    checkbox.checked = !checkbox.checked;

    let tick = item.querySelector(".tick");
    if (!tick) {
        console.error("Tick element not found inside item:", item);
        return;
    }

    tick.style.display = checkbox.checked ? "flex" : "none"; 
}

function submitSelection() {
    let selectedActivities = [];
    document.querySelectorAll(".itinerary-item.selected").forEach(item => {
        selectedActivities.push(item.querySelector("input").value);
    });

    if (selectedActivities.length > 0) {
        alert("You have selected: " + selectedActivities.join(", "));
    } else {
        alert("Please select at least one activity!");
    }
}
