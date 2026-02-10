import {$, baseCheck, Request} from '../../../lib/lib.js'
import {ScoreBoard} from "./score.js";
import {CommentBoard} from "./commentpanel.js";

export const EntryView=({docId,title,eventId,centerId})=>{
    let mainPanel,sidePanelScore,sidePanelComment
    const panelState={
        comment:false,
        score:false
    }

    function ChangePanel({name}){
        if(name==='comment'){
            panelState.comment=!panelState.comment
            if(panelState.comment){
                sidePanelComment.className='commentboard'
                if(panelState.score){
                    mainPanel.style.width='20%'
                }else {
                    mainPanel.style.width='60%'
                }
            }else {
                sidePanelComment.className='commentboardClose'
                if(panelState.score){
                    mainPanel.style.width='60%'
                }else {
                    mainPanel.style.width='100%'
                }
            }
        }
        if(name==='score'){
            panelState.score=!panelState.score
            if(panelState.score){
                sidePanelScore.className='scoreboard'
                if(panelState.comment){
                    mainPanel.style.width='20%'
                }else {
                    mainPanel.style.width='60%'
                }
            }else {
                sidePanelScore.className='scoreboardClose'
                if(panelState.comment){
                    mainPanel.style.width='60%'
                }else {
                    mainPanel.style.width='100%'
                }
            }
        }
    }
    let closeState
    const CloseState=({base,raw})=>{
        closeState={base,raw}
    }


    const MainPanel=(fileUrl)=>{
        // Check if this is a Google Drive URL
        const isGoogleDrive = fileUrl.includes('drive.google.com');
        
        // Use Google Drive embed URL if it's a Google Drive file
        let embedUrl = fileUrl;
        if (isGoogleDrive) {
            // Extract file ID from Google Drive URL if needed
            if (fileUrl.includes('/file/d/')) {
                const match = fileUrl.match(/\/file\/d\/([^\/]+)/);
                if (match && match[1]) {
                    embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
                }
            }
        }

        return($({
            tag:'div',
            style:{
                width: '90vw',
                height:'93vh',
                backgroundColor:'black',
                margin:'auto',
                border:'solid thin deepskyblue',
                padding:'.5rem',
                borderRadius:'.5rem',
                display:'flex',
            },
            child:[
                $({
                    tag:'embed',
                    att:{
                        src: embedUrl,
                        type:'application/pdf',
                    },
                    style:{
                        margin:'auto',
                        width:'100%',
                        height: '100%',
                    },
                    elementHandler:(el)=>{
                        mainPanel=el
                    }
                }),
                $({
                    tag:'div',
                    att:{
                        className:'scoreboardClose '
                    },
                    elementHandler:(el)=>{
                        sidePanelScore=el
                    },
                    child:[
                        ScoreBoard({
                            resId:docId,
                            eventId:eventId,
                            category:centerId
                        })
                    ]
                }),
                $({
                    tag:'div',
                    att:{
                        className:'commentboardClose'
                    },
                    elementHandler:(el)=>{
                        sidePanelComment=el
                    },
                    child:[
                        CommentBoard({
                            title:title,
                            docId:docId,
                            closeState:CloseState
                        })
                    ]
                }),

            ]
        }))
    }
    
    const SideTools=()=>{
        let BotComState=false;
        const Close=()=>{
            return($({
                tag:'div',
                style:{
                    width: 'fit-content',
                    height: 'fit-content',
                    margin: 'auto',
                    marginTop: '2vh',
                    fontSize:'2vw',
                    color:'deepskyblue',
                    cursor:'pointer',
                    border:'solid thin #bbb',
                    padding:'.2rem',
                    backgroundColor:'#333',
                    borderRadius:'.5vw'
                },
                att:{
                    title:'Close',
                },
                event:{
                    type:'click',
                    method:(el)=>{
                        let saveState=true;

                        if(baseCheck(closeState.base,closeState.raw)){

                            saveState=confirm("Do you want to exit without saving your data?")
                        }
                        if(saveState){
                            window.location.replace('/evaluator')
                        }


                    }
                },
                child:[
                    $({
                        tag:'span',
                        att:{
                            className:'fa-solid fa-arrow-right-from-bracket'
                        }
                    })
                ]
            }))
        }
        const Comment=()=>{
            return($({
                tag:'button',
                att:{
                    className:'fa-solid fa-file-pen',
                    title:'comments',
                    name:'comment',
                    'aria-hidden': 'false'
                },
                style:{
                    backgroundColor:'#333',
                    border:'solid thin #bbb',
                    color:'deepskyblue',
                    outline:'none',
                    fontSize: '1.5vw',
                    textAlign:'center',
                    width:'fit-content',
                    height:'5.5vh',
                    borderRadius:'.5vw',
                    marginTop: '2vh',
                    cursor:'pointer'
                },
                event:{
                    type:'click',
                    method:(eve)=>{
                        BotComState=!BotComState
                        if(BotComState){
                            eve.target.style.color="red"
                        }else {
                            eve.target.style.color="deepskyblue"
                        }
                        ChangePanel(eve.target)
                    }
                },
            }))
        }
        const ScoreBoard=()=>{
            let scoreBotState=false
            return($({
                tag:'button',
                att:{
                    className:'fa-solid fa-chalkboard',
                    title:'ScoreBoard',
                    name:'score',
                    'aria-hidden': 'false'
                },
                event:{
                    type:'click',
                    method:(eve)=>{
                        scoreBotState=!scoreBotState
                        if(scoreBotState){
                            eve.target.style.color="red"
                        }else {
                            eve.target.style.color="deepskyblue"
                        }
                        ChangePanel(eve.target)
                    }
                },
                style:{
                    backgroundColor:'#333',
                    border:'solid thin #bbb',
                    color:'deepskyblue',
                    outline:'none',
                    fontSize: '1.5vw',
                    textAlign:'center',
                    width:'fit-content',
                    height:'5.5vh',
                    borderRadius:'.5vw',
                    marginTop: '2vh',
                    cursor:'pointer'
                }
            }))
        }
        return($({
            tag:'div',
            style:{
                width:'4.5vw',
                backgroundColor: '#555',
                height: '50vh',
                margin:'auto',
                border:'solid thin #bbb',
                display:'flex'
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        width:'fit-content',
                        margin:'auto',
                        height:'100%'
                    },
                    child:[
                        Close(),
                        Comment(),
                        $({tag:'div'}),
                        ScoreBoard()
                    ]

                })
            ]
        }))
    }
    
    return($({
        tag:'div',
        style:{
            width:'100%',
            height:'100%',
            position:'absolute',
            top:'0',
            left:'0',
            display:'flex',
            backgroundColor:'#333'
        },
        elementHandler:(el)=>{
            // Changed endpoint from '/entrycount' to match backend
            const req= new Request('/uploadResearchFile')
            req.Post([
                {
                    name:'viewDocReq', // Changed to match backend POST parameter
                    value:'1'
                },
                {
                    name:'docId',
                    value: docId
                }
            ])
            req.Json()
            req.Send().then(data=>{
                if(data.status && data.data){
                    // data.data contains the Google Drive URL from backend
                    el.appendChild(MainPanel(data.data))
                    el.appendChild(SideTools())
                }else {
                    window.location.replace('/evaluator')
                }
            }).catch(err=>{
                console.error('Error loading entry view:', err)
                el.innerHTML='<div style="color:red;padding:20px">Error loading entry. Please refresh the page.</div>'
            })
        },
    }))
}