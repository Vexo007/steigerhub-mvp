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

type SectionField = {
  key: string;
  label: string;
  type?: "date";
  textarea?: boolean;
  placeholder?: string;
  group?: string;
};

export function getWorkplanSectionFields(sectionKey: WorkplanSectionKey): SectionField[] {
  switch (sectionKey) {
    case "algemeen":
      return [
        { key: "titel", label: "Titel", placeholder: "Herbouw woning", group: "Project" },
        { key: "projectnummer", label: "Projectnummer", placeholder: "2026p48", group: "Project" },
        { key: "adres", label: "Adres van de locatie", placeholder: "Rijksweg 13", group: "Locatie" },
        { key: "plaats", label: "Plaats", placeholder: "Wirdum", group: "Locatie" },
        { key: "startdatum", label: "Datum aanvang", type: "date", group: "Planning" },
        { key: "einddatum", label: "Einddatum", type: "date", group: "Planning" }
      ];
    case "partijen":
      return [
        { key: "opdrachtgever", label: "Opdrachtgever", placeholder: "Woonstaete BV", group: "Betrokken partijen" },
        { key: "hoofdaannemer", label: "Hoofdaannemer", placeholder: "Hoofdaannemer BV", group: "Betrokken partijen" },
        { key: "uitvoerder", label: "Naam uitvoerder", placeholder: "J. de Vries", group: "Betrokken partijen" },
        { key: "contactpersoon", label: "Contactpersoon", placeholder: "M. Jansen", group: "Contact" },
        { key: "telefoon", label: "Telefoon", placeholder: "06 12345678", group: "Contact" }
      ];
    case "referenties":
      return [
        { key: "bron", label: "Bron / referentie", placeholder: "Bestek / werktekening / V&G map", group: "Referenties" },
        { key: "documenten", label: "Documenten", textarea: true, placeholder: "Welke documenten horen bij dit plan?", group: "Referenties" },
        { key: "opmerkingen", label: "Opmerkingen", textarea: true, placeholder: "Extra toelichting", group: "Referenties" }
      ];
    case "werkzaamheden":
      return [
        { key: "werkstappen", label: "Uit te voeren werkzaamheden", textarea: true, placeholder: "Omschrijf de werkzaamheden", group: "Werkzaamheden" },
        { key: "projectlocatie", label: "Inrichting projectlocatie", textarea: true, placeholder: "Omschrijf de inrichting van de locatie", group: "Werkzaamheden" },
        { key: "werktijden", label: "Werk- en rusttijden", placeholder: "07:00 - 15:45", group: "Planning" }
      ];
    case "risicos":
      return [
        { key: "risicos", label: "Belangrijkste risico's", textarea: true, placeholder: "Valgevaar, verkeer, hijswerk", group: "Risico's" },
        { key: "maatregelen", label: "Maatregelen", textarea: true, placeholder: "Afscherming, PBM, LMRA", group: "Beheersmaatregelen" },
        { key: "pbm", label: "Verplichte PBM", textarea: true, placeholder: "Helm, schoenen, harnas", group: "Beheersmaatregelen" }
      ];
    case "bijlagen":
      return [{ key: "bijlagen", label: "Bijlagen / afspraken", textarea: true, placeholder: "Omschrijf de bijlagen en extra afspraken", group: "Bijlagen" }];
    default:
      return [];
  }
}
