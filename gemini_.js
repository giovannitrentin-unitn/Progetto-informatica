// --- DATI E COSTANTI ---
const monthMap = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];
let rawData = { history: {}, forecast: {} }; // Assicurati che questo venga popolato dai tuoi dati
let currentMode = "history"; // Stato iniziale

// --- 1. INIZIALIZZAZIONE COMPONENTI (Popolamento Liste) ---

function initAmbitiList() {
  const container = document.getElementById("ambitiContainer");
  const ambiti = [
    "Trento, Monte Bondone e Altopiano di Pinè",
    "Val di Fiemme e Val di Cembra",
    "Val di Fassa",
    "San Martino di Castrozza, Primiero e Vanoi",
    "Valsugana, Tesino e Valle dei Mocheni",
    "Altipiani cimbri e Vigolana",
    "Rovereto, Vallagarina e Monte Baldo",
    "Garda trentino, Valle di Ledro, Terme di Comano e Valle dei Laghi",
    "Madonna di Campiglio, Pinzolo, Val Rendena",
    "Val di Sole",
    "Val di Non",
    "Altopiano della Paganella, Piana Rotaliana",
  ];

  // Checkbox "Tutte le Valli"
  const labelAll = document.createElement("label");
  labelAll.className = "checkbox-item";
  labelAll.innerHTML = `<input type="checkbox" id="chk-all-valli" checked onchange="toggleAllAmbiti(this)"> Tutte le Valli`;
  container.appendChild(labelAll);

  // Singoli Ambiti
  ambiti.forEach((a, i) => {
    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.innerHTML = `<input type="checkbox" class="ambito-checkbox" value="${i}" checked onchange="updateChart()"> ${a}`;
    container.appendChild(label);
  });
}

function initDateSelectors() {
  const startYearM = document.getElementById("startYearM");
  const endYearM = document.getElementById("endYearM");

  // Popola anni (range esteso per forecast)
  for (let y = 2013; y <= 2109; y++) {
    startYearM.add(new Option(y, y));
    endYearM.add(new Option(y, y));
  }

  const startMonthM = document.getElementById("startMonthM");
  const endMonthM = document.getElementById("endMonthM");

  // Popola mesi
  monthMap.forEach((m, i) => {
    startMonthM.add(new Option(m, i));
    endMonthM.add(new Option(m, i));
  });

  // Imposta valori di default
  startYearM.value = 2013;
  startMonthM.value = 0; // Gen
  endYearM.value = 2025;
  endMonthM.value = 11; // Dic
}

