# CFA Study Lab — Portfolio Management I y II

Entrenador bilingüe independiente para los primeros dos módulos del volumen 9, Level I, currículo **2025** suministrado por el usuario. No es un producto de CFA Institute y no garantiza un resultado en el examen. Los 16 objetivos de aprendizaje se mapean a notas originales, fórmulas y preguntas; no se promete cubrir cada variante de pregunta posible.

## Abrir y estudiar

Descarga `cfa-study.html` de la raíz y ábrelo en un navegador. No necesita Internet, cuentas, API ni instalación. La aplicación modular está en `cfa/`; para desarrollo, ejecuta `npm start` desde la raíz y abre `/cfa/`. `npm run build` genera de nuevo ambos juegos descargables. Node 18+ permite ejecutar `npm test`.

El español y el inglés aparecen juntos por defecto. Puedes estudiar solo en español y pasar gradualmente a inglés. Las explicaciones y el vocabulario son en español. **No son preguntas oficiales**: el banco contiene 80 preguntas conceptuales originales (5 por objetivo) y 23 plantillas numéricas originales, cada una con 7 conjuntos de datos. Los números pueden repetirse tras un ciclo; no se presenta como un banco infinito.

## Flujo

1. Lee un objetivo en **Estudiar y fórmulas**; consulta las páginas impresas del libro.
2. Practica ese objetivo o usa la práctica adaptativa, que prioriza objetivos con menor dominio y evita las últimas tres preguntas base cuando hay alternativas.
3. Marca tu seguridad antes de responder. Se explica tanto la correcta como cada distractor. Los errores y los aciertos inseguros van al cuaderno de repaso.
4. Haz simulacros con 2 preguntas por objetivo seleccionado: 32 preguntas / 48 minutos para ambos módulos; 14 / 21 para módulo I; 18 / 27 para módulo II. En objetivos cuantitativos incluye un cálculo y un concepto; en los demás, dos conceptos. El temporizador usa 90 segundos por pregunta como ritmo de entrenamiento. **No replica la duración ni la mezcla de un examen oficial completo.**
5. Revisa todas las soluciones solo al terminar. Las respuestas sin marcar cuentan como incorrectas; no hay puntos negativos.

## Dominio y progreso

Un objetivo se marca dominado cuando sus últimas cinco respuestas son correctas, abarcan al menos tres preguntas base y contienen un cálculo correcto si ese objetivo tiene plantillas numéricas. Es un criterio interno, no una certificación de aprendizaje ni una estimación de la nota CFA. La meta 100/100 corresponde a acertar un simulacro generado, no garantiza acierto ante cualquier pregunta futura.

El progreso se guarda localmente en el navegador, con un máximo de 2,000 respuestas y 30 simulacros. Si el almacenamiento está bloqueado, se puede seguir practicando y exportar manualmente. Exportar/importar JSON permite mover progreso entre navegadores; importar sustituye el anterior previa confirmación. Los últimos 30 errores o aciertos inseguros alimentan el cuaderno. El simulacro activo no se guarda al recargar; el navegador advierte antes de salir.

## Convenciones y referencias

- Retornos y σ en decimales al calcular; varianzas/covarianzas en unidades decimales al cuadrado cuando se solicita.
- Estadísticas históricas muestrales usan `n − 1`.
- M² sigue este volumen: **retorno ajustado**, `Rf + Sharpe × σm`; M² alpha es la diferencia contra retorno del benchmark.
- Correlación con un activo de σ cero no está definida, aunque covarianza es cero.
- Preguntas de apalancamiento especifican si préstamo y endeudamiento tienen tasas distintas.
- Los distractores se derivan de confusiones concretas: varianza frente a σ, prima frente a retorno total, beta frente a riesgo total, o denominador muestral.

Fuente: *CFA Program Curriculum 2025, Level I, Volume 9, Portfolio Management*: módulo 1 **Portfolio Risk and Return: Part I** (pp. 3–62), módulo 2 **Part II** (pp. 63–122). Las notas citan páginas impresas. No se distribuye el PDF ni se reproducen sus problemas, soluciones o figuras. Módulos 3–6 pendientes. Para otra convocatoria revisa el currículo vigente antes de asumir que sus objetivos coinciden.
