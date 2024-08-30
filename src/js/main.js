// data states for lift, floor and requests
let lifts = [];
let floors = [];
let liftRequests = [];

function generateSimulation() {
  const numLifts = parseInt(document.getElementById("numLifts").value);
  const numFloors = parseInt(document.getElementById("numFloors").value);
  const buildingContainer = document.getElementById("building-container");
  const liftsContainer = document.getElementById("lifts-container");
  buildingContainer.innerHTML = "";
  liftsContainer.innerHTML = "";
  lifts = [];
  floors = [];
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
    lifts.push({ element: lift, currentFloor: 0, isBusy: false });
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
  liftRequests.push({ floor: floorNum, direction });
  processLiftRequests();
}

function processLiftRequests() {
  if (liftRequests.length === 0) return;

  const availableLift = lifts.find((lift) => !lift.isBusy);
  if (availableLift) {
    const request = liftRequests.shift();
    moveLift(availableLift, request.floor);
  }
}

function moveLift(lift, targetFloor) {
  // If the lift is already on the target floor, do nothing
  lift.isBusy = true;
  const distance = Math.abs(targetFloor - lift.currentFloor);
  const speedPerFloor = 2000; // per floor 2 seconds
  const totalTravelTime = distance * speedPerFloor; // Total time to travel to the target floor

  // Calculate the bottom position based on the target floor (adding 5px offset)
  const floorHeight = 100; 
  lift.element.style.transition = `bottom ${totalTravelTime}ms ease-in-out`; // Dynamic transition time
  lift.element.style.bottom = `${targetFloor * floorHeight + 5}px`; // Move lift

  // Update the lift's current floor after moving
  lift.currentFloor = targetFloor;

  // Wait for the lift to reach the target floor before opening doors
  setTimeout(() => {
    openDoors(lift); 
    setTimeout(() => {
      closeDoors(lift); 
      setTimeout(() => {
        lift.isBusy = false; // Mark the lift as available after doors close
        processLiftRequests(); // Process any pending lift requests
      }, 2500); 
    }, 2500); 
  }, totalTravelTime); // Wait for the lift to move to the target floor
}

function openDoors(lift) {
    console.log("Opening doors for lift:", lift); // Debugging statement
    const leftDoor = lift.element.querySelector('.lift-door.left');
    const rightDoor = lift.element.querySelector('.lift-door.right');
    leftDoor.classList.add('open');
    rightDoor.classList.add('open');
}

function closeDoors(lift) {
  const leftDoor = lift.element.querySelector(".lift-door.left");
  const rightDoor = lift.element.querySelector(".lift-door.right");
  leftDoor.classList.remove("open");
  rightDoor.classList.remove("open");
}

// Initial generation
generateSimulation();
