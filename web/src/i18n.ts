// English and Hindi. Most people going home for Chhath read Hindi first, so every word on
// the search screen and in the answer exists in both. Train and station names stay as the
// timetable, IRCTC and station boards print them.

export type Lang = 'en' | 'hi';

const STORE_KEY = 'np-lang';

const WEEKDAYS_HI: Record<string, string> = {
  Mon: 'सोम', Tue: 'मंगल', Wed: 'बुध', Thu: 'गुरु', Fri: 'शुक्र', Sat: 'शनि', Sun: 'रवि',
};
const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  hi: ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'],
};
const CLASSES_HI: Record<string, string> = {
  '1A': 'फ़र्स्ट AC',
  '2A': 'सेकंड AC (2A)',
  '3A': 'थर्ड AC (3A)',
  '3E': 'थर्ड AC इकॉनमी',
  CC: 'AC चेयर कार',
  EC: 'एग्ज़ीक्यूटिव चेयर कार',
  SL: 'स्लीपर',
  '2S': 'सेकंड सिटिंग',
  II: 'जनरल',
  FC: 'फ़र्स्ट क्लास',
  EV: 'विस्टाडोम',
  P: 'पैंट्री कार',
};
const SEASONS_HI: Record<string, string> = { 'Diwali and Chhath 2026': 'दिवाली और छठ 2026' };
// As spoken() writes them: today's states and UTs, plus the undivided 2011 ones.
const STATES_HI: Record<string, string> = {
  'Andaman & Nicobar Islands': 'अंडमान और निकोबार द्वीप समूह',
  'Andhra Pradesh': 'आंध्र प्रदेश',
  'Arunachal Pradesh': 'अरुणाचल प्रदेश',
  Assam: 'असम',
  Bihar: 'बिहार',
  Chandigarh: 'चंडीगढ़',
  Chhattisgarh: 'छत्तीसगढ़',
  'Dadra & Nagar Haveli and Daman & Diu': 'दादरा और नगर हवेली और दमन और दीव',
  'Dadra & Nagar Haveli': 'दादरा और नगर हवेली',
  'Daman & Diu': 'दमन और दीव',
  Delhi: 'दिल्ली',
  Goa: 'गोवा',
  Gujarat: 'गुजरात',
  Haryana: 'हरियाणा',
  'Himachal Pradesh': 'हिमाचल प्रदेश',
  'Jammu & Kashmir': 'जम्मू और कश्मीर',
  Jharkhand: 'झारखंड',
  Karnataka: 'कर्नाटक',
  Kerala: 'केरल',
  Ladakh: 'लद्दाख',
  Lakshadweep: 'लक्षद्वीप',
  'Madhya Pradesh': 'मध्य प्रदेश',
  Maharashtra: 'महाराष्ट्र',
  Manipur: 'मणिपुर',
  Meghalaya: 'मेघालय',
  Mizoram: 'मिज़ोरम',
  Nagaland: 'नागालैंड',
  Odisha: 'ओडिशा',
  Puducherry: 'पुडुचेरी',
  Punjab: 'पंजाब',
  Rajasthan: 'राजस्थान',
  Sikkim: 'सिक्किम',
  'Tamil Nadu': 'तमिलनाडु',
  Telangana: 'तेलंगाना',
  Tripura: 'त्रिपुरा',
  'Uttar Pradesh': 'उत्तर प्रदेश',
  Uttarakhand: 'उत्तराखंड',
  'West Bengal': 'पश्चिम बंगाल',
  // Census 2011 spellings
  'Andaman & Nicobar Island': 'अंडमान और निकोबार द्वीप समूह',
  'Arunanchal Pradesh': 'अरुणाचल प्रदेश',
  'Dadara & Nagar Havelli': 'दादरा और नगर हवेली',
};

