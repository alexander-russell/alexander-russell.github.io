let debugVar;


const xRowField = document.getElementById('xrows');
const xColField = document.getElementById('xcols');
const yRowField = document.getElementById('yrows');
const yColField = document.getElementById('ycols');
const formulaBox = document.querySelector(".formula")
const clickFormulaBox = document.querySelector(".click-formula")
const generateButton = document.querySelector('#go-button');
const page = document.querySelector(".page");
const disp = document.querySelector(".display");
const sec = document.querySelector(".tables")

//updating based on field changes
generateButton.addEventListener('click', () => {
    // test if valid
    if (xColField.value != yRowField.value) {
        alert("Invalid: X rows must equal Y cols")
        return
    }
    // delete old one
    while (sec.lastChild) {
        sec.removeChild(sec.lastChild);
    }
    tabulate("xtab", xRowField.value, xColField.value)
    insertSymbol("&times;")
    tabulate("ytab", yRowField.value, yColField.value)
    insertSymbol("&equals;")
    tabulate("ztab", xRowField.value, yColField.value)
    calculateZ()
});

//update on number change
sec.addEventListener("keyup", calculateZ)

//keyboard shortcut esc
document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        revertFormula();
        unhighlightCells();
    }
});


// function tabulate(tableName, rowField, colField) {
//     tab = document.createElement("table")
//     tab.setAttribute("class", "tab")
//     tab.setAttribute("border", "1")
//     tab.setAttribute("cellpadding", "0")
//     tab.setAttribute("cellspacing", "0")
//     tab.setAttribute("style", "border-collapse: collapse")
//     tab.setAttribute("width", "400")
//     rows = rowField
//     cols = colField
//     for (let i = 0; i < rows; i++) {
//         row = document.createElement("tr")
//         tab.appendChild(row)
//         for (let j = 0; j < cols; j++) {
//             col = document.createElement("td")
//             col.setAttribute("height", "19")
//             col.setAttribute("width", "20%")
//             row.appendChild(col)
//         }
//     }
//     sec.appendChild(tab)
// }


function tabulate(tableName, rowField, colField) {
    // build new one
    tab = document.createElement("div")
    tab.classList.add("tab")
    tab.classList.add(tableName)
    tab.setAttribute("border", "1")
    tab.setAttribute("cellpadding", "0")
    tab.setAttribute("cellspacing", "0")
    tab.setAttribute("style", "border-collapse: collapse")
    tab.setAttribute("width", "400")
    rows = rowField
    cols = colField
    for (let i = 0; i < rows; i++) {
        row = document.createElement("div")
        row.setAttribute("class", "row")
        tab.appendChild(row)
        for (let j = 0; j < cols; j++) {
            cell = document.createElement("div")
            // set classes
            cell.classList.add("cell")
            cell.classList.add(`row${i}`)
            cell.classList.add(`col${j}`)
            // add event listener to result matrix
            if (tableName == "ztab") {
                // cell.style = "background-color: #FFFF00"
                cell.addEventListener('click', (e) => {
                    highlightCells(i, j);
                    displayFormula(i, j)
                    debugVar = e;
                });
            }
            // add form element (or just paragraph for ztab)
            if (tableName != "ztab") {
                form = document.createElement("input")
                form.classList.add("cellForm")
                form.setAttribute("type", "number")
                form.setAttribute("id", "quantity")
                form.setAttribute("name", "quantity")
                form.setAttribute("value", Math.floor(Math.random() * 10))
                // form.setAttribute("min", "0")
                // form.setAttribute("max", "5")
                cell.appendChild(form)
            } else {
                text = document.createElement("div")
                text.classList.add("cellText")
                cell.appendChild(text)
            }
            row.appendChild(cell)
        }
    }
    sec.appendChild(tab)
}

function insertSymbol(symbol) {
    cont = document.createElement("div")
    cont.classList.add("symbol")
    item = document.createElement("div")
    item.innerHTML = symbol
    cont.appendChild(item)
    sec.appendChild(cont)
}

function calculateZ() {
    for (let i = 0; i < xRowField.value; i++) {
        for (let j = 0; j < yColField.value; j++) {
            cell = document.querySelector(`.ztab .row${i}.col${j}`)
            cellVal = 0;
            cellFx = "";
            for (let l = 0; l < yRowField.value; l++) {
                // for (let k = 0; k < xColField.value; k++) {
                xCell = document.querySelector(`.xtab .row${i}.col${l}`)
                yCell = document.querySelector(`.ytab .row${l}.col${j}`)
                xVal = xCell.lastChild.value
                yVal = yCell.lastChild.value
                cellVal += xVal * yVal
                if (l != 0) {
                    cellFx += " + "
                }
                console.log(`${xVal} + ${yVal}`)
                cellFx += `${xVal} &times; ${yVal}`
                console.log(`i=${i};j=${j};l=${l}`)
                // }
            }
            cellFx += ` = ${cellVal}`
            cell.setAttribute("fx", cellFx)
            cell.lastChild.textContent = cellVal
            console.log()
        }
    }
}


function displayFormula(i, j) {
    // figure out originating cell
    cell = document.querySelector(`.ztab .row${i}.col${j}`)
    formula = cell.getAttribute("fx")
    // hide default formula
    formulaBox.style.display = "none"
    // clear out
    clearClickFormula();
    // create math formatted formula
    formatted = document.createElement("math")
    formatted.setAttribute("display", "block")
    formattedRow = document.createElement("mrow")
    formattedRow.innerHTML = formula
    formatted.appendChild(formattedRow)
    clickFormulaBox.appendChild(formatted)
    console.log(formula)
}

function revertFormula() {
    formulaBox.style.display = "block"
    clearClickFormula()
}

function clearClickFormula() {
    // clear existing clickFormula content
    while (clickFormulaBox.lastChild) {
        clickFormulaBox.removeChild(clickFormulaBox.lastChild);
    }
}

function highlightCells(i, j) {
    // remove old highlighting
    unhighlightCells();
    // highlight this cell in z
    zCell = document.querySelector(`.ztab .row${i}.col${j}`)
    zCell.classList.add("highlighted")
    // highlight ith row in x
    console.log(`.xtab.row${i}`)
    xCells = document.querySelectorAll(`.xtab .row${i}`)
    for (let k = 0; k < xCells.length; k++) {
        xCells[k].classList.add("highlighted")
    }
    // highlight jth row in y
    yCells = document.querySelectorAll(`.ytab .col${j}`)
    for (let k = 0; k < yCells.length; k++) {
        yCells[k].classList.add("highlighted")
    }
}

function unhighlightCells() {
    // remove old highlighting
    highlightedCells = document.querySelectorAll(".highlighted")
    for (let k = 0; k < highlightedCells.length; k++) {
        highlightedCells[k].classList.remove("highlighted")
    }
}