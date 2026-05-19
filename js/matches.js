/**
 * World Cup Matches and Teams Metadata
 * Holds the schedule of pre-populated group matches, team lists, and player suggestions.
 * All time stamps are in June 2026.
 */

export const TEAMS = [
  { id: 'MEX', name: 'Meksyk', flag: '🇲🇽' },
  { id: 'RSA', name: 'RPA', flag: '🇿🇦' },
  { id: 'CAN', name: 'Kanada', flag: '🇨🇦' },
  { id: 'MAR', name: 'Maroko', flag: '🇲🇦' },
  { id: 'USA', name: 'USA', flag: '🇺🇸' },
  { id: 'PAR', name: 'Paragwaj', flag: '🇵🇾' },
  { id: 'ARG', name: 'Argentyna', flag: '🇦🇷' },
  { id: 'FRA', name: 'Francja', flag: '🇫🇷' },
  { id: 'ESP', name: 'Hiszpania', flag: '🇪🇸' },
  { id: 'CRO', name: 'Chorwacja', flag: '🇭🇷' },
  { id: 'GER', name: 'Niemcy', flag: '🇩🇪' },
  { id: 'POL', name: 'Polska', flag: '🇵🇱' },
  { id: 'BRA', name: 'Brazylia', flag: '🇧🇷' },
  { id: 'SEN', name: 'Senegal', flag: '🇸🇳' },
  { id: 'ENG', name: 'Anglia', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'NED', name: 'Holandia', flag: '🇳🇱' }
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
    home: 'MEX',
    away: 'RSA',
    homeName: 'Meksyk',
    awayName: 'RPA',
    homeFlag: '🇲🇽',
    awayFlag: '🇿🇦',
    startTime: '2026-06-11T17:00:00', // Tournament Opening
    stage: 'Grupa A - Mecz Otwarcia'
  },
  {
    id: 'm2',
    home: 'CAN',
    away: 'MAR',
    homeName: 'Kanada',
    awayName: 'Maroko',
    homeFlag: '🇨🇦',
    awayFlag: '🇲🇦',
    startTime: '2026-06-12T15:00:00',
    stage: 'Grupa B'
  },
  {
    id: 'm3',
    home: 'USA',
    away: 'PAR',
    homeName: 'USA',
    awayName: 'Paragwaj',
    homeFlag: '🇺🇸',
    awayFlag: '🇵🇾',
    startTime: '2026-06-12T19:00:00',
    stage: 'Grupa C'
  },
  {
    id: 'm4',
    home: 'ARG',
    away: 'FRA',
    homeName: 'Argentyna',
    awayName: 'Francja',
    homeFlag: '🇦🇷',
    awayFlag: '🇫🇷',
    startTime: '2026-06-13T14:00:00',
    stage: 'Grupa D'
  },
  {
    id: 'm5',
    home: 'ESP',
    away: 'CRO',
    homeName: 'Hiszpania',
    awayName: 'Chorwacja',
    homeFlag: '🇪🇸',
    awayFlag: '🇭🇷',
    startTime: '2026-06-13T18:00:00',
    stage: 'Grupa E'
  },
  {
    id: 'm6',
    home: 'GER',
    away: 'POL',
    homeName: 'Niemcy',
    awayName: 'Polska',
    homeFlag: '🇩🇪',
    awayFlag: '🇵🇱',
    startTime: '2026-06-14T15:00:00',
    stage: 'Grupa F'
  },
  {
    id: 'm7',
    home: 'BRA',
    away: 'SEN',
    homeName: 'Brazylia',
    awayName: 'Senegal',
    homeFlag: '🇧🇷',
    awayFlag: '🇸🇳',
    startTime: '2026-06-14T21:00:00',
    stage: 'Grupa F'
  },
  {
    id: 'm8',
    home: 'ENG',
    away: 'NED',
    homeName: 'Anglia',
    awayName: 'Holandia',
    homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    awayFlag: '🇳🇱',
    startTime: '2026-06-15T18:00:00',
    stage: 'Grupa G'
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