function initYearsFilter() {
  const container = document.getElementById("yearsFilterContainer");
  container.innerHTML = "";
  for (let year = 2013; year <= 2109; year++) {
    const label = document.createElement("label");
    label.className = "checkbox-item";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = year;
    input.id = `chk-year-${year}`;
    input.className = "year-checkbox";
    input.checked = year <= 2025; // Default check logica
    input.addEventListener("change", () => {
      updateChart();
    });
    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${year}`));
    container.appendChild(label);
  }
}

// --- 2. GESTIONE EVENTI (Interazione Utente) ---

function toggleAllAmbiti(source) {
  document.querySelectorAll(".ambito-checkbox").forEach((cb) => {
    cb.checked = source.checked;
  });
  updateChart();
}

function setMode(mode) {
  currentMode = mode;

  // Attiva tutti i filtri di base
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

  // Gestione pulsanti UI
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));

  const startYearM = document.getElementById("startYearM");
  const endYearM = document.getElementById("endYearM");
  const startMonthM = document.getElementById("startMonthM");
  const endMonthM = document.getElementById("endMonthM");

  // Imposta date in base alla modalità
  if (mode === "history") {
    document.getElementById("btnHistory").classList.add("active");
    startYearM.value = 2013;
    endYearM.value = 2024;
  } else if (mode === "forecast") {
    document.getElementById("btnGenerate").classList.add("active");
    startYearM.value = 2025;
    endYearM.value = 2109;
  } else {
    document.getElementById("btnAll").classList.add("active");
    startYearM.value = 2013;
    endYearM.value = 2109;
  }

  startMonthM.value = 0;
  endMonthM.value = 11;

  updateChart();
}

function resetFilters() {
  // Reset Date Selects
  const startYearM = document.getElementById("startYearM");
  const endYearM = document.getElementById("endYearM");
  if (startYearM.options.length > 0) startYearM.value = 2013;
  if (endYearM.options.length > 0) endYearM.value = 2025;
  document.getElementById("startMonthM").value = 0;
  document.getElementById("endMonthM").value = 11;

  // Reset Ambiti
  document
    .querySelectorAll(".ambito-checkbox")
    .forEach((cb) => (cb.checked = false));
  document.getElementById("chk-all-valli").checked = false;

  // Reset Anni Checkbox
  document
    .querySelectorAll(".year-checkbox")
    .forEach((cb) => (cb.checked = false));

  // Uncheck altri filtri
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

  // Reset stato visuale pulsanti modalità
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));
  currentMode = null;

  // Reset testi UI e grafico
  document.getElementById("chartTitle").textContent = "Pronto";
  document.getElementById("chartSubtitle").textContent = "Configura l'analisi";

  // Distruzione Grafico (Chart.js dependencies)
  if (typeof chartInstance !== "undefined" && chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  document.getElementById("mainChart").style.display = "none";
  document.getElementById("chartPlaceholder").style.display = "block";

  // Animazione icona reset
  const icon = document.querySelector(".reset-icon");
  if (icon) {
    icon.style.transform = "rotate(-360deg)";
    setTimeout(() => (icon.style.transform = "rotate(0deg)"), 500);
  }
}

// --- 3. LOGICA DI ESTRAZIONE DATI (Filtro Core) ---

function getDataBySelection() {
  let labels = [],
    arrivi = [],
    presenze = [];

  let startY = parseInt(document.getElementById("startYearM").value);
  let endY = parseInt(document.getElementById("endYearM").value);
  let startM = parseInt(document.getElementById("startMonthM").value);
  let endM = parseInt(document.getElementById("endMonthM").value);

  // Swap se data inizio > data fine
  if (startY > endY || (startY === endY && startM > endM)) {
    let tY = startY;
    startY = endY;
    endY = tY;
    let tM = startM;
    startM = endM;
    endM = tM;
  }

  // Ciclo sui dati per estrarre il range selezionato
  for (let y = startY; y <= endY; y++) {
    // rawData deve essere popolato esternamente (v. generateForecastData nel tuo codice originale)
    let d = rawData.history[y] || rawData.forecast[y];
    if (d) {
      monthMap.forEach((mName, mIdx) => {
        let valid = true;
        // Logica boundary mesi (es. Start: Marzo 2023 - End: Febbraio 2024)
        if (y === startY && mIdx < startM) valid = false;
        if (y === endY && mIdx > endM) valid = false;

        if (valid) {
          labels.push(`${mName} ${y}`);
          arrivi.push(d.Arrivi[mName]);
          presenze.push(d.Presenze[mName]);
        }
      });
    }
  }

  return { labels, arrivi, presenze };
}

// --- 4. GESTIONE AGGIORNAMENTO GRAFICO (Wrapper) ---

function toggleSeries() {
  // Richiede che 'chartInstance' sia accessibile globalmente
  if (typeof chartInstance === "undefined" || !chartInstance) return;

  // Dataset 0 = Presenze, Dataset 1 = Arrivi
  chartInstance.getDatasetMeta(0).hidden =
    !document.getElementById("chkPresenze").checked;
  chartInstance.getDatasetMeta(1).hidden =
    !document.getElementById("chkArrivi").checked;
  chartInstance.update();
}

// Nota: updateChart() è stata omessa parzialmente perché contiene la logica di disegno
// specifica di Chart.js, ma è la funzione che viene chiamata dagli 'onchange' nell'HTML.
// Dovrai mantenerla nel tuo file principale per inizializzare 'chartInstance'.

const monthMap = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];

// --- FILTER INIT ---

function initRangeFilters() {
  createRangeButtons(2013, 2024, 5, "historicRangeContainer");
  createRangeButtons(2025, 2109, 5, "forecastRangeContainer");
}

function createRangeButtons(startYear, endYear, step, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  for (let y = startYear; y <= endYear; y += step) {
    // Ensure ranges align with user request (e.g. 2013-2018, 2018-2023)
    // Using simple chunks for now: 2013-2017 (5 yrs), 2018-2022
    // Adjusted logic to match "2013-2018" style overlapping ranges if desired, or discrete chunks.
    // Standard UI usually uses discrete. Let's do y to y+4.
    let end = Math.min(y + step - 1, endYear);
    if (end < y) break;

    const btn = document.createElement("button");
    btn.className = "range-item";
    btn.textContent = `${y}-${end}`;
    btn.dataset.start = y;
    btn.dataset.end = end;
    btn.onclick = () => {
      toggleYearsRange(y, end, btn);
    };
    container.appendChild(btn);
  }
}

// --- SELECTION LOGIC ---
function toggleYearsRange(start, end, btnElement) {
  // Check if this range is currently "fully selected"
  // If fully selected, deselect it. If partial or none, select it.
  const checkboxes = document.querySelectorAll(".year-checkbox");
  let allChecked = true;

  // First pass check
  for (let y = start; y <= end; y++) {
    const cb = document.getElementById(`chk-year-${y}`);
    if (cb && !cb.checked) {
      allChecked = false;
      break;
    }
  }

  const newState = !allChecked; // Toggle

  for (let y = start; y <= end; y++) {
    const cb = document.getElementById(`chk-year-${y}`);
    if (cb) cb.checked = newState;
  }

  updateRangeButtonState();
  updateChart();
}

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
// GEMINI COSE
// --- 1. INIZIALIZZAZIONE COMPONENTI (Popolamento Liste) ---

function initAmbitiList() {
  const container = document.getElementById("ambitiContainer");
  const ambiti = [
    "Trento, Monte Bondone e Altopiano di Pinè",
    "Val di Fiemme e Val di Cembra",
    "Val di Fassa",
    "San Martino di Castrozza, Primiero e Vanoi",
    "Valsugana, Tesino e Valle dei Mocheni",
    "Altipiani cimbri e Vigolana",
    "Rovereto, Vallagarina e Monte Baldo",
    "Garda trentino, Valle di Ledro, Terme di Comano e Valle dei Laghi",
    "Madonna di Campiglio, Pinzolo, Val Rendena",
    "Val di Sole",
    "Val di Non",
    "Altopiano della Paganella, Piana Rotaliana",
  ];

  // Checkbox "Tutte le Valli"
  const labelAll = document.createElement("label");
  labelAll.className = "checkbox-item";
  labelAll.innerHTML = `<input type="checkbox" id="chk-all-valli" checked onchange="toggleAllAmbiti(this)"> Tutte le Valli`;
  container.appendChild(labelAll);

  // Singoli Ambiti
  ambiti.forEach((a, i) => {
    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.innerHTML = `<input type="checkbox" class="ambito-checkbox" value="${i}" checked onchange="updateChart()"> ${a}`;
    container.appendChild(label);
  });
}

function initDateSelectors() {
  const startYearM = document.getElementById("startYearM");
  const endYearM = document.getElementById("endYearM");

  // Popola anni (range esteso per forecast)
  for (let y = 2013; y <= 2109; y++) {
    startYearM.add(new Option(y, y));
    endYearM.add(new Option(y, y));
  }

  const startMonthM = document.getElementById("startMonthM");
  const endMonthM = document.getElementById("endMonthM");

  // Popola mesi
  monthMap.forEach((m, i) => {
    startMonthM.add(new Option(m, i));
    endMonthM.add(new Option(m, i));
  });

  // Imposta valori di default
  startYearM.value = 2013;
  startMonthM.value = 0; // Gen
  endYearM.value = 2025;
  endMonthM.value = 11; // Dic
}

function initYearsFilter() {
  const container = document.getElementById("yearsFilterContainer");
  container.innerHTML = "";
  for (let year = 2013; year <= 2109; year++) {
    const label = document.createElement("label");
    label.className = "checkbox-item";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = year;
    input.id = `chk-year-${year}`;
    input.className = "year-checkbox";
    input.checked = year <= 2025; // Default check logica
    input.addEventListener("change", () => {
      updateChart();
    });
    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${year}`));
    container.appendChild(label);
  }
}

