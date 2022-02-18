import fs from "fs";
import fse from "fs-extra";
import path, { basename, dirname } from "path";
import { fileURLToPath } from "url";

import hoquet from "hoquet";
import mkdirp from "mkdirp";
import renderReadme from "render-readme";

import packageList from "./packages.js";

import {
  getPackageNameFromGitHubUrl,
  getPackagesData,
  GITHUB_USER_CONTENT_URL,
  isGitHubUrl,
} from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Copy
fse.emptyDirSync(`${__dirname}/dist`);
fse.copySync(`${__dirname}/assets`, `${__dirname}/dist/assets`);

[
  `${__dirname}/node_modules/github-markdown-css/github-markdown.css`,
  `${__dirname}/node_modules/highlight.js/styles/github.css`,
  `${__dirname}/node_modules/highlight.js/styles/github-dark-dimmed.css`,
  `${__dirname}/node_modules/tachyons/css/tachyons.min.css`,
].forEach((asset) =>
  fse.copySync(asset, `${__dirname}/dist/assets/${basename(asset)}`)
);

const PAGE_TITLE = "PEX - Documentation | https://pex.gl/docs"
const DEFAULT_MODULE = "pex-context";

function parseLine(line) {
  const m = line.match(/<h[234567]><a name="([^"]+)"><\/a>([^<]+)/);
  if (m) return [m[1], m[2]];
  const m2 = line.match(/<h[234567]><a name="([^"]+)"><\/a><code>([^<]+)/);
  if (m2) return [m2[1], m2[2]];
  else return null;
}

const packages = (await getPackagesData()).map((packageInfo) => {
  const html = renderReadme(packageInfo?.readme || "")
    // Fix relative src path
    .replace(
      /src=["|'](?!https?:\/\/)([^\/].+?)[\"|\']/g,
      isGitHubUrl(packageInfo.name)
        ? `src="${GITHUB_USER_CONTENT_URL}/${getPackageNameFromGitHubUrl(
            packageInfo.name
          )}/HEAD/$1"`
        : `src="${GITHUB_USER_CONTENT_URL}/${packageInfo.user}/${packageInfo.name}/HEAD/$1"`
    );

  return {
    ...packageInfo,
    readmeHtml: html,
    headers: html
      .split("\n")
      .map(parseLine)
      .filter((h) => h),
  };
});

function renderPackage(name) {
  if (name.startsWith("#")) {
    // prettier-ignore
    return [
      "div", { class: "lh-copy" },
      [
        "a", { class: "no-underline", target: "readme-view" },
        ["h1", { class: "f5 item normal ma0 mt3 gray" }, name.replace("#", "")],
      ],
    ];
  }

  const module = packages.find((module) => module.name === name);
  if (!module) {
    console.log(name);
    return ["div", `Missing ${name}`];
  }

  // prettier-ignore
  return [
    "div", { class: "f7 lh-copy" },
    [
      "div", { class: "flex flex-row no-underline item-title" },
      [
        "h2", { class: "item normal f7 ma0 mt1 " },
        ["a", { class: "dim no-underline", style: "color: currentColor;", href: `packages/${module.package.name}/README.html`, target: "readme-view" },
          module.package.name,
        ],
      ],
      [
        "span", { class: "no-underline ml2 flex-auto w3 truncate normal f7 ma0 mt1 gray" },
        module.user,
      ],
      module.package.version !== "0.0.0" && [
        "a", { class: "dim w3 truncate normal f7 ma0 mt1 near-white no-underline", href: `https://www.npmjs.com/package/${module.package.name}`, target: "_blank" },
        module.package.version,
      ],
    ],
    module.headers.map((line) => {
      const color = [".", "(", ":", "{"].some((c) => line[1].includes(c))
        ? "green"
        : "gray";
      return [
        "a", { class: `no-underline ${color} dim truncate`, style: "max-width: 300px;", href: `packages/${module.package.name}/README.html#${line[0]}`, target: "readme-view" },
        [
          "h3", { class: `item normal f7 mt1 ${color} dim ma0 truncate` },
          line[1].replace(/`/g, ""),
        ],
      ];
    }),
  ];
}

// Render Main
// prettier-ignore
const html = [
  "html",
  [
    "head",
    ["meta", { charset: "UTF-8" }],
    ["meta", { 'http-equiv': "X-UA-Compatible", content: "IE=edge" }],
    ["meta", { name: "viewport", content: "width=device-width", "initial-scale": "1" }],
    ["title", PAGE_TITLE],
    ["link", { rel: "stylesheet", href: "assets/tachyons.min.css" }],
    ["link", { rel: "stylesheet", href: "assets/style.css" }],
  ],
  [
    "body", { class: "code flex flex-column", style: "height: 100%; max-height: 100%;" },
    [
      "div", { class: "flex flex-row h-100" },
      [
        "aside", { class: "pa3", style: "overflow-y: scroll; width: max(350px, 15vw);" },
        [
          "a", { href: `/` },
          ["img", { src: "assets/PEX.png", height: 24, class: "mv3" }],
        ],
        [
          "div", { class: "flex mv2" },
          ["input", { type: "search", placeholder: "Search", autocomplete: "off", id: "search", class: "f6 pa2 flex-auto" }],
        ],
        packageList.map(renderPackage),
        ["script", { src: "assets/search.js" }, ""],
      ],
      ["iframe", { name: "readme-view", class: "flex-auto bn", src: `packages/${DEFAULT_MODULE}/README.html` }],
    ],
  ],
];

// Main
console.log("Render content.");

// Render packages
packages.forEach(({ package: pkg, readmeHtml }) => {
  const targetModulePath = `${__dirname}/dist/packages/${pkg.name}`;
  if (!fs.existsSync(targetModulePath)) mkdirp.sync(targetModulePath);

  fs.writeFileSync(
    `${targetModulePath}/README.html`,
    /* html */ `<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pkg.name} - ${PAGE_TITLE}</title>
<link rel="stylesheet" href="../../assets/github-markdown.css">
<link media="(prefers-color-scheme: dark)" rel="stylesheet" href="../../assets/github-markdown-dark-dimmed.css">

<link media="(prefers-color-scheme: dark)" rel="stylesheet" href="../../assets/github-dark-dimmed.css">
<link media="(prefers-color-scheme: light)" rel="stylesheet" href="../../assets/github.css">
<style>
  .markdown-body {
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    padding: 45px;
  }

  @media (max-width: 767px) {
    .markdown-body {
      padding: 15px;
    }
  }
</style>
</head>
<body class="markdown-body">
  ${readmeHtml}
</body>
</html>`
  );
});

// Render index
fs.writeFileSync(path.join(__dirname, "dist/index.html"), hoquet.render(html));
