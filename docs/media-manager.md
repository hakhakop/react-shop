# Dashboard Media Manager

The visual builder uses one shared media picker for WordPress media.

## Main Pieces

- `components/dashboard/media/MediaManager.tsx` renders the modal UI.
- `components/dashboard/media/useMediaLibrary.ts` owns paging, search, filters, upload, paste, metadata updates, delete, and selection state.
- `app/api/wordpress-media/route.ts` proxies WordPress REST media requests.
- `DashboardBuilder` keeps the existing `openWordPressMediaPicker(...)` integration, but now renders `MediaManager`.

## Browsing

The manager requests media in batches of 40 items and loads more when the grid scrolls near the bottom. It does not fetch the whole WordPress media library on open.

Supported filters:

- All Media
- Images
- Documents
- Videos

Search is sent to WordPress for large libraries and also filters the loaded batch by title, filename, alt text, caption, and description.

## Uploads

Uploads go to WordPress via `POST /api/wordpress-media`, which forwards the file to `wp-json/wp/v2/media`.

Required environment variables for write actions:

- `WORDPRESS_MEDIA_USERNAME`
- `WORDPRESS_MEDIA_PASSWORD`

The password should be a WordPress application password. Fallback names are also supported: `WORDPRESS_USERNAME`, `WORDPRESS_APPLICATION_PASSWORD`, `WORDPRESS_PASSWORD`, `WP_USERNAME`, and `WP_APPLICATION_PASSWORD`.

Without credentials, browsing still works, but upload, metadata update, and delete return a clear error.

## Picker Contract

Builder controls should open media through:

```ts
openWordPressMediaPicker({
  title: "Image",
  currentUrl,
  onSelect: (media) => {
    // save media.sourceUrl, media.altText, etc.
  },
});
```

Do not create feature-specific media pickers. Add new media workflows to `MediaManager` or `useMediaLibrary`.
