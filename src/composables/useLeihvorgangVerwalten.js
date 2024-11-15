import {computed, onMounted, reactive, ref} from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";
import store from "@/store/store.js";
import { expansionForLeihvorgang } from "@/scripte/globalFunctions.js"

export function useLeihvorgangVerwalten() {


  const imageUrl = process.env.VITE_API_URL
// Ref zur Verfolgung der erweiterten Panels
  const expandedPanels = ref([]);
// Reaktives Objekt zur Verfolgung des Checkbox-Status
  const checkedItems = reactive({});
  const loading = ref(false);
  const searchArtikels = ref({});
  const searchMitglied = ref('');
  const leihvorgaengeMitgliederAbrufen = ref([]);
  const idInventarArtikel = ref('');
  const selectedMember = ref(null);


// Hier werden alle Mitglieder abgerufen
  onMounted(async () => {
    try {
      const response = await AuthenticationService.leihvorgangVerwalten();
      leihvorgaengeMitgliederAbrufen.value = response.data.map(member => reactive({
        ...member,
        leihvorgaengeArtikelDetails: [],
        dataLoaded: false,
      }));
      console.log('leihvorgaengeMitgliederAbrufen erfolgreich', leihvorgaengeMitgliederAbrufen.value);
    } catch (error) {
      console.log('Abruf der Daten leihvorgaengeMitgliederAbrufen fehlgeschlagen', error);
    }
    initializeCheckedItems(); //checkt die Checkbox ausgeliehen standardmäßig
  });

// Funktion zur Initialisierung von checkedItems basierend auf leihvorgaengeMitgliederAbrufen
//Siehe ausführliche Beschreibung in der Doku
  function initializeCheckedItems() {
    leihvorgaengeMitgliederAbrufen.value.forEach(item => {
      if (!(item.easyVereinMitglied_id in checkedItems)) {
        checkedItems[item.easyVereinMitglied_id] = {
          ausgeliehen: true,    // Standardmäßig gecheckt
          abgeschlossen: false // Standardmäßig nicht gecheckt
        };
        console.log(`Checkboxen für ID ${item.easyVereinMitglied_id.ausgeliehen} initialisiert`);
      }
    });
    console.log('checkedItems nach Initialisierung:', checkedItems);
  }

  function handleCheckboxAusgeliehen(item) {
    //Wichtig: item entspricht member und wird vollständig benötigt, um die Funktion expansionForLeihvorgang()
    //aufrufen zukönnen
    const isChecked = checkedItems[item.easyVereinMitglied_id].ausgeliehen;
    console.log(`Checkbox für ID ${item.easyVereinMitglied_id.ausgeliehen} ist jetzt ${isChecked ? 'gecheckt' : 'nicht gecheckt'}`);

    if (isChecked) {
      store.dispatch('setShowAusgeliehenAbgeschlossen', {
        idMitglied: item.easyVereinMitglied_id,
        checkedStateAusgeliehen: true
      })
      console.log('handleCheckboxAusgeliehen gecheckt')
    } else {
      store.dispatch('setShowAusgeliehenAbgeschlossen', {
        idMitglied: item.easyVereinMitglied_id,
        checkedStateAusgeliehen: false
      })
      console.log('handleCheckboxAusgeliehen nicht gecheckt')
    }
    expansionForLeihvorgang(item, true)
    console.log('getShowAusgeliehenAbgeschlossen', store.getters.getShowAusgeliehenAbgeschlossen)

  }

  function handleCheckboxAbgeschlossen(item) {
    //Wichtig: item entspricht member und wird vollständig benötigt, um die Funktion expansionForLeihvorgang()
    //aufrufen zukönnen
    const isChecked = checkedItems[item.easyVereinMitglied_id].abgeschlossen;
    console.log(`Checkbox für ID ${item.easyVereinMitglied_id.abgeschlossen} ist jetzt ${isChecked ? 'gecheckt' : 'nicht gecheckt'}`);

    if (isChecked) {
      store.dispatch('setShowAusgeliehenAbgeschlossen', {
        idMitglied: item.easyVereinMitglied_id,
        checkedStateAbgeschlossen: true
      })
      console.log('handleCheckboxAbgeschlossen gecheckt')
    } else {
      store.dispatch('setShowAusgeliehenAbgeschlossen', {
        idMitglied: item.easyVereinMitglied_id,
        checkedStateAbgeschlossen: false
      })
      console.log('handleCheckboxAbgeschlossen nicht gecheckt')
    }

    expansionForLeihvorgang(item, true)
    console.log('getShowAusgeliehenAbgeschlossen', store.getters.getShowAusgeliehenAbgeschlossen)

  }

// Mit Klick auf eines der Mitglieder werden die verliehene Artikel je Mitglied abgerufen
//await expansionForLeihvorgang

  function showDialogRuecknahme(artikelDetails, member) {
    selectedMember.value = member;
    store.dispatch('setShowDialogRuecknahmeArtikel', {
      showDialog: true,
      IDinventarBuchungenPositionen: artikelDetails.ibp_IDinventarBuchungenPositionen,
      bemerkung: '',
      artikelDetails: artikelDetails,
      artikelZustand: '',
      memberName: `${member.easyVereinMitglied_firstName} ${member.easyVereinMitglied_familyName}`,
      idMitglied: member.easyVereinMitglied_id
    });
    console.log('showDialogRuecknahme artikelDetails', artikelDetails)
  }

  function filteredArtikelDetails(item) {
    const searchTerm = searchArtikels.value[item.easyVereinMitglied_id] || '';
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (!searchTerm) {
      // Wenn kein Suchbegriff eingegeben wurde, alle Artikel zurückgeben
      return item.leihvorgaengeArtikelDetails;
    }

    return item.leihvorgaengeArtikelDetails.filter((detail) => {
      const artikelBezeichnung = detail.ia_ArtikelBezeichnung.toLowerCase();
      const konfektionsGroesse = detail.konfektionsGroesse_Konfektionsgroesse.toLowerCase();
      const farbe = detail.farbe.toLowerCase();

      return (
          artikelBezeichnung.includes(lowerSearchTerm) ||
          konfektionsGroesse.includes(lowerSearchTerm) ||
          farbe.includes(lowerSearchTerm)
      );
    });
  }

  const filteredLeihvorgaengeMitgliederAbrufen = computed(() => {
    if (!searchMitglied.value) {
      // Wenn kein Suchbegriff eingegeben wurde, gib alle Mitglieder zurück
      return leihvorgaengeMitgliederAbrufen.value;
    }
    // Ansonsten filtere die Mitglieder basierend auf dem Suchbegriff
    return leihvorgaengeMitgliederAbrufen.value.filter((item) => {
      const fullName = `${item.easyVereinMitglied_firstName} ${item.easyVereinMitglied_familyName}`.toLowerCase();
      return fullName.includes(searchMitglied.value.toLowerCase());
    });
  });

  function formatDate(dateString) {
    if (!dateString) return '';
    const options = {day: '2-digit', month: '2-digit', year: 'numeric'};
    return new Date(dateString).toLocaleDateString('de-DE', options);
  }

  function isVisibleIventarStatus(status) {
    //Prüft den itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus Status
    //Wenn 1 (ausgeliehen) Element anzeigen, sonst nicht
    //Status 7 = ausgeliehen Tausch
    if (status === 1 || status === 7) {
      return true
    } else {
      false
    }
  }

  function showDialogNummerAendern(item, member, artikelDetails) {
    selectedMember.value = member;
    store.dispatch('setShowDialogNummerAendern', {
      showDialog: true,
      idInventarArtikel: item,
      artikelDetails: artikelDetails,
    })
  }

  function showDialogArtikelTausch(item, member) {
    selectedMember.value = member;
    store.dispatch('setShowDialogArtikelTausch', {
      showDialog: true,
      artikelDetails: item,
    })
  }

  // Rückgabe der Variablen und Funktionen
  return {
    imageUrl,
    expandedPanels,
    checkedItems,
    loading,
    searchArtikels,
    searchMitglied,
    leihvorgaengeMitgliederAbrufen,
    idInventarArtikel,
    selectedMember,
    initializeCheckedItems,
    handleCheckboxAusgeliehen,
    handleCheckboxAbgeschlossen,
    showDialogRuecknahme,
    filteredArtikelDetails,
    filteredLeihvorgaengeMitgliederAbrufen,
    formatDate,
    isVisibleIventarStatus,
    showDialogNummerAendern,
    showDialogArtikelTausch,
  };

}