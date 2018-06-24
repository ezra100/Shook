
declare module "httpolyglot" {
    import * as https from "https";
    import * as http from "http";
    export function createServer(options: https.ServerOptions, requestListener?: (req: http.IncomingMessage, res: http.ServerResponse) => void): https.Server;
    export function createServer(requestListener?: (req: http.IncomingMessage, res: http.ServerResponse) => void): http.Server;
}