import store from "@/store/store.js";
import AuthenticationService from "@/services/AuthenticationService.js";

async function expansionForLeihvorgang(member, reload = false) {
    //reload ist true, wenn diese Funktion von einer anderen aufgerufen wird
    //um ein erneutes Laden zu erzwingen

    if (!member.dataLoaded || reload) {
        try {
            store.dispatch('setShowAusgeliehenAbgeschlossen', {idMitglied: member.easyVereinMitglied_id}) //Damit die Standardwerte gesetzt werden

            //Selektion-Kriterium ermitteln, anhand der Checkboxen
            //Der jeweilige Status der Checkbox ist im vuex-Store gespeichert und wird je idMitglied abgerufen
            //Standard im vuex-Store ist ausgeliehen = true, abgeschlossen = false
            const checkedAusgeliehen = store.getters.getShowAusgeliehenAbgeschlossen(member.easyVereinMitglied_id).checkedStateAusgeliehen
            const checkedAbgeschlossen = store.getters.getShowAusgeliehenAbgeschlossen(member.easyVereinMitglied_id).checkedStateAbgeschlossen
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
                member.easyVereinMitglied_id,
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

            console.log(`Leihvorgänge für Mitglied ${member.easyVereinMitglied_id} erfolgreich`, member.leihvorgaengeArtikelDetails);
        } catch (error) {
            console.log(`Abruf der Daten für Mitglied ${member.easyVereinMitglied_id} fehlgeschlagen`, error);
        }
    }

    return member;
}
async function fetchInventarExterneNummer(IDInventarKategorie){
    //Abruf der Daten inventarExterneNummern, um diese in der Select-Auswahl anzuzeigen!
    try{
        const response = await AuthenticationService.leihvorgangInventarExterneNummern(IDInventarKategorie)
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

export { expansionForLeihvorgang, fetchInventarExterneNummer, formatDate}