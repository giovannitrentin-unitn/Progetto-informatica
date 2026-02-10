import json
import pandas as pd
from collections import defaultdict

def conversione_json(df: pd.DataFrame):
    """
    Converte un DataFrame pandas in un JSON annidato e lo salva su file.
    Inserisce solo le colonne di provenienza (Italiani/Stranieri) effettivamente presenti.
    """
    # Definiamo quali colonne vogliamo mappare nel JSON se presenti
    provenienze_target = ["Italiani", "Stranieri"]
    # Filtriamo solo quelle che esistono davvero nel df
    colonne_presenti = [c for c in provenienze_target if c in df.columns]

    # Struttura annidata
    dati = defaultdict(lambda: defaultdict(list))

    for _, row in df.iterrows():
        metrica = row["Metrica"]
        periodo = row["Periodo"]

        # Creiamo il record base con l'ambito
        record = {"ambito": row["Ambito"]}
        
        # Aggiungiamo dinamicamente solo le colonne presenti
        for col in colonne_presenti:
            # Usiamo .lower() per la chiave JSON se preferisci (es. "italiani")
            record[col.lower()] = int(row[col])

        dati[metrica][periodo].append(record)
    
    return dati

