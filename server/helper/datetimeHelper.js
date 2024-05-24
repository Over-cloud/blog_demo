function getTodayUTC() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
}

function formatDateAsUTCString(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

module.exports = {
    getTodayUTC,
    formatDateAsUTCString,
}