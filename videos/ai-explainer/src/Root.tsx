import { Composition } from "remotion";
import { AiExplainer } from "./AiExplainer";
import { FPS, TOTAL_FRAMES } from "./audioConfig";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AiExplainer"
      component={AiExplainer}
      fps={FPS}
      durationInFrames={TOTAL_FRAMES}
      width={1920}
      height={1080}
    />
  );
};