/** Words the answer is built from, in one language. Pure, so answers stay testable. */
export interface Words {
  weekday: (day: string) => string;
  month: (index: number) => string;
  className: (cls: string, english: string) => string;
  season: (name: string) => string;
  state: (name: string) => string;
  daily: string;
  daysNotListed: string;
  runs: (days: string) => string;
  plusDays: (n: number) => string;
  minutes: (m: number) => string;
  hoursMinutes: (h: number, m: number) => string;
  wholeHours: (h: number) => string;
  on: (day: string) => string;
  noTrainOn: (on: string) => string;
  fastestDirectOn: (on: string) => string;
  fastestDirect: string;
  direct: string;
  changeAt: (on: string, station: string) => string;
  noLink: (timetable: string, from: string, to: string) => string;
  station: (name: string, code: string, km: string) => string;
  noStationIn: (place: string, station: string) => string;
  localStation: (place: string, station: string) => string;
  noRailway: (state: string, station: string) => string;
  connectBadly: (place: string, station: string) => string;
  then: string;
  withChange: (h: string) => string;
  specialsCount: (n: number, state: string, when: string) => string;
  thisSeason: string;
  officialNotices: string;
  fareSource: string;
  shareOfTrips: (share: string, to: string, year: number, from: string) => string;
  tripSource: string;
  peopleLived: (n: string, origin: string, where: string) => string;
  undivided: (state: string) => string;
  districtOf: (place: string) => string;
  censusSource: string;
}

const en: Words = {
  weekday: (d) => d,
  month: (i) => MONTHS.en[i],
  className: (_cls, english) => english,
  season: (name) => name,
  state: (name) => name,
  daily: 'Daily',
  daysNotListed: 'Days not listed',
  runs: (d) => `Runs ${d}`,
  plusDays: (n) => ` (+${n} day${n > 1 ? 's' : ''})`,
  minutes: (m) => `${m} min`,
  hoursMinutes: (h, m) => `${h} h ${m} min`,
  wholeHours: (h) => `${h} h`,
  on: (day) => ` on ${day}`,
  noTrainOn: (on) => `No train runs${on}. These run on other days`,
  fastestDirectOn: (on) => `Fastest direct train${on}`,
  fastestDirect: 'Fastest direct train',
  direct: 'Direct train',
  changeAt: (on, station) => `No direct train${on}. Quickest with one change, at ${station}`,
  noLink: (timetable, from, to) => `No train in ${timetable} links ${from} and ${to} directly or with one change.`,
  station: (name, code, km) => `${name} (${code}), about ${km} km away in a straight line`,
  noStationIn: (place, station) => `No station in ${place} is in the main timetable. The nearest useful one is ${station}.`,
  localStation: (place, station) =>
    `${place} station is not a main stop in the official timetable, so this uses ${station}. Some trains may stop at ${place} too: check on NTES or IRCTC.`,
  noRailway: (state, station) => `There is no railway in ${state} yet. The nearest station is ${station}.`,
  connectBadly: (place, station) => `Trains from ${place} itself do not connect well. The quickest way is from ${station}.`,
  then: ', then ',
  withChange: (h) => `, ${h} with the change`,
  specialsCount: (n, state, when) => `${n} special train${n > 1 ? 's' : ''} to ${state} ${when}`,
  thisSeason: 'this season',
  officialNotices: 'official railway notices',
  fareSource: 'estimated from the official fare tables; check IRCTC',
  shareOfTrips: (share, to, year, from) =>
    `${share}% of long-distance unreserved train trips from ${to} in ${year} went to ${from}`,
  tripSource: 'EAC-PM migration study, railway ticket data',
  peopleLived: (n, origin, where) => `${n} people from ${origin} lived in ${where}`,
  undivided: (state) => `undivided ${state}`,
  districtOf: (place) => `${place}'s district`,
  censusSource: 'Census 2011, the latest count; Census 2027 results are pending',
};

