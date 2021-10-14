import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
  IonLabel,
  useIonViewDidEnter,
  IonLoading,
  IonActionSheet,
  IonAlert,
} from "@ionic/react";
import {
  language,
  ellipsisHorizontal,
  locationOutline,
  colorWandSharp,
} from "ionicons/icons";
import { TileLayer, useMap, Marker, Popup } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import churchIcon from "../assets/images/art_church.png"; // Icona chiesa
import monumentIcon from "../assets/images/art_monument.png"; // Icona monumento
import museumIcon from "../assets/images/art_museum.png"; // Icona museo
import locationIcon from "../assets/images/location-sharp.svg";
import churchIconFilter from "../assets/images/art_church.svg"; // Icona chiesa filtro
import monumentIconFilter from "../assets/images/art_monument.svg"; // Icona monumento filtro
import museumIconFilter from "../assets/images/art_museum.svg"; // Icona museo filtro
import "../assets/leaflet/leaflet.css";
import { ConnectionStatus, Network } from "@capacitor/network";
import { Device } from "@capacitor/device";
import { Storage } from "@capacitor/storage";
import { Geolocation, Position } from "@capacitor/geolocation";
import {
  findCenter,
  getListFromWebServer,
  getDetailsFromWebServer,
} from "../components/Functions";
import POIModal from "./POIModal";
import { useTranslation } from "react-i18next";

var jj =
  '{  "features": [    {      "properties": {  "classid": "44",   "open_time" : null,    "descr_it": "Detto anche di Cangrande",        "image_url": "http://www.turismoverona.eu/cache/cfx_imagecr3/11A53001AAADD23C941C7A2BDC95F35B.jpg",        "name_it": "Palazzo del Governo e della Prefettura"      }    }  ],  "numberReturned": 1}';

const textPosition: any = {
  it: "Ti trovi qui",
  en: "You are here",
  de: "Du bist hier",
  fr: "Tu es ici",
  es: "Tú estás aquí",
};

const baseData = [
  {
    category_it: "Chiese",
    category_en: "Churches",
    category_de: "Kirchen",
    category_fr: "Église",
    category_es: "Iglesias",
    elements: new Array(),
  },
  {
    category_it: "Monumenti",
    category_en: "Monuments",
    category_de: "Denkmäler",
    category_fr: "Monuments",
    category_es: "Monumentos",
    elements: new Array(),
  },
  {
    category_it: "Musei e Centri Espositivi",
    category_en: "Museums and Exhibition Centers",
    category_de: "Museen und Ausstellungszentren",
    category_fr: "Musées et Centres d'Exposition",
    category_es: "Museos y Centros de Exposiciones",
    elements: new Array(),
  },
];

var data: any;
data = baseData;
var detailedData: any;
var isLoading: boolean = false;
const onlineBounds = L.latLngBounds(
  [46.82405708134416, 10.194074757395123],
  [44.73066988557427, 13.193342264225922]
);
const offlineBounds = L.latLngBounds([45.4568, 10.9625], [45.4203, 11.0227]);
var watchId: string;

