import {$, UnderConstruction} from '../lib/lib.js';
import {NavBar} from "./userComponent/script/navigation.js";
import {Frame} from "./userComponent/script/userFrame.js";
import {Button} from "./userComponent/script/navigation.js";
import {Research} from "./userComponent/script/research.js";
import {Error} from "../error.js";
import {Header} from "./otherComponent/header.js";
import {Settings} from "./userComponent/script/settings.js";
import {Create} from "./userComponent/script/create.js";
import {Files} from "./userComponent/script/Files.js";
import {ReqButton} from "./userComponent/script/Request.js";

const tabsButton=[]
//uploading event documents and files for research and other purposes, also to view the uploaded documents and files by the user.
tabsButton.push({
    url:'/user/research/submittedDocs/submittedFiles',
    button:Button({
        icon:{
            type:'icon',
            text:'fa fa-calendar',
            class: 'tabsIcon'
        },
        label:{
            type: 'label',
            text: 'Event/Activity Documents',
            class:'tabsButton'
        },
        eventHandler:()=>{
            window.location.assign('/user/research/submittedDocs/submittedFiles')
        },
    }),
    page:Research,
    disabled: false
})

//for uploading proposal - DISABLED
tabsButton.push({
    url:'/user/create/share',
    button:Button({
        icon:{
            type:'icon',
            text:'fa fa-file-text',
            class: 'tabsIcon'
        },
        label:{
            type: 'label',
            text: 'Activity Proposal',
            class:'tabsButton'
        },
        eventHandler:()=>{
            // Show under construction notification
                document.body.appendChild(UnderConstruction({
                message: "Activity Proposal feature is currently under construction",
            }))
        }
    }),
    page:Create,
    disabled: true
})

// Communication - DISABLED
tabsButton.push({
    url:'/user/systemFiles',
    button:Button({
        icon:{
            type:'icon',
            text:'fa fa-paper-plane-o',
            class: 'tabsIcon'
        },
        label:{
            type: 'label',
            text: 'Communication',
            class:'tabsButton'
        },
        eventHandler:()=>{
            // Show under construction notification
                document.body.appendChild(UnderConstruction({
                message: "Communication feature is currently under construction",
            }))
        },
    }),
    page:Files,
    disabled: true
})

// Settings - ENABLED
tabsButton.push({
    url:'/user/settings/userInfo',
    button:Button({
        icon:{
            type:'icon',
            text:'fa fa-sliders',
            class: 'tabsIcon'
        },
        label:{
            type: 'label',
            text: 'Settings',
            class:'tabsButton'
        },
        eventHandler:()=>{
            window.location.assign('/user/settings/userInfo')
        },
    }),
    page:Settings,
    disabled: false
})

//Logo of RDE
export const UserPanel = () => {
    /* Modern User Panel with improved design */
    const Props = {
        getNav: (nav) => {
            nav.appendChild($({
                tag: 'div',
                att: {
                    className: 'modern-logo'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'logo-container'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'logo-r'
                                },
                                text: 'R'
                            }),
                            $({
                                tag: 'span',
                                att: {
                                    className: 'logo-d'
                                },
                                text: 'D'
                            }),
                            $({
                                tag: 'span',
                                att: {
                                    className: 'logo-e'
                                },
                                text: 'E'
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'logo-text'
                        },
                        text: 'Research Development and Extension'
                    })
                ]
            }))
            
            nav.appendChild(ReqButton());
            
            const currentPath = window.location.href.replace(window.location.origin, '');
            const currentMainSection = currentPath.split('/')[2];
            
            tabsButton.forEach(val => {
                const buttonWrapper = $({
                    tag: 'div',
                    att: {
                        className: 'nav-item-wrapper'
                    },
                    child: [val.button]
                });
                
                // Apply active class based on URL match
                if (val.url.split('/')[2] === currentMainSection) {
                    val.button.className += ' active-nav';
                }
                
                // Add disabled class if tab is disabled
                if (val.disabled) {
                    val.button.className += ' disabled-tab';
                }
                
                nav.appendChild(buttonWrapper);
            });
        },
        getFrame: (frame) => {
            frame.className = 'modern-frame';
            
            const currentPath = window.location.href.replace(window.location.origin, '');
            const currentMainSection = currentPath.split('/')[2];
            
            // Check if current URL matches a disabled tab
            const matchingDisabledTab = tabsButton.find(tab => 
                tab.disabled && tab.url.split('/')[2] === currentMainSection
            );
            
            // If trying to access a disabled tab, redirect to Event Documents
            if (matchingDisabledTab) {
                const eventDocsTab = tabsButton.find(tab => !tab.disabled && tab.url.includes('/research/'));
                if (eventDocsTab) {
                    const pageWrapper = $({
                        tag: 'div',
                        att: {
                            className: 'page-wrapper'
                        },
                        child: [eventDocsTab.page()]
                    });
                    frame.appendChild(pageWrapper);
                    history.pushState({}, '', eventDocsTab.url);
                    return;
                }
            }
            
            // Check if current URL matches an enabled tab
            const matchingEnabledTab = tabsButton.find(tab => 
                !tab.disabled && tab.url.split('/')[2] === currentMainSection
            );
            
            if (matchingEnabledTab) {
                const pageWrapper = $({
                    tag: 'div',
                    att: {
                        className: 'page-wrapper'
                    },
                    child: [matchingEnabledTab.page()]
                });
                frame.appendChild(pageWrapper);
            } else {
                // Default to Event Documents
                const eventDocsTab = tabsButton.find(tab => !tab.disabled && tab.url.includes('/research/'));
                if (eventDocsTab) {
                    const pageWrapper = $({
                        tag: 'div',
                        att: {
                            className: 'page-wrapper'
                        },
                        child: [eventDocsTab.page()]
                    });
                    frame.appendChild(pageWrapper);
                    history.pushState({}, '', eventDocsTab.url);
                } else {
                    frame.appendChild(Error());
                }
            }
        }
    }
    
    document.getElementById('root').appendChild(Header());
    
    return ($({
        tag: 'div',
        externalStyle: '/client/component/userComponent/userComponentStyle/user.css',
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'modern-user-panel'
                },
                child: [
                    NavBar(Props),
                    Frame(Props)
                ]
            })
        ]
    }))
}