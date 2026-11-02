# FoodRec website

A static page with screenshots, videos and a link to the FoodRec demo. It has no build step and no
dependencies, and is separate from the FoodRec code.

## Publish

1. Create a public GitHub repository named `foodrec-site` and push this folder to its `main` branch.
2. In that repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, then
   choose **main** and **/ (root)**.

The page appears at `https://amirmohammad-nouri.github.io/foodrec-site/`. Each push to `main` updates it.

## Change the content

Nearly everything is in `content.js`:

| To | Do this |
|---|---|
| Show the demo button | Set `demoUrl`. The button stays hidden while it is empty. |
| Add a screenshot | Put the image in `media/screens/` and add a line to `screenshots`. The first one is also the large image at the top. |
| Add a video file | Put it in `media/videos/` and add `{ title, description, file, poster }` to `videos`. |
| Add a YouTube video | Add `{ title, description, youtube: "VIDEO_ID" }` to `videos`. |

GitHub rejects files over 100 MB, so use YouTube for long videos.

## Preview

```bash
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080.
