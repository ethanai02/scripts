// ==UserScript==
// @name         色花堂 98堂 强化脚本
// @namespace    http://tampermonkey.net/
// @version      0.0.12
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
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @icon         https://sehuatang.net/favicon.ico
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
            addStyle: GM.addStyle
        };
    } else {
        return {
            getValue: GM_getValue,
            setValue: GM_setValue,
            async deleteValue(key) {
                return await GM_deleteValue(key);
            },
            listValues: GM_listValues,
            addStyle: GM_addStyle
        };
    }
}

const createLoadingIndicator = (message) => {
    const indicator = document.createElement('div');
    indicator.className = 'loading-indicator';
    indicator.textContent = message;
    return indicator;
};

(async function () {
    'use strict';
    const GM = initGM();
    /**
     * quick jump to important contents
     */
    const elementsToCheck = [
        { selector: '.locked a[href*="action=pay"', text: hasPurchased() ? '已购买' : '前往购买' },
        { selector: '.blockcode', text: '资源链接' },
        { selector: '#ak_rate', text: '评分', isClick: true }
    ];

    const createButton = ({ text, onClick, title, ariaLabel }) => {
        const button = document.createElement('button');
        button.innerText = text;
        button.className = 'quick-button';
        button.title = title;
        button.setAttribute('aria-label', ariaLabel);
        button.addEventListener('click', onClick);
        return button;
    };

    GM.addStyle(`
    .quick-button-container {
        position: fixed;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        font-size: 1.1em;
        margin-top: 0;
        padding: 0.2em 0.5em;
        scrollbar-gutter: stable;
        scrollbar-width: thin;
        background: #FEF2E8;
    }

    .quick-button {
        margin: 5px;
        border: none;
        cursor: pointer;
        color: #787878;
        font-weight: bold;
        font-family: monospace;
        margin-right: 0.3em;
        min-width: 2.5em;
        display: inline-block;
        background: none;
    }
    .quick-button:hover { text-decoration: underline; }
    .favorite-button, .block-button {
        border: 1px solid;
        cursor: pointer;
    }
    .favorite-button {
        background: #FEAE10;
    }
    `)

    function hasPurchased() {
        return document.querySelector('.y a[href*="action=viewpayments"]') !== null;
    }

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
    buttonContainer.className = 'quick-button-container';

    const updateButtonStates = () => {
        buttonContainer.innerHTML = ''; // 清空现有按钮，防止重复添加

        elementsToCheck.forEach(({ selector, text, isClick }) => {
            const element = document.querySelector(selector);
            if (element) {
                const button = createButton({
                    text,
                    title: element.textContent.trim(),
                    ariaLabel: element.textContent.trim(),
                    onClick: () => {
                        if (isClick) {
                            element.click();
                            observeRateForm(); // 观察评分表单
                        } else {
                            scrollToElement(element);
                        }
                    }
                });
                buttonContainer.appendChild(button);
            }
        });

        // 更新附件按钮
        const updateAttachmentButtons = () => {
            const createAndAppendButton = (element) => {
                const button = createButton({
                    text: '下载附件',
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

        // 回复解锁按钮
        const locked = document.querySelector('.locked a[href*="action=reply"]');
        if (locked) {
            const button = createButton({
                text: '回复解锁',
                title: locked.textContent.trim(),
                ariaLabel: locked.textContent.trim(),
                onClick: () => {
                    locked.click();
                }
            });
            buttonContainer.appendChild(button);
        }

        updateAttachmentButtons();
    };

    const observeRateLoadingElement = () => {
        let loadingElementVisible = false;

        const loadingObserver = new MutationObserver((mutations, observer) => {
            const loadingElement = document.querySelector('div[id^="post_"] img[src*="loading.gif"]');

            if (loadingElement && !loadingElementVisible) {
                loadingElementVisible = true;
            }

            if (!loadingElement && loadingElementVisible) {
                loadingElementVisible = false;
                updateButtonStates();
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

        observeRateLoadingElement();

        rateObserver.observe(document.body, { childList: true, subtree: true });
    };

    // 初次更新按钮状态
    updateButtonStates();

    if (buttonContainer.children.length > 0) {
        document.body.appendChild(buttonContainer);
    }

    /**
   * Highling favorite users and today's new posts
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
            favoriteButton.className = 'quick-button favorite-button';
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
            blokedButton.className = 'quick-button block-button';
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
                [`a[href*="fid=${fid}"]`, `a[href^="forum-${fid}"]`] :
                ['a[href*="fid="]', 'a[href^="forum-"]'];

            for (const selector of linkSelectors) {
                const link = thread.querySelector(selector);
                if (link) {
                    const url = new URL(link.href);
                    const fidValue = fid || url.searchParams.get('fid') || url.pathname.match(/forum-(\d+)-\d+\.html/)?.[1];
                    const sectionName = link.textContent.trim();
                    if (fidValue) return { sectionLink: link, fid: fidValue, sectionName };
                }
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
                const existingButton = document.querySelector(`.filter-button[data-fid="${fid}"]`);

                if (existingButton) {
                    const countElement = existingButton.querySelector('.filter-button-count');
                    const countNum = section.elements.length;
                    countElement.textContent = countNum <= 99 ? countNum : '99+';
                    existingButton.classList.toggle('hidden', !!hiddenSections[fid]);
                } else {
                    addFilterSectionButton(section, fid);
                }
            });
        };

        const addFilterSectionButton = (section, fid) => {
            const button = document.createElement('a');
            button.className = 'filter-button';
            button.textContent = section.name;
            button.dataset.fid = fid;
            button.classList.toggle('hidden', !!hiddenSections[fid]);

            const countElement = document.createElement('span');
            countElement.className = 'filter-button-count';
            countElement.textContent = section.elements.length;
            button.insertBefore(countElement, button.firstChild);

            button.addEventListener('click', () => {
                hiddenSections[fid] = !hiddenSections[fid];
                section.elements.forEach(thread => {
                    thread.style.display = hiddenSections[fid] ? 'none' : '';
                });
                button.classList.toggle('hidden', !!hiddenSections[fid]);
                updateHiddenSections();
            });

            filterContainer.appendChild(button);
        };

        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
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

            const loadTime = 3000;
            const elapsedTime = Date.now() - lastLoadedTime;
            const waitTime = Math.max(0, loadTime - elapsedTime);

            setTimeout(() => {
                fetch(nextPageLink.href)
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');

                        const errorMessage = doc.querySelector('#messagetext.alert_error');
                        if (errorMessage && errorMessage.textContent.includes('刷新过于频繁')) {
                            showRetryIndicator();
                            setTimeout(loadNextPage, 3000);
                            return;
                        }

                        const newThreads = doc.querySelectorAll('#threadlist .pbw');
                        newThreads.forEach(thread => {
                            thread.classList.add('fade-in'); // 添加渐入动效类
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
            }, 3000);
        };

        const loadNextPageIfNeeded = () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.documentElement.scrollHeight - window.innerHeight / 2;

            if (scrollPosition >= threshold && !isLoading) {
                loadNextPage();
            }
        };

        window.addEventListener('wheel', (event) => {
            if (event.deltaY > 0) {
                loadNextPageIfNeeded();
            }
        });

        window.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                loadNextPageIfNeeded();
            }
        });

        GM.addStyle(`
        .filter-container {
            position: fixed;
            left: calc(50vw + 200px);
            top: 105px;
            display: flex;
            flex-direction: column;
            z-index: 9999;
            width: 140px;
        }

        .filter-button {
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

        .filter-button.hidden {
            color: #CCC;
            background: #999C;
            text-decoration: line-through;
            outline-color: #999;
        }

        .filter-button:hover {
            outline-color: deepskyblue;
        }
        .filter-button-count {
            color: royalblue;
            padding-right: 10px;
            position: absolute;
            left: 4px;
        }

        .hidden .filter-button-count {
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

        .fade-in {
            opacity: 0;
            animation: fadeIn 1s forwards;
        }

        .loading-indicator {
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
        .loading-indicator::before {
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
      `)
    }
})();
