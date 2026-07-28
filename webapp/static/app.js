function toggleVisibility(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;
  btn.addEventListener("click", () => {
    input.type = input.type === "password" ? "text" : "password";
    btn.textContent = input.type === "password" ? "👁" : "🙈";
  });
}

function initAdvancedToggle() {
  const toggle = document.getElementById("advanced-toggle");
  const panel = document.getElementById("advanced-options");
  if (!toggle || !panel) return;
  const label = toggle.querySelector(".toggle-label");

  const setState = () => {
    const open = !panel.hidden;
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "고급 옵션 (숨기기)" : "고급 옵션";
  };

  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    setState();
  });
  setState();
}

const SAVED_API_KEY_STORAGE_KEY = "stt_saved_api_key";

function initApiKeyAutoSave(inputId, checkboxId, form) {
  const input = document.getElementById(inputId);
  const checkbox = document.getElementById(checkboxId);
  if (!input || !checkbox || !form) return;

  const saved = localStorage.getItem(SAVED_API_KEY_STORAGE_KEY);
  if (saved) {
    input.value = saved;
    checkbox.checked = true;
    const panel = document.getElementById("advanced-options");
    if (panel) panel.hidden = false;
  }

  form.addEventListener("submit", () => {
    if (checkbox.checked && input.value) {
      localStorage.setItem(SAVED_API_KEY_STORAGE_KEY, input.value);
    } else {
      localStorage.removeItem(SAVED_API_KEY_STORAGE_KEY);
    }
  });
}

const SAVED_PROVIDER_STORAGE_KEY = "stt_saved_provider";

function initProviderAutoSave(radioName, form) {
  if (!form) return;
  const radios = form.querySelectorAll(`input[name="${radioName}"]`);
  if (!radios.length) return;

  const saved = localStorage.getItem(SAVED_PROVIDER_STORAGE_KEY);
  if (saved !== null) {
    radios.forEach((r) => { r.checked = r.value === saved; });
    const panel = document.getElementById("advanced-options");
    if (panel) panel.hidden = false;
  }

  form.addEventListener("submit", () => {
    const checked = form.querySelector(`input[name="${radioName}"]:checked`);
    if (checked) {
      localStorage.setItem(SAVED_PROVIDER_STORAGE_KEY, checked.value);
    }
  });
}

function initApiKeyBoxToggle(radioName, boxId, form) {
  if (!form) return;
  const box = document.getElementById(boxId);
  const radios = form.querySelectorAll(`input[name="${radioName}"]`);
  if (!box || !radios.length) return;
  const keyInput = document.getElementById("api-key");
  const checkbox = document.getElementById("save-api-key");

  const clearSavedKey = () => {
    if (keyInput) keyInput.value = "";
    if (checkbox) checkbox.checked = false;
    localStorage.removeItem(SAVED_API_KEY_STORAGE_KEY);
  };

  const update = () => {
    const checked = form.querySelector(`input[name="${radioName}"]:checked`);
    const isNone = !checked || checked.value === "";
    box.hidden = isNone;
    if (isNone) clearSavedKey();
  };

  radios.forEach((r) => r.addEventListener("change", update));
  update();
}

function initFileNameDisplay(inputId, displayId) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  if (!input || !display) return;
  input.addEventListener("change", () => {
    display.textContent = input.files && input.files[0] ? input.files[0].name : "";
  });
}

function initResultActions(copyBtnId, clearBtnId, textareaId, sectionId) {
  const copyBtn = document.getElementById(copyBtnId);
  const clearBtn = document.getElementById(clearBtnId);
  const textarea = document.getElementById(textareaId);
  const section = document.getElementById(sectionId);

  if (copyBtn && textarea) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        const original = copyBtn.textContent;
        copyBtn.textContent = "복사됨";
        setTimeout(() => { copyBtn.textContent = original; }, 1500);
      } catch (e) {
        textarea.classList.remove("visually-hidden");
        textarea.select();
      }
    });
  }

  if (clearBtn && section) {
    clearBtn.addEventListener("click", () => section.remove());
  }
}
