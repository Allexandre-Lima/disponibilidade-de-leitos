/* ============================================================================
   Controle de Disponibilidade de Leitos — VEMAN v1.4
   Full-stack SPA (client-side persistence via localStorage)
   ============================================================================
   Estrutura:
     1. Dados legados
     2. Utilitários
     3. Classificadores
     4. Motor analítico
     5. Cache analítico
     6. Estado global
     7. Migração
     8. Persistência (corrigida: retorna status, reporta erros)
     9. Toasts
    10. Modais
    11. Filtros
    12. Render — Registros
    13. Render — Dashboard
    14. Configurações
    15. Histórico
    16. Wizard de registro
    17. Ações (status, obs, exclusão)
    18. Detalhes (drawer)
    19. Geração de gráficos → imagem
    20. Relatório PDF
    21. Relatório Word
    22. Navegação / UI
    23. Self-tests + Init
   ============================================================================ */

'use strict';

/* ============================================================
   1. DADOS LEGADOS
   ============================================================ */
const CAMPOS=["id","quarto","dataSolic","dataBloq","horaBloq","dataLib","horaLib","previsao","tipo","causa","responsavel"];
const RAW=[
[1,"806","2026-01-12","2026-01-12","09:43","2026-01-13","16:33","2026-01-13","Persiana/Cortina","Dano pontual na pintura durante retirada de persiana motorizada","Amauri"],
[2,"601","2026-01-14","2026-01-14","07:31","2026-01-14","11:51","2026-01-14","Ar Condicionado","Problema no ar condicionado identificado à noite","Amauri"],
[3,"801","2026-01-04","2026-01-05","08:09","2026-01-14","12:30","2026-01-14","Reforma Geral","Obra completa de reforma","Amauri"],
[4,"803","2026-01-04","2026-01-05","08:09","2026-01-13","08:47","2026-01-13","Reforma Geral","Obra completa de reforma","Amauri"],
[5,"809","2026-01-14","2026-01-19","16:28","2026-01-21","15:17","2026-01-11","Hidráulica","Vazamento em registros","Amauri"],
[6,"710","2026-01-17","2026-01-18","12:58","2026-01-18","13:28","2026-01-18","Ar Condicionado","Vazamento de água do sistema de ar condicionado","Amauri"],
[7,"618","2026-01-08","2026-01-08","09:55","2026-01-08","11:49","2026-01-08","Hidráulica","Vaso sanitário com problema","Amauri"],
[8,"604","2026-01-23","2026-02-15","16:15","2026-02-16","16:55","","Elétrica","Quarto no escuro","Amauri"],
[9,"707","2026-01-31","2026-02-13","07:44","2026-02-13","14:21","2026-02-13","Ar Condicionado","Motor queimado","Amauri"],
[10,"921","2026-02-12","2026-02-15","16:15","2026-02-16","16:55","","Hidráulica","Problemas com vaso sanitário","Amauri"],
[11,"915","2026-02-09","2026-02-09","09:00","2026-02-09","11:00","2026-02-09","Ar Condicionado","Motor queimado","Amauri"],
[12,"UTI1-LEITO7","2026-02-02","2026-02-04","08:40","2026-02-09","10:14","2026-02-09","Civil","Pia lavatório quebrada","Amauri"],
[13,"UTI1-LEITO16","2026-02-13","2026-02-24","18:43","2026-02-25","16:17","2026-02-25","Elétrica","Problemas em tomadas","Amauri"],
[14,"925","2026-02-13","2026-02-16","16:15","2026-02-20","21:00","2026-02-20","Elétrica","Ar condicionado não funciona","Amauri"],
[15,"701","2026-02-16","2026-02-16","19:37","2026-02-28","16:20","2026-02-28","Reforma Geral","Manutenção geral do quarto","Amauri"],
[16,"603","2026-02-17","2026-02-17","17:03","2026-02-18","12:29","2026-02-18","Geral","Problemas com insetos","Amauri"],
[17,"801","2026-01-05","2026-01-05","11:50","2026-10-01","11:20","2026-01-10","Reforma Geral","Reforma geral - elétrica, hidráulica, ar condicionado, pintura, móveis","Amauri"],
[18,"803","2026-01-05","2026-01-05","11:50","2026-10-01","11:20","2026-01-10","Reforma Geral","Reforma geral - elétrica, hidráulica, ar condicionado, pintura, móveis","Amauri"],
[19,"809","2026-01-19","2026-01-19","16:28","2026-01-21","15:17","2026-01-21","Hidráulica","Vazamento em registros","Amauri"],
[20,"520","2026-01-21","2026-01-21","01:55","2026-01-26","08:23","2026-01-26","Pintura","Pintura e conserto do dispenser","Amauri"],
[21,"620","2026-01-21","2026-01-21","01:55","2026-01-26","08:23","2026-01-26","Hidráulica","Problemas hidráulicos","Amauri"],
[22,"UTI3-LEITO24","2026-01-31","2026-01-31","03:18","2026-02-02","15:03","2026-02-02","Elétrica","Problemas elétricos","Amauri"],
[23,"UTI4-LEITO6","2026-02-02","2026-02-02","08:22","2026-03-02","07:48","2026-03-02","Ar Condicionado","Cheiro forte de queimado","Amauri"],
[24,"915","2026-02-08","2026-02-08","16:12","2026-09-02","10:58","2026-09-02","Ar Condicionado","Cheiro forte de queimado","Amauri"],
[25,"UTI1-LEITO7","2026-02-04","2026-02-04","08:40","2026-09-02","10:14","2026-09-02","Civil","Pia quebrada","Amauri"],
[26,"815","2026-02-05","2026-02-05","17:52","2026-06-02","14:55","2026-06-02","Ar Condicionado","Motor queimado","Amauri"],
[27,"603","2026-02-17","2026-02-17","14:32","2026-02-18","12:29","2026-02-18","Ar Condicionado","Vespas entraram pelo ar condicionado","Amauri"],
[28,"921","2026-02-15","2026-02-15","16:14","2026-02-16","16:55","2026-02-16","Hidráulica","Vaso sanitário com problema","Amauri"],
[29,"701","2026-02-16","2026-02-16","17:03","2026-02-28","16:20","2026-02-28","Reforma Geral","Reforma geral - elétrica, hidráulica, ar condicionado, pintura, móveis","Amauri"],
[30,"925","2026-02-15","2026-02-15","16:14","2026-02-20","21:00","2026-02-20","Ar Condicionado","Ar condicionado não funciona","Amauri"],
[31,"818","2026-02-21","2026-02-21","09:34","2026-02-21","17:05","2026-02-21","Hidráulica","Registros com vazamento","Amauri"],
[32,"604","2026-02-15","2026-02-15","16:14","2026-02-16","16:55","2026-02-16","Elétrica","Problemas em iluminação","Amauri"],
[33,"UTI1-LEITO16","2026-02-13","2026-02-24","18:43","2026-02-25","16:17","2026-02-25","Elétrica","Problemas em tomadas","Amauri"],
[34,"707","2026-01-31","2026-02-13","07:44","2026-02-13","14:21","2026-02-14","Ar Condicionado","Problema no ar condicionado","Amauri"],
[35,"907","2026-02-21","2026-03-04","15:25","2026-03-05","16:58","2026-02-22","Hidráulica","Registros com vazamento","Amauri"],
[36,"908","2026-02-22","2026-02-22","17:05","2026-02-23","09:20","2026-02-23","Ar Condicionado","Vazamentos","Amauri"],
[37,"702","2026-02-27","2026-02-28","17:00","2026-03-06","17:30","2026-03-07","Reforma Geral","Reforma geral - elétrica, hidráulica, ar condicionado, pintura, móveis","Amauri"],
[38,"UTI2-LEITO10","2026-02-28","2026-03-02","14:35","2026-03-05","16:58","","Ar Condicionado","Problemas no ar condicionado","Amauri"],
[39,"UTI2-LEITO15","2026-03-02","2026-03-02","19:35","2026-03-02","21:00","2026-03-06","Ar Condicionado","Problemas no ar condicionado","Amauri"],
[40,"708","2026-03-09","2026-03-09","08:00","2026-03-13","17:00","2026-03-13","Reforma Geral","Reforma geral - elétrica, hidráulica, ar condicionado, pintura, móveis","Amauri"],
[41,"703","2026-03-13","2026-03-13","08:00","2026-03-13","17:00","2026-03-13","Reforma Geral","Reforma geral - elétrica, hidráulica, ar condicionado, pintura, móveis","Amauri"],
[42,"704","2026-03-20","2026-03-20","08:00","2026-03-14","17:00","2026-03-20","Reforma Geral","Reforma geral - elétrica, hidráulica, ar condicionado, pintura, móveis","Amauri"],
[43,"912","2026-03-01","2026-03-01","18:34","2026-03-02","15:27","2026-03-02","Ar Condicionado","Manutenção do ar condicionado","Amauri"],
[44,"908","2026-03-30","2026-03-30","16:34","2026-03-31","08:55","2026-03-31","Hidráulica","Vaso entupido","Amauri"],
[45,"606","2026-03-02","2026-03-02","07:49","2026-03-04","18:00","2026-03-04","Civil","Piso danificado","Amauri"],
[46,"604","2026-03-03","2026-03-03","19:03","2026-03-03","21:42","2026-03-04","Elétrica","Chuveiro e campainha com defeito","Amauri"],
[47,"907","2026-03-04","2026-03-04","15:25","2026-03-05","16:58","2026-03-04","Hidráulica","Problemas hidráulicos","Amauri"],
[48,"UTI1-LEITO18","2026-03-06","2026-03-06","08:15","2026-03-07","19:00","2026-03-07","Civil","Problemas elétricos, hidráulicos e paredes quebradas","Amauri"],
[49,"617","2026-03-25","2026-03-27","15:27","2026-04-01","08:35","2026-03-30","Civil","Parede quebrada","Amauri"],
[50,"UTI1-LEITO6","2026-04-13","2026-04-13","17:39","2026-04-15","07:45","2026-04-14","Pintura","Paredes quebradas","Amauri"],
[51,"901","2026-04-06","2026-04-06","15:36","2026-04-06","18:36","2026-04-06","Hidráulica","Problemas em válvula de descarga","Amauri"],
[52,"UTI3-LEITO23","2026-04-07","2026-04-07","15:02","2026-04-08","15:02","2026-04-08","Ar Condicionado","Problemas no ar condicionado","Amauri"],
[53,"811","2026-04-11","2026-04-11","09:02","2026-04-11","09:24","2026-04-11","Hidráulica","Vaso entupido","Amauri"],
[54,"UTI1-LEITO6","2026-04-13","2026-04-13","17:39","2026-04-15","07:45","2026-04-14","Pintura","Paredes quebradas","Amauri"],
[55,"710","2026-04-16","2026-04-16","08:30","2026-04-16","14:00","2026-04-16","Hidráulica","Vaso entupido","Amauri"],
[56,"811","2026-04-16","2026-04-16","08:30","2026-04-16","14:00","2026-04-16","Hidráulica","Vaso entupido","Amauri"],
[57,"816","2026-04-17","2026-04-17","08:04","2026-04-17","11:00","2026-04-17","Hidráulica","Água muito quente","Amauri"],
[58,"507","2026-04-20","2026-04-20","12:00","2026-04-23","14:03","2026-04-23","Hidráulica","Infiltrações","Amauri"],
[59,"925","2026-04-25","2026-04-25","09:20","2026-04-26","17:55","2026-04-26","Ar Condicionado","Motor do ar-condicionado queimado","Amauri"],
[60,"911","2026-04-27","2026-04-27","08:50","2026-04-27","10:29","2026-07-27","Hidráulica","Torneiras com problemas","Amauri"],
[61,"UTI1-LEITO15","2026-04-29","2026-04-29","11:13","2026-05-04","10:29","2026-05-04","Pintura","Paredes quebradas","Amauri"],
[62,"919","2026-05-01","2026-05-01","18:37","2026-05-07","07:55","2026-05-07","Civil","Infiltração da chuva","Amauri"],
[63,"510","2026-05-03","2026-05-03","10:34","2026-05-07","07:55","2026-05-07","Civil","Troca de cerâmicas","Amauri"],
[64,"UTI3-LEITO30","2026-05-12","2026-05-12","12:07","2026-05-13","17:50","2026-05-13","Civil","Parede quebrada (drywall)","Amauri"],
[65,"UTI2-LEITO10","2026-05-12","2026-05-12","12:07","2026-05-13","16:36","2026-05-13","Civil","Parede quebrada","Amauri"],
[66,"UTI1-LEITO4","2026-05-12","2026-05-12","12:07","2026-05-12","20:00","2026-05-13","Civil","Parede quebrada","Amauri"],
[67,"UTI3-LEITO26","2026-05-21","2026-05-21","11:28","2026-05-22","09:13","2026-05-22","Civil","Parede quebrada","Amauri"],
[68,"909","2026-05-20","2026-05-20","16:01","2026-05-21","10:05","2026-05-21","Civil","Infiltração no banheiro","Amauri"],
[69,"UTI3-LEITO24","2026-05-21","2026-05-21","11:28","2026-05-22","09:13","2026-05-22","Civil","Paredes quebradas","Amauri"],
[70,"823","2026-05-29","2026-05-29","17:05","2026-05-30","18:00","2026-05-30","Civil","Buraco na parede","Amauri"],
[71,"UTI3-LEITO22","2026-06-02","2026-06-02","19:00","2026-06-03","17:33","2026-06-03","Civil","Paredes quebradas (drywall)","Amauri"],
[72,"UTI1-LEITO12","2026-06-03","2026-06-03","19:00","2026-06-04","17:33","2026-06-04","Civil","Paredes quebradas (drywall)","Amauri"],
[73,"UTI1-LEITO5","2026-06-04","2026-06-04","16:47","2026-06-05","18:43","2026-06-05","Civil","Paredes quebradas (drywall)","Amauri"],
[74,"519","2026-06-10","2026-06-10","14:36","2026-06-10","16:40","2026-06-10","Hidráulica","Infiltração no corredor cozinha","Amauri"],
[75,"520","2026-06-10","2026-06-10","21:00","2026-06-12","08:07","2026-06-12","Hidráulica","Infiltração no corredor cozinha","Amauri"],
[76,"601","2026-06-12","2026-06-12","09:03","2026-06-13","11:28","2026-06-12","Civil","Paredes quebradas (drywall)","Amauri"],
[77,"913","2026-06-14","2026-06-14","10:42","2026-06-15","17:01","2026-06-15","Ar Condicionado","Barulho no ar condicionado","Amauri"],
[78,"UTI1-LEITO15","2026-06-14","2026-06-14","17:11","2026-06-15","09:00","2026-06-15","Hidráulica","Odor insuportável","Amauri"],
[79,"UTI1-LEITO10","2026-06-15","2026-06-15","09:00","2026-06-16","13:30","2026-06-16","Civil","Paredes quebradas (drywall)","Amauri"],
[80,"710","2026-06-15","2026-06-15","15:29","2026-06-15","17:01","2026-06-15","Elétrica","Campainhas em curto","Amauri"],
[81,"UTI2-LEITO15","2026-06-21","2026-06-21","22:00","2026-06-23","14:00","2026-06-23","Civil","Suporte da rede de gases desprendeu","Amauri"],
[82,"604","2026-07-10","2026-07-10","11:04","2026-07-10","14:00","2026-07-10","Ar Condicionado","Instalação de equipamento para pressão negativa","Amauri"],
[83,"603","2026-07-10","2026-07-13","08:53","2026-07-13","12:35","2026-07-13","Ar Condicionado","Instalação de equipamento para pressão negativa","Amauri"],
[84,"UTI2-LEITO9","2026-07-10","2026-07-14","08:21","2026-07-14","10:38","2026-07-14","Ar Condicionado","Instalação de equipamento para pressão negativa","Amauri"],
[85,"UTI2-LEITO11","2026-07-10","2026-07-14","08:21","2026-07-14","10:38","2026-07-14","Ar Condicionado","Instalação de equipamento para pressão negativa","Amauri"],
[86,"806","2026-07-13","2026-07-13","09:55","2026-07-15","11:01","2026-07-15","Ar Condicionado","Alagamento do quarto devido a válvula trincada","Amauri"],
[87,"605","2026-07-20","2026-07-20","14:47","2026-07-21","17:31","2026-07-21","Civil","Buracos na parede drywall","Amauri"],
[88,"508","2026-07-10","2026-07-17","08:23","2026-07-17","16:32","2026-07-17","Ar Condicionado","Instalação de equipamento para pressão negativa","Amauri"],
[89,"514","2026-07-29","2026-07-29","07:54","2026-07-29","10:55","2026-07-29","Civil","Queda das pastilhas da sacada","Amauri"],
[90,"UTI3-LEITO30","2026-07-27","2026-07-27","08:07","2026-07-27","19:49","2026-07-27","Civil","Paredes quebradas","Amauri"],
[91,"UTI2-LEITO15","2026-07-27","2026-07-27","08:20","2026-07-28","17:16","2026-07-27","Civil","Queda da televisão","Amauri"],
[92,"UTI1-LEITO7","2026-07-30","2026-07-30","13:15","2026-07-31","11:09","2026-07-31","Civil","Parede quebrada","Amauri"],
[93,"UTI 1 LEITO 11","2026-08-03","2026-08-03","11:52","2026-08-04","14:00","2026-08-04","Civil","Parede quebrada","Amauri"],
[94,"616","2026-08-13","2026-08-13","13:52","2026-08-18","14:00","2026-08-18","Civil","Grande vazamento de água","Amauri"],
[95,"UTI 1 LEITO 16","2026-08-25","2026-08-25","05:35","2026-08-26","16:56","2026-08-26","Civil","Quebra da porcelanato","Amauri"],
[96,"UTI 1 - Box 11","2026-08-03","2026-08-03","00:00","2026-08-04","14:00","2026-08-04","Pintura","Pintura/manutenção","Amauri"],
[97,"919","2026-08-06","2026-08-06","00:00","2026-08-07","15:00","2026-08-07","Ar Condicionado","Problemas no ar-condicionado e luminária","Amauri"],
[98,"UTI 2 - Box 16","2026-08-07","2026-08-07","00:00","2026-08-08","00:00","2026-08-07","Elétrica","Risco de queda da televisão","Amauri"],
[99,"UTI 2 - Box 13","2026-08-10","2026-08-10","08:00","2026-08-10","11:05","2026-08-10","Hidráulica","Odor muito forte","Amauri"],
[100,"923","2026-08-15","2026-08-15","00:00","2026-08-15","11:58","2026-08-15","Hidráulica","Manutenção da pia","Amauri"],
[101,"601","2026-08-17","2026-08-17","00:00","","","","Civil","Parede com grande buraco / drywall danificado","Amauri"],
[102,"UTI 2 - Box 11","2026-08-20","2026-08-20","00:00","","","","Civil","Manutenção da estativa; rede de vácuo sem funcionamento","Amauri"],
[103,"923","2026-08-25","2026-08-25","00:00","","","2026-08-26","Ar Condicionado","Vazamento de água (ar-condicionado)","Amauri"],
[104,"UTI 1 - Box 16","2026-08-25","2026-08-25","17:35","","","2026-08-26","Civil","Conserto do mármore da pia","Amauri"],
[105,"UTI 1 - Box 19","2026-08-26","2026-08-26","00:00","2026-08-26","21:02","2026-08-26","Elétrica","Problema em tomada elétrica","Amauri"],
[106,"823","2026-08-29","2026-08-29","00:00","2026-08-29","10:39","2026-08-29","Hidráulica","Chuveiro sem funcionamento","Amauri"],
[107,"811","2026-08-29","2026-08-29","00:00","2026-08-29","21:35","2026-09-02","Ar Condicionado","Motor do ar-condicionado com defeito (falta de peça)","Amauri"],
[108,"708","2026-08-30","2026-08-30","00:00","2026-08-30","18:53","2026-08-30","Ar Condicionado","Problema no ar-condicionado (O.S. 6127717)","Amauri"],
[109,"923","2026-08-31","2026-08-31","00:00","","","","Ar Condicionado","Vazamento do ar-condicionado (recorrência)","Amauri"],
[110,"601","2026-08-31","2026-08-31","00:00","","","","Civil","Parede quebrada/danificada (recorrência)","Amauri"],
[111,"616","2026-08-13","2026-08-13","13:52","2026-08-17","17:28","2026-08-18","Civil","Vazamento de água (ralo quebrado) - reparos e pintura","Amauri"]
];

