import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller";

const router: Router = Router();

router.get("/check", healthcheck);

export default router;
