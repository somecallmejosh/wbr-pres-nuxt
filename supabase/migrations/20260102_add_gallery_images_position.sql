-- Required: add position column, backfill, and index
alter table public.gallery_images
add column if not exists position integer;

with ranked as (
  select id,
         row_number() over (
           partition by gallery_id
           order by id asc
         ) as rn
  from public.gallery_images
)
update public.gallery_images gi
set position = ranked.rn
from ranked
where gi.id = ranked.id;

create index if not exists gallery_images_gallery_id_position_idx
on public.gallery_images (gallery_id, position);