/* ============================================================
   2. UTILITÁRIOS
   ============================================================ */
const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function formatDur(s){
  if(s===null||s===undefined||isNaN(s)||s<0)return "—";
  if(s<1)return "0s";
  const seg=Math.floor(s%60),min=Math.floor(s/60%60),h=Math.floor(s/3600%24),d=Math.floor(s/86400);
  if(s<60)return `${seg}s`;
  if(s<3600)return min>0?`${min}min ${seg}s`:`${seg}s`;
  if(s<86400){const p=[`${h}h`];if(min>0)p.push(`${min}min`);return p.join(" ");}
  const p=[`${d}d`,`${h}h`];if(min>0)p.push(`${min}min`);return p.join(" ");
}
function comporDT(d,h){
  if(!d)return null;
  const hora=h&&String(h).trim()!==""?h:"00:00";
  const dt=new Date(`${d}T${hora}:00`);
  return isNaN(dt.getTime())?null:dt;
}
function diffSeg(a,b){if(!a||!b)return null;const d=(b-a)/1000;return d>=0?d:null;}
function formatMesAno(m){if(!m||!/^\d{4}-\d{2}$/.test(m))return m;const[ano,mm]=m.split("-").map(Number);return `${MESES[mm-1]} / ${ano}`;}
function hojeISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function agoraISO(){const d=new Date();return d.toISOString().slice(0,16);}
function uid(){return "id-"+(Date.now().toString(36)+Math.random().toString(36).slice(2,7));}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};}
function dataBR(iso){if(!iso)return"—";return String(iso).split("-").reverse().join("/");}
function clonar(obj){
  if(typeof structuredClone==="function")return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

/* ============================================================
   3. CLASSIFICADORES
   ============================================================ */
function normalizarLocal(raw){
  const s=String(raw||"").trim().replace(/\s+/g," ");
  const uti=s.match(/UTI\s*(\d+)\s*[-–\s]?\s*(?:LEITO|Box)?\s*(\d+)/i);
  if(uti)return{unidade:`UTI${uti[1]}`,setor:`UTI ${uti[1]}`,quarto:`UTI${uti[1]}-LEITO${uti[2]}`,leito:uti[2],tipoAmbiente:"UTI"};
  const n=s.match(/^(\d{3,4})$/);
  if(n){
    const num=n[1];const andar=num.length===3?num.substring(0,1):num.substring(0,2);
    return{unidade:"HOSPITAL",setor:`Andar ${andar}`,quarto:num,tipoAmbiente:"Apartamento"};
  }
  return{unidade:"HOSPITAL",setor:"Não informado",quarto:s,tipoAmbiente:"Outro"};
}
function classificarCategoria(t){
  t=String(t||"").toLowerCase();
  if(/ar.?condicionado|climatiz|press[aã]o negativa/i.test(t))return"Climatização";
  if(/el[eé]trica/i.test(t))return"Elétrica";
  if(/hidr[aá]ulica/i.test(t))return"Hidráulica";
  if(/civil/i.test(t))return"Civil";
  if(/pintura/i.test(t))return"Pintura";
  if(/persiana|cortina|mobili/i.test(t))return"Mobiliário";
  if(/reforma/i.test(t))return"Reforma";
  return"Outros";
}
function classificarCausaPad(txt,cat){
  const t=String(txt||"").toLowerCase();
  if(/reforma geral|obra completa|manuten[çc][aã]o geral/i.test(t))return"Reforma planejada";
  if(/press[aã]o negativa|instala[çc][aã]o/i.test(t))return"Instalação";
  if(/preventiva|limpeza/i.test(t))return"Manutenção preventiva";
  if(/vazamento|infiltra|alagamento/i.test(t))return"Vazamento / Infiltração";
  if(/entupid|obstru/i.test(t))return"Obstrução";
  if(/cheiro.*queimado|curto|n[ãa]o funciona|defeito|falha|quimad|motor/i.test(t))return"Falha em equipamento";
  if(/quebrad|buraco|danificad|dano|desprendeu|queda/i.test(t))return"Dano estrutural";
  if(/odor|cheiro/i.test(t))return"Odor / Qualidade do ar";
  if(/inseto|vespa|praga/i.test(t))return"Praga";
  if(/pintura/i.test(t))return"Pintura";
  if(cat==="Elétrica")return"Problema elétrico";
  if(cat==="Hidráulica")return"Problema hidráulico";
  return"Outros";
}

/* ============================================================
   4. MOTOR ANALÍTICO
   ============================================================ */
function downtime(r,agora){
  agora=agora||new Date();
  const ini=comporDT(r.dataBloqueio,r.horaBloqueio);
  if(!ini)return null;
  if(r.dataLiberacao){
    const fim=comporDT(r.dataLiberacao,r.horaLiberacao);
    return diffSeg(ini,fim);
  }
  return diffSeg(ini,agora);
}
function estaAtivo(r){return !r.dataLiberacao||String(r.dataLiberacao).trim()==="";}
function estaAtrasado(r,agora){
  if(!estaAtivo(r))return false;
  if(!r.previsaoLiberacao)return false;
  const prev=comporDT(r.previsaoLiberacao,"23:59");
  return prev!==null&&(agora||new Date())>prev;
}
function calcularTMA(regs){
  const valores=[];
  for(const r of regs){
    if(!r.inicioAtendimento)continue;
    const solic=comporDT(r.dataSolicitacao,r.horaSolicitacao);
    const ini=new Date(r.inicioAtendimento);
    if(isNaN(ini.getTime()))continue;
    const seg=diffSeg(solic,ini);
    if(seg!==null&&seg>=0)valores.push(seg);
  }
  if(!valores.length)return null;
  return valores.reduce((a,b)=>a+b,0)/valores.length;
}
function metricas(regs,agora){
  agora=agora||new Date();
  const total=regs.length;
  const ativos=regs.filter(estaAtivo).length;
  const liberados=total-ativos;
  const taxaLiberacao=total>0?(liberados/total)*100:0;
  const tempoTotal=regs.reduce((s,r)=>s+(downtime(r,agora)||0),0);
  const dvals=regs.map(r=>downtime(r,agora)).filter(d=>d!==null&&d>0);
  const tmr=dvals.length?dvals.reduce((a,b)=>a+b,0)/dvals.length:null;
  const maior=regs.length?Math.max(0,...regs.map(r=>downtime(r,agora)||0)):0;
  const criticos=regs.filter(r=>r.criticidade==="Crítica").length;
  const tma=calcularTMA(regs);
  const tmaCalculavel=regs.some(r=>r.inicioAtendimento);
  return{total,ativos,liberados,taxaLiberacao,tempoTotal,tmr,maior,criticos,tma,tmaCalculavel};
}
function construirPareto(regs,campo,agora){
  const total=regs.length||1;
  const map=new Map();
  for(const r of regs){
    const k=String(r[campo]||"Não informado");
    const dt=downtime(r,agora)||0;
    const c=map.get(k)||{qtd:0,tempo:0};
    c.qtd++;c.tempo+=dt;map.set(k,c);
  }
  let acum=0;
  return Array.from(map.entries())
    .map(([chave,v])=>({chave,qtd:v.qtd,tempo:v.tempo}))
    .sort((a,b)=>b.qtd-a.qtd)
    .map(it=>{const pct=(it.qtd/total)*100;acum+=pct;
      return{chave:it.chave,quantidade:it.qtd,percentual:pct,percentualAcum:acum,tempoHoras:it.tempo/3600};});
}
function pontoPareto(dados,cob){
  cob=cob||80;
  let i=0;
  while(i<dados.length&&dados[i].percentualAcum<cob)i++;
  return{itens:i+1,total:dados.length};
}
function serieMensal(regs,agora){
  const map=new Map();
  for(const r of regs){
    if(!r.dataBloqueio)continue;
    const m=r.dataBloqueio.slice(0,7);
    const c=map.get(m)||{qtd:0,tempo:0};
    c.qtd++;c.tempo+=(downtime(r,agora)||0);map.set(m,c);
  }
  const meses=Array.from(map.keys()).sort();
  const media=meses.length?meses.reduce((s,m)=>s+map.get(m).qtd,0)/meses.length:0;
  return meses.map((m,i)=>{
    const d=map.get(m);
    const ant=i>0?map.get(meses[i-1]).qtd:null;
    return{mes:m,quantidade:d.qtd,tempoHoras:d.tempo/3600,
      varAnt:ant&&ant>0?((d.qtd-ant)/ant)*100:null,
      varMedia:media>0?((d.qtd-media)/media)*100:null};
  });
}
function detectarRecorrencias(regs,janelaDias){
  janelaDias=janelaDias||90;
  const map=new Map();
  for(const r of regs){
    const k=`${r.quarto}|${r.categoria}|${r.causaPadronizada}`;
    if(!map.has(k))map.set(k,[]);
    map.get(k).push(r);
  }
  const out=[];
  for(const[,g]of map){
    if(g.length<2)continue;
    const ordenado=[...g].sort((a,b)=>String(a.dataBloqueio||"").localeCompare(String(b.dataBloqueio||"")));
    const ini=ordenado[0].dataBloqueio,fim=ordenado[ordenado.length-1].dataBloqueio;
    if(!ini||!fim)continue;
    const span=(new Date(fim).getTime()-new Date(ini).getTime())/86400000;
    if(span>janelaDias)continue;
    out.push({quarto:ordenado[0].quarto,categoria:ordenado[0].categoria,
      causaPadronizada:ordenado[0].causaPadronizada,ocorrencias:g.length,
      intervaloMedioDias:span/Math.max(1,g.length-1),
      registros:g.map(r=>r.id)});
  }
  return out.sort((a,b)=>b.ocorrencias-a.ocorrencias);
}
function rankingQuartos(regs,agora){
  const map=new Map();
  for(const r of regs){
    if(!map.has(r.quarto))map.set(r.quarto,[]);
    map.get(r.quarto).push(r);
  }
  return Array.from(map.entries()).map(([q,g])=>{
    const tempo=g.reduce((s,r)=>s+(downtime(r,agora)||0),0);
    const causas={};
    g.forEach(r=>{causas[r.causaPadronizada]=(causas[r.causaPadronizada]||0)+1;});
    const ordenadas=Object.entries(causas).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c])=>c);
    const ultimo=[...g].sort((a,b)=>String(b.dataBloqueio||"").localeCompare(String(a.dataBloqueio||"")))[0];
    return{chave:q,ocorrencias:g.length,tempoHoras:tempo/3600,
      causasPredominantes:ordenadas,ultimaOcorrencia:ultimo.dataBloqueio,
      statusAtual:estaAtivo(ultimo)?"Bloqueado":"Liberado"};
  }).sort((a,b)=>b.ocorrencias-a.ocorrencias||b.tempoHoras-a.tempoHoras);
}

/* ============================================================
   5. CACHE ANALÍTICO
   ============================================================ */
let _cache={key:null,dados:null,agora:null,m:null,paretoTipo:null,paretoCausa:null,ranking:null,recs:null,serie:null};
function filtrosKey(){return JSON.stringify(State.filtros);}
function invalidarCache(){_cache.key=null;}
function analisar(){
  const key=filtrosKey();
  if(_cache.key===key)return _cache;
  const dados=aplicarFiltros();
  const agora=new Date();
  _cache={
    key,dados,agora,
    m:metricas(dados,agora),
    paretoTipo:construirPareto(dados,"tipoServico",agora),
    paretoCausa:construirPareto(dados,"causaPadronizada",agora),
    ranking:rankingQuartos(dados,agora),
    recs:detectarRecorrencias(dados,90),
    serie:serieMensal(dados,agora)
  };
  return _cache;
}
function aplicarFiltros(){
  const f=State.filtros;
  return State.registros.filter(r=>{
    if(f.quarto&&!r.quarto.toLowerCase().includes(f.quarto.toLowerCase()))return false;
    if(f.categoria&&r.categoria!==f.categoria)return false;
    if(f.status&&((estaAtivo(r)?"Bloqueado":"Liberado")!==f.status))return false;
    if(f.mes&&(!r.dataBloqueio||!r.dataBloqueio.startsWith(f.mes)))return false;
    return true;
  });
}

/* ============================================================
   6. ESTADO GLOBAL
   ============================================================ */
const STORAGE_KEY="cdl:app:v4";
const State={
  registros:[],
  filtros:{quarto:"",categoria:"",status:"",mes:""},
  historico:[],
  ui:{tema:"claro",compacta:false,apresentacao:false},
  config:{
    parametros:{metaTaxaLiberacaoPct:90,metaTMRHoras:24,metaTMAHoras:4,limiteBloqueioProlongadoHoras:72,janelaRecorrenciaDias:90},
    tiposServico:["Ar Condicionado","Elétrica","Hidráulica","Civil","Reforma Geral","Pintura","Persiana/Cortina","Geral"],
    categorias:["Climatização","Elétrica","Hidráulica","Civil","Pintura","Mobiliário","Equipamentos","Reforma","Outros"],
    responsaveis:["Amauri","Robson","Thiago"],
    regrasCriticidade:[
      {id:"r1",nome:"UTI sempre crítica",ordem:1,ativo:true,resultado:"Crítica",cond:{tiposAmbiente:["UTI"]}},
      {id:"r2",nome:"Isolamento = alta",ordem:2,ativo:true,resultado:"Alta",cond:{tiposAmbiente:["Isolamento"]}},
      {id:"r3",nome:"Bloqueio > 7 dias",ordem:3,ativo:true,resultado:"Crítica",cond:{duracaoMinHoras:168}}
    ]
  }
};

/* ============================================================
   7. PERSISTÊNCIA  —  CORRIGIDA
   ============================================================ */
function persistir(){
  try{
    const payload=JSON.stringify({
      _versao:"1.4",
      _salvoEm:new Date().toISOString(),
      registros:State.registros,
      historico:State.historico,
      ui:State.ui,
      config:State.config
    });
    localStorage.setItem(STORAGE_KEY,payload);
    return true;
  }catch(e){
    console.error("[persistir] Falha:",e);
    if(e&&e.name==="QuotaExceededError"){
      toast("Armazenamento local cheio. Exporte um backup e limpe dados antigos.","erro");
    }else{
      toast("Não foi possível salvar os dados: "+(e&&e.message||e),"erro");
    }
    return false;
  }
}
function carregarPersistido(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return false;
    const d=JSON.parse(raw);
    if(Array.isArray(d.registros))State.registros=d.registros;
    if(Array.isArray(d.historico))State.historico=d.historico;
    if(d.ui&&typeof d.ui==="object")Object.assign(State.ui,d.ui);
    if(d.config&&typeof d.config==="object"){
      Object.assign(State.config,d.config);
      if(!Array.isArray(State.config.regrasCriticidade))State.config.regrasCriticidade=[
        {id:"r1",nome:"UTI sempre crítica",ordem:1,ativo:true,resultado:"Crítica",cond:{tiposAmbiente:["UTI"]}},
        {id:"r2",nome:"Isolamento = alta",ordem:2,ativo:true,resultado:"Alta",cond:{tiposAmbiente:["Isolamento"]}},
        {id:"r3",nome:"Bloqueio > 7 dias",ordem:3,ativo:true,resultado:"Crítica",cond:{duracaoMinHoras:168}}
      ];
    }
    return true;
  }catch(e){
    console.error("[carregarPersistido] Dados corrompidos, iniciando migração:",e);
    try{localStorage.removeItem(STORAGE_KEY);}catch(_){}
    return false;
  }
}

/* ============================================================
   8. MIGRAÇÃO
   ============================================================ */
