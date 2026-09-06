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

    // ▼▼▼ 盤面的位置設定 ▼▼▼ 
    const RADIAL_LAYOUT = {
        center: { x: 395.5, y: 418.5 },
        angles: { pYou:0, pXu:22.5, pQian:45, pHai:66.5, pZi:90, pChou:113.5, pGen:135, pYin:157.5, pMao:180, pChen:202.5, pXun:225, pSi:246.5, pWu:270, pWei:293.5, pKun:315, pShen:337.5 },
        angleOffset: 6,
        bottomPalaceRadiusOffset: 20, // 控制巳午未宮位文字要再離圓心多遠
        radii: {
            lineLeft:   { fieldA: 120, fieldB: 175, fieldG: 220 },
            lineCenter: { fieldC: 120, fieldD: 150, fieldC2: 180, fieldD2: 210 },
            lineRight:  { fieldE: 120, fieldF: 150, fieldE2: 180, fieldF2: 210 }
        },
        // ▼▼▼ 定義圓心 4 個欄位的座標 ▼▼▼
        centerFields: {
            field1: { x: 397, y: 408 }, field2: { x: 397, y: 438 },
            field3: { x: 381, y: 420 }, field4: { x: 413, y: 420 }
        },
        
        lifePalacesRing: { radius: 100, palaces: ['pZi','pChou','pYin','pMao','pChen','pSi','pWu','pWei','pShen','pYou','pXu','pHai'], color: '#792e13ff' },
        ageLimitRing: { radius: 122, palaces: ['pZi','pChou','pYin','pMao','pChen','pSi','pWu','pWei','pShen','pYou','pXu','pHai'], flipPalaces: ['pZi','pHai','pSi','pXu','pYou','pShen'], color: '#626363', className: 'age-limit-style' },
        yueJiangRing: { radius: 288, rotationOffset: 6, palaces: ['pZi','pHai','pXu','pYou','pShen','pWei','pWu','pSi','pChen','pMao','pYin','pChou'], flipPalaces: ['pHai','pSi','pXu','pYou','pShen'], color: '#501dd3' },
        guiRenRing: { radius: 288, rotationOffset: -5, palaces: ['pZi','pChou','pYin','pMao','pChen','pSi','pWu','pWei','pShen','pYou','pXu','pHai'], flipPalaces: ['pZi','pHai','pSi','pXu','pYou','pWu','pShen'], color: '#ae00ff' },
        outerRing: { radius: 103, palaces: ['pZi', 'pGen', 'pMao', 'pXun', 'pWu', 'pKun', 'pYou', 'pQian']},
        xingNianRing: { radius: 310, palaces: ['pZi','pChou','pYin','pMao','pChen','pSi','pWu','pWei','pShen','pYou','pXu','pHai'], flipPalaces: ['pZi', 'pHai', 'pXu', 'pYou', 'pShen', 'pSi'], className: 'jian-chu-style' },
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

    // ▼▼▼ 太乙基數 ▼▼▼
    const TAI_YI_BASE_JISHU = 10153917;

    // ▼▼▼ 月積數對應節氣月份的偏移量資料庫 ▼▼▼
    const MONTHLY_JISHU_OFFSET = {
    '子': -11, '丑': -10, '寅': -9, '卯': -8, '辰': -7, '巳': -6,
    '午': -5,  '未': -4,  '申': -3, '酉': -2, '戌': -1, '亥': 0
    };

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

    // ▼▼▼ 時區資料庫 (詳細版) ▼▼▼
    const TIMEZONES = [
    { text: '(UTC-12:00) 國際換日線西側', value: -12 },
    { text: '(UTC-11:00) 世界協調時間-11', value: -11 },
    { text: '(UTC-10:00) 夏威夷', value: -10 },
    { text: '(UTC-09:00) 阿拉斯加', value: -9 },
    { text: '(UTC-08:00) 太平洋標準時間(美加)', value: -8 },
    { text: '(UTC-07:00) 山地標準時間(美加)', value: -7 },
    { text: '(UTC-06:00) 中部標準時間(美加)', value: -6 },
    { text: '(UTC-05:00) 東部標準時間(美加)', value: -5 },
    { text: '(UTC-04:00) 大西洋標準時間(加拿大)', value: -4 },
    { text: '(UTC-03:30) 紐芬蘭', value: -3.5 },
    { text: '(UTC-03:00) 巴西利亞, 布宜諾斯艾利斯', value: -3 },
    { text: '(UTC-02:00) 世界協調時間-2', value: -2 },
    { text: '(UTC-01:00) 維德角, 亞速', value: -1 },
    { text: '(UTC+00:00) 倫敦, 里斯本, 卡薩布蘭卡', value: 0 },
    { text: '(UTC+01:00) 巴黎, 柏林, 羅馬', value: 1 },
    { text: '(UTC+02:00) 雅典, 開羅, 耶路撒冷', value: 2 },
    { text: '(UTC+03:00) 莫斯科, 巴格達, 奈洛比', value: 3 },
    { text: '(UTC+03:30) 德黑蘭', value: 3.5 },
    { text: '(UTC+04:00) 巴庫, 杜拜, 馬斯喀特', value: 4 },
    { text: '(UTC+04:30) 喀布爾', value: 4.5 },
    { text: '(UTC+05:00) 伊斯蘭馬巴德, 喀拉蚩', value: 5 },
    { text: '(UTC+05:30) 新德里, 孟買, 加爾各答', value: 5.5 },
    { text: '(UTC+05:45) 加德滿都', value: 5.75 },
    { text: '(UTC+06:00) 達卡, 努爾-蘇丹', value: 6 },
    { text: '(UTC+06:30) 仰光', value: 6.5 },
    { text: '(UTC+07:00) 曼谷, 河內, 雅加達', value: 7 },
    { text: '(UTC+08:00) 台北, 北京, 新加坡, 伯斯', value: 8 },
    { text: '(UTC+09:00) 東京, 首爾, 大阪', value: 9 },
    { text: '(UTC+09:30) 阿得雷德, 達爾文', value: 9.5 },
    { text: '(UTC+10:00) 雪梨, 墨爾本, 關島', value: 10 },
    { text: '(UTC+11:00) 海參崴, 索羅門群島', value: 11 },
    { text: '(UTC+12:00) 威靈頓, 奧克蘭, 斐濟', value: 12 },
    { text: '(UTC+13:00) 薩摩亞, 努瓜婁發', value: 13 },
    { text: '(UTC+14:00) 吉里巴斯', value: 14 }
    ];

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

    // ▼▼▼ 易經六十四卦資料庫 (已升級卦象描述) ▼▼▼
    const I_CHING_HEXAGRAMS = [
    { number: 1,  name: '乾為天',    symbol: '䷀', description: '創造與進取，剛健自強。廣大包容之象' },
    { number: 2,  name: '坤為地',    symbol: '䷁', description: '包容承載，順應萬物。君倡臣和之象' },
    { number: 3,  name: '水雷屯',    symbol: '䷂', description: '萬事起頭難，困境中成長。萬物如生之象' },
    { number: 4,  name: '山水蒙',    symbol: '䷃', description: '蒙昧未明，需啟蒙學習。萬物發生之象' },
    { number: 5,  name: '水天需',    symbol: '䷄', description: '蓄勢待時，耐心等待。密雲不雨之象' },
    { number: 6,  name: '天水訟',    symbol: '䷅', description: '爭訟不利，慎防爭端。天水相違之象' },
    { number: 7,  name: '地水師',    symbol: '䷆', description: '師眾齊心，領導用兵。以寡服眾之象' },
    { number: 8,  name: '水地比',    symbol: '䷇', description: '親比合群，團隊合作。水行地上之象' },
    { number: 9,  name: '風天小畜',  symbol: '䷈', description: '小有積蓄，漸進不躁。密雲不雨之象' },
    { number: 10, name: '天澤履',    symbol: '䷉', description: '謹慎前行，腳踏實地。安中防危之象' },
    { number: 11, name: '地天泰',    symbol: '䷊', description: '天地交泰，和諧亨通。小往大來之象' },
    { number: 12, name: '天地否',    symbol: '䷋', description: '陰陽不交，閉塞不通。人口不實之象' },
    { number: 13, name: '天火同人',  symbol: '䷌', description: '志同道合，共同合作。二人分金之象' },
    { number: 14, name: '火天大有',  symbol: '䷍', description: '富有充實，光明順遂。日麗中天之象' },
    { number: 15, name: '地山謙',    symbol: '䷎', description: '謙遜處世，以退為進。仰高就下之象' },
    { number: 16, name: '雷地豫',    symbol: '䷏', description: '喜樂和順，居安思危。萬物發生之象' },
    { number: 17, name: '澤雷隨',    symbol: '䷐', description: '隨順時勢，靈活應變。如水推車之象' },
    { number: 18, name: '山風蠱',    symbol: '䷑', description: '整頓腐敗，革故鼎新。以惡害義之象' },
    { number: 19, name: '地澤臨',    symbol: '䷒', description: '君子臨下，教化眾人。以上臨下之象' },
    { number: 20, name: '風地觀',    symbol: '䷓', description: '觀察省思，以德感人。春花競發之象' },
    { number: 21, name: '火雷噬嗑',  symbol: '䷔', description: '以剛破險，懲惡揚善。順中有物之象' },
    { number: 22, name: '山火賁',    symbol: '䷕', description: '文飾外表，內守真實。光明通泰之象' },
    { number: 23, name: '山地剝',    symbol: '䷖', description: '否極泰來，萬物剝落。去舊生新之象' },
    { number: 24, name: '地雷復',    symbol: '䷗', description: '失而復得，循環更新。反復往來之象' },
    { number: 25, name: '天雷无妄',  symbol: '䷘', description: '順應自然，真誠無妄。守舊安常之象' },
    { number: 26, name: '山天大畜',  symbol: '䷙', description: '積蓄能量，以待時機。積小成大之象' },
    { number: 27, name: '山雷頤',    symbol: '䷚', description: '養生之道，修身養性。遷善遠惡之象' },
    { number: 28, name: '澤風大過',  symbol: '䷛', description: '陰陽失衡，承重過大。本末俱弱之象' },
    { number: 29, name: '坎為水',    symbol: '䷜', description: '重險之境，反覆考驗。外虛中實之象' },
    { number: 30, name: '離為火',    symbol: '䷝', description: '光明照耀，文明進取。大明當天之象' },
    { number: 31, name: '澤山咸',    symbol: '䷞', description: '以感化人，兩情相悅。至誠感神之象' },
    { number: 32, name: '雷風恆',    symbol: '䷟', description: '恆久不變，堅守正道。四時不沒之象' },
    { number: 33, name: '天山遯',    symbol: '䷠', description: '避險退隱，明哲保身。守道去惡之象' },
    { number: 34, name: '雷天大壯',  symbol: '䷡', description: '剛健壯盛，須防妄動。先曲後順之象' },
    { number: 35, name: '火地晉',    symbol: '䷢', description: '進取向上，光明前途。以臣遇君之象' },
    { number: 36, name: '地火明夷',  symbol: '䷣', description: '智者避世，光明受傷。出明入暗之象' },
    { number: 37, name: '風火家人',  symbol: '䷤', description: '齊家之道，內外有序。開花結子之象' },
    { number: 38, name: '火澤睽',    symbol: '䷥', description: '分歧矛盾，異中求同。猛虎陷阱之象' },
    { number: 39, name: '水山蹇',    symbol: '䷦', description: '艱難困阻，謹慎前行。背明向暗之象' },
    { number: 40, name: '雷水解',    symbol: '䷧', description: '困境化解，解難得助。患難解散之象' },
    { number: 41, name: '山澤損',    symbol: '䷨', description: '減損有益，損中有得。鑿石見玉之象' },
    { number: 42, name: '風雷益',    symbol: '䷩', description: '損上益下，積善得福。河水溢出之象' },
    { number: 43, name: '澤天夬',    symbol: '䷪', description: '果決斷行，剛健能和。先損後益之象' },
    { number: 44, name: '天風姤',    symbol: '䷫', description: '陽遇陰，偶然相逢。或聚或散之象' },
    { number: 45, name: '澤地萃',    symbol: '䷬', description: '萃聚人心，群體團結。魚龍會聚之象' },
    { number: 46, name: '地風升',    symbol: '䷭', description: '節節高升，漸進發展。積小成大之象' },
    { number: 47, name: '澤水困',    symbol: '䷮', description: '陷入困境，內心堅忍。守己待時之象' },
    { number: 48, name: '水風井',    symbol: '䷯', description: '取之不竭，資源共享。守靜安常之象' },
    { number: 49, name: '澤火革',    symbol: '䷰', description: '革新變革，順應時代。改舊從新之象' },
    { number: 50, name: '火風鼎',    symbol: '䷱', description: '鼎新立業，革故鼎新。去故取新之象' },
    { number: 51, name: '震為雷',    symbol: '䷲', description: '動盪驚雷，警醒人心。震驚百里之象' },
    { number: 52, name: '艮為山',    symbol: '䷳', description: '靜止止步，內心安定。積小成高之象' },
    { number: 53, name: '風山漸',    symbol: '䷴', description: '漸進之道，循序漸進。積小成大之象' },
    { number: 54, name: '雷澤歸妹',  symbol: '䷵', description: '婚姻成家，社會秩序。陰陽不交之象' },
    { number: 55, name: '雷火豐',    symbol: '䷶', description: '豐盛繁榮，需防盈滿。藏暗向明之象' },
    { number: 56, name: '火山旅',    symbol: '䷷', description: '遊歷漂泊，異地發展。歡極哀生之象' },
    { number: 57, name: '巽為風',    symbol: '䷸', description: '謙遜入微，柔順滲透。上行下放之象' },
    { number: 58, name: '兌為澤',    symbol: '䷹', description: '喜悅交流，柔中帶剛。天峰雨澤之象' },
    { number: 59, name: '風水渙',    symbol: '䷺', description: '分散化解，團結一心。大風吹物之象' },
    { number: 60, name: '水澤節',    symbol: '䷻', description: '節制有度，分寸得宜。寒暑有節之象' },
    { number: 61, name: '風澤中孚',  symbol: '䷼', description: '誠信中正，內外相應。事有定期之象' },
    { number: 62, name: '雷山小過',  symbol: '䷽', description: '謹慎行事，小心謙遜。上逆下順之象' },
    { number: 63, name: '水火既濟',  symbol: '䷾', description: '事事圓滿，盛極須防。陰陽配合之象' },
    { number: 64, name: '火水未濟',  symbol: '䷿', description: '未竟之業，臨終待成。憂中望喜之象' }
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
    
    const XIAO_YOU_ORDER = ['乾', '午', '艮', '卯', '酉', '坤', '子', '巽'];
    const JUN_CHEN_JI_ORDER = ['午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳'];
    const MIN_JI_ORDER = ['戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉'];
    const TIAN_YI_ORDER = ['酉', '申', '子', '巳', '戌', '未', '丑', '亥', '午', '寅', '卯', '辰'];
    const DI_YI_ORDER = ['巳', '戌', '未', '丑', '亥', '午', '寅', '卯', '辰', '酉', '申', '子'];
    const SI_SHEN_ORDER = ['亥', '午', '寅', '卯', '辰', '酉', '申', '子', '巳', '戌', '未', '丑'];
    const FEI_FU_ORDER = ['辰', '酉', '申', '子', '巳', '戌', '未', '丑', '亥', '午', '寅', '卯'];
    const DA_YOU_ORDER = ['坤', '子', '巽', '乾', '午', '艮', '卯', '酉'];

    // 在 tn_script.js 的 SECTION 1 加入
    const WU_FU_ORDER = ['乾', '艮', '巽', '坤', '中'];

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

    // ▼▼▼ 年月日八門的安放宮位順序 ▼▼▼
    const YMD_GATES_PALACE_ORDER = ['乾', '子', '艮', '卯', '巽', '午', '坤', '酉'];

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
    // ▼▼▼ 干支月份地支與其數字順序的對照表 ▼▼▼
    const ASTROLOGICAL_MONTH_MAP = {
    '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
    '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
    };

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

    // ▼▼▼ 十二宮位對沖關係資料庫 ▼▼▼
    const PALACE_OPPOSITES = {
    '子': '午', '丑': '未', '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥',
    '午': '子', '未': '丑', '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
    };

    // ▼▼▼ 十二宮位三合、六合等關係資料庫 (包含相鄰) ▼▼▼
    const PALACE_RELATIONSHIPS = {
    '子': { next: '丑', prev: '亥' }, '丑': { next: '寅', prev: '子' },
    '寅': { next: '卯', prev: '丑' }, '卯': { next: '辰', prev: '寅' },
    '辰': { next: '巳', prev: '卯' }, '巳': { next: '午', prev: '辰' },
    '午': { next: '未', prev: '巳' }, '未': { next: '申', prev: '午' },
    '申': { next: '酉', prev: '未' }, '酉': { next: '戌', prev: '申' },
    '戌': { next: '亥', prev: '酉' }, '亥': { next: '子', prev: '戌' }
    }

    // ▼▼▼ 太乙入宮陰陽屬性資料庫 ▼▼▼
    const TAIYI_PALACE_PROPERTIES = {
    '子': { type: '陽宮', text: '（容易火災，熱旱）' },
    '艮': { type: '陽宮', text: '（容易火災，熱旱）' },
    '卯': { type: '陽宮', text: '（容易火災，熱旱）' },
    '巽': { type: '陽宮', text: '（容易火災，熱旱）' },
    '午': { type: '陰宮', text: '（容易大雨，洪水）' },
    '坤': { type: '陰宮', text: '（容易大雨，洪水）' },
    '酉': { type: '陰宮', text: '（容易大雨，洪水）' },
    '乾': { type: '陰宮', text: '（容易大雨，洪水）' }
    };

    // ▼▼▼ 宮位與地理方位對照表 ▼▼▼
    const PALACE_TO_DIRECTION = {
    '子': '北方',   '丑': '北北東方', '艮': '東南方',
    '寅': '東南東方', '卯': '東方',   '辰': '東南東方',
    '巽': '東南方',   '巳': '南南東方', '午': '南方',
    '未': '南南西方', '坤': '西南方',   '申': '西南西方',
    '酉': '西方',   '戌': '西北西方', '乾': '西北方',
    '亥': '北北西方'
    };

    // ▼▼▼ 建除十二神順序 ▼▼▼
    const JIAN_CHU_ORDER = ['建', '除', '滿', '平', '定', '執', '破', '危', '成', '收', '開', '閉'];

    // ▼▼▼ 六十甲子空亡規則資料庫 (依序對應：甲子旬, 甲戌旬, 甲申旬, 甲午旬, 甲辰旬, 甲寅旬) ▼▼▼
    const KONG_WANG_DATA = [
    { name: '甲子旬', void: '戌亥' }, // 0-9
    { name: '甲戌旬', void: '申酉' }, // 10-19
    { name: '甲申旬', void: '午未' }, // 20-29
    { name: '甲午旬', void: '辰巳' }, // 30-39
    { name: '甲辰旬', void: '寅卯' }, // 40-49
    { name: '甲寅旬', void: '子丑' }  // 50-59
    ];

    // ▼▼▼ 空亡底色位置微調設定表 (單位：度) ▼▼▼
    // 正數(+)為順時鐘偏移，負數(-)為逆時鐘偏移
    const KONG_WANG_OFFSET_CONFIG = {
    '子': 0, 
    '丑': -1, 
    '寅': 0, 
    '卯': 0, 
    '辰': 0, 
    '巳': 1.1, 
    '午': 0, 
    '未': -1, 
    '申': 0, 
    '酉': 0, 
    '戌': 0, 
    '亥': 1 
    };




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
    // 雖然淡入要1秒，但延遲不要太久，否則使用者會覺得反應慢
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
// ▼▼▼ 繪製放射狀文字的工具函式 (可翻轉版) ▼▼▼
// ▼▼▼ 繪製放射狀文字的工具函式 (可針對特定宮位翻轉) ▼▼▼
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
    if (!data || !Array.isArray(data)) {
        return;
    }
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
    circle.setAttribute('r', 10);  //紅色圓圈的直徑設定
    circle.setAttribute('class', circleClassName);

    // 圓圈也加上動畫，讓它和文字一起浮現
    circle.style.opacity = 0;
    circle.style.transition = "opacity 1s ease-out";

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
// ▼▼▼ 【修正版V2】繪製空亡扇形背景 (修正角度偏移問題) ▼▼▼
function drawKongWangSector(palaceBranch) {
    // 1. 將地支轉為宮位 ID
    const palaceId = BRANCH_TO_PALACE_ID[palaceBranch];
    if (!palaceId) return;

    // 2. 取得該宮位的原始中心角度
    let centerAngle = RADIAL_LAYOUT.angles[palaceId];
    if (centerAngle === undefined) return;

    // 【核心修正點】讀取微調設定並應用
    // 如果設定表中有該地支的數值，就加到中心角度上
    const manualOffset = KONG_WANG_OFFSET_CONFIG[palaceBranch] || 0;
    centerAngle += manualOffset;

    // 3. 設定扇形的參數
    // 保持收窄的 9 度，避免蓋到四維卦
    const halfSlice = 11.2; 
    const startAngle = centerAngle - halfSlice;
    const endAngle = centerAngle + halfSlice;

    // 內徑與外徑
    const innerRadius = 93;  
    const outerRadius = 352; 

    // 4. 計算扇形路徑的四個點
    // 【核心修正點】直接將角度轉為弧度，不要減 90 度
    const toRad = (deg) => deg * (Math.PI / 180); 
    
    const x1 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(startAngle));
    const y1 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(startAngle));
    
    const x2 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(startAngle));
    const y2 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(startAngle));
    
    const x3 = RADIAL_LAYOUT.center.x + outerRadius * Math.cos(toRad(endAngle));
    const y3 = RADIAL_LAYOUT.center.y + outerRadius * Math.sin(toRad(endAngle));
    
    const x4 = RADIAL_LAYOUT.center.x + innerRadius * Math.cos(toRad(endAngle));
    const y4 = RADIAL_LAYOUT.center.y + innerRadius * Math.sin(toRad(endAngle));

    // 5. 組合 SVG 路徑指令
    const pathData = `
        M ${x1} ${y1}
        L ${x2} ${y2}
        A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
        L ${x4} ${y4}
        A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
        Z
    `;

    // 6. 建立元素並加入畫面
    const pathElement = document.createElementNS(SVG_NS, 'path');
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('class', 'kong-wang-bg star-visible'); 
    
    dynamicGroup.insertBefore(pathElement, dynamicGroup.firstChild);
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


