import pandas as pd

def filtra_turismo_smart(df, livello='mensile', metrica=None, ambiti=None, provenienze=None, data_inizio=None, data_fine=None):
    """
    Filtra e aggrega i dati in base al livello di dettaglio richiesto.
    
    :param livello: 'mensile' (dettaglio completo) o 'annuale' (solo totali aggregati)
    :param metrica: 'Arrivi' o 'Presenze'
    :param ambiti: Parola chiave per filtro parziale (es. 'Fassa')
    :param data_inizio: Data o Anno di inizio
    :param data_fine: Data o Anno di fine (opzionale)
    :param provenienze: Lista o stringa, es: ['Italiani'] o ['Italiani', 'Stranieri']
    """
    df_filtered = df.copy()
    df_filtered['Periodo'] = pd.to_datetime(df_filtered['Periodo'])

    # 1. FILTRO PROVENIENZE (Mantiene le colonne specificate)
    # Identifichiamo le colonne fisse e quelle di provenienza
    colonne_base = ['Periodo', 'Ambito', 'Metrica']
    tutte_provenienze = ['Italiani', 'Stranieri']
    
    if provenienze:
        if isinstance(provenienze, str): provenienze = [provenienze]
        # Selezioniamo solo le colonne base + quelle scelte dall'utente
        colonne_da_mantenere = colonne_base + [p for p in provenienze if p in df_filtered.columns]
        df_filtered = df_filtered[colonne_da_mantenere]

    # 2. GESTIONE LIVELLO (ANNUALE vs MENSILE)
    keywords_strutture = ['alberghieri', 'extralberghieri']
    mask_strutture = df_filtered['Ambito'].str.contains('|'.join(keywords_strutture), case=False)
    
    if livello == 'annuale':
        # Logica dinamica per il nome del Totale
        suffix = ""
        if provenienze and len(provenienze) == 1:
            suffix = f" ({provenienze[0].lower()})"
        
        df_filtered['Ambito'] = f'Totale luoghi{suffix}'
        df_filtered.loc[mask_strutture, 'Ambito'] = f'Totale strutture{suffix}'
        
        df_filtered['Periodo'] = df_filtered['Periodo'].dt.to_period('Y').dt.to_timestamp()
        # Aggreghiamo sommando le colonne numeriche rimaste (Italiani e/o Stranieri)
        df_filtered = df_filtered.groupby(['Metrica', 'Periodo', 'Ambito'], as_index=False).sum(numeric_only=True)
    
    # 3. FILTRO METRICA (Corretto con .isin per gestire array)
    if metrica:
        if isinstance(metrica, str): metrica = [metrica]
        df_filtered = df_filtered[df_filtered['Metrica'].isin(metrica)]

    # 4. FILTRO AMBITI
    if ambiti:
        if isinstance(ambiti, str): ambiti = [ambiti]
        pattern = '|'.join(ambiti)
        df_filtered = df_filtered[df_filtered['Ambito'].str.contains(pattern, case=False, na=False)]

    # 5. FILTRO PERIODO
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

    # Formattazione finale
    if livello == 'annuale':
        df_filtered['Periodo'] = df_filtered['Periodo'].dt.strftime('%Y')
    else:
        df_filtered['Periodo'] = df_filtered['Periodo'].dt.strftime('%Y-%m-%d')

    return df_filtered.sort_values(['Periodo', 'Metrica'])
