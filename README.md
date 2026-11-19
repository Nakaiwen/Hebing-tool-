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
