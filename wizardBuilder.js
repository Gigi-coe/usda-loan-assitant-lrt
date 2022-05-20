var WizardBuilder = window.WizardBuilder || {};
(function () {
    "use strict";

    var _mdlWizardItemCount = 0;
    const _MDL_STEP_INDEX = {};

    // https://stackoverflow.com/a/25414784
    function _findFirstChildByClass(element, className) {
        var foundElement = null, found;
        function recurse(element, className, found) {
            for (var i = 0; i < element.childNodes.length && !found; i++) {
                var el = element.childNodes[i];
                var classes = el.className != undefined? el.className.split(" ") : [];
                for (var j = 0, jl = classes.length; j < jl; j++) {
                    if (classes[j] == className) {
                        found = true;
                        foundElement = element.childNodes[i];
                        break;
                    }
                }
                if (found) {
                    break;
                }
                recurse(element.childNodes[i], className, found);
            }
        }
        recurse(element, className, false);
        return foundElement;
    }

    function _createWizardTitleElement(title, subtitle) {
        let labelSpan = document.createElement("span");
        labelSpan.classList.add("mdl-step__label");

        let titleSpan = document.createElement("span");
        titleSpan.classList.add("mdl-step__title");

        let titleTextSpan = document.createElement("span");
        titleTextSpan.classList.add("mdl-step__title-text");
        titleTextSpan.appendChild(document.createTextNode(title));
        titleSpan.appendChild(titleTextSpan);

        if (subtitle) {
            let subtitleTextSpan = document.createElement("span");
            subtitleTextSpan.classList.add("mdl-step__title-message");
            subtitleTextSpan.appendChild(document.createTextNode(subtitle));
            titleSpan.appendChild(subtitleTextSpan);
        }

        labelSpan.appendChild(titleSpan);

        return labelSpan;
    }

    function _createParagraphElement(paragraphText) {
        let paragraphElement = document.createElement("p");
        paragraphElement.appendChild(document.createTextNode(paragraphText));
        return paragraphElement;
    }

    function _createVideoContentElement(src, captionText) {
        let gridDiv = document.createElement("section");

        let mdlGridVideoElement = document.createElement("div");
        mdlGridVideoElement.classList.add("mdl-grid");

        let videoElement = document.createElement("video");
        videoElement.height = 240;
        videoElement.width = 320;
        videoElement.setAttribute("controls", "");

        let videoSourceElement = document.createElement("source");
        videoSourceElement.src = src;
        videoSourceElement.type = "video/mp4";

        videoElement.appendChild(videoSourceElement);
        mdlGridVideoElement.appendChild(videoElement);

        let mdlGridCaptionElement = document.createElement("div");
        mdlGridCaptionElement.classList.add("mdl-grid");
        
        let videoCaptionParagraphElement = _createParagraphElement(captionText);

        mdlGridCaptionElement.appendChild(videoCaptionParagraphElement);

        gridDiv.appendChild(mdlGridVideoElement);
        gridDiv.appendChild(mdlGridCaptionElement);

        return gridDiv;
    }

    function _createBulletedListElement(bullets, listType) {
        let listElement = null;
        let cleanListType = listType.trim().toLowerCase();
        if (cleanListType === "numbered") {
            listElement = document.createElement("ol");
        } else if (cleanListType === "unordered") {
            listElement = document.createElement("ul");
        } else {
            alert("Unrecognized bulleted list type detected: " + listType);
        }

        var bulletArrayLength = bullets.length;
        for (var i = 0; i < bulletArrayLength; i++) {
            let bullet = bullets[i];
            let bulletElement = document.createElement("li");
            bulletElement.appendChild(document.createTextNode(bullet.bulletContent));
            let subBullets = bullet.subBullets;
            if (subBullets !== null && subBullets !== undefined && typeof subBullets === 'object' && !Array.isArray(subBullets)) {
                let subListElement = _createBulletedListElement(subBullets.bullets, subBullets.type);
                bulletElement.appendChild(subListElement);
            }
            listElement.appendChild(bulletElement);
        }
        return listElement;
    }
    

    function _createInformationalContentElement(paragraphs) {
        let gridDiv = document.createElement("div");
        gridDiv.classList.add("mdl-grid");

        var paragraphArrayLength = paragraphs.length;
        for (var i = 0; i < paragraphArrayLength; i++) {
            let paragraph = paragraphs[i];
            let paragraphContent = paragraph.paragraphContent;
            if (paragraphContent !== null && paragraphContent !== undefined) {
                if (typeof paragraphContent === 'string' || paragraphContent instanceof String) {
                    var paragraphElement = _createParagraphElement(paragraphContent);
                } else if (typeof paragraphContent === 'object' && !Array.isArray(paragraphContent)) {
                    var paragraphElement = _createBulletedListElement(paragraphContent.bullets, paragraphContent.type);
                } else {
                    alert("Unrecognized paragraphContent element detected: " + paragraphContent.toString());
                }
            }
            gridDiv.appendChild(paragraphElement);
        }
        
        return gridDiv;
    }

    function _createWizardContentElement(content, stepType, sectionHeader) {
        let contentDiv = document.createElement("div");
        contentDiv.classList.add("mdl-step__content");

        if (sectionHeader) {
            let sectionHeaderDiv = document.createElement("div");
            sectionHeaderDiv.classList.add("mdl-grid");
            sectionHeaderDiv.style.fontStyle = "italic";
            sectionHeaderDiv.appendChild(document.createTextNode(sectionHeader));
            contentDiv.appendChild(sectionHeaderDiv);
        }

        var cleanStepType = stepType.trim().toLowerCase();
        if (cleanStepType === "video") {
            contentDiv.appendChild(_createVideoContentElement(content.src, content.captionText));
        } else if (cleanStepType === "informational") {
            contentDiv.appendChild(_createInformationalContentElement(content.paragraphs));
        } else {
            alert("An invalid step type was detected: " + stepType);
        }

        return contentDiv;
    }

    function _createButtonElement(buttonText, backgroundColor, textColor, orderNumber) {
        let button = document.createElement("button");
        button.classList.add("mdl-button", "mdl-js-button", "mdl-js-ripple-effect", "mdl-button--raised");
        button.style.backgroundColor = backgroundColor;
        if (textColor) {
            button.style.color = textColor;
        }
        if (orderNumber) {
            button.style.order = orderNumber;
        }
        button.appendChild(document.createTextNode(buttonText));
        return button;
    }

    function _createWizardActionElement(wizardElementId, buttons, resetToSlideId) {
        let actionElement = document.createElement("div");
        actionElement.classList.add("mdl-step__actions");

        var buttonArrayLength = buttons.length;
        for (var i = 0; i < buttonArrayLength; i++) {
            let button = buttons[i];
            let buttonElement = _createButtonElement(button.buttonText, button.color, button.textColor, i);
            if (button.nextSlideId) {
                buttonElement.onclick = function (_) {
                    WizardBuilder.addStep(wizardElementId, button.nextSlideId);
                    WizardBuilder.goToStep(wizardElementId, button.nextSlideId);
                }
            } else if (button.url) {
                buttonElement.onclick = function (_) {
                    location.href = button.url;
                }
            } else {
                alert("A button object must have either a \"nextSlideId\" attribute or \"url\" attribute.");
            }
            buttonElement.style.marginRight = "8px";
            actionElement.appendChild(buttonElement);
        }

        if (resetToSlideId) {
            let resetButtonElement = _createButtonElement("Start Over", "#afdf9f", "black", buttonArrayLength);
            resetButtonElement.style.marginLeft = "auto";
            resetButtonElement.onclick = function (_) {
                WizardBuilder.goToStep(wizardElementId, resetToSlideId);
            }
            actionElement.appendChild(resetButtonElement);
        }

        return actionElement;
    }

    function _createWizardStepElement(wizardElementId, step) {
        let wizardStepElement = document.createElement("li");
        wizardStepElement.classList.add("mdl-step");
        wizardStepElement.dataset.stepId = step.id;

        let wizardStepTitleElement = _createWizardTitleElement(step.title, step.subtitle);
        wizardStepElement.appendChild(wizardStepTitleElement);

        let wizardStepContentElement = _createWizardContentElement(step.content, step.type, step.sectionHeader);
        wizardStepElement.appendChild(wizardStepContentElement);

        let wizardStepActionElement = _createWizardActionElement(wizardElementId, step.buttons, step.resetToSlideId);
        wizardStepElement.appendChild(wizardStepActionElement);

        return wizardStepElement;
    }

    function _getWizardContent(wizardContentPath) {
        var result = null;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", wizardContentPath, false);
        xmlhttp.send();
        if (xmlhttp.status === 200) {
            result = JSON.parse(xmlhttp.responseText);
        }
        return result["steps"];
    }

    this.initialize = function(wizardElementId, wizardContentPath) {
        let wizardSteps = _getWizardContent(wizardContentPath);
        if (!Array.isArray(wizardSteps)) {
            alert("Attempt to parse the file at " + wizardContentPath + " failed. Could not find top level array attribute called \"steps\".");
            return;
        }

        const firstStep = wizardSteps[0];
        var stepArrayLength = wizardSteps.length;
        for (var i = 0; i < stepArrayLength; i++) {
            let step = wizardSteps[i];
            step.mdlStepNumber = -1;
            _MDL_STEP_INDEX[step.id] = step;
        }

        let firstStepElement = _createWizardStepElement(wizardElementId, firstStep);
        const stepperElement = document.getElementById(wizardElementId);
        stepperElement.appendChild(firstStepElement);
        _mdlWizardItemCount += 1;
        _MDL_STEP_INDEX[firstStep.id].mdlStepNumber = _mdlWizardItemCount;
    }

    this.addStep = function (wizardElementId, stepId) {
        let targetStep = _MDL_STEP_INDEX[stepId];
        if (targetStep.mdlStepNumber > 0) {
            return;
        }

        const stepper = document.getElementById(wizardElementId);

        // Create new step
        const newStep = _createWizardStepElement(wizardElementId, targetStep);

        // Replace old steps with identical copies of themselves to clear possible duplicate event listeners (thanks to how stepper.js is implemented)
        for (var i = 0; i < stepper.children.length; i++) {
            var child = stepper.children[i];
            var childClone = child.cloneNode(true);
            const currentChildStepId = childClone.dataset.stepId;
            childClone.onclick = function (_) {
                WizardBuilder.goToStep(wizardElementId, parseInt(currentChildStepId));
            }
            var currentButtons = child.querySelectorAll('.mdl-button');
            var cloneButtons = childClone.querySelectorAll('.mdl-button');
            for (var j = 0; j < currentButtons.length; j++) {
                cloneButtons[j].onclick = currentButtons[j].onclick;
            }
            child.replaceWith(childClone);
        }

        // Add the new step to the Stepper
        stepper.appendChild(newStep);

        // Make sure the stepper is "upgraded" to wire up the new step correctly
        stepper.setAttribute('data-upgraded', '');
        componentHandler.upgradeElement(stepper);

        _mdlWizardItemCount += 1;
        targetStep.mdlStepNumber = _mdlWizardItemCount;
    }

    this.goToStep = function (wizardElementId, stepId) {
        let targetStep = _MDL_STEP_INDEX[stepId];
        if (targetStep.mdlStepNumber < 0) {
            return;
        }
        
        const stepperElement = document.getElementById(wizardElementId);
        const stepper = stepperElement.MaterialStepper;
        const currentStep = stepper.getActive();

        if (parseInt(currentStep.dataset.stepId) === stepId) {
            return;
        }

        stepper.goto(targetStep.mdlStepNumber);

        let foundTargetStep = null;
        let stepsToDelete = [];
        for (var i = 0; i < stepperElement.children.length; i++) {
            var step = stepperElement.children[i];
            if (foundTargetStep === null) {
                foundTargetStep = parseInt(step.dataset.stepId) === stepId ? step : null;
                continue;
            }

            stepsToDelete.push(step);
        }
        foundTargetStep.onclick = null;

        let stepWithIndicatorToModify = stepsToDelete.length > 0 ? foundTargetStep : currentStep;
        let labelIndicatorElement = _findFirstChildByClass(stepWithIndicatorToModify, "mdl-step__label-indicator");
        let labelIndicatorContentElement = labelIndicatorElement.children[0];
        if (stepsToDelete.length > 0) {
            let stepNumberIndicatorElement = document.createElement("span");
            stepNumberIndicatorElement.classList.add("mdl-step__label-indicator-content");
            stepNumberIndicatorElement.appendChild(document.createTextNode(targetStep.mdlStepNumber.toString()));
            labelIndicatorContentElement.replaceWith(stepNumberIndicatorElement);

            for (var i = 0; i < stepsToDelete.length; i++) {
                var step = stepsToDelete[i];
                _MDL_STEP_INDEX[step.dataset.stepId].mdlStepNumber = -1;
                _mdlWizardItemCount -= 1;
                stepperElement.removeChild(step);
            }
        } else {
            let completedStepIndicatorElement = document.createElement("i");
            completedStepIndicatorElement.classList.add("material-icons", "mdl-step__label-indicator-content");
            completedStepIndicatorElement.appendChild(document.createTextNode("check"));
            labelIndicatorContentElement.replaceWith(completedStepIndicatorElement);
        }
    }

}).call(WizardBuilder);