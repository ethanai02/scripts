// ==UserScript==
// @name         色花堂 98堂 强化脚本
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  加强论坛功能
// @license      MIT
// @author       98_ethan
// @match        *://*.sehuatang.net/*
// @match        *://*.sehuatang.org/*
// @match        *://*.sehuatang.*/*
// @match        *://*.jq2t4.com/*
// @match        *://*.0krgb.com/*
// @match        *://*.xxjsnc.co/*
// @match        *://*.o4vag.com/*
// @match        *://*.weterytrtrr.*/*
// @match        *://*.qweqwtret.*/*
// @match        *://*.retreytryuyt.*/*
// @match        *://*.qwerwrrt.*/*
// @match        *://*.ds5hk.app/*
// @match        *://*.30fjp.com/*
// @match        *://*.18stm.cn/*
// @match        *://*.xo6c5.com/*
// @match        *://*.mzjvl.com/*
// @match        *://*.9xr2.app/*
// @match        *://*.kzs1w.com/*
// @match        *://*.nwurc.com/*
// @match        *://*.zbkz6.app/*
// @match        *://*.ql75t.cn/*
// @match        *://*.0uzb0.app/*
// @match        *://*.d2wpb.com/*
// @match        *://*.5aylp.com/*
// @match        *://*.8otvk.app/*
// @match        *://*.05kx.cc/*
// @match        *://*.1yxg2.com/*
// @match        *://*.6r5gy.co/*
// @match        *://*.mmpbg.co/*
// @match        *://*.kofqo.com/*
// @match        *://*.kofqo.net/*
// @match        *://*.9zi2n.com/*
// @match        *://*.pky0s.com/*
// @match        *://*.r88d8.com/*
// @match        *://*.z0gfi.com/*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.addStyle
// @grant        GM.openInTab
// @grant        GM.registerMenuCommand
// @grant        GM.notification
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM.registerMenuCommand
// @grant        GM_notification
// @icon         data:image/gif;base64,UklGRgABAABXRUJQVlA4WAoAAAAQAAAADwAADwAAQUxQSKYAAAANgJtt27Hn+v3HtitbrY0BnMrJBJnAWCCt2dk2Ktu2zTcrRMQEgMRWa/XZLCH8bqTqGCAqS3F5ZPmClmdXH6CRDn42AFpJdZfwIeFvn5sVUMsF9gHcHgX0jLdfgpMRtCq+KStAVGIZERAgBATy3+cNB7HX1pZ42V/P68vN2gXPeYZ/zOer4bhy1tEmTfWjn58vA6NXZkkm70fD578A1xVT1uoFLX4CVlA4IDQAAABQAQCdASoQABAAB0CWJbAABe9AAP7msGXYtkQ9eTZz0OaTWMpBhwn6oJ35ZoLVEQcVAAAA
// @downloadURL https://update.sleazyfork.org/scripts/503560/%E8%89%B2%E8%8A%B1%E5%A0%82%2098%E5%A0%82%20%E5%BC%BA%E5%8C%96%E8%84%9A%E6%9C%AC.user.js
// @updateURL https://update.sleazyfork.org/scripts/503560/%E8%89%B2%E8%8A%B1%E5%A0%82%2098%E5%A0%82%20%E5%BC%BA%E5%8C%96%E8%84%9A%E6%9C%AC.meta.js
// ==/UserScript==

const VERSION_MAJOR = 0.1;
const VERSION_TEXT = '0.1.1';

function initGM() {
    let gmExists = false;
    try {
        if (typeof GM.getValue == 'function') {
            gmExists = true;
        }
    } catch (ignore) { }

    if (gmExists) {
        return {
            getValue: GM.getValue,
            setValue: GM.setValue,
            deleteValue: GM.deleteValue,
            listValues: GM.listValues,
            addStyle: GM.addStyle,
            openInTab: GM.openInTab,
            registerMenuCommand: GM.registerMenuCommand,
            notification: GM.notification,
        };
    } else {
        return {
            getValue: GM_getValue,
            setValue: GM_setValue,
            deleteValue: GM_deleteValue,
            listValues: GM_listValues,
            addStyle: GM_addStyle,
            openInTab: GM_openInTab,
            registerMenuCommand: GM_registerMenuCommand,
            notification: GM_notification,
        };
    }
}

const MAIN_CONFIG_KEY = '98_main_config';

const DEFAULT_MAIN_CONFIG = {
    initFavorRecords: true,
    migrateFrom0d0d13: true,
    openIntroAfterUpdate: true,
    enableQuickBtn: true,
    quickBtnPosition: 'right', // left, right
    enableSortByDateline: false,
}

const LOAD_TIME_LIMIT = 3000;

const SEARCH_CONFIG_KEY = '98_search_config';
const DEFAULT_SEARCH_CONFIG = {};

const FAVOR_THREADS_CACHE_CONFIG_KEY = '98_favor_threads';
const DEFAULT_FAVOR_THREADS_CACHE_CONFIG = { time: 0, data: {} }; // [tid]: [favid]

const RATED_THREADS_CACHE_CONFIG_KEY = '98_rated_threads';
const DEFAULT_RATED_THREADS_CACHE_CONFIG = { time: 0, data: {} }; // [tid]: boolean

const USERS_CONFIG_CACHE_KEY = '98_users_config';
const DEFAULT_USERS_CONFIG_CACHE = {}; // { [uid]: { username: string, subscribed?: boolean, favored?: boolean, blocked?: boolean } }

const SEARCH_HIDDEN_SECTIONS = '98_search_hidden_sections';
const DEFAULT_SEARCH_HIDDEN_SECTIONS_CONFIG = {}; // { [sid]: boolean }

function initConfigAccess(myUserId, configKey, defaultValue) {
    return {
        async read() {
            return readMainConfig(myUserId, configKey, defaultValue);
        },
        async write(newValue) {
            await GM.setValue(configKey + '#' + myUserId, JSON.stringify(newValue));
        },
        async update(updater) {
            return updateMainConfig(myUserId, updater, configKey, defaultValue);
        }
    };
}

async function readMainConfig(myUserId, configKey, defaultValue) {
    try {
        let savedData = await GM.getValue(configKey + '#' + myUserId);
        return Object.assign({}, defaultValue, JSON.parse(savedData));
    } catch (e) { }
    return Object.assign({}, defaultValue);
}

async function updateMainConfig(myUserId, updater, configKey, defaultValue) {
    let oldConfig = await readMainConfig(myUserId, configKey, defaultValue);
    let newConfig = await updater(oldConfig);
    if (newConfig != null) {
        await GM.setValue(configKey + '#' + myUserId, JSON.stringify(newConfig));
    }
    return newConfig;
}

function readFavorThreadsList(doc) {
    const items = {};
    doc.querySelectorAll('ul#favorite_ul li[id^="fav_"]').forEach(a => {
        const source = a.querySelector('input[name="favorite[]"]');
        const favid = source.value * 1;
        const tid = source.getAttribute('vid') * 1;
        items[tid] = favid;
    });
    return items;
}

