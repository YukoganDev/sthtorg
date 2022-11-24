"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_io_1 = require("socket.io");
const config_1 = require("./config");
const index_1 = require("./routes/index");
const learn_1 = require("./routes/learn");
const login_1 = require("./routes/login");
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
// View engine
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
// Initialization
app.use((0, express_session_1.default)({
    secret: config_1.config.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// Routers
app.use("/", index_1.router);
app.use("/learn", learn_1.router);
app.use("/login", login_1.router);
// WebSockets
io.on('connect', (socket) => {
    console.log(socket.id + ' connected');
});
// Error handling
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404));
});
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    let status = err.status || 500;
    res.status(status);
    res.send("Error: " + status);
});
server.listen(config_1.config.PORT, () => {
    console.log(`Server running on port ${config_1.config.PORT}`);
});
