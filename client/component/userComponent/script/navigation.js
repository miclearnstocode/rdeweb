import {$} from '../../../lib/lib.js'

export const Button=({icon,label,eventHandler})=>{
    let td=[]
    if(icon){
        td.push({
            type: icon.type,
            text: icon.text,
            class:icon.class
        })
    }
    if(label){
        td.push({
            type: label.type,
            text: label.text,
            class:label.class
        })
    }
    const getTr=(element)=>{
        td.forEach(val=>{
            if(val.type==='icon'){
                element.appendChild($({
                    tag:'td',
                    att:{
                        className:val.class,
                    },
                    child:[
                        $({
                            tag:'span',
                            att:{
                                className:val.text,
                            },
                        })
                    ]
                }))
            }else {
                element.appendChild($({
                    tag:'td',
                    att:{
                        className:val.class
                    },
                    style:{
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontSize:'1vw',
                        textIndent:'1vw'
                    },
                    text:val.text
                }))
            }

        })
    }

    return($({
        tag:'table',
        att:{
            className: 'navBot'
        },
        style: {
            borderRadius: '8px',
            overflow: 'hidden'
        },
        event:{
            type:'click',
            method:eventHandler
        },
        child:[
            $({
                tag:'tr',
                elementHandler:getTr
            })
        ]
    }))
}

export const NavBar=(props)=>{
    return ($({
        tag:'div',
        externalStyle:'/client/component/userComponent/userComponentStyle/navBar.css',
        elementHandler:props.getNav,
        att:{
            className:'navBar'
        },
        child:[]
    }))
}
