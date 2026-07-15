import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const WIDTH = 1200;
const HEIGHT = 630;

// Monochrome dark poster — matches the site's dark theme tokens
// (see src/styles/application.css). One huge title + the ~/yaodong.dev
// mark with reading time. Nothing else: OG cards render at ~480px in
// feeds, so small metadata is illegible noise.
const COLORS = {
  bg: "#151514",
  text: "#E2E2DD",
  muted: "#82827B",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadLocalFont(filename: string): Promise<Buffer> {
  const fontPath = join(__dirname, "fonts", filename);
  return readFile(fontPath);
}

// Layout budget for auto-fitting the title. The title sits at the top and the
// mark is pinned to the bottom (justify: space-between); we size the title so
// its wrapped height never eats into the mark's row — long titles shrink to
// stay on the card instead of overrunning it or colliding with the mark.
const PADDING = 64;
const MARK_FONT_SIZE = 34;
const INNER_WIDTH = WIDTH - PADDING * 2;
const INNER_HEIGHT = HEIGHT - PADDING * 2;
const TITLE_MAX_WIDTH = Math.round(INNER_WIDTH * 0.96);
// Reserve the mark's line box (~1.3× its size) plus a 32px minimum gap.
const TITLE_MAX_HEIGHT = INNER_HEIGHT - Math.ceil(MARK_FONT_SIZE * 1.3) - 32;
const TITLE_FONT_MAX = 122;
const TITLE_FONT_MIN = 44;

type Fonts = Parameters<typeof satori>[1]["fonts"];

function titleStyle(fontSize: number) {
  return {
    fontFamily: "Fira Sans",
    fontSize,
    fontWeight: 600,
    color: COLORS.text,
    letterSpacing: "-0.045em",
    lineHeight: 0.98,
    margin: 0,
  };
}

// Measure the rendered height of the title at a given size: satori returns an
// SVG sized to its content when we omit the height, so we read it back.
async function measureTitleHeight(
  title: string,
  fontSize: number,
  fonts: Fonts,
): Promise<number> {
  const svg = await satori(
    {
      type: "div",
      props: {
        style: { display: "flex", width: TITLE_MAX_WIDTH },
        children: {
          type: "h1",
          props: {
            style: { ...titleStyle(fontSize), width: "100%" },
            children: title,
          },
        },
      },
    },
    { width: TITLE_MAX_WIDTH, fonts },
  );
  const match = svg.match(/<svg[^>]*\bheight="([\d.]+)"/);
  return match ? parseFloat(match[1]) : Number.POSITIVE_INFINITY;
}

// Largest font size within [MIN, MAX] whose wrapped title fits the height
// budget. Binary search — wrapped height is monotonic in font size.
async function fitTitleFontSize(title: string, fonts: Fonts): Promise<number> {
  let lo = TITLE_FONT_MIN;
  let hi = TITLE_FONT_MAX;
  let best = TITLE_FONT_MIN;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const height = await measureTitleHeight(title, mid, fonts);
    if (height <= TITLE_MAX_HEIGHT) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

async function generateOgImage(postPath: string) {
  const fileContent = await readFile(postPath, "utf-8");
  const { data, content } = matter(fileContent);
  const title = data.title || "Untitled Post";

  // Reading time (~200 wpm)
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Fonts: Fira Sans SemiBold for the title, JetBrains Mono SemiBold
  // for the mark — both weight 600, mirroring the site's heading/logo.
  const [firaSemiBold, monoSemiBold] = await Promise.all([
    loadLocalFont("FiraSans-SemiBold.ttf"),
    loadLocalFont("JetBrainsMono-SemiBold.ttf"),
  ]);
  const fonts: Fonts = [
    { name: "Fira Sans", data: firaSemiBold, weight: 600, style: "normal" },
    { name: "JetBrains Mono", data: monoSemiBold, weight: 600, style: "normal" },
  ];

  // Poster-scale title, auto-fit to the card: measure the wrapped title and
  // pick the largest size that fits, so long titles shrink instead of
  // overflowing. Char-count heuristics can't see wrapping; measuring can.
  const titleFontSize = await fitTitleFontSize(title, fonts);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: COLORS.bg,
          padding: PADDING,
        },
        children: [
          // Title — top, dominates the card
          {
            type: "h1",
            props: {
              style: { ...titleStyle(titleFontSize), maxWidth: "96%" },
              children: title,
            },
          },
          // Mark — bottom-left: ~/yaodong.dev · N min
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "baseline",
                fontFamily: "JetBrains Mono",
                fontSize: MARK_FONT_SIZE,
                fontWeight: 600,
              },
              children: [
                {
                  type: "span",
                  props: { style: { color: COLORS.muted }, children: "~/" },
                },
                {
                  type: "span",
                  props: { style: { color: COLORS.text }, children: "yaodong.dev" },
                },
                {
                  type: "span",
                  props: {
                    style: { color: COLORS.muted },
                    children: ` · ${readingTime} min`,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
  const pngBuffer = resvg.render().asPng();

  const filename = basename(postPath, ".md");
  const outputDir = join(process.cwd(), "public/assets/images/og");
  const outputPath = join(outputDir, `${filename}.png`);
  const imageUrl = `/assets/images/og/${filename}.png`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, pngBuffer);
  console.log(`✓ Generated: ${outputPath}`);

  if (data.image !== imageUrl) {
    data.image = imageUrl;
    const updatedContent = matter.stringify(content, data);
    await writeFile(postPath, updatedContent);
    console.log(`✓ Updated frontmatter: ${postPath}`);
  }

  return outputPath;
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: bun run generate:og <post-path>");
  console.error("Example: bun run generate:og _posts/2025-12-23-my-post.md");
  process.exit(1);
}

generateOgImage(args[0]).catch((err) => {
  console.error("Error generating OG image:", err);
  process.exit(1);
});
