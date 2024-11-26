export const parseJSONField = (fieldName) => (req, res, next) => {
    try {
        if (req.body[fieldName]) {
            req.body[fieldName] = JSON.parse(req.body[fieldName]);
        }
        next();
    } catch (error) {
        return res.status(400).json({
            message: `Invalid JSON format for field: ${fieldName}`,
            error: error.message,
        });
    }
};