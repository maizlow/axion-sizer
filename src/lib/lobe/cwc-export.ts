type CamPt = { id?: string; x: number; y: number };

export const LOBE_CWC_GUID = "a8f3c2d1-6b47-4e19-9c5a-0d2e8f1a4b70";

function crc32(data: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function zipStore(files: { name: string; text: string }[]): Blob {
  const enc = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = enc.encode(f.text);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, data.length, true);
    dv.setUint32(22, data.length, true);
    dv.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(data, 30 + name.length);
    locals.push(local);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);
    centrals.push(central);
    offset += local.length;
  }
  const dirSize = centrals.reduce((s, x) => s + x.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, dirSize, true);
  ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + dirSize + 22);
  let p = 0;
  for (const l of locals) {
    out.set(l, p);
    p += l.length;
  }
  for (const c of centrals) {
    out.set(c, p);
    p += c.length;
  }
  out.set(end, p);
  return new Blob([out], { type: "application/zip" });
}

function manifest(defaults: { points: string; xMin: number; xMax: number; yMin: number; yMax: number }): string {
  return JSON.stringify(
    {
      Name: "LobeCam",
      Version: "1.0.0",
      DisplayName: "Lobe cam curve",
      Description: "Draggable cam curve for WinCC Unified Custom Web Control.",
      Vendor: "ABECE",
      Logo: "lobe.svg",
      ID: LOBE_CWC_GUID,
      License: "Internal",
      Metadata: { Author: "ABECE", Keywords: ["cam", "curve", "lobe"] },
      Interface: {
        Properties: [
          { Name: "PointsJson", Type: "string", Default: defaults.points },
          { Name: "XMin", Type: "number", Default: defaults.xMin },
          { Name: "XMax", Type: "number", Default: defaults.xMax },
          { Name: "YMin", Type: "number", Default: defaults.yMin },
          { Name: "YMax", Type: "number", Default: defaults.yMax },
          { Name: "ReadOnly", Type: "boolean", Default: false },
        ],
        Methods: [],
        Events: [{ Name: "PointsChanged", Arguments: [{ Name: "json", Type: "string" }] }],
      },
    },
    null,
    2,
  );
}

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#2a3338"/><path d="M12 46 H52 M12 46 V18" fill="none" stroke="#e8ece8" stroke-width="1.4"/><path d="M16 42 C22 42 24 22 32 22 C40 22 42 36 50 28" fill="none" stroke="#2a9a8e" stroke-width="2.2" stroke-linecap="round"/><circle cx="16" cy="42" r="2.2" fill="#e8ece8"/><circle cx="32" cy="22" r="2.2" fill="#e8ece8"/><circle cx="50" cy="28" r="2.2" fill="#e8ece8"/></svg>`;

function indexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lobe</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <svg id="plot" viewBox="0 0 720 420"></svg>
  <script src="js/webcc.min.js"></script>
  <script src="code.js"></script>
</body>
</html>`;
}

function webccStub(): string {
  return `window.WebCC = window.WebCC || {
  Properties: {},
  onPropertyChanged: { subscribe: function (fn) { this._fn = fn; } },
  Events: { fire: function () {} },
  start: function (ok) { if (typeof ok === "function") ok(); }
};
`;
}

function styles(): string {
  return `html,body{margin:0;height:100%;background:#111;color:#ddd;font-family:sans-serif}
#plot{width:100%;height:100%;touch-action:none;display:block}`;
}

