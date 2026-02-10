import pandas as pd

def carica_dati(df: pd.DataFrame):
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
    return df_long

