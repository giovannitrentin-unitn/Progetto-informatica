import pandas as pd

def carica_dati(pred_df: pd.DataFrame):
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
    return pred_wide
