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
exports.Usuario = void 0;
var sequelize_typescript_1 = require("sequelize-typescript");
var fletero_model_1 = require("./fletero.model");
var negocio_model_1 = require("./negocio.model");
var Usuario = /** @class */ (function (_super) {
    __extends(Usuario, _super);
    function Usuario() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false,
            unique: true
        }),
        __metadata("design:type", String)
    ], Usuario.prototype, "email", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], Usuario.prototype, "password", void 0);
    __decorate([
        (0, sequelize_typescript_1.Column)({
            type: sequelize_typescript_1.DataType.STRING,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], Usuario.prototype, "rol", void 0);
    __decorate([
        (0, sequelize_typescript_1.HasOne)(function () { return fletero_model_1.Fletero; }),
        __metadata("design:type", fletero_model_1.Fletero)
    ], Usuario.prototype, "fletero", void 0);
    __decorate([
        (0, sequelize_typescript_1.HasMany)(function () { return negocio_model_1.Negocio; }),
        __metadata("design:type", Array)
    ], Usuario.prototype, "negocios", void 0);
    Usuario = __decorate([
        (0, sequelize_typescript_1.Table)({ tableName: 'usuarios', timestamps: true })
    ], Usuario);
    return Usuario;
}(sequelize_typescript_1.Model));
exports.Usuario = Usuario;
