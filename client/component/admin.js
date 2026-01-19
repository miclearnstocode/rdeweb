import {$} from '../lib/lib.js'

import {AddUser} from "./adminComponent/script/addUser.js";

import {Header} from "./otherComponent/header.js";

import {AccountList} from "./adminComponent/script/account.js";

import {Files} from "./adminComponent/script/file.js";

import {Events} from "./adminComponent/script/events.js";

import {Recommendation} from "./adminComponent/script/recommendation.js";



import {DocumentLog} from "./adminComponent/script/documentLog.js";

import {Override} from "./adminComponent/script/override.js";
import {ExternalAccount} from "./adminComponent/script/externalUser.js";

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

                tag: 'table',

                att: {

                    className: 'botTable'

                },

                child: [

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                att: {

                                    className: 'iconBot'

                                },

                                child: [

                                    $({

                                        tag: 'span',

                                        att: {

                                            className: 'fa-solid fa-user-plus'

                                        }

                                    })

                                ]

                            }),

                            $({

                                tag: 'td',

                                att: {

                                    className: 'labelBot'

                                },

                                style:{

                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'

                                },

                                text: 'Add User'

                            })

                        ]

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

                tag: 'table',

                att: {

                    className: 'botTable'

                },

                child: [

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                att: {

                                    className: 'iconBot'

                                },

                                child: [

                                    $({

                                        tag: 'span',

                                        att: {

                                            className: 'fa fa-users'

                                        }

                                    })

                                ]

                            }),

                            $({

                                tag: 'td',

                                att: {

                                    className: 'labelBot'

                                },

                                style:{

                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'

                                },

                                text: 'Accounts'

                            })

                        ]

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

                tag: 'table',

                att: {

                    className: 'botTable'

                },

                child: [

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                att: {

                                    className: 'iconBot'

                                },

                                child: [

                                    $({

                                        tag: 'span',

                                        att: {

                                            className: 'fa-solid fa-person-circle-plus'

                                        }

                                    })

                                ]

                            }),

                            $({

                                tag: 'td',

                                att: {

                                    className: 'labelBot'

                                },

                                style:{

                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'

                                },

                                text: 'Add External accounts'

                            })

                        ]

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

                tag: 'table',

                att: {

                    className: 'botTable'

                },

                child: [

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                att: {

                                    className: 'iconBot'

                                },

                                child: [

                                    $({

                                        tag: 'span',

                                        att: {

                                            className: 'fa-solid fa-gears'

                                        }

                                    })

                                ]

                            }),

                            $({

                                tag: 'td',

                                att: {

                                    className: 'labelBot'

                                },

                                style:{

                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'

                                },

                                text: 'Overrides'

                            })

                        ]

                    })

                ]

            })

        ],

        event: {

            type: 'click',

            method: () => {

                window.location.assign('/admin/override')

            }

        }

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

                tag: 'table',

                att: {

                    className: 'botTable'

                },

                child: [

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                att: {

                                    className: 'iconBot'

                                },

                                child: [

                                    $({

                                        tag: 'span',

                                        att: {

                                            className: "fa-solid fa-calendar-plus"

                                        },

                                    })

                                ]

                            }),

                            $({

                                tag: 'td',

                                att: {

                                    className: 'labelBot'

                                },

                                style:{

                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'

                                },

                                text: 'Events'

                            })

                        ]

                    })

                ]

            })

        ],

        event: {

            type: 'click',

            method: () => {

                window.location.assign('/admin/events')

            }

        }

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

                tag: 'table',

                att: {

                    className: 'botTable'

                },

                child: [

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                att: {

                                    className: 'iconBot'

                                },

                                child: [

                                    $({

                                        tag: 'span',

                                        att: {

                                            className: 'fa fa-file'

                                        }

                                    })

                                ]

                            }),

                            $({

                                tag: 'td',

                                att: {

                                    className: 'labelBot'

                                },

                                style:{

                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'

                                },

                                text: 'Files'

                            })

                        ]

                    })

                ]

            })

        ],

        event: {

            type: 'click',

            method: () => {

                window.location.assign('/admin/files/endorsement')

            }

        }

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

                tag: 'table',

                att: {

                    className: 'botTable'

                },

                child: [

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                att: {

                                    className: 'iconBot'

                                },

                                child: [

                                    $({

                                        tag: 'span',

                                        att: {

                                            className: 'fa-solid fa-clipboard-list'

                                        }

                                    })

                                ]

                            }),

                            $({

                                tag: 'td',

                                att: {

                                    className: 'labelBot'

                                },

                                style:{

                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'

                                },

                                text: 'Document Logs'

                            })

                        ]

                    })

                ]

            })

        ],

        event: {

            type: 'click',

            method: () => {

                window.location.assign('/admin/document_logs/communication')

            }

        }

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

                tag: 'table',

                att: {

                    className: 'botTable'

                },

                child: [

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                att: {

                                    className: 'iconBot'

                                },

                                child: [

                                    $({

                                        tag: 'span',

                                        att: {

                                            className: 'fa-solid fa-lightbulb'

                                        }

                                    })

                                ]

                            }),

                            $({

                                tag: 'td',

                                att: {

                                    className: 'labelBot'

                                },

                                style:{

                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'

                                },

                                text: 'Recommendation'

                            })

                        ]

                    })

                ]

            })

        ],

        event: {

            type: 'click',

            method: () => {

                window.location.assign('/admin/recommendation')

            }

        }

    }),

    page: Recommendation

})



/*

pages.push({

    url: '/admin/settings',

    button: $({

        tag: 'div',

        att: {

            className: 'botTabsDiv'

        },

        child: [

            $({

                tag: 'table',

                att: {

                    className: 'botTable'

                },

                child: [

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                att: {

                                    className: 'iconBot'

                                },

                                child: [

                                    $({

                                        tag: 'span',

                                        att: {

                                            className: 'fa-solid fa-gears'

                                        }

                                    })

                                ]

                            }),

                            $({

                                tag: 'td',

                                att: {

                                    className: 'labelBot'

                                },

                                text: 'Settings'

                            })

                        ]

                    })

                ]

            })

        ],

        event: {

            type: 'click',

            method: () => {

                window.location.assign('/admin/settings')

            }

        }

    }),

    page: SettingsPanel

})

 */





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

                val.button.style.color = 'deepskyblue'

                val.button.style.backgroundColor = 'rgba(0,0,0,0.3)'

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

