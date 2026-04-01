import express from "express";
import { submitContact, getAllContacts, deleteContact } from "../controllers/contactControllers.js";
import { protect } from "../middleware/auth.js";

const contactRouter = express.Router();

contactRouter.post("/contact", submitContact);
contactRouter.get("/contacts", protect, getAllContacts);
contactRouter.delete("/contact/:id", protect, deleteContact);

export default contactRouter;