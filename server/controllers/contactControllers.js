import Contact from "../models/Contact.js";

export const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        const contact = await Contact.create({ 
            name, 
            email, 
            subject, 
            message 
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            contact: { id: contact._id, name: contact.name, email: contact.email, subject: contact.subject }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error submitting message" });
    }
};

export const getAllContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [contacts, total] = await Promise.all([
            Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Contact.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            count: contacts.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            contacts,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching messages",
        });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ 
                success: false, 
                message: "Message not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting message",
        });
    }
};