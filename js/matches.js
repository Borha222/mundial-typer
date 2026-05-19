/**
 * World Cup Matches and Teams Metadata
 * Holds the schedule of pre-populated group matches, team lists, and player suggestions.
 * All times are in Europe/Warsaw timezone (June 2026).
 */

export const TEAMS = [
  { id: 'MEX', name: 'Meksyk', flag: '🇲🇽' },
  { id: 'RSA', name: 'RPA', flag: '🇿🇦' },
  { id: 'KOR', name: 'Korea Południowa', flag: '🇰🇷' },
  { id: 'CZE', name: 'Czechy', flag: '🇨🇿' },
  { id: 'CAN', name: 'Kanada', flag: '🇨🇦' },
  { id: 'BIH', name: 'Bośnia i Hercegowina', flag: '🇧🇦' },
  { id: 'QAT', name: 'Katar', flag: '🇶🇦' },
  { id: 'SUI', name: 'Szwajcaria', flag: '🇨🇭' },
  { id: 'BRA', name: 'Brazylia', flag: '🇧🇷' },
  { id: 'MAR', name: 'Maroko', flag: '🇲🇦' },
  { id: 'HAI', name: 'Haiti', flag: '🇭🇹' },
  { id: 'SCO', name: 'Szkocja', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'USA', name: 'USA', flag: '🇺🇸' },
  { id: 'PAR', name: 'Paragwaj', flag: '🇵🇾' },
  { id: 'TUR', name: 'Turcja', flag: '🇹🇷' },
  { id: 'AUS', name: 'Australia', flag: '🇦🇺' },
  { id: 'GER', name: 'Niemcy', flag: '🇩🇪' },
  { id: 'CUW', name: 'Curaçao', flag: '🇨🇼' },
  { id: 'CIV', name: 'Wybrzeże Kości Słoniowej', flag: '🇨🇮' },
  { id: 'ECU', name: 'Ekwador', flag: '🇪🇨' },
  { id: 'NED', name: 'Holandia', flag: '🇳🇱' },
  { id: 'JPN', name: 'Japonia', flag: '🇯🇵' },
  { id: 'SWE', name: 'Szwecja', flag: '🇸🇪' },
  { id: 'TUN', name: 'Tunezja', flag: '🇹🇳' },
  { id: 'BEL', name: 'Belgia', flag: '🇧🇪' },
  { id: 'EGY', name: 'Egipt', flag: '🇪🇬' },
  { id: 'IRN', name: 'Iran', flag: '🇮🇷' },
  { id: 'NZL', name: 'Nowa Zelandia', flag: '🇳🇿' },
  { id: 'ESP', name: 'Hiszpania', flag: '🇪🇸' },
  { id: 'CPV', name: 'Wyspy Zielonego Przylądka', flag: '🇨🇻' },
  { id: 'KSA', name: 'Arabia Saudyjska', flag: '🇸🇦' },
  { id: 'URU', name: 'Urugwaj', flag: '🇺🇾' },
  { id: 'FRA', name: 'Francja', flag: '🇫🇷' },
  { id: 'SEN', name: 'Senegal', flag: '🇸🇳' },
  { id: 'IRQ', name: 'Irak', flag: '🇮🇶' },
  { id: 'NOR', name: 'Norwegia', flag: '🇳🇴' },
  { id: 'ARG', name: 'Argentyna', flag: '🇦🇷' },
  { id: 'ALG', name: 'Algieria', flag: '🇩🇿' },
  { id: 'AUT', name: 'Austria', flag: '🇦🇹' },
  { id: 'JOR', name: 'Jordania', flag: '🇯🇴' },
  { id: 'POR', name: 'Portugalia', flag: '🇵🇹' },
  { id: 'COD', name: 'DR Kongo', flag: '🇨🇩' },
  { id: 'UZB', name: 'Uzbekistan', flag: '🇺🇿' },
  { id: 'COL', name: 'Kolumbia', flag: '🇨🇴' },
  { id: 'ENG', name: 'Anglia', flag: '🏴󠁧󠁢󠁥󠁮%e2%80%8d%e2%9c%8d%ef%b8%8f' }, // Fallback to direct flag
  { id: 'CRO', name: 'Chorwacja', flag: '🇭🇷' },
  { id: 'GHA', name: 'Ghana', flag: '🇬🇭' },
  { id: 'PAN', name: 'Panama', flag: '🇵🇦' },
  { id: 'POL', name: 'Polska', flag: '🇵🇱' }
];

