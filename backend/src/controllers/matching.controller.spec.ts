import { calcularDistanciaHaversine } from './matching.controller';

describe('Motor de Matching - Cálculo Geodésico (Fórmula de Haversine)', () => {
  // Coordenadas de referencia en Argentina
  const BUENOS_AIRES = { lat: -34.6037, lng: -58.3816 };
  const ROSARIO = { lat: -32.9468, lng: -60.6393 };
  const CORDOBA = { lat: -31.4201, lng: -64.1888 };
  const SANTA_FE = { lat: -31.6107, lng: -60.6973 };

  describe('Cálculo de distancias entre ubicaciones reales', () => {
    it('debe calcular la distancia geodésica correcta entre Buenos Aires y Rosario (~278-280 km)', () => {
      const distancia = calcularDistanciaHaversine(
        BUENOS_AIRES.lat,
        BUENOS_AIRES.lng,
        ROSARIO.lat,
        ROSARIO.lng
      );

      // La distancia ortodrómica real en línea recta es ~278.6 km
      expect(distancia).toBeGreaterThan(275);
      expect(distancia).toBeLessThan(282);
      expect(distancia).toBeCloseTo(278.6, 0);
    });

    it('debe calcular la distancia correcta entre Rosario y Córdoba (~374-375 km)', () => {
      const distancia = calcularDistanciaHaversine(
        ROSARIO.lat,
        ROSARIO.lng,
        CORDOBA.lat,
        CORDOBA.lng
      );

      expect(distancia).toBeGreaterThan(370);
      expect(distancia).toBeLessThan(380);
      expect(distancia).toBeCloseTo(374.7, 0);
    });

    it('debe calcular la distancia correcta entre Rosario y Santa Fe (~148-150 km)', () => {
      const distancia = calcularDistanciaHaversine(
        ROSARIO.lat,
        ROSARIO.lng,
        SANTA_FE.lat,
        SANTA_FE.lng
      );

      expect(distancia).toBeGreaterThan(145);
      expect(distancia).toBeLessThan(152);
    });
  });

  describe('Propiedades matemáticas del cálculo', () => {
    it('debe retornar 0 km cuando el origen y el destino son el mismo punto', () => {
      const distancia = calcularDistanciaHaversine(
        ROSARIO.lat,
        ROSARIO.lng,
        ROSARIO.lat,
        ROSARIO.lng
      );

      expect(distancia).toBe(0);
    });

    it('debe cumplir la propiedad simétrica d(A, B) === d(B, A)', () => {
      const distAB = calcularDistanciaHaversine(
        BUENOS_AIRES.lat,
        BUENOS_AIRES.lng,
        CORDOBA.lat,
        CORDOBA.lng
      );
      const distBA = calcularDistanciaHaversine(
        CORDOBA.lat,
        CORDOBA.lng,
        BUENOS_AIRES.lat,
        BUENOS_AIRES.lng
      );

      expect(distAB).toBe(distBA);
    });

    it('debe calcular distancias en cuadrantes con cruce del Ecuador y del meridiano cero', () => {
      // Madrid (Norte / Oeste) a Londres (Norte / Oeste)
      const madrid = { lat: 40.4168, lng: -3.7038 };
      const londres = { lat: 51.5074, lng: -0.1278 };

      const distancia = calcularDistanciaHaversine(madrid.lat, madrid.lng, londres.lat, londres.lng);
      // Distancia aproximada Madrid - Londres: ~1264 km
      expect(distancia).toBeGreaterThan(1250);
      expect(distancia).toBeLessThan(1280);
    });

    it('debe calcular la distancia entre antípodas (mitad de la circunferencia terrestre ~20015 km)', () => {
      // Punto en el Ecuador (0, 0) y su antípoda en (0, 180)
      const distancia = calcularDistanciaHaversine(0, 0, 0, 180);
      // pi * 6371 = ~20015 km
      expect(distancia).toBeCloseTo(20015, -1);
    });
  });

  describe('Validaciones y control de errores en entradas', () => {
    it('debe lanzar un Error ante valores NaN', () => {
      expect(() => {
        calcularDistanciaHaversine(NaN, -60.0, -32.0, -60.0);
      }).toThrow('Coordenadas geográficas inválidas para el cálculo de Haversine');
    });

    it('debe lanzar un Error ante valores null o undefined', () => {
      expect(() => {
        // @ts-expect-error probando robustez ante llamada inválida
        calcularDistanciaHaversine(null, -60.0, -32.0, -60.0);
      }).toThrow('Coordenadas geográficas inválidas para el cálculo de Haversine');

      expect(() => {
        // @ts-expect-error probando robustez ante llamada inválida
        calcularDistanciaHaversine(-32.0, undefined, -32.0, -60.0);
      }).toThrow('Coordenadas geográficas inválidas para el cálculo de Haversine');
    });
  });
});
