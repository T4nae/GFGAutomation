const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to wait for an element to become enabled
function waitForElementEnabled(element, timeout = 20000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkElement = () => {
            if (!element.disabled) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(
                    new Error("Timeout waiting for element to become enabled")
                );
            } else {
                setTimeout(checkElement, 100);
            }
        };
        checkElement();
    });
}

// Function to wait for an element to appear
function waitForElement(selector, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(
                    new Error(
                        `Timeout waiting for element with selector ${selector} to appear`
                    )
                );
            } else {
                setTimeout(checkElement, 100);
            }
        };
        checkElement();
    });
}

// Function to handle a single quiz question
async function handleQuizQuestion() {
    try {
        // Wait for options to appear
        await waitForElement('[class^="quiz_container"]');

        // Find all quiz options
        const radioOptions = document.querySelectorAll(
            '[class^="QuizRadioBtn_radio_container"]'
        );
        const checkboxOptions = document.querySelectorAll(
            '[class^="QuizCheckboxBtn_checkbox"]'
        );
        const options = [...radioOptions, ...checkboxOptions];

        if (options.length > 0) {
            // Select a random option
            const randomIndex = Math.floor(Math.random() * options.length);
            options[randomIndex].click();

            // Wait for the buttons container
            const buttonsContainer = await waitForElement(
                '[class^="track_question_buttons_contents"]'
            );
            const buttons = buttonsContainer.children;

            // Find and click the submit button
            const submitButton = buttons[1];
            if (submitButton) {
                // check if question is already submitted and skip
                if (submitButton.innerText !== "Submitted")
                    submitButton.click();

                // Wait for the next/finish button to be enabled
                const nextButton = buttons[2];
                if (nextButton.disabled === false) nextButton.click();
            }
        }
    } catch (error) {}
}

// Function to handle the entire quiz
async function handleQuiz() {
    try {
        await handleQuizQuestion();
    } catch (error) {}
}

// Function to scroll to the bottom and click the button
async function handleArticle() {
    window.scrollTo(0, document.body.scrollHeight);
    try {
        const button = await waitForElement(".ui.green.button");
        // click button if it is enabled only then click
        if (!button.disabled) {
            button.click();
            try {
                const nextButton = await waitForElement(".ui.button.next");
                await waitForElementEnabled(nextButton);
                if (!nextButton.disabled) {
                    nextButton.click();
                }
            } catch (error) {}
        }
    } catch (error) {}
}

// Observer to check for URL changes
const observer = new MutationObserver(() => {
    if (window.location.href.includes("article")) {
        handleArticle();
        if (
            !sessionStorage.getItem("tabOpened") &&
            sessionStorage.getItem("attempts")
        ) {
            // set 5 sec interval to open the tab
            setTimeout(() => {
                window.open(
                    "https://myperfectice-automation.vercel.app/offer?ref=gfg",
                    "_blank"
                );
            }, 20000);
            sessionStorage.setItem("tabOpened", "true");
        }
    }
    if (window.location.href.includes("quiz")) {
        handleQuiz();
        if (!sessionStorage.getItem("tabOpened")) {
            // set 5 sec interval to open the tab
            setTimeout(() => {
                window.open(
                    "https://myperfectice-automation.vercel.app/offer?ref=gfg",
                    "_blank"
                );
            }, 20000);
            sessionStorage.setItem("tabOpened", "true");
        }
    }
});

// Start observing changes to the URL on page load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, { childList: true, subtree: true });
    });
} else {
    observer.observe(document.body, { childList: true, subtree: true });
}
