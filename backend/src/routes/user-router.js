import express from "express";
import controller from "./controllers/user-controller.js";

const router = express.Router();

router.post('/login', controller.login);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", controller.create);
router.post("/login", controller.login);
router.put("/:id", controller.editOne);
router.delete("/:id", controller.deleteOne);

export default router;