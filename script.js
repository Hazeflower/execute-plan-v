let map;
let markers = [];
let directionsService;
let directionsRenderer;

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
    
    // Add event listener for submit button
    const submitButton = document.querySelector(".submit-btn");
    if (submitButton) {
        submitButton.removeEventListener("click", submitSelection); // Prevent duplicate event binding
        submitButton.addEventListener("click", submitSelection);
    }
});

// **Initialize Google Map**
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.5074, lng: -0.1278 }, // London as the base map
        zoom: 12,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
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

    updateMap();
}

// **Update Google Map with selected locations**
function updateMap() {
    clearMarkers();

    let selectedItems = document.querySelectorAll(".itinerary-item.selected");
    let bounds = new google.maps.LatLngBounds();
    
    selectedItems.forEach(item => {
        let lat = parseFloat(item.getAttribute("data-lat"));
        let lng = parseFloat(item.getAttribute("data-lng"));
        if (!isNaN(lat) && !isNaN(lng)) {
            let position = { lat, lng };
            let marker = new google.maps.Marker({
                position,
                map,
                title: item.innerText,
            });
            markers.push(marker);
            bounds.extend(position);
        }
    });

    if (markers.length > 0) {
        map.fitBounds(bounds);
    }
}

// **Clear all markers from map**
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Submit selection function
function submitSelection(event) {
    event.preventDefault(); // Prevent any accidental multiple triggers
    
    let selectedActivities = [];
    document.querySelectorAll(".itinerary-item.selected").forEach(item => {
        let inputElement = item.querySelector("input[type='checkbox']");
        if (inputElement) {
            selectedActivities.push(inputElement.value);
        }
    });

    if (selectedActivities.length > 0) {
        alert("You have selected: " + selectedActivities.join(", "));
        showRoute();
    } else {
        alert("Please select at least one activity!");
    }
}

// **Show route between selected locations (Future Improvement)**
function showRoute() {
    let selectedItems = document.querySelectorAll(".itinerary-item.selected");
    if (selectedItems.length < 2) return;

    let waypoints = [];
    selectedItems.forEach((item, index) => {
        let lat = parseFloat(item.getAttribute("data-lat"));
        let lng = parseFloat(item.getAttribute("data-lng"));
        if (!isNaN(lat) && !isNaN(lng) && index !== 0 && index !== selectedItems.length - 1) {
            waypoints.push({
                location: { lat, lng },
                stopover: true,
            });
        }
    });

    let origin = {
        lat: parseFloat(selectedItems[0].getAttribute("data-lat")),
        lng: parseFloat(selectedItems[0].getAttribute("data-lng"))
    };
    
    let destination = {
        lat: parseFloat(selectedItems[selectedItems.length - 1].getAttribute("data-lat")),
        lng: parseFloat(selectedItems[selectedItems.length - 1].getAttribute("data-lng"))
    };

    let request = {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);
        } else {
            alert("Directions request failed. Please check locations.");
        }
    });
}
