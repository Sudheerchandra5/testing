const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const periodElement = document.getElementById("period");
const dateElement = document.getElementById("date");

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
});

function pad(value) {
    return String(value).padStart(2, "0");
}

function updateClock() {
    const now = new Date();
    const hours24 = now.getHours();
    const hours12 = hours24 % 12 || 12;

    hoursElement.textContent = pad(hours12);
    minutesElement.textContent = pad(now.getMinutes());
    secondsElement.textContent = pad(now.getSeconds());
    periodElement.textContent = hours24 >= 12 ? "PM" : "AM";
    dateElement.textContent = dateFormatter.format(now);
}

updateClock();
setInterval(updateClock, 1000);
