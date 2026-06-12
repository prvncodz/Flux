import defaultBanner from "../assets/dbanner.jpg";
import { useState, useRef } from "react";
import SubmitButton from "../submitButton";
import axios from "../../api/axios";
import PopUpComponent from "../uploadPopup/popupComponent";
import { ImageIcon } from "lucide-react";
import { Video } from "../../types/video.types";
import React from "react";

export default function EditVideoPopup({
    setIsEditPopUpActive,
    video,
    setShowUpdated,
    setShowUpdateError
}: {
    setIsEditPopUpActive: (b: boolean) => void;
    video: Video;
    setShowUpdated: (b: boolean) => void;
    setShowUpdateError: (b: boolean) => void;
}) {
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const fileRefci = useRef<HTMLInputElement | null>(null);
    const [loading, SetLoading] = useState<boolean>(false);
    const [isSubmmited, setIsSubmmited] = useState<boolean>(false);
    const [titleInput, setTitleInput] = useState<string>(video?.title || "");
    const [descriptionInput, setDescriptionInput] = useState<string>(video?.description || "")

    async function handleFormSubmission(e: React.FormEvent<HTMLFormElement>) {
        SetLoading(true);
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        async function updateVideo(videoId: string) {
            try {
                const res = await axios.patch(
                    `/videos/c/${videoId}/update-video`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    },
                );
                if (res.status === 200) {
                    setShowUpdated(true);
                } else {
                    setShowUpdateError(true);
                }
            } catch (error) {
                setShowUpdateError(true);
                form.reset();
            } finally {
                SetLoading(false);
            }
        }
        if (video?._id) {
            updateVideo(video._id);
        }
        setThumbnailPreview(null);
        setIsSubmmited(true);
        form.reset();
        setTimeout(() => {
            setIsSubmmited(false);
            setIsEditPopUpActive(false);
        }, 1000);
    }

    function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file));
        }
    }



    return (
        <PopUpComponent onCancel={() => setIsEditPopUpActive(false)}>
            <h1 className="mt-5 text-xl font-semibold text-[#0A98FC] relative text-center">
                Update Video
            </h1>

            <form className="p-5" onSubmit={handleFormSubmission}>

                <div className="wrapper relative transition-all ease">
                    <div className="relative z-1">
                        <img
                            src={
                                thumbnailPreview
                                    ? thumbnailPreview
                                    : video?.thumbnail?.url
                                        ? video?.thumbnail?.url
                                        : defaultBanner
                            }
                            onClick={() => {
                                fileRefci.current?.click();
                            }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => (e.currentTarget.src = defaultBanner)}
                            className="h-33
                w-full rounded-lg relative cursor-pointer md:h-53"
                            loading="lazy"
                        />

                        <div
                            className="absolute z-2 bg-black/50 h-full w-full rounded-lg
                  cursor-pointer top-0 flex items-center justify-center" onClick={() => fileRefci.current?.click()}
                        >
                            <ImageIcon className="text-gray-300" />
                            <div className="text-gray-300 ml-2 text-sm" >Video thumbnail </div>
                        </div>

                        <input
                            type="file"
                            ref={fileRefci}
                            className="hidden"
                            name="thumbnail"
                            accept="image/*"
                            onChange={handleThumbnail}
                        />
                    </div>

                </div>

                <div
                    className="form-inputs mt-10 mb-2  h-auto w-full relative
            text-left"
                >
                    <label className="text-base font-medium text-gray-700">
                        Title
                        <input
                            name="title"
                            type="text"
                            className="bg-gray-100
                w-full  mt-1 mb-4 rounded-md p-2 md:p-3 border border-gray-200 shadow-xs font-normal text-sm"
                            value={titleInput}
                            onChange={(e) => {
                                setTitleInput(e.target.value);
                            }}
                        />
                    </label>
                    <label className="text-base font-medium text-gray-700">
                        Description
                        <textarea
                            name="description"
                            className="bg-gray-100 w-full  h-35 mb-4 rounded-md p-2 border
                border-gray-200 shadow-xs mt-1 md:p-3 font-normal text-sm"
                            value={descriptionInput}
                            onChange={(e) => {
                                setDescriptionInput(e.target.value);
                            }}
                        />
                    </label>
                </div>
                <div className="flex items-center justify-center gap-3 md:gap-8">
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
