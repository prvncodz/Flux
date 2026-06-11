import defaultPfp from "../assets/dpfp.jpg";
import defaultBanner from "../assets/dbanner.jpg";
import editIcon from "../assets/editimage.png";
import { useState, useRef, useContext } from "react";
import SubmitButton from "../submitButton.jsx";
import axios from "../../api/axios.js";
import PopUpComponent from "../uploadPopup/popupComponent.jsx";
import useUserStore from "../../stores/user.store.js";

export default function editProfilePopup({ setIsEditPopUpActive }) {
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileRefci = useRef(null);
    const fileRefav = useRef(null);
    const [loading, SetLoading] = useState(false);
    const user = useUserStore(s => s.user);
    const [isSubmmited, setIsSubmmited] = useState(false);
    const [fullNameInput, setFullNameInput] = useState(
        user.fullName ? user.fullName : "",
    );
    const [usernameInput, setUsernameInput] = useState(
        user.userName ? user.userName : "",
    );
    const [emailInput, setEmailInput] = useState(user.email ? user.email : "");
    const [isInfoModified, setIsInfoModified] = useState(false);

    async function handleFormSubmission(e) {
        SetLoading(true);
        e.preventDefault();
        const formData = new FormData(e.target);
        const avatar = formData.get("avatar");
        const coverImage = formData.get("coverImage");
        const fullName = formData.get("fullName");
        const userName = formData.get("userName");
        const email = formData.get("email");

        //if we have a coverImage update it with this endpoint below
        if (coverImage && coverImage.size !== 0) {
            try {
                const res = await axios.patch(
                    "/user/update-user-coverimage",
                    { coverImage },
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    },
                );
            } catch (error) {
                console.log(error);
                console.log(`Error name: ${error.name}`);
                console.log(`Backend message: ${error.response?.data?.message}`);
                e.target.reset();
            } finally {
                SetLoading(false);
            }
        }

        if (avatar && avatar.size !== 0) {
            try {
                const res = await axios.patch(
                    "/user/update-user-avatar",
                    { avatar },
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    },
                );
            } catch (error) {
                console.log(`Error name: ${error.name}`);
                console.log(`Backend message: ${error.response?.data?.message}`);

                e.target.reset();
            } finally {
                SetLoading(false);
            }
        }
        if (isInfoModified) {
            try {
                const res = await axios.patch("/user/update-user-info", {
                    fullname: fullName,
                    username: userName,
                    email: email,
                });
            } catch (error) {
                console.log(error);
                console.log(`Error name: ${error.name}`);
                console.log(`Backend message: ${error.response?.data?.message}`);
                e.target.reset();
            } finally {
                SetLoading(false);
            }
        }
        setCoverImagePreview(null);
        setAvatarPreview(null);
        setIsSubmmited(true);
        e.target.reset();
        setTimeout(() => {
            setIsSubmmited(false);
            setIsEditPopUpActive(false);
        }, 1000);
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
            setAvatarPreview(URL.createObjectURL(file));
        }
    }

    return (
        <PopUpComponent onCancel={() => setIsEditPopUpActive(false)}>
            <h1 className="mt-5 text-xl font-semibold text-[#0A98FC] relative text-center">
                Update Profile
            </h1>

            <form className="p-7" onSubmit={handleFormSubmission}>
                <div className="wrapper relative transition-all ease">
                    <div className="relative z-1">
                        <img
                            src={
                                coverImagePreview
                                    ? coverImagePreview
                                    : user.coverImage
                                        ? user.coverImage.url
                                        : defaultBanner
                            }
                            onClick={() => {
                                fileRefci.current.click();
                            }}
                            onError={(e) => (e.target.src = dbanner)}
                            className="h-33
                w-full rounded-lg relative cursor-pointer md:h-40"
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
                            src={
                                avatarPreview
                                    ? avatarPreview
                                    : user.avatar
                                        ? user.avatar.url
                                        : defaultPfp
                            }
                            onError={(e) => (e.target.src = dbanner)}
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
                            <img
                                src={editIcon}
                                className="absolute h-12 w-13 -bottom-1 left-0 z-3 cursor-pointer"
                            />
                        </div>

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
                w-full  mt-1 mb-4 rounded-md p-1 border border-gray-200 shadow-xs"
                            value={fullNameInput}
                            onChange={(e) => {
                                setFullNameInput(e.target.value);
                                setIsInfoModified(true);
                            }}
                            onError={(e) => (e.target.value = user.fullName)}
                        />
                    </label>
                    <label className="text-md font-medium text-gray-700">
                        Username
                        <input
                            name="userName"
                            type="text"
                            className="bg-gray-100 w-full  mb-4 rounded-md p-1 border
                border-gray-200 shadow-xs mt-1"
                            value={usernameInput}
                            onChange={(e) => {
                                setUsernameInput(e.target.value);
                                setIsInfoModified(true);
                            }}
                            onError={(e) => (e.target.value = user.userName)}
                        />
                    </label>
                    <label className="text-md font-medium text-gray-700">
                        Email
                        <input
                            name="email"
                            type="email"
                            className="bg-gray-100 w-full mb-4 rounded-md p-1 border border-gray-200
                shadow-xs mt-1"
                            value={emailInput}
                            onError={(e) => (e.target.value = user.email)}
                            onChange={(e) => {
                                setEmailInput(e.target.value);
                                setIsInfoModified(true);
                            }}
                        />
                    </label>
                </div>
                <div className="flex items-center justify-center mt-1 gap-3 md:gap-8">
                    <button
                        type="button"
                        onClick={() => setIsEditPopUpActive(false)}
                        className="border border-neutral-400 text-base font-semibold text-gray-800 p-4 flex items-center justify-center text-center rounded-full w-38 h-11 mt-3 mb-3"
                    >
                        Cancel
                    </button>
                    <SubmitButton
                        currentSubmitStatus={
                            isSubmmited ? "submited" : loading ? "loading" : "normal"
                        }
                        text={"Upload"}
                        className={"mt-3 mb-3"}
                    />
                </div>
            </form>
        </PopUpComponent>
    );
}
