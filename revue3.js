const slides = [...document.querySelectorAll(".slide")];
const previousButton = document.querySelector("#prev-slide");
const nextButton = document.querySelector("#next-slide");
const currentSlide = document.querySelector("#current-slide");
const totalSlides = document.querySelector("#total-slides");
const progressBar = document.querySelector("#progress-bar");
const zoomDialog = document.querySelector("#zoom-dialog");
const zoomTitle = document.querySelector("#zoom-title");
const zoomContent = document.querySelector("#zoom-content");
const closeZoom = document.querySelector("#close-zoom");

let index = 0;

function classifyImageDiagram(diagram) {
  const image = diagram.querySelector("img");
  if (!image || !image.naturalWidth || !image.naturalHeight) return;

  const ratio = image.naturalWidth / image.naturalHeight;
  const area = image.naturalWidth * image.naturalHeight;

  diagram.classList.remove("ratio-wide", "ratio-balanced", "ratio-tall", "ratio-small");

  if (area < 450000) {
    diagram.classList.add("ratio-small");
  } else if (ratio > 2.2) {
    diagram.classList.add("ratio-wide");
  } else if (ratio < 0.85) {
    diagram.classList.add("ratio-tall");
  } else {
    diagram.classList.add("ratio-balanced");
  }
}

document.querySelectorAll(".image-diagram").forEach(diagram => {
  const image = diagram.querySelector("img");
  if (!image) return;

  if (image.complete) {
    classifyImageDiagram(diagram);
  } else {
    image.addEventListener("load", () => classifyImageDiagram(diagram), { once: true });
  }
});

function showSlide(nextIndex) {
  index = Math.max(0, Math.min(nextIndex, slides.length - 1));

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === index);
  });

  currentSlide.textContent = String(index + 1);
  totalSlides.textContent = String(slides.length);
  progressBar.style.width = `${((index + 1) / slides.length) * 100}%`;
  previousButton.disabled = index === 0;
  nextButton.disabled = index === slides.length - 1;
}

function nextSlide() {
  showSlide(index + 1);
}

function previousSlide() {
  showSlide(index - 1);
}

previousButton.addEventListener("click", previousSlide);
nextButton.addEventListener("click", nextSlide);

document.addEventListener("keydown", event => {
  if (zoomDialog.open && event.key !== "Escape") return;

  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    nextSlide();
  }

  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    previousSlide();
  }
});

function openZoom(source, title) {
  zoomTitle.textContent = title;
  const clone = source.cloneNode(true);
  clone.removeAttribute("data-zoom");
  clone.removeAttribute("tabindex");
  if (clone.classList.contains("image-diagram")) {
    classifyImageDiagram(clone);
  }
  zoomContent.replaceChildren(clone);

  if (typeof zoomDialog.showModal === "function") {
    zoomDialog.showModal();
  } else {
    zoomDialog.setAttribute("open", "");
  }
}

document.querySelectorAll(".diagram").forEach(diagram => {
  diagram.addEventListener("click", () => {
    openZoom(diagram, diagram.dataset.zoom || "Diagramme");
  });
});

document.querySelectorAll(".code-panel").forEach(panel => {
  panel.tabIndex = 0;
  panel.title = "Cliquer pour zoomer le code";

  panel.addEventListener("click", () => {
    const slide = panel.closest(".slide");
    openZoom(panel, slide?.dataset.title || "Code commenté");
  });

  panel.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const slide = panel.closest(".slide");
    openZoom(panel, slide?.dataset.title || "Code commenté");
  });
});

closeZoom.addEventListener("click", () => {
  zoomDialog.close();
});

zoomDialog.addEventListener("click", event => {
  if (event.target === zoomDialog) {
    zoomDialog.close();
  }
});

showSlide(0);
