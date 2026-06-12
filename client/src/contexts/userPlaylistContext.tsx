import { createContext } from "react";

const userPlaylistcontext = createContext<{ owner: string | null }>({ owner: null });

export default userPlaylistcontext;
