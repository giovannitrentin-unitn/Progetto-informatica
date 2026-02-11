import pandas as pd

def carica_dati(input_file="app/data/dati.csv"):
    # --------------------------------------------------
    # 1. Caricamento dati
    # --------------------------------------------------
    df = pd.read_csv(input_file)
    df["Periodo"] = pd.to_datetime(df["Periodo"])
    return df