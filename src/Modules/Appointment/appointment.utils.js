export const increaseTime = (timeString, hoursToAdd) => {
    let [time, period] = timeString.split(" "); // Split "7:30 AM" → ["7:30", "AM"]
    let [hours, minutes] = time.split(":").map(Number); // Convert "7:30" → [7, 30]

    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    // Convert to total minutes and add extra time
    let totalMinutes = hours * 60 + minutes + hoursToAdd * 60;
    
    // Convert back to hours and minutes
    let newHours = Math.floor(totalMinutes / 60) % 24;
    let newMinutes = totalMinutes % 60;

    // Determine new AM/PM period
    let newPeriod = newHours >= 12 ? "PM" : "AM";

    // Convert back to 12-hour format
    newHours = newHours % 12 || 12; // Ensure 12-hour format (0 should be 12)

    // Format as "HH:MM AM/PM"
    return `${newHours}:${newMinutes.toString().padStart(2, "0")} ${newPeriod}`;
};