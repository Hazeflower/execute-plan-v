let map;
let placesService;
let markers = [];
let directionsService;
let directionsRenderer;
let infoWindow; // New info window for details
let isSubmitting = false; // Prevent double execution

document.addEventListener("DOMContentLoaded", function() {
    const acceptBtn = document.getElementById("accept-btn");
    const rejectBtn = document.getElementById("reject-btn");
    const itineraryPage = document.getElementById("itineraryPage");
    const invitationPage = document.getElementById("invitationPage");
    const mapElement = document.getElementById("map");

    let rejectCount = 0; // Counter for tracking rejection clicks

    // Ensure elements exist before adding event listeners
    if (acceptBtn && itineraryPage && invitationPage) {
        acceptBtn.addEventListener("click", function() {
            alert("Yay! Can't wait for our special date! 💖");
            invitationPage.style.display = "none";
            itineraryPage.style.display = "block";

            // ✅ Only initialise the map when the itinerary page is shown
            if (mapElement && !map) {
                initMap();
            }
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

    // Event delegation for itinerary selection (more efficient & fixes selection issue)
    document.addEventListener("click", function (event) {
        let item = event.target.closest(".itinerary-item");
        if (!item) return; // Ensure only clicks inside the item are processed
    
        // Check if the click happened inside an interactive element
        if (event.target.tagName === "INPUT") return; // Avoid issues with checkboxes
    
        // Manually trigger the checkbox selection
        let checkbox = item.querySelector("input[type='checkbox']");
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
        }
    
        toggleSelection(item);
        });
       // **Ensure submit button listener is added only once**
        const submitButton = document.querySelector(".submit-btn");
        if (submitButton && !submitButton.dataset.listenerAdded) {
            submitButton.dataset.listenerAdded = true; // Mark listener as added
            submitButton.addEventListener("click", function (event) {
                event.preventDefault(); // Prevent form submission
                if (isSubmitting) return; // Avoid multiple clicks
                isSubmitting = true;
    
                submitSelection(event);
    
                setTimeout(() => {
                    isSubmitting = false; // Reset after 1 second
                }, 1000);
            });
        }
    });

// **Initialize Google Map**
function initMap() {
    if (!document.getElementById("map")) {
        console.error("Map element not found!");
        return;
    }
    
     map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 51.5074, lng: -0.1278 }, // Default to London
            zoom: 12,
        });
                              
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    placesService = new google.maps.places.PlacesService(map);
    infoWindow = new google.maps.InfoWindow();
}

// Toggle selection function
function toggleSelection(item) {
    item.classList.toggle("selected");

    let checkbox = item.querySelector("input[type='checkbox']");
    if (!checkbox) {
        console.error("Checkbox not found inside item:", item);
        return;
    }

    checkbox.checked = item.classList.contains("selected");

    let tick = item.querySelector(".tick");
    if (!tick) {
        console.error("Tick element not found inside item:", item);
        return;
    }

    tick.style.display = checkbox.checked ? "flex" : "none";

    // Debugging log
    console.log(`Clicked: ${item.innerText}, Selected: ${checkbox.checked}`);

    let placeName = item.getAttribute("data-place"); // Get place name instead of placeId
    if (placeName) {
        updateMap(placeName); // ✅ Ensure correct place is passed
    } else {
        console.error("No place name found for selected item.");
    }
}