// --- 2. GESTIONE EVENTI (Interazione Utente) ---

function toggleAllAmbiti(source) {
  document.querySelectorAll(".ambito-checkbox").forEach((cb) => {
    cb.checked = source.checked;
  });
  updateChart();
}

function setMode(mode) {
  currentMode = mode;

  // Attiva tutti i filtri di base
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

  // Gestione pulsanti UI
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));

  const startYearM = document.getElementById("startYearM");
  const endYearM = document.getElementById("endYearM");
  const startMonthM = document.getElementById("startMonthM");
  const endMonthM = document.getElementById("endMonthM");

  // Imposta date in base alla modalità
  if (mode === "history") {
    document.getElementById("btnHistory").classList.add("active");
    startYearM.value = 2013;
    endYearM.value = 2024;
  } else if (mode === "forecast") {
    document.getElementById("btnGenerate").classList.add("active");
    startYearM.value = 2025;
    endYearM.value = 2109;
  } else {
    document.getElementById("btnAll").classList.add("active");
    startYearM.value = 2013;
    endYearM.value = 2109;
  }

  startMonthM.value = 0;
  endMonthM.value = 11;

  updateChart();
}

function resetFilters() {
  // Reset Date Selects
  const startYearM = document.getElementById("startYearM");
  const endYearM = document.getElementById("endYearM");
  if (startYearM.options.length > 0) startYearM.value = 2013;
  if (endYearM.options.length > 0) endYearM.value = 2025;
  document.getElementById("startMonthM").value = 0;
  document.getElementById("endMonthM").value = 11;

  // Reset Ambiti
  document
    .querySelectorAll(".ambito-checkbox")
    .forEach((cb) => (cb.checked = false));
  document.getElementById("chk-all-valli").checked = false;

  // Reset Anni Checkbox
  document
    .querySelectorAll(".year-checkbox")
    .forEach((cb) => (cb.checked = false));

  // Uncheck altri filtri
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

  // Reset stato visuale pulsanti modalità
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));
  currentMode = null;

  // Reset testi UI e grafico
  document.getElementById("chartTitle").textContent = "Pronto";
  document.getElementById("chartSubtitle").textContent = "Configura l'analisi";

  // Distruzione Grafico (Chart.js dependencies)
  if (typeof chartInstance !== "undefined" && chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  document.getElementById("mainChart").style.display = "none";
  document.getElementById("chartPlaceholder").style.display = "block";

  // Animazione icona reset
  const icon = document.querySelector(".reset-icon");
  if (icon) {
    icon.style.transform = "rotate(-360deg)";
    setTimeout(() => (icon.style.transform = "rotate(0deg)"), 500);
  }
}

