document.querySelector(".GenerateButton").addEventListener("click", function () {
    const floorNumber = parseInt(document.getElementById("floorNumber").value);
    const liftNumber = parseInt(document.getElementById("liftNumber").value);
    const outputPage = document.querySelector(".OutputPage");

    outputPage.innerHTML = "";

    // Generate Floors
    for (let floors = floorNumber; floors > 0; floors--) {
        const floorDiv = document.createElement("div");
        floorDiv.classList.add("floor");
        floorDiv.id = `floor-${floors}`;

        const floorLabel = document.createElement("label");
        floorLabel.innerText = `Floor ${floors}`;
        floorDiv.appendChild(floorLabel);

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        const upButton = document.createElement("button");
        upButton.innerText = "Up";
        upButton.classList.add("up");
        buttonContainer.appendChild(upButton);

        const downButton = document.createElement("button");
        downButton.innerText = "Down";
        downButton.classList.add("down");
        buttonContainer.appendChild(downButton);

        // Disable Up button for the topmost floor and Down button for the lowest floor
        if (floors === floorNumber) upButton.disabled = true; 
        if (floors === 1) downButton.disabled = true;

        // Add event listeners for the buttons
        upButton.addEventListener("click", () => moveLiftToFloor(floors));
        downButton.addEventListener("click", () => moveLiftToFloor(floors));

        floorDiv.appendChild(buttonContainer);
        outputPage.appendChild(floorDiv);
    }

    // Generate Lifts
    const liftContainer = document.createElement("div");
    liftContainer.classList.add("lift-container");
    outputPage.appendChild(liftContainer);

    for (let lifts = 0; lifts < liftNumber; lifts++) {
        const liftDiv = document.createElement("div");
        liftDiv.classList.add("lift");
        liftDiv.id = `lift-${lifts + 1}`;
        liftContainer.appendChild(liftDiv);
    }
});
