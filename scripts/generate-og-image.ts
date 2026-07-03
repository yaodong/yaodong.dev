import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const WIDTH = 1200;
const HEIGHT = 630;

// OG image colors (light theme like wisp.blog)
const COLORS = {
  accent: "#E67B31",
  text: "#1a1a1a",
  textSecondary: "#525252",
  bg: "#f5f5f0",
  bgContent: "#f5f5f0",
};

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadLocalFont(filename: string): Promise<Buffer> {
  const fontPath = join(__dirname, "fonts", filename);
  return readFile(fontPath);
}

// Strip markdown syntax from text
function stripMarkdown(text: string): string {
  return text
    // Remove links: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove images: ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    // Remove bold: **text** or __text__
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    // Remove italic: *text* or _text_
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove inline code: `code`
    .replace(/`([^`]+)`/g, "$1")
    // Remove headers: # text
    .replace(/^#{1,6}\s+/gm, "")
    // Remove blockquotes: > text
    .replace(/^>\s+/gm, "")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // Clean up extra whitespace
    .replace(/\s+/g, " ")
    .trim();
}

async function generateOgImage(postPath: string) {
  // Read post frontmatter and content
  const fileContent = await readFile(postPath, "utf-8");
  const { data, content } = matter(fileContent);
  const title = data.title || "Untitled Post";

  // Calculate reading time (roughly 200 words per minute)
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Extract description from post content
  // Remove code blocks first, then get paragraphs
  const contentWithoutCode = content
    .replace(/```[\s\S]*?```/g, "") // Remove fenced code blocks
    .replace(/`[^`]+`/g, ""); // Remove inline code
  
  let description = data.excerpt || data.custom_excerpt || data.description || "";
  if (!description) {
    const paragraphs = contentWithoutCode
      .split(/\n\n+/)
      .filter((p) => p.trim() && !p.startsWith("#") && !p.startsWith("```"));
    if (paragraphs.length > 0) {
      // Join multiple paragraphs to get more content
      description = paragraphs.slice(0, 3).join(" ").replace(/\n/g, " ").trim();
    }
  }
  // Strip markdown syntax - use plenty of text, overflow will be hidden with fade effect
  description = stripMarkdown(description);
  // Keep up to 600 chars - the container will clip overflow and gradient will fade it out
  if (description.length > 600) {
    description = description.substring(0, 600);
  }

  // Load Fira Sans font from local files
  const [fontRegular, fontMedium] = await Promise.all([
    loadLocalFont("FiraSans-Regular.ttf"),
    loadLocalFont("FiraSans-Medium.ttf"),
  ]);

  // Determine font size based on title length
  // Only hide description for very long titles (>100 chars)
  const isVeryLongTitle = title.length > 100;
  const titleFontSize = title.length > 100 ? "42px" : title.length > 70 ? "52px" : title.length > 50 ? "60px" : "72px";
  const showDescription = !isVeryLongTitle && description;

  // Generate SVG with Satori
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
          padding: "60px",
        },
        children: [
          // Top section
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "40px",
              },
              children: [
                // Reading time tag (top left)
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                    },
                    children: {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "28px",
                          fontWeight: 500,
                          color: "#ffffff",
                          backgroundColor: COLORS.text,
                          padding: "8px 16px",
                          borderRadius: "4px",
                        },
                        children: `${readingTime} min read`,
                      },
                    },
                  },
                },
                // Title and description
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    },
                    children: [
                      // Title (large, medium weight, left-aligned)
                      {
                        type: "h1",
                        props: {
                          style: {
                            fontSize: titleFontSize,
                            fontWeight: 500,
                            color: COLORS.text,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                            margin: 0,
                            maxWidth: "95%",
                          },
                          children: title,
                        },
                      },
                      // Description with fade effect (hidden for long titles)
                      showDescription
                        ? {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                flexDirection: "column",
                                position: "relative",
                                maxWidth: "90%",
                                maxHeight: "200px",
                                overflow: "hidden",
                              },
                              children: [
                                // Text content
                                {
                                  type: "p",
                                  props: {
                                    style: {
                                      fontSize: "28px",
                                      fontWeight: 400,
                                      color: COLORS.textSecondary,
                                      lineHeight: 1.5,
                                      margin: 0,
                                    },
                                    children: description,
                                  },
                                },
                                // Gradient fade overlay - from transparent to background
                                {
                                  type: "div",
                                  props: {
                                    style: {
                                      position: "absolute",
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      height: "60px",
                                      background: `linear-gradient(180deg, rgba(245,245,240,0) 0%, rgba(245,245,240,1) 100%)`,
                                    },
                                  },
                                },
                              ],
                            },
                          }
                        : null,
                    ].filter(Boolean),
                  },
                },
              ],
            },
          },
          // Bottom right: Domain name (same color as title)
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "flex-end",
              },
              children: {
                type: "span",
                props: {
                  style: {
                    fontSize: "28px",
                    fontWeight: 400,
                    color: COLORS.text,
                  },
                  children: "yaodong.dev",
                },
              },
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "Fira Sans",
          data: fontRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Fira Sans",
          data: fontMedium,
          weight: 500,
          style: "normal",
        },
      ],
    }
  );

  // Convert SVG to PNG
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: WIDTH,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // Determine output path (keep same filename as post)
  const filename = basename(postPath, ".md");
  const outputDir = join(process.cwd(), "public/assets/images/og");
  const outputPath = join(outputDir, `${filename}.png`);
  const imageUrl = `/assets/images/og/${filename}.png`;

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  // Write PNG file
  await writeFile(outputPath, pngBuffer);
  console.log(`✓ Generated: ${outputPath}`);

  // Update frontmatter with image path if needed
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

