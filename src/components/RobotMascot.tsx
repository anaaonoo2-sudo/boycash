/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { Send, Loader2, ChevronDown } from "lucide-react";
import { askAssistant } from "@/src/services/aiService";
import { useTranslation } from "react-i18next";
import headImg  from "@/src/assets/robot-parts/robot_head_front.png";
import bellyImg from "@/src/assets/robot-parts/robot_head_back.png";
import bodyLImg from "@/src/assets/robot-parts/robot_body_left3q.png";
import bodyRImg from "@/src/assets/robot-parts/robot_body_right3q.png";
import armLImg  from "@/src/assets/robot-parts/robot_arm_left.png";
import armRImg  from "@/src/assets/robot-parts/robot_arm_right.png";

interface Message { role: "user" | "model"; text: string; }

// أبعاد كل جزء
const HW=30, HH=38;   // رأس
const BEW=28, BEH=29; // بطن (robot_head_back)
const LW=13, LH=43;   // ساق (نصف)
const AW=22, AH=9;    // ذراع
const RW=72, RH=110;  // الروبوت الكامل
const CX=RW/2;        // المنتصف

const WANDER=[
  {x:14,y:160},{x:14,y:320},{x:14,y:480},{x:14,y:240},{x:14,y:400},
];

const MOODS: Record<string,{mood:string;tip:string}> = {
  "/":            {mood:"excited",  tip:"robot_tip_home"},
  "/earn":        {mood:"dancing",  tip:"robot_tip_earn"},
  "/wallet":      {mood:"thinking", tip:"robot_tip_wallet"},
  "/leaderboard": {mood:"proud",    tip:"robot_tip_leaderboard"},
  "/profile":     {mood:"waving",   tip:"robot_tip_profile"},
  "/settings":    {mood:"thinking", tip:"robot_tip_settings"},
};

const BODY_A: Record<string,any> = {
  idle:     {y:[0,-5,0],transition:{repeat:Infinity,duration:2.8,ease:"easeInOut"}},
  excited:  {y:[0,-9,0],rotate:[-3,3,-3],transition:{repeat:Infinity,duration:1.1}},
  dancing:  {y:[0,-12,0],rotate:[-6,6,-6],x:[-5,5,-5],transition:{repeat:Infinity,duration:0.7}},
  thinking: {y:[0,-4,0],rotate:[0,4,0],transition:{repeat:Infinity,duration:2}},
  proud:    {y:[0,-7,0],scale:[1,1.07,1],transition:{repeat:Infinity,duration:1.4}},
  waving:   {y:[0,-6,0],transition:{repeat:Infinity,duration:1.9}},
};
const ARM_LA: Record<string,any> = {
  idle:     {rotate:[0,10,0],transition:{repeat:Infinity,duration:2.4}},
  dancing:  {rotate:[-28,28,-28],transition:{repeat:Infinity,duration:0.5}},
  excited:  {rotate:[-15,15,-15],transition:{repeat:Infinity,duration:0.7}},
  thinking: {rotate:[0,40,0],transition:{repeat:Infinity,duration:1.8}},
  proud:    {rotate:[-20,0,-20],transition:{repeat:Infinity,duration:1.4}},
  waving:   {rotate:[-40,40,-40],transition:{repeat:Infinity,duration:0.4}},
};
const ARM_RA: Record<string,any> = {
  idle:     {rotate:[0,-10,0],transition:{repeat:Infinity,duration:2.4,delay:0.3}},
  dancing:  {rotate:[28,-28,28],transition:{repeat:Infinity,duration:0.5}},
  excited:  {rotate:[15,-15,15],transition:{repeat:Infinity,duration:0.7,delay:0.15}},
  thinking: {rotate:[0,20,0],transition:{repeat:Infinity,duration:2.8}},
  proud:    {rotate:[20,0,20],transition:{repeat:Infinity,duration:1.4}},
  waving:   {rotate:[6,-6,6],transition:{repeat:Infinity,duration:1.9}},
};
const HEAD_A: Record<string,any> = {
  idle:     {rotate:[0,4,-4,0],transition:{repeat:Infinity,duration:3.8}},
  dancing:  {rotate:[-10,10,-10],transition:{repeat:Infinity,duration:0.6}},
  excited:  {rotate:[-7,7,-7],transition:{repeat:Infinity,duration:0.8}},
  thinking: {rotate:[8,14,8],transition:{repeat:Infinity,duration:2.3}},
  proud:    {scale:[1,1.1,1],transition:{repeat:Infinity,duration:1.8}},
  waving:   {rotate:[-7,7,-7],transition:{repeat:Infinity,duration:0.9}},
};

