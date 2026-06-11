import logo from "../assets/logo.png";
import profileIcon from "../assets/profile.png";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import axios from "../../api/axios.js";
import dpfp from "../assets/dpfp.jpg";
import VideoUploadPopup from "../uploadPopup/videoUpload.jsx";
import PostUploadPopup from "../uploadPopup/postUpload.jsx";
import CreateComponent from "./Upload_CreateComponent.jsx";
import Menu from "./menu/menu.jsx";
import MenuBtn from "../assets/menubtn.jsx";
import {
    ArrowLeft,
    CircleUserRound,
    HomeIcon,
    LayoutList,
    LogOutIcon,
    Search,
} from "lucide-react";
import SignInBanner from "../signinInstructPopup.jsx";
import CreatePlaylistPopup from "./playlistfeed/CreatePlaylistPopup.jsx";
import { motion } from "motion/react"
import useTab from "../../stores/tab.store.js";
import useUserStore from "../../stores/user.store.js";

export default function Nav({ wantTabs, searchType }) {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [notLoggedOut, setNotLoggedOut] = useState(true);
    const user = useUserStore(s => s.user);
    const isUserLogged = useUserStore(s => s.isUserLogged);
    const setIsUserLogged = useUserStore(s => s.setIsUserLogged);
    const [avatar, setAvatar] = useState(null);
    const [fullname, setFullname] = useState("Jhon Doe");
    const [username, setUsername] = useState("jdoejr");
    const [isCrtBtnActive, setIsCrtBtnActive] = useState(false);
    const [popupType, setPopupType] = useState("video");
    const [showPopup, setShowPopup] = useState(false);
    const [isSearchFieldOpen, setIsSearchFieldOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [isMenuOpen, setIsMenuOPen] = useState(false);
    const [signinInstruction, setSigninInstruction] = useState(false);
    const currentPage = useTab(s => s.tab) || {}
    const popup = {
        video: <VideoUploadPopup setShowPopup={setShowPopup} />,
        post: <PostUploadPopup setShowPopup={setShowPopup} />,
        playlist: <CreatePlaylistPopup setShowPopup={setShowPopup} />
    };

    useEffect(() => {
        if (isUserLogged && notLoggedOut) {
            setFullname(user?.fullName);
            setUsername(user?.userName);
            setAvatar(user?.avatar?.url);
        }
    }, [
        user,
        user?.fullName,
        user?.userName,
        user?.avatar?.url,
        isUserLogged,
        notLoggedOut,
    ]);

    async function handleSignout() {
        try {
            const res = await axios.post("/user/logout");

            if (res.status == 200) {
                setIsActive(false);
                setNotLoggedOut(false);
                setIsUserLogged(false);
            }
        } catch (error) {
            console.log(error);
            setIsActive(false);
        }
    }

    function handleUpload(fetchtype) {
        setIsCrtBtnActive(false);
        setShowPopup(true);
        if (fetchtype === "video") {
            setPopupType("video");
        } else if (fetchtype === "post") {
            setPopupType("post");
        } else {
            setPopupType("playlist");
        }
    }

    function handleSearch() {
        if (isSearchFieldOpen) {
            if (searchType === "post") {
                navigate(`/search/posts?query=${searchInput}`);
            } else {
                navigate(`/search/videos?query=${searchInput}`);
            }
        }
        setIsSearchFieldOpen((prev) => !prev);
    }

    function handleCreatePopup() {
        if (!isUserLogged) {
            setSigninInstruction(true);
            return;
        } else {
            setIsCrtBtnActive((prev) => !prev);
        }
    }

    function handleToggleMenu() {
        setIsMenuOPen((prev) => !prev);
    }
    return (
        <motion.nav
            className="h-auto w-full transition-all md:relative md:top-0 md:left-0 md:z-1"
            initial={{
                opacity: 0
            }}
            animate={{
                opacity: 1
            }}
            exit={{
                opacity: 0
            }}
        >
            <div className="flex flex-row w-full justify-between items-center h-15 ">
                <div className="flex justify-center items-center">
                    <div className="flex justify-center items-center ml-2 mt-2 cursor-pointer md:ml-4 md:mr-3 md:relative md:z-3 lg:mr-3 ">
                        <button
                            type="button"
                            className="border-none active:scale-95 transistion-all duration-150 cursor-pointer"
                            onClick={handleToggleMenu}
                        >
                            <MenuBtn size={35} />
                        </button>
                    </div>

                    <div className="relative ">
                        {/*logo*/}
                        <img
                            src={logo}
                            className="h-8 w-auto bg-cover"
                            loading="lazy"
                            onClick={() => navigate("/")}
                        />
                    </div>
                    <div className="flex items-center">
                        {isMenuOpen && (
                            <Menu
                                onSignout={handleSignout}
                                setIsMenuOPen={setIsMenuOPen}
                                isUserLogged={isUserLogged}
                            />
                        )}
                        {currentPage !== "watchVideo" &&
                            <div className="hidden md:absolute md:top-20 md:left-0 md:h-40 md:w-15 md:flex md:flex-col md:justify-between md:gap-2   ">
                                <div
                                    className={`h-20  p-2 flex flex-col items-center  justify-center w-full cursor-pointer hover:bg-gray-100 ml-1 rounded-xl  `}
                                    onClick={() => navigate("/")}
                                >
                                    <HomeIcon size={20} className="flex flex-start text-gray-700" />
                                    <div className=" text-center text-gray-800 font-normal text-sm w-full my-1 antialiased">
                                        Home
                                    </div>
                                </div>
                                <div
                                    className="h-20  p-2 flex items-center w-full flex-col text-left cursor-pointe hover:bg-gray-100 ml-1 rounded-xl cursor-pointer"
                                    onClick={() => navigate("/", { state: { tab: "posts" } })}
                                >
                                    <LayoutList size={20} className="text-gray-700" />
                                    <div className=" text-center text-gray-800 font-normal text-sm text my-1 antialiased">
                                        Posts
                                    </div>
                                </div>
                                <div
                                    className="h-20  p-2 flex items-center w-full flex-col text-left font-normal cursor-pointer ml-1 rounded-xl hover:bg-gray-100"
                                    onClick={() => {
                                        if (isUserLogged) {
                                            navigate(`/userchannel/${user?.userName}`);
                                        } else {
                                            navigate("/signin");
                                        }
                                    }}
                                >
                                    <CircleUserRound
                                        size={22}
                                        className="flex flex-start text-gray-700"
                                    />
                                    <div className=" text-center text-gray-800 font-normal text-sm w-full my-1 antialiased">
                                        You
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <div className="flex items-center justify-center gap-3 h-auto mr-2 mt-1 p-2 md:mr-5">
                    {searchType && (
                        <div className="">
                            <button
                                className="w-10 h-10 rounded-full  mr-1 cursor-pointer flex items-center justify-center  text-gray-600"
                                onClick={handleSearch}
                            >
                                <Search size={30} />
                            </button>
                            {isSearchFieldOpen && (
                                <div className="absolute h-screen w-full top-0 left-0 bottom-0 right-0 z-10">
                                    <div className="h-auto w-full transition-all bg-[#ffffff] flex gap-5 items-center md:justify-between md:gap-0 md:mt-2  ">
                                        <button
                                            onClick={() => setIsSearchFieldOpen(false)}
                                            className="flex flex-start ml-5"
                                        >
                                            <ArrowLeft />
                                        </button>
                                        <div className="w-80 h-10 rounded-full border border-gray-200 my-2 flex md:w-150  ">
                                            <input
                                                type="text"
                                                name="query"
                                                placeholder="Search on flux"
                                                className="h-full w-full placeholder:text-gray-500 text-gray-700 pl-4 pr-5 flex flex-start focus:outline-none md:pl-9"
                                                onKeyDown={(e) => {
                                                    if (e.key == "Enter") {
                                                        handleSearch();
                                                    }
                                                }}
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                            />
                                            <div
                                                className="h-10 w-18 rounded-4xl bg-gray-100 flex items-center justify-center flex-end"
                                                onClick={handleSearch}
                                            >
                                                <Search size={20} />
                                            </div>
                                        </div>
                                        <div className="flex gap-1 mr-5">
                                            <div className="hidden md:block lg:block md:mr-3">
                                                <button
                                                    onClick={handleCreatePopup}
                                                    className="w-10 h-10 rounded-full bg-[#0A98FC] hover:bg-[#1E89FE] active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-sm shadow-blue-200 text-white"
                                                    title="Create post"
                                                >
                                                    <svg
                                                        className="w-[18px] h-[18px]"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.6"
                                                        viewBox="0 0 24 24"
                                                        strokeLinecap="round"
                                                    >
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                </button>
                                                {isCrtBtnActive && (
                                                    <CreateComponent handleUpload={handleUpload} />
                                                )}
                                            </div>
                                            {signinInstruction && (
                                                <SignInBanner setShowPopup={setSigninInstruction} />
                                            )}
                                            {
                                                showPopup &&
                                                popup[
                                                popupType
                                                ] /*if show popup is true show the popup with popupType which is defined when one of the options to create is clicked*/
                                            }

                                            {isUserLogged &&
                                                notLoggedOut /*if user is logged in do this else show empty profileIcon*/ ? (
                                                <>
                                                    <div
                                                        className=" flex justify-center relative h-10 w-10 items-center active:scale-95 cursor-pointer"
                                                        onClick={() => {
                                                            isActive ? setIsActive(false) : setIsActive(true);
                                                        }}
                                                    >
                                                        <img
                                                            src={avatar || dpfp}
                                                            onError={(e) => (e.target.src = dpfp)}
                                                            className="h-full w-full rounded-full shadow-sm"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    {isActive && (
                                                        <>
                                                            <motion.div
                                                                className="absolute z-10 top-15 right-10 bg-gray-50  border border-gray-200 h-auto w-75 rounded flex flex-col overflow-hidden pb-1 antialiased"
                                                                initial={{
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    duration: 100
                                                                }}
                                                                exit={{
                                                                    opacity: 0
                                                                }}

                                                            >
                                                                <div className="p-3 h-auto">
                                                                    <div className=" relative flex w-full mb-2">
                                                                        <img
                                                                            src={avatar || dpfp}
                                                                            onError={(e) => (e.target.src = dpfp)}
                                                                            className="h-11 w-11 rounded-full relative mr-3 ml-2 left-0"
                                                                            loading="lazy"
                                                                        />
                                                                        <div className="flex flex-col justify-start ml-2">
                                                                            <span>
                                                                                <div className=" font-medium text-lg text-gray-800 w-auto text-left antialiased">
                                                                                    {fullname}
                                                                                </div>
                                                                                <div className="text-gray-600 font-medium text-base text  w-auto -mt-1 text-left antialiased">
                                                                                    {"@" + username}
                                                                                </div>
                                                                            </span>
                                                                            <div
                                                                                onClick={() => navigate(`/userchannel/${user?.userName}`)}
                                                                                className="text-base font-medium  text-blue-600 text-left cursor-pointer antialiased"
                                                                            >
                                                                                View your channel
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="h-0.5 bg-[#DFDFDF] "></div>
                                                                <div className="p-2.5">
                                                                    <div
                                                                        onClick={handleSignout}
                                                                        className=" flex justify-left items-center pl-5 cursor-pointer"
                                                                    >
                                                                        <LogOutIcon />
                                                                        <span className="ml-3 text-medium font-medium flex antialiased">
                                                                            Logout
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className="w-auto h-9 flex justify-center items-center rounded-full border-2 border-gray-200 pt-5 pb-5 pl-6 pr-7 md:pl-4 lg:pl-2 lg:pr-2 cursor-pointer"
                                                        onClick={() => {
                                                            navigate("/signin");
                                                        }}
                                                    >
                                                        <img
                                                            src={profileIcon}
                                                            className="h-9 rounded-full"
                                                        />
                                                        <div className="text-left pl-1 font-medium  h-auto text-nowrap">
                                                            Sign in
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute h-screen w-full bg-gray-400 opacity-50 md:hidden"></div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="relative">
                        <button
                            onClick={handleCreatePopup}
                            className="w-10 h-10 rounded-full bg-[#0A98FC] hover:bg-[#1E89FE] active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-sm shadow-blue-200 text-white"
                            title="Create post"
                        >
                            <svg
                                className="w-[18px] h-[18px]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.6"
                                viewBox="0 0 24 24"
                                strokeLinecap="round"
                            >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                        {isCrtBtnActive && <CreateComponent handleUpload={handleUpload} />}
                    </div>
                    {signinInstruction && (
                        <SignInBanner setShowPopup={setSigninInstruction} />
                    )}
                    {
                        showPopup &&
                        popup[
                        popupType
                        ] /*if show popup is true show the popup with popupType which is defined when one of the options to create is clicked*/
                    }
                    {isUserLogged &&
                        notLoggedOut /*if user is logged in do this else show empty profileIcon*/ ? (
                        <>
                            <div
                                className=" flex justify-center relative items-center active:scale-95 cursor-pointer"
                                onClick={() => {
                                    isActive ? setIsActive(false) : setIsActive(true);
                                }}
                            >
                                <img
                                    src={avatar || dpfp}
                                    onError={(e) => (e.target.src = dpfp)}
                                    className="h-10 w-10 rounded-full shadow-sm"
                                    loading="lazy"
                                />
                            </div>
                            {isActive && (
                                <>
                                    <div className="absolute z-10 top-15 right-10 bg-gray-50  border border-gray-200 h-auto w-75 rounded flex flex-col overflow-hidden pb-1">
                                        <div className="p-3 h-auto">
                                            <div className=" relative flex w-full mb-2">
                                                <img
                                                    src={avatar || dpfp}
                                                    onError={(e) => (e.target.src = dpfp)}
                                                    className="h-11 w-11 rounded-full relative mr-3 ml-2 left-0"
                                                    loading="lazy"
                                                />
                                                <div className="flex flex-col justify-start ml-2">
                                                    <span>
                                                        <div className=" font-medium text-lg text-gray-800 w-auto text-left">
                                                            {fullname}
                                                        </div>
                                                        <div className="text-gray-600 font-medium text-base text  w-auto -mt-1 text-left">
                                                            {"@" + username}
                                                        </div>
                                                    </span>
                                                    <div
                                                        onClick={() => navigate(`/userchannel/${user?.userName}`)}
                                                        className="text-base font-medium  text-blue-600 text-left cursor-pointer"
                                                    >
                                                        View your channel
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-0.5 bg-[#DFDFDF] "></div>
                                        <div className="p-2.5">
                                            <div
                                                onClick={handleSignout}
                                                className=" flex justify-left items-center pl-5 cursor-pointer"
                                            >
                                                <LogOutIcon size={20} className="text-gray-800" />
                                                <span className="ml-3 text-medium font-medium flex text-gray-800">
                                                    Logout
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div
                                className="w-auto h-9 flex justify-center items-center rounded-3xl border-2 border-gray-200 pt-5 pb-5 pl-2 pr-2 cursor-pointer"
                                onClick={() => {
                                    navigate("/signin");
                                }}
                            >
                                <img src={profileIcon} className="h-9 rounded-full" />
                                <span className="text-l pl-1 font-medium">Sign in</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.nav >
    );
}