// Correct flags for all teams
TEAMS.forEach(team => {
  if (team.id === 'ENG') team.flag = '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (team.id === 'SCO') team.flag = '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
});

export const PLAYERS = [
  'Robert Lewandowski',
  'Lionel Messi',
  'Kylian Mbappé',
  'Erling Haaland',
  'Cristiano Ronaldo',
  'Harry Kane',
  'Vinícius Júnior',
  'Neymar Jr',
  'Kevin De Bruyne',
  'Jude Bellingham',
  'Antoine Griezmann',
  'Bruno Fernandes',
  'Bukayo Saka',
  'Mohamed Salah'
];

export const MATCHES = [
  {
    id: 'm1',
    home: 'MEX',
    away: 'RSA',
    homeName: 'Meksyk',
    awayName: 'RPA',
    homeFlag: '🇲🇽',
    awayFlag: '🇿🇦',
    startTime: '2026-06-11T17:00:00', // Opening Match
    stage: 'Grupa A - Mecz Otwarcia'
  },
  {
    id: 'm2',
    home: 'KOR',
    away: 'CZE',
    homeName: 'Korea Południowa',
    awayName: 'Czechy',
    homeFlag: '🇰🇷',
    awayFlag: '🇨🇿',
    startTime: '2026-06-11T20:30:00',
    stage: 'Grupa A'
  },
  {
    id: 'm3',
    home: 'CAN',
    away: 'BIH',
    homeName: 'Kanada',
    awayName: 'Bośnia i Hercegowina',
    homeFlag: '🇨🇦',
    awayFlag: '🇧🇦',
    startTime: '2026-06-12T15:00:00',
    stage: 'Grupa B'
  },
  {
    id: 'm4',
    home: 'USA',
    away: 'PAR',
    homeName: 'USA',
    awayName: 'Paragwaj',
    homeFlag: '🇺🇸',
    awayFlag: '🇵🇾',
    startTime: '2026-06-12T19:00:00',
    stage: 'Grupa D'
  },
  {
    id: 'm5',
    home: 'QAT',
    away: 'SUI',
    homeName: 'Katar',
    awayName: 'Szwajcaria',
    homeFlag: '🇶🇦',
    awayFlag: '🇨🇭',
    startTime: '2026-06-13T13:00:00',
    stage: 'Grupa B'
  },
  {
    id: 'm6',
    home: 'HAI',
    away: 'SCO',
    homeName: 'Haiti',
    awayName: 'Szkocja',
    homeFlag: '🇭🇹',
    awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    startTime: '2026-06-13T16:00:00',
    stage: 'Grupa C'
  },
  {
    id: 'm7',
    home: 'BRA',
    away: 'MAR',
    homeName: 'Brazylia',
    awayName: 'Maroko',
    homeFlag: '🇧🇷',
    awayFlag: '🇲🇦',
    startTime: '2026-06-13T19:00:00',
    stage: 'Grupa C'
  },
  {
    id: 'm8',
    home: 'AUS',
    away: 'TUR',
    homeName: 'Australia',
    awayName: 'Turcja',
    homeFlag: '🇦🇺',
    awayFlag: '🇹🇷',
    startTime: '2026-06-13T22:00:00',
    stage: 'Grupa D'
  },
  {
    id: 'm9',
    home: 'CIV',
    away: 'ECU',
    homeName: 'Wybrzeże Kości Słoniowej',
    awayName: 'Ekwador',
    homeFlag: '🇨🇮',
    awayFlag: '🇪🇨',
    startTime: '2026-06-14T13:00:00',
    stage: 'Grupa E'
  },
  {
    id: 'm10',
    home: 'GER',
    away: 'CUW',
    homeName: 'Niemcy',
    awayName: 'Curaçao',
    homeFlag: '🇩🇪',
    awayFlag: '🇨🇼',
    startTime: '2026-06-14T16:00:00',
    stage: 'Grupa E'
  },
  {
    id: 'm11',
    home: 'NED',
    away: 'JPN',
    homeName: 'Holandia',
    awayName: 'Japonia',
    homeFlag: '🇳🇱',
    awayFlag: '🇯🇵',
    startTime: '2026-06-14T19:00:00',
    stage: 'Grupa F'
  },
  {
    id: 'm12',
    home: 'SWE',
    away: 'TUN',
    homeName: 'Szwecja',
    awayName: 'Tunezja',
    homeFlag: '🇸🇪',
    awayFlag: '🇹🇳',
    startTime: '2026-06-14T22:00:00',
    stage: 'Grupa F'
  },
  {
    id: 'm13',
    home: 'BEL',
    away: 'EGY',
    homeName: 'Belgia',
    awayName: 'Egipt',
    homeFlag: '🇧🇪',
    awayFlag: '🇪🇬',
    startTime: '2026-06-15T13:00:00',
    stage: 'Grupa G'
  },
  {
    id: 'm14',
    home: 'ESP',
    away: 'CPV',
    homeName: 'Hiszpania',
    awayName: 'Wyspy Zielonego Przylądka',
    homeFlag: '🇪🇸',
    awayFlag: '🇨🇻',
    startTime: '2026-06-15T16:00:00',
    stage: 'Grupa H'
  },
  {
    id: 'm15',
    home: 'IRN',
    away: 'NZL',
    homeName: 'Iran',
    awayName: 'Nowa Zelandia',
    homeFlag: '🇮🇷',
    awayFlag: '🇳🇿',
    startTime: '2026-06-15T19:00:00',
    stage: 'Grupa G'
  },
  {
    id: 'm16',
    home: 'KSA',
    away: 'URU',
    homeName: 'Arabia Saudyjska',
    awayName: 'Urugwaj',
    homeFlag: '🇸🇦',
    awayFlag: '🇺🇾',
    startTime: '2026-06-15T22:00:00',
    stage: 'Grupa H'
  },
  {
    id: 'm17',
    home: 'ARG',
    away: 'ALG',
    homeName: 'Argentyna',
    awayName: 'Algieria',
    homeFlag: '🇦🇷',
    awayFlag: '🇩🇿',
    startTime: '2026-06-16T15:00:00',
    stage: 'Grupa J'
  },
  {
    id: 'm18',
    home: 'FRA',
    away: 'SEN',
    homeName: 'Francja',
    awayName: 'Senegal',
    homeFlag: '🇫🇷',
    awayFlag: '🇸🇳',
    startTime: '2026-06-16T18:00:00',
    stage: 'Grupa I'
  },
  {
    id: 'm19',
    home: 'IRQ',
    away: 'NOR',
    homeName: 'Irak',
    awayName: 'Norwegia',
    homeFlag: '🇮🇶',
    awayFlag: '🇳🇴',
    startTime: '2026-06-16T21:00:00',
    stage: 'Grupa I'
  }
];

