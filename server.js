const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./routes/api");

const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
    console.log("Home Route Hit");
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});