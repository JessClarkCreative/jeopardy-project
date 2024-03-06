// Excessive comments for my own learning :P

// Set the number of categories and questions per category
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
// Variable to track whether the game has been started
let gameStarted = false; 

// Function to grab shuffled category IDs for the game
function getCategoryIds() {
  try {
    // List of all available category IDs
    const allCategoryIds = [
      2, 3, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18
    ];

    // Check if there are enough categories available
    if (allCategoryIds.length < NUM_CATEGORIES) {
      console.error("Not enough categories available.");
      return [];
    }

    // Shuffle the array
    const shuffledCategoryIds = shuffleArray(allCategoryIds);
    // Return the required number of categories
    return shuffledCategoryIds.slice(0, NUM_CATEGORIES);
  } catch (error) {
    console.error("Error getting category ids:", error);
    return [];
  }
}

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements to shuffle the array
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to remove HTML tags from a string
function stripHtmlTags(inputString) {
  // Create a temporary div element to parse HTML
  const tempElement = document.createElement('div');
  // Set the input string as innerHTML to parse it
  tempElement.innerHTML = inputString;
  // Return the text content without HTML tags
  return tempElement.innerText;
}

// Async function to fetch category data from the API
async function getCategory(catId) {
  try {
    // Get category data from the API
    const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
    
    console.log("Full API Response:", response);

    // Check if the API response has the expected data structure
    if (!response.data || !response.data.id || !response.data.title || !response.data.clues || !Array.isArray(response.data.clues)) {
      throw new Error(`Invalid data structure in the API response for category id: ${catId}`);
    }

    // Extract relevant data from the API response
    const categoryTitle = response.data.title;
    // Map the clues, removing HTML tags from answers using stripHtmlTags function
    const clues = response.data.clues.map(qa => ({
      question: qa.question,
      answer: stripHtmlTags(qa.answer),
      showing: null
    }));

    return {
      title: categoryTitle,
      clues
    };
  } catch (error) {
    console.error(`Error getting category data for id ${catId}: ${error.message}`);
    throw error;
  }
}

// Async function to fill the game table with categories and questions
async function fillTable() {
  try {
    let categories = [];
    const table = document.getElementById("jeopardy");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Get category data and populate the categories array
    const categoryIds = await getCategoryIds();
    categories = await Promise.all(categoryIds.map(catId => getCategory(catId)));

    // Create the header row with category titles
    const trHead = document.createElement("tr");
    for (const category of categories) {
      const th = document.createElement("th");
      // Display uppercase category title in the header
      th.textContent = category.title.toUpperCase();
      th.classList.add("header-cell");
      trHead.appendChild(th);
    }
    thead.appendChild(trHead);

    // Create rows for each question in each category
    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
      const tr = document.createElement("tr");
      for (const category of categories) {
        const td = document.createElement("td");
        const clue = category.clues[i];
        // Display "?" in the table cell
        td.textContent = "?";
        // Add a click event listener for each cell to handle clicks
        td.addEventListener("click", (evt) => handleClick(evt, clue));
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    // Clear the table and append the header and body
    table.innerHTML = '';
    table.appendChild(thead);
    table.appendChild(tbody);
  } catch (error) {
    console.error("Error filling table:", error);
    throw error;
  }
}

// Function to handle click events on table cells
function handleClick(evt, clue) {
  const td = evt.target;

  // Check if the clue object has a click counter property
  if (!clue.hasOwnProperty('clickCounter')) {
    // If not, initialize click counter to 0
    clue.clickCounter = 0;
  }

  // Determine what to display based on the click counter
  if (clue.clickCounter === 0) {
    // Display the question on the first click
    td.textContent = clue.question;
  } else if (clue.clickCounter === 1) {
    // Display the answer on the second click
    td.textContent = clue.answer;
    // Remove the click event listener after the answer is shown
    td.removeEventListener("click", handleClick);
    // Add a "clicked" class for styling purposes
    td.classList.add("clicked");
  }

  // Increment the click counter
  clue.clickCounter += 1;
}

// Function to display a loading view in the table
function showLoadingView() {
  const table = document.getElementById("jeopardy");
  // Clear the table content to show a loading view
  table.innerHTML = ""; 
}

// Async function to set up and start the game
async function setupAndStart() {
    // Display a loading view before setting up the game
    showLoadingView();
    try {
      // If the game has not started yet, set up and start the game
      if (!gameStarted) {
        // Get category IDs and fetch category data asynchronously
        const categoryIds = await getCategoryIds();
        categories = await Promise.all(categoryIds.map(catId => getCategory(catId)));
        // Fill the game table with categories and questions
        await fillTable();
        gameStarted = true; // Update the game state
        document.getElementById("restart-button").setAttribute("data-game-started", "true");
      } else {
        // If the game has started, simply restart the game
        await fillTable();
      }
    } catch (error) {
      console.error("Error setting up and starting game:", error);
    }
}

// Event listener to start the game on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    const restartButton = document.getElementById("restart-button");
    // Add a click event listener to the restart button to set up and start the game
    restartButton.addEventListener("click", setupAndStart);
});

// Event listener to start the game on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const restartButton = document.getElementById("restart-button");
  // Add a click event listener to the restart button to set up and start the game
  restartButton.addEventListener("click", setupAndStart);
});