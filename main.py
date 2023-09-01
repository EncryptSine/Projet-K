"""
Ce script Python contient une API Flask pour gérer des requêtes HTTP et manipuler des fichiers CSV.

Le script utilise les modules suivants :
- csv : Module pour la manipulation des fichiers CSV.
- Flask : Module pour créer une API web et gérer les requêtes HTTP.
- subprocess : Module pour exécuter des commandes système (ici la génération de la carte).
- random : Module pour générer des nombres aléatoires.
- qrcode : Module pour générer des codes QR.
- flask_cors : Module pour gérer les autorisations CORS (Cross-Origin Resource Sharing).

Le script définit les routes suivantes pour notre API Flask :
- '/getcode' : Route pour obtenir le code.
- '/checkpoint' : Route pour le point de contrôle.
- '/addpoint' : Route pour ajouter un point.
- '/map' : Route pour afficher la carte.
- '/' : Route par défaut, page d'acceuil.

Le script utilise également deux routes supplémentaires pour servir les fichiers du dossier 'QR' et du dossier 'HTML'.

Pour exécuter le script, utilisez la commande 'python <nom_du_script.py>'.
"""


import csv  # Importation du module CSV pour la manipulation des fichiers CSV
# Importation de Flask pour créer une API web et gérer les requêtes HTTP
from flask import Flask, request, send_file, make_response, send_from_directory
# Importation de la bibliothèque subprocess pour exécuter des commandes système
import subprocess
import random
import qrcode
from flask_cors import CORS, cross_origin
import json
import os

HTML_PATH = fr"{os.path.dirname(__file__)}/HTML/"
CSV_PATH = fr"{os.path.dirname(__file__)}/data.csv" #constante path du csv
QR_CODE_PATH = fr"{os.path.dirname(__file__)}/QR/"
IP_ADRESS = "ip_of_server:5000"

# envoyer requête au serveur pour check si ID existe déjà si oui regénérer ID sinon garder ID
api = Flask(__name__)  # Création d'une instance de l'application Flask
cors = CORS(api)
api.config['CORS_HEADERS'] = 'Content-Type'

# Route pour aller à l'accueil
@api.route('/', methods=['GET'])
@cross_origin()
def get_home():
    return send_file(f"{HTML_PATH}accueil/index.html")

# Fonction pour générer la page contenant le code
def tri_insertion(liste):
    for i in range(1, len(liste)):
        j = i
        if(bool(liste[j]) == False):
            print("Error : class is None")
            return liste
        while j>1 and int(liste[j-1][3]) > int(liste[j][3]):
            liste[j-1], liste[j] = liste[j], liste[j-1]
            j -= 1
    return liste

# Fonction pour générer la page contenant le code
def generateCodePage(id):
    return f"Félicitations ! Entrez le code {id} à <a href='/HTML/code/login.html'> cette URL </a>"

# Route pour obtenir le code
@api.route('/getcode', methods=['GET'])
@cross_origin()
def get_code():
    response = make_response(generateCodePage(request.args.get('code')), 200)
    return response

# Route pour le point de contrôle
@api.route('/checkpoint', methods=['GET'])
@cross_origin()
def check_point():
    with open(CSV_PATH, 'r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file, delimiter=',')
        rows = list(reader)
        print(rows)
        rows = tri_insertion(rows)
        print(rows)
        for row in rows:
            try:
                if row[3] == request.args.get('code'):
                    row[2] += f"{request.args.get('user')} - "
                else:
                    print("code non trouvé dans cette ligne")
            except Exception as e:
                print(e)
                pass

    with open(CSV_PATH, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file, delimiter=',')
        writer.writerows(rows)
    return json.dumps(f"Votre nom {request.args.get('user')} a bien été ajouté ! <br> <br> <button id='refresh' onclick='refreshPage()'>Retour a l'acceuil</button>")


# Route pour ajouter un point
@api.route('/addpoint', methods=['GET'])
@cross_origin()
def add_point():
    test = []  # Création d'une liste vide pour stocker les données du point
    # Ajout de la latitude à la liste en récupérant la valeur du paramètre 'lat'
    test.append(request.args.get('lat'))
    # Ajout de la longitude à la liste en récupérant la valeur du paramètre 'long'
    test.append(request.args.get('long'))
    # Ajout de l'alias à la liste en récupérant la valeur du paramètre 'alias'
    test.append(request.args.get('alias') + " | Capturé par: ")

    # Boucle pour générer un ID unique pour le point
    while True:
        ids = []
        id = str(random.randint(0, 10000))
        print(id)
        with open(CSV_PATH, 'r',  newline='', encoding='utf-8') as f:
            s = csv.reader(f, delimiter=',')
            for i in s:
                print(i)
                try:
                    ids.append(i[3])
                except Exception as e:
                    print(e)
                    pass
        if id not in ids:
            break

    test.append(id)
    test.append(request.args.get('icon'))

    with open(CSV_PATH, 'a', newline='', encoding='utf-8') as f:  # Ouverture du fichier CSV en mode ajout ('a')
        # Création d'un objet writer pour écrire dans le fichier
        w = csv.writer(f, delimiter=',',)
        w.writerow(test)  # Écriture de la liste de données dans le fichier CSV

    # Génération du code QR
    qr = qrcode.QRCode()
    qr.add_data(f"{IP_ADRESS}/getcode?code={id}")
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(QR_CODE_PATH + f"{id}.png")

    # Renvoie une réponse indiquant que l'adresse a été ajoutée
    return json.dumps(f"<div class='err'><h1>Adresse ajoutée !</h1> <br> <br> <p>Le QR code à imprimer et à afficher est <a href='http://{IP_ADRESS}/QR/{id}.png'>ici</a> <br> <br> <button id='refresh' onclick='refreshPage()'>Retour à l'acceuil</button></p></div>")


# Aller vers la carte
@api.route('/map', methods=['GET'])
@cross_origin()
def index():
    subprocess.run(["python", fr"{os.path.dirname(__file__)}/folium_test.py"])  # Exécution d'un script Python externe pour générer la carte
    return send_file('index.html')  # Renvoie la carte générée

# pour accepter les requêtes GET vers les dossiers QR et HTML.
@api.route('/QR/<path:path>')
@cross_origin()
def send_QR(path):
    return send_from_directory('QR', path)


@api.route('/HTML/<path:path>')
@cross_origin()
def send_HTML(path):
    return send_from_directory('HTML', path)


if __name__ == '__main__':
    api.run(host="0.0.0.0")  # Exécution de l'application Flask