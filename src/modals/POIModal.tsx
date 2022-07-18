import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonText,
  IonToolbar,
  IonicSwiper,
  IonHeader,
  useIonPopover,
  IonButtons,
  IonThumbnail,
  IonNote,
  IonList,
} from "@ionic/react";
import {
  addCircle,
  arrowBack,
  chevronBack,
  ellipsisHorizontal,
  ellipsisVertical,
  removeCircle,
  volumeHigh,
  volumeMute,
} from "ionicons/icons";
import ReactHtmlParser from "react-html-parser";
import { fetchPOIMedia, fetchTourDetails } from "../components/Functions";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination } from "swiper";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import ReactPlayer from "react-player/file";
import "swiper/swiper-bundle.min.css";
import "@ionic/react/css/ionic-swiper.css";
import PopoverList from "../components/PopoverList";
import logoVerona from "../assets/images/logo_stemma.png";
import TourModal from "./TourModal";
import { i18n } from "i18next";
import { LanguageCode, POIDetails, TourDetails } from "../types/app_types";

var tour_details: TourDetails;

function POIModal(props: {
  openCondition: boolean;
  onPresent?: (arg0: boolean) => void;
  onDismissConditions: (arg0: boolean) => void;
  data: POIDetails;
  i18n: i18n;
  setTourDetails: (arg0: TourDetails) => void;
  closeAllModals: () => void;
}) {
  const [openTimeView, setOpenTimeView] = useState<boolean>(false); // Mostra o nascondi il testo relativo agli orari del punto di interesse
  const [ticketsView, setTicketsView] = useState<boolean>(false); // Mostra o nascondi il testo relativo al prezzo dei biglietti del punto di interesse
  const [toursView, setToursView] = useState<boolean>(false); // Mostra o nascondi il testo relativo agli itinerari
  const [urlMedia, setUrlMedia] = useState<string>(); // Imposta la URL da dove caricare il video del POI se è presente
  const [textPlaying, setTextPlaying] = useState<boolean>(false); // Controlla se il TTS è in riproduzione o no
  const [showTourModal, setShowTourModal] = useState<boolean>(false); // Mostra o nascondi il modale dell'itinerario

  /**
   * Conta il numero di itinerari in cui il punto di interesse è presente
   */
  const n_tours = props.data.tours_id
    ? props.data.tours_id.split(",").length
    : 0;

  const [graphView, setGraphView] = useState<boolean>(false); // Mostra o nascondi il grafico della popolazione nel POI
  const [swiperInstance, setSwiperInstance] = useState<SwiperCore>(); //
  SwiperCore.use([IonicSwiper, Navigation, Pagination]);

  // DATI DI PROVA

  const data1 = {
    labels: [
      "Morning",
      "Noon",
      "Afternoon",
      /*t("day_week_mon"),
       t("day_week_tue"),
       t("day_week_tue"),
       t("day_week_thu"),
       t("day_week_fri"),
       t("day_week_sat"),
       t("day_week_sun"),
       */
    ],
    datasets: [
      {
        label: "historical",
        data: [89, 35, 65],
        backgroundColor: "rgb(255, 99, 132)",
      },
      {
        label: "expected",
        data: [80, 20, 60],
        backgroundColor: "rgb(75, 192, 192)",
      },
      {
        label: "real",
        data: [85, 0, 0],
        backgroundColor: "rgb(54, 162, 235)",
      },
    ],
  };

  const data2 = {
    labels: ["12-14", "14-16", "16-18"],
    datasets: [
      {
        label: props.i18n.t("historical"),
        data: [3, 5, 13],
        backgroundColor: "rgb(255, 99, 132)",
      },
      {
        label: props.i18n.t("expected"),
        data: [13, 15, 15],
        backgroundColor: "rgb(75, 192, 192)",
      },
    ],
  };

  const data3 = {
    labels: ["18-20", "20-22", "22-24"],
    datasets: [
      {
        label: props.i18n.t("historical"),
        data: [2, 3, 18],
        backgroundColor: "rgb(255, 99, 132)",
      },
      {
        label: props.i18n.t("expected"),
        data: [12, 13, 25],
        backgroundColor: "rgb(75, 192, 192)",
      },
    ],
  };

  function BarChart(props: { data: any, i18n: i18n; }) {
    return (
      <Bar
        data={props.data}
        //class="bar-chart"
        options={{
          animation: false,
          responsive: true,
          scales: {
            x: {
              offset: true,
              display: true,
              title: {
                display: true,
                text: props.i18n.t("xlabel"),
                font: {
                  weight: "bold",
                  size: 14,
                },
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: "# People",
                font: {
                  weight: "bold",
                  size: 14,
                },
              },
              max: 100,
              min: 0,
            },
          },
        }}
      />
    );
  }

  /**
   * Funzione che manda in riproduzione vocale la descrizione del punto di interesse
   */
  function speak() {
    setTextPlaying(true);
    let lngPlay = getDescription()
      ? props.i18n.language + "-" + props.i18n.language.toUpperCase()
      : "en-US";
    if (lngPlay === "en-EN") lngPlay = "en-US";
    TextToSpeech.speak({
      text: removeDoubleSlashN(getDescriptionFallback()),
      lang: lngPlay,
    }).then(() => setTextPlaying(false));
  }

  /**
   * Ferma la riproduzione vocale
   */
  function stop() {
    TextToSpeech.stop();
    setTextPlaying(false);
  }
  const code = props.i18n.language as LanguageCode;

  /**
   * Funzioni che restituiscono orari, biglietti e descrizione nel linguaggio scelto,
   * servono anche a controllare se il contenuto è disponibile in quella lingua
   */
  const getOpenTime = () => {
    if (code === "it") return props.data.open_time;
    return props.data[`open_time_${code}`];
  };
  const getTickets = () => {
    if (code === "it") return props.data.tickets;
    return props.data[`tickets_${code}`];
  };
  function getDescription() {
    return props.data[`descr_${code}`];
  }

  /**
   * Funzioni che restituiscono il contenuto da visualizzare nelle schede nella propria lingua,
   * se presente oppure in inglese
   */
  const getOpenTimeFallback = () => {
    let openTime = getOpenTime();
    return openTime ? openTime : props.data["open_time_en"];
  };
  const getTicketsFallback = () => {
    let tickets = getTickets();
    return tickets ? tickets : props.data["tickets_en"];
  };
  function getDescriptionFallback(): string {
    let description = getDescription();
    return description ? description : props.data["descr_en"];
  }

  const removeDoubleSlashN = (str: string) => {
    if (str) return str.replace(/\\n/g, "");
    return "No description for this POI.";
  };

  /** Menu opzioni */
  const [present, dismiss] = useIonPopover(PopoverList, {
    onHide: () => dismiss(),
  });

  /**
   * Scarica i dettagli di un itinerario e apre la modale per visualizzarli
   * @param id_tour Identificativo del tour
   */
  function getTourDetail(id_tour: string) {
    fetchTourDetails(id_tour, (tour: TourDetails) => {
      tour_details = tour;
      setShowTourModal(true);
    });
  }

  /** Creazione della lista di itinerari cliccabili */
  function TourList() {
    var tours_id = props.data.tours_id.split(",");
    tours_id = tours_id.filter(function (item, pos) {
      return tours_id.indexOf(item) === pos;
    });
    const tours_name = props.data[`tours_name_${code}`]
      ? props.data[`tours_name_${code}`].split(",")
      : props.data.tours_name_en.split(",");
    const listItems = tours_id.map((id: string, index: number) => (
      <IonItem
        button={true}
        key={id}
        lines={index < n_tours - 1 ? "inset" : "none"}
        onClick={() => {
          getTourDetail(id);
        }}
      >
        <IonLabel>{tours_name[index]}</IonLabel>
      </IonItem>
    ));
    return <IonList className="ion-no-padding">{listItems}</IonList>;
  }

  return (
    <IonModal
      isOpen={props.openCondition}
      onDidDismiss={() => {
        props.onDismissConditions(false);
        TextToSpeech.stop();
      }}
      onWillPresent={() => {
        props.onPresent?.(false);
        fetchPOIMedia(props.data.classid, (path: string) => {
          setUrlMedia(path);
        });
      }}
    >
      {showTourModal && (
        <TourModal
          openCondition={showTourModal}
          onDismissConditions={setShowTourModal}
          data={tour_details}
          i18n={props.i18n}
          setTourDetails={props.setTourDetails}
          closeAllModals={() => {
            props.closeAllModals();
            setShowTourModal(false);
          }}
        />
      )}

      {/* HEADER */}
      <IonHeader>
        <IonToolbar color="primary">
          {/* FRECCIA INDIETRO */}
          <IonButtons slot="start" class="toolbar_back_button">
            <IonIcon
              slot="icon-only"
              ios={chevronBack}
              md={arrowBack}
              onClick={() => props.onDismissConditions(false)}
            />
          </IonButtons>

          {/* LOGO COMUNE */}
          <IonThumbnail slot="start">
            <img src={logoVerona} alt="Logo Comune di Verona" />
          </IonThumbnail>

          {/* NOME POI */}
          <IonLabel slot="start" class="toolbar_label">
            {props.data[`name_${code}`] !== null
              ? props.data[`name_${code}`]
              : props.data["name_en"]}
          </IonLabel>

          {/* MENU OPZIONI POPOVER */}
          <IonButtons slot="end" className="ion-margin-end">
            <IonIcon
              slot="icon-only"
              ios={ellipsisHorizontal}
              md={ellipsisVertical}
              onClick={(e: any) =>
                present({
                  event: e.nativeEvent,
                })
              }
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid fixed={true}>
          {/* IMMAGINE */}
          <IonRow className="ion-align-items-center">
            <IonCol>
              <IonImg src={props.data.image_url} />
            </IonCol>
          </IonRow>

          {/* SCHEDA ORARI */}
          <IonRow>
            <IonCol>
              <IonCard>
                <IonItem
                  color="primary" //TITOLO MENU COLORATO
                  lines={openTimeView ? "inset" : "none"}
                  onClick={() => setOpenTimeView(!openTimeView)}
                >
                  <IonLabel>{props.i18n.t("open_time")}:</IonLabel>
                  <IonIcon
                    slot="end"
                    icon={openTimeView ? removeCircle : addCircle}
                    // color="primary" BOTTONE BIANCO CON TITOLO COLORATO
                  />
                </IonItem>

                {openTimeView && (
                  <IonCardContent>
                    {!getOpenTime() && (
                      <IonNote color="danger">
                        {props.i18n.t("not_supported")}
                        <br />
                        <br />
                      </IonNote>
                    )}
                    <IonLabel color="dark">
                      {ReactHtmlParser(getOpenTimeFallback())}
                    </IonLabel>
                  </IonCardContent>
                )}
              </IonCard>
            </IonCol>
          </IonRow>

          {/* SCHEDA BIGLIETTI */}
          <IonRow>
            <IonCol>
              <IonCard>
                <IonItem
                  color="primary" //TITOLO MENU COLORATO
                  lines={ticketsView ? "inset" : "none"}
                  onClick={() => setTicketsView(!ticketsView)}
                >
                  <IonLabel>{props.i18n.t("tickets")}:</IonLabel>
                  <IonIcon
                    slot="end"
                    icon={ticketsView ? removeCircle : addCircle}
                    // color="primary" BOTTONE BIANCO CON TITOLO COLORATO
                  />
                </IonItem>

                {ticketsView && (
                  <IonCardContent>
                    {!getTickets() && (
                      <IonNote color="danger">
                        {props.i18n.t("not_supported")}
                        <br />
                        <br />
                      </IonNote>
                    )}
                    <IonLabel color="dark">
                      {ReactHtmlParser(getTicketsFallback())}
                    </IonLabel>
                  </IonCardContent>
                )}
              </IonCard>
            </IonCol>
          </IonRow>

          {/* SCHEDA ITINERARI */}
          {n_tours > 0 && (
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonItem
                    color="primary" //TITOLO MENU COLORATO
                    lines={toursView ? "inset" : "none"}
                    onClick={() => setToursView(!toursView)}
                  >
                    <IonLabel>{props.i18n.t("tours")}:</IonLabel>
                    <IonIcon
                      slot="end"
                      icon={toursView ? removeCircle : addCircle}
                      // color="primary" BOTTONE BIANCO CON TITOLO COLORATO
                    />
                  </IonItem>

                  {toursView && (
                    <IonCardContent className="ion-no-padding">
                      <TourList />
                    </IonCardContent>
                  )}
                </IonCard>
              </IonCol>
            </IonRow>
          )}

          {/* SCHEDA OCCUPAZIONE */}

          <IonRow>
            <IonCol>
              <IonCard>
                <IonItem
                  color="primary" //TITOLO MENU COLORATO
                  lines={graphView ? "inset" : "none"}
                  onClick={() => setGraphView(!graphView)}
                >
                  <IonLabel>Crowding</IonLabel>
                  <IonIcon
                    slot="end"
                    icon={graphView ? removeCircle : addCircle}
                    // color="primary" BOTTONE BIANCO CON TITOLO COLORATO
                  />
                </IonItem>
                {graphView && (
                  <IonCardContent>
                    <IonLabel>{(new Date()).toDateString()}</IonLabel>
                      <BarChart data={data1} i18n={props.i18n}/>
                    
                    
                  </IonCardContent>
                )}
              </IonCard>
            </IonCol>
          </IonRow>

          {/* SCHEDA DESCRIZIONE */}
          <IonRow>
            <IonCol>
              <IonCard>
                <IonItem
                  color="primary" //TITOLO MENU COLORATO
                >
                  <IonLabel>{props.i18n.t("description")}:</IonLabel>
                  <IonButton
                    slot="end"
                    fill="clear"
                    onClick={textPlaying ? stop : speak}
                  >
                    <IonIcon
                      slot="icon-only"
                      color="light"
                      icon={textPlaying ? volumeMute : volumeHigh}
                    />
                  </IonButton>
                </IonItem>

                <IonCardContent>
                  {!getDescription() && (
                    <IonNote color="danger">
                      {props.i18n.t("not_supported")}
                      <br />
                      <br />
                    </IonNote>
                  )}
                  <IonText color="dark" class="format-text">
                    {removeDoubleSlashN(getDescriptionFallback())}
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* Visualizzazione del contenuto multimediale (video) */}
          {urlMedia && (
            <IonRow className="player-wrapper">
              <IonCol>
                <ReactPlayer
                  className="react-player"
                  url="https://sitavr.scienze.univr.it/veronapp/ArenaEsterno.mp4" /*DA INSERIRE urlMedia per utilizzare il PATH CORRETTO*/
                  width="100%"
                  height="100%"
                  controls
                />
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonModal>
  );
}

export default POIModal;
