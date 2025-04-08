// export const parseJSONField = (fieldName) => (req, res, next) => {
//     try {
//         if (req.body[fieldName]) {
//             req.body[fieldName] = JSON.parse(req.body[fieldName]);
//         }
//         next();
//     } catch (error) {
//         return res.status(400).json({
//             message: `Invalid JSON format for field: ${fieldName}`,
//             error: error.message,
//         });
//     }
// };
export const parseJSONField = (fields) => (req, res, next) => {
    try {
      // Convert single field to array for uniform processing
      const fieldsToParse = Array.isArray(fields) ? fields : [fields];
  
      fieldsToParse.forEach(field => {
        if (req.body[field]) {
          req.body[field] = JSON.parse(req.body[field]);
        }
      });
  
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: `Invalid JSON format for field(s): ${Array.isArray(fields) ? fields.join(', ') : fields}`,
        errorType: "INVALID_JSON",
        statusCode: 400
      });
    }
  };