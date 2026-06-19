import express from "express";
import { submitContact, getAllContacts, deleteContact } from "../controllers/contactControllers.js";
import { protect } from "../middleware/auth.js";
import { validateContact } from "../middleware/validate.js";

const contactRouter = express.Router();

contactRouter.post("/contact", validateContact, submitContact);
contactRouter.get("/contacts", protect, getAllContacts);
contactRouter.delete("/contact/:id", protect, deleteContact);

export default contactRouter;