import { $ } from '../lib/lib.js'
import { AddUser } from "./adminComponent/script/addUser.js";
import { Header } from "./otherComponent/header.js";
import { AccountList } from "./adminComponent/script/account.js";
import { Files } from "./adminComponent/script/file.js";
import { Events } from "./adminComponent/script/events.js";
import { Recommendation } from "./adminComponent/script/recommendation.js";
import { DocumentLog } from "./adminComponent/script/documentLog.js";
import { Override } from "./adminComponent/script/override.js";
import { ExternalAccount } from "./adminComponent/script/externalUser.js";

const pages = []

pages.push({
    url: '/admin/addAccount',
    button: $({
        tag: 'div',
        att: {
            className: 'botTabsDiv'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'navItem'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'navIcon fa-solid fa-user-plus'
                        }
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navLabel'
                        },
                        text: 'Add User'
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navArrow'
                        },
                        text: '→'
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        window.location.assign('/admin/addAccount')
                    }
                }
            })
        ]
    }),
    page: AddUser
})

pages.push({
    url: '/admin/accountList/CapsuUser',
    button: $({
        tag: 'div',
        att: {
            className: 'botTabsDiv'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'navItem'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'navIcon fa fa-users'
                        }
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navLabel'
                        },
                        text: 'Accounts'
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navArrow'
                        },
                        text: '→'
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        window.location.assign('/admin/accountList/CapsuUser')
                    }
                }
            })
        ]
    }),
    page: AccountList
})

pages.push({
    url: '/admin/addExternalAccount',
    button: $({
        tag: 'div',
        att: {
            className: 'botTabsDiv'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'navItem'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'navIcon fa-solid fa-person-circle-plus'
                        }
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navLabel'
                        },
                        text: 'Add External Accounts'
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navArrow'
                        },
                        text: '→'
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        window.location.assign('/admin/addExternalAccount')
                    }
                }
            })
        ]
    }),
    page: ExternalAccount
})

pages.push({
    url: '/admin/override',
    button: $({
        tag: 'div',
        att: {
            className: 'botTabsDiv'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'navItem'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'navIcon fa-solid fa-sliders-h'
                        }
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navLabel'
                        },
                        text: 'Overrides'
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navArrow'
                        },
                        text: '→'
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        window.location.assign('/admin/override')
                    }
                }
            })
        ]
    }),
    page: Override
})

pages.push({
    url: '/admin/events',
    button: $({
        tag: 'div',
        att: {
            className: 'botTabsDiv'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'navItem'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'navIcon fa-solid fa-calendar-plus'
                        }
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navLabel'
                        },
                        text: 'Events'
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navArrow'
                        },
                        text: '→'
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        window.location.assign('/admin/events')
                    }
                }
            })
        ]
    }),
    page: Events
})

pages.push({
    url: '/admin/files/endorsement',
    button: $({
        tag: 'div',
        att: {
            className: 'botTabsDiv'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'navItem'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'navIcon fa fa-file'
                        }
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navLabel'
                        },
                        text: 'Files'
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navArrow'
                        },
                        text: '→'
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        window.location.assign('/admin/files/endorsement')
                    }
                }
            })
        ]
    }),
    page: Files
})

pages.push({
    url: '/admin/document_logs/communication',
    button: $({
        tag: 'div',
        att: {
            className: 'botTabsDiv'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'navItem'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'navIcon fa-solid fa-clipboard-list'
                        }
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navLabel'
                        },
                        text: 'Document Logs'
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navArrow'
                        },
                        text: '→'
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        window.location.assign('/admin/document_logs/communication')
                    }
                }
            })
        ]
    }),
    page: DocumentLog
})

pages.push({
    url: '/admin/recommendation',
    button: $({
        tag: 'div',
        att: {
            className: 'botTabsDiv'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'navItem'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'navIcon fa-solid fa-lightbulb'
                        }
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navLabel'
                        },
                        text: 'Recommendation'
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'navArrow'
                        },
                        text: '→'
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        window.location.assign('/admin/recommendation')
                    }
                }
            })
        ]
    }),
    page: Recommendation
})

const pageHolder = () => {
    const getContent = (content) => {
        pages.forEach(val => {
            if (val.url.split('/')[2] === window.location.href.replace(window.location.origin, '').split('/')[2]) {
                content.appendChild(val.page())
            }
        })
    }

    const addTabs = (element) => {
        pages.forEach(val => {
            if (val.url.split('/')[2] === window.location.href.replace(window.location.origin, '').split('/')[2]) {
                const navItem = val.button.querySelector('.navItem')
                if (navItem) {
                    navItem.classList.add('active')
                }
            }
            element.appendChild(val.button)
        })
    }

    return ($({
        tag: 'div',
        att: {
            className: 'pageHolder'
        },
        child: [
            $({
                tag: 'aside',
                att: {
                    className: 'tabsNav'
                },
                elementHandler: addTabs
            }),
            $({
                tag: 'div',
                elementHandler: getContent,
                att: {
                    className: 'pageContent'
                },
            })
        ]
    }))
}

export const AdminPanel = () => {
    document.head.append($({
        tag: 'link',
        att: {
            rel: 'stylesheet',
            href: '/client/style/admin.css',
        }
    }))

    document.getElementById('root').appendChild(Header())

    return ($({
        tag: 'div',
        att: {
            className: 'mainPanel adminPanel'
        },
        child: [
            pageHolder()
        ]
    }))
}