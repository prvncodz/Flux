export default function CancelIconComponent({ onClick }) {
  return (
    <div
      className="text-gray-800 rotate-45  hover:bg-neutral-100 rounded-full text-3xl h-10 w-10 absolute z-24 top-3 right-3 text-center cursor-pointer"
      onClick={onClick}
    >
      +
    </div>
  );
}
