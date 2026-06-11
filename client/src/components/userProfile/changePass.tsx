import { useState } from "react";
import SubmitButton from "../submitButton.jsx";
import axios from "../../api/axios.js";
import PopUpComponent from "../uploadPopup/popupComponent.jsx";

export default function ChangePassPopup({ setIsPassPopupActive }) {
	const [loading, SetLoading] = useState(false);
	const [isSubmmited, setIsSubmmited] = useState(false);

	async function handleFormSubmission(e) {
		SetLoading(true);
		e.preventDefault();
		const formData = new FormData(e.target);
		for (let [k, v] of formData) {
			console.log(k, v);
		}
		try {
			await axios.post("/user/change-password", {
				oldPassword: formData.get("oldPassword"),
				newPassword: formData.get("newPassword"),
			});
		} catch (error) {
			console.log(error);
			console.log(`Error name: ${error.name}`);
			console.log(`Backend message: ${error.response?.data?.message}`);
			e.target.reset();
		} finally {
			SetLoading(false);
		}

		setIsSubmmited(true);
		e.target.reset();
		setTimeout(() => {
			setIsSubmmited(false);
			setIsPassPopupActive(false);
		}, 1000);
	}

	return (
		<PopUpComponent onCancel={() => setIsPassPopupActive(false)}>
			<h1 className="mt-5 text-xl font-medium text-blue-400 relative text-center">
				Change Password
			</h1>

			<form className="p-7" onSubmit={handleFormSubmission}>
				<div
					className="form-inputs mt-10 mb-5  h-auto w-full relative
            text-left"
				>
					<label className="text-md font-medium text-gray-700">
						Old Password
						<input
							name="oldPassword"
							type="text"
							className="bg-gray-100
                w-full  mt-1 mb-4 rounded-md p-1 border border-gray-200 shadow-xs"
						/>
					</label>

					<label className="text-md font-medium text-gray-700">
						New Password
						<input
							name="newPassword"
							type="text"
							className="bg-gray-100
                w-full  mt-1 mb-4 rounded-md p-1 border border-gray-200 shadow-xs"
						/>
					</label>
				</div>
				<div className="flex justify-center">

					<SubmitButton
						text={"Submit"}
						currentSubmitStatus={
							isSubmmited ? "submited" : loading ? "loading" : "normal"
						}
					/>
				</div>
			</form>
		</PopUpComponent>
	);
}
