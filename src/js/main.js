// Data states for lift, floor, and requests
let liftsUp = [];
let liftsDown = [];
let floors = [];
let floorRequests = {}; // To track active requests per floor
let liftRequests = [];

function generateSimulation() {
  const numLifts = parseInt(document.getElementById("numLifts").value);
  const numFloors = parseInt(document.getElementById("numFloors").value);

   // Input validation: Check if numLifts is less than 1 or numFloors is less than 2
   if (isNaN(numLifts) || numLifts < 1) {
    alert("Number of lifts have to be greater than or equal to 1.");
    return;
  }
  if (isNaN(numFloors) || numFloors < 1) {
    alert("Number of floors have to be greater than or equal to 1.");
    return;
  }

  const buildingContainer = document.getElementById("building-container");
  const liftsContainer = document.getElementById("lifts-container");
  buildingContainer.innerHTML = "";
  liftsContainer.innerHTML = "";
  liftsUp = [];
  liftsDown = [];
  floors = [];
  floorRequests = {}; // Reset requests per floor
  liftRequests = [];

  // Create building structure
  const building = document.createElement("div");
  building.className = "building";
  buildingContainer.appendChild(building);

  // Generate floors
  for (let i = 0; i < numFloors; i++) {
    const floor = document.createElement("div");
    floor.className = "floor";
    floor.innerHTML = `
            <span class="floor-number">Floor ${i}</span>
            <div class="buttons">
                <button onclick="callLift(${i}, 'up')" ${
      i === numFloors - 1 ? "disabled" : ""
    }> Up ▲</button>
                <button onclick="callLift(${i}, 'down')" ${
      i === 0 ? "disabled" : ""
    }> Down ▼</button>
            </div>
        `;
    building.appendChild(floor);
    floors.push(floor);

    // Initialize request tracking for each floor
    floorRequests[i] = { up: false, down: false };
  }

  // Create lift shafts container
  const liftShafts = document.createElement("div");
  liftShafts.className = "lift-shafts-container";
  liftShafts.style.width = `${numLifts * 100}px`;
  liftsContainer.appendChild(liftShafts);

  // Generate lifts
  for (let i = 0; i < numLifts; i++) {
    const liftShaft = document.createElement("div");
    liftShaft.className = "lift-shaft";
    liftShaft.style.height = `${numFloors * 100}px`;
    const lift = document.createElement("div");
    lift.className = "lift";
    lift.id = `lift-${i}`;
    lift.innerHTML = `
            <div class="lift-door left"></div>
            <div class="lift-door right"></div>
        `;
    liftShaft.appendChild(lift);
    liftShafts.appendChild(liftShaft);

    // Assign first half of lifts to handle "Up" requests, the second half to "Down"
    if (i % 2 === 0) {
      liftsUp.push({ element: lift, currentFloor: 0, isBusy: false });
    } else {
      liftsDown.push({ element: lift, currentFloor: 0, isBusy: false });
    }
  }

  // Synchronize scrolling
  buildingContainer.onscroll = function () {
    liftsContainer.scrollTop = buildingContainer.scrollTop;
  };
  liftsContainer.onscroll = function () {
    buildingContainer.scrollTop = liftsContainer.scrollTop;
  };
}

function callLift(floorNum, direction) {
  // Check if there's already an active request in this direction for this floor
  if (floorRequests[floorNum][direction]) {
    console.log(`Request for ${direction} already active on floor ${floorNum}`);
    return; // Ignore duplicate request
  }

  // Mark the request as active
  floorRequests[floorNum][direction] = true;
  liftRequests.push({ floor: floorNum, direction });
  console.log(`New ${direction} request added for floor ${floorNum}`);
  processLiftRequests();
}

function processLiftRequests() {
  if (liftRequests.length === 0) return; // No requests to process

  const request = liftRequests.shift(); // Get the next request
  const { floor, direction } = request;

  let availableLifts = direction === "up" ? liftsUp : liftsDown;
  if (availableLifts.length === 0) {
    availableLifts = liftsUp.concat(liftsDown);
  }

  // Check if there is a lift already at the requested floor and not busy
  const liftAtFloor = availableLifts.find(
    (lift) => lift.currentFloor === floor && !lift.isBusy
  );

  if (liftAtFloor) {
    // If a lift is already at the requested floor and is not busy, use it
    liftAtFloor.isBusy = true; // Mark as busy to avoid conflicts
    openDoors(liftAtFloor);
    setTimeout(() => {
      closeDoors(liftAtFloor);
      setTimeout(() => {
        liftAtFloor.isBusy = false; // Mark the lift as available after doors close
        console.log(`Request for ${direction} cleared on floor ${floor}`);
        floorRequests[floor][direction] = false; // Reset request for the direction
        processLiftRequests(); // Process any pending lift requests
      }, 2500);
    }, 2500);
  } else {
    // If no lift is present at the requested floor, find the nearest available lift
    const availableLift = availableLifts.find((lift) => !lift.isBusy);

    if (availableLift) {
      moveLift(availableLift, floor, direction);
    } else {
      // If no lift is available, push the request back to the queue and wait
      liftRequests.push(request); // Add request back to the end
      setTimeout(processLiftRequests, 1000); // Retry processing after a delay
    }
  }
}

function moveLift(lift, targetFloor, direction) {
  lift.isBusy = true;

  const distance = Math.abs(targetFloor - lift.currentFloor);
  const speedPerFloor = 2000; // 2 seconds per floor
  const totalTravelTime = distance * speedPerFloor; // Total time to travel to the target floor

  // Calculate the bottom position based on the target floor (adding 5px offset)
  const floorHeight = 100;
  lift.element.style.transition = `bottom ${totalTravelTime}ms ease-in-out`; // Dynamic transition time
  lift.element.style.bottom = `${targetFloor * floorHeight + 5}px`; // Move lift

  // Wait for the lift to reach the target floor before opening doors
  setTimeout(() => {
    lift.currentFloor = targetFloor; // Update the lift's current floor
    openDoors(lift);
    setTimeout(() => {
      closeDoors(lift);
      setTimeout(() => {
        lift.isBusy = false; // Mark the lift as available after doors close
        floorRequests[targetFloor][direction] = false; // Reset request for the direction
        console.log(`Request for ${direction} cleared on floor ${targetFloor}`); 
        processLiftRequests(); // Process any pending lift requests
      }, 2500);
    }, 2500);
  }, totalTravelTime); 
}

function openDoors(lift) {
  console.log("Opening doors for lift:", lift);
  const leftDoor = lift.element.querySelector(".lift-door.left");
  const rightDoor = lift.element.querySelector(".lift-door.right");
  leftDoor.classList.add("open");
  rightDoor.classList.add("open");
}

function closeDoors(lift) {
  const leftDoor = lift.element.querySelector(".lift-door.left");
  const rightDoor = lift.element.querySelector(".lift-door.right");
  leftDoor.classList.remove("open");
  rightDoor.classList.remove("open");
}

// generateSimulation();
