import {
  IonAlert,
  IonChip,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import { i18n } from "i18next";
import { footsteps, map } from "ionicons/icons";
import { Polyline } from "react-leaflet";
import { useState } from "react";
import { TourDetails, POI, LanguageCode } from "../types/app_types";
import TourModal from "../modals/TourModal";

function TourOnMap(props: {
  i18n: i18n;
  tourDetails: TourDetails;
  setTourDetails: (arg0: TourDetails | undefined) => void;
  POIListData: POI[];
}) {
  const [closeTourAlert, setCloseTourAlert] = useState<boolean>(false); // Indica se mostrare l'alert di conferma chiusura del tour
  const [showTourModal, setShowTourModal] = useState<boolean>(false); // Mostra la modale dell'itinerario
  const code = props.i18n.language as LanguageCode;

  /** Mostra l'alert di chiusura itinerario se viene premuto il tasto indietro sul telefono */
  document.addEventListener("ionBackButton", (ev) => {
    setCloseTourAlert(true);
  });

  /** Coordinate che disegnano l'interesse, vengono invertite di posizione rispetto a quelle ricevute */
  const polylineTour: [number, number][] =
    props.tourDetails.geometry.coordinates[0].map(
      (coordinates: [number, number]) => [coordinates[1], coordinates[0]]
    );

  // Trovare il centro in base ai punti di interesse presenti nel tour
  // let max = polylineTour.reduce(
  //     (max: [number, number], curr: [number, number]) => [
  //       max[0] > curr[0] ? max[0] : curr[0],
  //       max[1] > curr[1] ? max[1] : curr[1],
  //     ],
  //     [-100, -100]
  //   );
  //   let min = polylineTour.reduce(
  //     (min: [number, number], curr: [number, number]) => [
  //       min[0] < curr[0] ? min[0] : curr[0],
  //       min[1] < curr[1] ? min[1] : curr[1],
  //     ],
  //     [100, 100]
  //   );
  //   const tourCenter: [number, number] = [
  //     (max[0] + min[0]) / 2,
  //     (max[1] + min[1]) / 2,
  //   ];

  return (
    <>
      {/* Titolo itinerario */}
      <IonFab vertical="top" style={{ width: "-webkit-fill-available" }}>
        <IonChip
          class="chip"
          className="ion-margin-end"
          onClick={() => {
            setShowTourModal(true);
          }}
        >
          <IonIcon icon={footsteps} color="primary" />
          <IonLabel class="chip-label">
            {props.tourDetails.properties[`name_${code}`] ??
              props.tourDetails.properties.name_en}
          </IonLabel>
        </IonChip>
      </IonFab>

      {/* Pulsante per tornare alla mappa originale */}
      <IonFab
        vertical="top"
        horizontal="end"
        className="ion-margin-bottom"
        onClick={() => setCloseTourAlert(true)}
      >
        <IonFabButton>
          <IonIcon icon={map} />
        </IonFabButton>
      </IonFab>

      {/* Alert di conferma chiusura itinerario */}
      <IonAlert
        isOpen={closeTourAlert}
        header={props.i18n.t("tour_alert_title")}
        message={props.i18n.t("tour_alert_message")}
        onDidDismiss={() => {
          setCloseTourAlert(false);
        }}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "secondary",
          },
          {
            text: "Okay",
            handler: () => {
              props.setTourDetails(undefined);
            },
          },
        ]}
      />

      <Polyline positions={polylineTour} />

      {showTourModal && (
        <TourModal
          openCondition={showTourModal}
          onDismissConditions={setShowTourModal}
          data={props.tourDetails}
          i18n={props.i18n}
          setTourDetails={props.setTourDetails}
          closeAllModals={() => {
            setShowTourModal(false);
          }}
        />
      )}
    </>
  );
}

export default TourOnMap;