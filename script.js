let map;
let placesService;
let markers = [];
let directionsService;
let directionsRenderer;
let infoWindow; // New info window for details

// Page toggle utility
function togglePageVisibility(pagesToShow = [], pagesToHide = []) {
    pagesToShow.forEach((page) => {
        page.style.display = "block";
        page.classList.add("show");
        page.classList.remove("hide");
    });
    pagesToHide.forEach((page) => {
        page.style.display = "none";
        page.classList.add("hide");
        page.classList.remove("show");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded triggered");

    const acceptBtn = document.getElementById("accept-btn");
    const rejectBtn = document.getElementById("reject-btn");
    const itineraryPage = document.getElementById("itineraryPage");
    const invitationPage = document.getElementById("invitationPage");
    const mapElement = document.getElementById("map");
    const submitButton = document.querySelector(".submit-btn");

    let rejectCount = 0; // Counter for tracking rejection clicks
    
    // Accept Button Logic
    if (acceptBtn && itineraryPage && invitationPage) {
        acceptBtn.addEventListener("click", function () {
            alert("Yay! Can't wait for our special date! 💖");
            togglePageVisibility([itineraryPage], [invitationPage]);

            // Initialise the map when the itinerary page is shown
            if (mapElement && !map) {
                initMap();
            }
        });
    }

    // Step 2: Submit Button Logic (Redirects to confirmationPage)
    if (submitButton) {
        submitButton.addEventListener("click", function (event) {
            event.preventDefault();

            const selectedActivities = [];
            document.querySelectorAll(".itinerary-item.selected").forEach((item) => {
                const inputElement = item.querySelector("input[type='checkbox']");
                if (inputElement) {
                    selectedActivities.push(inputElement.value);
                }
            });

            if (selectedActivities.length === 0) {
                alert("Please select at least one activity!");
                return;
            }

            // Add alert with selections
            alert("You have selected: " + selectedActivities.join(", "));

            // Redirect to confirmation.html with activities in query string
            const activitiesParam = encodeURIComponent(selectedActivities.join(","));
            window.location.href = `confirmation.html?activities=${activitiesParam}`;
        });
    }

    // Reject Button Logic
    if (rejectBtn) {
        rejectBtn.addEventListener("click", function () {
            rejectCount++;
            handleRejection(rejectBtn, rejectCount);
        });
    }

    // Old Submit Button Logic Here
    

    // Event delegation for itinerary selection
    document.addEventListener("click", function (event) {
        let item = event.target.closest(".itinerary-item");
        if (!item) return;

        // Prevent issues with checkbox clicks
        if (event.target.tagName === "INPUT") return;

        // Manually toggle the checkbox and selection state
        let checkbox = item.querySelector("input[type='checkbox']");
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
        }
        toggleSelection(item);
    });

    // Call hideDetailsPanel whenever an activity is toggled
    document.addEventListener("click", function () {
        hideDetailsPanel();
    });
});

// Handle rejection clicks
function handleRejection(rejectBtn, rejectCount) {
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

        let acceptBtn = document.getElementById("accept-btn");
        let acceptSize = parseFloat(window.getComputedStyle(acceptBtn).fontSize);
        acceptBtn.style.fontSize = (acceptSize + 5) + "px";
        acceptBtn.style.padding = (acceptSize + 5) + "px " + (acceptSize + 10) + "px";

        let rejectSize = parseFloat(window.getComputedStyle(rejectBtn).fontSize);
        let newRejectSize = Math.max(10, rejectSize - 3);
        rejectBtn.style.fontSize = newRejectSize + "px";
    }
}

// Initialise Google Map
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

// Toggle selection of itinerary items old position
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

    let placeName = item.getAttribute("data-place");
    if (placeName) {
        if (checkbox.checked) {
            updateMap(placeName); // Update map with the latest selected place
        } else {
            // If the latest selected place is unselected, hide the details panel
            if (latestSelectedPlaceId === placeName) {
                hideDetailsPanel();
            }

            updateMap(); // Recalculate map bounds and markers
        }
    } else {
        console.error("No place name found for selected item.");
    }
}

// Update the map based on selected places
let latestSelectedPlaceId = null; // Track the most recently selected placeId

function updateMap(selectedPlaceName) {
    clearMarkers();
    let selectedItems = document.querySelectorAll(".itinerary-item.selected");
    let bounds = new google.maps.LatLngBounds();

    if (selectedItems.length === 0) {
        console.log("No activities selected. Resetting to default London view.");
        map.setCenter({ lat: 51.5074, lng: -0.1278 });
        map.setZoom(12);

        hideDetailsPanel(); // Hide details if nothing is selected
        return;
    }

    selectedItems.forEach((item) => {
        let placeName = item.getAttribute("data-place");
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
                            scaledSize: new google.maps.Size(25, 25),
                        },
                    });

                    markers.push(marker);
                    bounds.extend(position);

                    // If the selectedPlaceName matches this place, update details panel
                    if (placeName === selectedPlaceName) {
                        latestSelectedPlaceId = placeId; // Update the latest selected placeId
                        getPlaceDetails(placeId); // Fetch and show details
                        map.panTo(position);
                        map.setZoom(14);
                    }

                    // Add click listener to the marker to show details on click
                    marker.addListener("click", function () {
                        latestSelectedPlaceId = placeId; // Update the latest selected placeId
                        getPlaceDetails(placeId); // Show details for clicked marker
                    });
                } else {
                    console.error("Failed to retrieve place:", status);
                }
            }
        );
    });

    // Optional: Auto-zoom out to fit all markers after 10 seconds
    if (selectedItems.length > 1) {
        setTimeout(() => {
            map.fitBounds(bounds); // Zoom out to fit all markers
        }, 10000); // 10-second delay
    }
}

// Fetch place details and display them
function getPlaceDetails(placeId) {
    placesService.getDetails(
        { placeId, fields: ["name", "rating", "user_ratings_total", "formatted_address", "website"] },
        function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                let detailsDiv = document.getElementById("place-details");
                if (!detailsDiv) {
                    console.error("Place details div not found!");
                    return;
                }

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

// Hide details panel when no activities are selected
function hideDetailsPanel() {
    let detailsDiv = document.getElementById("place-details");

    // Hide details panel only if there are no selected items
    if (detailsDiv) {
        detailsDiv.style.display = "none";
        detailsDiv.innerHTML = ""; // Clear the content
    }

    latestSelectedPlaceId = null; // Reset the latest selected place
}


// Clear all markers from the map
function clearMarkers() {
    if (Array.isArray(markers)) {
        markers.forEach((marker) => marker.setMap(null));
        markers = [];
    }
}

// Reset itinerary page selections and map
function resetItineraryPage() {
    document.querySelectorAll(".itinerary-item.selected").forEach((item) => {
        item.classList.remove("selected");
        const checkbox = item.querySelector("input[type='checkbox']");
        if (checkbox) checkbox.checked = false;
    });

    clearMarkers();
    if (map) {
        map.setCenter({ lat: 51.5074, lng: -0.1278 });
        map.setZoom(12);
    }

    const detailsDiv = document.getElementById("place-details");
    if (detailsDiv) detailsDiv.style.display = "none";
}

// Submit itinerary selections (Old)
