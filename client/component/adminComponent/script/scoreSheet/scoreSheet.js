import {$, Request} from '../../../../lib/lib.js'
import {LeftScore} from "./leftScorePan.js";
import {RightScore} from "./rightScorePan.js";




export const AddScoreSheet=({id,eventID,name})=>{

    const head=()=>{
        return($({
            tag:'div',
            style:{
                height: '8%',
                width: '100%',
                borderBottom:'solid thin #444',
                display:'flex',
                position: 'relative'
            },
            child:[
                $({
                    tag:'a',
                    style:{
                        margin: 'auto',
                        marginLeft:'1vw',
                        marginRight:'auto',
                        fontSize: '1.2vw',
                        color: 'deepskyblue',
                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        textDecoration:'none'
                    },
                    text:'Back ',
                    att:{
                        href:'/admin/events'
                    },
                    child:[
                        $({
                            tag:'span',
                            att:{
                                className:'fa-solid fa-right-to-bracket'
                            }
                        })
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        margin:'auto',
                        height:'fit-content',
                        width:'90%',
                        fontSize:'1.5vw',
                        fontFamily:'arial black,sans serif',
                        color:'#222',
                        textAlign: "center",
                        textShadow:'0 0 .2rem  white',
                        fontWeight:'bold'
                    },
                    text:name+' Score Criteria'
                })
            ]
        }))
    }

    const Body=()=> {
        let mainParent
        return($({
            tag:'div',
            style:{
                height:'91.5%',
                width:'100%',
                display: 'flex'
            },
            child:[
                LeftScore(eventID,id),
                RightScore(eventID,id)
            ]
        }))
    }


    return($({
        tag:'div',
        style:{
          width:'100%',
            height:'100%',
            backgroundColor:'#222',
            position:'absolute',
            top:'0',
            left:'0'
        },
        child:[
            head(),
            Body()
        ],
        elementHandler:()=>{

        }
    }))
}