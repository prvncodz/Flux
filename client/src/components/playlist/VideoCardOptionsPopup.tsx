
import {Trash2} from "lucide-react";

export default function VideoCardOptions({ handleOption }) {
	return (
		<div className="absolute bg-gray-50 shadow-sm rounded-xl h-auto w-auto top-10 z-10 right-0 p-3 transition-all pop-in delay-75 flex flex-col gap-2">
			<div
				className="flex items-center gap-3 w-55 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
				onClick={() => handleOption("remove")}
			>
				<Trash2 size={18}/>
				<h3 className="ml-1 text-sm">Remove from playlist</h3>
			</div>

		</div>
	);
}
