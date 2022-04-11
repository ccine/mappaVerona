import {
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonPopover,
} from "@ionic/react";
import React, { useState } from "react";
import {
  chevronBack,
  arrowBack,
  ellipsisHorizontal,
  ellipsisVertical,
} from "ionicons/icons";
import toolbarIcon from "../assets/images/logo.png";
import PopoverList from "./PopoverList";
import { getTourDetailsFromWebServer } from "./Functions";
import TourModal from "./TourModal";
import { i18n } from "i18next";
import { LanguageCode, Tour, TourDetails } from "../types/app_types";

var tour_details: TourDetails;

function TourListModal(props: {
  openCondition: boolean;
  onDismissConditions: (arg0: boolean) => void;
  data: Tour[];
  i18n: i18n;
}) {
  const [showTourModal, setShowTourModal] = useState<boolean>(false); // Mostra o nascondi il modale dell'itinerario
  const [present, dismiss] = useIonPopover(PopoverList, {
    onHide: () => dismiss(),
  });
  const lng = props.i18n.language as LanguageCode;

  function getPOINameFallback(tour: Tour): string {
    const name = tour.properties[`name_${lng}`];
    return name ? name : tour.properties.name_en;
  }

  /** Richiedi al server i dettagli di un itinerario */
  function getTourDetail(id_tour: string) {
    getTourDetailsFromWebServer(id_tour)
      .then((json : {features: TourDetails[]}) => {
        tour_details = json.features[0];
        setShowTourModal(true);
      })
      .catch(() => {
        //TODO: Gestire errore
      });
  }

  /** Creazione delle sezioni delle categorie dei poi*/
  function TourList(pr: {type : string}) {
    const filteredTour = props.data.filter(
      (tour: Tour) => tour.properties.type === pr.type
    );
    const n_tours = filteredTour.length;
    const listItems = filteredTour.map((tour: Tour, index: number) => (
      <IonItem
        button={true}
        key={tour.properties.id_tour}
        lines={index < n_tours - 1 ? "inset" : "none"}
        onClick={() => {
          getTourDetail(tour.properties.id_tour);
        }}
      >
        <IonLabel>{getPOINameFallback(tour)}</IonLabel>
      </IonItem>
    ));
    return <IonList className="ion-no-padding">{listItems}</IonList>;
  }

  return (
    <IonModal
      isOpen={props.openCondition}
      onDidDismiss={() => props.onDismissConditions(false)}
    >
      {showTourModal && (
        <TourModal
          openCondition={showTourModal}
          onDismissConditions={setShowTourModal}
          data={tour_details}
          i18n={props.i18n}
        />
      )}

      {/* HEADER */}
      <IonHeader>
        <IonToolbar color="primary">
          {/* FRECCIA INDIETRO */}
          <IonButtons slot="start" className="ion-margin">
            <IonIcon
              slot="icon-only"
              ios={chevronBack}
              md={arrowBack}
              onClick={() => props.onDismissConditions(false)}
            />
          </IonButtons>

          {/* LOGO COMUNE */}
          <IonItem slot="start" lines="none" color="primary">
            <IonImg src={toolbarIcon} style={{ height: "80%" }} />
          </IonItem>

          {/* TITOLO */}
          {/* <IonLabel slot="start" className="ion-padding-start">
            {t("tours")}
          </IonLabel> */}

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

          {/* TITOLO ITINERARI */}
          <IonRow>
            <IonCol>
              <IonTitle>
                <h1>{props.i18n.t("tours")}</h1>
              </IonTitle>
            </IonCol>
          </IonRow>

          {/* SCHEDA ITINERARI A TEMPO */}
          <IonRow>
            <IonCol>
              <IonCard>
                <IonItem
                  color="primary" //TITOLO MENU COLORATO
                >
                  <IonLabel>{props.i18n.t("a_tempo")}</IonLabel>
                </IonItem>

                <IonCardContent className="ion-no-padding">
                  <TourList type="a tempo" />
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* SCHEDA ITINERARI STORICI */}
          <IonRow>
            <IonCol>
              <IonCard>
                <IonItem
                  color="primary" //TITOLO MENU COLORATO
                >
                  <IonLabel>{props.i18n.t("storico")}</IonLabel>
                </IonItem>

                <IonCardContent className="ion-no-padding">
                  <TourList type="storico" />
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
}

export default TourListModal;
