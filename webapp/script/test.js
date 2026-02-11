const MIN_YEAR = 2013;
const MAX_YEAR = 2024;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
let data = null;
let chartInstance = null;
let currentMode = "history";

// --- THEME ENGINE ---
function toggleTheme(restore = false) {
  const html = document.documentElement;
  const switchBtn = document.getElementById("themeSwitch");
  let theme = "";
  if (restore) {
    theme = localStorage.getItem("theme");
  } else {
    const current = html.getAttribute("data-theme");
    theme = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", theme);
  }
  html.setAttribute("data-theme", theme);
  switchBtn.setAttribute("data-mode", theme);
  updateChart();
}

function getChartColors() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    grid: isDark ? "#334155" : "#e2e8f0",
    text: isDark ? "#94a3b8" : "#64748b",
    arrivi: computedStyle.getPropertyValue("--secondary").trim(),
    presenze: computedStyle.getPropertyValue("--accent").trim(),
    forecastArrivi: computedStyle.getPropertyValue("--forecast-arrivi").trim(),
    forecastPresenze: computedStyle
      .getPropertyValue("--forecast-presenze")
      .trim(),
  };
}

// --- UI LOGIC ---
function toggleSidebar(side = null) {
  const sidebars = {
    leftfilter: {
      element: document.getElementById("sidebarLeftFilter"),
      button: document.getElementById("btnToggleLeftFilter"),
      group: "left",
    },
    leftgenerate: {
      element: document.getElementById("sidebarLeftGenerate"),
      button: document.getElementById("btnToggleLeftGenerate"),
      group: "left",
    },
    right: {
      element: document.getElementById("sidebarRight"),
      button: document.getElementById("btnToggleRight"),
      group: "right",
    },
  };

  const current = sidebars[side];
  if (!current) return;

  // Se è una sidebar di sinistra, chiudo le altre di sinistra
  if (current.group === "left") {
    Object.values(sidebars).forEach((s) => {
      if (s.group === "left" && s !== current) {
        s.element.classList.add("collapsed");
        s.button.classList.remove("active");
      }
    });
  }

  // Toggle della selezionata
  current.element.classList.toggle("collapsed");
  current.button.classList.toggle("active");

  setTimeout(() => {
    if (chartInstance) chartInstance.resize();
  }, 400);
}

function resetFilters() {
  document
    .querySelectorAll(".year-checkbox")
    .forEach((cb) => (cb.checked = false));
  // Clear range visual selection
  document
    .querySelectorAll(".range-item")
    .forEach((btn) => btn.classList.remove("selected"));

  document.getElementById("locationFilter").value = "all";
  [
    "chkHotel",
    "chkExtra",
    "chkIta",
    "chkStr",
    "chkPresenze",
    "chkArrivi",
  ].forEach((id) => {
    document.getElementById(id).checked = false;
  });
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));
  currentMode = null;

  document.getElementById("chartTitle").textContent = "Pronto";
  document.getElementById("chartSubtitle").textContent = "Configura l'analisi";

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  document.getElementById("mainChart").style.display = "none";
  document.getElementById("chartPlaceholder").style.display = "block";

  const icon = document.querySelector(".reset-icon");
  icon.style.transform = "rotate(-360deg)";
  setTimeout(() => (icon.style.transform = "rotate(0deg)"), 500);
}

// --- FILTER SECTION ---

// --- SELECTION LOGIC ---

function updateRangeButtonState() {
  // Update visual state of all range buttons based on underlying checkboxes
  document.querySelectorAll(".range-item").forEach((btn) => {
    const start = parseInt(btn.dataset.start);
    const end = parseInt(btn.dataset.end);
    let allChecked = true;
    for (let y = start; y <= end; y++) {
      const cb = document.getElementById(`chk-year-${y}`);
      if (cb && !cb.checked) {
        allChecked = false;
        break;
      }
    }
    if (allChecked) btn.classList.add("selected");
    else btn.classList.remove("selected");
  });
}

function getSelectedYears() {
  return Array.from(document.querySelectorAll(".year-checkbox:checked"))
    .map((cb) => parseInt(cb.value))
    .sort((a, b) => a - b);
}