/**
 * Gets the start time of the first match of the tournament.
 * This represents the kickoff date of the entire World Cup.
 */
export function getTournamentStartTime() {
  const times = MATCHES.map(m => new Date(m.startTime).getTime());
  return new Date(Math.min(...times));
}

/**
 * Resolves a country code (either 2-letter or 3-letter) to its TEAMS entry.
 * Supports legacy 2-letter codes stored in existing rooms.
 */
export function findTeamById(id) {
  if (!id) return null;
  const upperId = id.toUpperCase();
  const codeMapping = {
    'KR': 'KOR', 'MX': 'MEX', 'ZA': 'RSA', 'CZ': 'CZE', 'CA': 'CAN',
    'BA': 'BIH', 'QA': 'QAT', 'CH': 'SUI', 'BR': 'BRA', 'MA': 'MAR',
    'HT': 'HAI', 'US': 'USA', 'PY': 'PAR', 'TR': 'TUR', 'AU': 'AUS',
    'DE': 'GER', 'CW': 'CUW', 'CI': 'CIV', 'EC': 'ECU', 'NL': 'NED',
    'JP': 'JPN', 'SE': 'SWE', 'TN': 'TUN', 'BE': 'BEL', 'EG': 'EGY',
    'IR': 'IRN', 'NZ': 'NZL', 'ES': 'ESP', 'CV': 'CPV', 'SA': 'KSA',
    'UY': 'URU', 'FR': 'FRA', 'SN': 'SEN', 'IQ': 'IRQ', 'NO': 'NOR',
    'AR': 'ARG', 'DZ': 'ALG', 'AT': 'AUT', 'JO': 'JOR', 'PT': 'POR',
    'CD': 'COD', 'UZ': 'UZB', 'CO': 'COL', 'GB': 'ENG', 'HR': 'CRO',
    'GH': 'GHA', 'PA': 'PAN', 'PL': 'POL'
  };
  const resolvedId = codeMapping[upperId] || upperId;
  return TEAMS.find(x => x.id === resolvedId) || null;
}

