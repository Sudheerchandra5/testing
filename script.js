const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const periodElement = document.getElementById("period");
const dateElement = document.getElementById("date");
const locationElement = document.getElementById("location");
const countrySelect = document.getElementById("country-select");

function getSelectedLocation() {
    return countrySelect.selectedOptions[0].dataset.location;
}

function updateClock() {
    const now = new Date();
    const timeZone = countrySelect.value;
    const timeFormatter = new Intl.DateTimeFormat(undefined, {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    const dateFormatter = new Intl.DateTimeFormat(undefined, {
        timeZone,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const timeParts = Object.fromEntries(
        timeFormatter.formatToParts(now).map((part) => [part.type, part.value])
    );

    hoursElement.textContent = timeParts.hour;
    minutesElement.textContent = timeParts.minute;
    secondsElement.textContent = timeParts.second;
    periodElement.textContent = timeParts.dayPeriod;
    dateElement.textContent = dateFormatter.format(now);
    locationElement.textContent = getSelectedLocation();
}

countrySelect.addEventListener("change", updateClock);
updateClock();
setInterval(updateClock, 1000);