const hi: Words = {
  weekday: (d) => WEEKDAYS_HI[d] ?? d,
  month: (i) => MONTHS.hi[i],
  className: (cls, english) => CLASSES_HI[cls] ?? english,
  season: (name) => SEASONS_HI[name] ?? name,
  state: (name) => STATES_HI[name] ?? name,
  daily: 'रोज़',
  daysNotListed: 'दिन नहीं दिए गए',
  runs: (d) => `चलती है: ${d}`,
  plusDays: (n) => ` (+${n} दिन)`,
  minutes: (m) => `${m} मिनट`,
  hoursMinutes: (h, m) => `${h} घंटे ${m} मिनट`,
  wholeHours: (h) => `${h} घंटे`,
  on: (day) => ` ${day} को`,
  noTrainOn: (on) => `${on.trim()} कोई ट्रेन नहीं। ये दूसरे दिनों में चलती हैं`,
  fastestDirectOn: (on) => `${on.trim()} सबसे तेज़ सीधी ट्रेन`,
  fastestDirect: 'सबसे तेज़ सीधी ट्रेन',
  direct: 'सीधी ट्रेन',
  changeAt: (on, station) =>
    `${on ? `${on.trim()} ` : ''}कोई सीधी ट्रेन नहीं। ${station} पर एक बार ट्रेन बदलकर सबसे जल्दी`,
  noLink: (timetable, from, to) =>
    `${timetable} में ${from} और ${to} के बीच न सीधी ट्रेन है, न एक बार बदलकर।`,
  station: (name, code, km) => `${name} (${code}), सीधी दूरी लगभग ${km} किमी`,
  noStationIn: (place, station) => `${place} का कोई स्टेशन मुख्य टाइमटेबल में नहीं है। सबसे पास का काम का स्टेशन: ${station}।`,
  localStation: (place, station) =>
    `${place} स्टेशन सरकारी टाइमटेबल का मुख्य स्टॉप नहीं है, इसलिए यहाँ ${station} लिया गया है। कुछ ट्रेनें ${place} पर भी रुक सकती हैं: NTES या IRCTC पर देखें।`,
  noRailway: (state, station) => `${state} में अभी रेलवे नहीं है। सबसे पास का स्टेशन: ${station}।`,
  connectBadly: (place, station) => `${place} से सीधे अच्छी ट्रेनें नहीं हैं। सबसे जल्दी का रास्ता ${station} से है।`,
  then: ', फिर ',
  withChange: (h) => `, ट्रेन बदलने समेत ${h}`,
  specialsCount: (n, state, when) => `${state} के लिए ${when} ${n} स्पेशल ट्रेन`,
  thisSeason: 'इस सीज़न',
  officialNotices: 'रेलवे की सरकारी सूचनाएँ',
  fareSource: 'सरकारी किराया तालिका से अनुमान; IRCTC पर देखें',
  shareOfTrips: (share, to, year, from) =>
    `${year} में ${to} से लंबी दूरी की अनारक्षित ट्रेन यात्राओं में ${share}% ${from} गईं`,
  tripSource: 'EAC-PM प्रवास अध्ययन, रेलवे टिकट डेटा',
  peopleLived: (n, origin, where) => `${origin} के ${n} लोग ${where} में रहते थे`,
  undivided: (state) => `अविभाजित ${state}`,
  districtOf: (place) => `${place} ज़िले`,
  censusSource: 'जनगणना 2011, सबसे नई गिनती; जनगणना 2027 के नतीजे अभी नहीं आए',
};

export function words(lang: Lang = 'en'): Words {
  return lang === 'hi' ? hi : en;
}

// ---- the page --------------------------------------------------------------

