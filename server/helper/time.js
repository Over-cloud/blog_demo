function getTodayUTC() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
}

module.exports = getTodayUTC;