-- Demo catalog for LUME. Staff rows are created on first sign-in.

insert into spaces (kind, code, name, zone, capacity, min_spend, description, sort_order) values
  ('mesa',  'C1', 'Camarote Norte',  'camarote',  8, 2800, 'Vista frontal da pista. Sofás baixos, serviço dedicado.', 1),
  ('mesa',  'C2', 'Camarote Sul',    'camarote',  6, 2400, 'Lateral da pista, mais reservado.', 2),
  ('mesa',  'M1', 'Mezanino A',      'mezanino',  6, 1800, 'Mezanino com vista aberta. Ideal para grupos.', 3),
  ('mesa',  'M2', 'Mezanino B',      'mezanino',  4, 1400, 'Canto do mezanino, mais íntimo.', 4),
  ('mesa',  'P1', 'Lounge Pista 1',  'pista',     8, 1600, 'Na borda da pista, perto do som.', 5),
  ('mesa',  'P2', 'Lounge Pista 2',  'pista',     6, 1400, 'Mesa baixa à esquerda do DJ.', 6),
  ('mesa',  'P3', 'Lounge Pista 3',  'pista',     4, 1100, 'Mesa compacta na pista.', 7),
  ('mesa',  'B1', 'Bar High Table',  'bar',       4,  800, 'Mesa alta no bar. Sem reserva de sofá.', 8),
  ('salao', 'S1', 'Salão Principal', 'salao',   150, 12000, 'Salão inteiro. Palco, som e luz da casa.', 9),
  ('salao', 'S2', 'Salão Lounge',    'salao',    40,  4500, 'Sala anexa para jantares e afters privados.', 10)
on conflict (code) do nothing;

insert into events (
  title, slug, description, lineup, venue, event_date, start_time, end_time,
  cover_url, video_url, featured, published, created_by
) values
(
  'Sextas LUME',
  'sextas-lume',
  'A sexta da casa. Pista aberta, camarotes fechados, o som que define a semana. Chegue cedo se quiser ver a sala encher.',
  'Aline Cruz · Kabeção · convidados',
  'pista',
  '2026-09-11',
  '23:00',
  '06:00',
  '/images/event-eclipse.jpg',
  '/videos/hero.mp4',
  true,
  true,
  'system'
),
(
  'Ivory Sessions',
  'ivory-sessions',
  'Uma noite mais baixa. Casa, jazz quebrado e house íntimo no salão do bar. Poucas mesas, sem pista aberta.',
  'Nara Vilela · trio convidado',
  'bar',
  '2026-09-18',
  '22:00',
  '04:00',
  '/images/event-velvet.jpg',
  '',
  false,
  true,
  'system'
),
(
  'Salão privado',
  'salao-privado-setembro',
  'O salão principal reservado para um evento fechado. A casa opera só o bar nessa noite.',
  'Som da casa',
  'salao',
  '2026-09-20',
  '20:00',
  '02:00',
  '/images/salao.jpg',
  '',
  false,
  true,
  'system'
),
(
  'After LUME',
  'after-lume',
  'A segunda sala. Depois da pista, o after no mezanino — luz ainda mais baixa, o som continua.',
  'Residentes LUME',
  'mezanino',
  '2026-09-26',
  '01:00',
  '08:00',
  '/images/mezanino.jpg',
  '',
  false,
  true,
  'system'
),
(
  'Abertura de outubro',
  'abertura-outubro',
  'A casa inteira. Pista, bar e camarotes. A primeira sexta do mês.',
  'Line-up a anunciar',
  'pista',
  '2026-10-03',
  '23:00',
  '06:00',
  '/images/hero.jpg',
  '',
  false,
  true,
  'system'
)
on conflict (slug) do nothing;

insert into media (kind, url, title, created_by) values
  ('photo', '/images/gallery-crowd.jpg', 'Pista', 'system'),
  ('photo', '/images/mesa.jpg', 'Serviço de mesa', 'system'),
  ('photo', '/images/camarote.jpg', 'Camarote', 'system'),
  ('photo', '/images/mezanino.jpg', 'Mezanino', 'system'),
  ('photo', '/images/bar.jpg', 'Bar', 'system'),
  ('photo', '/images/salao.jpg', 'Salão', 'system'),
  ('photo', '/images/facade.jpg', 'A porta', 'system'),
  ('photo', '/images/hero.jpg', 'A casa', 'system'),
  ('photo', '/images/event-eclipse.jpg', 'Cabine', 'system'),
  ('photo', '/images/event-velvet.jpg', 'Sessão', 'system'),
  ('video', '/videos/hero.mp4', 'LUME — a casa', 'system');

insert into reservations (
  space_id, guest_name, guest_email, guest_phone, party_size, reserved_for, status, notes
)
select s.id, v.guest_name, v.guest_email, v.guest_phone, v.party_size, v.reserved_for::date, v.status, v.notes
from (
  values
    ('C1', 'Helena Prado', 'helena@example.com', '11 98888-1010', 6, '2026-09-11', 'confirmed', 'Aniversário. Chegada 23h30.'),
    ('P1', 'Rafael Moura', 'rafael@example.com', '11 97777-2020', 5, '2026-09-11', 'pending', 'Pedido pela recepção.'),
    ('M1', 'Clara Nunes', 'clara@example.com', '11 96666-3030', 4, '2026-09-18', 'confirmed', ''),
    ('S1', 'Estúdio Norte', 'eventos@estudionorte.com', '11 95555-4040', 120, '2026-09-20', 'confirmed', 'Evento fechado. Som da casa.')
) as v(code, guest_name, guest_email, guest_phone, party_size, reserved_for, status, notes)
join spaces s on s.code = v.code
where not exists (
  select 1 from reservations r where r.space_id = s.id and r.reserved_for = v.reserved_for::date
);
