setInterval(() => {
    fetch("/add_time", {method: "POST"});
}, 5000);