// config.js

export let url: string | undefined;

if (location.hostname === "triviafriends.onrender.com") {
    url = process.env.REACT_APP_BACKEND;
} else {
    url = "10.0.0.197"
}
