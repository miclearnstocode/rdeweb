import {$} from "../lib/lib.js";
import {Route, Switch} from "../lib/Router.js";
import {CodeReceiver, NewPassword} from "./Code.js";


export const Retrieval=()=>{

    const codeState=(sessionStorage.getItem('code_retrieval')!==undefined)

    return($({
        tag:'div',
        style:{
            height:'fit-content',
            width:'100%',
            display:'flex',
        },
        child:Switch({
            indexPath:2,
            components:[
                Route('index',{
                    element:[
                        $({
                            tag:'div',
                            style:{
                                margin:'auto',
                                marginTop:'20vh',
                                border:'solid thin #222'
                            },
                            child:[,

                                CodeReceiver()
                            ]
                        })
                    ]
                }),
                Route('code',{
                    element:[
                        $({
                            tag:'div',
                            style:{
                                margin:'auto',
                                marginTop:'20vh',
                                border:'solid thin #222'
                            },
                            child:[
                                NewPassword()
                            ]
                        })
                    ],
                    auth:codeState
                })
            ]
        })
    }))
}