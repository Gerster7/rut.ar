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
exports.Negocio = void 0;
var sequelize_typescript_1 = require("sequelize-typescript");
var usuario_model_1 = require("./usuario.model");
var viaje_model_1 = require("./viaje.model");
var Negocio = /** @class */ (function (_super) {
    __extends(Negocio, _super);
    function Negocio() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, sequelize_typescript_1.ForeignKey)(function () { return usuario_model_1.Usuario; }),
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.INTEGER,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], Negocio.prototype, "usuarioId", void 0);
    __decorate([
        (0, sequelize_typescript_1.BelongsTo)(function () { return usuario_model_1.Usuario; }),
        __metadata("design:type", usuario_model_1.Usuario)
    ], Negocio.prototype, "usuario", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], Negocio.prototype, "descripcion", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], Negocio.prototype, "tipoCarga", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false,
            defaultValue: 'abierto'
        }),
        __metadata("design:type", String)
    ], Negocio.prototype, "estado", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.FLOAT,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], Negocio.prototype, "origenLat", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.FLOAT,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], Negocio.prototype, "origenLng", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.FLOAT,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], Negocio.prototype, "destinoLat", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.FLOAT,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], Negocio.prototype, "destinoLng", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.FLOAT,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], Negocio.prototype, "pesoTotal", void 0);
    __decorate([
        (0, sequelize_typescript_1.HasMany)(function () { return viaje_model_1.Viaje; }),
        __metadata("design:type", Array)
    ], Negocio.prototype, "viajes", void 0);
    Negocio = __decorate([
        (0, sequelize_typescript_1.Table)({ tableName: 'negocios', timestamps: true })
    ], Negocio);
    return Negocio;
}(sequelize_typescript_1.Model));
exports.Negocio = Negocio;
