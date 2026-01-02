-- Make unique (gallery_id, position) deferrable to allow swaps
-- Drop existing unique constraint or index if present
alter table public.gallery_images
  drop constraint if exists gallery_images_unique_gallery_position;

drop index if exists gallery_images_unique_gallery_position;

-- Add deferrable unique constraint so transpositions are valid within a transaction
alter table public.gallery_images
  add constraint gallery_images_unique_gallery_position
  unique (gallery_id, position)
  deferrable initially deferred;
