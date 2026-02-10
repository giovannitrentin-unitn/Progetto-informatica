import pandas as pd

def estrai_colonne(df):   
    # Trasforma tutti i nomi delle colonne in minuscolo per il confronto
    colonne_lower = [c.lower() for c in df.columns]

    if "italiani" in colonne_lower and "stranieri" in colonne_lower:
        return ["Italiani", "Stranieri"]
    else: 
        return []