function codeJs(): string {
  return `const W=720,H=420,pad={l:48,r:20,t:20,b:36};
let xMin=0,xMax=360,yMin=0,yMax=100,readOnly=false;
let pts=[{x:0,y:0},{x:180,y:80},{x:360,y:0}];
const svg=document.getElementById("plot");
function spanX(){return Math.max(1e-6,xMax-xMin)}
function spanY(){return Math.max(1e-6,yMax-yMin)}
function toX(x){return pad.l+((x-xMin)/spanX())*(W-pad.l-pad.r)}
function toY(y){return pad.t+(H-pad.t-pad.b)-((y-yMin)/spanY())*(H-pad.t-pad.b)}
function ordered(){return pts.slice().sort(function(a,b){return a.x-b.x})}
function draw(){
  var o=ordered();
  var g="",i;
  for(i=0;i<=8;i++){var x=xMin+spanX()*i/8;g+='<line x1="'+toX(x)+'" y1="'+pad.t+'" x2="'+toX(x)+'" y2="'+(pad.t+H-pad.t-pad.b)+'" stroke="#333" />';}
  for(i=0;i<=5;i++){var y=yMin+spanY()*i/5;g+='<line x1="'+pad.l+'" y1="'+toY(y)+'" x2="'+(pad.l+W-pad.l-pad.r)+'" y2="'+toY(y)+'" stroke="#333" />';}
  var d="";
  o.forEach(function(p,i){d+=(i?"L":"M")+toX(p.x)+" "+toY(p.y)+" ";});
  g+='<path d="'+d+'" fill="none" stroke="#2a9a8e" stroke-width="2" />';
  o.forEach(function(p,i){
    g+='<circle data-i="'+i+'" cx="'+toX(p.x)+'" cy="'+toY(p.y)+'" r="9" fill="#eee" style="cursor:grab" />';
  });
  svg.innerHTML=g;
}
function applyProps(){
  var P=window.WebCC&&WebCC.Properties?WebCC.Properties:{};
  if(P.XMin!=null)xMin=Number(P.XMin);
  if(P.XMax!=null)xMax=Number(P.XMax);
  if(P.YMin!=null)yMin=Number(P.YMin);
  if(P.YMax!=null)yMax=Number(P.YMax);
  if(P.ReadOnly!=null)readOnly=!!P.ReadOnly;
  if(P.PointsJson){try{var a=JSON.parse(P.PointsJson);if(Array.isArray(a)&&a.length)pts=a.map(function(p){return {x:Number(p.x),y:Number(p.y)}});}catch(e){}}
  draw();
}
function pushOut(){
  var json=JSON.stringify(ordered());
  if(window.WebCC&&WebCC.Properties)WebCC.Properties.PointsJson=json;
  if(window.WebCC&&WebCC.Events&&WebCC.Events.fire)WebCC.Events.fire("PointsChanged",json);
}
var drag=-1;
svg.addEventListener("pointerdown",function(e){
  if(readOnly)return;
  var t=e.target;
  if(!t.getAttribute||t.getAttribute("data-i")==null)return;
  drag=Number(t.getAttribute("data-i"));
  t.setPointerCapture&&t.setPointerCapture(e.pointerId);
});
svg.addEventListener("pointermove",function(e){
  if(drag<0)return;
  var r=svg.getBoundingClientRect();
  var px=((e.clientX-r.left)/r.width)*W;
  var py=((e.clientY-r.top)/r.height)*H;
  var o=ordered();
  var x=xMin+((px-pad.l)/(W-pad.l-pad.r))*spanX();
  var y=yMin+((pad.t+H-pad.t-pad.b-py)/(H-pad.t-pad.b))*spanY();
  var eps=spanX()*0.002;
  var lo=drag===0?xMin:o[drag-1].x+eps;
  var hi=drag===o.length-1?xMax:o[drag+1].x-eps;
  o[drag].x=Math.min(hi,Math.max(lo,x));
  o[drag].y=Math.min(yMax,Math.max(yMin,y));
  pts=o;
  draw();
});
svg.addEventListener("pointerup",function(){if(drag>=0){drag=-1;pushOut();}});
function boot(){
  applyProps();
  if(window.WebCC&&WebCC.onPropertyChanged&&WebCC.onPropertyChanged.subscribe){
    WebCC.onPropertyChanged.subscribe(function(){applyProps();});
  }
}
if(window.WebCC&&typeof WebCC.start==="function")WebCC.start(boot);
else boot();
`;
}

export function downloadLobeCwc(opts: { points: CamPt[]; xMin: number; xMax: number; yMin: number; yMax: number }): void {
  const points = JSON.stringify(opts.points.map((p) => ({ x: p.x, y: p.y })));
  const blob = zipStore([
    { name: "manifest.json", text: manifest({ points, xMin: opts.xMin, xMax: opts.xMax, yMin: opts.yMin, yMax: opts.yMax }) },
    { name: "assets/lobe.svg", text: LOGO_SVG },
    { name: "control/index.html", text: indexHtml() },
    { name: "control/styles.css", text: styles() },
    { name: "control/code.js", text: codeJs() },
    { name: "control/js/webcc.min.js", text: webccStub() },
  ]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `{${LOBE_CWC_GUID}}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
