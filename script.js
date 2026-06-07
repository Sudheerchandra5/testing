const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const periodElement = document.getElementById("period");
const dateElement = document.getElementById("date");
const locationElement = document.getElementById("location");
const countrySelect = document.getElementById("country-select");
const timezoneSelect = document.getElementById("timezone-select");

const COUNTRIES = {
    IN: {
        name: "India",
        zones: [
            { value: "Asia/Kolkata", label: "India Standard Time - Kolkata" },
        ],
    },
    US: {
        name: "United States",
        zones: [
            { value: "America/New_York", label: "Eastern Time - New York" },
            { value: "America/Chicago", label: "Central Time - Chicago" },
            { value: "America/Denver", label: "Mountain Time - Denver" },
            { value: "America/Phoenix", label: "Mountain Time, no DST - Phoenix" },
            { value: "America/Los_Angeles", label: "Pacific Time - Los Angeles" },
            { value: "America/Anchorage", label: "Alaska Time - Anchorage" },
            { value: "America/Adak", label: "Hawaii-Aleutian Time - Adak" },
            { value: "Pacific/Honolulu", label: "Hawaii Time - Honolulu" },
        ],
    },
    GB: {
        name: "United Kingdom",
        zones: [
            { value: "Europe/London", label: "United Kingdom Time - London" },
        ],
    },
    AE: {
        name: "United Arab Emirates",
        zones: [
            { value: "Asia/Dubai", label: "Gulf Standard Time - Dubai" },
        ],
    },
    SG: {
        name: "Singapore",
        zones: [
            { value: "Asia/Singapore", label: "Singapore Standard Time" },
        ],
    },
    JP: {
        name: "Japan",
        zones: [
            { value: "Asia/Tokyo", label: "Japan Standard Time - Tokyo" },
        ],
    },
    AU: {
        name: "Australia",
        zones: [
            { value: "Australia/Lord_Howe", label: "Lord Howe Time" },
            { value: "Australia/Sydney", label: "Eastern Time - Sydney" },
            { value: "Australia/Brisbane", label: "Eastern Time, no DST - Brisbane" },
            { value: "Australia/Hobart", label: "Eastern Time - Hobart" },
            { value: "Australia/Adelaide", label: "Central Time - Adelaide" },
            { value: "Australia/Darwin", label: "Central Time, no DST - Darwin" },
            { value: "Australia/Perth", label: "Western Time - Perth" },
            { value: "Australia/Eucla", label: "Central Western Time - Eucla" },
            { value: "Antarctica/Macquarie", label: "Macquarie Island Time" },
        ],
    },
    DE: {
        name: "Germany",
        zones: [
            { value: "Europe/Berlin", label: "Central European Time - Berlin" },
            { value: "Europe/Busingen", label: "Central European Time - Busingen" },
        ],
    },
    FR: {
        name: "France",
        zones: [
            { value: "Europe/Paris", label: "Central European Time - Paris" },
            { value: "America/Cayenne", label: "French Guiana Time - Cayenne" },
            { value: "America/Guadeloupe", label: "Guadeloupe Time" },
            { value: "America/Martinique", label: "Martinique Time" },
            { value: "America/Miquelon", label: "Saint Pierre and Miquelon Time" },
            { value: "Indian/Reunion", label: "Reunion Time" },
            { value: "Indian/Mayotte", label: "Mayotte Time" },
            { value: "Pacific/Gambier", label: "Gambier Islands Time" },
            { value: "Pacific/Marquesas", label: "Marquesas Islands Time" },
            { value: "Pacific/Tahiti", label: "Tahiti Time" },
            { value: "Pacific/Noumea", label: "New Caledonia Time" },
            { value: "Pacific/Wallis", label: "Wallis and Futuna Time" },
        ],
    },
    CA: {
        name: "Canada",
        zones: [
            { value: "America/St_Johns", label: "Newfoundland Time - St. John's" },
            { value: "America/Halifax", label: "Atlantic Time - Halifax" },
            { value: "America/Blanc-Sablon", label: "Atlantic Time, no DST - Blanc-Sablon" },
            { value: "America/Toronto", label: "Eastern Time - Toronto" },
            { value: "America/Atikokan", label: "Eastern Time, no DST - Atikokan" },
            { value: "America/Winnipeg", label: "Central Time - Winnipeg" },
            { value: "America/Regina", label: "Central Time, no DST - Regina" },
            { value: "America/Edmonton", label: "Mountain Time - Edmonton" },
            { value: "America/Dawson_Creek", label: "Mountain Time, no DST - Dawson Creek" },
            { value: "America/Fort_Nelson", label: "Mountain Time, no DST - Fort Nelson" },
            { value: "America/Vancouver", label: "Pacific Time - Vancouver" },
            { value: "America/Whitehorse", label: "Yukon Time - Whitehorse" },
        ],
    },
    MX: {
        name: "Mexico",
        zones: [
            { value: "America/Cancun", label: "Eastern Time - Cancun" },
            { value: "America/Mexico_City", label: "Central Time - Mexico City" },
            { value: "America/Monterrey", label: "Central Time - Monterrey" },
            { value: "America/Matamoros", label: "Central Time - Matamoros" },
            { value: "America/Chihuahua", label: "Mountain Time - Chihuahua" },
            { value: "America/Ojinaga", label: "Mountain Time - Ojinaga" },
            { value: "America/Mazatlan", label: "Mountain Time - Mazatlan" },
            { value: "America/Hermosillo", label: "Mountain Time, no DST - Hermosillo" },
            { value: "America/Tijuana", label: "Pacific Time - Tijuana" },
            { value: "America/Bahia_Banderas", label: "Bahia Banderas Time" },
        ],
    },
    BR: {
        name: "Brazil",
        zones: [
            { value: "America/Noronha", label: "Fernando de Noronha Time" },
            { value: "America/Belem", label: "Brasilia Time - Belem" },
            { value: "America/Fortaleza", label: "Brasilia Time - Fortaleza" },
            { value: "America/Recife", label: "Brasilia Time - Recife" },
            { value: "America/Araguaina", label: "Brasilia Time - Araguaina" },
            { value: "America/Maceio", label: "Brasilia Time - Maceio" },
            { value: "America/Bahia", label: "Brasilia Time - Bahia" },
            { value: "America/Sao_Paulo", label: "Brasilia Time - Sao Paulo" },
            { value: "America/Campo_Grande", label: "Amazon Time - Campo Grande" },
            { value: "America/Cuiaba", label: "Amazon Time - Cuiaba" },
            { value: "America/Manaus", label: "Amazon Time - Manaus" },
            { value: "America/Porto_Velho", label: "Amazon Time - Porto Velho" },
            { value: "America/Boa_Vista", label: "Amazon Time - Boa Vista" },
            { value: "America/Rio_Branco", label: "Acre Time - Rio Branco" },
            { value: "America/Eirunepe", label: "Acre Time - Eirunepe" },
            { value: "America/Santarem", label: "Santarem Time" },
        ],
    },
    ZA: {
        name: "South Africa",
        zones: [
            { value: "Africa/Johannesburg", label: "South Africa Standard Time - Johannesburg" },
        ],
    },
    CN: {
        name: "China",
        zones: [
            { value: "Asia/Shanghai", label: "China Standard Time - Shanghai" },
            { value: "Asia/Urumqi", label: "Xinjiang Time - Urumqi" },
        ],
    },
};

function populateTimeZones() {
    const country = COUNTRIES[countrySelect.value];
    timezoneSelect.replaceChildren();

    country.zones.forEach((zone) => {
        const option = document.createElement("option");
        option.value = zone.value;
        option.textContent = zone.label;
        timezoneSelect.append(option);
    });
}

function getSelectedLocation() {
    const country = COUNTRIES[countrySelect.value];
    const zone = timezoneSelect.selectedOptions[0];
    return `${country.name} - ${zone.textContent}`;
}

function updateClock() {
    const now = new Date();
    const timeZone = timezoneSelect.value;
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

countrySelect.addEventListener("change", () => {
    populateTimeZones();
    updateClock();
});
timezoneSelect.addEventListener("change", updateClock);
populateTimeZones();
updateClock();
setInterval(updateClock, 1000);
