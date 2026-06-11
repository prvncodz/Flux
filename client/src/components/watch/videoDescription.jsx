import { useState, useEffect, useRef } from "react";

export default function VideoDescription({
  content,
  views,
  uploadTime,
  showVideoDetails,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeOfUpload, setTimeOfUpload] = useState(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const e = ref.current;
    if (e) {
      setIsOverflowing(
        e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth,
      );
    }

    function calcTimeOfUpload(t) {
      if (!t) return;
      const now = new Date();
      const dif = now.getTime() - new Date(t).getTime();
      const hours = Math.floor(dif / (1000 * 60 * 60));
      const minutes = Math.floor((dif / 1000) * 60);
      const days = Math.floor(dif / (1000 * 60 * 60 * 24));
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
      const seconds = Math.floor(dif / 1000);

      if (years > 0) {
        setTimeOfUpload(`${years} ${years > 1 ? "years" : "year"}`);
      } else if (months > 0) {
        setTimeOfUpload(`${months} ${months > 1 ? "months" : "month"}`);
      } else if (days > 0) {
        setTimeOfUpload(`${days} ${days > 1 ? "days" : "day"}`);
      } else if (hours > 0) {
        setTimeOfUpload(`${hours} ${hours > 1 ? "hours" : "hour"}`);
      } else if (minutes > 0) {
        setTimeOfUpload(`${minutes} ${minutes > 1 ? "minutes" : "minute"}`);
      } else {
        setTimeOfUpload(`${seconds} ${seconds > 1 ? "seconds" : "second"}`);
      }
    }
    calcTimeOfUpload(uploadTime);
  }, [content, uploadTime]);

  return (
    <>
      <div
        className={`${isOpen ? "h-auto" : "h-20"} bg-neutral-50 rounded-2xl px-4 py-3 text-wrap text-body mx-2 my-1 mb-1 relative flex flex-col text-left`}
      >
        {showVideoDetails && (
          <div className="flex gap-1">
            <p className="text-sm font-semibold text-gray-700">
              {views + " views"} · {timeOfUpload + " ago"}
            </p>
          </div>
        )}
        <div
          className={`my-2 text-sm h-auto w-full ${isOpen ? "break-all" : "overflow-hidden"} text-gray-700`}
          ref={ref}
        >
          {content || "This video does not contains any description"}
        </div>

        {isOpen ? (
          <p
            className="text-gray-800 font-base text-body bottom-1 left-4 bg-neutral-50 bg-blend-color-burn z-1"
            onClick={() => setIsOpen(false)}
          >
            Show less
          </p>
        ) : (
          <>
            {isOverflowing && (
              <>
                <p
                  className="text-gray-800 font-base text-sm absolute bottom-5 mr-auto right-3 bg-neutral-50 bg-blend-color-burn z-2"
                  onClick={() => setIsOpen(true)}
                >
                  ..Show more
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-2 backdrop-blur-xs z-1" />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
