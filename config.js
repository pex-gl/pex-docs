import { readFile } from "fs/promises";

export const GITHUB_USER_CONTENT_URL = "https://raw.githubusercontent.com";
export const NPM_REGISTRY_URL = "https://registry.npmjs.org";
export const PACKAGES_DATA_FILE = "packages.json";

export const getPackagesData = async () => {
  let packages = [];
  try {
    packages = JSON.parse(await readFile(PACKAGES_DATA_FILE, "utf-8")).filter(
      (l) => l
    );
  } catch (error) {}

  return packages;
};

export const isGitHubUrl = (url) => url.startsWith("https://github.com");

export const getPackageNameFromGitHubUrl = (url) =>
  url.replace("https://github.com/", "");
