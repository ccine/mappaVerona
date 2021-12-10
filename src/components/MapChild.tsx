import {
  IonLabel,
  useIonViewDidEnter,
  IonLoading,
  IonActionSheet,
  useIonToast,
  IonRow,
  IonCol,
  IonButton,
  IonGrid,
  IonButtons,
} from "@ionic/react";
import { TileLayer, useMap, Marker, Popup } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import churchIcon from "../assets/images/art_church.png"; // Icona chiesa
import monumentIcon from "../assets/images/art_monument.png"; // Icona monumento
import museumIcon from "../assets/images/art_museum.png"; // Icona museo
import locationIcon from "../assets/images/location-sharp.svg";
import "../assets/leaflet/leaflet.css";
import { ConnectionStatus, Network } from "@capacitor/network";
import { Device } from "@capacitor/device";
import { Storage } from "@capacitor/storage";
import { Geolocation, Position } from "@capacitor/geolocation";
import {
  findCenter,
  getListFromWebServer,
  getDetailsFromWebServer,
  sendPosition,
} from "../components/Functions";
import POIModal from "./POIModal";
import { useTranslation } from "react-i18next";
import { LOCATION_BOUNDS } from "../configVar";

var jj =
  '{  "features": [    {      "properties": {  "classid": "44",   "open_time" : null,    "descr_it": "Detto anche di Cangrande, fu costruito allinizio del XIV sec., ma venne più volte rimaneggiato. Lultimo restauro del 1929-30 ha tentato di restituirgli (attraverso abbattimenti di parti di epoche diverse, il ripristino della merlatura e linserimento di elementi architettonici consoni) le strutture medievali, di cui rimanevano significativi esempi nel cortile.",        "image_url": "http://www.turismoverona.eu/cache/cfx_imagecr3/11A53001AAADD23C941C7A2BDC95F35B.jpg",        "name_it": "Palazzo del Governo e della Prefettura", "name_en": "Palazzo del Governo e della Prefettura"    }    }  ],  "numberReturned": 1}';

const baseData = [
  {
    category_it: "Chiese",
    category_en: "Churches",
    category_de: "Kirchen",
    category_fr: "Église",
    category_es: "Iglesias",
    elements: [],
  },
  {
    category_it: "Monumenti",
    category_en: "Monuments",
    category_de: "Denkmäler",
    category_fr: "Monuments",
    category_es: "Monumentos",
    elements: [],
  },
  {
    category_it: "Musei e Centri Espositivi",
    category_en: "Museums and Exhibition Centers",
    category_de: "Museen und Ausstellungszentren",
    category_fr: "Musées et Centres d'Exposition",
    category_es: "Museos y Centros de Exposiciones",
    elements: [],
  },
];

var data: any = baseData;
var detailedData: any;
var isLoading: boolean = false;
const onlineBounds = L.latLngBounds(
  [46.82405708134416, 10.194074757395123],
  [44.73066988557427, 13.193342264225922]
);
const offlineBounds = L.latLngBounds([45.4568, 10.9625], [45.4203, 11.0227]);
const locationBounds = L.latLngBounds(LOCATION_BOUNDS);
var watchId: string;
var deviceLanguage: string;