/**
 * 初始化收藏数据
 * @param {*} favorThreadsCacheAccess 
 * @param {*} fresh 
 * @param {*} callback 仅在 fresh 为 true 时可用
 * @returns { [tid]: favid }}
 */
async function readFavorRecords(favorThreadsCacheAccess, fresh, callback) {
    let userId = findMyUserId();

    let isLoading = false;
    const loadNextPage = async (doc) => {
        let cached = await favorThreadsCacheAccess.read();
        const favors = readFavorThreadsList(doc);
        const data = { ...cached.data, ...favors }
        await favorThreadsCacheAccess.write({ data, time: Date.now() });

        if (isLoading) return;
        const nextPageLink = doc.querySelector('.pg a.nxt');

        if (!nextPageLink) {
            await callback();
            return data;
        };
        isLoading = true;

        await fetchGetPage(nextPageLink.href)
            .then(async doc => {
                setTimeout(() => loadNextPage(doc), 1000)
            })
            .finally(() => isLoading = false)

        return data
    }

    if (fresh) {
        await favorThreadsCacheAccess.write(DEFAULT_FAVOR_THREADS_CACHE_CONFIG);
        const doc = await fetchGetPage(`home.php?mod=space&uid=${userId}&do=favorite&type=all`);
        const favors = await loadNextPage(doc);
        return favors;
    } else {
        let cached = await favorThreadsCacheAccess.read();
        return cached.data;
    }
}

async function readRatedRecords(ratedThreadsCacheAccess) {
    let cached = await ratedThreadsCacheAccess.read();
    return cached.data;
}

const createLoadingIndicator = (message) => {
    const indicator = document.createElement('div');
    indicator.className = 'ese-loading-indicator';
    indicator.textContent = message;
    return indicator;
};

