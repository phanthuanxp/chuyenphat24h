type BrandLogoProps = {
  tone?: "light" | "dark";
  size?: "default" | "compact";
  showTagline?: boolean;
  className?: string;
};

export function BrandLogo({
  tone = "light",
  size = "default",
  showTagline = false,
  className = "",
}: BrandLogoProps) {
  const primaryText = tone === "dark" ? "text-white" : "text-brand-navy-900";
  const labelSize = size === "compact" ? "text-base" : "text-lg sm:text-xl";

  return (
    <span className={`inline-flex min-w-0 flex-col leading-none ${className}`}>
      <span className={`whitespace-nowrap font-extrabold ${labelSize} ${primaryText}`}>
        {size === "compact" ? "CP" : "CHUYỂN PHÁT"}{" "}
        <span className="inline-block text-brand-orange-500" style={{ fontSize: "1.12em" }}>24H</span>
      </span>
      {showTagline && (
        <span className={`mt-1 hidden text-[11px] font-semibold tracking-normal sm:block ${tone === "dark" ? "text-slate-300" : "text-slate-500"}`}>
          NHẬN TẬN NƠI · GIAO TẬN TAY
        </span>
      )}
    </span>
  );
}
