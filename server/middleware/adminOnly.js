
export const adminOnly = (req, res, next) => {
    
    if (req.user && req.user.role === "Admin") {
        next(); 
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admins only."
        });
    }
};
