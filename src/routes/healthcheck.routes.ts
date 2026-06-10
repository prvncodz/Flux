import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";

const router: Router = Router();

router.get("/check", healthcheck);

export default router;
