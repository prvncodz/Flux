import { useContext, useEffect, useState } from "react";
import CancelIconComponent from "../../userProfile/cancelIconComponent.jsx";
import { useNavigate } from "react-router-dom";
import {
    History,
    Home,
    LayoutDashboard,
    LayoutList,
    LogOutIcon,
    ThumbsUp,
} from "lucide-react";

export default function MenuBar({ setIsMenuOPen, onSignout, isUserLogged }) {
    const navigate = useNavigate();

    useEffect(() => {
        handleNavigation();
    }, [handleNavigation]);
    function handleNavigation(dest) {
        if (!dest) return;
        if (dest === "home" || dest === "posts") {
            navigate("/", {
                state: {
                    tab: dest,
                },
            });
        } else if (dest === "dashboard") {
            navigate("/dashboard");
        } else if (dest === "watchhistory") {
            navigate("/watch-history");
        } else if (dest === "likedvideos") {
            navigate("/liked-videos");
        }
    }
    return (
        <>
            <div className="absolute top-0 left-0 bg-neutral-100 opacity-85 z-30 h-screen w-screen overflow-hidden md:hidden "></div>
            <div className="absolute h-screen overflow-hidden w-[30vh] bg-neutral-100  left-0 top-0 z-30 transition-all text-left flex flex-col justify-between   md:h-[95vh] md:mt-15 md:bg-[#ffffff]">
                <div className="md:hidden">
                    <CancelIconComponent onClick={() => setIsMenuOPen((prev) => !prev)} />
                </div>
                <ul className=" flex flex-col justify-left items-center w-full h-150 gap-4 md:gap-0 md:mt-3  md:px-1 md:pr-3 md:h-full md:w-full md:ml-1 ">
                    <li
                        className="h-auto w-full bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-gray-800 flex items-center rounded-lg md:py-3 md:bg-[#ffffff] md:hover:bg-neutral-100"
                        onClick={() => handleNavigation("home")}
                    >
                        <span className="mx-2 md:mx-4 ">
                            <Home size={20} className="" />
                        </span>
                        <span className="text-[18px] font-medium md:text-xl md:font-normal">
                            Home
                        </span>
                    </li>
                    {isUserLogged && (
                        <>
                            <li
                                className="h-auto w-full bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-gray-800 flex items-center rounded-lg md:py-3 md:bg-[#ffffff] md:hover:bg-neutral-100"
                                onClick={() => handleNavigation("dashboard")}
                            >
                                <span className="mx-2 md:mx-4">
                                    <LayoutDashboard size={18} className="" />
                                </span>
                                <span className="text-[18px] font-medium md:text-xl md:font-normal">
                                    Dashboard
                                </span>
                            </li>

                            <li
                                className="h-auto w-full bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-gray-800 flex items-center rounded-lg md:py-3 md:bg-[#ffffff] md:hover:bg-neutral-100"
                                onClick={() => handleNavigation("likedvideos")}
                            >
                                <span className="mx-2 md:mx-4 ">
                                    <ThumbsUp size={18} className="" />
                                </span>
                                <span className="text-[18px] font-medium md:text-xl md:font-normal">
                                    Liked videos
                                </span>
                            </li>
                            <li
                                className="h-auto w-full bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-gray-800 flex items-center rounded-lg md:py-3 md:bg-[#ffffff] md:hover:bg-neutral-100"
                                onClick={() => handleNavigation("watchhistory")}
                            >
                                <span className="mx-2 md:mx-4">
                                    <History size={18} className="" />
                                </span>
                                <span className="text-[18px] font-medium md:text-xl md:font-normal">
                                    Watch history
                                </span>
                            </li>
                        </>
                    )}
                    <li
                        className="h-auto w-full bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-gray-800 flex items-center rounded-lg md:py-3 md:bg-[#ffffff] md:hover:bg-neutral-100"
                        onClick={() => handleNavigation("posts")}
                    >
                        <span className="mx-2 md:mx-4">
                            <LayoutList size={18} className="" />
                        </span>
                        <span className="text-[18px] font-medium md:text-xl md:font-normal">
                            Posts
                        </span>
                    </li>
                </ul>

                {isUserLogged && (
                    <button
                        onClick={onSignout}
                        className="bg-[#1e98fe] hover:bg-blue-600 focus:outline-offset-2 active:bg-blue-800  text-gray-100 p-5 w-38 h-11 ml-auto mr-auto flex justify-center items-center rounded-full font-semibold text-center text-md transition-bg ease cursor-pointer mb-20 md:hidden lg:hidden"
                    >
                        <LogOutIcon />
                        <span className="ml-2 text-medium font-medium">Logout</span>
                    </button>
                )}
            </div>
        </>
    );
}