function getDataBySelection() {
  let labels = [],
    arrivi = [],
    presenze = [];
  getSelectedYears().forEach((year) => {
    let d = rawData.history[year] || rawData.forecast[year];
    if (d) {
      monthMap.forEach((m) => {
        labels.push(`${m} ${year}`);
        arrivi.push(d.Arrivi[m]);
        presenze.push(d.Presenze[m]);
      });
    }
  });
  return { labels, arrivi, presenze };
}

function isForecast(label) {
  if (!label) return false;
  const parts = label.split(" ");
  const year = parseInt(parts[1]);
  return year >= 2026;
}

function updateChart() {
  const selectedYears = getSelectedYears();
  if (selectedYears.length === 0) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    document.getElementById("mainChart").style.display = "none";
    document.getElementById("chartPlaceholder").style.display = "block";
    return;
  }

  document.getElementById("chartPlaceholder").style.display = "none";
  document.getElementById("mainChart").style.display = "block";

  const ctx = document.getElementById("mainChart").getContext("2d");
  const data = getDataBySelection();

  // Text logic
  const t = document.getElementById("chartTitle");
  const s = document.getElementById("chartSubtitle");
  if (currentMode === "history") {
    t.textContent = "Dati Storici";
    s.textContent = "Visualizzazione storico";
  } else if (currentMode === "forecast") {
    t.textContent = "Previsione Futura";
    s.textContent = "Visualizzazione previsione";
  } else {
    t.textContent = "Analisi Completa";
    s.textContent = "Visualizzazione dati selezionati";
  }

  const colors = getChartColors();

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Presenze",
          data: data.presenze,
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 6,
          segment: {
            borderColor: (ctx) =>
              isForecast(data.labels[ctx.p1DataIndex])
                ? colors.forecastPresenze
                : colors.presenze,
            borderDash: (ctx) =>
              isForecast(data.labels[ctx.p1DataIndex]) ? [5, 5] : [],
          },
        },
        {
          label: "Arrivi",
          data: data.arrivi,
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 6,
          segment: {
            borderColor: (ctx) =>
              isForecast(data.labels[ctx.p1DataIndex])
                ? colors.forecastArrivi
                : colors.arrivi,
            borderDash: (ctx) =>
              isForecast(data.labels[ctx.p1DataIndex]) ? [5, 5] : [],
          },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor:
            document.documentElement.getAttribute("data-theme") === "dark"
              ? "#334155"
              : "#1e293b",
          titleColor: "#f8fafc",
          bodyColor: "#f8fafc",
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 10,
            color: colors.text,
            font: { family: "Plus Jakarta Sans" },
          },
        },
        y: {
          border: { display: false },
          grid: { color: colors.grid, borderDash: [5, 5] },
          ticks: {
            callback: (v) => v / 1000 + "k",
            color: colors.text,
            font: { family: "Plus Jakarta Sans" },
          },
        },
      },
      interaction: { mode: "nearest", axis: "x", intersect: false },
    },
  });
  toggleSeries();
}

function toggleSeries() {
  if (!chartInstance) return;
  chartInstance.getDatasetMeta(0).hidden =
    !document.getElementById("chkPresenze").checked;
  chartInstance.getDatasetMeta(1).hidden =
    !document.getElementById("chkArrivi").checked;
  chartInstance.update();
}

function setMode(mode) {
  // Note: Completo button now simply sets mode label, doesn't force selection
  currentMode = mode;
  [
    "chkHotel",
    "chkExtra",
    "chkIta",
    "chkStr",
    "chkPresenze",
    "chkArrivi",
  ].forEach((id) => {
    document.getElementById(id).checked = true;
  });
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));

  if (mode === "history") {
    document.getElementById("btnHistory").classList.add("active");
    // Select only historic range for "Storico" preset
    document.querySelectorAll(".year-checkbox").forEach((cb) => {
      cb.checked = parseInt(cb.value) <= 2024;
    });
  } else if (mode === "forecast") {
    document.getElementById("btnGenerate").classList.add("active");
    // Select only forecast range for "Generate" preset
    document.querySelectorAll(".year-checkbox").forEach((cb) => {
      cb.checked = parseInt(cb.value) >= 2025;
    });
  } else {
    document.getElementById("btnAll").classList.add("active");
    // "Completo" DOES NOT change selection, just mode label as requested
  }

  updateRangeButtonState(); // Sync range buttons
  updateChart();
}

