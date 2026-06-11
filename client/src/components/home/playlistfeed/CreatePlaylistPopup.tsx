import { useState } from "react";
import SubmitButton from "../../submitButton";
import PopUpComponent from "../../uploadPopup/popupComponent";
import axios from "../../../api/axios";

export default function CreatePlaylistPopup({ setShowPopup }) {
	const [loading, SetLoading] = useState(false);
	const [isSubmmited, setIsSubmmited] = useState(false);

	async function handlePostUpload(e) {
		e.preventDefault();
		const formdata = new FormData(e.target);
		SetLoading(true);

		try {
			await axios.post(
				"/playlists/create",
				formdata,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		} catch (error) {
			console.log(error.message);
		}
		SetLoading(false);
		setIsSubmmited(true);
		setTimeout(() => {
			setIsSubmmited(false);
			setShowPopup(false);
		}, 1500);
	}
	return (
		<>
			<PopUpComponent onCancel={() => setShowPopup(false)}>
				<form
					className="text-left p-3 my-2 flex flex-col gap-2"
					onSubmit={(e) => handlePostUpload(e)}
				>
					<label className="text-md font-base text-gray-700 my-1">
						Playlist name
						<input
							name="name"
							type="text"
							placeholder="My playlist 1..."
							className="bg-gray-100 w-full border border-gray-300 rounded-xl  p-3  text-sm my-1 outline-none"
							required
						/>
					</label>
					<label className="text-md font-base text-gray-700 ">
						Descripton
						<textarea
							name="description"
							type="text"
							placeholder="Playlist description..."
							className="bg-gray-100 w-full border border-gray-300 rounded-xl h-30  p-3  text-sm mt-1 outline-none"
						/>
					</label>
					<div className="flex mt-1 gap-3 justify-center md:justify-end">
						<button
							type="button"
							onClick={() => setShowPopup(false)}
							className="bg-gray-200 text-base font-semibold text-gray-800 p-4 flex items-center justify-center text-center rounded-full w-38 h-11 mt-3 mb-3"
						>
							Cancel
						</button>
						<SubmitButton
							currentSubmitStatus={
								isSubmmited ? "submited" : loading ? "loading" : "normal"
							}
							text={"Submit"}
							className={"my-3"}
						/>
					</div>
				</form>
			</PopUpComponent>
		</>
	);
}
