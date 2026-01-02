-- RPC: Bulk update positions for gallery images
-- Requires: gallery_images.id (uuid), gallery_images.gallery_id (uuid)
-- Adjust types if your IDs are not UUIDs.

create or replace function public.update_gallery_positions(
  payload jsonb,
  p_gallery_id uuid
)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.gallery_images gi
  set position = u.position
  from jsonb_to_recordset(payload) as u(id uuid, position int)
  where gi.id = u.id
    and gi.gallery_id = p_gallery_id;
$$;