function generateForecast() {
  const predictionLength = parseInt(
    document.getElementById("predictionLength").value,
  );

  const predictionPrecision = parseInt(
    document.getElementById("predictionPrecision").value,
  );

  // Ambito mensile selezionato
  const ambito = Array.from(
    document.querySelectorAll(".ambito-item:checked"),
  ).map((el) => el.value);

  const target = Array.from(
    document.querySelectorAll(".target-item:checked"),
  ).map((el) => el.value);

  const metrica = Array.from(
    document.querySelectorAll(".metrica-item:checked"),
  ).map((el) => el.value);

  return {
    filters: {
      prediction_length: predictionLength,
      prediction_precision: predictionPrecision,
      ambito_mensile: ambito,
      target: target,
      metrica: metrica,
      periodo_dati: [periodStart, periodEnd],
      periodo_previsione: getPeriodoSelezionato(),
    },
  };

  // Richiesta di generazione
  // Riceviamo i dati
  // visualizziamo i dati
}

function enforceAtLeastOne(groupClass) {
  const checkboxes = document.querySelectorAll("." + groupClass);

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const checked = document.querySelectorAll("." + groupClass + ":checked");

      if (checked.length === 0) {
        checkbox.checked = true; // riattiva l'ultimo deselezionato
      }
    });
  });
}

function initAmbitoMensile() {
  const ambitoItems = document.querySelectorAll(".ambito-item");
  const modeRadios = document.querySelectorAll('input[name="ambitoMode"]');

  if (!ambitoItems.length || !modeRadios.length) return;

  // ---- CLICK RADIO (Tutti / Strutture / Luoghi)
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;

      const value = radio.value;

      ambitoItems.forEach((item) => {
        if (value === "all") {
          item.checked = true;
        } else if (value === "strutture") {
          item.checked = item.classList.contains("strutture");
        } else if (value === "luoghi") {
          item.checked = item.classList.contains("luoghi");
        }
      });
    });
  });

  // ---- CLICK MANUALE CHECKBOX
  ambitoItems.forEach((item) => {
    item.addEventListener("change", updateAmbitoMode);
  });

  function updateAmbitoMode() {
    const all = Array.from(ambitoItems);
    const checked = all.filter((i) => i.checked);

    const strutture = all.filter((i) => i.classList.contains("strutture"));
    const luoghi = all.filter((i) => i.classList.contains("luoghi"));

    const allChecked = checked.length === all.length;

    const onlyStrutture =
      strutture.every((i) => i.checked) && luoghi.every((i) => !i.checked);

    const onlyLuoghi =
      luoghi.every((i) => i.checked) && strutture.every((i) => !i.checked);

    // Reset radio
    modeRadios.forEach((r) => (r.checked = false));

    if (allChecked) {
      document.querySelector('input[value="all"]').checked = true;
    } else if (onlyStrutture) {
      document.querySelector('input[value="strutture"]').checked = true;
    } else if (onlyLuoghi) {
      document.querySelector('input[value="luoghi"]').checked = true;
    }
    // Se misto → restano tutti vuoti
  }
}

function initGenerationValidation() {
  const predictionLength = document.getElementById("predictionLength");
  const predictionPrecision = document.getElementById("predictionPrecision");

  // ---- VALIDAZIONE NUMERI ----
  function clampNumber(input) {
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    let value = parseInt(input.value);

    if (isNaN(value)) value = min;

    if (value < min) value = min;
    if (value > max) value = max;

    input.value = value;
  }

  predictionLength.addEventListener("change", () =>
    clampNumber(predictionLength),
  );

  predictionPrecision.addEventListener("change", () =>
    clampNumber(predictionPrecision),
  );

  clampNumber(predictionLength);
  clampNumber(predictionPrecision);
}

function setPeriodType(type) {
  currentPeriodType = type;
  const btnYear = document.getElementById("btnPeriodYear");
  const btnMonth = document.getElementById("btnPeriodMonth");
  const rowYear = document.getElementById("periodYearRow");
  const rowMonth = document.getElementById("periodMonthRow");

  if (type === "year") {
    btnYear.classList.add("active");
    btnMonth.classList.remove("active");
    rowYear.style.display = "flex";
    rowMonth.style.display = "none";
  } else {
    btnYear.classList.remove("active");
    btnMonth.classList.add("active");
    rowYear.style.display = "none";
    rowMonth.style.display = "flex";
  }
}

