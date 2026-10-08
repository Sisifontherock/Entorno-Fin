# Option Lab

Juego educativo en español de reconocimiento y construcción de estrategias de opciones. Es una aplicación estática, sin dependencias, cuentas, credenciales ni órdenes reales. El bot existente es independiente.

## Jugar

Desde `game/`, ejecuta `npm start` (requiere Python 3) y abre el puerto 8080 en tu entorno de desarrollo. También puedes usar cualquier servidor de archivos estáticos. Abre `index.html` a través del servidor, no con `file://`, porque utiliza módulos de JavaScript.

1. Selecciona un nivel y reconoce la curva de beneficio/pérdida al vencimiento.
2. Elige comprar o vender, y la cantidad, para cada pata.
3. Consulta la solución, las primas, el riesgo y la explicación.
4. Usa el deslizador para explorar resultados a distintos precios, o la biblioteca para practicar un patrón concreto.

Una ronda cuenta como acierto cuando ambas respuestas son correctas. El progreso se guarda en `localStorage` del navegador; si el almacenamiento está bloqueado, el juego funciona sin persistencia. El nivel cambia la colección de estrategias. Las curvas idénticas de spreads de débito y crédito no se presentan como alternativas rivales en un mismo ejercicio.

## Modelo y referencia

14 estrategias: long/short call y put, covered call, cuatro spreads verticales, long straddle y strangle, short straddle, long call butterfly e iron condor de crédito. Ejemplos, gráficos SVG y explicaciones son originales. Referencia: Guy Cohen, *The Bible of Options Strategies*, segunda edición, Pearson/FT Press, ©2016, ISBN 9780133964028. Las páginas citadas son las impresas indicadas en el índice del PDF proporcionado. El libro denomina **Long Iron Condor** a la estructura de crédito; aquí se usa **Iron condor (crédito)** para evitar la ambigüedad de nomenclatura.

El PDF suministrado se utilizó como referencia y no se distribuye con la aplicación. No se reproduce el texto ni las figuras del libro.

Todos los precios y primas son ficticios. P/L por unidad de activo y al vencimiento, incluyendo prima. Para contratos de 100 acciones, cantidades de cobertura y P/L se multiplican por 100. Mismo vencimiento para todas las patas. El gráfico no modela comisiones, margen, asignación anticipada ni cambios de valor antes del vencimiento; no muestra todo el dominio de precios. No incluye todavía calendarios, diagonales ni griegas.

## Validación

`npm test` ejecuta pruebas con Node 18+ para resultados, equilibrios, pérdidas extremas, cantidades y prevención de preguntas ambiguas. `node --check app.js` comprueba la sintaxis.

Para GitHub Pages, publica la carpeta `game/` como sitio estático mediante el flujo de despliegue que prefieras. No necesitas el backend de Python ni las credenciales de Polymarket para jugar.