function MapChild(props: {
  churchersFilter: boolean;
  monumentsFilter: boolean;
  museumsFilter: boolean;
  dataObtained: boolean;
  setDataObtained: React.Dispatch<React.SetStateAction<boolean>>;
  centerPosition: boolean;
  setCenterPosition: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [downloadedData, setDownloadedData] = useState<boolean>(false); // True se la lista dei punti con le loro coordinate sono stati scaricati dal webserver
  const [showLoading, setShowLoading] = useState<boolean>(false); // Permette di mostrare il componente di caricamento
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    // Stato della connessione del dispositivo
    connected: true,
    connectionType: "none",
  });
  const [showModal, setShowModal] = useState<boolean>(false); // Mostra la POIModal in cui sono presenti i dettagli di un punto di interesse
  const [position, setPosition] = useState<Position>(); // Variabile che contiene la posizione dell'utente
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false); // Variabile che contiene se si ha il permesso di ottenere la posizione dell'utente
  const [showLocationMarker, setShowLocationMarker] = useState<boolean>(false); // Indica se è da mostrare il marker della posizione dell'utente
  const map = useMap();
  const { t, i18n } = useTranslation();
  const [presentToast, dismissToast] = useIonToast();

  function setCenterData() {
    map.panTo(findCenter(data));
  }
  function setOfflineBounds() {
    map.setMaxBounds(offlineBounds);
  }
  function setOnlineBounds() {
    map.setMaxBounds(onlineBounds);
  }

  function setCenterPosition() {
    if (permissionGranted) {
      Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        maximumAge: 0,
      }).then((pos) => {
        if (pos) {
          let posll = L.latLng(pos.coords.latitude, pos.coords.longitude);
          if (locationBounds.contains(posll)) {
            map.panTo(posll);
            Geolocation.watchPosition(
              { enableHighAccuracy: true },
              updateUserPosition
            ).then((id) => (watchId = id));
          } else {
            Geolocation.clearWatch({ id: watchId });
            setShowLocationMarker(false);
            presentToast({
              buttons: [{ text: "hide", handler: () => dismissToast() }],
              message: t("user_not_in_verona"),
              duration: 5000,
            });
          }
        }
      });
    } else {
      checkLocationPermission();
    }
    props.setCenterPosition(false);
  }

  function updateUserPosition(pos: Position | null) {
    if (pos) {
      Device.getId().then((id) => sendPosition(id, pos));
      setPosition(pos);
      let posll = L.latLng(pos.coords.latitude, pos.coords.longitude);
      if (!locationBounds.contains(posll)) {
        Geolocation.clearWatch({ id: watchId });
        setShowLocationMarker(false);
      } else setShowLocationMarker(true);
    }
  }

  function checkLocationPermission() {
    Geolocation.requestPermissions()
      .then((permission) => {
        switch (permission.location) {
          case "denied":
            return;
          case "granted":
            setPermissionGranted(true);
            Geolocation.watchPosition(
              { enableHighAccuracy: true },
              updateUserPosition
            ).then((id) => (watchId = id));
            break;
        }
      })
      .catch(() => console.log("Browser not implemented"));
  }

  useIonViewDidEnter(() => {
    map.invalidateSize();

    checkLocationPermission();

    Network.getStatus().then((netStatus) => {
      setConnectionStatus(netStatus);
      Storage.get({ key: "baseData" }).then((result) => {
        if (result.value !== null) {
          data = JSON.parse(result.value);
          props.setDataObtained(true);
          setCenterData();
          setOnlineBounds();
        }
      });

      if (netStatus.connected) {
        getList();
      } else {
        setOfflineBounds();
        presentToast({
          buttons: [{ text: "hide", handler: () => dismissToast() }],
          message: t("user_offline"),
          duration: 5000,
        });
      }
    });

    // Recupera la lingua del dispositivo
    Storage.get({ key: "languageCode" }).then((result) => {
      if (result.value !== null) {
        i18n.changeLanguage(result.value);
      } else {
        Device.getLanguageCode().then((lang) => {
          deviceLanguage = lang.value.substr(0, 2);
          if (i18n.languages.includes(deviceLanguage)) {
            i18n.changeLanguage(deviceLanguage);
          }
        });
      }
    });
  });

  // Intercetta il cambiamento dello stato della connessione
  Network.addListener("networkStatusChange", (status) => {
    console.log("Network status changed", status);
    if (status.connected) {
      getList();
      setOnlineBounds();
    } else {
      setOfflineBounds();
      presentToast({
        buttons: [{ text: "hide", handler: () => dismissToast() }],
        message: t("user_offline"),
        duration: 5000,
      });
    }
    setConnectionStatus(status);
  });

  function getList() {
    if (downloadedData) return;
    getListFromWebServer()
      .then((json: { features: [] }) => {
        let result = json.features;
        data = baseData;
        result.forEach((element: any) => {
          let index = data.findIndex(
            (value: { category_it: string }) =>
              value.category_it === element.properties.category_it
          );
          if (index !== -1) {
            data[index].elements.push({
              name_it: element.properties.name_it,
              name_en: element.properties.name_en,
              name_de: element.properties.name_de,
              name_fr: element.properties.name_fr,
              name_es: element.properties.name_es,
              coordinates: element.geometry.coordinates,
              id: element.properties.id_art,
            });
          }
        });
        Storage.set({
          key: "baseData",
          value: JSON.stringify(data),
        });
        setDownloadedData(true);
        props.setDataObtained(false);
        props.setDataObtained(true);
        setCenterData();
      })
      .catch((error) => {
        //console.error(error);
        alert(
          "Server non disponibile. I dettagli dei POI non possono essere mostrati."
        );
      });
  }

  function getDetails(id: string) {
    if (
      detailedData === null ||
      detailedData !== null /*&& detailedData.classid != id*/
    ) {
      detailedData = null;
      getDetailsFromWebServer(id)
        .then((json) => {
          if (json.numberReturned === 1) {
            detailedData = json.features[0].properties;
            if (isLoading) {
              setShowModal(true);
            }
          }
        })
        .catch(() => {
          detailedData = JSON.parse(jj).features[0].properties;
          if (isLoading) {
            setShowModal(true);
          }
        });
    }
  }

  function openModal(id: string) {
    if (detailedData !== null /*&& detailedData.classid == id*/) {
      setShowModal(true);
      isLoading = false;
    } else {
      setShowLoading(true);
      isLoading = true;
    }
  }

  return (
    <>
      {props.centerPosition && setCenterPosition()}

      {connectionStatus?.connected && (
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      )}
      {!connectionStatus?.connected && (
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="/tiles/{z}/{x}/{y}.png"
        />
      )}
      {showLoading && (
        <IonLoading
          isOpen={showLoading}
          backdropDismiss={true}
          onDidDismiss={() => (isLoading = false)}
          spinner="circular"
        />
      )}
      {/* Modal delle informazioni riguardanti il punto di interesse cliccato */}
      {showModal && (
        <POIModal
          openCondition={showModal}
          onPresent={setShowLoading}
          onDismissConditions={setShowModal}
          data={detailedData}
          code={i18n.language}
        />
      )}

      {/* Marker della posizione corrente dell'utente */}
      {showLocationMarker && (
        <Marker
          position={[position!.coords.latitude, position!.coords.longitude]}
          icon={L.icon({
            iconUrl: locationIcon,
            iconSize: [40, 40], // size of the icon
          })}
        >
          <Popup>{t("user_position")}</Popup>
        </Marker>
      )}

      {/* Creazione dinamica dei marker delle chiese */}
      {props.dataObtained &&
        props.churchersFilter &&
        data[0].elements.map((element: any) => (
          <Marker
            key={element.id}
            position={[element.coordinates[1], element.coordinates[0]]}
            icon={L.icon({
              iconUrl: churchIcon,
              iconSize: [30, 30], // size of the icon
            })}
          >
            <Popup
              autoClose={false}
              onOpen={() => {
                getDetails(element.id);
              }}
              minWidth={125}
              keepInView
            >
              <div style={{ textAlign: "center" }}>
                <IonLabel style={{ fontSize: "14px" }}>
                  {element["name_" + i18n.language] !== null
                    ? element["name_" + i18n.language]
                    : element["name_en"]}
                </IonLabel>
                <br />
                <IonButton onClick={() => openModal(element.id)}>
                  {t("details_button")}
                </IonButton>
              </div>
            </Popup>
          </Marker>
        ))}
      {/* Creazione dinamica dei marker dei monumenti */}
      {props.dataObtained &&
        props.monumentsFilter &&
        data[1].elements.map((element: any) => (
          <Marker
            key={element.id}
            position={[element.coordinates[1], element.coordinates[0]]}
            icon={L.icon({
              iconUrl: monumentIcon,
              iconSize: [30, 30], // size of the icon
            })}
          >
            <Popup
              onOpen={() => {
                getDetails(element.id);
              }}
              minWidth={125}
              keepInView
            >
              <div style={{ textAlign: "center" }}>
                <IonLabel style={{ fontSize: "14px"}}>
                  {element["name_" + i18n.language] !== null
                    ? element["name_" + i18n.language]
                    : element["name_en"]}
                </IonLabel>
                <br />
                <IonButton shape="round" fill="outline" size="small" onClick={() => openModal(element.id)}>
                  {t("details_button")}
                </IonButton>
              </div>
            </Popup>
          </Marker>
        ))}
      {/* Creazione dinamica dei marker dei musei */}
      {props.dataObtained &&
        props.museumsFilter &&
        data[2].elements.map((element: any) => (
          <Marker
            key={element.id}
            position={[element.coordinates[1], element.coordinates[0]]}
            icon={L.icon({
              iconUrl: museumIcon,
              iconSize: [30, 30], // size of the icon
            })}
          >
            <Popup
              onOpen={() => {
                getDetails(element.id);
              }}
              minWidth={125}
              keepInView
            >
              <div style={{ textAlign: "center" }}>
                <IonLabel style={{ fontSize: "14px" }}>
                  {element["name_" + i18n.language] !== null
                    ? element["name_" + i18n.language]
                    : element["name_en"]}
                </IonLabel>
                <br />
                <IonLabel style={{ color: "blue", 'font-style': "italic", fontSize: "14px"}} onClick={() => openModal(element.id)}>
                  {t("details_button")}
                </IonLabel>
              </div>
            </Popup>
          </Marker>
        ))}
    </>
  );
}

export default MapChild;
