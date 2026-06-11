const ReplyIcon = ({
  size = 16, // default fits inline with text/counters
  color = "currentColor",
  strokeWidth = 1.6,
  title, // optional accessible title
  ...props
}) => {
  const ariaAttrs = title
    ? { role: "img", "aria-label": title }
    : { "aria-hidden": true };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
      {...ariaAttrs}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {/* arrow head */}
      <path
        d="M9 14L4 9l5-5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* curved tail */}
      <path
        d="M20 20v-7a4 4 0 0 0-4-4H5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ReplyIcon;
