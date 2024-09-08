// Data states for lift, floor, and requests
let lifts = [];
let floors = [];
let floorRequests = {}; // To track active requests per floor

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
  lifts = [];
  floors = [];
  floorRequests = {}; // Reset requests per floor

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
               <button onclick="${numFloors >= 1 ? `callLift(${i}, 'up')` : ''}" ${
      i === numFloors - 1 ? "enabled" : ""
    }> Up ▲</button>
                <button onclick="${numFloors > 1 ? `callLift(${i}, 'down')` : ''}" ${
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

    // Create lift object with its own request queue
    const liftObj = {
      element: lift,
      currentFloor: 0,
      isBusy: false,
      queue: [], // Each lift has its own request queue
    };

    // Add lift to unified list
    lifts.push(liftObj);
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

  // Find the closest available lift in any direction
  const closestLift = findClosestAvailableLift(lifts, floorNum);
  if (closestLift) {
    closestLift.queue.push({ floor: floorNum, direction });
    console.log(`Assigned ${direction} request to lift at floor ${floorNum}`);
    processLiftRequests(closestLift); // Start processing this lift's queue if not already busy
  } else {
    console.log(`No available lifts for ${direction} request at floor ${floorNum}`);
  }
}

function findClosestAvailableLift(availableLifts, floorNum) {
  // Find the closest available lift that is not busy
  let closestLift = null;
  let minDistance = Infinity;
  
  for (const lift of availableLifts) {
    if (!lift.isBusy) {
      const distance = Math.abs(lift.currentFloor - floorNum);
      if (distance < minDistance) {
        minDistance = distance;
        closestLift = lift;
      }
    }
  }
  
  return closestLift;
}

function processLiftRequests(lift) {
  if (lift.isBusy || lift.queue.length === 0) return; // If the lift is busy or no requests in queue, do nothing

  lift.isBusy = true; // Mark lift as busy
  const request = lift.queue.shift(); // Get the next request from the lift's queue

  moveLift(lift, request.floor, request.direction); // Move the lift to the requested floor
}

function moveLift(lift, targetFloor, direction) {
  const distance = Math.abs(targetFloor - lift.currentFloor);
  const speedPerFloor = 2000; // 2 seconds per floor
  const totalTravelTime = distance * speedPerFloor; // Total time to travel to the target floor

  // Calculate the bottom position based on the target floor
  const floorHeight = 100;
  lift.element.style.transition = `bottom ${totalTravelTime}ms ease-in-out`; // Dynamic transition time
  lift.element.style.bottom = `${targetFloor * floorHeight}px`; // Move lift

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
        processLiftRequests(lift); // Continue processing this lift's queue
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

// Input fields to restrict input to numbers only
document.getElementById("numLifts").addEventListener("input", function(e) {
  this.value = this.value.replace(/[^0-9]/g, '');
});

document.getElementById("numFloors").addEventListener("input", function(e) {
  this.value = this.value.replace(/[^0-9]/g, '');
});

// Call the generateSimulation function when needed to set up the simulation
// generateSimulation();
