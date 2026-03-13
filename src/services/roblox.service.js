const axios = require("axios");
const config = require("../config/index");

class RobloxService {
  /**
   * Resolves a Roblox username to a User ID.
   * @param {string} username The Roblox username
   * @returns {Promise<number>} The Roblox User ID
   * @throws Error if user not found
   */
  async getUserIdFromUsername(username) {
    const url = "https://users.roblox.com/v1/usernames/users";
    try {
      const response = await axios.post(url, {
        usernames: [username],
        excludeBannedUsers: true,
      });

      const users = response.data.data;
      if (!users || users.length === 0) {
        throw new Error(`User '${username}' not found on Roblox.`);
      }

      return users[0].id;
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to resolve username: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Accepts a user's join request to the configured Roblox group using Open Cloud.
   * @param {string|number} userId The Roblox User ID
   * @param {Object} credentials Optional credentials { apiKey, groupId }
   * @returns {Promise<Object>} API response data
   */
  async acceptJoinRequest(userId, credentials = {}) {
    const apiKey = credentials.apiKey
    const groupId = credentials.groupId

    if (!apiKey || !groupId) {
      throw new Error("Roblox credentials are not configured for this guild. Use /setup roblox.");
    }

    // Open Cloud V2 endpoint for accepting group join request
    const url = `https://apis.roblox.com/cloud/v2/groups/${groupId}/join-requests/${userId}:accept`;

    try {
      const response = await axios.post(
        url,
        {}, // Empty body
        {
          headers: {
            "x-api-key": apiKey,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Roblox Open Cloud API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

module.exports = new RobloxService();
