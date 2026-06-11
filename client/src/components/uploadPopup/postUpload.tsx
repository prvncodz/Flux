import { useState } from "react";
import axios from "../../api/axios";
import SubmitButton from "../submitButton";
import PopUpComponent from "./popupComponent";

export default function PostUploadPopup({ setShowPopup }) {
	const [loading, SetLoading] = useState(false);
	const [isSubmmited, setIsSubmmited] = useState(false);

	async function handlePostUpload(e) {
		e.preventDefault();
		const formdata = new FormData(e.target);
		SetLoading(true);
		const content = formdata.get("content");

		try {
			await axios.post(
				"tweets/create-tweet",
				{ content },
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		} catch (error) {
			console.log(error);
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
					className="text-left p-3 my-2"
					onSubmit={(e) => handlePostUpload(e)}
				>
					<label className="text-md font-base text-gray-700 ">
						what's on your mind?
						<textarea
							name="content"
							type="text"
							placeholder="The weather is beautifull..."
							className="bg-gray-100
                h-30 w-full p-2 border border-gray-300 text-sm mt-1 outline-none md:h-40"
						/>
					</label>
					<div className="flex justify-center gap-3 mt-1 md:justify-end">
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
							text={"Upload"}
							centered={false}
							className={"mt-3 mb-3"}
						/>
					</div>
				</form>
			</PopUpComponent>
		</>
	);
}
