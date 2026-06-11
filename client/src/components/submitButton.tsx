export default function SubmitButton({
	currentSubmitStatus,
	text,
	className,
	ref,
	centered
}) {
	return (
		<button
			className={`bg-[#0A98FC] hover:bg-blue-500 
		  focus:outline-offset-2 active:bg-blue-600
		  text-gray-100 p-5 w-38 h-11 ${!centered ?"":"mx-auto"}
		 flex justify-center items-center rounded-full 
		  font-semibold text-center text-md transition-bg ease cursor-pointer ${className}`}
			type="submit"
			ref={ref}
		>
			{currentSubmitStatus == "normal"
				? text
				: currentSubmitStatus == "loading"
					? `${text}ing...`
					: `${text}ed ✓`}
		</button>
	);
}