function findMyUserId() {
    const userIdSource = [
        ['#um .vwmy > a', /uid=(\d+)/, 'href'], // 论坛内
        ['head script:not([src]):not([id])', /discuz_uid\ =\ \'(\d+)\'/, 'textContent'] // 搜索页
    ]
    for (let [selector, reg, key] of userIdSource) {
        const userWrap = document.querySelector(selector);
        if (userWrap != null) {
            const userMatch = userWrap[key]?.match(reg);
            if (userMatch != null) return userMatch[1] * 1;
        }
    }
    return -1; // 未登录情况下，后续添加账号迁移功能
}

(async function () {
    'use strict';
    const GM = initGM();

    const INTRO_POST = document.location.origin + '/forum.php?mod=viewthread&tid=2251912';
    const UPDATE_NOTE = document.location.origin + '/forum.php?mod=redirect&goto=findpost&ptid=2251912&pid=26908095';
    const CONFIG_PAGE = document.location.origin + '/home.php?mod=spacecp&ac=enhancer';

    GM.registerMenuCommand('打开功能简介帖', () => GM.openInTab(INTRO_POST, false));
    GM.registerMenuCommand('查看更新说明', () => GM.openInTab(UPDATE_NOTE, false));
    GM.registerMenuCommand('打开插件设置页', () => GM.openInTab(CONFIG_PAGE, false));

    GM.addStyle(`
.ese-quick-button-container {
    position: fixed;
    left: calc(50vw + 510px);
    top: 205px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    font-size: 1.1em;
    margin-top: 0;
    padding: 0.2em;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    background: rgba(254, 242, 232, 0.95);
}
.ese-quick-button-container.ese-quick-button-container-left {
    left: unset;
    right: calc(50vw + 510px);
}
.ese-quick-button {
    margin: 5px;
    border: none;
    cursor: pointer;
    color: #787878;
    font-weight: bold;
    font-family: monospace;
    margin-right: 0.3em;
    min-width: 6em;
    display: inline-block;
    background: none;
}
.ese-quick-button:hover { text-decoration: underline; }
.ese-favorite-button, .ese-block-button {
    border: 1px solid;
    cursor: pointer;
}
.ese-favorite-button {
    background: #FEAE10;
}
.ese-quick-button.ese-active {
    background-color: #ffffe9;
    outline: 3px solid lightgray;
    color: #565656;
}
.ese-quick-button.ese-active:hover {
    outline: 3px solid #777;
}
.ese-quick-button.ese-active:after {
    content: '✔';
    position: relative;
    left: 4px;
    overflow: hidden;
    color: goldenrod;
}

/* ========== search page ========== */
.ese-filter-container {
    position: fixed;
    left: calc(50vw + 200px);
    top: 105px;
    display: flex;
    flex-direction: column;
    z-index: 9999;
    width: 140px;
    padding: 0 2px;
    max-height: 750px;
    overflow-y: scroll;
    overflow-x: hidden;
    scrollbar-width: none;
}
.ese-filter-button {
    color: #333;
    border: none;
    padding: 1px 2px;
    box-shadow: 2px 2px 1px 0 #0009;
    white-space: pre;
    font-size: 14px;
    line-height: 18px;
    margin: 8px 0;
    cursor: pointer;
    outline: 2px solid lightblue;
    font-weight: bold;
    background: #EEEE;
    position: relative;
    padding-left: 32px;
}
.ese-filter-button.ese-hidden {
    color: #CCC;
    background: #999C;
    text-decoration: line-through;
    outline-color: #999;
}
.ese-filter-button:hover {
    outline-color: deepskyblue;
}
.ese-filter-button-count {
    color: royalblue;
    padding-right: 10px;
    position: absolute;
    left: 4px;
}
.ese-filter-button.ese-hidden .ese-filter-button-count {
    color: #CCC;
}
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
.ese-fade-in {
    opacity: 0;
    animation: fadeIn 1s forwards;
}
.ese-loading-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 12px 18px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 8px;
}
.ese-loading-indicator::before {
    content: '';
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 3px solid #fff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media only screen and (max-width: 1280px) {
    .ese-quick-button-container, .ese-filter-container {
        left: unset;
        right: 9px;
        max-height: 550px;
    }
    .ese-quick-button-container.ese-quick-button-container-left {
        right: unset;
        left: 90px;
    }
}

/* ====== config ====== */
.ese-intro-link {
    margin-left: 7px;
    color: cornflowerblue;
    font-weight: bold;
}
.ese-config-panel-container {
    margin: 8px;
}
.ese-dialog-modal-mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #FFF8;
    z-index: 100;
}
.ese-config-panel.ese-config-saving {
    cursor: wait;
}
.ese-config-panel.ese-config-saving .ese-config-list {
    opacity: 0.5;
    pointer-events: none;
}
.ese-config-list {
    margin: 0 5px;
}
.ese-config-list > dt {
    margin-top: 5px;
}
.ese-config-list > dt > a {
    margin-left: 3px;
    color: #0060df;
    cursor: pointer;
}
.ese-config-list > dt > a:hover {
    text-decoration: underline;
}
.ese-config-item-sep {
    margin-top: 0.5em;
    padding-top: 0.5em;
    border-top: 1px dotted #AAA;
}
.ese-config-item-tip {
    color: #105884;
    padding-left: 4px;
}
.ese-config-item-lv1 > span {
    margin-left: 3px;
}
.ese-config-item-lv2 {
    margin-left: 20px;
}
.ese-config-item-lv3 {
    margin-left: 40px;
}
.ese-config-item-lv1:not(.ese-config-item-checked) + .ese-config-item-lv2:not(.ese-config-item-tip),
.ese-config-item-lv1:not(.ese-config-item-checked) + .ese-config-item-lv2 + .ese-config-item-lv2:not(.ese-config-item-tip),
.ese-config-item-lv1:not(.ese-config-item-checked) + .ese-config-item-lv2 + .ese-config-item-lv2 + .ese-config-item-lv2:not(.ese-config-item-tip) {
    opacity: 0.2;
    pointer-events: none;
}
.ese-config-item-lv2:not(.ese-config-item-checked) + .ese-config-item-lv3:not(.ese-config-item-tip),
.ese-config-item-lv2:not(.ese-config-item-checked) + .ese-config-item-lv3 + .ese-config-item-lv3:not(.ese-config-item-tip),
.ese-config-item-lv2:not(.ese-config-item-checked) + .ese-config-item-lv3 + .ese-config-item-lv3 + .ese-config-item-lv3:not(.ese-config-item-tip) {
    opacity: 0.2;
    pointer-events: none;
}
.ese-user-map-icon {
    margin-left: 5px;
    cursor: pointer;
}
.ese-user-map-icon.ese-config-saving {
    opacity: 0.5;
    pointer-events: none;
}

.ese-user-map-icon::after {
    content: "➕收藏";
    font-weight: normal;
    font-size: 12px;
}
.ese-user-map-icon.ese-user-mapped::after {
    content: "🔖 " attr(ese-nickname);
    font-weight: normal;
    font-size: 12px;
    color: #c30a0a;
}
.ese-user-tag {
    margin-right: 6px;
    white-space: nowrap;
    min-width: 9em;
    display: inline-block;
    max-width: 9em;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ese-user-tag-icon::before {
    content: "🔖 ";
    font-size: 14px;
    display: inline-block;
    cursor: pointer;
}
.ese-user-blacklist .ese-user-tag-icon::before {
    content: "🚫 ";
}
    `)

    const myUserId = findMyUserId();
    const mainConfigAccess = initConfigAccess(myUserId, MAIN_CONFIG_KEY, DEFAULT_MAIN_CONFIG);
    const favorThreadsCacheAccess = initConfigAccess(myUserId, FAVOR_THREADS_CACHE_CONFIG_KEY, DEFAULT_FAVOR_THREADS_CACHE_CONFIG);
    const ratedThreadsCacheAccess = initConfigAccess(myUserId, RATED_THREADS_CACHE_CONFIG_KEY, DEFAULT_RATED_THREADS_CACHE_CONFIG);
    const usersConfigCacheAccess = initConfigAccess(myUserId, USERS_CONFIG_CACHE_KEY, DEFAULT_USERS_CONFIG_CACHE);
    const searchHiddenSectionsAccess = initConfigAccess(myUserId, SEARCH_HIDDEN_SECTIONS, DEFAULT_SEARCH_HIDDEN_SECTIONS_CONFIG);

    let mainConfig = await mainConfigAccess.read();

    if (mainConfig.migrateFrom0d0d13) {
        // 迁移 0.0.13 数据。将在 2025年3月移除。
        const favoriteUsers = await GM.getValue('favoriteUsers', {});
        const blockedUsers = await GM.getValue('blockedUsers', {});
        const hiddenSections = await GM.getValue('hiddenSections', {});

        const userConfig = {};
        Object.keys(blockedUsers).forEach(item => userConfig[item] = { username: item, blocked: true })
        Object.keys(favoriteUsers).forEach(item => userConfig[item] = { username: item, favored: true })
        await usersConfigCacheAccess.update(data => ({ ...data, ...userConfig }))

        await searchHiddenSectionsAccess.update(data => ({ ...data, ...hiddenSections }))

        await GM.deleteValue('favoriteUsers');
        await GM.deleteValue('blockedUsers');
        await GM.deleteValue('hiddenSections');

        await mainConfigAccess.update(async function (mainCfg) {
            mainCfg.migrateFrom0d0d13 = false;
            return mainCfg
        })
    }

    if (mainConfig.openIntroAfterUpdate) {
        const lastVersion = await GM.getValue('last_version') * 1||0;
        if (VERSION_MAJOR > lastVersion) {
            await GM.setValue('last_version', String(VERSION_MAJOR));
            GM.notification({
                title: `色花堂强化脚本 已更新 ver.${VERSION_MAJOR}`,
                text: "请参阅功能简介帖"
            });
            if (confirm(`色花堂强化脚本 已更新 ${VERSION_MAJOR}，打开功能简介帖？(新页面)`)) {
                GM.openInTab(UPDATE_NOTE, false);
            }
        }
    }

    const getUserConfig = async (userId, username, store) => {
        const userConfigStore = typeof store === 'object' ? store : await usersConfigCacheAccess.read();
        let userConfig = userConfigStore[userId];
        // 迁移 0.0.13 数据。将在 2025年3月移除。
        if (typeof username === 'string') {
            const legacyUserConfig = userConfigStore[username];
            if (!userConfig && legacyUserConfig) {
                await usersConfigCacheAccess.update(async data => {
                    data[userId] = data[username]
                    delete data[username];
                    return data;
                })
                userConfig = legacyUserConfig;
            }
        }
        return userConfig;
    }

    /**
     * quick jump to important contents
     */
    const elementsToCheck = [
        { // 一键收藏、 取消收藏
            selector: '#k_favorite', text: '⭐️ 收藏',
            init: (btn) => {
                btn.loading = false;
                readFavorRecords(favorThreadsCacheAccess)
                    .then(data => {
                        const favid = data && Object_hasOwn(data, tid) ? data[tid] : null;
                        btn.dataset.favid = favid;
                        if (favid) btn.classList.add('ese-active');
                    });
            },
            onClick: async (element, tid, btn) => {
                let favid = btn.dataset.favid * 1;

                if (btn.loading) return

                showNativeSpinner();
                btn.loading = true;

                if (favid) {
                    let data = await readFavorRecords(favorThreadsCacheAccess);
                    const postData = new FormData();
                    postData.set('formhash', getVerifyHash());
                    postData.set('handlekey', `a_delete_${favid}`);
                    postData.set('deletesubmit', true);
                    await fetch(`home.php?mod=spacecp&ac=favorite&op=delete&favid=${favid}&type=all&inajax=1`, { method: 'POST', body: postData })
                        .then(async () => {
                            btn.dataset.favid = 0;
                            btn.classList.remove('ese-active');
                            delete data[tid];
                            await favorThreadsCacheAccess.write({ data, time: Date.now() });
                            showNativeInfoPopup('删除收藏成功')
                        })
                        .catch(ex => {
                            showNativeWarningPopup('操作出错');
                        })
                        .finally(() => {
                            closeNativeSpinner()
                            btn.loading = false;
                        });
                } else {
                    fetchGetPage(`home.php?mod=spacecp&ac=favorite&type=thread&id=${tid}&formhash=${getVerifyHash()}&infloat=yes&handlekey=k_favorite&inajax=1&ajaxtarget=fwin_content_k_favorite`, "text/xml")
                        .then(async doc => {
                            const scriptContent = doc.querySelector('root').textContent;
                            const FAV_SUCCESS_TEXT = '信息收藏成功'
                            const FAV_ALREADY_EXIST_TEXT = '抱歉，您已收藏，请勿重复收藏'
                            if (scriptContent.includes(FAV_ALREADY_EXIST_TEXT)) {
                                await mainConfigAccess.update(async function (updateUserConfig) {
                                    updateUserConfig.initFavorRecords = true;
                                    return updateUserConfig
                                })
                                throw Error("收藏信息过期，请刷新页面更新数据")
                            }
                            if (scriptContent.includes(FAV_SUCCESS_TEXT)) {
                                const match = scriptContent.match(/'id':'(\d+)'[^]*'favid':'(\d+)'/);
                                if (match) {
                                    showNativeInfoPopup(FAV_SUCCESS_TEXT)
                                    const tid = match[1] * 1;
                                    const favid = match[2] * 1;
                                    await favorThreadsCacheAccess.update(cache => {
                                        if (cache && cache.data) {
                                            cache.data[tid] = favid;
                                            return cache;
                                        }
                                    });

                                    btn.dataset.favid = favid;
                                    btn.classList.add('ese-active');
                                }
                            }
                        })
                        .catch(msg => {
                            showNativeWarningPopup(msg);
                        })
                        .finally(() => {
                            closeNativeSpinner()
                            btn.loading = false;
                        });
                }
            }
        },
        { // 快捷评分
            selector: '#ak_rate', text: '👍 评分',
            init: (btn) => {
                readRatedRecords(ratedThreadsCacheAccess)
                    .then(data => {
                        const rated = data && Object_hasOwn(data, tid) ? data[tid] : null;
                        btn.dataset.rated = rated;
                        if (rated) btn.classList.add('ese-active');
                    });

            },
            onClick: (element, tid) => {
                element.click();
                observeRateForm();
                observeRateLoadingElement(async () => {
                    await ratedThreadsCacheAccess.update(cache => {
                        if (cache && cache.data) {
                            cache.data[tid] = true;
                            return cache;
                        }
                    });
                });
            }
        },
        { selector: '.locked a[href*="action=pay"', text: '💰 购买', onClick: (element) => element.click() },
        { selector: '.locked a[href*="action=reply"]', text: '🔒 回复', onClick: (element) => element.click() }, // 回复解锁
        { selector: '.blockcode', text: '🧲 链接' },
    ];

    const createButton = ({ text, onClick, title, ariaLabel }) => {
        const button = document.createElement('button');
        button.innerText = text;
        button.className = 'ese-quick-button';
        button.title = title;
        button.setAttribute('aria-label', ariaLabel);
        if (onClick) button.addEventListener('click', onClick);
        return button;
    };

    const scrollToElement = (element) => {
        const observer = new MutationObserver((mutations, obs) => {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                obs.disconnect();
            }, 800);
        });

        observer.observe(document.body, { childList: true, subtree: true });

        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.className = mainConfig.quickBtnPosition === 'left' ? 'ese-quick-button-container ese-quick-button-container-left' : 'ese-quick-button-container'

    const updateButtonStates = () => {
        if (mainConfig.enableQuickBtn === false) return;
        buttonContainer.innerHTML = ''; // 清空现有按钮，防止重复添加

        const url = new URL(window.location);
        const tid = url.searchParams.get('tid')

        elementsToCheck.forEach(({ selector, text, onClick, init }) => {
            const element = document.querySelector(selector);
            if (element) {
                const quickBtn = createButton({ text, title: element.textContent.trim(), ariaLabel: element.textContent.trim() });

                quickBtn.addEventListener('click', () => {
                    if (typeof onClick === 'function') {
                        onClick(element, tid, quickBtn)
                    } else {
                        scrollToElement(element);
                    }
                })

                if (typeof init === 'function') {
                    init(quickBtn)
                }

                buttonContainer.appendChild(quickBtn);
            }
        });

        // 更新附件按钮
        const updateAttachmentButtons = () => {
            const createAndAppendButton = (element) => {
                const button = createButton({
                    text: '📎 附件',
                    title: element.textContent.trim(),
                    ariaLabel: element.textContent.trim(),
                    onClick: () => scrollToElement(element)
                });
                buttonContainer.appendChild(button);
            };

            // 更新常规附件按钮
            document.querySelectorAll('span[id^="attach_"]').forEach(createAndAppendButton);

            // 更新免费附件按钮
            document.querySelectorAll('dl.tattl .tip').forEach(tipElement => {
                if (tipElement.textContent.includes('点击文件名下载附件')) {
                    createAndAppendButton(tipElement.closest('dl.tattl'));
                }
            });
        };

        updateAttachmentButtons();
    };

    if (mainConfig.initFavorRecords) {
        await readFavorRecords(favorThreadsCacheAccess, true, async () => {
            await mainConfigAccess.update(async function (updateUserConfig) {
                updateUserConfig.initFavorRecords = false;
                return updateUserConfig
            })
            updateButtonStates()
        })
    }

    const observeRateLoadingElement = async (callback) => {
        let loadingElementVisible = false;

        const loadingObserver = new MutationObserver(async (mutations, observer) => {
            const loadingElement = document.querySelector('div[id^="post_"] img[src*="loading.gif"]');

            if (loadingElement && !loadingElementVisible) {
                loadingElementVisible = true;
            }

            if (!loadingElement && loadingElementVisible) {
                loadingElementVisible = false;
                if (typeof callback === 'function') await callback()
                updateButtonStates();
                loadingObserver.disconnect();
            }
        });

        loadingObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    };

    const observeRateForm = () => {
        const rateObserver = new MutationObserver((mutations, obs) => {
            const rateForm = document.querySelector('#rateform');
            if (rateForm) {
                const scoreElement = document.querySelector('#scoreoption8 li:first-child');
                if (scoreElement) {
                    const scoreValue = scoreElement.textContent.trim();
                    document.querySelector('#score8').value = scoreValue;
                }
                obs.disconnect(); // 停止观察表单
            }
        });

        rateObserver.observe(document.body, { childList: true, subtree: true });
    };

    // 初次更新按钮状态
    updateButtonStates();

    if (buttonContainer.children.length > 0) {
        document.body.appendChild(buttonContainer);
    }

    /**
     * Highlighting favorite users and today's new posts
     */
    const currentUrl = window.location.href;
    const isUserProfilePage = /mod=space&uid=\d+|space-uid-\d+/.test(currentUrl);
    const isPostListPage = /fid=\d+/.test(currentUrl) || /forum-(\d+)-\d+\.html/.test(currentUrl);
    const isFavoriteListPage = /&do=favorite.*/.test(currentUrl);

    if (isFavoriteListPage) {
        const observeRateForm = () => {
            const rateObserver = new MutationObserver((mutations, obs) => {
                const confirmDelForm = document.querySelector('form[id^="favoriteform_"]');
                if (confirmDelForm) {
                    confirmDelForm.addEventListener('submit', () => {
                        favorThreadsCacheAccess.update(cache => {
                            let favId = confirmDelForm.id.match(/favoriteform_(\d+)/)
                            if (favId) {
                                favId = favId[1]
                                Object.entries(cache.data).forEach(([key, value]) => {
                                    if (Number(favId) === value) delete cache.data[key]
                                })
                            }
                            return cache
                        })
                    })
                }

                const confirmBatchDelForm = document.querySelector("#delform")
                if (confirmBatchDelForm) {
                    confirmBatchDelForm.addEventListener('submit', () => {
                        favorThreadsCacheAccess.update(cache => {
                            const favIds = []
                            confirmBatchDelForm.querySelectorAll("li input").forEach(o => { if (o.checked) favIds.push(o.getAttribute('vid')) })
                            favIds.forEach(id => delete cache.data[id])
                            return cache
                        })
                    })
                }
            });
    
            rateObserver.observe(document.body, { childList: true, subtree: true });
        };

        observeRateForm();
    }

    if (isUserProfilePage) {
        const userProfileElement = document.querySelector('#uhd .mt');
        const userId = extractUidFromURL(currentUrl)

        if (userProfileElement) {
            const username = userProfileElement.textContent.trim();

            function createUpdateUserButton(value, cls, textA, textB) {
                const btn = document.createElement('button');
                btn.innerText = value ? textA : textB;
                btn.className = `ese-quick-button ${cls}`;
                btn.style.marginLeft = '10px';
                btn.toggle = (value) => {
                    btn.innerText = value ? textA : textB;
                }
                return btn
            }

            const userConfig = await getUserConfig(userId, username);
            const favorBtn = createUpdateUserButton(userConfig?.favored, 'ese-favorite-button', '取消收藏', '收藏用户');
            const blockedBtn = createUpdateUserButton(userConfig?.blocked, 'ese-block-button', '取消屏蔽', '屏蔽用户');

            favorBtn.addEventListener('click', async () => {
                const userConfig = await getUserConfig(userId);

                if (userConfig?.favored) {
                    if (confirm(`确定取消收藏用户 ${username} 吗？`)) {
                        await usersConfigCacheAccess.update(async data => {
                            delete data[userId];
                            return data;
                        })
                        favorBtn.toggle(false);
                    }
                } else {
                    if (confirm(`确定收藏用户 ${username} 吗？`)) {
                        await usersConfigCacheAccess.update(async data => {
                            delete data[username]; // 兼容 0.0.13 旧数据
                            data[userId] = { username, favored: true }
                            return data;
                        })
                        favorBtn.toggle(true);
                        blockedBtn.toggle(false);
                    }
                }
            });

            blockedBtn.addEventListener('click', async () => {
                const userConfig = await getUserConfig(userId);
                if (userConfig?.blocked) {
                    if (confirm(`确定取消屏蔽用户 ${username} 吗？`)) {
                        await usersConfigCacheAccess.update(async data => {
                            delete data[userId];
                            return data;
                        })
                        blockedBtn.toggle(false);
                    }
                } else {
                    if (confirm(`确定屏蔽用户 ${username} 吗？`)) {
                        await usersConfigCacheAccess.update(async data => {
                            delete data[username]; // 兼容 0.0.13 旧数据
                            data[userId] = { username, blocked: true }
                            return data;
                        })
                        favorBtn.toggle(false);
                        blockedBtn.toggle(true);
                    }
                }
            });

            userProfileElement.appendChild(favorBtn);
            userProfileElement.appendChild(blockedBtn);
        }
    }

    const highOrHidePostLists = async () => {
        const usersConfigStore = await usersConfigCacheAccess.read();
        const postsList = document.querySelectorAll('tbody[id^="normalthread_"]')
        postsList.forEach(async postItem => {
            const postElement = postItem.querySelector('tr td.by:nth-child(3)');
            const citeElement = postElement.querySelector('cite a');
            const topicTimeSpan = postElement.querySelector('span.xi1 span');
            const userId = extractUidFromURL(citeElement.href);
            const userConfig = await getUserConfig(userId, citeElement.textContent.trim(), usersConfigStore);

            if (citeElement && userConfig?.favored) {
                citeElement.style.fontWeight = 'bold';
                citeElement.style.color = 'dodgerblue'; // Change color to dodgerblue
            }

            if (citeElement && userConfig?.blocked) {
                postItem.style.display = 'none';
            }

            // Highlight today's new posts
            const today = new Date().toISOString().split('T')[0];
            if (topicTimeSpan && topicTimeSpan.title === today) {
                topicTimeSpan.style.fontWeight = 'bold';
            }
        })
    };

    const isHomepage = window.location.pathname === '/';

    if (isHomepage) {
        const usersConfigStore = await usersConfigCacheAccess.read();
        const posts = document.querySelectorAll('.dxb_bc li')

        posts.forEach(async post => {
            const usernameEle = post.querySelector('em a');
            const userId = extractUidFromURL(usernameEle?.href);
            const userConfig = await getUserConfig(userId, usernameEle?.textContent.trim(), usersConfigStore);

            if (usernameEle && userConfig?.favored) {
                usernameEle.style.fontWeight = 'bold';
                usernameEle.style.color = 'dodgerblue'; // Change color to dodgerblue
            }

            if (usernameEle && userConfig?.blocked) {
                post.style.display = 'none';
            }
        })
    }

    if (isPostListPage) {
        // Initial call to highlight already loaded content
        highOrHidePostLists();

        // Use a MutationObserver to handle dynamically loaded content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                highOrHidePostLists();
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    const isSearchPage = /\/search\.php\?.*searchmd5=.*/.test(currentUrl);
    if (isSearchPage) {
        const threadList = document.querySelectorAll('#threadlist .pbw');
        if (!threadList.length) return;

        const sectionMap = new Map();

        // 兼容两种分区地址格式（for edge）
        const querySectionLink = (thread, fid) => {
            const linkSelectors = fid ?
                `a[href*="fid=${fid}"], a[href^="forum-${fid}"]` :
                'a[href*="fid="], a[href^="forum-"]';

            const link = thread.querySelector(linkSelectors);
            if (link) {
                const url = new URL(link.href);
                const fidValue = fid || url.searchParams.get('fid') || url.pathname.match(/forum-(\d+)-\d+\.html/)?.[1];
                const sectionName = link.textContent.trim();
                if (fidValue) return { sectionLink: link, fid: fidValue, sectionName };
            }
            return null;
        };

        const processThread = (thread) => {
            const link = querySectionLink(thread)
            if (link) {
                const { fid, sectionName } = link
                if (!sectionMap.has(fid)) {
                    sectionMap.set(fid, { name: sectionName, elements: [] });
                }
                sectionMap.get(fid).elements.push(thread);
            }
        };

        const applyFilterToNewThreads = async (newThreads) => {
            const  searchHiddenSections = await searchHiddenSectionsAccess.read();
            sectionMap.forEach((section, fid) => {
                if (searchHiddenSections[fid]) {
                    newThreads.forEach(thread => {
                        const link = querySectionLink(thread, fid)
                        if (link) thread.style.display = 'none';
                    });
                }
            });
        };

        threadList.forEach(processThread);

        applyFilterToNewThreads(threadList);

        // 新建 button、更新数值
        const updateFilterButtons = async () => {
            const searchHiddenSections = await searchHiddenSectionsAccess.read();
            sectionMap.forEach((section, fid) => {
                const existingButton = document.querySelector(`.ese-filter-button[data-fid="${fid}"]`);

                if (existingButton) {
                    const countElement = existingButton.querySelector('.ese-filter-button-count');
                    const countNum = section.elements.length;
                    countElement.textContent = countNum <= 99 ? countNum : '99+';
                    existingButton.classList.toggle('ese-hidden', !!searchHiddenSections[fid]);
                } else {
                    addFilterSectionButton(section, fid);
                }
            });
        };

        const addFilterSectionButton = async (section, fid) => {
            const searchHiddenSections = await searchHiddenSectionsAccess.read()
            const button = document.createElement('a');
            button.className = 'ese-filter-button';
            button.textContent = section.name;
            button.dataset.fid = fid;
            button.classList.toggle('ese-hidden', !!searchHiddenSections[fid]);

            const countElement = document.createElement('span');
            countElement.className = 'ese-filter-button-count';
            countElement.textContent = section.elements.length;
            button.insertBefore(countElement, button.firstChild);

            button.addEventListener('click', async () => {
                searchHiddenSections[fid] = !searchHiddenSections[fid];
                button.classList.toggle('ese-hidden', searchHiddenSections[fid]);
                section.elements.forEach(thread => {
                    thread.style.display = searchHiddenSections[fid] ? 'none' : '';
                });
                await searchHiddenSectionsAccess.update(() => searchHiddenSections)
            });

            filterContainer.appendChild(button);
        };

        const filterContainer = document.createElement('div');
        filterContainer.className = 'ese-filter-container';
        document.body.appendChild(filterContainer);

        updateFilterButtons();

        let isLoading = false;
        let lastLoadedTime = Date.now();

        const loadNextPage = async () => {
            if (isLoading) return;

            const nextPageLink = document.querySelector('.pg a.nxt');
            if (!nextPageLink) return -1;

            isLoading = true;
            const loadingIndicator = createLoadingIndicator('加载中...');
            document.body.appendChild(loadingIndicator);

            const elapsedTime = Date.now() - lastLoadedTime;
            const waitTime = Math.max(0, LOAD_TIME_LIMIT - elapsedTime);

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    fetchGetPage(nextPageLink.href)
                        .then(async doc => {
                            const errorMessage = doc.querySelector('#messagetext.alert_error');
                            if (errorMessage && errorMessage.textContent.includes('刷新过于频繁')) {
                                showRetryIndicator();
                                setTimeout(loadNextPage, LOAD_TIME_LIMIT);
                                return;
                            }

                            const newThreads = doc.querySelectorAll('#threadlist .pbw');
                            newThreads.forEach(thread => {
                                thread.classList.add('ese-fade-in'); // 添加渐入动效类
                                document.querySelector('#threadlist ul').appendChild(thread);
                                processThread(thread);
                            });

                            await applyFilterToNewThreads(newThreads);

                            const newPagination = doc.querySelector('.pgs.cl.mbm');
                            const pagination = document.querySelector('.pgs.cl.mbm');
                            if (pagination && newPagination) pagination.replaceWith(newPagination);

                            await updateFilterButtons();
                            loadingIndicator.remove();
                            lastLoadedTime = Date.now();
                        }).finally(() => {
                            resolve()
                            isLoading = false;
                        });
                }, waitTime);
            })
        };

        const showRetryIndicator = () => {
            const retryIndicator = createLoadingIndicator('翻页过快，即将重试...');
            document.body.appendChild(retryIndicator);

            setTimeout(() => {
                retryIndicator.remove();
                loadNextPage();
            }, LOAD_TIME_LIMIT);
        };

        const loadNextPageIfNeeded = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isLoading) {
                    loadNextPage().then((value) => {
                        if (value === -1) {
                            loadNextPageObserver.unobserve(sentinel);
                            sentinel.remove();
                        } else {
                            // 将 sentinel 元素移动到文档末尾
                            document.body.appendChild(sentinel);
                        }
                    });
                }
            });
        };
        
        const sentinel = document.createElement('div');
        sentinel.style.height = '1px';
        document.body.appendChild(sentinel);
        
        const loadNextPageObserver = new IntersectionObserver(loadNextPageIfNeeded, {
            root: null,
            rootMargin: '50% 0px',
            threshold: 0
        });
        
        loadNextPageObserver.observe(sentinel);
    }

    if (mainConfig.enableSortByDateline === true) {
        /** section links default sort by datetime */
        const setCustomSectionLink = () => {
            document.body.addEventListener('click', event => {
                const link = event.target.closest('a[href*="forum.php?mod=forumdisplay"], a[href*="forum-"]');
                if (!link) return;

                event.preventDefault();
                let url = new URL(link.href, window.location.origin);

                if (url.pathname.includes('forum.php')) {
                    if (!url.searchParams.get("orderby")) {
                        url.searchParams.set('filter', 'author')
                        url.searchParams.set('orderby', 'dateline')
                    }
                } else if (url.pathname.match(/forum-\d+-\d+\.html/)) {
                    const fid = url.pathname.split('-')[1];
                    url = new URL(`/forum.php?mod=forumdisplay&fid=${fid}&filter=author&orderby=dateline`, window.location.origin);
                }

                window.location.href = url;
            });
            document.querySelectorAll('a[rel*="forum.php?mod=forumdisplay"]').forEach(nxt => { // next page
                let url = new URL(nxt.rel, window.location.origin);
                if (!url.searchParams.get("orderby")) url.searchParams.set('orderby', 'dateline');
                nxt.setAttribute('rel', url)
            })
        }
        setCustomSectionLink()
    }

    const initConfigPanel = () => {
        /** 插件配置页 */
        const isEnhancerPanel = /&ac=enhancer/.test(currentUrl);
        const enhancerUrl = 'home.php?mod=spacecp&ac=enhancer';
        const CONFIG_PANEL_NAME = "增强插件"

        const renderConfigForm = () => {
            const uselessElements = document.querySelectorAll("#ct #frame_profile, #ct form[target='frame_profile']")
            uselessElements.forEach(ele => ele.remove())
            const configPanel = document.querySelector("#ct .bm.bw0")
            const configList = addElem(configPanel, 'div', "ese-config-panel-container")
            const introItem = addElem(configList, 'dt', 'ese-config-item-lv1 ese-config-item-checked');
            addElem(introItem, 'a', 'ese-intro-link', { href: INTRO_POST, target: '_blank' }).textContent = '🔗 捷径: 功能简介帖';
            putCheckBoxItem('新功能更新后 自动打开更新说明', 'openIntroAfterUpdate', 2);
            addElem(configList, 'dt', 'ese-config-item-sep ese-config-item-lv1').textContent = '论坛设置';

            const quickBtnItem = putCheckBoxItem('在读帖时添加快捷按钮', 'enableQuickBtn');
            addElem(configList, 'dt', 'ese-config-item-tip ese-config-item-lv2').textContent = '💡 阅读帖子时的快捷按钮（一键收藏、快捷评分、滚动到附件等）';
            addElem(quickBtnItem, 'span').textContent = '🔹位置 ';

            const quickBtnPosSelect = addElem(quickBtnItem, 'select');
            addElem(quickBtnPosSelect, 'option', null, { value: 'left' }).textContent = '页面左侧';
            addElem(quickBtnPosSelect, 'option', null, { value: 'right' }).textContent = '页面右侧';
            quickBtnPosSelect.value = mainConfig.quickBtnPosition;
            quickBtnPosSelect.value = quickBtnPosSelect.value || 'right';
            quickBtnPosSelect.addEventListener('change', () => {
                configPanel.classList.add('ese-config-saving');
                mainConfigAccess.update(function(updatingUserConfig) {
                    updatingUserConfig.quickBtnPosition = quickBtnPosSelect.value;
                    return updatingUserConfig;
                })
                .finally(function() {
                    configPanel.classList.remove('ese-config-saving');
                    window.location.reload();
                });
            });

            putCheckBoxItem('帖子按时间排序', 'enableSortByDateline');
            addElem(configList, 'dt', 'ese-config-item-tip ese-config-item-lv2').textContent = '💡 板块内帖子按时间排序（默认关闭。目前仅支持全部开启或全部关闭，后续将支持按常用分区配置）';

            async function renderUserList(heading, listClass, filterKey, clickIconText, confirmMessage) {
                const listHeading = addElem(configList, 'h5', null, { style: 'line-height:32px;' });
                addElem(listHeading, 'span').textContent = heading;
                addElem(listHeading, 'span', null, { style: 'font-weight:normal' }).textContent = ` 点击${clickIconText}移除`;
                
                const userListBlock = addElem(configList, 'dt', listClass);
                const userItemComparator = comparator('username');
                const usersConfigStore = await usersConfigCacheAccess.read();
                
                Object.entries(usersConfigStore)
                    .filter(entry => entry[1][filterKey])
                    .sort((et1, et2) => userItemComparator(et1[1], et2[1]))
                    .forEach(entry => {
                        const userId = entry[0];
                        const { username: userNickName } = entry[1];
                        const userTag = addElem(userListBlock, 'span', 'ese-user-tag', { title: userNickName });
                        userListBlock.appendChild(document.createTextNode(' '));
                        const userTagIcon = addElem(userTag, 'span', 'ese-user-tag-icon');
                        
                        const userLink = addElem(userTag, 'a', null, {
                            href: !isNaN(Number(userId)) ?
                              `home.php?mod=space&uid=${userId}` :
                              `home.php?mod=spacecp&ac=search&username=${userId}&searchsubmit=yes`, // 兼容 0.0.13 旧数据
                            target: '_blank'
                        });
                        userLink.textContent = userNickName;
            
                        userTagIcon.addEventListener('click', function() {
                            if (confirm(`${confirmMessage} (${userNickName})？`)) {
                                configPanel.classList.add('ese-config-saving');
                                usersConfigCacheAccess.update(data => {
                                    delete data[userId];
                                    userTag.remove();
                                    return data;
                                });
                            }
                        });
                    });
            }
            
            renderUserList('收藏用户管理', 'ese-nickname-list', 'favored', '🔖', '取消收藏');
            renderUserList('屏蔽用户管理', 'ese-user-blacklist', 'blocked', '🚫', '取消屏蔽');

            function putCheckBoxItem(label, propertyNameOrAccessor, level, inverted) {
                let propertyAccess;
                if (typeof propertyNameOrAccessor === 'string') {
                    propertyAccess = {
                        get() {
                            return !!mainConfig[propertyNameOrAccessor];
                        },
                        update(newValue) {
                            return mainConfigAccess.update(function(updatingUserConfig) {
                                updatingUserConfig[propertyNameOrAccessor] = newValue;
                                return updatingUserConfig;
                            });
                        }
                    };
                } else {
                    propertyAccess = propertyNameOrAccessor;
                }
                const configItem = addElem(configList, 'dt', `ese-config-item-lv${level||1}`);
                const checkboxLabel = addElem(configItem, 'label');
                const checkbox = addElem(checkboxLabel, 'input', null, { type: 'checkbox' });
                checkboxLabel.appendChild(document.createTextNode(' ' + label));
                checkbox.checked = propertyAccess.get();
                updateStyle();
                function updateStyle() {
                    const checkedValue = !inverted; // when inverted false is considered checked
                    if (checkbox.checked === checkedValue) {
                        configItem.classList.add('ese-config-item-checked');
                    } else {
                        configItem.classList.remove('ese-config-item-checked');
                    }
                }
                checkbox.addEventListener('change', async function() {
                    configPanel.classList.add('ese-config-saving');
                    const newValue = checkbox.checked;
                    propertyAccess.update(newValue)
                        .finally(function() {
                            configPanel.classList.remove('ese-config-saving');
                            updateStyle();
                        });
                });
                return configItem;
            }

        }

        const sideTab = document.querySelector("#ct .tbn ul")
        if (!sideTab) return
        const newLi = addElem(sideTab, "li")
        const newLink = addElem(newLi, "a", "", { href: enhancerUrl });
        newLink.textContent = CONFIG_PANEL_NAME

        if (isEnhancerPanel) {
            const panelTitleEle = document.querySelector("#ct .tb.cl a")
            if (!panelTitleEle) return
            panelTitleEle.innerText = CONFIG_PANEL_NAME
            panelTitleEle.href = enhancerUrl

            const breadcrumbEle = document.querySelector("#pt .z");
            breadcrumbEle.innerHTML = breadcrumbEle.innerHTML.replace(/个人资料/g, CONFIG_PANEL_NAME);

            const sideTabLi = document.querySelectorAll("#ct .tbn ul li")
            sideTabLi.forEach(li => {
                const a = li.querySelector('a');
                if (a.href.includes(enhancerUrl)) {
                    li.classList.add('a')
                } else {
                    li.classList.remove('a')
                }
            })
            renderConfigForm()
        }
    }

    const isSpacePage = /\/home\.php\?mod=spacecp.*/.test(currentUrl);
    if (isSpacePage) {
        initConfigPanel()
    }
})();

