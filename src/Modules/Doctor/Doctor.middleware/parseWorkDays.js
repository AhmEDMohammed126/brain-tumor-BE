// Middleware to parse workDays if it's a string
export const parseWorkDays = (req, res, next) => {
    const { workDays } = req.body;
  
    if (workDays && typeof workDays === 'string') {
        req.body.workDays = JSON.parse(workDays);  // Parse the string into an array of objects
    }
    next();
};