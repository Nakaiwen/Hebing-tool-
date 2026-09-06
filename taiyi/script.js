document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    //  SECTION 1: 核心資料與設定
    // =================================================================
    const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const BRANCH_TO_PALACE_ID = {'子':'pZi','丑':'pChou','寅':'pYin','卯':'pMao','辰':'pChen','巳':'pSi','午':'pWu','未':'pWei','申':'pShen','酉':'pYou','戌':'pXu','亥':'pHai', '乾':'pQian', '坤':'pKun', '艮':'pGen', '巽':'pXun'};
    const PALACE_ID_TO_BRANCH = Object.fromEntries(Object.entries(BRANCH_TO_PALACE_ID).map(([k, v]) => [v, k]));
    const VALID_PALACES_CLOCKWISE = [ 'pZi', 'pChou', 'pYin', 'pMao', 'pChen', 'pSi', 'pWu', 'pWei', 'pShen', 'pYou', 'pXu', 'pHai' ];
    const LIFE_PALACE_NAMES = [ '命', '兄', '妻', '孫', '財', '田', '官', '奴', '疾', '福', '貌', '父' ];
    const AGE_LIMIT_DATA = [ '1-15', '16-20', '21-31', '32-35.5', '35.6-40', '41-45', '46-60', '61-64.5', '64.6-71.5', '71.6-82.5', '82.6-96.5', '96.6-106' ];
    const ANNUAL_LIMIT_DISPLAY_YEARS = 8; // 顯示當前歲數。您可以隨意修改這個數字 (例如改成 7 或 15)

    // ▼▼▼ 盤面的位置設定 ▼▼▼ 
    const RADIAL_LAYOUT = {
        center: { x: 395.5, y: 418.5 },
        angles: { pYou:0, pXu:22.5, pQian:45, pHai:66.5, pZi:90, pChou:113.5, pGen:135, pYin:157.5, pMao:180, pChen:202.5, pXun:225, pSi:246.5, pWu:270, pWei:293.5, pKun:315, pShen:337.5 },
        angleOffset: 6,
        bottomPalaceRadiusOffset: 20, // 控制巳午未宮位文字要再離圓心多遠
        radii: {
            lineLeft:   { fieldA: 135, fieldB: 175, fieldG: 215 },
            lineCenter: { fieldC: 135, fieldD: 165, fieldC2: 195, fieldD2: 225 },
            lineRight:  { fieldE: 135, fieldF: 165, fieldE2: 195, fieldF2: 225 }
        },
        // ▼▼▼ 定義圓心 4 個欄位的座標 ▼▼▼
        centerFields: {
            field1: { x: 397, y: 408 }, field2: { x: 397, y: 438 },
            field3: { x: 381, y: 420 }, field4: { x: 413, y: 420 }
        },
        
        lifePalacesRing: { radius: 100, palaces: ['pZi','pChou','pYin','pMao','pChen','pSi','pWu','pWei','pShen','pYou','pXu','pHai'], color: '#792e13ff' },
        ageLimitRing: { radius: 122, palaces: ['pZi','pChou','pYin','pMao','pChen','pSi','pWu','pWei','pShen','pYou','pXu','pHai'], flipPalaces: ['pZi','pHai','pSi','pXu','pYou','pShen'], color: '#626363', className: 'age-limit-style' },
        sdrRing: { radius: 110, hOffset: 6.5, palaces: ['pZi','pChou','pYin','pMao','pChen','pSi','pWu','pWei','pShen','pYou','pXu','pHai'] },
        yueJiangRing: { radius: 288, rotationOffset: 6, palaces: ['pZi','pHai','pXu','pYou','pShen','pWei','pWu','pSi','pChen','pMao','pYin','pChou'], flipPalaces: ['pHai','pSi','pXu','pYou','pShen'], color: '#501dd3' },
        guiRenRing: { radius: 288, rotationOffset: -5, palaces: ['pZi','pChou','pYin','pMao','pChen','pSi','pWu','pWei','pShen','pYou','pXu','pHai'], flipPalaces: ['pZi','pHai','pSi','pXu','pYou','pWu','pShen'], color: '#ae00ff' },
        outerRing: { radius: 257, palaces: ['pZi', 'pGen', 'pMao', 'pXun', 'pWu', 'pKun', 'pYou', 'pQian']},
        xingNianRing: { radius: 303, flipPalaces: ['pZi', 'pHai', 'pXu', 'pYou', 'pShen', 'pSi']},
        yangJiuRing: { radius: 331, rotationOffset: 5, className: 'yang-jiu-style', flipPalaces: ['pHai','pSi','pXu','pYou','pShen'] },
        baiLiuRing: { radius: 331, rotationOffset: -5.5, className: 'bai-liu-style', flipPalaces: ['pZi', 'pHai', 'pWu', 'pXu', 'pYou', 'pShen', 'pSi'] }, 
        baiLiuXiaoXianRing: { radius: 317, rotationOffset: -5.5, className: 'bai-liu-style', flipPalaces: ['pZi', 'pHai', 'pWu', 'pXu', 'pYou', 'pShen', 'pSi'] },
        daYouZhenXianRing: { radius: 317, rotationOffset: 5, className: 'da-you-zhen-xian-style', flipPalaces: ['pHai','pSi','pXu','pYou','pShen'] },
        feiLuDaXianRing: { radius: 344, rotationOffset: 5, className: 'fei-lu-da-xian-style', flipPalaces: ['pHai','pSi','pXu','pYou','pShen'] },
        feiMaDaXianRing: { radius: 344, rotationOffset: -5.5, className: 'fei-ma-da-xian-style', flipPalaces: ['pZi', 'pHai', 'pWu', 'pXu', 'pYou', 'pShen', 'pSi'] },
        feiLuLiuNianRing: { radius: 272, rotationOffset: 7, className: 'fei-lu-liu-nian-style', flipPalaces: ['pHai','pSi','pXu','pYou','pShen'] },
        feiMaLiuNianRing: { radius: 272, rotationOffset: -6, className: 'fei-ma-da-xian-style', flipPalaces: ['pZi', 'pHai', 'pWu', 'pXu', 'pYou', 'pShen', 'pSi'] },
        heiFuRing: { radius: 272, rotationOffset: 0, className: 'hei-fu-style', flipPalaces: ['pZi', 'pHai', 'pXu', 'pYou', 'pShen', 'pSi'] }
        
    };

    // ▼▼▼ 中文月份名稱 ▼▼▼
    const MONTH_NAMES_CHINESE = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

    // ▼▼▼ 夏至冬至基準點資料庫 (1900-2100) ▼▼▼
    const SOLSTICE_DATA = {
    1900: { summer: { date: new Date("1900-06-22T05:39:00"), dayPillar: "丙寅", dayBureau: 39, dayJishu: 11386982 }, winter: { date: new Date("1900-12-22T14:41:00"), dayPillar: "己巳", dayBureau: 6, dayJishu: 11387165 } },
    1901: { summer: { date: new Date("1901-06-22T11:27:00"), dayPillar: "辛未", dayBureau: 44, dayJishu: 11387347 }, winter: { date: new Date("1901-12-22T20:36:00"), dayPillar: "甲戌", dayBureau: 11, dayJishu: 11387530 } },
    1902: { summer: { date: new Date("1902-06-22T17:15:00"), dayPillar: "丙子", dayBureau: 49, dayJishu: 11387712 }, winter: { date: new Date("1902-12-23T02:35:00"), dayPillar: "庚辰", dayBureau: 17, dayJishu: 11387896 } },
    1903: { summer: { date: new Date("1903-06-22T23:04:00"), dayPillar: "辛巳", dayBureau: 54, dayJishu: 11388077 }, winter: { date: new Date("1903-12-23T08:20:00"), dayPillar: "乙酉", dayBureau: 22, dayJishu: 11388261 } },
    1904: { summer: { date: new Date("1904-06-22T04:51:00"), dayPillar: "丁亥", dayBureau: 60, dayJishu: 11388443 }, winter: { date: new Date("1904-12-22T14:13:00"), dayPillar: "庚寅", dayBureau: 27, dayJishu: 11388626 } },
    1905: { summer: { date: new Date("1905-06-22T10:51:00"), dayPillar: "壬辰", dayBureau: 65, dayJishu: 11388808 }, winter: { date: new Date("1905-12-22T20:03:00"), dayPillar: "乙未", dayBureau: 32, dayJishu: 11388991 } },
    1906: { summer: { date: new Date("1906-06-22T16:41:00"), dayPillar: "丁酉", dayBureau: 70, dayJishu: 11389173 }, winter: { date: new Date("1906-12-23T01:53:00"), dayPillar: "辛丑", dayBureau: 38, dayJishu: 11389357 } },
    1907: { summer: { date: new Date("1907-06-22T22:22:00"), dayPillar: "壬寅", dayBureau: 3, dayJishu: 11389538 }, winter: { date: new Date("1907-12-23T07:51:00"), dayPillar: "丙午", dayBureau: 43, dayJishu: 11389722 } },
    1908: { summer: { date: new Date("1908-06-22T04:19:00"), dayPillar: "戊申", dayBureau: 9, dayJishu: 11389904 }, winter: { date: new Date("1908-12-22T13:33:00"), dayPillar: "辛亥", dayBureau: 48, dayJishu: 11390087 } },
    1909: { summer: { date: new Date("1909-06-22T10:05:00"), dayPillar: "癸丑", dayBureau: 14, dayJishu: 11390269 }, winter: { date: new Date("1909-12-22T19:19:00"), dayPillar: "丙辰", dayBureau: 53, dayJishu: 11390452 } },
    1910: { summer: { date: new Date("1910-06-22T15:48:00"), dayPillar: "戊午", dayBureau: 19, dayJishu: 11390634 }, winter: { date: new Date("1910-12-23T01:11:00"), dayPillar: "壬戌", dayBureau: 59, dayJishu: 11390818 } },
    1911: { summer: { date: new Date("1911-06-22T21:35:00"), dayPillar: "癸亥", dayBureau: 24, dayJishu: 11390999 }, winter: { date: new Date("1911-12-23T06:53:00"), dayPillar: "丁卯", dayBureau: 64, dayJishu: 11391183 } },
    1912: { summer: { date: new Date("1912-06-22T03:16:00"), dayPillar: "己巳", dayBureau: 30, dayJishu: 11391365 }, winter: { date: new Date("1912-12-22T12:44:00"), dayPillar: "壬申", dayBureau: 69, dayJishu: 11391548 } },
    1913: { summer: { date: new Date("1913-06-22T09:09:00"), dayPillar: "甲戌", dayBureau: 35, dayJishu: 11391730 }, winter: { date: new Date("1913-12-22T18:34:00"), dayPillar: "丁丑", dayBureau: 2, dayJishu: 11391913 } },
    1914: { summer: { date: new Date("1914-06-22T14:54:00"), dayPillar: "己卯", dayBureau: 40, dayJishu: 11392095 }, winter: { date: new Date("1914-12-23T00:22:00"), dayPillar: "癸未", dayBureau: 8, dayJishu: 11392279 } },
    1915: { summer: { date: new Date("1915-06-22T20:29:00"), dayPillar: "甲申", dayBureau: 45, dayJishu: 11392460 }, winter: { date: new Date("1915-12-23T06:15:00"), dayPillar: "戊子", dayBureau: 13, dayJishu: 11392644 } },
    1916: { summer: { date: new Date("1916-06-22T02:24:00"), dayPillar: "庚寅", dayBureau: 51, dayJishu: 11392826 }, winter: { date: new Date("1916-12-22T11:58:00"), dayPillar: "癸巳", dayBureau: 18, dayJishu: 11393009 } },
    1917: { summer: { date: new Date("1917-06-22T08:14:00"), dayPillar: "乙未", dayBureau: 56, dayJishu: 11393191 }, winter: { date: new Date("1917-12-22T17:45:00"), dayPillar: "戊戌", dayBureau: 23, dayJishu: 11393374 } },
    1918: { summer: { date: new Date("1918-06-22T13:59:00"), dayPillar: "庚子", dayBureau: 61, dayJishu: 11393556 }, winter: { date: new Date("1918-12-22T23:41:00"), dayPillar: "癸卯", dayBureau: 29, dayJishu: 11393740 } },
    1919: { summer: { date: new Date("1919-06-22T19:53:00"), dayPillar: "乙巳", dayBureau: 66, dayJishu: 11393921 }, winter: { date: new Date("1919-12-23T05:27:00"), dayPillar: "己酉", dayBureau: 34, dayJishu: 11394105 } },
    1920: { summer: { date: new Date("1920-06-22T01:39:00"), dayPillar: "辛亥", dayBureau: 72, dayJishu: 11394287 }, winter: { date: new Date("1920-12-22T11:16:00"), dayPillar: "甲寅", dayBureau: 39, dayJishu: 11394470 } },
    1921: { summer: { date: new Date("1921-06-22T07:35:00"), dayPillar: "丙辰", dayBureau: 5, dayJishu: 11394652 }, winter: { date: new Date("1921-12-22T17:07:00"), dayPillar: "己未", dayBureau: 44, dayJishu: 11394835 } },
    1922: { summer: { date: new Date("1922-06-22T13:26:00"), dayPillar: "辛酉", dayBureau: 10, dayJishu: 11395017 }, winter: { date: new Date("1922-12-22T22:56:00"), dayPillar: "甲子", dayBureau: 49, dayJishu: 11395200 } },
    1923: { summer: { date: new Date("1923-06-22T19:02:00"), dayPillar: "丙寅", dayBureau: 15, dayJishu: 11395382 }, winter: { date: new Date("1923-12-23T04:53:00"), dayPillar: "庚午", dayBureau: 55, dayJishu: 11395566 } },
    1924: { summer: { date: new Date("1924-06-22T00:59:00"), dayPillar: "壬申", dayBureau: 21, dayJishu: 11395748 }, winter: { date: new Date("1924-12-22T10:45:00"), dayPillar: "乙亥", dayBureau: 60, dayJishu: 11395931 } },
    1925: { summer: { date: new Date("1925-06-22T06:49:00"), dayPillar: "丁丑", dayBureau: 26, dayJishu: 11396113 }, winter: { date: new Date("1925-12-22T16:36:00"), dayPillar: "庚辰", dayBureau: 65, dayJishu: 11396296 } },
    1926: { summer: { date: new Date("1926-06-22T12:29:00"), dayPillar: "壬午", dayBureau: 31, dayJishu: 11396478 }, winter: { date: new Date("1926-12-22T22:33:00"), dayPillar: "乙酉", dayBureau: 70, dayJishu: 11396661 } },
    1927: { summer: { date: new Date("1927-06-22T18:22:00"), dayPillar: "丁亥", dayBureau: 36, dayJishu: 11396843 }, winter: { date: new Date("1927-12-23T04:18:00"), dayPillar: "辛卯", dayBureau: 4, dayJishu: 11397027 } },
    1928: { summer: { date: new Date("1928-06-22T00:06:00"), dayPillar: "癸巳", dayBureau: 42, dayJishu: 11397209 }, winter: { date: new Date("1928-12-22T10:03:00"), dayPillar: "丙申", dayBureau: 9, dayJishu: 11397392 } },
    1929: { summer: { date: new Date("1929-06-22T06:00:00"), dayPillar: "戊戌", dayBureau: 47, dayJishu: 11397574 }, winter: { date: new Date("1929-12-22T15:52:00"), dayPillar: "辛丑", dayBureau: 14, dayJishu: 11397757 } },
    1930: { summer: { date: new Date("1930-06-22T11:52:00"), dayPillar: "癸卯", dayBureau: 52, dayJishu: 11397939 }, winter: { date: new Date("1930-12-22T21:39:00"), dayPillar: "丙午", dayBureau: 19, dayJishu: 11398122 } },
    1931: { summer: { date: new Date("1931-06-22T17:28:00"), dayPillar: "戊申", dayBureau: 57, dayJishu: 11398304 }, winter: { date: new Date("1931-12-23T03:29:00"), dayPillar: "壬子", dayBureau: 25, dayJishu: 11398488 } },
    1932: { summer: { date: new Date("1932-06-21T23:22:00"), dayPillar: "癸丑", dayBureau: 62, dayJishu: 11398669 }, winter: { date: new Date("1932-12-22T09:14:00"), dayPillar: "丁巳", dayBureau: 30, dayJishu: 11398853 } },
    1933: { summer: { date: new Date("1933-06-22T05:11:00"), dayPillar: "己未", dayBureau: 68, dayJishu: 11399035 }, winter: { date: new Date("1933-12-22T14:57:00"), dayPillar: "壬戌", dayBureau: 35, dayJishu: 11399218 } },
    1934: { summer: { date: new Date("1934-06-22T10:47:00"), dayPillar: "甲子", dayBureau: 1, dayJishu: 11399400 }, winter: { date: new Date("1934-12-22T20:49:00"), dayPillar: "丁卯", dayBureau: 40, dayJishu: 11399583 } },
    1935: { summer: { date: new Date("1935-06-22T16:37:00"), dayPillar: "己巳", dayBureau: 6, dayJishu: 11399765 }, winter: { date: new Date("1935-12-23T02:37:00"), dayPillar: "癸酉", dayBureau: 46, dayJishu: 11399949 } },
    1936: { summer: { date: new Date("1936-06-21T22:21:00"), dayPillar: "甲戌", dayBureau: 11, dayJishu: 11400130 }, winter: { date: new Date("1936-12-22T08:26:00"), dayPillar: "戊寅", dayBureau: 51, dayJishu: 11400314 } },
    1937: { summer: { date: new Date("1937-06-22T04:11:00"), dayPillar: "庚辰", dayBureau: 17, dayJishu: 11400496 }, winter: { date: new Date("1937-12-22T14:21:00"), dayPillar: "癸未", dayBureau: 56, dayJishu: 11400679 } },
    1938: { summer: { date: new Date("1938-06-22T10:03:00"), dayPillar: "乙酉", dayBureau: 22, dayJishu: 11400861 }, winter: { date: new Date("1938-12-22T20:13:00"), dayPillar: "戊子", dayBureau: 61, dayJishu: 11401044 } },
    1939: { summer: { date: new Date("1939-06-22T15:39:00"), dayPillar: "庚寅", dayBureau: 27, dayJishu: 11401226 }, winter: { date: new Date("1939-12-23T02:05:00"), dayPillar: "甲午", dayBureau: 67, dayJishu: 11401410 } },
    1940: { summer: { date: new Date("1940-06-21T21:36:00"), dayPillar: "乙未", dayBureau: 32, dayJishu: 11401591 }, winter: { date: new Date("1940-12-22T07:54:00"), dayPillar: "己亥", dayBureau: 72, dayJishu: 11401775 } },
    1941: { summer: { date: new Date("1941-06-22T03:33:00"), dayPillar: "辛丑", dayBureau: 38, dayJishu: 11401957 }, winter: { date: new Date("1941-12-22T13:44:00"), dayPillar: "甲辰", dayBureau: 5, dayJishu: 11402140 } },
    1942: { summer: { date: new Date("1942-06-22T09:16:00"), dayPillar: "丙午", dayBureau: 43, dayJishu: 11402322 }, winter: { date: new Date("1942-12-22T19:39:00"), dayPillar: "己酉", dayBureau: 10, dayJishu: 11402505 } },
    1943: { summer: { date: new Date("1943-06-22T15:12:00"), dayPillar: "辛亥", dayBureau: 48, dayJishu: 11402687 }, winter: { date: new Date("1943-12-23T01:29:00"), dayPillar: "乙卯", dayBureau: 16, dayJishu: 11402871 } },
    1944: { summer: { date: new Date("1944-06-21T21:02:00"), dayPillar: "丙辰", dayBureau: 53, dayJishu: 11403052 }, winter: { date: new Date("1944-12-22T07:14:00"), dayPillar: "庚申", dayBureau: 21, dayJishu: 11403236 } },
    1945: { summer: { date: new Date("1945-06-22T02:52:00"), dayPillar: "壬戌", dayBureau: 59, dayJishu: 11403418 }, winter: { date: new Date("1945-12-22T13:03:00"), dayPillar: "乙丑", dayBureau: 26, dayJishu: 11403601 } },
    1946: { summer: { date: new Date("1946-06-22T08:44:00"), dayPillar: "丁卯", dayBureau: 64, dayJishu: 11403783 }, winter: { date: new Date("1946-12-22T18:53:00"), dayPillar: "庚午", dayBureau: 31, dayJishu: 11403966 } },
    1947: { summer: { date: new Date("1947-06-22T14:18:00"), dayPillar: "壬申", dayBureau: 69, dayJishu: 11404148 }, winter: { date: new Date("1947-12-23T00:42:00"), dayPillar: "丙子", dayBureau: 37, dayJishu: 11404332 } },
    1948: { summer: { date: new Date("1948-06-21T20:10:00"), dayPillar: "丁丑", dayBureau: 2, dayJishu: 11404513 }, winter: { date: new Date("1948-12-22T06:33:00"), dayPillar: "辛巳", dayBureau: 42, dayJishu: 11404697 } },
    1949: { summer: { date: new Date("1949-06-22T02:02:00"), dayPillar: "癸未", dayBureau: 8, dayJishu: 11404879 }, winter: { date: new Date("1949-12-22T12:22:00"), dayPillar: "丙戌", dayBureau: 47, dayJishu: 11405062 } },
    1950: { summer: { date: new Date("1950-06-22T07:35:00"), dayPillar: "戊子", dayBureau: 13, dayJishu: 11405244 }, winter: { date: new Date("1950-12-22T18:13:00"), dayPillar: "辛卯", dayBureau: 52, dayJishu: 11405427 } },
    1951: { summer: { date: new Date("1951-06-22T13:24:00"), dayPillar: "癸巳", dayBureau: 18, dayJishu: 11405609 }, winter: { date: new Date("1951-12-23T00:00:00"), dayPillar: "丁酉", dayBureau: 58, dayJishu: 11405793 } },
    1952: { summer: { date: new Date("1952-06-21T19:12:00"), dayPillar: "戊戌", dayBureau: 23, dayJishu: 11405974 }, winter: { date: new Date("1952-12-22T05:43:00"), dayPillar: "壬寅", dayBureau: 63, dayJishu: 11406158 } },
    1953: { summer: { date: new Date("1953-06-22T00:59:00"), dayPillar: "甲辰", dayBureau: 29, dayJishu: 11406340 }, winter: { date: new Date("1953-12-22T11:31:00"), dayPillar: "丁未", dayBureau: 68, dayJishu: 11406523 } },
    1954: { summer: { date: new Date("1954-06-22T06:53:00"), dayPillar: "己酉", dayBureau: 34, dayJishu: 11406705 }, winter: { date: new Date("1954-12-22T17:24:00"), dayPillar: "壬子", dayBureau: 1, dayJishu: 11406888 } },
    1955: { summer: { date: new Date("1955-06-22T12:31:00"), dayPillar: "甲寅", dayBureau: 39, dayJishu: 11407070 }, winter: { date: new Date("1955-12-22T23:10:00"), dayPillar: "丁巳", dayBureau: 6, dayJishu: 11407254 } },
    1956: { summer: { date: new Date("1956-06-21T18:23:00"), dayPillar: "己未", dayBureau: 44, dayJishu: 11407435 }, winter: { date: new Date("1956-12-22T04:59:00"), dayPillar: "癸亥", dayBureau: 12, dayJishu: 11407619 } },
    1957: { summer: { date: new Date("1957-06-22T00:20:00"), dayPillar: "乙丑", dayBureau: 50, dayJishu: 11407801 }, winter: { date: new Date("1957-12-22T10:48:00"), dayPillar: "戊辰", dayBureau: 17, dayJishu: 11407984 } },
    1958: { summer: { date: new Date("1958-06-22T05:56:00"), dayPillar: "庚午", dayBureau: 55, dayJishu: 11408166 }, winter: { date: new Date("1958-12-22T16:39:00"), dayPillar: "癸酉", dayBureau: 22, dayJishu: 11408349 } },
    1959: { summer: { date: new Date("1959-06-22T11:49:00"), dayPillar: "乙亥", dayBureau: 60, dayJishu: 11408531 }, winter: { date: new Date("1959-12-22T22:34:00"), dayPillar: "戊寅", dayBureau: 27, dayJishu: 11408714 } },
    1960: { summer: { date: new Date("1960-06-21T17:42:00"), dayPillar: "庚辰", dayBureau: 65, dayJishu: 11408896 }, winter: { date: new Date("1960-12-22T04:25:00"), dayPillar: "甲申", dayBureau: 33, dayJishu: 11409080 } },
    1961: { summer: { date: new Date("1961-06-21T23:30:00"), dayPillar: "乙酉", dayBureau: 70, dayJishu: 11409261 }, winter: { date: new Date("1961-12-22T10:19:00"), dayPillar: "己丑", dayBureau: 38, dayJishu: 11409445 } },
    1962: { summer: { date: new Date("1962-06-22T05:24:00"), dayPillar: "辛卯", dayBureau: 4, dayJishu: 11409627 }, winter: { date: new Date("1962-12-22T16:15:00"), dayPillar: "甲午", dayBureau: 43, dayJishu: 11409810 } },
    1963: { summer: { date: new Date("1963-06-22T11:03:00"), dayPillar: "丙申", dayBureau: 9, dayJishu: 11409992 }, winter: { date: new Date("1963-12-22T22:01:00"), dayPillar: "己亥", dayBureau: 48, dayJishu: 11410175 } },
    1964: { summer: { date: new Date("1964-06-21T16:56:00"), dayPillar: "辛丑", dayBureau: 14, dayJishu: 11410357 }, winter: { date: new Date("1964-12-22T03:49:00"), dayPillar: "乙巳", dayBureau: 54, dayJishu: 11410541 } },
    1965: { summer: { date: new Date("1965-06-21T22:55:00"), dayPillar: "丙午", dayBureau: 19, dayJishu: 11410722 }, winter: { date: new Date("1965-12-22T09:40:00"), dayPillar: "庚戌", dayBureau: 59, dayJishu: 11410906 } },
    1966: { summer: { date: new Date("1966-06-22T04:33:00"), dayPillar: "壬子", dayBureau: 25, dayJishu: 11411088 }, winter: { date: new Date("1966-12-22T15:28:00"), dayPillar: "乙卯", dayBureau: 64, dayJishu: 11411271 } },
    1967: { summer: { date: new Date("1967-06-22T10:22:00"), dayPillar: "丁巳", dayBureau: 30, dayJishu: 11411453 }, winter: { date: new Date("1967-12-22T21:16:00"), dayPillar: "庚申", dayBureau: 69, dayJishu: 11411636 } },
    1968: { summer: { date: new Date("1968-06-21T16:13:00"), dayPillar: "壬戌", dayBureau: 35, dayJishu: 11411818 }, winter: { date: new Date("1968-12-22T02:59:00"), dayPillar: "丙寅", dayBureau: 3, dayJishu: 11412002 } },
    1969: { summer: { date: new Date("1969-06-21T21:55:00"), dayPillar: "丁卯", dayBureau: 40, dayJishu: 11412183 }, winter: { date: new Date("1969-12-22T08:43:00"), dayPillar: "辛未", dayBureau: 8, dayJishu: 11412367 } },
    1970: { summer: { date: new Date("1970-06-22T03:42:00"), dayPillar: "癸酉", dayBureau: 46, dayJishu: 11412549 }, winter: { date: new Date("1970-12-22T14:35:00"), dayPillar: "丙子", dayBureau: 13, dayJishu: 11412732 } },
    1971: { summer: { date: new Date("1971-06-22T09:19:00"), dayPillar: "戊寅", dayBureau: 51, dayJishu: 11412914 }, winter: { date: new Date("1971-12-22T20:23:00"), dayPillar: "辛巳", dayBureau: 18, dayJishu: 11413097 } },
    1972: { summer: { date: new Date("1972-06-21T15:06:00"), dayPillar: "癸未", dayBureau: 56, dayJishu: 11413279 }, winter: { date: new Date("1972-12-22T02:12:00"), dayPillar: "丁亥", dayBureau: 24, dayJishu: 11413463 } },
    1973: { summer: { date: new Date("1973-06-21T21:00:00"), dayPillar: "戊子", dayBureau: 61, dayJishu: 11413644 }, winter: { date: new Date("1973-12-22T08:07:00"), dayPillar: "壬辰", dayBureau: 29, dayJishu: 11413828 } },
    1974: { summer: { date: new Date("1974-06-22T02:37:00"), dayPillar: "甲午", dayBureau: 67, dayJishu: 11414010 }, winter: { date: new Date("1974-12-22T13:55:00"), dayPillar: "丁酉", dayBureau: 34, dayJishu: 11414193 } },
    1975: { summer: { date: new Date("1975-06-22T08:26:00"), dayPillar: "己亥", dayBureau: 72, dayJishu: 11414375 }, winter: { date: new Date("1975-12-22T19:45:00"), dayPillar: "壬寅", dayBureau: 39, dayJishu: 11414558 } },
    1976: { summer: { date: new Date("1976-06-21T14:24:00"), dayPillar: "甲辰", dayBureau: 5, dayJishu: 11414740 }, winter: { date: new Date("1976-12-22T01:35:00"), dayPillar: "戊申", dayBureau: 45, dayJishu: 11414924 } },
    1977: { summer: { date: new Date("1977-06-21T20:13:00"), dayPillar: "己酉", dayBureau: 10, dayJishu: 11415105 }, winter: { date: new Date("1977-12-22T07:23:00"), dayPillar: "癸丑", dayBureau: 50, dayJishu: 11415289 } },
    1978: { summer: { date: new Date("1978-06-22T02:09:00"), dayPillar: "乙卯", dayBureau: 16, dayJishu: 11415471 }, winter: { date: new Date("1978-12-22T13:20:00"), dayPillar: "戊午", dayBureau: 55, dayJishu: 11415654 } },
    1979: { summer: { date: new Date("1979-06-22T07:56:00"), dayPillar: "庚申", dayBureau: 21, dayJishu: 11415836 }, winter: { date: new Date("1979-12-22T19:09:00"), dayPillar: "癸亥", dayBureau: 60, dayJishu: 11416019 } },
    1980: { summer: { date: new Date("1980-06-21T13:47:00"), dayPillar: "乙丑", dayBureau: 26, dayJishu: 11416201 }, winter: { date: new Date("1980-12-22T00:56:00"), dayPillar: "己巳", dayBureau: 66, dayJishu: 11416385 } },
    1981: { summer: { date: new Date("1981-06-21T19:44:00"), dayPillar: "庚午", dayBureau: 31, dayJishu: 11416566 }, winter: { date: new Date("1981-12-22T06:50:00"), dayPillar: "甲戌", dayBureau: 71, dayJishu: 11416750 } },
    1982: { summer: { date: new Date("1982-06-22T01:22:00"), dayPillar: "丙子", dayBureau: 37, dayJishu: 11416932 }, winter: { date: new Date("1982-12-22T12:38:00"), dayPillar: "己卯", dayBureau: 4, dayJishu: 11417115 } },
    1983: { summer: { date: new Date("1983-06-22T07:08:00"), dayPillar: "辛巳", dayBureau: 42, dayJishu: 11417297 }, winter: { date: new Date("1983-12-22T18:29:00"), dayPillar: "甲申", dayBureau: 9, dayJishu: 11417480 } },
    1984: { summer: { date: new Date("1984-06-21T13:02:00"), dayPillar: "丙戌", dayBureau: 47, dayJishu: 11417662 }, winter: { date: new Date("1984-12-22T00:22:00"), dayPillar: "庚寅", dayBureau: 15, dayJishu: 11417846 } },
    1985: { summer: { date: new Date("1985-06-21T18:44:00"), dayPillar: "辛卯", dayBureau: 52, dayJishu: 11418027 }, winter: { date: new Date("1985-12-22T06:07:00"), dayPillar: "乙未", dayBureau: 20, dayJishu: 11418211 } },
    1986: { summer: { date: new Date("1986-06-22T00:29:00"), dayPillar: "丁酉", dayBureau: 58, dayJishu: 11418393 }, winter: { date: new Date("1986-12-22T12:02:00"), dayPillar: "庚子", dayBureau: 25, dayJishu: 11418576 } },
    1987: { summer: { date: new Date("1987-06-22T06:10:00"), dayPillar: "壬寅", dayBureau: 63, dayJishu: 11418758 }, winter: { date: new Date("1987-12-22T17:45:00"), dayPillar: "乙巳", dayBureau: 30, dayJishu: 11418941 } },
    1988: { summer: { date: new Date("1988-06-21T11:56:00"), dayPillar: "丁未", dayBureau: 68, dayJishu: 11419123 }, winter: { date: new Date("1988-12-21T23:27:00"), dayPillar: "庚戌", dayBureau: 35, dayJishu: 11419307 } },
    1989: { summer: { date: new Date("1989-06-21T17:53:00"), dayPillar: "壬子", dayBureau: 1, dayJishu: 11419488 }, winter: { date: new Date("1989-12-22T05:22:00"), dayPillar: "丙辰", dayBureau: 41, dayJishu: 11419672 } },
    1990: { summer: { date: new Date("1990-06-21T23:32:00"), dayPillar: "丁巳", dayBureau: 6, dayJishu: 11419853 }, winter: { date: new Date("1990-12-22T11:06:00"), dayPillar: "辛酉", dayBureau: 46, dayJishu: 11420037 } },
    1991: { summer: { date: new Date("1991-06-22T05:18:00"), dayPillar: "癸亥", dayBureau: 12, dayJishu: 11420219 }, winter: { date: new Date("1991-12-22T16:53:00"), dayPillar: "丙寅", dayBureau: 51, dayJishu: 11420402 } },
    1992: { summer: { date: new Date("1992-06-21T11:14:00"), dayPillar: "戊辰", dayBureau: 17, dayJishu: 11420584 }, winter: { date: new Date("1992-12-21T22:43:00"), dayPillar: "辛未", dayBureau: 56, dayJishu: 11420767 } },
    1993: { summer: { date: new Date("1993-06-21T16:59:00"), dayPillar: "癸酉", dayBureau: 22, dayJishu: 11420949 }, winter: { date: new Date("1993-12-22T04:25:00"), dayPillar: "丁丑", dayBureau: 62, dayJishu: 11421133 } },
    1994: { summer: { date: new Date("1994-06-21T22:47:00"), dayPillar: "戊寅", dayBureau: 27, dayJishu: 11421314 }, winter: { date: new Date("1994-12-22T10:22:00"), dayPillar: "壬午", dayBureau: 67, dayJishu: 11421498 } },
    1995: { summer: { date: new Date("1995-06-22T04:34:00"), dayPillar: "甲申", dayBureau: 33, dayJishu: 11421680 }, winter: { date: new Date("1995-12-22T16:16:00"), dayPillar: "丁亥", dayBureau: 72, dayJishu: 11421863 } },
    1996: { summer: { date: new Date("1996-06-21T10:23:00"), dayPillar: "己丑", dayBureau: 38, dayJishu: 11422045 }, winter: { date: new Date("1996-12-21T22:05:00"), dayPillar: "壬辰", dayBureau: 5, dayJishu: 11422228 } },
    1997: { summer: { date: new Date("1997-06-21T16:19:00"), dayPillar: "甲午", dayBureau: 43, dayJishu: 11422410 }, winter: { date: new Date("1997-12-22T04:07:00"), dayPillar: "戊戌", dayBureau: 11, dayJishu: 11422594 } },
    1998: { summer: { date: new Date("1998-06-21T22:02:00"), dayPillar: "己亥", dayBureau: 48, dayJishu: 11422775 }, winter: { date: new Date("1998-12-22T09:56:00"), dayPillar: "癸卯", dayBureau: 16, dayJishu: 11422959 } },
    1999: { summer: { date: new Date("1999-06-22T03:49:00"), dayPillar: "乙巳", dayBureau: 54, dayJishu: 11423141 }, winter: { date: new Date("1999-12-22T15:43:00"), dayPillar: "戊申", dayBureau: 21, dayJishu: 11423324 } },
    2000: { summer: { date: new Date("2000-06-21T09:47:00"), dayPillar: "庚戌", dayBureau: 59, dayJishu: 11423506 }, winter: { date: new Date("2000-12-21T21:37:00"), dayPillar: "癸丑", dayBureau: 26, dayJishu: 11423689 } },
    2001: { summer: { date: new Date("2001-06-21T15:37:00"), dayPillar: "乙卯", dayBureau: 64, dayJishu: 11423871 }, winter: { date: new Date("2001-12-22T03:21:00"), dayPillar: "己未", dayBureau: 32, dayJishu: 11424055 } },
    2002: { summer: { date: new Date("2002-06-21T21:24:00"), dayPillar: "庚申", dayBureau: 69, dayJishu: 11424236 }, winter: { date: new Date("2002-12-22T09:14:00"), dayPillar: "甲子", dayBureau: 37, dayJishu: 11424420 } },
    2003: { summer: { date: new Date("2003-06-22T03:10:00"), dayPillar: "丙寅", dayBureau: 3, dayJishu: 11424602 }, winter: { date: new Date("2003-12-22T15:03:00"), dayPillar: "己巳", dayBureau: 42, dayJishu: 11424785 } },
    2004: { summer: { date: new Date("2004-06-21T08:56:00"), dayPillar: "辛未", dayBureau: 8, dayJishu: 11424967 }, winter: { date: new Date("2004-12-21T20:41:00"), dayPillar: "甲戌", dayBureau: 47, dayJishu: 11425150 } },
    2005: { summer: { date: new Date("2005-06-21T14:46:00"), dayPillar: "丙子", dayBureau: 13, dayJishu: 11425332 }, winter: { date: new Date("2005-12-22T02:34:00"), dayPillar: "庚辰", dayBureau: 53, dayJishu: 11425516 } },
    2006: { summer: { date: new Date("2006-06-21T20:25:00"), dayPillar: "辛巳", dayBureau: 18, dayJishu: 11425697 }, winter: { date: new Date("2006-12-22T08:22:00"), dayPillar: "乙酉", dayBureau: 58, dayJishu: 11425881 } },
    2007: { summer: { date: new Date("2007-06-22T02:06:00"), dayPillar: "丁亥", dayBureau: 24, dayJishu: 11426063 }, winter: { date: new Date("2007-12-22T14:07:00"), dayPillar: "庚寅", dayBureau: 63, dayJishu: 11426246 } },
    2008: { summer: { date: new Date("2008-06-21T07:59:00"), dayPillar: "壬辰", dayBureau: 29, dayJishu: 11426428 }, winter: { date: new Date("2008-12-21T20:03:00"), dayPillar: "乙未", dayBureau: 68, dayJishu: 11426611 } },
    2009: { summer: { date: new Date("2009-06-21T13:45:00"), dayPillar: "丁酉", dayBureau: 34, dayJishu: 11426793 }, winter: { date: new Date("2009-12-22T01:46:00"), dayPillar: "辛丑", dayBureau: 2, dayJishu: 11426977 } },
    2010: { summer: { date: new Date("2010-06-21T19:28:00"), dayPillar: "壬寅", dayBureau: 39, dayJishu: 11427158 }, winter: { date: new Date("2010-12-22T07:38:00"), dayPillar: "丙午", dayBureau: 7, dayJishu: 11427342 } },
    2011: { summer: { date: new Date("2011-06-22T01:16:00"), dayPillar: "戊申", dayBureau: 45, dayJishu: 11427524 }, winter: { date: new Date("2011-12-22T13:30:00"), dayPillar: "辛亥", dayBureau: 12, dayJishu: 11427707 } },
    2012: { summer: { date: new Date("2012-06-21T07:08:00"), dayPillar: "癸丑", dayBureau: 50, dayJishu: 11427889 }, winter: { date: new Date("2012-12-21T19:11:00"), dayPillar: "丙辰", dayBureau: 17, dayJishu: 11428072 } },
    2013: { summer: { date: new Date("2013-06-21T13:03:00"), dayPillar: "戊午", dayBureau: 55, dayJishu: 11428254 }, winter: { date: new Date("2013-12-22T01:10:00"), dayPillar: "壬戌", dayBureau: 23, dayJishu: 11428438 } },
    2014: { summer: { date: new Date("2014-06-21T18:51:00"), dayPillar: "癸亥", dayBureau: 60, dayJishu: 11428619 }, winter: { date: new Date("2014-12-22T07:02:00"), dayPillar: "丁卯", dayBureau: 28, dayJishu: 11428803 } },
    2015: { summer: { date: new Date("2015-06-22T00:37:00"), dayPillar: "己巳", dayBureau: 66, dayJishu: 11428985 }, winter: { date: new Date("2015-12-22T12:47:00"), dayPillar: "壬申", dayBureau: 33, dayJishu: 11429168 } },
    2016: { summer: { date: new Date("2016-06-21T06:34:00"), dayPillar: "甲戌", dayBureau: 71, dayJishu: 11429350 }, winter: { date: new Date("2016-12-21T18:44:00"), dayPillar: "丁丑", dayBureau: 38, dayJishu: 11429533 } },
    2017: { summer: { date: new Date("2017-06-21T12:24:00"), dayPillar: "己卯", dayBureau: 4, dayJishu: 11429715 }, winter: { date: new Date("2017-12-22T00:27:00"), dayPillar: "癸未", dayBureau: 44, dayJishu: 11429899 } },
    2018: { summer: { date: new Date("2018-06-21T18:07:00"), dayPillar: "甲申", dayBureau: 9, dayJishu: 11430080 }, winter: { date: new Date("2018-12-22T06:22:00"), dayPillar: "戊子", dayBureau: 49, dayJishu: 11430264 } },
    2019: { summer: { date: new Date("2019-06-21T23:54:00"), dayPillar: "己丑", dayBureau: 14, dayJishu: 11430445 }, winter: { date: new Date("2019-12-22T12:19:00"), dayPillar: "癸巳", dayBureau: 54, dayJishu: 11430629 } },
    2020: { summer: { date: new Date("2020-06-21T05:43:00"), dayPillar: "乙未", dayBureau: 20, dayJishu: 11430811 }, winter: { date: new Date("2020-12-21T18:02:00"), dayPillar: "戊戌", dayBureau: 59, dayJishu: 11430994 } },
    2021: { summer: { date: new Date("2021-06-21T11:31:00"), dayPillar: "庚子", dayBureau: 25, dayJishu: 11431176 }, winter: { date: new Date("2021-12-21T23:59:00"), dayPillar: "癸卯", dayBureau: 65, dayJishu: 11431360 } },
    2022: { summer: { date: new Date("2022-06-21T17:13:00"), dayPillar: "乙巳", dayBureau: 30, dayJishu: 11431541 }, winter: { date: new Date("2022-12-22T05:48:00"), dayPillar: "己酉", dayBureau: 70, dayJishu: 11431725 } },
    2023: { summer: { date: new Date("2023-06-21T22:57:00"), dayPillar: "庚戌", dayBureau: 35, dayJishu: 11431906 }, winter: { date: new Date("2023-12-22T11:27:00"), dayPillar: "甲寅", dayBureau: 3, dayJishu: 11432090 } },
    2024: { summer: { date: new Date("2024-06-21T04:50:00"), dayPillar: "丙辰", dayBureau: 41, dayJishu: 11432272 }, winter: { date: new Date("2024-12-21T17:20:00"), dayPillar: "己未", dayBureau: 8, dayJishu: 11432455 } },
    2025: { summer: { date: new Date("2025-06-21T10:41:00"), dayPillar: "辛酉", dayBureau: 46, dayJishu: 11432637 }, winter: { date: new Date("2025-12-21T23:02:00"), dayPillar: "甲子", dayBureau: 13, dayJishu: 11432820 } },
    2026: { summer: { date: new Date("2026-06-21T16:24:00"), dayPillar: "丙寅", dayBureau: 51, dayJishu: 11433002 }, winter: { date: new Date("2026-12-22T04:49:00"), dayPillar: "庚午", dayBureau: 19, dayJishu: 11433186 } },
    2027: { summer: { date: new Date("2027-06-21T22:10:00"), dayPillar: "辛未", dayBureau: 56, dayJishu: 11433367 }, winter: { date: new Date("2027-12-22T10:41:00"), dayPillar: "乙亥", dayBureau: 24, dayJishu: 11433551 } },
    2028: { summer: { date: new Date("2028-06-21T04:01:00"), dayPillar: "丁丑", dayBureau: 62, dayJishu: 11433733 }, winter: { date: new Date("2028-12-21T16:19:00"), dayPillar: "庚辰", dayBureau: 29, dayJishu: 11433916 } },
    2029: { summer: { date: new Date("2029-06-21T09:47:00"), dayPillar: "壬午", dayBureau: 67, dayJishu: 11434098 }, winter: { date: new Date("2029-12-21T22:13:00"), dayPillar: "乙酉", dayBureau: 34, dayJishu: 11434281 } },
    2030: { summer: { date: new Date("2030-06-21T15:30:00"), dayPillar: "丁亥", dayBureau: 72, dayJishu: 11434463 }, winter: { date: new Date("2030-12-22T04:09:00"), dayPillar: "辛卯", dayBureau: 40, dayJishu: 11434647 } },
    2031: { summer: { date: new Date("2031-06-21T21:16:00"), dayPillar: "壬辰", dayBureau: 5, dayJishu: 11434828 }, winter: { date: new Date("2031-12-22T09:55:00"), dayPillar: "丙申", dayBureau: 45, dayJishu: 11435012 } },
    2032: { summer: { date: new Date("2032-06-21T03:08:00"), dayPillar: "戊戌", dayBureau: 11, dayJishu: 11435194 }, winter: { date: new Date("2032-12-21T15:55:00"), dayPillar: "辛丑", dayBureau: 50, dayJishu: 11435377 } },
    2033: { summer: { date: new Date("2033-06-21T09:00:00"), dayPillar: "癸卯", dayBureau: 16, dayJishu: 11435559 }, winter: { date: new Date("2033-12-21T21:45:00"), dayPillar: "丙午", dayBureau: 55, dayJishu: 11435742 } },
    2034: { summer: { date: new Date("2034-06-21T14:43:00"), dayPillar: "戊申", dayBureau: 21, dayJishu: 11435924 }, winter: { date: new Date("2034-12-22T03:33:00"), dayPillar: "壬子", dayBureau: 61, dayJishu: 11436108 } },
    2035: { summer: { date: new Date("2035-06-21T20:32:00"), dayPillar: "癸丑", dayBureau: 26, dayJishu: 11436289 }, winter: { date: new Date("2035-12-22T09:30:00"), dayPillar: "丁巳", dayBureau: 66, dayJishu: 11436473 } },
    2036: { summer: { date: new Date("2036-06-21T02:31:00"), dayPillar: "己未", dayBureau: 32, dayJishu: 11436655 }, winter: { date: new Date("2036-12-21T15:12:00"), dayPillar: "壬戌", dayBureau: 71, dayJishu: 11436838 } },
    2037: { summer: { date: new Date("2037-06-21T08:21:00"), dayPillar: "甲子", dayBureau: 37, dayJishu: 11437020 }, winter: { date: new Date("2037-12-21T21:07:00"), dayPillar: "丁卯", dayBureau: 4, dayJishu: 11437203 } },
    2038: { summer: { date: new Date("2038-06-21T14:08:00"), dayPillar: "己巳", dayBureau: 42, dayJishu: 11437385 }, winter: { date: new Date("2038-12-22T03:01:00"), dayPillar: "癸酉", dayBureau: 10, dayJishu: 11437569 } },
    2039: { summer: { date: new Date("2039-06-21T19:56:00"), dayPillar: "甲戌", dayBureau: 47, dayJishu: 11437750 }, winter: { date: new Date("2039-12-22T08:40:00"), dayPillar: "戊寅", dayBureau: 15, dayJishu: 11437934 } },
    2040: { summer: { date: new Date("2040-06-21T01:45:00"), dayPillar: "庚辰", dayBureau: 53, dayJishu: 11438116 }, winter: { date: new Date("2040-12-21T14:32:00"), dayPillar: "癸未", dayBureau: 20, dayJishu: 11438299 } },
    2041: { summer: { date: new Date("2041-06-21T07:35:00"), dayPillar: "乙酉", dayBureau: 58, dayJishu: 11438481 }, winter: { date: new Date("2041-12-21T20:17:00"), dayPillar: "戊子", dayBureau: 25, dayJishu: 11438664 } },
    2042: { summer: { date: new Date("2042-06-21T13:15:00"), dayPillar: "庚寅", dayBureau: 63, dayJishu: 11438846 }, winter: { date: new Date("2042-12-22T02:03:00"), dayPillar: "甲午", dayBureau: 31, dayJishu: 11439030 } },
    2043: { summer: { date: new Date("2043-06-21T18:57:00"), dayPillar: "乙未", dayBureau: 68, dayJishu: 11439211 }, winter: { date: new Date("2043-12-22T08:00:00"), dayPillar: "己亥", dayBureau: 36, dayJishu: 11439395 } },
    2044: { summer: { date: new Date("2044-06-21T00:50:00"), dayPillar: "辛丑", dayBureau: 2, dayJishu: 11439577 }, winter: { date: new Date("2044-12-21T13:42:00"), dayPillar: "甲辰", dayBureau: 41, dayJishu: 11439760 } },
    2045: { summer: { date: new Date("2045-06-21T06:33:00"), dayPillar: "丙午", dayBureau: 7, dayJishu: 11439942 }, winter: { date: new Date("2045-12-21T19:34:00"), dayPillar: "己酉", dayBureau: 46, dayJishu: 11440125 } },
    2046: { summer: { date: new Date("2046-06-21T12:13:00"), dayPillar: "辛亥", dayBureau: 12, dayJishu: 11440307 }, winter: { date: new Date("2046-12-22T01:27:00"), dayPillar: "乙卯", dayBureau: 52, dayJishu: 11440491 } },
    2047: { summer: { date: new Date("2047-06-21T18:02:00"), dayPillar: "丙辰", dayBureau: 17, dayJishu: 11440672 }, winter: { date: new Date("2047-12-22T07:06:00"), dayPillar: "庚申", dayBureau: 57, dayJishu: 11440856 } },
    2048: { summer: { date: new Date("2048-06-20T23:53:00"), dayPillar: "辛酉", dayBureau: 22, dayJishu: 11441037 }, winter: { date: new Date("2048-12-21T13:01:00"), dayPillar: "乙丑", dayBureau: 62, dayJishu: 11441221 } },
    2049: { summer: { date: new Date("2049-06-21T05:46:00"), dayPillar: "丁卯", dayBureau: 28, dayJishu: 11441403 }, winter: { date: new Date("2049-12-21T18:51:00"), dayPillar: "庚午", dayBureau: 67, dayJishu: 11441586 } },
    2050: { summer: { date: new Date("2050-06-21T11:32:00"), dayPillar: "壬申", dayBureau: 33, dayJishu: 11441768 }, winter: { date: new Date("2050-12-22T00:37:00"), dayPillar: "丙子", dayBureau: 1, dayJishu: 11441952 } },
    2051: { summer: { date: new Date("2051-06-21T17:17:00"), dayPillar: "丁丑", dayBureau: 38, dayJishu: 11442133 }, winter: { date: new Date("2051-12-22T06:33:00"), dayPillar: "辛巳", dayBureau: 6, dayJishu: 11442317 } },
    2052: { summer: { date: new Date("2052-06-20T23:15:00"), dayPillar: "壬午", dayBureau: 43, dayJishu: 11442498 }, winter: { date: new Date("2052-12-21T12:16:00"), dayPillar: "丙戌", dayBureau: 11, dayJishu: 11442682 } },
    2053: { summer: { date: new Date("2053-06-21T05:03:00"), dayPillar: "戊子", dayBureau: 49, dayJishu: 11442864 }, winter: { date: new Date("2053-12-21T18:09:00"), dayPillar: "辛卯", dayBureau: 16, dayJishu: 11443047 } },
    2054: { summer: { date: new Date("2054-06-21T10:46:00"), dayPillar: "癸巳", dayBureau: 54, dayJishu: 11443229 }, winter: { date: new Date("2054-12-22T00:09:00"), dayPillar: "丁酉", dayBureau: 22, dayJishu: 11443413 } },
    2055: { summer: { date: new Date("2055-06-21T16:39:00"), dayPillar: "戊戌", dayBureau: 59, dayJishu: 11443594 }, winter: { date: new Date("2055-12-22T05:54:00"), dayPillar: "壬寅", dayBureau: 27, dayJishu: 11443778 } },
    2056: { summer: { date: new Date("2056-06-20T22:27:00"), dayPillar: "癸卯", dayBureau: 64, dayJishu: 11443959 }, winter: { date: new Date("2056-12-21T11:50:00"), dayPillar: "丁未", dayBureau: 32, dayJishu: 11444143 } },
    2057: { summer: { date: new Date("2057-06-21T04:18:00"), dayPillar: "己酉", dayBureau: 70, dayJishu: 11444325 }, winter: { date: new Date("2057-12-21T17:42:00"), dayPillar: "壬子", dayBureau: 37, dayJishu: 11444508 } },
    2058: { summer: { date: new Date("2058-06-21T10:03:00"), dayPillar: "甲寅", dayBureau: 3, dayJishu: 11444690 }, winter: { date: new Date("2058-12-21T23:24:00"), dayPillar: "丁巳", dayBureau: 43, dayJishu: 11444874 } },
    2059: { summer: { date: new Date("2059-06-21T15:46:00"), dayPillar: "己未", dayBureau: 8, dayJishu: 11445055 }, winter: { date: new Date("2059-12-22T05:17:00"), dayPillar: "癸亥", dayBureau: 48, dayJishu: 11445239 } },
    2060: { summer: { date: new Date("2060-06-20T21:44:00"), dayPillar: "甲子", dayBureau: 13, dayJishu: 11445420 }, winter: { date: new Date("2060-12-21T11:00:00"), dayPillar: "戊辰", dayBureau: 53, dayJishu: 11445604 } },
    2061: { summer: { date: new Date("2061-06-21T03:31:00"), dayPillar: "庚午", dayBureau: 19, dayJishu: 11445786 }, winter: { date: new Date("2061-12-21T16:48:00"), dayPillar: "癸酉", dayBureau: 58, dayJishu: 11445969 } },
    2062: { summer: { date: new Date("2062-06-21T09:10:00"), dayPillar: "乙亥", dayBureau: 24, dayJishu: 11446151 }, winter: { date: new Date("2062-12-21T22:41:00"), dayPillar: "戊寅", dayBureau: 63, dayJishu: 11446334 } },
    2063: { summer: { date: new Date("2063-06-21T15:01:00"), dayPillar: "庚辰", dayBureau: 29, dayJishu: 11446516 }, winter: { date: new Date("2063-12-22T04:20:00"), dayPillar: "甲申", dayBureau: 69, dayJishu: 11446700 } },
    2064: { summer: { date: new Date("2064-06-20T20:44:00"), dayPillar: "乙酉", dayBureau: 34, dayJishu: 11446881 }, winter: { date: new Date("2064-12-21T10:08:00"), dayPillar: "己丑", dayBureau: 2, dayJishu: 11447065 } },
    2065: { summer: { date: new Date("2065-06-21T02:31:00"), dayPillar: "辛卯", dayBureau: 40, dayJishu: 11447247 }, winter: { date: new Date("2065-12-21T16:00:00"), dayPillar: "甲午", dayBureau: 7, dayJishu: 11447430 } },
    2066: { summer: { date: new Date("2066-06-21T08:15:00"), dayPillar: "丙申", dayBureau: 45, dayJishu: 11447612 }, winter: { date: new Date("2066-12-21T21:44:00"), dayPillar: "己亥", dayBureau: 12, dayJishu: 11447795 } },
    2067: { summer: { date: new Date("2067-06-21T13:55:00"), dayPillar: "辛丑", dayBureau: 50, dayJishu: 11447977 }, winter: { date: new Date("2067-12-22T03:42:00"), dayPillar: "乙巳", dayBureau: 18, dayJishu: 11448161 } },
    2068: { summer: { date: new Date("2068-06-20T19:53:00"), dayPillar: "丙午", dayBureau: 55, dayJishu: 11448342 }, winter: { date: new Date("2068-12-21T09:32:00"), dayPillar: "庚戌", dayBureau: 23, dayJishu: 11448526 } },
    2069: { summer: { date: new Date("2069-06-21T01:40:00"), dayPillar: "壬子", dayBureau: 61, dayJishu: 11448708 }, winter: { date: new Date("2069-12-21T15:21:00"), dayPillar: "乙卯", dayBureau: 28, dayJishu: 11448891 } },
    2070: { summer: { date: new Date("2070-06-21T07:21:00"), dayPillar: "丁巳", dayBureau: 66, dayJishu: 11449073 }, winter: { date: new Date("2070-12-21T21:18:00"), dayPillar: "庚申", dayBureau: 33, dayJishu: 11449256 } },
    2071: { summer: { date: new Date("2071-06-21T13:20:00"), dayPillar: "壬戌", dayBureau: 71, dayJishu: 11449438 }, winter: { date: new Date("2071-12-22T03:03:00"), dayPillar: "丙寅", dayBureau: 39, dayJishu: 11449622 } },
    2072: { summer: { date: new Date("2072-06-20T19:13:00"), dayPillar: "丁卯", dayBureau: 4, dayJishu: 11449803 }, winter: { date: new Date("2072-12-21T08:55:00"), dayPillar: "辛未", dayBureau: 44, dayJishu: 11449987 } },
    2073: { summer: { date: new Date("2073-06-21T01:06:00"), dayPillar: "癸酉", dayBureau: 10, dayJishu: 11450169 }, winter: { date: new Date("2073-12-21T14:50:00"), dayPillar: "丙子", dayBureau: 49, dayJishu: 11450352 } },
    2074: { summer: { date: new Date("2074-06-21T06:57:00"), dayPillar: "戊寅", dayBureau: 15, dayJishu: 11450534 }, winter: { date: new Date("2074-12-21T20:34:00"), dayPillar: "辛巳", dayBureau: 54, dayJishu: 11450717 } },
    2075: { summer: { date: new Date("2075-06-21T12:39:00"), dayPillar: "癸未", dayBureau: 20, dayJishu: 11450899 }, winter: { date: new Date("2075-12-22T02:26:00"), dayPillar: "丁亥", dayBureau: 60, dayJishu: 11451083 } },
    2076: { summer: { date: new Date("2076-06-20T18:36:00"), dayPillar: "戊子", dayBureau: 25, dayJishu: 11451264 }, winter: { date: new Date("2076-12-21T08:12:00"), dayPillar: "壬辰", dayBureau: 65, dayJishu: 11451448 } },
    2077: { summer: { date: new Date("2077-06-21T00:22:00"), dayPillar: "甲午", dayBureau: 31, dayJishu: 11451630 }, winter: { date: new Date("2077-12-21T14:00:00"), dayPillar: "丁酉", dayBureau: 70, dayJishu: 11451813 } },
    2078: { summer: { date: new Date("2078-06-21T05:57:00"), dayPillar: "己亥", dayBureau: 36, dayJishu: 11451995 }, winter: { date: new Date("2078-12-21T19:57:00"), dayPillar: "壬寅", dayBureau: 3, dayJishu: 11452178 } },
    2079: { summer: { date: new Date("2079-06-21T11:48:00"), dayPillar: "甲辰", dayBureau: 41, dayJishu: 11452360 }, winter: { date: new Date("2079-12-22T01:43:00"), dayPillar: "戊申", dayBureau: 9, dayJishu: 11452544 } },
    2080: { summer: { date: new Date("2080-06-20T17:33:00"), dayPillar: "己酉", dayBureau: 46, dayJishu: 11452725 }, winter: { date: new Date("2080-12-21T07:32:00"), dayPillar: "癸丑", dayBureau: 14, dayJishu: 11452909 } },
    2081: { summer: { date: new Date("2081-06-20T23:15:00"), dayPillar: "甲寅", dayBureau: 51, dayJishu: 11453090 }, winter: { date: new Date("2081-12-21T13:21:00"), dayPillar: "戊午", dayBureau: 19, dayJishu: 11453274 } },
    2082: { summer: { date: new Date("2082-06-21T05:02:00"), dayPillar: "庚申", dayBureau: 57, dayJishu: 11453456 }, winter: { date: new Date("2082-12-21T19:04:00"), dayPillar: "癸亥", dayBureau: 24, dayJishu: 11453639 } },
    2083: { summer: { date: new Date("2083-06-21T10:43:00"), dayPillar: "乙丑", dayBureau: 62, dayJishu: 11453821 }, winter: { date: new Date("2083-12-22T00:52:00"), dayPillar: "己巳", dayBureau: 30, dayJishu: 11454005 } },
    2084: { summer: { date: new Date("2084-06-20T16:39:00"), dayPillar: "庚午", dayBureau: 67, dayJishu: 11454186 }, winter: { date: new Date("2084-12-21T06:40:00"), dayPillar: "甲戌", dayBureau: 35, dayJishu: 11454370 } },
    2085: { summer: { date: new Date("2085-06-20T22:32:00"), dayPillar: "乙亥", dayBureau: 72, dayJishu: 11454551 }, winter: { date: new Date("2085-12-21T12:28:00"), dayPillar: "己卯", dayBureau: 40, dayJishu: 11454735 } },
    2086: { summer: { date: new Date("2086-06-21T04:09:00"), dayPillar: "辛巳", dayBureau: 6, dayJishu: 11454917 }, winter: { date: new Date("2086-12-21T18:22:00"), dayPillar: "甲申", dayBureau: 45, dayJishu: 11455100 } },
    2087: { summer: { date: new Date("2087-06-21T10:05:00"), dayPillar: "丙戌", dayBureau: 11, dayJishu: 11455282 }, winter: { date: new Date("2087-12-22T00:07:00"), dayPillar: "庚寅", dayBureau: 51, dayJishu: 11455466 } },
    2088: { summer: { date: new Date("2088-06-20T15:56:00"), dayPillar: "辛卯", dayBureau: 16, dayJishu: 11455647 }, winter: { date: new Date("2088-12-21T05:55:00"), dayPillar: "乙未", dayBureau: 56, dayJishu: 11455831 } },
    2089: { summer: { date: new Date("2089-06-20T21:42:00"), dayPillar: "丙申", dayBureau: 21, dayJishu: 11456012 }, winter: { date: new Date("2089-12-21T11:51:00"), dayPillar: "庚子", dayBureau: 61, dayJishu: 11456196 } },
    2090: { summer: { date: new Date("2090-06-21T03:35:00"), dayPillar: "壬寅", dayBureau: 27, dayJishu: 11456378 }, winter: { date: new Date("2090-12-21T17:43:00"), dayPillar: "乙巳", dayBureau: 66, dayJishu: 11456561 } },
    2091: { summer: { date: new Date("2091-06-21T09:18:00"), dayPillar: "丁未", dayBureau: 32, dayJishu: 11456743 }, winter: { date: new Date("2091-12-21T23:38:00"), dayPillar: "庚戌", dayBureau: 72, dayJishu: 11456927 } },
    2092: { summer: { date: new Date("2092-06-20T15:14:00"), dayPillar: "壬子", dayBureau: 37, dayJishu: 11457108 }, winter: { date: new Date("2092-12-21T05:31:00"), dayPillar: "丙辰", dayBureau: 5, dayJishu: 11457292 } },
    2093: { summer: { date: new Date("2093-06-20T21:06:00"), dayPillar: "丁巳", dayBureau: 42, dayJishu: 11457473 }, winter: { date: new Date("2093-12-21T11:20:00"), dayPillar: "辛酉", dayBureau: 10, dayJishu: 11457657 } },
    2094: { summer: { date: new Date("2094-06-21T02:41:00"), dayPillar: "癸亥", dayBureau: 48, dayJishu: 11457839 }, winter: { date: new Date("2094-12-21T17:12:00"), dayPillar: "丙寅", dayBureau: 15, dayJishu: 11458022 } },
    2095: { summer: { date: new Date("2095-06-21T08:38:00"), dayPillar: "戊辰", dayBureau: 53, dayJishu: 11458204 }, winter: { date: new Date("2095-12-21T23:00:00"), dayPillar: "辛未", dayBureau: 21, dayJishu: 11458388 } },
    2096: { summer: { date: new Date("2096-06-20T14:30:00"), dayPillar: "癸酉", dayBureau: 58, dayJishu: 11458569 }, winter: { date: new Date("2096-12-21T04:45:00"), dayPillar: "丁丑", dayBureau: 26, dayJishu: 11458753 } },
    2097: { summer: { date: new Date("2097-06-20T20:12:00"), dayPillar: "戊寅", dayBureau: 63, dayJishu: 11458934 }, winter: { date: new Date("2097-12-21T10:36:00"), dayPillar: "壬午", dayBureau: 31, dayJishu: 11459118 } },
    2098: { summer: { date: new Date("2098-06-21T02:02:00"), dayPillar: "甲申", dayBureau: 69, dayJishu: 11459300 }, winter: { date: new Date("2098-12-21T16:20:00"), dayPillar: "丁亥", dayBureau: 36, dayJishu: 11459483 } },
    2099: { summer: { date: new Date("2099-06-21T07:41:00"), dayPillar: "己丑", dayBureau: 2, dayJishu: 11459665 }, winter: { date: new Date("2099-12-21T22:03:00"), dayPillar: "壬辰", dayBureau: 41, dayJishu: 11459848 } },
    2100: { summer: { date: new Date("2100-06-21T13:31:00"), dayPillar: "甲午", dayBureau: 7, dayJishu: 11460030 }, winter: { date: new Date("2100-12-22T03:50:00"), dayPillar: "戊戌", dayBureau: 47, dayJishu: 11460214 } }
    };

    // ▼▼▼ 144局的完整資料庫 (已新增「定目」) ▼▼▼
    const BUREAU_DATA = [
    {"局":"陽1局","太乙":"乾","文昌":"申","始擊":"坤","定目":"坤","主算":7,"客算":13,"定算":13},
    {"局":"陽2局","太乙":"乾","文昌":"酉","始擊":"戌","定目":"戌","主算":6,"客算":1,"定算":1},
    {"局":"陽3局","太乙":"乾","文昌":"戌","始擊":"亥","定目":"丑","主算":1,"客算":40,"定算":32},
    {"局":"陽4局","太乙":"午","文昌":"乾","始擊":"丑","定目":"辰","主算":25,"客算":17,"定算":10},
    {"局":"陽5局","太乙":"午","文昌":"乾","始擊":"寅","定目":"巳","主算":25,"客算":14,"定算":1},
    {"局":"陽6局","太乙":"午","文昌":"亥","始擊":"辰","定目":"申","主算":25,"客算":10,"定算":32},
    {"局":"陽7局","太乙":"艮","文昌":"子","始擊":"巳","定目":"亥","主算":8,"客算":25,"定算":9},
    {"局":"陽8局","太乙":"艮","文昌":"丑","始擊":"坤","定目":"艮","主算":1,"客算":22,"定算":3},
    {"局":"陽9局","太乙":"艮","文昌":"艮","始擊":"酉","定目":"巽","主算":3,"客算":15,"定算":33},
    {"局":"陽10局","太乙":"卯","文昌":"寅","始擊":"乾","定目":"坤","主算":1,"客算":12,"定算":25},
    {"局":"陽11局","太乙":"卯","文昌":"卯","始擊":"丑","定目":"戌","主算":4,"客算":4,"定算":13},
    {"局":"陽12局","太乙":"卯","文昌":"辰","始擊":"寅","定目":"丑","主算":37,"客算":1,"定算":4},
    {"局":"陽13局","太乙":"酉","文昌":"巽","始擊":"辰","定目":"辰","主算":18,"客算":19,"定算":19},
    {"局":"陽14局","太乙":"酉","文昌":"巳","始擊":"午","定目":"午","主算":10,"客算":9,"定算":9},
    {"局":"陽15局","太乙":"酉","文昌":"午","始擊":"坤","定目":"酉","主算":9,"客算":7,"定算":6},
    {"局":"陽16局","太乙":"坤","文昌":"未","始擊":"酉","定目":"子","主算":1,"客算":33,"定算":26},
    {"局":"陽17局","太乙":"坤","文昌":"坤","始擊":"亥","定目":"寅","主算":7,"客算":27,"定算":16},
    {"局":"陽18局","太乙":"坤","文昌":"坤","始擊":"子","定目":"巽","主算":7,"客算":26,"定算":11},
    {"局":"陽19局","太乙":"子","文昌":"申","始擊":"艮","定目":"坤","主算":8,"客算":32,"定算":14},
    {"局":"陽20局","太乙":"子","文昌":"酉","始擊":"辰","定目":"戌","主算":7,"客算":26,"定算":2},
    {"局":"陽21局","太乙":"子","文昌":"戌","始擊":"巳","定目":"丑","主算":2,"客算":17,"定算":33},
    {"局":"陽22局","太乙":"巽","文昌":"乾","始擊":"未","定目":"辰","主算":16,"客算":30,"定算":1},
    {"局":"陽23局","太乙":"巽","文昌":"乾","始擊":"申","定目":"巳","主算":16,"客算":23,"定算":32},
    {"局":"陽24局","太乙":"巽","文昌":"亥","始擊":"戌","定目":"申","主算":16,"客算":17,"定算":23},
    {"局":"陽25局","太乙":"乾","文昌":"子","始擊":"亥","定目":"亥","主算":39,"客算":40,"定算":40},
    {"局":"陽26局","太乙":"乾","文昌":"丑","始擊":"艮","定目":"艮","主算":32,"客算":31,"定算":31},
    {"局":"陽27局","太乙":"乾","文昌":"艮","始擊":"卯","定目":"巽","主算":31,"客算":28,"定算":24},
    {"局":"陽28局","太乙":"午","文昌":"寅","始擊":"巽","定目":"坤","主算":14,"客算":9,"定算":38},
    {"局":"陽29局","太乙":"午","文昌":"卯","始擊":"未","定目":"戌","主算":13,"客算":39,"定算":26},
    {"局":"陽30局","太乙":"午","文昌":"辰","始擊":"申","定目":"丑","主算":10,"客算":32,"定算":17},
    {"局":"陽31局","太乙":"艮","文昌":"巽","始擊":"戌","定目":"辰","主算":33,"客算":10,"定算":34},
    {"局":"陽32局","太乙":"艮","文昌":"巳","始擊":"子","定目":"午","主算":25,"客算":8,"定算":24},
    {"局":"陽33局","太乙":"艮","文昌":"午","始擊":"艮","定目":"酉","主算":24,"客算":3,"定算":15},
    {"局":"陽34局","太乙":"卯","文昌":"未","始擊":"卯","定目":"子","主算":26,"客算":4,"定算":11},
    {"局":"陽35局","太乙":"卯","文昌":"坤","始擊":"巳","定目":"寅","主算":25,"客算":28,"定算":1},
    {"局":"陽36局","太乙":"卯","文昌":"坤","始擊":"午","定目":"巽","主算":25,"客算":27,"定算":36},
    {"局":"陽37局","太乙":"酉","文昌":"申","始擊":"坤","定目":"坤","主算":1,"客算":7,"定算":7},
    {"局":"陽38局","太乙":"酉","文昌":"酉","始擊":"戌","定目":"戌","主算":6,"客算":35,"定算":35},
    {"局":"陽39局","太乙":"酉","文昌":"戌","始擊":"亥","定目":"丑","主算":35,"客算":34,"定算":26},
    {"局":"陽40局","太乙":"坤","文昌":"乾","始擊":"丑","定目":"辰","主算":27,"客算":19,"定算":12},
    {"局":"陽41局","太乙":"坤","文昌":"乾","始擊":"寅","定目":"巳","主算":27,"客算":16,"定算":3},
    {"局":"陽42局","太乙":"坤","文昌":"亥","始擊":"辰","定目":"申","主算":27,"客算":12,"定算":34},
    {"局":"陽43局","太乙":"子","文昌":"子","始擊":"巳","定目":"亥","主算":8,"客算":17,"定算":1},
    {"局":"陽44局","太乙":"子","文昌":"丑","始擊":"坤","定目":"艮","主算":33,"客算":14,"定算":32},
    {"局":"陽45局","太乙":"子","文昌":"艮","始擊":"酉","定目":"巽","主算":32,"客算":7,"定算":25},
    {"局":"陽46局","太乙":"巽","文昌":"寅","始擊":"乾","定目":"坤","主算":5,"客算":16,"定算":29},
    {"局":"陽47局","太乙":"巽","文昌":"卯","始擊":"丑","定目":"戌","主算":4,"客算":8,"定算":17},
    {"局":"陽48局","太乙":"巽","文昌":"辰","始擊":"寅","定目":"丑","主算":1,"客算":5,"定算":8},
    {"局":"陽49局","太乙":"乾","文昌":"巽","始擊":"辰","定目":"辰","主算":24,"客算":25,"定算":25},
    {"局":"陽50局","太乙":"乾","文昌":"巳","始擊":"午","定目":"午","主算":16,"客算":15,"定算":15},
    {"局":"陽51局","太乙":"乾","文昌":"午","始擊":"坤","定目":"酉","主算":15,"客算":13,"定算":6},
    {"局":"陽52局","太乙":"午","文昌":"未","始擊":"酉","定目":"子","主算":39,"客算":31,"定算":24},
    {"局":"陽53局","太乙":"午","文昌":"坤","始擊":"亥","定目":"寅","主算":38,"客算":25,"定算":14},
    {"局":"陽54局","太乙":"午","文昌":"坤","始擊":"子","定目":"巽","主算":38,"客算":24,"定算":9},
    {"局":"陽55局","太乙":"艮","文昌":"申","始擊":"艮","定目":"坤","主算":16,"客算":3,"定算":22},
    {"局":"陽56局","太乙":"艮","文昌":"酉","始擊":"辰","定目":"戌","主算":15,"客算":34,"定算":10},
    {"局":"陽57局","太乙":"艮","文昌":"戌","始擊":"巳","定目":"丑","主算":10,"客算":25,"定算":1},
    {"局":"陽58局","太乙":"卯","文昌":"乾","始擊":"未","定目":"辰","主算":12,"客算":26,"定算":37},
    {"局":"陽59局","太乙":"卯","文昌":"乾","始擊":"申","定目":"巳","主算":12,"客算":19,"定算":28},
    {"局":"陽60局","太乙":"卯","文昌":"亥","始擊":"戌","定目":"申","主算":12,"客算":13,"定算":19},
    {"局":"陽61局","太乙":"酉","文昌":"子","始擊":"亥","定目":"亥","主算":33,"客算":34,"定算":34},
    {"局":"陽62局","太乙":"酉","文昌":"丑","始擊":"艮","定目":"艮","主算":26,"客算":25,"定算":25},
    {"局":"陽63局","太乙":"酉","文昌":"艮","始擊":"卯","定目":"巽","主算":25,"客算":22,"定算":18},
    {"局":"陽64局","太乙":"坤","文昌":"寅","始擊":"巽","定目":"坤","主算":16,"客算":11,"定算":7},
    {"局":"陽65局","太乙":"坤","文昌":"卯","始擊":"未","定目":"戌","主算":15,"客算":1,"定算":28},
    {"局":"陽66局","太乙":"坤","文昌":"辰","始擊":"申","定目":"丑","主算":12,"客算":34,"定算":19},
    {"局":"陽67局","太乙":"子","文昌":"巽","始擊":"戌","定目":"辰","主算":25,"客算":2,"定算":26},
    {"局":"陽68局","太乙":"子","文昌":"巳","始擊":"子","定目":"午","主算":17,"客算":8,"定算":16},
    {"局":"陽69局","太乙":"子","文昌":"午","始擊":"艮","定目":"酉","主算":16,"客算":32,"定算":7},
    {"局":"陽70局","太乙":"巽","文昌":"未","始擊":"卯","定目":"子","主算":30,"客算":4,"定算":15},
    {"局":"陽71局","太乙":"巽","文昌":"坤","始擊":"巳","定目":"寅","主算":29,"客算":32,"定算":5},
    {"局":"陽72局","太乙":"巽","文昌":"坤","始擊":"午","定目":"巽","主算":29,"客算":31,"定算":9},
    {"局":"陰1局","太乙":"巽","文昌":"寅","始擊":"坤","定目":"艮","主算":5,"客算":29,"定算":7},
    {"局":"陰2局","太乙":"巽","文昌":"卯","始擊":"戌","定目":"辰","主算":4,"客算":17,"定算":1},
    {"局":"陰3局","太乙":"巽","文昌":"辰","始擊":"亥","定目":"未","主算":1,"客算":16,"定算":30},
    {"局":"陰4局","太乙":"子","文昌":"巽","始擊":"丑","定目":"戌","主算":25,"客算":33,"定算":2},
    {"局":"陰5局","太乙":"子","文昌":"巽","始擊":"寅","定目":"亥","主算":25,"客算":30,"定算":1},
    {"局":"陰6局","太乙":"子","文昌":"巳","始擊":"辰","定目":"寅","主算":17,"客算":26,"定算":30},
    {"局":"陰7局","太乙":"坤","文昌":"午","始擊":"巳","定目":"巳","主算":2,"客算":3,"定算":3},
    {"局":"陰8局","太乙":"坤","文昌":"未","始擊":"坤","定目":"坤","主算":1,"客算":7,"定算":7},
    {"局":"陰9局","太乙":"坤","文昌":"坤","始擊":"酉","定目":"乾","主算":7,"客算":33,"定算":27},
    {"局":"陰10局","太乙":"酉","文昌":"申","始擊":"乾","定目":"艮","主算":1,"客算":34,"定算":25},
    {"局":"陰11局","太乙":"酉","文昌":"酉","始擊":"丑","定目":"辰","主算":6,"客算":26,"定算":19},
    {"局":"陰12局","太乙":"酉","文昌":"戌","始擊":"寅","定目":"未","主算":35,"客算":23,"定算":8},
    {"局":"陰13局","太乙":"卯","文昌":"乾","始擊":"辰","定目":"戌","主算":12,"客算":37,"定算":13},
    {"局":"陰14局","太乙":"卯","文昌":"亥","始擊":"午","定目":"子","主算":12,"客算":27,"定算":11},
    {"局":"陰15局","太乙":"卯","文昌":"子","始擊":"坤","定目":"卯","主算":11,"客算":25,"定算":4},
    {"局":"陰16局","太乙":"艮","文昌":"丑","始擊":"酉","定目":"午","主算":1,"客算":15,"定算":24},
    {"局":"陰17局","太乙":"艮","文昌":"艮","始擊":"亥","定目":"申","主算":3,"客算":9,"定算":16},
    {"局":"陰18局","太乙":"艮","文昌":"艮","始擊":"子","定目":"乾","主算":3,"客算":8,"定算":9},
    {"局":"陰19局","太乙":"午","文昌":"寅","始擊":"艮","定目":"艮","主算":14,"客算":16,"定算":16},
    {"局":"陰20局","太乙":"午","文昌":"卯","始擊":"辰","定目":"辰","主算":13,"客算":10,"定算":10},
    {"局":"陰21局","太乙":"午","文昌":"辰","始擊":"巳","定目":"未","主算":10,"客算":1,"定算":39},
    {"局":"陰22局","太乙":"乾","文昌":"巽","始擊":"未","定目":"戌","主算":24,"客算":14,"定算":1},
    {"局":"陰23局","太乙":"乾","文昌":"巽","始擊":"申","定目":"亥","主算":24,"客算":7,"定算":40},
    {"局":"陰24局","太乙":"乾","文昌":"巳","始擊":"戌","定目":"寅","主算":16,"客算":1,"定算":29},
    {"局":"陰25局","太乙":"巽","文昌":"午","始擊":"亥","定目":"巳","主算":31,"客算":16,"定算":32},
    {"局":"陰26局","太乙":"巽","文昌":"未","始擊":"艮","定目":"坤","主算":30,"客算":7,"定算":29},
    {"局":"陰27局","太乙":"巽","文昌":"坤","始擊":"卯","定目":"乾","主算":29,"客算":4,"定算":16},
    {"局":"陰28局","太乙":"子","文昌":"申","始擊":"巽","定目":"艮","主算":8,"客算":25,"定算":32},
    {"局":"陰29局","太乙":"子","文昌":"酉","始擊":"未","定目":"辰","主算":7,"客算":15,"定算":26},
    {"局":"陰30局","太乙":"子","文昌":"戌","始擊":"申","定目":"未","主算":2,"客算":8,"定算":15},
    {"局":"陰31局","太乙":"坤","文昌":"乾","始擊":"戌","定目":"戌","主算":27,"客算":28,"定算":28},
    {"局":"陰32局","太乙":"坤","文昌":"亥","始擊":"子","定目":"子","主算":27,"客算":26,"定算":26},
    {"局":"陰33局","太乙":"坤","文昌":"子","始擊":"艮","定目":"卯","主算":26,"客算":18,"定算":15},
    {"局":"陰34局","太乙":"酉","文昌":"丑","始擊":"卯","定目":"午","主算":26,"客算":22,"定算":9},
    {"局":"陰35局","太乙":"酉","文昌":"艮","始擊":"巳","定目":"申","主算":25,"客算":10,"定算":1},
    {"局":"陰36局","太乙":"酉","文昌":"艮","始擊":"午","定目":"乾","主算":25,"客算":9,"定算":34},
    {"局":"陰37局","太乙":"卯","文昌":"寅","始擊":"坤","定目":"艮","主算":1,"客算":25,"定算":3},
    {"局":"陰38局","太乙":"卯","文昌":"卯","始擊":"戌","定目":"辰","主算":4,"客算":13,"定算":37},
    {"局":"陰39局","太乙":"卯","文昌":"辰","始擊":"亥","定目":"未","主算":37,"客算":12,"定算":26},
    {"局":"陰40局","太乙":"艮","文昌":"巽","始擊":"丑","定目":"戌","主算":33,"客算":1,"定算":10},
    {"局":"陰41局","太乙":"艮","文昌":"巽","始擊":"寅","定目":"亥","主算":33,"客算":38,"定算":9},
    {"局":"陰42局","太乙":"艮","文昌":"巳","始擊":"辰","定目":"寅","主算":25,"客算":34,"定算":38},
    {"局":"陰43局","太乙":"午","文昌":"午","始擊":"巳","定目":"巳","主算":2,"客算":1,"定算":1},
    {"局":"陰44局","太乙":"午","文昌":"未","始擊":"坤","定目":"坤","主算":39,"客算":38,"定算":38},
    {"局":"陰45局","太乙":"午","文昌":"坤","始擊":"酉","定目":"乾","主算":38,"客算":31,"定算":25},
    {"局":"陰46局","太乙":"乾","文昌":"申","始擊":"乾","定目":"艮","主算":7,"客算":1,"定算":31},
    {"局":"陰47局","太乙":"乾","文昌":"酉","始擊":"丑","定目":"辰","主算":6,"客算":32,"定算":25},
    {"局":"陰48局","太乙":"乾","文昌":"戌","始擊":"寅","定目":"未","主算":1,"客算":29,"定算":14},
    {"局":"陰49局","太乙":"巽","文昌":"乾","始擊":"辰","定目":"戌","主算":16,"客算":1,"定算":17},
    {"局":"陰50局","太乙":"巽","文昌":"亥","始擊":"午","定目":"子","主算":16,"客算":31,"定算":15},
    {"局":"陰51局","太乙":"巽","文昌":"子","始擊":"坤","定目":"卯","主算":15,"客算":29,"定算":4},
    {"局":"陰52局","太乙":"子","文昌":"丑","始擊":"酉","定目":"午","主算":33,"客算":7,"定算":16},
    {"局":"陰53局","太乙":"子","文昌":"艮","始擊":"亥","定目":"申","主算":32,"客算":1,"定算":8},
    {"局":"陰54局","太乙":"子","文昌":"艮","始擊":"子","定目":"乾","主算":32,"客算":8,"定算":1},
    {"局":"陰55局","太乙":"坤","文昌":"寅","始擊":"艮","定目":"艮","主算":16,"客算":18,"定算":18},
    {"局":"陰56局","太乙":"坤","文昌":"卯","始擊":"辰","定目":"辰","主算":15,"客算":12,"定算":12},
    {"局":"陰57局","太乙":"坤","文昌":"辰","始擊":"巳","定目":"未","主算":12,"客算":3,"定算":1},
    {"局":"陰58局","太乙":"酉","文昌":"巽","始擊":"未","定目":"戌","主算":18,"客算":8,"定算":35},
    {"局":"陰59局","太乙":"酉","文昌":"巽","始擊":"申","定目":"亥","主算":18,"客算":1,"定算":34},
    {"局":"陰60局","太乙":"酉","文昌":"巳","始擊":"戌","定目":"寅","主算":10,"客算":35,"定算":23},
    {"局":"陰61局","太乙":"卯","文昌":"午","始擊":"亥","定目":"巳","主算":27,"客算":12,"定算":28},
    {"局":"陰62局","太乙":"卯","文昌":"未","始擊":"艮","定目":"坤","主算":26,"客算":3,"定算":25},
    {"局":"陰63局","太乙":"卯","文昌":"坤","始擊":"卯","定目":"乾","主算":25,"客算":4,"定算":12},
    {"局":"陰64局","太乙":"艮","文昌":"申","始擊":"巽","定目":"艮","主算":16,"客算":33,"定算":3},
    {"局":"陰65局","太乙":"艮","文昌":"酉","始擊":"未","定目":"辰","主算":15,"客算":23,"定算":34},
    {"局":"陰66局","太乙":"艮","文昌":"戌","始擊":"申","定目":"未","主算":10,"客算":16,"定算":23},
    {"局":"陰67局","太乙":"午","文昌":"乾","始擊":"戌","定目":"戌","主算":25,"客算":26,"定算":26},
    {"局":"陰68局","太乙":"午","文昌":"亥","始擊":"子","定目":"子","主算":25,"客算":24,"定算":24},
    {"局":"陰69局","太乙":"午","文昌":"子","始擊":"艮","定目":"卯","主算":24,"客算":16,"定算":13},
    {"局":"陰70局","太乙":"乾","文昌":"丑","始擊":"卯","定目":"午","主算":32,"客算":28,"定算":15},
    {"局":"陰71局","太乙":"乾","文昌":"艮","始擊":"巳","定目":"申","主算":31,"客算":16,"定算":7},
    {"局":"陰72局","太乙":"乾","文昌":"艮","始擊":"午","定目":"乾","主算":31,"客算":15,"定算":1}
    ]

    // ▼▼▼ 六十甲子標準順序 ▼▼▼
    const JIAZI_CYCLE_ORDER = [
    '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
    '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
    '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
    '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
    '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
    '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
    ];

    // ▼▼▼ 六十甲子天地生成數 ▼▼▼
    const GANZI_GENERATION_NUMBERS = {
    '甲子': 31, '甲戌': 35, '甲申': 31, '甲午': 33, '甲辰': 35, '甲寅': 29,
    '乙丑': 39, '乙亥': 27, '乙酉': 31, '乙未': 39, '乙巳': 29, '乙卯': 29,
    '丙寅': 29, '丙子': 23, '丙戌': 39, '丙申': 31, '丙午': 25, '丙辰': 39,
    '丁卯': 29, '丁丑': 31, '丁亥': 31, '丁酉': 31, '丁未': 31, '丁巳': 33,
    '戊辰': 41, '戊寅': 41, '戊子': 31, '戊戌': 41, '戊申': 43, '戊午': 33,
    '己巳': 35, '己卯': 41, '己丑': 39, '己亥': 33, '己酉': 43, '己未': 39,
    '庚午': 37, '庚辰': 41, '庚寅': 35, '庚子': 35, '庚戌': 41, '庚申': 37,
    '辛未': 43, '辛巳': 35, '辛卯': 35, '辛丑': 43, '辛亥': 33, '辛酉': 37,
    '壬申': 33, '壬午': 27, '壬辰': 29, '壬寅': 31, '壬子': 25, '壬戌': 29,
    '癸酉': 33, '癸未': 33, '癸巳': 23, '癸卯': 31, '癸丑': 33, '癸亥': 21
    };

    // ▼▼▼ 易經六十四卦資料庫 (已新增白話解釋) ▼▼▼
    const I_CHING_HEXAGRAMS = [
    { number: 1,  name: '乾為天',    symbol: '䷀', description: '創造與進取，剛健自強。廣大包容之象', explanation: '代表純粹的創造力與行動力。現在是發揮領導才能、積極進取的好時機，應當自強不息，勇於開創，不要猶豫。' },
    { number: 2,  name: '坤為地',    symbol: '䷁', description: '包容承載，順應萬物。君倡臣和之象', explanation: '代表大地般的包容與順從。此時應採取輔助、配合的姿態，厚德載物，耐心積累。順應自然，方能承載福氣。' },
    { number: 3,  name: '水雷屯',    symbol: '䷂', description: '萬事起頭難，困境中成長。萬物如生之象', explanation: '象徵萬物初生的艱難。眼前可能充滿挑戰與混亂，但這正是成長的開始。需要耐心建立根基，不可輕舉妄動。' },
    { number: 4,  name: '山水蒙',    symbol: '䷃', description: '蒙昧未明，需啟蒙學習。萬物發生之象', explanation: '代表啟蒙與教育。目前可能處於迷惘或知識不足的狀態，應虛心求教，尋找良師益友的指導來掃除迷霧。' },
    { number: 5,  name: '水天需',    symbol: '䷄', description: '蓄勢待時，耐心等待。密雲不雨之象', explanation: '意味著需要耐心等待最佳時機。目前條件尚未成熟，急於求成只會徒勞無功。應專注於積蓄實力，靜候轉機。' },
    { number: 6,  name: '天水訟',    symbol: '䷅', description: '爭訟不利，慎防爭端。天水相違之象', explanation: '暗示著衝突與爭執。此時不宜與人爭辯或興訟，容易兩敗俱傷。應尋求和解之道，退一步方能海闊天空。' },
    { number: 7,  name: '地水師',    symbol: '䷆', description: '師眾齊心，領導用兵。以寡服眾之象', explanation: '代表領導與團隊。若要採取行動，必須師出有名、目標明確，並獲得眾人支持。團結一致是成功的關鍵。' },
    { number: 8,  name: '水地比',    symbol: '䷇', description: '親比合群，團隊合作。水行地上之象', explanation: '象徵親近與合作。這是一個建立人脈、鞏固團隊關係的好時機。主動與人親近，能得到有力的支持與幫助。' },
    { number: 9,  name: '風天小畜',  symbol: '䷈', description: '小有積蓄，漸進不躁。密雲不雨之象', explanation: '意味著小有積累，但能量尚不足以造成大的改變。應持續努力，專注於小目標的達成，耐心等待雲開雨來。' },
    { number: 10, name: '天澤履',    symbol: '䷉', description: '謹慎前行，腳踏實地。安中防危之象', explanation: '提醒我們行事需謹慎小心，如履薄冰。即使在看似平順的道路上，也要注意潛在的風險，遵守規則才能安全。' },
    { number: 11, name: '地天泰',    symbol: '䷊', description: '天地交泰，和諧亨通。小往大來之象', explanation: '代表著和諧、順暢與亨通。這是運勢極佳的時期，陰陽調和，萬事如意。應把握機會，積極作為，必有大成。' },
    { number: 12, name: '天地否',    symbol: '䷋', description: '陰陽不交，閉塞不通。人口不實之象', explanation: '象徵著閉塞與不通。目前主客觀條件互相違背，溝通困難，諸事不順。此時應守正道，靜待時機轉變。' },
    { number: 13, name: '天火同人',  symbol: '䷌', description: '志同道合，共同合作。二人分金之象', explanation: '意味著與人合作。尋找志同道合的夥伴，在陽光下坦誠合作，共同追求目標，將能克服困難，獲得成功。' },
    { number: 14, name: '火天大有',  symbol: '䷍', description: '富有充實，光明順遂。日麗中天之象', explanation: '代表著大豐收與富足。如同太陽高掛天空，光明普照。你的努力將得到極大回報，應當順天應人，分享成果。' },
    { number: 15, name: '地山謙',    symbol: '䷎', description: '謙遜處世，以退為進。仰高就下之象', explanation: '強調謙遜的美德。內心有實力，外在卻很低調。保持謙卑的姿態，反而更能贏得他人的尊敬與幫助。' },
    { number: 16, name: '雷地豫',    symbol: '䷏', description: '喜樂和順，居安思危。萬物發生之象', explanation: '代表著喜悅與準備。事情順心如意，但不可沉溺於安樂。應當居安思危，為未來早做準備，方能長久。' },
    { number: 17, name: '澤雷隨',    symbol: '䷐', description: '隨順時勢，靈活應變。如水推車之象', explanation: '意味著要懂得順應時勢。不要固執己見，應靈活調整策略，跟隨正確的潮流或領導者，才能省力又成功。' },
    { number: 18, name: '山風蠱',    symbol: '䷑', description: '整頓腐敗，革故鼎新。以惡害義之象', explanation: '暗示內部積弊已深，需要大刀闊斧地改革。這是一個撥亂反正的時機，應勇於面對問題，清除腐敗，重新出發。' },
    { number: 19, name: '地澤臨',    symbol: '䷒', description: '君子臨下，教化眾人。以上臨下之象', explanation: '代表著上位者親臨下方，帶來監管或教化。這是一個展現領導力，關懷下屬或群眾的好時機，能得人心。' },
    { number: 20, name: '風地觀',    symbol: '䷓', description: '觀察省思，以德感人。春花競發之象', explanation: '意味著需要靜下心來觀察與反思。不要急於行動，應先仔細評估局勢，以自身的德行風範來影響他人。' },
    { number: 21, name: '火雷噬嗑',  symbol: '䷔', description: '以剛破險，懲惡揚善。順中有物之象', explanation: '象徵著需要用強硬手段來解決眼前的障礙。如同用力咬斷硬物，必須果斷決策，才能掃除阻礙，伸張正義。' },
    { number: 22, name: '山火賁',    symbol: '䷕', description: '文飾外表，內守真實。光明通泰之象', explanation: '代表著裝飾與美化。適度的修飾是必要的，但不可華而不實。應注重內在的真實品德，才能表裡如一。' },
    { number: 23, name: '山地剝',    symbol: '䷖', description: '否極泰來，萬物剝落。去舊生新之象', explanation: '象徵著剝落與侵蝕。目前運勢較弱，應順應時勢，暫停前進，以保存實力。黑暗即將過去，黎明就在眼前。' },
    { number: 24, name: '地雷復',    symbol: '䷗', description: '失而復得，循環更新。反復往來之象', explanation: '代表著陽氣回復，萬象更新。這是一個重新開始、撥亂反正的好時機。過去的錯誤可以修正，事物正向好的方向循環。' },
    { number: 25, name: '天雷无妄',  symbol: '䷘', description: '順應自然，真誠無妄。守舊安常之象', explanation: '提醒要順應天道，不可妄為。只要動機純正，行為正當，順其自然地發展，就能獲得意想不到的好結果。' },
    { number: 26, name: '山天大畜',  symbol: '䷙', description: '積蓄能量，以待時機。積小成大之象', explanation: '意味著大量的積蓄與蘊養。現在是厚植實力、充實內涵的時期，應多加學習，等待未來大展拳腳的機會。' },
    { number: 27, name: '山雷頤',    symbol: '䷚', description: '養生之道，修身養性。遷善遠惡之象', explanation: '強調言語和飲食的謹慎。要注意自己的言行，並攝取有益身心的養分。這是一個修身養性、頤養天年的時期。' },
    { number: 28, name: '澤風大過',  symbol: '䷛', description: '陰陽失衡，承重過大。本末俱弱之象', explanation: '象徵著超出常規，負擔過重。如同房樑彎曲，已到承受極限。需要採取非常手段來匡正，否則有傾覆的危險。' },
    { number: 29, name: '坎為水',    symbol: '䷜', description: '重險之境，反覆考驗。外虛中實之象', explanation: '代表著重重險難。如同陷入深淵，挑戰接踵而來。此時必須保持內心的誠信與冷靜，在艱險中學習成長。' },
    { number: 30, name: '離為火',    symbol: '䷝', description: '光明照耀，文明進取。大明當天之象', explanation: '象徵著光明與附麗。如同火焰依附薪柴而燃燒，人也需依附正道才能持續發光。這是一個文化、文明進展的時期。' },
    { number: 31, name: '澤山咸',    symbol: '䷞', description: '以感化人，兩情相悅。至誠感神之象', explanation: '代表著心靈的感應與交流。特別指少男少女間純真的情感。強調以虛心和誠意去感應對方，而非強力追求。' },
    { number: 32, name: '雷風恆',    symbol: '䷟', description: '恆久不變，堅守正道。四時不沒之象', explanation: '意味著恆心與持久。成功的關鍵在於堅守正道，持之以恆。夫妻之道、事業經營都應尋求長久穩定的發展。' },
    { number: 33, name: '天山遯',    symbol: '䷠', description: '避險退隱，明哲保身。守道去惡之象', explanation: '代表著退避與隱遁。當小人勢力高漲時，君子應暫時退讓，遠離是非之地，以保全自身，等待時機。' },
    { number: 34, name: '雷天大壯',  symbol: '䷡', description: '剛健壯盛，須防妄動。先曲後順之象', explanation: '象徵著力量的強盛壯大。陽氣旺盛，氣勢如虹，但必須警惕不可因過於強盛而變得魯莽衝動，要遵守禮儀。' },
    { number: 35, name: '火地晉',    symbol: '䷢', description: '進取向上，光明前途。以臣遇君之象', explanation: '代表著晉升與發展。如同太陽升出地面，前途一片光明。應把握良機，積極向上，展現自己的才華與能力。' },
    { number: 36, name: '地火明夷',  symbol: '䷣', description: '智者避世，光明受傷。出明入暗之象', explanation: '象徵著光明受到傷害。在昏暗的時局中，有才華的人應懂得收斂鋒芒，內心保持光明，外在假裝糊塗以避禍。' },
    { number: 37, name: '風火家人',  symbol: '䷤', description: '齊家之道，內外有序。開花結子之象', explanation: '強調家庭內部的倫理與秩序。每個成員各司其職，言行有度，家庭才能和諧興旺。治家是事業成功的基礎。' },
    { number: 38, name: '火澤睽',    symbol: '䷥', description: '分歧矛盾，異中求同。猛虎陷阱之象', explanation: '代表著對立與分歧。目標與方向產生了背離，人際關係出現矛盾。此時應在小事上求同存異，尋找合作的可能。' },
    { number: 39, name: '水山蹇',    symbol: '䷦', description: '艱難困阻，謹慎前行。背明向暗之象', explanation: '象徵著前進的道路充滿艱險。如同跋山涉水，困難重重。此時應當停止前進，反省自身，尋求貴人幫助。' },
    { number: 40, name: '雷水解',    symbol: '䷧', description: '困境化解，解難得助。患難解散之象', explanation: '代表著困難的解除與釋放。如同春雷化雨，冰雪消融。應把握時機，迅速解決問題，寬恕待人，重新出發。' },
    { number: 41, name: '山澤損',    symbol: '䷨', description: '減損有益，損中有得。鑿石見玉之象', explanation: '意味著先減損下方，來增益上方。必要的犧牲或付出，長遠來看是有益的。應抑制慾望，真誠待人。' },
    { number: 42, name: '風雷益',    symbol: '䷩', description: '損上益下，積善得福。河水溢出之象', explanation: '意味著增益與幫助。上位者應減損自己來幫助下位者。這是遷善改過，勇於行動的好時機，將獲得極大益處。' },
    { number: 43, name: '澤天夬',    symbol: '䷪', description: '果決斷行，剛健能和。先損後益之象', explanation: '代表著果斷的抉擇與清除。必須下定決心，公開地清除小人或積弊。但行動需符合正道，不可濫用強力。' },
    { number: 44, name: '天風姤',    symbol: '䷫', description: '陽遇陰，偶然相逢。或聚或散之象', explanation: '象徵著不期而遇。一陰始生，需警惕小人勢力的悄然滋長。對於突如其來的遭遇，應謹慎處理，防微杜漸。' },
    { number: 45, name: '澤地萃',    symbol: '䷬', description: '萃聚人心，群體團結。魚龍會聚之象', explanation: '代表著聚合與精英薈萃。人才、物資向中心聚集，是成就大事業的時機。領導者應以誠信團結眾人。' },
    { number: 46, name: '地風升',    symbol: '䷭', description: '節節高升，漸進發展。積小成大之象', explanation: '象徵著順勢上升。如同樹木由小長大，應順應時機，循序漸進地發展。積極求進，將得到貴人提攜。' },
    { number: 47, name: '澤水困',    symbol: '䷮', description: '陷入困境，內心堅忍。守己待時之象', explanation: '代表著窮困與受阻。如同水在澤下，才能無法施展。此時應堅守正道，保持樂觀，言語謹慎，等待轉機。' },
    { number: 48, name: '水風井',    symbol: '䷯', description: '取之不竭，資源共享。守靜安常之象', explanation: '象徵著養育與共享。如同水井，默默奉獻，利益共享。應修養德行，鞏固基礎，服務社會而不求改變。' },
    { number: 49, name: '澤火革',    symbol: '䷰', description: '革新變革，順應時代。改舊從新之象', explanation: '代表著徹底的變革與革新。舊有的制度或方法已不合時宜，必須順應天時人心，進行大刀闊斧的改變。' },
    { number: 50, name: '火風鼎',    symbol: '䷱', description: '鼎新立業，革故鼎新。去故取新之象', explanation: '象徵著穩定與新生。在革新之後，建立新的秩序與權威。如同鼎器烹飪食物，有養賢育才，鼎新事業之意。' },
    { number: 51, name: '震為雷',    symbol: '䷲', description: '動盪驚雷，警醒人心。震驚百里之象', explanation: '代表著震動與警醒。突如其來的巨大變化讓人驚懼，但也促使人反省修身。處變不驚，保持冷靜是應對之道。' },
    { number: 52, name: '艮為山',    symbol: '䷳', description: '靜止止步，內心安定。積小成高之象', explanation: '象徵著靜止與安分。在適當的時候停止，在適當的位置安分，是一種智慧。應當心無旁騖，專注於當下。' },
    { number: 53, name: '風山漸',    symbol: '䷴', description: '漸進之道，循序漸進。積小成大之象', explanation: '代表著循序漸進。如同女子出嫁，一切按部就班。事物正向好的方向緩慢發展，不可急躁，耐心方能成功。' },
    { number: 54, name: '雷澤歸妹',  symbol: '䷵', description: '婚姻成家，社會秩序。陰陽不交之象', explanation: '代表著不合正道的結合。少女配長男，關係基礎不穩，難以長久。提醒人們行為需符合常理與秩序。' },
    { number: 55, name: '雷火豐',    symbol: '䷶', description: '豐盛繁榮，需防盈滿。藏暗向明之象', explanation: '代表著豐盛與盛大。如同日正當中，光明無比。但盛極必衰，應思考如何守成，並在繁榮中保持謙遜。' },
    { number: 56, name: '火山旅',    symbol: '䷷', description: '遊歷漂泊，異地發展。歡極哀生之象', explanation: '象徵著旅行與漂泊。如同旅人在外，根基不穩，應當謹慎自處，柔順待人，才能獲得平安與他人的幫助。' },
    { number: 57, name: '巽為風',    symbol: '䷸', description: '謙遜入微，柔順滲透。上行下放之象', explanation: '代表著順從與深入。如同風無孔不入，應以謙遜柔順的態度去影響他人。跟隨有能力者，反覆申明自己的主張。' },
    { number: 58, name: '兌為澤',    symbol: '䷹', description: '喜悅交流，柔中帶剛。天峰雨澤之象', explanation: '代表著喜悅與言說。朋友之間相互交流，共同學習，是件快樂的事。應以和悅的態度待人，並堅守正道。' },
    { number: 59, name: '風水渙',    symbol: '䷺', description: '分散化解，團結一心。大風吹物之象', explanation: '象徵著渙散與離散。自私之心導致人心渙散，應以公正無私的態度，重新凝聚人心，化解危機，團結力量。' },
    { number: 60, name: '水澤節',    symbol: '䷻', description: '節制有度，分寸得宜。寒暑有節之象', explanation: '強調節制的重要性。如同竹節，恰到好處的制約才能讓事物順利成長。無論是資源還是慾望，都應適度節制。' },
    { number: 61, name: '風澤中孚',  symbol: '䷼', description: '誠信中正，內外相應。事有定期之象', explanation: '代表著內心的誠信。以最大的誠意去影響他人，如同孵蛋一般，信譽能感化萬物。言行一致是成功的關鍵。' },
    { number: 62, name: '雷山小過',  symbol: '䷽', description: '謹慎行事，小心謙遜。上逆下順之象', explanation: '意味著在小事上可以稍有超越，但大事上必須謹慎。如同飛鳥，向上飛不如向下飛安全。應保持謙遜，力求平穩。' },
    { number: 63, name: '水火既濟',  symbol: '䷾', description: '事事圓滿，盛極須防。陰陽配合之象', explanation: '代表著成功與圓滿。如同渡河成功，一切都已完成。但完美也意味著開始走向衰敗，必須居安思危，防範未然。' },
    { number: 64, name: '火水未濟',  symbol: '䷿', description: '未竟之業，臨終待成。憂中望喜之象', explanation: '象徵著事情尚未完成。如同渡河失敗，充滿混亂與挑戰。但這也意味著未來充滿無限可能，謹慎分辨，仍有希望。' }
    ];

    // ▼▼▼ 易經六十四卦數位化資料庫 爻的順序由下到上 (初爻 -> 上爻)，1為陽爻，0為陰爻 ▼▼▼// 
    const HEXAGRAM_DATA = {
    '䷀': "111111", '䷁': "000000", '䷂': "100010", '䷃': "010001", '䷄': "111010",
    '䷅': "010111", '䷆': "010000", '䷇': "000010", '䷈': "111011", '䷉': "110111",
    '䷊': "111000", '䷋': "000111", '䷌': "101111", '䷍': "111101", '䷎': "001000",
    '䷏': "000100", '䷐': "100110", '䷑': "011001", '䷒': "110000", '䷓': "000011",
    '䷔': "100101", '䷕': "101001", '䷖': "000001", '䷗': "100000", '䷘': "100111",
    '䷙': "111001", '䷚': "100001", '䷛': "011110", '䷜': "010010", '䷝': "101101",
    '䷞': "001110", '䷟': "011100", '䷠': "001111", '䷡': "111100", '䷢': "000101",
    '䷣': "101000", '䷤': "101011", '䷥': "110101", '䷦': "001010", '䷧': "010100",
    '䷨': "110001", '䷩': "100011", '䷪': "111110", '䷫': "011111", '䷬': "000110",
    '䷭': "011000", '䷮': "010110", '䷯': "011010", '䷰': "101110", '䷱': "011101",
    '䷲': "100100", '䷳': "001001", '䷴': "001011", '䷵': "110100", '䷶': "101100",
    '䷷': "001101", '䷸': "011011", '䷹': "110110", '䷺': "010011", '䷻': "110010",
    '䷼': "110011", '䷽': "001100", '䷾': "101010", '䷿': "010101"
    };  

    // ▼▼▼ 太歲合神計神的判斷式 ▼▼▼
    const DEITY_RULES_DATA = [
        {"陰陽局":"陽局","時支":"子","太歲":"子","合神":"丑","計神":"寅"}, {"陰陽局":"陽局","時支":"丑","太歲":"丑","合神":"子","計神":"丑"}, {"陰陽局":"陽局","時支":"寅","太歲":"寅","合神":"亥","計神":"子"}, {"陰陽局":"陽局","時支":"卯","太歲":"卯","合神":"戌","計神":"亥"}, {"陰陽局":"陽局","時支":"辰","太歲":"辰","合神":"酉","計神":"戌"}, {"陰陽局":"陽局","時支":"巳","太歲":"巳","合神":"申","計神":"酉"}, {"陰陽局":"陽局","時支":"午","太歲":"午","合神":"未","計神":"申"}, {"陰陽局":"陽局","時支":"未","太歲":"未","合神":"午","計神":"未"}, {"陰陽局":"陽局","時支":"申","太歲":"申","合神":"巳","計神":"午"}, {"陰陽局":"陽局","時支":"酉","太歲":"酉","合神":"辰","計神":"巳"}, {"陰陽局":"陽局","時支":"戌","太歲":"戌","合神":"卯","計神":"辰"}, {"陰陽局":"陽局","時支":"亥","太歲":"亥","合神":"寅","計神":"卯"},
        {"陰陽局":"陰局","時支":"子","太歲":"子","合神":"丑","計神":"申"}, {"陰陽局":"陰局","時支":"丑","太歲":"丑","合神":"子","計神":"未"}, {"陰陽局":"陰局","時支":"寅","太歲":"寅","合神":"亥","計神":"午"}, {"陰陽局":"陰局","時支":"卯","太歲":"卯","合神":"戌","計神":"巳"}, {"陰陽局":"陰局","時支":"辰","太歲":"辰","合神":"酉","計神":"辰"}, {"陰陽局":"陰局","時支":"巳","太歲":"巳","合神":"申","計神":"卯"}, {"陰陽局":"陰局","時支":"午","太歲":"午","合神":"未","計神":"寅"}, {"陰陽局":"陰局","時支":"未","太歲":"未","合神":"午","計神":"丑"}, {"陰陽局":"陰局","時支":"申","太歲":"申","合神":"巳","計神":"子"}, {"陰陽局":"陰局","時支":"酉","太歲":"酉","合神":"辰","計神":"亥"}, {"陰陽局":"陰局","時支":"戌","太歲":"戌","合神":"卯","計神":"戌"}, {"陰陽局":"陰局","時支":"亥","太歲":"亥","合神":"寅","計神":"酉"}
    ];

    // ▼▼▼ 主參客參定參的規則資料庫 ▼▼▼
    const SUAN_DIGIT_RULES = {
        '1': { Da: '乾', Can: '艮' }, '2': { Da: '午', Can: '酉' }, '3': { Da: '艮', Can: '巽' },
        '4': { Da: '卯', Can: '午' }, '5': { Da: '中', Can: '中' }, '6': { Da: '酉', Can: '子' },
        '7': { Da: '坤', Can: '乾' }, '8': { Da: '子', Can: '卯' }, '9': { Da: '巽', Can: '坤' },
        '0': { Da: '乾', Can: '艮' }
    };
    
    const SHI_WU_FU_ORDER = ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'];
    const XIAO_YOU_ORDER = ['亥', '午', '寅', '卯', '酉', '申', '子', '巳'];
    const JUN_CHEN_JI_ORDER = ['午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳'];
    const MIN_JI_ORDER = ['戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉'];
    const TIAN_YI_ORDER = ['酉', '申', '子', '巳', '戌', '未', '丑', '亥', '午', '寅', '卯', '辰'];
    const DI_YI_ORDER = ['巳', '戌', '未', '丑', '亥', '午', '寅', '卯', '辰', '酉', '申', '子'];
    const SI_SHEN_ORDER = ['亥', '午', '寅', '卯', '辰', '酉', '申', '子', '巳', '戌', '未', '丑'];
    const FEI_FU_ORDER = ['辰', '酉', '申', '子', '巳', '戌', '未', '丑', '亥', '午', '寅', '卯'];
    const DA_YOU_ORDER = ['坤', '子', '巽', '乾', '午', '艮', '卯', '酉'];

    // ▼▼▼ 月將十二神的規則資料 ▼▼▼
    const MONTHLY_GENERALS_MAPPING = [
        null, '神后子', null, '登明亥', null, '河魁戌', null, '從魁酉',
        null, '傳送申', null, '小吉未', null, '勝光午', null, '太乙巳',
        null, '天罡辰', null, '太衝卯', null, '功曹寅', null, '大吉丑'
    ];
    const FULL_GENERALS_ORDER = [
        '神后子', '大吉丑', '功曹寅', '太衝卯', '天罡辰', '太乙巳',
        '勝光午', '小吉未', '傳送申', '從魁酉', '河魁戌', '登明亥'
    ];
    // 1. 貴人十二神的完整順時鐘順序
    const GUI_REN_ORDER = [
        '貴人', '騰蛇', '朱雀', '六合', '勾陳', '青龍', 
        '天空', '白虎', '太常', '玄武', '太陰', '天后'
    ];
    // 2. 日干對應的起始月將表
    const GUI_REN_YUE_JIANG_MAP = {
        '甲': { day: '小吉未', night: '大吉丑' }, '己': { day: '神后子', night: '傳送申' },
        '乙': { day: '傳送申', night: '神后子' }, '庚': { day: '大吉丑', night: '小吉未' },
        '丙': { day: '從魁酉', night: '登明亥' }, '辛': { day: '功曹寅', night: '勝光午' },
        '丁': { day: '登明亥', night: '從魁酉' }, '壬': { day: '太衝卯', night: '太乙巳' },
        '戊': { day: '大吉丑', night: '小吉未' }, '癸': { day: '太乙巳', night: '太衝卯' }
    };
    // 3. 用來判斷貴人十二神順逆時鐘的宮位群組
    const GUI_REN_DAY_BRANCHES = ['卯', '辰', '巳', '午', '未', '申']; // 晝貴
    const GUI_REN_NIGHT_BRANCHES = ['酉', '戌', '亥', '子', '丑', '寅']; // 夜貴
    const CLOCKWISE_PALACES = ['亥', '子', '丑', '寅', '卯', '辰'];

    // ▼▼▼ 奇門遁甲八門的規則資料 ▼▼▼
    const EIGHT_GATES_ORDER = ['開', '休', '生', '傷', '杜', '景', '死', '驚'];
    const YANG_START_GATES = ['開', '生', '驚', '休'];
    const YIN_START_GATES = ['杜', '死', '傷', '景'];

    // ▼▼▼ 年干化曜規則資料庫 ▼▼▼
    const NIAN_GAN_HUA_YAO = {
        '甲': { tianYuan: ['小遊'], ganYuan: ['小遊'], fuMu: ['客大'] },
        '乙': { tianYuan: ['主大'], ganYuan: ['客參'], fuMu: ['主參'] },
        '丙': { tianYuan: ['客大'], ganYuan: ['始擊'], fuMu: ['小遊'] },
        '丁': { tianYuan: ['小遊'], ganYuan: ['飛符'], fuMu: ['客參'] },
        '戊': { tianYuan: ['臣基', '始擊'], ganYuan: ['君基'], fuMu: ['始擊'] },
        '己': { tianYuan: ['民基'], ganYuan: ['臣基'], fuMu: ['飛符'] },
        '庚': { tianYuan: ['主大'], ganYuan: ['主大'], fuMu: ['臣基'] },
        '辛': { tianYuan: ['時五福'], ganYuan: ['天乙'], fuMu: ['民基'] },
        '壬': { tianYuan: ['時五福'], ganYuan: ['客大'], fuMu: ['主大'] },
        '癸': { tianYuan: ['始擊'], ganYuan: ['主參'], fuMu: ['天乙'] }
    };
    // ▼▼▼ 日干化曜規則資料庫 ▼▼▼
    const RI_GAN_HUA_YAO = {
        '甲': { luZhu: ['君基'], pianLu: ['臣基'], guanXing: ['天乙'], qiCai: ['臣基'], jiXing: ['小遊'], guiXing: ['主大'] },
        '乙': { luZhu: ['主大'], pianLu: ['臣基'], guanXing: ['主大'], qiCai: ['民基'], jiXing: ['始擊'], guiXing: ['天乙'] },
        '丙': { luZhu: ['客大'], pianLu: [], guanXing: ['四神'], qiCai: ['主大'], jiXing: ['地乙'], guiXing: ['客大'] },
        '丁': { luZhu: ['小遊'], pianLu: [], guanXing: ['客大'], qiCai: ['天乙'], jiXing: ['天乙'], guiXing: ['四神'] },
        '戊': { luZhu: ['始擊'], pianLu: ['民基', '地乙'], guanXing: ['客參'], qiCai: ['客大'], jiXing: ['四神'], guiXing: ['小遊'] },
        '己': { luZhu: ['君基'], pianLu: ['臣基', '計神', '文昌'], guanXing: ['小遊'], qiCai: ['四神'], jiXing: ['小遊'], guiXing: ['客參'] },
        '庚': { luZhu: ['主大'], pianLu: [], guanXing: ['飛符'], qiCai: ['小遊'], jiXing: ['始擊'], guiXing: ['始擊'] },
        '辛': { luZhu: ['客大'], pianLu: ['五福'], guanXing: ['始擊'], qiCai: ['客參'], jiXing: ['地乙'], guiXing: ['飛符'] },
        '壬': { luZhu: ['小遊'], pianLu: ['五福'], guanXing: ['民基'], qiCai: ['始擊'], jiXing: ['天乙'], guiXing: ['計神'] },
        '癸': { luZhu: ['始擊'], pianLu: [], guanXing: ['臣基'], qiCai: ['飛符'], jiXing: ['四神'], guiXing: ['地乙'] }
    };
    // ▼▼▼ 日支化曜規則資料庫 ▼▼▼
    const RI_ZHI_HUA_YAO = {
        '子': { fuXing: ['客大', '客參'] }, '辰': { fuXing: ['客大', '客參'] }, '申': { fuXing: ['客大', '客參'] },
        '丑': { fuXing: ['民基', '主大'] }, '巳': { fuXing: ['民基', '主大'] }, '酉': { fuXing: ['民基', '主大'] },
        '寅': { fuXing: ['君基', '文昌'] }, '午': { fuXing: ['君基', '文昌'] }, '戌': { fuXing: ['君基', '文昌'] },
        '卯': { fuXing: ['臣基', '始擊'] }, '未': { fuXing: ['臣基', '始擊'] }, '亥': { fuXing: ['臣基', '始擊'] }
    };
    // ▼▼▼ 中英文化曜名稱) ▼▼▼
    const HUA_YAO_ROLE_MAP = {
    // 年干
    tianYuan: '天元官星', ganYuan: '干元星', fuMu: '父母星',
    // 日干
    luZhu: '天元祿主', pianLu: '偏祿', guanXing: '官星', qiCai: '妻財', jiXing: '忌星', guiXing: '鬼星',
    // 日支
    fuXing: '地元福星'
    };
    // ▼▼▼ 星曜強旺程度資料庫 (使用者校對版) ▼▼▼
    const STAR_STRENGTH_DATA = {
    '小遊':   { '寅': '侍 祿庫', '卯': '入廟', '未': '祿庫', '亥': '科名' },
    '文昌':   { '子': '入侍', '丑': '入廟', '辰': '祿庫', '申': '科名', '亥': '廟 科名' },
    '始擊':   { '寅': '科名', '午': '入廟', '戌': '入侍' },
    '君基':   { '子': '貴人', '辰': '祿庫', '巳': '貴人', '申': '科名 貴人', '戌': '入廟', '亥': '貴人' },
    '臣基':   { '子': '入侍', '辰': '祿庫', '未': '貴人', '申': '科名 貴人', '戌': '入廟', '亥': '貴人' },
    '民基':   { '子': '入侍', '辰': '入廟', '申': '科名' },
    '時五福': { '丑': '祿庫', '辰': '入廟', '申': '科名' },
    '計神':   { '申': '科名', '戌': '入廟', '亥': '廟 科名' },
    '主大':   { '丑': '入侍', '巳': '科名', '申': '廟 科名', '酉': '入廟' },
    '主參':   { '子': '入廟', '申': '科名' },
    '客大':   { '子': '入廟', '辰': '入廟', '申': '廟 科名' },
    '客參':   { '卯': '入廟', '亥': '科名' },
    '天乙':   { '丑': '入廟', '巳': '科名' },
    '地乙':   { '辰': '入侍', '申': '科名', '戌': '入廟' },
    '四神':   { '子': '入廟', '辰': '入侍' },
    '飛符':   { '寅': '科名', '午': '入廟' }
    };

    // ▼▼▼ 行年歲數的規則資料庫 ▼▼▼
    // 1. 男命 1-60 歲的行年干支 (順時鐘)
    const XINGNIAN_GANZHI_MALE = [
        '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉', '甲戌', '乙亥',
        '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未', '甲申', '乙酉',
        '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳', '甲午', '乙未',
        '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯', '甲辰', '乙巳',
        '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑', '甲寅', '乙卯',
        '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥', '甲子', '乙丑'
    ];
    // 2. 女命 1-60 歲的行年干支 (逆時鐘)
    const XINGNIAN_GANZHI_FEMALE = [
        '壬申', '辛未', '庚午', '己巳', '戊辰', '丁卯', '丙寅', '乙丑', '甲子', '癸亥',
        '壬戌', '辛酉', '庚申', '己未', '戊午', '丁巳', '丙辰', '乙卯', '甲寅', '癸丑',
        '壬子', '辛亥', '庚戌', '己酉', '戊申', '丁未', '丙午', '乙巳', '甲辰', '癸卯',
        '壬寅', '辛丑', '庚子', '己亥', '戊戌', '丁酉', '丙申', '乙未', '甲午', '癸巳',
        '壬辰', '辛卯', '庚寅', '己丑', '戊子', '丁亥', '丙戌', '乙酉', '甲戌', '癸未',
        '壬午', '辛巳', '庚辰', '己卯', '戊寅', '丁丑', '丙子', '乙亥', '甲申', '癸酉'
    ];

    // ▼▼▼ 主算、客算、定算數字的屬性列表 ▼▼▼
    const SUAN_ATTRIBUTE_DATA = {
        '1': '雜陽數、短數、無天之數、無地之數',
        '2': '純陰數、短數、無天之數、無地之數',
        '3': '純陽數、短數、無天之數、無地之數',
        '4': '雜陰數、短數、無天之數、無地之數',
        '5': '短數、杜塞無門、無天之數',
        '6': '純陰數、短數、無天之數',
        '7': '雜陽數、短數、無天之數',
        '8': '雜陰數、短數、無天之數',
        '9': '純陽數、短數、無天之數',
        '10': '單陽數、無人之數',
        '11': '陰中重陽數、孤陽數、無地之數',
        '12': '下合之數、無地之數',
        '13': '雜重陽數、孤陽數、無地之數',
        '14': '上合之數、無地之數',
        '15': '杜塞無門',
        '16': '下合之數、三才數',
        '17': '陰中重陽數、三才數',
        '18': '上合之數、三才數',
        '19': '雜重陽數、三才數',
        '20': '單陰數、無人之數',
        '21': '下合之數、無地之數',
        '22': '重陰數、無地之數',
        '23': '次合之數、無地之數',
        '24': '雜重陰數、孤陰數、無地之數',
        '25': '杜塞無門',
        '26': '重陰數、三才數',
        '27': '下合之數、三才數',
        '28': '雜重陰數、三才數',
        '29': '次合之數、三才數',
        '30': '單陽數、無人之數',
        '31': '雜重陽數、無地之數',
        '32': '次合之數、無地之數',
        '33': '重陽數、無地之數',
        '34': '下合之數、無地之數',
        '35': '杜塞無門',
        '36': '次合之數、三才數',
        '37': '雜重陽、孤陽數、三才數',
        '38': '下合之數、三才數',
        '39': '重陽數、三才數',
        '40': '單陰數、無人之數'
    };

    // ▼▼▼ 皇恩星的規則資料庫 ▼▼▼
    const HUANG_EN_RULES = {
        '子': '申', '丑': '巳', '寅': '寅', '卯': '亥',
        '辰': '申', '巳': '巳', '午': '寅', '未': '亥',
        '申': '申', '酉': '巳', '戌': '寅', '亥': '亥'
    };

    // ▼▼▼ 陽九大限的規則資料庫 ▼▼▼
    const YANG_JIU_RULES = {
    '甲': { startBranch: '午', firstAge: 5 }, '己': { startBranch: '午', firstAge: 5 },
    '乙': { startBranch: '巳', firstAge: 4 }, '庚': { startBranch: '巳', firstAge: 4 },
    '丙': { startBranch: '申', firstAge: 1 }, '辛': { startBranch: '申', firstAge: 1 },
    '丁': { startBranch: '亥', firstAge: 3 }, '壬': { startBranch: '亥', firstAge: 3 },
    '戊': { startBranch: '寅', firstAge: 2 }, '癸': { startBranch: '寅', firstAge: 2 }
    };

    // ▼▼▼ 百六小限的規則資料庫 ▼▼▼
    const BAI_LIU_XIAO_XIAN_RULES = {
    '甲': { startBranch: '午', startAge: 5 }, '己': { startBranch: '午', startAge: 5 },
    '乙': { startBranch: '巳', startAge: 4 }, '庚': { startBranch: '巳', startAge: 4 },
    '丙': { startBranch: '申', startAge: 1 }, '辛': { startBranch: '申', startAge: 1 },
    '丁': { startBranch: '亥', startAge: 3 }, '壬': { startBranch: '亥', startAge: 3 },
    '戊': { startBranch: '寅', startAge: 2 }, '癸': { startBranch: '寅', startAge: 2 }
    };

    // ▼▼▼ 大遊真限規則資料庫 ▼▼▼
    const ZHI_SIX_HARMONIES = {
    '子': '丑', '丑': '子', '寅': '亥', '卯': '戌', '辰': '酉', '巳': '申',
    '午': '未', '未': '午', '申': '巳', '酉': '辰', '戌': '卯', '亥': '寅'
    };
    const DA_YOU_SEQUENCE = [
    '丑', '酉', '午', '亥', '寅', '巳', '子', '卯', '辰', '未', '申', '戌'
    ];
    const DA_YOU_DURATIONS = {
    '丑': 5, '酉': 6, '午': 7, '亥': 7, '寅': 11, '巳': 4,
    '子': 4, '卯': 13, '辰': 12, '未': 6, '申': 5, '戌': 5
    };

    // ▼▼▼ 飛祿大限的規則資料庫 ▼▼▼
    const FEI_LU_LIMIT_RULES = {
    '甲': { startBranch: '亥', firstAge: 3 }, '乙': { startBranch: '亥', firstAge: 3 },
    '丙': { startBranch: '寅', firstAge: 2 }, '丁': { startBranch: '寅', firstAge: 2 },
    '戊': { startBranch: '午', firstAge: 5 }, '己': { startBranch: '午', firstAge: 5 },
    '庚': { startBranch: '巳', firstAge: 4 }, '辛': { startBranch: '巳', firstAge: 4 },
    '壬': { startBranch: '申', firstAge: 1 }, '癸': { startBranch: '申', firstAge: 1 }
    };

    // ▼▼▼ 飛祿流年(小限)的規則資料庫 ▼▼▼
    const FEI_LU_ANNUAL_RULES = {
    '甲': { startBranch: '亥', startAge: 1 }, '乙': { startBranch: '亥', startAge: 1 },
    '丙': { startBranch: '寅', startAge: 1 }, '丁': { startBranch: '寅', startAge: 1 },
    '戊': { startBranch: '午', startAge: 1 }, '己': { startBranch: '午', startAge: 1 },
    '庚': { startBranch: '巳', startAge: 1 }, '辛': { startBranch: '巳', startAge: 1 },
    '壬': { startBranch: '申', startAge: 1 }, '癸': { startBranch: '申', startAge: 1 }
    };

    // ▼▼▼ 飛馬流年(小限)的規則資料庫 ▼▼▼
    const FEI_MA_ANNUAL_RULES = {
    '甲': { startBranch: '亥', startAge: 1 }, '乙': { startBranch: '亥', startAge: 1 },
    '丙': { startBranch: '寅', startAge: 1 }, '丁': { startBranch: '寅', startAge: 1 },
    '戊': { startBranch: '午', startAge: 1 }, '己': { startBranch: '午', startAge: 1 },
    '庚': { startBranch: '巳', startAge: 1 }, '辛': { startBranch: '巳', startAge: 1 },
    '壬': { startBranch: '申', startAge: 1 }, '癸': { startBranch: '申', startAge: 1 }
    };

    // ▼▼▼ 黑符的規則資料庫 ▼▼▼
    const HEI_FU_RULES = {
    '甲': '寅', '乙': '卯', '丙': '子', '丁': '亥', '戊': '戌',
    '己': '酉', '庚': '申', '辛': '未', '壬': '午', '癸': '巳'
    };

    // ▼▼▼ 陽性陰性地支列表 ▼▼▼
    const YANG_BRANCHES = ['子', '寅', '辰', '午', '申', '戌'];
    const YIN_BRANCHES = ['丑', '卯', '巳', '未', '酉', '亥'];

    // ▼▼▼ 星曜上中下等級資料庫 ▼▼▼
    const STAR_RATING_DATA = {
    '小遊':   { '子': '中', '丑': '中', '寅': '上', '卯': '上', '辰': '中', '巳': '下', '午': '下', '未': '上', '申': '下', '酉': '下', '戌': '中', '亥': '上' },
    '計神':   { '子': '中', '丑': '上', '寅': '下', '卯': '下', '辰': '上', '巳': '中', '午': '中', '未': '上', '申': '中', '酉': '中', '戌': '上', '亥': '中' },
    '文昌':   { '子': '下', '丑': '上', '寅': '下', '卯': '下', '辰': '上', '巳': '中', '午': '中', '未': '中', '申': '上', '酉': '中', '戌': '中', '亥': '上' },
    '始擊':   { '子': '中', '丑': '中', '寅': '上', '卯': '下', '辰': '中', '巳': '上', '午': '上', '未': '中', '申': '下', '酉': '下', '戌': '上', '亥': '下' },
    '時五福': { '子': '中', '丑': '上', '寅': '下', '卯': '下', '辰': '上', '巳': '中', '午': '中', '未': '中', '申': '上', '酉': '中', '戌': '中', '亥': '上' },
    '君基':   { '子': '上', '丑': '上', '寅': '下', '卯': '下', '辰': '上', '巳': '中', '午': '上', '未': '上', '申': '中', '酉': '下', '戌': '上', '亥': '中' },
    '臣基':   { '子': '中', '丑': '上', '寅': '下', '卯': '下', '辰': '上', '巳': '中', '午': '中', '未': '上', '申': '中', '酉': '下', '戌': '上', '亥': '中' },
    '民基':   { '子': '上', '丑': '中', '寅': '下', '卯': '下', '辰': '上', '巳': '中', '午': '中', '未': '中', '申': '上', '酉': '下', '戌': '中', '亥': '上' },
    '天乙':   { '子': '中', '丑': '上', '寅': '下', '卯': '下', '辰': '中', '巳': '下', '午': '下', '未': '中', '申': '上', '酉': '上', '戌': '中', '亥': '中' },
    '地乙':   { '子': '中', '丑': '上', '寅': '下', '卯': '下', '辰': '上', '巳': '中', '午': '中', '未': '上', '申': '中', '酉': '下', '戌': '上', '亥': '下' },
    '四神':   { '子': '上', '丑': '中', '寅': '下', '卯': '下', '辰': '上', '巳': '下', '午': '中', '未': '下', '申': '上', '酉': '下', '戌': '中', '亥': '上' },
    '飛符':   { '子': '下', '丑': '中', '寅': '上', '卯': '下', '辰': '中', '巳': '上', '午': '上', '未': '中', '申': '中', '酉': '下', '戌': '上', '亥': '下' },
    '主大':   { '子': '中', '丑': '上', '寅': '下', '卯': '中', '辰': '中', '巳': '上', '午': '下', '未': '中', '申': '上', '酉': '上', '戌': '下', '亥': '中' },
    '主參':   { '子': '上', '丑': '下', '寅': '中', '卯': '下', '辰': '上', '巳': '中', '午': '中', '未': '下', '申': '上', '酉': '中', '戌': '下', '亥': '上' },
    '客大':   { '子': '上', '丑': '中', '寅': '中', '卯': '下', '辰': '上', '巳': '下', '午': '下', '未': '中', '申': '上', '酉': '中', '戌': '下', '亥': '上' },
    '客參':   { '子': '中', '丑': '中', '寅': '上', '卯': '上', '辰': '中', '巳': '下', '午': '下', '未': '上', '申': '下', '酉': '下', '戌': '中', '亥': '上' }
    };

    // ▼▼▼ 星曜屬性資料庫 (五行/吉凶/描述) ▼▼▼
    const STAR_PROPERTIES = {
    '小遊':   { element: '陽木', luck: '吉星', description: '歲星之精，正直之星' },
    '計神':   { element: '陰土', luck: '吉星', description: '財庫天機星' },
    '文昌':   { element: '陽土', luck: '吉星', description: '文才之星' },
    '始擊':   { element: '陽火', luck: '凶星', description: '酒色星' },
    '時五福': { element: '陽土', luck: '吉星', description: '天上賜福之神' },
    '君基':   { element: '陽土', luck: '吉星', description: '科甲貴人星' },
    '臣基':   { element: '陽土', luck: '吉星', description: '招搖吉星' },
    '民基':   { element: '陰土', luck: '吉星', description: '財富星，食祿之神' },
    '天乙':   { element: '陰金', luck: '凶星', description: '孤獨之星' },
    '地乙':   { element: '陰土', luck: '凶星', description: '孤寡之星' },
    '四神':   { element: '陰水', luck: '凶星', description: '聚散之星，又號孤星' },
    '飛符':   { element: '陰火', luck: '凶星', description: '兇暴之星' },
    '主大':   { element: '陽金', luck: '吉星', description: '魁鉞之星' },
    '主參':   { element: '陰水', luck: '吉星', description: '副帥之星' },
    '客大':   { element: '陽水', luck: '吉星', description: '邊疆顯達，巨商大賈' },
    '客參':   { element: '陰木', luck: '吉星', description: '副將之星，旅星孤星' }
    };

    // ▼▼▼ 寄宮規則資料庫 ▼▼▼
    const JI_GONG_MAP = {
    'pQian': 'pHai', // 乾寄亥
    'pGen':  'pYin', // 艮寄寅
    'pXun':  'pSi',  // 巽寄巳
    'pKun':  'pShen' // 坤寄申
    };

    // ▼▼▼ 十二宮對宮關係資料庫 ▼▼▼
    const OPPOSITE_PALACE_MAP = {
    'pZi': 'pWu', 'pChou': 'pWei', 'pYin': 'pShen', 'pMao': 'pYou', 'pChen': 'pXu', 'pSi': 'pHai',
    'pWu': 'pZi', 'pWei': 'pChou', 'pShen': 'pYin', 'pYou': 'pMao', 'pXu': 'pChen', 'pHai': 'pSi'
    };

    // ▼▼▼ 地支三合關係資料庫 ▼▼▼
    const SAN_HE_MAP = {
    '子': ['申', '辰'], '辰': ['子', '申'], '申': ['子', '辰'],
    '丑': ['巳', '酉'], '巳': ['丑', '酉'], '酉': ['丑', '巳'],
    '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'],
    '卯': ['亥', '未'], '未': ['卯', '亥'], '亥': ['卯', '未']
    };  

    // ▼▼▼ 星曜等級對應分數 ▼▼▼
    const RATING_SCORES = { '上': 20, '中': 10, '平': 0, '下': -10 };

    // ▼▼▼ 論命分析中需要排除的星曜列表 ▼▼▼
    const EXCLUDED_STARS_FROM_ANALYSIS = ['太乙', '定目', '定大', '定參', '大遊', '太歲', '合神'];

    // ▼▼▼ 分數計算規則 (全域共用) ▼▼▼
    const SCORE_RULES = {
    luckScores: { '吉星': 20, '凶星': -10 },
    strengthBonus: 50,
    huaYaoScore: 30,
    specialHuaYaoMultiplier: 1.5,
    huangEnMultiplier: 1.5,
    patternMultiplier: 0.8
    };

    // ▼▼▼ 中宮寄宮規則資料庫 ▼▼▼
    const CENTER_PALACE_JI_GONG_RULES = {
    '主算': {
        '5':  { '主大': '戌', '主參': '辰' },
        '15': { '主大': '未', '主參': '丑' },
        '25': { '主大': '戌', '主參': '辰' },
        '35': { '主大': '丑', '主參': '未' }
    },
    '客算': {
        '5':  { '客大': '辰', '客參': '戌' },
        '15': { '客大': '未', '客參': '丑' },
        '25': { '客大': '戌', '客參': '辰' },
        '35': { '客大': '丑', '客參': '未' }
    }
    };

    // ▼▼▼ 十二宮職全名對照表 ▼▼▼
    const PALACE_FULL_NAME_MAP = { 
    '命':'命宮', '兄':'兄弟宮', '妻':'夫妻宮', '孫':'子孫宮', 
    '財':'財帛宮', '田':'田宅宮', '官':'官祿宮', '奴':'奴僕宮', 
    '疾':'疾厄宮', '福':'福德宮', '貌':'相貌宮', '父':'父母宮' 
    };

    // ▼▼▼ 星曜十二宮代表意義資料庫 (最終完整版) ▼▼▼
    const STAR_PALACE_DESCRIPTIONS = {
    '小遊':   { '命宮': '你的天賦在於聰明才智與敏銳的洞察力，尤其善於辨識真偽。建議你多運用這份判斷力，在學業或事業上設定清晰目標，這能讓你更快取得成功。', '兄弟宮': '你與兄弟姊妹的關係傾向和睦，他們可能是品德良好的人。這份手足情誼是你人生中的重要支持，建議你用心維護。', '夫妻宮': '你的伴侶可能非常注重生活品質，擅長打理家務，能為家庭帶來穩定與舒適。', '子孫宮': '若得一子，可望極貴；若子女稍多（三至四位），則能量會相對分散。', '財帛宮': '你的財運潛力很好，有機會達到財帛豐盛的狀態。但你可能天生帶有「隔年愁」的思維，即使富裕也容易擔憂未來，建議你學習享受當下，建立更穩健的財務信心。', '田宅宮': '你在家產房業上潛力很好，若宮位強旺，有機會家業興盛、地產豐厚。若宮位不佳，則需注意家業可能有先盛後衰的風險，建議做好長期規劃。', '官祿宮': '你在事業上潛力十足，若能找對方向並持續深耕，很有機會早年得志，並且功名能夠持續一生。建議你專注於能長期發展的領域。', '奴僕宮': '你容易遇到能力強、做事有效率的下屬或夥伴，他們會成為你事業上的得力助手，對你產生實質的幫助。', '疾厄宮': '需留意眼睛的保健。若宮位不佳，建議定期檢查肺部與肝臟功能，並注意呼吸系統的保養。', '福德宮': '你的福氣在於精神層面的富足與清靜。建議你追求內心的平靜與智慧，你的品德與才華有機會讓你聲名遠播，贏得他人的尊敬。', '相貌宮': '你的外在形象給人乾淨、修潔的感覺，天生懂得打理自己，注重儀容。', '父母宮': '你的家庭根基穩固，有很高的機會能得到父母的庇蔭，並繼承歷史悠久的祖產。' },
    '計神':   { '命宮': '你擁有出色的策略思維和解決問題的能力。建議你積極參與需要動腦的專案，你的才智有機會讓你成為核心人物，甚至在旺宮時能成為接近權力核心的策士或顧問。', '兄弟宮': '在手足關係上，可能會因為家庭結構較為複雜（例如同父異母或同母異父），而產生一些挑戰或隔閡，需要更多智慧去經營。', '夫妻宮': '你的伴侶可能具備出色的理財和規劃能力，是家庭財務的得力助手。', '子孫宮': '你的子女天資聰穎，具備出眾的才華與學識。若宮位強旺，有得二子的潛力。', '財帛宮': '你天生具備會計記帳的才能，對數字敏感，能有效地管理金錢。建議你親自參與財務規劃，你的細心能讓財庫日益充實。', '田宅宮': '你對居住環境的品味很好，有機會擁有設計感強、裝潢華麗美觀的家宅。', '官祿宮': '你天生聰明，在事業上能夠很早就展現才華，獲得名聲與地位。建議你把握年輕時的機會，你的才智將是你平步青雲的基石。', '奴僕宮': '你的朋友或下屬非常有智慧，不僅能在內部提供優秀的計策，也能在外部協助你成就事業，是不可多得的軍師型人物。', '疾厄宮': '你的健康問題多源於思慮過度。建議學習放鬆心情，避免鑽牛角尖。同時，飲食上應力求清淡，避免菸酒或過於油膩的食物，以防相關疾病。', '福德宮': '你的內心可能時常處於思慮過多、總覺得不夠的狀態，容易追求安逸。這提醒你要學習知足常樂，將聰明才智用於創造，而非無謂的擔憂。', '相貌宮': '你的相貌或體格可能比較厚重、穩健，同時又注重整潔，給人一種寬宏大量的信賴感。', '父母宮': '你有機會獲得來自原生家庭或伴侶家庭的財務支持。' },
    '文昌':   { '命宮': '你在溝通、學習和表達方面有特殊才華。建議你多從事能發揮「文采」的工作，若能搭配吉星輔助，更有機會在文化、教育或政府機構中取得崇高地位。', '兄弟宮': '你的兄弟姊妹可能天資聰穎，具有文采或藝術才華，是能啟發你心智的對象。', '夫妻宮': '你的婚姻關係帶有書香氣息。伴侶可能知書達禮、有才華，或者來自有良好教養的家庭。', '子孫宮': '你的子女聰明好學，有潛力成為博學多聞的人才。若宮位強旺，這是一個子嗣緣分深厚（可達四子）的訊號。', '財帛宮': '你的財源與「文」相關。建議你多從事寫作、教育、設計、企劃等能發揮你才華的領域，將專業知識轉化為實際的財富。', '田宅宮': '你的家業根基與「文」相關，可能是書香世家，或是有機會透過教育、文化、藝術品等領域來置產立業。', '官祿宮': '你的事業成就與你的才華和知識密切相關。建議你專注於文化、教育、寫作或任何需要深度專業的領域，你的作品或專業能力將有機會讓你聲名遠播。', '奴僕宮': '你的社交圈或團隊中，容易出現有文采或專業技能的朋友及下屬。他們能在企劃、文書或專業領域上為你提供極大的幫助。', '疾厄宮': '你天生有健康意識，懂得預防。若宮位不佳，需特別注意心臟與胃部的保養，例如規律飲食和適度運動。', '福德宮': '你的福氣來自於智慧與才華，能為你帶來長久的富貴。你的家庭觀念很好，有機會子孝孫賢，享受和樂的家庭生活。', '相貌宮': '你的氣質斯文儒雅，帶有書卷氣，給人一種清秀高尚、不落俗套的印象。', '父母宮': '你的家庭可能是書香世家，非常重視教育與文化傳承，在地方上或特定領域可能小有名望。' },
    '始擊':   { '命宮': '你天生具備領導者和開拓者的潛質，充滿魄力。建議你勇於接受挑戰，若能在軍警、管理或開拓性強的領域發展，將能發揮最大潛能。你的人生課題可能包含較早地學習獨立。', '兄弟宮': '你在手足方面的緣分可能比較淺，可能兄弟姊妹較少，或長大後容易各自發展，聯繫變得不那麼緊密。', '夫妻宮': '在感情關係中，你需要特別注意界線和忠誠的問題。此星曜提醒你要專注於當下的伴侶，避免因外界誘惑而產生不必要的感情糾紛。主好酒色。', '子孫宮': '在求子或養育的過程中，可能會遇到一些挑戰。傳統上認為頭一兩個孩子緣分較淺，需要投入更多心力來呵護。', '財帛宮': '你的財運起伏較大，有聚散無常的特質，可能會有意外的收入，但也需要控制開銷。若同時見到「飛符」，則要特別留意財務安全，慎防詐騙或竊盜。', '田宅宮': '你可能需要白手起家，而不是繼承祖業。建議在家居安全上要特別留意水、火、電等相關風險，做好預防措施。', '官祿宮': '你在事業上充滿魄力與開拓精神，特別適合在軍警、管理、開拓市場或需要果斷決策的「武職」領域發展，將有機會取得震驚一方的成就。', '奴僕宮': '在人際關係和團隊管理上，你需要特別謹慎。這顆星提醒你要慎選夥伴，避免因下屬或朋友而產生財務損失或口舌是非，且交情可能不夠長久。', '疾厄宮': '需特別注意意外傷害（血光）的風險，從事激烈活動時應做好防護。在健康上，要留意心肺功能，並在年長時加強全身保健。', '福德宮': '你天生是個停不下來的行動派，總是在為各種事務操心勞碌。建議你學會在忙碌中找到平衡，適時地放鬆，才能真正享受奮鬥的果實。', '相貌宮': '你的氣色可能偏紅潤，外在表現上可能給人性情較為急躁的感覺。', '父母宮': '你與父母的緣分是需要特別用心經營的課題。這提醒你要多加關心父母的健康與狀況。' },
    '時五福': { '命宮': '你天生帶有福氣，容易獲得好的機遇。建議你保持樂觀積極的心態，多與人為善，上天賜予的福氣會在人際關係和物質生活中得到體現，讓人生更順遂。', '兄弟宮': '你的兄弟姊妹可能有很好的發展和福氣，但這可能會讓你在比較之下，感覺自己的資源或成就不如他們。', '夫妻宮': '你的婚姻能為你帶來實質的幫助。你很有機會獲得伴侶或其家庭在財務上的支持，是你能「得妻力」的重要訊號。', '子孫宮': '你在子女方面很有福氣，他們有機會取得成就，晚年安樂。若此星落在旺宮，有得二子的潛力。', '財帛宮': '你在財運上非常有福氣。若宮位強旺，很有機會達到金玉滿堂的富足狀態。建議你把握機遇，你的努力將有豐厚的回報。', '田宅宮': '你在田宅方面非常有福氣，有很高的機會繼承祖上或父母留下的豐厚產業，得到家庭的庇蔭。', '官祿宮': '你的事業道路有福氣加持，過程會相對平順，少有波折。若宮位強旺，可以安心發展；若宮位不佳，則需要付出更多努力才能獲得理想的職位與收入。', '奴僕宮': '你的朋友或下屬本身很有福氣，若宮位強旺，他們會是忠誠且得力的好幫手，能為你帶來好運。', '疾厄宮': '你的體質很好，天生抵抗力強，少有大病。即使偶有小恙，也容易康復，是「逢凶化吉」的健康格局。', '福德宮': '你天生福澤深厚，五福兼具。無論過程如何，你的晚年生活都能安享榮華，即使遇到挑戰也能平安度過。', '相貌宮': '你的相貌端正，帶有威儀，但同時又給人一種春風和氣的親切感，讓人樂於親近。', '父母宮': '你在家庭方面非常有福氣，父母健康長壽，且有機會得到他們留下的豐厚產業。' },
    '君基':   { '命宮': '你的特質是穩重、值得信賴，能給人安定感。建議你在團隊中扮演基石的角色，你的品德和沈穩將為你贏得尊敬，並吸引到重要的貴人相助。', '兄弟宮': '你的手足可能非常有成就或能力出眾，這固然是好事，但也可能在資源或家庭關注上，讓你感覺自己的空間受到擠壓。', '夫妻宮': '你的伴侶可能本身非常有能力、地位崇高，屬於家中掌權的那位。若四神同臨，則伴侶在精神層面有很高的追求（例如善良、有信仰）。', '子孫宮': '你的傳承能量非常集中，若得一子，可望極貴；若子女稍多（三至四位），則能量會相對分散。', '財帛宮': '你的財源與公家機構或大型組織有很強的連結，例如擔任公職或在穩定的大公司任職。同時，你也容易獲得長輩或上位者的財務支持。', '田宅宮': '你在不動產方面有極佳的潛力，有機會擁有大片土地或氣派的房產。忌坐空亡宮。', '官祿宮': '你在事業上能夠早早地就獲得成功與名望，尤其利於透過考試、認證或學術的路徑來奠定自己的專業地位。', '奴僕宮': '這是一個「貴人錯位」的警訊。你可能會遇到能力很強但難以管理的下屬，或是過於信賴朋友而導致損失。建議你在識人、用人上要格外謹慎。', '疾厄宮': '你擁有強健的體魄，一生健康安泰。即使遇到健康問題，也容易找到解決方法，迅速康復。', '福德宮': '你的一生基調是平順安泰的，晚年能享清福。你的福氣也會庇蔭子孫，讓他們有機會取得成就，使你晚景倍感榮華。', '相貌宮': '你的外型或氣質可能高大、魁梧，天生帶有一種不怒而威的尊嚴，能讓眾人信服。', '父母宮': '你的祖業興旺，有很高的機會能繼承父母的遺產。需要注意的是，要務實規劃，避免因理想過高而損耗家業。' },
    '臣基':   { '命宮': '你是非常出色的執行者和輔佐型人才。建議你尋找一個值得信賴的團隊或領導者，在清晰的架構下，你的執行力和責任感將能發揮到極致。', '兄弟宮': '你的手足組合可能姊妹較多，兄弟較少。或是有姊姊沒有哥哥。', '夫妻宮': '你的伴侶在家庭中可能是主導者和管理者的角色，非常有能力，能將家業打理得井井有條。', '子孫宮': '在子女的緣分上，女兒的緣分可能稍強一些，或是容易先生女，再生男。', '財帛宮': '你的財運豐厚，尤其容易獲得女性貴人或伴侶方的財務幫助。可以多與女性夥伴合作，或重視另一半的理財建議。', '田宅宮': '你有潛力擁有多處資產。在選擇房產時，可以特別留意坐南朝北的方位，對你的家運會更有幫助。', '官祿宮': '你是絕佳的輔佐與執行人才。若能遇到好的平台、團隊或領導者（會吉星），你的能力將被極大化，有機會在組織中達到非常高的職位。', '奴僕宮': '在人際關係中，你需要提高警覺，慎防小人。這顆星提醒你要注意朋友或下屬之間可能出現的陷害或欺騙，避免因此導致損失。', '疾厄宮': '你的體質可能偏向「上熱下寒」，需注意下半身的保暖，避免循環不佳。飲食上則要避免過於燥熱，以免引起胃部不適。', '福德宮': '你的福氣主要體現在子孫的成就和個人的健康長壽上。晚年生活將會是寧靜而舒適的，可以安心享福。', '相貌宮': '你的相貌或體格可能比較厚重、穩健，給人一種寬宏大量的感覺。', '父母宮': '你的母親可能是一位品德高尚、賢慧能幹的女性，家風比較嚴謹、有規矩。' },
    '民基':   { '命宮': '你在積累財富和享受生活方面有很好的潛力。建議你專注於穩定、長期的財務規劃，你的務實和努力，有機會為你帶來豐厚的物質回報，達成富足人生。', '兄弟宮': '你與兄弟姊妹的關係是合作型的。你們很可能各自成家後，依然能同心協力，成為彼此的好夥伴。', '夫妻宮': '你的伴侶勤儉持家，擅長儲蓄和積累財富，並有機會得到娘家的支持。', '子孫宮': '你的子女有潛力勤儉持家並變得富足。若宮位強旺，有得三子的潛力。', '財帛宮': '你具備成為大富的潛力。建議你專注於能穩定累積資產的事業，腳踏實地，你的財富將會非常可觀。', '田宅宮': '你有機會擁有數量較多的田產或房產，且可能是氣派的獨棟或大門宅院。', '官祿宮': '你在事業上務實且腳踏實地。若能搭配好的機運（會吉星），可以透過實質的貢獻或投資（納栗）來為自己換取相應的社會地位或名聲。', '奴僕宮': '你的人際網絡是你的重要資產。你容易獲得朋友的扶持，並且有機會透過外地人或遠方的人脈而獲得財富。', '疾厄宮': '需注意飲食消化問題，特別是五穀雜糧類。雖然不容易引發大病，但仍建議你飲食規律，細嚼慢嚥，保護好腸胃功能。', '福德宮': '你的人生是先苦後甘的典型。雖然年輕時需要親力親為，辛苦操持，但你的努力終將獲得回報，讓你能在晚年享受富貴榮華。', '相貌宮': '你的外在形象穩重且有威儀，從言行舉止間能看出你勤儉務實的內心本質。', '父母宮': '你有機會得到父母留下的豐厚財產。若宮位不佳，則可能代表這些資產是表面風光，或是需要你付出更多努力才能真正得到。' },
    '天乙':   { '命宮': '你堅持原則，擁有不隨波逐流的獨立精神。建議你離開家鄉往外發展，你的獨特個性在國際貿易、新創或需要獨立判斷的領域更能取得成功。', '兄弟宮': '你的兄弟不見得有子女傳承。這顆星建議你多關心手足間的關係，珍惜相處的時光。', '夫妻宮': '你的伴侶是持家好手，婚後娘家可能會經歷一些波折。這顆星暗示，可以選擇思想成熟或年齡稍長的伴侶，可能更有助於在波折中相互扶持，共度難關。', '子孫宮': '在養育第一個孩子時，可能需要投入比預期更多的關愛與心力。建議為他多祈福，或是寄名養育。', '財帛宮': '你的財務狀況可能經歷先散後聚的過程，年輕時的開銷或投資可能較大，但最終能累積財富。你也帶有「隔年愁」的特質，需注意別過度擔憂。', '田宅宮': '你可能無法繼承太多祖產，需要靠自己奮鬥置產。若宮位強旺，可以考慮從事與「金屬、機械、金融」相關的行業來累積資產。', '官祿宮': '你的事業才能偏向執行、管理、或需要行動力的「武職」類型。相較之下，純粹的文書或研究工作可能較不適合你發揮。', '奴僕宮': '你在對待朋友或下屬時總是盡心盡力，但可能回報不成正比。這提醒你在付出時要設立界線，避免因為「不虧待他人」而讓自己受累。', '疾厄宮': '需留意肝臟的保養，避免熬夜，並注意視力保健。若「飛符」同宮，則要額外關心腸道的健康狀況。', '福德宮': '你的內心世界傾向於孤高自賞，喜歡清靜，不願捲入無謂的是非。建議你順應本性，追求精神層面的成長，獨立發展更能讓你找到內心的平靜。', '相貌宮': '你的相貌輪廓分明，可能臉型偏方，整體給人一種骨骼清奇、氣質乾淨的感覺。', '父母宮': '你的家庭背景可能比較特殊，例如有過繼、領養或非典型的家庭連結。與母親的緣分是你需要特別用心維護的課題。' },
    '地乙':   { '命宮': '你有很強的責任感和堅毅的性格，能專注於一個領域深耕。建議你離開原生環境，你的毅力將幫助你克服困難，在新的地方建立起屬於自己的一片天。', '兄弟宮': '你的手足關係可能比較疏遠，長大過程中的互動不多，或者有非典型的手足連結（例如過繼、領養等）。', '夫妻宮': '在感情選擇上，與年齡稍長或心智成熟的對象交往，關係會更穩定。敞開心溝通總是比較可以解決相處問題，切忌悶著不說。', '子孫宮': '子女的緣分可能會來得比較晚。傳統認為前幾個孩子緣分較淺。', '財帛宮': '你的財富與不動產或土地資源相關。房地產投資的過程可能起伏不定，呈現先散後聚的模式，但最終能從中獲利。', '田宅宮': '你的家庭根基穩固，有機會繼承歷史悠久的祖產，並將其代代相傳下去。', '官祿宮': '你在事業上是個多面手，兼具策劃思考（文）與執行行動（武）的能力，能夠應對多種不同的工作挑戰。', '奴僕宮': '你在管理人際關係或團隊時，會比較辛勞。與下屬或朋友的溝通可能不夠順暢，容易產生摩擦，需要你投入更多心力去磨合。', '疾厄宮': '你的健康養生重點在於「脾胃」。建議你建立規律的飲食習慣，避免生冷或刺激性食物，以維持良好的消化吸收功能。', '福德宮': '你的福氣與家庭根基緊密相連，有很高的機會能夠繼承並守住祖業，在穩定的基礎上安享生活。', '相貌宮': '你的氣質純樸敦厚，膚色可能偏健康的小麥色。若宮位不佳，需注意臉上或外貌可能會有疤痕或損傷。', '父母宮': '你的父母品德賢良，善於教育子女。你與母親的關係可能特別深厚，或是有非典型的家庭背景。' },
    '四神':   { '命宮': '你擁有深刻的洞察力和獨立精神。由於此星帶有水的屬性，建議你可考慮離開家鄉，並從事與「水」相關的行業，例如航運、餐飲、貿易、水產等，將更容易獲得成功。', '兄弟宮': '你的手足關係可能比較疏遠，潛藏著相處不睦的可能。', '夫妻宮': '你的感情觀可能帶有精神潔癖。這也可能讓你享受獨處，不強求進入婚姻，更重視心靈的契合。', '子孫宮': '對於第一個孩子需要特別關照。若宮位在申或子，則一子可得平安。', '財帛宮': '你的財運有聚散不常的流動特質。若宮位強旺，則能聚集可觀的財富；若宮位不佳，則需特別注意財務的穩定性。', '田宅宮': '你可能需要離開家鄉置產，且選擇的房產可能靠近水邊（河流、湖泊、海邊）。這是一個能享受美食與安逸生活的訊號。', '官祿宮': '你的事業發展是穩定而長久的類型。建議你選擇一個可以長期深耕的領域，你的專業和資歷將隨著時間累積，帶來持續不斷的成就。', '奴僕宮': '在與朋友或同事的交往中，容易捲入口舌是非。建議你說話謹慎，避免在背後議論他人，以維持和諧的人際關係。', '疾厄宮': '你的體質可能偏虛寒，特別是下半身循環。建議多做能促進血液循環的運動，並注意保暖。同時，也要留意脾胃的保養。', '福德宮': '你的內心可能時常感到孤獨，需要親力親為處理許多事。這是一個提醒你要學習與自己相處，並將這份獨立轉化為內在力量的課題。', '相貌宮': '你的外貌或氣質清秀不凡，帶有灑脫、風流的魅力。', '父母宮': '你可能需要較早地學習獨立，或是有較為複雜的家庭關係（例如父母離異、同父異母等）。' },
    '飛符':   { '命宮': '你的反應快速，學習能力強，對新事物充滿好奇。你可能對命理、玄學、科技或需要精細操作的領域有特殊天分。為人慷慨成性。建議你向外發展，你的聰明才智將是你的最佳利器。', '兄弟宮': '你與手足的緣分可能帶有分離或兩地相隔的特質，例如有同父異母/同母異父的兄弟姊妹，或者因為工作、學業而長期分居兩地。', '夫妻宮': '你的第一段婚姻可能會經歷較大的考驗或波折。注意雙方的溝通要理性。', '子孫宮': '這是一個子女緣分充滿考驗的訊號，提醒你要格外珍惜與孩子的緣分。若只得一個女兒，則女兒的發展會很好。', '財帛宮': '你的財運帶有突發的性質，可能會有意外之財，但也要注意意外的開銷。若同時見到「始擊」，則要加強財務風險管理，慎防破財或竊盜。', '田宅宮': '你的家業或居住地可能有較多變動的跡象。在居住安全上，要特別小心火災風險，做好防火措施。', '官祿宮': '你的事業運帶有爆發性，可能會有快速竄紅或突然成功的機會。但也需要注意，若基礎不穩（居陷），可能會因名聲帶來麻煩。相對來說，需要行動力和決斷力的「武職」會比文職更適合你。', '奴僕宮': '你的社交圈中潛藏著財務風險。這顆星提醒你要避免與朋友有金錢往來，或為人作保，以防因此破財或遭受連累。', '疾厄宮': '需特別注意眼睛和呼吸系統的健康，同時也要留心四肢的意外傷害。日常活動和運動時，應加強安全防護。', '福德宮': '你的人生是挑戰與機遇並存的。雖然可能出身平凡，需要勞心勞力去奮鬥，但過程中也隱藏著意外的福氣，是典型的「災福並行」模式。', '相貌宮': '你的外在舉止可能顯得性情急躁。若宮位不佳，需留意四肢容易有意外的刮傷或疤痕。', '父母宮': '你可能在年少時就離開家庭獨立生活，或是比較難獲得父母在事業或財務上的直接幫助。' },
    '主大':   { '命宮': '你天生帶有貴氣和領導潛能，容易獲得他人的認可。建議你勇於表現自己，爭取領導地位，尤其在有好的團隊或夥伴支持下，將更容易獲得貴人提拔。', '兄弟宮': '你在家中可能扮演著領導者或照顧者的角色，如同長兄長姊一般。', '夫妻宮': '你會遇到一位能力出眾、可以與你並駕齊驅的「神隊友」。這是一種平等的夥伴關係，你們可以共同分擔責任，攜手白頭。', '子孫宮': '你的傳承能量非常集中，若得一子，可望得貴。若宮位強旺，子嗣可能較多（可達五子），但能量會因此分散。', '財帛宮': '你的財運能量非常強旺，賺錢機會多，如同泉水般源源不絕。這是一個錦上添花的好兆頭，暗示財源廣進。', '田宅宮': '你有機會在繁華的市中心擁有資產，並且能透過不動產的買賣或租賃來獲利。', '官祿宮': '你在事業上能獲得崇高的聲望和名譽，並且很年輕就能取得成功。建議你愛惜羽毛，你的清譽將是你最大的資產。', '奴僕宮': '你能得到非常有力的朋友或下屬幫助，他們不僅能為你創造財富，還能幫助你建立權威。你的成就是建立在良好的人際合作之上的。', '疾厄宮': '你的健康弱點在於肺部與大腸。除了注意呼吸道保養，更要學會調節情緒，避免因生氣或壓力影響健康。', '福德宮': '你的福澤深厚，一生物質與精神享受豐足。你的晚年將會過得非常有尊嚴，因正直的品性而獲得更大的福報。', '相貌宮': '你的儀態端正，氣質剛毅正直，天生帶有威嚴，令人敬重。', '父母宮': '你的家庭福澤深厚，父母健康長壽，且家業非常豐盛。' },
    '主參':   { '命宮': '你很擅長與人合作，成功的關鍵在於找到對的「貴人」並與之同行。建議你積極拓展人脈，尋找能與你互補的夥伴或導師，他們的協助將是你成功的催化劑。', '兄弟宮': '你的手足關係中，可能存在同父異母或同母異父的非典型連結，或是爸媽有認義子之類。', '夫妻宮': '這顆星代表容易二婚，而且是小三篡位型。這提醒你在婚姻中要認真面對當下的對象，對外要保持清晰的界線，穩固你的婚姻關係。', '子孫宮': '你的子女緣分可能會來得較晚，或是有非典型的家庭連結。有得二子的潛力。', '財帛宮': '你的財富來自於「人」，是典型的「因人成事」型。建議你積極建立人脈，透過合作、中介或夥伴關係來創造財富。', '田宅宮': '你的田宅運與長輩關係密切，有機會繼承或依靠祖父輩的資產來發展，讓家業更加興旺。', '官祿宮': '你事業成功的關鍵在於「貴人」。建議你積極建立良好的人際關係，多向前輩請教，他人的提攜將是你平步青雲的重要助力。', '奴僕宮': '你能獲得下屬或晚輩的助力。建議你用心培養團隊，他們的付出將會是你事業成功的重要一環。', '疾厄宮': '需注意腹腔或泌尿系統的健康，並留意下半身虛寒的問題。建議你保持節制的生活習慣，避免因過度飲酒或縱慾而耗損元氣。', '福德宮': '你人生福氣的關鍵在於「貴人」。建議你多結交良師益友，你的福壽與安樂，將很大程度上來自於他人的支持與庇蔭。', '相貌宮': '你的外貌氣質清秀、斯文，給人一種聰慧、有內涵的感覺。', '父母宮': '你的家庭連結比較多元，除了原生父母，可能還會認乾爹、乾媽，或是存在過繼、領養等情況。' },
    '客大':   { '命宮': '你的舞台在外，越往外走動，機遇越多。建議你不要局限於眼前，多向外開拓，你的魅力和能力將在更廣闊的舞台上被看見，並有機會因此接近權貴，獲得成就。', '兄弟宮': '你的手足數量2位，且彼此的個性獨立、好勝心強，導致相處上容易產生摩擦。建議學習彼此尊重，保持適當距離，反而能讓關係更和諧。', '夫妻宮': '主入贅妻家，在這段關係中，伴侶方的資源或家庭背景可能較為強勢。若能順應這種模式（例如多參考伴侶意見或與其家庭緊密合作），關係會更和諧，否則易二婚離散。', '子孫宮': '你的子女可能天生帶有向外發展的特質，例如適合出外求學或交由他人短暫照顧，這對他們的成長反而更有利。', '財帛宮': '你的財庫在外地。建議你多往外地發展、從事貿易或與人合夥，離開家鄉更能讓你賺取豐厚的利潤。', '田宅宮': '你成功的機會在外地。建議你離開家鄉去外地置產，更能建立起興隆的家業。', '官祿宮': '你的事業機會在外地。建議你多考慮離開家鄉發展、外派或從事與國際事務相關的工作，更能讓你大展鴻圖。', '奴僕宮': '你的團隊運在外地。若能帶領團隊向外地市場發展，下屬將能為你創造可觀的利潤。', '疾厄宮': '在生活習慣上，需要特別注意避免過度飲酒或縱慾，因為這很容易消耗你的根本元氣，導致下半身機能的衰退。', '福德宮': '你的福氣需要透過「為他人付出」來啟動。雖然過程可能辛勞，但最終會因此得到回報。同時，你也可能從晚輩或非直系親屬（如乾兒子）那裡獲得支持與福氣。', '相貌宮': '你的相貌清秀又帶有威嚴，內心善良但說話可能比較直接，這種獨特的氣質有時可能會招來他人的嫉妒。', '父母宮': '你的成長背景可能比較特殊，例如有過繼、被不同家庭的長輩撫養長大，或是家庭成員來自不同的姓氏。' },
    '客參':   { '命宮': '你成功的關鍵在於找到對的「貴人」並與之合作，尤其適合離開家鄉往外地發展。建議你多結交有經驗的前輩或有資源的夥伴，在商業領域，借力使力將是你最快的成功途徑。', '兄弟宮': '你的手足數量2位，可能存在同父異母或同母異父的非典型連結，或是爸媽有認義子之類。', '夫妻宮': '主入贅妻家，伴侶方的影響力較大。同時，這也提醒你要注意感情中的界線，避免陷入複雜的多角關係。', '子孫宮': '你的子女緣分可能會來得較晚，或是有非典型的家庭連結。有得二子的潛力。', '財帛宮': '你的財富來自於人脈與外部資源。積極與外人合作，尤其在貿易或商業領域，將是你的致富之道。', '田宅宮': '離開家鄉發展對你更有利。同時，你也容易透過貴人的幫助來獲得理想的居住環境或不動產。', '官祿宮': '你的事業需要依靠貴人或加入一個強大的平台才能成功。單打獨鬥可能比較辛苦，找到對的夥伴或組織是你的成功關鍵。', '奴僕宮': '你的人際關係非常好，能同時獲得下屬的效力和朋友的扶持，形成一個互助互利的良好循環。', '疾厄宮': '你的健康重點在於肝臟和眼睛的保養，建議避免熬夜和過度用眼。同時，在外地時要特別注意飲食衛生和環境適應，預防疾病。', '福德宮': '你的福氣在遠方。建議你多往外地發展或旅行，離開家鄉更能讓你開闊眼界，並從中獲得實質的利益與人生的樂趣。', '相貌宮': '你的相貌輪廓分明，骨骼清奇，並且言辭表達非常犀利、一針見血。', '父母宮': '你的家庭連結比較多元，除了原生父母，可能還會認乾爹、乾媽來擴展你的家庭支持網絡。' }
    };

    // ▼▼▼ 星曜命宮代表意義資料庫 (女性 - 命宮專用) ▼▼▼
    const STAR_PALACE_DESCRIPTIONS_FEMALE = {
    '小遊':   { '命宮': '你的個性較為率直，不追求浮華的裝飾，偏好簡潔。' },
    '計神':   { '命宮': '你的個性比較急，有時容易捲入口舌是非。但子女緣分佳，且天性勤勞，即使年長也樂於操持。' },
    '文昌':   { '命宮': '你可能出身於書香世家，天生氣質文雅、品德賢淑。這是一個能成為「貴夫人」或「貴人母」的訊號，代表聰慧與心靈手巧。' },
    '始擊':   { '命宮': '你擁有不依靠他人、獨立自強的堅毅性格。' },
    '時五福': { '命宮': '你天生福澤深厚，雖然過程可能有些辛勞，但晚年必能安享福壽。' },
    '君基':   { '命宮': '你的性格沉靜有德，聰明且富有智慧，是能夠兼顧家庭與事業的賢內助。' },
    '臣基':   { '命宮': '你天生帶有溫柔隨和的品德，能夠輔助他人並取得極高的成就。' },
    '民基':   { '命宮': '你具備管理和領導的才能，有機會在家庭或事業中掌握權力。' },
    '天乙':   { '命宮': '你的個性剛毅正直，有自己獨特的原則，喜歡保持內心的清靜。' },
    '地乙':   { '命宮': '你的性格嫻靜有德，同時也樂於主導和管理事務。' },
    '四神':   { '命宮': '你天生愛乾淨，可能帶有精神上的潔癖，是一位賢慧淑德的女性。' },
    '飛符':   { '命宮': '你的人生可能是先苦後甘的類型。年輕時可能比較辛勞，或需要輔助他人，但晚年將能享受到豐厚的福氣。' },
    '主大':   { '命宮': '你的性格聰明伶俐，樂於助人，是團隊中不可或缺的核心人物。' },
    '主參':   { '命宮': '你具備管理家庭與事業的能力，是天生的掌權者。' },
    '客大':   { '命宮': '你心地善良且聰慧，有幫夫運。感情或事業的緣分可能在遠方，有機會遠嫁他鄉，晚年可能追求精神層面的平靜。' },
    '客參':   { '命宮': '你的緣分在外地，容易發展異地戀情或遠嫁他鄉。' }
    };

    // ▼▼▼ 日主五行資料庫 ▼▼▼
    const DAY_MASTER_DATA = {
    '甲': { yinYang: '陽', element: '木' },
    '乙': { yinYang: '陰', element: '木' },
    '丙': { yinYang: '陽', element: '火' },
    '丁': { yinYang: '陰', element: '火' },
    '戊': { yinYang: '陽', element: '土' },
    '己': { yinYang: '陰', element: '土' },
    '庚': { yinYang: '陽', element: '金' },
    '辛': { yinYang: '陰', element: '金' },
    '壬': { yinYang: '陽', element: '水' },
    '癸': { yinYang: '陰', element: '水' }
    };

    // ▼▼▼ 天干關係資料庫 ▼▼▼
    const STEM_INTERACTIONS = {
    '甲': { combinesWith: '己', clashesWith: '庚' },
    '乙': { combinesWith: '庚', clashesWith: '辛' },
    '丙': { combinesWith: '辛', clashesWith: '壬' },
    '丁': { combinesWith: '壬', clashesWith: '癸' },
    '戊': { combinesWith: '癸', clashesWith: null }, // 戊己居中，無剋
    '己': { combinesWith: '甲', clashesWith: null },
    '庚': { combinesWith: '乙', clashesWith: '甲' },
    '辛': { combinesWith: '丙', clashesWith: '乙' },
    '壬': { combinesWith: '丁', clashesWith: '丙' },
    '癸': { combinesWith: '戊', clashesWith: '丁' }
    };

    // ▼▼▼ 地支關係資料庫 ▼▼▼
    const BRANCH_INTERACTIONS = {
    '子': { combinesWith: '丑', clashesWith: '午' },
    '丑': { combinesWith: '子', clashesWith: '未' },
    '寅': { combinesWith: '亥', clashesWith: '申' },
    '卯': { combinesWith: '戌', clashesWith: '酉' },
    '辰': { combinesWith: '酉', clashesWith: '戌' },
    '巳': { combinesWith: '申', clashesWith: '亥' },
    '午': { combinesWith: '未', clashesWith: '子' },
    '未': { combinesWith: '午', clashesWith: '丑' },
    '申': { combinesWith: '巳', clashesWith: '寅' },
    '酉': { combinesWith: '辰', clashesWith: '卯' },
    '戌': { combinesWith: '卯', clashesWith: '辰' },
    '亥': { combinesWith: '寅', clashesWith: '巳' }
    };

    // ▼▼▼ 十神關係資料庫 ▼▼▼
    const TEN_GODS_MAP = {
    '甲': { '甲': '比肩', '乙': '劫財', '丙': '食神', '丁': '傷官', '戊': '偏財', '己': '正財', '庚': '七殺', '辛': '正官', '壬': '偏印', '癸': '正印' },
    '乙': { '甲': '劫財', '乙': '比肩', '丙': '傷官', '丁': '食神', '戊': '正財', '己': '偏財', '庚': '正官', '辛': '七殺', '壬': '正印', '癸': '偏印' },
    '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫財', '戊': '食神', '己': '傷官', '庚': '偏財', '辛': '正財', '壬': '七殺', '癸': '正官' },
    '丁': { '甲': '正印', '乙': '偏印', '丙': '劫財', '丁': '比肩', '戊': '傷官', '己': '食神', '庚': '正財', '辛': '偏財', '壬': '正官', '癸': '七殺' },
    '戊': { '甲': '七殺', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫財', '庚': '食神', '辛': '傷官', '壬': '偏財', '癸': '正財' },
    '己': { '甲': '正官', '乙': '七殺', '丙': '正印', '丁': '偏印', '戊': '劫財', '己': '比肩', '庚': '傷官', '辛': '食神', '壬': '正財', '癸': '偏財' },
    '庚': { '甲': '偏財', '乙': '正財', '丙': '七殺', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫財', '壬': '食神', '癸': '傷官' },
    '辛': { '甲': '正財', '乙': '偏財', '丙': '正官', '丁': '七殺', '戊': '正印', '己': '偏印', '庚': '劫財', '辛': '比肩', '壬': '傷官', '癸': '食神' },
    '壬': { '甲': '食神', '乙': '傷官', '丙': '偏財', '丁': '正財', '戊': '七殺', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫財' },
    '癸': { '甲': '傷官', '乙': '食神', '丙': '正財', '丁': '偏財', '戊': '正官', '己': '七殺', '庚': '正印', '辛': '偏印', '壬': '劫財', '癸': '比肩' }
    };

    // ▼▼▼ (新) 十神意象資料庫 ▼▼▼
    const TEN_GODS_EXPLANATIONS = {
    '比肩': '代表合夥以及同性的合作。',
    '劫財': '代表財物消耗、競爭與人脈。',
    '食神': '代表機遇、享受與口福，也象徵創造力和表現力。',
    '傷官': '代表創造、情感與能量付出，也可能帶來口舌是非。',
    '偏財': '代表不在預期內的大筆收入機會或異性緣。',
    '正財': '代表穩定的收入與工作，大環境有利於賺錢。',
    '七殺': '代表非職場的管束壓力與挑戰（女性也代表非典型的異性緣）。',
    '正官': '代表職場的管束與責任（女性也代表穩定的異性緣或婚姻）。',
    '偏印': '代表非傳統、技藝類的學習與喜好。',
    '正印': '代表學習、貴人、文書與庇蔭。'
    };

    // ▼▼▼ 十二地支藏干資料庫 (主氣) ▼▼▼
    const BRANCH_HIDDEN_STEMS = {
    '子': '癸', '丑': '己', '寅': '甲', '卯': '乙', '辰': '戊', '巳': '丙',
    '午': '丁', '未': '己', '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
    };

    // ▼▼▼ 新增：日柱空亡規則資料庫 ▼▼▼
    const KONG_WANG_RULES = {
        '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'], '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],
        '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'], '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],
        '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'], '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
        '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'], '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],
        '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'], '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],
        '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'], '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
    };

    // ▼▼▼ 新增：空亡底色位置微調設定表 (單位：度) ▼▼▼
    // 正數(+)為順時鐘偏移，負數(-)為逆時鐘偏移
    const KONG_WANG_OFFSET_CONFIG = {
        '子': 0, '丑': -1, '寅': 0, '卯': 0, '辰': 0, '巳': 1.1, 
        '午': 0, '未': -1, '申': 0, '酉': 0, '戌': 0, '亥': 1 
    };

    // ▼▼▼ 補上這行：太乙國運基準數 ▼▼▼
    const TAI_YI_BASE_JISHU = 10153917;

    // ▼▼▼ 五福星的宮位順序 ▼▼▼
    const WU_FU_ORDER = ['乾', '艮', '巽', '坤', '中'];


// =================================================================
//  SECTION 2: SVG 圖盤繪製邏輯 (最終整理版)
// =================================================================
const svgPlate = document.getElementById('taiyi-plate');
const SVG_NS = "http://www.w3.org/2000/svg";
const dynamicGroup = document.createElementNS(SVG_NS, 'g');
dynamicGroup.setAttribute('id', 'dynamic-text-group');
if (svgPlate) { svgPlate.appendChild(dynamicGroup); }
let pathCounter = 0;

// ▼▼▼ 【新增】動畫小幫手：為元素加上隨機延遲與顯示 Class ▼▼▼
function applyStarAnimation(element) {
    // 1. 計算隨機延遲時間 (0秒 ~ 0.6秒之間)，營造錯落感
    const randomDelay = Math.random() * 0.6; 
    
    // 2. 直接設定 CSS 變數給這個元素
    element.style.transitionDelay = `${randomDelay}s`;

    // 3. 使用雙重 requestAnimationFrame 確保瀏覽器先渲染了 "opacity: 0"
    // 然後才加上 "star-visible" 觸發過渡效果
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            element.classList.add('star-visible');
        });
    });
}

// --- 所有的繪圖「工具函式」都集中在這裡 ---
// ▼▼▼ 繪製放射狀文字的工具函式 (可翻轉、可調整距離版) ▼▼▼
function addRadialText(palaceId, angle, startRadius, text, className) {
    
    const targetPalacesForFlip = ['pSi', 'pWu', 'pWei'];
    
    // 預設使用傳入的原始半徑
    let effectiveRadius = startRadius;

    // 檢查是否是需要特殊處理的宮位
    if (targetPalacesForFlip.includes(palaceId)) {
        // 如果是，就從設定檔讀取額外的距離並加上去
        const offset = RADIAL_LAYOUT.bottomPalaceRadiusOffset || 0;
        effectiveRadius = startRadius + offset;
    }

    // --- 以下為繪圖邏輯 ---
    if (targetPalacesForFlip.includes(palaceId)) {
        const angleRad = angle * (Math.PI / 180);
        const x = RADIAL_LAYOUT.center.x + effectiveRadius * Math.cos(angleRad);
        const y = RADIAL_LAYOUT.center.y + effectiveRadius * Math.sin(angleRad);
        
        // 採用您驗證可行的旋轉角度
        let rotation = angle - 90 + 180;

        const textElement = document.createElementNS(SVG_NS, 'text');
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
        textElement.setAttribute('class', 'dynamic-text ' + className);
        textElement.setAttribute('dominant-baseline', 'central');
        textElement.setAttribute('text-anchor', 'middle');
        textElement.textContent = text;

        applyStarAnimation(textElement); // <--- 注入動畫
        dynamicGroup.appendChild(textElement);

    } else {
        // 其他宮位，維持原本的 <textPath> 方法
        pathCounter++;
        const pathId = `radial-path-${pathCounter}`;
        const angleRad = angle * (Math.PI / 180);
        const endX = RADIAL_LAYOUT.center.x + 600 * Math.cos(angleRad);
        const endY = RADIAL_LAYOUT.center.y + 600 * Math.sin(angleRad);
        
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('id', pathId);
        path.setAttribute('d', `M ${RADIAL_LAYOUT.center.x},${RADIAL_LAYOUT.center.y} L ${endX},${endY}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'none');
        dynamicGroup.appendChild(path);
        
        const textElement = document.createElementNS(SVG_NS, 'text');
        textElement.setAttribute('class', 'dynamic-text ' + className);
        
        const textPath = document.createElementNS(SVG_NS, 'textPath');
        textPath.setAttribute('href', '#' + pathId);
        textPath.setAttribute('startOffset', startRadius); // 注意：這裡仍然使用原始的 startRadius
        textPath.textContent = text;
        
        textElement.appendChild(textPath);
        applyStarAnimation(textElement); // <--- 注入動畫
        dynamicGroup.appendChild(textElement);
    }
}
function addSingleCharRing(data, ringConfig) {
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        if (!char) continue;
        const palaceKey = ringConfig.palaces[i];
        const angle = RADIAL_LAYOUT.angles[palaceKey];
        const angleRad = angle * (Math.PI / 180);
        const x = RADIAL_LAYOUT.center.x + ringConfig.radius * Math.cos(angleRad);
        const y = RADIAL_LAYOUT.center.y + ringConfig.radius * Math.sin(angleRad);
        const textElement = document.createElementNS(SVG_NS, 'text');
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'central');
        textElement.setAttribute('class', 'dynamic-text sub-info-style');
        if (ringConfig.color) {
            textElement.setAttribute('style', `fill: ${ringConfig.color};`);
        }
        textElement.textContent = char;
        applyStarAnimation(textElement); // <--- 注入動畫
        dynamicGroup.appendChild(textElement);
    }
}
function addRotatedRingText(data, ringConfig) {
    const rotationOffset = ringConfig.rotationOffset || 0;
    for (let i = 0; i < data.length; i++) {
        const text = data[i];
        if (!text) continue;
        const palaceKey = ringConfig.palaces[i];
        const angle = RADIAL_LAYOUT.angles[palaceKey] + rotationOffset;
        const angleRad = angle * (Math.PI / 180);
        const x = RADIAL_LAYOUT.center.x + ringConfig.radius * Math.cos(angleRad);
        const y = RADIAL_LAYOUT.center.y + ringConfig.radius * Math.sin(angleRad);
        let rotation = angle + 90;
        if (angle > 90 && angle < 270) {
            rotation = angle - 90;
        }
        if (ringConfig.flipPalaces && ringConfig.flipPalaces.includes(palaceKey)) {
            rotation += 180;
        }
        const textElement = document.createElementNS(SVG_NS, 'text');
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'central');
        const className = ringConfig.className || 'sub-info-style';
        textElement.setAttribute('class', 'dynamic-text ' + className);
        let styleString = 'writing-mode: horizontal-tb;';
        if (ringConfig.color) {
            styleString += ` fill: ${ringConfig.color};`;
        }
        textElement.setAttribute('style', styleString);
        textElement.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
        textElement.textContent = text;
        applyStarAnimation(textElement); // <--- 注入動畫
        dynamicGroup.appendChild(textElement);
    }
}
function addSdrRing(sdrDataObject, ringConfig) {
    if (!sdrDataObject || !ringConfig) return;
    for (const palaceKey in sdrDataObject) {
        const chars = sdrDataObject[palaceKey];
        if (!chars || chars.length === 0 || RADIAL_LAYOUT.angles[palaceKey] === undefined) continue;
        const centerAngle = RADIAL_LAYOUT.angles[palaceKey];
        let angles = [];
        if (chars.length === 1) { angles = [centerAngle]; } 
        else if (chars.length === 2) { angles = [centerAngle - ringConfig.hOffset, centerAngle + ringConfig.hOffset]; } 
        else if (chars.length === 3) { angles = [centerAngle - ringConfig.hOffset, centerAngle, centerAngle + ringConfig.hOffset]; }
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const angle = angles[i];
            if (angle === undefined) continue;
            const angleRad = angle * (Math.PI / 180);
            const x = RADIAL_LAYOUT.center.x + ringConfig.radius * Math.cos(angleRad);
            const y = RADIAL_LAYOUT.center.y + ringConfig.radius * Math.sin(angleRad);
            const textElement = document.createElementNS(SVG_NS, 'text');
            textElement.setAttribute('x', x);
            textElement.setAttribute('y', y);
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('dominant-baseline', 'central');
            textElement.setAttribute('class', 'dynamic-text sdr-style');
            textElement.textContent = char;
            applyStarAnimation(textElement); // <--- 注入動畫
            dynamicGroup.appendChild(textElement);
        }
    }
}
function addEncircledText(text, x, y, rotation, textClassName, circleClassName) {
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('transform', `translate(${x}, ${y})`);
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', 0);
    circle.setAttribute('cy', 0);
    circle.setAttribute('r', 9);
    circle.setAttribute('class', circleClassName);

    const textElement = document.createElementNS(SVG_NS, 'text');
    textElement.setAttribute('x', 0);
    textElement.setAttribute('y', 0);
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('dominant-baseline', 'central');
    textElement.setAttribute('class', 'dynamic-text ' + textClassName);
    textElement.setAttribute('transform', `rotate(${rotation})`);
    textElement.textContent = text;
    group.appendChild(circle);
    group.appendChild(textElement);

    // 對整個群組裡的文字和圓圈套用動畫
    applyStarAnimation(textElement);
    applyStarAnimation(circle); // 讓圓圈也跟著閃爍

    dynamicGroup.appendChild(group);
}
function clearDynamicData() {
    if (dynamicGroup) {
        dynamicGroup.innerHTML = '';
    }
}
function addCenterText(text, coords, className) {
    if (!text || !coords) return;
    const textElement = document.createElementNS(SVG_NS, 'text');
    textElement.setAttribute('x', coords.x);
    textElement.setAttribute('y', coords.y);
    textElement.setAttribute('class', `dynamic-text ${className}`);
    textElement.textContent = text;
    textElement.setAttribute('style', 'writing-mode: horizontal-tb;');
    applyStarAnimation(textElement); // <--- 注入動畫
    dynamicGroup.appendChild(textElement);
}

// ▼▼▼ 【新增】繪製空亡扇形背景函式 ▼▼▼
function drawKongWangSector(palaceBranch) {
    const palaceId = BRANCH_TO_PALACE_ID[palaceBranch];
    if (!palaceId) return;

    let centerAngle = RADIAL_LAYOUT.angles[palaceId];
    if (centerAngle === undefined) return;

    // 讀取微調設定
    const manualOffset = KONG_WANG_OFFSET_CONFIG[palaceBranch] || 0;
    centerAngle += manualOffset;

    // 設定扇形參數 (收窄一點，避免蓋到旁邊)
    const halfSlice = 11.2; 
    const startAngle = centerAngle - halfSlice;
    const endAngle = centerAngle + halfSlice;

    const innerRadius = 42;  
    const outerRadius = 132; // 決定扇形到哪裡「結束」(外圈半徑) 

    const toRad = (deg) => deg * (Math.PI / 180); 
    
    const x1 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(startAngle));
    const y1 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(startAngle));
    
    const x2 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(startAngle));
    const y2 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(startAngle));
    
    const x3 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(endAngle));
    const y3 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(endAngle));
    
    const x4 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(endAngle));
    const y4 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(endAngle));

    const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;

    const pathElement = document.createElementNS(SVG_NS, 'path');
    pathElement.setAttribute('d', pathData);
    // 注意：這裡只設 'kong-wang-bg'，不要預設 'star-visible'，讓動畫函式去加
    pathElement.setAttribute('class', 'kong-wang-bg'); 
    
    applyStarAnimation(pathElement);

    // 畫在最底層
    dynamicGroup.insertBefore(pathElement, dynamicGroup.firstChild);
}

// ▼▼▼ 繪製流年感應扇形並綁定互動事件 (最終修復版) ▼▼▼
function drawActivationSectors(activations, targetYear) {
    if (!activations || activations.length === 0) return;

    const tooltip = document.getElementById('taiyi-tooltip');
    if (!tooltip) {
        console.error("找不到 #taiyi-tooltip 容器，請確認 HTML 是否有加入！");
        return;
    }

    // 1. 將感應結果按照「宮位(地支)」分組
    const groups = {};
    activations.forEach(a => {
        const branch = a.branch; // 例如 '寅'
        if (!groups[branch]) groups[branch] = [];
        groups[branch].push(a);
    });

    // 2. 針對每個有感應的宮位，畫出扇形
    for (const branch in groups) {
        const palaceId = BRANCH_TO_PALACE_ID[branch];
        if (!palaceId) continue;

        let centerAngle = RADIAL_LAYOUT.angles[palaceId];
        if (centerAngle === undefined) continue;

        // 讀取微調設定 (保持對齊)
        const manualOffset = KONG_WANG_OFFSET_CONFIG[branch] || 0;
        centerAngle += manualOffset;

        // 扇形的參數
        const halfSlice = 11.2;  // 決定扇形的「寬度/角度」
        const startAngle = centerAngle - halfSlice;
        const endAngle = centerAngle + halfSlice;
        const innerRadius = 280;  // 決定扇形從哪裡「開始」(內圈半徑) 
        const outerRadius = 352; // 決定扇形到哪裡「結束」(外圈半徑)
        const toRad = (deg) => deg * (Math.PI / 180); 
        
        // 計算 SVG 路徑的四個頂點
        const x1 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(startAngle));
        const y1 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(startAngle));
        const x2 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(startAngle));
        const y2 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(startAngle));
        const x3 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(endAngle));
        const y3 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(endAngle));
        const x4 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(endAngle));
        const y4 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(endAngle));

        const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;

        // 建立 SVG path 元素
        const pathElement = document.createElementNS(SVG_NS, 'path');
        pathElement.setAttribute('d', pathData);
        // 設定 Class，這會連接到我們在 CSS 寫的樣式
        pathElement.setAttribute('class', 'activation-sector star-visible'); 
        
        // --- 準備 Tooltip 內容 ---
        const infoList = groups[branch];
        const palaceName = infoList[0].natalPalace; // 例如 '官祿宮'
        // ▼▼▼ 【修改點】：讓 Tooltip 裡的星曜名稱也變成翡翠綠加粗 ▼▼▼
        const starTextList = infoList.map(i => `<span style="color: #008a00; font-weight: bold;">${i.starName}</span>(${i.roleName})`).join('、');
        const isSuperActive = infoList.length >= 3;

        let contentHtml = `<strong style="color:#0056b3; font-size:15px;">【${targetYear}年度流年感應】</strong>\n`;
        contentHtml += `<span style="color:#d32f2f; font-weight:bold;">${palaceName}</span>：被年盤 ${starTextList} 入此宮位引動！`;
        if (isSuperActive) {
            contentHtml += `\n<span style="color:#d32f2f; font-size:12px; font-weight:bold;">(＊此宮能量極強，代表該領域今年將有重大突破或變動！)</span>`;
        }

        // --- 綁定滑鼠互動事件 ---
        pathElement.addEventListener('mouseenter', () => {
            tooltip.innerHTML = contentHtml;
            tooltip.style.display = 'block';
        });

        pathElement.addEventListener('mousemove', (e) => {
            // 讓提示框跟著滑鼠走，並保持一點距離以免擋到游標
            tooltip.style.left = (e.pageX + 15) + 'px';
            tooltip.style.top = (e.pageY + 15) + 'px';
        });

        pathElement.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // 將扇形畫在 dynamicGroup 的最底層（以免蓋住文字）
        dynamicGroup.insertBefore(pathElement, dynamicGroup.firstChild);
    }
}

// ▼▼▼ 新增：繪製本命日柱化曜扇形 ▼▼▼
function drawDayActivationSectors(dayActivations) {
    if (!dayActivations || dayActivations.length === 0) return;
    const tooltip = document.getElementById('taiyi-tooltip');
    if (!tooltip) return;

    const groups = {};
    dayActivations.forEach(a => {
        const branch = a.branch;
        if (!groups[branch]) groups[branch] = [];
        groups[branch].push(a);
    });

    for (const branch in groups) {
        const palaceId = BRANCH_TO_PALACE_ID[branch];
        if (!palaceId) continue;
        let centerAngle = RADIAL_LAYOUT.angles[palaceId];
        if (centerAngle === undefined) continue;

        const manualOffset = KONG_WANG_OFFSET_CONFIG[branch] || 0;
        centerAngle += manualOffset;

        const halfSlice = 11.2; 
        const innerRadius = 92;  
        const outerRadius = 250; 
        const toRad = (deg) => deg * (Math.PI / 180); 
        
        const x1 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(centerAngle - halfSlice));
        const y1 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(centerAngle - halfSlice));
        const x2 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(centerAngle - halfSlice));
        const y2 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(centerAngle - halfSlice));
        const x3 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(centerAngle + halfSlice));
        const y3 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(centerAngle + halfSlice));
        const x4 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(centerAngle + halfSlice));
        const y4 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(centerAngle + halfSlice));

        const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;
        const pathElement = document.createElementNS(SVG_NS, 'path');
        pathElement.setAttribute('d', pathData);

        // ▼▼▼ 核心邏輯：判斷是否有凶星 (忌星或鬼星) ▼▼▼
        const infoList = groups[branch];
        const hasBadStar = infoList.some(i => i.roleName.includes('忌星') || i.roleName.includes('鬼星'));

        if (hasBadStar) {
            pathElement.setAttribute('class', 'day-activation-sector-bad star-visible'); // 淡粉紅
        } else {
            pathElement.setAttribute('class', 'day-activation-sector-good star-visible'); // 淡天藍
        }
        
        // 準備 Tooltip 內容
        const palaceName = infoList[0].natalPalace;
        const starTextList = infoList.map(i => {
            const isBad = i.roleName.includes('忌星') || i.roleName.includes('鬼星');
            const color = isBad ? '#d32f2f' : '#0056b3'; // 凶星紅字，吉星藍字
            return `<span style="color: ${color}; font-weight: bold;">${i.starName}</span>(${i.roleName})`;
        }).join('、');

        let contentHtml = `<strong style="color:#0056b3; font-size:15px;">【本命日柱化曜】</strong>\n`;
        contentHtml += `<span style="color:#333; font-weight:bold;">${palaceName}</span>：匯聚 ${starTextList}！`;

        pathElement.addEventListener('mouseenter', () => { tooltip.innerHTML = contentHtml; tooltip.style.display = 'block'; });
        pathElement.addEventListener('mousemove', (e) => { tooltip.style.left = (e.pageX + 15) + 'px'; tooltip.style.top = (e.pageY + 15) + 'px'; });
        pathElement.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });

        dynamicGroup.insertBefore(pathElement, dynamicGroup.firstChild);
    }
}

// ▼▼▼ 新增：繪製流日感應扇形 (填補中圈 200~280，吉凶雙色版) ▼▼▼
function drawTransitDaySectors(transitActivations, targetMonth, targetDay) {
    if (!transitActivations || transitActivations.length === 0) return;
    const tooltip = document.getElementById('taiyi-tooltip');
    if (!tooltip) return;

    const groups = {};
    transitActivations.forEach(a => {
        const branch = a.branch;
        if (!groups[branch]) groups[branch] = [];
        groups[branch].push(a);
    });

    for (const branch in groups) {
        const palaceId = BRANCH_TO_PALACE_ID[branch];
        if (!palaceId) continue;
        let centerAngle = RADIAL_LAYOUT.angles[palaceId];
        if (centerAngle === undefined) continue;

        const manualOffset = KONG_WANG_OFFSET_CONFIG[branch] || 0;
        centerAngle += manualOffset;

        const halfSlice = 11.2; 
        const innerRadius = 250;  
        const outerRadius = 280;  
        const toRad = (deg) => deg * (Math.PI / 180); 
        
        const x1 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(centerAngle - halfSlice));
        const y1 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(centerAngle - halfSlice));
        const x2 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(centerAngle - halfSlice));
        const y2 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(centerAngle - halfSlice));
        const x3 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(centerAngle + halfSlice));
        const y3 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(centerAngle + halfSlice));
        const x4 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(centerAngle + halfSlice));
        const y4 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(centerAngle + halfSlice));

        const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;
        const pathElement = document.createElementNS(SVG_NS, 'path');
        pathElement.setAttribute('d', pathData);
        
        // ▼▼▼ 判斷是否含有凶星，並套用對應顏色的 Class ▼▼▼
        const infoList = groups[branch];
        const hasBadStar = infoList.some(i => i.roleName.includes('忌星') || i.roleName.includes('鬼星'));

        if (hasBadStar) {
            pathElement.setAttribute('class', 'transit-activation-sector-bad star-visible');
        } else {
            pathElement.setAttribute('class', 'transit-activation-sector-good star-visible');
        }
        
        // 準備 Tooltip 內容 (文字顏色也同步變更)
        const palaceName = infoList[0].natalPalace;
        const starTextList = infoList.map(i => {
            const isBad = i.roleName.includes('忌星') || i.roleName.includes('鬼星');
            const color = isBad ? '#d32f2f' : '#008080'; // 凶星深紅，吉星深藍綠
            return `<span style="color: ${color}; font-weight: bold;">${i.starName}</span>(${i.roleName})`;
        }).join('、');

        const titleColor = hasBadStar ? '#ff69b4' : '#20b2aa'; // 標題顏色對應扇形顏色
        let contentHtml = `<strong style="color:${titleColor}; font-size:15px;">【${targetMonth}月${targetDay}日 流日推演】</strong>\n`;
        contentHtml += `<span style="color:#333; font-weight:bold;">${palaceName}</span>：被今日 ${starTextList} 引動！`;

        pathElement.addEventListener('mouseenter', () => { tooltip.innerHTML = contentHtml; tooltip.style.display = 'block'; });
        pathElement.addEventListener('mousemove', (e) => { tooltip.style.left = (e.pageX + 15) + 'px'; tooltip.style.top = (e.pageY + 15) + 'px'; });
        pathElement.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });

        dynamicGroup.appendChild(pathElement);
    }
}

// --- 繪圖主函式 (最終整理版) ---
function renderChart(mainData, palacesData, agesData, sdrData, centerData, outerRingData, xingNianData, yangJiuData, baiLiuData, baiLiuXiaoXianData, daYouZhenXianData, feiLuDaXianData, feiMaDaXianData, feiLuLiuNianData, feiMaLiuNianData, heiFuData, annualActivations, targetYear, dayActivations, transitActivations, transitMonth, transitDay) {    
    clearDynamicData();
        if (outerRingData) {
        const ringConfig = RADIAL_LAYOUT.outerRing;
        for (const palaceId in outerRingData) {
            if (ringConfig.palaces.includes(palaceId)) {
                const text = outerRingData[palaceId];
                const angle = RADIAL_LAYOUT.angles[palaceId];
                const angleRad = angle * (Math.PI / 180);
                const x = RADIAL_LAYOUT.center.x + ringConfig.radius * Math.cos(angleRad);
                const y = RADIAL_LAYOUT.center.y + ringConfig.radius * Math.sin(angleRad);
                addEncircledText(text, x, y, 0, 'main-info-style', 'highlight-circle');
            }
        }
    }
        
        if (centerData) {
            addCenterText(centerData.field1, RADIAL_LAYOUT.centerFields.field1, 'center-info-style');
            addCenterText(centerData.field2, RADIAL_LAYOUT.centerFields.field2, 'center-info-style');
            addCenterText(centerData.field3, RADIAL_LAYOUT.centerFields.field3, 'center-info-style');
            addCenterText(centerData.field4, RADIAL_LAYOUT.centerFields.field4, 'center-info-style');
        }
        for (const palaceKey in mainData) {
            if (!mainData[palaceKey]) continue;
            const centerAngle = RADIAL_LAYOUT.angles[palaceKey];
            const pData = mainData[palaceKey];
            if (centerAngle === undefined || !pData) continue;
            const angleLeft = centerAngle - RADIAL_LAYOUT.angleOffset;
            const angleCenter = centerAngle;
            const angleRight = centerAngle + RADIAL_LAYOUT.angleOffset;
            if (pData.lineLeft) {
                const getLineLeftClass = (starName) => {
                    if (starName === '定目') return 'ding-mu-style';
                    return 'main-info-style';
                };
                if (pData.lineLeft.fieldA) addRadialText(palaceKey, angleLeft, RADIAL_LAYOUT.radii.lineLeft.fieldA, pData.lineLeft.fieldA, getLineLeftClass(pData.lineLeft.fieldA));
                if (pData.lineLeft.fieldB) addRadialText(palaceKey, angleLeft, RADIAL_LAYOUT.radii.lineLeft.fieldB, pData.lineLeft.fieldB, getLineLeftClass(pData.lineLeft.fieldB));
                if (pData.lineLeft.fieldG) addRadialText(palaceKey, angleLeft, RADIAL_LAYOUT.radii.lineLeft.fieldG, pData.lineLeft.fieldG, getLineLeftClass(pData.lineLeft.fieldG));
            }
            if (pData.lineCenter) {
                const getLineCenterClass = (starName) => {
                    if (['君基', '臣基', '民基'].includes(starName)) return 'ji-star-style';
                    return 'sub-info-style';
                };
                if (pData.lineCenter.fieldC) addRadialText(palaceKey, angleCenter, RADIAL_LAYOUT.radii.lineCenter.fieldC, pData.lineCenter.fieldC, getLineCenterClass(pData.lineCenter.fieldC));
                if (pData.lineCenter.fieldD) addRadialText(palaceKey, angleCenter, RADIAL_LAYOUT.radii.lineCenter.fieldD, pData.lineCenter.fieldD, getLineCenterClass(pData.lineCenter.fieldD));
                if (pData.lineCenter.fieldC2) addRadialText(palaceKey, angleCenter, RADIAL_LAYOUT.radii.lineCenter.fieldC2, pData.lineCenter.fieldC2, getLineCenterClass(pData.lineCenter.fieldC2));
                if (pData.lineCenter.fieldD2) addRadialText(palaceKey, angleCenter, RADIAL_LAYOUT.radii.lineCenter.fieldD2, pData.lineCenter.fieldD2, getLineCenterClass(pData.lineCenter.fieldD2));
            }
            if (pData.lineRight) {
                const getLineRightClass = (starName) => {
                    if (starName === '小遊') return 'xiaoyou-style'; 
                    if (starName === '大遊') return 'dayou-style';
                    if (['天乙', '地乙', '四神', '飛符'].includes(starName)) return 'celestial-messenger-style';
                    if (starName === '皇恩星') return 'huang-en-style'; return 'deity-style';
                }; 
                if (pData.lineRight.fieldE) addRadialText(palaceKey, angleRight, RADIAL_LAYOUT.radii.lineRight.fieldE, pData.lineRight.fieldE, getLineRightClass(pData.lineRight.fieldE));
                if (pData.lineRight.fieldF) addRadialText(palaceKey, angleRight, RADIAL_LAYOUT.radii.lineRight.fieldF, pData.lineRight.fieldF, getLineRightClass(pData.lineRight.fieldF));
                if (pData.lineRight.fieldE2) addRadialText(palaceKey, angleRight, RADIAL_LAYOUT.radii.lineRight.fieldE2, pData.lineRight.fieldE2, getLineRightClass(pData.lineRight.fieldE2));
                if (pData.lineRight.fieldF2) addRadialText(palaceKey, angleRight, RADIAL_LAYOUT.radii.lineRight.fieldF2, pData.lineRight.fieldF2, getLineRightClass(pData.lineRight.fieldF2));
            }
            
        }
        // 繪製其他環圈
    addSingleCharRing(palacesData, RADIAL_LAYOUT.lifePalacesRing);
    addSdrRing(sdrData, RADIAL_LAYOUT.sdrRing);
    addRotatedRingText(agesData, RADIAL_LAYOUT.ageLimitRing);
    
    // ▼▼▼ 繪製月將十二神環圈 ▼▼▼
    if (mainData && mainData.yueJiangData) {
        addRotatedRingText(mainData.yueJiangData, RADIAL_LAYOUT.yueJiangRing);}

    // ▼▼▼ 繪製貴人十二神環圈 ▼▼▼
     if (mainData && mainData.guiRenData) {
         addRotatedRingText(mainData.guiRenData, RADIAL_LAYOUT.guiRenRing);}

    // ▼▼▼ 繪製行年歲數 ▼▼▼
    if (xingNianData) {
            // 1. 準備一份嚴格按照「子丑寅卯...」順序排列的歲數資料陣列
            const ageDataForRing = VALID_PALACES_CLOCKWISE.map(palaceId => {
                // 如果該宮位有歲數資料，就將其組合成字串，否則為空字串
                return xingNianData[palaceId] ? xingNianData[palaceId].ages.join('  ') : "";
            });
            
            // 2. 準備一份符合 addRotatedRingText 需求的設定檔
            const xingNianRingConfig = { 
                ...RADIAL_LAYOUT.xingNianRing, // 複製原本的 radius 設定
                palaces: VALID_PALACES_CLOCKWISE, // 吿訴它要按照「子丑寅卯...」的順序來畫
                className: 'xing-nian-style'      // 指定文字樣式
            };
            
            // 3. 呼叫正確的繪圖函式
            addRotatedRingText(ageDataForRing, xingNianRingConfig);
    }
    // ▼▼▼ 繪製陽九限 ▼▼▼
    if (yangJiuData && yangJiuData.palaceId) {
        const config = RADIAL_LAYOUT.yangJiuRing;
        const palaceId = yangJiuData.palaceId;
        const text = yangJiuData.text;
        const rotationOffset = config.rotationOffset || 0;
        const angle = RADIAL_LAYOUT.angles[palaceId] + rotationOffset;
        const angleRad = angle * (Math.PI / 180);
        const x = RADIAL_LAYOUT.center.x + config.radius * Math.cos(angleRad);
        const y = RADIAL_LAYOUT.center.y + config.radius * Math.sin(angleRad);
        let rotation = angle + 90;
        if (angle > 90 && angle < 270) { rotation = angle - 90; }
        if (config.flipPalaces.includes(palaceId)) { rotation += 180; }
        const textElement = document.createElementNS(SVG_NS, 'text');
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'central');
        textElement.setAttribute('class', `dynamic-text ${config.className}`);
        textElement.setAttribute('style', 'writing-mode: horizontal-tb;');
        textElement.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
        textElement.textContent = text;
        applyStarAnimation(textElement); // <--- 注入動畫
        dynamicGroup.appendChild(textElement);
    }
    // ▼▼▼ 繪製百六限 ▼▼▼
    if (baiLiuData && baiLiuData.palaceId) {
        const config = RADIAL_LAYOUT.baiLiuRing;
        const palaceId = baiLiuData.palaceId; // <-- 已修正
        const text = baiLiuData.text;         // <-- 已修正
        const rotationOffset = config.rotationOffset || 0;
        const angle = RADIAL_LAYOUT.angles[palaceId] + rotationOffset;
        const angleRad = angle * (Math.PI / 180);
        const x = RADIAL_LAYOUT.center.x + config.radius * Math.cos(angleRad);
        const y = RADIAL_LAYOUT.center.y + config.radius * Math.sin(angleRad);
        let rotation = angle + 90;
        if (angle > 90 && angle < 270) { rotation = angle - 90; }
        if (config.flipPalaces.includes(palaceId)) { rotation += 180; }
        const textElement = document.createElementNS(SVG_NS, 'text');
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'central');
        textElement.setAttribute('class', `dynamic-text ${config.className}`);
        textElement.setAttribute('style', 'writing-mode: horizontal-tb;');
        textElement.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
        textElement.textContent = text;
        applyStarAnimation(textElement); // <--- 注入動畫
        dynamicGroup.appendChild(textElement);
    }
    // ▼▼▼ 繪製百六小限 ▼▼▼
    if (baiLiuXiaoXianData) {
        // 1. 將計算結果整理成繪圖函式需要的格式 (一個12元素的陣列)
        const displayData = VALID_PALACES_CLOCKWISE.map(palaceId => {
            // 如果某個宮位有歲數資料，就把它們用空格連接起來，否則留空
            return baiLiuXiaoXianData[palaceId] ? baiLiuXiaoXianData[palaceId].join(' ') : "";
        });

        // 2. 準備設定檔，告訴繪圖函式使用哪個環圈設定、以及資料要對應到哪個宮位
        const ringConfig = { 
            ...RADIAL_LAYOUT.baiLiuXiaoXianRing, // 複製我們在第一區的設定
            palaces: VALID_PALACES_CLOCKWISE     // 告訴它要按照「子丑寅卯...」的順序來畫
        };
        
        // 3. 呼叫我們現有的、強大的 addRotatedRingText 工具函式來繪製
        addRotatedRingText(displayData, ringConfig);
    }
    // ▼▼▼ 繪製大遊真限 (最多三個) ▼▼▼
    if (daYouZhenXianData && daYouZhenXianData.length > 0) {
        const config = RADIAL_LAYOUT.daYouZhenXianRing;

        daYouZhenXianData.forEach(item => {
            if (!item || !item.palaceId) return;

            const palaceId = item.palaceId;
            const text = item.text;
            
            const rotationOffset = config.rotationOffset || 0;
            const angle = RADIAL_LAYOUT.angles[palaceId] + rotationOffset;
            
            const angleRad = angle * (Math.PI / 180);
            const x = RADIAL_LAYOUT.center.x + config.radius * Math.cos(angleRad);
            const y = RADIAL_LAYOUT.center.y + config.radius * Math.sin(angleRad);

            let rotation = angle + 90;
            if (angle > 90 && angle < 270) { rotation = angle - 90; }
            if (config.flipPalaces.includes(palaceId)) { rotation += 180; }
            
            const textElement = document.createElementNS(SVG_NS, 'text');
            textElement.setAttribute('x', x);
            textElement.setAttribute('y', y);
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('dominant-baseline', 'central');
            textElement.setAttribute('class', `dynamic-text ${config.className}`);
            textElement.setAttribute('style', 'writing-mode: horizontal-tb;');
            textElement.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
            textElement.textContent = text;
            applyStarAnimation(textElement); // <--- 注入動畫
            dynamicGroup.appendChild(textElement);
        });
    }
    // ▼▼▼ 繪製飛祿大限 (最多三個) ▼▼▼
    if (feiLuDaXianData && feiLuDaXianData.length > 0) {
        const config = RADIAL_LAYOUT.feiLuDaXianRing;

        feiLuDaXianData.forEach(item => {
            if (!item || !item.palaceId) return;
            const { palaceId, text } = item;
            
            const rotationOffset = config.rotationOffset || 0;
            const angle = RADIAL_LAYOUT.angles[palaceId] + rotationOffset;
            
            const angleRad = angle * (Math.PI / 180);
            const x = RADIAL_LAYOUT.center.x + config.radius * Math.cos(angleRad);
            const y = RADIAL_LAYOUT.center.y + config.radius * Math.sin(angleRad);

            let rotation = angle + 90;
            if (angle > 90 && angle < 270) { rotation = angle - 90; }
            if (config.flipPalaces.includes(palaceId)) { rotation += 180; }
            
            const textElement = document.createElementNS(SVG_NS, 'text');
            textElement.setAttribute('x', x);
            textElement.setAttribute('y', y);
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('dominant-baseline', 'central');
            textElement.setAttribute('class', `dynamic-text ${config.className}`);
            textElement.setAttribute('style', 'writing-mode: horizontal-tb;');
            textElement.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
            textElement.textContent = text;
            applyStarAnimation(textElement); // <--- 注入動畫
            dynamicGroup.appendChild(textElement);
        });
    }
    // ▼▼▼ 繪製飛馬大限 (最多三個) ▼▼▼
    if (feiMaDaXianData && feiMaDaXianData.length > 0) {
        const config = RADIAL_LAYOUT.feiMaDaXianRing;

        feiMaDaXianData.forEach(item => {
            if (!item || !item.palaceId) return;
            const { palaceId, text } = item;
            
            const rotationOffset = config.rotationOffset || 0;
            const angle = RADIAL_LAYOUT.angles[palaceId] + rotationOffset;
            
            const angleRad = angle * (Math.PI / 180);
            const x = RADIAL_LAYOUT.center.x + config.radius * Math.cos(angleRad);
            const y = RADIAL_LAYOUT.center.y + config.radius * Math.sin(angleRad);

            let rotation = angle + 90;
            if (angle > 90 && angle < 270) { rotation = angle - 90; }
            if (config.flipPalaces.includes(palaceId)) { rotation += 180; }
            
            const textElement = document.createElementNS(SVG_NS, 'text');
            textElement.setAttribute('x', x);
            textElement.setAttribute('y', y);
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('dominant-baseline', 'central');
            textElement.setAttribute('class', `dynamic-text ${config.className}`);
            textElement.setAttribute('style', 'writing-mode: horizontal-tb;');
            textElement.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
            textElement.textContent = text;
            applyStarAnimation(textElement); // <--- 注入動畫
            dynamicGroup.appendChild(textElement);
        });
    }
    // ▼▼▼ 繪製飛祿流年 ▼▼▼
    if (feiLuLiuNianData && feiLuLiuNianData.length > 0) {
        const config = RADIAL_LAYOUT.feiLuLiuNianRing;
        feiLuLiuNianData.forEach(item => {
            if (!item || !item.palaceId) return;
            const { palaceId, text } = item;
            // (以下繪圖邏輯與其他環圈完全相同)
            const rotationOffset = config.rotationOffset || 0;
            const angle = RADIAL_LAYOUT.angles[palaceId] + rotationOffset;
            const angleRad = angle * (Math.PI / 180);
            const x = RADIAL_LAYOUT.center.x + config.radius * Math.cos(angleRad);
            const y = RADIAL_LAYOUT.center.y + config.radius * Math.sin(angleRad);
            let rotation = angle + 90;
            if (angle > 90 && angle < 270) { rotation = angle - 90; }
            if (config.flipPalaces.includes(palaceId)) { rotation += 180; }
            const textElement = document.createElementNS(SVG_NS, 'text');
            textElement.setAttribute('x', x); textElement.setAttribute('y', y);
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('dominant-baseline', 'central');
            textElement.setAttribute('class', `dynamic-text ${config.className}`);
            textElement.setAttribute('style', 'writing-mode: horizontal-tb;');
            textElement.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
            textElement.textContent = text;
            applyStarAnimation(textElement); // <--- 注入動畫
            dynamicGroup.appendChild(textElement);
        });
    }
    // ▼▼▼ 繪製飛馬流年 ▼▼▼
    if (feiMaLiuNianData && feiMaLiuNianData.length > 0) {
        const config = RADIAL_LAYOUT.feiMaLiuNianRing;
        feiMaLiuNianData.forEach(item => {
            if (!item || !item.palaceId) return;
            const { palaceId, text } = item;
            
            const rotationOffset = config.rotationOffset || 0;
            const angle = RADIAL_LAYOUT.angles[palaceId] + rotationOffset;
            
            // (以下繪圖邏輯與其他環圈完全相同)
            const angleRad = angle * (Math.PI / 180);
            const x = RADIAL_LAYOUT.center.x + config.radius * Math.cos(angleRad);
            const y = RADIAL_LAYOUT.center.y + config.radius * Math.sin(angleRad);
            let rotation = angle + 90;
            if (angle > 90 && angle < 270) { rotation = angle - 90; }
            if (config.flipPalaces.includes(palaceId)) { rotation += 180; }
            const textElement = document.createElementNS(SVG_NS, 'text');
            textElement.setAttribute('x', x); textElement.setAttribute('y', y);
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('dominant-baseline', 'central');
            textElement.setAttribute('class', `dynamic-text ${config.className}`);
            textElement.setAttribute('style', 'writing-mode: horizontal-tb;');
            textElement.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
            textElement.textContent = text;
            applyStarAnimation(textElement); // <--- 注入動畫
            dynamicGroup.appendChild(textElement);
    
        });
    }
    // ▼▼▼ 繪製黑符流年 ▼▼▼
    if (heiFuData) {
        // 1. 將計算結果整理成繪圖函式需要的格式
        const displayData = VALID_PALACES_CLOCKWISE.map(palaceId => {
            const ages = heiFuData[palaceId];
            // 在數字前面加上前綴「黑」
            return ages ? ages.map(age => `黑${age}`).join(' ') : "";
        });

        // 2. 準備設定檔
        const ringConfig = { 
            ...RADIAL_LAYOUT.heiFuRing,
            palaces: VALID_PALACES_CLOCKWISE
        };
        
        // 3. 呼叫工具函式來繪製
        addRotatedRingText(displayData, ringConfig);
        
    }

    // 原本已經有的：呼叫「流年」感應扇形
    drawActivationSectors(annualActivations, targetYear);

    // ▼▼▼ 新增這行：呼叫我們剛寫好的「日柱」化曜扇形 ▼▼▼
    drawDayActivationSectors(dayActivations);

    // ▼▼▼ 新增這行：呼叫流日扇形 ▼▼▼
    drawTransitDaySectors(transitActivations, transitMonth, transitDay);

}

// ▼▼▼ 繪製運勢趨勢圖的函式 (最終穩定版) ▼▼▼
let fortuneChartInstance = null;
function renderFortuneChart(ageLabels, scoreData, overlapFlags) {
    const ctx = document.getElementById('fortune-chart').getContext('2d');

    if (fortuneChartInstance) {
        fortuneChartInstance.destroy();
    }

    // 根據傳入的數據，動態決定圖表標題
    const selectedMode = document.querySelector('input[name="chart-mode"]:checked')?.value || 'mingGong';
    let chartTitle = '人生能量趨勢';
    switch(selectedMode) {
        case 'annual': chartTitle = '人生能量趨勢 (行年)'; break;
        case 'daYou': chartTitle = '人生能量趨勢 (大遊真限)'; break;
        case 'baiLiu': chartTitle = '人生能量趨勢 (百六大限)'; break;
        case 'yangJiu': chartTitle = '人生能量趨勢 (陽九限)'; break;
    }

    fortuneChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ageLabels,
            datasets: [{
                label: chartTitle, // 使用動態標題
                data: scoreData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true,
                // 我們將自訂數據儲存在這裡
                customData: overlapFlags
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { // ▼▼▼ 唯一的修改點：新增 X 軸的設定 ▼▼▼
                    ticks: {
                        autoSkip: true, // 允許自動跳過標籤以避免重疊
                        maxTicksLimit: 18 // 最多顯示約 15 個標籤
                    }
                },
                y: {beginAtZero: false}
            },
        plugins: {
                    tooltip: {
                        callbacks: {
                            // footer callback 會在 tooltip 的最下方增加額外文字
                            footer: function(tooltipItems) {
                                const tooltipItem = tooltipItems[0];
                                if (!tooltipItem) return '';

                                // 從 customData 中讀取我們儲存的標記
                                const isOverlap = tooltipItem.dataset.customData[tooltipItem.dataIndex];
                                if (isOverlap) {
                                    return '\n⭐ 大遊星與大遊真限同宮！'; // 返回要顯示的特殊訊息
                                }
                                return '';
                            }
                        }
                    }
                }
            }
        });
}
    

    // =================================================================
    //  SECTION 3: 核心演算法 (整合新功能)
    // =================================================================
    function determineDirection(yearStem, gender) {
        const yangStems = ['甲', '丙', '戊', '庚', '壬'];
        const isYangYear = yangStems.includes(yearStem);
        return ((isYangYear && gender === '男') || (!isYangYear && gender === '女')) ? 'clockwise' : 'counter-clockwise';
    }
    function findPalaceByCounting(yearBranch, countFromBranch, countToBranch, direction) {
        const startPalaceId = BRANCH_TO_PALACE_ID[yearBranch];
        const startIndex = VALID_PALACES_CLOCKWISE.indexOf(startPalaceId);
        if (startIndex === -1) return undefined;
        let fromIndex = EARTHLY_BRANCHES.indexOf(countFromBranch);
        let toIndex = EARTHLY_BRANCHES.indexOf(countToBranch);
        if (fromIndex === -1 || toIndex === -1) return undefined;
        let steps = toIndex - fromIndex;
        if (steps < 0) steps += 12;
        let finalIndex;
        if (direction === 'clockwise') {
            finalIndex = (startIndex + steps) % 12;
        } else {
            finalIndex = (startIndex - steps + 12 * 12) % 12;
        }
        return VALID_PALACES_CLOCKWISE[finalIndex];
    }
    function arrangeLifePalaces(lifePalaceId, direction) {
        const lifePalaceIndexInValid = VALID_PALACES_CLOCKWISE.indexOf(lifePalaceId);
        const arranged = new Array(12).fill("");
        for (let i = 0; i < 12; i++) {
            let targetIndex;
            if (direction === 'clockwise') {
                targetIndex = (lifePalaceIndexInValid + i) % 12;
            } else {
                targetIndex = (lifePalaceIndexInValid - i + 12 * 12) % 12;
            }
            arranged[targetIndex] = LIFE_PALACE_NAMES[i];
        }
        return arranged;
    }
    function calculateSdrPalaces(data, direction) {
        const yearBranch = data.yearPillar.charAt(1);
        const monthBranch = data.monthPillar.charAt(1);
        const dayBranch = data.dayPillar.charAt(1);
        const hourBranch = data.hourPillar.charAt(1);
        const shenPalace = findPalaceByCounting(yearBranch, monthBranch, dayBranch, direction);
        const riPalace = BRANCH_TO_PALACE_ID[dayBranch];
        const shiPalace = BRANCH_TO_PALACE_ID[hourBranch];
        const result = {};
        if (shenPalace) { if (!result[shenPalace]) result[shenPalace] = []; result[shenPalace].push('身'); }
        if (riPalace) { if (!result[riPalace]) result[riPalace] = []; result[riPalace].push('日'); }
        if (shiPalace) { if (!result[shiPalace]) result[shiPalace] = []; result[shiPalace].push('時'); }
        return result;
    }
    function arrangeAgeLimits(arrangedLifePalaces) {
        const newAgeLimits = new Array(12).fill("");
        arrangedLifePalaces.forEach((palaceName, index) => {
            const originalIndex = LIFE_PALACE_NAMES.indexOf(palaceName);
            if (originalIndex !== -1) {
                newAgeLimits[index] = AGE_LIMIT_DATA[originalIndex];
            }
        });
        return newAgeLimits;
    }
    function lookupBureauData(bureau) {
        return BUREAU_DATA.find(item => item.局 === bureau) || null;
    }
    function calculateDeities(bureau, hourBranch) {
        if (!bureau || !hourBranch) return {};
        const isYinBureau = bureau.startsWith('陰');
        const bureauType = isYinBureau ? '陰局' : '陽局';
        const rule = DEITY_RULES_DATA.find(r => r.陰陽局 === bureauType && r.時支 === hourBranch);

        if (rule) {
            return { '太歲': rule.太歲, '合神': rule.合神, '計神': rule.計神 };
        }
        return {};
    }
    function calculateSuanStars(lookupResult) {
    const result = { chartStars: {}, centerStars: [] };
    if (!lookupResult) { // 安全檢查：如果查表失敗，直接回傳空結果
        return result;
    }
    const suanMap = {
        '主': lookupResult.主算,
        '客': lookupResult.客算,
        '定': lookupResult.定算
    };

    for (const prefix in suanMap) {
        const suanValue = suanMap[prefix];
        const lastDigit = String(suanValue).slice(-1);
        const rule = SUAN_DIGIT_RULES[lastDigit];
        
        if (rule) {
            if (rule.Da === '中') {
                result.centerStars.push(`${prefix}大`);
            } else {
                result.chartStars[`${prefix}大`] = rule.Da;
            }
            if (rule.Can === '中') {
                result.centerStars.push(`${prefix}參`);
            } else {
                result.chartStars[`${prefix}參`] = rule.Can;
            }
        }
    }
    return result;
    }
    function calculateShiWuFu(hourJishu) {
    if (!hourJishu) {
        return null; // 如果沒有時積數，就直接返回
    }

    // 1. 將時積數除以 228，取餘數
    let remainder = Number(hourJishu) % 228;

    // 2. 處理餘數為 0 的特殊情況
    // 根據您的規則，餘數為 0 代表剛好走完一圈，應視為在最後一格 (228)
    if (remainder === 0) {
        remainder = 228;
    }

    // 3. 根據餘數，計算出宮位的索引 (0-11)
    // 使用 (餘數 - 1) 是為了讓 1-19 都對應到索引 0，20-38 對應到索引 1，以此類推
    const palaceIndex = Math.floor((remainder - 1) / 19);

    // 4. 從專屬的宮位順序中，找到對應的地支
    if (palaceIndex < SHI_WU_FU_ORDER.length) {
        return SHI_WU_FU_ORDER[palaceIndex];
    }

    return null; // 如果計算出錯，返回 null
    }
    function calculateXiaoYou(hourJishu) {
        if (!hourJishu) {
            return null;
        }

        // 1. 將時積數除以 24，取餘數
        let remainder = Number(hourJishu) % 24;

        // 2. 處理餘數為 0 的特殊情況 (代表走到最後一宮)
        if (remainder === 0) {
            remainder = 24;
        }

        // 3. 根據餘數，每 3 個單位換一個宮位，計算出宮位索引 (0-7)
        const palaceIndex = Math.floor((remainder - 1) / 3);

        // 4. 從專屬的宮位順序中，找到對應的地支
        if (palaceIndex < XIAO_YOU_ORDER.length) {
            return XIAO_YOU_ORDER[palaceIndex];
        }

        return null;
    }
    function calculateJunJi(hourJishu) {
        if (!hourJishu) return null;
        let remainder = Number(hourJishu) % 360;
        if (remainder === 0) remainder = 360;
        const palaceIndex = Math.floor((remainder - 1) / 30);
        if (palaceIndex < JUN_CHEN_JI_ORDER.length) {
            return JUN_CHEN_JI_ORDER[palaceIndex];
        }
        return null;
    }
    function calculateChenJi(hourJishu) {
        if (!hourJishu) return null;
        let remainder = Number(hourJishu) % 36;
        if (remainder === 0) remainder = 36;
        const palaceIndex = Math.floor((remainder - 1) / 3);
        if (palaceIndex < JUN_CHEN_JI_ORDER.length) {
            return JUN_CHEN_JI_ORDER[palaceIndex];
        }
        return null;
    }
    function calculateMinJi(hourJishu) {
        if (!hourJishu) return null;
        let remainder = Number(hourJishu) % 12;
        if (remainder === 0) remainder = 12;
        const palaceIndex = Math.floor((remainder - 1) / 1);
        if (palaceIndex < MIN_JI_ORDER.length) {
            return MIN_JI_ORDER[palaceIndex];
        }
        return null;
    }
    function calculateTianYi(hourJishu) {
        if (!hourJishu) return null;
        let remainder = Number(hourJishu) % 36;
        if (remainder === 0) remainder = 36;
        const palaceIndex = Math.floor((remainder - 1) / 3);
        if (palaceIndex < TIAN_YI_ORDER.length) {
            return TIAN_YI_ORDER[palaceIndex];
        }
        return null;
    }
    function calculateDiYi(hourJishu) {
        if (!hourJishu) return null;
        let remainder = Number(hourJishu) % 36;
        if (remainder === 0) remainder = 36;
        const palaceIndex = Math.floor((remainder - 1) / 3);
        if (palaceIndex < DI_YI_ORDER.length) {
            return DI_YI_ORDER[palaceIndex];
        }
        return null;
    }
    function calculateSiShen(hourJishu) {
        if (!hourJishu) return null;
        let remainder = Number(hourJishu) % 36;
        if (remainder === 0) remainder = 36;
        const palaceIndex = Math.floor((remainder - 1) / 3);
        if (palaceIndex < SI_SHEN_ORDER.length) {
            return SI_SHEN_ORDER[palaceIndex];
        }
        return null;
    }
    function calculateFeiFu(hourJishu) {
        if (!hourJishu) return null;
        let remainder = Number(hourJishu) % 36;
        if (remainder === 0) remainder = 36;
        const palaceIndex = Math.floor((remainder - 1) / 3);
        if (palaceIndex < FEI_FU_ORDER.length) {
            return FEI_FU_ORDER[palaceIndex];
        }
        return null;
    }
    function calculateDaYou(hourJishu) {
        if (!hourJishu) return null;
        let remainder = Number(hourJishu) % 288;
        if (remainder === 0) remainder = 288;
        const palaceIndex = Math.floor((remainder - 1) / 36);
        if (palaceIndex < DA_YOU_ORDER.length) {
            return DA_YOU_ORDER[palaceIndex];
        }
        return null;
    }
    function calculateYueJiang(solarDate, hourBranch) {

        // --- 步驟 1: 根據「節氣期間」找出正確的起始月將 ---
        let termIndex = -1;
        for (let i = 23; i >= 0; i--) {
            const termTime = solarLunar.getTerm(solarDate.year, i + 1);
            if (solarDate.date.getTime() >= termTime) {
                termIndex = i;
                break;
            }
        }
        if (termIndex === -1) {
             const prevYearTermTime = solarLunar.getTerm(solarDate.year - 1, 24);
             if (solarDate.date.getTime() >= prevYearTermTime) { termIndex = 23; } 
             else { return new Array(12).fill(""); }
        }
        let generalTermIndex = termIndex;
        if (generalTermIndex % 2 === 0) { generalTermIndex = generalTermIndex - 1; }
        if (generalTermIndex < 0) { generalTermIndex = 23; }
        const monthlyGeneralName = MONTHLY_GENERALS_MAPPING[generalTermIndex];
        
        if (!monthlyGeneralName) return new Array(12).fill("");

        // --- 步驟 2: 找出月將和時支的起始位置 ---
        const startGeneralIndex = FULL_GENERALS_ORDER.indexOf(monthlyGeneralName);
        const startPalaceIndex = solarLunar.zhi.indexOf(hourBranch);
        if (startGeneralIndex === -1 || startPalaceIndex === -1) { return new Array(12).fill(""); }

        // --- 步驟 3: 逆時鐘排列 (已修正排序邏輯) ---
        const palaceToGeneralMap = {};
        for (let i = 0; i < 12; i++) { // i 對應地支的索引 (0=子, 1=丑...)
            const currentPalaceZhi = solarLunar.zhi[i];
            // 計算當前宮位(i)與起始宮位的「逆時鐘」距離
            const counterClockwiseOffset = (startPalaceIndex - i + 12) % 12;
            // 將這個距離應用到神將的順序上
            const generalIndex = (startGeneralIndex - counterClockwiseOffset + 12) % 12;
            palaceToGeneralMap[currentPalaceZhi] = FULL_GENERALS_ORDER[generalIndex];
        }
        
        // --- 步驟 4: 按照繪圖順序輸出結果 (結構不變) ---
        const drawingPalaceOrder = RADIAL_LAYOUT.yueJiangRing.palaces.map(pId => PALACE_ID_TO_BRANCH[pId]);
        const result = drawingPalaceOrder.map(zhi => palaceToGeneralMap[zhi] || "");

        return result;
    }
    // ▼▼▼ 根據生日自動計算日積數、日柱、日局數的函式 (最終修正版v2) ▼▼▼
    function calculateDailyValues(birthDate) {
    const year = birthDate.getFullYear();
    const birthTime = birthDate.getTime();

    const yearData = SOLSTICE_DATA[year];
    const prevYearData = SOLSTICE_DATA[year - 1];
    if (!yearData) return null;

    let referencePoint;
    let isCrossYear = false;

    if (birthTime >= yearData.winter.date.getTime()) {
        referencePoint = yearData.winter;
    } else if (birthTime >= yearData.summer.date.getTime()) {
        referencePoint = yearData.summer;
    } else if (prevYearData) {
        referencePoint = prevYearData.winter;
        isCrossYear = true;
    } else {
        return null;
    }

    const birthDayOnly = new Date(birthDate);
    birthDayOnly.setHours(0, 0, 0, 0);
    const referenceDayOnly = new Date(referencePoint.date);
    referenceDayOnly.setHours(0, 0, 0, 0);
    
    const dayDifference = Math.round((birthDayOnly - referenceDayOnly) / (1000 * 60 * 60 * 24));

    // 1. 計算日柱
    const startPillarIndex = JIAZI_CYCLE_ORDER.indexOf(referencePoint.dayPillar);
    if (startPillarIndex === -1) return null;
    const newPillarIndex = (startPillarIndex + dayDifference) % 60;
    const dayPillar = JIAZI_CYCLE_ORDER[newPillarIndex];

    // 2. 計算積數 (考慮立春校正)
    let jishuDayDifference = dayDifference;
    const lichunTime = solarLunar.getTerm(year, 3);
    const lichunDate = new Date(lichunTime);

    if (isCrossYear &&
        birthDate.getDate() === lichunDate.getUTCDate() &&
        birthDate.getMonth() === lichunDate.getUTCMonth() &&
        birthTime < lichunTime) {
        
        jishuDayDifference -= 1;
        console.log("偵錯：觸發「當日立春」校正，天數差減 1。");
    }

    // 【修改點】：這裡加上 + 1，讓顯示的日積數符合你的需求
    const dayJishu = referencePoint.dayJishu + jishuDayDifference + 1;

    const startBureau = referencePoint.dayBureau;
    const newBureauNum = ((startBureau - 1 + jishuDayDifference) % 72 + 72) % 72 + 1;
    const dayBureau = `陽${newBureauNum}局`;

    return {
        dayJishu: dayJishu,
        dayPillar: dayPillar,
        dayBureau: dayBureau
    };
    }
    // ▼▼▼ 根據生日自動計算積數與局數的整合型函式 (對接日積數 +1 版本) ▼▼▼
    function calculateJishuAndBureau(birthDate) {
    // 步驟 1: 先取得日積數的基礎資料
    const dailyValues = calculateDailyValues(birthDate);
    if (!dailyValues) return null;

    const hour = birthDate.getHours();
    // 從 dailyValues 中解構出 dayJishu (此為顯示用，已 +1) 以及日局
    const { dayJishu, dayPillar, dayBureau } = dailyValues;

    // 步驟 2: 計算精準時積數
    // 【核心修正】：因為傳入的 dayJishu 為了顯示需求已經先 +1
    // 我們在計算時必須先減 1 還原基準，否則時積數會多出 12 個單位
    let adjustedDayJishu = dayJishu - 1;

    // 處理夜子時 (23點) 的情況：
    // 在八字/奇門曆法中，23點後視為隔日的開始，所以積數要進位 +1
    if (hour === 23) {
        adjustedDayJishu += 1;
    }

    // 根據規則計算 1-12 的時辰序數 (子時為 1, 丑時為 2...)
    // 判斷邏輯：1-22點間使用 (hour+1)/2 取整數，其餘(23與0)為子時
    const hourIndex0Based = (hour >= 1 && hour < 23) ? Math.floor((hour + 1) / 2) : 0;
    const hourIncrement1Based = hourIndex0Based + 1;

    // 最終時積數 = (還原後的日積數 * 12) + 1至12的時辰數
    const hourJishu = (adjustedDayJishu * 12) + hourIncrement1Based;

    // 步驟 3: 根據時積數，反推時柱以供驗證
    // 公式：(數字 - 1) % 60 得到六十甲子陣列索引
    const hourPillarIndex = (hourJishu - 1 + 60) % 60; 
    const validatedHourPillar = JIAZI_CYCLE_ORDER[hourPillarIndex];

    // 步驟 4: 根據時積數和冬至/夏至，決定陰陽局數
    const year = birthDate.getFullYear();
    const yearData = SOLSTICE_DATA[year];
    if (!yearData) return null;

    let bureauType = '陽'; // 預設為陽局 (冬至後 ~ 夏至前)
    // 如果生日在當年夏至和冬至之間，則為陰局
    if (birthDate.getTime() >= yearData.summer.date.getTime() && birthDate.getTime() < yearData.winter.date.getTime()) {
        bureauType = '陰';
    }
    
    // 時局數計算：時積數對 72 取餘數 (餘 0 則為 72 局)
    const bureauRemainder = hourJishu % 72;
    const bureauNumber = (bureauRemainder === 0) ? 72 : bureauRemainder;
    const calculatedBureau = `${bureauType}${bureauNumber}局`;

    return {
        dayJishu: dayJishu,               // 這是顯示用的日積數 (含 +1)
        hourJishu: hourJishu,             // 這是計算出的正確時積數
        dayPillar: dayPillar,             // 日柱
        validatedHourPillar: validatedHourPillar, // 時柱
        calculatedBureau: calculatedBureau, // 這是「時局數」
        dayBureau: dayBureau               // 這是從第一層帶過來的「日局數」
    };
    }
    // ▼▼▼ 計算「八門」位置的函式▼▼▼
    function calculateOuterRingData(bureauResult, hourJishu, lookupResult) {
    // 安全檢查：如果缺少必要的資料，則不顯示八門
    if (!bureauResult || !hourJishu || !lookupResult || !lookupResult.太乙) {
        return {};
    }

    // --- 第一步：找出「值使門」---
    const isYinBureau = bureauResult.startsWith('陰');
    let remainder = Number(hourJishu) % 120;
    if (remainder === 0) {
        remainder = 120;
    }
    const leadingGateIndex = Math.floor((remainder - 1) / 30);
    
    let leadingGate;
    if (isYinBureau) {
        leadingGate = YIN_START_GATES[leadingGateIndex];
    } else {
        leadingGate = YANG_START_GATES[leadingGateIndex];
    }

    // --- 第二步：找出起始宮位 (太乙所在宮位) ---
    const startPalaceBranch = lookupResult.太乙;
    const startPalaceId = BRANCH_TO_PALACE_ID[startPalaceBranch];
    const outerRingPalaces = RADIAL_LAYOUT.outerRing.palaces; // 取得外圈八宮的順序

    // --- 第三步：將八門依序排入八宮 ---
    const startGateOrderIndex = EIGHT_GATES_ORDER.indexOf(leadingGate);
    const startPalaceOrderIndex = outerRingPalaces.indexOf(startPalaceId);

    const finalGates = {};
    if (startGateOrderIndex === -1 || startPalaceOrderIndex === -1) {
        return {}; // 如果找不到起始門或起始宮，則返回空
    }

    for (let i = 0; i < 8; i++) {
        const currentPalaceIndex = (startPalaceOrderIndex + i) % 8;
        const currentGateIndex = (startGateOrderIndex + i) % 8;

        const palaceId = outerRingPalaces[currentPalaceIndex];
        const gateName = EIGHT_GATES_ORDER[currentGateIndex];
        
        finalGates[palaceId] = gateName;
    }

    return finalGates;
    }
    // ▼▼▼ 計算「貴人十二神」位置的函式▼▼▼
    function calculateGuiRen(dayGan, hourBranch, yueJiangData) {
        const result = new Array(12).fill("");
        if (!dayGan || !hourBranch || !yueJiangData || yueJiangData.length === 0) {
            return result;
        }

        // --- 1. 根據日干和時支，找出貴人所跟隨的「月將」是誰 ---
        let targetYueJiang;
        if (GUI_REN_DAY_BRANCHES.includes(hourBranch)) {
            targetYueJiang = GUI_REN_YUE_JIANG_MAP[dayGan].day;
        } else if (GUI_REN_NIGHT_BRANCHES.includes(hourBranch)) {
            targetYueJiang = GUI_REN_YUE_JIANG_MAP[dayGan].night;
        } else {
            return result;
        }

        // --- 2. 在月將十二神的盤中，找到這個目標月將的位置 ---
        const yueJiangPalaceIndex = yueJiangData.indexOf(targetYueJiang);
        if (yueJiangPalaceIndex === -1) {
            return result;
        }

        // --- 3. 根據月將的位置，找到「貴人」的起始宮位地支 ---
        const noblemanPalaceId = RADIAL_LAYOUT.yueJiangRing.palaces[yueJiangPalaceIndex];
        const noblemanPalaceBranch = PALACE_ID_TO_BRANCH[noblemanPalaceId];

        // 將起始宮位地支，換算成標準的十二地支索引 (0-11)
        const noblemanStandardIndex = solarLunar.zhi.indexOf(noblemanPalaceBranch);
        if (noblemanStandardIndex === -1) {
            return result;
        }
        
        // --- 4. 判斷貴人落宮，決定排列方向 ---
        const direction = CLOCKWISE_PALACES.includes(noblemanPalaceBranch) ? 'clockwise' : 'counter-clockwise';

        // --- 5. 根據起始宮位和方向，排列剩下的11位神 ---
        const finalResult = new Array(12);
        for (let i = 0; i < 12; i++) { // i 代表十二神的順序 (0=貴人, 1=騰蛇...)
            let palaceIndex;
            if (direction === 'clockwise') {
                palaceIndex = (noblemanStandardIndex + i) % 12; // 使用標準索引來計算
            } else {
                palaceIndex = (noblemanStandardIndex - i + 12) % 12;
            }
            finalResult[palaceIndex] = GUI_REN_ORDER[i];
        }

        // 6. 最後，按照繪圖所需的特殊順序，重新整理結果
        const drawingPalaceOrder = RADIAL_LAYOUT.guiRenRing.palaces.map(pId => PALACE_ID_TO_BRANCH[pId]);
        return drawingPalaceOrder.map(zhi => finalResult[solarLunar.zhi.indexOf(zhi)] || "");
    }
    // ▼▼▼ 計算「皇恩星」位置的函式 ▼▼▼
    function calculateHuangEn(dayBranch) {
        if (!dayBranch) return null;
        return HUANG_EN_RULES[dayBranch] || null;
    } 
    // ▼▼▼ 計算行年歲數與干支的函式 ▼▼▼
    function calculateXingNian(gender, startAge, endAge) {
        const result = {};
        VALID_PALACES_CLOCKWISE.forEach(palaceId => {
            result[palaceId] = { ages: [], ganzhi: [] };
        });

        const startPalace = (gender === '男') ? '寅' : '申';
        const direction = (gender === '男') ? 1 : -1;
        const ganzhiSequence = (gender === '男') ? XINGNIAN_GANZHI_MALE : XINGNIAN_GANZHI_FEMALE;
        const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startPalace);

        // 確保我們只計算大於 0 歲的年齡
        const displayStartAge = Math.max(1, startAge);

        // 使用傳入的 startAge 和 endAge 來決定計算範圍
        for (let age = displayStartAge; age <= endAge; age++) {
            const offset = age - 1;
            const palaceIndex = (startPalaceIndex + offset * direction + 144) % 12;
            const palaceId = BRANCH_TO_PALACE_ID[EARTHLY_BRANCHES[palaceIndex]];
            
            if (result[palaceId]) {
                result[palaceId].ages.push(age);
                result[palaceId].ganzhi.push(ganzhiSequence[offset % 60]);
            }
        }
        return result;
    }
    // ▼▼▼ 計算所有年日化曜結果的函式 ▼▼▼
    function calculateAllHuaYao(yearStem, dayStem, dayBranch) {
        const results = {};

        // 1. 年干化曜
        const nianGanRule = NIAN_GAN_HUA_YAO[yearStem];
        if (nianGanRule) {
            results.nianGan = {
                tianYuan: nianGanRule.tianYuan.join(' '),
                ganYuan: nianGanRule.ganYuan.join(' '),
                fuMu: nianGanRule.fuMu.join(' ')
            };
        }

        // 2. 日干化曜
        const riGanRule = RI_GAN_HUA_YAO[dayStem];
        if (riGanRule) {
            results.riGan = {
                luZhu: riGanRule.luZhu.join(' ') || '無',
                pianLu: riGanRule.pianLu.join(' ') || '無',
                guanXing: riGanRule.guanXing.join(' ') || '無',
                qiCai: riGanRule.qiCai.join(' ') || '無',
                jiXing: riGanRule.jiXing.join(' ') || '無',
                guiXing: riGanRule.guiXing.join(' ') || '無'
            };
        }

        // 3. 日支化曜
        const riZhiRule = RI_ZHI_HUA_YAO[dayBranch];
        if (riZhiRule) {
            results.riZhi = {
                fuXing: riZhiRule.fuXing.join(' ')
            };
        }

        return results;
    }
    // ▼▼▼ 查找「當前」陽九限 (專供圓盤顯示) ▼▼▼
    function findCurrentYangJiuForDisplay(fullLimitArray, currentUserAge) {
    if (!fullLimitArray || !Array.isArray(fullLimitArray)) return null;
    const currentLimit = fullLimitArray.find(limit => {
        if (!limit.ageRange) return false;
        const [start, end] = limit.ageRange.split('-').map(Number);
        return currentUserAge >= start && currentUserAge <= end;
    });
    // 回傳繪圖函式看得懂的物件格式
    if (currentLimit) {
        return { palaceId: currentLimit.palaceId, text: `陽九${currentLimit.ageRange}` };
    }
    return null;
    }
    // ▼▼▼ 查找「當前」百六大限 (專供圓盤顯示) ▼▼▼
    function findCurrentBaiLiuForDisplay(fullLimitArray, currentUserAge) {
    if (!fullLimitArray || !Array.isArray(fullLimitArray)) return null;
    const currentLimit = fullLimitArray.find(limit => {
        if (!limit.ageRange) return false;
        const [start, end] = limit.ageRange.split('-').map(Number);
        return currentUserAge >= start && currentUserAge <= end;
    });
    // 回傳繪圖函式看得懂的物件格式
    if (currentLimit) {
        return { palaceId: currentLimit.palaceId, text: `百六${currentLimit.ageRange}` };
    }
    return null;
    }
    // ▼▼▼ 查找「當前及未來兩個」大遊真限 (專供圓盤顯示) ▼▼▼
    function findCurrentAndNextDaYouForDisplay(fullLimitArray, currentUserAge) {
    if (!fullLimitArray || !Array.isArray(fullLimitArray)) return [];
    const currentLimitIndex = fullLimitArray.findIndex(limit => {
        if (!limit.ageRange) return false;
        const [start, end] = limit.ageRange.split('-').map(Number);
        return currentUserAge >= start && currentUserAge <= end;
    });

    if (currentLimitIndex === -1) return [];

    const results = [];
    for (let i = 0; i < 3; i++) {
        const limitToShow = fullLimitArray[(currentLimitIndex + i) % fullLimitArray.length];
        if (limitToShow) {
            results.push({
                palaceId: limitToShow.palaceId,
                text: `大遊${limitToShow.ageRange}` // 組合好要顯示的文字
            });
        }
    }
    return results;
    }
    // ▼▼▼ 計算「陽九大限」(完整序列)的函式 ▼▼▼
    function calculateYangJiu(monthStem, gender) {
    const rule = YANG_JIU_RULES[monthStem];
    if (!rule) return [];
    const { startBranch, firstAge } = rule;
    const direction = (gender === '男') ? 1 : -1;
    const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startBranch);
    const limits = [];
    for (let i = 0; i < 12; i++) {
        const palaceIndex = (startPalaceIndex + i * direction + 144) % 12;
        const palaceId = VALID_PALACES_CLOCKWISE[palaceIndex];
        const ageStart = (i === 0) ? 1 : firstAge + ((i - 1) * 10) + 1;
        const ageEnd = (i === 0) ? firstAge : ageStart + 9;
        limits.push({ palaceId, ageRange: `${ageStart}-${ageEnd}` });
    }
    return limits;
    }
    // ▼▼▼ 計算「百六大限」(完整序列)的函式 ▼▼▼
    function calculateBaiLiuLimit(shouQiGong, gender) {
    if (!shouQiGong || !shouQiGong.palace) return [];
    const shouQiStem = shouQiGong.palace.charAt(0);
    const rule = YANG_JIU_RULES[shouQiStem];
    if (!rule) return [];
    const { startBranch, firstAge } = rule;
    const direction = (gender === '男') ? 1 : -1;
    const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startBranch);
    const limits = [];
    for (let i = 0; i < 12; i++) {
        const palaceIndex = (startPalaceIndex + i * direction + 144) % 12;
        const palaceId = VALID_PALACES_CLOCKWISE[palaceIndex];
        const ageStart = (i === 0) ? 1 : firstAge + ((i - 1) * 10) + 1;
        const ageEnd = (i === 0) ? firstAge : ageStart + 9;
        limits.push({ palaceId, ageRange: `${ageStart}-${ageEnd}` });
    }
    return limits;
    }
    // ▼▼▼ 計算「百六小限」(24年範圍)的函式 ▼▼▼
    function calculateBaiLiuXiaoXian(shouQiGong, gender, currentUserAge) {
    if (!shouQiGong || !shouQiGong.palace || currentUserAge === undefined) {
        return {};
    }

    const shouQiStem = shouQiGong.palace.charAt(0);
    const rule = BAI_LIU_XIAO_XIAN_RULES[shouQiStem];
    if (!rule) return {};

    const { startBranch, startAge } = rule;
    // 注意：這裡的方向和陽九/百六「大限」相反
    const direction = (gender === '男') ? -1 : 1; // 男逆女順
    const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startBranch);

    const results = {}; // 最終結果，例如：{ pMao: [50, 62], pChen: [51, 63], ... }

    // 根據您的要求，計算從過去5年到未來18年，共24年的資料
    for (let age = currentUserAge - 5; age <= currentUserAge + 18; age++) {
        if (age < 1) continue; // 我們只計算1歲以後的資料

        const ageOffset = age - startAge; // 計算與起始歲數的差距
        // 根據差距和方向，計算出該歲數落在哪個宮位
        const palaceIndex = (startPalaceIndex + ageOffset * direction + 144) % 12;
        const palaceId = VALID_PALACES_CLOCKWISE[palaceIndex];

        // 將歲數加入到對應宮位的列表中
        if (!results[palaceId]) {
            results[palaceId] = [];
        }
        results[palaceId].push(age);
    }
    return results;
    }
    // ▼▼▼ 計算「百六小限論月落宮」：從當歲百六小限宮起正月，男順女逆，一月一宮（月序以節氣換月：正月＝立春起）▼▼▼
    // 注意：這裡的方向是「男順女逆」，與百六小限本身（男逆女順）相反。
    function calculateBaiLiuLiuYue(baiLiuXiaoXianResult, gender, currentUserAge, chartModel, arrangedLifePalaces) {
        if (!baiLiuXiaoXianResult || currentUserAge === undefined) return [];
        // 1. 找出「當歲」落在百六小限的哪一宮，作為正月起宮
        let startPalaceId = null;
        for (const [palaceId, ages] of Object.entries(baiLiuXiaoXianResult)) {
            if (Array.isArray(ages) && ages.includes(currentUserAge)) { startPalaceId = palaceId; break; }
        }
        if (!startPalaceId) return [];
        const startIndex = VALID_PALACES_CLOCKWISE.indexOf(startPalaceId);
        if (startIndex === -1) return [];
        // 2. 男順女逆，一月一宮
        const direction = (gender === '男') ? 1 : -1;
        const MONTH_LABELS = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
        const results = [];
        for (let m = 0; m < 12; m++) {
            const palaceIndex = (startIndex + m * direction + 144) % 12;
            const palaceId = VALID_PALACES_CLOCKWISE[palaceIndex];
            const branch = EARTHLY_BRANCHES[palaceIndex];
            const lifePalaceName = (arrangedLifePalaces && arrangedLifePalaces[palaceIndex]) ? arrangedLifePalaces[palaceIndex] : '';
            // 3. 帶出該宮的飛星（本命星耀＋強旺＋化曜），供逐月吉凶判讀
            const stars = [];
            if (chartModel && chartModel[palaceId] && chartModel[palaceId].stars) {
                for (const [starName, starInfo] of Object.entries(chartModel[palaceId].stars)) {
                    stars.push({ name: starName, strength: starInfo.strength || '', huaYao: starInfo.huaYao || [] });
                }
            }
            results.push({ month: m + 1, monthLabel: MONTH_LABELS[m], palaceId, branch, lifePalaceName, stars });
        }
        return results;
    }
    // ▼▼▼ 計算「太乙小限」：受氣宮天干定起宮起歲（與百六小限共用規則表），順逆依天干陰陽分流 ▼▼▼
    // 陽干（甲丙戊庚壬）：男逆女順；陰干（乙丁己辛癸）：男順女逆。一年一宮，數至當歲。
    // 未及起歲者（如甲己5歲起午的1-4歲），以負偏移自起宮「反方向」逆推——Nakai 2026-08-30 確認此為正式規則。
    function calculateTaiYiXiaoXian(shouQiGong, gender, currentUserAge) {
        if (!shouQiGong || !shouQiGong.palace || currentUserAge === undefined) return null;
        const shouQiStem = shouQiGong.palace.charAt(0);
        const rule = BAI_LIU_XIAO_XIAN_RULES[shouQiStem]; // 起宮起歲表與百六小限相同
        if (!rule) return null;
        const { startBranch, startAge } = rule;
        const YANG_STEMS = ['甲', '丙', '戊', '庚', '壬'];
        const isYang = YANG_STEMS.includes(shouQiStem);
        // 陽干男逆女順；陰干男順女逆
        const direction = isYang
            ? ((gender === '男') ? -1 : 1)
            : ((gender === '男') ? 1 : -1);
        const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startBranch);
        // 當歲的太乙小限宮
        const currentIndex = (startPalaceIndex + (currentUserAge - startAge) * direction + 1440) % 12;
        // 同時輸出前5年～未來18年的逐歲落宮（與百六小限窗口一致，便於對照）
        const agesByPalace = {};
        for (let age = currentUserAge - 5; age <= currentUserAge + 18; age++) {
            if (age < 1) continue;
            const idx = (startPalaceIndex + (age - startAge) * direction + 1440) % 12;
            const pid = VALID_PALACES_CLOCKWISE[idx];
            if (!agesByPalace[pid]) agesByPalace[pid] = [];
            agesByPalace[pid].push(age);
        }
        return {
            shouQiStem, startBranch, startAge, direction,
            directionText: direction === 1 ? '順行' : '逆行',
            currentPalaceId: VALID_PALACES_CLOCKWISE[currentIndex],
            currentBranch: EARTHLY_BRANCHES[currentIndex],
            agesByPalace
        };
    }
    // ▼▼▼ 計算「小限月運」：從太乙小限宮起正月，方向與太乙小限相反（限順則月逆、限逆則月順），一月一宮（月序以節氣換月：正月＝立春起）▼▼▼
    function calculateXiaoXianYueYun(taiYiXiaoXianResult, chartModel, arrangedLifePalaces) {
        if (!taiYiXiaoXianResult || !taiYiXiaoXianResult.currentPalaceId) return [];
        const startIndex = VALID_PALACES_CLOCKWISE.indexOf(taiYiXiaoXianResult.currentPalaceId);
        if (startIndex === -1) return [];
        const direction = -taiYiXiaoXianResult.direction; // 與太乙小限相反
        const MONTH_LABELS = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
        const results = [];
        for (let m = 0; m < 12; m++) {
            const palaceIndex = (startIndex + m * direction + 144) % 12;
            const palaceId = VALID_PALACES_CLOCKWISE[palaceIndex];
            const branch = EARTHLY_BRANCHES[palaceIndex];
            const lifePalaceName = (arrangedLifePalaces && arrangedLifePalaces[palaceIndex]) ? arrangedLifePalaces[palaceIndex] : '';
            const stars = [];
            if (chartModel && chartModel[palaceId] && chartModel[palaceId].stars) {
                for (const [starName, starInfo] of Object.entries(chartModel[palaceId].stars)) {
                    stars.push({ name: starName, strength: starInfo.strength || '', huaYao: starInfo.huaYao || [] });
                }
            }
            results.push({ month: m + 1, monthLabel: MONTH_LABELS[m], palaceId, branch, lifePalaceName, stars });
        }
        return results;
    }
    // ▼▼▼ 計算「大遊真限」(完整序列)的函式 ▼▼▼
    function calculateDaYouZhenXian(hourBranch) {
    if (!hourBranch) return [];
    const startBranch = ZHI_SIX_HARMONIES[hourBranch];
    if (!startBranch) return [];
    const startSequenceIndex = DA_YOU_SEQUENCE.indexOf(startBranch);
    if (startSequenceIndex === -1) return [];
    
    const limits = [];
    let ageTracker = 1;
    for (let i = 0; i < DA_YOU_SEQUENCE.length; i++) {
        const sequenceIndex = (startSequenceIndex + i) % 12;
        const currentBranch = DA_YOU_SEQUENCE[sequenceIndex];
        const duration = DA_YOU_DURATIONS[currentBranch];
        const ageStart = ageTracker;
        const ageEnd = ageTracker + duration - 1;
        limits.push({ palaceId: BRANCH_TO_PALACE_ID[currentBranch], ageRange: `${ageStart}-${ageEnd}` });
        ageTracker = ageEnd + 1;
    }
    return limits;
    }
    // ▼▼▼ 分析「大遊真限與大遊星同宮」的引擎函式 ▼▼▼
    function findDaYouOverlap(daYouZhenXianResult, daYouStarResult) {
        if (!daYouZhenXianResult || !daYouStarResult) {
            return null; // 如果缺少資料，則返回 null
        }

        // 1. 找出大遊星所在的宮位 ID
        const daYouStarPalaceId = BRANCH_TO_PALACE_ID[daYouStarResult];
        if (!daYouStarPalaceId) {
            return null;
        }

        // 2. 在大遊真限的列表中，尋找宮位ID相同的那個區間
        const overlapLimit = daYouZhenXianResult.find(limit => limit.palaceId === daYouStarPalaceId);

        // 3. 如果找到了，就回傳那個區間的資訊；否則返回 null
        return overlapLimit || null;
    }
    // ▼▼▼ 計算「飛祿大限」(當前及未來兩個)的函式 ▼▼▼
    function calculateFeiLuDaXian(yearStem, currentUserAge) {
    if (!yearStem || currentUserAge === undefined) return [];

    const rule = FEI_LU_LIMIT_RULES[yearStem];
    if (!rule) return [];

    const { startBranch, firstAge } = rule;
    const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startBranch);
    if (startPalaceIndex === -1) return [];

    const results = [];
    let currentPalaceIndex = startPalaceIndex;
    let currentAgeStart = 1;
    let currentAgeEnd = firstAge;

    // 1. 先快速定位到包含當前歲數的大限
    if (currentUserAge > firstAge) {
        const ageAfterFirst = currentUserAge - firstAge;
        const steps = Math.floor((ageAfterFirst - 1) / 10);
        
        currentPalaceIndex = (startPalaceIndex + steps + 1) % 12;
        currentAgeStart = firstAge + (steps * 10) + 1;
        currentAgeEnd = currentAgeStart + 9;
    }

    // 2. 從當前大限開始，連續產生 3 組資料
    for (let i = 0; i < 3; i++) {
        const palaceIndex = (currentPalaceIndex + i) % 12;
        const palaceId = VALID_PALACES_CLOCKWISE[palaceIndex];
        
        results.push({
            palaceId: palaceId,
            text: `飛祿${currentAgeStart}-${currentAgeEnd}`
        });

        // 為下一個大限準備年齡
        currentAgeStart = currentAgeEnd + 1;
        currentAgeEnd = currentAgeStart + 9;
    }

    return results;
    }
    // ▼▼▼ 計算「飛馬大限」(當前及未來兩個)的函式 ▼▼▼
    function calculateFeiMaDaXian(yearStem, currentUserAge) {
    if (!yearStem || currentUserAge === undefined) return [];

    const rule = FEI_LU_LIMIT_RULES[yearStem]; // 共用「飛祿」的規則表
    if (!rule) return [];

    const { startBranch, firstAge } = rule;
    const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startBranch);
    if (startPalaceIndex === -1) return [];

    const direction = -1; // 唯一的不同：方向永遠是逆時鐘 (-1)
    const results = [];
    let currentPalaceIndex = startPalaceIndex;
    let currentAgeStart = 1;
    let currentAgeEnd = firstAge;

    // 1. 先快速定位到包含當前歲數的大限
    if (currentUserAge > firstAge) {
        const ageAfterFirst = currentUserAge - firstAge;
        const steps = Math.floor((ageAfterFirst - 1) / 10);
        
        currentPalaceIndex = (startPalaceIndex + (steps + 1) * direction + 144) % 12;
        currentAgeStart = firstAge + (steps * 10) + 1;
        currentAgeEnd = currentAgeStart + 9;
    }

    // 2. 從當前大限開始，連續產生 3 組資料
    for (let i = 0; i < 3; i++) {
        const palaceIndex = (currentPalaceIndex + i * direction + 144) % 12;
        const palaceId = VALID_PALACES_CLOCKWISE[palaceIndex];
        
        results.push({
            palaceId: palaceId,
            text: `飛馬${currentAgeStart}-${currentAgeEnd}` // 前綴文字改為「飛馬」
        });

        // 為下一個大限準備年齡
        currentAgeStart = currentAgeEnd + 1;
        currentAgeEnd = currentAgeStart + 9;
    }

    return results;
    }
    // ▼▼▼ 計算「飛祿流年」(包含官祿宮停留3年邏輯)的函式 ▼▼▼
    function calculateFeiLuLiuNian(yearStem, dayStem, gender, currentUserAge, arrangedLifePalaces) {
    if (!yearStem || !dayStem || currentUserAge === undefined || !arrangedLifePalaces) return [];

    // 1. 根據「日柱天干」和性別，判斷順逆方向
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    const isDayStemYang = yangStems.includes(dayStem);
    const direction = ((isDayStemYang && gender === '男') || (!isDayStemYang && gender === '女')) ? 1 : -1;

    // 2. 根據「年柱天干」查找起點
    const rule = FEI_LU_ANNUAL_RULES[yearStem];
    if (!rule) return [];
    const { startBranch, startAge } = rule;
    const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startBranch);

    // 3. 找到官祿宮在十二宮順序中的索引
    const guanLuPalaceIndex = arrangedLifePalaces.indexOf('官');
    
    // 4. 建立從1歲到未來的「歲數 -> 宮位ID」的完整對應地圖
    const ageToPalaceMap = {};
    let currentAge = startAge;
    let currentPalaceIndex = startPalaceIndex;
    
    // 迴圈推算約150年，確保涵蓋所有年齡
    for (let i = 0; i < 150; i++) {
        const palaceId = VALID_PALACES_CLOCKWISE[currentPalaceIndex];
        ageToPalaceMap[currentAge] = palaceId;
        
        // 檢查當前宮位是否為官祿宮
        if (currentPalaceIndex === guanLuPalaceIndex) {
            // 如果是，則接下來的兩年都停留在同一個宮位
            ageToPalaceMap[currentAge + 1] = palaceId;
            ageToPalaceMap[currentAge + 2] = palaceId;
            currentAge += 3; // 歲數直接跳3年
        } else {
            currentAge += 1; // 正常情況，歲數+1
        }
        // 根據方向，換到下一個宮位
        currentPalaceIndex = (currentPalaceIndex + direction + 12) % 12;
    }

    // 5. 根據建好的地圖，找出當前和未來6年的資訊
    const results = [];
    let processedAges = {}; // 用來處理官祿宮的重複情況

    for (let i = 0; i < ANNUAL_LIMIT_DISPLAY_YEARS; i++) {
        const age = currentUserAge + i;
        if (processedAges[age]) continue; // 如果這個歲數已經處理過，就跳過

        const palaceId = ageToPalaceMap[age];
        if (!palaceId) continue;

        // 檢查這個宮位是否是官祿宮，以決定顯示格式
        if (VALID_PALACES_CLOCKWISE.indexOf(palaceId) === guanLuPalaceIndex) {
            // 如果是官祿宮，找到這個3年區間的起始和結束歲數
            let rangeStart = age;
            while(ageToPalaceMap[rangeStart - 1] === palaceId) {
                rangeStart--;
            }
            const rangeEnd = rangeStart + 2;
            results.push({ palaceId, text: `祿${rangeStart}-${rangeEnd}` });
            
            // 標記這三年都已經處理完畢
            processedAges[rangeStart] = true;
            processedAges[rangeStart + 1] = true;
            processedAges[rangeStart + 2] = true;

        } else {
            results.push({ palaceId, text: `祿${age}` });
            processedAges[age] = true;
        }
    }
    
    return results;
    }
    // ▼▼▼ 計算「飛馬流年」(包含疾厄宮停留3年邏輯)的函式 ▼▼▼
    function calculateFeiMaLiuNian(hourStem, dayStem, gender, currentUserAge, arrangedLifePalaces) {
    // 檢查傳入的參數是否完整，若不完整則返回空陣列
    if (!hourStem || !dayStem || currentUserAge === undefined || !arrangedLifePalaces || arrangedLifePalaces.length === 0) {
        return [];
    }

    // 1. 根據「日柱天干」和性別，判斷順逆方向 (與飛祿流年規則相反)
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    const isDayStemYang = yangStems.includes(dayStem);
    const direction = ((isDayStemYang && gender === '男') || (!isDayStemYang && gender === '女')) ? -1 : 1;

    // 2. 根據「時柱天干」查找起點
    const rule = FEI_LU_ANNUAL_RULES[hourStem];
    if (!rule) {
        return []; // 如果找不到規則，返回空陣列
    }
    const { startBranch, startAge } = rule;
    const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startBranch);

    // 3. 找到「疾厄宮」的位置
    const jiEPalaceIndex = arrangedLifePalaces.indexOf('疾');
    if (jiEPalaceIndex === -1) {
        return []; // 如果找不到疾厄宮，返回空陣列
    }
    
    // 4. 建立從1歲到未來的「歲數 -> 宮位ID」的完整對應地圖
    const ageToPalaceMap = {};
    let currentAge = startAge;
    let currentPalaceIndex = startPalaceIndex;
    
    for (let i = 0; i < 150; i++) {
        const palaceId = VALID_PALACES_CLOCKWISE[currentPalaceIndex];
        ageToPalaceMap[currentAge] = palaceId;
        
        // 檢查當前宮位是否為疾厄宮
        if (currentPalaceIndex === jiEPalaceIndex) {
            ageToPalaceMap[currentAge + 1] = palaceId;
            ageToPalaceMap[currentAge + 2] = palaceId;
            currentAge += 3;
        } else {
            currentAge += 1;
        }
        currentPalaceIndex = (currentPalaceIndex + direction + 12) % 12;
    }

    // 5. 根據地圖，找出當前和未來6年的資訊
    const results = [];
    let processedAges = {};

    for (let i = 0; i < ANNUAL_LIMIT_DISPLAY_YEARS; i++) {
        const age = currentUserAge + i;
        if (processedAges[age]) continue;

        const palaceId = ageToPalaceMap[age];
        if (!palaceId) continue;

        if (VALID_PALACES_CLOCKWISE.indexOf(palaceId) === jiEPalaceIndex) {
            let rangeStart = age;
            while(ageToPalaceMap[rangeStart - 1] === palaceId) {
                rangeStart--;
            }
            const rangeEnd = rangeStart + 2;
            results.push({ palaceId, text: `馬${rangeStart}-${rangeEnd}` });
            processedAges[rangeStart] = true;
            processedAges[rangeStart + 1] = true;
            processedAges[rangeStart + 2] = true;
        } else {
            results.push({ palaceId, text: `馬${age}` });
            processedAges[age] = true;
        }
    }
    
    return results;
    }
    // ▼▼▼ 計算「黑符」流年的函式 ▼▼▼
    function calculateHeiFu(hourStem, currentUserAge) {
    if (!hourStem || currentUserAge === undefined) return {};

    // 1. 根據「時柱天干」查找起始宮位地支
    const startBranch = HEI_FU_RULES[hourStem];
    if (!startBranch) return {};

    const startAge = 1; // 起始歲數固定為1歲
    const direction = 1; // 方向固定為順時鐘
    const startPalaceIndex = EARTHLY_BRANCHES.indexOf(startBranch);

    const results = {}; // 最終結果，例如：{ pChen: [50], pSi: [51], ... }

    // 2. 根據 ANNUAL_LIMIT_DISPLAY_YEARS 的設定，計算對應年份的資料
    for (let i = 0; i < ANNUAL_LIMIT_DISPLAY_YEARS; i++) {
        const age = currentUserAge + i;
        if (age < 1) continue;

        const ageOffset = age - startAge; // 計算與起始歲數的差距
        // 根據差距和方向，計算出該歲數落在哪個宮位
        const palaceIndex = (startPalaceIndex + ageOffset * direction + 12) % 12;
        const palaceId = VALID_PALACES_CLOCKWISE[palaceIndex];

        // 將歲數加入到對應宮位的列表中
        if (!results[palaceId]) {
            results[palaceId] = [];
        }
        results[palaceId].push(age);
    }
    return results;
    }
    // ▼▼▼ 計算「受氣之數」與「受氣之宮」的函式 ▼▼▼
    function calculateShouQi(dayPillar, hourPillar) {
    // 1. 從資料庫查找日柱和時柱的天地生成數
    const dayNum = GANZI_GENERATION_NUMBERS[dayPillar];
    const hourNum = GANZI_GENERATION_NUMBERS[hourPillar];

    // 如果找不到資料，則返回錯誤訊息
    if (dayNum === undefined || hourNum === undefined) {
        return { palace: '查無資料', number: '' };
    }

    // 2. 根據公式計算「受氣之數」
    const shouQiNumberRaw = (dayNum + hourNum + 55) % 60;
    // 處理餘數為 0 的情況，根據規則應視為 60
    const shouQiNumber = (shouQiNumberRaw === 0) ? 60 : shouQiNumberRaw;
    
    // 3. 查找日柱在六十甲子順序中的位置
    const startIndex = JIAZI_CYCLE_ORDER.indexOf(dayPillar);
    if (startIndex === -1) {
        return { palace: '順序錯誤', number: shouQiNumber };
    }
    
    // 4. 從起始位置開始「逆數」，找到「受氣之宮」
    // 逆數 N 位，且起始位算1，相當於索引值減去 (N-1)
    const palaceIndex = (startIndex - (shouQiNumber - 1) + 60) % 60;
    const shouQiPalace = JIAZI_CYCLE_ORDER[palaceIndex];

    return { palace: shouQiPalace, number: shouQiNumber };
    }
    // ▼▼▼ 計算「出生卦」的函式 ▼▼▼
    function calculateBirthHexagram(yearPillar, monthPillar, dayPillar, hourPillar) {
    // 1. 從資料庫查找四柱的天地生成數
    const yearNum = GANZI_GENERATION_NUMBERS[yearPillar];
    const monthNum = GANZI_GENERATION_NUMBERS[monthPillar];
    const dayNum = GANZI_GENERATION_NUMBERS[dayPillar];
    const hourNum = GANZI_GENERATION_NUMBERS[hourPillar];

    // 安全檢查，如果任一柱的資料找不到，則返回錯誤
    if ([yearNum, monthNum, dayNum, hourNum].includes(undefined)) {
        return { name: '資料錯誤', symbol: '' };
    }

    // 2. 根據公式計算總和，再除以64取餘數
    const remainder = (yearNum + monthNum + dayNum + hourNum + 55) % 64;
    
    // 3. 處理餘數為 0 的情況，根據易經順序，餘 0 應為第 64 卦
    const hexagramNumber = (remainder === 0) ? 64 : remainder;

    // 4. 從 I_CHING_HEXAGRAMS 陣列中找出對應的卦
    // (陣列索引是從 0 開始，所以要用卦的編號減 1)
    const hexagram = I_CHING_HEXAGRAMS[hexagramNumber - 1];

    return hexagram || { name: '計算錯誤', symbol: '' };
    }
    // ▼▼▼ 計算「立業卦」的函式 ▼▼▼
    function calculateLiYeHexagram(shouQiGong, birthHexagram) {
    if (!shouQiGong || !birthHexagram || !birthHexagram.symbol) {
        return null;
    }

    const shouQiStem = shouQiGong.charAt(0);
    const shouQiBranch = shouQiGong.charAt(1);
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    const isYang = yangStems.includes(shouQiStem);

    // 1. 取得出生卦的數位化爻象 (例如 "110011")
    const originalYaoStr = HEXAGRAM_DATA[birthHexagram.symbol];
    if (!originalYaoStr) return { name: '卦象資料錯誤', symbol: '' };

    // 2. 根據陰陽干，找出目標爻(陽爻或陰爻)的位置
    const targetYaoType = isYang ? '1' : '0';
    let targetYaoIndices = [];
    for (let i = 0; i < originalYaoStr.length; i++) {
        if (originalYaoStr[i] === targetYaoType) {
            targetYaoIndices.push(i); // 儲存爻的索引 (0到5)
        }
    }
    
    // 如果是陰干，爻的順序要由上往下
    if (!isYang) {
        targetYaoIndices.reverse();
    }

    // 如果找不到任何可以變的爻，直接返回
    if (targetYaoIndices.length === 0) {
        return { name: '無爻可變', symbol: '' };
    }

    // 3. 計算從子到受氣地支的步數
    const startIndex = EARTHLY_BRANCHES.indexOf('子');
    const endIndex = EARTHLY_BRANCHES.indexOf(shouQiBranch);
    const steps = (endIndex - startIndex + 12) % 12 + 1; // 加1是因為"子"算第一步

    // 4. 循環計數，找到要變的那個爻
    const stopIndex = (steps - 1) % targetYaoIndices.length;
    const yaoToChangeIndex = targetYaoIndices[stopIndex];

    // 5. 執行爻變 (陽變陰，陰變陽)
    let yaoArray = originalYaoStr.split('');
    yaoArray[yaoToChangeIndex] = (yaoArray[yaoToChangeIndex] === '1') ? '0' : '1';
    const newYaoStr = yaoArray.join('');

    // 6. 根據新的爻象字串，反向查找對應的卦
    const newSymbol = Object.keys(HEXAGRAM_DATA).find(key => HEXAGRAM_DATA[key] === newYaoStr);
    const liYeHexagram = I_CHING_HEXAGRAMS.find(h => h.symbol === newSymbol);

    return liYeHexagram || { name: '查無此卦', symbol: '' };
    }
    // ▼▼▼ 計算「流年卦」的函式 ▼▼▼
    function calculateAnnualHexagram(birthHexagram, currentUserAge) {
    if (!birthHexagram || !birthHexagram.number || currentUserAge === undefined) {
        return null;
    }

    // 1. 將出生卦編號與當前歲數相加
    const sum = birthHexagram.number + currentUserAge;

    // 2. 如果總和超過 64，則除以 64 取餘數
    let annualHexagramNumber;
    if (sum > 64) {
        const remainder = sum % 64;
        annualHexagramNumber = (remainder === 0) ? 64 : remainder; // 餘數為 0 代表第 64 卦
    } else {
        annualHexagramNumber = sum;
    }

    // 3. 從64卦資料庫中找到對應的卦 (陣列索引需減 1)
    const annualHexagram = I_CHING_HEXAGRAMS[annualHexagramNumber - 1];

    return annualHexagram || { name: '計算錯誤', symbol: '' };
    }
    // ▼▼▼ 計算「立業之期」歲數的函式 ▼▼▼
    function calculateLiYeStartAge(birthHexagram) {
    // 安全檢查，如果沒有傳入出生卦資料，則返回 null
    if (!birthHexagram || !birthHexagram.symbol) {
        return null;
    }
    
    // 1. 從數位化資料庫中，找到出生卦的爻象字串 (例如 "100010")
    const yaoString = HEXAGRAM_DATA[birthHexagram.symbol];
    if (!yaoString || yaoString.length !== 6) {
        return null; // 如果資料錯誤或不完整，也返回 null
    }

    // 2. 遍歷爻象字串，計算總年數 (陽爻為9年，陰爻為6年)
    let totalYears = 0;
    for (const yao of yaoString) {
        if (yao === '1') { // '1' 代表陽爻
            totalYears += 9;
        } else { // '0' 代表陰爻
            totalYears += 6;
        }
    }

    // 3. 根據規則，最終年紀是總年數 + 1
    return totalYears + 1;
    }
    // ▼▼▼ 計算「流年變卦」的函式 (已修正) ▼▼▼
    function calculateAnnualChangingHexagram(annualHexagram, baiLiuLimitResult, currentUserAge) {
    if (!annualHexagram || !Array.isArray(baiLiuLimitResult) || !currentUserAge) return null;

    // ▼▼▼ 核心修正點：從傳入的「陣列」中，找出當前歲數所在的大限 ▼▼▼
    const currentLimit = baiLiuLimitResult.find(limit => {
        if (!limit.ageRange) return false;
        const [start, end] = limit.ageRange.split('-').map(Number);
        return currentUserAge >= start && currentUserAge <= end;
    });
    
    // 如果找不到對應的大限 (例如歲數超出範圍)，則中止
    if (!currentLimit || !currentLimit.palaceId) return null;

    const currentPalaceId = currentLimit.palaceId;
    const currentBranch = PALACE_ID_TO_BRANCH[currentPalaceId];
    
    // 2. 判斷宮位地支的陰陽
    const isYangBranch = YANG_BRANCHES.includes(currentBranch);
    
    // 3. 獲取流年卦的爻象 ("110011")
    const originalYaoStr = HEXAGRAM_DATA[annualHexagram.symbol];
    if (!originalYaoStr) return { name: '卦象資料錯誤', symbol: '' };

    // 4. 根據陰陽，找出所有可變的爻
    const targetYaoType = isYangBranch ? '1' : '0';
    let targetYaoIndices = [];
    for (let i = 0; i < originalYaoStr.length; i++) {
        if (originalYaoStr[i] === targetYaoType) {
            targetYaoIndices.push(i);
        }
    }

    // 如果沒有可變的爻，則流年變卦與流年卦相同
    if (targetYaoIndices.length === 0) {
        return annualHexagram;
    }

    // 如果是陰支，數爻的順序要「由上往下」
    if (!isYangBranch) {
        targetYaoIndices.reverse();
    }

    // 5. 計算從「子」到目標地支的步數
    const steps = (EARTHLY_BRANCHES.indexOf(currentBranch) - EARTHLY_BRANCHES.indexOf('子') + 12) % 12 + 1;

    // 6. 循環計數，找到要變的那個爻的索引
    const stopIndexInTargets = (steps - 1) % targetYaoIndices.length;
    const yaoToChangeIndex = targetYaoIndices[stopIndexInTargets];

    // 7. 執行爻變
    let yaoArray = originalYaoStr.split('');
    yaoArray[yaoToChangeIndex] = (yaoArray[yaoToChangeIndex] === '1') ? '0' : '1';
    const newYaoStr = yaoArray.join('');

    // 8. 根據新的爻象，反向查找對應的卦
    const newSymbol = Object.keys(HEXAGRAM_DATA).find(key => HEXAGRAM_DATA[key] === newYaoStr);
    const changingHexagram = I_CHING_HEXAGRAMS.find(h => h.symbol === newSymbol);

    return changingHexagram || { name: '查無此卦', symbol: '' };
    }
    // ▼▼▼ 計算「流年十二月卦」的函式 ▼▼▼
    function calculateMonthlyHexagrams(annualHexagramNumber) {
    if (!annualHexagramNumber) return [];
    
    const monthlyHexagrams = [];
    const baseNumber = annualHexagramNumber + 2;

    for (let i = 1; i <= 12; i++) {
        const rawNumber = baseNumber + i;
        let finalNumber = rawNumber;
        if (rawNumber > 64) {
            const remainder = rawNumber % 64;
            finalNumber = (remainder === 0) ? 64 : remainder;
        }
        
        // 從 I_CHING_HEXAGRAMS 陣列中找出對應的卦
        const hexagram = I_CHING_HEXAGRAMS[finalNumber - 1];
        if (hexagram) {
            monthlyHexagrams.push({
                monthName: MONTH_NAMES_CHINESE[i-1],
                hexagram: hexagram
            });
        }
    }
    return monthlyHexagrams;
    }
    // ▼▼▼ 格式化「流年十二月卦」顯示文字的函式 (已修正排版) ▼▼▼ 
    function formatMonthlyHexagrams(monthlyHexagramsResult, targetYear) {
    if (!monthlyHexagramsResult || monthlyHexagramsResult.length === 0) return '';

    let text = '\n\n'; 

    monthlyHexagramsResult.forEach(item => {
            // 3. 使用 targetYear
            text += `  <strong>${targetYear}年${item.monthName}卦:</strong> `;
            text += `${item.hexagram.number} ${item.hexagram.name} ${item.hexagram.symbol}\n`;
            text += `  <span class="hexagram-description-style">↳ ${item.hexagram.description}</span>\n\n`;
    });
    return text;
    }
    // ▼▼▼ 格式化「流年十二月卦」給 AI 使用的專屬函式 ▼▼▼
    function formatMonthlyHexagramsForAI(monthlyHexagramsResult) {
        if (!monthlyHexagramsResult || monthlyHexagramsResult.length === 0) {
            return '資料空缺';
        }
        // 將 12 個月的卦象資料，組合成一個帶有換行符的純文字字串
        return monthlyHexagramsResult.map(item => 
            `- ${item.monthName}: ${item.hexagram.name} - ${item.hexagram.explanation}`
        ).join('\n');
    }
    // ▼▼▼ 建立圖表模型函式 (已整合「中宮寄宮」邏輯) ▼▼▼
    function buildChartModel(data) {
    let model = {};
    // 1. 初始化模型，包含所有16個宮位 + 中宮
    Object.values(BRANCH_TO_PALACE_ID).forEach(pId => {
        model[pId] = { stars: {}, patterns: [] };
    });
    model['pCenter'] = { stars: {}, patterns: [] };

    // 2. 收集所有在16宮的星曜
    const allStars = {
        '太乙': data.lookupResult?.太乙, '文昌': data.lookupResult?.文昌, '始擊': data.lookupResult?.始擊, '定目': data.lookupResult?.定目,
        '小遊': data.xiaoYouResult, '大遊': data.daYouResult, '時五福': data.shiWuFuResult, '計神': data.deitiesResult?.計神,
        '主大': data.suanStarsResult?.chartStars['主大'], '主參': data.suanStarsResult?.chartStars['主參'],
        '客大': data.suanStarsResult?.chartStars['客大'], '客參': data.suanStarsResult?.chartStars['客參'],
        '定大': data.suanStarsResult?.chartStars['定大'], '定參': data.suanStarsResult?.chartStars['定參'],
        '天乙': data.tianYiResult, '地乙': data.diYiResult, '四神': data.siShenResult, '飛符': data.feiFuResult,
        '皇恩星': data.huangEnResult, '君基': data.junJiResult, '臣基': data.chenJiResult, '民基': data.minJiResult
    };
    for (const starName in allStars) {
        if (EXCLUDED_STARS_FROM_ANALYSIS.includes(starName)) continue;
        const branch = allStars[starName];
        if (branch) {
            const palaceId = BRANCH_TO_PALACE_ID[branch];
            if (palaceId && model[palaceId]) {
                if (!model[palaceId].stars[starName]) {
                    model[palaceId].stars[starName] = { name: starName, strength: '', huaYao: [] };
                }
            }
        }
    }
    
    // ▼▼▼ 唯一的修改點：處理中宮星曜時，加入「寄宮」判斷 ▼▼▼
    if (data.suanStarsResult?.centerStars) {
        const zhuSuan = data.lookupResult?.主算;
        const keSuan = data.lookupResult?.客算;

        data.suanStarsResult.centerStars.forEach(starName => {
            let hostBranch = null; // 預設沒有寄宮

            if (['主大', '主參'].includes(starName) && zhuSuan && CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan]) {
                hostBranch = CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan][starName];
            } else if (['客大', '客參'].includes(starName) && keSuan && CENTER_PALACE_JI_GONG_RULES['客算'][keSuan]) {
                hostBranch = CENTER_PALACE_JI_GONG_RULES['客算'][keSuan][starName];
            }
            
            if (hostBranch) { // 如果找到了寄宮的位置
                const hostPalaceId = BRANCH_TO_PALACE_ID[hostBranch];
                if (hostPalaceId && model[hostPalaceId]) {
                    if (!model[hostPalaceId].stars[starName]) {
                        model[hostPalaceId].stars[starName] = { name: starName, strength: '', huaYao: [] };
                    }
                }
            } else { // 如果沒有寄宮規則，則仍然放入中宮
                if (!model['pCenter'].stars[starName]) {
                    model['pCenter'].stars[starName] = { name: starName, strength: '', huaYao: [] };
                }
            }
        });
    }
    const huaYaoResults = calculateAllHuaYao(data.yearPillar.charAt(0), data.dayPillar.charAt(0), data.dayPillar.charAt(1));
    const starToHuaYaoMap = {};
    // ▼▼▼ 新增：化曜分層 map（供 Skill 區分來源用，保留合併版 huaYao 給原有邏輯）▼▼▼
    const starToHuaYaoMap_BirthYear      = {}; // 本命年干化曜
    const starToHuaYaoMap_BirthDayStem   = {}; // 本命日干化曜
    const starToHuaYaoMap_BirthDayBranch = {}; // 本命日支化曜
    const sourceTypeToLayeredMap = {
        'nianGan': starToHuaYaoMap_BirthYear,
        'riGan':   starToHuaYaoMap_BirthDayStem,
        'riZhi':   starToHuaYaoMap_BirthDayBranch
    };
    if (huaYaoResults) {
        Object.keys(huaYaoResults).forEach(sourceType => {
            const roles = huaYaoResults[sourceType];
            const layeredMap = sourceTypeToLayeredMap[sourceType];
            Object.keys(roles).forEach(roleName => {
                const starNames = roles[roleName].split(' ').filter(Boolean);
                starNames.forEach(starName => {
                    if (!starToHuaYaoMap[starName]) starToHuaYaoMap[starName] = [];
                    if (layeredMap && !layeredMap[starName]) layeredMap[starName] = [];
                    const chineseRoleName = HUA_YAO_ROLE_MAP[roleName];
                    if (chineseRoleName) {
                        // 合併版：跨層去重（原有行為，不變）
                        if (!starToHuaYaoMap[starName].includes(chineseRoleName)) {
                            starToHuaYaoMap[starName].push(chineseRoleName);
                        }
                        // 分層版：每層各自去重
                        if (layeredMap && !layeredMap[starName].includes(chineseRoleName)) {
                            layeredMap[starName].push(chineseRoleName);
                        }
                    }
                });
            });
        });
    }
    Object.keys(model).forEach(palaceId => {
        const branch = PALACE_ID_TO_BRANCH[palaceId];
        Object.keys(model[palaceId].stars).forEach(starName => {
            if (STAR_STRENGTH_DATA[starName] && STAR_STRENGTH_DATA[starName][branch]) {
                model[palaceId].stars[starName].strength = STAR_STRENGTH_DATA[starName][branch];
            }
            if (starToHuaYaoMap[starName]) {
                model[palaceId].stars[starName].huaYao = starToHuaYaoMap[starName];
            }
            // ▼▼▼ 新增：寫入三層化曜資料（每顆星都會有這三個欄位，沒化曜時為空陣列）▼▼▼
            model[palaceId].stars[starName].huaYaoFromBirthYear      = starToHuaYaoMap_BirthYear[starName]      || [];
            model[palaceId].stars[starName].huaYaoFromBirthDayStem   = starToHuaYaoMap_BirthDayStem[starName]   || [];
            model[palaceId].stars[starName].huaYaoFromBirthDayBranch = starToHuaYaoMap_BirthDayBranch[starName] || [];
        });
    });
    const xiaoYouPalaceId = BRANCH_TO_PALACE_ID[allStars['小遊']];
    if (xiaoYouPalaceId && model[xiaoYouPalaceId]) {
        const xiaoYouIndex = EARTHLY_BRANCHES.indexOf(allStars['小遊']);
        const wenChangIndex = EARTHLY_BRANCHES.indexOf(allStars['文昌']);
        const shiJiIndex = EARTHLY_BRANCHES.indexOf(allStars['始擊']);
        if (model[xiaoYouPalaceId].stars['始擊']) model[xiaoYouPalaceId].patterns.push({ type: '掩', primary: '小遊', secondary: '始擊' });
        const qiuStars = ['文昌', '主大', '主參', '客大', '客參'];
        const qiuTrigger = qiuStars.find(s => model[xiaoYouPalaceId].stars[s]);
        if (qiuTrigger) model[xiaoYouPalaceId].patterns.push({ type: '囚', primary: '小遊', secondary: qiuTrigger });
        if (wenChangIndex !== -1) {
            if (wenChangIndex === (xiaoYouIndex + 1) % 12 || wenChangIndex === (xiaoYouIndex - 1 + 12) % 12) model[xiaoYouPalaceId].patterns.push({ type: '迫', primary: '小遊', secondary: '文昌' });
            if (wenChangIndex === (xiaoYouIndex + 6) % 12) model[xiaoYouPalaceId].patterns.push({ type: '對', primary: '小遊', secondary: '文昌' });
        }
        if (shiJiIndex !== -1) {
            if (shiJiIndex === (xiaoYouIndex + 1) % 12 || shiJiIndex === (xiaoYouIndex - 1 + 12) % 12) model[xiaoYouPalaceId].patterns.push({ type: '擊', primary: '小遊', secondary: '始擊' });
            if (shiJiIndex === (xiaoYouIndex + 6) % 12) model[xiaoYouPalaceId].patterns.push({ type: '格', primary: '小遊', secondary: '始擊' });
        }
    }
    Object.keys(model).forEach(palaceId => {
        const starsInPalace = Object.keys(model[palaceId].stars);
        const suanStarsInPalace = starsInPalace.filter(s => ['主大', '主參', '客大', '客參'].includes(s));
        if (starsInPalace.includes('文昌') && (starsInPalace.includes('客大') || starsInPalace.includes('客參'))) {
            model[palaceId].patterns.push({ type: '關', primary: '文昌', secondary: starsInPalace.find(s => s === '客大' || s === '客參') });
        }
        if (starsInPalace.includes('始擊') && (starsInPalace.includes('主大') || starsInPalace.includes('主參'))) {
            model[palaceId].patterns.push({ type: '關', primary: '始擊', secondary: starsInPalace.find(s => s === '主大' || s === '主參') });
        }
        if (suanStarsInPalace.length >= 2) {
            model[palaceId].patterns.push({ type: '關', primary: suanStarsInPalace[0], secondary: suanStarsInPalace[1] });
        }
    });

    return model;
    }
    // ▼▼▼ 格式化「格局」資訊的專屬函式 (用於左側摘要區) ▼▼▼
    function formatPatternInfo(palaceModel, arrangedLifePalaces) {
    let outputLines = [];
    const palaceFullNameMap = { '命':'命宮', '兄':'兄弟宮', '妻':'夫妻宮', '孫':'子孫宮', '財':'財帛宮', '田':'田宅宮', '官':'官祿宮', '奴':'奴僕宮', '疾':'疾厄宮', '福':'福德宮', '貌':'相貌宮', '父':'父母宮' };

    Object.keys(palaceModel).forEach(palaceId => {
        const palaceData = palaceModel[palaceId];
        if (palaceData.patterns.length > 0) {
            const palaceIndex = VALID_PALACES_CLOCKWISE.indexOf(palaceId);
            if (palaceIndex === -1) return;
            
            const palaceShortName = arrangedLifePalaces[palaceIndex];
            const palaceFullName = palaceFullNameMap[palaceShortName] || palaceShortName;

            palaceData.patterns.forEach(p => {
                outputLines.push(`${palaceFullName}：${p.secondary} <span class="pattern-style">${p.type}</span> ${p.primary}`);
            });
        }
    });

    if (outputLines.length > 0) {
        return `\n  格局 : ${outputLines.join('、 ')}`;
    }
    return `\n  格局 : 無掩迫關囚擊格對`;
    }
    // ▼▼▼ 格式化下方資訊區 (已修正空宮判斷邏輯) ▼▼▼
    function formatBottomInfoBox(chartModel, arrangedLifePalaces, sdrData) {
    let htmlParts = [];
    const palaceFullNameMap = { '命':'命宮', '兄':'兄弟宮', '妻':'夫妻宮', '孫':'子孫宮', '財':'財帛宮', '田':'田宅宮', '官':'官祿宮', '奴':'奴僕宮', '疾':'疾厄宮', '福':'福德宮', '貌':'相貌宮', '父':'父母宮' };

    LIFE_PALACE_NAMES.forEach(shortName => {
        const palaceFullName = palaceFullNameMap[shortName] || shortName;
        const palaceIndex = arrangedLifePalaces.indexOf(shortName);
        if (palaceIndex === -1) return;

        const palaceId = VALID_PALACES_CLOCKWISE[palaceIndex];
        const palaceBranch = PALACE_ID_TO_BRANCH[palaceId];
        let palaceData = chartModel[palaceId];
        
        let allStarsInPalace = [...Object.values(palaceData.stars)];
        const guestPalaceId = Object.keys(JI_GONG_MAP).find(key => JI_GONG_MAP[key] === palaceId);
        if (guestPalaceId && chartModel[guestPalaceId]) {
            allStarsInPalace.push(...Object.values(chartModel[guestPalaceId].stars));
        }
        
        // 1. 先過濾掉所有非論斷星曜
        let coreStars = allStarsInPalace.filter(star => 
            !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name) && star.name !== '皇恩星'
        );
        
        let borrowedFrom = '';

        // 2. 在過濾後，才開始判斷是否為空宮，並依序借星
        if (coreStars.length === 0) {
            const oppositePalaceId = OPPOSITE_PALACE_MAP[palaceId];
            if (oppositePalaceId && chartModel[oppositePalaceId]) {
                let borrowedStars = [...Object.values(chartModel[oppositePalaceId].stars)];
                const oppositeGuestPalaceId = Object.keys(JI_GONG_MAP).find(key => JI_GONG_MAP[key] === oppositePalaceId);
                if (oppositeGuestPalaceId && chartModel[oppositeGuestPalaceId]) {
                    borrowedStars.push(...Object.values(chartModel[oppositeGuestPalaceId].stars));
                }
                // 借來的星也要過濾
                coreStars = borrowedStars.filter(star => !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name) && star.name !== '皇恩星');
                if(coreStars.length > 0) borrowedFrom = '(借對宮)';
            }
        }

        if (coreStars.length === 0) {
            const trinePartners = SAN_HE_MAP[palaceBranch];
            if (trinePartners) {
                let trineStars = [];
                trinePartners.forEach(partnerBranch => {
                    const partnerPalaceId = BRANCH_TO_PALACE_ID[partnerBranch];
                    if (partnerPalaceId && chartModel[partnerPalaceId]) {
                        trineStars.push(...Object.values(chartModel[partnerPalaceId].stars));
                        const partnerGuestPalaceId = Object.keys(JI_GONG_MAP).find(key => JI_GONG_MAP[key] === partnerPalaceId);
                        if (partnerGuestPalaceId && chartModel[partnerGuestPalaceId]) {
                            trineStars.push(...Object.values(chartModel[partnerGuestPalaceId].stars));
                        }
                    }
                });
                coreStars = trineStars.filter(star => !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name) && star.name !== '皇恩星');
                if(coreStars.length > 0) borrowedFrom = '(借三合)';
            }
        }

        // 3. 最後才根據最終的星曜列表來產生顯示內容
        if (coreStars.length > 0) {
            let titleParts = [palaceFullName];
            if (sdrData[palaceId]?.includes('身')) titleParts.push('<span class="sdr-palace-highlight">身宮</span>');
            if (sdrData[palaceId]?.includes('日')) titleParts.push('<span class="sdr-palace-highlight">日宮</span>');
            if (sdrData[palaceId]?.includes('時')) titleParts.push('<span class="sdr-palace-highlight">時宮</span>');
            let title = `<strong>${titleParts.join('/')}${borrowedFrom}:</strong>`;

            // ▼▼▼ 核心修改點：將格局資訊加入標題 ▼▼▼
            if (palaceData.patterns.length > 0) {
                const patternTexts = palaceData.patterns.map(p => `${p.secondary} <span class="pattern-style">${p.type}</span> ${p.primary}`);
                // 加上一個空格，並用 span 讓格局文字的字重恢復正常
                title += ` <span style="font-weight:normal;">(格局 / ${patternTexts.join(' / ')})</span>`;
            }

            let starEntriesHtml = '';
            coreStars.forEach(star => {
                let details = [];
                if (star.strength) details.push(star.strength);
                if (star.huaYao.length > 0) details.push(star.huaYao.join(', '));
                let starLine = `<div class="star-entry">${star.name}`;
                if (details.length > 0) {
                    starLine += `(<span class="star-details">${details.join(' / ')}</span>)`;
                }
                
                const description = STAR_PALACE_DESCRIPTIONS[star.name]?.[palaceFullName];
                if (description && description !== '待完成') {
                    starLine += `：<span class="star-palace-description">${description}</span>`;
                }
                starLine += `</div>`;
                starEntriesHtml += starLine;
            });
            htmlParts.push(`<div class="palace-info-block">${title}${starEntriesHtml}</div>`);
        }
    });
    
    const centerPalaceData = chartModel['pCenter'];
    if (centerPalaceData && Object.keys(centerPalaceData.stars).length > 0) {
        let centerStarStrings = [];
        const centerStars = Object.values(centerPalaceData.stars).filter(star => !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name));
        
        centerStars.forEach(star => {
            let details = [];
            if (star.strength) details.push(star.strength);
            if (star.huaYao.length > 0) details.push(star.huaYao.join(', '));
            if (details.length > 0) {
                centerStarStrings.push(`${star.name}(<span class="star-details">${details.join(' / ')}</span>)`);
            } else {
                centerStarStrings.push(star.name);
            }
        });
        
        if (centerStarStrings.length > 0) {
            htmlParts.push(`<div class="palace-info-block"><strong>中宮:</strong> ${centerStarStrings.join('、')}</div>`);
        }
    }
    
    return htmlParts.join('') || '此盤無核心星曜論斷資訊。';
    }
    // ▼▼▼ 計算十二宮運勢分數的函式 ▼▼▼
    function calculateFortuneScores(chartModel, arrangedLifePalaces, ageLimitData, hourPillar, lookupResult) {
    const scores = [];
    
    const timePalaceId = BRANCH_TO_PALACE_ID[hourPillar.charAt(1)];
    // 注意：這裡我們直接呼叫 getBaseScoreForPalace，它已經會使用全域的 SCORE_RULES
    const timePalaceScore = timePalaceId ? getBaseScoreForPalace(timePalaceId, chartModel, lookupResult) : 0;

    for (let i = 0; i < arrangedLifePalaces.length; i++) {
        const palaceId = VALID_PALACES_CLOCKWISE[i];
        let finalPalaceScore = getBaseScoreForPalace(palaceId, chartModel, lookupResult);
        const ageRange = ageLimitData[i];
        if (ageRange) {
            const startAge = parseFloat(ageRange.split('-')[0]);
            if (startAge >= 61) {
                finalPalaceScore += timePalaceScore;
            }
        }
        scores.push(finalPalaceScore);
    }
    return scores;
    }
    // ▼▼▼ 計算「單一宮位」基礎分數的通用輔助函式 (獨立版) ▼▼▼
    function getBaseScoreForPalace(palaceId, chartModel, lookupResult) {
    const palaceData = chartModel[palaceId];
    if (!palaceData) return 0;
    
    let score = 0;
    const palaceBranch = PALACE_ID_TO_BRANCH[palaceId];
    
    let allStarsInPalace = [...Object.values(palaceData.stars)];
    const guestPalaceId = Object.keys(JI_GONG_MAP).find(key => JI_GONG_MAP[key] === palaceId);
    if (guestPalaceId && chartModel[guestPalaceId]) {
        allStarsInPalace.push(...Object.values(chartModel[guestPalaceId].stars));
    }
    if (lookupResult && chartModel['pCenter']?.stars) {
        const zhuSuan = lookupResult.主算; const keSuan = lookupResult.客算;
        const centerStars = Object.values(chartModel['pCenter'].stars);
        centerStars.forEach(star => {
            let hostBranch = null;
            if (['主大', '主參'].includes(star.name) && zhuSuan && CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan]) {
                hostBranch = CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan][star.name];
            } else if (['客大', '客參'].includes(star.name) && keSuan && CENTER_PALACE_JI_GONG_RULES['客算'][keSuan]) {
                hostBranch = CENTER_PALACE_JI_GONG_RULES['客算'][keSuan][star.name];
            }
            if (hostBranch && BRANCH_TO_PALACE_ID[hostBranch] === palaceId) {
                allStarsInPalace.push(star);
            }
        });
    }
    
    let coreStars = allStarsInPalace.filter(star => !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name));

    if (coreStars.length === 0) {
        const oppositePalaceId = OPPOSITE_PALACE_MAP[palaceId];
        if (oppositePalaceId && chartModel[oppositePalaceId]) {
            let borrowedStars = [...Object.values(chartModel[oppositePalaceId].stars)];
            const oppositeGuestPalaceId = Object.keys(JI_GONG_MAP).find(key => JI_GONG_MAP[key] === oppositePalaceId);
            if (oppositeGuestPalaceId && chartModel[oppositeGuestPalaceId]) {
                borrowedStars.push(...Object.values(chartModel[oppositeGuestPalaceId].stars));
            }
            coreStars = borrowedStars.filter(star => !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name));
        }
    }
    
    if (coreStars.length === 0 && palaceBranch) {
        const trinePartners = SAN_HE_MAP[palaceBranch];
        if (trinePartners) {
            let trineStars = [];
            trinePartners.forEach(partnerBranch => {
                const partnerPalaceId = BRANCH_TO_PALACE_ID[partnerBranch];
                if (partnerPalaceId && chartModel[partnerPalaceId]) {
                    trineStars.push(...Object.values(chartModel[partnerPalaceId].stars));
                    const partnerGuestPalaceId = Object.keys(JI_GONG_MAP).find(key => JI_GONG_MAP[key] === partnerPalaceId);
                    if (partnerGuestPalaceId && chartModel[partnerGuestPalaceId]) {
                        trineStars.push(...Object.values(chartModel[partnerGuestPalaceId].stars));
                    }
                }
            });
            coreStars = trineStars.filter(star => !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name));
        }
    }

    coreStars.forEach(star => {
        let starBaseScore = 0;
        const starName = star.name;
        const starBranchForRating = PALACE_ID_TO_BRANCH[guestPalaceId] || palaceBranch;
        
        if (STAR_PROPERTIES[starName]) { starBaseScore += (SCORE_RULES.luckScores[STAR_PROPERTIES[starName].luck] || 0); }
        if (STAR_RATING_DATA[starName] && STAR_RATING_DATA[starName][starBranchForRating]) { starBaseScore += (RATING_SCORES[STAR_RATING_DATA[starName][starBranchForRating]] || 0); }
        if (star.strength) { starBaseScore += SCORE_RULES.strengthBonus; }
        if (star.huaYao && star.huaYao.some(role => ['天元祿主', '天元官星', '地元福星'].includes(role))) {
            starBaseScore *= SCORE_RULES.specialHuaYaoMultiplier;
        }
        score += starBaseScore;
        if (star.huaYao && star.huaYao.length > 0) {
            star.huaYao.forEach(yaoName => {
                if (yaoName === '忌星' || yaoName === '鬼星') {
                    score -= SCORE_RULES.huaYaoScore;
                } else if (!['天元祿主', '天元官星', '地元福星'].includes(yaoName)) {
                    score += SCORE_RULES.huaYaoScore;
                }
            });
        }
    });

    if (coreStars.some(star => star.name === '皇恩星')) { score *= SCORE_RULES.huangEnMultiplier; }
    if (palaceData.patterns.length > 0) { score *= SCORE_RULES.patternMultiplier; }
    return score;
    }
    // ▼▼▼ 計算指定歲數的「行年天干」▼▼▼
    function findXingNianGanZhi(birthYearGan, gender, age) {
    const startIndex = HEAVENLY_STEMS.indexOf(birthYearGan);
    if (startIndex === -1) return null;
    const direction = gender === '男' ? 1 : -1;
    const offset = (age - 1) * direction;
    const finalIndex = (startIndex + offset + 100) % 10;
    return HEAVENLY_STEMS[finalIndex];
    }

    // ▼▼▼ 計算「單一年份行年宮位完整分數」的引擎函式 (v2) ▼▼▼
    function calculateFullAnnualPalaceScore(age, chartModel, data) {
        // 1. 建立歲數 -> 宮位 的完整地圖
        const ageToAnnualPalaceMap = {};
        const fullXingNianData = calculateXingNian(data.gender, 1, 120);
        Object.keys(fullXingNianData).forEach(palaceId => {
            fullXingNianData[palaceId].ages.forEach(a => { ageToAnnualPalaceMap[a] = palaceId; });
        });
        const annualPalaceId = ageToAnnualPalaceMap[age];
        if (!annualPalaceId) return 0;
        
        // 2. 取得行年宮位的基礎分數
        let annualScore = getBaseScoreForPalace(annualPalaceId, chartModel, data.lookupResult);
        
        // 3. 應用專屬於「行年」的特殊規則
        // 規則：處理特殊的「年干化曜」加權
        const annualStem = findXingNianGanZhi(data.yearPillar.charAt(0), data.gender, age);
        const annualHuaYaoRule = NIAN_GAN_HUA_YAO[annualStem];
        if (annualHuaYaoRule) {
            const starsInAnnualPalace = Object.keys(chartModel[annualPalaceId]?.stars || {});
            if (Object.values(annualHuaYaoRule).some(starList => starList.some(star => starsInAnnualPalace.includes(star)))) {
                annualScore *= 1.5;
            }
        }
        
        // 規則：處理皇恩星/飛祿/飛馬/黑符的加減分
        const hasBonusStar = ['皇恩星'].some(s => Object.keys(chartModel[annualPalaceId]?.stars || {}).includes(s)) || 
                             data.feiLuLiuNianResult.some(item => item.palaceId === annualPalaceId && item.text.includes(String(age))) || 
                             data.feiMaLiuNianResult.some(item => item.palaceId === annualPalaceId && item.text.includes(String(age)));

        if (hasBonusStar) {
            annualScore += 50;
        }
        if (data.heiFuResult[annualPalaceId]?.includes(age)) {
            annualScore -= 50;
        }
        
        return annualScore;
    }
    // ▼▼▼ 計算「單一年份行年趨勢圖分數」(含0.7加權)的函式 ▼▼▼
    function calculateAnnualScore(age, chartModel, data) {
        // 呼叫新的引擎，取得完整的行年分數
        const fullAnnualScore = calculateFullAnnualPalaceScore(age, chartModel, data);
        // 應用 0.7 的權重並回傳
        return fullAnnualScore * 0.7;
    }

    // ▼▼▼ 查找「祿馬交馳」年份的函式 ▼▼▼
    function findLuMaJiaoChiYears(data) {
    const threeWayMatches = []; // 存放「行年 + 飛祿 + 飛馬」三者重合的年份
    const twoWayMatches = [];   // 存放「飛祿 + 飛馬」兩者同宮的年份

    // --- 1. 建立「行年」的完整地圖 (歲數 -> 宮位ID) ---
    const xingNianMap = {};
    const fullXingNianData = calculateXingNian(data.gender, 1, 120);
    Object.keys(fullXingNianData).forEach(palaceId => {
        fullXingNianData[palaceId].ages.forEach(age => {
            xingNianMap[age] = palaceId;
        });
    });

    // --- 2. 建立「飛祿流年」的完整地圖 (借用 calculateFeiLuLiuNian 的核心邏輯) ---
    const feiLuMap = {};
    const feiLuRule = FEI_LU_ANNUAL_RULES[data.yearPillar.charAt(0)];
    if (feiLuRule) {
        const yangStems = ['甲', '丙', '戊', '庚', '壬'];
        const isDayStemYang = yangStems.includes(data.dayPillar.charAt(0));
        const feiLuDirection = ((isDayStemYang && data.gender === '男') || (!isDayStemYang && data.gender === '女')) ? 1 : -1;
        
        const feiLuStartPalaceIndex = EARTHLY_BRANCHES.indexOf(feiLuRule.startBranch);
        const guanLuPalaceIndex = data.arrangedLifePalaces.indexOf('官');
        
        let currentAge = feiLuRule.startAge;
        let currentPalaceIndex = feiLuStartPalaceIndex;
        // 迴圈推算足夠的年份
        for (let i = 0; i < 150 && currentAge <= 120; ) {
            const palaceId = VALID_PALACES_CLOCKWISE[currentPalaceIndex];
            feiLuMap[currentAge] = palaceId;
            
            if (currentPalaceIndex === guanLuPalaceIndex) {
                feiLuMap[currentAge + 1] = palaceId;
                feiLuMap[currentAge + 2] = palaceId;
                currentAge += 3;
            } else {
                currentAge += 1;
            }
            currentPalaceIndex = (currentPalaceIndex + feiLuDirection + 12) % 12;
        }
    }

    // --- 3. 建立「飛馬流年」的完整地圖 (借用 calculateFeiMaLiuNian 的核心邏輯) ---
    const feiMaMap = {};
    const feiMaRule = FEI_MA_ANNUAL_RULES[data.hourPillar.charAt(0)];
    if (feiMaRule) {
        const yangStems = ['甲', '丙', '戊', '庚', '壬'];
        const isDayStemYang = yangStems.includes(data.dayPillar.charAt(0));
        const feiMaDirection = ((isDayStemYang && data.gender === '男') || (!isDayStemYang && data.gender === '女')) ? -1 : 1;

        const feiMaStartPalaceIndex = EARTHLY_BRANCHES.indexOf(feiMaRule.startBranch);
        const jiEPalaceIndex = data.arrangedLifePalaces.indexOf('疾');

        let currentAge = feiMaRule.startAge;
        let currentPalaceIndex = feiMaStartPalaceIndex;
        for (let i = 0; i < 150 && currentAge <= 120; ) {
            const palaceId = VALID_PALACES_CLOCKWISE[currentPalaceIndex];
            feiMaMap[currentAge] = palaceId;

            if (currentPalaceIndex === jiEPalaceIndex) {
                feiMaMap[currentAge + 1] = palaceId;
                feiMaMap[currentAge + 2] = palaceId;
                currentAge += 3;
            } else {
                currentAge += 1;
            }
            currentPalaceIndex = (currentPalaceIndex + feiMaDirection + 12) % 12;
        }
    }

    // --- 2. 遍歷 1 到 106 歲，找出所有符合條件的年份 ---
    for (let age = 1; age <= 106; age++) {
        const xingNianPalace = xingNianMap[age];
        const feiLuPalace = feiLuMap[age];
        const feiMaPalace = feiMaMap[age];

        // 檢查條件
        if (feiLuPalace && feiMaPalace && feiLuPalace === feiMaPalace) {
            // 如果祿馬同宮，再檢查行年是否也同宮
            if (xingNianPalace && xingNianPalace === feiLuPalace) {
                threeWayMatches.push(age);
            } else {
                twoWayMatches.push(age);
            }
        }
    }
    
    return { threeWay: threeWayMatches, twoWay: twoWayMatches };
    }

    // ▼▼▼ 分析「強旺建議」的函式 (已整合遞補邏輯) ▼▼▼
    function analyzeStrengthSuggestions(chartModel) {
    const suggestions = [];
    const targetStars = Object.keys(STAR_PROPERTIES);
    
    let tier1_suggestions = []; // 存放滿足「三個條件」的完美結果
    let tier2_suggestions = []; // 存放滿足「兩個條件」的優秀結果

    Object.keys(chartModel).forEach(palaceId => {
        const palaceData = chartModel[palaceId];
        const branch = PALACE_ID_TO_BRANCH[palaceId];
        if (!branch) return;

        Object.values(palaceData.stars).forEach(star => {
            const starName = star.name;
            if (!targetStars.includes(starName)) return;

            // 檢查三個條件是否滿足
            const isTopRating = STAR_RATING_DATA[starName] && STAR_RATING_DATA[starName][branch] === '上';
            const hasStrength = !!star.strength;
            const hasHuaYao = star.huaYao.length > 0;

            const conditionsMet = [isTopRating, hasStrength, hasHuaYao].filter(Boolean).length;
            
            let suggestionData = null;

            if (conditionsMet === 3) {
                // 如果滿足全部三個條件，放入第一級別的建議
                suggestionData = { palaceId, starName, goodStems: [] };
                tier1_suggestions.push(suggestionData);
            } else if (conditionsMet === 2) {
                // 如果只滿足兩個條件，放入第二級別的建議
                suggestionData = { palaceId, starName, goodStems: [] };
                tier2_suggestions.push(suggestionData);
            }
            
            // 如果這顆星是候選者 (無論是第一級還是第二級)，都為它查找吉化天干
            if (suggestionData) {
                Object.keys(RI_GAN_HUA_YAO).forEach(gan => {
                    const rule = RI_GAN_HUA_YAO[gan];
                    Object.keys(rule).forEach(role => {
                        if (rule[role].includes(starName) && role !== 'jiXing' && role !== 'guiXing') {
                            suggestionData.goodStems.push(`${gan}/${HUA_YAO_ROLE_MAP[role]}`);
                        }
                    });
                });
            }
        });
    });
    
    // 最終決定：如果第一級有結果，就用第一級的；否則，才用第二級的
    if (tier1_suggestions.length > 0) {
        return tier1_suggestions;
    } else {
        return tier2_suggestions;
    }
    }
    // ▼▼▼ 搜尋「單一強旺建議」的未來30天吉日 ▼▼▼
    function findAuspiciousDaysForStrength(suggestion) {
    const results = [];
    if (!suggestion || suggestion.goodStems.length === 0) return results;
    
    const today = new Date();
    const goodStemMap = {};
    suggestion.goodStems.forEach(item => {
        const [gan, role] = item.split('/');
        goodStemMap[gan] = role;
    });

    for (let i = 0; i < 30; i++) {
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + i);
        const year = futureDate.getFullYear();
        const month = futureDate.getMonth() + 1;
        const day = futureDate.getDate();
        const lunarDate = solarLunar.solar2lunar(year, month, day);
        const dayPillar = lunarDate.getDayInGanZhi();
        const dayStem = dayPillar.charAt(0);

        if (goodStemMap[dayStem]) {
            results.push(`${month}/${day} ${dayPillar}日(${goodStemMap[dayStem]})`);
        }
    }
    return results;
    }
    // ▼▼▼ 格式化「強旺建議」顯示文字的函式 ▼▼▼
    function formatStrengthInfo(suggestions, arrangedLifePalaces, sdrData) {
    if (!suggestions || suggestions.length === 0) return '';

    let html = `<strong>未來30天 - 運勢強旺參考日：</strong><br>`;
    const palaceFullNameMap = { '命':'命宮', '兄':'兄弟宮', '妻':'夫妻宮', '孫':'子孫宮', '財':'財帛宮', '田':'田宅宮', '官':'官祿宮', '奴':'奴僕宮', '疾':'疾厄宮', '福':'福德宮', '貌':'相貌宮', '父':'父母宮' };

    suggestions.forEach(sugg => {
        const palaceIndex = VALID_PALACES_CLOCKWISE.indexOf(sugg.palaceId);
        const palaceShortName = arrangedLifePalaces[palaceIndex];
        const palaceFullName = palaceFullNameMap[palaceShortName] || palaceShortName;
        let titleParts = [palaceFullName];
        if (sdrData[sugg.palaceId]?.includes('身')) titleParts.push('身宮');
        if (sdrData[sugg.palaceId]?.includes('日')) titleParts.push('日宮');
        if (sdrData[sugg.palaceId]?.includes('時')) titleParts.push('時宮');
        
        const auspiciousDays = findAuspiciousDaysForStrength(sugg);
        if (auspiciousDays.length > 0) {
            html += `<div class="strength-item">${titleParts.join('/')}: ${sugg.starName}`;
            html += `<br><span class="strength-good">吉日：</span>${auspiciousDays.join('、 ')}`;
            html += `</div>`;
        }
    });
    
    return html;
    }
    // ▼▼▼ 分析「解厄建議」的函式 (已整合新規則) ▼▼▼
    function analyzeRemedySuggestions(chartModel, arrangedLifePalaces) {
    const suggestions = [];
    const targetStars = ['始擊', '天乙', '地乙', '四神', '飛符'];
    
    // 遍歷所有宮位
    Object.keys(chartModel).forEach(palaceId => {
        const palaceData = chartModel[palaceId];
        const branch = PALACE_ID_TO_BRANCH[palaceId];
        if (!branch) return;

        Object.values(palaceData.stars).forEach(star => {
            const starName = star.name;
            
            // 如果不是我們要找的五顆凶星，就直接跳過
            if (!targetStars.includes(starName)) {
                return;
            }

            // --- ▼▼▼ 核心修改點：更新判斷條件 ▼▼▼ ---

            // 條件 A: 星曜落陷且無吉化
            const isLowRating = STAR_RATING_DATA[starName] && STAR_RATING_DATA[starName][branch] === '下';
            const noPositiveInfluence = !star.strength && star.huaYao.length === 0;
            const conditionA = isLowRating && noPositiveInfluence;

            // 條件 B: 星曜被凶化 (化為忌星或鬼星)
            const hasBadHuaYao = star.huaYao.includes('忌星') || star.huaYao.includes('鬼星');
            const conditionB = hasBadHuaYao;

            // --- 只要滿足條件A或條件B，就產生建議 ---
            if (conditionA || conditionB) {
                let suggestion = {
                    palaceId: palaceId,
                    starName: starName,
                    goodStems: [],
                    badStems: [],
                    goodBranches: []
                };

                // 反向查找日干和日支的解厄方式 (這部分邏輯不變)
                Object.keys(RI_GAN_HUA_YAO).forEach(gan => {
                    const rule = RI_GAN_HUA_YAO[gan];
                    Object.keys(rule).forEach(role => {
                        if (rule[role].includes(starName)) {
                            if (role === 'jiXing' || role === 'guiXing') {
                                suggestion.badStems.push(`${gan}/${HUA_YAO_ROLE_MAP[role]}`);
                            } else {
                                suggestion.goodStems.push(`${gan}/${HUA_YAO_ROLE_MAP[role]}`);
                            }
                        }
                    });
                });
                
                Object.keys(RI_ZHI_HUA_YAO).forEach(zhi => {
                     if (RI_ZHI_HUA_YAO[zhi].fuXing.includes(starName)) {
                         suggestion.goodBranches.push(zhi);
                     }
                });
                
                suggestions.push(suggestion);
            }
        });
    });
    
    return suggestions;
    }
    // ▼▼▼ 搜尋「單一建議」的未來30天吉凶日 ▼▼▼
    function findDaysForSuggestion(suggestion) {
    const results = { goodDays: [], badDays: [] };
    if (!suggestion) return results;

    const today = new Date();
    
    // 只針對傳入的「單一」建議，建立吉凶天干的查找表
    const goodStemMap = {};
    suggestion.goodStems.forEach(item => {
        const [gan, role] = item.split('/');
        goodStemMap[gan] = role;
    });

    const badStemMap = {};
    suggestion.badStems.forEach(item => {
        const [gan, role] = item.split('/');
        badStemMap[gan] = role;
    });

    // 遍歷未來30天
    for (let i = 0; i < 30; i++) {
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + i);
        const year = futureDate.getFullYear();
        const month = futureDate.getMonth() + 1;
        const day = futureDate.getDate();

        const lunarDate = solarLunar.solar2lunar(year, month, day);
        const dayPillar = lunarDate.getDayInGanZhi();
        const dayStem = dayPillar.charAt(0);

        // 檢查是否為此建議的吉日天干
        if (goodStemMap[dayStem]) {
            results.goodDays.push(`${month}/${day} ${dayPillar}日(${goodStemMap[dayStem]})`);
        }
        // 檢查是否為此建議的凶日天干
        if (badStemMap[dayStem]) {
            results.badDays.push(`${month}/${day} ${dayPillar}日(${badStemMap[dayStem]})`);
        }
    }
    return results;
    }
    // ▼▼▼ 格式化「解厄建議」顯示文字的函式 (已修正重複問題) ▼▼▼
    function formatRemedyInfo(suggestions, arrangedLifePalaces, sdrData) {
    if (!suggestions || suggestions.length === 0) return '';

    let html = `<strong>未來30天 - 解厄吉凶參考日：</strong><br>`;
    const palaceFullNameMap = { '命':'命宮', '兄':'兄弟宮', '妻':'夫妻宮', '孫':'子孫宮', '財':'財帛宮', '田':'田宅宮', '官':'官祿宮', '奴':'奴僕宮', '疾':'疾厄宮', '福':'福德宮', '貌':'相貌宮', '父':'父母宮' };

    // 遍歷每一個需要建議的凶星
    suggestions.forEach(sugg => {
        const palaceIndex = VALID_PALACES_CLOCKWISE.indexOf(sugg.palaceId);
        if (palaceIndex === -1) return;
        const palaceShortName = arrangedLifePalaces[palaceIndex];
        const palaceFullName = palaceFullNameMap[palaceShortName] || palaceShortName;

        let titleParts = [palaceFullName];
        if (sdrData[sugg.palaceId]?.includes('身')) titleParts.push('身宮');
        if (sdrData[sugg.palaceId]?.includes('日')) titleParts.push('日宮');
        if (sdrData[sugg.palaceId]?.includes('時')) titleParts.push('時宮');
        
        html += `<div class="remedy-item">${titleParts.join('/')}: ${sugg.starName}`;
        
        // ▼▼▼ 核心修改點：為「每一個」建議，都獨立呼叫一次日期搜尋 ▼▼▼
        const auspiciousDays = findDaysForSuggestion(sugg);
        
        if (auspiciousDays.goodDays.length > 0) {
            html += `<br><span class="remedy-good">吉日：</span>${auspiciousDays.goodDays.join('、 ')}`;
        }
        if (auspiciousDays.badDays.length > 0) {
            html += `<br><span class="remedy-bad">凶日：</span>${auspiciousDays.badDays.join('、 ')}`;
        }
        if (sugg.goodBranches.length > 0) {
             html += `<br><span class="remedy-good">吉日地支：</span>${sugg.goodBranches.join('、')}`;
        }
        html += `</div>`;
    });
    
    return html;
    }
    // ▼▼▼ 分析「科甲年份」(祿主+飛祿/飛馬) 的引擎函式 (v4-修正寄宮查找順序) ▼▼▼
    function findKeJiaYears(data) {
        const results = {
            allThree: [],
            luZhuAndFeiLu: [],
            luZhuAndFeiMa: []
        };
        if (!data || !data.chartModel || !data.dayPillar || !data.hourPillar || !data.lookupResult) return results;

        // --- 步驟 A: 找出「天元祿主」星曜的名稱 ---
        const dayStem = data.dayPillar.charAt(0);
        const luZhuStarName = RI_GAN_HUA_YAO[dayStem]?.luZhu[0];
        if (!luZhuStarName) return results;

        // --- 步驟 B (全新修正): 依照你指定的優先序，找出「天元祿主」的最終宮位 ---
        let luZhuPalaceId = null;

        // 1. 先查「天元祿主」是否在乾艮巽坤四個宮位 (四隅寄宮)
        const cornerPalaceIds = ['pQian', 'pGen', 'pXun', 'pKun'];
        for (const cornerId of cornerPalaceIds) {
            if (data.chartModel[cornerId]?.stars[luZhuStarName]) {
                luZhuPalaceId = JI_GONG_MAP[cornerId]; // 找到後，直接取用它寄宿的地支宮位
                break; // 找到就立刻跳出迴圈
            }
        }

        // 2. 如果上面沒找到，再查「天元祿主」是否在中宮 (中宮寄宮)
        if (!luZhuPalaceId && data.suanStarsResult.centerStars.includes(luZhuStarName)) {
            const zhuSuan = data.lookupResult.主算;
            const hostBranch = CENTER_PALACE_JI_GONG_RULES['主算']?.[zhuSuan]?.[luZhuStarName];
            if (hostBranch) {
                luZhuPalaceId = BRANCH_TO_PALACE_ID[hostBranch];
            }
        }

        // 3. 如果上面都沒找到，最後才查十二地支宮位
        if (!luZhuPalaceId) {
            for (const branchPalaceId of VALID_PALACES_CLOCKWISE) {
                 if (data.chartModel[branchPalaceId]?.stars[luZhuStarName]) {
                    luZhuPalaceId = branchPalaceId;
                    break;
                }
            }
        }

        // 如果經過三輪查找，最終還是找不到祿主宮位，就提前結束
        if (!luZhuPalaceId) return results;

        // --- 步驟 C & D (維持不變): 建立飛祿、飛馬地圖，並找出交會年份 ---
        const feiLuMap = {};
        const feiMaMap = {};

        // (建立飛祿地圖的邏輯...)
        const feiLuRule = FEI_LU_ANNUAL_RULES[data.yearPillar.charAt(0)];
        if (feiLuRule) {
            const yangStems = ['甲', '丙', '戊', '庚', '壬'];
            const isDayStemYang = yangStems.includes(dayStem);
            const feiLuDirection = ((isDayStemYang && data.gender === '男') || (!isDayStemYang && data.gender === '女')) ? 1 : -1;
            const feiLuStartPalaceIndex = EARTHLY_BRANCHES.indexOf(feiLuRule.startBranch);
            const guanLuPalaceIndex = data.arrangedLifePalaces.indexOf('官');
            let currentAge = feiLuRule.startAge;
            let currentPalaceIndex = feiLuStartPalaceIndex;
            for (let i = 0; i < 150 && currentAge <= 120; ) {
                const palaceId = VALID_PALACES_CLOCKWISE[currentPalaceIndex];
                feiLuMap[currentAge] = palaceId;
                if (currentPalaceIndex === guanLuPalaceIndex) {
                    feiLuMap[currentAge + 1] = palaceId;
                    feiLuMap[currentAge + 2] = palaceId;
                    currentAge += 3;
                } else {
                    currentAge += 1;
                }
                currentPalaceIndex = (currentPalaceIndex + feiLuDirection + 12) % 12;
            }
        }

        // (建立飛馬地圖的邏輯...)
        const feiMaRule = FEI_MA_ANNUAL_RULES[data.hourPillar.charAt(0)];
        if (feiMaRule) {
            const yangStems = ['甲', '丙', '戊', '庚', '壬'];
            const isDayStemYang = yangStems.includes(dayStem);
            const feiMaDirection = ((isDayStemYang && data.gender === '男') || (!isDayStemYang && data.gender === '女')) ? -1 : 1;
            const feiMaStartPalaceIndex = EARTHLY_BRANCHES.indexOf(feiMaRule.startBranch);
            const jiEPalaceIndex = data.arrangedLifePalaces.indexOf('疾');
            let currentAge = feiMaRule.startAge;
            let currentPalaceIndex = feiMaStartPalaceIndex;
            for (let i = 0; i < 150 && currentAge <= 120; ) {
                const palaceId = VALID_PALACES_CLOCKWISE[currentPalaceIndex];
                feiMaMap[currentAge] = palaceId;
                if (currentPalaceIndex === jiEPalaceIndex) {
                    feiMaMap[currentAge + 1] = palaceId;
                    feiMaMap[currentAge + 2] = palaceId;
                    currentAge += 3;
                } else {
                    currentAge += 1;
                }
                currentPalaceIndex = (currentPalaceIndex + feiMaDirection + 12) % 12;
            }
        }

        for (let age = 1; age <= 106; age++) {
            const feiLuPalace = feiLuMap[age];
            const feiMaPalace = feiMaMap[age];
            const meetsFeiLu = feiLuPalace && feiLuPalace === luZhuPalaceId;
            const meetsFeiMa = feiMaPalace && feiMaPalace === luZhuPalaceId;

            if (meetsFeiLu && meetsFeiMa) {
                results.allThree.push(age);
            } else if (meetsFeiLu) {
                results.luZhuAndFeiLu.push(age);
            } else if (meetsFeiMa) {
                results.luZhuAndFeiMa.push(age);
            }
        }
        
        return results;
    }
    // ▼▼▼ 格式化「科甲年份」顯示文字的函式 (v2-分類版) ▼▼▼
    function formatKeJiaYearsInfo(keJiaYearsData) {
        if (!keJiaYearsData || (keJiaYearsData.allThree.length === 0 && keJiaYearsData.luZhuAndFeiLu.length === 0 && keJiaYearsData.luZhuAndFeiMa.length === 0)) {
            return '<strong>科甲年份：</strong><br>此盤無「祿主祿馬匯集」的年份。';
        }

        let html = '<strong>科甲年份：</strong>';
        
        if (keJiaYearsData.allThree.length > 0) {
            html += `<br><span class="strength-good">三合 (祿主+祿+馬)：</span>${keJiaYearsData.allThree.join('歲、')}歲，能量最強，應重點把握。`;
        }
        if (keJiaYearsData.luZhuAndFeiLu.length > 0) {
            html += `<br><span class="strength-good">雙合 (祿主+飛祿)：</span>${keJiaYearsData.luZhuAndFeiLu.join('歲、')}歲，利於事業與財富累積。`;
        }
        if (keJiaYearsData.luZhuAndFeiMa.length > 0) {
            html += `<br><span class="strength-good">雙合 (祿主+飛馬)：</span>${keJiaYearsData.luZhuAndFeiMa.join('歲、')}歲，利於開拓、升遷與變動。`;
        }
        
        return html;
    }
    // ▼▼▼ 根據24節氣精準判斷命理月份的函式 (最終版) ▼▼▼
    function getSolarTermMonth(date) {
        const year = date.getFullYear();
        const time = date.getTime();

        // 節氣索引對應的月份 (1=寅月, 2=卯月...)
        const termToMonthMap = {
            1: 12, // 小寒 -> 丑月(12)
            3: 1,  // 立春 -> 寅月(1)
            5: 2,  // 驚蟄 -> 卯月(2)
            7: 3,  // 清明 -> 辰月(3)
            9: 4,  // 立夏 -> 巳月(4)
            11: 5, // 芒種 -> 午月(5)
            13: 6, // 小暑 -> 未月(6)
            15: 7, // 立秋 -> 申月(7)
            17: 8, // 白露 -> 酉月(8)
            19: 9, // 寒露 -> 戌月(9)
            21: 10,// 立冬 -> 亥月(10)
            23: 11 // 大雪 -> 子月(11)
        };

        // 從一年的最後一個節氣開始往前找
        for (let i = 24; i >= 1; i--) {
            const termTime = solarLunar.getTerm(year, i);
            if (time >= termTime) {
                // 如果找到了當前日期所在的節氣區間
                // 我們需要找到這個區間的起始「節」
                let startTermIndex = i;
                if (startTermIndex % 2 === 0) { // 如果是「氣」，則退回到前一個「節」
                    startTermIndex--;
                }
                return termToMonthMap[startTermIndex];
            }
        }
        // 如果跨年了（例如在1月1日到小寒之間），則查找去年的大雪
        const lastYearTermTime = solarLunar.getTerm(year - 1, 23); // 去年大雪
        if (time >= lastYearTermTime) {
            return 11; // 子月
        }
        return 12; // 預設為丑月
    }

    // ▼▼▼ 取得「分析年份」對應的當前節氣月（立春為界；今天不在該命理年則回傳 null）▼▼▼
    // 兩個月運表（百六小限論月、小限月運）皆以節氣換月：正月＝立春起、二月＝驚蟄起……
    function getCurrentJieQiMonthForYear(targetYear) {
        const now = new Date();
        const jieQiMonth = getSolarTermMonth(now);
        // 命理年以立春為界：立春前屬前一年
        let mingLiYear = now.getFullYear();
        const liChunTime = solarLunar.getTerm(now.getFullYear(), 3); // 3 = 立春
        if (now.getTime() < liChunTime) mingLiYear -= 1;
        if (Number(targetYear) !== mingLiYear) return null;
        return jieQiMonth;
    }

    // ▼▼▼ 根據西元年查詢該年干支的函式 ▼▼▼
    function getAnnualPillar(targetYear) {
        // 我們取該年3月1日作為代表，確保已過立春，能抓到正確的干支
        const representativeDate = solarLunar.solar2lunar(targetYear, 3, 1);
        return representativeDate.getYearInGanZhi();
    }

    // ▼▼▼ (新) 取得日主五行「資料」的函式 ▼▼▼
    function getDayMasterData(dayStem) {
        if (!dayStem || !DAY_MASTER_DATA[dayStem]) {
            return null;
        }
        const data = DAY_MASTER_DATA[dayStem];
        return {
            stem: dayStem,
            element: data.element,
            yinYang: data.yinYang
        };
    }

    // ▼▼▼ 取得日主五行資訊的函式 (v2 - 單一整合版) ▼▼▼
    function getDayMasterInfo(dayMasterData) {
        if (!dayMasterData) {
            return '日主五行：無法判斷';
        }
        return `日主五行：${dayMasterData.stem}${dayMasterData.element} (${dayMasterData.yinYang}${dayMasterData.element})`;
    }

    // ▼▼▼ (已整合寄宮規則) 分析年干化曜所在宮位的函式 ▼▼▼
    function analyzeAnnualHuaYaoPalaces(annualStem, chartModel, arrangedLifePalaces, lookupResult, suanStarsResult, structuredOut /* 可選：傳入陣列接住結構化結果 */) {
        if (!annualStem || !chartModel || !lookupResult) {
            return '無法分析';
        }

        const huaYaoRule = NIAN_GAN_HUA_YAO[annualStem];
        if (!huaYaoRule) {
            return '該年天干無化曜';
        }

        const results = [];

        // 這是我們新的、更聰明的星曜查找器
        const findStarFinalPalaceId = (starName) => {
            // 優先序 3: 先查十二地支宮
            for (const palaceId of VALID_PALACES_CLOCKWISE) {
                if (chartModel[palaceId]?.stars[starName]) {
                    return palaceId;
                }
            }

            // 優先序 1: 檢查四隅宮位
            for (const cornerPalaceId in JI_GONG_MAP) {
                if (chartModel[cornerPalaceId]?.stars[starName]) {
                    return JI_GONG_MAP[cornerPalaceId]; // 返回寄宿的宮位ID
                }
            }
            
            // 優先序 2: 檢查中宮
            if (suanStarsResult?.centerStars.includes(starName)) {
                const zhuSuan = lookupResult.主算;
                const keSuan = lookupResult.客算;
                let hostBranch = null;

                if (['主大', '主參'].includes(starName) && zhuSuan && CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan]) {
                    hostBranch = CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan][starName];
                } else if (['客大', '客參'].includes(starName) && keSuan && CENTER_PALACE_JI_GONG_RULES['客算'][keSuan]) {
                    hostBranch = CENTER_PALACE_JI_GONG_RULES['客算'][keSuan][starName];
                }
                
                if (hostBranch) {
                    return BRANCH_TO_PALACE_ID[hostBranch]; // 返回寄宿的宮位ID
                }
            }

            return null; // 如果都找不到，返回 null
        };

        // 遍歷該天干的所有化曜規則 (tianYuan, ganYuan, fuMu)
        for (const role in huaYaoRule) {
            const starNames = huaYaoRule[role];
            starNames.forEach(starName => {
                const finalPalaceId = findStarFinalPalaceId(starName); // 使用新的查找器
                if (finalPalaceId) {
                    const palaceIndex = VALID_PALACES_CLOCKWISE.indexOf(finalPalaceId);
                    if (palaceIndex > -1) {
                        const lifePalaceName = arrangedLifePalaces[palaceIndex];
                        const chineseRoleName = HUA_YAO_ROLE_MAP[role];
                        results.push(`${chineseRoleName}(${starName})在${lifePalaceName}宮`);
                        // ▼▼▼ 新增：同時寫入結構化版本（供 Skill 用）▼▼▼
                        if (structuredOut) {
                            const dedupKey = `${chineseRoleName}|${starName}|${finalPalaceId}`;
                            if (!structuredOut.some(s => `${s.role}|${s.star}|${s.palaceId}` === dedupKey)) {
                                structuredOut.push({
                                    role: chineseRoleName,
                                    star: starName,
                                    palaceId: finalPalaceId,
                                    palaceShortName: lifePalaceName,
                                    palaceFullName: PALACE_FULL_NAME_MAP[lifePalaceName] || lifePalaceName
                                });
                            }
                        }
                    }
                }
            });
        }
        
        if (results.length === 0) {
            return '無吉曜入十二宮';
        }

        return [...new Set(results)].join('、 ');
    }

    // ▼▼▼ 分析日主與流年干支的生剋關係引擎 ▼▼▼
    function analyzeYearlyElementInteraction(dayPillar, annualPillar) {
        if (!dayPillar || !annualPillar) {
            return { stemAnalysis: '缺少分析資料', branchAnalysis: '', isMajorClash: false };
        }

        const dayStem = dayPillar.charAt(0);
        const dayBranch = dayPillar.charAt(1);
        const annualStem = annualPillar.charAt(0);
        const annualBranch = annualPillar.charAt(1);

        const stemRule = STEM_INTERACTIONS[dayStem];
        const branchRule = BRANCH_INTERACTIONS[dayBranch];

        let stemAnalysis = '天干無合剋';
        let branchAnalysis = '地支無合衝';
        let isMajorClash = false;

        // 判斷天干關係
        if (stemRule.combinesWith === annualStem) {
            stemAnalysis = `天干${dayStem}${annualStem}相合`;
        } else if (stemRule.clashesWith === annualStem) {
            stemAnalysis = `天干${dayStem}${annualStem}相剋`;
        }

        // 判斷地支關係
        if (branchRule.combinesWith === annualBranch) {
            branchAnalysis = `地支${dayBranch}${annualBranch}相合`;
        } else if (branchRule.clashesWith === annualBranch) {
            branchAnalysis = `地支${dayBranch}${annualBranch}相衝`;
        }

        // 判斷是否為「天剋地衝」
        if (stemRule.clashesWith === annualStem && branchRule.clashesWith === annualBranch) {
            isMajorClash = true;
        }

        return { stemAnalysis, branchAnalysis, isMajorClash };
    }

    // ▼▼▼ (v2 - 已整合解釋) 分析日主與流年干支「十神」關係的引擎 ▼▼▼
    function analyzeTenGods(dayMasterData, annualPillar) {
        if (!dayMasterData || !annualPillar) {
            return null;
        }

        const dayStem = dayMasterData.stem;
        const annualStem = annualPillar.charAt(0);
        const annualBranch = annualPillar.charAt(1);

        const stemTenGodName = TEN_GODS_MAP[dayStem]?.[annualStem] || '未知';
        const stemTenGodExplanation = TEN_GODS_EXPLANATIONS[stemTenGodName] || '';

        const hiddenStem = BRANCH_HIDDEN_STEMS[annualBranch];
        let branchTenGodName = '無藏干';
        let branchTenGodExplanation = '';
        if (hiddenStem) {
            branchTenGodName = TEN_GODS_MAP[dayStem]?.[hiddenStem] || '未知';
            branchTenGodExplanation = TEN_GODS_EXPLANATIONS[branchTenGodName] || '';
        }

        return {
            stem: { name: stemTenGodName, explanation: stemTenGodExplanation, character: annualStem },
            branch: { name: branchTenGodName, explanation: branchTenGodExplanation, character: annualBranch, hiddenStem: hiddenStem }
        };
    }

    // ▼▼▼ (v2 - 已修正欄位名稱) 格式化十神關係顯示文字的函式 ▼▼▼
    function formatTenGodsInfo(tenGodsData) {
        if (!tenGodsData || !tenGodsData.stem || !tenGodsData.branch) return '';

        const stemText = `年干「${tenGodsData.stem.character}」為日主之「${tenGodsData.stem.name}」`;
        const branchText = `年支「${tenGodsData.branch.character}」(藏${tenGodsData.branch.hiddenStem})為日主之「${tenGodsData.branch.name}」`;
        
        return `<div>${stemText}<br>${branchText}</div>`;
    }

    // ▼▼▼ 格式化生剋關係顯示文字的函式 ▼▼▼
    function formatElementInteractionInfo(interactionData) {
        if (!interactionData) return '';
        
        let html = `<div>${interactionData.stemAnalysis}，${interactionData.branchAnalysis}</div>`;
        if (interactionData.isMajorClash) {
            html += `<div style="color: red; font-weight: bold;">注意：此年為天剋地衝，行事宜保守謹慎，並多注意健康。</div>`;
        }
        return html;
    }

    // ▼▼▼ 查找天剋地衝年份的引擎函式 ▼▼▼
    function findTianKeDiChongYears(dayPillar, startYear, endYear) {
        const clashYears = [];
        if (!dayPillar) return clashYears;

        const dayStem = dayPillar.charAt(0);
        const dayBranch = dayPillar.charAt(1);

        // 從資料庫中找出日柱干支的相剋與相衝對象
        const clashingStem = STEM_INTERACTIONS[dayStem]?.clashesWith;
        const clashingBranch = BRANCH_INTERACTIONS[dayBranch]?.clashesWith;

        // 如果日主沒有天干相剋（例如戊、己土），或沒有地支相衝，則直接返回
        if (!clashingStem || !clashingBranch) {
            return clashYears;
        }

        // 遍歷從今年到 2100 年的每一年
        for (let year = startYear; year <= endYear; year++) {
            const annualPillar = getAnnualPillar(year);
            const annualStem = annualPillar.charAt(0);
            const annualBranch = annualPillar.charAt(1);

            // 檢查當年干支是否同時滿足天剋與地衝
            if (annualStem === clashingStem && annualBranch === clashingBranch) {
                clashYears.push(year);
            }
        }
        return clashYears;
    }

    // ▼▼▼ 格式化天剋地衝年份顯示文字的函式 ▼▼▼
    function formatTianKeDiChongInfo(yearsArray) {
        if (!yearsArray || yearsArray.length === 0) {
            return '<div>未來至2100年，無與日柱天剋地衝之年份。</div>';
        }
        const yearsString = yearsArray.join('年、');
        return `<div style="color: red; font-weight: bold;">注意！未來天剋地衝年份：${yearsString}年。</div>`;
    }

    // ▼▼▼ 計算日柱空亡的函式 ▼▼▼
    function calculateKongWang(dayPillar) {
        if (!dayPillar || !KONG_WANG_RULES[dayPillar]) {
            return null; // 如果輸入無效或找不到規則，返回 null
        }
        return KONG_WANG_RULES[dayPillar]; // 返回包含兩個地支的陣列，例如 ['戌', '亥']
    }

    // ▼▼▼ 格式化星曜資料給 AI 使用的專屬函式 ▼▼▼
    function formatStarsForAI(starNames) {
        if (!starNames || starNames.length === 0) {
            return '宮內無主星';
        }
        return starNames.map(name => {
            const props = STAR_PROPERTIES[name];
            if (props) {
                // 組合出 "星曜名稱 (吉凶屬性, 核心描述)" 的格式
                return `${name} (${props.luck}, ${props.description})`;
            }
            return name; // 如果找不到屬性，就只回傳名字
        }).join('、 ');
    }

    // ▼▼▼ 獲取「當月運勢」深度分析的專屬函式 ▼▼▼
    async function getMonthlyAnalysis(data) {
        const n8nWebhookUrl = 'https://nakaiwen.app.n8n.cloud/webhook/71e49418-c32c-4731-b574-57e1c9ae105c';

        // --- 準備月運分析需要的核心數據 ---
        const today = new Date();
        const currentMonthNumber = getSolarTermMonth(today);
        const currentMonthIndex = currentMonthNumber - 1;
        const currentMonthHexagram = data.monthlyHexagramsResult[currentMonthIndex];
        const currentLunarDateStr = MONTH_NAMES_CHINESE[currentMonthIndex];

        const payload = {
            dayMaster: data.dayMasterInfo,
            targetYear: data.targetYear,
            currentLunarDate: currentLunarDateStr,
            monthHexagramName: currentMonthHexagram?.hexagram?.name || '資料空缺',
            monthHexagramExplanation: currentMonthHexagram?.hexagram?.explanation || '資料空缺'
        };

        try {
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) { throw new Error(`n8n 伺服器錯誤: ${response.statusText}`); }

        const result = await response.json();
        console.log('n8n 回傳原始資料:', result);

        // --- 2. 強化解析邏輯 (相容物件與陣列) ---
        let aiText = "";
        // 判斷是否為陣列，若是則取第一個元素
        const dataObj = Array.isArray(result) ? result[0] : result;

        if (dataObj.content && dataObj.content.parts && dataObj.content.parts[0]) {
            aiText = dataObj.content.parts[0].text;
        } else {
            aiText = dataObj.output || dataObj.text || (dataObj.message && dataObj.message.content) || "";
        }

        if (!aiText) {
            console.error('解析失敗，原始資料結構為:', result);
            throw new Error('無法從回傳資料中提取文字內容');
        }

        // --- 3. 清理文字 (精準控制：標題銜接，1.2.3. 保持分段) ---

        // A. 處理標題後的斷行 (例如 "**標題**:\n" 變成 "**標題**: ")
        aiText = aiText.replace(/(\*\*.*?\*\*[:：])\s*\n/g, '$1 ');

        // B. 處理標號與標題之間的斷行 (例如 "1.\n **標題**" 變成 "1. **標題**")
        aiText = aiText.replace(/(\d+\.)\s*\n\s*(\*\*)/g, '$1 $2');

        // C. 關鍵修正：確保 1. 2. 3. 之前一定有雙換行，強制 Markdown 分段
        // 尋找句號或分號後接數字標號的情況，補上兩個換行符號
        aiText = aiText.replace(/([。！?？;；])\s*(?=\d+\.)/g, '$1\n\n');

        // D. 處理句子中間不必要的單個硬斷行，但避開清單項目
        // 只有在換行符號後面「不是數字標點」時才合併文字
        aiText = aiText.replace(/([^\n])\n(?!\d+\.)([^\n])/g, '$1$2');

        // --- 4. 渲染到網頁 ---
        return typeof marked !== 'undefined' ? marked.parse(aiText) : aiText;

    } catch (error) {
        console.error('呼叫 n8n 月運分析時發生錯誤:', error);
        return '<h4>月運分析失敗</h4><p>無法解析 AI 回傳內容，請檢查控制台資料結構。</p>';
    }
    }

    // ▼▼▼ 【修正版】計算「年積數」與「月積數」 (引入冬至換年邏輯) ▼▼▼
    function calculateNationalJishu(year, month, day, hour) {
        // 檢查收到的參數是否有效
        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
            return {
                annualJishu: 0, annualBureau: '', annualGanZhi: '',
                monthlyJishu: 0, monthlyBureau: '', monthlyGanZhi: ''
            };
        }

        // --- 【新增】冬至換年邏輯 ---
        // 1. 取得當年的冬至時間 (termIndex 24 代表冬至)
        // solarLunar.getTerm 回傳的是該節氣的 timestamp
        const dongZhiTime = solarLunar.getTerm(year, 24);
        const currentDate = new Date(year, month - 1, day, hour);
        
        // 2. 判斷是否已過冬至
        // 如果當前時間 >= 冬至，太乙年視為下一年 (year + 1)
        // 否則維持當年 (year)
        let taiYiYear = year;
        if (currentDate.getTime() >= dongZhiTime) {
            taiYiYear = year + 1;
        }

        // 3. 計算年積數 (使用 taiYiYear)
        const annualJishu = TAI_YI_BASE_JISHU + taiYiYear;
        const annualBureauRem = annualJishu % 72;
        const annualBureauNum = (annualBureauRem === 0) ? 72 : annualBureauRem;
        const annualBureau = `陽${annualBureauNum}局`;
        const annualGanZhiRem = annualJishu % 60;
        const annualGanZhiIndex = (annualGanZhiRem === 0) ? 59 : annualGanZhiRem - 1;
        const annualGanZhi = JIAZI_CYCLE_ORDER[annualGanZhiIndex];

        // 4. 精準月積數計算 (使用 taiYiYear 為基準)
        const lunarDate = solarLunar.solar2lunar(year, month, day, hour);
        const monthBranch = lunarDate.getMonthInGanZhi().charAt(1);
        const monthBranchIndex = EARTHLY_BRANCHES.indexOf(monthBranch);
        
        // 計算基礎月積數
        const baseHaiJishu = (TAI_YI_BASE_JISHU + taiYiYear) * 12;
        const offset = monthBranchIndex - 11; // 子=-11, 亥=0
        let monthlyJishu = baseHaiJishu + offset;

        // 【邏輯修正】處理子月和丑月的跨年銜接
        // 情況 A (冬至前): taiYiYear 尚未+1，但月份已是年底的子/丑月，需要 +12 (視為下一年的開端)
        // 情況 B (冬至後): taiYiYear 已經+1，baseHaiJishu 已經包含了一整年的月份 (12個月)，
        //                此時子月(-11)會自動對應到新的一年的第一個月，因此不需要再 +12
        if (taiYiYear === year && (monthBranch === '子' || monthBranch === '丑') && month >= 11) {
            monthlyJishu += 12;
        }

        const monthlyBureauRem = monthlyJishu % 72;
        const monthlyBureauNum = (monthlyBureauRem === 0) ? 72 : monthlyBureauRem;
        const monthlyBureau = `陽${monthlyBureauNum}局`;
        const monthlyGanZhiRem = monthlyJishu % 60;
        const monthlyGanZhiIndex = (monthlyGanZhiRem === 0) ? 59 : monthlyGanZhiRem - 1;
        const monthlyGanZhi = JIAZI_CYCLE_ORDER[monthlyGanZhiIndex];

        return {
            annualJishu,
            annualBureau,
            annualGanZhi,
            monthlyJishu,
            monthlyBureau,
            monthlyGanZhi
        };
    }

    // ▼▼▼ 【修正版V3】通用五福星計算 (修正月五福亥月基準倒推) ▼▼▼
    function calculateWuFu(jishuInput, namePrefix) {
        if (jishuInput === null || jishuInput === undefined) return null;

        const WU_FU_BASE_JISHU = 423007;
        const CYCLE = 225;
        const UNITS_PER_PALACE = 45;
        let finalJishu; 
        let remainder;

        switch (namePrefix) {
            case '年五福':
                // jishuInput 這裡傳入的是 taiYiYear (太乙年)
                finalJishu = WU_FU_BASE_JISHU + jishuInput; 
                remainder = Number(finalJishu) % CYCLE;
                break;

            case '月五福':
                const { taiYiYear, monthBranch, isYearEnd } = jishuInput;
                const baseJishuForHai = (WU_FU_BASE_JISHU + taiYiYear) * 12;
                let baseRemainder = baseJishuForHai % CYCLE;
                if (baseRemainder === 0) baseRemainder = CYCLE;

                let branchIndex = EARTHLY_BRANCHES.indexOf(monthBranch);
                if (isYearEnd && (monthBranch === '子' || monthBranch === '丑')) {
                    branchIndex += 12;
                }

                const haiIndex = 11;
                const diff = haiIndex - branchIndex;
                remainder = baseRemainder - diff;
                
                while (remainder <= 0) remainder += CYCLE;
                while (remainder > CYCLE) remainder -= CYCLE;
                break;

            default:
                remainder = Number(jishuInput) % CYCLE;
                break;
        }

        if (remainder === 0) remainder = CYCLE;

        const palaceIndex = Math.floor((remainder - 1) / UNITS_PER_PALACE);
        const palaceName = (palaceIndex < WU_FU_ORDER.length) ? WU_FU_ORDER[palaceIndex] : null;

        if (!palaceName) return null;

        const finalSubNumber = (remainder - 1) % UNITS_PER_PALACE + 1;

        return {
            palace: palaceName,
            text: `${namePrefix}${finalSubNumber}`
        };
    }

    // ▼▼▼ 偵測「流年年盤星曜」對「本命宮位」的觸發感應 (專精版 + 年五福修正) ▼▼▼
    function getAnnualPalaceActivation(targetYear, natalLifePalaces) {
        const national = calculateNationalJishu(targetYear, 6, 22, 12);
        if (!national) return [];

        const annualJishu = national.annualJishu;
        const annualBureau = national.annualBureau; 
        const annualStem = national.annualGanZhi.charAt(0);
        
        const annualLookup = lookupBureauData(annualBureau);
        if (!annualLookup) return [];

        const annualSuanStars = calculateSuanStars(annualLookup);

        // ▼▼▼ 新增：計算真正的「太乙年」與「年五福」 ▼▼▼
        const taiYiYear = annualJishu - TAI_YI_BASE_JISHU;
        const annualWuFuResult = calculateWuFu(taiYiYear, '年五福');

        // 建立完整年盤星曜位置字典
        const annualStarLocations = {
            '太乙': annualLookup.太乙,
            '文昌': annualLookup.文昌,
            '始擊': annualLookup.始擊,
            '定目': annualLookup.定目,
            '小遊': calculateXiaoYou(annualJishu),
            '君基': calculateJunJi(annualJishu),
            '臣基': calculateChenJi(annualJishu),
            '民基': calculateMinJi(annualJishu),
            '天乙': calculateTianYi(annualJishu),
            '地乙': calculateDiYi(annualJishu),
            '四神': calculateSiShen(annualJishu),
            '飛符': calculateFeiFu(annualJishu),
            // ▼▼▼ 核心修正：讓資料庫中的 '時五福' 綁定到「年五福」算出來的宮位 ▼▼▼
            '時五福': annualWuFuResult ? annualWuFuResult.palace : null 
        };
        
        if (annualSuanStars && annualSuanStars.chartStars) {
            Object.assign(annualStarLocations, annualSuanStars.chartStars);
        }
        
        if (annualSuanStars && annualSuanStars.centerStars) {
            annualSuanStars.centerStars.forEach(s => {
                let hostBranch = null;
                if (['主大', '主參'].includes(s) && annualLookup.主算 && CENTER_PALACE_JI_GONG_RULES['主算'][annualLookup.主算]) {
                    hostBranch = CENTER_PALACE_JI_GONG_RULES['主算'][annualLookup.主算][s];
                } else if (['客大', '客參'].includes(s) && annualLookup.客算 && CENTER_PALACE_JI_GONG_RULES['客算'][annualLookup.客算]) {
                    hostBranch = CENTER_PALACE_JI_GONG_RULES['客算'][annualLookup.客算][s];
                }
                annualStarLocations[s] = hostBranch || '中';
            });
        }

        const activationRules = NIAN_GAN_HUA_YAO[annualStem]; 
        if (!activationRules) return [];
        
        const activations = [];
        const cornerMapping = { '乾': '亥', '艮': '寅', '巽': '巳', '坤': '申' };

        for (const roleKey in activationRules) {
            const starNames = activationRules[roleKey]; 
            const roleName = HUA_YAO_ROLE_MAP[roleKey];

            starNames.forEach(starName => {
                const annualBranch = annualStarLocations[starName]; 
                
                if (annualBranch && annualBranch !== '中') {
                    const actualBranch = cornerMapping[annualBranch] || annualBranch;
                    const palaceId = BRANCH_TO_PALACE_ID[actualBranch];
                    const palaceIndex = VALID_PALACES_CLOCKWISE.indexOf(palaceId);
                    
                    if (palaceIndex !== -1) {
                        const natalPalaceName = natalLifePalaces[palaceIndex]; 
                        activations.push({
                            starName: starName === '時五福' ? '五福' : starName, // 讓顯示文字變漂亮
                            roleName: roleName,
                            branch: actualBranch,
                            natalPalace: PALACE_FULL_NAME_MAP[natalPalaceName] || natalPalaceName
                        });
                    }
                }
            });
        }
        return activations;
    }

    // ▼▼▼ 升級版：偵測「本命日干支」化曜 (五福對應盤面「時五福」) ▼▼▼
    function getNatalDayPalaceActivation(dayPillar, chartModel, arrangedLifePalaces, suanStarsResult, lookupResult) {
        if (!dayPillar) return [];
        const dayStem = dayPillar.charAt(0);
        const dayBranch = dayPillar.charAt(1);
        const activations = [];

        const findStarFinalPalaceInfo = (starName) => {
            // 本命盤：遇到化曜規則寫「五福」時，直接去找盤面上的「時五福」
            const actualStarName = starName === '五福' ? '時五福' : starName;
            
            for (const palaceId of VALID_PALACES_CLOCKWISE) {
                if (chartModel[palaceId]?.stars[actualStarName]) return { branch: PALACE_ID_TO_BRANCH[palaceId], natalPalace: arrangedLifePalaces[VALID_PALACES_CLOCKWISE.indexOf(palaceId)] };
            }
            for (const cornerId in JI_GONG_MAP) {
                if (chartModel[cornerId]?.stars[actualStarName]) return { branch: PALACE_ID_TO_BRANCH[JI_GONG_MAP[cornerId]], natalPalace: arrangedLifePalaces[VALID_PALACES_CLOCKWISE.indexOf(JI_GONG_MAP[cornerId])] };
            }
            if (suanStarsResult?.centerStars.includes(actualStarName)) {
                const zhuSuan = lookupResult.主算; const keSuan = lookupResult.客算;
                let hostBranch = null;
                if (['主大', '主參'].includes(actualStarName) && zhuSuan && CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan]) hostBranch = CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan][actualStarName];
                else if (['客大', '客參'].includes(actualStarName) && keSuan && CENTER_PALACE_JI_GONG_RULES['客算'][keSuan]) hostBranch = CENTER_PALACE_JI_GONG_RULES['客算'][keSuan][actualStarName];
                if (hostBranch) return { branch: hostBranch, natalPalace: arrangedLifePalaces[VALID_PALACES_CLOCKWISE.indexOf(BRANCH_TO_PALACE_ID[hostBranch])] };
            }
            return null;
        };

        const processRules = (rules, type) => {
            if (!rules) return;
            for (const roleKey in rules) {
                const starNames = rules[roleKey];
                const roleName = HUA_YAO_ROLE_MAP[roleKey];
                starNames.forEach(starName => {
                    const info = findStarFinalPalaceInfo(starName);
                    if (info) activations.push({ type: type, starName: starName, roleName: roleName, branch: info.branch, natalPalace: PALACE_FULL_NAME_MAP[info.natalPalace] || info.natalPalace });
                });
            }
        };

        processRules(RI_GAN_HUA_YAO[dayStem], '日干');
        processRules(RI_ZHI_HUA_YAO[dayBranch], '日支');
        return activations;
    }

    // ▼▼▼ 新增：偵測「流日干支」化曜 (五福對應外來的「日五福」並寄宮) ▼▼▼
    function getTransitDayPalaceActivation(transitGanZhi, chartModel, arrangedLifePalaces, suanStarsResult, lookupResult, transitDayJishu) {
        if (!transitGanZhi) return [];
        const dayStem = transitGanZhi.charAt(0);
        const dayBranch = transitGanZhi.charAt(1);
        const activations = [];

        // 1. 計算「流日的日五福」的原始宮位
        let wuFuBranch = null;
        if (transitDayJishu) {
            const wuFuResult = calculateWuFu(transitDayJishu, '日五福');
            if (wuFuResult) wuFuBranch = wuFuResult.palace;
        }

        const findStarFinalPalaceInfo = (starName) => {
            // 流日盤：遇到「五福」時，使用剛剛算出來的「日五福」並套用寄宮規則
            if (starName === '五福') {
                if (wuFuBranch) {
                    const initialPalaceId = BRANCH_TO_PALACE_ID[wuFuBranch];
                    const actualPalaceId = JI_GONG_MAP[initialPalaceId] || initialPalaceId; // 若在四維卦則套用寄宮
                    const actualBranch = PALACE_ID_TO_BRANCH[actualPalaceId];
                    const palaceIndex = VALID_PALACES_CLOCKWISE.indexOf(actualPalaceId);
                    if (palaceIndex !== -1) {
                        return { branch: actualBranch, natalPalace: arrangedLifePalaces[palaceIndex] };
                    }
                }
                return null; // 五福處理完畢，直接返回
            }

            // 其餘星曜維持比對本命盤的邏輯
            for (const palaceId of VALID_PALACES_CLOCKWISE) {
                if (chartModel[palaceId]?.stars[starName]) return { branch: PALACE_ID_TO_BRANCH[palaceId], natalPalace: arrangedLifePalaces[VALID_PALACES_CLOCKWISE.indexOf(palaceId)] };
            }
            for (const cornerId in JI_GONG_MAP) {
                if (chartModel[cornerId]?.stars[starName]) return { branch: PALACE_ID_TO_BRANCH[JI_GONG_MAP[cornerId]], natalPalace: arrangedLifePalaces[VALID_PALACES_CLOCKWISE.indexOf(JI_GONG_MAP[cornerId])] };
            }
            if (suanStarsResult?.centerStars.includes(starName)) {
                const zhuSuan = lookupResult.主算; const keSuan = lookupResult.客算;
                let hostBranch = null;
                if (['主大', '主參'].includes(starName) && zhuSuan && CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan]) hostBranch = CENTER_PALACE_JI_GONG_RULES['主算'][zhuSuan][starName];
                else if (['客大', '客參'].includes(starName) && keSuan && CENTER_PALACE_JI_GONG_RULES['客算'][keSuan]) hostBranch = CENTER_PALACE_JI_GONG_RULES['客算'][keSuan][starName];
                if (hostBranch) return { branch: hostBranch, natalPalace: arrangedLifePalaces[VALID_PALACES_CLOCKWISE.indexOf(BRANCH_TO_PALACE_ID[hostBranch])] };
            }
            return null;
        };

        const processRules = (rules, type) => {
            if (!rules) return;
            for (const roleKey in rules) {
                const starNames = rules[roleKey];
                const roleName = HUA_YAO_ROLE_MAP[roleKey];
                starNames.forEach(starName => {
                    const info = findStarFinalPalaceInfo(starName);
                    if (info) activations.push({ type: type, starName: starName, roleName: roleName, branch: info.branch, natalPalace: PALACE_FULL_NAME_MAP[info.natalPalace] || info.natalPalace });
                });
            }
        };

        processRules(RI_GAN_HUA_YAO[dayStem], '流日干');
        processRules(RI_ZHI_HUA_YAO[dayBranch], '流日支');
        return activations;
    }

    // ▼▼▼ 從 n8n 獲取 AI 分析結果的專屬函式 (安全修正 + 月份分段版) ▼▼▼
    async function getN8nAnalysis(data) {
    const n8nWebhookUrl = 'https://nakaiwen.app.n8n.cloud/webhook/363afd96-b5b8-4ef5-bba4-f06ebbb1e484';

    // --- 準備資料 (保持原有邏輯) ---
    const today = new Date();
    const currentMonthNumber = getSolarTermMonth(today);
    const currentMonthIndex = currentMonthNumber - 1;
    const currentMonthHexagram = data.monthlyHexagramsResult[currentMonthIndex];
    const todayString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    const formattedMonthlyHexagrams = formatMonthlyHexagramsForAI(data.monthlyHexagramsResult);
    const currentLunarDateStr = MONTH_NAMES_CHINESE[currentMonthIndex];

    const payload = {
        bazi: { yearPillar: data.yearPillar, monthPillar: data.monthPillar, dayPillar: data.dayPillar, hourPillar: data.hourPillar },
        dayMaster: data.dayMasterInfo,
        age: data.currentUserAge,
        annualTrendScore: data.annualTrendScore.toFixed(0),
        greatLimitName: PALACE_FULL_NAME_MAP[data.arrangedLifePalaces[data.currentGreatLimitIndex]] || '未知',
        greatLimitStars: formatStarsForAI(Object.keys(data.chartModel[VALID_PALACES_CLOCKWISE[data.currentGreatLimitIndex]]?.stars || {})),
        greatLimitAgeRange: data.greatLimitAgeRange,
        annualPalaceFullName: PALACE_FULL_NAME_MAP[data.annualPalaceShortName] || '未知',
        annualPalaceStars: formatStarsForAI(Object.keys(data.chartModel[data.annualPalaceId]?.stars || {})),
        targetYear: data.targetYear,
        annualHexagram: data.annualHexagramResult,
        changingHexagram: data.annualChangingHexagramResult,
        todayDate: todayString,
        currentLunarDate: currentLunarDateStr,
        annualPillar: data.annualPillar,
        elementInteraction: data.elementInteraction,
        annualHuaYaoInfo: data.annualHuaYaoInfo,
        tenGodsAnalysis: data.tenGodsAnalysis,
        annualHexagramName: data.annualHexagramResult?.name || '資料空缺',
        annualHexagramExplanation: data.annualHexagramResult?.explanation || '資料空缺',
        changingHexagramName: data.changingHexagramResult?.name || '資料空缺',
        changingHexagramExplanation: data.changingHexagramResult?.explanation || '資料空缺',
        monthHexagramName: currentMonthHexagram?.hexagram?.name || '資料空缺',
        monthHexagramExplanation: currentMonthHexagram?.hexagram?.explanation || '資料空缺',
        formattedMonthlyHexagrams: formattedMonthlyHexagrams
    };

    console.log("準備發送到 n8n 的最終資料 (Payload):", JSON.stringify(payload, null, 2));
    
    try {
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) { throw new Error(`n8n 伺服器錯誤: ${response.statusText}`); }

        const result = await response.json();
        console.log('n8n 年運原始資料:', result);

        // --- 核心修正：加入 ?. 安全檢查，防止 undefined 錯誤 ---
        let aiText = "";
        const dataObj = Array.isArray(result) ? result[0] : result;

        // ▼▼▼ 這裡加了問號 (?.) 來防止崩潰 ▼▼▼
        if (dataObj?.content?.parts?.[0]?.text) {
            aiText = dataObj.content.parts[0].text;
        } else {
            // 備用路徑也加上安全檢查
            aiText = dataObj?.output || dataObj?.text || (dataObj?.message && dataObj.message.content) || "";
        }

        if (!aiText) { throw new Error('無法從回傳資料中提取內容 (Result is empty)'); }

        // --- 清理邏輯：確保排版美觀 ---
        
        // 1. (補回) 月份分段：確保「正月、二月...」前有雙換行
        aiText = aiText.replace(/([。！?？;；])\s*(?=(?:正月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月|[一二三四五六七八九十]{1,2}月))/g, '$1\n\n');

        // 2. 標題與說明銜接
        aiText = aiText.replace(/(\*\*.*?\*\*[:：])\s*\n/g, '$1 ');

        // 3. 標號與標題銜接
        aiText = aiText.replace(/(\d+\.)\s*\n\s*(\*\*)/g, '$1 $2');

        // 4. 確保數字列表前有雙換行
        aiText = aiText.replace(/([。！?？;；])\s*(?=\d+\.)/g, '$1\n\n');

        // 5. 移除句子中間單個斷行 (排除月份與清單，避免誤刪)
        aiText = aiText.replace(/([^\n])\n(?!(?:\d+\.|正月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月|[一二三四五六七八九十]{1,2}月))([^\n])/g, '$1$2');

        return typeof marked !== 'undefined' ? marked.parse(aiText) : aiText;

    } catch (error) {
        console.error('呼叫 n8n 時發生錯誤:', error);
        // 回傳錯誤訊息時，稍微美化一下，讓使用者知道不是程式壞掉，是連線問題
        return `<h4>分析失敗</h4><p>無法取得內容，請稍後再試。</p><p style="font-size:12px;color:#999">錯誤代碼: ${error.message}</p>`;
    }
    }

    // ▼▼▼ 產生個人資訊頁首 HTML 的共用函式 ▼▼▼
    function generatePersonalInfoHeaderHTML(data, reportTypeTitle) {
        const userName = document.getElementById('user-name').value || '未提供';
        const year = data.birthDate.split('/')[0];
        const month = data.birthDate.split('/')[1];
        const day = data.birthDate.split('/')[2];
        const hour = document.getElementById('birth-hour').value;

        // 組合出最終的 HTML 字串
        const headerHTML = `
            <div class="report-header">
                <h2>${data.targetYear}年 ${reportTypeTitle}</h2>
                <hr>
                <p><span class="info-label"><strong>姓名：</strong></span>${userName}</p>
                <p><span class="info-label"><strong>生日：</strong></span>${year}.${month}.${day} ${hour}時</p>
                <p><span class="info-label"><strong>四柱：</strong></span>${data.yearPillar} ${data.monthPillar} ${data.dayPillar} ${data.hourPillar}</p>
            </div>
        `;
        return headerHTML;
    }


    // ▼▼▼ V23：沿用 V1.19 PDF 分頁與檔名輸出設定 ▼▼▼
    // 說明：
    // 保留 V19 之後「中文不亂碼」的圖片式輸出，
    // 但分頁方式改回 V1.19 較穩定的「整份報告連續切片」邏輯，
    // 避免一個區塊一張圖造成版面過度跳頁或分頁節奏怪異。
    async function exportElementAsRasterPdf(element, filename, options = {}) {
        if (!element) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

        const pageWidth = 210;
        const pageHeight = 297;
        const marginX = options.marginX ?? 8;
        const marginTop = options.marginTop ?? 8;
        const marginBottom = options.marginBottom ?? 8;
        const contentWidth = pageWidth - marginX * 2;
        const contentHeight = pageHeight - marginTop - marginBottom;
        const backgroundColor = options.backgroundColor || '#fffaf0';
        const pageBackgroundColor = options.pageBackgroundColor || backgroundColor;

        function hexToRgb(hex) {
            const normalized = String(hex || '#fffaf0').replace('#', '').trim();
            const full = normalized.length === 3
                ? normalized.split('').map(ch => ch + ch).join('')
                : normalized;
            const value = parseInt(full, 16);
            return {
                r: (value >> 16) & 255,
                g: (value >> 8) & 255,
                b: value & 255
            };
        }

        function paintPdfPageBackground() {
            const rgb = hexToRgb(pageBackgroundColor);
            doc.setFillColor(rgb.r, rgb.g, rgb.b);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }

        function addSlice(canvas, offsetY, sliceHeight) {
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeight;

            const ctx = pageCanvas.getContext('2d');
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
                canvas,
                0, offsetY, canvas.width, sliceHeight,
                0, 0, pageCanvas.width, pageCanvas.height
            );

            const imgHeightMm = sliceHeight * contentWidth / canvas.width;
            doc.addImage(pageCanvas.toDataURL('image/jpeg', 0.98), 'JPEG', marginX, marginTop, contentWidth, imgHeightMm);
        }

        paintPdfPageBackground();

        if (document.fonts && document.fonts.ready) {
            try { await document.fonts.ready; } catch (e) {}
        }

        const originalInlineStyle = {
            position: element.style.position,
            left: element.style.left,
            top: element.style.top,
            zIndex: element.style.zIndex,
            opacity: element.style.opacity,
            visibility: element.style.visibility,
            pointerEvents: element.style.pointerEvents
        };

        element.style.position = 'absolute';
        element.style.left = '0';
        element.style.top = '0';
        element.style.zIndex = '-1';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.pointerEvents = 'none';

        try {
            const canvas = await html2canvas(element, {
                scale: options.scale || 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor,
                scrollX: 0,
                scrollY: 0,
                windowWidth: Math.max(element.scrollWidth || 900, 900)
            });

            if (!canvas.width || !canvas.height) return;

            const sliceHeightPx = Math.floor(contentHeight * canvas.width / contentWidth);

            // 計算「不可被分頁切斷」的區塊（標記為 .pdf-no-break，例如太乙命盤、趨勢圖）
            // 在整張長圖上的垂直範圍（換算成 canvas 像素）。
            // 命盤是太乙人道命法最重要的圖，必須完整落在同一頁。
            const totalLayoutHeight = element.scrollHeight || canvas.height;
            const pxRatio = canvas.height / totalLayoutHeight;
            function topWithinElement(node, root) {
                let y = 0;
                let cur = node;
                while (cur && cur !== root) {
                    y += cur.offsetTop || 0;
                    cur = cur.offsetParent;
                    if (cur && cur !== root && !root.contains(cur)) break;
                }
                return y;
            }
            const noBreakBlocks = Array.from(element.querySelectorAll('.pdf-no-break'))
                .map(node => {
                    const top = topWithinElement(node, element) * pxRatio;
                    const height = (node.offsetHeight || 0) * pxRatio;
                    return { top, bottom: top + height, height };
                })
                // 只保護「本身就能放進一頁」的區塊；比一頁還高的（如長篇摘要）無法避免切割。
                .filter(b => b.height > 0 && b.height <= sliceHeightPx - 1);

            let offsetY = 0;
            let pageIndex = 0;

            while (offsetY < canvas.height) {
                if (pageIndex > 0) {
                    doc.addPage();
                    paintPdfPageBackground();
                }

                const remaining = canvas.height - offsetY;
                let sliceHeight = Math.min(sliceHeightPx, remaining);

                // 若這一頁的底部切點會切過某個不可分割區塊，
                // 就把這一頁提早結束在該區塊的上緣，讓它整塊移到下一頁。
                if (sliceHeight < remaining) {
                    let cut = offsetY + sliceHeight;
                    for (const b of noBreakBlocks) {
                        if (b.top > offsetY + 1 && b.top < cut && b.bottom > cut) {
                            cut = Math.min(cut, b.top);
                        }
                    }
                    const adjusted = Math.round(cut - offsetY);
                    if (adjusted > 0) sliceHeight = adjusted;
                }

                addSlice(canvas, offsetY, sliceHeight);

                offsetY += sliceHeight;
                pageIndex += 1;
            }

            doc.save(filename);
        } finally {
            element.style.position = originalInlineStyle.position;
            element.style.left = originalInlineStyle.left;
            element.style.top = originalInlineStyle.top;
            element.style.zIndex = originalInlineStyle.zIndex;
            element.style.opacity = originalInlineStyle.opacity;
            element.style.visibility = originalInlineStyle.visibility;
            element.style.pointerEvents = originalInlineStyle.pointerEvents;
        }
    }


    // ▼▼▼ PDF 報告生成引擎 (v23 - V1.19 分頁設定回復版) ▼▼▼
    async function generatePdfReport(data, elementId, reportTitle) {
        const reportElement = document.getElementById(elementId);
        const downloadBtn = document.getElementById('download-pdf-btn');
        if (!reportElement || !downloadBtn) return;

        const originalBtnText = downloadBtn.textContent;
        downloadBtn.textContent = '報告生成中...';
        downloadBtn.disabled = true;

        try {
            const userName = document.getElementById('user-name')?.value || '未提供';
            const safeTitle = reportTitle || '運勢報告';
            await exportElementAsRasterPdf(
                reportElement,
                `小六太乙-${userName}-${safeTitle}.pdf`,
                {
                    marginX: 12,
                    marginTop: 12,
                    marginBottom: 12,
                    backgroundColor: '#fffaf0',
                    pageBackgroundColor: '#fffaf0',
                    scale: 2
                }
            );
        } catch (error) {
            console.error("產生PDF時發生錯誤:", error);
            alert("產生PDF報告時發生錯誤，請檢查主控台。");
        } finally {
            downloadBtn.textContent = originalBtnText;
            downloadBtn.disabled = false;
        }
    }


    // ▼▼▼ V1.16：正式版 PDF 報告排版引擎 ▼▼▼
    function pdfSafeText(selector, fallback = '—') {
        const el = document.querySelector(selector);
        if (!el) return fallback;
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        return text || fallback;
    }

    function pdfSafeValue(id, fallback = '—') {
        const el = document.getElementById(id);
        if (!el) return fallback;
        return (el.value || el.textContent || '').toString().trim() || fallback;
    }

    function pdfHtml(selector, fallback = '') {
        const el = document.querySelector(selector);
        if (!el) return fallback;
        const html = (el.innerHTML || '').trim();
        return html || fallback;
    }

    function pdfVisibleHtml(selector) {
        const el = document.querySelector(selector);
        if (!el) return '';
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return '';
        const html = (el.innerHTML || '').trim();
        return html ? html : '';
    }

    function pdfGenderText() {
        const checked = document.querySelector('input[name="gender"]:checked');
        if (!checked) return '—';
        return checked.value === 'female' ? '女' : '男';
    }

    function pdfBirthDateText(data) {
        const y = pdfSafeValue('birth-year');
        const m = pdfSafeValue('birth-month');
        const d = pdfSafeValue('birth-day');
        // 出生時間以時辰名稱顯示（取下拉選單目前選中的文字，例如「辰時 (07–09)」）。
        const hourSelect = document.getElementById('birth-hour');
        const shichen = (hourSelect && hourSelect.selectedOptions && hourSelect.selectedOptions[0])
            ? hourSelect.selectedOptions[0].textContent.trim()
            : '—';
        if (y !== '—' && m !== '—' && d !== '—') return `${y} 年 ${m} 月 ${d} 日　${shichen}`;
        return data?.birthDate ? `${data.birthDate}　${shichen}` : '—';
    }

    function pdfFourPillarsText(data) {
        const fromDom = [
            pdfSafeText('#year-pillar-stem', ''), pdfSafeText('#year-pillar-branch', ''),
            pdfSafeText('#month-pillar-stem', ''), pdfSafeText('#month-pillar-branch', ''),
            pdfSafeText('#day-pillar-stem', ''), pdfSafeText('#day-pillar-branch', ''),
            pdfSafeText('#hour-pillar-stem', ''), pdfSafeText('#hour-pillar-branch', '')
        ].join('').trim();
        if (fromDom && fromDom.length >= 4) {
            return `${pdfSafeText('#year-pillar-stem', '')}${pdfSafeText('#year-pillar-branch', '')}　${pdfSafeText('#month-pillar-stem', '')}${pdfSafeText('#month-pillar-branch', '')}　${pdfSafeText('#day-pillar-stem', '')}${pdfSafeText('#day-pillar-branch', '')}　${pdfSafeText('#hour-pillar-stem', '')}${pdfSafeText('#hour-pillar-branch', '')}`;
        }
        return [data?.yearPillar, data?.monthPillar, data?.dayPillar, data?.hourPillar].filter(Boolean).join('　') || '—';
    }

    async function pdfSvgToPngDataUrl(svgSelector) {
        const svg = document.querySelector(svgSelector);
        if (!svg) return '';
        try {
            // 等字型載入完成，盤面文字才會以正確字型量測位置。
            if (document.fonts && document.fonts.ready) {
                try { await document.fonts.ready; } catch (e) {}
            }

            // 把畫面上「實際算出的樣式」逐一寫進複本，
            // 這樣序列化後的 SVG 不必依賴外部 CSS（class），
            // 顏色（彩色宮位、彩色星名、八門紅圈）與文字才能忠實呈現，
            // 等同把螢幕上的盤面直接拍下來。
            const clonedSvg = svg.cloneNode(true);
            const liveEls = [svg, ...svg.querySelectorAll('*')];
            const cloneEls = [clonedSvg, ...clonedSvg.querySelectorAll('*')];
            const styleProps = [
                'fill', 'stroke', 'stroke-width', 'stroke-miterlimit',
                'opacity', 'fill-opacity', 'stroke-opacity',
                'font-family', 'font-size', 'font-weight', 'font-style',
                'text-anchor', 'dominant-baseline', 'display', 'visibility',
                // 星名為直式排列，需保留書寫方向相關屬性，否則會變回橫式。
                'writing-mode', 'text-orientation', 'glyph-orientation-vertical',
                'letter-spacing', 'word-spacing', 'white-space', 'direction'
            ];
            const count = Math.min(liveEls.length, cloneEls.length);
            for (let i = 0; i < count; i++) {
                const cs = window.getComputedStyle(liveEls[i]);
                let inline = '';
                for (const prop of styleProps) {
                    const value = cs.getPropertyValue(prop);
                    if (value) inline += `${prop}:${value};`;
                }
                if (inline) cloneEls[i].setAttribute('style', inline);
            }

            // 盤面的星名／數字是以淡入動畫（.star-visible 由 opacity:0→1）呈現，
            // 匯出時可能還沒淡入完成。這裡在複本上強制設為最終可見狀態，
            // 確保所有星曜文字都會出現在 PDF 裡。
            clonedSvg.querySelectorAll('.dynamic-text').forEach(el => {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
            });

            clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            // 內嵌標楷體子集：序列化後的 SVG 以 <img> 載入時無法存取外部字型，
            // 因此把命盤用字的楷體子集（base64）以 @font-face 寫進 SVG，
            // 命盤文字才會是楷體（而非系統備用字型）。
            if (window.__BIAUKAI_PLATE_FONT) {
                const fontStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style');
                fontStyle.setAttribute('type', 'text/css');
                fontStyle.textContent =
                    "@font-face{font-family:'BiauKaiWeb';" +
                    "src:url(" + window.__BIAUKAI_PLATE_FONT + ") format('woff2');" +
                    "font-weight:normal;font-style:normal;}";
                clonedSvg.insertBefore(fontStyle, clonedSvg.firstChild);
            }

            // 用 viewBox 的原始比例輸出，避免變形；再以較高倍率提升清晰度。
            const viewBox = (svg.getAttribute('viewBox') || '0 0 793.05 826.32').split(/[\s,]+/).map(Number);
            const baseWidth = viewBox[2] || 793.05;
            const baseHeight = viewBox[3] || 826.32;
            clonedSvg.setAttribute('width', baseWidth);
            clonedSvg.setAttribute('height', baseHeight);

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            const exportScale = 3;
            const dataUrl = await new Promise((resolve, reject) => {
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.round(baseWidth * exportScale);
                        canvas.height = Math.round(baseHeight * exportScale);
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#fffaf0';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        URL.revokeObjectURL(url);
                        resolve(canvas.toDataURL('image/png', 0.98));
                    } catch (e) {
                        URL.revokeObjectURL(url);
                        reject(e);
                    }
                };
                img.onerror = reject;
                img.src = url;
            });
            return dataUrl;
        } catch (error) {
            console.warn('命盤 SVG 轉圖失敗，PDF 會略過命盤圖片：', error);
            return '';
        }
    }

    function pdfCanvasDataUrl(selector) {
        const canvas = document.querySelector(selector);
        if (!canvas) return '';
        try {
            if (!canvas.width || !canvas.height) return '';
            return canvas.toDataURL('image/png', 0.95);
        } catch (error) {
            console.warn('趨勢圖轉圖失敗，PDF 會略過趨勢圖：', error);
            return '';
        }
    }

    function pdfInfoCard(label, value) {
        return `<div class="pdf-info-card"><span>${label}</span><strong>${value || '—'}</strong></div>`;
    }

    function pdfSection(title, bodyHtml, extraClass = '') {
        if (!bodyHtml || !bodyHtml.trim()) return '';
        return `<section class="pdf-section ${extraClass}"><h2>${title}</h2><div class="pdf-section-body">${bodyHtml}</div></section>`;
    }


    // ▼▼▼ V22：PDF AI 流月卦象條列格式化 ▼▼▼
    function pdfMonthlyTextToList(rawText) {
        const text = String(rawText || '').replace(/\s+/g, ' ').trim();
        if (!text) return '';

        const monthPattern = /(正月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月)(?=[（(])/g;
        const matches = [...text.matchAll(monthPattern)];

        if (matches.length < 2) return '';

        const items = [];
        for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index;
            const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
            const item = text.slice(start, end).trim().replace(/^[-•・\s]+/, '');
            if (item) items.push(item);
        }

        return `<ul class="pdf-monthly-gua-list">${items.map(item => {
            const formatted = item.replace(
                /^(正月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月)([（(][^）)]*[）)])?\s*[：:]\s*/,
                '<strong>$1$2：</strong>'
            );
            return `<li>${formatted}</li>`;
        }).join('')}</ul>`;
    }

    function pdfFormatMonthlyGuaSections(html) {
        const rawHtml = String(html || '').trim();
        if (!rawHtml) return rawHtml;

        const temp = document.createElement('div');
        temp.innerHTML = rawHtml;

        const headings = Array.from(temp.querySelectorAll('h1,h2,h3,h4,h5,strong,b,p,div'))
            .filter(el => /流月卦象|流月/.test(el.textContent || ''));

        for (const heading of headings) {
            const headingText = (heading.textContent || '').trim();
            if (!/流月卦象|流月/.test(headingText)) continue;

            // 先找標題後方第一個含有 3 個以上月份名稱的段落／區塊。
            let node = heading.nextElementSibling;
            while (node) {
                const listHtml = pdfMonthlyTextToList(node.textContent || '');
                if (listHtml) {
                    node.outerHTML = listHtml;
                    return temp.innerHTML;
                }
                node = node.nextElementSibling;
            }

            // 若標題與內容被包在同一段，嘗試將標題後面的文字拆出。
            const sameText = heading.textContent || '';
            const listHtml = pdfMonthlyTextToList(sameText);
            if (listHtml) {
                const titleOnly = sameText.split(/正月(?=[（(])/)[0].trim();
                heading.innerHTML = titleOnly || '2026年流月卦象總覽';
                heading.insertAdjacentHTML('afterend', listHtml);
                return temp.innerHTML;
            }
        }

        // 最後備援：整段 HTML 純文字內若含十二月份，也轉成條列並附在原內容後。
        const fallbackList = pdfMonthlyTextToList(temp.textContent || '');
        if (fallbackList) {
            return fallbackList;
        }

        return rawHtml;
    }


    function buildBeautifulTaiyiPdfReportHTML(data, plateImage, chartImage) {
        const userName = pdfSafeValue('user-name', '未提供');
        const targetYear = pdfSafeValue('target-year', data?.targetYear || new Date().getFullYear());
        const generatedDate = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const fourPillars = pdfFourPillarsText(data);
        // 摘要原本就以 \n 逐項分行撰寫，PDF 需保留 white-space: pre-wrap 才會斷行條列，
        // 與排盤工具上的顯示一致。
        const mainSummary = `<div class="pdf-summary-prewrap" style="white-space: pre-wrap; line-height: 1.9;">${pdfHtml('#calculation-summary', '尚無摘要內容。')}</div>`;

        const coreInfo = [
            pdfInfoCard('姓名', userName),
            pdfInfoCard('生日', pdfBirthDateText(data)),
            pdfInfoCard('性別', pdfGenderText()),
            pdfInfoCard('分析年份', `${targetYear} 年`),
            pdfInfoCard('四柱', fourPillars),
            pdfInfoCard('日積數／時積數', `${pdfSafeText('#day-jishu-display')} ／ ${pdfSafeText('#hour-jishu-display')}`)
        ].join('');

        const baziHtml = document.getElementById('bazi-pillars-container') ? document.getElementById('bazi-pillars-container').outerHTML : '';
        const resultCards = [
            pdfInfoCard('日主資訊', pdfSafeText('#day-master-info')),
            pdfInfoCard('空亡資訊', pdfSafeText('#kong-wang-info')),
            pdfInfoCard('十神資訊', pdfSafeText('#ten-gods-info')),
            pdfInfoCard('天剋地沖', pdfSafeText('#tianke-dichong-info')),
            pdfInfoCard('五行互動', pdfSafeText('#element-interaction-info'))
        ].join('');

        // 「格局強弱」「補救建議」「趨勢圖」依使用者需求不放入 PDF（自行於排盤工具查看即可）。
        const sideDetails = [
            pdfVisibleHtml('#star-strength-info') ? pdfSection('星曜強弱', pdfVisibleHtml('#star-strength-info'), 'pdf-compact') : '',
            pdfVisibleHtml('#luma-info') ? pdfSection('祿馬資訊', pdfVisibleHtml('#luma-info'), 'pdf-compact') : '',
            pdfVisibleHtml('#kejia-years-info') ? pdfSection('科甲年提示', pdfVisibleHtml('#kejia-years-info'), 'pdf-compact') : ''
        ].join('');

        const plateBlock = plateImage ? `<div class="pdf-plate-frame"><img src="${plateImage}" alt="太乙命盤"></div>` : '<p>命盤圖片尚未產生。</p>';

        return `
            <div class="pdf-cover">
                <div class="pdf-kicker">TAIYI HUMAN DESTINY REPORT</div>
                <h1>太乙人道命法排盤報告</h1>
                <p>以太乙盤面、四柱資訊、命盤要素與限例趨勢整理成完整報告。</p>
                <div class="pdf-cover-meta">
                    <span>姓名：${userName}</span>
                    <span>年份：${targetYear}</span>
                    <span>產製日期：${generatedDate}</span>
                </div>
            </div>

            <section class="pdf-section pdf-no-break">
                <h2>一、基本資料</h2>
                <div class="pdf-info-grid">${coreInfo}</div>
            </section>

            <section class="pdf-section pdf-no-break">
                <h2>二、四柱與命盤概要</h2>
                ${baziHtml}
                <div class="pdf-info-grid pdf-result-grid">${resultCards}</div>
            </section>

            <section class="pdf-section pdf-no-break">
                <h2>三、太乙命盤</h2>
                ${plateBlock}
            </section>

            ${pdfSection('四、限例與流年推演', mainSummary)}
            ${sideDetails}

            <div class="pdf-footer-note">
                本報告依據輸入資料與系統排盤結果產生，適合作為趨勢參考與命理研究紀錄。
            </div>
        `;
    }

    async function generateBeautifulTaiyiPdfReport(data) {
        const downloadBtn = document.getElementById('download-pdf-btn');
        if (!downloadBtn) return;

        const originalBtnText = downloadBtn.textContent;
        downloadBtn.textContent = '美化報告生成中...';
        downloadBtn.disabled = true;

        let reportWrapper = null;
        try {
            const plateImage = await pdfSvgToPngDataUrl('#taiyi-plate');
            const chartImage = pdfCanvasDataUrl('#fortune-chart');

            reportWrapper = document.createElement('div');
            reportWrapper.id = 'pdf-report-layout';
            reportWrapper.classList.add('pdf-raster-output');
            reportWrapper.innerHTML = buildBeautifulTaiyiPdfReportHTML(data || currentChartData || {}, plateImage, chartImage);
            document.body.appendChild(reportWrapper);

            await new Promise(resolve => setTimeout(resolve, 350));

            const userName = pdfSafeValue('user-name', '未提供');
            const targetYear = pdfSafeValue('target-year', data?.targetYear || new Date().getFullYear());

            await exportElementAsRasterPdf(
                reportWrapper,
                `小六太乙-${userName}-${targetYear}年運勢報告.pdf`,
                {
                    marginX: 8,
                    marginTop: 8,
                    marginBottom: 8,
                    backgroundColor: '#fffaf0',
                    pageBackgroundColor: '#fffaf0',
                    scale: 2
                }
            );
        } catch (error) {
            console.error('產生美化 PDF 報告時發生錯誤:', error);
            alert('產生美化 PDF 報告時發生錯誤，請檢查主控台。');
        } finally {
            if (reportWrapper && reportWrapper.parentNode) reportWrapper.parentNode.removeChild(reportWrapper);
            downloadBtn.textContent = originalBtnText;
            downloadBtn.disabled = false;
        }
    }

    // ▼▼▼ 每次增加星都要更新的函式 ▼▼▼
    function generateMainChartData(lookupResult, deitiesResult, suanStarsResult, shiWuFuResult, xiaoYouResult, junJiResult, chenJiResult, minJiResult, tianYiResult, diYiResult, siShenResult, feiFuResult, daYouResult, yueJiangData, guiRenData, xingNianData, huangEnResult) {
    const chartData = {};
    const allPalaceKeys = Object.keys(RADIAL_LAYOUT.angles);
    allPalaceKeys.forEach(key => {
        chartData[key] = {
            lineLeft: { fieldA: "", fieldB: "", fieldG: "" },
            lineCenter: { fieldC: "", fieldD: "", fieldC2: "", fieldD2: "" },
            lineRight:  { fieldE: "", fieldF: "", fieldE2: "", fieldF2: "" }
        };
    });

    // 處理 太乙、文昌、始擊 (您的同宮判斷邏輯)
    if (lookupResult) {
        const starsInPalaces = {};
        const starOrder = ['太乙', '文昌', '始擊'];
        const starLocations = { '太乙': lookupResult.太乙, '文昌': lookupResult.文昌, '始擊': lookupResult.始擊 };
        for (const starName of starOrder) {
            const palaceName = starLocations[starName];
            const palaceId = BRANCH_TO_PALACE_ID[palaceName];
            if (palaceId) {
                if (!starsInPalaces[palaceId]) starsInPalaces[palaceId] = [];
                starsInPalaces[palaceId].push(starName);
            }
        }
        for (const palaceId in starsInPalaces) {
            const stars = starsInPalaces[palaceId];
            if (chartData[palaceId]) {
                if (stars.length === 1) {
                    chartData[palaceId].lineLeft.fieldA = stars[0];
                } else if (stars.length >= 2) {
                    if (stars.includes('太乙')) {
                        chartData[palaceId].lineLeft.fieldA = '太乙';
                        const otherStar = stars.find(s => s !== '太乙');
                        chartData[palaceId].lineLeft.fieldB = otherStar;
                    } else {
                        chartData[palaceId].lineLeft.fieldA = stars[0];
                        chartData[palaceId].lineLeft.fieldB = stars[1];
                    }
                }
            }
        }
    }

    // ▼▼▼ 新增：處理「定目」 ▼▼▼
    if (lookupResult && lookupResult.定目) {
        const palaceName = lookupResult.定目;
        const palaceId = BRANCH_TO_PALACE_ID[palaceName];
        
        if (palaceId && chartData[palaceId]) {
            const lineLeft = chartData[palaceId].lineLeft;
            // 依序尋找 lineLeft 中第一個空的欄位來放入
            if (!lineLeft.fieldA) {
                lineLeft.fieldA = '定目';
            } else if (!lineLeft.fieldB) {
                lineLeft.fieldB = '定目';
            } else if (!lineLeft.fieldG) {
                lineLeft.fieldG = '定目';
            }
        }
    }
    
    // 處理 太歲、合神、計神
    if (deitiesResult) {
        const deitiesInPalaces = {};
        const deityOrder = ['太歲', '合神', '計神'];
        const deityLocations = { '太歲': deitiesResult['太歲'], '合神': deitiesResult['合神'], '計神': deitiesResult['計神'] };
        for (const deityName of deityOrder) {
            const palaceName = deityLocations[deityName];
            const palaceId = BRANCH_TO_PALACE_ID[palaceName];
            if (palaceId) {
                if (!deitiesInPalaces[palaceId]) deitiesInPalaces[palaceId] = [];
                deitiesInPalaces[palaceId].push(deityName);
            }
        }
        for (const palaceId in deitiesInPalaces) {
            const deities = deitiesInPalaces[palaceId];
            if (chartData[palaceId]) {
                if (deities.length > 0) chartData[palaceId].lineRight.fieldE = deities[0];
                if (deities.length > 1) chartData[palaceId].lineRight.fieldF = deities[1];
                if (deities.length > 2) chartData[palaceId].lineRight.fieldE2 = deities[2];
                if (deities.length > 3) chartData[palaceId].lineRight.fieldF2 = deities[3];
            }
        }
    }

    // 處理主參客參定參
    if (suanStarsResult && suanStarsResult.chartStars) {
        const starsInPalaces = {};
        for (const starName in suanStarsResult.chartStars) {
            const palaceName = suanStarsResult.chartStars[starName];
            const palaceId = BRANCH_TO_PALACE_ID[palaceName];
            if (palaceId) {
                if (!starsInPalaces[palaceId]) starsInPalaces[palaceId] = [];
                starsInPalaces[palaceId].push(starName);
            }
        }
        for (const palaceId in starsInPalaces) {
            const stars = starsInPalaces[palaceId];
            if (chartData[palaceId]) {
                const fields = ['fieldC', 'fieldD', 'fieldC2', 'fieldD2'];
                stars.forEach((star, index) => {
                    if (index < fields.length) {
                        if (!chartData[palaceId].lineCenter[fields[index]]) {
                            chartData[palaceId].lineCenter[fields[index]] = star;
                        }
                    }
                });
            }
        }
    }

    // 處理「時五福」
    if (shiWuFuResult) {
            const palaceId = BRANCH_TO_PALACE_ID[shiWuFuResult];
            if (palaceId && chartData[palaceId]) {
                // 尋找 lineLeft 中第一個空的欄位來放入
                if (!chartData[palaceId].lineLeft.fieldA) {
                    chartData[palaceId].lineLeft.fieldA = '時五福';
                } else if (!chartData[palaceId].lineLeft.fieldB) {
                    chartData[palaceId].lineLeft.fieldB = '時五福';
                } else if (!chartData[palaceId].lineLeft.fieldG) {
                    chartData[palaceId].lineLeft.fieldG = '時五福';
                }
            }
    }

    // 處理「小遊」
    if (xiaoYouResult) {
    const palaceId = BRANCH_TO_PALACE_ID[xiaoYouResult];
    if (palaceId && chartData[palaceId]) {
        const lineRight = chartData[palaceId].lineRight;
        if (!lineRight.fieldE) { lineRight.fieldE = '小遊'; }
        else if (!lineRight.fieldF) { lineRight.fieldF = '小遊'; }
        else if (!lineRight.fieldE2) { lineRight.fieldE2 = '小遊'; }
        else if (!lineRight.fieldF2) { lineRight.fieldF2 = '小遊'; }
    }
    }

    // 處理「君基、臣基、民基」
    const jiStars = {
            '君基': junJiResult,
            '臣基': chenJiResult,
            '民基': minJiResult
    };
    const jiStarsByPalace = {};
    for (const starName in jiStars) {
            const palaceBranch = jiStars[starName];
            if (palaceBranch) {
                const palaceId = BRANCH_TO_PALACE_ID[palaceBranch];
                if (palaceId) {
                    if (!jiStarsByPalace[palaceId]) {
                        jiStarsByPalace[palaceId] = [];
                    }
                    jiStarsByPalace[palaceId].push(starName);
                }
            }
    }
    const centerFields = ['fieldC', 'fieldD', 'fieldC2', 'fieldD2'];
    for (const palaceId in jiStarsByPalace) {
            if (chartData[palaceId]) {
                jiStarsByPalace[palaceId].forEach(starName => {
                    // 尋找 lineCenter 中第一個空的欄位來放入
                    for (const field of centerFields) {
                        if (!chartData[palaceId].lineCenter[field]) {
                            chartData[palaceId].lineCenter[field] = starName;
                            break; // 找到位置後就跳出內層迴圈
                        }
                    }
                });
            }
    }
    // 處理「天乙、地乙、四神、飛符」
    const messengerStars = {
            '天乙': tianYiResult,
            '地乙': diYiResult,
            '四神': siShenResult,
            '飛符': feiFuResult
    };
    const messengerStarsByPalace = {};
    for (const starName in messengerStars) {
            const palaceBranch = messengerStars[starName];
            if (palaceBranch) {
                const palaceId = BRANCH_TO_PALACE_ID[palaceBranch];
                if (palaceId) {
                    if (!messengerStarsByPalace[palaceId]) {
                        messengerStarsByPalace[palaceId] = [];
                    }
                    messengerStarsByPalace[palaceId].push(starName);
                }
            }
    }
    const rightFields = ['fieldE', 'fieldF', 'fieldE2', 'fieldF2'];
    for (const palaceId in messengerStarsByPalace) {
            if (chartData[palaceId]) {
                messengerStarsByPalace[palaceId].forEach(starName => {
                    // 尋找 lineRight 中第一個空的欄位來放入
                    for (const field of rightFields) {
                        if (!chartData[palaceId].lineRight[field]) {
                            chartData[palaceId].lineRight[field] = starName;
                            break; 
                        }
                    }
                });
            }
    }

    // ▼▼▼ 處理「皇恩星」 ▼▼▼
    if (huangEnResult) {
        const palaceId = BRANCH_TO_PALACE_ID[huangEnResult];
        if (palaceId && chartData[palaceId]) { // <-- 修正點：移除多餘的 .palaces
            const fields = ['fieldE', 'fieldF', 'fieldE2', 'fieldF2'];
            for (const field of fields) {
                if (!chartData[palaceId].lineRight[field]) { // <-- 修正點：移除多餘的 .palaces
                    chartData[palaceId].lineRight[field] = '皇恩星'; // <-- 修正點：移除多餘的 .palaces
                    break;
                }
            }
        }
    }
        
    // 處理「大遊」
    if (daYouResult) {
    const palaceId = BRANCH_TO_PALACE_ID[daYouResult];
    if (palaceId && chartData[palaceId]) {
        const lineRight = chartData[palaceId].lineRight;
        if (!lineRight.fieldE) { lineRight.fieldE = '大遊'; }
        else if (!lineRight.fieldF) { lineRight.fieldF = '大遊'; }
        else if (!lineRight.fieldE2) { lineRight.fieldE2 = '大遊'; }
        else if (!lineRight.fieldF2) { lineRight.fieldF2 = '大遊'; }
    }
    }

    // 將月將資料附加到 chartData 物件上 ▼▼▼
    chartData.yueJiangData = yueJiangData;

    // 將貴人資料附加到 chartData 物件上 ▼▼▼
    chartData.guiRenData = guiRenData;

        
    return chartData;
    }
    

    // =================================================================
    //  SECTION 4: UI 互動與主流程 (最終整理版)
    // =================================================================

    const dayJishuDisplay = document.getElementById('day-jishu-display');
    const hourJishuDisplay = document.getElementById('hour-jishu-display');
    const calculateBtn = document.getElementById('calculate-btn');
    const switchToNationalBtn = document.getElementById('switch-to-national-btn'); // <--- 確保這行在這裡
    const aiSummaryOutput = document.getElementById('ai-summary-output'); // <--- 確保這行在這裡
    

    function populateDateSelectors() {
        const yearSelect = document.getElementById('birth-year');
        const monthSelect = document.getElementById('birth-month');
        const daySelect = document.getElementById('birth-day');
        const hourSelect = document.getElementById('birth-hour');
        
        // --- 原本的 for 迴圈內容完全不變 ---
        for (let i = 2100; i >= 1930; i--) { const option = document.createElement('option'); option.value = i; option.textContent = i; yearSelect.appendChild(option); }
        for (let i = 1; i <= 12; i++) { const option = document.createElement('option'); option.value = i; option.textContent = i; monthSelect.appendChild(option); }
        for (let i = 1; i <= 31; i++) { const option = document.createElement('option'); option.value = i; option.textContent = i; daySelect.appendChild(option); }
        // 出生時間以「時辰」呈現。value 仍為整數小時，沿用既有排盤計算邏輯：
        //   早子時(子時)=0、夜子時=23（引擎以此區分日柱是否進位），其餘時辰取代表小時。
        const SHICHEN_OPTIONS = [
            { value: 0,  label: '子時 (23–01)' },
            { value: 2,  label: '丑時 (01–03)' },
            { value: 4,  label: '寅時 (03–05)' },
            { value: 6,  label: '卯時 (05–07)' },
            { value: 8,  label: '辰時 (07–09)' },
            { value: 10, label: '巳時 (09–11)' },
            { value: 12, label: '午時 (11–13)' },
            { value: 14, label: '未時 (13–15)' },
            { value: 16, label: '申時 (15–17)' },
            { value: 18, label: '酉時 (17–19)' },
            { value: 20, label: '戌時 (19–21)' },
            { value: 22, label: '亥時 (21–23)' },
            { value: 23, label: '夜子時 (23–00)' }
        ];
        SHICHEN_OPTIONS.forEach(o => { const option = document.createElement('option'); option.value = o.value; option.textContent = o.label; hourSelect.appendChild(option); });
        document.getElementById('target-year').value = new Date().getFullYear();

        // ▼▼▼ 處理流月、流日下拉選單與 Checkbox 的聯動 ▼▼▼
        const transitMonthSelect = document.getElementById('transit-month');
        const transitDaySelect = document.getElementById('transit-day');
        const showTransitCheckbox = document.getElementById('show-transit-day');

        if (!transitMonthSelect || !transitDaySelect || !showTransitCheckbox) {
            console.error("【UI 錯誤】找不到流日的 HTML 元素！請檢查 index.html 中的 ID 是否正確且沒有重複。");
            return;
        }

        transitMonthSelect.innerHTML = '';
        transitDaySelect.innerHTML = '';

        for (let i = 1; i <= 12; i++) { 
            const option = document.createElement('option'); option.value = i; option.textContent = i; 
            transitMonthSelect.appendChild(option); 
        }
        for (let i = 1; i <= 31; i++) { 
            const option = document.createElement('option'); option.value = i; option.textContent = i; 
            transitDaySelect.appendChild(option); 
        }

        // 預設帶入今天的月份與日期
        const today = new Date();
        transitMonthSelect.value = today.getMonth() + 1;
        transitDaySelect.value = today.getDate();

        // ▼▼▼ 新增：預設將「顯示流日」打勾，並解除下拉選單的反灰 ▼▼▼
        showTransitCheckbox.checked = true;
        transitMonthSelect.disabled = false;
        transitDaySelect.disabled = false;

        const calculateBtn = document.getElementById('calculate-btn');

        // 1. 監聽 Checkbox：打勾時解除下拉選單的反灰 (disabled = false)，並自動更新排盤
        showTransitCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            transitMonthSelect.disabled = !isChecked;
            transitDaySelect.disabled = !isChecked;
            if (calculateBtn) calculateBtn.click();
        });

        // 2. 監聽月份與日期：改變日期時，也自動更新排盤
        transitMonthSelect.addEventListener('change', () => { if(calculateBtn) calculateBtn.click(); });
        transitDaySelect.addEventListener('change', () => { if(calculateBtn) calculateBtn.click(); });
    }
    
    function prefillTestData() {
        document.getElementById('birth-year').value = '1988';
        document.getElementById('birth-month').value = '8';
        document.getElementById('birth-day').value = '8';
        document.getElementById('birth-hour').value = '8';
        document.getElementById('gender-female').checked = true;
    }

    function runCalculation(dataForCalculation, hour, xingNianData) { 
        const bureauResult = dataForCalculation.bureauResult;
        const lookupResult = lookupBureauData(bureauResult);
        const yearStem = dataForCalculation.yearPillar.charAt(0);
        const direction = determineDirection(yearStem, dataForCalculation.gender);
        const lifePalaceId = findPalaceByCounting(dataForCalculation.yearPillar.charAt(1), dataForCalculation.monthPillar.charAt(1), dataForCalculation.hourPillar.charAt(1), direction);
        const newLifePalacesData = lifePalaceId ? arrangeLifePalaces(lifePalaceId, direction) : [];
        const newSdrData = calculateSdrPalaces(dataForCalculation, direction);
        const newAgeLimitData = arrangeAgeLimits(newLifePalacesData);
        const lunarDateForYueJiang = solarLunar.solar2lunar(
        parseInt(dataForCalculation.birthDate.split('/')[0], 10),
        parseInt(dataForCalculation.birthDate.split('/')[1], 10),
        parseInt(dataForCalculation.birthDate.split('/')[2], 10),hour);
        const yueJiangData = calculateYueJiang(lunarDateForYueJiang, dataForCalculation.hourPillar.charAt(1));
        const outerRingData = calculateOuterRingData(bureauResult, dataForCalculation.hourJishu, lookupResult);
        const guiRenData = calculateGuiRen(dataForCalculation.dayPillar.charAt(0), dataForCalculation.hourPillar.charAt(1), yueJiangData);
        const huangEnResult = calculateHuangEn(dataForCalculation.dayPillar.charAt(1)); // 這裡補上了 const
        const yangJiuForDisplay = findCurrentYangJiuForDisplay(dataForCalculation.yangJiuResult, dataForCalculation.currentUserAge);
        const baiLiuForDisplay = findCurrentBaiLiuForDisplay(dataForCalculation.baiLiuResult, dataForCalculation.currentUserAge);
        const daYouForDisplay = findCurrentAndNextDaYouForDisplay(dataForCalculation.daYouZhenXianResult, dataForCalculation.currentUserAge);
        
        // ▼▼▼ 建築師生成圖表資料 ▼▼▼
        const newMainChartData = generateMainChartData(
            lookupResult,
            dataForCalculation.deitiesResult, dataForCalculation.suanStarsResult,
            dataForCalculation.shiWuFuResult, dataForCalculation.xiaoYouResult,
            dataForCalculation.junJiResult, dataForCalculation.chenJiResult, dataForCalculation.minJiResult,
            dataForCalculation.tianYiResult, dataForCalculation.diYiResult, dataForCalculation.siShenResult, dataForCalculation.feiFuResult,
            dataForCalculation.daYouResult, yueJiangData, guiRenData, xingNianData, huangEnResult); // 改用區域變數 huangEnResult

        const centerData = {
             field1: dataForCalculation.suanStarsResult.centerStars[0] || '',
             field2: dataForCalculation.suanStarsResult.centerStars[1] || '',
             field3: dataForCalculation.suanStarsResult.centerStars[2] || '',
             field4: dataForCalculation.suanStarsResult.centerStars[3] || ''
        };

        // ▼▼▼ 核心新增：計算感應資料 ▼▼▼
        const activations = getAnnualPalaceActivation(dataForCalculation.targetYear, newLifePalacesData);
        
        // 1. 計算【本命日柱】化曜 (不再需要日積數，因為它直接吃盤面上的時五福)
        const dayActivations = getNatalDayPalaceActivation(dataForCalculation.dayPillar, dataForCalculation.chartModel, newLifePalacesData, dataForCalculation.suanStarsResult, lookupResult);
        
        // 2. 計算【流日干支】化曜 (即時換算流日的日積數，給日五福使用)
        let transitActivations = [];
        if (dataForCalculation.showTransitDay && dataForCalculation.transitGanZhi) {
            const transitDateObj = new Date(dataForCalculation.targetYear, dataForCalculation.transitMonth - 1, dataForCalculation.transitDay, 12);
            const transitDailyValues = calculateDailyValues(transitDateObj);
            const realTransitDayJishu = transitDailyValues ? (transitDailyValues.dayJishu - 1) : 0;

            transitActivations = getTransitDayPalaceActivation(dataForCalculation.transitGanZhi, dataForCalculation.chartModel, newLifePalacesData, dataForCalculation.suanStarsResult, lookupResult, realTransitDayJishu);
        }

        // ▼▼▼ 新增：把三個引動結果寫回 dataForCalculation，存檔時會自動帶到 JSON ▼▼▼
        dataForCalculation.annualActivations = activations;
        dataForCalculation.dayActivations = dayActivations;
        dataForCalculation.transitActivations = transitActivations;

        // ▼▼▼ 呼叫繪圖函式 ▼▼▼
        renderChart(newMainChartData, newLifePalacesData, newAgeLimitData, newSdrData, centerData, outerRingData, xingNianData, yangJiuForDisplay, baiLiuForDisplay, dataForCalculation.baiLiuXiaoXianResult, daYouForDisplay, dataForCalculation.feiLuDaXianResult, dataForCalculation.feiMaDaXianResult, dataForCalculation.feiMaLiuNianResult, dataForCalculation.feiLuLiuNianResult, dataForCalculation.heiFuResult, activations, dataForCalculation.targetYear, 
        dayActivations, transitActivations, dataForCalculation.transitMonth, dataForCalculation.transitDay); 

        
        document.getElementById('day-master-info').innerHTML = dataForCalculation.dayMasterInfo;

        const kongWangInfoDiv = document.getElementById('kong-wang-info');
        if (kongWangInfoDiv) {
            if (dataForCalculation.kongWangResult) {
                kongWangInfoDiv.innerHTML = `日柱空亡：${dataForCalculation.kongWangResult.join('、 ')}`;
                dataForCalculation.kongWangResult.forEach(branch => { drawKongWangSector(branch); });
            } else {
                kongWangInfoDiv.innerHTML = '日柱空亡：無法計算';
            }
        }

        document.getElementById('element-interaction-info').innerHTML = formatElementInteractionInfo(dataForCalculation.elementInteraction);
        document.getElementById('ten-gods-info').innerHTML = formatTenGodsInfo(dataForCalculation.tenGodsAnalysis);
        document.getElementById('tianke-dichong-info').innerHTML = formatTianKeDiChongInfo(dataForCalculation.tianKeDiChongYears);

        const shenPalaceId = Object.keys(newSdrData).find(k => newSdrData[k].includes('身'));
        const shenPalaceBranch = shenPalaceId ? PALACE_ID_TO_BRANCH[shenPalaceId] : '計算失敗';
        // 身宮地支隨存檔 JSON 帶出（currentChartData 與 dataForCalculation 為同一物件），供命書圓盤頁顯示。
        dataForCalculation.shenPalaceBranch = shenPalaceBranch;
        const shouQiResult = dataForCalculation.shouQiResult;
        const birthHexagramResult = dataForCalculation.birthHexagramResult;
        const liYeHexagramResult = dataForCalculation.liYeHexagramResult;
        const annualHexagramResult = dataForCalculation.annualHexagramResult;  
    
        // ▼▼▼ 組合左側顯示文字 ▼▼▼
        let outputText = ''; 
        outputText += `  局數 : ${bureauResult}\n  命宮 : ${lifePalaceId ? PALACE_ID_TO_BRANCH[lifePalaceId] + '宮' : '計算失敗'}\n  身宮 : ${shenPalaceBranch}宮`;
        
        if (lookupResult) {
            const zhuSuanAttr = SUAN_ATTRIBUTE_DATA[lookupResult.主算] || '';
            const keSuanAttr = SUAN_ATTRIBUTE_DATA[lookupResult.客算] || '';
            const dingSuanAttr = SUAN_ATTRIBUTE_DATA[lookupResult.定算] || '';
            outputText += `\n  主算 : ${lookupResult.主算} <span class="suan-attribute-style">(${zhuSuanAttr})</span>`;
            outputText += `\n  客算 : ${lookupResult.客算} <span class="suan-attribute-style">(${keSuanAttr})</span>`;
            outputText += `\n  定算 : ${lookupResult.定算} <span class="suan-attribute-style">(${dingSuanAttr})</span>`;
        }

        outputText += formatPatternInfo(dataForCalculation.chartModel, newLifePalacesData);

        if (shouQiResult) outputText += `\n\n  受氣之宮 : ${shouQiResult.palace}${shouQiResult.number}`;
        if (birthHexagramResult) outputText += `\n  出生卦 : ${birthHexagramResult.number} ${birthHexagramResult.name} ${birthHexagramResult.symbol}`;
        if (liYeHexagramResult) {
            const liYeStartAge = dataForCalculation.liYeStartAge;
            const ageText = liYeStartAge ? ` (${liYeStartAge}歲開始)` : '';
            outputText += `\n  立業卦 : ${liYeHexagramResult.number} ${liYeHexagramResult.name} ${liYeHexagramResult.symbol}${ageText}`;
        }
        if (annualHexagramResult) {
            const targetYear = dataForCalculation.targetYear; 
            outputText += `\n  流年卦 : ${annualHexagramResult.number} ${annualHexagramResult.name} ${annualHexagramResult.symbol} (${targetYear}年${dataForCalculation.currentUserAge}歲)`;
            outputText += `\n  <span class="hexagram-description-style">↳ ${annualHexagramResult.description}</span>`;
        } 
        const annualChangingHexagramResult = calculateAnnualChangingHexagram(dataForCalculation.annualHexagramResult, dataForCalculation.baiLiuResult, dataForCalculation.currentUserAge);
        if (annualChangingHexagramResult) {
            outputText += `\n  流年變卦: ${annualChangingHexagramResult.number} ${annualChangingHexagramResult.name} ${annualChangingHexagramResult.symbol}`;
            outputText += `\n  <span class="hexagram-description-style">↳ ${annualChangingHexagramResult.description}</span>`;
        }

        const monthlyHexagramsText = formatMonthlyHexagrams(dataForCalculation.monthlyHexagramsResult, dataForCalculation.targetYear);
        if (monthlyHexagramsText) outputText += monthlyHexagramsText;
        
        
        // 1. 處理【本命日柱化曜】 (縮小間距版)
        if (typeof dayActivations !== 'undefined' && dayActivations && dayActivations.length > 0) {
            const dayGroups = {};
            dayActivations.forEach(a => {
                if (!dayGroups[a.natalPalace]) dayGroups[a.natalPalace] = [];
                const isBad = a.roleName.includes('忌星') || a.roleName.includes('鬼星');
                const color = isBad ? '#d32f2f' : '#0056b3';
                dayGroups[a.natalPalace].push(`<span style="color: ${color}; font-weight: bold;">${a.starName}</span>(${a.roleName})`);
            });

            outputText += `\n\n<div style="margin-top: 10px; line-height: 1.4;"><strong style="color: #008080; font-size: 15px;">【本命日柱化曜】：</strong>`;
            for (const palace in dayGroups) {
                outputText += `\n<span style="display: block; padding-left: 15px; margin-top: 2px; font-size: 14px;">${palace}：${dayGroups[palace].join('、')}</span>`;
            }
            outputText += `</div>`;
        }

        // 2. 處理【年度年干化曜】 (縮小間距版)
        if (activations && activations.length > 0) {
            const palaceGroups = {};
            activations.forEach(a => {
                if (!palaceGroups[a.natalPalace]) palaceGroups[a.natalPalace] = [];
                const isBad = a.roleName.includes('忌星') || a.roleName.includes('鬼星');
                const color = isBad ? '#d32f2f' : '#0056b3';
                palaceGroups[a.natalPalace].push(`<span style="color: ${color}; font-weight: bold;">${a.starName}</span>(${a.roleName})`);
            });

            outputText += `\n\n<div style="margin-top: 10px; line-height: 1.4;"><strong style="color: #0056b3; font-size: 15px;">【${dataForCalculation.targetYear} 年度年干化曜】：</strong>`;
            for (const palace in palaceGroups) {
                const starList = palaceGroups[palace];
                const isSuperActive = starList.length >= 3; 
                outputText += `\n<span style="display: block; padding-left: 15px; margin-top: 2px; font-size: 14px;">${palace}：被引動 ${starList.join('、')}</span>`;
                if (isSuperActive) {
                    outputText += `\n<span style="display: block; padding-left: 15px; color: #d32f2f; font-size: 12px; font-weight: bold;">＊此宮能量強旺，有重大變動！</span>`;
                }
            }
            outputText += `</div>`;
        }

        // 3. 處理【流日推演】 (緊湊色塊版)
        if (typeof transitActivations !== 'undefined' && transitActivations && transitActivations.length > 0) {
            const transitGroups = {};
            transitActivations.forEach(a => {
                if (!transitGroups[a.natalPalace]) transitGroups[a.natalPalace] = [];
                const isBad = a.roleName.includes('忌星') || a.roleName.includes('鬼星');
                const color = isBad ? '#d32f2f' : '#0056b3';
                transitGroups[a.natalPalace].push(`<span style="color: ${color}; font-weight: bold;">${a.starName}</span>(${a.roleName})`);
            });

            outputText += `\n\n<div style="margin-top: 12px; padding: 5px 8px; background-color: #f8f9fa; border-left: 4px solid #ff8c00; border-radius: 3px; line-height: 1.4;">`;
            outputText += `<strong style="color: #e67e22; font-size: 15px;">【${dataForCalculation.transitMonth}/${dataForCalculation.transitDay} 流日推演】：</strong>`;
            for (const palace in transitGroups) {
                outputText += `\n<span style="display: block; padding-left: 5px; margin-top: 2px; font-size: 14px;">${palace}：被引動 ${transitGroups[palace].join('、')}</span>`;
            }
            outputText += `</div>`;
        }

        // ▼▼▼ 一次性渲染所有文字到畫面上 ▼▼▼
        const summaryP = document.getElementById('calculation-summary');
        summaryP.innerHTML = outputText;
        
        // --- 更新下方資訊區 ---
        const starStrengthInfoDiv = document.getElementById('star-strength-info');
        if (starStrengthInfoDiv) starStrengthInfoDiv.innerHTML = formatBottomInfoBox(dataForCalculation.chartModel, newLifePalacesData, newSdrData, dataForCalculation.gender);
        
        const remedyInfoDiv = document.getElementById('remedy-info');
        if (remedyInfoDiv) remedyInfoDiv.innerHTML = formatRemedyInfo(dataForCalculation.remedySuggestions, newLifePalacesData, newSdrData);
        
        const strengthInfoDiv = document.getElementById('strength-info');
        if (strengthInfoDiv) strengthInfoDiv.innerHTML = formatStrengthInfo(dataForCalculation.strengthSuggestions, newLifePalacesData, newSdrData);

        document.querySelector('input[name="chart-mode"][value="mingGong"]').checked = true; 
        updateChart(); 

        if (dataForCalculation.gender === '女') {
            const lifePalaceShortName = '命';
            const lifePalaceFullName = '命宮';
            const lifePalaceIndex = newLifePalacesData.indexOf(lifePalaceShortName);
            
            if (lifePalaceIndex !== -1) {
                const lifePalaceId = VALID_PALACES_CLOCKWISE[lifePalaceIndex];
                const palaceBranch = PALACE_ID_TO_BRANCH[lifePalaceId];
                
                let allStarsInLifePalace = [...Object.values(dataForCalculation.chartModel[lifePalaceId].stars)];
                const guestPalaceId = Object.keys(JI_GONG_MAP).find(key => JI_GONG_MAP[key] === lifePalaceId);
                if (guestPalaceId && dataForCalculation.chartModel[guestPalaceId]) {
                    allStarsInLifePalace.push(...Object.values(dataForCalculation.chartModel[guestPalaceId].stars));
                }
                let coreStarsInLifePalace = allStarsInLifePalace.filter(star => !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name) && star.name !== '皇恩星');
                if (coreStarsInLifePalace.length === 0) {
                    const oppositePalaceId = OPPOSITE_PALACE_MAP[lifePalaceId];
                    if (oppositePalaceId && dataForCalculation.chartModel[oppositePalaceId]) {
                        coreStarsInLifePalace = Object.values(dataForCalculation.chartModel[oppositePalaceId].stars).filter(star => !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name) && star.name !== '皇恩星');
                    }
                }
                if (coreStarsInLifePalace.length === 0) {
                    const trinePartners = SAN_HE_MAP[palaceBranch];
                    if (trinePartners) {
                        let trineStars = [];
                        trinePartners.forEach(partnerBranch => {
                            const partnerPalaceId = BRANCH_TO_PALACE_ID[partnerBranch];
                            if (partnerPalaceId && dataForCalculation.chartModel[partnerPalaceId]) {
                                trineStars.push(...Object.values(dataForCalculation.chartModel[partnerPalaceId].stars));
                            }
                        });
                        coreStarsInLifePalace = trineStars.filter(star => !EXCLUDED_STARS_FROM_ANALYSIS.includes(star.name) && star.name !== '皇恩星');
                    }
                }

                const palaceBlocks = document.querySelectorAll('.palace-info-block');
                palaceBlocks.forEach(block => {
                    const titleElement = block.querySelector('strong');
                    if (titleElement && titleElement.textContent.startsWith(lifePalaceFullName)) {
                        coreStarsInLifePalace.forEach(star => {
                            const description = STAR_PALACE_DESCRIPTIONS_FEMALE[star.name]?.[lifePalaceFullName];
                            if (description && description !== '待完成') {
                                const starEntry = Array.from(block.querySelectorAll('.star-entry')).find(entry => entry.textContent.startsWith(star.name));
                                if (starEntry) {
                                    const femaleDescSpan = document.createElement('span');
                                    femaleDescSpan.className = 'star-palace-description-female';
                                    femaleDescSpan.innerHTML = `${description}`;
                                    starEntry.appendChild(femaleDescSpan);
                                }
                            }
                        });
                    }
                });
            }
        }

        const luMaResults = findLuMaJiaoChiYears(dataForCalculation);
        const luMaInfoDiv = document.getElementById('luma-info');
        if (luMaInfoDiv) {
            let html = '<strong>祿馬交馳年份：</strong>';
            let found = false;
            
            if (luMaResults.threeWay.length > 0) {
                html += `<br>三合（行年+祿+馬）：${luMaResults.threeWay.join('歲、')}歲`;
                found = true;
            }
            if (luMaResults.twoWay.length > 0) {
                html += `<br>雙合（祿+馬）：${luMaResults.twoWay.join('歲、')}歲`;
                found = true;
            }   
            if (!found) {
                html += ' 此盤無';
            }
            luMaInfoDiv.innerHTML = html;
        }

        const kejiaYearsInfoDiv = document.getElementById('kejia-years-info');
        if (kejiaYearsInfoDiv) {
            kejiaYearsInfoDiv.innerHTML = formatKeJiaYearsInfo(dataForCalculation.keJiaYears);
        }

        // ▼▼▼ 百六小限論月落宮 資訊框 ▼▼▼
        const baiLiuLiuYueInfoDiv = document.getElementById('bailiu-liuyue-info');
        if (baiLiuLiuYueInfoDiv) {
            const lyResult = dataForCalculation.baiLiuLiuYueResult || [];
            if (lyResult.length === 0) {
                baiLiuLiuYueInfoDiv.innerHTML = '<strong>百六小限論月落宮：</strong><br>無法定位當歲百六小限宮。';
            } else {
                const dirText = (dataForCalculation.gender === '男') ? '男順行' : '女逆行';
                const jqMonthBL = getCurrentJieQiMonthForYear(dataForCalculation.targetYear);
                let html = `<strong>百六小限論月落宮</strong>（${dataForCalculation.currentUserAge}歲小限起正月，${dirText}，以節氣換月）：`;
                html += '<table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:0.9em;">';
                lyResult.forEach(row => {
                    const starText = row.stars.length > 0
                        ? row.stars.map(s => {
                            let t = s.name;
                            if (s.strength) t += `(${s.strength})`;
                            if (s.huaYao && s.huaYao.length > 0) t += `〔${s.huaYao.join('、')}〕`;
                            return t;
                          }).join('、')
                        : '—';
                    const isCurrent = (jqMonthBL !== null && row.month === jqMonthBL);
                    const rowStyle = isCurrent ? 'border-bottom:1px solid #eee; background:#fdf3e0; font-weight:bold;' : 'border-bottom:1px solid #eee;';
                    const monthCell = isCurrent ? `${row.monthLabel} ◀本月` : row.monthLabel;
                    html += `<tr style="${rowStyle}"><td style="padding:2px 6px; white-space:nowrap;">${monthCell}</td><td style="padding:2px 6px; white-space:nowrap;">${row.branch}（${row.lifePalaceName}）</td><td style="padding:2px 6px;">${starText}</td></tr>`;
                });
                html += '</table>';
                baiLiuLiuYueInfoDiv.innerHTML = html;
            }
        }

        // ▼▼▼ 太乙小限與小限月運 資訊框 ▼▼▼
        const taiYiXiaoXianInfoDiv = document.getElementById('taiyi-xiaoxian-info');
        if (taiYiXiaoXianInfoDiv) {
            const txx = dataForCalculation.taiYiXiaoXianResult;
            const yy = dataForCalculation.xiaoXianYueYunResult || [];
            if (!txx) {
                taiYiXiaoXianInfoDiv.innerHTML = '<strong>太乙小限：</strong><br>無法由受氣宮定出太乙小限。';
            } else {
                const yueDirText = (-txx.direction === 1) ? '順行' : '逆行';
                const jqMonthXX = getCurrentJieQiMonthForYear(dataForCalculation.targetYear);
                let html = `<strong>太乙小限</strong>（受氣${txx.shouQiStem}干，${txx.startAge}歲起${txx.startBranch}宮，${txx.directionText}）：`;
                html += `${dataForCalculation.currentUserAge}歲小限在 <strong>${txx.currentBranch}宮</strong>`;
                html += `<br><strong>小限月運</strong>（起正月於${txx.currentBranch}宮，${yueDirText}，以節氣換月）：`;
                if (yy.length > 0) {
                    html += '<table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:0.9em;">';
                    yy.forEach(row => {
                        const starText = row.stars.length > 0
                            ? row.stars.map(s => {
                                let t = s.name;
                                if (s.strength) t += `(${s.strength})`;
                                if (s.huaYao && s.huaYao.length > 0) t += `〔${s.huaYao.join('、')}〕`;
                                return t;
                              }).join('、')
                            : '—';
                        const isCurrent = (jqMonthXX !== null && row.month === jqMonthXX);
                        const rowStyle = isCurrent ? 'border-bottom:1px solid #eee; background:#fdf3e0; font-weight:bold;' : 'border-bottom:1px solid #eee;';
                        const monthCell = isCurrent ? `${row.monthLabel} ◀本月` : row.monthLabel;
                        html += `<tr style="${rowStyle}"><td style="padding:2px 6px; white-space:nowrap;">${monthCell}</td><td style="padding:2px 6px; white-space:nowrap;">${row.branch}（${row.lifePalaceName}）</td><td style="padding:2px 6px;">${starText}</td></tr>`;
                    });
                    html += '</table>';
                }
                taiYiXiaoXianInfoDiv.innerHTML = html;
            }
        }
    }


    // ▼▼▼ 更新能量趨勢圖的專屬函式 (最終穩定版) ▼▼▼
    let currentChartData = {}; 
    function updateChart() {
        let chartDataForSort = [];
    const selectedMode = document.querySelector('input[name="chart-mode"]:checked').value;
    
    let scores = [];
    let labels = [];

    // --- 內部輔助函式：用來獲取任何一個宮位的「基礎分數」---
    // 它的原理是：呼叫一次完整的計分引擎，然後只從結果中挑出我們需要的那一個宮位的分數
    const getSimpleScoreForPalace = (palaceId) => {
        // 我們傳入一個空陣列給 ageLimitData，告訴計分引擎「不要」計算時宮加權
        const allPalaceBaseScores = calculateFortuneScores(currentChartData.chartModel, currentChartData.arrangedLifePalaces, [], currentChartData.hourPillar, currentChartData.lookupResult);
        const palaceIndex = VALID_PALACES_CLOCKWISE.indexOf(palaceId);
        return palaceIndex !== -1 ? allPalaceBaseScores[palaceIndex] : 0;
    };

    // --- 根據選擇的模式，準備對應的圖表資料 ---
    if (selectedMode === 'annual') {
        const ageLimits = arrangeAgeLimits(currentChartData.arrangedLifePalaces);
        const greatLimitData = ageLimits.map((ageRange, index) => ({
            palaceId: VALID_PALACES_CLOCKWISE[index],
            ageRange: ageRange
        })).filter(item => item.ageRange);
        
        // 1. 先算出「限例太乙」大限的完整分數 (包含時宮加權)
        const greatLimitScoresWithBonus = calculateFortuneScores(currentChartData.chartModel, currentChartData.arrangedLifePalaces, ageLimits, currentChartData.hourPillar, currentChartData.lookupResult);
        const greatLimitScoreMap = {};
        greatLimitData.forEach((limit, index) => {
            greatLimitScoreMap[limit.palaceId] = greatLimitScoresWithBonus[index];
        });

        // 2. 建立「歲數 -> 行年宮位」的對照表
        const ageToAnnualPalaceMap = {};
        const fullXingNianData = calculateXingNian(currentChartData.gender, 1, 120);
        Object.keys(fullXingNianData).forEach(palaceId => {
            fullXingNianData[palaceId].ages.forEach(age => {
                ageToAnnualPalaceMap[age] = palaceId;
            });
        });
        
        // 3. 遍歷 1 到 106 歲，計算每年的最終分數
        let finalScores = [];
        let finalLabels = [];
        for (let age = 1; age <= 106; age++) {
            const currentGreatLimit = greatLimitData.find(l => {
                const [start, end] = l.ageRange.split('-').map(Number);
                return age >= start && age <= end;
            });

            if (currentGreatLimit) {
                const greatLimitScore = greatLimitScoreMap[currentGreatLimit.palaceId] || 0;
                const annualScoreWithWeight = calculateAnnualScore(age, currentChartData.chartModel, currentChartData);
                const finalScore = greatLimitScore + annualScoreWithWeight;
                
                finalLabels.push(age);
                finalScores.push(finalScore);
            }
        }
        labels = finalLabels;
        scores = finalScores;

    } else {
        // --- 處理其他四種大限的計分 ---
        let limitData = [];
        switch(selectedMode) {
            case 'daYou': limitData = currentChartData.daYouZhenXianResult; break;
            case 'baiLiu': limitData = currentChartData.baiLiuResult; break;
            case 'yangJiu': limitData = currentChartData.yangJiuResult; break;
            default: // 'mingGong' (限例太乙)
                const ageLimits = arrangeAgeLimits(currentChartData.arrangedLifePalaces);
                limitData = ageLimits.map((ageRange, index) => ({
                    palaceId: VALID_PALACES_CLOCKWISE[index],
                    ageRange: ageRange
                })).filter(item => item.ageRange);
                break;
        }
        labels = limitData.map(item => item.ageRange);
        // 根據選擇的模式，計算對應的分數
        if (selectedMode === 'mingGong') {
        scores = calculateFortuneScores(currentChartData.chartModel, currentChartData.arrangedLifePalaces, labels, currentChartData.hourPillar, currentChartData.lookupResult);
        } else {
        scores = limitData.map(item => getSimpleScoreForPalace(item.palaceId));
        // ▼▼▼ 核心修改點 1: 準備帶有特殊標記的資料 ▼▼▼
        const overlapInfo = currentChartData.daYouOverlapResult;
            chartDataForSort = limitData.map((item, index) => ({
                ageRange: item.ageRange,
                score: scores[index],
                // 只有在大遊真限模式下，才檢查是否重疊
                isOverlap: (selectedMode === 'daYou' && overlapInfo && item.palaceId === overlapInfo.palaceId)
            }));


        }
    }
    
    // --- 重新排序並繪製圖表 ---
    let chartDataToSort = labels.map((label, index) => ({ ageRange: label, score: scores[index] })).filter(item => item && item.ageRange !== undefined && item.score !== undefined);
    if (selectedMode !== 'annual') {
         chartDataToSort.sort((a, b) => parseFloat(a.ageRange.split('-')[0]) - parseFloat(b.ageRange.split('-')[0]));
    }

    
    renderFortuneChart(
        chartDataToSort.map(item => String(item.ageRange)),
        chartDataToSort.map(item => item.score),
        chartDataForSort.map(item => item.isOverlap) // 將標記傳遞給繪圖函式
    );
    }
    

    // (這個calculateBtn.addEventListener 函式就是工廠老闆, runCalculation是老師傅)
    calculateBtn.addEventListener('click', () => {
        // ▼▼▼ 清空並隱藏 AI 輸出區塊 ▼▼▼
        document.getElementById('ai-summary-output').style.display = 'none';
        document.getElementById('ai-summary-output').innerHTML = '';
        document.getElementById('n8n-ai-output').style.display = 'none';
        document.getElementById('n8n-ai-output').innerHTML = '';
        // ▲▲▲ 清空結束 ▲▲▲

        const year = parseInt(document.getElementById('birth-year').value, 10);
        const targetYearInput = document.getElementById('target-year');
        const targetYear = parseInt(targetYearInput.value, 10);

        if (!targetYear || targetYear < 1930 || targetYear > 2100) {
            alert('請輸入一個介於 1930 到 2100 之間的有效分析年份。');
            return;
        }
        const currentUserAge = targetYear - year + 1; 

        // ▼▼▼ 核心新增：抓取流日選單資料並計算流日干支 ▼▼▼
        const showTransitDayElement = document.getElementById('show-transit-day');
        const showTransitDay = showTransitDayElement ? showTransitDayElement.checked : false;
        const transitMonth = parseInt(document.getElementById('transit-month').value, 10);
        const transitDay = parseInt(document.getElementById('transit-day').value, 10);

        let transitGanZhi = null; 
        
        if (showTransitDay && !isNaN(transitMonth) && !isNaN(transitDay)) {
            // 使用 solarLunar 把公曆轉成農曆/干支，預設中午 12 點以確保取得當日正確干支
            const transitDateData = solarLunar.solar2lunar(targetYear, transitMonth, transitDay, 12); 
            
            // ▼▼▼ 破案關鍵：修正抓取干支的語法 ▼▼▼
            transitGanZhi = transitDateData.getDayInGanZhi(); 
            
            console.log(`【流日推演啟動】選擇日期：${targetYear}年 ${transitMonth}月 ${transitDay}日`);
            console.log(`【流日推演啟動】該日干支：${transitGanZhi}`); // 按F12可以在主控台看到確實抓到了！
        }
        // ▲▲▲ 流日處理結束 ▲▲▲

        const month = parseInt(document.getElementById('birth-month').value, 10);
        const day = parseInt(document.getElementById('birth-day').value, 10);
        const hour = parseInt(document.getElementById('birth-hour').value, 10);
        const birthDateObject = new Date(year, month - 1, day, hour);

        const precisionResult = calculateJishuAndBureau(birthDateObject);

        if (precisionResult) {
            dayJishuDisplay.textContent = precisionResult.dayJishu;
            hourJishuDisplay.textContent = precisionResult.hourJishu;
        } else {
            dayJishuDisplay.textContent = '計算失敗';
            hourJishuDisplay.textContent = '計算失敗';
        }

        const lunarDate = solarLunar.solar2lunar(year, month, day, hour);
        
        if (precisionResult) {
            console.log("--- 四柱交叉驗證 ---");
            const baziDayPillar = lunarDate.getDayInGanZhi();
            console.log("日柱 (solar-lunar.js):", baziDayPillar);
            console.log("日柱 (基準點推算):", precisionResult.dayPillar);
            if (baziDayPillar === precisionResult.dayPillar) {
                console.log("✅ 日柱驗證通過！");
            } else { console.error("❌ 日柱驗證失敗！"); }
            
            const baziHourPillar = lunarDate.getTimeInGanZhi();
            console.log("時柱 (solar-lunar.js):", baziHourPillar);
            console.log("時柱 (時積數反推):", precisionResult.validatedHourPillar);
            if (baziHourPillar === precisionResult.validatedHourPillar) {
                console.log("✅ 時柱驗證通過！");
            } else { console.error("❌ 時柱驗證失敗！"); }
            console.log("--------------------");
        }

        const yearPillar = lunarDate.getYearInGanZhi();
        const monthPillar = lunarDate.getMonthInGanZhi();
        const dayPillar = lunarDate.getDayInGanZhi();
        const hourPillar = lunarDate.getTimeInGanZhi();
        
        document.getElementById('year-pillar-stem').textContent = yearPillar.charAt(0);
        document.getElementById('year-pillar-branch').textContent = yearPillar.charAt(1);
        document.getElementById('month-pillar-stem').textContent = monthPillar.charAt(0);
        document.getElementById('month-pillar-branch').textContent = monthPillar.charAt(1);
        document.getElementById('day-pillar-stem').textContent = dayPillar.charAt(0);
        document.getElementById('day-pillar-branch').textContent = dayPillar.charAt(1);
        document.getElementById('hour-pillar-stem').textContent = hourPillar.charAt(0);
        document.getElementById('hour-pillar-branch').textContent = hourPillar.charAt(1);
        
        const startAge = currentUserAge - 20;
        const endAge = currentUserAge + 40;
        const yearStemForDirection = lunarDate.getYearInGanZhi().charAt(0);
        const genderForDirection = document.querySelector('input[name="gender"]:checked').value === 'male' ? '男' : '女';
        const direction = determineDirection(yearStemForDirection, genderForDirection);
        const lifePalaceId = findPalaceByCounting(lunarDate.getYearInGanZhi().charAt(1), lunarDate.getMonthInGanZhi().charAt(1), lunarDate.getTimeInGanZhi().charAt(1), direction);
        const arrangedLifePalaces = lifePalaceId ? arrangeLifePalaces(lifePalaceId, direction) : [];

        // 將所有資料打包，準備送給老師傅 (包含我們剛剛抓到的流日資訊)
        const dataForCalculation = {
            userName: document.getElementById('user-name').value, // 加上這行，存擋才會記住名字
            birthHour: hour, // 加上這行，存擋才會記住幾點出生
            birthDate: `${year}/${month}/${day}`,
            targetYear: targetYear, 
            showTransitDay: showTransitDay,     // 是否啟用流日
            transitGanZhi: transitGanZhi,       // 算出來的流日干支
            transitMonth: transitMonth,
            transitDay: transitDay,
            gender: document.querySelector('input[name="gender"]:checked').value === 'male' ? '男' : '女',
            yearPillar: lunarDate.getYearInGanZhi(),
            monthPillar: lunarDate.getMonthInGanZhi(),
            dayPillar: lunarDate.getDayInGanZhi(),
            hourPillar: lunarDate.getTimeInGanZhi(),
            dayJishu: precisionResult ? precisionResult.dayJishu : 0,
            hourJishu: precisionResult ? precisionResult.hourJishu : 0,
            currentUserAge: currentUserAge,
            arrangedLifePalaces: arrangedLifePalaces
        };

        dataForCalculation.dayMasterInfo = getDayMasterInfo(dataForCalculation.dayPillar.charAt(0));
        dataForCalculation.annualPillar = getAnnualPillar(targetYear);
        dataForCalculation.elementInteraction = analyzeYearlyElementInteraction(dataForCalculation.dayPillar, dataForCalculation.annualPillar);
        const bureauResult = precisionResult ? precisionResult.calculatedBureau : '計算失敗';
        const lookupResult = lookupBureauData(bureauResult);

        dataForCalculation.dayMasterData = getDayMasterData(dataForCalculation.dayPillar.charAt(0));
        dataForCalculation.dayMasterInfo = getDayMasterInfo(dataForCalculation.dayMasterData);
        dataForCalculation.kongWangResult = calculateKongWang(dataForCalculation.dayPillar);
        dataForCalculation.bureauResult = bureauResult;
        dataForCalculation.lookupResult = lookupResult;
        dataForCalculation.deitiesResult = calculateDeities(bureauResult, dataForCalculation.hourPillar.charAt(1));
        dataForCalculation.suanStarsResult = calculateSuanStars(lookupResult);
        dataForCalculation.shiWuFuResult = calculateShiWuFu(dataForCalculation.hourJishu);
        dataForCalculation.xiaoYouResult = calculateXiaoYou(dataForCalculation.hourJishu);
        dataForCalculation.junJiResult = calculateJunJi(dataForCalculation.hourJishu);
        dataForCalculation.chenJiResult = calculateChenJi(dataForCalculation.hourJishu);
        dataForCalculation.minJiResult = calculateMinJi(dataForCalculation.hourJishu);
        dataForCalculation.tianYiResult = calculateTianYi(dataForCalculation.hourJishu);
        dataForCalculation.diYiResult = calculateDiYi(dataForCalculation.hourJishu);
        dataForCalculation.siShenResult = calculateSiShen(dataForCalculation.hourJishu);
        dataForCalculation.feiFuResult = calculateFeiFu(dataForCalculation.hourJishu);
        dataForCalculation.daYouResult = calculateDaYou(dataForCalculation.hourJishu);
        const xingNianData = calculateXingNian(dataForCalculation.gender, startAge, endAge); 
        dataForCalculation.huangEnResult = calculateHuangEn(dataForCalculation.dayPillar.charAt(1));
        dataForCalculation.shouQiResult = calculateShouQi(dataForCalculation.dayPillar, dataForCalculation.hourPillar);
        dataForCalculation.birthHexagramResult = calculateBirthHexagram(dataForCalculation.yearPillar, dataForCalculation.monthPillar, dataForCalculation.dayPillar, dataForCalculation.hourPillar);
        dataForCalculation.liYeHexagramResult = calculateLiYeHexagram(dataForCalculation.shouQiResult.palace, dataForCalculation.birthHexagramResult);
        dataForCalculation.annualHexagramResult = calculateAnnualHexagram(dataForCalculation.birthHexagramResult, dataForCalculation.currentUserAge);    
        dataForCalculation.baiLiuXiaoXianResult = calculateBaiLiuXiaoXian(dataForCalculation.shouQiResult, dataForCalculation.gender, dataForCalculation.currentUserAge);
        dataForCalculation.feiLuDaXianResult = calculateFeiLuDaXian(dataForCalculation.yearPillar.charAt(0), dataForCalculation.currentUserAge);
        dataForCalculation.feiMaDaXianResult = calculateFeiMaDaXian(dataForCalculation.yearPillar.charAt(0), dataForCalculation.currentUserAge);
        dataForCalculation.feiLuLiuNianResult = calculateFeiLuLiuNian(dataForCalculation.yearPillar.charAt(0), dataForCalculation.dayPillar.charAt(0), dataForCalculation.gender, dataForCalculation.currentUserAge, arrangedLifePalaces);
        dataForCalculation.feiMaLiuNianResult = calculateFeiMaLiuNian(dataForCalculation.hourPillar.charAt(0), dataForCalculation.dayPillar.charAt(0), dataForCalculation.gender, dataForCalculation.currentUserAge, dataForCalculation.arrangedLifePalaces);
        dataForCalculation.heiFuResult = calculateHeiFu(dataForCalculation.hourPillar.charAt(0), dataForCalculation.currentUserAge);
        dataForCalculation.liYeStartAge = calculateLiYeStartAge(dataForCalculation.birthHexagramResult);
        dataForCalculation.baiLiuResult = calculateBaiLiuLimit(dataForCalculation.shouQiResult, dataForCalculation.gender);
        dataForCalculation.annualChangingHexagramResult = calculateAnnualChangingHexagram(dataForCalculation.annualHexagramResult, dataForCalculation.baiLiuResult, dataForCalculation.currentUserAge);
        dataForCalculation.monthlyHexagramsResult = calculateMonthlyHexagrams(dataForCalculation.annualHexagramResult?.number);
        dataForCalculation.chartModel = buildChartModel(dataForCalculation);
        // ▼▼▼ 新增：傳入結構化輸出陣列，讓 Skill 不必 parse 字串 ▼▼▼
        const annualHuaYaoStructured = [];
        dataForCalculation.annualHuaYaoInfo = analyzeAnnualHuaYaoPalaces(dataForCalculation.annualPillar.charAt(0), dataForCalculation.chartModel, arrangedLifePalaces, dataForCalculation.lookupResult, dataForCalculation.suanStarsResult, annualHuaYaoStructured);
        dataForCalculation.annualHuaYaoStructured = annualHuaYaoStructured;
        dataForCalculation.tenGodsAnalysis = analyzeTenGods(dataForCalculation.dayMasterData, dataForCalculation.annualPillar);
        dataForCalculation.tianKeDiChongYears = findTianKeDiChongYears(dataForCalculation.dayPillar, new Date().getFullYear(), 2050);
        dataForCalculation.yangJiuResult = calculateYangJiu(dataForCalculation.monthPillar.charAt(0), dataForCalculation.gender);
        dataForCalculation.daYouZhenXianResult = calculateDaYouZhenXian(dataForCalculation.hourPillar.charAt(1));
        dataForCalculation.chartModel = buildChartModel(dataForCalculation);
        dataForCalculation.remedySuggestions = analyzeRemedySuggestions(dataForCalculation.chartModel, dataForCalculation.arrangedLifePalaces);
        dataForCalculation.strengthSuggestions = analyzeStrengthSuggestions(dataForCalculation.chartModel);
        dataForCalculation.baiLiuLiuYueResult = calculateBaiLiuLiuYue(dataForCalculation.baiLiuXiaoXianResult, dataForCalculation.gender, dataForCalculation.currentUserAge, dataForCalculation.chartModel, dataForCalculation.arrangedLifePalaces);
        dataForCalculation.taiYiXiaoXianResult = calculateTaiYiXiaoXian(dataForCalculation.shouQiResult, dataForCalculation.gender, dataForCalculation.currentUserAge);
        dataForCalculation.xiaoXianYueYunResult = calculateXiaoXianYueYun(dataForCalculation.taiYiXiaoXianResult, dataForCalculation.chartModel, dataForCalculation.arrangedLifePalaces);
        dataForCalculation.currentJieQiMonth = getCurrentJieQiMonthForYear(dataForCalculation.targetYear); // 排盤當下的節氣月（1=正月/寅月；非該命理年為 null）
        dataForCalculation.keJiaYears = findKeJiaYears(dataForCalculation);
        dataForCalculation.daYouOverlapResult = findDaYouOverlap(dataForCalculation.daYouZhenXianResult, dataForCalculation.daYouResult);
        
        const ageLimitsForAI = arrangeAgeLimits(arrangedLifePalaces);
        const greatLimitScoresForAI = calculateFortuneScores(dataForCalculation.chartModel, arrangedLifePalaces, ageLimitsForAI, hourPillar, dataForCalculation.lookupResult);
        
        dataForCalculation.currentGreatLimitIndex = ageLimitsForAI.findIndex(range => {
            if (!range) return false;
            const [start, end] = range.split('-').map(Number);
            return currentUserAge >= start && currentUserAge <= end;
        });

        if (dataForCalculation.currentGreatLimitIndex !== -1) {
            dataForCalculation.currentGreatLimitScore = greatLimitScoresForAI[dataForCalculation.currentGreatLimitIndex];
            dataForCalculation.greatLimitAgeRange = ageLimitsForAI[dataForCalculation.currentGreatLimitIndex];
        } else {
            dataForCalculation.currentGreatLimitScore = 0;
            dataForCalculation.greatLimitAgeRange = '未知'; 
        }

        const ageToAnnualPalaceMapForAI = {};
        const fullXingNianDataForAI = calculateXingNian(dataForCalculation.gender, 1, 120);
        Object.keys(fullXingNianDataForAI).forEach(palaceId => {
            fullXingNianDataForAI[palaceId].ages.forEach(age => { ageToAnnualPalaceMapForAI[age] = palaceId; });
        });

        dataForCalculation.annualPalaceScore = calculateFullAnnualPalaceScore(currentUserAge, dataForCalculation.chartModel, dataForCalculation);
        const annualPalaceIdForAI = ageToAnnualPalaceMapForAI[currentUserAge];
        dataForCalculation.annualPalaceId = annualPalaceIdForAI; 
        dataForCalculation.annualPalaceShortName = annualPalaceIdForAI ? arrangedLifePalaces[VALID_PALACES_CLOCKWISE.indexOf(annualPalaceIdForAI)] : '未知';

        const finalAnnualTrendScore = dataForCalculation.currentGreatLimitScore + (dataForCalculation.annualPalaceScore * 0.7);
        dataForCalculation.annualTrendScore = finalAnnualTrendScore;

        // ▼▼▼ 新增：計算未來 30 年的趨勢分，找出低分區間（供 Skill 寫年末提醒用）▼▼▼
        try {
            // 1. 建立大限分數對照表
            const greatLimitAgeRanges = arrangeAgeLimits(arrangedLifePalaces);
            const greatLimitDataForFuture = greatLimitAgeRanges.map((ageRange, idx) => ({
                palaceId: VALID_PALACES_CLOCKWISE[idx],
                ageRange: ageRange
            })).filter(item => item.ageRange);
            const greatLimitScoreMapFuture = {};
            greatLimitDataForFuture.forEach((limit, idx) => {
                greatLimitScoreMapFuture[limit.palaceId] = greatLimitScoresForAI[idx];
            });

            // 2. 計算命主未來 30 年的逐年分數
            const futureScores = [];
            const futureStartAge = dataForCalculation.currentUserAge + 1;
            const futureEndAge   = Math.min(dataForCalculation.currentUserAge + 30, 106);
            for (let age = futureStartAge; age <= futureEndAge; age++) {
                const currentGreatLimit = greatLimitDataForFuture.find(l => {
                    if (!l.ageRange) return false;
                    const [s, e] = l.ageRange.split('-').map(Number);
                    return age >= s && age <= e;
                });
                if (!currentGreatLimit) continue;
                const glScore  = greatLimitScoreMapFuture[currentGreatLimit.palaceId] || 0;
                const annScore = calculateAnnualScore(age, dataForCalculation.chartModel, dataForCalculation);
                futureScores.push({ age: age, score: glScore + annScore });
            }

            // 3. 用相對閾值找低點：低於 (平均 − 0.5×標準差) 的年份
            let lowScoreYears = [];
            if (futureScores.length > 0) {
                const avg = futureScores.reduce((a, b) => a + b.score, 0) / futureScores.length;
                const variance = futureScores.reduce((a, b) => a + Math.pow(b.score - avg, 2), 0) / futureScores.length;
                const stddev = Math.sqrt(variance);
                const threshold = avg - stddev * 0.5;

                // 標出低於閾值的年份
                const lowPoints = futureScores
                    .filter(s => s.score < threshold)
                    .map(s => ({
                        age:   s.age,
                        year:  dataForCalculation.targetYear + (s.age - dataForCalculation.currentUserAge),
                        score: Math.round(s.score)
                    }));

                // 4. 合併相鄰年齡為「區間」
                lowPoints.forEach(p => {
                    const last = lowScoreYears[lowScoreYears.length - 1];
                    if (last && p.age === last.endAge + 1) {
                        last.endAge   = p.age;
                        last.endYear  = p.year;
                        last.minScore = Math.min(last.minScore, p.score);
                    } else {
                        lowScoreYears.push({
                            startAge: p.age,
                            endAge:   p.age,
                            startYear: p.year,
                            endYear:   p.year,
                            minScore:  p.score
                        });
                    }
                });
            }

            dataForCalculation.upcomingLowScoreYears = lowScoreYears;
            dataForCalculation.upcomingScoreWindow = { startAge: futureStartAge, endAge: futureEndAge };
        } catch (e) {
            console.warn('計算未來低分歲數時發生錯誤:', e);
            dataForCalculation.upcomingLowScoreYears = [];
        }

        // ▼▼▼ 十二宮主星摘要（供命書「本命十二宮」逐宮解說、並隨存檔 JSON 帶出）▼▼▼
        // 與下方資訊區同邏輯：本宮 + 寄宮（乾寄亥/艮寄寅/巽寄巳/坤寄申），過濾非論斷星；
        // 本宮+寄宮皆無星時借對宮，並標註每顆星來源（本宮/寄宮/借對宮）。
        try {
            const _palaceFullNameMap = { '命':'命宮','父':'父母宮','貌':'相貌宮','福':'福德宮','疾':'疾厄宮','奴':'奴僕宮','官':'官祿宮','田':'田宅宮','財':'財帛宮','孫':'子孫宮','妻':'夫妻宮','兄':'兄弟宮' };
            const _cm = dataForCalculation.chartModel || {};
            const _collectStars = (pid, source) => {
                const out = [];
                if (pid && _cm[pid] && _cm[pid].stars) {
                    Object.values(_cm[pid].stars).forEach(s => {
                        if (!EXCLUDED_STARS_FROM_ANALYSIS.includes(s.name) && s.name !== '皇恩星') {
                            out.push({ name: s.name, source: source, huaYao: s.huaYao || [] });
                        }
                    });
                }
                return out;
            };
            const _starsForPalace = (pid) => {
                let arr = _collectStars(pid, '本宮');
                const guestPid = Object.keys(JI_GONG_MAP).find(k => JI_GONG_MAP[k] === pid);
                if (guestPid) arr = arr.concat(_collectStars(guestPid, '寄宮'));
                return arr;
            };
            const _summary = [];
            (dataForCalculation.arrangedLifePalaces || []).forEach((shortName, i) => {
                const pid = VALID_PALACES_CLOCKWISE[i];
                if (!pid) return;
                let stars = _starsForPalace(pid);
                const emptyNative = stars.length === 0;
                let borrowed = false;
                if (emptyNative) {
                    const oppId = OPPOSITE_PALACE_MAP[pid];
                    const opp = _starsForPalace(oppId).map(s => ({ name: s.name, source: '借對宮', huaYao: s.huaYao }));
                    if (opp.length) { stars = opp; borrowed = true; }
                }
                _summary.push({
                    order: i + 1,
                    palaceId: pid,
                    branch: PALACE_ID_TO_BRANCH[pid] || '',
                    shortName: shortName,
                    fullName: _palaceFullNameMap[shortName] || shortName,
                    mainStars: stars,
                    isEmptyNative: emptyNative,
                    borrowedFromOpposite: borrowed
                });
            });
            dataForCalculation.lifePalacesSummary = _summary;
        } catch (e) {
            console.warn('組十二宮主星摘要時發生錯誤:', e);
            dataForCalculation.lifePalacesSummary = [];
        }

        currentChartData = dataForCalculation;

        // --- ▼▼▼ 將主要計算結果渲染到畫面上 ▼▼▼ ---
        // 注意：剛剛的流年感應文字，老師傅裡面已經寫好了，所以這裡不用再重複寫！
        runCalculation(dataForCalculation, hour, xingNianData); 

        // --- ▼▼▼ 預設的 PDF 導出功能 (印出整個排盤畫面) ▼▼▼ ---
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer && !mainContainer.id) {
            mainContainer.id = 'main-export-area'; 
        }
        
        const downloadBtn = document.getElementById('download-pdf-btn');
        if (downloadBtn) {
            downloadBtn.disabled = false; // 解鎖 PDF 按鈕
            downloadBtn.onclick = function() {
                generateBeautifulTaiyiPdfReport(currentChartData);
            };
        }
    });

    //  ▼▼▼ 就在這裡貼上「命盤存擋」與「命盤讀取」的邏輯 ▼▼▼
    const saveDataBtn = document.getElementById('save-data-btn');
    const loadDataBtn = document.getElementById('load-data-btn');
    const fileInput = document.getElementById('file-input');

    // --- 1. 命盤存擋：將當前資料下載為 JSON 檔 ---
    if (saveDataBtn) {
        saveDataBtn.addEventListener('click', () => {
            if (!currentChartData || Object.keys(currentChartData).length === 0) {
                alert('請先進行排盤，產生資料後再存擋。');
                return;
            }
            const dataStr = JSON.stringify(currentChartData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const name = document.getElementById('user-name').value || '未命名';
            const year = currentChartData.targetYear || '未知';
            const link = document.createElement('a');
            link.href = url; link.download = `太乙命盤-${name}-${year}年.json`;
            link.click(); URL.revokeObjectURL(url);
        });
    }

    // --- 2. 命盤讀取：上傳 JSON 檔並自動填表排盤 ---
    if (loadDataBtn && fileInput) {
        loadDataBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    // 自動填回 UI 欄位
                    if (importedData.userName) document.getElementById('user-name').value = importedData.userName;
                    if (importedData.targetYear) document.getElementById('target-year').value = importedData.targetYear;
                    if (importedData.birthDate) {
                        const [y, m, d] = importedData.birthDate.split('/');
                        document.getElementById('birth-year').value = y;
                        document.getElementById('birth-month').value = m;
                        document.getElementById('birth-day').value = d;
                    }
                    if (importedData.birthHour !== undefined) {
                        // 舊存檔的出生時間可能是 0–23 任一小時，需對齊到新的時辰選項值，
                        // 才能正確選中且維持相同排盤結果（夜子時 23、早子時 0 保留區分）。
                        const h = parseInt(importedData.birthHour, 10);
                        let shichenValue;
                        if (isNaN(h)) shichenValue = '8';
                        else if (h === 23) shichenValue = '23';
                        else if (h <= 0) shichenValue = '0';
                        else shichenValue = String(h % 2 === 0 ? h : h + 1);
                        document.getElementById('birth-hour').value = shichenValue;
                    }
                    if (importedData.gender === '男') document.getElementById('gender-male').checked = true;
                    else document.getElementById('gender-female').checked = true;

                    alert('資料讀取成功！即時更新盤面...');
                    if (calculateBtn) calculateBtn.click(); // 自動按一下更新按鈕
                } catch (err) { alert("檔案格式不正確，無法讀取。"); }
                fileInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    // --- 頁面初始化 ---
populateDateSelectors();
prefillTestData();
setTimeout(() => {
    calculateBtn.click();
}, 10);
    
// ▼▼▼ 為圖表切換按鈕綁定事件 ▼▼▼
document.querySelectorAll('input[name="chart-mode"]').forEach(radio => {
    radio.addEventListener('change', updateChart);
});

// ▼▼▼ 切換至「太乙國運」工具的按鈕邏輯 ▼▼▼
if (switchToNationalBtn) {
    switchToNationalBtn.addEventListener('click', () => {
        window.location.href = 'taiyi-national/tn_index.html';
    });
}

// ▼▼▼ 為n8n「特定年份運勢解說」按鈕綁定事件監聽 (包含啟用下載PDF按鈕的邏輯) ▼▼▼
    const testN8nAiBtn = document.getElementById('test-n8n-ai-btn');  
    if (testN8nAiBtn) {
        testN8nAiBtn.addEventListener('click', async () => {
            // 然後，在「點擊後」，才去尋找它需要操作的其他元素
            const n8nAiOutput = document.getElementById('n8n-ai-output');
            const downloadBtn = document.getElementById('download-pdf-btn');

            // 再次確認，確保萬無一失
            if (!n8nAiOutput || !downloadBtn) {
                 console.error("錯誤：找不到 n8n 輸出區域或下載按鈕！");
                 return;
            }

            if (!currentChartData) {
                alert('請先排盤，再產生分析結果。');
                return;
            }

            // ▼▼▼ 新增：點擊「年度」時，清空「本月」的結果 ▼▼▼
            const monthlyOutput = document.getElementById('ai-summary-output');
            if (monthlyOutput) {
                monthlyOutput.innerHTML = '';
                monthlyOutput.style.display = 'none';
            }

            downloadBtn.disabled = true;
            n8nAiOutput.style.display = 'block';
            n8nAiOutput.innerHTML = '正在連接 n8n 並請求 AI 分析，請稍候...';
            
            const aiMarkdownContent = await getN8nAnalysis(currentChartData); 
            
            if (aiMarkdownContent.startsWith('<h4>分析失敗')) {
                n8nAiOutput.innerHTML = aiMarkdownContent;
            } else {
                // ▼▼▼ 修正點：在這裡先產生頁首，再組合內容 ▼▼▼
                const headerHtml = generatePersonalInfoHeaderHTML(currentChartData, '能量趨勢報告');
                n8nAiOutput.innerHTML = headerHtml + marked.parse(aiMarkdownContent);

                downloadBtn.disabled = false;
                // 「輸出PDF報告」固定匯出整個盤面資訊，這裡不再覆寫其點擊行為。
            }
        });
    } else {
        // 如果一開始就找不到主按鈕，就在主控台報錯
        console.error("致命錯誤：在 HTML 中找不到 id 為 'test-n8n-ai-btn' 的主按鈕！");
    }

// ▼▼▼ 為n8n「本月運勢解說」按鈕綁定事件監聽 ▼▼▼
    const getMonthlyAiBtn = document.getElementById('get-monthly-ai-btn');
    if (getMonthlyAiBtn && aiSummaryOutput) {
        getMonthlyAiBtn.addEventListener('click', async () => { 
            if (!currentChartData || !currentChartData.currentUserAge) {
                alert('請先排盤，再產生分析結果。');
                return;
            }

            const annualOutput = document.getElementById('n8n-ai-output');
            const downloadBtn = document.getElementById('download-pdf-btn');
            if (annualOutput) {
                annualOutput.innerHTML = '';
                annualOutput.style.display = 'none';
            }

            aiSummaryOutput.style.display = 'block';
            aiSummaryOutput.innerHTML = '正在產生本月運勢深度分析，請稍候...';

            // 呼叫我們新的月運專用函式
            const summaryText = await getMonthlyAnalysis(currentChartData);
            
            // ▼▼▼ 最小更動：在這裡即時計算當前月份名稱 ▼▼▼
            const today = new Date();
            const currentMonthNumber = getSolarTermMonth(today); // 這是您已有的函式
            const currentMonthIndex = currentMonthNumber - 1;
            const currentLunarDateStr = MONTH_NAMES_CHINESE[currentMonthIndex];
            
            const headerHtml = generatePersonalInfoHeaderHTML(currentChartData, '本月運勢深度解析');
            aiSummaryOutput.innerHTML = headerHtml + marked.parse(summaryText);

            // 「輸出PDF報告」固定匯出整個盤面資訊，這裡只啟用按鈕、不再覆寫其點擊行為。
            if (downloadBtn) {
                downloadBtn.disabled = false;
            }
        });
}

    /* ============================================================
       合盤橋接（merge-bridge v1.3 / ext-curve）— 插於 DOMContentLoaded 閉包尾端
       （閉包內函式不外露，故橋接置於此；除本區塊外不修改任何原有邏輯）
       契約：父頁 postMessage {xl:'xl-merge-bridge', type:'run',
             input:{name, gender('male'/'female'), y, m, d, hour(0/2/…/22/23), targetYear}}
       回傳 ext-curve：兩條序列——
         限例太乙（level:'daen'，十二宮歲段，走 arrangeAgeLimits+calculateFortuneScores 原始路徑）
         行年趨勢（level:'year'，虛歲 1–106 逐歲＝所在限例分＋行年分（含0.7加權），
                   與圖表 annual 模式同一計算流程）
       年齡慣例依本工具原始碼：虛歲（西元年＝出生年＋歲−1）。
       行年序列另附太乙既有計算的 specialYears：祿馬交馳與科甲年份分類。
       ============================================================ */
    (function(){
      var NS='xl-merge-bridge';
      function post(msg){ try{ parent.postMessage(Object.assign({xl:NS,from:'taiyi'},msg),'*'); }catch(e){} }
      window.addEventListener('message', function(ev){
        var d=ev.data; if(!d||d.xl!==NS||d.type!=='run') return;
        try{
          var i=d.input;
          var nameEl=document.getElementById('user-name');
          if(nameEl) nameEl.value=i.name||'';
          document.getElementById(i.gender==='female'?'gender-female':'gender-male').checked=true;
          document.getElementById('birth-year').value=String(i.y);
          document.getElementById('birth-month').value=String(i.m);
          document.getElementById('birth-day').value=String(i.d);
          document.getElementById('birth-hour').value=String(i.hour);
          var ty=document.getElementById('target-year');
          if(ty&&i.targetYear) ty.value=String(i.targetYear);
          document.getElementById('calculate-btn').click();
          if(!currentChartData||!currentChartData.arrangedLifePalaces){
            post({type:'ext-curve', ok:false, error:'太乙排盤未成功'}); return;
          }
          var birthY=i.y;
          /* --- 限例太乙（同 mingGong 圖表模式計算路徑）--- */
          var ageLimits=arrangeAgeLimits(currentChartData.arrangedLifePalaces);
          var limitData=ageLimits.map(function(ar,idx){
            return { palaceId:VALID_PALACES_CLOCKWISE[idx], ageRange:ar };
          }).filter(function(x){ return x.ageRange; });
          var limitScores=calculateFortuneScores(currentChartData.chartModel,
            currentChartData.arrangedLifePalaces,
            limitData.map(function(x){return x.ageRange;}),
            currentChartData.hourPillar, currentChartData.lookupResult);
          var segs=[];
          limitData.forEach(function(li,k){
            var se=li.ageRange.split('-').map(Number);
            if(se.length!==2||isNaN(se[0])||isNaN(se[1])) return;
            segs.push({ start:se[0], end:se[1], label:li.ageRange+'歲', value:limitScores[k], palaceId:li.palaceId });
          });
          // 依歲段起點排序（同原圖表 mingGong 模式的排序規則；宮位序≠歲數序，未排序折線會亂跳）
          segs.sort(function(a,b){ return a.start-b.start; });
          var segPts=[], segBounds=[];
          segs.forEach(function(g){
            var x0=birthY+g.start-1, x1=birthY+g.end; // 虛歲段 [start,end] → 年段 [x0,x1)
            segPts.push({ year:(x0+x1)/2, value:g.value });
            segBounds.push({ year:x0, label:g.start+'-'+g.end });
          });
          /* --- 行年趨勢（同 annual 圖表模式計算路徑：限例分＋行年加權分）--- */
          var glMap={};
          limitData.forEach(function(li,k){ glMap[li.palaceId]=limitScores[k]; });
          var annPts=[];
          for(var age=1; age<=106; age++){
            var cur=null;
            for(var k2=0;k2<limitData.length;k2++){
              var se2=limitData[k2].ageRange.split('-').map(Number);
              if(age>=se2[0]&&age<=se2[1]){ cur=limitData[k2]; break; }
            }
            if(!cur) continue;
            var fin=(glMap[cur.palaceId]||0)+calculateAnnualScore(age, currentChartData.chartModel, currentChartData);
            annPts.push({ year:birthY+age-1, value:fin });
          }
          /* --- 太乙特殊年份：直接重用本盤既有引擎，不在父頁重算或寫死個案歲數 --- */
          var luMaYears=findLuMaJiaoChiYears(currentChartData)||{threeWay:[],twoWay:[]};
          var keJiaYears=currentChartData.keJiaYears||findKeJiaYears(currentChartData)||{
            allThree:[],luZhuAndFeiLu:[],luZhuAndFeiMa:[]
          };
          var specialYears={
            luMaThreeWay:(luMaYears.threeWay||[]).slice(),
            luMaTwoWay:(luMaYears.twoWay||[]).slice(),
            keJiaAllThree:(keJiaYears.allThree||[]).slice(),
            luZhuAndFeiLu:(keJiaYears.luZhuAndFeiLu||[]).slice(),
            luZhuAndFeiMa:(keJiaYears.luZhuAndFeiMa||[]).slice()
          };
          post({type:'ext-curve', ok:true, data:{ series:[
            { id:'taiyi-xianli', label:'限例太乙', color:'#7d5a44', level:'daen',
              points:segPts, boundaries:segBounds, segments:segs },
            { id:'taiyi-xingnian', label:'太乙行年趨勢', color:'#46708a', level:'year',
              points:annPts, specialYears:specialYears }
          ]}});
        }catch(e){ post({type:'ext-curve', ok:false, error:String(e&&e.message||e)}); }
      });
      post({type:'ready'});
    })();

}); 