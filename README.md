# Hebing-tool 同步補丁（2026-09-28）

與 bazi-tool 同版的師承引擎改動：
1. 滿柱皆印不算從格，歸「專旺我」（喜忌不變）。
2. 滿盤印比而財存活（未被合化、未被沖掉）→ 正格病藥，不作專旺我；喜忌依病藥法。
3. 依千里：一行型逢財有食傷則不妨，無食傷引通者降為疑似（主曲線改變）。

套用：覆蓋 bazi-engine.js、bazi.html、test-children.js，或 `git apply hebing-zhuanwangwo-2026-09-28.patch`。
驗證：test-children.js 129 項、test-parent.js 209 項 ALL PASS。
已知未修：前置結算溢扣（見 bazi-tool 更新說明）。
