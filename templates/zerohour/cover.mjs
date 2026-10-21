// ZERO HOUR cover generator.
// Usage: node cover.mjs <day> "<line 1>" "<line 2>" <out.png>
// Example: node cover.mjs 1 "WHAT HAPPENED AT A" "HIGH SCHOOL IN TOKYO" Day1_cover.png
import { chromium } from 'playwright';
const [day,l1,l2,out]=process.argv.slice(2);
const D=new URL('.',import.meta.url).pathname;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+D+'school.html');await p.waitForTimeout(400);
await p.evaluate(c=>window.drawCover2(c),{day:Number(day),l1,l2});
await p.screenshot({path:out||`Day${day}_cover.png`});await b.close();
