import {$} from '../../../lib/lib.js'
import {EntryView} from "./entryview.js";

// Add the StatusLabels component
const StatusLabels = ({ hasScore, hasComment }) => {
    return $({
        tag: 'div',
        style: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '8px',
            pointerEvents: 'none'
        },
        child: [
            // Comment Status Label
            $({
                tag: 'div',
                style: {
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8vw',
                    fontWeight: '600',
                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    backgroundColor: hasComment ? '#10b981' : '#6b7280',
                    color: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(4px)',
                    border: hasComment ? '1px solid #059669' : '1px solid #4b5563',
                    transition: 'all 0.3s ease'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: hasComment ? 'fa-solid fa-comment' : 'fa-regular fa-comment'
                        },
                        style: {
                            fontSize: '0.8vw'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: hasComment ? 'Commented' : 'No Comments'
                    })
                ]
            }),
            
            // Score Status Label
            $({
                tag: 'div',
                style: {
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8vw',
                    fontWeight: '600',
                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    backgroundColor: hasScore ? '#8b5cf6' : '#6b7280',
                    color: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(4px)',
                    border: hasScore ? '1px solid #7c3aed' : '1px solid #4b5563',
                    transition: 'all 0.3s ease'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: hasScore ? 'fa-solid fa-star' : 'fa-regular fa-star'
                        },
                        style: {
                            fontSize: '0.8vw'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: hasScore ? 'Scored' : 'Not Scored'
                    })
                ]
            })
        ]
    });
};

//this will show the list of documents that are assigned to the evaluator
export const EntryList=({title, author, docId, index, center, status, eventId, catId, hasScore, hasComment})=>{
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
            borderRadius: '.5vw',
            position: 'relative', // Add this for absolute positioning of labels
            backgroundColor: '#333', // Add background color
            overflow: 'hidden' // Hide overflow for the gradient effect
        },
        att:{
            className:'listClass entry-card' // Add entry-card class for hover effects
        },
        child:[
            // Background gradient effect based on status
            $({
                tag:'div',
                style:{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: hasScore && hasComment 
                        ? 'linear-gradient(90deg, #10b981, #8b5cf6)' 
                        : hasScore 
                            ? '#8b5cf6' 
                            : hasComment 
                                ? '#10b981' 
                                : '#6b7280'
                }
            }),
            
            // Status Labels
            StatusLabels({
                hasScore: hasScore || false,
                hasComment: hasComment || false
            }),
            
            // Original content with padding for labels
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
                                text:"Center : ",
                                style:{
                                    color: 'deepskyblue'
                                }
                            }),
                            $({
                                tag:'span',
                                text:center,
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
                    color:status?'deepskyblue':'#bbb',
                    paddingRight: '180px' // Add padding to make space for labels
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