export default function RobotMascot() {
  const {t,i18n} = useTranslation();
  const isRtl = i18n.language==="ar";
  const location = useLocation();
  const [chatOpen,  setChatOpen]  = useState(false);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTip,   setShowTip]   = useState(false);
  const [kbH,       setKbH]       = useState(0);
  const [wanderIdx, setWanderIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null);

  const pg   = MOODS[location.pathname]||MOODS["/"];
  const mood = pg.mood;

  useEffect(()=>{
    if(chatOpen){if(timerRef.current)clearInterval(timerRef.current);return;}
    timerRef.current=setInterval(()=>setWanderIdx(i=>(i+1)%WANDER.length),3500);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[chatOpen]);

  useEffect(()=>{
    const vv=window.visualViewport;if(!vv)return;
    const fn=()=>{const d=window.innerHeight-vv.height;setKbH(d>80?d:0);};
    vv.addEventListener("resize",fn);
    return()=>vv.removeEventListener("resize",fn);
  },[]);

  useEffect(()=>{
    setShowTip(true);
    const t=setTimeout(()=>setShowTip(false),4000);
    return()=>clearTimeout(t);
  },[location.pathname]);

  useEffect(()=>{
    if(chatOpen&&messages.length===0)
      setMessages([{role:"model",text:t("assistant_welcome")}]);
  },[chatOpen,messages.length,t]);

  useEffect(()=>{
    if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;
  },[messages,isLoading]);

  useEffect(()=>{
    if(chatOpen)setTimeout(()=>inputRef.current?.focus(),350);
  },[chatOpen]);

  const handleSend=useCallback(async(custom?:string)=>{
    const text=custom||input.trim();
    if(!text||isLoading)return;
    if(!custom)setInput("");
    const updated=[...messages,{role:"user",text} as Message];
    setMessages(updated);
    setIsLoading(true);
    try{
      const res=await askAssistant(text,updated.map(m=>({role:m.role,text:m.text})));
      setMessages(prev=>[...prev,{role:"model",text:res}]);
    }catch{
      setMessages(prev=>[...prev,{role:"model",text:t("error_occurred")}]);
    }finally{setIsLoading(false);}
  },[input,isLoading,messages,t]);

  if(location.pathname==="/assistant")return null;

  const pos=WANDER[wanderIdx];

  return (
    <>
      {/* ══ الروبوت ══ */}
      <motion.div
        animate={{
          bottom:pos.y,
          right:isRtl?"auto":pos.x,
          left:isRtl?pos.x:"auto",
        }}
        transition={{type:"spring",stiffness:55,damping:13}}
        style={{position:"fixed",zIndex:40,width:RW,height:RH+20}}
        className="select-none"
      >
        {/* فقاعة */}
        <AnimatePresence>
          {showTip&&!chatOpen&&(
            <motion.div
              initial={{opacity:0,scale:0.7,y:10}}
              animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:0.7,y:10}}
              style={{
                position:"absolute",bottom:"108%",
                right:isRtl?"auto":0,left:isRtl?0:"auto",
                background:"linear-gradient(135deg,#1a0533dd,#2d1060dd)",
                border:"1.5px solid rgba(168,85,247,.55)",
                borderRadius:13,padding:"8px 11px",
                fontSize:11,lineHeight:1.6,color:"#e9d5ff",
                boxShadow:"0 6px 24px rgba(168,85,247,.35)",
                minWidth:130,maxWidth:185,
                textAlign:isRtl?"right":"left",
                backdropFilter:"blur(10px)",zIndex:6,
              }}
            >
              {t(pg.tip)}
              <div style={{
                position:"absolute",top:"100%",
                right:isRtl?"auto":10,left:isRtl?10:"auto",
                width:0,height:0,
                borderLeft:"6px solid transparent",
                borderRight:"6px solid transparent",
                borderTop:"6px solid rgba(168,85,247,.55)",
              }}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* جسم الروبوت */}
        <motion.div
          animate={BODY_A[mood]}
          style={{position:"relative",width:RW,height:RH,cursor:"pointer",overflow:"visible"}}
          whileTap={{scale:0.85}}
          onClick={()=>{setChatOpen(true);setShowTip(false);}}
        >
          {/* ═══ رأس ═══ */}
          <motion.img src={headImg} alt="" draggable={false}
            animate={HEAD_A[mood]}
            style={{
              position:"absolute",
              left:CX-HW/2, top:0,
              width:HW, height:HH,
              transformOrigin:"50% 100%",
              objectFit:"contain",
              filter:"drop-shadow(0 0 8px rgba(168,85,247,.8))",
              zIndex:4,
            }}
          />

          {/* ═══ بطن (robot_head_back) ═══ */}
          <img src={bellyImg} alt="" draggable={false}
            style={{
              position:"absolute",
              left:CX-BEW/2,
              top:HH,
              width:BEW, height:BEH,
              objectFit:"contain",
              zIndex:3,
            }}
          />

          {/* ═══ ذراع يسار ═══ */}
          <motion.img src={armLImg} alt="" draggable={false}
            animate={ARM_LA[mood]}
            style={{
              position:"absolute",
              left:CX-BEW/2-AW+4,
              top:HH+6,
              width:AW, height:AH,
              transformOrigin:"90% 40%",
              objectFit:"contain",
              zIndex:4,
            }}
          />

          {/* ═══ ذراع يمين ═══ */}
          <motion.img src={armRImg} alt="" draggable={false}
            animate={ARM_RA[mood]}
            style={{
              position:"absolute",
              left:CX+BEW/2-4,
              top:HH+6,
              width:AW, height:AH,
              transformOrigin:"10% 40%",
              objectFit:"contain",
              zIndex:4,
            }}
          />

          {/* ═══ ساق يسار ═══ */}
          <img src={bodyLImg} alt="" draggable={false}
            style={{
              position:"absolute",
              left:CX-LW,
              top:HH+BEH-4,
              width:LW, height:LH,
              objectFit:"contain",
              zIndex:2,
            }}
          />

          {/* ═══ ساق يمين ═══ */}
          <img src={bodyRImg} alt="" draggable={false}
            style={{
              position:"absolute",
              left:CX,
              top:HH+BEH-4,
              width:LW, height:LH,
              objectFit:"contain",
              zIndex:2,
            }}
          />

          {/* توهج */}
          <motion.div
            animate={{scale:[1,1.5,1],opacity:[0.1,0.3,0.1]}}
            transition={{repeat:Infinity,duration:3}}
            style={{
              position:"absolute",left:CX-20,top:HH,
              width:40,height:40,borderRadius:"50%",
              background:"rgba(168,85,247,.2)",filter:"blur(12px)",
              pointerEvents:"none",zIndex:1,
            }}
          />
          {/* نقطة خضراء */}
          <div style={{
            position:"absolute",top:-2,right:-2,
            width:9,height:9,background:"#4ade80",
            borderRadius:"50%",border:"1.5px solid #000",
            boxShadow:"0 0 7px #4ade80",zIndex:5,
          }}/>
        </motion.div>
      </motion.div>

      {/* ══ Backdrop ══ */}
      <AnimatePresence>
        {chatOpen&&(
          <motion.div
            initial={{opacity:0}}animate={{opacity:1}}exit={{opacity:0}}
            onClick={()=>setChatOpen(false)}
            style={{position:"fixed",inset:0,zIndex:48,
              background:"rgba(0,0,0,.6)",backdropFilter:"blur(5px)"}}
          />
        )}
      </AnimatePresence>

      {/* ══ Chat Drawer ══ */}
      <AnimatePresence>
        {chatOpen&&(
          <motion.div
            initial={{y:"100%"}}animate={{y:0}}exit={{y:"100%"}}
            transition={{type:"spring",damping:28,stiffness:340}}
            style={{
              position:"fixed",left:0,right:0,
              bottom:kbH,
              height:kbH>0?`calc(82vh - ${kbH}px)`:"72vh",
              zIndex:50,background:"#0d0d14",
              borderTop:"1px solid rgba(255,255,255,.09)",
              borderRadius:"26px 26px 0 0",
              display:"flex",flexDirection:"column",
              overflow:"hidden",
              boxShadow:"0 -20px 60px rgba(0,0,0,.7)",
            }}
          >
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"13px 18px",borderBottom:"1px solid rgba(255,255,255,.08)",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:11}}>
                <img src={headImg} alt="" style={{width:32,height:32,objectFit:"contain",
                  filter:"drop-shadow(0 0 8px rgba(168,85,247,.8))"}}/>
                <div>
                  <p style={{margin:0,fontSize:11,fontWeight:900,letterSpacing:"0.13em",
                    textTransform:"uppercase",color:"#fff"}}>{t("app_name")} AI</p>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                    <div style={{width:6,height:6,background:"#4ade80",borderRadius:"50%"}}/>
                    <span style={{fontSize:9,fontWeight:700,color:"#4ade80",
                      textTransform:"uppercase",letterSpacing:"0.1em"}}>Online</span>
                  </div>
                </div>
              </div>
              <button onClick={()=>setChatOpen(false)} style={{padding:"7px",borderRadius:12,
                background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",
                color:"#9ca3af",cursor:"pointer",display:"flex",alignItems:"center"}}>
                <ChevronDown size={18}/>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} dir={isRtl?"rtl":"ltr"}
              style={{flex:1,overflowY:"auto",padding:"14px 16px",
                display:"flex",flexDirection:"column",gap:10,overscrollBehavior:"contain"}}>
              {messages.map((m,i)=>(
                <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                  style={{display:"flex",gap:8,alignItems:"flex-end",
                    flexDirection:m.role==="user"?"row-reverse":"row"}}>
                  {m.role==="model"&&(
                    <img src={headImg} alt="" style={{width:22,height:22,objectFit:"contain",flexShrink:0}}/>
                  )}
                  <div style={{
                    padding:"9px 13px",
                    borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
                    fontSize:12.5,lineHeight:1.65,maxWidth:"76%",
                    wordBreak:"break-word",whiteSpace:"pre-wrap",
                    background:m.role==="user"?"#9333ea":"rgba(255,255,255,.1)",
                    color:"#f1f5f9",
                    border:m.role==="user"?"none":"1px solid rgba(255,255,255,.12)",
                    boxShadow:m.role==="user"?"0 2px 12px rgba(147,51,234,.4)":"none",
                  }}>{m.text}</div>
                </motion.div>
              ))}
              {isLoading&&(
                <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                  <img src={headImg} alt="" style={{width:22,height:22,objectFit:"contain",opacity:0.6}}/>
                  <div style={{padding:"9px 13px",borderRadius:"18px 18px 18px 4px",
                    background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",
                    display:"flex",alignItems:"center",gap:8}}>
                    <Loader2 size={12} style={{color:"#a855f7",animation:"spin 1s linear infinite"}}/>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{t("thinking")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick buttons */}
            <div style={{padding:"8px 16px",display:"flex",gap:8,overflowX:"auto",
              flexShrink:0,borderTop:"1px solid rgba(255,255,255,.06)"}}>
              {[t("q_withdraw"),t("q_points"),t("q_min")].map(q=>(
                <button key={q} onClick={()=>handleSend(q)} style={{whiteSpace:"nowrap",
                  padding:"6px 13px",borderRadius:11,
                  background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",
                  fontSize:10.5,fontWeight:700,color:"rgba(232,210,255,.8)",
                  cursor:"pointer",flexShrink:0}}>{q}</button>
              ))}
            </div>

            {/* Input */}
            <div dir={isRtl?"rtl":"ltr"} style={{padding:"10px 16px 22px",flexShrink:0}}>
              <div style={{display:"flex",gap:8,alignItems:"center",background:"#fff",
                borderRadius:20,padding:"5px 5px 5px 14px",
                boxShadow:"0 2px 16px rgba(0,0,0,.3)"}}>
                <input ref={inputRef} type="text" value={input}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSend()}
                  placeholder={t("type_question")}
                  style={{flex:1,background:"transparent",border:"none",outline:"none",
                    fontSize:13,color:"#1a1a2e",
                    textAlign:isRtl?"right":"left",padding:"6px 0"}}/>
                <button onClick={()=>handleSend()} disabled={isLoading||!input.trim()}
                  style={{width:38,height:38,borderRadius:14,
                    background:(isLoading||!input.trim())?"#d8b4fe":"#9333ea",
                    border:"none",color:"#fff",display:"flex",alignItems:"center",
                    justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                  {isLoading
                    ?<Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/>
                    :<Send size={16}/>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