function migrarLegado(){
  return RAW.map(row=>{
    const raw={};CAMPOS.forEach((k,i)=>raw[k]=row[i]);
    const local=normalizarLocal(raw.quarto);
    const categoria=classificarCategoria(raw.tipo);
    const causaPadronizada=classificarCausaPad(raw.causa,categoria);
    const ativo=!raw.dataLib||String(raw.dataLib).trim()==="";
    return{
      id:uid(),codigo:`BLQ-${String(raw.id).padStart(4,"0")}`,idOriginal:raw.id,
      unidade:local.unidade,setor:local.setor,quarto:local.quarto,leito:local.leito,
      tipoAmbiente:local.tipoAmbiente,
      dataSolicitacao:raw.dataSolic,horaSolicitacao:undefined,
      dataBloqueio:raw.dataBloq,horaBloqueio:raw.horaBloq,
      previsaoLiberacao:raw.previsao||undefined,
      inicioAtendimento:undefined,
      dataLiberacao:raw.dataLib||undefined,horaLiberacao:raw.horaLib||undefined,
      statusSistema:ativo?"Bloqueado":"Liberado",
      statusOperacional:undefined,
      tipoServico:raw.tipo,categoria,causaPadronizada,
      descricaoProblema:raw.causa,
      responsavel:raw.responsavel,
      prioridade:"Média",criticidade:"Média",
      houveRecorrencia:false,quantidadeRecorrencias:0,
      houveImpedimento:false,tipoImpedimento:undefined,
      observacao:undefined,ordemServico:undefined,
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
      createdBy:"migracao",updatedBy:"migracao",arquivado:false
    };
  });
}
function aplicarRegrasCriticidade(){
  const regras=[...State.config.regrasCriticidade].filter(r=>r.ativo).sort((a,b)=>a.ordem-b.ordem);
  if(!regras.length)return;
  const agora=new Date();
  for(const r of State.registros){
    const duracao=(downtime(r,agora)||0)/3600;
    for(const reg of regras){
      const c=reg.cond;
      if(c.tiposAmbiente&&!c.tiposAmbiente.includes(r.tipoAmbiente))continue;
      if(c.categorias&&!c.categorias.includes(r.categoria))continue;
      if(c.prioridades&&!c.prioridades.includes(r.prioridade))continue;
      if(c.duracaoMinHoras!==undefined&&duracao<c.duracaoMinHoras)continue;
      r.criticidade=reg.resultado;break;
    }
  }
}

/* ============================================================
   9. TOASTS
   ============================================================ */
function toast(texto,tipo){
  tipo=tipo||"info";
  const map={info:"i",sucesso:"✓",alerta:"!",erro:"✕"};
  const el=document.createElement("div");
  el.className=`toast ${tipo}`;
  el.innerHTML=`<span class="toast__icone">${map[tipo]||"i"}</span><span class="toast__texto">${escapeHtml(texto)}</span>`;
  const stack=document.getElementById("toasts");
  if(!stack)return;
  stack.appendChild(el);
  setTimeout(()=>{el.style.opacity="0";el.style.transition="opacity 200ms";setTimeout(()=>el.remove(),200);},3500);
}

/* ============================================================
   10. MODAIS
   ============================================================ */
const MODAL_IDS={wiz:"modal-wiz",confirm:"modal-confirm",status:"modal-status",obs:"modal-obs",det:"drawer-det"};
function abrirModal(id){const el=document.getElementById(id);if(el)el.classList.add("ativo");}
function fecharModal(id){const el=document.getElementById(id);if(el)el.classList.remove("ativo");}
document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-close]");
  if(!btn)return;
  const id=MODAL_IDS[btn.dataset.close];
  if(id)fecharModal(id);
});
document.querySelectorAll(".modal-overlay,.drawer-overlay").forEach(o=>{
  o.addEventListener("click",e=>{if(e.target===o)o.classList.remove("ativo");});
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    if(State.ui.apresentacao){toggleApres();return;}
    for(const id of Object.values(MODAL_IDS)){
      const el=document.getElementById(id);
      if(el&&el.classList.contains("ativo")){el.classList.remove("ativo");return;}
    }
  }
  if(e.key==="F11"){e.preventDefault();toggleApres();}
});

/* ============================================================
   11. FILTROS
   ============================================================ */
function construirFiltros(){
  document.querySelectorAll("[data-filtros]").forEach(cont=>{
    const sufixo=cont.dataset.filtros;
    cont.innerHTML=`
      <div class="filtros-grid">
        <div class="form-campo"><label>Quarto</label><input id="fil-${sufixo}-quarto" placeholder="Ex: 806"></div>
        <div class="form-campo"><label>Mês</label><select id="fil-${sufixo}-mes"><option value="">Todos</option></select></div>
        <div class="form-campo"><label>Categoria</label><select id="fil-${sufixo}-categoria"><option value="">Todas</option>
          ${State.config.categorias.map(c=>`<option value="${c}">${c}</option>`).join("")}
        </select></div>
        <div class="form-campo"><label>Status</label><select id="fil-${sufixo}-status">
          <option value="">Todos</option><option value="Bloqueado">Bloqueado</option><option value="Liberado">Liberado</option>
        </select></div>
      </div>
      <div class="filtros-acoes"><button class="btn btn-secundario btn-sm" data-limpar-filtros>Limpar</button></div>
      <div class="chips" id="chips-${sufixo}"></div>`;
    const update=debounce(()=>{
      State.filtros={
        quarto:cont.querySelector(`#fil-${sufixo}-quarto`).value.trim(),
        categoria:cont.querySelector(`#fil-${sufixo}-categoria`).value,
        status:cont.querySelector(`#fil-${sufixo}-status`).value,
        mes:cont.querySelector(`#fil-${sufixo}-mes`).value
      };
      invalidarCache();renderizarTudo();
    },200);
    cont.querySelectorAll("input,select").forEach(el=>{
      el.addEventListener("input",update);
      el.addEventListener("change",update);
    });
    cont.querySelector("[data-limpar-filtros]").addEventListener("click",()=>{
      State.filtros={quarto:"",categoria:"",status:"",mes:""};
      invalidarCache();
      document.querySelectorAll("[data-filtros] input").forEach(i=>i.value="");
      document.querySelectorAll("[data-filtros] select").forEach(s=>s.value="");
      renderizarTudo();
    });
  });
  atualizarOpcoesMes();
  atualizarChips();
}
function atualizarOpcoesMes(){
  const mesesSet=new Set();
  State.registros.forEach(r=>{if(r.dataBloqueio)mesesSet.add(r.dataBloqueio.slice(0,7));});
  const meses=Array.from(mesesSet).sort().reverse();
  document.querySelectorAll('[id^="fil-"][id$="-mes"]').forEach(sel=>{
    const valorAtual=sel.value;
    sel.innerHTML='<option value="">Todos</option>';
    meses.forEach(m=>{
      const opt=document.createElement("option");
      opt.value=m;opt.textContent=formatMesAno(m);
      sel.appendChild(opt);
    });
    if(valorAtual&&meses.includes(valorAtual))sel.value=valorAtual;
    else sel.value="";
  });
}
function atualizarChips(){
  const f=State.filtros;
  const chips=[];
  if(f.quarto)chips.push(`<span class="chip"><strong>Quarto:</strong> ${escapeHtml(f.quarto)}<button class="chip__x" data-chip="quarto">×</button></span>`);
  if(f.mes)chips.push(`<span class="chip"><strong>Mês:</strong> ${formatMesAno(f.mes)}<button class="chip__x" data-chip="mes">×</button></span>`);
  if(f.categoria)chips.push(`<span class="chip"><strong>Categoria:</strong> ${escapeHtml(f.categoria)}<button class="chip__x" data-chip="categoria">×</button></span>`);
  if(f.status)chips.push(`<span class="chip"><strong>Status:</strong> ${escapeHtml(f.status)}<button class="chip__x" data-chip="status">×</button></span>`);
  const html=chips.join("");
  document.querySelectorAll('[id^="chips-"]').forEach(c=>c.innerHTML=html);
}
document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-chip]");
  if(!btn)return;
  const campo=btn.dataset.chip;
  State.filtros[campo]="";
  document.querySelectorAll(`#fil-dash-${campo}, #fil-reg-${campo}`).forEach(el=>{el.value="";});
  invalidarCache();renderizarTudo();
});

/* ============================================================
   12. RENDERIZAÇÃO — REGISTROS
   ============================================================ */
let mesesExpandidos=new Set();
function renderizarRegistros(){
  const dados=[...analisar().dados].sort((a,b)=>String(b.dataBloqueio||"").localeCompare(String(a.dataBloqueio||"")));
  document.getElementById("sub-reg").textContent=`${dados.length} de ${State.registros.length} registros`;
  const meses={};
  dados.forEach(r=>{
    if(!r.dataBloqueio)return;
    const m=r.dataBloqueio.slice(0,7);
    (meses[m]=meses[m]||[]).push(r);
  });
  const cont=document.getElementById("lista-meses");
  if(!dados.length){
    cont.innerHTML=`<div class="card"><div class="card__corpo"><div class="vazio"><div class="vazio__icone">📭</div><div class="vazio__titulo">Nenhum registro encontrado</div><div class="vazio__desc">Ajuste os filtros ou crie um novo bloqueio.</div></div></div></div>`;
    return;
  }
  cont.innerHTML=Object.keys(meses).sort().reverse().map(m=>{
    const g=meses[m];
    const ativos=g.filter(estaAtivo).length;
    const tempo=g.reduce((s,r)=>s+(downtime(r)||0),0);
    const[ano,mm]=m.split("-");
    const aberto=mesesExpandidos.size===0||mesesExpandidos.has(m);
    return `
      <div class="mes-grupo ${aberto?"expandido":""}" data-mes="${m}">
        <div class="mes-cabecalho">
          <span class="mes-toggle">${aberto?"▼":"▶"}</span>
          <span class="mes-titulo">${MESES[parseInt(mm)-1]} / ${ano}</span>
          <div class="mes-stats">
            <span class="mes-stat"><strong>${g.length}</strong> registros</span>
            <span class="mes-stat perigo"><strong>${ativos}</strong> ativos</span>
            <span class="mes-stat sucesso"><strong>${g.length-ativos}</strong> liberados</span>
            <span class="mes-stat"><strong>${formatDur(tempo)}</strong></span>
          </div>
        </div>
        <div class="mes-corpo"><div class="tabela-wrap"><table class="tabela">
          <thead><tr><th>Status</th><th>Quarto</th><th>Categoria</th><th>Causa</th><th>Bloqueio</th><th>Início Atend.</th><th>Liberação</th><th>Tempo</th><th style="text-align:right">Ações</th></tr></thead>
          <tbody>${g.map(renderLinha).join("")}</tbody>
        </table></div></div>
      </div>`;
  }).join("");
}
function renderLinha(r){
  const ativo=estaAtivo(r);
  const atraso=estaAtrasado(r);
  return `
    <tr>
      <td><span class="badge ${ativo?"perigo":"sucesso"}">${ativo?"Bloqueado":"Liberado"}</span>${atraso?' <span style="color:var(--cr);font-size:10px">⚠</span>':""}</td>
      <td><strong>${escapeHtml(r.quarto)}</strong>${r.tipoAmbiente==="UTI"?' <span class="badge perigo" style="font-size:9px">UTI</span>':""}</td>
      <td>${escapeHtml(r.categoria)}</td>
      <td title="${escapeHtml(r.descricaoProblema||"")}">${escapeHtml(r.causaPadronizada)}</td>
      <td>${dataBR(r.dataBloqueio)} ${escapeHtml(r.horaBloqueio||"")}</td>
      <td>${r.inicioAtendimento?new Date(r.inicioAtendimento).toLocaleString("pt-BR"):"—"}</td>
      <td>${r.dataLiberacao?`${dataBR(r.dataLiberacao)} ${escapeHtml(r.horaLiberacao||"")}`:"—"}</td>
      <td>${formatDur(downtime(r))}</td>
      <td style="text-align:right;white-space:nowrap">
        <button class="btn btn-secundario btn-sm btn-tabela" data-acao="ver" data-id="${r.id}" title="Detalhes">👁</button>
        <button class="btn btn-secundario btn-sm btn-tabela" data-acao="editar" data-id="${r.id}" title="Editar">✎</button>
        <button class="btn btn-secundario btn-sm btn-tabela" data-acao="status" data-id="${r.id}" title="Status">⇅</button>
        <button class="btn btn-secundario btn-sm btn-tabela" data-acao="obs" data-id="${r.id}" title="Observações">📝</button>
        <button class="btn btn-perigo btn-sm btn-tabela" data-acao="excluir" data-id="${r.id}" title="Excluir">🗑</button>
      </td>
    </tr>`;
}
document.getElementById("lista-meses").addEventListener("click",e=>{
  const cab=e.target.closest(".mes-cabecalho");
  if(cab){
    const g=cab.parentElement;const m=g.dataset.mes;
    g.classList.toggle("expandido");
    cab.querySelector(".mes-toggle").textContent=g.classList.contains("expandido")?"▼":"▶";
    if(g.classList.contains("expandido"))mesesExpandidos.add(m);else mesesExpandidos.delete(m);
    return;
  }
  const btn=e.target.closest("[data-acao]");
  if(!btn)return;
  const id=btn.dataset.id,acao=btn.dataset.acao;
  if(acao==="ver")abrirDetalhes(id);
  else if(acao==="editar")abrirWizardEdicao(id);
  else if(acao==="status")abrirModalStatus(id);
  else if(acao==="obs")abrirModalObs(id);
  else if(acao==="excluir")confirmarExclusao(id);
});

/* ============================================================
   13. RENDERIZAÇÃO — DASHBOARD
   ============================================================ */
let charts={};
function destruirCharts(){Object.values(charts).forEach(c=>{try{c.destroy();}catch(e){}});charts={};}

function renderizarDashboard(){
  const {dados,m,paretoTipo,paretoCausa,ranking,recs,serie,agora}=analisar();
  document.getElementById("sub-dash").textContent=`${dados.length} registros · atualizado ${new Date().toLocaleTimeString("pt-BR")}`;

  document.getElementById("kpi-princ").innerHTML=`
    <div class="kpi"><div class="kpi__rotulo">Total de bloqueios</div><div class="kpi__valor">${m.total}</div></div>
    <div class="kpi ${m.ativos>0?"perigo":"sucesso"}"><div class="kpi__rotulo">Bloqueios ativos</div><div class="kpi__valor">${m.ativos}</div><div class="kpi__sub">${m.ativos>0?"impacto assistencial":"nenhum ativo"}</div></div>
    <div class="kpi sucesso"><div class="kpi__rotulo">Leitos liberados</div><div class="kpi__valor">${m.liberados}</div></div>
    <div class="kpi ${m.taxaLiberacao>=80?"sucesso":m.taxaLiberacao>=60?"alerta":"perigo"}"><div class="kpi__rotulo">Taxa de liberação</div><div class="kpi__valor">${m.taxaLiberacao.toFixed(1)}%</div></div>
    <div class="kpi alerta"><div class="kpi__rotulo">Tempo total indisponível</div><div class="kpi__valor" style="font-size:20px">${formatDur(m.tempoTotal)}</div></div>
    <div class="kpi info"><div class="kpi__rotulo">TMR</div><div class="kpi__valor" style="font-size:20px">${formatDur(m.tmr)}</div><div class="kpi__sub">Tempo Médio Reparo</div></div>
  `;

  const recs_unico=new Set(recs.map(r=>r.quarto)).size;
  const tmaTexto=m.tmaCalculavel?formatDur(m.tma):"n/d";
  const tmaSub=m.tmaCalculavel?`${dados.filter(r=>r.inicioAtendimento).length} registro(s) com atendimento`:"informe 'Início de atendimento'";
  document.getElementById("kpi-compl").innerHTML=`
    <div class="kpi ${m.tmaCalculavel?"info":"neutro"}"><div class="kpi__rotulo">TMA</div><div class="kpi__valor" style="font-size:18px">${tmaTexto}</div><div class="kpi__sub">${tmaSub}</div></div>
    <div class="kpi ${recs_unico>0?"alerta":"sucesso"}"><div class="kpi__rotulo">Quartos recorrentes</div><div class="kpi__valor" style="font-size:22px">${recs_unico}</div></div>
    <div class="kpi perigo"><div class="kpi__rotulo">Maior bloqueio</div><div class="kpi__valor" style="font-size:18px">${formatDur(m.maior)}</div></div>
    <div class="kpi ${m.criticos>0?"perigo":"sucesso"}"><div class="kpi__rotulo">Bloqueios críticos</div><div class="kpi__valor" style="font-size:22px">${m.criticos}</div><div class="kpi__sub">UTI / Isolamento</div></div>
  `;

  renderizarCharts(dados,m,paretoTipo,ranking,serie);
  renderizarAnaliseExec(dados,m,paretoTipo,paretoCausa,ranking,recs,serie);
  renderizarRecomendacoes(dados,m,recs,paretoCausa,agora);
  renderizarInsights(dados,m,paretoTipo,paretoCausa,ranking,recs,serie);
}

