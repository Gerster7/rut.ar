"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbModels = void 0;
__exportStar(require("./usuario.model"), exports);
__exportStar(require("./fletero.model"), exports);
__exportStar(require("./negocio.model"), exports);
__exportStar(require("./viaje.model"), exports);
var usuario_model_1 = require("./usuario.model");
var fletero_model_1 = require("./fletero.model");
var negocio_model_1 = require("./negocio.model");
var viaje_model_1 = require("./viaje.model");
exports.dbModels = [usuario_model_1.Usuario, fletero_model_1.Fletero, negocio_model_1.Negocio, viaje_model_1.Viaje];