//============= utils =============//

let verifyhashCache = null;
function getVerifyHash() {
    if (unsafeWindow.verifyhash) {
        return unsafeWindow.verifyhash;
    }
    if (verifyhashCache) {
        return verifyhashCache;
    }
    const hiddenField = document.querySelector('input[type="hidden"][name="formhash"][value]');
    if (hiddenField) {
        verifyhashCache = hiddenField.value;
        return hiddenField.value;
    }
    for (let scriptElement of document.querySelectorAll('script')) {
        const match = scriptElement.textContent.match(/hash=([A-Za-z0-9]{8})/);
        if (match) {
            verifyhashCache = match[1];
            return match[1];
        }
    }
    alert('无法取得操作验证码 (运作环境错误，请用篡改猴及谷歌火狐等主流浏览器)');
}

function comparator(prop, reversed) {
    const reverser = reversed ? -1 : 1;
    return (x, y) => {
        const xv = typeof prop === 'function' ? prop(x) : prop ? x[prop] : x;
        const yv = typeof prop === 'function' ? prop(y) : prop ? y[prop] : y;
        return xv > yv ? reverser : xv < yv ? -reverser : 0;
    };
}

function extractUidFromURL(url = "") {
    const pattern = /uid=(\d+)|space-uid-(\d+)\.html/;
    const match = url.match(pattern);
    if (match) {
        const uid = match[1] || match[2];
        return Number(uid);
    }
    return null;
}

