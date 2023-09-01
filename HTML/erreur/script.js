// Sélectionnez tous les champs d'entrée avec la classe "change"
const inputFields = document.querySelectorAll('.change');
// Sélectionnez l'élément avec la classe "pour"
const pourcentage = document.querySelector('.pour');
let filledCount = 0; // Compteur pour suivre le nombre de champs remplis
const ip = "ip_of_server:5000"; // Adresse IP du serveur

var selectElement = document.getElementById('options');

icon = "bar"; // Valeur par défaut pour l'icône
window.iconact = icon; // Définir la variable globale iconact avec la valeur de l'icône, act comme actuel.

selectElement.addEventListener('change', function () {
    // Récupérez la valeur de l'option sélectionnée
    var icon = selectElement.options[selectElement.selectedIndex].value;
    window.iconact = icon; // Mettre à jour la variable globale iconact avec la nouvelle valeur d'icône

    // Affichez la valeur de l'option sélectionnée dans la console
    console.log('Option sélectionnée : ' + icon);
});

// Parcourir tous les champs d'entrée et ajouter un écouteur d'événements "input"
inputFields.forEach((input) => {
    input.addEventListener('input', updatePercentage);
});

// Fonction pour mettre à jour le pourcentage
function updatePercentage() {
    let newFilledCount = 0; // Compteur temporaire pour le nombre de champs remplis

    // Parcourir tous les champs d'entrée
    inputFields.forEach((input, index) => {
        if (input.value !== '') {
            newFilledCount++; // Incrémenter le compteur temporaire si le champ d'entrée n'est pas vide
            if (input.dataset.number === undefined) {
                input.dataset.number = filledCount; // Définir l'attribut de données "number" sur la valeur actuelle de filledCount s'il n'existe pas
            }
            input.dataset.number = index; // Mettre à jour l'attribut de données "number" avec l'index actuel
        }
    });

    filledCount = newFilledCount; // Mettre à jour filledCount avec la valeur temporaire
    const percentage = Math.min(filledCount * 17, 100); // Calculer le pourcentage en fonction du nombre de champs remplis
    pourcentage.textContent = `${percentage}% complet`; // Mettre à jour le texte du pourcentage dans l'élément avec la classe "pour"
}

// Définition de variables pour les coordonnées et l'adresse
const lat = null;
const lon = null;
const address = null;
const ville = null;

// Sélectionnez le formulaire avec l'ID "loginForm"
const form = document.getElementById('loginForm');

// Ajouter un écouteur d'événements "submit" au formulaire
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêcher le rechargement de la page après la soumission du formulaire

    // Récupérer les valeurs des champs d'entrée
    const address = document.getElementById('address-input').value;
    const ville = document.getElementById('city-input').value;
    const lat = document.getElementById('lat-input').value;
    const lon = document.getElementById('lon-input').value;

    console.log(address + ',' + ville + ',' + lat + ',' + lon);

    // Construire l'URL pour l'API en utilisant les valeurs des champs d'entrée et l'icône actuelle
    const url = `http://${ip}/addpoint?lat=${lat}&long=${lon}&alias=${encodeURIComponent(address + '; ' + ville)}&icon=${iconact}`;

    // Effectuer une requête fetch vers l'URL
    const response = await fetch(url);

    if (response.ok) {
        const data = await response.json(); // Récupérer les données de la réponse au format JSON
        console.log(data);

        // Ajouter les données à l'élément avec la classe "qrcode"
        const container = document.getElementsByClassName('qrcode');
        if (container.length > 0) {
            container[0].innerHTML = data;
        }
    }
});

// Fonction pour retourner sur la page d'acceuil
function refreshPage() {
    window.location.href = '../../';
}
