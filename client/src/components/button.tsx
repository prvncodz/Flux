export default function Button({ children, classes, onClick }) {
  return (
    <button
      className={`bg-[#0A98FC] hover:bg-blue-600 
		  focus:outline-offset-2 active:bg-blue-800 active:scale-95 transition-all
		  text-gray-100 w-32 h-11 p-3 
		 flex justify-center items-center rounded-4xl 
		  font-semibold text-center text-md transition-bg ease cursor-pointer ${classes}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
