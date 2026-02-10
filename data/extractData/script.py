from bs4 import BeautifulSoup
import csv

# Variabile a programma per l'anno
ANNO = "2023"

def extract_to_csv(html_file, output_csv):
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    data_rows = []
    # Mappa dei mesi per la conversione in YYYY-MM
    mesi_map = {
        "Gennaio": "01", "Febbraio": "02", "Marzo": "03", "Aprile": "04",
        "Maggio": "05", "Giugno": "06", "Luglio": "07", "Agosto": "08",
        "Settembre": "09", "Ottobre": "10", "Novembre": "11", "Dicembre": "12"
    }

    # Cerca tutte le sezioni (Arrivi, Presenze)
    # Nel file fornito le sezioni sono identificate da <div class="subtitle">
    subtitles = soup.find_all('div', class_='subtitle')
    
    for subtitle in subtitles:
        metrica = subtitle.get_text(strip=True) # "Arrivi" o "Presenze"
        table = subtitle.find_next('table')
        if not table:
            continue

        # Estrazione degli ambiti (Luoghi) dalla prima riga della tabella
        # Saltiamo la prima cella "Mese"
        header_row = table.find_all('tr')[0]
        ambiti = [td.get_text(strip=True) for td in header_row.find_all('td') if td.get_text(strip=True) != "Mese"]

        # Estrazione dei dati dalle righe successive
        # Saltiamo le prime due righe di intestazione
        rows = table.find_all('tr')[2:]
        for row in rows:
            cols = row.find_all('td')
            if not cols:
                continue
            
            nome_mese = cols[0].get_text(strip=True)
            if nome_mese not in mesi_map:
                continue # Salta righe come "Anno" o totali
            
            periodo = f"{ANNO}-{mesi_map[nome_mese]}"

            # I dati per ogni ambito sono gruppi di 3 colonne (Italiani, Stranieri, Totale)
            for i, ambito in enumerate(ambiti):
                base_idx = 1 + (i * 3)
                if base_idx + 1 < len(cols):
                    italiani = cols[base_idx].get_text(strip=True).replace('.', '')
                    stranieri = cols[base_idx + 1].get_text(strip=True).replace('.', '')
                    
                    data_rows.append([metrica, periodo, ambito, italiani, stranieri])

    # Scrittura del file CSV
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Metrica', 'Periodo', 'Ambito', 'Italiani', 'Stranieri'])
        writer.writerows(data_rows)

# Esecuzione
extract_to_csv('test.html', 'dati_turismo.csv')