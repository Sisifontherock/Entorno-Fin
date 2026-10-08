// Original educational examples; all options in a strategy share an expiry.
const leg = (type, strike, qty, premium) => ({type, strike, qty, premium});
const call = (k,q,p) => leg('call',k,q,p);
const put = (k,q,p) => leg('put',k,q,p);
const stock = () => leg('acción',100,1,0);
const entry = (id,name,level,outlook,legs,explanation,page,risk) => ({id,name,level,outlook,legs,explanation,page,risk});
export const strategies = [
 entry('long-call','Long call',1,'Alcista',[call(100,1,5)],'Comprar una call permite participar en una subida. La prima pagada es la pérdida máxima; se empieza a ganar por encima de strike + prima.',45,'Pérdida limitada; ganancia sin límite superior.'),
 entry('long-put','Long put',1,'Bajista',[put(100,1,5)],'Comprar una put permite beneficiarse de una caída. El equilibrio es strike − prima. Si el precio no cae lo suficiente, se pierde la prima.',54,'Pérdida limitada; ganancia limitada porque el precio no puede bajar de cero.'),
 entry('short-call','Short call (descubierta)',3,'Neutral / bajista',[call(100,-1,5)],'Vender una call cobra una prima, pero obliga a vender al strike si hay asignación. Una subida fuerte produce pérdidas sin límite superior.',49,'Ganancia limitada a la prima; pérdida sin límite superior.'),
 entry('short-put','Short put',3,'Neutral / alcista',[put(100,-1,5)],'Vender una put cobra una prima y puede obligar a comprar al strike. La caída hasta cero determina la pérdida máxima.',58,'Ganancia limitada a la prima; pérdida potencial de 95 por unidad.'),
 entry('covered-call','Covered call',2,'Neutral / alcista moderada',[stock(),call(110,-1,3)],'Comprar la acción y vender una call genera prima a cambio de limitar la subida. La acción sigue expuesta a una caída; la cobertura no elimina esa pérdida.',65,'Pérdida potencial de 97 por unidad; ganancia máxima de 13.'),
 entry('bull-call','Bull call spread',2,'Alcista moderada',[call(95,1,8),call(105,-1,3)],'Comprar la call de strike menor y vender la de strike mayor reduce el coste. Tanto la pérdida como la ganancia quedan limitadas.',144,'Débito de 5; pérdida máxima 5 y ganancia máxima 5.'),
 entry('bear-put','Bear put spread',2,'Bajista moderada',[put(105,1,8),put(95,-1,3)],'Comprar la put de strike mayor y vender la de strike menor construye una posición bajista con riesgo limitado.',149,'Débito de 5; pérdida máxima 5 y ganancia máxima 5.'),
 entry('bull-put','Bull put spread',2,'Neutral / alcista',[put(95,1,3),put(105,-1,8)],'Vender la put de strike mayor y comprar la de strike menor recibe crédito. Gana si el precio termina por encima del strike vendido.',73,'Crédito de 5; ganancia máxima 5 y pérdida máxima 5.'),
 entry('bear-call','Bear call spread',2,'Neutral / bajista',[call(95,-1,8),call(105,1,3)],'Vender la call de strike menor y comprar la de strike mayor recibe crédito. Gana si el precio termina por debajo del strike vendido.',78,'Crédito de 5; ganancia máxima 5 y pérdida máxima 5.'),
 entry('straddle','Long straddle',2,'Movimiento fuerte',[call(100,1,5),put(100,1,5)],'Comprar call y put con el mismo strike apuesta por un movimiento grande en cualquier dirección. La distancia recorrida debe compensar ambas primas.',179,'Pérdida máxima 10; equilibrios en 90 y 110.'),
 entry('strangle','Long strangle',2,'Movimiento fuerte',[put(95,1,3),call(105,1,3)],'Comprar una put de strike menor y una call de strike mayor requiere un movimiento amplio. La zona central pierde las primas.',191,'Pérdida máxima 6; equilibrios en 89 y 111.'),
 entry('short-straddle','Short straddle',3,'Rango estrecho',[call(100,-1,5),put(100,-1,5)],'Vender call y put del mismo strike cobra ambas primas. Un movimiento grande puede superar rápidamente el crédito recibido.',251,'Ganancia máxima 10; pérdida sin límite superior por la call.'),
 entry('butterfly','Long call butterfly',3,'Cerca del strike central',[call(90,1,12),call(100,-2,5),call(110,1,2)],'Comprar las alas y vender dos calls del strike central crea un pico de beneficio. Los strikes están igualmente separados y comparten vencimiento.',266,'Débito de 4; pérdida máxima 4 y ganancia máxima 6.'),
 entry('condor','Iron condor (crédito)',3,'Dentro de un rango',[put(85,1,1),put(95,-1,3),call(105,-1,3),call(115,1,1)],'Combinar un bull put spread y un bear call spread cobra crédito. Las opciones compradas en los extremos limitan las pérdidas.',88,'Crédito de 4; ganancia máxima 4 y pérdida máxima 6. Cohen lo llama Long Iron Condor.')
];
export function payoff(legs,price) {
 return legs.reduce((sum,l)=>sum+l.qty*(l.type==='acción'?price-l.strike:(l.type==='call'?Math.max(price-l.strike,0):Math.max(l.strike-price,0))-l.premium),0);
}
export function cost(legs) { return legs.reduce((sum,l)=>sum+(l.type==='acción'?l.qty*l.strike:l.qty*l.premium),0); }
export function orderText(l) {return `${l.qty>0?'Comprar':'Vender'} ${Math.abs(l.qty)} ${l.type}${l.type==='acción'? ' a 100':` K=${l.strike} · prima ${l.premium}`}`;}
export function matches(legs,answers) {return legs.every((l,i)=>Number(answers[i])===l.qty);}
export function sameCurve(a,b) {return Array.from({length:141},(_,price)=>price).every(price=>Math.abs(payoff(a.legs,price)-payoff(b.legs,price))<1e-9);}
export function shuffle(items,random=Math.random) {const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