function initPeriodoSelector() {
  const startYear = document.getElementById("startYear");
  const endYear = document.getElementById("endYear");

  const startMonthM = document.getElementById("startMonthM");
  const startYearM = document.getElementById("startYearM");
  const endMonthM = document.getElementById("endMonthM");
  const endYearM = document.getElementById("endYearM");

  // -------- POPOLA ANNI --------
  for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
    startYear.innerHTML += `<option value="${y}">${y}</option>`;
    endYear.innerHTML += `<option value="${y}">${y}</option>`;
    startYearM.innerHTML += `<option value="${y}">${y}</option>`;
    endYearM.innerHTML += `<option value="${y}">${y}</option>`;
  }

  // -------- POPOLA MESI --------
  for (let m = 1; m <= 12; m++) {
    const label = m.toString().padStart(2, "0");
    startMonthM.innerHTML += `<option value="${m}">${label}</option>`;
    endMonthM.innerHTML += `<option value="${m}">${label}</option>`;
  }

  // Default valori
  startYear.value = MIN_YEAR;
  endYear.value = MAX_YEAR;

  startYearM.value = MIN_YEAR;
  endYearM.value = MAX_YEAR;
  startMonthM.value = 1;
  endMonthM.value = 12;

  // Eventi validazione
  startYear.addEventListener("change", validateYearRange);
  endYear.addEventListener("change", validateYearRange);

  startYearM.addEventListener("change", validateMonthRange);
  endYearM.addEventListener("change", validateMonthRange);
  startMonthM.addEventListener("change", validateMonthRange);
  endMonthM.addEventListener("change", validateMonthRange);

  validateYearRange();
  validateMonthRange();
}

function validateYearRange() {
  const startYear = document.getElementById("startYear");
  const endYear = document.getElementById("endYear");

  let start = parseInt(startYear.value);
  let end = parseInt(endYear.value);

  if (start < MIN_YEAR) start = MIN_YEAR;
  if (end > MAX_YEAR) end = MAX_YEAR;

  if (start > end) start = end;

  startYear.value = start;
  endYear.value = end;
}

function validateMonthRange() {
  const sY = parseInt(document.getElementById("startYearM").value);
  const eY = parseInt(document.getElementById("endYearM").value);
  const sM = parseInt(document.getElementById("startMonthM").value);
  const eM = parseInt(document.getElementById("endMonthM").value);

  let startDate = new Date(sY, sM - 1);
  let endDate = new Date(eY, eM - 1);

  const minDate = new Date(MIN_YEAR, 0);
  const maxDate = new Date(MAX_YEAR, 11);

  if (startDate < minDate) startDate = minDate;
  if (endDate > maxDate) endDate = maxDate;

  if (startDate > endDate) startDate = endDate;

  // Riassegna valori corretti
  document.getElementById("startYearM").value = startDate.getFullYear();
  document.getElementById("startMonthM").value = startDate.getMonth() + 1;

  document.getElementById("endYearM").value = endDate.getFullYear();
  document.getElementById("endMonthM").value = endDate.getMonth() + 1;
}

function getPeriodoSelezionato() {
  const isYearMode = document
    .getElementById("btnPeriodYear")
    .classList.contains("active");

  if (isYearMode) {
    const start = document.getElementById("startYear").value + "-01";
    const end = document.getElementById("endYear").value + "-12";
    return [start, end];
  } else {
    const sY = document.getElementById("startYearM").value;
    const sM = document.getElementById("startMonthM").value.padStart(2, "0");

    const eY = document.getElementById("endYearM").value;
    const eM = document.getElementById("endMonthM").value.padStart(2, "0");

    return [`${sY}-${sM}`, `${eY}-${eM}`];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  toggleTheme(true);
  initYearsFilter();
  initRangeFilters();
  // Start with history checked but update visual state
  updateRangeButtonState();
  setMode("history");
  enforceAtLeastOne("target-item");
  enforceAtLeastOne("metrica-item");
  initAmbitoMensile();
  initGenerationValidation();
  initPeriodoSelector();
});
