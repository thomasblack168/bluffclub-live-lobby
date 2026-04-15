export type LobbyLocation = {
  id: string;
  name: string;
  slug: string;
  variant: string;
  sortOrder: number;
};

export type LobbyTable = {
  id: string;
  title: string;
  blindsLabel: string;
  maxSeats: number;
  seatedCount: number;
  waitingCount: number;
  footerText: string;
  logoKey: string | null;
  sortOrder: number;
  location: LobbyLocation;
};