function renderizarCharts(dados,m,paretoTipo,ranking,serie){
  destruirCharts();
  if(typeof Chart==="undefined")return;
  Chart.defaults.font.family="'Segoe UI',Roboto,system-ui,sans-serif";
  Chart.defaults.font.size=12;
  const cs=getComputedStyle(document.documentElement);
  const CORES={
    cp800:cs.getPropertyValue("--cp800").trim()||"#0a2a4a",
    cp600:cs.getPropertyValue("--cp600").trim()||"#1d4ed8",
    cs:cs.getPropertyValue("--cs").trim()||"#16a34a",
    ca:cs.getPropertyValue("--ca").trim()||"#f59e0b",
    cr:cs.getPropertyValue("--cr").trim()||"#dc2626",
    ci:cs.getPropertyValue("--ci").trim()||"#0ea5e9",
    cn:cs.getPropertyValue("--cn").trim()||"#64748b",
    grid:cs.getPropertyValue("--bd").trim()||"#e2e8f0"
  };
  const cor=m.taxaLiberacao>=80?CORES.cs:m.taxaLiberacao>=60?CORES.ca:CORES.cr;
  const gCtx=document.getElementById("ch-gauge");
  if(gCtx)charts.gauge=new Chart(gCtx,{
    type:"doughnut",
    data:{labels:["Liberados","Ativos"],datasets:[{data:[m.taxaLiberacao,100-m.taxaLiberacao],
      backgroundColor:[cor,"rgba(100,116,139,.15)"],borderWidth:0,circumference:240,rotation:240,cutout:"78%",borderRadius:8}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:false}}},
    plugins:[{id:"centro",afterDraw(c){const{ctx,chartArea}=c;if(!chartArea)return;
      const cx=(chartArea.left+chartArea.right)/2,cy=(chartArea.top+chartArea.bottom)/2+18;
      ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle=cor;ctx.font='700 32px "Segoe UI"';ctx.fillText(`${m.taxaLiberacao.toFixed(0)}%`,cx,cy);
      ctx.fillStyle=CORES.cn;ctx.font='500 11px "Segoe UI"';ctx.fillText("LIBERADOS",cx,cy+26);ctx.restore();}}]
  });
  const st={Bloqueado:0,Liberado:0};
  dados.forEach(r=>{st[estaAtivo(r)?"Bloqueado":"Liberado"]++;});
  document.getElementById("sub-status").textContent=`${dados.length} registros`;
  const sCtx=document.getElementById("ch-status");
  if(sCtx)charts.status=new Chart(sCtx,{
    type:"doughnut",
    data:{labels:Object.keys(st),datasets:[{data:Object.values(st),backgroundColor:[CORES.cr,CORES.cs],borderColor:"#fff",borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{boxWidth:10,boxHeight:10,padding:14,usePointStyle:true}}}}
  });
  const eCtx=document.getElementById("ch-evolucao");
  if(eCtx)charts.evo=new Chart(eCtx,{
    type:"line",
    data:{labels:serie.map(s=>s.mes.slice(5)+"/"+s.mes.slice(2,4)),
      datasets:[{label:"Bloqueios",data:serie.map(s=>s.quantidade),borderColor:CORES.cp800,backgroundColor:"rgba(10,42,74,.12)",
      borderWidth:3,tension:.35,fill:true,pointRadius:5,pointBackgroundColor:"#fff",pointBorderColor:CORES.cp800,pointBorderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{backgroundColor:CORES.cp800,padding:10,cornerRadius:6}},
      scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:CORES.grid}}}}
  });
  const pt=paretoTipo.slice(0,7);
  const pt80=pontoPareto(paretoTipo,80);
  document.getElementById("sub-pareto").textContent=`${pt80.itens} de ${pt80.total} tipos concentram 80%`;
  const pCtx=document.getElementById("ch-pareto");
  if(pCtx)charts.pareto=new Chart(pCtx,{
    type:"bar",
    data:{labels:pt.map(p=>p.chave),datasets:[
      {type:"bar",label:"Ocorrências",data:pt.map(p=>p.quantidade),backgroundColor:"rgba(29,78,216,.85)",borderRadius:6,maxBarThickness:40,yAxisID:"y"},
      {type:"line",label:"% acum.",data:pt.map(p=>p.percentualAcum),borderColor:CORES.cr,backgroundColor:CORES.cr,borderWidth:3,tension:.3,pointRadius:5,pointBackgroundColor:"#fff",pointBorderColor:CORES.cr,pointBorderWidth:2,yAxisID:"y1"}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:true,font:{size:11}}}},
      scales:{x:{grid:{display:false}},y:{beginAtZero:true,position:"left",grid:{color:CORES.grid}},
        y1:{beginAtZero:true,max:100,position:"right",grid:{drawOnChartArea:false},ticks:{callback:v=>v+"%"}}}}
  });
  const tqCtx=document.getElementById("ch-topq");
  if(tqCtx)charts.top=new Chart(tqCtx,{
    type:"bar",
    data:{labels:ranking.slice(0,10).map(r=>r.chave),datasets:[{label:"Bloqueios",data:ranking.slice(0,10).map(r=>r.ocorrencias),backgroundColor:"rgba(220,38,38,.75)",borderRadius:6,maxBarThickness:32}]},
    options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:CORES.grid}},y:{grid:{display:false}}}}
  });
  const scat=ranking.slice(0,20).map(r=>({x:r.ocorrencias,y:r.tempoHoras,label:r.chave}));
  const mCtx=document.getElementById("ch-matriz");
  if(mCtx)charts.matriz=new Chart(mCtx,{
    type:"scatter",
    data:{datasets:[{label:"Quartos",data:scat,backgroundColor:"rgba(220,38,38,.55)",borderColor:CORES.cr,borderWidth:1.5,pointRadius:c=>Math.min(6+(c.raw?.x??1)*1.5,16)}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{backgroundColor:CORES.cp800,padding:10,cornerRadius:6,callbacks:{label:c=>`${c.raw.label} — ${c.raw.x} ocorrência(s), ${c.raw.y.toFixed(0)}h`}}},
      scales:{x:{title:{display:true,text:"Ocorrências"},beginAtZero:true,grid:{color:CORES.grid},ticks:{stepSize:1}},
        y:{title:{display:true,text:"Horas indisponíveis"},beginAtZero:true,grid:{color:CORES.grid}}}}
  });
  const teCtx=document.getElementById("ch-tempo");
  if(teCtx)charts.tempo=new Chart(teCtx,{
    type:"bar",
    data:{labels:serie.map(s=>s.mes.slice(5)+"/"+s.mes.slice(2,4)),datasets:[{label:"Horas",data:serie.map(s=>Math.round(s.tempoHoras)),backgroundColor:serie.map(s=>s.tempoHoras>2000?CORES.cr:s.tempoHoras>1000?CORES.ca:CORES.cp600),borderRadius:6,maxBarThickness:44}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:CORES.cp800,padding:10,cornerRadius:6,callbacks:{label:c=>`${c.parsed.y}h`}}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:CORES.grid},ticks:{callback:v=>v+"h"}}}}
  });
}

function renderizarAnaliseExec(dados,m,paretoTipo,paretoCausa,ranking,recs,serie){
  if(!dados.length){document.getElementById("analise-exec").innerHTML='<p style="color:var(--tt)">Sem dados para análise.</p>';return;}
  const pt80=pontoPareto(paretoTipo,80);
  const topTipo=paretoTipo[0];
  const topCausa=paretoCausa[0];
  const porTempo=[...paretoTipo].sort((a,b)=>b.tempoHoras-a.tempoHoras);
  const ultimo=serie[serie.length-1];
  const respostas=[
    {t:m.ativos>0?"atencao":"positivo",q:"O que aconteceu?",r:`Foram registrados ${m.total} bloqueios no período. ${m.liberados} (${m.taxaLiberacao.toFixed(1)}%) já foram liberados e ${m.ativos} permanecem ativos. Tempo total acumulado de indisponibilidade: ${formatDur(m.tempoTotal)}.`},
    {t:"info",q:"Onde está concentrado?",r:`O tipo "${topTipo.chave}" lidera com ${topTipo.quantidade} ocorrências (${topTipo.percentual.toFixed(1)}%). Os ${pt80.itens} tipos mais frequentes concentram 80% do volume. Causa predominante: "${topCausa.chave}" (${topCausa.percentual.toFixed(1)}%).`},
    {t:"atencao",q:"Qual é o maior impacto?",r:`O tipo "${porTempo[0].chave}" concentra ${formatDur(porTempo[0].tempoHoras*3600)} de indisponibilidade acumulada (${(porTempo[0].tempoHoras*3600/m.tempoTotal*100).toFixed(1)}% do total).`,destaque:true},
    {t:"info",q:"Qual é a tendência?",r:ultimo&&ultimo.varAnt!==null?`${ultimo.mes}: ${ultimo.quantidade} bloqueios (${ultimo.varAnt>=0?"+":""}${ultimo.varAnt.toFixed(1)}% vs. anterior).`:"Base temporal insuficiente."},
    {t:recs.length?"critico":"positivo",q:"Qual é o principal risco?",r:recs.length?`Recorrência no quarto ${recs[0].quarto}: ${recs[0].ocorrencias}× "${recs[0].causaPadronizada}". Intervalo médio: ${recs[0].intervaloMedioDias.toFixed(0)} dias.`:`Quarto ${ranking[0]?.chave??"—"} concentra ${ranking[0]?.ocorrencias??0} bloqueios.`,destaque:recs.length>0},
    {t:"atencao",q:"O que deve ser priorizado?",r:`Prioridade 1: ${recs.length?`investigar quarto ${recs[0].quarto}`:"monitorar quartos recorrentes"}. Prioridade 2: liberar os ${m.ativos} bloqueios ativos. Prioridade 3: atacar a causa "${topCausa.chave}".`,destaque:true},
    {t:"info",q:"Qual ação recomendada?",r:"Recomenda-se: abrir investigação de causa-raiz nos quartos recorrentes; revisar cronograma preventivo de manutenção; priorizar equipe de plantão para os bloqueios ativos."}
  ];
  document.getElementById("analise-exec").innerHTML=respostas.map(r=>`
    <div class="pergunta ${r.t} ${r.destaque?"critico":""}">
      <div class="pergunta__rotulo">${r.q}</div>
      <div class="pergunta__texto">${escapeHtml(r.r)}</div>
    </div>`).join("");
}

function renderizarRecomendacoes(dados,m,recs,paretoCausa,agora){
  const lista=[];
  for(const r of recs.slice(0,3)){
    const grupo=dados.filter(x=>r.registros.includes(x.id));
    const tempo=grupo.reduce((s,x)=>s+(downtime(x,agora)||0),0);
    lista.push({p:"Alta",t:`Quarto ${r.quarto} — recorrência de "${r.causaPadronizada}"`,
      d:`Realizar análise de causa-raiz. A recorrência indica que a intervenção anterior não resolveu a origem do problema.`,
      ev:[`${r.ocorrencias} ocorrências em até 90 dias`,`Tempo indisponível: ${formatDur(tempo)}`,`Intervalo médio: ${r.intervaloMedioDias.toFixed(1)} dias`]});
  }
  if(m.ativos>0)lista.push({p:"Alta",t:`${m.ativos} bloqueio(s) ativo(s)`,
    d:"Bloqueios ativos comprometem disponibilidade assistencial. Verificar status operacional de cada caso.",
    ev:["Prioridade operacional imediata"]});
  if(paretoCausa[0]&&paretoCausa[0].percentual>=15)lista.push({p:"Média",t:`Concentração em "${paretoCausa[0].chave}"`,
    d:`${paretoCausa[0].quantidade} ocorrências. Avaliar padronização da solução e treinamento.`,
    ev:[`${paretoCausa[0].percentual.toFixed(1)}% das ocorrências`]});
  if(lista.length===0)lista.push({p:"Baixa",t:"Manter monitoramento",d:"Sem riscos críticos.",ev:[`${dados.length} registros`]});
  const corMap={Alta:"perigo",Média:"alerta",Baixa:"info"};
  document.getElementById("recomendacoes").innerHTML=lista.map(r=>`
    <div class="rec ${r.p.toLowerCase()}">
      <div class="rec-topo">
        <span class="badge ${corMap[r.p]}">Prioridade ${r.p}</span>
        <span class="rec-titulo">${escapeHtml(r.t)}</span>
      </div>
      <div class="rec-desc">${escapeHtml(r.d)}</div>
      <ul class="rec-ev">${r.ev.map(e=>`<li>· ${escapeHtml(e)}</li>`).join("")}</ul>
    </div>`).join("");
}

function renderizarInsights(dados,m,paretoTipo,paretoCausa,ranking,recs,serie){
  if(!dados.length){document.getElementById("insights").innerHTML='<li>Sem dados.</li>';return;}
  const ins=[];
  const pt80=pontoPareto(paretoTipo,80);
  ins.push({t:"info",titulo:"Concentração por tipo",texto:`"${paretoTipo[0].chave}" lidera com ${paretoTipo[0].quantidade} ocorrências (${paretoTipo[0].percentual.toFixed(1)}%). ${pt80.itens} de ${pt80.total} tipos concentram 80%.`});
  ins.push({t:"info",titulo:"Causa predominante",texto:`"${paretoCausa[0].chave}" representa ${paretoCausa[0].percentual.toFixed(1)}% das ocorrências.`});
  if(recs.length)ins.push({t:"aviso",titulo:"Recorrência detectada",texto:`Quarto ${recs[0].quarto} teve ${recs[0].ocorrencias} ocorrências de "${recs[0].causaPadronizada}".`});
  if(ranking[0]?.ocorrencias>1)ins.push({t:"aviso",titulo:"Quarto crítico",texto:`${ranking[0].chave}: ${ranking[0].ocorrencias} bloqueios, ${formatDur(ranking[0].tempoHoras*3600)} acumulados.`});
  const ultimo=serie[serie.length-1];
  if(ultimo?.varAnt!==null)ins.push({t:ultimo.varAnt>15?"critico":"info",titulo:"Tendência mensal",texto:`${ultimo.mes}: ${ultimo.quantidade} bloqueios (${ultimo.varAnt>=0?"+":""}${ultimo.varAnt.toFixed(1)}%).`});
  if(m.tmaCalculavel)ins.push({t:"positivo",titulo:"TMA calculável",texto:`Tempo médio entre solicitação e início de atendimento: ${formatDur(m.tma)}.`});
  else ins.push({t:"aviso",titulo:"TMA não calculável",texto:'Nenhum registro possui "início de atendimento". Use o botão "▶ Iniciar atendimento" no drawer ou edite registros.'});
  const icones={critico:"🔴",aviso:"🟡",positivo:"🟢",info:"🔵"};
  document.getElementById("insights").innerHTML=ins.map(i=>`<li>${icones[i.t]}<div><strong>${escapeHtml(i.titulo)}.</strong> ${escapeHtml(i.texto)}</div></li>`).join("");
}

/* ============================================================
   14. CONFIGURAÇÕES
   ============================================================ */
function descreverCond(c){
  const p=[];
  if(c.tiposAmbiente?.length)p.push(`ambiente ∈ {${c.tiposAmbiente.join(", ")}}`);
  if(c.categorias?.length)p.push(`categoria ∈ {${c.categorias.join(", ")}}`);
  if(c.prioridades?.length)p.push(`prioridade ∈ {${c.prioridades.join(", ")}}`);
  if(c.duracaoMinHoras!==undefined)p.push(`duração ≥ ${c.duracaoMinHoras}h`);
  return p.join(" E ")||"qualquer";
}
function renderizarConfig(aba){
  aba=aba||"param";
  const cont=document.getElementById("cfg-corpo");
  if(aba==="param"){
    const p=State.config.parametros;
    cont.innerHTML=`<div class="card"><div class="card__cabecalho"><h3 class="card__titulo">⚙️ Parâmetros operacionais</h3></div><div class="card__corpo">
      <div class="form-grid">
        <div class="form-campo"><label>Meta taxa de liberação (%)</label><input type="number" id="p-taxa" value="${p.metaTaxaLiberacaoPct}"></div>
        <div class="form-campo"><label>Meta TMR (horas)</label><input type="number" id="p-tmr" value="${p.metaTMRHoras}"></div>
        <div class="form-campo"><label>Meta TMA (horas)</label><input type="number" id="p-tma" value="${p.metaTMAHoras}"></div>
        <div class="form-campo"><label>Bloqueio prolongado (horas)</label><input type="number" id="p-bloq" value="${p.limiteBloqueioProlongadoHoras}"></div>
        <div class="form-campo"><label>Janela de recorrência (dias)</label><input type="number" id="p-rec" value="${p.janelaRecorrenciaDias}"></div>
      </div>
      <div style="margin-top:16px;text-align:right"><button class="btn btn-sucesso" id="p-salvar">✓ Salvar</button></div>
    </div></div>`;
    document.getElementById("p-salvar").addEventListener("click",()=>{
      State.config.parametros={
        metaTaxaLiberacaoPct:+document.getElementById("p-taxa").value||90,
        metaTMRHoras:+document.getElementById("p-tmr").value||24,
        metaTMAHoras:+document.getElementById("p-tma").value||4,
        limiteBloqueioProlongadoHoras:+document.getElementById("p-bloq").value||72,
        janelaRecorrenciaDias:+document.getElementById("p-rec").value||90
      };
      persistir();toast("Parâmetros salvos.","sucesso");
    });
    return;
  }
  if(aba==="cadastros"){
    const grupos=[
      {t:"Tipos de serviço",chave:"tiposServico"},
      {t:"Categorias",chave:"categorias"},
      {t:"Responsáveis",chave:"responsaveis"}
    ];
    cont.innerHTML=`<div class="grid-2">${grupos.map(g=>`
      <div class="card"><div class="card__cabecalho"><h3 class="card__titulo">${g.t}</h3></div><div class="card__corpo">
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
          ${State.config[g.chave].map(i=>`<span class="chip"><strong>${escapeHtml(i)}</strong><button class="chip__x" data-rm-cad="${g.chave}::${escapeHtml(i)}">×</button></span>`).join("")}
        </div>
        <div style="display:flex;gap:8px">
          <input id="novo-${g.chave}" placeholder="Novo..." style="flex:1;padding:8px 10px;border:1px solid var(--bdf);border-radius:var(--r1);background:var(--bgs);color:var(--cp900)">
          <button class="btn btn-primario btn-sm" data-add-cad="${g.chave}">Adicionar</button>
        </div>
      </div></div>`).join("")}</div>`;
    cont.querySelectorAll("[data-rm-cad]").forEach(b=>{
      b.addEventListener("click",()=>{
        const[chave,item]=b.dataset.rmCad.split("::");
        State.config[chave]=State.config[chave].filter(x=>x!==item);
        persistir();renderizarConfig("cadastros");toast("Item removido.","alerta");
      });
    });
    cont.querySelectorAll("[data-add-cad]").forEach(b=>{
      b.addEventListener("click",()=>{
        const chave=b.dataset.addCad;
        const inp=document.getElementById(`novo-${chave}`);
        const val=inp.value.trim();
        if(!val)return;
        if(State.config[chave].includes(val)){toast("Item já existe.","alerta");return;}
        State.config[chave].push(val);
        persistir();renderizarConfig("cadastros");toast("Item adicionado.","sucesso");
      });
    });
    return;
  }
  if(aba==="criticidade"){
    cont.innerHTML=`<div class="card"><div class="card__cabecalho"><h3 class="card__titulo">⭐ Regras de criticidade</h3></div><div class="card__corpo">
      <p style="font-size:13px;color:var(--tt);margin-bottom:16px">Avaliadas em ordem crescente. A primeira que casar vence.</p>
      ${State.config.regrasCriticidade.slice().sort((a,b)=>a.ordem-b.ordem).map(r=>`
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid var(--bd);border-left:4px solid var(--cp600);border-radius:var(--r1);margin-bottom:8px">
          <strong style="color:var(--cp800)">#${r.ordem}</strong>
          <div style="flex:1">
            <div style="font-weight:600;color:var(--cp900);font-size:13px">${escapeHtml(r.nome)}</div>
            <div style="font-size:11px;color:var(--tt);margin-top:4px">SE ${descreverCond(r.cond)} → <span class="badge ${r.resultado==="Crítica"?"perigo":r.resultado==="Alta"?"alerta":"info"}">${r.resultado}</span></div>
          </div>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px">
            <input type="checkbox" ${r.ativo?"checked":""} data-regra-ativo="${r.id}"> Ativa
          </label>
        </div>`).join("")}
    </div></div>`;
    cont.querySelectorAll("[data-regra-ativo]").forEach(cb=>{
      cb.addEventListener("change",()=>{
        const reg=State.config.regrasCriticidade.find(x=>x.id===cb.dataset.regraAtivo);
        if(reg)reg.ativo=cb.checked;
        aplicarRegrasCriticidade();invalidarCache();persistir();
        renderizarTudo();toast("Regra atualizada.","sucesso");
      });
    });
    return;
  }
  if(aba==="sla"){
    const porTipo={"Ar Condicionado":24,"Elétrica":12,"Hidráulica":24,"Civil":48,"Reforma Geral":720,"Pintura":48,"Persiana/Cortina":12,"Geral":24};
    cont.innerHTML=`<div class="card"><div class="card__cabecalho"><h3 class="card__titulo">⏱️ SLA por tipo de serviço</h3></div><div class="card__corpo">
      <table class="tabela"><thead><tr><th>Tipo</th><th style="text-align:right">SLA</th><th style="text-align:right">Equivalente</th></tr></thead>
      <tbody>${Object.entries(porTipo).map(([t,h])=>`<tr><td>${t}</td><td style="text-align:right">${h}h</td><td style="text-align:right;color:var(--tt)">${h>=24?(h/24).toFixed(1)+" dia(s)":h+"h"}</td></tr>`).join("")}
      </tbody></table>
    </div></div>`;
    return;
  }
}

