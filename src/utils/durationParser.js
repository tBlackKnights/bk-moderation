/**
 * Parses a duration string (e.g. 1d, 2h, 30m) into milliseconds.
 * @param {string} durationStr 
 * @returns {number|null}
 */
function parseDuration(durationStr) {
    if (!durationStr) return null;

    const regex = /^(\d+)([smhd])$/;
    const match = durationStr.match(regex);

    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return value * multipliers[unit];
}

module.exports = { parseDuration };
