#!/usr/bin/env node
// tslint:disable:typedef

/**
 * Module dependencies.
 */

import * as  appX from "../app";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as httpolyglot from "httpolyglot";
let app = appX.default;



// since we cannot add an enviroment variable in VSCode we'll just enable it form here

/**
 * Get port from environment and store in Express.
 */

var port: number | string | boolean = normalizePort(process.env.PORT || "3000");
app.set("port", port);



/**
 * Create HTTPS server.
 */
var privateKey = fs.readFileSync(path.join(__dirname, "../cert/key.pem"), "utf8");
var certificate = fs.readFileSync(path.join(__dirname, "../cert/cert.pem"), "utf8");

var credentials: https.ServerOptions = {
    key: privateKey, cert: certificate,
    passphrase: "asdf"
};

let server: https.Server = httpolyglot.createServer(credentials, function (req, res) {
    if (!(<any>req.socket).encrypted) {
        res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
        return res.end();
    }
    app(req, res);
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string): number | boolean | string {
    var port: number = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind: string = typeof port === "string"
        ? "Pipe " + port
        : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
    console.log("Listening on " + bind);
}
