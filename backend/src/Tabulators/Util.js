
// Format a Timestamp value into a compact string for display;
function formatTimestamp(value) {
    const d = new Date(Date.parse(value));
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const year = d.getFullYear();
    const currentYear = new Date().getFullYear();
    const hour = d.getHours();
    const minute = d.getMinutes();
  
    const fullDate =
      year === currentYear
        ? `${month}/${date}`
        : year >= 2000 && year < 2100
        ? `${month}/${date}/${year - 2000}`
        : `${month}/${date}/${year}`;
  
    const timeStamp = `${fullDate} ${hour}:${minute}`;
    return timeStamp;
  }

  function position(number) {
    const numberString = Number(number).toFixed(0).toString();
    const lastDigit = numberString.substr(-1);
    const suffix =
      lastDigit === "1"
        ? "st"
        : lastDigit === "2"
        ? "nd"
        : lastDigit === "3"
        ? "rd"
        : "th";
    return `${numberString}${suffix}`;
  }