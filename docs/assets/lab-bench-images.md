# Lab bench pictures (assets/lab-bench)

Owner request, 2026-11-26: the 7.10 bench looked primitive; real-looking apparatus and samples were asked for
("kerakli materiallarni chatgptga kirib generatsiya qilvol"). The agent could not open ChatGPT itself. It used the
same image model family (GPT Image 2.6) through the vidIQ image generator connected to this session.
The pictures are decoration only: the bench picture is `aria-hidden`, and the lab state still draws every
chemistry fact (liquid, gas bubbles, precipitate, colour) on top of them.

| File | Source | Prompt (abridged) |
|---|---|---|
| `tube.webp` | generated, GPT Image 2.6, transparent background, 2026-11-26 | front view, empty clear borosilicate test tube, no text |
| `rack-a.webp`, `rack-b.webp`, `rack-a-front.webp`, `rack-b-front.webp` | cut from one generated picture (wooden rack, six holes) | front view, light wooden test-tube rack, empty, no text |
| `bottle-amber.webp` | generated | amber reagent bottle, black cap, blank label |
| `bottle-clear.webp` | generated | clear glass reagent bottle with stopper, colourless liquid, blank label |
| `mg.webp` | generated | silvery magnesium ribbon pieces |
| `zn.webp` | generated | grey zinc granules |
| `fe.webp` | generated | dark grey iron pieces |
| `cu.webp` | **derived**, not generated: `mg.webp`'s picture recoloured to a copper tone (the generator ran out of credits) | — |

Processing: ImageMagick. The pictures were trimmed at 25 % alpha, scaled down, and saved as WebP. The rack was cut
into pieces, so a rack with six holes can hold five tubes. `src/features/dynamic-lab/bench-assets.ts` embeds
these files as data URIs. That module is generated: regenerate it from these files, never edit it by hand.

Nothing here is a source for chemistry. A sample's colour or shape in a picture is not a claim about the substance.
