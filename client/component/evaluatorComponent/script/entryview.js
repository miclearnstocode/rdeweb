import { $, baseCheck, Request } from '../../../lib/lib.js'
import { ScoreBoard } from "./score.js";
import { CommentBoard } from "./commentpanel.js";

export const EntryView = ({ docId, title, eventId, centerId, categoryId, userType }) => {
    let mainPanel, sidePanelScore, sidePanelComment
    const panelState = {
        comment: false,
        score: false
    }

    function ChangePanel({ name }) {
        if (name === 'comment') {
            panelState.comment = !panelState.comment
            if (panelState.comment) {
                sidePanelComment.className = 'commentboard'
                if (panelState.score) {
                    mainPanel.style.width = '20%'
                } else {
                    mainPanel.style.width = '60%'
                }
            } else {
                sidePanelComment.className = 'commentboardClose'
                if (panelState.score) {
                    mainPanel.style.width = '60%'
                } else {
                    mainPanel.style.width = '100%'
                }
            }
        }
        if (name === 'score') {
            panelState.score = !panelState.score
            if (panelState.score) {
                sidePanelScore.className = 'scoreboard'
                if (panelState.comment) {
                    mainPanel.style.width = '20%'
                } else {
                    mainPanel.style.width = '60%'
                }
            } else {
                sidePanelScore.className = 'scoreboardClose'
                if (panelState.comment) {
                    mainPanel.style.width = '60%'
                } else {
                    mainPanel.style.width = '100%'
                }
            }
        }
    }
    let closeState
    const CloseState = ({ base, raw }) => {
        closeState = { base, raw }
    }
    const MainPanel = (fileUrl) => {
        const isGoogleDrive = fileUrl.includes('drive.google.com');
        let embedUrl = fileUrl;
        if (isGoogleDrive) {
            if (fileUrl.includes('/file/d/')) {
                const match = fileUrl.match(/\/file\/d\/([^\/]+)/);
                if (match && match[1]) {
                    embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
                }
            }
        }

        return ($({
            tag: 'div',
            style: {
                width: '90vw',
                height: '85vh',
                backgroundColor: '#ffffff',
                margin: 'auto',
                border: '1px solid #e8ecf1',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                overflowY: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                zIndex: '20'
            },
            child: [
                $({
                    tag: 'embed',
                    att: {
                        src: embedUrl,
                        type: 'application/pdf',
                    },
                    style: {
                        margin: 'auto',
                        width: '100%',
                        height: '100%',
                        borderRadius: '8px',
                    },
                    elementHandler: (el) => {
                        mainPanel = el
                    }
                }),
                $({
                    tag: 'div',
                    att: {
                        className: 'scoreboardClose '
                    },
                    elementHandler: (el) => {
                        sidePanelScore = el
                    },
                    child: [
                        ScoreBoard({
                            resId: docId,
                            eventId: eventId,
                            center: centerId,
                            categoryId: categoryId,
                            userType: userType
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    att: {
                        className: 'commentboardClose'
                    },
                    elementHandler: (el) => {
                        sidePanelComment = el
                    },
                    child: [
                        CommentBoard({
                            title: title,
                            docId: docId,
                            closeState: CloseState
                        })
                    ]
                }),
            ]
        }))
    }

    const SideTools = () => {
        let BotComState = false;
        let scoreBotState = false;

        const Close = () => {
            const closeContainer = document.createElement('div');
            closeContainer.style.cssText = `
                width: 80px;
                height: fit-content;
                margin: auto;
                margin-top: 3vh;
                font-size: 24px;
                color: #64748b;
                cursor: pointer;
                border: 1px solid #e2e8f0;
                padding: 8px;
                background-color: #ffffff;
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            `;
            closeContainer.setAttribute('title', 'Close Entry');

            const icon = document.createElement('span');
            icon.className = 'fa-solid fa-xmark';
            icon.style.cssText = 'font-size: 28px;';

            const label = document.createElement('div');
            label.style.cssText = `
                font-size: 11px;
                font-weight: 500;
                margin-top: 4px;
                color: #64748b;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;
            label.textContent = 'Close';

            closeContainer.addEventListener('mouseenter', () => {
                closeContainer.style.borderColor = '#ef4444';
                closeContainer.style.boxShadow = '0 4px 12px rgba(239,68,68,0.15)';
                closeContainer.querySelector('span').style.color = '#ef4444';
                closeContainer.querySelector('div:last-child').style.color = '#ef4444';
            });
            closeContainer.addEventListener('mouseleave', () => {
                closeContainer.style.borderColor = '#e2e8f0';
                closeContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                closeContainer.querySelector('span').style.color = '#64748b';
                closeContainer.querySelector('div:last-child').style.color = '#64748b';
            });

            closeContainer.addEventListener('click', () => {
                let saveState = true;
                if (baseCheck(closeState.base, closeState.raw)) {
                    saveState = confirm("Do you want to exit without saving your data?")
                }
                if (saveState) {
                    window.location.replace('/evaluator')
                }
            });

            closeContainer.appendChild(icon);
            closeContainer.appendChild(label);

            return closeContainer;
        }

        const Comment = () => {
            const commentContainer = document.createElement('div');
            commentContainer.style.cssText = `
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                color: #64748b;
                outline: none;
                font-size: 24px;
                text-align: center;
                width: 80px;
                height: auto;
                border-radius: 10px;
                margin-top: 2vh;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            `;
            commentContainer.setAttribute('title', 'Open/Close Comments Panel');
            commentContainer.setAttribute('name', 'comment');

            const icon = document.createElement('span');
            icon.className = 'fa-solid fa-comment';
            icon.style.cssText = 'font-size: 26px;';

            const label = document.createElement('span');
            label.style.cssText = `
                font-size: 11px;
                font-weight: 500;
                margin-top: 4px;
                color: #64748b;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;
            label.textContent = 'Comments';

            commentContainer.addEventListener('mouseenter', () => {
                commentContainer.style.borderColor = '#3b82f6';
                commentContainer.style.boxShadow = '0 4px 12px rgba(59,130,246,0.15)';
                commentContainer.querySelector('span:first-child').style.color = '#3b82f6';
                commentContainer.querySelector('span:last-child').style.color = '#3b82f6';
            });
            commentContainer.addEventListener('mouseleave', () => {
                if (!BotComState) {
                    commentContainer.style.borderColor = '#e2e8f0';
                    commentContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    commentContainer.querySelector('span:first-child').style.color = '#64748b';
                    commentContainer.querySelector('span:last-child').style.color = '#64748b';
                }
            });

            commentContainer.addEventListener('click', (e) => {
                BotComState = !BotComState;

                if (BotComState) {
                    commentContainer.style.borderColor = '#3b82f6';
                    commentContainer.style.boxShadow = '0 4px 12px rgba(59,130,246,0.2)';
                    commentContainer.querySelector('span:first-child').style.color = '#3b82f6';
                    commentContainer.querySelector('span:last-child').style.color = '#3b82f6';
                } else {
                    commentContainer.style.borderColor = '#e2e8f0';
                    commentContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    commentContainer.querySelector('span:first-child').style.color = '#64748b';
                    commentContainer.querySelector('span:last-child').style.color = '#64748b';
                }

                ChangePanel({ name: 'comment' });
            });

            commentContainer.appendChild(icon);
            commentContainer.appendChild(label);

            return commentContainer;
        }

        const ScoreBoardButton = () => {
            const scoreContainer = document.createElement('div');
            scoreContainer.style.cssText = `
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                color: #64748b;
                outline: none;
                font-size: 24px;
                text-align: center;
                width: 80px;
                height: auto;
                border-radius: 10px;
                margin-top: 2vh;
                margin-bottom: 3vh;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            `;
            scoreContainer.setAttribute('title', 'Open/Close Scoreboard Panel');
            scoreContainer.setAttribute('name', 'score');

            const icon = document.createElement('span');
            icon.className = 'fa-solid fa-star';
            icon.style.cssText = 'font-size: 26px;';

            const label = document.createElement('span');
            label.style.cssText = `
                font-size: 11px;
                font-weight: 500;
                margin-top: 4px;
                color: #64748b;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;
            label.textContent = 'Score';

            scoreContainer.addEventListener('mouseenter', () => {
                scoreContainer.style.borderColor = '#8b5cf6';
                scoreContainer.style.boxShadow = '0 4px 12px rgba(139,92,246,0.15)';
                scoreContainer.querySelector('span:first-child').style.color = '#8b5cf6';
                scoreContainer.querySelector('span:last-child').style.color = '#8b5cf6';
            });
            scoreContainer.addEventListener('mouseleave', () => {
                if (!scoreBotState) {
                    scoreContainer.style.borderColor = '#e2e8f0';
                    scoreContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    scoreContainer.querySelector('span:first-child').style.color = '#64748b';
                    scoreContainer.querySelector('span:last-child').style.color = '#64748b';
                }
            });

            scoreContainer.addEventListener('click', (e) => {
                scoreBotState = !scoreBotState;

                if (scoreBotState) {
                    scoreContainer.style.borderColor = '#8b5cf6';
                    scoreContainer.style.boxShadow = '0 4px 12px rgba(139,92,246,0.2)';
                    scoreContainer.querySelector('span:first-child').style.color = '#8b5cf6';
                    scoreContainer.querySelector('span:last-child').style.color = '#8b5cf6';
                } else {
                    scoreContainer.style.borderColor = '#e2e8f0';
                    scoreContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    scoreContainer.querySelector('span:first-child').style.color = '#64748b';
                    scoreContainer.querySelector('span:last-child').style.color = '#64748b';
                }

                ChangePanel({ name: 'score' });
            });

            scoreContainer.appendChild(icon);
            scoreContainer.appendChild(label);

            return scoreContainer;
        }

        const Spacer = () => {
            const spacer = document.createElement('div');
            spacer.style.height = '8px';
            return spacer;
        }

        const container = document.createElement('div');
        container.style.cssText = `
            width: fit-content;
            background-color: #ffffff;
            height: fit-content;
            margin: auto;
            border: 1px solid #e8ecf1;
            display: flex;
            border-radius: 14px;
            overflow-y: hidden;
            padding: 12px 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        `;

        const innerContainer = document.createElement('div');
        innerContainer.style.cssText = `
            width: fit-content;
            margin: auto;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;

        innerContainer.appendChild(Close());
        innerContainer.appendChild(Spacer());
        innerContainer.appendChild(Comment());
        innerContainer.appendChild(Spacer());
        innerContainer.appendChild(ScoreBoardButton());

        container.appendChild(innerContainer);

        return container;
    }

    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: '0',
            left: '0',
            display: 'flex',
            backgroundColor: '#f1f5f9',
            overflowY: 'hidden'
        },
        elementHandler: (el) => {
            const req = new Request('/uploadResearchFile')
            req.Post([
                {
                    name: 'viewDocReq',
                    value: '1'
                },
                {
                    name: 'docId',
                    value: docId
                }
            ])
            req.Json()
            req.Send().then(data => {
                if (data.status && data.data) {
                    el.appendChild(MainPanel(data.data))
                    el.appendChild(SideTools())
                } else {
                    window.location.replace('/evaluator')
                }
            }).catch(err => {
                console.error('Error loading entry view:', err)
                el.innerHTML = '<div style="color:#ef4444;padding:20px;text-align:center;font-family:system-ui;">Error loading entry. Please refresh the page.</div>'
            })
        },
    }))
}