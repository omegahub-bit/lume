export type StaffRole = "admin" | "supervisor" | "collaborator";

export type StaffMember = {
  userId: string;
  email: string;
  displayName: string;
  role: StaffRole;
  createdAt: string;
};

export type StaffRequest = {
  userId: string;
  email: string;
  displayName: string;
  createdAt: string;
};

export type EventItem = {
  id: number;
  title: string;
  slug: string;
  description: string;
  lineup: string;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  coverUrl: string;
  videoUrl: string;
  ticketUrl: string;
  featured: boolean;
  published: boolean;
};

export type SpaceItem = {
  id: number;
  kind: "mesa" | "salao";
  code: string;
  name: string;
  zone: string;
  capacity: number;
  minSpend: number;
  description: string;
  available: boolean;
};

export type ReservationStatus = "pending" | "confirmed" | "declined" | "cancelled";

export type ReservationItem = {
  id: number;
  spaceId: number;
  spaceName: string;
  spaceCode: string;
  spaceKind: "mesa" | "salao";
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  partySize: number;
  reservedFor: string;
  status: ReservationStatus;
  notes: string;
  createdAt: string;
};

export type MediaItem = {
  id: number;
  kind: "photo" | "video";
  url: string;
  title: string;
  eventId: number | null;
  createdAt: string;
};

export type Occupancy = {
  spaceId: number;
  status: ReservationStatus;
};

export const VENUE_LABEL: Record<string, string> = {
  pista: "Pista",
  bar: "Bar",
  salao: "Salão",
  mezanino: "Mezanino",
  camarote: "Camarote",
  casa: "Casa inteira",
};

export const ROLE_LABEL: Record<StaffRole, string> = {
  admin: "Admin",
  supervisor: "Supervisor",
  collaborator: "Colaborador",
};

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  declined: "Recusada",
  cancelled: "Cancelada",
};
