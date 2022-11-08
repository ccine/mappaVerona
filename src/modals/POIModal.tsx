import { useState } from "react";
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
  IonHeader,
  useIonPopover,
  IonButtons,
  IonThumbnail,
  IonNote,
  IonList,
  useIonToast,
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
import {
  fetchCrowding,
  fetchPOIMedia,
  fetchTourDetails,
} from "../components/Functions";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import ReactPlayer from "react-player/file";
import "swiper/swiper-bundle.min.css";
import "@ionic/react/css/ionic-swiper.css";
import PopoverList from "../components/PopoverList";
import logoVerona from "../assets/images/logo_stemma.png";
import TourModal from "./TourModal";
import { i18n } from "i18next";
import { LanguageCode, POIDetails, TourDetails } from "../types/app_types";
import { Storage } from "@capacitor/storage";
import { ConnectionStatus } from "@capacitor/network";

var tour_details: TourDetails;

function POIModal(props: {
  openCondition: boolean;
  onPresent?: (arg0: boolean) => void;
  onDismissConditions: (arg0: boolean) => void;
  data: POIDetails;
  i18n: i18n;
  connectionStatus: ConnectionStatus;
  setTourDetails: (arg0: TourDetails) => void;
  closeAllModals: () => void;
}) {
  const [openTimeView, setOpenTimeView] = useState<boolean>(false); // Mostra o nascondi il testo relativo agli orari del punto di interesse
  const [ticketsView, setTicketsView] = useState<boolean>(false); // Mostra o nascondi il testo relativo al prezzo dei biglietti del punto di interesse
  const [toursView, setToursView] = useState<boolean>(false); // Mostra o nascondi il testo relativo agli itinerari
  const [urlMedia, setUrlMedia] = useState<string>(); // Imposta la URL da dove caricare il video del POI se è presente
  const [textPlaying, setTextPlaying] = useState<boolean>(false); // Controlla se il TTS è in riproduzione o no
  const [showTourModal, setShowTourModal] = useState<boolean>(false); // Mostra o nascondi il modale dell'itinerario
  const [dataCrowding, setDataCrowding] = useState<String>(); // Dati affollamento
  const [presentToast] = useIonToast();

  /**
   * Conta il numero di itinerari in cui il punto di interesse è presente
   */
  const n_tours = props.data.tours_id
    ? props.data.tours_id.split(",").length
    : 0;

  const [graphView, setGraphView] = useState<boolean>(false); // Mostra o nascondi il grafico della popolazione nel POI

  const graphCrowdingData = (data: any) => {
    return {
      labels: [
        props.i18n.t("firstRange"),
        props.i18n.t("secondRange"),
        props.i18n.t("thirdRange"),
      ],
      datasets: [
        {
          label: props.i18n.t("val_stor"),
          data: [
            data[0].properties.val_stor,
            data[1].properties.val_stor,
            data[2].properties.val_stor,
          ],
          backgroundColor: "rgb(255, 99, 132)",
        },
        {
          label: props.i18n.t("val_stim"),
          data: [
            data[0].properties.val_stim,
            data[1].properties.val_stim,
            data[2].properties.val_stim,
          ],
          backgroundColor: "rgb(75, 192, 192)",
        },
        {
          label: props.i18n.t("val_real"),
          data: [
            data[0].properties.var_real,
            data[1].properties.var_real,
            data[2].properties.var_real,
          ],
          backgroundColor: "rgb(54, 162, 235)",
        },
      ],
    };
  };

  function BarChart(props: { data: any; i18n: i18n }) {
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
                text: props.i18n.t("ylabel"),
                font: {
                  weight: "bold",
                  size: 14,
                },
              },
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
    if (props.connectionStatus.connected) {
      fetchTourDetails(id_tour, (tour: TourDetails) => {
        Storage.set({
          key: `tour${tour.properties.classid}`,
          value: JSON.stringify(tour),
        });
        tour_details = tour;
        setShowTourModal(true);
      });
    } else {
      // Controlla se i dettagli sono presenti in cache e li mostra
      Storage.get({ key: `tour${id_tour}` }).then((result) => {
        if (result.value !== null) {
          tour_details = JSON.parse(result.value);
          setShowTourModal(true);
        } else {
          presentToast({
            message: props.i18n.t("user_offline"),
            duration: 5000,
          });
        }
      });
    }
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
        fetchCrowding(props.data.classid, (res: string) => {
          setDataCrowding(res);
        });
      }}
    >
      {showTourModal && (
        <TourModal
          openCondition={showTourModal}
          onDismissConditions={setShowTourModal}
          data={tour_details}
          i18n={props.i18n}
          connectionStatus={props.connectionStatus}
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
          {props.data.image_url && (
            <IonRow className="ion-align-items-center">
              <IonCol>
                <IonImg src={props.data.image_url} />
              </IonCol>
            </IonRow>
          )}

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
          {dataCrowding && (
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonItem
                    color="primary" //TITOLO MENU COLORATO
                    lines={graphView ? "inset" : "none"}
                    onClick={() => setGraphView(!graphView)}
                  >
                    <IonLabel>{props.i18n.t("crowding")}</IonLabel>
                    <IonIcon
                      slot="end"
                      icon={graphView ? removeCircle : addCircle}
                      // color="primary" BOTTONE BIANCO CON TITOLO COLORATO
                    />
                  </IonItem>
                  {graphView && (
                    <IonCardContent>
                      <IonLabel>{new Date().toDateString()}</IonLabel>
                      <BarChart
                        data={graphCrowdingData(dataCrowding)}
                        i18n={props.i18n}
                      />
                    </IonCardContent>
                  )}
                </IonCard>
              </IonCol>
            </IonRow>
          )}

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
