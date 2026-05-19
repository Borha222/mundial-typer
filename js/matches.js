/**
 * World Cup Matches and Teams Metadata
 * Holds the schedule of pre-populated group matches, team lists, and player suggestions.
 * All time stamps are in June 2026.
 */

export const TEAMS = [
  { id: 'POL', name: 'Polska', flag: '🇵🇱' },
  { id: 'BRA', name: 'Brazylia', flag: '🇧🇷' },
  { id: 'ARG', name: 'Argentyna', flag: '🇦🇷' },
  { id: 'FRA', name: 'Francja', flag: '🇫🇷' },
  { id: 'GER', name: 'Niemcy', flag: '🇩🇪' },
  { id: 'ESP', name: 'Hiszpania', flag: '🇪🇸' },
  { id: 'ENG', name: 'Anglia', flag: '🏴\u{e0067}\u{e0062}\u{e0065}\u{e006e}\u{e0067}\u{e007f}' },
  { id: 'ITA', name: 'Włochy', flag: '🇮🇹' },
  { id: 'POR', name: 'Portugalia', flag: '🇵🇹' },
  { id: 'NED', name: 'Holandia', flag: '🇳🇱' },
  { id: 'BEL', name: 'Belgia', flag: '🇧🇪' },
  { id: 'CRO', name: 'Chorwacja', flag: '🇭🇷' },
  { id: 'USA', name: 'USA', flag: '🇺🇸' },
  { id: 'MEX', name: 'Meksyk', flag: '🇲🇽' },
  { id: 'URU', name: 'Urugwaj', flag: '🇺🇾' },
  { id: 'SEN', name: 'Senegal', flag: '🇸🇳' }
];

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
    home: 'POL',
    away: 'GER',
    homeName: 'Polska',
    awayName: 'Niemcy',
    homeFlag: '🇵🇱',
    awayFlag: '🇩🇪',
    startTime: '2026-06-11T17:00:00', // Match Opening
    stage: 'Grupa A - Mecz Otwarcia'
  },
  {
    id: 'm2',
    home: 'ARG',
    away: 'FRA',
    homeName: 'Argentyna',
    awayName: 'Francja',
    homeFlag: '🇦🇷',
    awayFlag: '🇫🇷',
    startTime: '2026-06-12T14:00:00',
    stage: 'Grupa B'
  },
  {
    id: 'm3',
    home: 'BRA',
    away: 'ITA',
    homeName: 'Brazylia',
    awayName: 'Włochy',
    homeFlag: '🇧🇷',
    awayFlag: '🇮🇹',
    startTime: '2026-06-12T17:00:00',
    stage: 'Grupa B'
  },
  {
    id: 'm4',
    home: 'ESP',
    away: 'ENG',
    homeName: 'Hiszpania',
    awayName: 'Anglia',
    homeFlag: '🇪🇸',
    awayFlag: '🏴\u{e0067}\u{e0062}\u{e0065}\u{e006e}\u{e0067}\u{e007f}',
    startTime: '2026-06-12T20:00:00',
    stage: 'Grupa C'
  },
  {
    id: 'm5',
    home: 'POR',
    away: 'NED',
    homeName: 'Portugalia',
    awayName: 'Holandia',
    homeFlag: '🇵🇹',
    awayFlag: '🇳🇱',
    startTime: '2026-06-13T15:00:00',
    stage: 'Grupa D'
  },
  {
    id: 'm6',
    home: 'BEL',
    away: 'CRO',
    homeName: 'Belgia',
    awayName: 'Chorwacja',
    homeFlag: '🇧🇪',
    awayFlag: '🇭🇷',
    startTime: '2026-06-13T18:00:00',
    stage: 'Grupa D'
  },
  {
    id: 'm7',
    home: 'USA',
    away: 'MEX',
    homeName: 'USA',
    awayName: 'Meksyk',
    homeFlag: '🇺🇸',
    awayFlag: '🇲🇽',
    startTime: '2026-06-14T17:00:00',
    stage: 'Grupa E'
  },
  {
    id: 'm8',
    home: 'POL',
    away: 'BRA',
    homeName: 'Polska',
    awayName: 'Brazylia',
    homeFlag: '🇵🇱',
    awayFlag: '🇧🇷',
    startTime: '2026-06-15T20:00:00',
    stage: 'Grupa A'
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
