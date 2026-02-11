import threading
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from modules import calcola_filtri, calcola_periodo, calcola_totali, carica_dati, calcola_quatiles, conversione_json, estrai_dati, filtra_dati, genera_prediction, normalizza_data, processing_output, trasformazione, salva_csv 

# 1. Configurazione WebApp
app = Flask(__name__)
CORS(app) # Fondamentale per evitare blocchi di sicurezza del browser

output_filter = "app/filters/filters.json"
output_csv = "app/data/prediction.csv"
input_csv = "app/data/dati.csv"
input_filter = "app/filters/default_filters.json"

@app.route('/')
def home():
    return "<h1>Server Attivo!</h1><p>L'interfaccia è connessa a Python.</p>"

@app.route('/genera_previsioni', methods=['POST'])
def elabora():
    # Recupero il contenuto filters
    content = request.get_json()
    data = content.get('filters', {})
    
    # NON CONTROLLO I DATI PERCHE LI HO GIA CONVALIDATI SUL CLIENT
    # Recupero i singoli valori 
    prediction_length = data.get('quantita_predizione')
    precisione = data.get('precisione_predizione')
    ambiti = data.get('ambiti')
    metrica = data.get('metrica')
    # Estraggo data inizio fine
    periodo_dati = data.get('periodo_dati')
    data_inizio = normalizza_data.normalizza_anno_a_data(periodo_dati[0])
    data_fine = normalizza_data.normalizza_anno_a_data(periodo_dati[1], True)
    # Estraggo il periodo di previsione
    periodo_previsione = data.get('periodo_previsione')
    # Calcolo i filtri possibili
    calcola_filtri.calcola_filtri(ambiti, metrica, data_fine, prediction_length, periodo_previsione, output_filter)
    # Carico i dati 
    dati = carica_dati.carica_dati(input_csv);
    # Filtro i vari dati
    dati = filtra_dati.filtra_turismo_smart(dati, periodo_previsione, metrica, ambiti, data_inizio, data_fine)
    # Trasformo la tabella
    dati = trasformazione.trasformazione_wide_long(dati)
    # Genero i quatiles
    quantiles = calcola_quatiles.genera_quantili(precisione)
    # Genero le previsioni
    predictions = genera_prediction.genera_prediction(dati, prediction_length, quantiles)
    # Processo l'output
    predictions_processed = processing_output.processing_output(predictions)
    # Sistemazione periodo
    prediction_periodo = calcola_periodo.formatta_periodo(predictions_processed)
    # Salvo la prediction in csv
    salva_csv.salva_dataframe_csv(prediction_periodo, output_csv)
    # Calcolo i totali
    prediction_total = calcola_totali.aggiungi_totali(prediction_periodo)
    # Processo i vecchi dati
    old_data_processed = trasformazione.trasforma_long_to_wide(dati)
    # Aggiunta Totali su vecchi dati
    old_data_total = calcola_totali.aggiungi_totali(old_data_processed)
    # Sparo al client i vecchi e i nuovi dati
    data_json = { "history": conversione_json.conversione_json(old_data_total) , "forecast": conversione_json.conversione_json(prediction_total) }

    return jsonify({"status": "success", "received": data_json}), 200

@app.route('/get_filters', methods=['GET'])
def filtra():
    file_principale = output_filter
    file_alternativo = input_filter
    
    # Controlla quale file esiste
    if os.path.exists(file_principale):
        file_da_caricare = file_principale
    elif os.path.exists(file_alternativo):
        file_da_caricare = file_alternativo
    else:
        # Se nessuno dei due esiste, ritorna un errore JSON
        return jsonify({"errore": "Nessun file disponibile"}), 404

    # Leggi il file JSON
    with open(file_da_caricare, 'r', encoding='utf-8') as f:
        dati_json = json.load(f)

    return jsonify({"status": "success", "received": dati_json}), 200


@app.route('/get_prediction', methods=['GET'])
def prediction():
    file_principale = output_csv
    file_alternativo = input_csv
    
    # Controlla quale file esiste
    if os.path.exists(file_principale):
        file_da_caricare = file_principale
    elif os.path.exists(file_alternativo):
        file_da_caricare = file_alternativo
    else:
        # Se nessuno dei due esiste, ritorna un errore JSON
        return jsonify({"errore": "Nessun file disponibile"}), 404

    dati = carica_dati(file_da_caricare)

    dati_con_totale = calcola_totali.aggiungi_totali(dati, estrai_dati.estrai_colonne(dati))

    dati_json = conversione_json.conversione_json(dati_con_totale)

    return jsonify({"status": "success", "received": dati_json}), 200


@app.route('/delete_prediction', methods=['DELETE'])
def elimina_lista_file():
    lista_file = [output_csv, output_filter]
    for file_path in lista_file:
        try:
            # Controlla se il file esiste prima di provare a eliminarlo
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"✅ Eliminato: {file_path}")
            else:
                print(f"⚠️  Il file {file_path} non esiste già.")
        except Exception as e:
            print(f"❌ Errore durante l'eliminazione di {file_path}: {e}")
    return jsonify({"status": "success"}), 200

# 2. Funzione per avviare Flask
def run_flask():
    # Colab richiede l'host 0.0.0.0
    app.run(host='0.0.0.0', port=5000)

# 3. Avvio in parallelo
if __name__ == '__main__':
    # Avviamo Flask in un thread separato
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()
    
    print("✅ Server Flask avviato in background.")
    
    # 4. Avvio del Tunnel (Esempio Cloudflare)
    # Assicurati di aver installato cloudflared su Colab
    print("🔗 Avvio del tunnel Cloudflare...")
    os.system("cloudflared tunnel --url http://localhost:5000")