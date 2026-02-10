import pandas as pd

def carica_dati():
    # --------------------------------------------------
    # 1. Caricamento dati
    # --------------------------------------------------
    df = pd.read_csv("/data/dati.csv")
    df["Periodo"] = pd.to_datetime(df["Periodo"])
    return df