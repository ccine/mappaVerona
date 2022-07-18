import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LANGUAGES } from "../configVar";

i18n.use(initReactI18next).init({
  //debug: true,
  lng: "en",
  supportedLngs: LANGUAGES.concat("dev"),
  resources: {
    it: {
      translation: {
        lang: "Italiano",
        change_language: "Cambia lingua",
        info: "Informazioni",
        tracking: "Tracciamento",
        agree: "Accetta",
        decline: "Rifiuta",
        cat_churches: "Chiese",
        cat_monuments: "Monumenti",
        cat_museums: "Musei e Centri Espositivi",
        user_position: "Ti trovi qui",
        close: "Chiudi",
        description: "Descrizione",
        open_time: "Orario",
        tickets: "Biglietti",
        chart: "Grafico occupazione",
        historical: "Storico",
        real: "Attuale",
        expected: "Previsto",
        day_week_mon: "Lunedì",
        day_week_tue: "Martedì",
        day_week_wed: "Mercoledì",
        day_week_thu: "Giovedì",
        day_week_fri: "Venerdì",
        day_week_sat: "Sabato",
        day_week_sun: "Domenica",
        crowding: "Affollamento",
        xlabel: "Orari",
        ylabel: "#Persone",
        firstRange: "Mattino",
        secondRange: "Mezzogiorno",
        thirdRange: "Pomeriggio",
        val_real: "reali",
        val_stim: "attesi",
        val_stor: "storici",
        prev: "Precedente",
        next: "Successivo",
        not_supported: "Questo contenuto non è disponibile nella tua lingua.",
        user_offline: "Sei offline",
        user_not_in_verona: "Non sei a Verona",
        details_button: "Dettagli",
        tracking_title: "Privacy alert",
        tracking_message:
          "TurismoVerona vorrebbe tracciare in maniera anonima i dati della vostra esprerienza.<br/>" +
          "I dati raccolti sono: identificatore anonimo, posizione, lingua e sistema operativo.<br/>Vuoi partecipare?",
        info_title: "Informazioni e contatti",
        info_message:
          "Prototipo realizzato dal comune di Verona con la collaborazione dell'Università degli studi di Verona - Dipartimento di Informatica",
        tours: "Itinerari",
        a_tempo: "A tempo",
        storico: "Storico",
        show_tour: "Mostra itinerario",
        tour_alert_title: "Attenzione",
        tour_alert_message:
          "Sei sicuro di voler chiudere la mappa dell'itinerario?",
      },
    },
    en: {
      translation: {
        lang: "English",
        change_language: "Change language",
        info: "Information",
        tracking: "Tracking",
        agree: "Accept",
        decline: "Decline",
        cat_churches: "Churches",
        cat_monuments: "Monuments",
        cat_museums: "Museums and Exhibition Centers",
        user_position: "You are here",
        close: "Close",
        description: "Description",
        open_time: "Open Time",
        tickets: "Tickets",
        chart: "Grafico occupazione", // it
        historical: "Historical",
        real: "Real",
        expected: "Expected",
        day_week_mon: "Monday",
        day_week_tue: "Tuesday",
        day_week_wed: "Wednesay",
        day_week_thu: "Thursday",
        day_week_fri: "Friday",
        day_week_sat: "Saturday",
        day_week_sun: "Sunday",
        crowding: "Crowding",
        xlabel: "Time",
        ylabel: "#People",
        firstRange: "Morning",
        secondRange: "Noon",
        thirdRange: "Afternoon",
        val_real: "real",
        val_stim: "expected",
        val_stor: "historical",
        prev: "Previous",
        next: "Next",
        not_supported: "This content is not available in your language.",
        user_offline: "You are offline",
        user_not_in_verona: "You are not in Verona",
        details_button: "Details",
        tracking_title: "Privacy alert", // it
        tracking_message:
          "TurismoVerona vorrebbe tracciare in maniera anonima i dati della vostra esprerienza.<br/>" +
          "I dati raccolti sono: identificatore anonimo, posizione, lingua e sistema operativo.<br/>Vuoi partecipare?", // it
        info_title: "Informazioni e contatti", // it
        info_message:
          "Prototipo realizzato dal comune di Verona con la collaborazione dell'Università degli studi di Verona - Dipartimento di Informatica", // it
        tours: "Tours",
        a_tempo: "A tempo", // it
        storico: "Storico", // it
        show_tour: "Mostra itinerario", // it
        tour_alert_title: "Attenzione", // it
        tour_alert_message:
          "Sei sicuro di voler chiudere la mappa dell'itinerario?", // it
      },
    },
    de: {
      translation: {
        lang: "Deutsch",
        change_language: "Change language", // en
        info: "Information", // en
        tracking: "Tracciamento", // en
        agree: "Accept", // en
        decline: "Decline", // en
        cat_churches: "Kirchen",
        cat_monuments: "Denkmäler",
        cat_museums: "Museen und Ausstellungszentren",
        user_position: "Du bist hier",
        close: "Close", // en
        description: "Description", // en
        open_time: "Open Time", // en
        tickets: "Tickets", // en
        chart: "Grafico occupazione", // it
        historical: "Historical", // en
        real: "Real", // en
        expected: "Expected", // en
        day_week_mon: "Monday", // en
        day_week_tue: "Tuesday", // en
        day_week_wed: "Wednesay", // en
        day_week_thu: "Thursday", // en
        day_week_fri: "Friday", // en
        day_week_sat: "Saturday", // en
        day_week_sun: "Sunday", // en
        crowding: "Crowding", // en
        xlabel: "Time", // en
        ylabel: "#People", // en
        firstRange: "Morning",  // en
        secondRange: "Noon",  // en
        thirdRange: "Afternoon",  // en
        val_real: "real", // en
        val_stim: "expected", // en
        val_stor: "historical", // en
        prev: "Previous", // en
        next: "Next", // en
        not_supported: "This content is not available in your language.", // en
        user_offline: "You are offline", // en
        user_not_in_verona: "You are not in Verona", // en
        details_button: "details", // en
        tracking_title: "Privacy alert", // it
        tracking_message:
          "TurismoVerona vorrebbe tracciare in maniera anonima i dati della vostra esprerienza.<br/>" +
          "I dati raccolti sono: identificatore anonimo, posizione, lingua e sistema operativo.<br/>Vuoi partecipare?", // it
        info_title: "Informazioni e contatti", // it
        info_message:
          "Prototipo realizzato dal comune di Verona con la collaborazione dell'Università degli studi di Verona - Dipartimento di Informatica", // it
        tours: "Tours", // en
        a_tempo: "A tempo", // it
        storico: "Storico", // it
        show_tour: "Mostra itinerario", // it
        tour_alert_title: "Attenzione", // it
        tour_alert_message:
          "Sei sicuro di voler chiudere la mappa dell'itinerario?", // it
      },
    },
    fr: {
      translation: {
        lang: "Français",
        change_language: "Change language", // en
        info: "Information", // en
        tracking: "Tracciamento", //en
        agree: "Accept", // en
        decline: "Decline", // en
        cat_churches: "Église",
        cat_monuments: "Monuments",
        cat_museums: "Musées et Centres d'Exposition",
        user_position: "Tu es ici",
        close: "Close", // en
        description: "Description", // en
        open_time: "Open Time", // en
        tickets: "Tickets", // en
        chart: "Grafico occupazione", // it
        historical: "Historical", // en
        real: "Real", // en
        expected: "Expected", // en
        day_week_mon: "Monday", // en
        day_week_tue: "Tuesday", // en
        day_week_wed: "Wednesay", // en
        day_week_thu: "Thursday", // en
        day_week_fri: "Friday", // en
        day_week_sat: "Saturday", // en
        day_week_sun: "Sunday", // en
        crowding: "Crowding", // en
        xlabel: "Time", // en
        ylabel: "#People", // en
        firstRange: "Morning",  // en
        secondRange: "Noon",  // en
        thirdRange: "Afternoon",  // en
        val_real: "real", // en
        val_stim: "expected", // en
        val_stor: "historical", // en
        prev: "Previous", // en
        next: "Next", // en
        not_supported: "This content is not available in your language.", // en
        user_offline: "You are offline", // en
        user_not_in_verona: "You are not in Verona", // en
        details_button: "details", // en
        tracking_title: "Privacy alert", // it
        tracking_message:
          "TurismoVerona vorrebbe tracciare in maniera anonima i dati della vostra esprerienza.<br/>" +
          "I dati raccolti sono: identificatore anonimo, posizione, lingua e sistema operativo.<br/>Vuoi partecipare?", // it
        info_title: "Informazioni e contatti", // it
        info_message:
          "Prototipo realizzato dal comune di Verona con la collaborazione dell'Università degli studi di Verona - Dipartimento di Informatica", // it
        tours: "Tours", // en
        a_tempo: "A tempo", // it
        storico: "Storico", // it
        show_tour: "Mostra itinerario", // it
        tour_alert_title: "Attenzione", // it
        tour_alert_message:
          "Sei sicuro di voler chiudere la mappa dell'itinerario?", // it
      },
    },
    es: {
      translation: {
        lang: "Español",
        change_language: "Change language", // en
        info: "Information", // en
        tracking: "Tracciamento", //en
        agree: "Accept", // en
        decline: "Decline", // en
        cat_churches: "Iglesias",
        cat_monuments: "Monumentos",
        cat_museums: "Museos y Centros de Exposiciones",
        user_position: "Tú estás aquí",
        close: "Close", // en
        description: "Description", // en
        open_time: "Open Time", // en
        tickets: "Tickets", // en
        chart: "Grafico occupazione", // it
        historical: "Historical", // en
        real: "Real", // en
        expected: "Expected", // en
        day_week_mon: "Monday", // en
        day_week_tue: "Tuesday", // en
        day_week_wed: "Wednesay", // en
        day_week_thu: "Thursday", // en
        day_week_fri: "Friday", // en
        day_week_sat: "Saturday", // en
        day_week_sun: "Sunday", // en
        crowding: "Crowding", // en
        xlabel: "Time", // en
        ylabel: "#People", // en
        firstRange: "Morning",  // en
        secondRange: "Noon",  // en
        thirdRange: "Afternoon",  // en
        val_real: "real", // en
        val_stim: "expected", // en
        val_stor: "historical", // en
        prev: "Previous", // en
        next: "Next", // en
        not_supported: "This content is not available in your language.", // en
        user_offline: "You are offline", // en
        user_not_in_verona: "You are not in Verona", // en
        details_button: "details", // en
        tracking_title: "Privacy alert", // it
        tracking_message:
          "TurismoVerona vorrebbe tracciare in maniera anonima i dati della vostra esprerienza.<br/>" +
          "I dati raccolti sono: identificatore anonimo, posizione, lingua e sistema operativo.<br/>Vuoi partecipare?", // it
        info_title: "Informazioni e contatti", // it
        info_message:
          "Prototipo realizzato dal comune di Verona con la collaborazione dell'Università degli studi di Verona - Dipartimento di Informatica", // it
        tours: "Tours", // en
        a_tempo: "A tempo", // it
        storico: "Storico", // it
        show_tour: "Mostra itinerario", // it
        tour_alert_title: "Attenzione", // it
        tour_alert_message:
          "Sei sicuro di voler chiudere la mappa dell'itinerario?", // it
      },
    },
  },
});

export default i18n;
