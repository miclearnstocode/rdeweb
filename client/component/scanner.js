import {$} from '../lib/lib.js'

export const Scanner=()=>{

    return($({
        tag:'div',
        style:{
            height:'5vh',
            width:'5vw',
            backgroundColor:'#555',
            position:'absolute',
            right:'1vw',
            top:'1vh',
            display:'flex',
            border:'solid thin #999',
            borderRadius:'1vw',
            padding:'1rem'
        },
        child:[
            $({
                tag:'div',
                att:{
                    className:''
                }
            })
        ]
    }))
}