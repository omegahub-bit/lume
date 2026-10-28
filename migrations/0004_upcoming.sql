-- Keep the house calendar ahead of today. Anchors to the next Friday
-- (or today, when today is Friday). Runs once, on first boot.

update events set
  event_date = current_date + ((5 - extract(dow from current_date)::int + 7) % 7),
  featured = true
where slug = 'sextas-lume';

update events set
  event_date = current_date + ((5 - extract(dow from current_date)::int + 7) % 7) + 7,
  featured = false
where slug = 'ivory-sessions';

update events set
  title = 'Salão fechado',
  description = 'O salão principal reservado para um evento fechado. A casa opera só o bar nessa noite.',
  event_date = current_date + ((5 - extract(dow from current_date)::int + 7) % 7) + 1,
  featured = false
where slug = 'salao-privado-setembro';

update events set
  event_date = current_date + ((5 - extract(dow from current_date)::int + 7) % 7) + 14,
  featured = false
where slug = 'after-lume';

update events set
  title = 'Casa inteira',
  description = 'A casa inteira. Pista, bar e camarotes abertos na mesma noite.',
  event_date = current_date + ((5 - extract(dow from current_date)::int + 7) % 7) + 21,
  featured = false
where slug = 'abertura-outubro';

delete from reservations
where guest_email in (
  'helena@example.com',
  'rafael@example.com',
  'clara@example.com',
  'eventos@estudionorte.com'
);

insert into reservations (
  space_id, guest_name, guest_email, guest_phone, party_size, reserved_for, status, notes
)
select s.id, v.guest_name, v.guest_email, v.guest_phone, v.party_size, e.event_date, v.status, v.notes
from (
  values
    ('C1', 'sextas-lume', 'Helena Prado', 'helena@example.com', '11 98888-1010', 6, 'confirmed', 'Aniversário. Chegada 23h30.'),
    ('P1', 'sextas-lume', 'Rafael Moura', 'rafael@example.com', '11 97777-2020', 5, 'pending', 'Pedido pela recepção.'),
    ('M1', 'ivory-sessions', 'Clara Nunes', 'clara@example.com', '11 96666-3030', 4, 'confirmed', ''),
    ('S1', 'salao-privado-setembro', 'Estúdio Norte', 'eventos@estudionorte.com', '11 95555-4040', 120, 'confirmed', 'Evento fechado. Som da casa.')
) as v(code, slug, guest_name, guest_email, guest_phone, party_size, status, notes)
join spaces s on s.code = v.code
join events e on e.slug = v.slug
where not exists (
  select 1 from reservations r
  where r.space_id = s.id and r.reserved_for = e.event_date
);
