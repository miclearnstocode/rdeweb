import {$} from '../lib/lib.js';
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
            text:'fa fa-book',
            class: 'tabsIcon'
        },
        label:{
            type: 'label',
            text: 'Event Documents',
            class:'tabsButton'
        },
        eventHandler:()=>{
            window.location.assign('/user/research/submittedDocs/submittedFiles')
        },
    }),
    page:Research
})

//for uploading proposal
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
            window.location.assign('/user/create/share')
        }
    }),
    page:Create
})

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
        //   alert("This feature is currently unavailable.")
           window.location.assign('/user/systemFiles/personal')
        },
    }),
    page:Files
})

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
    page:Settings
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
            
            // Track if any tab matches the current URL
            let foundActiveTab = false;
            
            tabsButton.forEach(val => {
                const buttonWrapper = $({
                    tag: 'div',
                    att: {
                        className: 'nav-item-wrapper'
                    },
                    child: [val.button]
                });
                
                // Check if this tab matches the current URL
                if (val.url.split('/')[2] === currentMainSection) {
                    foundActiveTab = true;
                    val.button.className += ' active-nav';
                    let td = val.button.getElementsByTagName('td');
                    for (let x = 0; x < td.length; x++) {
                        td[x].style.color = '#00bcd4';
                    }
                }
                
                nav.appendChild(buttonWrapper);
            });
            
            // If no tab matches the URL, make Event Documents (first tab) active
            if (!foundActiveTab) {
                // Find the Event Documents tab (first tab with research in URL)
                const eventDocsTab = tabsButton.find(tab => tab.url.includes('/research/'));
                if (eventDocsTab) {
                    eventDocsTab.button.className += ' active-nav';
                    let td = eventDocsTab.button.getElementsByTagName('td');
                    for (let x = 0; x < td.length; x++) {
                        td[x].style.color = '#00bcd4';
                    }
                }
            }
        },
        getFrame: (frame) => {
            let urlState = true;
            frame.className = 'modern-frame';
            
            const currentPath = window.location.href.replace(window.location.origin, '');
            const currentMainSection = currentPath.split('/')[2];
            
            tabsButton.forEach(val => {
                if (val.url.split('/')[2] === currentMainSection) {
                    urlState = false;
                    const pageWrapper = $({
                        tag: 'div',
                        att: {
                            className: 'page-wrapper'
                        },
                        child: [val.page()]
                    });
                    frame.appendChild(pageWrapper);
                }
            });
            
            // If no matching tab found, show Event Documents (Research) by default
            if (urlState) {
                // Find the Event Documents tab (first tab with research in URL)
                const eventDocsTab = tabsButton.find(tab => tab.url.includes('/research/'));
                if (eventDocsTab) {
                    const pageWrapper = $({
                        tag: 'div',
                        att: {
                            className: 'page-wrapper'
                        },
                        child: [eventDocsTab.page()]
                    });
                    frame.appendChild(pageWrapper);
                    
                    // Also update the URL to match Event Documents without reloading
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