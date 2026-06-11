import { useEffect, useState } from "react";
import SubmitButton from "../../submitButton";
import PopUpComponent from "../../uploadPopup/popupComponent";
import dpfp from "../../assets/dpfp.jpg"
import axios from "../../../api/axios";

const EditPost = ({ setShowPopup, tweet, fullname, username, avatarUrl }) => {

	const [loading, SetLoading] = useState(false);
	const [isSubmmited, setIsSubmmited] = useState(false);
	const [content, setContent] = useState(tweet?.content || "");

	async function handleEditPost(e) {
		e.preventDefault();
		SetLoading(true);

		try {
			await axios.patch(
				`/tweets/${tweet?._id}/update-tweet`,
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

		<PopUpComponent onCancel={() => setShowPopup(false)}>
			<form
				className="text-left p-3 my-2"
				onSubmit={(e) => handleEditPost(e)}
			>

				<div className="flex my-3 mb-5">
					<div className="h-10 w-10 ml-4">
						<img
							src={avatarUrl || dpfp}
							className="rounded-full h-10 w-10"
							onError={(e) => (e.target.src = dpfp)}
						/>
					</div>
					<span className="ml-4 h-7">
						<h3 className="text-left text-neutral-700 font-medium text-lg">
							{fullname}
						</h3>
						<h3 className="text-left text-neutral-600 font-medium text-xs mt-0">
							{"@" + username}
						</h3>
					</span>
				</div>
				<label className="text-md font-base text-gray-700 ">
					<textarea
						name="content"
						type="text"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="The weather is beautifull..."
						className="bg-gray-100
                h-30 w-full p-4 border border-gray-300 text-sm mt-1 outline-none whitespace-pre md:h-40"
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
						text={"Edit"}
						centered={false}
						className={"mt-3 mb-3"}
					/>
				</div>
			</form>
		</PopUpComponent>
	);
}
const DeletePost = ({ isOpen, onClose, tweetId }) => {
	// Close on Escape
	useEffect(() => {
		const onKey = (e) => { if (e.key === "Escape") onClose(); };
		if (isOpen) window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;
	async function handleDeletePost(Id) {
		if (!Id) return;
		try {
			const res = await axios.delete(`/tweets/${Id}/delete-tweet`)
			if (res.status === 200) {
				console.log("tweet deleted successfully")
			}
		} catch (err) {
			console.log(err)
		}
	}
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

				{/* Body */}
				<div className="px-6 pt-6 pb-5">

					<h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
						Are you sure?
					</h2>
					<p className="text-sm text-neutral-400 dark:text-neutral-500 leading-relaxed">
						This will permanently delete this Post.
					</p>
				</div>

				{/* Divider */}
				<div className="h-px bg-neutral-100 dark:bg-neutral-800" />

				{/* Actions */}
				<div className="flex gap-2 px-6 py-4">
					<button
						onClick={onClose}
						className="flex-1 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium"
					>
						No, keep it
					</button>
					<button
						onClick={() => { handleDeletePost(tweetId); onClose(); }}
						className="flex-1 py-2.5 text-sm rounded-xl bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white transition-all font-medium"
					>
						Yes, delete
					</button>
				</div>

			</div>
		</div>
	);
}
export { EditPost, DeletePost }
