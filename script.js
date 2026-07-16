/*******************************************************
 *
 * CONFIGURATION
 *
 *******************************************************/

// URL du KML
// Peut être un fichier présent sur GitHub
// ou une autre adresse Internet.

const KML_URL = "parcours.kml";

// Rafraîchissement

const REFRESH_SECONDS = 30;

// Date de départ du chronomètre

const START_DATE = new Date("2026-07-16T10:00:00Z");

/*******************************************************
 *
 * Mise à jour des horloges
 *
 *******************************************************/

function updateClock()
{

    const now = new Date();

    //--------------------------------------------------
    // Heure UTC
    //--------------------------------------------------

    document.getElementById("utcTime").textContent =
        now.toUTCString();

    //--------------------------------------------------
    // Heure de Paris
    //--------------------------------------------------

    const paris =
        now.toLocaleString(
            "fr-FR",
            {
                timeZone:"Europe/Paris"
            });

    document.getElementById("parisTime").textContent = paris;

    //--------------------------------------------------
    // Chronomètre
    //--------------------------------------------------

    const diff = now - START_DATE;

    const days =
        Math.floor(diff/(1000*60*60*24));

    const hours =
        Math.floor(diff/(1000*60*60))%24;

    const minutes =
        Math.floor(diff/(1000*60))%60;

    const seconds =
        Math.floor(diff/1000)%60;

    document.getElementById("elapsed").textContent =
        days+" j "
        +hours+" h "
        +minutes+" min "
        +seconds+" s";

}

/*******************************************************
 *
 * Lecture du KML
 *
 *******************************************************/

async function loadKML()
{

    try
    {

        const response = await fetch(
            KML_URL,
            {
                cache:"no-cache"
            });

        if(!response.ok)
            throw new Error("Impossible de télécharger le KML");

        const text = await response.text();

        const parser =
            new DOMParser();

        const xml =
            parser.parseFromString(
                text,
                "text/xml");

        displayPlacemark(xml);

        document.getElementById("status").textContent =
            "KML chargé";

        document.getElementById("status").className="ok";

        document.getElementById("lastUpdate").textContent =
            new Date().toLocaleTimeString();

    }

    catch(e)
    {

        document.getElementById("status").textContent =
            e.message;

        document.getElementById("status").className =
            "error";

    }

}

/*******************************************************
 *
 * Affichage des Placemark
 *
 *******************************************************/

function displayPlacemark(xml)
{

    const tbody =
        document.getElementById("kmlBody");

    tbody.innerHTML="";

    const placemarks =
        xml.getElementsByTagName("Placemark");

    for(const p of placemarks)
    {

        //------------------------------------------

        let nom="";

        const name =
            p.getElementsByTagName("name")[0];

        if(name)
            nom=name.textContent;

        //------------------------------------------

        let longitude="";
        let latitude="";
        let altitude="";

        const coord =
            p.getElementsByTagName("coordinates")[0];

        if(coord)
        {

            const txt =
                coord.textContent.trim();

            const c =
                txt.split(",");

            longitude=c[0] || "";
            latitude=c[1] || "";
            altitude=c[2] || "";

        }

        //------------------------------------------

        const tr =
            document.createElement("tr");

        tr.innerHTML=
        `
        <td>${nom}</td>
        <td>${latitude}</td>
        <td>${longitude}</td>
        <td>${altitude}</td>
        `;

        tbody.appendChild(tr);

    }

}

/*******************************************************
 *
 * Démarrage
 *
 *******************************************************/

updateClock();

setInterval(
    updateClock,
    1000);

loadKML();

setInterval(
    loadKML,
    REFRESH_SECONDS*1000);