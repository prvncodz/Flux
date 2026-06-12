import { useState, useEffect } from "react";
import Nav from "./nav";
import Feed from "./videofeed/feed";
import TweetFeed from "./tweetfeed/tweetFeed";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react"

export default function Home() {

    const location = useLocation();
    const [isHomeSelected, setIsHomeSelected] = useState<boolean>(true);
    const { tab } = (location.state as { tab?: string }) || {};

    useEffect(() => {
        if (tab === "posts") {
            setIsHomeSelected(false);
        } else {
            setIsHomeSelected(true);
        }
    }, [tab]);
    return (
        <motion.div
            className="relative z-0 flex items-center flex-col h-screen w-screen top-0 left-0 "
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
            {isHomeSelected ? (
                <>
                    <Nav searchType={"video"} />
                    <div className="block">
                        <Feed
                            className="relative z-0"
                            fetchType="all"
                            recommendations={false}
                        />
                    </div>
                </>
            ) : (
                <>
                    <Nav searchType={"post"} />
                    <TweetFeed className="relative z-0" />
                </>
            )}
        </motion.div>
    );
}
