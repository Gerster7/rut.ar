"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fletero = void 0;
var sequelize_typescript_1 = require("sequelize-typescript");
var usuario_model_1 = require("./usuario.model");
var viaje_model_1 = require("./viaje.model");
var Fletero = /** @class */ (function (_super) {
    __extends(Fletero, _super);
    function Fletero() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, sequelize_typescript_1.ForeignKey)(function () { return usuario_model_1.Usuario; }),
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.INTEGER,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], Fletero.prototype, "usuarioId", void 0);
    __decorate([
        (0, sequelize_typescript_1.BelongsTo)(function () { return usuario_model_1.Usuario; }),
        __metadata("design:type", usuario_model_1.Usuario)
    ], Fletero.prototype, "usuario", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], Fletero.prototype, "nombre", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], Fletero.prototype, "telefono", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], Fletero.prototype, "vehiculo", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], Fletero.prototype, "patenteVehiculo", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.FLOAT,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], Fletero.prototype, "capacidadVehiculo", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.FLOAT,
            allowNull: true
        }),
        __metadata("design:type", Number)
    ], Fletero.prototype, "latitudActual", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.FLOAT,
            allowNull: true
        }),
        __metadata("design:type", Number)
    ], Fletero.prototype, "longitudActual", void 0);
    __decorate([
        (0, sequelize_typescript_1.HasMany)(function () { return viaje_model_1.Viaje; }),
        __metadata("design:type", Array)
    ], Fletero.prototype, "viajes", void 0);
    Fletero = __decorate([
        (0, sequelize_typescript_1.Table)({ tableName: 'fleteros', timestamps: true })
    ], Fletero);
    return Fletero;
}(sequelize_typescript_1.Model));
exports.Fletero = Fletero;
