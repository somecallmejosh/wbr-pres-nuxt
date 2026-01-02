-- Optional: enforce not null and unique position per gallery
alter table public.gallery_images
alter column position set not null;

create unique index if not exists gallery_images_unique_gallery_position
on public.gallery_images (gallery_id, position);
