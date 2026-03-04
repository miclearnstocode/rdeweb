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
        let scoreBotState=false;
        
        const Close=()=>{
            // Create the close button container
            const closeContainer = document.createElement('div');
            closeContainer.style.cssText = `
                width: 111px;
                height: fit-content;
                margin: auto;
                margin-top: 5vh;
                font-size: 2vw;
                color: deepskyblue;
                cursor: pointer;
                border: solid thin #bbb;
                padding: 0.2rem;
                background-color: #333;
                border-radius: 0.5vw;
                display: flex;
                flex-direction: column;
                align-items: center;
            `;
            closeContainer.setAttribute('title', 'Close Entry');
            
            // Create the icon
            const icon = document.createElement('span');
            icon.className = 'fa-duotone fa-solid fa-arrow-right-from-bracket';
            
            // Create the text label
            const label = document.createElement('div');
            label.style.cssText = `
                font-size: 0.8vw;
                font-weight: 300;
                margin-top: 5px;
                color: #fff;
            `;
            label.textContent = 'Close Entry';
            
            // Add click event to the entire container
            closeContainer.addEventListener('click', ()=>{
                let saveState=true;
                if(baseCheck(closeState.base,closeState.raw)){
                    saveState=confirm("Do you want to exit without saving your data?")
                }
                if(saveState){
                    window.location.replace('/evaluator')
                }
            });
            
            // Append elements
            closeContainer.appendChild(icon);
            closeContainer.appendChild(label);
            
            return closeContainer;
        }
        
        const Comment=()=>{
            // Create button container (whole thing is clickable)
            const commentContainer = document.createElement('div');
            commentContainer.style.cssText = `
                background-color: #333;
                border: solid thin #bbb;
                color: deepskyblue;
                outline: none;
                font-size: 1.5vw;
                text-align: center;
                width: 111px;
                height: auto;
                border-radius: 0.5vw;
                margin-top: 2vh;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                transition: all 0.3s ease;
            `;
            commentContainer.setAttribute('title', 'Open/Close Comments Panel');
            commentContainer.setAttribute('name', 'comment');
            
            // Create icon span
            const icon = document.createElement('span');
            icon.className = 'fa-solid fa-file-pen';
            
            // Create text label
            const label = document.createElement('span');
            label.style.cssText = `
                font-size: 0.7vw;
                font-weight: 300;
                margin-top: 5px;
                color: #fff;
                font-family: Quattrocento Sans, sans-serif;
            `;
            label.textContent = 'Comments';
            
            // Add click event to the entire container
            commentContainer.addEventListener('click', (e)=>{
                BotComState = !BotComState;
                
                // Change color to white when active, back to deepskyblue when inactive
                if(BotComState){
                    commentContainer.style.color = "#fff";
                    commentContainer.style.borderColor = "#fff";
                } else {
                    commentContainer.style.color = "deepskyblue";
                    commentContainer.style.borderColor = "#bbb";
                }
                
                ChangePanel({name: 'comment'});
            });
            
            // Append elements
            commentContainer.appendChild(icon);
            commentContainer.appendChild(label);
            
            return commentContainer;
        }
        
        const ScoreBoardButton=()=>{
            // Create button container (whole thing is clickable)
            const scoreContainer = document.createElement('div');
            scoreContainer.style.cssText = `
                background-color: #333;
                border: solid thin #bbb;
                color: deepskyblue;
                outline: none;
                font-size: 1.5vw;
                text-align: center;
                width: 111px;
                height: auto;
                border-radius: 0.5vw;
                margin-top: 2vh;
                margin-bottom: 5vh;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                transition: all 0.3s ease;
            `;
            scoreContainer.setAttribute('title', 'Open/Close Scoreboard Panel');
            scoreContainer.setAttribute('name', 'score');
            
            // Create icon span
            const icon = document.createElement('span');
            icon.className = 'fa-solid fa-chalkboard';
            
            // Create text label
            const label = document.createElement('span');
            label.style.cssText = `
                font-size: 0.8vw;
                font-weight: 300;
                margin-top: 5px;
                color: #fff;
                font-family: Quattrocento Sans, sans-serif;
            `;
            label.textContent = 'Scoreboard';
            
            // Add click event to the entire container
            scoreContainer.addEventListener('click', (e)=>{
                scoreBotState = !scoreBotState;
                
                // Change color to white when active, back to deepskyblue when inactive
                if(scoreBotState){
                    scoreContainer.style.color = "#fff";
                    scoreContainer.style.borderColor = "#fff";
                } else {
                    scoreContainer.style.color = "deepskyblue";
                    scoreContainer.style.borderColor = "#bbb";
                }
                
                ChangePanel({name: 'score'});
            });
            
            // Append elements
            scoreContainer.appendChild(icon);
            scoreContainer.appendChild(label);
            
            return scoreContainer;
        }
        
        // Create spacer function
        const Spacer = () => {
            const spacer = document.createElement('div');
            spacer.style.height = '10px';
            return spacer;
        }
        
        // Create main container
        const container = document.createElement('div');
        container.style.cssText = `
            width: 8vw;
            background-color: #555;
            height: fit-content;
            margin: auto;
            border: solid thin #bbb;
            display: flex;
            border-radius: 10px;
        `;
        
        // Create inner container
        const innerContainer = document.createElement('div');
        innerContainer.style.cssText = `
            width: fit-content;
            margin: auto;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;
        
        // Append all elements
        innerContainer.appendChild(Close());
        innerContainer.appendChild(Spacer());
        innerContainer.appendChild(Comment());
        innerContainer.appendChild(Spacer());
        innerContainer.appendChild(ScoreBoardButton());
        
        container.appendChild(innerContainer);
        
        return container;
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