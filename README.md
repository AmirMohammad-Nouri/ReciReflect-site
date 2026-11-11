# ReciReflect website

An interactive page with a ranking lab, a supervisor replay, an app tour, a video with chapters and a link to the ReciReflect demo. It has no build step and no
dependencies, and is separate from the ReciReflect code.

## Publish

1. Create a public GitHub repository named `ReciReflect-site` and push this folder to its `main` branch.
2. In that repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, then
   choose **main** and **/ (root)**.

The page appears at `https://amirmohammad-nouri.github.io/ReciReflect-site/`. Each push to `main` updates it.

## Change the content

Nearly everything is in `content.js`:

| To | Do this |
|---|---|
| Show the demo button | Set `demoUrl`. The button stays hidden while it is empty. |
| Add a screen to the tour | Put the image in `media/screens/` and add an entry to `screenshots`. `notes` are the numbered points, placed by percentage. The first screen is also the large image at the top. |
| Change video chapters | Edit `chapters`; times are in seconds. |
| Add a video file | Put it in `media/videos/` and add `{ title, description, file, poster, captions }` to `videos` (`captions`, a `.vtt` file, is optional). |
| Add a YouTube video | Add `{ title, description, youtube: "VIDEO_ID" }` to `videos`. |

GitHub rejects files over 100 MB, so use YouTube for long videos.

## The data

`data.js` holds real values recorded from ReciReflect: scores of recipes from its catalogue, and one recorded supervisor run. Do not edit them by hand.

## Preview

```bash
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080.
