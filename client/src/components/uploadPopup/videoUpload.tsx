import { useState } from "react";
import PopUpComponent from "./popupComponent";
import SubmitButton from "../submitButton.jsx";
import axios from "../../api/axios.js";

export default function VideoUploadPopup({ setShowPopup }) {
	const [loading, SetLoading] = useState(false);
	const [isSubmmited, setIsSubmmited] = useState(false);
	const [fileName, setFileName] = useState("Select video file to upload");
	function handleVideoFile(fname) {
		setFileName(fname);
	}
	async function handleVideoUpload(e) {
		e.preventDefault();
		SetLoading(true);
		const formdata = new FormData(e.target);
		try {
			await axios.post("videos/publish-video", formdata, {
				headers: {
					"Content-Type": "multipart/formdata",
				},
			});
		} catch (error) {
			console.log(error);
		} finally {
			SetLoading(false);
			setIsSubmmited(true);
			setTimeout(() => {
				setIsSubmmited(false);
				setShowPopup(false);
			}, 1500);
		}
	}

	return (
		<>
			<PopUpComponent onCancel={() => setShowPopup(false)}>
				<form onSubmit={(e) => handleVideoUpload(e)}>
					<div className="flex items-center justify-center h-50 w-full px-4 py-0 my-4 mt-8 ">
						<label
							htmlFor="for-upload"
							className="border-2 border-dotted rounded-2xl border-gray-300 h-full w-full flex justify-center items-center flex-col"
						 >
							<svg
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#111"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect x="1" y="5" width="15" height="14" rx="2" />
								<polygon points="23 7 16 12 23 17 23 7" />
							</svg>
							<h3 className="text-sm text-gray-400 mt-2 w-65 text-center truncate md:w-70 lg:w-75">{fileName}</h3>
							<input
								type="file"
								name="videofile"
								onChange={(e) => handleVideoFile(e.target?.files[0]?.name)}
								className="hidden"
								id="for-upload"
							/>
						</label>
					</div>

					<div className="px-4 mt-4 text-left flex flex-col gap-6">
						<label className="text-md font-base text-gray-700">
							Thumbnail*
							<input
								name="thumbnail"
								type="file"
								className="bg-gray-100
                w-full  p-1  border-graytext-base file:mr-2 file:rounded-full file:border-0 file:bg-[#0A98FC] file:text-white file:px-4 file:py-2 file:text-sm file:font-semibold  hover:file:bg-blue-100 dark:file:bg-blue-600 dark:file:text-blue-100 dark:hover:file:bg-blue-500 "
							/>
						</label>

						<label className="text-md font-base text-gray-700">
							Title
							<input
								name="title"
								type="text"
								className="bg-gray-100
                w-full py-2 px-2 border border-gray-200 placeholder:text-sm rounded-lg"
							/>
						</label>

						<label className="text-md font-base text-gray-700">
							Description
							<textarea
								name="description"
								type="text"
								className="bg-gray-100
                h-30 w-full p-2 border border-gray-200 text-sm rounded-lg"
							/>
						</label>
					</div>
					<div className="flex items-center justify-center mt-1 gap-4 md:gap-10">
						<button
							type="button"
							onClick={() => setShowPopup(false)}
							className="bg-gray-200 text-base font-semibold text-gray-800 p-4 flex items-center justify-center text-center rounded-full w-38 h-11 mt-2 mb-5"
						>
							Cancel
						</button>
						<SubmitButton
							currentSubmitStatus={
								isSubmmited ? "submited" : loading ? "loading" : "normal"
							}
							text={"Upload"}
							className={`mt-2 mb-5`}
						/>
					</div>
				</form>
			</PopUpComponent>
		</>
	);
}
