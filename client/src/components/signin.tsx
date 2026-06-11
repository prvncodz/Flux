import { useState, useEvent, useRef, useContext } from "react";
import axios from "../api/axios.js";
import SubmitButton from "./submitButton.jsx";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/user.store.js";

export default function SignIn() {
  const [loading, SetLoading] = useState(false);
  const [error, SetError] = useState(false);
  const [isSubmmited, setIsSubmmited] = useState(false);
  const [firstInputField, setFirstInputField] = useState("");
  const navigate = new useNavigate();
  const  setUser = useUserStore(s=>s.setUser);
  const  setIsUserLogged = useUserStore(s=>s.setIsUserLogged);

  async function handleFormSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const Data = Object.fromEntries(formData);
    SetLoading(true);
    try {
      const res = await axios.post("/user/login", Data);
      if (res.status == 200) {
        navigate("/");
        setUser(res.data?.data?.user);
        setIsUserLogged(true);
        setIsSubmmited(true);
        e.target.reset();
      }
    } catch (error) {
      SetError(true);
      e.target.reset();
    } finally {
      SetLoading(false);
    }
    e.target.reset();
    setFirstInputField("");
    setTimeout(() => {
      setIsSubmmited(false);
    }, 2000);
  }

  return (
    <div
      id="signin-bg"
      className="h-screen w-screen flex flex-col justify-center
		items-center bg-gray-200"
    >
      <div
        id="signin-card"
        className="h-auto w-87 bg-gray-100 flex flex-col
			justify-center overflow-hidden rounded-xl md:w-100 md:p-5"
      >
        <h1 className="mt-5 text-3xl font-bold text-[#0A98FC] relative text-center">
          Sign In
        </h1>

        <form className="p-7" onSubmit={handleFormSubmission}>
          <div
            className="form-inputs mt-4 mb-5  h-auto w-full relative
			text-left"
          >
            <label className="text-md font-medium text-gray-700">
              Username or Email address
              <input
                type="text"
                value={firstInputField}
                onChange={(e) => setFirstInputField(e.target.value)}
                name={firstInputField.includes("@") ? "email" : "userName"}
                className="bg-gray-100 w-full
			mb-4 rounded-md p-1 border
			border-gray-200 shadow-xs mt-1"
                required
              />
            </label>
            <label className="text-md font-medium text-gray-700">
              Password
              <input
                name="password"
                type="password"
                className="bg-gray-100 w-full mb-4 rounded-md p-1 border
			border-gray-200 shadow-xs mt-1 "
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
          <p className="mt-2 text-center md:mt-5">
            Don't have an account?
            <span
              onClick={() => {
                navigate("/signup");
              }}
              className="cursor-pointer text-blue-400 decoration-blue-400 underline"
            >
              {" "}
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
