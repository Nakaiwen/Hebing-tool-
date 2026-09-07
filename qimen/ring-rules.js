/* 規則來源：taiyi/taiyi-national/tn_script.js
 * MONTHLY_GENERALS_MAPPING、FULL_GENERALS_ORDER、calculateYueJiang、
 * JIAN_CHU_ORDER、calculateJianChu（時辰版）。不使用建除日神算法。
 * 貴人：同檔 calculateGuiRen（V2）與 GUI_REN_ORDER。
 * 節氣時間沿用 solar-lunar.js 的資料及時間解讀方式。
 */
(function(root) {
  'use strict';
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const JIAN_CHU = ['建','除','滿','平','定','執','破','危','成','收','開','閉'];
  const GENERALS = ['神后子','大吉丑','功曹寅','太衝卯','天罡辰','太乙巳','勝光午','小吉未','傳送申','從魁酉','河魁戌','登明亥'];
  const GUI_REN_ORDER = ['貴人','騰蛇','朱雀','六合','勾陳','青龍','天空','白虎','太常','玄武','太陰','天后'];
  const GUI_REN_GENERAL_MAP = {
    甲:{day:'未',night:'丑'},乙:{day:'申',night:'子'},丙:{day:'酉',night:'亥'},
    丁:{day:'亥',night:'酉'},戊:{day:'丑',night:'未'},己:{day:'子',night:'申'},
    庚:{day:'丑',night:'未'},辛:{day:'寅',night:'午'},壬:{day:'卯',night:'巳'},癸:{day:'巳',night:'卯'}
  };
  function computeGuiRen(dayGan,hourBranch,cells) {
    const isDay = ['卯','辰','巳','午','未','申'].includes(hourBranch);
    const suffix = GUI_REN_GENERAL_MAP[dayGan]?.[isDay?'day':'night'];
    const startIndex = cells.findIndex(cell=>cell.yueJiang.endsWith(suffix));
    if (!suffix || startIndex<0) throw new Error('貴人十二神缺少有效日干或月將資料。');
    const startBranch = cells[startIndex].branch;
    const clockwise = ['亥','子','丑','寅','卯','辰'].includes(startBranch);
    const branchIndex = BRANCHES.indexOf(startBranch);
    const gods = {};
    GUI_REN_ORDER.forEach((god,i)=>{gods[BRANCHES[(branchIndex+(clockwise?i:-i)+12)%12]]=god;});
    return {dayGan,isDay,startBranch,clockwise,gods};
  }
  const BY_TERM = [null,'神后子',null,'登明亥',null,'河魁戌',null,'從魁酉',null,'傳送申',null,'小吉未',null,'勝光午',null,'太乙巳',null,'天罡辰',null,'太衝卯',null,'功曹寅',null,'大吉丑'];
  function compute(solarLunar, year, month, day, hour, minute = 0, dayGan) {
    const date = solarLunar.solar2lunar(year,month,day,hour,minute);
    const time = date.date.getTime(), hourIndex = Math.floor((hour+1)/2)%12;
    if (!Number.isInteger(hour) || hour<0 || hour>23 || !Number.isFinite(time)) throw new Error('十二神查詢時間無效。');
    let termIndex = -1;
    for (let i=23;i>=0;i--) {
      const termTime = solarLunar.getTerm(date.year,i+1);
      if (!termTime) throw new Error('缺少節氣資料，無法計算月將。');
      if (time >= termTime) { termIndex=i; break; }
    }
    if (termIndex === -1) {
      const previous = solarLunar.getTerm(date.year-1,24);
      if (previous && time>=previous) termIndex=23;
      else throw new Error('缺少前一年冬至資料，無法計算月將。');
    }
    let generalTerm = termIndex;
    if (generalTerm%2===0) generalTerm--;
    if (generalTerm<0) generalTerm=23;
    const monthlyGeneral = BY_TERM[generalTerm], start = GENERALS.indexOf(monthlyGeneral);
    // 奇門日干以排盤日為準；23:00 採次日干，月將仍用實際節氣時刻。
    if (!dayGan) {
      const pillarDate = new Date(time);
      if (hour===23) pillarDate.setUTCDate(pillarDate.getUTCDate()+1);
      dayGan = solarLunar.solar2lunar(pillarDate.getUTCFullYear(),pillarDate.getUTCMonth()+1,pillarDate.getUTCDate(),0,0).getDayInGanZhi()[0];
    }
    const result = {
      monthlyGeneral, hourBranch:BRANCHES[hourIndex], termIndex, generalTerm,
      cells:BRANCHES.map((branch,i)=>({branch,
        jianChu:JIAN_CHU[(i-hourIndex+12)%12],
        yueJiang:GENERALS[(start-((hourIndex-i+12)%12)+12)%12],
        selected:i===hourIndex
      }))
    };
    result.guiRen = computeGuiRen(dayGan,result.hourBranch,result.cells);
    result.cells.forEach(cell=>{cell.guiRen=result.guiRen.gods[cell.branch];});
    return result;
  }
  root.qimenRingRules = {compute,computeGuiRen};
})(typeof window !== 'undefined' ? window : globalThis);
