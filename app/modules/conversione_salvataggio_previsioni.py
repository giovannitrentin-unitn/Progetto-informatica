import json
from collections import defaultdict
import pandas as pd

def conversione_salvataggio_previsioni(df: pd.DataFrame, output_json: str) -> None:
    """
    Converte un DataFrame pandas in un JSON annidato e lo salva su file.
    
    Parametri:
    - df: pd.DataFrame con colonne ["Metrica", "Periodo", "Ambito", "Italiani", "Stranieri"]
    - output_json: percorso del file JSON da creare
    """
    # Struttura annidata
    dati = defaultdict(lambda: defaultdict(list))

    for _, row in df.iterrows():
        metrica = row["Metrica"]
        periodo = row["Periodo"]

        dati[metrica][periodo].append({
            "ambito": row["Ambito"],
            "italiani": int(row["Italiani"]),
            "stranieri": int(row["Stranieri"])
        })
    
    # Salva direttamente su file
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(dati, f, ensure_ascii=False, indent=2)

    print(f"JSON creato con successo su '{output_json}'")

