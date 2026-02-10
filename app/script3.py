import pandas as pd
from chronos import BaseChronosPipeline

# --------------------------------------------------
# 1. Caricamento dati
# --------------------------------------------------
df = pd.read_csv("dati.csv")
df["Periodo"] = pd.to_datetime(df["Periodo"])

# --------------------------------------------------
# 2. Trasformazione WIDE -> LONG
# --------------------------------------------------
df_long = df.melt(
    id_vars=["Metrica", "Ambito", "Periodo"],
    value_vars=["Italiani", "Stranieri"],
    var_name="Nazionalita",
    value_name="Valore"
)

# --------------------------------------------------
# 3. Creazione ID unico
# --------------------------------------------------
df_long["series_id"] = (
    df_long["Metrica"].astype(str) + "|" +
    df_long["Ambito"].astype(str) + "|" +
    df_long["Nazionalita"].astype(str)
)
df_long = df_long.sort_values(["series_id", "Periodo"]).reset_index(drop=True)

# --------------------------------------------------
# 4. Caricamento modello Chronos
# --------------------------------------------------
pipeline = BaseChronosPipeline.from_pretrained(
    "autogluon/chronos-2",
    device_map="auto",
    torch_dtype="auto"
)

# --------------------------------------------------
# 5. Predizione
# --------------------------------------------------
pred_df = pipeline.predict_df(
    df_long,
    prediction_length=1024,
    quantile_levels=[0,0.1,0.2,0.3,0.4, 0.5,0.6,0.7,0.8, 0.9,1],
    id_column="series_id",
    timestamp_column="Periodo",
    target="Valore"
)

# --------------------------------------------------
# 6. Preprocessing output
# --------------------------------------------------
if "start_timestamp" in pred_df.columns:
    pred_df = pred_df.rename(columns={"start_timestamp": "Periodo"})

if "predictions" not in pred_df.columns:
    if "0.5" in pred_df.columns:
        pred_df["predictions"] = pred_df["0.5"]

pred_df[["Metrica", "Ambito", "Nazionalita"]] = pred_df["series_id"].str.split("|", expand=True)

pred_wide = pred_df.pivot_table(
    index=["Periodo", "Metrica", "Ambito"],
    columns="Nazionalita",
    values="predictions"
).reset_index()

pred_wide = pred_wide[["Metrica", "Periodo", "Ambito", "Italiani", "Stranieri"]]

# --------------------------------------------------
# 7. Arrotondamento
# --------------------------------------------------
pred_wide["Italiani"] = pred_wide["Italiani"].round(0).astype(int)
pred_wide["Stranieri"] = pred_wide["Stranieri"].round(0).astype(int)

# --------------------------------------------------
# 8. Salvataggio e output
# --------------------------------------------------
print(pred_wide.head())
pred_wide.to_csv("previsioni_finali_arrotondate.csv", index=False)
