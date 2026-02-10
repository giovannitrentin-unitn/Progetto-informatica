import threading
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# 1. Configurazione WebApp
app = Flask(__name__)
CORS(app) # Fondamentale per evitare blocchi di sicurezza del browser

@app.route('/')
def home():
    return "<h1>Server Attivo!</h1><p>L'interfaccia è connessa a Python.</p>"

@app.route('/genera_previsioni', methods=['POST'])
def elabora():
    dati = request.json
    testo = dati.get("testo", "")
    # Qui avviene la magia di Python
    risultato = f"Python ha elaborato: '{testo.upper()}'" 
    return jsonify({"status": "success", "risultato": risultato})

@app.route('/get_filters', methods=['GET'])
def filtra():
    file_principale = '/app/filters/filters.json'
    file_alternativo = '/app/filters/default_filters.json'
    
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

    return jsonify(dati_json)



















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