// polyfill replacement
function Object_hasOwn(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function showNativeSpinner(anchor) {
    try {
        unsafeWindow.showloading();
    } catch (ignore) { }
}
function closeNativeSpinner() {
    try {
        unsafeWindow.showloading('none');
    } catch (ignore) { }
}
function showNativeWarningPopup(msg) {
    try {
        unsafeWindow.errorhandle_k_favorite(msg, {})
    } catch (ignore) {
        alert(msg);
    }
}
function showNativeInfoPopup(msg) {
    showDialog(msg, 'right', null, null, 0, null, null, null, null, 2, null)
}

async function fetchGetPage(url, docType, autoRetry) {
    const resp = await fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        credentials: 'same-origin',
        cache: 'no-cache'
    });

    if (!resp.ok) {
        throw new Error('网络或登入错误');
    }
    const content = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, docType || 'text/html');
    if (autoRetry) {
        if (findErrorMessage(doc) === '刷新过于频繁，请3秒后再试。') {
            await sleep(LOAD_TIME_LIMIT);
            return await fetchGetPage(url, docType, false);
        }
    }
    return doc;
}

function findErrorMessage(doc) {
    let err = doc.querySelector('#messagetext > p');
    return err ? err.textContent.trim() || '不明错误' : null;
}

function addElem(parent, tag, styleClass, attrs) {
    const elem = newElem(tag, styleClass, attrs);
    parent.appendChild(elem);
    return elem;
}

