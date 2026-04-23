import clsx from "clsx";
import useConfig from "../hooks/config.hook";

const PLACEMENT_LIMITS = {
  header: { maxH: 38, maxW: 320 },
  adminHeader: { maxH: 38, maxW: 320 },
  home: { maxH: 128, maxW: 520 },
  adminIntro: { maxH: 88, maxW: 380 },
} as const;

export type LogoPlacement = keyof typeof PLACEMENT_LIMITS;

type LogoProps = {
  placement: LogoPlacement;
  /** When set (e.g. admin live preview), overrides `general.logoScalePercent` from config */
  scalePercentOverride?: number | null;
  className?: string;
};

const clampScalePercent = (value: number) =>
  Math.min(250, Math.max(25, Number.isFinite(value) ? value : 100));

const Logo = ({ placement, scalePercentOverride, className }: LogoProps) => {
  const config = useConfig();
  const fromConfig = config.get("general.logoScalePercent");
  const scalePct =
    scalePercentOverride != null && Number.isFinite(scalePercentOverride)
      ? clampScalePercent(scalePercentOverride)
      : typeof fromConfig === "number" && Number.isFinite(fromConfig)
        ? clampScalePercent(fromConfig)
        : 100;
  const factor = scalePct / 100;
  const { maxH, maxW } = PLACEMENT_LIMITS[placement];
  const appName = config.get("general.appName");

  return (
    <img
      src="/img/logo.png"
      alt={typeof appName === "string" && appName.trim() ? appName : "Logo"}
      className={clsx("object-contain select-none", className)}
      style={{
        maxHeight: `${Math.round(maxH * factor)}px`,
        maxWidth: `${Math.round(maxW * factor)}px`,
        width: "auto",
        height: "auto",
      }}
    />
  );
};

export default Logo;
