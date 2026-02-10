import pandas as pd
from chronos import BaseChronosPipeline

# ---------------------------------------
# 1️⃣ Inizializza pipeline
# ---------------------------------------
pipeline = BaseChronosPipeline.from_pretrained(
    "autogluon/chronos-2", device_map="auto", torch_dtype="auto"
)

# ---------------------------------------
# 2️⃣ Carica dati storici
# ---------------------------------------
context_df = pd.read_csv("./csvFiles/arrivi_e_presenze_negli_esercizi_extralberghieri.csv")



# mappa mesi italiani → numero
mesi = {
    "Gennaio": 1, "Febbraio": 2, "Marzo": 3, "Aprile": 4,
    "Maggio": 5, "Giugno": 6, "Luglio": 7, "Agosto": 8,
    "Settembre": 9, "Ottobre": 10, "Novembre": 11, "Dicembre": 12
}

# estrai solo "Mese Anno"
estratto = context_df["Periodo"].str.extract(
    r"^(Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre)\s(\d{4})$"
)
mask = estratto.notna().all(axis=1)
context_df = context_df.loc[mask].copy()
estratto = estratto.loc[mask]

# crea colonna Periodo datetime
context_df["Periodo"] = pd.to_datetime(
    estratto[1] + "-" + estratto[0].map(mesi).astype(str).str.zfill(2) + "-01",
    format="%Y-%m-%d"
)

# rimuovi eventuali duplicati
context_df = context_df.drop_duplicates(subset=["Metrica", "Periodo"])

# ---------------------------------------
# 3️⃣ Assicura frequenza mensile regolare per ogni serie
# ---------------------------------------
context_df = (
    context_df
    .sort_values(["Metrica", "Periodo"])
    .groupby("Metrica")
    .apply(lambda x: x.set_index("Periodo").asfreq("MS"))  # MS = Month Start
    .reset_index()
)

# ---------------------------------------
# 4️⃣ Lista colonne da predire
# ---------------------------------------
target_cols = [
    "Affittacamere_IT","Affittacamere_EST",
    "Campeggi_Agritur_IT","Campeggi_Agritur_EST",
    "Altri_IT","Altri_EST",
]

# ---------------------------------------
# 5️⃣ Loop predizione colonna per colonna
# ---------------------------------------
all_preds = []

for col in target_cols:
    print(f"Predicting {col}...")

    pred = pipeline.predict_df(
        context_df,
        prediction_length=36,
        quantile_levels=[0.1, 0.2, 0.3, 0.4 ,0.5, 0.6, 0.7, 0.8, 0.9],  # solo valore centrale
        id_column="Metrica",
        timestamp_column="Periodo",
        target=col
    )
    all_preds.append(pred)

# concatena tutte le predizioni
pred_df = pd.concat(all_preds, ignore_index=True)

# ---------------------------------------
# 6️⃣ Pivot per wide table
# ---------------------------------------
wide_pred = (
    pred_df
    .pivot_table(
        index=["Metrica", "Periodo"],
        columns="target_name",
        values="0.5"
    )
    .reset_index()
)

# ---------------------------------------
# Converti tutte le colonne predette in interi
# ---------------------------------------
# target_cols = lista di colonne predette
for col in target_cols:
    if col in wide_pred.columns:
        wide_pred[col] = wide_pred[col].round(0).astype(int)

# ---------------------------------------
# 7️⃣ Calcola Totali (somma colonne IT, EST, TOT)
# ---------------------------------------
# esempio: Totale per Affittacamere_IT+Campeggi+Altri_IT
wide_pred["Affittacamere_TOT"] = (
    wide_pred["Affittacamere_IT"] + 
    wide_pred["Affittacamere_EST"] 
)

wide_pred["Campeggi_Agritur_TOT"] = (
    wide_pred["Campeggi_Agritur_IT"] + 
    wide_pred["Campeggi_Agritur_EST"] 
)

wide_pred["Altri_TOT"] = (
    wide_pred["Altri_IT"] + 
    wide_pred["Altri_EST"] 
)


wide_pred["TotaTotale_Generale_IT"] = (
    wide_pred["Affittacamere_IT"] + 
    wide_pred["Campeggi_Agritur_IT"] + 
    wide_pred["Altri_IT"]
)

wide_pred["Totale_Generale_EST"] = (
    wide_pred["Affittacamere_EST"] + 
    wide_pred["Campeggi_Agritur_EST"] + 
    wide_pred["Altri_EST"]
)

wide_pred["Totale_Generale_TOT"] = (
    wide_pred["Affittacamere_TOT"] + 
    wide_pred["Campeggi_Agritur_TOT"] + 
    wide_pred["Altri_TOT"]
)

# ---------------------------------------
# 8️⃣ Salva in CSV
# ---------------------------------------
wide_pred.to_csv(r"./csvFiles/result/predizioni_chronos.csv", index=False)

print("✅ Tutto pronto! CSV salvato in predizioni_chronos.csv")
