const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

try {
  fs.unlinkSync("package.json");
} catch (e) {}

execSync(
  'npx -y create-next-app@latest lil-readers --typescript --tailwind --eslint --app --use-npm --src-dir false --import-alias "@/*" --yes',
  { stdio: "inherit" },
);

const srcDir = path.join(process.cwd(), "lil-readers");
const items = fs.readdirSync(srcDir);
for (const item of items) {
  fs.renameSync(path.join(srcDir, item), path.join(process.cwd(), item));
}
fs.rmdirSync(srcDir);
