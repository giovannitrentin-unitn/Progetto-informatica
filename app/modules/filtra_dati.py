import pandas as pd

def filtra_turismo_smart(df, livello='mensile', metrica=None, ambiti=None, data_inizio=None, data_fine=None):
    """
    Filtra e aggrega i dati in base al livello di dettaglio richiesto.
    Versione semplificata: non include filtri per provenienza.
    """
    df_filtered = df.copy()
    df_filtered['Periodo'] = pd.to_datetime(df_filtered['Periodo'])

    # 1. GESTIONE LIVELLO (ANNUALE vs MENSILE)
    # Identifichiamo le righe relative alle tipologie strutturali
    keywords_strutture = ['alberghieri', 'extralberghieri']
    mask_strutture = df_filtered['Ambito'].str.contains('|'.join(keywords_strutture), case=False, na=False)
    
    if livello.lower() == 'annuale':
        # Rinominiamo gli ambiti per l'aggregazione totale
        df_filtered['Ambito'] = 'Totale luoghi'
        df_filtered.loc[mask_strutture, 'Ambito'] = 'Totale strutture'
        
        # Tronchiamo la data all'anno
        df_filtered['Periodo'] = df_filtered['Periodo'].dt.to_period('Y').dt.to_timestamp()
        
        # Aggreghiamo sommando tutte le colonne numeriche (Arrivi, Presenze, etc.)
        df_filtered = df_filtered.groupby(['Metrica', 'Periodo', 'Ambito'], as_index=False).sum(numeric_only=True)
    
    # 2. FILTRO METRICA
    if metrica:
        if isinstance(metrica, str): metrica = [metrica]
        df_filtered = df_filtered[df_filtered['Metrica'].isin(metrica)]

    # 3. FILTRO AMBITI
    if ambiti:
        if isinstance(ambiti, str): ambiti = [ambiti]
        pattern = '|'.join(ambiti)
        df_filtered = df_filtered[df_filtered['Ambito'].str.contains(pattern, case=False, na=False)]

    # 4. FILTRO PERIODO
    if data_inizio:
        if livello == 'annuale':
            anno_inz = pd.to_datetime(data_inizio).year
            if data_fine:
                anno_fin = pd.to_datetime(data_fine).year
                df_filtered = df_filtered[df_filtered['Periodo'].dt.year.between(anno_inz, anno_fin)]
            else:
                df_filtered = df_filtered[df_filtered['Periodo'].dt.year == anno_inz]
        else:
            inz = pd.to_datetime(data_inizio).to_period('M')
            if data_fine:
                fin = pd.to_datetime(data_fine).to_period('M')
                mask = (df_filtered['Periodo'].dt.to_period('M') >= inz) & \
                       (df_filtered['Periodo'].dt.to_period('M') <= fin)
                df_filtered = df_filtered[mask]
            else:
                df_filtered = df_filtered[df_filtered['Periodo'].dt.to_period('M') == inz]

    # 5. FORMATTAZIONE FINALE
    if livello == 'annuale':
        df_filtered['Periodo'] = df_filtered['Periodo'].dt.strftime('%Y')
    else:
        df_filtered['Periodo'] = df_filtered['Periodo'].dt.strftime('%Y-%m-%d')

    return df_filtered.sort_values(['Periodo', 'Metrica'])
