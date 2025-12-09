
export interface Status {
  key: string;
  label: string;
  color: string;
}

export const STATUS_CHOICES: Status[] = [
  { key: 'nicht_zugewiesen', label: 'Nicht zugewiesen', color: '#EAB308' },
  { key: 'offen', label: 'Offen', color: '#3B82F6' },
  { key: 'abgeschlossen', label: 'Abgeschlossen', color: '#22C55E' },
  { key: 'archiviert', label: 'Archiviert', color: '#64748B' },
];

export type StatusKey = 'nicht_zugewiesen' | 'offen' | 'abgeschlossen' | 'archiviert';