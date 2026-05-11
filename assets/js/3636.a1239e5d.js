"use strict";(self.webpackChunkatomicmemory_docs=self.webpackChunkatomicmemory_docs||[]).push([["3636"],{25871(e,t,a){function i(e,t){e.accDescr&&t.setAccDescription?.(e.accDescr),e.accTitle&&t.setAccTitle?.(e.accTitle),e.title&&t.setDiagramTitle?.(e.title)}a.d(t,{S:()=>i}),(0,a(40797).K2)(i,"populateCommonDb")},48207(e,t,a){a.d(t,{diagram:()=>b});var i=a(38342),l=a(25871),r=a(28718),s=a(67994),o=a(40797),n=a(78731),c=a(47829),p=s.UI.pie,d={sections:new Map,showData:!1,config:p},u=d.sections,g=d.showData,m=structuredClone(p),h=(0,o.K2)(()=>structuredClone(m),"getConfig"),f=(0,o.K2)(()=>{u=new Map,g=d.showData,(0,s.IU)()},"clear"),x=(0,o.K2)(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);u.has(e)||(u.set(e,t),o.Rm.debug(`added new section: ${e}, with value: ${t}`))},"addSection"),w=(0,o.K2)(()=>u,"getSections"),S=(0,o.K2)(e=>{g=e},"setShowData"),$=(0,o.K2)(()=>g,"getShowData"),y={getConfig:h,clear:f,setDiagramTitle:s.ke,getDiagramTitle:s.ab,setAccTitle:s.SV,getAccTitle:s.iN,setAccDescription:s.EI,getAccDescription:s.m7,addSection:x,getSections:w,setShowData:S,getShowData:$},D=(0,o.K2)((e,t)=>{(0,l.S)(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},"populateDb"),T={parse:(0,o.K2)(async e=>{let t=await (0,n.qg)("pie",e);o.Rm.debug(t),D(t,y)},"parse")},C=(0,o.K2)(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),k=(0,o.K2)(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),a=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return(0,c.rLf)().value(e=>e.value).sort(null)(a)},"createPieArcs"),b={parser:T,db:y,renderer:{draw:(0,o.K2)((e,t,a,l)=>{o.Rm.debug("rendering pie chart\n"+e);let n=l.db,p=(0,s.D7)(),d=(0,r.$t)(n.getConfig(),p.pie),u=(0,i.D)(t),g=u.append("g");g.attr("transform","translate(225,225)");let{themeVariables:m}=p,[h]=(0,r.I5)(m.pieOuterStrokeWidth);h??=2;let f=d.textPosition,x=(0,c.JLW)().innerRadius(0).outerRadius(185),w=(0,c.JLW)().innerRadius(185*f).outerRadius(185*f);g.append("circle").attr("cx",0).attr("cy",0).attr("r",185+h/2).attr("class","pieOuterCircle");let S=n.getSections(),$=k(S),y=[m.pie1,m.pie2,m.pie3,m.pie4,m.pie5,m.pie6,m.pie7,m.pie8,m.pie9,m.pie10,m.pie11,m.pie12],D=0;S.forEach(e=>{D+=e});let T=$.filter(e=>"0"!==(e.data.value/D*100).toFixed(0)),C=(0,c.UMr)(y).domain([...S.keys()]);g.selectAll("mySlices").data(T).enter().append("path").attr("d",x).attr("fill",e=>C(e.data.label)).attr("class","pieCircle"),g.selectAll("mySlices").data(T).enter().append("text").text(e=>(e.data.value/D*100).toFixed(0)+"%").attr("transform",e=>"translate("+w.centroid(e)+")").style("text-anchor","middle").attr("class","slice");let b=g.append("text").text(n.getDiagramTitle()).attr("x",0).attr("y",-200).attr("class","pieTitleText"),v=[...S.entries()].map(([e,t])=>({label:e,value:t})),A=g.selectAll(".legend").data(v).enter().append("g").attr("class","legend").attr("transform",(e,t)=>"translate(216,"+(22*t-22*v.length/2)+")");A.append("rect").attr("width",18).attr("height",18).style("fill",e=>C(e.label)).style("stroke",e=>C(e.label)),A.append("text").attr("x",22).attr("y",14).text(e=>n.getShowData()?`${e.label} [${e.value}]`:e.label);let K=Math.max(...A.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0)),R=b.node()?.getBoundingClientRect().width??0,M=Math.min(0,225-R/2),z=Math.max(512+K,225+R/2)-M;u.attr("viewBox",`${M} 0 ${z} 450`),(0,s.a$)(u,450,z,d.useMaxWidth)},"draw")},styles:C}}}]);