import store from "@/store/store.js";
import AuthenticationService from "@/services/AuthenticationService.js";

async function expansionForLeihvorgang(member, reload = false) {
    //reload ist true, wenn diese Funktion von einer anderen aufgerufen wird
    //um ein erneutes Laden zu erzwingen

    const memberID = member.easyVereinMitglied_id || member.value.easyVereinMitglied_id

    if (!member.dataLoaded || reload) {
        try {
            store.dispatch('setShowAusgeliehenAbgeschlossen', {idMitglied: memberID}) //Damit die Standardwerte gesetzt werden

            //Selektion-Kriterium ermitteln, anhand der Checkboxen
            //Der jeweilige Status der Checkbox ist im vuex-Store gespeichert und wird je idMitglied abgerufen
            //Standard im vuex-Store ist ausgeliehen = true, abgeschlossen = false
            const checkedAusgeliehen = store.getters.getShowAusgeliehenAbgeschlossen(memberID).checkedStateAusgeliehen
            const checkedAbgeschlossen = store.getters.getShowAusgeliehenAbgeschlossen(memberID).checkedStateAbgeschlossen
            //Beide Checkboxen gecheckt
            let selektionKriterium = '';
            if(checkedAusgeliehen && checkedAbgeschlossen){
                selektionKriterium = '1,2,6,7' //Status 1 = ausgeliehene, Status 2 = abgeschlossen, Status 6 = zurückgegeben Tausch, Status 7 = ausgeliehen Tausch
            }
            //Checkbox ausgeliehen ist gecheckt, abgeschlossen nicht
            if(checkedAusgeliehen && !checkedAbgeschlossen){
                selektionKriterium = '1,7' //Status 1 = ausgeliehene, Status 7 = ausgeliehen Tausch
            }
            //Checkbox ausgeliehen ist nicht gecheckt, abgeschlossen ist gecheckt
            if(!checkedAusgeliehen && checkedAbgeschlossen){
                selektionKriterium = '2,6' //Status 2 = abgeschlossen, Status 6 = zurückgegeben Tausch
            }
            //Beide Checkboxen sind nicht gecheckt, alle Status werden gezeigt
            //ToDo: Hier muss noch geprüft werden ob das evtl. über eine separate Checkbox geregelt werden muss
            if(!checkedAusgeliehen && !checkedAbgeschlossen){
                selektionKriterium = '' //
            }

            const response = await AuthenticationService.leihvorgangArtikel(
                memberID,
                {IDinventarBuchungenPositionenStatus: selektionKriterium}
            );

            // Mapping der empfangenen Daten
            const mappedData = response.data.map((item) => ({
                konfektionsGroesse_Konfektionsgroesse: item.Konfektionsgroesse,
                ia_Bildpfad: item.Bildpfad,
                ia_ArtikelBezeichnung: item.ArtikelBezeichnung,
                ibp_Menge: item.Menge,
                farbe: item.Farbe,
                ibp_externeInventarNummer: item.externeInventarNummer,
                ibp_Preis: item.Preis,
                ibp_IDinventarBuchungenPositionen: item.IDinventarBuchungenPositionen,
                ibp_Bezeichnung: item.StatusBezeichnung,
                ibp_IDinventarBuchungenPositionenStatus: item.IDinventarBuchungenPositionenStatus,
                ibp_StatusDatum: item.StatusDatum,
                iz_Bezeichnung: item.ZustandBezeichnung,
                iz_IDInventarZustand: item.IDInventarZustand,
                ibp_Bemerkung: item.Bemerkung,
                ibp_GesamtPreis: item.GesamtPreis,
                ibp_Count: item.AnzahlPositionen,
                ia_IDInventarKategorie: item.IDInventarKategorie,
                ibp_IDInventarBuchungen: item.IDInventarBuchungen,
                ia_IDInventarArtikel: item.IDInventarArtikel,
                ia_externeInventarNummerPflicht: item.externeInventarNummerPflicht,
            }));

            // Daten dem Mitglied zuweisen
            member.leihvorgaengeArtikelDetails = mappedData;

            member.dataLoaded = true;
            //Der Gesamtpreis kommt auch über die Abfrage, wird aber in ein separates Element des Objekte member geschrieben
            if (
                member.leihvorgaengeArtikelDetails &&
                member.leihvorgaengeArtikelDetails.length > 0
            ) {
                member.gesamtPreis = member.leihvorgaengeArtikelDetails[0].ibp_GesamtPreis;
                member.anzahlArtikel = member.leihvorgaengeArtikelDetails[0].ibp_Count;
            } else {
                member.gesamtPreis = 0;
                member.anzahlArtikel = 0;
            }

            // Erstelle ein neues Mitgliedsobjekt mit den aktualisierten Daten
            // Dies wird für die mobile Ansicht benötigt, da hier nicht mit props gearbeitet werden kann
            // um das member Object an m_LeihvorgangVerwalten zu übergeben. In diesem Fall mit dem vuex-Store
            // gearbeitet werden, weshalb hier eine neus Object speziell für m_LeihvorgangVerwalten erzeugt wird
            const updatedMember = {
                ...member,
                leihvorgaengeArtikelDetails: mappedData,
                dataLoaded: true,
                gesamtPreis: mappedData.length > 0 ? mappedData[0].ibp_GesamtPreis : 0,
                anzahlArtikel: mappedData.length > 0 ? mappedData[0].ibp_Count : 0,
            };

            console.log(`Leihvorgänge für Mitglied ${memberID} erfolgreich`, member.leihvorgaengeArtikelDetails);

            return updatedMember;
        } catch (error) {
            console.log(`Abruf der Daten für Mitglied ${memberID} fehlgeschlagen`, error);
            return null;
        }
    }
    // Wenn keine Aktualisierung nötig ist, gib das Mitglied zurück
    return member;
}
async function fetchInventarExterneNummer(IDInventarKategorie){
    //Abruf der Daten inventarExterneNummern, um diese in der Select-Auswahl anzuzeigen!
    try{
        const response = await AuthenticationService.leihvorgangInventarExterneNummern(IDInventarKategorie, store.getters.getUserData.idVerein)
        console.log('inventarExterneNummern:', response.data)
        return response.data;
    }catch(err){
        return null;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = {day: '2-digit', month: '2-digit', year: 'numeric'};
    return new Date(dateString).toLocaleDateString('de-DE', options);
}

function isVisibleIventarStatus(statusBuchung) {
    //Prüft den itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus Status
    //Wenn 1 (ausgeliehen) Element anzeigen, sonst nicht
    //Status 7 = ausgeliehen Tausch
    if(statusBuchung === 1 || statusBuchung === 7){
        return true
    }
    else{
        false
    }
}

function checkStatusZustandArtikel(statusZustand){
    if(statusZustand === 4){
        //4=beschädigt
        //2=verschmutzt
        return {
            icon: "mdi-alert",
            color: "red",
        }
    }
    if(statusZustand === 5){
        //4=beschädigt
        //2=verschmutzt
        return {
            icon: "mdi-alert-circle",
            color: "orange",
        }
    }
    return {
        icon: "mdi-check-bold",
        color: "green",
    };
}

// Methode zum Öffnen des Dialogs
function openDialogToolTip(dialogTitleOpen, dialogTextOpen) {
    return{
        showDialogTooltip: true,
        dialogTitle: dialogTitleOpen,
        dialogText: dialogTextOpen,
    }

}

async function buildUrl(endpoint) {
    if (process.env.VITE_API_URL.endsWith('/') && endpoint.startsWith('/')) {
        return `${process.env.VITE_API_URL}${endpoint.substring(1)}`;
    }
    if (!process.env.VITE_API_URL.endsWith('/') && !endpoint.startsWith('/')) {
        return `${process.env.VITE_API_URL}/${endpoint}`;
    }
    return `${process.env.VITE_API_URL}${endpoint}`;
}

export {
    expansionForLeihvorgang,
    fetchInventarExterneNummer,
    formatDate,
    isVisibleIventarStatus,
    checkStatusZustandArtikel,
    openDialogToolTip,
    buildUrl
}