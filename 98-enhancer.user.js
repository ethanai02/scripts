// ==UserScript==
// @name         色花堂 98堂 强化脚本
// @namespace    http://tampermonkey.net/
// @version      0.0.7(2024-08-15)
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
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
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
        };
    } else {
        return {
            getValue: GM_getValue,
            setValue: GM_setValue,
            async deleteValue(key) {
                return await GM_deleteValue(key);
            },
            listValues: GM_listValues,
        };
    }
}

(async function () {
    'use strict';
    const GM = initGM();
    /**
     * quick jump to important contents
     */
    const elementsToCheck = [
        { selector: '.locked strong', text: hasPurchased() ? '已购买' : '前往购买' },
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

    const style = document.createElement('style');
    style.textContent = `
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
`;
    document.head.appendChild(style);

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
            // 更新常规附件按钮
            const attachmentElements = document.querySelectorAll('span[id^="attach_"]');
            attachmentElements.forEach(element => {
                const button = createButton({
                    text: '下载附件',
                    title: element.textContent.trim(),
                    ariaLabel: element.textContent.trim(),
                    onClick: () => scrollToElement(element)
                });
                buttonContainer.appendChild(button);
            });

            // 更新免费附件按钮
            const freeAttachmentElements = document.querySelectorAll('dl.tattl');
            freeAttachmentElements.forEach(element => {
                const tipElement = element.querySelector('.tip');
                if (tipElement && tipElement.textContent.includes('点击文件名下载附件')) {
                    const button = createButton({
                        text: '下载附件',
                        title: element.textContent.trim(),
                        ariaLabel: element.textContent.trim(),
                        onClick: () => scrollToElement(element)
                    });
                    buttonContainer.appendChild(button);
                }
            });
        };

        updateAttachmentButtons();
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

                // 监听表单关闭事件
                const closeObserver = new MutationObserver((mutations, closeObs) => {
                    if (!document.querySelector('#rateform')) {
                        closeObs.disconnect();

                        // 监听 #postlist 内容更新
                        const postlistObserver = new MutationObserver((mutations, postObs) => {
                            // 确保更新已完成
                            setTimeout(() => {
                                updateButtonStates(); // 仅更新按钮状态
                                postObs.disconnect(); // 停止观察
                            }, 1500);
                        });

                        const postlist = document.querySelector('#postlist');
                        if (postlist) {
                            postlistObserver.observe(postlist, { childList: true, subtree: true });
                        }
                    }
                });

                closeObserver.observe(document.body, { childList: true, subtree: true });

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
   * Highling favorite users and today's new posts
   */
    const currentUrl = window.location.href;
    const isUserProfilePage = /mod=space&uid=\d+|space-uid-\d+/.test(currentUrl);
    const isPostListPage = /fid=\d+/.test(currentUrl);

    const createUserListStore = async (storeName) => {
        const usersKey = storeName;
        let users = await GM.getValue(usersKey, {});
        const updateStore = async () => {
            await GM.setValue(usersKey, users);
        };
        return { users, updateStore }
    }

    const { users: favoriteUsers, updateStore: updateFavoriteUsers } = await createUserListStore('favoriteUsers')
    const { users: blockedUsers, updateStore: updateBlockedUsers } = await createUserListStore('blockedUsers')

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

})();
