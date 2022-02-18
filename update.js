import { writeFile } from "fs/promises";
import fetch from "node-fetch";

import packages from "./packages.js";

import {
  PACKAGES_DATA_FILE,
  GITHUB_USER_CONTENT_URL,
  getPackagesData,
  isGitHubUrl,
  getPackageNameFromGitHubUrl,
  NPM_REGISTRY_URL,
} from "./config.js";

const packageList = packages.filter((l) => l && !l.startsWith("#"));
// const packageList = ["pex-gl"];

const repos = await getPackagesData();

// GitHub
// const GITHUB_API = "https://api.github.com";
// const decodeBase64 = (data) =>
//   Buffer.from(data.content, "base64").toString("utf-8");
// const getPackage = async (repoPath) =>
//   JSON.parse(
//     decodeBase64(
//       await (
//         await fetch(`${GITHUB_API}/repos/${repoPath}/contents/package.json`)
//       ).json()
//     )
//   );
// const getReadme = async (repoPath) =>
//   decodeBase64(
//     await (await fetch(`${GITHUB_API}/repos/${repoPath}/readme`)).json()
//   );

const getPackage = async (repoPath) => {
  try {
    return await (
      await fetch(`${GITHUB_USER_CONTENT_URL}/${repoPath}/HEAD/package.json`)
    ).json();
  } catch (error) {
    console.warn(error);
    return {};
  }
};

const getReadme = async (repoPath) => {
  try {
    return await (
      await fetch(`${GITHUB_USER_CONTENT_URL}/${repoPath}/HEAD/README.md`)
    ).text();
  } catch (error) {
    console.warn(error);
    return "";
  }
};

const getRepoData = async (url) => {
  console.info("> getRepoData", url);
  const repoPath = getPackageNameFromGitHubUrl(url);
  const currentRepo = repos.find((repo) => repo?.name === url);
  const pkg = await getPackage(repoPath);

  if (pkg && pkg.version === currentRepo?.package?.version) return currentRepo;

  return {
    name: url,
    package: { version: pkg.version, name: pkg.name },
    readme: await getReadme(repoPath),
  };
};

// NPM
const getPackageData = async (packageName) => {
  console.info("> getPackageData", packageName);
  const data = await (await fetch(`${NPM_REGISTRY_URL}/${packageName}`)).json();

  return {
    name: data.name,
    package: { version: data?.["dist-tags"]?.latest, name: data.name },
    // user: data?.author?.name,
    user: data?.maintainers?.[0]?.name,
    readme: data.readme,
  };
};

// Main
console.log("Update content.");

const packagesData = await Promise.all(
  packageList.map(async (name) =>
    isGitHubUrl(name) ? await getRepoData(name) : await getPackageData(name)
  )
).catch((error) => {
  console.error(error);
});

await writeFile(PACKAGES_DATA_FILE, JSON.stringify(packagesData));