// --- 繪圖主函式 (最終整理版) ---
function renderChart(mainData, palacesData, agesData, sdrData, centerData, outerRingData, jianChuData) {    
    clearDynamicData();

    // 1. 繪製外環 (八門/九宮)
    if (outerRingData) {
        const ringConfig = RADIAL_LAYOUT.outerRing;
        for (const palaceId in outerRingData) {
            if (ringConfig.palaces.includes(palaceId)) {
                const text = outerRingData[palaceId];
                const angle = RADIAL_LAYOUT.angles[palaceId];
                const angleRad = angle * (Math.PI / 180);
                const x = RADIAL_LAYOUT.center.x + ringConfig.radius * Math.cos(angleRad);
                const y = RADIAL_LAYOUT.center.y + ringConfig.radius * Math.sin(angleRad);
                addEncircledText(text, x, y, 0, 'eight-gates-style', 'highlight-circle');
            }
        }
    }
    
    // 2. 繪製中心資訊
    if (centerData) {
        addCenterText(centerData.field1, RADIAL_LAYOUT.centerFields.field1, 'center-info-style');
        addCenterText(centerData.field2, RADIAL_LAYOUT.centerFields.field2, 'center-info-style');
        addCenterText(centerData.field3, RADIAL_LAYOUT.centerFields.field3, 'center-info-style');
        addCenterText(centerData.field4, RADIAL_LAYOUT.centerFields.field4, 'center-info-style');
    }

    // 3. 繪製建除十二神
    if (jianChuData && jianChuData.length > 0) {
        addRotatedRingText(jianChuData, RADIAL_LAYOUT.xingNianRing);
    }

    // 4. 繪製十六宮位星曜
    for (const palaceKey in mainData) {
        if (!mainData[palaceKey]) continue;
        const centerAngle = RADIAL_LAYOUT.angles[palaceKey];
        const pData = mainData[palaceKey];
        if (centerAngle === undefined || !pData) continue;

        const angleLeft = centerAngle - RADIAL_LAYOUT.angleOffset;
        const angleCenter = centerAngle;
        const angleRight = centerAngle + RADIAL_LAYOUT.angleOffset;

        // --- 左側線 (主星、五福、定目) ---
        if (pData.lineLeft) {
            const getLineLeftClass = (starName) => {
                if (typeof starName === 'string' && starName.includes('五福')) return 'wu-fu-style';
                if (starName === '定目') return 'ding-mu-style';
                return 'main-info-style';
            };
            if (pData.lineLeft.fieldA) addRadialText(palaceKey, angleLeft, RADIAL_LAYOUT.radii.lineLeft.fieldA, pData.lineLeft.fieldA, getLineLeftClass(pData.lineLeft.fieldA));
            if (pData.lineLeft.fieldB) addRadialText(palaceKey, angleLeft, RADIAL_LAYOUT.radii.lineLeft.fieldB, pData.lineLeft.fieldB, getLineLeftClass(pData.lineLeft.fieldB));
            if (pData.lineLeft.fieldG) addRadialText(palaceKey, angleLeft, RADIAL_LAYOUT.radii.lineLeft.fieldG, pData.lineLeft.fieldG, getLineLeftClass(pData.lineLeft.fieldG));
        }

        // --- 中間線 (基星類) ---
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

        // --- 右側線 (神煞類) ---
        if (pData.lineRight) {
            const getLineRightClass = (starName) => {
                if (starName === '小遊') return 'xiaoyou-style';
                if (starName === '大遊') return 'dayou-style';
                if (['天乙', '地乙', '四神', '飛符'].includes(starName)) return 'celestial-messenger-style';
                if (starName === '皇恩星') return 'huang-en-style'; 
                return 'deity-style';
            };
            if (pData.lineRight.fieldE) addRadialText(palaceKey, angleRight, RADIAL_LAYOUT.radii.lineRight.fieldE, pData.lineRight.fieldE, getLineRightClass(pData.lineRight.fieldE));
            if (pData.lineRight.fieldF) addRadialText(palaceKey, angleRight, RADIAL_LAYOUT.radii.lineRight.fieldF, pData.lineRight.fieldF, getLineRightClass(pData.lineRight.fieldF));
            if (pData.lineRight.fieldE2) addRadialText(palaceKey, angleRight, RADIAL_LAYOUT.radii.lineRight.fieldE2, pData.lineRight.fieldE2, getLineRightClass(pData.lineRight.fieldE2));
            if (pData.lineRight.fieldF2) addRadialText(palaceKey, angleRight, RADIAL_LAYOUT.radii.lineRight.fieldF2, pData.lineRight.fieldF2, getLineRightClass(pData.lineRight.fieldF2));
        }
    }

    // 5. 繪製其他環圈 (命宮、月將、貴人等)
    addSingleCharRing(palacesData, RADIAL_LAYOUT.lifePalacesRing);
    addSdrRing(sdrData, RADIAL_LAYOUT.sdrRing);
    
    if (mainData && mainData.yueJiangData) {
        addRotatedRingText(mainData.yueJiangData, RADIAL_LAYOUT.yueJiangRing);
    }
    if (mainData && mainData.guiRenData) {
        addRotatedRingText(mainData.guiRenData, RADIAL_LAYOUT.guiRenRing);
    }
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
    // 原本的 calculateSuanStars 函式內部邏輯需要調整
    function calculateSuanStars(lookupResult) {
        const result = { chartStars: {}, centerStars: [] };
        if (!lookupResult) return result;

        const suanMap = {
            '主': lookupResult.主算,
            '客': lookupResult.客算,
            '定': lookupResult.定算
        };

        for (const prefix in suanMap) {
            let suanValue = parseInt(suanMap[prefix], 10);
            if (isNaN(suanValue)) continue;

            // ▼▼▼ 修正開始：處理整十數與一般數的邏輯 ▼▼▼
            let targetKey;

            // 規則：如果是 10, 20, 30, 40，則除以 9 取餘數 (即 1, 2, 3, 4)
            // 實際上 10, 20, 30, 40 的餘數剛好就是它們的十位數 (1, 2, 3, 4)
            if (suanValue % 10 === 0) {
                targetKey = String(suanValue / 10); // 40 -> '4', 30 -> '3'
                // 注意：如果您的 SUAN_DIGIT_RULES 只有 '1'~'9' 和 '0'
                // 這裡 40 變成 '4' 就會正確對應到 SUAN_DIGIT_RULES['4'] (卯/午)
            } else {
                // 一般數字：取個位數
                targetKey = String(suanValue % 10);
            }
            // ▲▲▲ 修正結束 ▲▲▲

            const rule = SUAN_DIGIT_RULES[targetKey];
            
            if (rule) {
                // ... (後續將星曜放入 chartStars 或 centerStars 的代碼保持不變)
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
    // ▼▼▼ 【修正版V3】計算大遊 (年/月/日積數+34, 時盤不加, 週期288, 每36一宮) ▼▼▼
    function calculateDaYou(jishu, chartType) {
    if (jishu === null || jishu === undefined) return null;
    
    let finalJishu = Number(jishu);

    // 【核心修正點】
    // 只有「非時盤」(年/月/日) 才需要 +34
    // 時盤 (chartType === 'hour') 不需要加，保持原積數
    if (chartType !== 'hour') {
        finalJishu += 34;
    }
    
    // 1. 除以 288 取餘數
    let remainder = finalJishu % 288;
    
    // 2. 處理餘數為 0 的情況 (代表走到週期的最後一步)
    if (remainder === 0) remainder = 288;
    
    // 3. 按照每 36 個單位換一個宮位
    const palaceIndex = Math.floor((remainder - 1) / 36);
    
    if (palaceIndex < DA_YOU_ORDER.length) {
        return DA_YOU_ORDER[palaceIndex];
    }
    return null;
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
                // jishuInput 這裡傳入的是物件 { taiYiYear, monthBranch, isYearEnd }
                const { taiYiYear, monthBranch, isYearEnd } = jishuInput;
                
                // 1. 先算出該太乙年「亥月 (年底)」的總積數
                const baseJishuForHai = (WU_FU_BASE_JISHU + taiYiYear) * 12;
                let baseRemainder = baseJishuForHai % CYCLE;
                if (baseRemainder === 0) baseRemainder = CYCLE;

                // 2. 確定目標月份的順序 (子=0 ... 亥=11)
                let branchIndex = EARTHLY_BRANCHES.indexOf(monthBranch);
                
                // 3. 處理「年底子丑月」的特殊銜接
                // 如果現在是公曆年底(11/12月)，但還沒過冬至(taiYiYear沒+1)，
                // 這時的子/丑月其實是該太乙年的「第13/14個月」(邏輯上的延伸)，
                // 這樣才能確保從亥月(11)往後推算時是正確的 (+1, +2)。
                if (isYearEnd && (monthBranch === '子' || monthBranch === '丑')) {
                    branchIndex += 12;
                }

                // 4. 計算與亥月(基準點)的距離
                // 亥的標準索引是 11
                const haiIndex = 11;
                // 距離 = 亥月索引 - 目標月索引
                // 例：求酉月(9)，11 - 9 = 2 (酉月在亥月前2個月) -> 餘數要 -2
                // 例：求明年子月(0)，11 - 0 = 11 (子月在亥月前11個月) -> 餘數要 -11
                // 例：求年底子月(12)，11 - 12 = -1 (年底子月在亥月後1個月) -> 餘數要 -(-1) = +1
                const diff = haiIndex - branchIndex;
                
                // 5. 應用倒推邏輯
                remainder = baseRemainder - diff;
                
                // 6. 處理循環 (確保餘數在 1~225 之間)
                while (remainder <= 0) remainder += CYCLE;
                while (remainder > CYCLE) remainder -= CYCLE;
                break;

            default:
                // 日五福、時五福：jishuInput 直接是積數
                remainder = Number(jishuInput) % CYCLE;
                break;
        }

        if (remainder === 0) remainder = CYCLE;

        // --- 找出對應宮位 ---
        const palaceIndex = Math.floor((remainder - 1) / UNITS_PER_PALACE);
        const palaceName = (palaceIndex < WU_FU_ORDER.length) ? WU_FU_ORDER[palaceIndex] : null;

        if (!palaceName) return null;

        // --- 計算該宮位內的第幾個單位 ---
        const finalSubNumber = (remainder - 1) % UNITS_PER_PALACE + 1;

        return {
            palace: palaceName,
            text: `${namePrefix}${finalSubNumber}`
        };
    }

    // ▼▼▼ 【修正版】計算月將 (同時回傳 畫圖資料 與 月將名稱) ▼▼▼
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
    // 處理跨年節氣
    if (termIndex === -1) {
        const prevYearTermTime = solarLunar.getTerm(solarDate.year - 1, 24);
        if (solarDate.date.getTime() >= prevYearTermTime) { 
            termIndex = 23; 
        } else { 
            // 如果找不到，回傳空資料
            return { ringData: new Array(12).fill(""), name: "未知" }; 
        }
    }
    
    let generalTermIndex = termIndex;
    // 月將規則：中氣過後換將
    if (generalTermIndex % 2 === 0) { generalTermIndex = generalTermIndex - 1; }
    if (generalTermIndex < 0) { generalTermIndex = 23; }
    
    const monthlyGeneralName = MONTHLY_GENERALS_MAPPING[generalTermIndex];
    
    // 如果找不到月將名稱，回傳空資料
    if (!monthlyGeneralName) {
        return { ringData: new Array(12).fill(""), name: "未知" };
    }

    // --- 步驟 2: 找出月將和時支的起始位置 ---
    const startGeneralIndex = FULL_GENERALS_ORDER.indexOf(monthlyGeneralName);
    const startPalaceIndex = solarLunar.zhi.indexOf(hourBranch);
    
    if (startGeneralIndex === -1 || startPalaceIndex === -1) { 
        return { ringData: new Array(12).fill(""), name: "未知" }; 
    }

    // --- 步驟 3: 逆時鐘排列 ---
    const palaceToGeneralMap = {};
    for (let i = 0; i < 12; i++) { 
        const currentPalaceZhi = solarLunar.zhi[i];
        const counterClockwiseOffset = (startPalaceIndex - i + 12) % 12;
        const generalIndex = (startGeneralIndex - counterClockwiseOffset + 12) % 12;
        palaceToGeneralMap[currentPalaceZhi] = FULL_GENERALS_ORDER[generalIndex];
    }
    
    // --- 步驟 4: 按照繪圖順序輸出結果 ---
    const drawingPalaceOrder = RADIAL_LAYOUT.yueJiangRing.palaces.map(pId => PALACE_ID_TO_BRANCH[pId]);
    
    // 【修正點】這裡變數名稱改回 result，確保定義與使用一致
    const result = drawingPalaceOrder.map(zhi => palaceToGeneralMap[zhi] || "");

    // 回傳物件：包含畫圖用的陣列(ringData) 和 純文字名稱(name)
    return {
        ringData: result,
        name: monthlyGeneralName.substring(0, 2) 
    };
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

    // 1. 為了「日柱」，我們使用未經校正的、純粹的實際天數差
    const startPillarIndex = JIAZI_CYCLE_ORDER.indexOf(referencePoint.dayPillar);
    if (startPillarIndex === -1) return null;
    const newPillarIndex = (startPillarIndex + dayDifference) % 60;
    const dayPillar = JIAZI_CYCLE_ORDER[newPillarIndex];

    // 2. 為了「積數」和「局數」，我們計算需要經過立春校正的天數差
    let jishuDayDifference = dayDifference;
    const lichunTime = solarLunar.getTerm(year, 3);
    const lichunDate = new Date(lichunTime);

    // ▼▼▼ 唯一的修改點：更精準的判斷條件 ▼▼▼
    // 只有當生日的「年月日」和立春的「年月日」完全相同，
    // 且出生時間早於立春時間時，才進行校正。
    if (isCrossYear &&
        birthDate.getDate() === lichunDate.getUTCDate() &&
        birthDate.getMonth() === lichunDate.getUTCMonth() &&
        birthTime < lichunTime) {
        
        jishuDayDifference -= 1;
        console.log("偵錯：觸發「當日立春」校正，天數差減 1。");
    }

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
    // ▼▼▼ 根據生日自動計算積數與局數的整合型函式 (v2-精準版) ▼▼▼
    function calculateJishuAndBureau(birthDate) {
    // 步驟 1: 先取得日積數的基礎資料
    const dailyValues = calculateDailyValues(birthDate);
    if (!dailyValues) return null;

    const hour = birthDate.getHours();
    const { dayJishu, dayPillar, dayBureau } = dailyValues;

    // 步驟 2: 計算精準時積數
    // 處理夜子時(23點)的情況：Bazi日柱會換日，所以用於計算的日積數也要跟著+1
    let adjustedDayJishu = dayJishu - 1;
    if (hour === 23) {
        adjustedDayJishu += 1;
    }

    // 根據您的規則，計算1-12的時辰數 (子時為1, 丑時為2...)
    const hourIndex0Based = (hour >= 1 && hour < 23) ? Math.floor((hour + 1) / 2) : 0;
    const hourIncrement1Based = hourIndex0Based + 1; // 將 0-11 轉為 1-12

    // 最終時積數 = (調整後的日積數 * 12) + 1至12的時辰數
    const hourJishu = (adjustedDayJishu * 12) + hourIncrement1Based;

    // 步驟 3: 根據時積數，反推時柱以供驗證
    // 六十甲子是1-60的循環，對應陣列索引0-59。公式為 (數字-1)%60
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
    const bureauRemainder = hourJishu % 72;
    const bureauNumber = (bureauRemainder === 0) ? 72 : bureauRemainder;
    const calculatedBureau = `${bureauType}${bureauNumber}局`;

    return {
        dayJishu: dayJishu,
        hourJishu: hourJishu,
        dayPillar: dayPillar,
        validatedHourPillar: validatedHourPillar,
        calculatedBureau: calculatedBureau, // 這是時局數
        dayBureau: dayBureau               
    };
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
    // ▼▼▼ 計算「年/月/日局」八門位置的函式▼▼▼
    function calculateYmdOuterRingData(jishu, taiYiPalaceBranch) {
    const finalGates = {};
    if (!jishu || !taiYiPalaceBranch) {
        return finalGates; // 如果缺少必要資訊，返回空物件
    }

    // --- 第一步：找出「值使門」---
    const cycle = 240;
    const unitsPerPalace = 30;
    let remainder = Number(jishu) % cycle;
    if (remainder === 0) {
        remainder = cycle;
    }

    const leadingGateIndex = Math.floor((remainder - 1) / unitsPerPalace);
    const leadingGate = EIGHT_GATES_ORDER[leadingGateIndex];

    // --- 第二步：從「太乙」宮位開始，安放八門 ---
    const startPalaceIndex = YMD_GATES_PALACE_ORDER.indexOf(taiYiPalaceBranch);
    
    if (startPalaceIndex === -1 || leadingGateIndex === -1) {
        console.error("八門計算錯誤：找不到太乙宮位或值使門");
        return finalGates; // 如果找不到起始點，也返回空物件
    }

    for (let i = 0; i < 8; i++) {
        const currentPalaceIndex = (startPalaceIndex + i) % 8;
        const currentGateIndex = (leadingGateIndex + i) % 8;

        const palaceBranch = YMD_GATES_PALACE_ORDER[currentPalaceIndex];
        const palaceId = BRANCH_TO_PALACE_ID[palaceBranch];
        const gateName = EIGHT_GATES_ORDER[currentGateIndex];
        
        if (palaceId) {
            finalGates[palaceId] = gateName;
        }
    }

    return finalGates;
    }
    // ▼▼▼ 【修正版V2】計算「貴人十二神」 (依據天干取月將，視月將落宮定順逆) ▼▼▼
    function calculateGuiRen(dayGan, hourBranch, yueJiangData) {
    const result = new Array(12).fill("");
    // 基礎檢查：確保有日干、時支，且月將資料已計算完成
    if (!dayGan || !hourBranch || !yueJiangData || yueJiangData.length === 0) {
        return result;
    }

    // --- 1. 定義天干對應的「貴人月將」 (晝夜不同) ---
    // 這裡的值代表月將的「地支後綴」，例如 '未' 代表 '小吉未'
    const GUI_REN_GENERAL_MAP = {
        '甲': { day: '未', night: '丑' }, // 晝:小吉未, 夜:大吉丑
        '乙': { day: '申', night: '子' }, // 晝:傳送申, 夜:神后子
        '丙': { day: '酉', night: '亥' }, // 晝:從魁酉, 夜:登明亥
        '丁': { day: '亥', night: '酉' }, // 晝:登明亥, 夜:從魁酉
        '戊': { day: '丑', night: '未' }, // 晝:大吉丑, 夜:小吉未
        '己': { day: '子', night: '申' }, // 晝:神后子, 夜:傳送申
        '庚': { day: '丑', night: '未' }, // 晝:大吉丑, 夜:小吉未 (依您設定)
        '辛': { day: '寅', night: '午' }, // 晝:功曹寅, 夜:勝光午
        '壬': { day: '卯', night: '巳' }, // 晝:太衝卯, 夜:太乙巳
        '癸': { day: '巳', night: '卯' }  // 晝:太乙巳, 夜:太衝卯
    };

    // --- 2. 定義晝夜時辰列表 ---
    const DAY_HOURS = ['卯', '辰', '巳', '午', '未', '申'];
    
    // --- 3. 判斷晝夜，取得目標月將的後綴 ---
    let targetGeneralSuffix;
    if (DAY_HOURS.includes(hourBranch)) {
        targetGeneralSuffix = GUI_REN_GENERAL_MAP[dayGan]?.day;
    } else {
        targetGeneralSuffix = GUI_REN_GENERAL_MAP[dayGan]?.night;
    }

    if (!targetGeneralSuffix) return result;

    // --- 4. 在目前的月將盤 (yueJiangData) 中，找到該月將的位置 ---
    // yueJiangData 裡的格式是 "神后子", "大吉丑" 等，所以我們檢查是否以目標後綴結尾
    let generalLocationIndex = -1;
    for (let i = 0; i < yueJiangData.length; i++) {
        if (yueJiangData[i] && yueJiangData[i].endsWith(targetGeneralSuffix)) {
            generalLocationIndex = i;
            break;
        }
    }

    // 如果找不到該月將 (代表資料可能有誤)，回傳空
    if (generalLocationIndex === -1) return result;

    // --- 5. 取得該月將「落入的宮位」 (Palace Branch) ---
    // 透過索引去查月將環的宮位定義
    const palaceId = RADIAL_LAYOUT.yueJiangRing.palaces[generalLocationIndex];
    const palaceBranch = PALACE_ID_TO_BRANCH[palaceId]; // 例如 '子', '丑'...

    // --- 6. 決定順逆 (根據月將落入的宮位) ---
    // 規則：亥子丑寅卯辰 -> 順時鐘，巳午未申酉戌 -> 逆時鐘
    const CLOCKWISE_BRANCHES = ['亥', '子', '丑', '寅', '卯', '辰'];
    const direction = CLOCKWISE_BRANCHES.includes(palaceBranch) ? 'clockwise' : 'counter-clockwise';

    // --- 7. 排列十二神 ---
    // 準備標準地支順序，方便計算
    const standardBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const startBranchIndex = standardBranches.indexOf(palaceBranch);
    
    const finalMapping = {}; // 暫存：地支 -> 神煞名稱

    for (let i = 0; i < 12; i++) {
        // 計算當前神煞 (GUI_REN_ORDER[i]) 應該在哪個地支
        let currentBranchIndex;
        if (direction === 'clockwise') {
            currentBranchIndex = (startBranchIndex + i) % 12;
        } else {
            currentBranchIndex = (startBranchIndex - i + 12) % 12;
        }
        
        const currentBranch = standardBranches[currentBranchIndex];
        finalMapping[currentBranch] = GUI_REN_ORDER[i];
    }

    // --- 8. 轉換為繪圖順序 ---
    // 根據貴人環的繪圖宮位順序，填入對應的神煞
    const drawingPalaceOrder = RADIAL_LAYOUT.guiRenRing.palaces.map(pId => PALACE_ID_TO_BRANCH[pId]);
    return drawingPalaceOrder.map(branch => finalMapping[branch] || "");
    }
    // ▼▼▼ 計算所有年日化曜結果的函式 ▼▼▼
    function calculateAllHuaYao(yearStem, dayStem, dayBranch) {
    const results = {};
    
    // 輔助函式：幫星星穿衣服
    const wrap = (stars, label, colorClass) => {
        if (!stars || stars.length === 0 || stars[0] === '無') return '無';
        return stars.map(s => `<span class="hy-badge ${colorClass}">${s}<small style="font-size:10px; opacity:0.8; margin-left:2px;">${label}</small></span>`).join(' ');
    };

    // 1. 年干化曜
    const nianGanRule = NIAN_GAN_HUA_YAO[yearStem];
    if (nianGanRule) {
        results.nianGan = {
            tianYuan: wrap(nianGanRule.tianYuan, '天元', 'hy-blue'),
            ganYuan: wrap(nianGanRule.ganYuan, '干元', 'hy-purple'),
            fuMu: wrap(nianGanRule.fuMu, '父母', 'hy-orange')
        };
    }

    // 2. 日干化曜
    const riGanRule = RI_GAN_HUA_YAO[dayStem];
    if (riGanRule) {
        results.riGan = {
            luZhu: wrap(riGanRule.luZhu, '祿主', 'hy-blue'),
            pianLu: wrap(riGanRule.pianLu, '偏祿', 'hy-green'),
            guanXing: wrap(riGanRule.guanXing, '官星', 'hy-blue'),
            qiCai: wrap(riGanRule.qiCai, '妻財', 'hy-green'),
            jiXing: wrap(riGanRule.jiXing, '忌星', 'hy-red'),
            guiXing: wrap(riGanRule.guiXing, '鬼星', 'hy-red')
        };
    }

    // 3. 日支化曜
    const riZhiRule = RI_ZHI_HUA_YAO[dayBranch];
    if (riZhiRule) {
        results.riZhi = {
            fuXing: wrap(riZhiRule.fuXing, '福星', 'hy-orange')
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
    // ▼▼▼ 計算太乙陰陽宮位預測下雨火災的函式 ▼▼▼
    function calculateTaiYiPalacePattern(lookupResult) {
    if (!lookupResult || !lookupResult.太乙) {
        return '';
    }

    const taiYiPalace = lookupResult.太乙;
    const palaceInfo = TAIYI_PALACE_PROPERTIES[taiYiPalace];

    if (!palaceInfo) {
        return '';
    }

    const zhuSuan = lookupResult.主算;
    const keSuan = lookupResult.客算;
    const dingSuan = lookupResult.定算;

    let output = `\n  太乙 : ${palaceInfo.type}`;

    // --- 【核心修正點】 ---
    // 輔助函式：檢查「單一」數字是否含有指定奇偶屬性的位數
    function numberContainsDigitOfParity(suan, parityCheck) {
        const s = String(suan);
        const isOdd = (d) => parseInt(d, 10) % 2 !== 0;

        for (const digit of s) {
            const digitIsOdd = isOdd(digit);
            if ((parityCheck === 'odd' && digitIsOdd) || (parityCheck === 'even' && !digitIsOdd)) {
                return true; // 只要找到一個符合的位數，就回傳 true
            }
        }
        return false; // 如果所有位數都不符合，回傳 false
    }

    // 判斷：主、客、定算是否「各自都」含有一個奇數
    const allContainOdd = 
        numberContainsDigitOfParity(zhuSuan, 'odd') &&
        numberContainsDigitOfParity(keSuan, 'odd') &&
        numberContainsDigitOfParity(dingSuan, 'odd');

    // 判斷：主、客、定算是否「各自都」含有一個偶數
    const allContainEven = 
        numberContainsDigitOfParity(zhuSuan, 'even') &&
        numberContainsDigitOfParity(keSuan, 'even') &&
        numberContainsDigitOfParity(dingSuan, 'even');

    // 根據新的判斷結果，決定是否要加上警語
    if (palaceInfo.type === '陽宮' && allContainOdd) {
        output += ` ${palaceInfo.text}`;
    } else if (palaceInfo.type === '陰宮' && allContainEven) {
        output += ` ${palaceInfo.text}`;
    }

    return output;
    }
    // ▼▼▼ 計算地震海嘯格局的函式 ▼▼▼
    function calculateEarthquakePattern(lookupResult) {
    // 缺少必要資料則返回空字串
    if (!lookupResult || !lookupResult.主算 || !lookupResult.客算 || !lookupResult.始擊) {
        return '';
    }

    const zhuSuan = lookupResult.主算;
    const keSuan = lookupResult.客算;
    const shiJiPalace = lookupResult.始擊;

    // 輔助函式：檢查單一算數的屬性是否符合條件
    function checkAttribute(suan) {
        const attributes = SUAN_ATTRIBUTE_DATA[suan];
        if (!attributes) return false;
        return attributes.includes('無地之數') || attributes.includes('杜塞無門') || attributes.includes('無天之數');
    }

    // 判斷：主算和客算是否「都」符合條件
    if (checkAttribute(zhuSuan) && checkAttribute(keSuan)) {
        // 如果符合，就找出始擊宮位對應的方位
        const direction = PALACE_TO_DIRECTION[shiJiPalace] || '未知方位';
        // 組合出最終要顯示的文字
        return `\n\n  ＊容易地震，海嘯。（地點：${direction}）`;
    }

    // 如果不符合條件，返回空字串
    return '';
    }
    // ▼▼▼ 【新增】計算建除十二神（時辰版）的函式 ▼▼▼
    function calculateJianChu(hourBranch) {
    if (!hourBranch) return [];
    
    // 1. 找出時支 (建神起點) 在十二地支中的索引 (子=0, 丑=1...)
    const startIndex = solarLunar.zhi.indexOf(hourBranch);
    if (startIndex === -1) return [];

    // 2. 準備結果陣列，對應 ['子', '丑', '寅'...] 的順序
    const result = [];

    // 3. 填入十二宮位
    for (let i = 0; i < 12; i++) {
        // 計算目前宮位(i)相對於起點(startIndex)的距離
        // 因為是順時鐘，直接減法處理 (加上12確保為正數)
        const godIndex = (i - startIndex + 12) % 12;
        
        // 填入對應的神煞
        result.push(JIAN_CHU_ORDER[godIndex]);
    }

    return result;
    }

    // ▼▼▼ 【新增】計算「建除十二神（日）」的函式 ▼▼▼
    function calculateDailyJianChu(monthBranch, dayBranch) {
        const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        const deities = ['建', '除', '滿', '平', '定', '執', '破', '危', '成', '收', '開', '閉'];
        
        const mIndex = branches.indexOf(monthBranch);
        const dIndex = branches.indexOf(dayBranch);
        
        if (mIndex === -1 || dIndex === -1) return { name: '', type: '' };
        
        // 計算差距：月建與日支的相對位置
        const offset = (dIndex - mIndex + 12) % 12;
        const deityName = deities[offset];
        
        // 判斷吉凶以決定顯示顏色
        let type = '';
        if (['除', '滿', '定', '危', '成', '收', '開'].includes(deityName)) {
            type = 'good'; // 吉日
        } else if (['建', '破', '閉'].includes(deityName)) {
            type = 'bad'; // 凶日
        } else {
            type = 'neutral'; // 平日
        }
        
        return { name: deityName, type: type };
    }

    // ▼▼▼ 【V2 - 結構化輸出版】計算所有格局的函式 ▼▼▼
    function calculatePatterns(lookupResult, suanStarsResult) {
    const patterns = [];
    if (!lookupResult) return patterns;

    const starLocations = {
        '太乙': lookupResult.太乙,
        '文昌': lookupResult.文昌,
        '始擊': lookupResult.始擊,
        ...suanStarsResult.chartStars
    };
    
    const palaceToStars = {};
    for (const star in starLocations) {
        const palace = starLocations[star];
        if (palace) {
            if (!palaceToStars[palace]) {
                palaceToStars[palace] = [];
            }
            palaceToStars[palace].push(star);
        }
    }

    const taiYiPalace = starLocations['太乙'];
    const wenChangPalace = starLocations['文昌'];
    const shiJiPalace = starLocations['始擊'];

    if (!taiYiPalace) return patterns;

    // 掩
    if (taiYiPalace === shiJiPalace) {
        patterns.push({ palace: `${taiYiPalace}宮`, text: `始擊 <span class="pattern-style">掩</span> 太乙` });
    }

    // 囚
    const qiuStars = ['文昌', '主大', '主參', '客大', '客參'];
    qiuStars.forEach(star => {
        if (starLocations[star] === taiYiPalace) {
            patterns.push({ palace: `${taiYiPalace}宮`, text: `${star} <span class="pattern-style">囚</span> 太乙` });
        }
    });
    
    // 迫
    const neighbors = PALACE_RELATIONSHIPS[taiYiPalace];
    if (neighbors && (wenChangPalace === neighbors.next || wenChangPalace === neighbors.prev)) {
        patterns.push({ palace: `${taiYiPalace}宮`, text: `文昌 <span class="pattern-style">迫</span> 太乙` });
    }

    // 擊
    if (neighbors && (shiJiPalace === neighbors.next || shiJiPalace === neighbors.prev)) {
        patterns.push({ palace: `${taiYiPalace}宮`, text: `始擊 <span class="pattern-style">擊</span> 太乙` });
    }
    
    // 格
    const oppositePalace = PALACE_OPPOSITES[taiYiPalace];
    if (oppositePalace && shiJiPalace === oppositePalace) {
        patterns.push({ palace: `${taiYiPalace}宮`, text: `始擊 <span class="pattern-style">格</span> 太乙` });
    }

    // 對
    if (oppositePalace && wenChangPalace === oppositePalace) {
        patterns.push({ palace: `${taiYiPalace}宮`, text: `文昌 <span class="pattern-style">對</span> 太乙` });
    }

    // 關
    for (const palace in palaceToStars) {
        const starsInPalace = palaceToStars[palace];
        if (starsInPalace.length < 2) continue;

        if (starsInPalace.includes('文昌') && (starsInPalace.includes('客大') || starsInPalace.includes('客參'))) {
            const otherStar = starsInPalace.includes('客大') ? '客大' : '客參';
            patterns.push({ palace: `${palace}宮`, text: `文昌 ${otherStar} <span class="pattern-style">關</span>` });
        }
        if (starsInPalace.includes('始擊') && (starsInPalace.includes('主大') || starsInPalace.includes('主參'))) {
            const otherStar = starsInPalace.includes('主大') ? '主大' : '主參';
            patterns.push({ palace: `${palace}宮`, text: `始擊 ${otherStar} <span class="pattern-style">關</span>` });
        }
        const suanGroup = ['主大', '主參', '客大', '客參'];
        const presentSuanStars = starsInPalace.filter(s => suanGroup.includes(s));
        if (presentSuanStars.length >= 2) {
            patterns.push({ palace: `${palace}宮`, text: `${presentSuanStars.join(' ')} <span class="pattern-style">關</span>` });
        }
    }

    return patterns;
    }

    // ▼▼▼ 【修正版】計算時辰吉格的函式 (加入 dayGan, dayBranch 參數與德入天門 日德/支德) ▼▼▼
    function calculateLuckyPatterns(yueJiangData, guiRenData, dayGan, dayBranch) {
        const patterns = [];
        if (!yueJiangData || !guiRenData) return patterns;

        // 內部小幫手：檢查某個宮位是否包含特定星曜
        const checkStarInBranch = (dataArray, ringConfig, branch, starKeyword) => {
            const palaceId = BRANCH_TO_PALACE_ID[branch];
            const index = ringConfig.palaces.indexOf(palaceId);
            if (index !== -1 && dataArray[index] && dataArray[index].includes(starKeyword)) {
                return true;
            }
            return false;
        };

        // 1. 天罡指巳
        if (checkStarInBranch(yueJiangData, RADIAL_LAYOUT.yueJiangRing, '巳', '天罡')) {
            patterns.push('天罡指巳');
        }
        
        // 2. 罡塞鬼戶
        if (checkStarInBranch(yueJiangData, RADIAL_LAYOUT.yueJiangRing, '寅', '天罡')) {
            patterns.push('罡塞鬼戶');
        }

        // 3. 貴塞鬼戶
        if (checkStarInBranch(guiRenData, RADIAL_LAYOUT.guiRenRing, '寅', '貴人')) {
            patterns.push('貴塞鬼戶');
        }

        // 4. 貴登天門
        if (checkStarInBranch(guiRenData, RADIAL_LAYOUT.guiRenRing, '亥', '貴人')) {
            patterns.push('貴登天門');
        }

        // 5. 德入天門 (日德)
        if (dayGan) {
            const dayGanDeityMap = {
                '甲': '功曹', '己': '功曹',
                '乙': '傳送', '庚': '傳送',
                '丙': '太乙', '辛': '太乙',
                '丁': '登明', '壬': '登明',
                '戊': '太乙', '癸': '太乙'
            };
            const targetDeityGan = dayGanDeityMap[dayGan];
            if (targetDeityGan && checkStarInBranch(yueJiangData, RADIAL_LAYOUT.yueJiangRing, '亥', targetDeityGan)) {
                // 區分名稱，左側資訊區顯示用
                patterns.push('德入天門(日德)'); 
            }
        }

        // 6. 德入天門 (支德)
        if (dayBranch) {
            const dayBranchDeityMap = {
                '子': '太乙', '丑': '勝光', '寅': '小吉', '卯': '傳送',
                '辰': '從魁', '巳': '河魁', '午': '登明', '未': '神后',
                '申': '大吉', '酉': '功曹', '戌': '太衝', '亥': '天罡'
            };
            const targetDeityBranch = dayBranchDeityMap[dayBranch];
            if (targetDeityBranch && checkStarInBranch(yueJiangData, RADIAL_LAYOUT.yueJiangRing, '亥', targetDeityBranch)) {
                // 區分名稱，左側資訊區顯示用
                patterns.push('德入天門(支德)'); 
            }
        }

        return patterns;
    }

    // ▼▼▼ 【新增】計算「天赦日」的函式 ▼▼▼
    function calculateTianSheRi(monthBranch, dayPillar) {
        // 春季（寅、卯、辰月）：戊寅日
        if (['寅', '卯', '辰'].includes(monthBranch) && dayPillar === '戊寅') return true;
        // 夏季（巳、午、未月）：甲午日
        if (['巳', '午', '未'].includes(monthBranch) && dayPillar === '甲午') return true;
        // 秋季（申、酉、戌月）：戊申日
        if (['申', '酉', '戌'].includes(monthBranch) && dayPillar === '戊申') return true;
        // 冬季（亥、子、丑月）：甲子日
        if (['亥', '子', '丑'].includes(monthBranch) && dayPillar === '甲子') return true;
        
        return false;
    }

    // ▼▼▼ 【新增】計算「六富日」的函式 ▼▼▼
    function calculateLiuFuRi(dayPillar) {
        const liuFuDays = ['丙子', '丁丑', '壬寅', '癸卯', '戊申', '戊午'];
        return liuFuDays.includes(dayPillar);
    }

    // ▼▼▼ 【修正版】整合判斷當日所有「特殊日」 (加入招財吉日判斷) ▼▼▼
    // monthBranchEnd：當日 23:59 的月支。平常日與 monthBranch 相同；
    // 交節日兩者不同，用來抓「半日天赦」（例：2025/8/7 立秋 14:53 後才入申月，戊申日自交節起為天赦）
    function getSpecialDaysPattern(monthBranch, dayPillar, jianChuName, monthBranchEnd) {
        const specials = [];
        
        if (typeof monthBranchEnd === 'undefined') monthBranchEnd = monthBranch;
        const tianSheAtStart = calculateTianSheRi(monthBranch, dayPillar);
        const tianSheAtEnd = calculateTianSheRi(monthBranchEnd, dayPillar);

        if (tianSheAtStart && tianSheAtEnd) {
            specials.push('天赦日');
        } else if (!tianSheAtStart && tianSheAtEnd) {
            // 節在當日：交節後才進入天赦所屬的季節月支
            specials.push('天赦日<br><span style="font-size: 12px; color: #8a6d3b; font-weight: bold; margin-left: 0;">(交節後起算)</span>');
        } else if (tianSheAtStart && !tianSheAtEnd) {
            // 節在當日：交節後離開天赦所屬的季節月支
            specials.push('天赦日<br><span style="font-size: 12px; color: #8a6d3b; font-weight: bold; margin-left: 0;">(交節前有效)</span>');
        }
        
        if (calculateLiuFuRi(dayPillar)) {
            // 判斷六富日是否剛好遇到「滿、成、收、開」
            if (['滿', '成', '收', '開'].includes(jianChuName)) {
                // 加入紅色粗體的招財吉日小字
                specials.push('六富日<br><span style="font-size: 12px; color: #db8000ff; font-weight: bold; margin-left: 0;">(招財吉日)</span>');
            } else {
                specials.push('六富日');
            }
        }
        
        // 用 <br> 換行取代頓號，這樣如果同一天有天赦日又有六富日，排版會比較漂亮
        return specials.join('<br>');
    }

    // ▼▼▼ 【新增】計算日柱空亡的函式 ▼▼▼
    function calculateDayKongWang(dayPillar) {
    if (!dayPillar) return "";
    
    // 1. 找出日柱在六十甲子中的索引 (0-59)
    const index = JIAZI_CYCLE_ORDER.indexOf(dayPillar);
    if (index === -1) return "";

    // 2. 計算屬於哪一旬 (每10個一組)
    // 索引 0-9 是第0組(甲子旬)，30-39 是第3組(甲午旬)，以此類推
    const xunIndex = Math.floor(index / 10);
    const data = KONG_WANG_DATA[xunIndex];

    if (data) {
        // 回傳格式化後的字串，並套用 CSS
        return `\n  ${data.name}：空亡在<span class="kong-wang-style">${data.void}</span>`;
    }
    return "";
    }

    // ▼▼▼ 【新增】計算「歲乙相格」的函式 ▼▼▼
    function calculateSuiYiXiangGe(lookupResult, deitiesResult) {
    // 安全檢查：確保有太乙和太歲的資料
    if (!lookupResult || !lookupResult.太乙 || !deitiesResult || !deitiesResult.太歲) {
        return '';
    }

    const taiYiPalace = lookupResult.太乙;
    const taiSuiPalace = deitiesResult.太歲;

    // 1. 定義寄宮規則 (乾寄亥, 艮寄寅, 巽寄巳, 坤寄申)
    const mapping = { 
        '乾': '亥', 
        '艮': '寅', 
        '巽': '巳', 
        '坤': '申' 
    };

    // 2. 取得太乙的實際地支位置 
    // (如果太乙在四維卦，則轉換為寄宮地支；如果是普通地支，則維持原樣)
    const taiYiBranch = mapping[taiYiPalace] || taiYiPalace;

    // 確保轉換後是有效的地支 (在 PALACE_OPPOSITES 資料庫中有定義)
    if (!PALACE_OPPOSITES[taiYiBranch]) return '';

    // 3. 找出對沖宮位 (例如 子->午, 亥->巳)
    const oppositeBranch = PALACE_OPPOSITES[taiYiBranch];

    // 4. 判斷太歲是否在對沖宮位
    if (taiSuiPalace === oppositeBranch) {
        // 格式化輸出文字
        return '\n  歲乙相格：有崩亡兵役之事';
    }

    return '';
    }
   
    // ▼▼▼ 每次增加星都要更新的函式 ▼▼▼
    function generateMainChartData(lookupResult, deitiesResult, suanStarsResult, shiWuFuResult, xiaoYouResult, junJiResult, chenJiResult, minJiResult, tianYiResult, diYiResult, siShenResult, feiFuResult, daYouResult, yueJiangData, guiRenData, starsToDisplay = []) {
        const chartData = {};
        const allPalaceKeys = Object.keys(RADIAL_LAYOUT.angles);
    allPalaceKeys.forEach(key => {
        chartData[key] = {
            lineLeft: { fieldA: "", fieldB: "", fieldG: "" },
            lineCenter: { fieldC: "", fieldD: "", fieldC2: "", fieldD2: "" },
            lineRight:  { fieldE: "", fieldF: "", fieldE2: "", fieldF2: "" }
        };
    });

    // 輔助函式：將星曜放入第一個可用的空位 (具備自動換行到 lineRight 的功能)
    function placeInFirstAvailable(palaceId, starName) {
        const lineLeft = chartData[palaceId].lineLeft;
        const lineRight = chartData[palaceId].lineRight;

        if (!lineLeft.fieldA) lineLeft.fieldA = starName;
        else if (!lineLeft.fieldB) lineLeft.fieldB = starName;
        else if (!lineLeft.fieldG) lineLeft.fieldG = starName;
        // 【核心修正點】如果 lineLeft 已滿，則溢出到 lineRight
        else if (!lineRight.fieldE) lineRight.fieldE = starName;
        else if (!lineRight.fieldF) lineRight.fieldF = starName;
        else if (!lineRight.fieldE2) lineRight.fieldE2 = starName;
        else if (!lineRight.fieldF2) lineRight.fieldF2 = starName;
    }

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

    // ▼▼▼ 處理「定目」 ▼▼▼
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

    // ▼▼▼ 處理所有需要顯示的五福星 ▼▼▼
    starsToDisplay.forEach(star => {
    if (star.palace === '中') {
        // 中宮的星曜在這裡先不處理，交給 runCalculation
    } else {
        const palaceId = BRANCH_TO_PALACE_ID[star.palace];
        if (palaceId && chartData[palaceId]) {
            const lineLeft = chartData[palaceId].lineLeft;
            // 尋找 lineLeft 中第一個空的欄位來放入
            if (!lineLeft.fieldA) lineLeft.fieldA = star.text;
            else if (!lineLeft.fieldB) lineLeft.fieldB = star.text;
            else if (!lineLeft.fieldG) lineLeft.fieldG = star.text;
        }
    }
    });
    
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

    const wuFuCenterStars = starsToDisplay.filter(s => s.palace === '中').map(s => s.text);
    return { chartData, centerStars: wuFuCenterStars };
    }
    
    // =================================================================
    //  SECTION 4: UI 互動與主流程 (國運版最終修正版)
    // =================================================================

    function populateDateSelectors() {
        const yearSelect = document.getElementById('birth-year');
        const monthSelect = document.getElementById('birth-month');
        const daySelect = document.getElementById('birth-day');
        const hourSelect = document.getElementById('birth-hour');
        for (let i = 2100; i >= 1930; i--) { const option = document.createElement('option'); option.value = i; option.textContent = i; yearSelect.appendChild(option); }
        for (let i = 1; i <= 12; i++) { const option = document.createElement('option'); option.value = i; option.textContent = i; monthSelect.appendChild(option); }
        for (let i = 1; i <= 31; i++) { const option = document.createElement('option'); option.value = i; option.textContent = i; daySelect.appendChild(option); }
        for (let i = 0; i <= 23; i++) { const option = document.createElement('option'); option.value = i; option.textContent = i; hourSelect.appendChild(option); }
    }

    function populateTimezoneSelector() {
        const timezoneSelect = document.getElementById('timezone-select');
        TIMEZONES.forEach(tz => {
            const option = document.createElement('option');
            option.value = tz.value;
            option.textContent = tz.text;
            if (tz.value === 8) {
                option.selected = true;
            }
            timezoneSelect.appendChild(option);
        });
    }

    const dayJishuDisplay = document.getElementById('day-jishu-display');
    const hourJishuDisplay = document.getElementById('hour-jishu-display');
    const calculateBtn = document.getElementById('calculate-btn');
    const savePdfBtn = document.getElementById('save-pdf-btn'); 
    const switchToPersonalBtn = document.getElementById('switch-to-personal-btn');

    function prefillTestData() {
        const now = new Date();
        document.getElementById('birth-year').value = now.getFullYear();
        document.getElementById('birth-month').value = now.getMonth() + 1;
        document.getElementById('birth-day').value = now.getDate();
        document.getElementById('birth-hour').value = now.getHours();
    }

    function runCalculation(dataForCalculation, hour, chartType) {
    const { bureauResult, lookupResult, hourJishu, wuFuResults, yearPillar, monthPillar, dayPillar, hourPillar } = dataForCalculation;

    // --- 1. 決定要顯示哪些五福星 ---
    const starsToDisplay = [];
    if (wuFuResults.year) starsToDisplay.push(wuFuResults.year);
    if (['month', 'day', 'hour'].includes(chartType) && wuFuResults.month) starsToDisplay.push(wuFuResults.month);
    if (['day', 'hour'].includes(chartType) && wuFuResults.day) starsToDisplay.push(wuFuResults.day);
    if (chartType === 'hour' && wuFuResults.hour) starsToDisplay.push(wuFuResults.hour);

    // --- 2. 決定核心計算地支與干支 ---
    let targetDeityBranch;
    switch (chartType) {
        case 'year':  targetDeityBranch = yearPillar.charAt(1); break;
        case 'month': targetDeityBranch = monthPillar.charAt(1); break;
        case 'day':   targetDeityBranch = dayPillar.charAt(1); break;
        default:      targetDeityBranch = hourPillar.charAt(1); // 'hour'
    }

    const yStem = yearPillar.charAt(0);
    const dStem = dayPillar.charAt(0);
    const dBranch = dayPillar.charAt(1);

    // --- 3. 核心星曜與曆法計算 ---
    const deitiesResult = calculateDeities(bureauResult, targetDeityBranch);
    const suanStarsResult = calculateSuanStars(lookupResult);
    const xiaoYouResult = calculateXiaoYou(hourJishu);
    const junJiResult = calculateJunJi(hourJishu);
    const chenJiResult = calculateChenJi(hourJishu);
    const minJiResult = calculateMinJi(hourJishu);
    const tianYiResult = calculateTianYi(hourJishu);
    const diYiResult = calculateDiYi(hourJishu);
    const siShenResult = calculateSiShen(hourJishu);
    const feiFuResult = calculateFeiFu(hourJishu);
    const daYouResult = calculateDaYou(hourJishu);

    // 月將與貴人
    const yueJiangResult = calculateYueJiang(solarLunar.solar2lunar(
        parseInt(dataForCalculation.birthDate.split('/')[0]), 
        parseInt(dataForCalculation.birthDate.split('/')[1]), 
        parseInt(dataForCalculation.birthDate.split('/')[2]), hour), hourPillar.charAt(1));
    const yueJiangData = yueJiangResult.ringData;
    const currentYueJiangName = yueJiangResult.name;
    const guiRenData = calculateGuiRen(dStem, hourPillar.charAt(1), yueJiangData);
    
    // 吉格與建除
    const luckyPatterns = calculateLuckyPatterns(yueJiangData, guiRenData, dStem, dBranch);
    const jianChuData = calculateJianChu(hourPillar.charAt(1));

    // --- 4. 準備繪圖資料 ---
    let outerRingData;
    if (chartType === 'hour') {
        outerRingData = calculateOuterRingData(bureauResult, hourJishu, lookupResult);
    } else {
        const taiYiPalace = lookupResult ? lookupResult.太乙 : null;
        outerRingData = calculateYmdOuterRingData(hourJishu, taiYiPalace);
    }

    // 計算明五福並生成主盤資料 (合併為一次呼叫)
    const mingWuFuResult = (typeof calculateMingWuFu === 'function') ? calculateMingWuFu(hourJishu) : null; 
    const mainChartDataResult = generateMainChartData(
        lookupResult, deitiesResult, suanStarsResult,
        dataForCalculation.shiWuFuResult, xiaoYouResult,
        junJiResult, chenJiResult, minJiResult,
        tianYiResult, diYiResult, siShenResult, feiFuResult,
        daYouResult, yueJiangData, guiRenData, starsToDisplay, mingWuFuResult
    );
    const newMainChartData = mainChartDataResult.chartData;
    const wuFuCenterStars = mainChartDataResult.centerStars;

    // 中心四個欄位
    const centerData = { field1: '', field2: '', field3: '', field4: '' };
    const baseCenterStars = suanStarsResult.centerStars || [];
    baseCenterStars.forEach((s, i) => { if(i < 4) centerData[`field${i+1}`] = s; });
    wuFuCenterStars.forEach(starText => {
        for(let i=1; i<=4; i++) { if(!centerData[`field${i}`]) { centerData[`field${i}`] = starText; break; } }
    });

    // 🌟 核心修正：呼叫 renderChart 時不再傳入 huaYaoMap，回歸純文字圓盤
    renderChart(newMainChartData, dataForCalculation.arrangedLifePalaces, [], calculateSdrPalaces(dataForCalculation, dataForCalculation.direction), centerData, outerRingData, jianChuData); 

    // --- 5. 更新左側摘要文字 ---
    let outputText = `\n  月將 : <span class="yue-jiang-style">${currentYueJiangName}</span>`;

    if (luckyPatterns.length > 0) {
        luckyPatterns.forEach(pattern => {
            outputText += `\n  時辰吉格 : <span class="lucky-pattern-style">${pattern}</span>`;
        });
    }

    // 空亡計算
    const dayPillarIndex = JIAZI_CYCLE_ORDER.indexOf(dayPillar);
    if (dayPillarIndex !== -1) {
        const xunIndex = Math.floor(dayPillarIndex / 10);
        const kongWangData = KONG_WANG_DATA[xunIndex];
        if (kongWangData) {
            outputText += `\n  ${kongWangData.name}：空亡在<span class="kong-wang-style">${kongWangData.void}</span>`;
            drawKongWangSector(kongWangData.void.charAt(0));
            drawKongWangSector(kongWangData.void.charAt(1));
        }
    }

    outputText += `\n  局數 : ${bureauResult}`;
    
    if (lookupResult) {
        const zhuSuanAttr = SUAN_ATTRIBUTE_DATA[lookupResult.主算] || '';
        const keSuanAttr = SUAN_ATTRIBUTE_DATA[lookupResult.客算] || '';
        const dingSuanAttr = SUAN_ATTRIBUTE_DATA[lookupResult.定算] || '';
        outputText += `\n  主算 : ${lookupResult.主算} <span class="suan-attribute-style">(${zhuSuanAttr})</span>`;
        outputText += `\n  客算 : ${lookupResult.客算} <span class="suan-attribute-style">(${keSuanAttr})</span>`;
        outputText += `\n  定算 : ${lookupResult.定算} <span class="suan-attribute-style">(${dingSuanAttr})</span>`;

        // 🌟 保留左側資訊欄的化曜資訊
        const hy = calculateAllHuaYao(yStem, dStem, dBranch);
        if (hy) {
            outputText += `\n\n  --- 化曜資訊 ---`;
            outputText += `\n  年化：${hy.nianGan.tianYuan} ${hy.nianGan.ganYuan} ${hy.nianGan.fuMu}`;
            let riHua = [
                hy.riGan.luZhu, hy.riGan.pianLu, hy.riGan.guanXing, 
                hy.riGan.qiCai, hy.riGan.jiXing, hy.riGan.guiXing, hy.riZhi.fuXing
            ].filter(s => s !== '無').join(' ');
            outputText += `\n  日化：${riHua || '無'}`;
        }

        outputText += calculateEarthquakePattern(lookupResult);

        const patterns = calculatePatterns(lookupResult, suanStarsResult);
        if (patterns.length > 0) {
            let patternStrings = [];
            let lastPalace = '';
            patterns.forEach(p => {
                if (p.palace === lastPalace) { patternStrings.push(`（${p.text}）`); } 
                else { patternStrings.push(`${p.palace}（${p.text}）`); lastPalace = p.palace; }
            });
            outputText += `\n\n  格局 : ${patternStrings.join('、 ')}`;
        } else {
            outputText += `\n\n  格局 : 無`;
        }

        outputText += calculateTaiYiPalacePattern(lookupResult);
        outputText += calculateSuiYiXiangGe(lookupResult, deitiesResult);
    }

    document.getElementById('calculation-summary').innerHTML = outputText;
    }

    calculateBtn.addEventListener('click', () => {
        const year = parseInt(document.getElementById('birth-year').value, 10);
        const month = parseInt(document.getElementById('birth-month').value, 10);
        const day = parseInt(document.getElementById('birth-day').value, 10);
        const hour = parseInt(document.getElementById('birth-hour').value, 10);
        const chartType = document.querySelector('input[name="chart-type"]:checked')?.value || 'hour';
        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
        console.error("錯誤：日期或時間輸入無效。");
        return;
        }

        // 【修正點】移除所有時區相關計算，直接用輸入的數字建立日期物件
        const birthDateObject = new Date(year, month - 1, day, hour);
        const lunarDate = solarLunar.solar2lunar(year, month, day, hour);
        const precisionResult = calculateJishuAndBureau(birthDateObject);

        // ▼▼▼ 在此處插入你提供的驗證程式碼 ▼▼▼
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


        if (!precisionResult) {
        alert("無法計算日/時積數，請檢查 SOLSTICE_DATA。");
        return;
        }
        const nationalJishu = calculateNationalJishu(year, month, day, hour);

        // ▼▼▼ 【新增】準備月五福所需的精準參數 ▼▼▼
        // 1. 反推太乙年 (因為 calculateNationalJishu 內部已經處理過冬至換年了)
        const taiYiYear = nationalJishu.annualJishu - TAI_YI_BASE_JISHU;
        
        // 2. 取得月支
        const monthBranch = lunarDate.getMonthInGanZhi().charAt(1);
        
        // 3. 判斷是否為「年底但未過冬至」的特殊狀況 (同 calculateNationalJishu 邏輯)
        const isYearEnd = (taiYiYear === year && (monthBranch === '子' || monthBranch === '丑') && month >= 11);
        // ▲▲▲ 新增結束 ▲▲▲


        // --- ▼▼▼ 核心修改點：根據盤面類型，決定使用哪個「積數」和「局數」▼▼▼ ---
        let bureauResult;
        let finalJishuForStars; // 修正變數名稱宣告

        switch (chartType) {
        case 'year':
            bureauResult = nationalJishu.annualBureau;
            finalJishuForStars = nationalJishu.annualJishu;
            break;
        case 'month':
            bureauResult = nationalJishu.monthlyBureau;
            finalJishuForStars = nationalJishu.monthlyJishu;
            break;
        case 'day':
            bureauResult = `陽${((precisionResult.dayJishu % 72 === 0) ? 72 : precisionResult.dayJishu % 72)}局`;
            finalJishuForStars = precisionResult.dayJishu;
            break;
        default: // 'hour'
            bureauResult = precisionResult.calculatedBureau;
            finalJishuForStars = precisionResult.hourJishu;
            break;
        }

        if (!bureauResult) {
        alert("無法計算局數，請確認日期。");
        return;
        }
    
        dayJishuDisplay.textContent = precisionResult.dayJishu;
        hourJishuDisplay.textContent = precisionResult.hourJishu;
        
        const gender = '男'; 
        const direction = determineDirection(lunarDate.getYearInGanZhi().charAt(0), gender);
        const lifePalaceId = findPalaceByCounting(lunarDate.getYearInGanZhi().charAt(1), lunarDate.getMonthInGanZhi().charAt(1), lunarDate.getTimeInGanZhi().charAt(1), direction);
        const arrangedLifePalaces = lifePalaceId ? arrangeLifePalaces(lifePalaceId, direction) : [];
        
        const astrologicalMonthNumber = ASTROLOGICAL_MONTH_MAP[monthBranch];

        const dataForCalculation = {
        birthDate: `${year}/${month}/${day}`,
        yearPillar: lunarDate.getYearInGanZhi(),
        monthPillar: lunarDate.getMonthInGanZhi(),
        dayPillar: lunarDate.getDayInGanZhi(),
        hourPillar: lunarDate.getTimeInGanZhi(),
        hourJishu: finalJishuForStars,
        bureauResult: bureauResult,
        lookupResult: lookupBureauData(bureauResult),
        wuFuResults: {
                // 【核心修正】傳入 taiYiYear 給年五福
                year: calculateWuFu(taiYiYear, '年五福'),
                // 【核心修正】傳入完整物件給月五福 (支援亥月倒推)
                month: calculateWuFu({ taiYiYear, monthBranch, isYearEnd }, '月五福'),
                day: calculateWuFu(precisionResult.dayJishu, '日五福'),
                hour: calculateWuFu(precisionResult.hourJishu, '時五福')
        }
    };
        document.getElementById('annual-jishu-display').textContent = nationalJishu.annualJishu;
        document.getElementById('monthly-jishu-display').textContent = nationalJishu.monthlyJishu;
        document.getElementById('day-jishu-display').textContent = precisionResult.dayJishu;
        document.getElementById('hour-jishu-display').textContent = precisionResult.hourJishu;
        document.getElementById('year-pillar-stem').textContent = dataForCalculation.yearPillar.charAt(0);
        document.getElementById('year-pillar-branch').textContent = dataForCalculation.yearPillar.charAt(1);
        document.getElementById('month-pillar-stem').textContent = dataForCalculation.monthPillar.charAt(0);
        document.getElementById('month-pillar-branch').textContent = dataForCalculation.monthPillar.charAt(1);
        document.getElementById('day-pillar-stem').textContent = dataForCalculation.dayPillar.charAt(0);
        document.getElementById('day-pillar-branch').textContent = dataForCalculation.dayPillar.charAt(1);
        document.getElementById('hour-pillar-stem').textContent = dataForCalculation.hourPillar.charAt(0);
        document.getElementById('hour-pillar-branch').textContent = dataForCalculation.hourPillar.charAt(1);
        
        const lookupResult = lookupBureauData(dataForCalculation.bureauResult);
        dataForCalculation.lookupResult = lookupResult;
        dataForCalculation.deitiesResult = calculateDeities(dataForCalculation.bureauResult, dataForCalculation.hourPillar.charAt(1));
        dataForCalculation.suanStarsResult = calculateSuanStars(lookupResult);
        dataForCalculation.xiaoYouResult = calculateXiaoYou(dataForCalculation.hourJishu);
        dataForCalculation.junJiResult = calculateJunJi(dataForCalculation.hourJishu);
        dataForCalculation.chenJiResult = calculateChenJi(dataForCalculation.hourJishu);
        dataForCalculation.minJiResult = calculateMinJi(dataForCalculation.hourJishu);
        dataForCalculation.tianYiResult = calculateTianYi(dataForCalculation.hourJishu);
        dataForCalculation.diYiResult = calculateDiYi(dataForCalculation.hourJishu);
        dataForCalculation.siShenResult = calculateSiShen(dataForCalculation.hourJishu);
        dataForCalculation.feiFuResult = calculateFeiFu(dataForCalculation.hourJishu);
        dataForCalculation.daYouResult = calculateDaYou(dataForCalculation.hourJishu)
        
        runCalculation(dataForCalculation, hour, chartType);
        setTimeout(() => { applyPlateFontForPdfExport(); }, 60); 
    });

    // --- 按鈕與頁面初始化 ---
    if (switchToPersonalBtn) {
        switchToPersonalBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }
    
    
    function applyPlateFontForPdfExport() {
        const plate = document.getElementById('taiyi-plate');
        if (!plate) return;

        // V8：PDF 匯出時優先使用楷體，避免 SVG 文字被替換成儷宋體。
        const fontStack = "'BiauKaiWeb', 'KaiTi', 'PMingLiU', 'MingLiU', serif";
        plate.style.fontFamily = fontStack;
        plate.setAttribute('font-family', fontStack);

        if (document.fonts && document.fonts.load) {
            try {
                document.fonts.load('16px BiauKaiWeb');
                document.fonts.load('16px KaiTi');
                document.fonts.load('16px BiauKaiWeb');
            } catch (e) {}
        }

        plate.querySelectorAll('text, tspan, .dynamic-text, [class*="-style"]').forEach(el => {
            el.style.fontFamily = fontStack;
            el.setAttribute('font-family', fontStack);

            const existingStyle = el.getAttribute('style') || '';
            const cleanedStyle = existingStyle
                .replace(/font-family\s*:[^;]+;?/gi, '')
                .trim();

            el.setAttribute('style', `${cleanedStyle}; font-family:${fontStack} !important;`);
        });
    }

async function exportNationalPlatePdf() {
        const exportElement = document.querySelector('.main-container.tool-workspace') || document.querySelector('.main-container');
        if (!exportElement) {
            alert('找不到要輸出的國運盤內容。');
            return;
        }

        const originalText = savePdfBtn ? savePdfBtn.textContent : '';

        try {
            if (savePdfBtn) {
                savePdfBtn.disabled = true;
                savePdfBtn.textContent = 'PDF產生中...';
            }

            const JsPDFConstructor = window.jspdf && window.jspdf.jsPDF;
            if (!JsPDFConstructor) {
                throw new Error('jsPDF 尚未載入，請確認 tn_index.html 已載入 jspdf.umd.min.js。');
            }
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas 尚未載入，請確認 tn_index.html 已載入 html2canvas.min.js。');
            }

            exportElement.classList.add('pdf-exporting');

            applyPlateFontForPdfExport();

            if (document.fonts && document.fonts.ready) {
                try { await document.fonts.load('16px DFKai-SB'); await document.fonts.load('16px KaiTi'); await document.fonts.load('16px BiauKaiWeb'); await document.fonts.ready; } catch (e) {}
            }

            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(exportElement, {
                scale: 2,
                useCORS: false,
                allowTaint: true,
                backgroundColor: '#f7f1e8',
                logging: false,
                windowWidth: Math.max(exportElement.scrollWidth, 1000)
            });

            const pdf = new JsPDFConstructor('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 8;
            const usableWidth = pageWidth - margin * 2;
            const usableHeight = pageHeight - margin * 2;

            const imgWidth = usableWidth;
            const pxPerMm = canvas.width / imgWidth;
            const safeBottomMm = 10;
            const pageSliceHeightPx = Math.floor((usableHeight - safeBottomMm) * pxPerMm);

            const pageCanvas = document.createElement('canvas');
            const pageCtx = pageCanvas.getContext('2d');
            pageCanvas.width = canvas.width;

            let renderedHeight = 0;
            let pageIndex = 0;

            while (renderedHeight < canvas.height) {
                const sliceHeight = Math.min(pageSliceHeightPx, canvas.height - renderedHeight);
                pageCanvas.height = sliceHeight;

                pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
                pageCtx.drawImage(
                    canvas,
                    0,
                    renderedHeight,
                    canvas.width,
                    sliceHeight,
                    0,
                    0,
                    canvas.width,
                    sliceHeight
                );

                const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.96);
                const pageImgHeightMm = sliceHeight / pxPerMm;

                if (pageIndex > 0) pdf.addPage();
                pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeightMm);

                renderedHeight += sliceHeight;
                pageIndex++;
            }

            const year = (document.getElementById('birth-year') && document.getElementById('birth-year').value) || new Date().getFullYear();
            const month = (document.getElementById('birth-month') && document.getElementById('birth-month').value) || '';
            const day = (document.getElementById('birth-day') && document.getElementById('birth-day').value) || '';
            const chartTypeInput = document.querySelector('input[name="chart-type"]:checked');
            const chartTypeMap = { year: '年盤', month: '月盤', day: '日盤', hour: '時盤' };
            const chartLabel = chartTypeInput ? (chartTypeMap[chartTypeInput.value] || '國運盤') : '國運盤';

            const fileName = `小六太乙-太乙國運-${year}年${month ? month + '月' : ''}${day ? day + '日' : ''}-${chartLabel}`
                .replace(/[\\/:*?"<>|]/g, '')
                .replace(/\s+/g, '');

            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('產生國運盤PDF時發生錯誤:', error);
            alert(`產生 PDF 時發生錯誤：${error.message || error}\n\n請確認頁面已完成排盤後再試一次。`);
        } finally {
            exportElement.classList.remove('pdf-exporting');
            if (savePdfBtn) {
                savePdfBtn.disabled = false;
                savePdfBtn.textContent = originalText || '輸出盤面PDF';
            }
        }
    }

if (savePdfBtn) {
        savePdfBtn.addEventListener('click', exportNationalPlatePdf);
    }

    // ▼▼▼ 【新增】每月吉時表導出功能 ▼▼▼
    const luckyTableBtn = document.getElementById('lucky-table-btn');
    if (luckyTableBtn) {
        luckyTableBtn.addEventListener('click', () => {
            const year = parseInt(document.getElementById('birth-year').value, 10);
            const month = parseInt(document.getElementById('birth-month').value, 10);
            
            if (isNaN(year) || isNaN(month)) {
                alert("請先選擇年份與月份！");
                return;
            }
            
            generateAndPrintLuckyTable(year, month);
        });
    }

    // ▼▼▼ 【新增】您的精準 1930-2050 節氣資料庫 ▼▼▼
    const PRECISE_TERM_DATA = {
        1930: ["1-6 9:02", "1-21 2:32", "2-4 20:51", "2-19 16:59", "3-6 15:16", "3-21 16:29", "4-5 20:37", "4-21 4:05", "5-6 14:26", "5-22 3:41", "6-6 18:58", "6-22 11:52", "7-8 5:19", "7-23 22:41", "8-8 14:56", "8-24 5:26", "9-8 17:28", "9-24 2:35", "10-9 8:37", "10-24 11:25", "11-8 11:20", "11-23 8:34", "12-8 3:50", "12-22 21:39"],
        1931: ["1-6 14:55", "1-21 8:17", "2-5 2:40", "2-19 22:40", "3-6 21:02", "3-21 22:06", "4-6 2:20", "4-21 9:39", "5-6 20:09", "5-22 9:15", "6-7 0:41", "6-22 17:28", "7-8 11:05", "7-24 4:21", "8-8 20:44", "8-24 11:10", "9-8 23:17", "9-24 8:23", "10-9 14:26", "10-24 17:15", "11-8 17:09", "11-23 14:24", "12-8 9:40", "12-23 3:29"],
        1932: ["1-6 20:45", "1-21 14:06", "2-5 8:29", "2-20 4:28", "3-6 2:49", "3-21 3:53", "4-5 8:06", "4-20 15:28", "5-6 1:55", "5-21 15:06", "6-6 6:27", "6-21 23:22", "7-7 16:52", "7-23 10:18", "8-8 2:31", "8-23 17:06", "9-8 5:02", "9-23 14:15", "10-8 20:09", "10-23 23:03", "11-7 22:49", "11-22 20:10", "12-7 15:18", "12-22 9:14"],
        1933: ["1-6 2:23", "1-20 19:52", "2-4 14:09", "2-19 10:16", "3-6 8:31", "3-21 9:43", "4-5 13:50", "4-20 21:18", "5-6 7:41", "5-21 20:56", "6-6 12:17", "6-22 5:11", "7-7 22:44", "7-23 16:05", "8-8 8:25", "8-23 22:52", "9-8 10:57", "9-23 20:01", "10-9 2:03", "10-24 4:48", "11-8 4:42", "11-23 1:53", "12-7 21:11", "12-22 14:57"],
        1934: ["1-6 8:16", "1-21 1:36", "2-4 20:03", "2-19 16:01", "3-6 14:26", "3-21 15:27", "4-5 19:43", "4-21 3:00", "5-6 13:30", "5-22 2:34", "6-6 18:01", "6-22 10:47", "7-8 4:24", "7-23 21:42", "8-8 14:03", "8-24 4:31", "9-8 16:36", "9-24 1:45", "10-9 7:44", "10-24 10:36", "11-8 10:26", "11-23 7:44", "12-8 2:56", "12-22 20:49"],
        1935: ["1-6 14:02", "1-21 7:28", "2-5 1:48", "2-19 21:51", "3-6 20:10", "3-21 21:17", "4-6 1:26", "4-21 8:50", "5-6 19:12", "5-22 8:24", "6-6 23:41", "6-22 16:37", "7-8 10:05", "7-24 3:32", "8-8 19:47", "8-24 10:23", "9-8 22:24", "9-24 7:38", "10-9 13:35", "10-24 16:29", "11-8 16:17", "11-23 13:35", "12-8 8:44", "12-23 2:37"],
        1936: ["1-6 19:46", "1-21 13:12", "2-5 7:29", "2-20 3:33", "3-6 1:49", "3-21 2:57", "4-5 7:06", "4-20 14:31", "5-6 0:56", "5-21 14:07", "6-6 5:30", "6-21 22:21", "7-7 15:58", "7-23 9:17", "8-8 1:43", "8-23 16:10", "9-8 4:20", "9-23 13:25", "10-8 19:32", "10-23 22:18", "11-7 22:14", "11-22 19:24", "12-7 14:42", "12-22 8:26"],
        1937: ["1-6 1:43", "1-20 19:00", "2-4 13:25", "2-19 9:20", "3-6 7:44", "3-21 8:45", "4-5 13:01", "4-20 20:19", "5-6 6:50", "5-21 19:57", "6-6 11:22", "6-22 4:11", "7-7 21:45", "7-23 15:06", "8-8 7:25", "8-23 21:57", "9-8 9:59", "9-23 19:12", "10-9 2:10", "10-24 5:06", "11-8 4:55", "11-23 2:16", "12-7 21:26", "12-22 15:21"],
        1938: ["1-6 8:31", "1-21 1:58", "2-4 20:14", "2-19 16:19", "3-6 14:33", "3-21 15:43", "4-5 19:48", "4-21 3:14", "5-6 13:35", "5-22 2:50", "6-6 18:06", "6-22 11:03", "7-8 4:31", "7-23 21:57", "8-8 14:12", "8-24 4:45", "9-8 16:48", "9-24 1:59", "10-9 8:01", "10-24 10:53", "11-8 10:48", "11-23 8:06", "12-8 3:21", "12-22 21:13"],
        1939: ["1-6 14:27", "1-21 7:50", "2-5 2:10", "2-19 22:09", "3-6 20:26", "3-21 21:28", "4-6 1:37", "4-21 8:55", "5-6 19:21", "5-22 8:26", "6-6 23:51", "6-22 16:39", "7-8 10:18", "7-24 3:36", "8-8 20:03", "8-24 10:31", "9-8 22:42", "9-24 7:49", "10-9 13:56", "10-24 16:45", "11-8 16:43", "11-23 13:58", "12-8 9:17", "12-23 3:05"],
        1940: ["1-6 20:23", "1-21 13:44", "2-5 8:07", "2-20 4:03", "3-6 2:23", "3-21 3:23", "4-5 7:34", "4-20 14:50", "5-6 1:16", "5-21 14:22", "6-6 5:44", "6-21 22:36", "7-7 16:08", "7-23 9:34", "8-8 1:51", "8-23 16:28", "9-8 4:29", "9-23 13:45", "10-8 19:42", "10-23 22:39", "11-7 11:26", "11-22 19:48", "12-7 14:57", "12-22 8:54"],
        1941: ["1-6 2:03", "1-20 19:33", "2-4 13:49", "2-19 9:56", "3-6 8:10", "3-21 9:20", "4-5 13:24", "4-20 20:50", "5-6 7:09", "5-21 20:22", "6-6 11:39", "6-22 4:33", "7-7 22:03", "7-23 15:26", "8-8 7:45", "8-23 22:16", "9-8 10:23", "9-23 19:32", "10-9 1:38", "10-24 4:27", "11-8 4:24", "11-23 1:37", "12-7 20:55", "12-22 14:44"],
        1942: ["1-6 8:02", "1-21 1:23", "2-4 19:48", "2-19 15:46", "3-6 14:09", "3-21 15:10", "4-5 19:23", "4-21 2:39", "5-6 13:06", "5-22 2:08", "6-6 17:32", "6-22 10:16", "7-8 3:51", "7-23 21:07", "8-8 13:30", "8-24 3:58", "9-8 16:06", "9-24 1:16", "10-9 7:21", "10-24 10:15", "11-8 10:11", "11-23 7:30", "12-8 2:46", "12-22 20:39"],
        1943: ["1-6 13:00", "1-21 7:00", "2-5 1:00", "2-19 21:00", "3-6 19:00", "3-21 21:00", "4-6 1:00", "4-21 8:00", "5-6 18:00", "5-22 8:00", "6-6 23:00", "6-22 16:00", "7-8 9:00", "7-24 3:00", "8-8 19:00", "8-24 9:00", "9-8 21:00", "9-24 7:00", "10-9 13:00", "10-24 16:00", "11-8 15:00", "11-23 13:00", "12-8 8:00", "12-23 2:00"],
        1944: ["1-6 19:39", "1-21 13:07", "2-5 7:22", "2-20 3:27", "3-6 1:40", "3-21 2:48", "4-5 6:53", "4-20 14:17", "5-6 0:39", "5-21 13:50", "6-6 5:10", "6-21 22:02", "7-7 15:36", "7-23 8:55", "8-8 1:18", "8-23 15:46", "9-8 3:55", "9-23 13:01", "10-8 19:08", "10-23 21:55", "11-7 21:54", "11-22 19:07", "12-7 14:27", "12-22 8:14"],
        1945: ["1-6 1:34", "1-20 18:53", "2-4 13:19", "2-19 9:14", "3-6 7:38", "3-21 8:37", "4-5 12:51", "4-20 20:06", "5-6 6:36", "5-21 19:40", "6-6 11:05", "6-22 3:51", "7-7 21:26", "7-23 14:45", "8-8 7:05", "8-23 21:35", "9-8 9:38", "9-23 17:49", "10-8 23:49", "10-24 2:43", "11-8 2:34", "11-22 23:55", "12-7 19:07", "12-22 13:03"],
        1946: ["1-6 6:16", "1-20 23:44", "2-4 18:03", "2-19 14:08", "3-6 12:24", "3-21 13:32", "4-5 17:38", "4-21 1:02", "5-6 11:21", "5-22 1:33", "6-6 16:48", "6-22 9:44", "7-8 3:10", "7-23 20:37", "8-8 12:51", "8-24 3:26", "9-8 15:27", "9-24 0:40", "10-9 5:40", "10-24 8:34", "11-8 8:27", "11-23 5:46", "12-8 1:00", "12-22 18:53"],
        1947: ["1-6 12:06", "1-21 5:31", "2-4 23:50", "2-19 19:51", "3-6 18:07", "3-21 19:12", "4-5 23:20", "4-21 7:39", "5-6 18:02", "5-22 7:08", "6-6 22:31", "6-22 15:18", "7-8 8:55", "7-24 2:14", "8-8 18:40", "8-24 9:08", "9-8 21:21", "9-24 6:28", "10-9 12:37", "10-24 15:25", "11-8 14:24", "11-23 11:37", "12-8 6:56", "12-23 0:42"],
        1948: ["1-6 18:00", "1-21 11:18", "2-5 5:42", "2-20 1:36", "3-5 23:57", "3-21 0:56", "4-5 5:09", "4-20 12:24", "5-5 23:52", "5-21 12:57", "6-6 4:20", "6-21 21:10", "7-7 14:43", "7-23 8:07", "8-8 0:26", "8-23 15:02", "9-8 3:04", "9-23 12:21", "10-8 17:20", "10-23 20:17", "11-7 20:06", "11-22 17:28", "12-7 12:37", "12-22 6:33"],
        1949: ["1-5 23:41", "1-20 17:08", "2-4 11:22", "2-19 7:27", "3-6 5:39", "3-21 6:47", "4-5 10:51", "4-20 18:17", "5-6 5:36", "5-21 18:50", "6-6 10:06", "6-22 3:02", "7-7 20:31", "7-23 13:56", "8-8 6:14", "8-23 20:48", "9-8 8:54", "9-23 18:05", "10-8 23:11", "10-24 2:02", "11-8 1:59", "11-22 23:16", "12-7 18:33", "12-22 12:22"],
        1950: ["1-6 5:38", "1-20 22:59", "2-4 17:20", "2-19 13:17", "3-6 11:35", "3-21 12:35", "4-5 16:44", "4-20 23:59", "5-6 11:24", "5-22 0:27", "6-6 15:50", "6-22 8:35", "7-8 2:13", "7-23 19:29", "8-8 11:55", "8-24 2:23", "9-8 14:33", "9-23 23:43", "10-9 4:51", "10-24 7:44", "11-8 7:43", "11-23 5:02", "12-8 0:21", "12-22 18:13"],
        1951: ["1-6 11:30", "1-21 4:52", "2-4 23:13", "2-19 19:09", "3-6 17:26", "3-21 18:25", "4-5 22:32", "4-21 5:48", "5-6 17:09", "5-22 6:15", "6-6 21:32", "6-22 14:24", "7-8 7:53", "7-24 1:20", "8-8 17:37", "8-24 8:16", "9-8 20:18", "9-24 5:36", "10-9 10:36", "10-24 13:35", "11-8 13:26", "11-23 10:51", "12-8 6:02", "12-23 0:00"],
        1952: ["1-6 17:09", "1-21 10:38", "2-5 4:52", "2-20 0:56", "3-6 0:07", "3-21 1:13", "4-5 5:15", "4-20 12:36", "5-5 22:53", "5-21 12:03", "6-6 3:20", "6-21 20:12", "7-7 13:44", "7-23 7:07", "8-7 23:30", "8-23 14:02", "9-8 2:13", "9-23 11:23", "10-8 17:32", "10-23 20:22", "11-7 19:21", "11-22 16:35", "12-7 11:55", "12-22 5:43"],
        1953: ["1-5 23:02", "1-20 16:21", "2-4 10:45", "2-19 6:41", "3-6 5:02", "3-21 6:00", "4-5 11:12", "4-20 18:25", "5-6 4:52", "5-21 17:52", "6-6 9:16", "6-22 1:59", "7-7 19:34", "7-23 12:52", "8-8 5:14", "8-23 19:45", "9-8 7:52", "9-23 17:05", "10-8 23:10", "10-24 2:06", "11-8 1:00", "11-22 22:22", "12-7 17:36", "12-22 11:31"],
        1954: ["1-6 4:45", "1-20 22:11", "2-4 16:30", "2-19 12:32", "3-6 10:48", "3-21 11:53", "4-5 16:59", "4-21 0:19", "5-6 10:38", "5-21 23:47", "6-6 15:00", "6-22 7:54", "7-8 1:19", "7-23 18:44", "8-8 10:59", "8-24 1:35", "9-8 13:37", "9-23 22:55", "10-9 4:57", "10-24 7:56", "11-8 6:50", "11-23 4:14", "12-7 23:28", "12-22 17:24"],
        1955: ["1-6 10:35", "1-21 4:01", "2-4 22:17", "2-19 18:18", "3-6 16:30", "3-21 17:35", "4-5 22:38", "4-21 5:57", "5-6 16:17", "5-22 5:24", "6-6 20:43", "6-22 13:31", "7-8 7:05", "7-24 0:24", "8-8 16:50", "8-24 7:18", "9-8 19:31", "9-24 4:40", "10-9 9:52", "10-24 12:43", "11-8 12:45", "11-23 10:00", "12-8 5:22", "12-22 23:10"],
        1956: ["1-6 16:30", "1-21 9:48", "2-5 4:11", "2-20 0:04", "3-5 22:24", "3-20 23:20", "4-5 4:31", "4-20 11:43", "5-5 22:09", "5-21 11:12", "6-6 2:35", "6-21 19:23", "7-7 12:58", "7-23 6:19", "8-7 22:40", "8-23 13:14", "9-8 1:18", "9-23 10:35", "10-8 15:35", "10-23 18:34", "11-7 18:25", "11-22 15:49", "12-7 11:02", "12-22 4:59"],
        1957: ["1-5 22:10", "1-20 15:38", "2-4 9:54", "2-19 5:57", "3-6 4:10", "3-21 5:16", "4-5 10:18", "4-20 17:41", "5-6 3:58", "5-21 17:10", "6-6 8:24", "6-22 1:20", "7-7 18:48", "7-23 12:14", "8-8 4:32", "8-23 19:07", "9-8 7:12", "9-23 16:26", "10-8 21:29", "10-24 0:24", "11-8 0:20", "11-22 21:39", "12-7 16:55", "12-22 10:48"],
        1958: ["1-6 4:04", "1-20 21:28", "2-4 15:49", "2-19 11:48", "3-6 10:04", "3-21 11:05", "4-5 16:12", "4-20 23:26", "5-6 9:49", "5-21 22:50", "6-6 14:12", "6-22 6:56", "7-8 0:33", "7-23 17:50", "8-8 10:17", "8-24 0:45", "9-8 12:58", "9-23 22:08", "10-9 3:19", "10-24 6:11", "11-8 6:11", "11-23 3:29", "12-7 22:49", "12-22 16:39"],
        1959: ["1-6 9:58", "1-21 3:18", "2-4 21:42", "2-19 17:37", "3-6 15:56", "3-21 16:54", "4-5 22:03", "4-21 5:16", "5-6 15:38", "5-22 4:42", "6-6 20:00", "6-22 12:49", "7-8 6:19", "7-23 23:45", "8-8 16:04", "8-24 6:43", "9-8 18:47", "9-24 4:08", "10-9 9:09", "10-24 12:10", "11-8 12:02", "11-23 9:26", "12-8 4:37", "12-22 22:34"],
        1960: ["1-6 15:42", "1-21 9:10", "2-5 3:23", "2-19 23:26", "3-5 21:36", "3-20 22:42", "4-5 2:43", "4-20 10:05", "5-5 20:22", "5-21 9:33", "6-6 1:48", "6-21 18:42", "7-7 12:12", "7-23 5:37", "8-7 21:59", "8-23 12:34", "9-8 0:45", "9-23 9:58", "10-8 15:08", "10-23 18:01", "11-7 18:02", "11-22 15:18", "12-7 10:37", "12-22 4:25"],
        1961: ["1-5 21:42", "1-20 15:01", "2-4 9:22", "2-19 5:16", "3-6 3:34", "3-21 4:32", "4-5 8:42", "4-20 15:55", "5-6 2:21", "5-21 15:22", "6-6 7:45", "6-22 0:30", "7-7 18:06", "7-23 11:23", "8-8 3:48", "8-23 18:18", "9-8 6:29", "9-23 15:42", "10-8 20:50", "10-23 23:47", "11-7 23:46", "11-22 21:07", "12-7 16:25", "12-22 10:19"],
        1962: ["1-6 3:34", "1-20 20:57", "2-4 15:17", "2-19 11:14", "3-6 9:29", "3-21 10:29", "4-5 14:34", "4-20 21:50", "5-6 8:09", "5-21 21:16", "6-6 12:31", "6-22 5:24", "7-7 22:51", "7-23 16:17", "8-8 8:33", "8-23 23:12", "9-8 11:15", "9-23 20:35", "10-9 2:37", "10-24 5:40", "11-8 5:34", "11-23 3:01", "12-7 22:16", "12-22 16:15"],
        1963: ["1-6 9:26", "1-21 2:53", "2-4 21:07", "2-19 17:08", "3-6 15:17", "3-21 16:19", "4-5 20:18", "4-21 3:36", "5-6 13:51", "5-22 2:58", "6-6 18:14", "6-22 11:04", "7-8 4:37", "7-23 21:59", "8-8 14:25", "8-24 4:57", "9-8 17:11", "9-24 2:23", "10-9 8:36", "10-24 11:28", "11-8 11:32", "11-23 8:49", "12-8 4:12", "12-22 22:01"],
        1964: ["1-6 15:22", "1-21 8:41", "2-5 3:04", "2-19 22:57", "3-5 21:15", "3-20 22:09", "4-5 2:18", "4-20 9:27", "5-5 19:51", "5-21 8:49", "6-6 0:11", "6-21 16:56", "7-7 10:32", "7-23 3:52", "8-7 20:16", "8-23 10:51", "9-7 22:59", "9-23 8:16", "10-8 14:21", "10-23 17:20", "11-7 17:15", "11-22 14:38", "12-7 9:53", "12-22 3:49"],
        1965: ["1-5 21:01", "1-20 14:28", "2-4 8:46", "2-19 4:47", "3-6 3:00", "3-21 4:04", "4-5 8:06", "4-20 15:26", "5-6 1:41", "5-21 14:50", "6-6 6:02", "6-21 22:55", "7-7 16:21", "7-23 9:48", "8-8 2:04", "8-23 16:42", "9-8 4:47", "9-23 14:05", "10-8 20:11", "10-23 23:09", "11-7 23:06", "11-22 20:29", "12-7 15:45", "12-22 9:40"],
        1966: ["1-6 2:54", "1-20 20:19", "2-4 14:37", "2-19 10:37", "3-6 8:51", "3-21 9:52", "4-5 13:56", "4-20 21:11", "5-6 7:30", "5-21 20:32", "6-6 11:49", "6-22 4:33", "7-7 22:06", "7-23 15:23", "8-8 7:48", "8-23 22:17", "9-8 10:32", "9-23 19:43", "10-9 1:56", "10-24 4:50", "11-8 4:55", "11-23 2:14", "12-7 21:37", "12-22 15:28"],
        1967: ["1-6 8:48", "1-21 2:07", "2-4 20:30", "2-19 16:23", "3-6 14:41", "3-21 15:36", "4-5 19:44", "4-21 2:55", "5-6 13:17", "5-22 2:17", "6-6 17:36", "6-22 10:22", "7-8 3:53", "7-23 21:15", "8-8 13:34", "8-24 4:12", "9-8 16:17", "9-24 1:38", "10-9 7:41", "10-24 10:43", "11-8 10:37", "11-23 8:04", "12-8 3:17", "12-22 21:16"],
        1968: ["1-6 14:26", "1-21 7:54", "2-5 2:07", "2-19 22:09", "3-5 20:17", "3-20 21:22", "4-5 1:20", "4-20 8:41", "5-5 18:55", "5-21 8:05", "6-5 23:19", "6-21 16:13", "7-7 9:41", "7-23 3:07", "8-7 19:27", "8-23 10:02", "9-7 22:11", "9-23 7:26", "10-8 13:34", "10-23 16:29", "11-7 16:29", "11-22 13:48", "12-7 9:08", "12-22 2:59"],
        1969: ["1-5 20:16", "1-20 13:38", "2-4 7:58", "2-19 3:54", "3-6 2:10", "3-21 3:08", "4-5 7:14", "4-20 14:26", "5-6 0:49", "5-21 13:49", "6-6 5:11", "6-21 21:55", "7-7 15:31", "7-23 8:48", "8-8 1:14", "8-23 15:43", "9-8 3:55", "9-23 13:06", "10-8 19:16", "10-23 22:11", "11-7 22:11", "11-22 19:31", "12-7 14:51", "12-22 8:43"],
        1970: ["1-6 2:01", "1-20 19:23", "2-4 13:45", "2-19 9:41", "3-6 7:58", "3-21 8:56", "4-5 13:01", "4-20 20:14", "5-6 6:33", "5-21 19:37", "6-6 10:52", "6-22 3:42", "7-7 21:10", "7-23 14:36", "8-8 6:54", "8-23 21:33", "9-8 9:37", "9-23 18:58", "10-9 1:01", "10-24 4:04", "11-8 3:57", "11-23 1:24", "12-7 20:37", "12-22 14:35"],
        1971: ["1-6 7:45", "1-21 1:12", "2-4 19:25", "2-19 15:26", "3-6 13:34", "3-21 14:38", "4-5 18:35", "4-21 1:54", "5-6 12:08", "5-22 1:14", "6-6 16:28", "6-22 9:19", "7-8 2:51", "7-23 20:14", "8-8 12:40", "8-24 3:15", "9-8 15:30", "9-24 0:44", "10-9 6:58", "10-24 9:53", "11-8 9:56", "11-23 7:13", "12-8 2:35", "12-22 20:23"],
        1972: ["1-6 13:41", "1-21 6:58", "2-5 1:20", "2-19 21:11", "3-5 19:28", "3-20 20:21", "4-5 0:28", "4-20 7:37", "5-5 18:01", "5-21 6:59", "6-5 22:21", "6-21 15:06", "7-7 8:42", "7-23 2:02", "8-7 18:28", "8-23 9:02", "9-7 21:15", "9-23 6:32", "10-8 12:41", "10-23 15:41", "11-7 15:39", "11-22 13:02", "12-7 8:18", "12-22 2:12"],
        1973: ["1-5 19:25", "1-20 12:48", "2-4 7:04", "2-19 3:01", "3-6 1:12", "3-21 2:12", "4-5 6:13", "4-20 13:30", "5-5 23:46", "5-21 12:53", "6-6 4:06", "6-21 21:00", "7-7 14:27", "7-23 7:55", "8-8 0:12", "8-23 14:53", "9-8 2:59", "9-23 12:21", "10-8 18:27", "10-23 21:30", "11-7 21:27", "11-22 18:54", "12-7 14:10", "12-22 8:07"],
        1974: ["1-6 1:19", "1-20 18:45", "2-4 13:00", "2-19 8:58", "3-6 7:07", "3-21 8:06", "4-5 13:04", "4-20 20:18", "5-6 6:33", "5-21 19:36", "6-6 10:51", "6-22 3:37", "7-7 21:11", "7-23 14:30", "8-8 6:57", "8-23 21:28", "9-8 9:45", "9-23 18:58", "10-9 0:14", "10-24 3:10", "11-8 3:17", "11-23 0:38", "12-7 20:04", "12-22 13:55"],
        1975: ["1-6 7:17", "1-21 0:36", "2-4 18:59", "2-19 14:49", "3-6 13:05", "3-21 13:56", "4-5 19:01", "4-21 2:07", "5-6 12:27", "5-22 1:23", "6-6 16:42", "6-22 9:26", "7-8 2:59", "7-23 20:21", "8-8 12:44", "8-24 3:23", "9-8 15:33", "9-24 0:55", "10-9 6:02", "10-24 9:06", "11-8 9:02", "11-23 6:30", "12-8 1:46", "12-22 19:45"],
        1976: ["1-6 12:57", "1-21 6:25", "2-5 0:39", "2-19 20:39", "3-5 18:48", "3-20 19:49", "4-4 23:46", "4-20 7:02", "5-5 17:14", "5-21 6:21", "6-5 21:31", "6-21 14:24", "7-7 7:50", "7-23 1:18", "8-7 17:38", "8-23 8:18", "9-7 20:28", "9-23 5:48", "10-8 11:58", "10-23 14:58", "11-7 14:58", "11-22 12:21", "12-7 7:40", "12-22 1:35"],
        1977: ["1-5 18:51", "1-20 12:14", "2-4 6:33", "2-19 2:30", "3-6 0:44", "3-21 1:42", "4-5 5:45", "4-20 12:57", "5-5 23:15", "5-21 12:14", "6-6 3:32", "6-21 20:13", "7-7 13:47", "7-23 7:03", "8-7 23:30", "8-23 14:00", "9-8 2:15", "9-23 11:29", "10-8 17:43", "10-23 20:40", "11-7 20:45", "11-22 18:06", "12-7 13:30", "12-22 7:23"],
        1978: ["1-6 0:43", "1-20 18:03", "2-4 12:26", "2-19 8:20", "3-6 6:38", "3-21 7:33", "4-5 11:39", "4-20 18:49", "5-6 5:08", "5-21 18:08", "6-6 9:23", "6-22 2:09", "7-7 19:36", "7-23 13:00", "8-8 5:17", "8-23 19:56", "9-8 8:02", "9-23 17:25", "10-8 23:30", "10-24 2:37", "11-8 2:34", "11-23 0:04", "12-7 19:20", "12-22 13:20"],
        1979: ["1-6 6:31", "1-20 23:59", "2-4 18:12", "2-19 14:13", "3-6 12:19", "3-21 13:21", "4-5 17:17", "4-21 0:35", "5-6 10:47", "5-21 23:53", "6-6 15:05", "6-22 7:56", "7-8 2:24", "7-23 19:48", "8-8 12:10", "8-24 2:46", "9-8 14:59", "9-24 0:16", "10-9 5:30", "10-24 8:27", "11-8 8:32", "11-23 5:54", "12-8 1:17", "12-22 19:09"],
        1980: ["1-6 12:28", "1-21 5:48", "2-5 0:09", "2-19 20:01", "3-5 18:16", "3-20 19:09", "4-4 23:14", "4-20 6:22", "5-5 16:44", "5-21 5:42", "6-5 21:03", "6-21 13:47", "7-7 7:23", "7-23 0:41", "8-7 17:08", "8-23 7:40", "9-7 19:53", "9-23 5:08", "10-8 11:19", "10-23 14:17", "11-7 14:18", "11-22 11:41", "12-7 7:01", "12-22 0:56"],
        1981: ["1-5 18:12", "1-20 11:35", "2-4 5:55", "2-19 1:51", "3-6 0:05", "3-21 1:02", "4-5 5:05", "4-20 12:18", "5-5 22:34", "5-21 11:39", "6-6 2:52", "6-21 19:44", "7-7 13:11", "7-23 6:39", "8-7 22:57", "8-23 13:38", "9-8 1:43", "9-23 11:05", "10-8 17:09", "10-23 20:12", "11-7 20:08", "11-22 17:35", "12-7 12:51", "12-22 6:50"],
        1982: ["1-6 0:02", "1-20 17:30", "2-4 11:45", "2-19 7:46", "3-6 5:54", "3-21 6:55", "4-5 10:52", "4-20 18:07", "5-6 4:19", "5-21 17:22", "6-6 8:35", "6-22 1:22", "7-7 18:54", "7-23 12:15", "8-8 4:41", "8-23 19:15", "9-8 7:31", "9-23 16:46", "10-8 23:02", "10-24 1:57", "11-8 2:04", "11-22 23:23", "12-7 18:48", "12-22 12:38"],
        1983: ["1-6 5:58", "1-20 23:16", "2-4 17:39", "2-19 13:30", "3-6 11:47", "3-21 12:38", "4-5 16:44", "4-20 23:50", "5-6 10:10", "5-21 23:06", "6-6 14:25", "6-22 7:08", "7-8 0:43", "7-23 18:04", "8-8 10:29", "8-24 1:07", "9-8 13:20", "9-23 22:41", "10-9 4:51", "10-24 7:54", "11-8 7:52", "11-23 5:18", "12-8 0:33", "12-22 18:29"],
        1984: ["1-6 11:40", "1-21 5:05", "2-4 23:18", "2-19 19:16", "3-5 17:24", "3-20 18:24", "4-4 22:22", "4-20 5:38", "5-5 15:50", "5-21 4:57", "6-5 20:08", "6-21 13:02", "7-7 6:29", "7-22 23:58", "8-7 16:17", "8-23 7:00", "9-7 19:09", "9-23 4:32", "10-8 10:42", "10-23 13:45", "11-7 13:45", "11-22 11:10", "12-7 6:28", "12-22 0:22"],
        1985: ["1-5 17:35", "1-20 10:57", "2-4 5:11", "2-19 1:07", "3-5 23:16", "3-21 0:13", "4-5 4:13", "4-20 11:25", "5-5 21:42", "5-21 10:42", "6-6 1:59", "6-21 18:44", "7-7 12:18", "7-23 5:36", "8-7 22:04", "8-23 12:35", "9-8 0:53", "9-23 10:07", "10-8 16:24", "10-23 19:21", "11-7 19:29", "11-22 16:50", "12-7 12:16", "12-22 6:07"],
        1986: ["1-5 23:28", "1-20 16:46", "2-4 11:07", "2-19 6:57", "3-6 5:12", "3-21 6:02", "4-5 10:06", "4-20 17:12", "5-6 3:30", "5-21 16:27", "6-6 7:44", "6-22 0:29", "7-7 18:00", "7-23 11:24", "8-8 3:45", "8-23 18:25", "9-8 6:34", "9-23 15:58", "10-8 22:06", "10-24 1:14", "11-8 1:12", "11-22 22:44", "12-7 18:00", "12-22 12:02"],
        1987: ["1-6 5:13", "1-20 22:40", "2-4 16:51", "2-19 12:49", "3-6 10:53", "3-21 11:51", "4-5 15:44", "4-20 23:57", "5-6 10:05", "5-21 23:10", "6-6 14:18", "6-22 7:10", "7-8 0:38", "7-23 18:06", "8-8 10:29", "8-24 1:09", "9-8 13:24", "9-23 21:45", "10-9 3:59", "10-24 7:00", "11-8 7:05", "11-23 4:29", "12-7 23:52", "12-22 17:45"],
        1988: ["1-6 11:03", "1-21 4:24", "2-4 22:42", "2-19 18:35", "3-5 16:46", "3-20 17:38", "4-4 21:39", "4-20 5:44", "5-5 16:01", "5-21 4:56", "6-5 20:14", "6-21 12:56", "7-7 6:32", "7-22 23:51", "8-7 16:20", "8-23 6:54", "9-7 19:11", "9-23 3:28", "10-8 9:44", "10-23 12:44", "11-7 12:48", "11-22 10:11", "12-7 5:34", "12-21 23:27"],
        1989: ["1-5 16:45", "1-20 10:06", "2-4 4:27", "2-19 0:20", "3-5 22:34", "3-20 23:28", "4-5 3:29", "4-20 11:38", "5-5 21:53", "5-21 10:53", "6-6 2:05", "6-21 18:53", "7-7 12:19", "7-23 5:45", "8-7 22:03", "8-23 12:46", "9-8 0:53", "9-23 9:19", "10-8 15:27", "10-23 18:35", "11-7 18:33", "11-22 16:04", "12-7 11:20", "12-22 5:22"],
        1990: ["1-5 22:33", "1-20 16:01", "2-4 10:14", "2-19 6:14", "3-6 4:19", "3-21 5:19", "4-5 9:12", "4-20 17:26", "5-6 3:35", "5-21 16:37", "6-6 7:46", "6-22 0:32", "7-7 18:00", "7-23 11:21", "8-8 3:45", "8-23 18:20", "9-8 6:37", "9-23 14:55", "10-8 21:13", "10-24 0:13", "11-8 0:23", "11-22 21:46", "12-7 17:14", "12-22 11:06"],
        1991: ["1-6 4:28", "1-20 21:47", "2-4 16:08", "2-19 11:58", "3-6 10:12", "3-21 11:01", "4-5 15:04", "4-20 23:08", "5-6 9:26", "5-21 22:20", "6-6 13:38", "6-22 6:18", "7-7 23:53", "7-23 17:11", "8-8 9:37", "8-24 0:12", "9-8 12:27", "9-23 20:48", "10-9 3:01", "10-24 6:05", "11-8 6:07", "11-23 3:35", "12-7 22:56", "12-22 16:53"],
        1992: ["1-6 10:08", "1-21 3:32", "2-4 21:48", "2-19 17:43", "3-5 15:52", "3-20 16:48", "4-4 20:45", "4-20 3:56", "5-5 14:08", "5-21 3:12", "6-5 18:22", "6-21 11:14", "7-7 4:40", "7-22 22:08", "8-7 14:27", "8-23 5:10", "9-7 17:18", "9-23 2:42", "10-8 8:51", "10-23 11:57", "11-7 11:57", "11-22 9:25", "12-7 4:44", "12-21 22:43"],
        1993: ["1-5 15:56", "1-20 9:22", "2-4 3:37", "2-18 23:35", "3-5 21:42", "3-20 22:40", "4-5 2:37", "4-20 9:48", "5-5 20:01", "5-21 9:01", "6-6 0:15", "6-21 16:59", "7-7 10:32", "7-23 3:50", "8-7 20:17", "8-23 10:50", "9-7 23:07", "9-23 8:22", "10-8 14:40", "10-23 17:37", "11-7 17:45", "11-22 15:06", "12-7 10:33", "12-22 4:25"],
        1994: ["1-5 21:48", "1-20 15:07", "2-4 9:30", "2-19 5:21", "3-6 3:37", "3-21 4:28", "4-5 8:31", "4-20 15:36", "5-6 1:54", "5-21 14:48", "6-6 6:04", "6-21 22:47", "7-7 16:19", "7-23 9:40", "8-8 2:04", "8-23 16:43", "9-8 4:55", "9-23 14:19", "10-8 20:29", "10-23 23:36", "11-7 23:35", "11-22 21:05", "12-7 16:22", "12-22 10:22"],
        1995: ["1-6 3:34", "1-20 21:00", "2-4 15:12", "2-19 11:10", "3-6 9:16", "3-21 10:14", "4-5 14:08", "4-20 21:21", "5-6 7:30", "5-21 20:34", "6-6 11:42", "6-22 4:34", "7-7 22:00", "7-23 15:29", "8-8 7:51", "8-23 22:34", "9-8 10:48", "9-23 20:12", "10-9 2:27", "10-24 5:31", "11-8 5:35", "11-23 3:01", "12-7 22:22", "12-22 16:16"],
        1996: ["1-6 9:31", "1-21 2:52", "2-4 21:07", "2-19 17:00", "3-5 15:09", "3-20 16:03", "4-4 20:02", "4-20 3:09", "5-5 13:26", "5-21 2:23", "6-5 17:40", "6-21 10:23", "7-7 3:59", "7-22 21:18", "8-7 13:48", "8-23 4:22", "9-7 16:42", "9-23 2:00", "10-8 8:18", "10-23 11:18", "11-7 11:26", "11-22 8:49", "12-7 4:14", "12-21 22:05"],
        1997: ["1-5 15:24", "1-20 8:42", "2-4 3:01", "2-18 22:51", "3-5 21:04", "3-20 21:54", "4-5 1:56", "4-20 9:02", "5-5 19:19", "5-21 8:17", "6-5 23:32", "6-21 16:19", "7-7 9:49", "7-23 3:15", "8-7 19:36", "8-23 10:19", "9-7 22:28", "9-23 7:55", "10-8 14:05", "10-23 17:14", "11-7 17:14", "11-22 14:47", "12-7 10:04", "12-22 4:07"],
        1998: ["1-5 21:18", "1-20 14:46", "2-4 8:56", "2-19 4:54", "3-6 2:57", "3-21 3:54", "4-5 7:44", "4-20 14:56", "5-6 1:03", "5-21 14:05", "6-6 5:13", "6-21 22:02", "7-7 15:30", "7-23 8:55", "8-8 1:19", "8-23 15:58", "9-8 4:15", "9-23 13:37", "10-8 19:55", "10-23 22:58", "11-7 23:08", "11-22 20:34", "12-7 16:01", "12-22 9:56"],
        1999: ["1-6 3:17", "1-20 20:37", "2-4 14:57", "2-19 10:46", "3-6 8:57", "3-21 9:45", "4-5 13:44", "4-20 20:46", "5-6 7:01", "5-21 19:52", "6-6 11:09", "6-22 3:49", "7-7 21:24", "7-23 14:44", "8-8 7:14", "8-23 21:51", "9-8 10:10", "9-23 19:31", "10-9 1:48", "10-24 4:52", "11-8 4:57", "11-23 2:24", "12-7 21:47", "12-22 15:43"],
        2000: ["1-6 9:00", "1-21 2:23", "2-4 20:40", "2-19 16:33", "3-5 14:42", "3-20 15:35", "4-4 19:31", "4-20 2:39", "5-5 12:50", "5-21 1:49", "6-5 16:58", "6-21 9:47", "7-7 3:13", "7-22 20:42", "8-7 13:02", "8-23 3:48", "9-7 15:59", "9-23 1:27", "10-8 7:38", "10-23 10:47", "11-7 10:48", "11-22 8:19", "12-7 3:37", "12-21 21:37"],
        2001: ["1-5 14:49", "1-20 8:16", "2-4 2:28", "2-18 22:27", "3-5 20:32", "3-20 21:30", "4-5 1:24", "4-20 8:35", "5-5 18:44", "5-21 7:44", "6-5 22:53", "6-21 15:37", "7-7 9:06", "7-23 2:26", "8-7 18:52", "8-23 9:27", "9-7 21:46", "9-23 7:04", "10-8 13:25", "10-23 16:25", "11-7 16:36", "11-22 14:00", "12-7 9:28", "12-22 3:21"],
        2002: ["1-5 20:43", "1-20 14:02", "2-4 8:24", "2-19 4:13", "3-6 2:27", "3-21 3:16", "4-5 7:18", "4-20 14:20", "5-6 0:37", "5-21 13:29", "6-6 4:44", "6-21 21:24", "7-7 14:56", "7-23 8:14", "8-8 0:39", "8-23 15:16", "9-8 3:31", "9-23 12:55", "10-8 19:09", "10-23 22:17", "11-7 22:21", "11-22 19:53", "12-7 15:14", "12-22 9:14"],
        2003: ["1-6 2:27", "1-20 19:52", "2-4 14:05", "2-19 10:00", "3-6 8:04", "3-21 8:59", "4-5 12:52", "4-20 20:02", "5-6 6:10", "5-21 19:12", "6-6 10:19", "6-22 3:10", "7-7 20:35", "7-23 14:04", "8-8 6:24", "8-23 21:08", "9-8 9:20", "9-23 18:46", "10-9 1:00", "10-24 4:08", "11-8 4:13", "11-23 1:43", "12-7 21:05", "12-22 15:03"],
        2004: ["1-6 8:18", "1-21 1:42", "2-4 19:56", "2-19 15:49", "3-5 13:55", "3-20 14:48", "4-4 18:43", "4-20 1:50", "5-5 12:02", "5-21 0:59", "6-5 16:13", "6-21 8:56", "7-7 2:31", "7-22 19:50", "8-7 12:19", "8-23 2:53", "9-7 15:12", "9-23 0:29", "10-8 6:49", "10-23 9:48", "11-7 9:58", "11-22 7:21", "12-7 2:48", "12-21 20:41"],
        2005: ["1-5 14:02", "1-20 7:21", "2-4 1:43", "2-18 21:31", "3-5 19:45", "3-20 20:33", "4-5 0:34", "4-20 7:37", "5-5 17:52", "5-21 6:47", "6-5 22:01", "6-21 14:46", "7-7 8:16", "7-23 1:40", "8-7 18:03", "8-23 8:45", "9-7 20:56", "9-23 6:23", "10-8 12:33", "10-23 15:42", "11-7 15:42", "11-22 13:14", "12-7 8:32", "12-22 2:34"],
        2006: ["1-5 19:46", "1-20 13:15", "2-4 7:27", "2-19 3:25", "3-6 1:28", "3-21 2:25", "4-5 6:15", "4-20 13:26", "5-5 23:30", "5-21 12:31", "6-6 3:36", "6-21 20:25", "7-7 13:51", "7-23 7:17", "8-7 23:40", "8-23 14:22", "9-8 2:39", "9-23 12:03", "10-8 18:21", "10-23 21:26", "11-7 21:34", "11-22 19:01", "12-7 14:26", "12-22 8:22"],
        2007: ["1-6 1:40", "1-20 19:00", "2-4 13:18", "2-19 9:08", "3-6 7:17", "3-21 8:07", "4-5 12:04", "4-20 19:07", "5-6 5:20", "5-21 18:11", "6-6 9:27", "6-22 2:06", "7-7 19:41", "7-23 13:00", "8-8 5:31", "8-23 20:07", "9-8 8:29", "9-23 17:51", "10-9 0:11", "10-24 3:15", "11-8 3:24", "11-23 0:49", "12-7 20:14", "12-22 14:07"],
        2008: ["1-6 7:24", "1-21 0:43", "2-4 19:00", "2-19 14:49", "3-5 12:58", "3-20 13:48", "4-4 17:45", "4-20 0:51", "5-5 11:03", "5-21 0:00", "6-5 15:11", "6-21 7:59", "7-7 1:26", "7-22 18:54", "8-7 11:16", "8-23 2:02", "9-7 14:14", "9-22 23:44", "10-8 5:56", "10-23 9:08", "11-7 9:10", "11-22 6:44", "12-7 2:02", "12-21 20:03"],
        2009: ["1-5 13:14", "1-20 6:40", "2-4 0:49", "2-18 20:46", "3-5 18:47", "3-20 19:43", "4-4 23:33", "4-20 6:44", "5-5 16:50", "5-21 5:51", "6-5 20:59", "6-21 13:45", "7-7 7:13", "7-23 0:35", "8-7 17:01", "8-23 7:38", "9-7 19:57", "9-23 5:18", "10-8 11:40", "10-23 14:43", "11-7 14:56", "11-22 12:22", "12-7 7:52", "12-22 1:46"],
        2010: ["1-5 19:08", "1-20 12:27", "2-4 6:47", "2-19 2:35", "3-6 0:46", "3-21 1:32", "4-5 5:30", "4-20 12:29", "5-5 22:44", "5-21 11:33", "6-6 2:49", "6-21 19:28", "7-7 13:02", "7-23 6:21", "8-7 22:49", "8-23 13:26", "9-8 1:44", "9-23 11:09", "10-8 17:26", "10-23 20:35", "11-7 20:42", "11-22 18:14", "12-7 13:38", "12-22 7:38"],
        2011: ["1-6 0:54", "1-20 18:18", "2-4 12:32", "2-19 8:25", "3-6 6:29", "3-21 7:20", "4-5 11:11", "4-20 18:17", "5-6 4:23", "5-21 17:21", "6-6 8:27", "6-22 1:16", "7-7 18:42", "7-23 12:11", "8-8 4:33", "8-23 19:20", "9-8 7:34", "9-23 17:04", "10-8 23:19", "10-24 2:30", "11-8 2:34", "11-23 0:07", "12-7 19:29", "12-22 13:30"],
        2012: ["1-6 6:43", "1-21 0:09", "2-4 18:22", "2-19 14:17", "3-5 12:21", "3-20 13:14", "4-4 17:05", "4-20 0:12", "5-5 10:19", "5-20 23:15", "6-5 14:25", "6-21 7:08", "7-7 0:40", "7-22 18:00", "8-7 10:30", "8-23 1:06", "9-7 13:29", "9-22 22:48", "10-8 5:11", "10-23 8:13", "11-7 8:25", "11-22 5:50", "12-7 1:18", "12-21 19:11"],
        2013: ["1-5 12:33", "1-20 5:51", "2-4 0:13", "2-18 20:01", "3-5 18:14", "3-20 19:01", "4-4 23:02", "4-20 6:03", "5-5 16:18", "5-21 5:09", "6-5 20:23", "6-21 13:03", "7-7 6:34", "7-22 23:55", "8-7 16:20", "8-23 7:01", "9-7 19:16", "9-23 4:44", "10-8 10:58", "10-23 14:09", "11-7 14:13", "11-22 11:48", "12-7 7:08", "12-22 1:11"],
        2014: ["1-5 18:24", "1-20 11:51", "2-4 6:03", "2-19 1:59", "3-6 0:02", "3-21 0:57", "4-5 4:46", "4-20 11:55", "5-5 21:59", "5-21 10:59", "6-6 2:03", "6-21 18:51", "7-7 12:14", "7-23 5:41", "8-7 22:02", "8-23 12:45", "9-8 1:01", "9-23 10:29", "10-8 16:47", "10-23 19:57", "11-7 20:06", "11-22 17:38", "12-7 13:04", "12-22 7:03"],
        2015: ["1-6 0:20", "1-20 17:43", "2-4 11:58", "2-19 7:49", "3-6 5:55", "3-21 6:45", "4-5 10:39", "4-20 17:41", "5-6 3:52", "5-21 16:44", "6-6 7:58", "6-22 0:37", "7-7 18:12", "7-23 11:30", "8-8 4:01", "8-23 18:37", "9-8 6:59", "9-23 16:20", "10-8 22:42", "10-24 1:46", "11-8 1:58", "11-22 23:25", "12-7 18:53", "12-22 12:47"],
        2016: ["1-6 6:08", "1-20 23:27", "2-4 17:46", "2-19 13:33", "3-5 11:43", "3-20 12:30", "4-4 16:27", "4-19 23:29", "5-5 9:41", "5-20 22:36", "6-5 13:48", "6-21 6:34", "7-7 0:03", "7-22 17:30", "8-7 9:53", "8-23 0:38", "9-7 12:51", "9-22 22:21", "10-8 4:33", "10-23 7:45", "11-7 7:47", "11-22 5:22", "12-7 0:41", "12-21 18:44"],
        2017: ["1-5 11:55", "1-20 5:23", "2-3 23:34", "2-18 19:31", "3-5 17:32", "3-20 18:28", "4-4 22:17", "4-20 5:27", "5-5 15:31", "5-21 4:30", "6-5 19:36", "6-21 12:24", "7-7 5:50", "7-22 23:15", "8-7 15:40", "8-23 6:20", "9-7 18:38", "9-23 4:01", "10-8 10:22", "10-23 13:26", "11-7 13:37", "11-22 11:04", "12-7 6:32", "12-22 0:27"],
        2018: ["1-5 17:48", "1-20 11:09", "2-4 5:28", "2-19 1:18", "3-5 23:28", "3-21 0:15", "4-5 4:12", "4-20 11:12", "5-5 21:25", "5-21 10:14", "6-6 1:29", "6-21 18:07", "7-7 11:41", "7-23 5:00", "8-7 21:30", "8-23 12:08", "9-8 0:29", "9-23 9:54", "10-8 16:14", "10-23 19:22", "11-7 19:31", "11-22 17:01", "12-7 12:25", "12-22 6:22"],
        2019: ["1-5 23:38", "1-20 16:59", "2-4 11:14", "2-19 7:03", "3-6 5:09", "3-21 5:58", "4-5 9:51", "4-20 16:55", "5-6 3:02", "5-21 15:59", "6-6 7:06", "6-21 23:54", "7-7 17:20", "7-23 10:50", "8-8 3:13", "8-23 18:01", "9-8 6:16", "9-23 15:50", "10-8 22:05", "10-24 1:19", "11-8 1:24", "11-22 22:58", "12-7 18:18", "12-22 12:19"],
        2020: ["1-6 5:30", "1-20 22:54", "2-4 17:03", "2-19 12:56", "3-5 10:56", "3-20 11:49", "4-4 15:38", "4-19 22:45", "5-5 8:51", "5-20 21:49", "6-5 12:58", "6-21 5:43", "7-6 23:14", "7-22 16:36", "8-7 9:06", "8-22 23:44", "9-7 12:07", "9-22 21:30", "10-8 3:55", "10-23 6:59", "11-7 7:13", "11-22 4:39", "12-7 0:09", "12-21 18:02"],
        2021: ["1-5 11:23", "1-20 4:39", "2-3 22:58", "2-18 18:43", "3-5 16:53", "3-20 17:37", "4-4 21:35", "4-20 4:33", "5-5 14:47", "5-21 3:37", "6-5 18:52", "6-21 11:32", "7-7 5:05", "7-22 22:26", "8-7 14:53", "8-23 5:34", "9-7 17:52", "9-23 3:21", "10-8 9:38", "10-23 12:51", "11-7 12:58", "11-22 10:33", "12-7 5:56", "12-21 23:59"],
        2022: ["1-5 17:13", "1-20 10:39", "2-4 4:50", "2-19 0:42", "3-5 22:43", "3-20 23:33", "4-5 3:20", "4-20 10:24", "5-5 20:25", "5-21 9:22", "6-6 0:25", "6-21 17:13", "7-7 10:37", "7-23 4:06", "8-7 20:29", "8-23 11:16", "9-7 23:32", "9-23 9:03", "10-8 15:22", "10-23 18:35", "11-7 18:45", "11-22 16:20", "12-7 11:46", "12-22 5:48"],
        2023: ["1-5 23:04", "1-20 16:29", "2-4 10:42", "2-19 6:34", "3-6 4:36", "3-21 5:24", "4-5 9:12", "4-20 16:13", "5-6 2:18", "5-21 15:09", "6-6 6:18", "6-21 22:57", "7-7 16:30", "7-23 9:50", "8-8 2:22", "8-23 17:01", "9-8 5:26", "9-23 14:49", "10-8 21:15", "10-24 0:20", "11-8 0:35", "11-22 22:02", "12-7 17:32", "12-22 11:27"],
        2024: ["1-6 4:49", "1-20 22:07", "2-4 16:26", "2-19 12:13", "3-5 10:22", "3-20 11:06", "4-4 15:02", "4-19 21:59", "5-5 8:09", "5-20 20:59", "6-5 12:09", "6-21 4:50", "7-6 22:19", "7-22 15:44", "8-7 8:09", "8-22 22:54", "9-7 11:11", "9-22 20:43", "10-8 2:59", "10-23 6:14", "11-7 6:19", "11-22 3:56", "12-6 23:16", "12-21 17:20"],
        2025: ["1-5 10:32", "1-20 3:59", "2-3 22:10", "2-18 18:06", "3-5 16:07", "3-20 17:01", "4-4 20:48", "4-20 3:55", "5-5 13:57", "5-21 2:54", "6-5 17:56", "6-21 10:42", "7-7 4:04", "7-22 21:29", "8-7 13:51", "8-23 4:33", "9-7 16:51", "9-23 2:19", "10-8 8:40", "10-23 11:50", "11-7 12:03", "11-22 9:35", "12-7 5:04", "12-21 23:02"],
        2026: ["1-5 16:22", "1-20 9:44", "2-4 4:01", "2-18 23:51", "3-5 21:58", "3-20 22:45", "4-5 2:39", "4-20 9:38", "5-5 19:48", "5-21 8:36", "6-5 23:48", "6-21 16:24", "7-7 9:56", "7-23 3:12", "8-7 19:42", "8-23 10:18", "9-7 22:41", "9-23 8:05", "10-8 14:29", "10-23 17:37", "11-7 17:51", "11-22 15:23", "12-7 10:52", "12-22 4:50"],
        2027: ["1-5 22:09", "1-20 15:29", "2-4 9:46", "2-19 5:33", "3-6 3:39", "3-21 4:24", "4-5 8:17", "4-20 15:17", "5-6 1:24", "5-21 14:18", "6-6 5:25", "6-21 22:10", "7-7 15:36", "7-23 9:04", "8-8 1:26", "8-23 16:14", "9-8 4:28", "9-23 14:01", "10-8 20:16", "10-23 23:32", "11-7 23:38", "11-22 21:15", "12-7 16:37", "12-22 10:41"],
        2028: ["1-6 3:54", "1-20 21:21", "2-4 15:30", "2-19 11:25", "3-5 9:24", "3-20 10:16", "4-4 14:02", "4-19 21:09", "5-5 7:11", "5-20 20:09", "6-5 11:15", "6-21 4:01", "7-6 21:30", "7-22 14:53", "8-7 7:20", "8-22 22:00", "9-7 10:21", "9-22 19:45", "10-8 2:08", "10-23 5:13", "11-7 5:26", "11-22 2:54", "12-6 22:24", "12-21 16:19"],
        2029: ["1-5 9:41", "1-20 3:00", "2-3 21:20", "2-18 17:07", "3-5 15:17", "3-20 16:01", "4-4 19:58", "4-20 2:55", "5-5 13:07", "5-21 1:55", "6-5 17:09", "6-21 9:48", "7-7 3:22", "7-22 20:41", "8-7 13:11", "8-23 3:51", "9-7 16:11", "9-23 1:38", "10-8 7:57", "10-23 11:07", "11-7 11:16", "11-22 8:49", "12-7 4:13", "12-21 22:13"],
        2030: ["1-5 15:30", "1-20 8:54", "2-4 3:08", "2-18 22:59", "3-5 21:03", "3-20 21:51", "4-5 1:40", "4-20 8:43", "5-5 18:46", "5-21 7:40", "6-5 22:44", "6-21 15:31", "7-7 8:55", "7-23 2:24", "8-7 18:47", "8-23 9:36", "9-7 21:52", "9-23 7:26", "10-8 13:44", "10-23 17:00", "11-7 17:08", "11-22 14:44", "12-7 10:07", "12-22 4:09"],
        2031: ["1-5 21:22", "1-20 14:47", "2-4 8:57", "2-19 4:50", "3-6 2:50", "3-21 3:40", "4-5 7:28", "4-20 14:30", "5-6 0:34", "5-21 13:27", "6-6 4:35", "6-21 21:16", "7-7 14:48", "7-23 8:10", "8-8 0:42", "8-23 15:22", "9-8 3:49", "9-23 13:14", "10-8 19:42", "10-23 22:49", "11-7 23:05", "11-22 20:32", "12-7 16:02", "12-22 9:55"],
        2032: ["1-6 3:15", "1-20 20:30", "2-4 14:48", "2-19 10:31", "3-5 8:39", "3-20 9:21", "4-4 13:17", "4-19 20:13", "5-5 6:25", "5-20 19:14", "6-5 10:27", "6-21 3:08", "7-6 20:40", "7-22 14:04", "8-7 6:32", "8-22 21:17", "9-7 9:37", "9-22 19:10", "10-8 1:30", "10-23 4:45", "11-7 4:53", "11-22 2:30", "12-6 21:52", "12-21 15:55"],
        2033: ["1-5 9:07", "1-20 2:32", "2-3 20:41", "2-18 16:33", "3-5 14:31", "3-20 15:22", "4-4 19:07", "4-20 2:12", "5-5 12:13", "5-21 1:10", "6-5 16:13", "6-21 9:00", "7-7 2:24", "7-22 19:52", "8-7 12:15", "8-23 3:01", "9-7 15:19", "9-23 0:51", "10-8 7:13", "10-23 10:27", "11-7 10:40", "11-22 8:15", "12-7 3:44", "12-21 21:45"],
        2034: ["1-5 15:04", "1-20 8:26", "2-4 2:40", "2-18 22:29", "3-5 20:31", "3-20 21:17", "4-5 1:05", "4-20 8:03", "5-5 18:08", "5-21 6:56", "6-5 22:06", "6-21 14:43", "7-7 8:17", "7-23 1:35", "8-7 18:08", "8-23 8:47", "9-7 21:13", "9-23 6:39", "10-8 13:06", "10-23 16:16", "11-7 16:33", "11-22 14:04", "12-7 9:36", "12-22 3:33"],
        2035: ["1-5 20:55", "1-20 14:13", "2-4 8:31", "2-19 4:15", "3-6 2:21", "3-21 3:02", "4-5 6:53", "4-20 13:48", "5-5 23:54", "5-21 12:43", "6-6 3:50", "6-21 20:32", "7-7 14:00", "7-23 7:28", "8-7 23:53", "8-23 14:43", "9-8 3:02", "9-23 12:38", "10-8 18:57", "10-23 22:15", "11-7 22:23", "11-22 20:02", "12-7 15:25", "12-22 9:30"],
        2036: ["1-6 2:43", "1-20 20:10", "2-4 14:19", "2-19 10:13", "3-5 8:11", "3-20 9:02", "4-4 12:45", "4-19 19:50", "5-5 5:48", "5-20 18:44", "6-5 9:46", "6-21 2:31", "7-6 19:57", "7-22 13:22", "8-7 5:48", "8-22 20:31", "9-7 8:54", "9-22 18:22", "10-8 0:48", "10-23 3:58", "11-7 4:14", "11-22 1:44", "12-6 21:15", "12-21 15:12"],
        2037: ["1-5 8:33", "1-20 1:53", "2-3 20:11", "2-18 15:58", "3-5 14:05", "3-20 14:49", "4-4 18:43", "4-20 1:39", "5-5 11:48", "5-21 0:34", "6-5 15:46", "6-21 8:21", "7-7 1:54", "7-22 19:12", "8-7 11:42", "8-23 2:21", "9-7 14:45", "9-23 0:12", "10-8 6:37", "10-23 9:49", "11-7 10:03", "11-22 7:37", "12-7 3:06", "12-21 21:07"],
        2038: ["1-5 14:26", "1-20 7:48", "2-4 2:03", "2-18 21:51", "3-5 19:55", "3-20 20:40", "4-5 0:28", "4-20 7:28", "5-5 17:30", "5-21 6:22", "6-5 21:25", "6-21 14:08", "7-7 7:32", "7-23 0:59", "8-7 17:20", "8-23 8:09", "9-7 20:25", "9-23 6:01", "10-8 12:21", "10-23 15:40", "11-7 15:50", "11-22 13:30", "12-7 8:55", "12-22 3:01"],
        2039: ["1-5 20:16", "1-20 13:43", "2-4 7:52", "2-19 3:45", "3-6 1:42", "3-21 2:31", "4-5 6:15", "4-20 13:17", "5-5 23:17", "5-21 12:10", "6-6 3:14", "6-21 19:56", "7-7 13:25", "7-23 6:47", "8-7 23:17", "8-23 13:58", "9-8 2:23", "9-23 11:49", "10-8 18:16", "10-23 21:24", "11-7 21:42", "11-22 19:11", "12-7 14:44", "12-22 8:40"],
        2040: ["1-6 2:03", "1-20 19:20", "2-4 13:39", "2-19 9:23", "3-5 7:30", "3-20 8:11", "4-4 12:04", "4-19 18:59", "5-5 5:08", "5-20 17:55", "6-5 9:07", "6-21 1:45", "7-6 19:18", "7-22 12:40", "8-7 5:09", "8-22 19:52", "9-7 8:13", "9-22 17:44", "10-8 0:04", "10-23 3:19", "11-7 3:28", "11-22 1:04", "12-6 20:29", "12-21 14:32"],
        2041: ["1-5 7:47", "1-20 1:12", "2-3 19:24", "2-18 15:16", "3-5 13:17", "3-20 14:06", "4-4 17:52", "4-20 0:54", "5-5 10:53", "5-20 23:48", "6-5 14:49", "6-21 7:35", "7-7 0:57", "7-22 18:26", "8-7 10:48", "8-23 1:35", "9-7 13:53", "9-22 23:25", "10-8 5:46", "10-23 9:01", "11-7 9:12", "11-22 6:48", "12-7 2:15", "12-21 20:17"],
        2042: ["1-5 13:34", "1-20 6:59", "2-4 1:12", "2-18 21:03", "3-5 19:05", "3-20 19:52", "4-4 23:40", "4-20 6:39", "5-5 16:42", "5-21 5:30", "6-5 20:37", "6-21 13:15", "7-7 6:46", "7-23 0:05", "8-7 16:38", "8-23 7:17", "9-7 19:44", "9-23 5:10", "10-8 11:39", "10-23 14:48", "11-7 15:07", "11-22 12:36", "12-7 8:08", "12-22 2:03"],
        2043: ["1-5 19:24", "1-20 12:40", "2-4 6:58", "2-19 2:41", "3-6 0:47", "3-21 1:27", "4-5 5:19", "4-20 12:13", "5-5 22:21", "5-21 11:08", "6-6 2:17", "6-21 18:57", "7-7 12:27", "7-23 5:52", "8-7 22:20", "8-23 13:09", "9-8 1:29", "9-23 11:06", "10-8 17:27", "10-23 20:46", "11-7 20:55", "11-22 18:34", "12-7 13:56", "12-22 8:00"],
        2044: ["1-6 1:11", "1-20 18:36", "2-4 12:43", "2-19 8:35", "3-5 6:30", "3-20 7:19", "4-4 11:02", "4-19 18:06", "5-5 4:04", "5-20 17:01", "6-5 8:03", "6-21 0:50", "7-6 18:15", "7-22 11:42", "8-7 4:07", "8-22 18:54", "9-7 7:15", "9-22 16:47", "10-7 23:12", "10-23 2:25", "11-7 2:41", "11-22 0:14", "12-6 19:44", "12-21 13:42"],
        2045: ["1-5 7:01", "1-20 0:21", "2-3 18:35", "2-18 14:21", "3-5 12:24", "3-20 13:06", "4-4 16:56", "4-19 23:52", "5-5 9:58", "5-20 22:45", "6-5 13:56", "6-21 6:33", "7-7 0:07", "7-22 17:26", "8-7 9:59", "8-23 0:38", "9-7 13:04", "9-22 22:32", "10-8 4:59", "10-23 8:11", "11-7 8:29", "11-22 6:03", "12-7 1:34", "12-21 19:34"],
        2046: ["1-5 12:55", "1-20 6:15", "2-4 0:30", "2-18 20:14", "3-5 18:17", "3-20 18:57", "4-4 22:44", "4-20 5:38", "5-5 15:40", "5-21 4:27", "6-5 19:31", "6-21 12:13", "7-7 5:39", "7-22 23:08", "8-7 15:32", "8-23 6:23", "9-7 18:42", "9-23 4:21", "10-8 10:41", "10-23 14:02", "11-7 14:13", "11-22 11:55", "12-7 7:20", "12-22 1:27"],
        2047: ["1-5 18:41", "1-20 12:09", "2-4 6:17", "2-19 2:09", "3-6 0:04", "3-21 0:52", "4-5 4:32", "4-20 11:31", "5-5 21:27", "5-21 10:19", "6-6 1:20", "6-21 18:02", "7-7 11:29", "7-23 4:54", "8-7 21:25", "8-23 12:10", "9-8 0:37", "9-23 10:07", "10-8 16:37", "10-23 19:47", "11-7 20:06", "11-22 17:37", "12-7 13:10", "12-22 7:06"],
        2048: ["1-6 0:28", "1-20 17:46", "2-4 12:03", "2-19 7:47", "3-5 5:53", "3-20 6:33", "4-4 10:24", "4-19 17:16", "5-5 3:23", "5-20 16:07", "6-5 7:17", "6-20 23:53", "7-6 17:26", "7-22 10:46", "8-7 3:18", "8-22 18:01", "9-7 6:27", "9-22 15:59", "10-7 22:26", "10-23 1:42", "11-7 1:56", "11-21 23:32", "12-6 19:00", "12-21 13:01"],
        2049: ["1-5 6:18", "1-19 23:40", "2-3 17:52", "2-18 13:41", "3-5 11:42", "3-20 12:27", "4-4 16:13", "4-19 23:12", "5-5 9:11", "5-20 22:03", "6-5 13:03", "6-21 5:46", "7-6 23:08", "7-22 16:35", "8-7 8:57", "8-22 23:46", "9-7 12:04", "9-22 21:41", "10-8 4:04", "10-23 7:24", "11-7 7:37", "11-22 5:18", "12-7 0:45", "12-21 18:51"],
        2050: ["1-5 12:07", "1-20 5:33", "2-3 23:43", "2-18 19:34", "3-5 17:31", "3-20 18:18", "4-4 22:02", "4-20 5:01", "5-5 15:01", "5-21 3:50", "6-5 18:54", "6-21 11:32", "7-7 5:01", "7-22 22:20", "8-7 14:51", "8-23 5:31", "9-7 17:59", "9-23 3:27", "10-8 9:59", "10-23 13:11", "11-7 13:32", "11-22 11:05", "12-7 6:41", "12-22 0:37"]
    };
    
    const TERM_NAMES = [
        "小寒", "大寒", "立春", "雨水", "驚蟄", "春分",
        "清明", "穀雨", "立夏", "小滿", "芒種", "夏至",
        "小暑", "大暑", "立秋", "處暑", "白露", "秋分",
        "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
    ];

    // ▼▼▼ 【修改】解析當前所屬節氣 (填滿每一天) ▼▼▼
    function getActiveTermForDay(year, month, day) {
        const termsForYear = PRECISE_TERM_DATA[year];
        if (!termsForYear) return ""; // 如果超過範圍，回傳空白

        const targetVal = month * 100 + day; // 將日期轉為數值方便比對，例如 4月5日 變成 405
        let activeTermIndex = -1;
        let activeTime = "";
        let isTransitionDay = false;

        for (let i = 0; i < termsForYear.length; i++) {
            const parts = termsForYear[i].split(' ');
            const datePart = parts[0]; 
            const timePart = parts[1]; 
            const [termMonth, termDay] = datePart.split('-');
            const termVal = parseInt(termMonth, 10) * 100 + parseInt(termDay, 10);
            
            // 只要節氣日期小於等於今天，就先暫存起來
            if (termVal <= targetVal) {
                activeTermIndex = i;
                activeTime = timePart;
                isTransitionDay = (termVal === targetVal); // 判斷是否剛好是交節當天
            } else {
                break; // 因為資料是按照時間排序的，超過今天就可以停止比對了
            }
        }

        // 處理年初例外狀況 (例如 1月1日到小寒交節前，仍屬於去年的「冬至」)
        if (activeTermIndex === -1) {
            activeTermIndex = 23; // 冬至的索引是 23
            isTransitionDay = false; 
        }

        const termName = TERM_NAMES[activeTermIndex];

        // 格式化輸出：交節當天顯示時間，平常日只顯示節氣名稱
        if (isTransitionDay) {
            return `${termName}<br><span class="term-time">${activeTime} 交節</span>`;
        } else {
            return termName;
        }
    }

    // ▼▼▼ 主程式：匯出表格 ▼▼▼
    function generateAndPrintLuckyTable(year, month) {
        // 1. 取得該月份的總天數
        const daysInMonth = new Date(year, month, 0).getDate();
        const results = [];
        
        // 2. 定義 12 個時辰對應的「標準整點」
        const STANDARD_HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]; 

        // 3. 跑迴圈：以「天」為單位
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
            let currentDayPillar = "";
            let currentDayGan = "";
            let currentDayBranch = "";
            let currentMonthBranch = ""; 
            let currentMonthBranchEnd = ""; 
            let currentYueJiang = "";
            let currentJianChu = { name: "", type: "" }; 
            let currentDayBureau = ""; // 🌟 【補上這行】：宣告用來存日局數的變數
            
            // 呼叫函式，取得當天的節氣狀態
            let currentTerm = getActiveTermForDay(year, month, day); 
            
            // 用來收集這一天各個吉格分別出現在哪些時辰(地支)
            const dailyPatterns = {
                '貴登天門': [],
                '罡塞鬼戶': [],
                '貴塞鬼戶': [],
                '天罡指巳': [],
                '德入天門(日德)': [], 
                '德入天門(支德)': []  
            };

            // 用來記錄當天 12 個時辰的時五福宮位
            const dailyWuFuPalaces = [];

            // 每天跑 12 個時辰測試
            for (let i = 0; i < 12; i++) {
                const hour = STANDARD_HOURS[i];
                
                // 產生農曆與干支資料
                const lunarDate = solarLunar.solar2lunar(year, month, day, hour);
                const dayPillar = lunarDate.getDayInGanZhi();
                const dayGan = dayPillar.charAt(0);
                const dayBranch = dayPillar.charAt(1);
                const hourPillar = lunarDate.getTimeInGanZhi();
                const hourBranch = hourPillar.charAt(1); 

                // 以子時的資料作為該日的代表干支
                if (i === 0) {
                    currentDayPillar = dayPillar;
                    currentDayGan = dayGan;
                    currentDayBranch = dayBranch;
                    currentMonthBranch = lunarDate.getMonthInGanZhi().charAt(1); 

                    // 另取當日 23:59 的月支：交節日（節氣時刻落在當天）前後月支會不同，
                    // 供天赦日判定涵蓋「半日天赦」的情形
                    const endOfDayLunar = solarLunar.solar2lunar(year, month, day, 23, 59);
                    currentMonthBranchEnd = endOfDayLunar.getMonthInGanZhi().charAt(1);
                    
                    // 計算今日的建除十二神
                    currentJianChu = calculateDailyJianChu(currentMonthBranch, currentDayBranch);

                    // 🌟 抓取今日的太乙日局數
                    const dayJishuData = calculateJishuAndBureau(new Date(year, month - 1, day, 0));
                    if (dayJishuData && dayJishuData.dayBureau) {
                        currentDayBureau = dayJishuData.dayBureau; // 成功取得 "陽53局"！
                    }
                }

                // 計算月將
                const yueJiangResult = calculateYueJiang(lunarDate, hourBranch);
                const yueJiangData = yueJiangResult.ringData;

                // 以子時的月將作為該日的代表月將
                if (i === 0) {
                    currentYueJiang = yueJiangResult.name; 
                }

                // 計算貴人
                const guiRenData = calculateGuiRen(currentDayGan, hourBranch, yueJiangData);

                // 呼叫吉格判斷函式
                const patterns = calculateLuckyPatterns(yueJiangData, guiRenData, currentDayGan, currentDayBranch);

                patterns.forEach(p => {
                    if (dailyPatterns[p]) {
                        dailyPatterns[p].push(hourBranch);
                    }
                });

                // 計算「時五福」
                const preciseDate = new Date(year, month - 1, day, hour);
                const jishuResult = calculateJishuAndBureau(preciseDate);
                
                if (jishuResult && jishuResult.hourJishu) {
                    const wuFuData = calculateWuFu(jishuResult.hourJishu, '時五福');
                    if (wuFuData && wuFuData.palace) {
                        dailyWuFuPalaces.push({
                            branch: hourBranch,
                            palace: wuFuData.palace
                        });
                    }
                }
            }

            // 處理「時五福」的顯示邏輯 (判斷是否換宮)
            let wuFuText = "";
            if (dailyWuFuPalaces.length > 0) {
                let currentPalace = dailyWuFuPalaces[0].palace;
                let isChanged = false;
                
                for (let i = 1; i < dailyWuFuPalaces.length; i++) {
                    if (dailyWuFuPalaces[i].palace !== currentPalace) {
                        const prevBranch = dailyWuFuPalaces[i-1].branch; 
                        const newBranch = dailyWuFuPalaces[i].branch;    
                        const newPalace = dailyWuFuPalaces[i].palace;
                        
                        wuFuText = `${currentPalace}<span class="subtitle">(${prevBranch}時結束)</span><br>${newPalace}<span class="subtitle">(${newBranch}時開始)</span>`;
                        isChanged = true;
                        break; 
                    }
                }
                
                if (!isChanged) {
                    wuFuText = currentPalace;
                }
            }

            // 【核心修改】傳入 currentJianChu.name 讓函式判斷是否為招財吉日
            const specialDayText = getSpecialDaysPattern(currentMonthBranch, currentDayPillar, currentJianChu.name, currentMonthBranchEnd);

            // 將這一天的結果存入陣列 
            results.push({
                dateStr: dateStr,
                dayPillar: currentDayPillar,
                term: currentTerm, 
                yueJiang: currentYueJiang, 
                jianChu: currentJianChu,
                dayBureau: currentDayBureau, // 🌟 【補上這行】：把剛算好的局數存進陣列裡，讓後面的 HTML 抓得到！
                shiWuFu: wuFuText, 
                guiDeng: dailyPatterns['貴登天門'].join('、'),
                gangSai: dailyPatterns['罡塞鬼戶'].join('、'),
                guiSai: dailyPatterns['貴塞鬼戶'].join('、'),
                tianGang: dailyPatterns['天罡指巳'].join('、'),
                deRuTianMenRi: dailyPatterns['德入天門(日德)'].join('、'),
                deRuTianMenZhi: dailyPatterns['德入天門(支德)'].join('、'),
                specialDay: specialDayText 
            });
        }

        // 4. 動態生成 HTML 內容以供列印
        let html = `
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
                <meta charset="UTF-8">
                <title>${year}年${month}月 吉時表</title>
                <style>
                    body { font-family: '微軟正黑體', 'PingFang TC', sans-serif; padding: 20px; color: #333; }
                    h1 { text-align: center; font-size: 24px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
                    th { background-color: #f2f2f2; font-weight: bold; white-space: nowrap; }
                    tbody tr:nth-child(even) { background-color: #fafafa; }
                    .pattern-text { color: #d32f2f; font-weight: bold; }
                    .term-text { color: #1565c0; font-weight: normal; }
                    .special-text { color: #1565c0; font-weight: bold; }
                    .term-time { font-size: 12px; font-weight: normal; color: #555; display: block; margin-top: 3px; }
                    .subtitle { font-size: 12px; font-weight: normal; color: #666; display: inline-block; margin-left: 2px; }
                    
                    .jianchu-good { color: #2e7d32; font-weight: bold; }  
                    .jianchu-bad { color: #d32f2f; font-weight: bold; }   
                    .jianchu-neutral { color: #ed6c02; font-weight: bold; } 
                    .term-highlight { background-color: #fff9c4 !important; }

                    .pattern-text { color: #333333ff; font-weight: 500; }
                    
                    @media print {
                        .term-highlight { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        body { padding: 0; }
                        button { display: none; }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                    }
                </style>
            </head>
            <body>
                <h1>
                    ${year}年${month}月 吉時表
                    <span style="font-size: 16px; font-weight: normal; color: #666;">（小六太乙提供）</span>
                </h1>
                <div style="text-align: left; font-size: 14px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px;">
                <span style="background-color: #fff9c4; color: #333; padding: 3px 8px; border-radius: 4px; margin-right: 20px;">黃底 / 節氣轉換日</span>    
                <span style="color: #d32f2f; margin-right: 20px;">紅字 / 諸事不宜</span>
                <span style="color: #2e7d32;">綠字 / 五星吉日吉時</span>
                </div>
                <table>
                    <thead>
    <tr style="background-color: #e0e0e0ff; font-size: 15px;">
        <th colspan="3">基礎曆法</th>
        <th colspan="2">值日神煞</th> 
        <th colspan="2">太乙資訊</th>
        <th colspan="6">特殊吉時</th>
        <th colspan="1">綜合</th>
    </tr>
    <tr>
        <th>日期</th>
        <th>日柱干支</th>
        <th>節氣</th>
        <th>月將</th>
        <th>建除十二神</th>
        <th>日局數</th> 
        <th>時五福</th>
        <th>貴登天門</th>
        <th>罡塞鬼戶</th>
        <th>貴塞鬼戶</th>
        <th>天罡指巳</th>
        <th>德入天門<br><span class="subtitle">(日德)</span></th>
        <th>德入天門<br><span class="subtitle">(支德)</span></th>
        <th>特殊日</th>
    </tr>
                     </thead>
                    <tbody>
        `;

        // 產生表格的資料列
        results.forEach(r => {
            const highlightClass = r.term.includes('<br>') ? 'term-highlight' : '';

            // 🌟 核心功能：計算當天「特殊吉時」中，各時辰的重複次數
            const branchCounts = {};
            const patterns = [r.guiDeng, r.gangSai, r.guiSai, r.tianGang, r.deRuTianMenRi, r.deRuTianMenZhi];
            
            // 跑迴圈統計：把有字串的地方用 '、' 拆開來計算
            patterns.forEach(p => {
                if (p) {
                    p.split('、').forEach(branch => {
                        branchCounts[branch] = (branchCounts[branch] || 0) + 1;
                    });
                }
            });

            // 🌟 格式化工具：負責輸出文字。如果重複 >= 2 次，就給它綠色加粗標籤！
            const formatPattern = (p) => {
                if (!p) return '<span style="color:#ddd;">-</span>';
                return p.split('、').map(branch => {
                    if (branchCounts[branch] >= 2) {
                        return `<span style="color: #2d9332ff; font-weight: bold;">${branch}</span>`; // 紅色加粗
                    }
                    return branch; // 沒重複就維持預設（CSS控制的褐色）
                }).join('、');
            };

            html += `
                <tr class="${highlightClass}">
                    <td>${r.dateStr}</td>
                    <td>${r.dayPillar}</td>
                    <td class="term-text">${r.term}</td>
                    <td>${r.yueJiang}</td>
                    <td class="jianchu-${r.jianChu.type}">${r.jianChu.name}</td>
                    <td style="color: #555;">${r.dayBureau}</td>
                    <td>${r.shiWuFu}</td>
                    
                    <td class="pattern-text">${formatPattern(r.guiDeng)}</td>
                    <td class="pattern-text">${formatPattern(r.gangSai)}</td>
                    <td class="pattern-text">${formatPattern(r.guiSai)}</td>
                    <td class="pattern-text">${formatPattern(r.tianGang)}</td>
                    <td class="pattern-text">${formatPattern(r.deRuTianMenRi)}</td>
                    <td class="pattern-text">${formatPattern(r.deRuTianMenZhi)}</td>
                    
                    <td class="special-text">${r.specialDay || '<span style="color:#ddd;">-</span>'}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    }
                </script>
            </body>
            </html>
        `;

        // 5. 開啟新視窗並寫入 HTML
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    }

    populateDateSelectors();
    populateTimezoneSelector();
    prefillTestData();
    setTimeout(() => {
        calculateBtn.click();
        setTimeout(() => { applyPlateFontForPdfExport(); }, 120);
    }, 10);
});