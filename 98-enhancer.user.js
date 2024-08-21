// ==UserScript==
// @name         色花堂 98堂 强化脚本
// @namespace    http://tampermonkey.net/
// @version      0.0.13
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
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.addStyle
// @grant        GM.openInTab
// @grant        GM.registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM.registerMenuCommand
// @icon         data:image/gif;base64,UklGRgABAABXRUJQVlA4WAoAAAAQAAAADwAADwAAQUxQSKYAAAANgJtt27Hn+v3HtitbrY0BnMrJBJnAWCCt2dk2Ktu2zTcrRMQEgMRWa/XZLCH8bqTqGCAqS3F5ZPmClmdXH6CRDn42AFpJdZfwIeFvn5sVUMsF9gHcHgX0jLdfgpMRtCq+KStAVGIZERAgBATy3+cNB7HX1pZ42V/P68vN2gXPeYZ/zOer4bhy1tEmTfWjn58vA6NXZkkm70fD578A1xVT1uoFLX4CVlA4IDQAAABQAQCdASoQABAAB0CWJbAABe9AAP7msGXYtkQ9eTZz0OaTWMpBhwn6oJ35ZoLVEQcVAAAA
// @downloadURL https://update.sleazyfork.org/scripts/503560/%E8%89%B2%E8%8A%B1%E5%A0%82%2098%E5%A0%82%20%E5%BC%BA%E5%8C%96%E8%84%9A%E6%9C%AC.user.js
// @updateURL https://update.sleazyfork.org/scripts/503560/%E8%89%B2%E8%8A%B1%E5%A0%82%2098%E5%A0%82%20%E5%BC%BA%E5%8C%96%E8%84%9A%E6%9C%AC.meta.js
// ==/UserScript==

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
            async deleteValue(key) {
                return await GM.deleteValue(window.GM, key);
            },
            listValues: GM.listValues,
            addStyle: GM.addStyle,
            openInTab: GM.openInTab,
            registerMenuCommand: GM.registerMenuCommand
        };
    } else {
        return {
            getValue: GM_getValue,
            setValue: GM_setValue,
            async deleteValue(key) {
                return await GM_deleteValue(key);
            },
            listValues: GM_listValues,
            addStyle: GM_addStyle,
            openInTab: GM_openInTab,
            registerMenuCommand: GM_registerMenuCommand,
        };
    }
}

const MAIN_CONFIG_KEY = '98_config';

const DEFAULT_MAIN_CONFIG = {
    initFavorRecords: true,
}

const LOAD_TIME_LIMIT = 3000;

const SEARCH_CONFIG_KEY = '98_search_pref';
const DEFAULT_SEARCH_CONFIG = {};

const FAVOR_THREADS_CACHE_CONFIG_KEY = '98_favor_threads';
const DEFAULT_FAVOR_THREADS_CACHE_CONFIG = { time: 0, data: {} }; // [tid]: [favid]

const RATED_THREADS_CACHE_CONFIG_KEY = '98_rated_threads';
const DEFAULT_RATED_THREADS_CACHE_CONFIG = { time: 0, data: {} }; // [tid]: boolean

function initConfigAccess(myUserId, configKey, defaultValue) {
    return {
        async read() {
            return readUserConfig(myUserId, configKey, defaultValue);
        },
        async write(newValue) {
            await GM.setValue(configKey + '#' + myUserId, JSON.stringify(newValue));
        },
        async update(updater) {
            return updateUserConfig(myUserId, updater, configKey, defaultValue);
        }
    };
}

async function readUserConfig(myUserId, configKey, defaultValue) {
    try {
        let savedData = await GM.getValue(configKey + '#' + myUserId);
        return Object.assign({}, defaultValue, JSON.parse(savedData));
    } catch (e) { }
    return Object.assign({}, defaultValue);
}

async function updateUserConfig(myUserId, updater, configKey, defaultValue) {
    let oldConfig = await readUserConfig(myUserId, configKey, defaultValue);
    let newConfig = await updater(oldConfig);
    if (newConfig != null) {
        await GM.setValue(configKey + '#' + myUserId, JSON.stringify(newConfig));
    }
    return newConfig;
}

