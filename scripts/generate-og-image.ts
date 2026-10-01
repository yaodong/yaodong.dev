import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const WIDTH = 1200;
const HEIGHT = 630;

// "Paper" card — the site's light theme tokens (see
// src/styles/application.css). A masthead row (~/yaodong.dev on the left,
// date · reading time on the right) over a heavy rule, and the title
// anchored to the bottom. OG cards render at ~480px in feeds, so the title
// does the work and the masthead stays short.
const COLORS = {
  bg: "#FBFBFA",
  text: "#111111",
  muted: "#6E6E68",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadLocalFont(filename: string): Promise<Buffer> {
  const fontPath = join(__dirname, "fonts", filename);
  return readFile(fontPath);
}

// Layout budget for auto-fitting the title. The masthead is pinned to the top
// and the title to the bottom (justify: space-between); we size the title so
// its wrapped height never reaches the masthead — short titles grow to poster
// scale, long titles shrink to stay on the card.
const PADDING = 72;
const MARK_FONT_SIZE = 30;
const META_FONT_SIZE = 26;
const RULE_WIDTH = 3;
const MASTHEAD_GAP = 22; // between the masthead text and its rule
const INNER_WIDTH = WIDTH - PADDING * 2;
const INNER_HEIGHT = HEIGHT - PADDING * 2;
const TITLE_MAX_WIDTH = INNER_WIDTH;
const MASTHEAD_HEIGHT = Math.ceil(MARK_FONT_SIZE * 1.3) + MASTHEAD_GAP + RULE_WIDTH;
// Reserve the masthead plus a 48px minimum gap above the title.
const TITLE_MAX_HEIGHT = INNER_HEIGHT - MASTHEAD_HEIGHT - 48;
const TITLE_FONT_MAX = 132;
const TITLE_FONT_MIN = 48;
const TITLE_LINE_HEIGHT = 1.0;

type Fonts = Parameters<typeof satori>[1]["fonts"];

function titleStyle(fontSize: number) {
  return {
    fontFamily: "Fira Sans",
    fontSize,
    fontWeight: 600,
    color: COLORS.text,
    letterSpacing: "-0.04em",
    lineHeight: TITLE_LINE_HEIGHT,
    margin: 0,
  };
}

// Measure the rendered height of the title at a given size: satori returns an
// SVG sized to its content when we omit the height, so we read it back.
async function measureTitleHeight(
  title: string,
  fontSize: number,
  fonts: Fonts,
  wordBreak: "normal" | "break-all" = "normal",
): Promise<number> {
  const svg = await satori(
    {
      type: "div",
      props: {
        style: { display: "flex", width: TITLE_MAX_WIDTH },
        children: {
          type: "h1",
          props: {
            style: { ...titleStyle(fontSize), width: "100%", wordBreak },
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

// A word can't wrap, so a long one overflows the card sideways without adding
// height. Render each of the longest words alone with break-all: if it stays
// on one line, it fits the width.
async function longWordsFit(
  words: string[],
  fontSize: number,
  fonts: Fonts,
): Promise<boolean> {
  const oneLine = fontSize * TITLE_LINE_HEIGHT * 1.5;
  for (const word of words) {
    if ((await measureTitleHeight(word, fontSize, fonts, "break-all")) > oneLine) {
      return false;
    }
  }
  return true;
}

// Largest font size within [MIN, MAX] whose wrapped title fits the height
// budget and whose longest words fit the width. Binary search — both are
// monotonic in font size.
async function fitTitleFontSize(title: string, fonts: Fonts): Promise<number> {
  const longestWords = title
    .split(/\s+/)
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);
  let lo = TITLE_FONT_MIN;
  let hi = TITLE_FONT_MAX;
  let best = TITLE_FONT_MIN;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const height = await measureTitleHeight(title, mid, fonts);
    if (height <= TITLE_MAX_HEIGHT && (await longWordsFit(longestWords, mid, fonts))) {
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

  // Reading time (~200 wpm). Drop inline SVG figures so diagram markup
  // doesn't count as prose.
  const prose = content.replace(/<svg[\s\S]*?<\/svg>/g, " ");
  const wordCount = prose.trim().split(/\s+/).length;
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

  // Masthead date, from created_date (posts sort and display by it).
  const date = data.created_date
    ? new Date(data.created_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;
  const meta = date ? `${date} · ${readingTime} min` : `${readingTime} min`;

  // Poster-scale title, auto-fit to the card: measure the wrapped title and
  // pick the largest size that fits, so long titles shrink instead of
  // overflowing. Char-count heuristics can't see wrapping; measuring can.
  // A title too long even at the minimum size is clamped with an ellipsis
  // rather than allowed to run into the masthead.
  const titleFontSize = await fitTitleFontSize(title, fonts);
  const maxTitleLines = Math.floor(
    TITLE_MAX_HEIGHT / (titleFontSize * TITLE_LINE_HEIGHT),
  );

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
          // Masthead — ~/yaodong.dev left, date · N min right, heavy rule below
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                paddingBottom: MASTHEAD_GAP,
                borderBottom: `${RULE_WIDTH}px solid ${COLORS.text}`,
                fontFamily: "JetBrains Mono",
                fontWeight: 600,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex", fontSize: MARK_FONT_SIZE },
                    children: [
                      {
                        type: "span",
                        props: { style: { color: COLORS.muted }, children: "~/" },
                      },
                      {
                        type: "span",
                        props: { style: { color: COLORS.text }, children: "yaodong.dev" },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { display: "flex", fontSize: META_FONT_SIZE, color: COLORS.muted },
                    children: meta,
                  },
                },
              ],
            },
          },
          // Title — anchored to the bottom, dominates the card
          {
            type: "h1",
            props: {
              style: {
                ...titleStyle(titleFontSize),
                maxWidth: TITLE_MAX_WIDTH,
                display: "block",
                // Last resorts for titles that don't fit even at the minimum
                // size: break an oversized word, clamp extra lines.
                wordBreak: "break-word",
                lineClamp: maxTitleLines,
              },
              children: title,
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