const UI = {
  en: {
    brandAside: '· going to native?',
    title: 'Find the train to your',
    titleAccent: 'hometown',
    tagline: 'See which train to take, the days it runs and what it costs, from the official 2026 railway timetable.',
    fromLabel: 'Where do you live?',
    fromPlaceholder: 'City, town or station, e.g. Bengaluru',
    toLabel: 'Where is home?',
    toPlaceholder: 'Town, district or station, e.g. Kadur',
    whenLabel: 'When?',
    optional: 'optional',
    find: 'Show my train',
    trust: 'Free · no sign-up · official railway timetable · book on IRCTC',
    examples: 'Or see an example:',
    swap: 'Swap the two places',
    looking: 'Looking up trains…',
    notFound: (q: string) => `We could not find “${q}”. Try a district, city or station name.`,
    same: 'From and To are the same place. Pick where you live and where home is.',
    change: (w: string) => `Change here. Wait about ${w}.`,
    moreOptions: (n: number) => `${n} more option${n > 1 ? 's' : ''}`,
    fareTitle: 'Fare per person (estimate)',
    fareNote: 'From the official fare tables. Meals, Tatkal and dynamic pricing are not included.',
    book: 'Check seats and book on IRCTC ↗',
    specialsTitle: 'Special trains this season',
    scope: (zones: number, day: string) =>
      `From official notices of ${zones} railway zones, checked ${day}. More may run: check IRCTC.`,
    noneListed: 'None listed for this route yet.',
    datesInNotice: 'Dates in notice',
    until: (day: string) => `until ${day}`,
    notice: 'notice ↗',
    notAlone: 'You are not alone',
    shareCard: 'Share as a card',
    newSearch: 'New search',
    making: 'Making your card…',
    shareOrDownload: 'Share it, or download it.',
    downloadOnly: 'Download the card, or press and hold it to save.',
    cardKicker: 'NATIVE PLACE · MY TRAIN TO NATIVE',
    pause: 'Pause',
    play: 'Play',
    explore: 'Explore',
    legend: 'Every light is a train in the 2026 timetable, starting at the time in India now. A day passes in 60 seconds.',
    legendRoute: 'Your train in gold. Every other train is dimmed.',
    legendRoad: 'Your train in gold, the road part in pale gold. Every other train is dimmed.',
    loadingTrains: 'Loading trains…',
    loadFailed: 'The train data could not be loaded. Please refresh the page.',
    moving: (n: string, at: string) => `${n} trains on the move at ${at}`,
    reduced: 'Animation paused because reduced motion is on. Press Play to start.',
    longOnly: 'Showing long-distance trains only, to keep this device smooth.',
    showOnMap: 'Show them on the map',
    hideThem: 'Hide them',
    seasonLine: (season: string, n: number, zones: number, day: string) =>
      `${season}: ${n} verified special trains from the big cities, from ${zones} railway zones' notices (checked ${day}). More may run.`,
    methods: 'How this was made',
    routes: 'Popular routes',
    specialsList: 'Festival special trains',
    timetableLine: 'Official timetable: Trains at a Glance 2026. Weekly trains are shown every day.',
    timeOfDay: 'Time of day',
    summary: (runs: string, at: string, moving: string) =>
      `The map animates ${runs} long-distance train runs from Trains at a Glance 2026, the official Indian Railways timetable, across one day compressed into 60 seconds. At ${at}, about ${moving} long-distance trains are on the move.`,
    switchTo: 'हिन्दी',
    switchLabel: 'हिन्दी में देखें',
  },
  hi: {
    brandAside: '· घर जा रहे हैं?',
    title: 'अपने',
    titleAccent: 'घर की ट्रेन ढूँढें',
    tagline: 'कौन सी ट्रेन लें, किस दिन चलती है और किराया कितना है — रेलवे के 2026 के सरकारी टाइमटेबल से।',
    fromLabel: 'आप कहाँ रहते हैं?',
    fromPlaceholder: 'शहर, कस्बा या स्टेशन, जैसे Bengaluru',
    toLabel: 'घर कहाँ है?',
    toPlaceholder: 'कस्बा, ज़िला या स्टेशन, जैसे Darbhanga',
    whenLabel: 'कब?',
    optional: 'ज़रूरी नहीं',
    find: 'मेरी ट्रेन दिखाएँ',
    trust: 'मुफ़्त · कोई साइन-अप नहीं · रेलवे का सरकारी टाइमटेबल · टिकट IRCTC पर',
    examples: 'या उदाहरण देखें:',
    swap: 'दोनों जगहें बदलें',
    looking: 'ट्रेनें ढूँढ रहे हैं…',
    notFound: (q: string) => `“${q}” नहीं मिला। ज़िले, शहर या स्टेशन का नाम अंग्रेज़ी अक्षरों में लिखकर देखें।`,
    same: 'दोनों जगह एक ही है। जहाँ रहते हैं और जहाँ घर है, दोनों चुनें।',
    change: (w: string) => `यहाँ ट्रेन बदलें। लगभग ${w} इंतज़ार।`,
    moreOptions: (n: number) => `${n} और विकल्प`,
    fareTitle: 'प्रति व्यक्ति किराया (अनुमान)',
    fareNote: 'सरकारी किराया तालिका से। खाना, तत्काल और डायनामिक किराया शामिल नहीं।',
    book: 'IRCTC पर सीट देखें और बुक करें ↗',
    specialsTitle: 'इस सीज़न की स्पेशल ट्रेनें',
    scope: (zones: number, day: string) =>
      `${zones} रेलवे ज़ोन की सरकारी सूचनाओं से, ${day} को जाँचा गया। और भी चल सकती हैं: IRCTC पर देखें।`,
    noneListed: 'इस रास्ते की कोई स्पेशल ट्रेन अभी सूची में नहीं।',
    datesInNotice: 'तारीख़ें सूचना में',
    until: (day: string) => `${day} तक`,
    notice: 'सूचना ↗',
    notAlone: 'आप अकेले नहीं हैं',
    shareCard: 'कार्ड शेयर करें',
    newSearch: 'नई खोज',
    making: 'आपका कार्ड बन रहा है…',
    shareOrDownload: 'शेयर करें या डाउनलोड करें।',
    downloadOnly: 'कार्ड डाउनलोड करें, या दबाकर रखें और सेव करें।',
    cardKicker: 'NATIVE PLACE · घर जाने वाली मेरी ट्रेन',
    pause: 'रोकें',
    play: 'चलाएँ',
    explore: 'नक्शा देखें',
    legend: 'हर रोशनी 2026 टाइमटेबल की एक ट्रेन है, भारत के अभी के समय से। 60 सेकंड में एक दिन बीतता है।',
    legendRoute: 'आपकी ट्रेन सुनहरी है। बाकी ट्रेनें धुँधली।',
    legendRoad: 'आपकी ट्रेन सुनहरी, सड़क वाला हिस्सा हल्का सुनहरा। बाकी ट्रेनें धुँधली।',
    loadingTrains: 'ट्रेनें लोड हो रही हैं…',
    loadFailed: 'ट्रेन का डेटा लोड नहीं हो सका। पेज रिफ़्रेश करें।',
    moving: (n: string, at: string) => `${at} बजे ${n} ट्रेनें चल रही हैं`,
    reduced: 'रिड्यूस्ड मोशन चालू है, इसलिए एनिमेशन रुका है। शुरू करने के लिए "चलाएँ" दबाएँ।',
    longOnly: 'इस फ़ोन पर आसानी के लिए सिर्फ़ लंबी दूरी की ट्रेनें दिख रही हैं।',
    showOnMap: 'नक्शे पर दिखाएँ',
    hideThem: 'छिपाएँ',
    seasonLine: (season: string, n: number, zones: number, day: string) =>
      `${season}: बड़े शहरों से ${n} जाँची हुई स्पेशल ट्रेनें, ${zones} रेलवे ज़ोन की सूचनाओं से (${day} को जाँचा)। और भी चल सकती हैं।`,
    methods: 'यह कैसे बना',
    routes: 'लोकप्रिय रास्ते',
    specialsList: 'त्योहार की विशेष गाड़ियाँ',
    timetableLine: 'सरकारी टाइमटेबल: Trains at a Glance 2026। हफ़्ते में एक-दो दिन चलने वाली ट्रेनें भी नक्शे पर हर दिन दिखती हैं।',
    timeOfDay: 'दिन का समय',
    summary: (runs: string, at: string, moving: string) =>
      `नक्शे पर Trains at a Glance 2026 (भारतीय रेलवे का सरकारी टाइमटेबल) की ${runs} लंबी दूरी की ट्रेन यात्राएँ एक दिन में चलती दिखती हैं, जो 60 सेकंड में पूरा होता है। ${at} बजे लगभग ${moving} लंबी दूरी की ट्रेनें चल रही हैं।`,
    switchTo: 'English',
    switchLabel: 'View in English',
  },
};

export type UiText = (typeof UI)['en'];

function detect(): Lang {
  try {
    const asked = new URLSearchParams(location.search).get('lang');
    if (asked === 'hi' || asked === 'en') return asked;
    const saved = localStorage.getItem(STORE_KEY);
    if (saved === 'hi' || saved === 'en') return saved;
  } catch {
    // Storage can be blocked in private windows; fall through to the browser language.
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

let current: Lang = typeof location === 'undefined' ? 'en' : detect();

export const lang = () => current;
export const ui = (): UiText => UI[current] as UiText;

/** Switch language; listeners re-render what they own. */
export function setLang(next: Lang) {
  current = next;
  try {
    localStorage.setItem(STORE_KEY, next);
  } catch {
    // Not remembered in a private window; this visit still switches.
  }
  document.documentElement.lang = next === 'hi' ? 'hi' : 'en';
  document.dispatchEvent(new CustomEvent('langchange'));
}
