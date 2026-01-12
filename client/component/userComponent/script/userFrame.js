import {$} from '../../../lib/lib.js'
import {InboxPanel} from "./inbox.js";

export const Inbox=()=>{
    return($({
        tag:'div',
        att:{
            className: 'inboxFrame'
        },
        child:[
            InboxPanel()
        ]
    }))
}

export const Sent=()=>{
    return($({
        tag:'div',
        child:[
            $({
                tag:'h2',
                text:'this is Sent items'
            })
        ]
    }))
}


export const Frame=(props)=>{
    return($({
        tag:'div',
        externalStyle:'/client/component/userComponent/userComponentStyle/frame.css',
        att:{
            className:'userFrame'
        },
       elementHandler:props.getFrame
    }))
}
