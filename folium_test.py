import folium  # Importation de la bibliothèque Folium pour créer la carte
import csv  # Importation du module CSV pour la lecture du fichier
from random import randrange  # Importation de la fonction randrange pour générer un nombre aléatoire
import os

CSV_PATH = fr"{os.path.dirname(__file__)}/data.csv" #constante path du csv
HTML_PATH = fr"{os.path.dirname(__file__)}/index.html"

with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)  # Création d'un objet reader pour lire le fichier CSV
    rows = list(reader)  # Convertir les lignes de reader en une liste pour faciliter l'accès aux données
    try:
        y = randrange(len(rows)) # Générer un nombre aléatoire pour sélectionner une ligne aléatoire dans le fichier
        map = folium.Map([float(rows[y]["lat"]), float(rows[y]["long"])], zoom_start=14) # Création de la carte avec les coordonnées de la ligne sélectionnée et un niveau de zoom initial de 14
    except:
        map = folium.Map((46.266553079304366, 1.376923898436157), zoom_start=14)

with open(CSV_PATH, 'r', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)  # Création d'un nouvel objet reader pour lire à nouveau le fichier
    for row in reader:  # Parcourir chaque ligne du fichier
        # Ajouter un marqueur à la carte pour chaque ligne, en utilisant les coordonnées et l'alias de la ligne

        ABSOLUTE_PATH = fr"{os.path.dirname(__file__)}/img/"
        img_path = ABSOLUTE_PATH + str(row["icon"] + ".png")
        custom_icon = folium.features.CustomIcon(img_path, icon_size=(30,30))

        folium.Marker([float(row["lat"]), float(row["long"])],
                      popup=folium.Popup(row["alias"], min_width=500, max_width=500), icon=custom_icon,
                      prefix='fa').add_to(map)

map.save(HTML_PATH)  # Sauvegarder la carte sous forme de fichier HTML