// **Update Map dynamically using Place Names**
function updateMap() {
    clearMarkers();
    let selectedItems = document.querySelectorAll(".itinerary-item.selected");
    let bounds = new google.maps.LatLngBounds();

    if (selectedItems.length === 0) {
        console.log("No activities selected. Resetting to default London view.");
        map.setCenter({ lat: 51.5074, lng: -0.1278 });
        map.setZoom(12);
        return;
    }

    selectedItems.forEach(item => {
        let placeName = item.getAttribute("data-place"); // ✅ Correctly retrieve placeName
        if (!placeName) return;

        placesService.findPlaceFromQuery(
            { query: placeName, fields: ["name", "geometry", "place_id"] },
            function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
                    let position = results[0].geometry.location;
                    let placeId = results[0].place_id;
                    
                    let marker = new google.maps.Marker({
                        position,
                        map,
                        title: results[0].name,
                        icon: {
                            url: "https://raw.githubusercontent.com/Hazeflower/execute-plan-v/main/images/Heart%20marker.png",
                            scaledSize: new google.maps.Size(30, 30),
                        },
                    });

                    markers.push(marker);
                    bounds.extend(position);

                    // If there's only one selected place, use panTo + setZoom
                    if (selectedItems.length === 1) {
                        map.panTo(position);
                        map.setZoom(14);  // Zoom in when only one place is selected
                    } else {
                        map.fitBounds(bounds); // FitBounds for multiple places
                    }

                    // ✅ Fetch & update place details
                    getPlaceDetails(placeId);

                    marker.addListener("click", function () {
                        infoWindow.setContent(`<b>${results[0].name}</b>`);
                        infoWindow.open(map, marker);
                    });
                } else {
                    console.error("Failed to retrieve place:", status);
                }
            }
        );
    });
}
// **Function to Fetch Place Details**
function getPlaceDetails(placeId) {
    placesService.getDetails(
        { placeId, fields: ["name", "rating", "user_ratings_total", "formatted_address","website"] },
        function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                let detailsDiv = document.getElementById("place-details");
                if (!detailsDiv) {
                    console.error("Place details div not found!");
                    return;
                }

                // ✅ Show panel when a place is selected
                detailsDiv.style.display = "block"; 
                detailsDiv.innerHTML = `
                    <div class="details-container">
                        <h3>${place.name}</h3>
                        <p><strong>Rating:</strong> ${place.rating} ⭐ (${place.user_ratings_total} reviews)</p>
                        <p><strong>Address:</strong> ${place.formatted_address}</p>
                        ${place.website ? `<p><strong>Website:</strong> <a href="${place.website}" target="_blank">Click for more details</a></p>` : ""}
                    </div>
                `;
            } else {
                console.error("Failed to retrieve place details:", status);
            }
        }
    );
}

// Ensure panel disappears when nothing is selected
function hideDetailsPanel() {
    let selectedItems = document.querySelectorAll(".itinerary-item.selected");
    let detailsDiv = document.getElementById("place-details");

    if (selectedItems.length === 0 && detailsDiv) {
        detailsDiv.style.display = "none"; // ✅ Hide panel when no activities are selected
    }
}

// Call hideDetailsPanel whenever an activity is toggled
document.addEventListener("click", function () {
    hideDetailsPanel();
});

// **Clear all markers from map**
function clearMarkers() {
    if (Array.isArray(markers)) {
        markers.forEach(marker => marker.setMap(null));
        markers = [];
    }
}

// Submit selection function
function submitSelection(event) {
    console.log("submitSelection function triggered");
    
    let selectedActivities = [];
    document.querySelectorAll(".itinerary-item.selected").forEach(item => {
        let inputElement = item.querySelector("input[type='checkbox']");
        if (inputElement) {
            selectedActivities.push(inputElement.value);
        }
    });

    // ✅ Ensure user selects at least one activity
    if (selectedActivities.length === 0) {
        alert("Please select at least one activity!");
        return; // ⛔ Stop execution
    }

    alert("You have selected: " + selectedActivities.join(", "));
    
 // ✅ Ensure confirmationPage exists before using it
    const itineraryPage = document.getElementById("itineraryPage");
    const confirmationPage = document.getElementById("confirmationPage");
    const confirmationMessage = document.getElementById("confirmationMessage");

    // Ensure the required elements exist
    if (!itineraryPage || !confirmationPage || !confirmationMessage) {
    console.error("⚠️ Missing required elements: itineraryPage, confirmationPage, or confirmationMessage.");
    return;
    }

    // Update confirmation message content
    confirmationMessage.innerHTML = `
        <p>Activities selected: <strong>${selectedActivities.join(", ")}</strong>.</p>
    `;

    // ✅ Hide itinerary page & show confirmation page smoothly
    itineraryPage.style.display = "none";
    console.log("Itinerary Page hidden");
    
    confirmationPage.classList.add("show"); // Smooth transition
    console.log("Confirmation Page shown");

    console.log("Confirmation page displayed successfully with activities:", selectedActivities);

    // Reset the map
    clearMarkers();
    if (map) {
        map.setCenter({ lat: 51.5074, lng: -0.1278 });
        map.setZoom(12);
    }
}