function readFavorList(doc) {
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
        const favors = readFavorList(doc);
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

    GM.registerMenuCommand('打开功能简介帖', () => GM.openInTab(INTRO_POST, false));

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
        background: rgba(254, 242, 232, 0.9);
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
    }
    `)

    const myUserId = findMyUserId();
    const mainConfigAccess = initConfigAccess(myUserId, MAIN_CONFIG_KEY, DEFAULT_MAIN_CONFIG);
    const favorThreadsCacheAccess = initConfigAccess(myUserId, FAVOR_THREADS_CACHE_CONFIG_KEY, DEFAULT_FAVOR_THREADS_CACHE_CONFIG);
    const ratedThreadsCacheAccess = initConfigAccess(myUserId, RATED_THREADS_CACHE_CONFIG_KEY, DEFAULT_RATED_THREADS_CACHE_CONFIG);

    let mainConfig = await mainConfigAccess.read();

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
    buttonContainer.className = 'ese-quick-button-container';

    const updateButtonStates = () => {
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
        readFavorRecords(favorThreadsCacheAccess, true, async () => {
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

    const createToggleKVStore = async (storeName) => {
        let data = await GM.getValue(storeName, {});
        const updateStore = async () => {
            await GM.setValue(storeName, data);
        };
        return { data, updateStore }
    }

    const { data: favoriteUsers, updateStore: updateFavoriteUsers } = await createToggleKVStore('favoriteUsers')
    const { data: blockedUsers, updateStore: updateBlockedUsers } = await createToggleKVStore('blockedUsers')

    if (isUserProfilePage) {
        const userProfileSelector = '#uhd .mt';
        const userProfileElement = document.querySelector(userProfileSelector);
        if (userProfileElement) {
            const username = userProfileElement.textContent.trim();
            let isFavorited = !!favoriteUsers[username];
            let isBlocked = !!blockedUsers[username];

            const favoriteButton = document.createElement('button');
            favoriteButton.innerText = isFavorited ? '取消收藏' : '收藏用户';
            favoriteButton.className = 'ese-quick-button ese-favorite-button';
            favoriteButton.style.marginLeft = '10px';

            favoriteButton.addEventListener('click', () => {
                if (isFavorited) {
                    if (confirm(`确定取消收藏用户 ${username} 吗？`)) {
                        delete favoriteUsers[username];
                        favoriteButton.innerText = '收藏用户';
                        isFavorited = false;
                    }
                } else {
                    if (confirm(`确定收藏用户 ${username} 吗？`)) {
                        favoriteUsers[username] = true;
                        favoriteButton.innerText = '取消收藏';
                        isFavorited = true;

                        delete blockedUsers[username];
                        blokedButton.innerText = '屏蔽用户';
                        isBlocked = false;

                    }
                }
                updateFavoriteUsers();
                updateBlockedUsers();
            });

            const blokedButton = document.createElement('button');
            blokedButton.innerText = isBlocked ? '取消屏蔽' : '屏蔽用户';
            blokedButton.className = 'ese-quick-button ese-block-button';
            blokedButton.style.marginLeft = '10px';

            blokedButton.addEventListener('click', () => {
                if (isBlocked) {
                    if (confirm(`确定取消屏蔽用户 ${username} 吗？`)) {
                        delete blockedUsers[username];
                        blokedButton.innerText = '屏蔽用户';
                        isBlocked = false;

                    }
                } else {
                    if (confirm(`确定屏蔽用户 ${username} 吗？`)) {
                        blockedUsers[username] = true;
                        blokedButton.innerText = '取消屏蔽';
                        isBlocked = true;

                        delete favoriteUsers[username];
                        favoriteButton.innerText = '收藏用户';
                        isFavorited = false;
                    }
                }
                updateBlockedUsers();
                updateFavoriteUsers();
            });

            userProfileElement.appendChild(favoriteButton);
            userProfileElement.appendChild(blokedButton);
        }
    }

    const highOrHidePostLists = () => {
        const postsList = document.querySelectorAll('tbody[id^="normalthread_"]')
        postsList.forEach(postItem => {
            const postElement = postItem.querySelector('tr td.by:nth-child(3)');
            const citeElement = postElement.querySelector('cite a');
            const topicTimeSpan = postElement.querySelector('span.xi1 span');

            // Highling favorite users
            if (citeElement && favoriteUsers[citeElement.textContent.trim()]) {
                citeElement.style.fontWeight = 'bold';
                citeElement.style.color = 'dodgerblue'; // Change color to dodgerblue
            }

            // Hide blocked users' posts
            if (citeElement && blockedUsers[citeElement.textContent.trim()]) {
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
        const posts = document.querySelectorAll('.dxb_bc li')
        posts.forEach(post => {
            const username = post.querySelector('em a');
            // Highling favorite users
            if (username && favoriteUsers[username.textContent.trim()]) {
                username.style.fontWeight = 'bold';
                username.style.color = 'dodgerblue'; // Change color to dodgerblue
            }

            // Hide blocked users' posts
            if (username && blockedUsers[username.textContent.trim()]) {
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
        const { data: hiddenSections, updateStore: updateHiddenSections } = await createToggleKVStore('hiddenSections');

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

        const applyFilterToNewThreads = (newThreads) => {
            sectionMap.forEach((section, fid) => {
                if (hiddenSections[fid]) {
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
        const updateFilterButtons = () => {
            sectionMap.forEach((section, fid) => {
                const existingButton = document.querySelector(`.ese-filter-button[data-fid="${fid}"]`);

                if (existingButton) {
                    const countElement = existingButton.querySelector('.ese-filter-button-count');
                    const countNum = section.elements.length;
                    countElement.textContent = countNum <= 99 ? countNum : '99+';
                    existingButton.classList.toggle('ese-hidden', !!hiddenSections[fid]);
                } else {
                    addFilterSectionButton(section, fid);
                }
            });
        };

        const addFilterSectionButton = (section, fid) => {
            const button = document.createElement('a');
            button.className = 'ese-filter-button';
            button.textContent = section.name;
            button.dataset.fid = fid;
            button.classList.toggle('ese-hidden', !!hiddenSections[fid]);

            const countElement = document.createElement('span');
            countElement.className = 'ese-filter-button-count';
            countElement.textContent = section.elements.length;
            button.insertBefore(countElement, button.firstChild);

            button.addEventListener('click', () => {
                hiddenSections[fid] = !hiddenSections[fid];
                section.elements.forEach(thread => {
                    thread.style.display = hiddenSections[fid] ? 'none' : '';
                });
                button.classList.toggle('ese-hidden', !!hiddenSections[fid]);
                updateHiddenSections();
            });

            filterContainer.appendChild(button);
        };

        const filterContainer = document.createElement('div');
        filterContainer.className = 'ese-filter-container';
        document.body.appendChild(filterContainer);

        updateFilterButtons();

        let isLoading = false;
        let lastLoadedTime = Date.now();

        const loadNextPage = () => {
            if (isLoading) return;

            const nextPageLink = document.querySelector('.pg a.nxt');
            if (!nextPageLink) return;

            isLoading = true;
            const loadingIndicator = createLoadingIndicator('加载中...');
            document.body.appendChild(loadingIndicator);

            const elapsedTime = Date.now() - lastLoadedTime;
            const waitTime = Math.max(0, LOAD_TIME_LIMIT - elapsedTime);

            setTimeout(() => {
                fetchGetPage(nextPageLink.href)
                    .then(doc => {
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

                        applyFilterToNewThreads(newThreads);

                        const newPagination = doc.querySelector('.pgs.cl.mbm');
                        const pagination = document.querySelector('.pgs.cl.mbm');
                        if (pagination && newPagination) {
                            pagination.replaceWith(newPagination);
                        }

                        updateFilterButtons();
                        loadingIndicator.remove();
                        lastLoadedTime = Date.now();
                    }).finally(() => {
                        isLoading = false;
                    });
            }, waitTime);
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
                if (entry.isIntersecting && !isLoading) loadNextPage();
            });
        };

        // 使用一个 sentinel 元素
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

    /** section links sort default by datetime */
    const setCustomSectionLink = () => {
        document.body.addEventListener('click', event => {
            const link = event.target.closest('a[href*="forum.php?mod=forumdisplay"], a[href*="forum-"]');
            if (!link) return;

            event.preventDefault();
            let url = new URL(link.href, window.location.origin);

            if (url.pathname.includes('forum.php')) {
                if (!url.searchParams.get("orderby")) url.searchParams.set('orderby', 'dateline');
            } else if (url.pathname.match(/forum-\d+-\d+\.html/)) {
                const fid = url.pathname.split('-')[1];
                url = new URL(`/forum.php?mod=forumdisplay&fid=${fid}&orderby=dateline`, window.location.origin);
            }

            window.location.href = url;
        });
        document.querySelectorAll('a[rel*="forum.php?mod=forumdisplay"]').forEach(nxt => {
            // 下一页
            let url = new URL(nxt.rel, window.location.origin);
            if (!url.searchParams.get("orderby")) url.searchParams.set('orderby', 'dateline');
            nxt.rel = url
        })
    }
    setCustomSectionLink()
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
