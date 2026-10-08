// All returns and standard deviations enter these functions as decimals.
export const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
export const variance=a=>a.reduce((s,x)=>s+(x-mean(a))**2,0)/(a.length-1);
export const covariance=(a,b)=>a.reduce((s,x,i)=>s+(x-mean(a))*(b[i]-mean(b)),0)/(a.length-1);
export const correlation=(a,b)=>covariance(a,b)/Math.sqrt(variance(a)*variance(b));
export const portfolioVariance=(w,s1,s2,rho)=>w*w*s1*s1+(1-w)**2*s2*s2+2*w*(1-w)*rho*s1*s2;
export const portfolioReturn=(w,r1,r2)=>w*r1+(1-w)*r2;
export const utility=(r,s,a)=>r-.5*a*s*s;
export const optimalWeight=(r,rf,s,a)=>(r-rf)/(a*s*s);
export const beta=(rho,si,sm)=>rho*si/sm;
export const capm=(rf,rm,b)=>rf+b*(rm-rf);
export const sharpe=(r,rf,s)=>(r-rf)/s;
export const treynor=(r,rf,b)=>(r-rf)/b;
export const mSquared=(r,rf,s,sm)=>rf+sharpe(r,rf,s)*sm;
export const jensen=(r,rf,rm,b)=>r-capm(rf,rm,b);
export const marketVariance=(b,sm,residualVariance)=>b*b*sm*sm+residualVariance;
