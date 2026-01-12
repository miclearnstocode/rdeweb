import {$} from '../../lib/lib.js'

export const Update=()=>{
    let pan
    const close=()=>{
            return($({
                tag:'div',
                att:{
                    className:'fa-solid fa-circle-xmark'
                },
                style:{
                    position:"absolute",
                    left: '-2.5vw',
                    top: '0',
                    color:'deepskyblue',
                    cursor:'pointer',
                    fontSize:'2vw'

                },
                event:{
                    type:'click',
                    method:()=>{
                        pan.remove()
                    }
                }
            }))
    }
    const updateMessage=({message})=>{
        return($({
           tag:'div',
            child:[
                $({
                    tag:'div',
                    text:'Date',
                    style:{
                        width:'90%',
                        margin: '1vh auto',
                    }
                }),
                $({
                    tag:'div',
                    style:{
                        width:'90%',
                        margin: ' auto',
                        border:'solid thin deepskyblue',
                        height:'fit-content',
                        padding:'.5rem',
                        backgroundColor:'rgba(0,0,0,0.2)'
                    },
                })
            ]
        }))
    }
    return($({
        tag:'div',
        text:'update Panel',
        style:{
            position:'absolute',
            height:'100%',
            width:'100%',
            left:'0',
            top:'0',
            margin:'auto',
            backgroundImage:'radial-gradient(rgba(100,100,100,0.5),black)'
        },
        elementHandler:(el)=>{
            pan=el
        },
        child:[
            $({
                tag:'div',
                style:{
                    width:'80%',
                    margin:'auto',
                    height:'95%',
                    backgroundColor:'#555',
                    position:'relative',
                    paddingTop:'1vh'
                },
                child:[
                    close(),
                    $({
                        tag:'div',
                        style:{
                            height:'100%',
                            width:'100%',
                            overflowY:'auto',

                        },
                        elementHandler:(el)=>{
                            el.appendChild(updateMessage({
                                message:'HEllsdf ssdf sdfsdf dsfgsdfsdfb o'
                            }))
                        }
                    })
                ],

            })
        ]
    }))
}