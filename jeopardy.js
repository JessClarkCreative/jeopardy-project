let categories = [];

const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

function getCategoryIds() {
  try {
    const allCategoryIds = [
      2, 3, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18
    ];

    if (allCategoryIds.length < NUM_CATEGORIES) {
      console.error("Not enough categories available.");
      return [];
    }

    const shuffledCategoryIds = shuffleArray(allCategoryIds);

    return shuffledCategoryIds.slice(0, NUM_CATEGORIES);
  } catch (error) {
    console.error("Error getting category ids:", error);
    return [];
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function stripHtmlTags(inputString) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = inputString;
    return tempElement.innerText;
  }
  

  async function getCategory(catId) {
    try {
      const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
  
      console.log("Full API Response:", response);
  
      if (!response.data || !response.data.id || !response.data.title || !response.data.clues || !Array.isArray(response.data.clues)) {
        throw new Error("Invalid data structure in the API response");
      }
  
      const categoryTitle = response.data.title;
      const clues = response.data.clues.map(qa => ({
        question: qa.question,
        answer: stripHtmlTags(qa.answer), // Use the stripHtmlTags function here
        showing: null
      }));
  
      return {
        title: categoryTitle,
        clues
      };
    } catch (error) {
      console.error("Error getting category data:", error);
    }
  }
  

async function fillTable() {
    try {
      const table = document.getElementById("jeopardy");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");
  
      const categoryIds = await getCategoryIds();
      categories = await Promise.all(categoryIds.map(catId => getCategory(catId)));
  
      const trHead = document.createElement("tr");
      for (const category of categories) {
        const th = document.createElement("th");
        th.textContent = category.title;
        th.classList.add("header-cell");
        trHead.appendChild(th);
      }
      thead.appendChild(trHead);
  
      for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
        const tr = document.createElement("tr");
        for (const category of categories) {
          const td = document.createElement("td");
          const clue = category.clues[i];
          td.textContent = "?";
          td.addEventListener("click", (evt) => handleClick(evt, clue));
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
  
      table.innerHTML = '';
      table.appendChild(thead);
      table.appendChild(tbody);
    } catch (error) {
      console.error("Error filling table:", error);
    }
}

function handleClick(evt, clue) {
    const td = evt.target;
  
    if (!clue.hasOwnProperty('clickCounter')) {
      clue.clickCounter = 0;
    }
  
    if (clue.clickCounter === 0) {
      td.textContent = clue.question;
    } else if (clue.clickCounter === 1) {
      td.textContent = clue.answer;
      td.removeEventListener("click", (evt) => handleClick(evt, clue));
      td.classList.add("clicked"); // Add the clicked class here
    }
  
    clue.clickCounter += 1;
  }
  

  

function showLoadingView() {
  const table = document.getElementById("jeopardy");
  table.innerHTML = ""; 
}

async function setupAndStart() {
  showLoadingView();
  try {
    const categoryIds = await getCategoryIds();
    categories = await Promise.all(categoryIds.map(catId => getCategory(catId)));
    await fillTable();
  } catch (error) {
    console.error("Error setting up and starting game:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", setupAndStart);
  
  });
  