let url: string | undefined;

if (process.env.NODE_ENV === "development") {
  // Set local backend URL
  url = "http://10.0.0.197:3001";
} else {
  // Set production backend URL
  url = process.env.REACT_APP_BACKEND;
}

export { url };