function newElem(tag, styleClass, attrs) {
    const elem = document.createElement(tag);
    if (styleClass) {
        styleClass.split(' ').forEach(function(cls) {
            elem.classList.add(cls);
        });
    }
    if (attrs) {
        for (let name of Object.keys(attrs)) {
            elem.setAttribute(name, attrs[name]);
        }
    }
    return elem;
}

function addModalMask() {
    return addElem(document.body, 'div', 'ese-dialog-modal-mask');
}

function createPopupMenu(popupId, anchor, rightAligned, verticallyInverted) {
    function computeStyle(hShift) {
        if (anchor) {
            const bounds = anchor.getClientRects()[0];
            const left = bounds.x + hShift;
            if (verticallyInverted) {
                return 'opacity: 0.95; left: ' + left.toFixed(0) + 'px; z-index: 3000; visibility: visible; top: ' + (bounds.top + document.documentElement.scrollTop).toFixed(0) + 'px; transform: translateY(-100%);';
            } else {
                return 'opacity: 0.95; left: ' + left.toFixed(0) + 'px; z-index: 3000; visibility: visible; top: ' + (bounds.height + bounds.top + document.documentElement.scrollTop).toFixed(0) + 'px;';
            }
        } else {
            return 'position: fixed; opacity: 0.95; left: calc(50vw - 400px); z-index: 3000; visibility: visible; top: 10vh';
        }

    }
    const menuElem = addElem(document.body, 'div', 'menu ese-common-popup-menu', {
        id: popupId,
        style: computeStyle(0)
    });

    // just copy-n-paste from site, lol
    menuElem.innerHTML = `<div class="bor" style="padding:13px 30px"><img src="images/loading.gif" align="absbottom"> 正在加载数据...</div>`;

    return {
        renderContent(renderer) {
            menuElem.innerHTML = '';
            const borElem = addElem(menuElem, 'div', 'bor');
            renderer(borElem);
            if (rightAligned) {
                menuElem.setAttribute('style', computeStyle(-menuElem.getClientRects()[0].width));
            }
        }
    };
}