/**
 * Returns a markup string for rendering a country flag via SVG flag-icons.
 * This is robust across all platforms (including Windows which does not support emoji flags).
 */
export function getTeamFlagHtml(teamId) {
  const team = findTeamById(teamId);
  if (!team) return '';
  
  // Custom mapping for subdivisions like Scotland and England in flag-icons
  const customSubdivisions = {
    'SCO': 'gb-sct',
    'ENG': 'gb-eng'
  };
  
  const id = team.id.toUpperCase();
  let code = '';
  if (customSubdivisions[id]) {
    code = customSubdivisions[id];
  } else {
    // Reverse lookup from 3-letter to 2-letter
    const reverseMapping = {
      'KOR': 'kr', 'MEX': 'mx', 'RSA': 'za', 'CZE': 'cz', 'CAN': 'ca',
      'BIH': 'ba', 'QAT': 'qa', 'SUI': 'ch', 'BRA': 'br', 'MAR': 'ma',
      'HAI': 'ht', 'USA': 'us', 'PAR': 'py', 'TUR': 'tr', 'AUS': 'au',
      'GER': 'de', 'CUW': 'cw', 'CIV': 'ci', 'ECU': 'ec', 'NED': 'nl',
      'JPN': 'jp', 'SWE': 'se', 'TUN': 'tn', 'BEL': 'be', 'EGY': 'eg',
      'IRN': 'ir', 'NZL': 'nz', 'ESP': 'es', 'CPV': 'cv', 'KSA': 'sa',
      'URU': 'uy', 'FRA': 'fr', 'SEN': 'sn', 'IRQ': 'iq', 'NOR': 'no',
      'ARG': 'ar', 'ALG': 'dz', 'AUT': 'at', 'JOR': 'jo', 'POR': 'pt',
      'COD': 'cd', 'UZB': 'uz', 'COL': 'co', 'CRO': 'hr', 'GHA': 'gh',
      'PAN': 'pa', 'POL': 'pl'
    };
    code = reverseMapping[id] || id.slice(0, 2).toLowerCase();
  }
  
  return `<span class="fi fi-${code} flag-icon-rounded"></span>`;
}