/* ============================================================
   15. HISTÓRICO
   ============================================================ */
function registrarHistorico(registroId,acao,statusAnterior,statusNovo,obs){
  State.historico.push({id:uid(),registroId,dataHora:new Date().toISOString(),acao,statusAnterior,statusNovo,observacao:obs,usuario:"operador"});
}

/* ============================================================
   16. WIZARD DE NOVO REGISTRO
   ============================================================ */
let wiz={etapa:1,editando:false,registro:null};
const ETAPAS=["Localização","Bloqueio","Manutenção","Liberação","Revisão"];

function contextoQuarto(quarto){
  if(!quarto||quarto.length<3)return null;
  const registros=State.registros.filter(r=>r.quarto.toLowerCase()===quarto.toLowerCase())
    .sort((a,b)=>String(b.dataBloqueio||"").localeCompare(String(a.dataBloqueio||"")))
    .slice(0,4);
  if(!registros.length)return null;
  return registros;
}

function abrirWizardNovo(){
  const maxCodigo=State.registros.reduce((acc,r)=>{const m=r.codigo?.match(/BLQ-(\d+)/);return m?Math.max(acc,parseInt(m[1])):acc;},0);
  const agora=new Date();
  const horaAgora=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;
  wiz={
    etapa:1,editando:false,
    registro:{
      id:uid(),
      codigo:`BLQ-${String(maxCodigo+1).padStart(4,"0")}`,
      unidade:"HOSPITAL",setor:"",quarto:"",leito:"",tipoAmbiente:"Apartamento",
      dataSolicitacao:hojeISO(),horaSolicitacao:horaAgora,
      dataBloqueio:hojeISO(),horaBloqueio:horaAgora,
      previsaoLiberacao:"",inicioAtendimento:"",
      dataLiberacao:"",horaLiberacao:"",
      statusSistema:"Bloqueado",
      tipoServico:"",categoria:"Outros",causaPadronizada:"Outros",
      descricaoProblema:"",responsavel:State.config.responsaveis[0]||"Amauri",
      prioridade:"Média",criticidade:"Média",
      houveRecorrencia:false,quantidadeRecorrencias:0,
      houveImpedimento:false,tipoImpedimento:"",
      observacao:"",ordemServico:"",
      createdAt:agora.toISOString(),updatedAt:agora.toISOString(),
      createdBy:"operador",updatedBy:"operador",arquivado:false
    }
  };
  document.getElementById("wiz-titulo").textContent=`Novo registro — ${wiz.registro.codigo}`;
  renderWizard();
  abrirModal("modal-wiz");
}
function abrirWizardEdicao(id){
  const reg=State.registros.find(r=>r.id===id);
  if(!reg){toast("Registro não encontrado.","erro");return;}
  wiz={etapa:1,editando:true,registro:clonar(reg)};
  document.getElementById("wiz-titulo").textContent=`Editar ${reg.codigo} — ${reg.quarto}`;
  renderWizard();
  abrirModal("modal-wiz");
}

function renderWizard(){
  document.getElementById("wiz-stepper").innerHTML=ETAPAS.map((p,i)=>`
    <div class="wiz-step ${wiz.etapa===i+1?"ativo":""} ${wiz.etapa>i+1?"feito":""}">
      <span class="wiz-num">${i+1}</span>${p}
    </div>`).join("");

  const r=wiz.registro;
  let html="";

  if(wiz.etapa===1){
    const ctx=contextoQuarto(r.quarto);
    html=`
      <div class="wiz-secao">
        <div class="wiz-secao__titulo">📍 Localização do leito</div>
        <div class="form-grid">
          <div class="form-campo largo">
            <label>Quarto / Leito <span class="obrig">*</span></label>
            <input id="w-quarto" value="${escapeHtml(r.quarto||"")}" placeholder="Ex: 806, UTI1-LEITO7, UTI 1 - Box 11" autofocus>
            <span class="ajuda">Digite o número do quarto ou leito. O sistema identifica automaticamente unidade, setor e tipo.</span>
          </div>
          <div class="form-campo"><label>Leito</label><input id="w-leito" value="${escapeHtml(r.leito||"")}" placeholder="Ex: A, 1, 2"></div>
          <div class="form-campo"><label>Unidade <span class="obrig">*</span></label><input id="w-unidade" value="${escapeHtml(r.unidade||"")}"></div>
          <div class="form-campo"><label>Setor <span class="obrig">*</span></label><input id="w-setor" value="${escapeHtml(r.setor||"")}"></div>
          <div class="form-campo"><label>Tipo de ambiente</label>
            <select id="w-ambiente">${["UTI","Enfermaria","Apartamento","Isolamento","Outro"].map(a=>`<option ${r.tipoAmbiente===a?"selected":""}>${a}</option>`).join("")}</select>
          </div>
          <div class="form-campo"><label>Criticidade</label>
            <select id="w-crit">${["Baixa","Média","Alta","Crítica"].map(c=>`<option ${r.criticidade===c?"selected":""}>${c}</option>`).join("")}</select>
          </div>
        </div>
        <div id="w-contexto">${ctx?renderContexto(ctx):""}</div>
      </div>`;
  } else if(wiz.etapa===2){
    html=`
      <div class="wiz-secao">
        <div class="wiz-secao__titulo">🕐 Datas e horários</div>
        <div class="form-grid">
          <div class="form-campo"><label>Data da solicitação <span class="obrig">*</span></label><input type="date" id="w-dts" value="${r.dataSolicitacao||""}"></div>
          <div class="form-campo"><label>Hora da solicitação</label><input type="time" id="w-hrs" value="${r.horaSolicitacao||""}"></div>
          <div class="form-campo"><label>Data do bloqueio <span class="obrig">*</span></label><input type="date" id="w-dtb" value="${r.dataBloqueio||""}"></div>
          <div class="form-campo"><label>Hora do bloqueio <span class="obrig">*</span></label><input type="time" id="w-hrb" value="${r.horaBloqueio||""}"></div>
        </div>
      </div>
      <div class="wiz-secao">
        <div class="wiz-secao__titulo">📅 Previsão e prioridade</div>
        <div class="form-grid">
          <div class="form-campo"><label>Previsão de liberação</label><input type="date" id="w-prev" value="${r.previsaoLiberacao||""}"></div>
          <div class="form-campo"><label>Prioridade</label>
            <select id="w-prio">${["Baixa","Média","Alta","Urgente"].map(p=>`<option ${r.prioridade===p?"selected":""}>${p}</option>`).join("")}</select>
          </div>
        </div>
      </div>`;
  } else if(wiz.etapa===3){
    html=`
      <div class="wiz-secao">
        <div class="wiz-secao__titulo">🔧 Natureza do serviço</div>
        <div class="form-grid">
          <div class="form-campo"><label>Tipo de serviço <span class="obrig">*</span></label>
            <select id="w-tipo"><option value="">Selecione…</option>
              ${State.config.tiposServico.map(t=>`<option ${r.tipoServico===t?"selected":""}>${t}</option>`).join("")}
            </select></div>
          <div class="form-campo"><label>Categoria <span class="obrig">*</span></label>
            <select id="w-cat">${State.config.categorias.map(c=>`<option ${r.categoria===c?"selected":""}>${c}</option>`).join("")}</select></div>
          <div class="form-campo"><label>Causa padronizada <span class="obrig">*</span></label>
            <select id="w-causaPad">
              ${["Falha em equipamento","Vazamento / Infiltração","Problema elétrico","Problema hidráulico","Dano estrutural","Manutenção preventiva","Instalação","Obstrução","Odor / Qualidade do ar","Praga","Pintura","Reforma planejada","Outros"].map(c=>`<option ${r.causaPadronizada===c?"selected":""}>${c}</option>`).join("")}
            </select></div>
          <div class="form-campo"><label>Responsável <span class="obrig">*</span></label>
            <select id="w-resp">${State.config.responsaveis.map(x=>`<option ${r.responsavel===x?"selected":""}>${x}</option>`).join("")}</select></div>
          <div class="form-campo largo"><label>Descrição do problema</label>
            <textarea id="w-desc" rows="3" placeholder="Detalhamento livre (sintomas, contexto, materiais envolvidos…)">${escapeHtml(r.descricaoProblema||"")}</textarea></div>
        </div>
      </div>
      <div class="wiz-secao">
        <div class="wiz-secao__titulo">⚡ Início do atendimento (base para o TMA)</div>
        <div class="form-grid">
          <div class="form-campo largo">
            <input type="datetime-local" id="w-ini" value="${r.inicioAtendimento||""}">
            <span class="ajuda">Preencha quando a equipe efetivamente iniciou o reparo. Este campo alimenta o Tempo Médio de Atendimento (TMA) no dashboard.</span>
          </div>
        </div>
      </div>
      <div class="wiz-secao">
        <div class="wiz-secao__titulo">⏸️ Impedimento (se aplicável)</div>
        <div class="form-grid">
          <div class="form-campo"><label>Houve impedimento?</label>
            <select id="w-imped"><option value="0" ${!r.houveImpedimento?"selected":""}>Não</option><option value="1" ${r.houveImpedimento?"selected":""}>Sim</option></select></div>
          <div class="form-campo"><label>Tipo de impedimento</label>
            <select id="w-tipoImp"><option value="">—</option>
              ${["Material","Terceiro","Aprovação","Acesso","Outro"].map(x=>`<option ${r.tipoImpedimento===x?"selected":""}>${x}</option>`).join("")}
            </select></div>
        </div>
      </div>`;
  } else if(wiz.etapa===4){
    html=`
      <div class="wiz-secao">
        <div class="wiz-secao__titulo">✅ Liberação do leito</div>
        <div class="form-grid">
          <div class="form-campo"><label>Data de liberação</label><input type="date" id="w-dtl" value="${r.dataLiberacao||""}"></div>
          <div class="form-campo"><label>Hora de liberação</label><input type="time" id="w-hrl" value="${r.horaLiberacao||""}" ${!r.dataLiberacao?"disabled":""}></div>
          <div class="form-campo largo"><span style="font-size:12px;color:var(--tt)">Deixe em branco se o bloqueio permanece ativo. O status é atualizado automaticamente ao salvar.</span></div>
        </div>
      </div>`;
  } else if(wiz.etapa===5){
    html=`
      <div class="wiz-secao">
        <div class="wiz-secao__titulo">📎 Informações complementares</div>
        <div class="form-grid">
          <div class="form-campo"><label>Ordem de serviço (O.S.)</label><input id="w-os" value="${escapeHtml(r.ordemServico||"")}" placeholder="Ex: O.S. 6127717"></div>
          <div class="form-campo"><label>Houve recorrência?</label>
            <select id="w-rec"><option value="0" ${!r.houveRecorrencia?"selected":""}>Não</option><option value="1" ${r.houveRecorrencia?"selected":""}>Sim</option></select></div>
          <div class="form-campo largo"><label>Observações finais</label>
            <textarea id="w-obs" rows="4" placeholder="Anotações complementares...">${escapeHtml(r.observacao||"")}</textarea></div>
        </div>
      </div>
      ${renderPreview(r)}`;
  }

  document.getElementById("wiz-corpo").innerHTML=html;
  document.getElementById("wiz-rodape").innerHTML=`
    ${wiz.etapa>1?'<button class="btn btn-secundario" id="wiz-voltar">← Voltar</button>':""}
    ${wiz.etapa<5?'<button class="btn btn-primario" id="wiz-avancar">Avançar →</button>':""}
    ${wiz.etapa===5?`<button class="btn btn-sucesso btn-lg" id="wiz-salvar">${wiz.editando?"✓ Salvar alterações":"✓ Criar registro"}</button>`:""}
  `;

  const q=document.getElementById("w-quarto");
  if(q)q.addEventListener("input",()=>{
    const v=q.value.trim();
    if(v.length>=3){
      const l=normalizarLocal(v);
      const u=document.getElementById("w-unidade");if(u)u.value=l.unidade;
      const s=document.getElementById("w-setor");if(s)s.value=l.setor;
      const a=document.getElementById("w-ambiente");if(a)a.value=l.tipoAmbiente;
      if(l.leito){const le=document.getElementById("w-leito");if(le)le.value=l.leito;}
      const ctx=contextoQuarto(l.quarto);
      const ctxEl=document.getElementById("w-contexto");
      if(ctxEl)ctxEl.innerHTML=ctx?renderContexto(ctx):"";
    }else{
      const ctxEl=document.getElementById("w-contexto");
      if(ctxEl)ctxEl.innerHTML="";
    }
  });
  const tipoEl=document.getElementById("w-tipo");
  if(tipoEl)tipoEl.addEventListener("change",e=>{
    const cat=classificarCategoria(e.target.value);
    const catEl=document.getElementById("w-cat");
    if(catEl)catEl.value=cat;
  });
  const dtl=document.getElementById("w-dtl");
  if(dtl)dtl.addEventListener("change",e=>{
    const hrl=document.getElementById("w-hrl");
    if(hrl)hrl.disabled=!e.target.value;
  });
  const voltar=document.getElementById("wiz-voltar");
  if(voltar)voltar.addEventListener("click",()=>{coletarWizard();wiz.etapa--;renderWizard();});
  const avancar=document.getElementById("wiz-avancar");
  if(avancar)avancar.addEventListener("click",()=>{
    coletarWizard();
    if(validarEtapa(wiz.etapa,wiz.registro).length>0)return;
    wiz.etapa++;renderWizard();
  });
  const salvar=document.getElementById("wiz-salvar");
  if(salvar)salvar.addEventListener("click",()=>{
    coletarWizard();
    if(validarEtapa(5,wiz.registro).length>0)return;
    salvarRegistroWizard();
  });
}

function renderContexto(registros){
  const ult=registros.slice(0,3);
  return `
    <div class="wiz-contexto">
      <div class="wiz-contexto__titulo">📚 Histórico deste quarto (${registros.length} ocorrência${registros.length>1?"s":""})</div>
      <ul class="wiz-contexto__lista">
        ${ult.map(r=>`
          <li class="wiz-contexto__item">
            <span class="wiz-contexto__item-causa">${escapeHtml(r.causaPadronizada)}</span>
            <span class="wiz-contexto__item-data">${dataBR(r.dataBloqueio)}</span>
          </li>`).join("")}
      </ul>
      ${registros.length>=2?`<div class="wiz-alerta-recorrencia">⚠ Este quarto já teve ${registros.length} ocorrências. Considere vincular como recorrência.</div>`:""}
    </div>`;
}

function renderPreview(r){
  return `
    <div class="wiz-preview">
      <div style="font-weight:700;color:var(--cp800);margin-bottom:6px;font-size:11px;text-transform:uppercase;letter-spacing:.04em">Resumo do registro</div>
      <div class="wiz-preview__linha"><span>Localização:</span><strong>${escapeHtml(r.quarto||"—")} · ${escapeHtml(r.setor||"—")} · ${escapeHtml(r.tipoAmbiente)}</strong></div>
      <div class="wiz-preview__linha"><span>Bloqueio:</span><strong>${dataBR(r.dataBloqueio)} ${escapeHtml(r.horaBloqueio||"")}</strong></div>
      <div class="wiz-preview__linha"><span>Serviço:</span><strong>${escapeHtml(r.tipoServico||"—")} · ${escapeHtml(r.categoria)}</strong></div>
      <div class="wiz-preview__linha"><span>Causa:</span><strong>${escapeHtml(r.causaPadronizada)}</strong></div>
      <div class="wiz-preview__linha"><span>Responsável:</span><strong>${escapeHtml(r.responsavel)}</strong></div>
      ${r.inicioAtendimento?`<div class="wiz-preview__linha"><span>Início atend.:</span><strong>${new Date(r.inicioAtendimento).toLocaleString("pt-BR")}</strong></div>`:""}
      ${r.dataLiberacao?`<div class="wiz-preview__linha"><span>Liberação:</span><strong>${dataBR(r.dataLiberacao)} ${escapeHtml(r.horaLiberacao||"")}</strong></div>`:""}
    </div>`;
}