async function setupPopupMenu(config) {
    const menuConfig = {
        title: '',
        width: 120,
        popupMenuId: '',
        anchor: null,
        rightAligned: false,
        verticallyInverted: false,
        onClose: () => {},
        items: [] // [ { label, class, action } ]
    };
    Object.assign(menuConfig, config);

    const modelMask = addModalMask();
    const popupMenu = createPopupMenu(menuConfig.popupMenuId, menuConfig.anchor, menuConfig.rightAligned, menuConfig.verticallyInverted);
    function close() {
        modelMask.remove();
        closePopupMenu(menuConfig.popupMenuId);
        menuConfig.onClose();
    }
    modelMask.addEventListener('click', () => close());

    popupMenu.renderContent(async function(borElem) {
        const tableElem = addElem(borElem, 'table', null, {
            width: `${menuConfig.width}`,
            cellspacing: '0',
            cellpadding: '0'
        });

        const tbodyElem = addElem(tableElem, 'tbody');
        const trElem1 = addElem(tbodyElem, 'tr');
        const thElem1_1 = addElem(trElem1, 'th', 'h');
        const frElem1 = addElem(thElem1_1, 'span', 'fr', {
            style: 'margin-top:2px;cursor:pointer'
        });
        frElem1.addEventListener('click', () => close());
        addElem(frElem1, 'img', null, {
            src: 'images/close.gif'
        });
        thElem1_1.appendChild(document.createTextNode(menuConfig.title));

        function addButton(item) {
            const trElem = addElem(tbodyElem, 'tr');
            const tdElem = addElem(trElem, 'td', item.cellClass||null);
            const button = addElem(tdElem, 'a', item.class||null);
            button.textContent = item.label;
            if (item.action == null) {
                // nothing
            } else if (typeof item.action === 'string') {
                button.setAttribute('href', item.action);
                if (item.target) {
                    button.setAttribute('target', item.target);
                }
            } else {
                button.setAttribute('href', 'javascript:');
                button.addEventListener('click', () => {
                    close();
                    setTimeout(() => item.action());
                    return false;
                });
            }
            return button;
        }
        menuConfig.items.forEach(item => {
            addButton(item);
        });
    });
}

function closePopupMenu(popupId) {
    const menu = document.getElementById(popupId);
    if (menu) {
        menu.remove();
    }
}