function MapChild() {
  const [downloadedData, setDownloadedData] = useState<boolean>(false); // True se la lista dei punti con le loro coordinate sono stati scaricati dal webserver
  const [dataObtained, setDataObtained] = useState<boolean>(false); // True se possiedo la lista dei punti con le loro coordinate, o sono stati caricati dalla memoria oppure scaricati dal webserver
  const [showLoading, setShowLoading] = useState<boolean>(false); // Permette di mostrare il componente di caricamento
  const [churchersFilter, setChurchersFilter] = useState<boolean>(true); // Variabile che indica se mostrate sulla mappa le chiese
  const [monumentsFilter, setMonumentsFilter] = useState<boolean>(true); // Variabile che indica se mostrate sulla mappa i monumenti
  const [museumsFilter, setMuseumsFilter] = useState<boolean>(true); // Variabile che indica se mostrate sulla mappa i musei
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    // Stato della connessione del dispositivo
    connected: true,
    connectionType: "none",
  });
  const [chooseLanguage, setChooseLanguage] = useState<boolean>(false); // Variabile che indica se mostrare l'alert per la selezione della lingua
  const [showModal, setShowModal] = useState<boolean>(false); // Mostra la POIModal in cui sono presenti i dettagli di un punto di interesse
  const [position, setPosition] = useState<Position>(); // Variabile che contiene la posizione dell'utente
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false); // Variabile che contiene se si ha il permesso di ottenere la posizione dell'utente

  const map = useMap();
  const { t, i18n } = useTranslation();

  function setCenterPosition() {
    if (permissionGranted) {
      let pos = L.latLng(position!.coords.latitude, position!.coords.longitude);
      if (offlineBounds.contains(pos)) map.panTo(pos);
      else {
        Geolocation.clearWatch({ id: watchId });
      }
    } else checkLocationPermission();
  }
  function setCenterData() {
    map.panTo(findCenter(data));
  }
  function setOfflineBounds() {
    map.setMaxBounds(offlineBounds);
  }
  function setOnlineBounds() {
    map.setMaxBounds(onlineBounds);
  }

  function updateUserPosition(pos: Position | null) {
    if (pos) {
      setPosition(pos);
      setPermissionGranted(true);
    }
  }

  function checkLocationPermission() {
    Geolocation.checkPermissions().then((permission) => {
      switch (permission.location) {
        case "denied":
          return;
        case "granted":
          Geolocation.watchPosition(
            { enableHighAccuracy: true },
            updateUserPosition
          ).then((id) => (watchId = id));
          break;
        default:
          Geolocation.requestPermissions()
            .then((permission) => {
              if (permission.location == "granted") {
                Geolocation.watchPosition(
                  { enableHighAccuracy: true },
                  updateUserPosition
                ).then((id) => (watchId = id));
              }
            })
            .catch(() => console.log("Browser not implemented"));
          break;
      }
    });
  }

  useIonViewDidEnter(() => {
    map.invalidateSize();

    checkLocationPermission();

    Network.getStatus().then((netStatus) => {
      setConnectionStatus(netStatus);
      Storage.get({ key: "baseData" }).then((result) => {
        if (result.value != null) {
          data = JSON.parse(result.value);
          setDataObtained(true);
          setCenterData();
          setOnlineBounds();
        }
      });

      if (netStatus.connected) {
        getList();
      } else {
        setOfflineBounds();
      }
    });

    // Recupera la lingua del dispositivo
    Storage.get({ key: "languageCode" }).then((result) => {
      if (result.value != null) {
        i18n.changeLanguage(result.value);
      } else {
        Device.getLanguageCode().then((lang) => {
          var language = lang.value.substr(0, 2);
          if (
            language != "it" &&
            language != "en" &&
            language != "de" &&
            language != "fr" &&
            language != "es"
          ) {
            language = "en";
          }
          i18n.changeLanguage(language);
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
    }
    setConnectionStatus(status);
  });

  function getList() {
    if (downloadedData) return;
    getListFromWebServer()
      .then((json: any) => {
        let result = json.features;
        data = baseData;
        result.forEach((element: any) => {
          let index = data.findIndex(
            (value: any) => value.category_it == element.properties.category_it
          );
          if (index != -1) {
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
        setDataObtained(false);
        setDataObtained(true);
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
      detailedData == null ||
      (detailedData != null && detailedData.classid != id)
    ) {
      detailedData = null;
      getDetailsFromWebServer(id)
        .then((json) => {
          if (json.numberReturned == 1) {
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
    if (detailedData != null && detailedData.classid == id) {
      setShowModal(true);
      isLoading = false;
    } else {
      setShowLoading(true);
      isLoading = true;
    }
  }

  return (
    <>
      {/* Notifica se il dispositivo è offline */}
      <IonActionSheet
        mode="ios"
        cssClass="my-action-sheet"
        isOpen={!connectionStatus?.connected}
        buttons={[
          {
            text: "Sei offline",
          },
        ]}
      />
      <IonAlert
        isOpen={chooseLanguage}
        header={"Choose a language"}
        inputs={[
          {
            name: "it",
            type: "radio",
            label: "Italiano",
            checked: i18n.language == "it",
            handler: () => {
              i18n.changeLanguage("it");
            }
          },
          {
            name: "en",
            type: "radio",
            label: "English",
            checked: i18n.language == "en",
            handler: () => {
              i18n.changeLanguage("en");
            }
          },
          {
            name: "de",
            type: "radio",
            label: "Deutsch",
            checked: i18n.language == "de",
            handler: () => {
              i18n.changeLanguage("de");
            }
          },
          {
            name: "fr",
            type: "radio",
            label: "Français",
            checked: i18n.language == "fr",
            handler: () => {
              i18n.changeLanguage("fr");
            }
          },
          {
            name: "es",
            type: "radio",
            label: "Español",
            checked: i18n.language == "es",
            handler: () => {
              i18n.changeLanguage("es");
            }
          },
        ]}
        buttons={[
          {
            text: "Okay",
            handler: () => {
              Storage.set({
                key: "languageCode",
                value: i18n.language,
              });
            },
          },
        ]}
        onDidDismiss={() => setChooseLanguage(false)}
      />
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
      {permissionGranted && (
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
      {dataObtained &&
        churchersFilter &&
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
            >
              <IonLabel onClick={() => openModal(element.id)}>
                {element["name_" + i18n.language] != null
                  ? element["name_" + i18n.language]
                  : element["name_en"]}
              </IonLabel>
            </Popup>
          </Marker>
        ))}
      {/* Creazione dinamica dei marker dei monumenti */}
      {dataObtained &&
        monumentsFilter &&
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
            >
              <IonLabel onClick={() => openModal(element.id)}>
                {element["name_" + i18n.language] != null
                  ? element["name_" + i18n.language]
                  : element["name_en"]}
              </IonLabel>
            </Popup>
          </Marker>
        ))}
      {/* Creazione dinamica dei marker dei musei */}
      {dataObtained &&
        museumsFilter &&
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
            >
              <IonLabel onClick={() => openModal(element.id)}>
                {element["name_" + i18n.language] != null
                  ? element["name_" + i18n.language]
                  : element["name_en"]}
              </IonLabel>
            </Popup>
          </Marker>
        ))}

      {/* Filtro dei marker */}
      <IonFab vertical="bottom" horizontal="end" className="ion-margin-bottom">
        <IonFabButton>
          <IonIcon icon={ellipsisHorizontal} />
        </IonFabButton>
        <IonFabList side="top">
          <IonFabButton
            class={
              churchersFilter
                ? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list ion-activatable ion-focusable hydrated"
                : "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable ion-focusable hydrated"
            }
            onClick={() => {
              setChurchersFilter(!churchersFilter);
            }}
            disabled={!dataObtained}
          data-desc={t("cat_churches")}
            data-bool={churchersFilter}
          >
            <IonIcon
              icon={churchIconFilter}
              class={
                churchersFilter
                  ? "my-icon md hydrated"
                  : "my-icon-opacity md hydrated"
              }
            />
          </IonFabButton>
          <IonFabButton
            class={
              monumentsFilter
                ? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list ion-activatable ion-focusable hydrated"
                : "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable ion-focusable hydrated"
            }
            onClick={() => setMonumentsFilter(!monumentsFilter)}
            disabled={!dataObtained}
            data-desc={t("cat_monuments")}
          >
            <IonIcon
              icon={monumentIconFilter}
              class={
                monumentsFilter
                  ? "my-icon md hydrated"
                  : "my-icon-opacity md hydrated"
              }
            />
          </IonFabButton>
          <IonFabButton
            class={
              museumsFilter
                ? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list ion-activatable ion-focusable hydrated"
                : "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable ion-focusable hydrated"
            }
            onClick={() => setMuseumsFilter(!museumsFilter)}
            disabled={!dataObtained}
            data-desc={t("cat_museums")}
          >
            <IonIcon
              icon={museumIconFilter}
              class={
                museumsFilter
                  ? "my-icon md hydrated"
                  : "my-icon-opacity md hydrated"
              }
            />
          </IonFabButton>
        </IonFabList>

        <IonFabList side="start">
          <IonFabButton color="light" onClick={() => setChooseLanguage(true)}>
            <IonIcon icon={language} />
          </IonFabButton>
        </IonFabList>
      </IonFab>

      <IonFab
        vertical="bottom"
        horizontal="start"
        className="ion-margin-bottom"
        onClick={() => {
          setCenterPosition();
        }}
      >
        <IonFabButton color="light">
          <IonIcon icon={locationOutline} />
        </IonFabButton>
      </IonFab>
    </>
  );
}

export default MapChild;
