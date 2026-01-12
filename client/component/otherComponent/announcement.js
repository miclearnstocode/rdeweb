import {$} from '../../lib/lib.js'

export const PopUp=(message)=>{
    const messagePanel=()=>{

        return($({
            tag:'div',
            style:{
                position:'absolute',
                left:'0',
                bottom:'0',
                width:'50vw',
                height:'20vw',
                backgroundColor:'red',
                zIndex:'99999'
            },
            text:message,
            elementHandler:(el)=>{
                setTimeout(()=>{el.remove()},10000)
            }
        }))
    }
    document.body.appendChild(messagePanel())
}