import React,{useState,useMemo} from 'react';
import {BarChart,Bar,LineChart,Line,AreaChart,Area,PieChart,Pie,Cell,ComposedChart,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,ReferenceLine,LabelList} from 'recharts';
import * as XLSX from 'xlsx';
import {LOGO,MAPIMG,REGIONS,SEED} from './data.js';



const MONTHS=["T7","T8","T9","T10","T11","T12"];
const C={navy:"#002060",blue:"#2E5FA3",teal:"#2F7D95",green:"#2E8B57",red:"#C0504D",amber:"#E8A33D",gold:"#FFD400",slate:"#64748B"};
const REGION_COLORS={
"Vùng Đông Tây Bắc":"#2E5FA3","Vùng Hà Nội +":"#3E7CB1","Vùng Đồng Bằng Sông Hồng":"#4FA3A5",
"Vùng Trung Bộ":"#E8A33D","Vùng Duyên Hải":"#2F7D95","Vùng Đông Cao Nguyên":"#6A8D3A",
"Vùng Hồ Chí Minh":"#C0504D","Vùng Tây Nam Bộ 1":"#8FA93C","Vùng Tây Nam Bộ 2":"#D9822B"};
const GEO={
"Vùng Đông Tây Bắc":[60,78],"Vùng Hà Nội +":[100,120],"Vùng Đồng Bằng Sông Hồng":[130,104],
"Vùng Trung Bộ":[150,248],"Vùng Duyên Hải":[150,338],"Vùng Đông Cao Nguyên":[120,378],
"Vùng Hồ Chí Minh":[103,452],"Vùng Tây Nam Bộ 1":[80,470],"Vùng Tây Nam Bộ 2":[70,505]};
const VN_PATH="M64,30 C92,22 118,34 116,58 C114,80 98,92 106,116 C116,146 138,150 138,182 C138,210 118,222 126,250 C136,282 158,296 150,336 C143,368 122,378 120,402 C150,408 164,432 150,456 C139,476 112,476 98,492 C84,508 74,516 64,502 C56,490 70,478 82,470 C98,461 112,456 110,440 C107,418 94,414 98,392 C102,362 122,356 116,326 C110,298 90,290 96,260 C102,230 122,224 116,194 C111,166 92,160 94,132 C96,106 112,98 104,72 C99,52 80,50 70,44 Z";
const KHO_COLORS=["#002060","#25467F","#2E5FA3","#3E7CB1","#2F7D95","#4FA3A5","#6A8D3A","#8FA93C","#E8A33D","#D9822B","#C0504D","#b23"];

const ALLKHO=[]; Object.keys(REGIONS).forEach(v=>REGIONS[v].forEach(o=>ALLKHO.push({vung:v,ma:o.ma,kho:o.kho})));
const shortName=(k)=>{const m=k.match(/[ĐD]MX\s+(.+)$/);return m?m[1]:k;};
const zeros=()=>({dtT:[0,0,0,0,0,0],cpT:[0,0,0,0,0,0],dtN:[0,0,0,0,0,0],cpN:[0,0,0,0,0,0]});
const sum=(a)=>a.reduce((x,y)=>x+y,0);
const fmt=(n)=>Math.round(n).toLocaleString("vi-VN");
const pct=(n)=>(n*100).toFixed(1)+"%";

const YKhoTick=({x,y,payload})=>(<text x={x} y={y} dy={3} textAnchor="end" fontSize="8" fill="#334155">{payload.value}</text>);
function Card({title,sub,children,className=""}){
  return (<div className={"bg-white rounded-xl p-3 shadow-sm border border-slate-100 "+className} style={{borderTop:"3px solid "+C.gold}}>
    {title&&<div className="mb-1"><h3 className="font-bold text-slate-700 text-[15px] leading-tight">{title}</h3>{sub&&<p className="text-xs text-slate-400">{sub}</p>}</div>}
    {children}</div>);
}

