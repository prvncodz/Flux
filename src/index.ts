import dbConn from "./db/index";
import app from "./app";

dbConn
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`app is running at: http://localhost:${process.env.PORT}`);
        });
    })

    .catch((err) => {
        console.log(`mongodb connection failed !!!,error: ${err}`);
    });