function coletarWizard(){
  const r=wiz.registro;
  const get=id=>document.getElementById(id)?.value||"";
  if(wiz.etapa===1){
    r.quarto=get("w-quarto").trim();
    r.leito=get("w-leito").trim()||undefined;
    r.unidade=get("w-unidade").trim();
    r.setor=get("w-setor").trim();
    r.tipoAmbiente=get("w-ambiente");
    r.criticidade=get("w-crit");
  } else if(wiz.etapa===2){
    r.dataSolicitacao=get("w-dts");
    r.horaSolicitacao=get("w-hrs")||undefined;
    r.dataBloqueio=get("w-dtb");
    r.horaBloqueio=get("w-hrb");
    r.previsaoLiberacao=get("w-prev")||undefined;
    r.prioridade=get("w-prio");
  } else if(wiz.etapa===3){
    r.tipoServico=get("w-tipo");
    r.categoria=get("w-cat");
    r.causaPadronizada=get("w-causaPad");
    r.responsavel=get("w-resp");
    r.inicioAtendimento=get("w-ini")||undefined;
    r.descricaoProblema=get("w-desc").trim()||undefined;
    r.houveImpedimento=get("w-imped")==="1";
    r.tipoImpedimento=get("w-tipoImp")||undefined;
  } else if(wiz.etapa===4){
    r.dataLiberacao=get("w-dtl")||undefined;
    r.horaLiberacao=get("w-hrl")||undefined;
  } else if(wiz.etapa===5){
    r.ordemServico=get("w-os").trim()||undefined;
    r.houveRecorrencia=get("w-rec")==="1";
    r.observacao=get("w-obs").trim()||undefined;
  }
}
function validarEtapa(etapa,r){
  const erros=[];
  if(etapa===1){
    if(!r.quarto)erros.push("Quarto/Leito é obrigatório.");
    if(!r.unidade)erros.push("Unidade é obrigatória.");
    if(!r.setor)erros.push("Setor é obrigatório.");
  }
  if(etapa===2){
    if(!r.dataSolicitacao)erros.push("Data da solicitação é obrigatória.");
    if(!r.dataBloqueio)erros.push("Data do bloqueio é obrigatória.");
    if(!r.horaBloqueio)erros.push("Hora do bloqueio é obrigatória.");
    if(r.previsaoLiberacao&&r.dataBloqueio&&r.previsaoLiberacao<r.dataBloqueio)erros.push("Previsão não pode ser anterior ao bloqueio.");
    if(r.dataSolicitacao&&r.dataBloqueio&&r.dataBloqueio<r.dataSolicitacao)erros.push("Bloqueio não pode ser anterior à solicitação.");
  }
  if(etapa===3){
    if(!r.tipoServico)erros.push("Tipo de serviço é obrigatório.");
    if(!r.categoria)erros.push("Categoria é obrigatória.");
    if(!r.causaPadronizada)erros.push("Causa padronizada é obrigatória.");
    if(!r.responsavel)erros.push("Responsável é obrigatório.");
    if(r.inicioAtendimento&&r.dataSolicitacao){
      const ini=new Date(r.inicioAtendimento);
      const sol=comporDT(r.dataSolicitacao,r.horaSolicitacao);
      if(sol&&ini<sol)erros.push("Início do atendimento não pode ser anterior à solicitação.");
    }
  }
  if(etapa===4){
    if(r.dataLiberacao&&!r.horaLiberacao)erros.push("Hora da liberação é obrigatória quando há data.");
    if(r.dataLiberacao&&r.dataBloqueio&&r.dataLiberacao<r.dataBloqueio)erros.push("Liberação não pode ser anterior ao bloqueio.");
  }
  const errosEl=document.getElementById("wiz-erros");
  if(errosEl)errosEl.innerHTML=erros.length?
    `<div class="wiz-erros"><strong>Corrija antes de continuar:</strong><ul>${erros.map(e=>`<li>${escapeHtml(e)}</li>`).join("")}</ul></div>`:"";
  return erros;
}

function salvarRegistroWizard(){
  const r=wiz.registro;
  r.updatedAt=new Date().toISOString();
  r.statusSistema=estaAtivo(r)?"Bloqueado":"Liberado";
  const eraEdicao=wiz.editando;

  if(eraEdicao){
    const idx=State.registros.findIndex(x=>x.id===r.id);
    if(idx<0){toast("Registro não encontrado para atualizar.","erro");return;}
    const original=State.registros[idx];
    State.registros[idx]={...original,...r,createdAt:original.createdAt,createdBy:original.createdBy};
    registrarHistorico(r.id,"Atualizado");
    toast("Registro atualizado.","sucesso");
  } else {
    State.registros.push(r);
    registrarHistorico(r.id,"Criado");
    toast("Registro criado.","sucesso");
  }

  aplicarRegrasCriticidade();
  invalidarCache();
  const salvouOk=persistir();

  fecharModal("modal-wiz");
  atualizarOpcoesMes();

  // UX fix: se filtros esconderiam o novo registro, limpa-os para garantir visibilidade
  if(!eraEdicao&&r.dataBloqueio&&salvouOk){
    const mes=r.dataBloqueio.slice(0,7);
    mesesExpandidos.add(mes);
    const filtrandoQuarto=State.filtros.quarto&&!r.quarto.toLowerCase().includes(State.filtros.quarto.toLowerCase());
    const filtrandoCat=State.filtros.categoria&&r.categoria!==State.filtros.categoria;
    const filtrandoStatus=State.filtros.status&&((estaAtivo(r)?"Bloqueado":"Liberado")!==State.filtros.status);
    const filtrandoMes=State.filtros.mes&&State.filtros.mes!==mes;
    if(filtrandoQuarto||filtrandoCat||filtrandoStatus||filtrandoMes){
      State.filtros={quarto:"",categoria:"",status:"",mes:""};
      document.querySelectorAll("[data-filtros] input").forEach(i=>i.value="");
      document.querySelectorAll("[data-filtros] select").forEach(s=>s.value="");
      invalidarCache();
      toast("Filtros limpos para exibir o novo registro.","info");
    }
    setTimeout(()=>{
      const el=document.querySelector(`#lista-meses .mes-grupo[data-mes="${mes}"]`);
      el?.scrollIntoView({behavior:"smooth",block:"start"});
    },150);
  }
  renderizarTudo();
}

/* ============================================================
   17. AÇÕES
   ============================================================ */
let statusEditando=null,obsEditando=null,confirmCallback=null;

function abrirModalStatus(id){
  const r=State.registros.find(x=>x.id===id);
  if(!r)return;
  statusEditando=id;
  const transicoes={
    "Solicitado":["Bloqueado","Cancelado"],
    "Bloqueado":["Em Atendimento","Cancelado"],
    "Em Atendimento":["Aguardando Material","Aguardando Terceiro","Aguardando Aprovação","Liberado","Cancelado"],
    "Liberado":["Bloqueado"],
    "Cancelado":[]
  };
  const opcoes=transicoes[r.statusSistema]||["Bloqueado","Liberado","Cancelado"];
  document.getElementById("status-titulo").textContent=`Alterar status — ${r.codigo}`;
  document.getElementById("status-corpo").innerHTML=`
    <div class="form-campo" style="margin-bottom:12px">
      <label>Status atual</label>
      <div><span class="badge ${r.statusSistema==="Liberado"?"sucesso":"perigo"}">${r.statusSistema}</span></div>
    </div>
    <div class="form-campo" style="margin-bottom:12px">
      <label>Novo status</label>
      <select id="st-novo"><option value="">Selecione…</option>${opcoes.map(o=>`<option value="${o}">${o}</option>`).join("")}</select>
    </div>
    <div class="form-campo"><label>Observação (opcional)</label><textarea id="st-obs" rows="3"></textarea></div>`;
  abrirModal("modal-status");
}
document.getElementById("status-ok").addEventListener("click",()=>{
  const novo=document.getElementById("st-novo").value;
  if(!novo){toast("Selecione o novo status.","alerta");return;}
  const r=State.registros.find(x=>x.id===statusEditando);
  if(!r)return;
  const anterior=r.statusSistema;
  r.statusSistema=novo;
  r.updatedAt=new Date().toISOString();
  if(novo==="Liberado"&&!r.dataLiberacao){
    const ag=new Date();
    r.dataLiberacao=ag.toISOString().slice(0,10);
    r.horaLiberacao=ag.toTimeString().slice(0,5);
  }
  registrarHistorico(r.id,novo==="Liberado"?"Liberado":"StatusAlterado",anterior,novo,document.getElementById("st-obs").value.trim());
  invalidarCache();persistir();
  fecharModal("modal-status");
  toast(`Status alterado para "${novo}".`,"sucesso");
  renderizarTudo();
});

function abrirModalObs(id){
  const r=State.registros.find(x=>x.id===id);
  if(!r)return;
  obsEditando=id;
  document.getElementById("obs-titulo").textContent=`Observações — ${r.codigo} (${r.quarto})`;
  document.getElementById("obs-text").value=r.observacao||"";
  abrirModal("modal-obs");
}
document.getElementById("obs-salvar").addEventListener("click",()=>{
  const r=State.registros.find(x=>x.id===obsEditando);
  if(!r)return;
  r.observacao=document.getElementById("obs-text").value;
  r.updatedAt=new Date().toISOString();
  registrarHistorico(r.id,"ObservacaoAdicionada");
  invalidarCache();persistir();
  fecharModal("modal-obs");
  toast("Observação salva.","sucesso");
  renderizarTudo();
});

function confirmar(titulo,msg,cb){
  document.getElementById("confirm-titulo").textContent=titulo;
  document.getElementById("confirm-msg").textContent=msg;
  confirmCallback=cb;
  abrirModal("modal-confirm");
}
document.getElementById("confirm-ok").addEventListener("click",()=>{
  fecharModal("modal-confirm");
  const cb=confirmCallback;confirmCallback=null;
  if(cb)cb();
});
function confirmarExclusao(id){
  const r=State.registros.find(x=>x.id===id);
  if(!r)return;
  confirmar("Excluir registro",
    `Confirma a exclusão de ${r.codigo} (quarto ${r.quarto})? Esta ação não pode ser desfeita.`,
    ()=>{
      State.registros=State.registros.filter(x=>x.id!==id);
      invalidarCache();persistir();
      atualizarOpcoesMes();
      toast("Registro excluído.","alerta");
      renderizarTudo();
    });
}

/* ============================================================
   18. DETALHES (DRAWER)
   ============================================================ */
function abrirDetalhes(id){
  const r=State.registros.find(x=>x.id===id);
  if(!r)return;
  const eventos=State.historico.filter(e=>e.registroId===id).sort((a,b)=>b.dataHora.localeCompare(a.dataHora));
  const atraso=estaAtrasado(r);
  const tmaReg=calcularTMA([r]);
  document.getElementById("det-titulo").innerHTML=`${escapeHtml(r.codigo)} <span class="badge ${estaAtivo(r)?"perigo":"sucesso"}">${r.statusSistema}</span>`;
  document.getElementById("det-corpo").innerHTML=`
    ${atraso?`<div style="background:var(--cab);padding:8px 12px;border-radius:var(--r1);margin-bottom:16px;font-size:12px;color:#854d0e">⚠ Previsão de liberação vencida em ${r.previsaoLiberacao}</div>`:""}
    <section style="margin-bottom:20px">
      <h4 style="font-size:11px;text-transform:uppercase;color:var(--tt);margin-bottom:12px;letter-spacing:.05em">Identificação</h4>
      <div class="kv">
        <div><span class="kv-lbl">Quarto</span><span class="kv-val">${escapeHtml(r.quarto)}</span></div>
        <div><span class="kv-lbl">Leito</span><span class="kv-val">${escapeHtml(r.leito||"—")}</span></div>
        <div><span class="kv-lbl">Unidade</span><span class="kv-val">${escapeHtml(r.unidade)}</span></div>
        <div><span class="kv-lbl">Setor</span><span class="kv-val">${escapeHtml(r.setor)}</span></div>
        <div><span class="kv-lbl">Ambiente</span><span class="kv-val"><span class="badge ${r.tipoAmbiente==="UTI"?"perigo":"info"}">${r.tipoAmbiente}</span></span></div>
      </div>
    </section>
    <section style="margin-bottom:20px">
      <h4 style="font-size:11px;text-transform:uppercase;color:var(--tt);margin-bottom:12px;letter-spacing:.05em">Classificação</h4>
      <div class="kv">
        <div><span class="kv-lbl">Categoria</span><span class="kv-val">${escapeHtml(r.categoria)}</span></div>
        <div><span class="kv-lbl">Tipo de serviço</span><span class="kv-val">${escapeHtml(r.tipoServico)}</span></div>
        <div><span class="kv-lbl">Causa</span><span class="kv-val">${escapeHtml(r.causaPadronizada)}</span></div>
        <div><span class="kv-lbl">Prioridade</span><span class="kv-val">${escapeHtml(r.prioridade)}</span></div>
        <div><span class="kv-lbl">Criticidade</span><span class="kv-val"><span class="badge ${r.criticidade==="Crítica"?"perigo":r.criticidade==="Alta"?"alerta":"info"}">${r.criticidade}</span></span></div>
        <div><span class="kv-lbl">Responsável</span><span class="kv-val">${escapeHtml(r.responsavel)}</span></div>
      </div>
    </section>
    <section style="margin-bottom:20px">
      <h4 style="font-size:11px;text-transform:uppercase;color:var(--tt);margin-bottom:12px;letter-spacing:.05em">Tempos</h4>
      <div class="kv">
        <div><span class="kv-lbl">Solicitação</span><span class="kv-val">${dataBR(r.dataSolicitacao)} ${escapeHtml(r.horaSolicitacao||"")}</span></div>
        <div><span class="kv-lbl">Bloqueio</span><span class="kv-val">${dataBR(r.dataBloqueio)} ${escapeHtml(r.horaBloqueio||"")}</span></div>
        <div><span class="kv-lbl">Início atendimento</span><span class="kv-val">${r.inicioAtendimento?new Date(r.inicioAtendimento).toLocaleString("pt-BR"):"—"}</span></div>
        <div><span class="kv-lbl">Previsão</span><span class="kv-val">${r.previsaoLiberacao?dataBR(r.previsaoLiberacao):"—"}</span></div>
        <div><span class="kv-lbl">Liberação</span><span class="kv-val">${r.dataLiberacao?`${dataBR(r.dataLiberacao)} ${escapeHtml(r.horaLiberacao||"")}`:"—"}</span></div>
        <div style="grid-column:1/-1"><span class="kv-lbl">Tempo de indisponibilidade</span><span class="kv-val" style="font-size:16px;color:var(--cp800)">${formatDur(downtime(r))}</span></div>
        ${tmaReg!==null?`<div style="grid-column:1/-1"><span class="kv-lbl">TMA (solicitação → início)</span><span class="kv-val" style="font-size:16px;color:var(--cs)">${formatDur(tmaReg)}</span></div>`:""}
      </div>
    </section>
    ${r.descricaoProblema?`<section style="margin-bottom:20px"><h4 style="font-size:11px;text-transform:uppercase;color:var(--tt);margin-bottom:8px;letter-spacing:.05em">Descrição</h4><p style="font-size:13px;line-height:1.6">${escapeHtml(r.descricaoProblema)}</p></section>`:""}
    ${r.observacao?`<section style="margin-bottom:20px"><h4 style="font-size:11px;text-transform:uppercase;color:var(--tt);margin-bottom:8px;letter-spacing:.05em">Observações</h4><p style="font-size:13px;line-height:1.6">${escapeHtml(r.observacao)}</p></section>`:""}
    <section>
      <h4 style="font-size:11px;text-transform:uppercase;color:var(--tt);margin-bottom:12px;letter-spacing:.05em">Linha do tempo</h4>
      ${eventos.length===0?'<p style="font-size:12px;color:var(--tt);font-style:italic">Sem eventos registrados.</p>':`
        <ol class="timeline">${eventos.map(e=>`
          <li class="tl-item"><span class="tl-dot"></span><div>
            <div class="tl-titulo">${new Date(e.dataHora).toLocaleString("pt-BR")} — <b>${escapeHtml(e.acao)}</b></div>
            ${e.statusNovo?`<div style="font-size:11px;color:var(--cp600);margin-top:2px">${e.statusAnterior?escapeHtml(e.statusAnterior)+" → ":""}${escapeHtml(e.statusNovo)}</div>`:""}
            ${e.observacao?`<div class="tl-obs">${escapeHtml(e.observacao)}</div>`:""}
          </div></li>`).join("")}
        </ol>`}
    </section>`;
  const btnIniciar = !r.inicioAtendimento && estaAtivo(r) ?
    `<button class="btn btn-sucesso" id="det-iniciar">▶ Iniciar atendimento</button>` : "";
  document.getElementById("det-rodape").innerHTML=`
    <button class="btn btn-secundario" data-close="det">Fechar</button>
    ${btnIniciar}
    <button class="btn btn-secundario" id="det-status">⇅ Status</button>
    <button class="btn btn-primario" id="det-editar">✎ Editar</button>`;
  document.getElementById("det-editar").addEventListener("click",()=>{
    fecharModal("drawer-det");
    abrirWizardEdicao(id);
  });
  document.getElementById("det-status").addEventListener("click",()=>{
    fecharModal("drawer-det");
    abrirModalStatus(id);
  });
  const iniBtn=document.getElementById("det-iniciar");
  if(iniBtn)iniBtn.addEventListener("click",()=>{
    r.inicioAtendimento=agoraISO();
    r.updatedAt=new Date().toISOString();
    registrarHistorico(r.id,"AtendimentoIniciado",null,null,"Início do atendimento registrado");
    invalidarCache();persistir();
    toast("Início do atendimento registrado.","sucesso");
    abrirDetalhes(id);
    renderizarTudo();
  });
  abrirModal("drawer-det");
}

/* ============================================================
   19. GERAÇÃO DE IMAGENS DOS GRÁFICOS
   ============================================================ */
