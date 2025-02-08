const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

console.log("Backend URL:", API_BASE_URL); // Debugging line

export const getWeather = async (location, startDate, endDate) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/weather?location=${location}&startDate=${startDate}&endDate=${endDate}`
        );

        console.log("Raw response:", response); // Log response object

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        return null;
    }
};

export const saveWeather = async (location, startDate, endDate, data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/weather`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ location, startDate, endDate, data }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error saving weather:", error);
        return null;
    }
};

export const fetchSavedWeather = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/saved-weather`);
        return await response.json();
    } catch (error) {
        console.error("Error retrieving saved weather:", error);
        return [];
    }
};

export const deleteWeather = async (id) => {
    try {
        await fetch(`${API_BASE_URL}/weather/${id}`, { method: "DELETE" });
        return true;
    } catch (error) {
        console.error("Error deleting weather:", error);
        return false;
    }
};

export const updateWeather = async (id, location, startDate, endDate, data) => {
    try {
        await fetch(`${API_BASE_URL}/weather/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ location, startDate, endDate, data }),
        });
        return true;
    } catch (error) {
        console.error("Error updating weather:", error);
        return false;
    }
};
