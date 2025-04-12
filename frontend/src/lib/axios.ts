// axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", 
  withCredentials: true, // ⭐️ this allows cookies to be sent automatically
});

export default api;
