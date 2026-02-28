const axios = require("axios");
const config = require("../config/index");
const logger = require("../config/logger");

class MococoService {
    constructor() {
        this.apiKey = config.mococo.apiKey;
        this.apiUrl = config.mococo.apiUrl;

        this.client = axios.create({
            baseURL: this.apiUrl,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
            },
        });
    }

    /**
     * Checks if multiple user IDs have violated Roblox TOS.
     * @param {string[]} userIds 
     * @returns {Promise<Object>}
     */
    async checkUsers(userIds) {
        if (!this.apiKey) {
            throw new Error("Mococo API Key is not configured in .env");
        }

        try {
            const response = await this.client.post("", { userIds });
            return response.data;
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                logger.error(`Mococo API Error (${status}): ${JSON.stringify(data)}`);

                return {
                    success: false,
                    status,
                    message: data.message || "Unknown API error",
                };
            } else if (error.request) {
                logger.error(`Mococo API No Response: ${error.message}`);
                return { success: false, message: "No response from Mococo API" };
            } else {
                logger.error(`Mococo API Request Setup Error: ${error.message}`);
                return { success: false, message: error.message };
            }
        }
    }
}

module.exports = new MococoService();
