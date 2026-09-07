/* 時五福規則與夏冬至基準資料：移植自 taiyi/taiyi-national/tn_script.js。
 * 保留原日積數、立春校正、夜子時換日、時積數及五福推算法。
 * 移除原偵錯訊息；僅公開時五福查詢入口。
 */
(function(root){
  'use strict';
  const solarLunar = root.solarLunar;
  const EARTHLY_BRANCHES = solarLunar.zhi;
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
const JIAZI_CYCLE_ORDER = [
    '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
    '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
    '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
    '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
    '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
    '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
    ];
const WU_FU_ORDER = ['乾', '艮', '巽', '坤', '中'];
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
  function compute(date) {
    const values=calculateJishuAndBureau(date);
    if (!values) throw new Error('缺少太乙基準資料，無法計算時五福。');
    const result=calculateWuFu(values.hourJishu,'時五福');
    if (!result) throw new Error('時五福落宮計算失敗。');
    return {...result,slot:Number(result.text.replace('時五福','')),hourJishu:values.hourJishu};
  }
  root.qimenWuFu = {compute};
})(typeof window !== 'undefined' ? window : globalThis);
