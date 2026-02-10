import pandas as pd

def filtra_turismo_smart(df, livello='mensile', metrica=None, ambiti=None, data_inizio=None, data_fine=None):
    """
    Filtra e aggrega i dati in base al livello di dettaglio richiesto.
    
    :param livello: 'mensile' (dettaglio completo) o 'annuale' (solo totali aggregati)
    :param metrica: 'Arrivi' o 'Presenze'
    :param ambiti: Parola chiave per filtro parziale (es. 'Fassa')
    :param data_inizio: Data o Anno di inizio
    :param data_fine: Data o Anno di fine (opzionale)
    """
    df_filtered = df.copy()
    df_filtered['Periodo'] = pd.to_datetime(df_filtered['Periodo'])

    # 1. GESTIONE LIVELLO (ANNUALE vs MENSILE)
    keywords_strutture = ['alberghieri', 'extralberghieri']
    mask_strutture = df_filtered['Ambito'].str.contains('|'.join(keywords_strutture), case=False)
    
    if livello == 'annuale':
        # Se annuale, trasformiamo subito gli ambiti in Totali
        df_filtered['Ambito'] = 'Totale luoghi'
        df_filtered.loc[mask_strutture, 'Ambito'] = 'Totale strutture'
        
        # Raggruppiamo per anno (oltre che metrica e ambito)
        df_filtered['Periodo'] = df_filtered['Periodo'].dt.to_period('Y').dt.to_timestamp()
        df_filtered = df_filtered.groupby(['Metrica', 'Periodo', 'Ambito'], as_index=False).sum()
    
    # 2. FILTRO METRICA (Supporta sia stringa singola che lista)
    if metrica:
        if isinstance(metrica, str):
            metrica = [metrica]  # Trasforma in lista se è una stringa singola
        df_filtered = df_filtered[df_filtered['Metrica'].isin(metrica)]

    # 3. FILTRO AMBITI (Ricerca parziale)
    # Nota: se livello='annuale', ha senso filtrare solo per 'Totale luoghi' o 'Totale strutture'
    if ambiti:
        if isinstance(ambiti, str): ambiti = [ambiti]
        pattern = '|'.join(ambiti)
        df_filtered = df_filtered[df_filtered['Ambito'].str.contains(pattern, case=False, na=False)]

    # 4. FILTRO PERIODO (Adattivo)
    if data_inizio:
        if livello == 'annuale':
            # Filtro basato solo sull'anno
            anno_inz = pd.to_datetime(data_inizio).year
            if data_fine:
                anno_fin = pd.to_datetime(data_fine).year
                df_filtered = df_filtered[df_filtered['Periodo'].dt.year.between(anno_inz, anno_fin)]
            else:
                df_filtered = df_filtered[df_filtered['Periodo'].dt.year == anno_inz]
        else:
            # Filtro mensile (come il precedente)
            inz = pd.to_datetime(data_inizio).to_period('M')
            if data_fine:
                fin = pd.to_datetime(data_fine).to_period('M')
                mask = (df_filtered['Periodo'].dt.to_period('M') >= inz) & \
                       (df_filtered['Periodo'].dt.to_period('M') <= fin)
                df_filtered = df_filtered[mask]
            else:
                df_filtered = df_filtered[df_filtered['Periodo'].dt.to_period('M') == inz]

    # Formattazione finale data
    if livello == 'annuale':
        df_filtered['Periodo'] = df_filtered['Periodo'].dt.strftime('%Y')
    else:
        df_filtered['Periodo'] = df_filtered['Periodo'].dt.strftime('%Y-%m-%d')

    return df_filtered.sort_values(['Periodo', 'Metrica'])
