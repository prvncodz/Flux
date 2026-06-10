import dbConn from "./db/index.ts";
import app from "./app.ts";

dbConn
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`app is running at: http://localhost:${process.env.PORT}`);
        });
    })

    .catch((err) => {
        console.log(`mongodb connection failed !!!,error: ${err}`);
    });
