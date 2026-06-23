import express from "express";
import { submitContact, getAllContacts, deleteContact } from "../controllers/contactControllers.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateContact } from "../middleware/validate.js";

const contactRouter = express.Router();

contactRouter.post("/contact", validateContact, submitContact);
contactRouter.get("/contacts", protect, authorize('dieteticien', 'admin'), getAllContacts);
contactRouter.delete("/contact/:id", protect, authorize('dieteticien', 'admin'), deleteContact);

export default contactRouter;