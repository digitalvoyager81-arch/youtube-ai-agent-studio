import { Config } from "@remotion/cli/config";
import fs from "fs";
import path from "path";

// В облачной сессии remotion.media недоступен — используем предустановленный headless shell
const PW_DIR = "/opt/pw-browsers";
if (fs.existsSync(PW_DIR)) {
  const shellDir = fs.readdirSync(PW_DIR).find((d) => d.startsWith("chromium_headless_shell-"));
  if (shellDir) {
    Config.setBrowserExecutable(
      path.join(PW_DIR, shellDir, "chrome-headless-shell-linux64", "chrome-headless-shell"),
    );
  }
}