function gerarImagensGraficos(){
  const {m,paretoTipo,ranking,serie,agora}=analisar();
  const out={};
  const L=900,H=380;

  function novoCanvas(w,h){const c=document.createElement("canvas");c.width=w||L;c.height=h||H;document.body.appendChild(c);return c;}
  function limpar(c){c.remove();}
  function png(c){return c.toDataURL("image/png",1);}

  const cEvo=novoCanvas();
  const chEvo=new Chart(cEvo,{
    type:"line",
    data:{labels:serie.map(s=>s.mes.slice(5)+"/"+s.mes.slice(2,4)),
      datasets:[{label:"Bloqueios",data:serie.map(s=>s.quantidade),borderColor:"#0a2a4a",backgroundColor:"rgba(10,42,74,.12)",fill:true,tension:.35,borderWidth:3,pointRadius:5,pointBackgroundColor:"#fff",pointBorderColor:"#0a2a4a",pointBorderWidth:2}]},
    options:{responsive:false,animation:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:"#64748b"}},y:{beginAtZero:true,grid:{color:"#eef2f7"},ticks:{color:"#64748b"}}}}
  });
  out.evolucao=png(cEvo);chEvo.destroy();limpar(cEvo);

  const cPareto=novoCanvas();
  const pt=paretoTipo.slice(0,7);
  const chP=new Chart(cPareto,{
    type:"bar",
    data:{labels:pt.map(p=>p.chave),datasets:[
      {type:"bar",label:"Ocorrências",data:pt.map(p=>p.quantidade),backgroundColor:"rgba(29,78,216,.85)",borderRadius:6,maxBarThickness:40,yAxisID:"y"},
      {type:"line",label:"% acumulado",data:pt.map(p=>p.percentualAcum),borderColor:"#dc2626",backgroundColor:"#dc2626",borderWidth:3,tension:.3,pointRadius:5,pointBackgroundColor:"#fff",pointBorderColor:"#dc2626",pointBorderWidth:2,yAxisID:"y1"}
    ]},
    options:{responsive:false,animation:false,plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:true}}},
      scales:{x:{grid:{display:false},ticks:{color:"#64748b"}},y:{beginAtZero:true,position:"left",grid:{color:"#eef2f7"},ticks:{color:"#64748b"}},y1:{beginAtZero:true,max:100,position:"right",grid:{drawOnChartArea:false},ticks:{color:"#64748b",callback:v=>v+"%"}}}}
  });
  out.pareto=png(cPareto);chP.destroy();limpar(cPareto);

  const cTop=novoCanvas();
  const top=ranking.slice(0,10);
  const chT=new Chart(cTop,{
    type:"bar",
    data:{labels:top.map(r=>r.chave),datasets:[{label:"Bloqueios",data:top.map(r=>r.ocorrencias),backgroundColor:"rgba(220,38,38,.75)",borderRadius:6,maxBarThickness:32}]},
    options:{indexAxis:"y",responsive:false,animation:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:"#eef2f7"},ticks:{color:"#64748b"}},y:{grid:{display:false},ticks:{color:"#334155"}}}}
  });
  out.topQuartos=png(cTop);chT.destroy();limpar(cTop);

  const cSt=novoCanvas(500,380);
  const st={Bloqueado:0,Liberado:0};
  analisar().dados.forEach(r=>{st[estaAtivo(r)?"Bloqueado":"Liberado"]++;});
  const chS=new Chart(cSt,{
    type:"doughnut",
    data:{labels:Object.keys(st),datasets:[{data:Object.values(st),backgroundColor:["#dc2626","#16a34a"],borderColor:"#fff",borderWidth:3}]},
    options:{responsive:false,animation:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:true}}}}
  });
  out.status=png(cSt);chS.destroy();limpar(cSt);

  return out;
}

/* ============================================================
   20. RELATÓRIO PDF
   ============================================================ */
