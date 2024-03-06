let categories = [];

const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

async function getCategoryIds() {
  try {
    const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/categories?count=${NUM_CATEGORIES}`);
    return response.data.map(category => category.id);
  } catch (error) {
    console.error("Error getting category ids:", error);
  }
}

async function getCategory(catId) {
  try {
    const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);

    console.log("Full API Response:", response); 

    if (!response.data || !response.data.id || !response.data.title || !response.data.clues || !Array.isArray(response.data.clues)) {
      throw new Error("Invalid data structure in the API response");
    }

    const categoryTitle = response.data.title;
    const clues = response.data.clues.map(qa => ({ question: qa.question, answer: qa.answer, showing: null }));

    return { title: categoryTitle, clues };
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
  
      const trHead = document.createElement("tr");
      for (const catId of categoryIds) {
        const category = await getCategory(catId);
        const th = document.createElement("th");
        th.textContent = category.title;
        trHead.appendChild(th);
      }
      thead.appendChild(trHead);
  
      for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
        const tr = document.createElement("tr");
        for (const catId of categoryIds) {
          const td = document.createElement("td");
          td.textContent = "?";
          td.addEventListener("click", handleClick);
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
  
function handleClick(evt) {
    const td = evt.target;
    const row = td.parentElement.rowIndex - 1;
    const col = td.cellIndex;
  
    const category = categories[col];
    const clue = category.clues[row];
  
    if (!clue.hasOwnProperty('clickCounter')) {
      clue.clickCounter = 0;
    }
  
    if (clue.clickCounter === 0) {
      td.textContent = clue.question;
    } else if (clue.clickCounter === 1) {
      td.textContent = clue.answer;
      td.removeEventListener("click", handleClick);
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
  