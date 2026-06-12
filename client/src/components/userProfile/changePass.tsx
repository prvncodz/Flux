import React, { useState } from "react";
import SubmitButton from "../submitButton";
import axios from "../../api/axios";
import PopUpComponent from "../uploadPopup/popupComponent";

export default function ChangePassPopup({ setIsPassPopupActive }: { setIsPassPopupActive: (b: boolean) => void }) {
	const [loading, SetLoading] = useState<boolean>(false);
	const [isSubmmited, setIsSubmmited] = useState<boolean>(false);

	async function handleFormSubmission(e: React.FormEvent<HTMLFormElement>) {
		SetLoading(true);
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		
		try {
			await axios.post("/user/change-password", {
				oldPassword: formData.get("oldPassword"),
				newPassword: formData.get("newPassword"),
			});
		} catch (error: any) {
			console.log(error);
			console.log(`Error name: ${error.name}`);
			console.log(`Backend message: ${error.response?.data?.message}`);
			form.reset();
		} finally {
			SetLoading(false);
		}

		setIsSubmmited(true);
		form.reset();
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
							type="password"
							className="bg-gray-100
                w-full  mt-1 mb-4 rounded-md p-1 border border-gray-200 shadow-xs"
						/>
					</label>

					<label className="text-md font-medium text-gray-700">
						New Password
						<input
							name="newPassword"
							type="password"
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
