import type { CSSProperties } from "react";

/**
 * Renders an icon from /public/icons/<name>.svg — drop a new SVG over the
 * same filename and it appears everywhere automatically.
 *
 * Default mode tints the icon to the surrounding text color via CSS mask,
 * so any MONOCHROME svg works on dark, gold and light backgrounds alike.
 * Pass `tint={false}` for full-color icons (stepper, contact cards) to
 * render the file's own colors.
 */
export default function Icon({
  name,
  size = 20,
  tint = true,
  className = "",
}: {
  name: string;
  size?: number;
  tint?: boolean;
  className?: string;
}) {
  if (!tint) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/icons/${name}.svg`}
        width={size}
        height={size}
        alt=""
        aria-hidden
        className={className}
      />
    );
  }
  const mask: CSSProperties = {
    width: size,
    height: size,
    backgroundColor: "currentColor",
    maskImage: `url(/icons/${name}.svg)`,
    WebkitMaskImage: `url(/icons/${name}.svg)`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  };
  return (
    <span aria-hidden className={`inline-block shrink-0 ${className}`} style={mask} />
  );
}
