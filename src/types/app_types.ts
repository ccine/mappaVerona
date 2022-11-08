export enum LanguageCode {
  it = "it",
  en = "en",
  fr = "fr",
  de = "de",
  es = "es",
}

export interface POIDetails {
  classid: string;
  image_url: string;

  name_it: string;
  name_en: string;
  name_de: string;
  name_fr: string;
  name_es: string;

  descr_it: string;
  descr_en: string;
  descr_de: string;
  descr_fr: string;
  descr_es: string;

  open_time: string;
  open_time_en: string;
  open_time_de: string;
  open_time_fr: string;
  open_time_es: string;

  tickets: string;
  tickets_en: string;
  tickets_de: string;
  tickets_fr: string;
  tickets_es: string;

  tours_id: string;
  tours_name_it: string;
  tours_name_en: string;
  tours_name_de: string;
  tours_name_fr: string;
  tours_name_es: string;
}

export interface POI {
  properties: {
    id_art: string;

    name_it: string;
    name_en: string;
    name_de: string;
    name_fr: string;
    name_es: string;

    category_it: string;
    category_en: string;
    category_de: string;
    category_fr: string;
    category_es: string;
  };

  geometry: {
    coordinates: [number, number];
  };
}

export interface TourDetails {
  geometry: {
    coordinates: [number, number][][];
  };

  properties: {
    classid: string;
    image_url: string;

    name_it: string;
    name_en: string;
    name_de: string;
    name_fr: string;
    name_es: string;

    descr_it: string;
    descr_en: string;
    descr_de: string;
    descr_fr: string;
    descr_es: string;

    points_tour_id: string;
    points_tour_name_it: string;
    points_tour_name_en: string;
    points_tour_name_de: string;
    points_tour_name_fr: string;
    points_tour_name_es: string;
    points_geom: string;
  };
}

export interface Tour {
  properties: {
    id_tour: string;
    type: string;

    name_it: string;
    name_en: string;
    name_de: string;
    name_fr: string;
    name_es: string;
  };
}

export interface Crowding {
  data: string
  date_creat: string
  val_real: number
  val_stim: number
  val_stor: number
  punto_di_interesse: string
}
