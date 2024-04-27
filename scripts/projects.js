// Add a show more button to the last summary paragraph of each project
const projectSections = document.querySelectorAll(".project");
for (const projectSection of projectSections) {
    // Determine which project this is
    const projectId = projectSection.id;

    // Extract last summary paragraph from project
    const summaryParagraphs = document.querySelectorAll(`#${projectId} .summary`);
    const lastSummaryParagraph = summaryParagraphs[summaryParagraphs.length - 1];
    console.log(lastSummaryParagraph);

    // Create and append a show more button
    const moreButton = document.createElement("button");
    moreButton.classList.add("show-more-button");
    moreButton.textContent = "Show more";
    lastSummaryParagraph.appendChild(moreButton);

    // Add event listener
    moreButton.addEventListener("click", (event) => {
        showMore(event);
    });
}


function showMore(event) {
    // Get clicked button element, determine project id
    const moreButton = event.target;
    const projectId = moreButton.parentElement.parentElement.id

    // Hide the button
    moreButton.style.display = "none";

    // Show all the extra paragraphs in this project
    const moreSections = document.querySelectorAll(`#${projectId} .more`)
    console.log(moreSections)
    for (const moreSection of moreSections) {
        moreSection.style.display = "block";
    }

    // Add a show less button
    const lessButton = document.createElement("button");
    lessButton.classList.add("show-less-button");
    lessButton.textContent = "Show less";
    const lastMoreSection = moreSections[moreSections.length - 1];
    lastMoreSection.appendChild(lessButton);

    // Configure click event for show less button
    lessButton.addEventListener("click", () => {
        showLess(moreButton, moreSections, lessButton);
    });
}

function showLess(moreButton, moreSections, lessButton) {
    // Hide all the extra paragraphs in this project
    for (const moreSection of moreSections) {
        moreSection.style.display = "none";
    }

    // Unhide the show more button
    moreButton.style.display = "inline";

    // Delete show less button
    lessButton.remove();
}