import { Config } from "@remotion/cli/config";

Config.setChromiumOpenGlRenderer("swangle");
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
