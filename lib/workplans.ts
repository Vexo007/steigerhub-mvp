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
  description?: string;
  type?: "date";
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  group?: string;
};

export function getWorkplanSectionFields(sectionKey: WorkplanSectionKey): SectionField[] {
  switch (sectionKey) {
    case "algemeen":
      return [
        { key: "titel", label: "Titel", placeholder: "Herbouw woning", group: "Project" },
        { key: "projectnummer", label: "Projectnummer", placeholder: "2026P48", group: "Project" },
        { key: "type_werkplan", label: "Type werkplan", placeholder: "Algemeen VGM plan", group: "Project" },
        { key: "kadastraal_perceel", label: "Adres of kadastraal perceel", placeholder: "Rijksweg 13", group: "Locatie" },
        { key: "postcode", label: "Postcode", placeholder: "9917 PS", group: "Locatie" },
        { key: "plaats", label: "Plaats", placeholder: "Wirdum", group: "Locatie" },
        { key: "adres", label: "Adres van de locatie", placeholder: "Rijksweg 13", group: "Locatie" },
        { key: "startdatum", label: "Datum aanvang", type: "date", group: "Planning" },
        { key: "einddatum", label: "Einddatum", type: "date", group: "Planning" },
        { key: "werktijd_van", label: "Starttijd", placeholder: "07:30", group: "Planning" },
        { key: "werktijd_tot", label: "Eindtijd", placeholder: "15:45", group: "Planning" },
        { key: "werkbare_dagen", label: "Werkbare dagen", placeholder: "3", group: "Planning" },
        { key: "logo_header", label: "Logo in header", placeholder: "Bijvoorbeeld klantlogo of projectlogo", group: "Voorblad" }
      ];
    case "partijen":
      return [
        { key: "opdrachtgever", label: "Opdrachtgever", placeholder: "Woonstaete BV", group: "Betrokken partijen" },
        { key: "hoofdaannemer", label: "Hoofdaannemer", placeholder: "Bouwbedrijf Noord", group: "Betrokken partijen" },
        { key: "veiligheidskundige", label: "Veiligheidskundige", placeholder: "Veiligheidsbureau BV", group: "Betrokken partijen" },
        { key: "directievoerder", label: "Directievoerder", placeholder: "J. de Vries", group: "Betrokken partijen" },
        { key: "vg_coordinator_ontwerp", label: "V&G coördinator ontwerpfase", placeholder: "Naam / bedrijf", group: "Betrokken partijen" },
        { key: "vg_coordinator_uitvoering", label: "V&G coördinator uitvoeringsfase", placeholder: "Naam / bedrijf", group: "Betrokken partijen" },
        { key: "uitvoerder", label: "Naam uitvoerder", placeholder: "M. Jansen", group: "Contact" },
        { key: "contactpersoon", label: "Contactpersoon", placeholder: "P. Bakker", group: "Contact" },
        { key: "telefoon", label: "Telefoon", placeholder: "06 12345678", group: "Contact" },
        { key: "email", label: "E-mail", placeholder: "uitvoerder@bedrijf.nl", group: "Contact" },
        { key: "onderaannemers", label: "Onderaannemers / overige partijen", textarea: true, rows: 4, placeholder: "Noem alle extra betrokken bedrijven", group: "Meer ondernemingen" }
      ];
    case "referenties":
      return [
        { key: "bron", label: "Bron / referentie", placeholder: "Bestek / werktekening / V&G map", group: "Bijlage voor referenties" },
        { key: "tekeningen", label: "Tekeningen en revisies", textarea: true, rows: 4, placeholder: "Welke tekeningen horen bij dit plan?", group: "Referenties" },
        { key: "documenten", label: "Documenten", textarea: true, rows: 4, placeholder: "Welke documenten horen bij dit plan?", group: "Referenties" },
        { key: "extra_referenties", label: "Meer referenties", textarea: true, rows: 4, placeholder: "Extra normen, instructies of afspraken", group: "Meer referenties" },
        { key: "opmerkingen", label: "Opmerkingen", textarea: true, rows: 4, placeholder: "Extra toelichting", group: "Meer referenties" }
      ];
    case "werkzaamheden":
      return [
        { key: "werkstappen", label: "Uit te voeren werkzaamheden", textarea: true, rows: 5, placeholder: "Omschrijf de werkzaamheden", group: "Uit te voeren werkzaamheden" },
        { key: "projectlocatie", label: "Inrichting projectlocatie", textarea: true, rows: 4, placeholder: "Omschrijf de inrichting van de locatie", group: "Inrichting projectlocatie" },
        { key: "bodemgesteldheid", label: "Bodemgesteldheid en verontreinigingen", textarea: true, rows: 4, placeholder: "Bijvoorbeeld bestrating, gras, vervuiling", group: "Bodemgesteldheid en verontreinigingen" },
        { key: "tekening_werkplek", label: "Tekening inrichting werklocatie", textarea: true, rows: 4, placeholder: "Omschrijf of noem de tekening / upload", group: "Tekening" },
        { key: "afspraken", label: "Aanvullende afspraken met opdrachtgever", textarea: true, rows: 4, placeholder: "Extra afspraken of beperkingen", group: "Aanvullende afspraken" },
        { key: "werktijden", label: "Werk- en rusttijden", placeholder: "07:00 - 15:45", group: "Werk- en rusttijden" },
        { key: "communicatie", label: "Communicatie / instructie", textarea: true, rows: 4, placeholder: "Toolbox, LMRA, veiligheidsinstructies", group: "Communicatie, voorlichting en instructie" },
        { key: "registraties", label: "(Project)controle en registraties", textarea: true, rows: 4, placeholder: "Welke controles en registraties horen hierbij?", group: "(Project)controle en registraties" }
      ];
    case "risicos":
      return [
        { key: "rie_bijlage", label: "Bijlage voor projectgebonden RI&E", textarea: true, rows: 3, placeholder: "Omschrijf bijlagen of verwijs naar document", group: "Bijlage voor projectgebonden RI&E" },
        { key: "rie_uitsluiting", label: "RI&E uitsluiten", textarea: true, rows: 4, placeholder: "Welke standaard RI&E onderdelen zijn niet van toepassing?", group: "RI&E uitsluiten" },
        { key: "algemene_rie", label: "Algemene projectgebonden RI&E", textarea: true, rows: 4, placeholder: "Algemene risico's en maatregelen", group: "Algemene projectgebonden RI&E" },
        { key: "omgeving_rie", label: "Projectgebonden RI&E omgeving", textarea: true, rows: 4, placeholder: "Risico's in de omgeving", group: "Projectgebonden RI&E omgeving" },
        { key: "milieu_rie", label: "Milieu projectgebonden RI&E", textarea: true, rows: 4, placeholder: "Milieuaspecten en beheersing", group: "Milieu projectgebonden RI&E" },
        { key: "bouw_rie", label: "Projectgebonden RI&E bouwwerkzaamheden", textarea: true, rows: 4, placeholder: "Bouwspecifieke risico's en maatregelen", group: "Projectgebonden RI&E bouwwerkzaamheden" },
        { key: "pbm", label: "Verplichte PBM", textarea: true, rows: 3, placeholder: "Helm, schoenen, harnas", group: "Verplichte PBM" }
      ];
    case "bijlagen":
      return [
        { key: "bijlagen", label: "Bijlagen / afspraken", textarea: true, rows: 4, placeholder: "Omschrijf de bijlagen en extra afspraken", group: "Bijlagen" },
        { key: "uploads", label: "Uploads / bestandsnamen", textarea: true, rows: 4, placeholder: "Bijvoorbeeld tekening-01.pdf, plattegrond.png", group: "Uploads" },
        { key: "opleverdossier", label: "Opleverdossier / extra bijlagen", textarea: true, rows: 4, placeholder: "Noem extra documenten voor overdracht", group: "Meer bijlagen" }
      ];
    default:
      return [];
  }
}