function baixarBlob(blob,nome){
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=nome;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function timestamp(){const d=new Date();return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}`;}

function gerarPDF(){
  if(!(window.jspdf&&window.jspdf.jsPDF)){toast("Biblioteca PDF não carregada.","erro");return;}
  const {jsPDF}=window.jspdf;
  const {dados,m,paretoTipo,ranking,recs}=analisar();
  const imagens=gerarImagensGraficos();
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const L=doc.internal.pageSize.getWidth();const A=doc.internal.pageSize.getHeight();const M=15;
  const COR_MARCA="#0a2a4a";

  doc.setFillColor(COR_MARCA);doc.rect(0,0,L,60,"F");
  doc.setTextColor("#fff");doc.setFont("helvetica","bold");doc.setFontSize(20);
  doc.text("RELATÓRIO DE DISPONIBILIDADE",M,25);
  doc.setFontSize(12);doc.setFont("helvetica","normal");doc.text("Painel Executivo de Indisponibilidade",M,34);
  doc.setFontSize(9);doc.text("Controle de Disponibilidade de Leitos · VEMAN",M,44);
  doc.setTextColor(COR_MARCA);doc.setFont("helvetica","bold");doc.setFontSize(11);doc.text("Data de geração",M,80);
  doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor("#334155");doc.text(new Date().toLocaleString("pt-BR"),M,86);
  doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(COR_MARCA);doc.text("Registros no recorte",M,96);
  doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor("#334155");doc.text(String(dados.length),M,102);

  doc.addPage();doc.setFillColor(COR_MARCA);doc.rect(0,0,L,18,"F");doc.setTextColor("#fff");
  doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text("Resumo Executivo",M,12);
  let y=30;
  const kpis=[["Total de bloqueios",String(m.total)],["Bloqueios ativos",String(m.ativos)],["Liberados",String(m.liberados)],
    ["Taxa de liberação",m.taxaLiberacao.toFixed(1)+"%"],["Tempo total indisponível",formatDur(m.tempoTotal)],
    ["TMR",formatDur(m.tmr)],["TMA",m.tmaCalculavel?formatDur(m.tma):"não calculável"],["Maior bloqueio",formatDur(m.maior)]];
  for(const[k,v]of kpis){
    doc.setFont("helvetica","bold");doc.setTextColor(COR_MARCA);doc.text(k,M,y);
    doc.setFont("helvetica","normal");doc.setTextColor("#334155");doc.text(v,M+70,y);y+=8;
  }

  doc.addPage();doc.setFillColor(COR_MARCA);doc.rect(0,0,L,18,"F");doc.setTextColor("#fff");
  doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text("Análise Visual",M,12);
  y=30;
  doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(COR_MARCA);doc.text("Evolução mensal de bloqueios",M,y);y+=6;
  doc.addImage(imagens.evolucao,"PNG",M,y,L-2*M,55);y+=62;
  doc.setFont("helvetica","bold");doc.setTextColor(COR_MARCA);doc.text("Distribuição por status",M,y);
  doc.text("Top 10 quartos por ocorrências",110,y);y+=6;
  doc.addImage(imagens.status,"PNG",M,y,90,60);
  doc.addImage(imagens.topQuartos,"PNG",110,y,L-125,60);

  doc.addPage();doc.setFillColor(COR_MARCA);doc.rect(0,0,L,18,"F");doc.setTextColor("#fff");
  doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text("Análise de Pareto",M,12);
  y=30;
  doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(COR_MARCA);doc.text("Pareto — Tipos de serviço",M,y);y+=6;
  doc.addImage(imagens.pareto,"PNG",M,y,L-2*M,60);y+=66;
  doc.autoTable({head:[["Tipo","Qtd","%","% acum."]],body:paretoTipo.map(p=>[p.chave,p.quantidade,p.percentual.toFixed(1)+"%",p.percentualAcum.toFixed(1)+"%"]),
    startY:y,styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:COR_MARCA,textColor:"#fff",fontSize:8},margin:{left:M,right:M}});

  if(recs.length){
    doc.addPage();doc.setFillColor(COR_MARCA);doc.rect(0,0,L,18,"F");doc.setTextColor("#fff");
    doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text("Recorrências",M,12);
    doc.autoTable({head:[["Quarto","Causa","N","Intervalo"]],body:recs.slice(0,20).map(r=>[r.quarto,r.causaPadronizada,r.ocorrencias,r.intervaloMedioDias.toFixed(1)+"d"]),
      startY:26,styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:COR_MARCA,textColor:"#fff",fontSize:8},margin:{left:M,right:M}});
  }

  doc.addPage();doc.setFillColor(COR_MARCA);doc.rect(0,0,L,18,"F");doc.setTextColor("#fff");
  doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text("Top quartos por ocorrências",M,12);
  doc.autoTable({head:[["Quarto","Ocorrências","Tempo","Status"]],body:ranking.slice(0,15).map(r=>[r.chave,r.ocorrencias,formatDur(r.tempoHoras*3600),r.statusAtual]),
    startY:26,styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:COR_MARCA,textColor:"#fff",fontSize:8},margin:{left:M,right:M}});

  const total=doc.getNumberOfPages();
  for(let i=1;i<=total;i++){
    doc.setPage(i);if(i===1)continue;
    doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor("#64748b");
    doc.text(`Página ${i} de ${total}`,L-M,A-8,{align:"right"});
    doc.text("VEMAN · Controle de Disponibilidade de Leitos",M,A-8);
  }
  doc.save(`relatorio-executivo-${timestamp()}.pdf`);
  toast("PDF executivo gerado.","sucesso");
}

/* ============================================================
   21. RELATÓRIO WORD
   ============================================================ */
async function gerarWord(){
  try{
    if(!window.docx){toast("Biblioteca Word não carregada. Verifique a conexão.","erro");return;}
    const {
      Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,
      WidthType,AlignmentType,PageBreak,Footer,Header,PageNumber,
      BorderStyle,ShadingType,ImageRun
    }=window.docx;

    const {dados,m,paretoTipo,paretoCausa,ranking,recs,serie,agora}=analisar();
    const imagens=gerarImagensGraficos();
    const dataGer=new Date();
    const dataFmt=dataGer.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"});
    const horaFmt=dataGer.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});

    const COR_MARCA="0A2A4A";
    const COR_SEC="1D4ED8";
    const COR_TXT="334155";

    function titulo(texto,nivel){return new Paragraph({
      heading:nivel||HeadingLevel.HEADING_1,
      spacing:{before:200,after:160},
      children:[new TextRun({text:texto,bold:true,color:COR_MARCA,size:nivel===HeadingLevel.HEADING_1?32:26,font:"Calibri"})]
    });}
    function subtitulo(texto){return new Paragraph({
      spacing:{before:100,after:80},
      children:[new TextRun({text:texto,bold:true,color:COR_SEC,size:22,font:"Calibri"})]
    });}
    function paragrafo(texto,opts){
      return new Paragraph({
        spacing:{after:120,line:300},
        alignment:(opts&&opts.align)||AlignmentType.JUSTIFIED,
        children:[new TextRun({text:texto,color:COR_TXT,size:20,font:"Calibri",italics:!!(opts&&opts.italics),bold:!!(opts&&opts.bold)})]
      });
    }

    const header=new Header({children:[
      new Paragraph({
        alignment:AlignmentType.RIGHT,
        spacing:{after:80},
        children:[
          new TextRun({text:"VEMAN",bold:true,size:16,color:COR_MARCA,font:"Calibri"}),
          new TextRun({text:"  ·  Controle de Disponibilidade de Leitos",size:16,color:"94A3B8",font:"Calibri"})
        ]
      })
    ]});
    const footer=new Footer({children:[
      new Paragraph({
        alignment:AlignmentType.CENTER,
        spacing:{before:80},
        children:[
          new TextRun({text:"Página ",size:16,color:"94A3B8",font:"Calibri"}),
          new TextRun({children:[PageNumber.CURRENT],size:16,color:"94A3B8",font:"Calibri",bold:true}),
          new TextRun({text:" de ",size:16,color:"94A3B8",font:"Calibri"}),
          new TextRun({children:[PageNumber.TOTAL_PAGES],size:16,color:"94A3B8",font:"Calibri"})
        ]
      })
    ]});

    const capa=[
      new Paragraph({spacing:{before:2000,after:0},alignment:AlignmentType.CENTER,children:[
        new TextRun({text:"VEMAN",bold:true,size:64,color:COR_MARCA,font:"Calibri"})
      ]}),
      new Paragraph({spacing:{before:80,after:400},alignment:AlignmentType.CENTER,children:[
        new TextRun({text:"Engenharia e Manutenção Hospitalar",size:22,color:"64748B",font:"Calibri",italics:true})
      ]}),
      new Paragraph({spacing:{before:400,after:200},alignment:AlignmentType.CENTER,children:[
        new TextRun({text:"RELATÓRIO DE DISPONIBILIDADE DE LEITOS",bold:true,size:44,color:COR_MARCA,font:"Calibri"})
      ]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:600},children:[
        new TextRun({text:"Painel Executivo de Indisponibilidade e Manutenção",size:26,color:COR_SEC,font:"Calibri"})
      ]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[
        new TextRun({text:"Período analisado: ",size:22,color:"64748B",font:"Calibri"}),
        new TextRun({text:"Histórico completo",size:22,bold:true,color:COR_MARCA,font:"Calibri"})
      ]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[
        new TextRun({text:"Registros no recorte: ",size:22,color:"64748B",font:"Calibri"}),
        new TextRun({text:String(dados.length),size:22,bold:true,color:COR_MARCA,font:"Calibri"})
      ]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[
        new TextRun({text:"Data de geração: ",size:22,color:"64748B",font:"Calibri"}),
        new TextRun({text:`${dataFmt} às ${horaFmt}`,size:22,bold:true,color:COR_MARCA,font:"Calibri"})
      ]}),
      new Paragraph({spacing:{before:2400},alignment:AlignmentType.CENTER,children:[
        new TextRun({text:"Documento confidencial · Uso interno",size:18,color:"94A3B8",font:"Calibri",italics:true})
      ]})
    ];

    const textoResumo =
      `Este documento consolida ${dados.length} registros de bloqueio de leitos no período analisado, ` +
      `com indicadores de desempenho operacional, análise de concentração por tipo de serviço e causa, ` +
      `identificação de recorrências e recomendações priorizadas para a gestão hospitalar.`;

    const kpiRows=[
      ["Total de bloqueios",String(m.total)],
      ["Bloqueios ativos",String(m.ativos)],
      ["Leitos liberados",String(m.liberados)],
      ["Taxa de liberação",m.taxaLiberacao.toFixed(1)+"%"],
      ["Tempo total indisponível",formatDur(m.tempoTotal)],
      ["TMR — Tempo Médio de Reparo",formatDur(m.tmr)],
      ["TMA — Tempo Médio de Atendimento",m.tmaCalculavel?formatDur(m.tma):"Não calculável"],
      ["Maior bloqueio registrado",formatDur(m.maior)]
    ];

    const tabelaKpis=new Table({
      width:{size:100,type:WidthType.PERCENTAGE},
      rows:kpiRows.map(([k,v],i)=>new TableRow({
        tableHeader:i===0,
        children:[
          new TableCell({
            width:{size:70,type:WidthType.PERCENTAGE},
            shading:{fill:"F1F5F9",type:ShadingType.CLEAR,color:"auto"},
            margins:{top:100,bottom:100,left:150,right:150},
            children:[new Paragraph({children:[new TextRun({text:k,size:20,color:COR_TXT,font:"Calibri",bold:true})]})]
          }),
          new TableCell({
            width:{size:30,type:WidthType.PERCENTAGE},
            margins:{top:100,bottom:100,left:150,right:150},
            children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:v,size:20,color:COR_MARCA,font:"Calibri",bold:true})]})]
          })
        ]
      }))
    });

    const pt80=pontoPareto(paretoTipo,80);
    const topTipo=paretoTipo[0];
    const topCausa=paretoCausa[0];
    const ultimo=serie[serie.length-1];

    const analise=[
      {t:"O que aconteceu?",r:`Foram registrados ${m.total} bloqueios no período. ${m.liberados} (${m.taxaLiberacao.toFixed(1)}%) já foram liberados e ${m.ativos} permanecem ativos. O tempo total acumulado de indisponibilidade é de ${formatDur(m.tempoTotal)}.`},
      {t:"Onde está concentrado?",r:`O tipo "${topTipo.chave}" lidera com ${topTipo.quantidade} ocorrências (${topTipo.percentual.toFixed(1)}%). Os ${pt80.itens} tipos mais frequentes concentram 80% do volume. A causa predominante é "${topCausa.chave}" (${topCausa.percentual.toFixed(1)}%).`},
      {t:"Qual é o maior impacto?",r:`O tipo "${topTipo.chave}" concentra o maior volume de indisponibilidade acumulada (${formatDur(topTipo.tempoHoras*3600)}).`},
      {t:"Qual é a tendência?",r:ultimo&&ultimo.varAnt!==null?`${ultimo.mes}: ${ultimo.quantidade} bloqueios (${ultimo.varAnt>=0?"+":""}${ultimo.varAnt.toFixed(1)}% em relação ao mês anterior).`:"Base temporal insuficiente para análise de tendência."},
      {t:"Qual é o principal risco?",r:recs.length?`Recorrência detectada no quarto ${recs[0].quarto}: ${recs[0].ocorrencias} ocorrências de "${recs[0].causaPadronizada}" com intervalo médio de ${recs[0].intervaloMedioDias.toFixed(0)} dias.`:`Não foram detectadas recorrências críticas no período.`},
      {t:"O que deve ser priorizado?",r:`Investigar os quartos com recorrência, liberar os ${m.ativos} bloqueios ativos e atuar preventivamente sobre a causa "${topCausa.chave}".`},
      {t:"Qual ação recomendada?",r:"Recomenda-se abrir investigação de causa-raiz nos quartos recorrentes, revisar o cronograma de manutenção preventiva e priorizar a equipe de plantão para os bloqueios ativos."}
    ];

    const listaRecs=[];
    for(const r of recs.slice(0,3)){
      const grupo=dados.filter(x=>r.registros.includes(x.id));
      const tempo=grupo.reduce((s,x)=>s+(downtime(x,agora)||0),0);
      listaRecs.push({
        p:"ALTA",
        t:`Quarto ${r.quarto} — recorrência de "${r.causaPadronizada}"`,
        d:`Realizar análise de causa-raiz no quarto ${r.quarto}. A recorrência indica que a intervenção anterior não resolveu a origem do problema. Recomendável inspeção técnica detalhada e revisão da solução aplicada.`,
        ev:[`${r.ocorrencias} ocorrências em até 90 dias`,`Tempo indisponível acumulado: ${formatDur(tempo)}`,`Intervalo médio entre eventos: ${r.intervaloMedioDias.toFixed(1)} dias`]
      });
    }
    if(m.ativos>0)listaRecs.push({
      p:"ALTA",
      t:`${m.ativos} bloqueio(s) ativo(s)`,
      d:"Bloqueios ativos comprometem a disponibilidade assistencial. Verificar status operacional de cada caso, materiais pendentes e previsão realista de liberação.",
      ev:["Prioridade operacional imediata"]
    });
    if(paretoCausa[0]&&paretoCausa[0].percentual>=15)listaRecs.push({
      p:"MÉDIA",
      t:`Concentração na causa "${paretoCausa[0].chave}"`,
      d:`Esta causa representa ${paretoCausa[0].percentual.toFixed(1)}% das ocorrências. Avaliar padronização da solução, treinamento da equipe e prevenção proativa.`,
      ev:[`${paretoCausa[0].quantidade} de ${dados.length} registros`]
    });
    if(listaRecs.length===0)listaRecs.push({
      p:"BAIXA",
      t:"Manter monitoramento regular",
      d:"Nenhum risco crítico identificado no período analisado.",
      ev:[`${dados.length} registros analisados`]
    });

    const children=[
      ...capa,
      new Paragraph({children:[new PageBreak()]}),

      titulo("1. Sumário Executivo"),
      paragrafo(textoResumo),
      new Paragraph({spacing:{before:200,after:120},children:[new TextRun({text:"Indicadores-Chave",bold:true,size:22,color:COR_MARCA,font:"Calibri"})]}),
      tabelaKpis,
      new Paragraph({children:[new PageBreak()]}),

      titulo("2. Análise Visual"),
      subtitulo("2.1 Evolução mensal de bloqueios"),
      paragrafo("A distribuição mensal dos bloqueios permite identificar variações sazonais e tendências operacionais."),
      new Paragraph({
        alignment:AlignmentType.CENTER,
        spacing:{before:120,after:240},
        children:[new ImageRun({data:dataURLToUint8(imagens.evolucao),transformation:{width:620,height:262}})]
      }),

      subtitulo("2.2 Distribuição por status"),
      paragrafo("Percentual de leitos atualmente bloqueados versus liberados."),
      new Paragraph({
        alignment:AlignmentType.CENTER,
        spacing:{before:120,after:240},
        children:[new ImageRun({data:dataURLToUint8(imagens.status),transformation:{width:380,height:290}})]
      }),

      subtitulo("2.3 Top 10 quartos por ocorrências"),
      paragrafo("Concentração de bloqueios por quarto — permite identificar ambientes com necessidade de atenção especial."),
      new Paragraph({
        alignment:AlignmentType.CENTER,
        spacing:{before:120,after:240},
        children:[new ImageRun({data:dataURLToUint8(imagens.topQuartos),transformation:{width:620,height:262}})]
      }),
      new Paragraph({children:[new PageBreak()]}),

      titulo("3. Análise de Pareto"),
      paragrafo("A análise de Pareto identifica os itens responsáveis pela maior parte dos bloqueios, permitindo priorização."),
      new Paragraph({
        alignment:AlignmentType.CENTER,
        spacing:{before:120,after:240},
        children:[new ImageRun({data:dataURLToUint8(imagens.pareto),transformation:{width:620,height:262}})]
      }),

      new Paragraph({spacing:{before:200,after:120},children:[new TextRun({text:"Detalhamento por tipo de serviço",bold:true,size:22,color:COR_MARCA,font:"Calibri"})]}),
      new Table({
        width:{size:100,type:WidthType.PERCENTAGE},
        rows:[
          new TableRow({tableHeader:true,children:["Tipo de serviço","Quantidade","%","% acumulado"].map(h=>new TableCell({
            shading:{fill:COR_MARCA,type:ShadingType.CLEAR,color:"auto"},
            margins:{top:100,bottom:100,left:150,right:150},
            children:[new Paragraph({children:[new TextRun({text:h,bold:true,color:"FFFFFF",size:20,font:"Calibri"})]})]
          }))}),
          ...paretoTipo.map(p=>new TableRow({children:[
            new TableCell({margins:{top:80,bottom:80,left:150,right:150},children:[new Paragraph({children:[new TextRun({text:p.chave,size:20,font:"Calibri"})]})]}),
            new TableCell({margins:{top:80,bottom:80,left:150,right:150},children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:String(p.quantidade),size:20,font:"Calibri"})]})]}),
            new TableCell({margins:{top:80,bottom:80,left:150,right:150},children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:p.percentual.toFixed(1)+"%",size:20,font:"Calibri"})]})]}),
            new TableCell({margins:{top:80,bottom:80,left:150,right:150},children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:p.percentualAcum.toFixed(1)+"%",size:20,color:"64748B",font:"Calibri"})]})]})
          ]}))
        ]
      }),
      new Paragraph({children:[new PageBreak()]}),

      titulo("4. Análise Crítica"),
      paragrafo("Respostas automáticas às sete perguntas essenciais para a tomada de decisão:"),
      ...analise.flatMap((a,i)=>[
        new Paragraph({spacing:{before:180,after:60},children:[new TextRun({text:`4.${i+1}  ${a.t}`,bold:true,size:22,color:COR_SEC,font:"Calibri"})]}),
        paragrafo(a.r)
      ]),
      new Paragraph({children:[new PageBreak()]}),

      titulo("5. Recomendações"),
      paragrafo("As recomendações a seguir são baseadas em evidências estatísticas extraídas dos registros analisados."),
      ...listaRecs.flatMap(rec=>{
        const corPri=rec.p==="ALTA"?"DC2626":rec.p==="MÉDIA"?"F59E0B":"0EA5E9";
        return [
          new Paragraph({
            spacing:{before:220,after:80},
            border:{left:{color:corPri,space:10,style:BorderStyle.SINGLE,size:18}},
            children:[
              new TextRun({text:`Prioridade ${rec.p}  ·  `,bold:true,size:20,color:corPri,font:"Calibri"}),
              new TextRun({text:rec.t,bold:true,size:20,color:COR_MARCA,font:"Calibri"})
            ]
          }),
          paragrafo(rec.d),
          ...rec.ev.map(e=>new Paragraph({
            spacing:{after:40},
            indent:{left:200},
            children:[new TextRun({text:"• ",color:"94A3B8",size:18,font:"Calibri"}),new TextRun({text:e,size:18,color:"64748B",font:"Calibri"})]
          }))
        ];
      }),
      new Paragraph({children:[new PageBreak()]}),

      titulo("6. Anexo — Top quartos"),
      paragrafo("Ranking dos quartos com maior número de ocorrências no período."),
      new Table({
        width:{size:100,type:WidthType.PERCENTAGE},
        rows:[
          new TableRow({tableHeader:true,children:["Quarto","Ocorrências","Tempo indisponível","Status atual"].map(h=>new TableCell({
            shading:{fill:COR_MARCA,type:ShadingType.CLEAR,color:"auto"},
            margins:{top:100,bottom:100,left:150,right:150},
            children:[new Paragraph({children:[new TextRun({text:h,bold:true,color:"FFFFFF",size:20,font:"Calibri"})]})]
          }))}),
          ...ranking.slice(0,15).map(r=>new TableRow({children:[
            new TableCell({margins:{top:80,bottom:80,left:150,right:150},children:[new Paragraph({children:[new TextRun({text:r.chave,size:20,bold:true,color:COR_MARCA,font:"Calibri"})]})]}),
            new TableCell({margins:{top:80,bottom:80,left:150,right:150},children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:String(r.ocorrencias),size:20,font:"Calibri"})]})]}),
            new TableCell({margins:{top:80,bottom:80,left:150,right:150},children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:formatDur(r.tempoHoras*3600),size:20,font:"Calibri"})]})]}),
            new TableCell({margins:{top:80,bottom:80,left:150,right:150},children:[new Paragraph({children:[new TextRun({text:r.statusAtual,size:20,color:r.statusAtual==="Bloqueado"?"DC2626":"16A34A",font:"Calibri"})]})]})
          ]}))
        ]
      }),

      new Paragraph({spacing:{before:800},alignment:AlignmentType.CENTER,children:[
        new TextRun({text:"— Documento gerado automaticamente pelo sistema Controle de Disponibilidade de Leitos —",size:16,color:"94A3B8",font:"Calibri",italics:true})
      ]})
    ];

    const doc=new Document({
      creator:"VEMAN",
      title:"Relatório de Disponibilidade de Leitos",
      description:"Painel Executivo de Indisponibilidade e Manutenção",
      styles:{
        default:{
          document:{run:{font:"Calibri",size:20,color:COR_TXT}},
          heading1:{run:{font:"Calibri",size:32,bold:true,color:COR_MARCA}},
          heading2:{run:{font:"Calibri",size:26,bold:true,color:COR_MARCA}}
        }
      },
      sections:[{
        properties:{page:{margin:{top:1000,bottom:1000,left:1000,right:1000}}},
        headers:{default:header},
        footers:{default:footer},
        children
      }]
    });

    const blob=await Packer.toBlob(doc);
    baixarBlob(blob,`relatorio-executivo-${timestamp()}.docx`);
    toast("Documento Word gerado com sucesso.","sucesso");
  } catch(e){
    console.error(e);
    toast("Erro ao gerar Word: "+e.message,"erro");
  }
}
function dataURLToUint8(dataURL){
  const base64=dataURL.split(",")[1];
  const bin=atob(base64);
  const out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return out;
}

/* ============================================================
   22. NAVEGAÇÃO / UI
   ============================================================ */
function irPara(page){
  document.querySelectorAll(".sidebar-link").forEach(b=>b.classList.toggle("ativo",b.dataset.page===page));
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("ativo"));
  document.getElementById("page-"+page)?.classList.add("ativo");
  if(page==="dashboard")renderizarDashboard();
  if(page==="registros")renderizarRegistros();
  if(page==="relatorios")document.getElementById("sub-rel").textContent=`${analisar().dados.length} registros no recorte atual`;
  if(page==="config")renderizarConfig();
}
document.querySelectorAll(".sidebar-link").forEach(b=>b.addEventListener("click",()=>irPara(b.dataset.page)));
document.querySelectorAll("[data-cfg]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("[data-cfg]").forEach(x=>x.classList.remove("ativo"));
  b.classList.add("ativo");
  renderizarConfig(b.dataset.cfg);
}));

document.getElementById("btn-sidebar").addEventListener("click",()=>{
  State.ui.compacta=!State.ui.compacta;
  document.getElementById("shell").setAttribute("data-compacta",State.ui.compacta?"true":"false");
  persistir();
});
document.getElementById("btn-tema").addEventListener("click",e=>{
  State.ui.tema=State.ui.tema==="escuro"?"claro":"escuro";
  document.documentElement.setAttribute("data-tema",State.ui.tema);
  e.currentTarget.textContent=State.ui.tema==="escuro"?"🌙":"☀️";
  persistir();
  if(document.getElementById("page-dashboard").classList.contains("ativo"))renderizarDashboard();
});
function toggleApres(){
  State.ui.apresentacao=!State.ui.apresentacao;
  document.getElementById("shell").setAttribute("data-apresentacao",State.ui.apresentacao?"true":"false");
  document.getElementById("apres-bar").style.display=State.ui.apresentacao?"flex":"none";
  if(State.ui.apresentacao){
    document.documentElement.requestFullscreen?.().catch(()=>{});
    irPara("dashboard");
  } else if(document.fullscreenElement){
    document.exitFullscreen?.().catch(()=>{});
  }
  persistir();
}
document.getElementById("btn-apres").addEventListener("click",toggleApres);
document.getElementById("btn-sair-apres").addEventListener("click",toggleApres);
document.addEventListener("fullscreenchange",()=>{
  if(!document.fullscreenElement&&State.ui.apresentacao){
    State.ui.apresentacao=false;
    document.getElementById("shell").setAttribute("data-apresentacao","false");
    document.getElementById("apres-bar").style.display="none";
    persistir();
  }
});

document.getElementById("btn-novo").addEventListener("click",abrirWizardNovo);
document.getElementById("btn-exp").addEventListener("click",()=>{
  const grupos=document.querySelectorAll("#lista-meses .mes-grupo");
  const todosAbertos=Array.from(grupos).every(g=>g.classList.contains("expandido"));
  grupos.forEach(g=>{
    if(todosAbertos){
      g.classList.remove("expandido");
      g.querySelector(".mes-toggle").textContent="▶";
      mesesExpandidos.delete(g.dataset.mes);
    } else {
      g.classList.add("expandido");
      g.querySelector(".mes-toggle").textContent="▼";
      mesesExpandidos.add(g.dataset.mes);
    }
  });
  document.getElementById("btn-exp").textContent=todosAbertos?"▼ Expandir":"▲ Recolher";
});
document.getElementById("btn-reset").addEventListener("click",()=>{
  confirmar("Resetar dados",
    "Isto irá restaurar os 111 registros históricos e apagar todas as alterações locais. Continuar?",
    ()=>{
      State.registros=migrarLegado();
      State.historico=[];
      State.filtros={quarto:"",categoria:"",status:"",mes:""};
      mesesExpandidos.clear();
      aplicarRegrasCriticidade();
      invalidarCache();persistir();
      toast("Dados restaurados.","info");
      construirFiltros();
      renderizarTudo();
    });
});
document.getElementById("btn-pdf").addEventListener("click",gerarPDF);
document.getElementById("btn-word").addEventListener("click",gerarWord);
document.getElementById("btn-cfg-export").addEventListener("click",()=>{
  const payload={_versao:"1.4",exportadoEm:new Date().toISOString(),config:State.config,registros:State.registros};
  baixarBlob(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),`backup-completo-${timestamp()}.json`);
  toast("Backup completo exportado.","sucesso");
});
document.getElementById("btn-cfg-import").addEventListener("click",()=>{
  const input=document.createElement("input");
  input.type="file";input.accept=".json";
  input.addEventListener("change",e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(data.config||data.registros){
          if(data.config)Object.assign(State.config,data.config);
          if(Array.isArray(data.registros)&&data.registros.length)State.registros=data.registros;
          aplicarRegrasCriticidade();invalidarCache();persistir();
          construirFiltros();renderizarTudo();
          renderizarConfig();
          toast("Backup importado com sucesso.","sucesso");
        } else throw new Error("Estrutura inválida");
      } catch(err){toast("Arquivo inválido: "+err.message,"erro");}
    };
    reader.readAsText(file);
  });
  input.click();
});

/* ============================================================
   23. RENDER GERAL
   ============================================================ */
function renderizarTudo(){
  document.getElementById("badge-total").textContent=`${State.registros.length} registros`;
  atualizarChips();
  const pageAtiva=document.querySelector(".page.ativo")?.id;
  if(pageAtiva==="page-dashboard"||pageAtiva==="page-registros"){
    renderizarRegistros();
    renderizarDashboard();
  } else if(pageAtiva==="page-relatorios"){
    document.getElementById("sub-rel").textContent=`${analisar().dados.length} registros no recorte atual`;
  } else if(pageAtiva==="page-config"){
    renderizarConfig();
  }
}

/* ============================================================
   24. SELF-TESTS
   ============================================================ */
function autoTeste(){
  const resultados=[];
  function check(nome,fn){
    try{const ok=!!fn();resultados.push({Teste:nome,OK:ok?"✓":"✗"});}
    catch(e){resultados.push({Teste:nome,OK:"✗ "+e.message});}
  }
  check("localStorage disponível",()=>typeof localStorage!=="undefined");
  check("localStorage grava/lê",()=>{
    const k="__veman_test__";
    localStorage.setItem(k,"ok");
    const v=localStorage.getItem(k);
    localStorage.removeItem(k);
    return v==="ok";
  });
  check("Chart.js carregado",()=>typeof window.Chart!=="undefined");
  check("jsPDF carregado",()=>!!(window.jspdf&&window.jspdf.jsPDF));
  check("docx carregado",()=>typeof window.docx!=="undefined");
  check("Migração legado = 111 registros",()=>migrarLegado().length===111);
  check("State.registros é array",()=>Array.isArray(State.registros));
  check("Persistência funcional",()=>persistir());
  check("Cache analítico operacional",()=>{invalidarCache();return analisar().m.total>=0;});

  const passou=resultados.filter(r=>r.OK==="✓").length;
  console.log(`%c[Auto-teste VEMAN] ${passou}/${resultados.length} aprovados`,"color:#0a2a4a;font-weight:bold;font-size:13px");
  try{console.table(resultados);}catch(_){console.log(resultados);}
  return{passou,total:resultados.length,resultados};
}

/* ============================================================
   25. INICIALIZAÇÃO
   ============================================================ */
(function init(){
  try{
    let carregou=false;
    try{carregou=carregarPersistido();}catch(e){console.error("Erro carregando persistido:",e);}

    if(!carregou||!Array.isArray(State.registros)||State.registros.length===0){
      State.registros=migrarLegado();
      persistir();
    }
    aplicarRegrasCriticidade();
    document.documentElement.setAttribute("data-tema",State.ui.tema||"claro");
    document.getElementById("shell").setAttribute("data-compacta",State.ui.compacta?"true":"false");
    document.getElementById("shell").setAttribute("data-apresentacao",State.ui.apresentacao?"true":"false");
    document.getElementById("apres-bar").style.display=State.ui.apresentacao?"flex":"none";
    document.getElementById("btn-tema").textContent=State.ui.tema==="escuro"?"🌙":"☀️";
    construirFiltros();
    renderizarRegistros();
    renderizarDashboard();
    renderizarConfig();

    console.log(`%c[Sistema] Controle de Disponibilidade de Leitos · v1.4 · ${State.registros.length} registros carregados`,"color:#1d4ed8;font-weight:bold");
    setTimeout(autoTeste,300);
  }catch(e){
    console.error("[init] Falha na inicialização:",e);
    alert("Erro na inicialização do sistema: "+e.message+"\n\nVerifique o console (F12).");
  }
})();