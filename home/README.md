# Homepage showcase content

`home/` is the complete static source for the rotating showcase on the homepage. The Astro build reads this directory directly; the browser does not fetch content or images from GitHub Wiki.

## Directory contract

```text
home/
  <scene>/
    assets/
      image-01.png
      image-02.png
    en/
      index.md
    zh/
      index.md
```

- `<scene>` is a stable lowercase identifier such as `fusion-review`.
- `en/index.md` appears on `/`.
- `zh/index.md` appears on `/zh/`.
- `assets/` contains every image used by that scene. Both languages may reuse the same images.
- Adding a valid scene directory automatically adds it to the homepage carousel after the next build.
- `detailUrl` and `detailLabel` are optional. They may link to a full Wiki guide, but Wiki is not a content dependency.

## Fixed frontmatter format

```yaml
---
scene: example-scene
lang: en
order: 40
eyebrow: Example capability
title: A short scene title
description: A concise homepage description.
highlights:
  - First concrete benefit
  - Second concrete benefit
detailUrl: https://github.com/taichuy/1flowbase/wiki/Example
detailLabel: Read the full guide
enabled: true
images:
  - src: ../assets/image-01.png
    alt: Accessible description of image 01
    caption: Short image caption
  - src: ../assets/image-02.png
    alt: Accessible description of image 02
    caption: Short image caption
---
```

Keep `scene` and `order` identical in the English and Chinese files so the two locales stay paired and ordered consistently.
