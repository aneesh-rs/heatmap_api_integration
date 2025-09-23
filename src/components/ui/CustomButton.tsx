type Props = {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function CustomButton({
  children,
  className,
  onClick,
  variant = "primary",
  ...rest
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`${
        variant === "primary"
          ? "bg-blue-500  hover:bg-blue-500/80 disabled:bg-blue-600/60"
          : "bg-blue-600 hover:bg-blue-600/80 disabled:bg-blue-600/60"
      } cursor-pointer  outline-none text-white font-medium py-3 px-6 rounded-full transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