const HOTS={"Vùng Đông Tây Bắc":[30,11],"Vùng Đồng Bằng Sông Hồng":[53,15],"Vùng Hà Nội +":[44,25],"Vùng Trung Bộ":[52,43],"Vùng Đông Cao Nguyên":[46,64],"Vùng Duyên Hải":[61,68],"Vùng Hồ Chí Minh":[54,83],"Vùng Tây Nam Bộ 1":[49,86],"Vùng Tây Nam Bộ 2":[39,90]};
function VNMap({scope,setScope}){
  return (<div>
    <div style={{position:"relative",width:"100%"}}>
      <img src={MAPIMG} alt="Bản đồ vùng kinh doanh" style={{width:"100%",display:"block",borderRadius:8}}/>
      {Object.keys(HOTS).filter(v=>REGIONS[v]).map((v)=>{const [x,y]=HOTS[v];const on=scope===v;const col=REGION_COLORS[v];
        return (<button key={v} title={v} onClick={()=>setScope(on?"Toàn quốc":v)}
          style={{position:"absolute",left:x+"%",top:y+"%",transform:"translate(-50%,-50%)",
          width:on?26:16,height:on?26:16,borderRadius:"50%",padding:0,
          border:"2px solid "+(on?"#ffffff":"rgba(255,255,255,0.75)"),
          background:on?col:"rgba(255,255,255,0.30)",
          boxShadow:on?("0 0 0 3px "+col):"0 1px 3px rgba(0,0,0,0.45)",cursor:"pointer"}}/>);
      })}
    </div>
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 w-full">
      {Object.keys(REGION_COLORS).filter(v=>REGIONS[v]).map((v)=>(
        <button key={v} onClick={()=>setScope(scope===v?"Toàn quốc":v)}
          className={"flex items-center gap-1 text-[11px] text-left rounded px-1 py-0.5 "+(scope===v?"font-bold bg-slate-100":"text-slate-600 hover:bg-slate-50")}>
          <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{background:REGION_COLORS[v]}}></span>
          <span className="truncate">{v.replace("Vùng ","")}</span>
        </button>))}
    </div>
  </div>);
}
export default function Dashboard(){
  const [scope,setScope]=useState("Vùng Trung Bộ");
  const [channel,setChannel]=useState("tong");
  const [store,setStore]=useState(()=>{const s={};Object.keys(SEED).forEach(k=>s[k]=SEED[k]);return s;});
  const [msg,setMsg]=useState("");

  const khoList=useMemo(()=> scope==="Toàn quốc"?ALLKHO:REGIONS[scope].map(o=>({vung:scope,ma:o.ma,kho:o.kho})),[scope]);
  const get=(name)=>store[name]||zeros();
  const pickArr=(d)=> channel==="trong"?{dt:d.dtT,cp:d.cpT}: channel==="ngoai"?{dt:d.dtN,cp:d.cpN}: {dt:d.dtT.map((v,i)=>v+d.dtN[i]),cp:d.cpT.map((v,i)=>v+d.cpN[i])};

  const perKho=useMemo(()=>khoList.map((k)=>{
    const d=get(k.kho); const {dt,cp}=pickArr(d);
    const DT=sum(dt),CP=sum(cp),LNTT=DT-CP;
    return {kho:k.kho,ma:k.ma,ten:shortName(k.kho),vung:k.vung,dt,cp,DT,CP,LNTT,plntt:DT?LNTT/DT:0};
  }),[khoList,channel,store]);

  const total=useMemo(()=>{
    const DT=sum(perKho.map(k=>k.DT)),CP=sum(perKho.map(k=>k.CP));
    let dtTrong=0,dtNgoai=0;
    khoList.forEach(k=>{const d=get(k.kho);dtTrong+=sum(d.dtT);dtNgoai+=sum(d.dtN);});
    return {DT,CP,LNTT:DT-CP,plntt:DT?(DT-CP)/DT:0,dtTrong,dtNgoai};
  },[perKho,khoList,store]);

  const monthly=useMemo(()=>MONTHS.map((m,i)=>{
    let tr=0,ng=0,ctr=0,cng=0;
    khoList.forEach(k=>{const d=get(k.kho);tr+=d.dtT[i];ng+=d.dtN[i];ctr+=d.cpT[i];cng+=d.cpN[i];});
    const dt=channel==="trong"?tr:channel==="ngoai"?ng:tr+ng;
    const cp=channel==="trong"?ctr:channel==="ngoai"?cng:ctr+cng;
    return {m,"DT Trong":tr,"DT Ngoài":ng,"DT Tổng":tr+ng,DT:dt,LNTT:dt-cp};
  }),[khoList,channel,store]);

  const ranking=useMemo(()=>[...perKho].sort((a,b)=>b.DT-a.DT).slice(0,12),[perKho]);
  const cocau=[{name:"Chi phí",value:total.CP,color:C.slate},{name:"LNTT",value:total.LNTT,color:C.green}];
  const targetPct=channel==="ngoai"?0.28:0.22;
  const hasData=total.DT>0;

  const KPIS=[
    {label:"Doanh thu 6T",val:fmt(total.DT),unit:"tr",color:C.blue},
    {label:"LNTT 6T",val:fmt(total.LNTT),unit:"tr",color:C.teal},
    {label:"%LNTT",val:pct(total.plntt),unit:"",color:C.green},
    {label:"DT DMX (Trong)",val:fmt(total.dtTrong),unit:"tr",color:C.navy},
    {label:"DT Ngoài MWG",val:fmt(total.dtNgoai),unit:"tr",color:C.amber},
  ];
  const tabs=[{key:"tong",label:"Tổng"},{key:"trong",label:"Bên trong (DMX)"},{key:"ngoai",label:"Bên ngoài (MWG)"}];

  // ---------- IMPORT ----------
  const norm=(s)=>(s==null?"":String(s)).trim().toLowerCase();
  const handleImport=(e)=>{
    const file=e.target.files[0]; if(!file)return;
    const rd=new FileReader();
    rd.onload=(ev)=>{
      try{
        const wb=XLSX.read(ev.target.result,{type:"array"});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{defval:0});
        const next={...store}; let upd=0,miss=0;
        rows.forEach(r=>{
          const maRaw=r["Mã kho"]||r["Ma kho"]||r["MÃ KHO"]||r["Mã Kho"]||r["Mã"];
          const khoRaw=r["Kho"]||r["KHO"]||r["Tên Kho"]||r["Tên kho"];
          let key=null;
          if(maRaw!=null&&String(maRaw).trim())key=ALLKHO.find(k=>String(k.ma)===String(maRaw).trim());
          if(!key&&khoRaw){const kn=norm(khoRaw);key=ALLKHO.find(k=>norm(k.kho)===kn)||ALLKHO.find(k=>norm(shortName(k.kho))===kn||norm(k.kho).endsWith(kn));}
          if(!key){miss++;return;}
          const name=key.kho;
          const cur=next[name]?{...next[name]}:zeros();
          const kenh=norm(r["Kênh"]||r["Kenh"]||"");
          const ct=norm(r["Chỉ tiêu"]||r["Chi tieu"]||r["ChiTieu"]||"");
          const vals=MONTHS.map(m=>Number(r[m]||r[m.toLowerCase()]||0)||0);
          const isNgoai=kenh.includes("ngoài")||kenh.includes("ngoai")||kenh.includes("mwg");
          const isCP=ct.includes("chi");
          if(isCP){ if(isNgoai)cur.cpN=vals; else cur.cpT=vals; }
          else { if(isNgoai)cur.dtN=vals; else cur.dtT=vals; }
          next[name]=cur; upd++;
        });
        setStore(next);
        setMsg("✅ Đã cập nhật "+upd+" dòng"+(miss?(" · "+miss+" dòng không khớp kho"):"")+".");
      }catch(err){ setMsg("❌ Lỗi đọc file: "+err.message); }
    };
    rd.readAsArrayBuffer(file); e.target.value="";
  };
  const downloadTemplate=()=>{
    const rows=[];
    ALLKHO.forEach(k=>{
      ["Trong","Ngoài"].forEach(kn=>["Doanh thu","Chi phí"].forEach(ct=>{
        const d=store[k.kho]; let vals=[0,0,0,0,0,0];
        if(d){ vals = ct==="Chi phí"?(kn==="Ngoài"?d.cpN:d.cpT):(kn==="Ngoài"?d.dtN:d.dtT); }
        const row={"Vùng":k.vung,"Mã kho":k.ma,"Kho":k.kho,"Kênh":kn,"Chỉ tiêu":ct};
        MONTHS.forEach((m,i)=>row[m]=vals[i]); rows.push(row);
      }));
    });
    const ws=XLSX.utils.json_to_sheet(rows,{header:["Vùng","Mã kho","Kho","Kênh","Chỉ tiêu",...MONTHS]});
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"CapNhat");
    XLSX.writeFile(wb,"Template_CapNhat_DuLieu.xlsx");
  };

  return (<div style={{maxWidth:1280,margin:"0 auto"}}>
    {/* HEADER */}
    <div className="rounded-2xl px-5 py-4 mb-3 shadow-lg" style={{background:C.navy,borderBottom:"4px solid "+C.gold}}>
      <div className="flex items-center gap-4">
        <img src={LOGO} alt="Thợ ĐMX" className="h-12 w-auto shrink-0"/>
        <div className="border-l border-white/25 pl-4">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{color:C.gold}}>Dashboard Kinh Doanh · DV GHLĐ Thợ ĐMX</h1>
          <p className="text-blue-100 text-sm">6 Tháng Cuối Năm 2026 · Đơn vị: triệu đồng</p>
        </div>
      </div>
    </div>

    {/* CONTROLS */}
    <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-slate-100 flex flex-wrap items-center gap-3" style={{borderTop:"3px solid "+C.gold}}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Phạm vi:</span>
        <select value={scope} onChange={(e)=>setScope(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold" style={{color:C.navy}}>
          <option>Toàn quốc</option>
          {Object.keys(REGIONS).map(v=><option key={v}>{v}</option>)}
        </select>
      </div>
      <div className="flex gap-1.5">
        {tabs.map(t=>(<button key={t.key} onClick={()=>setChannel(t.key)}
          className={"px-3 py-1.5 rounded-full text-sm font-semibold "+(channel===t.key?"shadow":"text-slate-600 bg-slate-100 hover:bg-slate-200")}
          style={channel===t.key?{background:C.navy,color:C.gold}:{}}>{t.label}</button>))}
      </div>
      <div className="flex-1"></div>
      <label className="cursor-pointer px-3 py-1.5 rounded-lg text-sm font-semibold text-white shadow" style={{background:C.green}}>
        ⬆ Cập nhật dữ liệu (Excel)
        <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden"/>
      </label>
      <button onClick={downloadTemplate} className="px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{color:C.navy,borderColor:C.navy}}>⬇ Tải dữ liệu</button>
    </div>
    {msg&&<div className="mb-3 text-sm px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">{msg}</div>}
    {!hasData&&<div className="mb-3 text-sm px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">Vùng này chưa có số liệu. Dùng <b>Tải dữ liệu</b> → điền số → <b>Cập nhật dữ liệu</b> để nạp.</div>}

    {/* KPI */}
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
      {KPIS.map(k=>(<div key={k.label} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100" style={{borderTop:"3px solid "+C.gold}}>
        <span className="text-xs font-semibold text-slate-500">{k.label}</span>
        <div className="text-2xl font-bold mt-0.5" style={{color:k.color}}>{k.val}<span className="text-sm text-slate-400 ml-1">{k.unit}</span></div>
      </div>))}
    </div>

    {/* MAIN GRID */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Card title="Bản đồ Vùng kinh doanh" sub={scope==="Toàn quốc"?"Chạm 1 vùng để lọc":("Đang xem: "+scope)} className="lg:row-span-2">
        <VNMap scope={scope} setScope={setScope}/>
      </Card>

      <Card title="Xếp hạng Doanh thu theo Kho" sub={"Kênh: "+tabs.find(t=>t.key===channel).label}>
        <ResponsiveContainer width="100%" height={ranking.length>7?230:200}>
          <BarChart data={ranking} layout="vertical" margin={{left:6,right:34,top:2,bottom:2}}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
            <XAxis type="number" tickFormatter={fmt} fontSize={11}/>
            <YAxis type="category" dataKey="kho" width={190} interval={0} tick={YKhoTick}/>
            <Tooltip formatter={(v)=>fmt(v)+" tr"}/>
            <Bar dataKey="DT" radius={[0,4,4,0]} barSize={ranking.length>7?12:16}>
              {ranking.map((_,i)=><Cell key={i} fill={KHO_COLORS[i%KHO_COLORS.length]}/>)}
              <LabelList dataKey="DT" position="right" formatter={fmt} fontSize={10}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Cơ cấu Doanh thu = Chi phí + LNTT" sub={"Biên LNTT: "+pct(total.plntt)}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart margin={{top:0,right:0,bottom:0,left:0}}>
            <Pie data={cocau} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}
              label={(e)=>pct(e.value/(total.DT||1))}>
              {cocau.map((d,i)=><Cell key={i} fill={d.color}/>)}
            </Pie>
            <Tooltip formatter={(v)=>fmt(v)+" tr"}/><Legend/>
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Xu hướng Doanh thu theo tháng (T7 → T12)">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthly} margin={{left:0,right:8,top:4,bottom:0}}>
            <defs><linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.blue} stopOpacity={0.35}/><stop offset="100%" stopColor={C.blue} stopOpacity={0.02}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="m" fontSize={12}/><YAxis tickFormatter={fmt} fontSize={11} width={44}/>
            <Tooltip formatter={(v)=>fmt(v)+" tr"}/><Legend/>
            <Area type="monotone" dataKey="DT Tổng" stroke={C.blue} fill="url(#gT)" strokeWidth={2.5}/>
            <Line type="monotone" dataKey="DT Trong" stroke={C.navy} strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="DT Ngoài" stroke={C.amber} strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card title="%LNTT theo Kho" sub={"Mục tiêu "+pct(targetPct)}>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={perKho.slice(0,12)} margin={{left:0,right:8,top:4,bottom:2}}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="ten" fontSize={9} angle={-30} textAnchor="end" height={54} interval={0}/>
            <YAxis tickFormatter={(v)=>(v*100).toFixed(0)+"%"} fontSize={11} domain={[0,0.4]} width={38}/>
            <Tooltip formatter={(v)=>pct(v)}/>
            <ReferenceLine y={targetPct} stroke={C.red} strokeDasharray="5 4"/>
            <Bar dataKey="plntt" radius={[3,3,0,0]}>
              {perKho.slice(0,12).map((k,i)=><Cell key={i} fill={k.plntt>=targetPct?C.green:C.red}/>)}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>

    {/* TABLE */}
    <Card title={"Chi tiết theo Kho — "+scope} className="mt-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-white" style={{background:C.navy}}>
            {["#","Vùng","Mã kho","Kho","Doanh thu","Chi phí","LNTT","%LNTT"].map((h,idx)=><th key={h} className={"px-3 py-2 font-semibold whitespace-nowrap "+(idx>=4?"text-right":"text-left")}>{h}</th>)}
          </tr></thead>
          <tbody>
            {perKho.map((k,i)=>(<tr key={k.kho} className={i%2?"bg-slate-50":"bg-white"}>
              <td className="px-3 py-1.5">{i+1}</td>
              <td className="px-3 py-1.5 whitespace-nowrap text-slate-500 text-xs">{k.vung.replace("Vùng ","")}</td>
              <td className="px-3 py-1.5 whitespace-nowrap text-slate-600 tabular-nums">{k.ma}</td>
              <td className="px-3 py-1.5 font-medium whitespace-nowrap">{k.kho}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{fmt(k.DT)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{fmt(k.CP)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums font-semibold">{fmt(k.LNTT)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums font-semibold" style={{color:k.plntt>=targetPct?C.green:C.red}}>{pct(k.plntt)}</td>
            </tr>))}
            <tr className="text-white font-bold" style={{background:C.teal}}>
              <td className="px-3 py-2" colSpan={4}>{scope==="Toàn quốc"?"TOÀN QUỐC":scope.toUpperCase()}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmt(total.DT)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmt(total.CP)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmt(total.LNTT)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{pct(total.plntt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>);
}
