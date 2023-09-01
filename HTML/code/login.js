// Déclaration des constantes "pseudo", "code" et "ip" avec des valeurs initiales nulles
const pseudo = null;
const code = null;
const ip = "ip_of_server:5000";

// Récupération du formulaire par son identifiant
const form = document.getElementById('loginForm');

// Ajout d'un écouteur d'événement pour l'événement "submit" du formulaire
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    // Récupération des valeurs des champs "loginUsername" et "loginPassword"
    const pseudo = document.getElementById('loginUsername').value;
    const code = document.getElementById('loginPassword').value;

    console.log(pseudo + ',' + code); // Affiche les valeurs des champs dans la console

    // Construction de l'URL avec les valeurs des champs
    const url = `http://${ip}/checkpoint?user=${pseudo}&code=${code}`;

    // Envoi d'une requête HTTP GET à l'URL spécifiée
    const response = await fetch(url);

    // Vérification de la réponse HTTP
    if (response.ok) {
        // Récupération des données de la réponse au format JSON
        const data = await response.json();
        console.log(data); // Affiche les données de la réponse dans la console

        // Ajout du paragraphe contenant les données à l'élément avec la classe "container"
        const container = document.getElementsByClassName('container');
        if (container.length > 0) {
            container[0].innerHTML = data;
        }
    }
});

// Fonction pour rafraîchir la page
function refreshPage() {
    window.location.href = '../../';
}
