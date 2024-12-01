let lastMouseX = null; // Last mouse X coordinate
let lastMouseY = null; // Last mouse Y coordinate
let mouseMovementCount = 0; // Counter for mouse movements
let mousePathLength = 0; // Total distance moved by mouse cursor
let mouseMovementCoordinates = []; // Array to store mouse coordinates
let hoverStartTime = null; // Start time for hover
let mouseHoverTimeTextBox = 0; // Total hover time over text box
let mouseHoverTimeSubmitButton = 0; // Total hover time over submit button
let focusChangeCount = 0; // Count of focus changes
let errorCorrections = 0; // Count of corrections made
let sessionStartTime = performance.now(); // Start time of the session

function getScreenResolution() {
    const width = window.screen.width;
    const height = window.screen.height;
    return `${width} x ${height}`;
}

function getOS() {
    const userAgent = navigator.userAgent;
    let os = "Unknown OS";
    if (userAgent.indexOf("Win") !== -1) os = "Windows";
    else if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
    else if (userAgent.indexOf("X11") !== -1 || userAgent.indexOf("Linux") !== -1) os = "Linux";
    else if (userAgent.indexOf("Android") !== -1) os = "Android";
    else if (userAgent.indexOf("like Mac") !== -1) os = "iOS";
    return os;
}

let ipData = {}; // Variable to store IP data

// Fetch the IP address from the API
fetch("https://ipinfo.io/json")
    .then(response => response.json())
    .then(data => {
        ipData = data; // Store the IP data
        console.log("IP Address:", ipData.ip);
        console.log("IP Information:", ipData);
    })
    .catch(error => {
        console.error("Error fetching IP address:", error);
    });

// Mouse movement tracking
document.addEventListener('mousemove', function(event) {
    mouseMovementCount++; // Increment the mouse movement count

    if (lastMouseX !== null && lastMouseY !== null) {
        const dx = event.clientX - lastMouseX;
        const dy = event.clientY - lastMouseY;
        mousePathLength += Math.sqrt(dx * dx + dy * dy); // Calculate distance moved

        // Store coordinates every 10 movements
        if (mouseMovementCount % 10 === 0) {
            mouseMovementCoordinates.push({ x: event.clientX, y: event.clientY });
        }
        
        // Check for linearity
        isLinearMovement = Math.abs(dx) > Math.abs(dy) ? Math.abs(dy) < 10 : Math.abs(dx) < 10;
    }

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

// Mouse hover events for elements
const hoverableElements = document.querySelectorAll('.puzzle-piece, #verify-btn, #refresh-btn');

hoverableElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
        hoverStartTime = performance.now(); // Start hover timer
    });

    element.addEventListener('mouseleave', function() {
        const hoverEndTime = performance.now(); // End hover timer
        if (element.id === 'verify-btn') {
            mouseHoverTimeSubmitButton += (hoverEndTime - hoverStartTime); // Add hover time for submit button
        } else {
            mouseHoverTimeTextBox += (hoverEndTime - hoverStartTime); // Add hover time for text box
        }
    });
});

// Function to collect data and send it after verification
function collectAndSendData(totalCharactersTyped, totalTypingDuration, averageInterKeyDelay, averageIdleTime, timeToStartTyping, clickPrecision, clickSpeed, typingSpeed, timeDifferences) {
    const sessionDuration = performance.now() - sessionStartTime; // Session duration in ms

    const dataToSend = {
        screenResolution: getScreenResolution(),
        operatingSystem: getOS(),
        ipAddress: ipData.ip || "N/A",
        ipInformation: ipData,
        timeTaken: sessionDuration / 1000, // Convert to seconds
        totalCharactersTyped,
        totalTypingDuration,
        averageInterKeyDelay,
        averageIdleTime,
        timeToStartTyping,
        clickPrecision,
        clickSpeed,
        mousePathLength,
        isLinearMovement,
        mouseHoverTimeTextBox,
        mouseHoverTimeSubmitButton,
        focusChangeTime: focusChangeCount * 1000, // Example calculation for focus change time in ms
        errorCorrectionRate: ((errorCorrections / totalCharactersTyped) * 100).toFixed(2),
        mouseMovementCoordinates,
        keyHoldTimes: [], // Populate this array as needed based on your application logic.
        typingSpeed,
        timeDifferences,
    };

    // Send data to backend API
    fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(result => {
        console.log("Data submitted successfully:", result);
    })
    .catch(error => {
        console.error("Error submitting data:", error);
    });
}

// Focus change tracking
document.addEventListener('focusin', function() {
   focusChangeCount++; 
});

// Error correction tracking (example usage)
document.addEventListener('keydown', function(event) {
   if (event.key === 'Backspace') { 
       errorCorrections++; 
   }
});