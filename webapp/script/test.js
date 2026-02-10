document.addEventListener("DOMContentLoaded", () => {
  const generate = document.getElementById("generate");
  const filter = document.getElementById("filter");
  const usage = document.getElementById("usage");
  const archive = document.getElementById("archive");
  const left = document.getElementById("left");
  const right = document.getElementById("right");

  document.getElementById("button-generate").addEventListener("click", () => {
    generate.classList.toggle("hidden");
    if (
      generate.classList.contains("hidden") &&
      filter.classList.contains("hidden")
    ) {
      left.classList.toggle("hidden");
    } else if (left.classList.contains("hidden")) {
      left.classList.toggle("hidden");
    }
  });

  document.getElementById("button-filter").addEventListener("click", () => {
    filter.classList.toggle("hidden");
    if (
      generate.classList.contains("hidden") &&
      filter.classList.contains("hidden")
    ) {
      left.classList.toggle("hidden");
    } else if (left.classList.contains("hidden")) {
      left.classList.toggle("hidden");
    }
  });

  document.getElementById("button-usage").addEventListener("click", () => {
    if (!archive.classList.contains("hidden"))
      archive.classList.toggle("hidden");
    usage.classList.toggle("hidden");
    if (
      usage.classList.contains("hidden") &&
      archive.classList.contains("hidden")
    ) {
      right.classList.toggle("hidden");
    } else if (right.classList.contains("hidden")) {
      right.classList.toggle("hidden");
    }
  });
  document.getElementById("button-archive").addEventListener("click", () => {
    if (!usage.classList.contains("hidden")) usage.classList.toggle("hidden");
    archive.classList.toggle("hidden");
    if (
      usage.classList.contains("hidden") &&
      archive.classList.contains("hidden")
    ) {
      right.classList.toggle("hidden");
    } else if (right.classList.contains("hidden")) {
      right.classList.toggle("hidden");
    }
  });
});
