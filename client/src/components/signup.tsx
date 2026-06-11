import defaultPfp from "./assets/dpfp.jpg";
import defaultBanner from "./assets/dbanner.jpg";
import editIcon from "./assets/editimage.png";
import { useState, useRef } from "react";
import SubmitButton from "./submitButton.jsx";
import axios from "../api/axios.js";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
	const [coverImagePreview, setCoverImagePreview] = useState(null);
	const [avatarPreview, setAvatarPreview] = useState(null);
	const [DisplayAvatarRequired, setDisplayAvatarRequired] = useState(false);
	const fileRefci = useRef(null);
	const fileRefav = useRef(null);

	const [loading, SetLoading] = useState(false);
	const [error, SetError] = useState(false);
	const [isSubmmited, setIsSubmmited] = useState(false);

	const navigate = new useNavigate();
	async function handleFormSubmission(e) {
		SetLoading(true);
		e.preventDefault();
		const formData = new FormData(e.target);
		const avatar = formData.get("avatar");
		if (!avatar || avatar.size == 0) {
			setDisplayAvatarRequired(true);
			return;
		}
		try {
			const res = await axios.post("/user/register", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			if (res.status === 200) {
				navigate("/signin");
				setIsSubmmited(true);
			}
		} catch (error) {
			SetError(true);
			console.log(`Error name: ${error.name}`);
			console.log(`Backend message: ${error.response?.data?.message}`);

			e.target.reset();
		} finally {
			SetError(false);
			SetLoading(false);
		}
		setCoverImagePreview(null);
		setAvatarPreview(null);
		e.target.reset();
		setTimeout(() => {
			setIsSubmmited(false);
		}, 2000);
	}

	function handleCoverImage(e) {
		const file = e.target.files[0];
		if (file) {
			setCoverImagePreview(URL.createObjectURL(file));
		}
	}

	function handleAvatar(e) {
		const file = e.target.files[0];
		if (file) {
			setDisplayAvatarRequired(false);
			setAvatarPreview(URL.createObjectURL(file));
		}
	}

	return (
		<div
			id="signup-bg"
			className="h-screen w-screen flex flex-col justify-center
		items-center bg-gray-200"
		>
			<div
				id="signup-card"
				className="h-auto w-87 bg-gray-100 flex flex-col
			justify-center overflow-hidden rounded-xl md:w-100 md:p-3"
			>
				<h1 className="mt-5 text-3xl font-bold text-[#0A98FC] relative text-center">
					Sign Up
				</h1>

				<form className="p-7" onSubmit={handleFormSubmission}>
					<div className="wrapper relative transition-all ease">
						<div className="relative z-1">
							<img
								src={coverImagePreview ? coverImagePreview : defaultBanner}
								onClick={() => {
									fileRefci.current.click();
								}}
								className="h-33
			 	w-full rounded-lg relative cursor-pointer"
								loading="lazy"
							/>

							<div
								onClick={() => {
									fileRefci.current.click();
								}}
							>
								<div
									className="absolute z-2 bg-black/50 h-33 w-full rounded-lg
			 cursor-pointer top-0 "
								></div>
								<img
									src={editIcon}
									className="absolute h-15 w-15 z-3 -top-2 right-0 cursor-pointer"
									loading="lazy"
								/>
							</div>
							<input
								type="file"
								ref={fileRefci}
								className="hidden"
								name="coverImage"
								accept="image/*"
								onChange={handleCoverImage}
							/>
						</div>

						<div className="relative">
							<img
								src={avatarPreview ? avatarPreview : defaultPfp}
								onClick={() => {
									fileRefav.current.click();
								}}
								className="h-15
			 	w-15 rounded-full absolute -left-1 -bottom-3 cursor-pointer
			  z-1"
							/>
							<div
								onClick={() => {
									fileRefav.current.click();
								}}
							>
								<div
									className={`absolute z-2 bg-black/50 h-15 w-15 rounded-full -left-1
			 -bottom-3  cursor-pointer ${DisplayAvatarRequired ? "border-2 border-red-500" : ""} `}
								></div>

								<img
									src={editIcon}
									className="absolute h-12 w-13 -bottom-1 left-0 z-3 cursor-pointer"
								/>
							</div>

							{DisplayAvatarRequired ? (
								<div
									className="bg-gray-100 rounded-sm h-5 w-auto
			 	ml-8 mt-2 font-medium text-red-400 md:ml-16">
									Avatar is required to register
								</div>
							) : (
								<p></p>
							)}
							<input
								type="file"
								ref={fileRefav}
								className="hidden"
								name="avatar"
								accept="image/*"
								onChange={handleAvatar}
							/>
						</div>
					</div>

					<div
						className="form-inputs mt-10 mb-5  h-auto w-full relative
			text-left"
					>
						<label className="text-md font-medium text-gray-700">
							Fullname
							<input
								name="fullName"
								type="text"
								className="bg-gray-100
		 w-full  mt-1 mb-4 rounded-md p-1 pl-2 border border-gray-200 shadow-xs outline-none"
								required
							/>
						</label>
						<label className="text-md font-medium text-gray-700">
							Username
							<input
								name="userName"
								type="text"
								className="bg-gray-100 w-full  mb-4 rounded-md p-1 border
			border-gray-200 shadow-xs mt-1 pl-2 outline-none"
								required
							/>
						</label>
						<label className="text-md font-medium text-gray-700">
							Email
							<input
								name="email"
								type="email"
								className="bg-gray-100 w-full mb-4 rounded-md p-1 pl-2 border border-gray-200
			shadow-xs mt-1 outline-none"
								required
							/>
						</label>
						<label className="text-md font-medium text-gray-700">
							Password
							<input
								name="password"
								type="password"
								className="bg-gray-100 w-full mb-4 rounded-md p-1 pl-2 border
			border-gray-200 shadow-xs mt-1 outline-none"
								required
							/>
						</label>
					</div>
					<SubmitButton
						text={"Submit"}
						currentSubmitStatus={
							isSubmmited ? "submited" : loading ? "loading" : "normal"
						}
						className={"mx-auto"}
					/>
					<p className="mt-3 text-center">
						Already have an account?
						<span
							onClick={() => {
								navigate("/signin");
							}}
							className="text-blue-400 decoration-blue-400 underline cursor-pointer "
						>
							{" "}
							Sign in
						</span>
					</p>
				</form>
			</div>
		</div>
	);
}
