---
name: assets
description: Importing images, videos, audio, and fonts into Remotion
metadata:
  tags: assets, staticFile, images, fonts, public
---

# Importing assets in Remotion

## The public folder

Place production assets in the `public/` folder at your project root.

If an image only exists elsewhere in the repo, do not rely on an arbitrary relative path at render time. Copy or promote it into `public/` first, or use a stable remote URL.

## Using staticFile()

You MUST use `staticFile()` to reference files from the `public/` folder:

```tsx
import {Img, staticFile} from 'remotion';

export const MyComposition = () => {
  return <Img src={staticFile('logo.png')} />;
};
```

The function returns an encoded URL that works correctly when deploying to subdirectories.

## Using with components

**Images:**

```tsx
import {Img, staticFile} from 'remotion';

<Img src={staticFile('photo.png')} />;
```

**Videos:**

```tsx
import {Video} from '@remotion/media';
import {staticFile} from 'remotion';

<Video src={staticFile('clip.mp4')} />;
```

**Audio:**

```tsx
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';

<Audio src={staticFile('music.mp3')} />;
```

**Fonts:**

```tsx
import {staticFile} from 'remotion';

const fontFamily = new FontFace('MyFont', `url(${staticFile('font.woff2')})`);
await fontFamily.load();
document.fonts.add(fontFamily);
```

## Remote URLs

Remote URLs can be used directly without `staticFile()`:

```tsx
<Img src="https://example.com/image.png" />
<Video src="https://remotion.media/video.mp4" />
```

Use remote URLs when the repo already references a stable hosted asset or when the project intentionally serves media from cloud storage.

## Generated assets

If you generate imagery during the task, write the result into `public/` or another deliberate render input path before wiring it into the composition.

Do not treat temporary output files as invisible dependencies.

## Product visuals

For product-heavy visuals, prefer code-as-image or a live Remotion composition over asking an image model to invent a fake dashboard or UI state.

## Important notes

- Remotion components (`<Img>`, `<Video>`, `<Audio>`) ensure assets are fully loaded before rendering
- Special characters in filenames (`#`, `?`, `&`) are automatically encoded
