import {$} from '../../../lib/lib.js'
import {EntryView} from "./entryview.js";
//this will show the list of documents that are assigned to the evaluator
export const EntryList=({title,author,docId,index,campus,status,eventId,catId})=>{
    const base=window.location.href
    const url=base.replace(window.location.origin,'').split('/')
    if(url[2]==='viewdocs'){
        document.getElementById('root').appendChild(EntryView({
            docId:url[3],
            title:title,
            eventId:eventId,
            catId:catId
        }))
    }
    return($({
        tag:'div',
        style:{
            width:'95%',
            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
            fontSize:'1vw',
            margin:'2vh auto',
            cursor:'pointer',
            borderBottom:'solid thin #555',
            padding: '.2rem',
            borderRadius: '.5vw'
        },
        att:{
            className:'listClass'
        },
        child:[
            $({
                tag:'div',
                style:{
                    width: 'fit-content',
                    display:'flex',
                    padding:'.3rem',
                    paddingLeft:'.5vw',
                    paddingRight:'.3vw',
                    borderBottom: 'solid thin #555',
                    borderRadius:'.5rem',
                    backgroundImage:'linear-gradient(to right,#222,transparent,#222)',
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            width:'fit-content',
                            height:'fit-content',
                            margin:'auto',
                            marginLeft:'1vw',
                            marginRight: '0'
                        },
                        child:[
                            $({
                                tag:'span',
                                text:'Author : ',
                                style:{
                                    color: 'deepskyblue'
                                }
                            }),
                            $({
                                tag:'span',
                                text:author,
                                style:{
                                    color: '#999'
                                }
                            })
                        ]
                    }),
                    $({
                        tag:'div',
                        style:{
                            width:'fit-content',
                            height: 'fit-content',
                            margin: 'auto',
                            marginLeft: '1vw',
                            marginRight:'auto',
                        },
                        child:[
                            $({
                                tag:'span',
                                text:"Campus : ",
                                style:{
                                    color: 'deepskyblue'
                                }
                            }),
                            $({
                                tag:'span',
                                text:campus,
                                style:{
                                    color: '#999'
                                }
                            })
                        ]
                    })
                ]
            }),
            $({
                tag:'div',
                text:`"${title}"`,
                style:{
                    color:status?'deepskyblue':'#bbb'
                }
            }),
        ],
        event:{
            type:'click',
            method:(eve)=>{
                window.location.assign('/evaluator/viewdocs/'+docId)
            }
        }
    }))
}