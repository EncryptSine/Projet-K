// Déclaration de la clé d'API Geoapify
const apiKey = 'your_api_key';

// Récupération de l'élément d'entrée d'adresse
const addressInput = document.getElementById('address-input');

// Variable pour stocker la liste de suggestions
let suggestionsList = null;

// Adresse IP du serveur
const ip = "ip_of_server:5000";

// Récupération de l'élément de sélection des icônes
var selectElement = document.getElementById('options');

// Écoute de l'événement de changement de sélection
icon = "bar";
window.iconact = icon;

selectElement.addEventListener('change', function () {
	// Récupération de la valeur de l'option sélectionnée
	var icon = selectElement.options[selectElement.selectedIndex].value;
	window.iconact = icon;

	// Affichage de la valeur de l'option sélectionnée dans la console
	console.log('Option sélectionnée : ' + icon);
});

// Fonction pour effacer les suggestions
function clearSuggestions() {
	if (suggestionsList) {
		suggestionsList.remove(); // Suppression de la liste de suggestions s'il existe
		suggestionsList = null; // Réinitialisation de la variable
	}
}

// Écoute de l'événement d'entrée dans le champ d'adresse
addressInput.addEventListener('input', async (event) => {
	const query = event.target.value;
	if (query.length < 3) {
		clearSuggestions();
		return;
	}

	// Construction de l'URL de l'API Geoapify pour obtenir les suggestions d'autocomplétion
	const url = new URL(`https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${apiKey}&filter=countrycode:fr`);
	const response = await fetch(url);
	const data = await response.json();

	console.log(data.features);

	if (data.features.length > 0) {
		displaySuggestions(data.features);
	} else {
		clearSuggestions();
	}
});

// Fonction pour afficher les suggestions
function displaySuggestions(suggestions) {
	clearSuggestions();

	suggestionsList = document.createElement('ul'); // Création d'une nouvelle liste de suggestions
	suggestionsList.id = 'suggestions-list';

	suggestions.forEach((suggestion) => {
		const listItem = document.createElement('li');
		listItem.textContent = suggestion.properties.formatted;
		listItem.addEventListener('click', () => {
			addressInput.value = suggestion.properties.address_line1;
			clearSuggestions();
			updateCountryAndCity(suggestion);
		});

		suggestionsList.appendChild(listItem);
	});

	// Ajout de la liste de suggestions au document
	addressInput.parentNode.insertBefore(suggestionsList, addressInput.nextSibling);
}

// Fonction pour mettre à jour le pays et la ville sélectionnés
function updateCountryAndCity(suggestion) {
	const countryInput = document.getElementById('country-input');
	const cityInput = document.getElementById('city-input');
	const postalInput = document.getElementById('postal-input');

	const { properties } = suggestion;
	countryInput.value = properties.country || '';
	cityInput.value = properties.city || '';
	postalInput.value = properties.postcode || '';

	const lat = properties.lat;
	const lon = properties.lon;
	console.log('Latitude:', lat);
	console.log('Longitude:', lon);
	console.log(properties.address_line2);

	window.lat = properties.lat;
	window.lon = properties.lon;
	window.adress1 = properties.address_line1;
	window.ville = properties.city;
}

// Écoute de l'événement de clic sur le champ d'adresse pour supprimer la liste de suggestions
addressInput.addEventListener('click', () => {
	if (suggestionsList) {
		clearSuggestions();
	}
});

// Détection de tous les clics sur le document
document.addEventListener("click", function (event) {
	// Si l'utilisateur clique à l'intérieur de l'élément, ne rien faire
	if (event.target.closest("ul")) return;
	// Si l'utilisateur clique en dehors de l'élément, le masquer !
	clearSuggestions();
});

// Récupération du formulaire de connexion
const form = document.getElementById('loginForm');

// Écoute de l'événement de soumission du formulaire
form.addEventListener('submit', async (event) => {
	event.preventDefault(); // Empêche le rechargement de la page

	// Vérification de la présence des coordonnées géographiques (lat, lon)
	if (lat == null || lon == null) {
		format2string = null;
		const address = document.getElementById('address-input').value;
		const ville = document.getElementById("city-input").value;
		const pays = document.getElementById("country-input").value;
		const postal = document.getElementById("postal-input").value;

		const total = address + "," + " " + postal + " " + ville + "," + " " + pays;

		const format = total.toLowerCase().replace(/ /g, "_");

		console.log(format);

		// Appel de l'API Geoapify pour obtenir des suggestions basées sur l'adresse complète
		const url = new URL(`https://api.geoapify.com/v1/geocode/autocomplete?text=${total}&apiKey=${apiKey}&filter=countrycode:fr`);
		const response = await fetch(url);
		const data = await response.json();

		const suggestions = data.features;

		console.log(data.features);

		suggestions.forEach((suggestion) => {
			console.log(suggestion.properties.formatted);
			const format2 = suggestion.properties.formatted.toLowerCase().replace(/ /g, "_");
			format2string = format2.toString();
			console.log(format2);
			window.lat = suggestion.properties.lat;
			window.lon = suggestion.properties.lon;
			window.adress1 = suggestion.properties.address_line1;
			window.ville = suggestion.properties.city;
		});

		if (format != format2string) {
			window.location.href = "../erreur/index.html";
		}

		if (format == format2string) {
			const lat = window.lat;
			const lon = window.lon;
			const adress1 = window.adress1;
			const ville = window.ville;

			// Appel de l'API du serveur pour ajouter un point avec les coordonnées et l'icône sélectionnés
			const url = `http://${ip}/addpoint?lat=${lat}&long=${lon}&alias=${encodeURIComponent(adress1 + '; ' + ville)}&icon=${iconact}`;
			const response = await fetch(url);

			if (response.ok) {
				const data = await response.json();
				console.log(data);

				// Ajout du paragraphe à l'élément avec la classe "container"
				const container = document.getElementsByClassName('container');
				if (container.length > 0) {
					container[0].innerHTML = data;
				}
			}
		}
	} else {
		const url = `http://${ip}/addpoint?lat=${lat}&long=${lon}&alias=${encodeURIComponent(adress1 + '; ' + ville)}&icon=${iconact}`;
		const response = await fetch(url);

		if (response.ok) {
			const data = await response.json();
			console.log(data);

			// Ajout du paragraphe à l'élément avec la classe "container"
			const container = document.getElementsByClassName('container');
			if (container.length > 0) {
				container[0].innerHTML = data;
			}
		}
	}
});

// Récupération de tous les éléments avec la classe "change"
const inputs = document.querySelectorAll(".change");

// Écoute de l'événement de modification pour tous les éléments
inputs.forEach(input => {
	input.addEventListener("change", updateValue);
});

// Fonction pour mettre à jour les valeurs lat et lon à null
function updateValue() {
	window.lat = null;
	window.lon = null;
}

// Fonction pour rafraîchir la page
function refreshPage() {
	window.location.href = '../../';
}
