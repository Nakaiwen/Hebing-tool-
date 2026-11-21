# Hebing-tool v0.9.40（2026-11-21）：太乙本命星曜盤入 JSON

太乙橋接升 v1.4：合盤存檔新增 `curves.taiyi`（契約 `xiaoliu.taiyi-natal/v1`），**純資料、不參與任何計分**，曲線不變：

- 內容：太乙單機版「命盤存擋」JSON 的**本命層**欄位，欄位名完全相同——四柱、十二宮排列（arrangedLifePalaces）、身宮、空亡、局、八將與三算（lookupResult）、四神與十六星落宮、chartModel（每顆星的強旺、化曜三層、格局）、lifePalacesSummary（含寄宮、借對宮）、dayActivations、科甲年、百六／陽九／大遊等限、飛祿飛馬大限。
- 不帶流年／流日層（annual*、transit*、monthly*、upcomingLowScoreYears），避免合盤檔混入跑盤當下的時間層。
- 來源：范振木〈論命實務一〉回測——合盤檔只有太乙兩條曲線、沒有星曜盤，太乙基本結構無法核對；Nakai 2026-11-21 裁定補。
- 驗證：新增 test-taiyi-natal.js（1966-08-17 戌時女回歸件：四柱、宮位、空亡、八將、各宮星曜強旺化曜、關格局，17 項）；與 Nakai 提供的太乙單機版匯出檔逐欄比對，41 個本命欄位全等。test-parent.js 新增存檔兩項；test-parent、test-children、test-taiyi-natal ALL PASS。

套用：本包含 v0.9.39＋v0.9.40 兩版改動。覆蓋 ziwei.html、taiyi/script.js、index.html、test-children.js、test-parent.js、test-taiyi-natal.js、sw.js、README.md，或在 GitHub 現行 v0.9.38 上 `git apply hebing-v0.9.38-to-0.9.40.patch`。

---

# Hebing-tool v0.9.39（2026-11-21）：紫微副星欄位入 JSON

紫微橋接升 v1.5（ziwei.html TOOL_VERSION 1.7.0）：合盤存檔（xiaoliu.hebing-save/v3）新增兩個**純資料欄位**，不參與任何計分、曲線不變：

- `curves.ziwei.palaces[].minorStars`：本命輔／煞／雜曜，每筆 `{name, type(輔｜煞｜雜), natalHua}`——祿存、擎羊、陀羅、左輔、右弼、文昌、文曲、天魁、天鉞、火星、鈴星、地空、地劫、天馬、紅鸞、天喜、天姚、天刑等，直接取引擎本命盤，零重製。
- `curves.ziwei.daen[].daLuYangTuo`：大限干起祿存，前一位擎羊、後一位陀羅，每顆 `{zhi, palaceName(本命宮名)}`；走引擎 liuNian() 的祿存表，不另抄表。
- 來源：范振木〈論命實務十一〉（fjm.tw 編號 894）回測——占驗派推論大量依賴羊陀祿存與輔弼昌曲，舊檔重現不了；Nakai 2026-11-21 裁定補欄位。
- 驗證：test-children.js 新增「minorStars 與引擎全等」「daLuYangTuo 十二大限齊備」兩項（兩命例），並新增范盤回歸件（1967-03-25 亥時男）：22 顆輔煞雜曜位置與附盤逐一相符、壬寅／癸丑大限祿羊陀相符；test-parent.js 新增存檔欄位兩項。test-children、test-parent ALL PASS。test-pwa（cache.keys）、test-research-ui（流月列數）在改動前後同樣失敗，屬既有環境問題，與本版無關。
- 尚未涵蓋（待裁定再做）：截空、旬空、天官、天福等引擎未安的雜曜；流年流曜（流羊流陀流馬）逐年欄位。

套用：覆蓋 ziwei.html、test-children.js、test-parent.js、sw.js、README.md，或 `git apply hebing-v0.9.39-ziwei-minor-stars.patch`（單獨套 v0.9.39；要連 v0.9.40 一起套，用上方的 hebing-v0.9.38-to-0.9.40.patch）。

---

# Hebing-tool v0.9.38（2026-11-19）：紫微流月能量序列入 JSON

紫微橋接升 v1.4：合盤存檔（xiaoliu.hebing-save/v3 → curves.ziwei.months）新增**流月能量序列**，
契約 `xiaoliu.ziwei-month/v1`，供命書 skills 做月運解讀：

- 範圍：跑盤當下的農曆年起連兩個農曆年（含閏月，24–26 筆）。
- 規則全部沿用既有師承裁定、無新裁定：層＝生年＋大限＋小限＋流年＋流月（5 層等權，即吉日表六層鏈去流日層）；
  流月命宮＝斗君＋農曆月序；流月四化＝該月月柱天干；框架＝流月命宮三方四正；
  計分＝stackCount 固定參數（祿權科 +10／忌 −15／祿權科齊 ×2）；疊忌≥3＝caution。
- 工程選擇（非師承）：每農曆月取 15 日為月柱代表日（月中）。
- 每筆欄位：lunarYear/lunarMonth/isLeap/liuGZ/monthGZ/yueZhi/yueZhiName/yuePalace/solarRef/score/jiTotal/label/triggers。
- 驗證：斗君獨立公式重算、月柱曆法引擎直取、閏月分支（2028 閏五月 mock）、既有 test-children 全套回歸 ALL PASS；
  月運斷言已固化進 test-children.js。sw.js 快取版本同步 bump（PWA 使用者自動更新）。

套用：覆蓋 ziwei.html、test-children.js、sw.js、README.md，或 `git apply hebing-v0.9.38-ziwei-months.patch`。

---

# Hebing-tool 同步補丁（2026-09-28）

與 bazi-tool 同版的師承引擎改動：
1. 滿柱皆印不算從格，歸「專旺我」（喜忌不變）。
2. 滿盤印比而財存活（未被合化、未被沖掉）→ 正格病藥，不作專旺我；喜忌依病藥法。
3. 依千里：一行型逢財有食傷則不妨，無食傷引通者降為疑似（主曲線改變）。

套用：覆蓋 bazi-engine.js、bazi.html、test-children.js，或 `git apply hebing-zhuanwangwo-2026-09-28.patch`。
驗證：test-children.js 129 項、test-parent.js 209 項 ALL PASS。
已知未修：前置結算溢扣（見 bazi-tool 更新說明）。
