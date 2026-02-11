import pandas as pd

def salva_dataframe_csv(df: pd.DataFrame, nome_file="risultato_analisi.csv"):
    """
    Salva il DataFrame in un file CSV con impostazioni ottimizzate.
    """
    try:
        # index=False evita di salvare la colonna dei numeri di riga (0, 1, 2...)
        # sep=';' è spesso preferibile per Excel in Italia
        # encoding='utf-8-sig' assicura che Excel legga bene gli accenti (es. 'Pinè')
        df.to_csv(nome_file, index=False, sep=';', encoding='utf-8-sig')
        
        print(f"✅ DataFrame salvato con successo in: {nome_file}")
    except Exception as e:
        print(f"❌ Errore durante il salvataggio: {e}")
