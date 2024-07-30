document.addEventListener("DOMContentLoaded", function () {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDpWuZDlCoLSF6uHjohsKlP6uHjohsKlP6Vv1SkhbO0Q",
    authDomain: "dados-expo.firebaseapp.com",
    projectId: "dados-expo",
    storageBucket: "dados-expo.appspot.com",
    messagingSenderId: "1090907248591",
    appId: "1:1090907248591:web:019b6c90d4110e05d064ba",
    measurementId: "G-R8N041XPG3",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const form = document.getElementById("multiStepForm");
  const nextBtns = document.querySelectorAll(".btn-next");
  const backBtns = document.querySelectorAll(".btn-back");
  const formSteps = document.querySelectorAll(".form-step");
  const btnOptions = document.querySelectorAll(".btn-option");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const areaCodeSelect = document.getElementById("areacode");

  const multiSelectSteps = ["c5", "c7", "d5", "e4", "e6", "f4", "f6"];
  let inactivityTimeout, alertTimeout;

  const phonePatterns = {
    "+1": { length: 10, placeholder: "(###) ###-####", mask: "(###) ###-####" },
    "+44": {
      length: 10,
      placeholder: "(####) ###-####",
      mask: "(####) ###-####",
    },
    "+49": {
      length: 11,
      placeholder: "(####) ###-####",
      mask: "(####) ###-####",
    },
    "+33": {
      length: 9,
      placeholder: "(#) ##-##-##-##",
      mask: "(#) ##-##-##-##",
    },
    "+81": {
      length: 10,
      placeholder: "(##) ####-####",
      mask: "(##) ####-####",
    },
    "+86": {
      length: 11,
      placeholder: "(###) ####-####",
      mask: "(###) ####-####",
    },
    "+7": {
      length: 10,
      placeholder: "(###) ###-##-##",
      mask: "(###) ###-##-##",
    },
    "+91": { length: 10, placeholder: "(#####) #####", mask: "(#####) #####" },
    "+55": {
      length: 11,
      placeholder: "(##) ####-#####",
      mask: "(##) ####-#####",
    },
    "+39": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+34": { length: 9, placeholder: "(###) ###-###", mask: "(###) ###-###" },
    "+52": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+61": { length: 9, placeholder: "(#) ####-####", mask: "(#) ####-####" },
    "+82": {
      length: 10,
      placeholder: "(##) ####-####",
      mask: "(##) ####-####",
    },
    "+90": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+966": { length: 9, placeholder: "(#) ###-####", mask: "(#) ###-####" },
    "+27": { length: 9, placeholder: "(##) ###-####", mask: "(##) ###-####" },
    "+62": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+54": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+234": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+20": { length: 9, placeholder: "(#) ###-####", mask: "(#) ###-####" },
    "+92": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+63": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+60": { length: 9, placeholder: "(##) ###-####", mask: "(##) ###-####" },
    "+66": { length: 9, placeholder: "(##) ###-####", mask: "(##) ###-####" },
    "+84": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+98": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+57": {
      length: 10,
      placeholder: "(###) ###-####",
      mask: "(###) ###-####",
    },
    "+56": { length: 9, placeholder: "(#) ###-####", mask: "(#) ###-####" },
  };

  const navigationMap = {
    a1: { next: "b1", prev: null },
    b1: {
      next: {
        Doutorado: "c1",
        Mestrado: "c1",
        Bacharel: "d1",
        "Curso Técnico ou profissionalizante com + 2 anos de duração": "e1",
        "Curso Técnico ou profissionalizante com - 2 anos de duração": "f1",
        "Ensino Médio": "f1",
      },
      prev: "a1",
    },
    c1: {
      next: { Médico: "c2", Dentista: "c2", Outros: "c_outros" },
      prev: "b1",
    },
    c_outros: { next: "c2", prev: "c1" },
    c2: { next: { Sim: "c3", Não: "c4" }, prev: "c1" },
    c3: {
      next: {
        "Professor ou Pesquisador": "envia_email",
        "Gerente ou Executivo": "envia_email",
        Outros: "c4",
      },
      prev: "c2",
    },
    c4: { next: { Sim: "envia_email", Não: "c5" }, prev: "c3" },
    c5: {
      next: { "3 ou mais": "envia_email", "2 ou menos": "c7" },
      prev: "c4",
    },
    c6: { next: "envia_email", prev: "c7" },
    c7: { next: { "3 ou mais": "c6", "2 ou menos": "c8" }, prev: "c5" },
    c8: { next: "envia_email", prev: "c7" },
    d1: {
      next: { Médico: "d2", Dentista: "d2", Outros: "d_outros" },
      prev: "b1",
    },
    d_outros: { next: "d2", prev: "d1" },
    d2: { next: { Sim: "envia_email", Não: "d3" }, prev: "d1" },
    d3: { next: { Sim: "d4", Não: "d5" }, prev: "d2" },
    d4: { next: "envia_email", prev: "d3" },
    d5: { next: { "3 ou mais": "d4", "2 ou menos": "d6" }, prev: "d3" },
    d6: { next: "envia_email", prev: "d5" },
    e1: {
      next: { Médico: "e2", Dentista: "e2", Outros: "e_outros" },
      prev: "b1",
    },
    e_outros: { next: "e2", prev: "e1" },
    e2: { next: { Sim: "envia_email", Não: "e3" }, prev: "e1" },
    e3: { next: { Sim: "e4", Não: "e4" }, prev: "e2" },
    e4: { next: { "3 ou mais": "e5", "2 ou menos": "e6" }, prev: "e3" },
    e5: { next: "envia_email", prev: "e4" },
    e6: { next: { "3 ou mais": "e5", "2 ou menos": "e7" }, prev: "e5" },
    e7: { next: "envia_email", prev: "e6" },
    f1: {
      next: { Médico: "f2", Dentista: "f2", Outros: "f_outros" },
      prev: "b1",
    },
    f_outros: { next: "f2", prev: "f1" },
    f2: { next: { Sim: "envia_email", Não: "f3" }, prev: "f1" },
    f3: { next: { Sim: "f5", Não: "f4" }, prev: "f2" },
    f4: { next: { "3 ou mais": "f5", "2 ou menos": "f6" }, prev: "f3" },
    f5: { next: "envia_email", prev: "f4" },
    f6: { next: { "3 ou mais": "f5", "2 ou menos": "f7" }, prev: "f5" },
    f7: { next: "envia_email", prev: "f6" },
  };

  let formStepNum = "a1";
  let previousSteps = [];

  function updateFormSteps() {
    formSteps.forEach((formStep) => {
      formStep.classList.remove("form-step-active");
    });
    document.querySelector(`#${formStepNum}`).classList.add("form-step-active");
    console.log(`Navigated to step: ${formStepNum}`);
    resetInactivityTimeout();
  }

  function handleOptionSelection(e) {
    const btnGroup = e.target.closest(".btn-group");
    const hiddenInput = btnGroup.nextElementSibling;

    if (hiddenInput && hiddenInput.type === "hidden") {
      if (!multiSelectSteps.includes(formStepNum)) {
        btnGroup
          .querySelectorAll(".btn-option")
          .forEach((btn) => btn.classList.remove("selected"));
      }
      e.target.classList.toggle("selected");
      hiddenInput.value = Array.from(
        btnGroup.querySelectorAll(".btn-option.selected")
      )
        .map((el) => el.getAttribute("data-value"))
        .join(", ");
      console.log(
        `Selected value for ${hiddenInput.name}: ${hiddenInput.value}`
      );
    }
  }

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  function showValidationError(message, element) {
    const existingError = element.nextElementSibling;
    if (existingError && existingError.classList.contains("validation-error")) {
      existingError.remove();
    }
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("validation-error");
    errorDiv.style.color = "red";
    errorDiv.style.marginTop = "10px";
    errorDiv.innerText = message;
    element.insertAdjacentElement("afterend", errorDiv);
  }

  function validateCurrentStep() {
    const activeStep = document.querySelector(".form-step-active");
    const requiredInputs = activeStep.querySelectorAll(
      "input[required], select[required]"
    );
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const input of requiredInputs) {
      if (!input.value.trim()) {
        input.focus();
        showValidationError("Este campo é obrigatório", input);
        return false;
      }
      if (input.type === "email" && !emailRegex.test(input.value)) {
        input.focus();
        showValidationError("Por favor, insira um e-mail válido", input);
        return false;
      }
      if (input.id === "phone") {
        const countryCode = areaCodeSelect.value;
        const phonePattern = phonePatterns[countryCode];
        const plainNumber = input.value.replace(/\D/g, ""); // Remove non-numeric characters
        if (phonePattern && plainNumber.length !== phonePattern.length) {
          input.focus();
          showValidationError(
            `O número de telefone deve ter ${phonePattern.length} dígitos`,
            input
          );
          return false;
        }
      }
    }
    return true;
  }

  function resetInactivityTimeout() {
    clearTimeout(inactivityTimeout);
    clearTimeout(alertTimeout);
    if (formStepNum !== "a1") {
      inactivityTimeout = setTimeout(showInactivityAlert, 90000); // 1.5 minutes
    }
  }

  function showInactivityAlert() {
    const userResponse = confirm("Deseja continuar?");
    if (userResponse) {
      resetInactivityTimeout();
    } else {
      location.reload(); // Reload immediately if user chooses "No"
    }
    alertTimeout = setTimeout(() => {
      location.reload();
    }, 20000); // 20 seconds timeout if no response
  }

  function updatePhonePlaceholder() {
    const countryCode = areaCodeSelect.value;
    const phonePattern = phonePatterns[countryCode];
    if (phonePattern) {
      phoneInput.placeholder = phonePattern.placeholder;
      phoneInput.maxLength = phonePattern.placeholder.length;
    } else {
      phoneInput.placeholder = "";
      phoneInput.removeAttribute("maxLength");
    }
  }

  function formatPhoneNumber(value, mask) {
    let i = 0;
    const val = value.replace(/\D/g, ""); // Remove non-numeric characters
    return mask.replace(/#/g, () => val[i++] || "");
  }

  function handlePhoneInput(e) {
    const countryCode = areaCodeSelect.value;
    const phonePattern = phonePatterns[countryCode];
    if (phonePattern) {
      phoneInput.value = formatPhoneNumber(phoneInput.value, phonePattern.mask);
    }
  }

  btnOptions.forEach((button) => {
    button.addEventListener("click", handleOptionSelection);
  });

  nextBtns.forEach((button) => {
    button.addEventListener("click", () => {
      if (!validateCurrentStep()) {
        return;
      }
      previousSteps.push(formStepNum);
      const currentStep = navigationMap[formStepNum];
      if (currentStep) {
        const nextStep = currentStep.next;
        if (typeof nextStep === "string") {
          formStepNum = nextStep;
        } else if (multiSelectSteps.includes(formStepNum)) {
          const selectedOptions = form.querySelectorAll(
            `#${formStepNum} .btn-option.selected`
          );
          if (selectedOptions.length >= 3) {
            formStepNum = nextStep["3 ou mais"];
          } else {
            formStepNum = nextStep["2 ou menos"];
          }
        } else {
          const selectedOption = form
            .querySelector(`#${formStepNum} .btn-option.selected`)
            .getAttribute("data-value");
          formStepNum = nextStep[selectedOption] || formStepNum;
        }
      }
      if (formStepNum === "envia_email") {
        handleSubmit();
      } else {
        updateFormSteps();
      }
    });
  });

  backBtns.forEach((button) => {
    button.addEventListener("click", () => {
      if (previousSteps.length > 0) {
        formStepNum = previousSteps.pop();
        console.log(`Navigated back to step: ${formStepNum}`);
        updateFormSteps();
      }
    });
  });

  nameInput.addEventListener("input", () => {
    nameInput.value = capitalizeWords(nameInput.value);
  });

  phoneInput.addEventListener("input", handlePhoneInput);

  areaCodeSelect.addEventListener("change", () => {
    updatePhonePlaceholder();
    phoneInput.value = ""; // Clear phone input when country code changes
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit();
  });

  function handleSubmit() {
    if (!validateCurrentStep()) {
      return;
    }
    nameInput.value = capitalizeWords(nameInput.value); // Ensure name is capitalized on submit
    const formData = new FormData(form);

    // Create an ordered data object
    const data = {
      nome: formData.get("name"),
      email: formData.get("email"),
      countryCode: formData.get("areacode"),
      telefone: formData.get("phone"),
      immigration: formData.get("immigration"),
      ...getSelectedResponsesObject(), // Spread the responses into the data object
    };

    // Save to Firebase
    const timestamp = new Date();
    const docName = `${formData.get("name")}-${timestamp.getDate()}-${
      timestamp.getMonth() + 1
    }-${timestamp.getFullYear()}-${timestamp.getHours()}-${timestamp.getMinutes()}-${timestamp.getSeconds()}`;
    db.collection("users")
      .doc(docName)
      .set(data)
      .then(() => {
        console.log("Document successfully written!");
        // Send email
        emailjs
          .send("service_udtghcr", "template_6pr4s1d", {
            nome: formData.get("name"),
            to_email: formData.get("email"),
            countryCode: formData.get("areacode"),
            telefone: formData.get("phone"),
            immigration: formData.get("immigration"),
            responses: formatResponses(getSelectedResponses()),
          })
          .then(
            (response) => {
              console.log("SUCCESS!", response.status, response.text);
              showThankYouStep();
              setTimeout(() => {
                location.reload();
              }, 10000); // Reload the page after 10 seconds
            },
            (error) => {
              console.log("FAILED...", error);
              alert(
                "There was an error submitting the form. Please try again."
              );
            }
          );
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
        alert("There was an error submitting the form. Please try again.");
      });
  }

  function getSelectedResponses() {
    const responses = [];
    document.querySelectorAll(".btn-option.selected").forEach((btn) => {
      const questionElement = btn.closest(".form-group").querySelector("label");
      const question =
        questionElement.getAttribute("data-question") ||
        questionElement.innerText;
      const answer = btn.innerText;
      responses.push({ question, answer });
    });
    document.querySelectorAll("input[type='text']").forEach((input) => {
      if (input.value.trim() !== "") {
        const questionElement = input
          .closest(".form-group")
          .querySelector("label");
        const question =
          questionElement.getAttribute("data-question") ||
          questionElement.innerText;
        const answer = input.value;
        responses.push({ question, answer });
      }
    });
    console.log("Collected responses:", responses);
    return responses;
  }

  function getSelectedResponsesObject() {
    const responsesObject = {};
    document.querySelectorAll(".btn-option.selected").forEach((btn) => {
      const questionElement = btn.closest(".form-group").querySelector("label");
      const question =
        questionElement.getAttribute("data-question") ||
        questionElement.innerText;
      const answer = btn.innerText;
      responsesObject[question] = answer;
    });
    document.querySelectorAll("input[type='text']").forEach((input) => {
      if (input.value.trim() !== "") {
        const questionElement = input
          .closest(".form-group")
          .querySelector("label");
        const question =
          questionElement.getAttribute("data-question") ||
          questionElement.innerText;
        const answer = input.value;
        responsesObject[question] = answer;
      }
    });
    console.log("Collected responses object:", responsesObject);
    return responsesObject;
  }

  function formatResponses(responses) {
    return responses
      .map((response) => `${response.question}: ${response.answer}`)
      .join("\n");
  }

  function showThankYouStep() {
    formSteps.forEach((step) => {
      step.classList.remove("form-step-active");
    });
    const thankYouStep = document.getElementById("thank-you-step");
    if (thankYouStep) {
      thankYouStep.classList.add("form-step-active");
    }
    console.log("Thank you message displayed.");
  }

  updateFormSteps(); // Initialize form step view
  updatePhonePlaceholder(); // Initialize phone placeholder

  // Event listener for real-time validation
  document
    .querySelectorAll("input[required], select[required]")
    .forEach((input) => {
      input.addEventListener("input", () => {
        const error = input.nextElementSibling;
        if (error && error.classList.contains("validation-error")) {
          error.remove();
        }
      });
    });
});
