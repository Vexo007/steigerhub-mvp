export const workplanTypes = [
  "Algemeen VGM plan",
  "Montageplan",
  "Demontageplan",
  "Steiger veiligheidsplan"
] as const;

export const workplanSections = [
  {
    key: "algemeen",
    title: "Algemeen",
    description: "Basisgegevens van het werkplan zoals titel, adres, data en projectnummer."
  },
  {
    key: "partijen",
    title: "Partijen",
    description: "Opdrachtgever, hoofdaannemer, uitvoerder en contactpersonen."
  },
  {
    key: "referenties",
    title: "Referenties",
    description: "Projectreferenties, documenten en broninformatie."
  },
  {
    key: "werkzaamheden",
    title: "Werkzaamheden",
    description: "Werkstappen, planning en inrichting van de projectlocatie."
  },
  {
    key: "risicos",
    title: "Beheersen risico's",
    description: "Risico's, maatregelen en PBM-afspraken."
  },
  {
    key: "bijlagen",
    title: "Bijlagen",
    description: "Bijlagen en extra afspraken die bij het plan horen."
  },
  {
    key: "genereren",
    title: "Genereren",
    description: "Genereer een preview of documentversie van het werkplan."
  }
] as const;

export type WorkplanSectionKey = (typeof workplanSections)[number]["key"];