// --- 3. LOGICA DI ESTRAZIONE DATI (Filtro Core) ---

function getDataBySelection() {
  let labels = [],
    arrivi = [],
    presenze = [];

  let startY = parseInt(document.getElementById("startYearM").value);
  let endY = parseInt(document.getElementById("endYearM").value);
  let startM = parseInt(document.getElementById("startMonthM").value);
  let endM = parseInt(document.getElementById("endMonthM").value);

  // Swap se data inizio > data fine
  if (startY > endY || (startY === endY && startM > endM)) {
    let tY = startY;
    startY = endY;
    endY = tY;
    let tM = startM;
    startM = endM;
    endM = tM;
  }

  // Ciclo sui dati per estrarre il range selezionato
  for (let y = startY; y <= endY; y++) {
    // rawData deve essere popolato esternamente (v. generateForecastData nel tuo codice originale)
    let d = rawData.history[y] || rawData.forecast[y];
    if (d) {
      monthMap.forEach((mName, mIdx) => {
        let valid = true;
        // Logica boundary mesi (es. Start: Marzo 2023 - End: Febbraio 2024)
        if (y === startY && mIdx < startM) valid = false;
        if (y === endY && mIdx > endM) valid = false;

        if (valid) {
          labels.push(`${mName} ${y}`);
          arrivi.push(d.Arrivi[mName]);
          presenze.push(d.Presenze[mName]);
        }
      });
    }
  }

  return { labels, arrivi, presenze };
}

// --- 4. GESTIONE AGGIORNAMENTO GRAFICO (Wrapper) ---

function toggleSeries() {
  // Richiede che 'chartInstance' sia accessibile globalmente
  if (typeof chartInstance === "undefined" || !chartInstance) return;

  // Dataset 0 = Presenze, Dataset 1 = Arrivi
  chartInstance.getDatasetMeta(0).hidden =
    !document.getElementById("chkPresenze").checked;
  chartInstance.getDatasetMeta(1).hidden =
    !document.getElementById("chkArrivi").checked;
  chartInstance.update();
}
