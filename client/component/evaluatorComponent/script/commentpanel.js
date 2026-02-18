import {$} from '../../../lib/lib.js'

export const CommentBoard=({title,docId,closeState})=>{

    const CommentBox=()=>{
        let inputPan
        const part=[]
        const botStat=[
            {
                name:'',

            }
        ]
        const data={
            title:'',
            abstract:'',
            intro:'',
            objective:'',
            methodology:'',
            results:'',
            recommendation:'',
            literature:'',
            other:''
        }
        let baseData={
            title:'',
            abstract:'',
            intro:'',
            objective:'',
            methodology:'',
            results:'',
            recommendation:'',
            literature:'',
            other:''
        }
        closeState({
            base:baseData,
            raw:data
        })
        const commentCat=[
            {
                name:'Title',
                getMethod:(event)=>{
                    data.title=event.target.innerHTML;
                    closeState({
                        base:baseData,
                        raw:data
                    })
                },
                id:'title'
            },
            {
                name:'Abstract',
                getMethod:(event)=>{
                    data.abstract=event.target.innerHTML;
                    closeState({
                        base:baseData,
                        raw:data
                    })
                },
                id:'abstract'
            },
            {
                name: 'Introduction',
                getMethod:(event)=>{
                    data.intro=event.target.innerHTML;
                    closeState({
                        base:baseData,
                        raw:data
                    })
                },
                id:'intro'
            },
            {
                name:'Objectives',
                getMethod:(event)=>{
                    data.objective=event.target.innerHTML;
                    closeState({
                        base:baseData,
                        raw:data
                    })
                },
                id:'objective'
            },
            {
                name:'Methodology',
                getMethod:(event)=>{
                    data.methodology=event.target.innerHTML;
                    closeState({
                        base:baseData,
                        raw:data
                    })
                },
                id:'methodology'
            },
            {
                name:'Results and Discussion',
                getMethod:(event)=>{
                    data.results=event.target.innerHTML;
                    closeState({
                        base:baseData,
                        raw:data
                    })
                },
                id:'results'
            },
            {
                name:'Conclusions and Recommendation',
                getMethod:(event)=>{
                    data.recommendation=event.target.innerHTML;
                    closeState({
                        base:baseData,
                        raw:data
                    })
                },
                id:'recommendation'
            },
            {
                name:'Literature',
                getMethod:(event)=>{
                    data.literature=event.target.innerHTML;
                    closeState({
                        base:baseData,
                        raw:data
                    })
                },
                id:'literature'
            },
            {
                name:'Other comments',
                getMethod:(event)=>{
                    data.other=event.target.innerHTML;
                    closeState({
                        base:baseData,
                        raw:data
                    })
                },
                id:'other'
            },
        ];
        const getComment=(event)=>{
            part.forEach(val=>{
                if(event.target.name===val.name){
                    val.style.display='block'
                }else {
                    val.style.display='none'
                }
            })
        }


        const chlInput=({getEl,name,nameDisplay,getInputEvent,postId})=>{
            let inputDiv
            const fontCol=()=>{
                let inC
                return($({
                    tag:'span',
                    style:{
                        fontSize:'1.1vw',
                        width:'fit-content',
                        padding:'.2rem',
                        borderRadius:'.2rem',
                        backgroundColor:'#444',
                        marginLeft: '.3vw',
                        marginRight: '.3vw',
                        border:'none',
                        outline: 'none',
                        cursor: 'pointer'
                    },
                    att:{
                        className:'clearComB'
                    },
                    child:[
                        $({
                            tag:'input',
                            att:{
                                type:'color',
                            },
                            style:{
                                position:'absolute',
                                top:'0',
                                left:'0',
                                zIndex:'-1',
                                opacity:'0',
                                width:'5vh'
                            },
                            event:{
                                type:'change',
                                method:(eve)=>{
                                    document.execCommand('foreColor',true,eve.target.value)
                                }
                            },
                            elementHandler:(el)=>{
                                setTimeout(()=>{ inC=el},100)
                            }
                        }),

                        $({
                            tag:'span',
                            att:{
                                className:'fa-solid fa-palette',
                                innerText:'T'
                            },

                        })
                    ],
                    event:{
                        type:'click',
                        method:()=>{
                            inC.click()
                        }
                    }
                }))

            }

            const editorIcon=({icon,event,pos})=>{
                return($({
                    tag:'button',
                    style:{
                        fontSize:'1.2vw',
                        width:'fit-content',
                        padding:'.2rem',
                        borderRadius:'.2rem',
                        backgroundColor:'#444',
                        marginLeft: pos,
                        marginRight: '.3vw',
                        border:'none',
                        outline: 'none',
                        cursor: 'pointer',
                    },
                    att:{
                        className:icon
                    },
                    event:{
                        type:'click',
                        method:event
                    }
                }))
            }

            return($({
                tag:'div',
                style:{
                    width:'99%',
                    height:'100%',
                    display:'none'
                },
                att:{
                    name:name
                },
                elementHandler:getEl,
                child:[
                    $({
                        tag:'div',
                        text:nameDisplay,
                        style:{
                            width:'100%',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontSize:'1vw',
                            fontWeight:'bold',
                            height:'fit-content',
                            paddingTop:'.2rem',
                            paddingBottom:'.2rem',
                            textIndent: '1vw',
                            borderBottom: 'solid thin deepskyblue'
                        }
                    }),
                    $({
                        tag:'div',
                        style:{
                            width:'100%',
                            backgroundColor:'#555',
                            height:'fit-content',
                            paddingTop: '.5rem',
                            paddingBottom: '.5rem'
                        },
                        child:[
                            editorIcon({
                                icon:'fa-solid fa-list-ul clearComB',
                                event:(eve)=>{
                                    document.execCommand('insertUnorderedList')
                                }
                            }),
                            editorIcon({
                                icon:'fa-solid fa-list-ol clearComB',
                                event:(eve)=>{
                                    document.execCommand('insertOrderedList')
                                }
                            }),
                            editorIcon({

                                icon:'fa-solid fa-bold clearComB',

                                event:(eve)=>{


                                    document.execCommand('bold')

                                }

                            }),

                            editorIcon({

                                icon:'fa-solid fa-italic clearComB',

                                event:(eve)=>{

                                    document.execCommand('italic')

                                }

                            }),

                            editorIcon({

                                icon:'fa-solid fa-underline clearComB',

                                event:(eve)=>{

                                    document.execCommand('underline')

                                }

                            }),
                            fontCol(),
                            editorIcon({
                                icon:'fa-solid fa-trash clearComB',
                                event:(eve)=>{
                                    let key=Object.keys(data)
                                    part.forEach((val,index)=>{

                                        if(nameDisplay.toUpperCase().includes(val.name.toUpperCase())){
                                            if(val.name===key[index]){
                                                data[key[index]]=''
                                                inputDiv.innerText=''
                                            }
                                        }

                                    })
                                },
                                pos:'10vw'
                            }),
                        ]
                    }),
                    $({
                        tag:'div',
                        style:{
                            width:'97%',
                            backgroundColor:'white',
                            height:'82%',
                            overflowY:'auto',
                            fontSize:'1vw',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            padding:'.5rem',
                            border:'none',
                            outline:'none'
                        },
                        att:{
                            contentEditable:'true',
                            name:name
                        },
                        event:{
                            type:'input',
                            method:getInputEvent
                        },
                        elementHandler:async (el)=>{
                            inputDiv=el
                            let form= new FormData()
                            form.append('reqCommentIndiv2','1')
                            form.append('comName',postId)
                            form.append('docId',docId)
                            await fetch('/comments',{
                                method:'post',
                                body:form
                            }).then(res=>res.json())
                                .then(val=>{
                                    baseData[val.name]=val.data
                                    data[val.name]=val.data
                                    el.innerHTML=val.data
                                })
                            
                            el.addEventListener('keydown',(e)=>{
                                if (e.keyCode === 9) { // tab key
                                    e.preventDefault();  // this will prevent us from tabbing out of the editor
                                    // now insert four non-breaking spaces for the tab key
                                    let doc = el.ownerDocument.defaultView;
                                    let sel = doc.getSelection();
                                    let range = sel.getRangeAt(0);

                                    let tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0");
                                    range.insertNode(tabNode);

                                    range.setStartAfter(tabNode);
                                    range.setEndAfter(tabNode);
                                    sel.removeAllRanges();
                                    sel.addRange(range);
                                }
                            })
                        }
                    })
                ]

            }))
        }
        const clipMap=commentCat.map(val=>{
            return chlInput({
                getEl:(el)=>{
                    part.push(el)
                },
                name:val.id,
                nameDisplay:val.name,
                getInputEvent:val.getMethod,
                postId:val.id
            })
        })
        const perComment=({label,click,botName})=>{
            return($({
                tag:'div',
                style:{
                    margin:'auto',
                    height:'fit-content',
                    marginTop:'1vh',
                    marginBottom:'1vh',
                    width:'100%',
                    textAlign:'left',
                    textIndent:'1vw',
                },
                child:[
                    $({
                        tag:'button',
                        style:{
                            fontSize:'1vw',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            color:'deepskyblue',
                            width:'50%',
                            outline:'none',
                            border: 'solid thin deepskyblue',
                            borderRadius: '.5rem',
                            height:'4vh',
                            cursor:'pointer'
                        },
                        att:{
                            className:'comBottonsnew',
                            name:botName
                        },
                        text:label,
                        event:{
                            type:'click',
                            method:click
                        }
                    })
                ]
            }))
        }
        const commentCatChild=commentCat.map((val,i)=>{
            return perComment(
                {
                    label:val.name,
                    click:getComment,
                    botName:val.id
                })
        })


        const hoverTool=()=>{
            const Bot=({text,event})=>{
                return($({
                    tag:'button',
                    style:{
                        width:'60%',
                        height:'5vh',
                        fontSize:'1.2vw',
                        marginTop:'1vh',
                        fontFamily:'',
                        cursor:'pointer',
                        border:'none',
                        outline:'none'
                    },
                    text:text,
                    att:{
                        className:'saveBotN'
                    },
                    event:event
                }))
            }

            return($({
                tag:'div',
                style:{
                    height:'100%',
                    display:'flex',
                    justifyContent:'center',
                    width:'35vw',
                    marginRight:'-37vw',
                    backgroundColor:'#222',
                    paddingLeft:'.5vw',
                    boxShadow:'-.5vw 0 .4rem .1rem rgba(0,0,0,0.5)',
                    borderLeft:'solid thin deepskyblue'
                },
                att:{
                    className:'hovClose'
                },
                child:[
                    $({
                        tag:'div',
                        att:{
                            className:'fa-solid fa-grip-lines-vertical'
                        },
                        style:{
                            margin:'auto',
                            width:'fit-content',
                            height:'fit-content',
                            fontSize:'2vw',
                            color:'deepskyblue',
                        }
                    }),
                    $({
                        tag:'div',
                        style:{
                            width:'50vw',
                            height:'100%',
                            backgroundColor:'#555',
                            marginLeft:'1vw',
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    width:'100%',
                                    height:'fit-content',
                                    margin:'auto',
                                    marginBottom:'2vh',
                                },
                                child:commentCatChild
                            }),
                            Bot({
                                text:'Save Changes',
                                event:{
                                    type:'click',
                                    method:async ()=>{
                                        try {
                                            // Validate
                                            if (!docId) {
                                                alert('Document ID is required');
                                                return;
                                            }
                                            // Create FormData instead of object array
                                            const formData = new FormData();
                                            formData.append('updateReview', 'true');
                                            formData.append('title', data.title || '');
                                            formData.append('intro', data.intro || '');
                                            formData.append('abstract', data.abstract || '');
                                            formData.append('objective', data.objective || '');
                                            formData.append('methodology', data.methodology || '');
                                            formData.append('results', data.results || '');
                                            formData.append('recommendation', data.recommendation || '');
                                            formData.append('literature', data.literature || '');
                                            formData.append('other', data.other || '');
                                            formData.append('docId', docId);
                                            // Send request
                                            const response = await fetch('/uploadResearchFile', {
                                                method: 'POST',
                                                body: formData
                                            });
                                            // Check if response is OK
                                            if (!response.ok) {
                                                throw new Error(`HTTP error! status: ${response.status}`);
                                            }
                                            // Parse JSON response
                                            const result = await response.json();
                                            
                                            // Show message
                                            alert(result.message || (result.status ? 'Changes saved successfully' : 'Failed to save changes'));
                                            
                                            if (result.status) {
                                                alert(result.message + (result.emailStatus ? '\n' + result.emailStatus : ''));
                                                
                                                // Update base data
                                                Object.keys(baseData).forEach(key => {
                                                    baseData[key] = data[key];
                                                });
                                                closeState({
                                                    base: {...baseData},
                                                    raw: {...data}
                                                });
                                            } else {
                                                alert(result.message || 'Failed to save comments');
                                            }
                                            
                                        } catch (error) {
                                            console.error('Error saving comments:', error);
                                            
                                            // Try to get response text for debugging
                                            if (error.response) {
                                                try {
                                                    const text = await error.response.text();
                                                    console.error('Response text:', text);
                                                } catch (e) {
                                                    // Ignore if we can't get text
                                                }
                                            }
                                            alert(`Error saving comments: ${error.message}`);
                                        }
                                    }
                                }
                            }),
                            Bot({text:'Reset all comments'})
                        ]
                    }),
                ],
                elementHandler:(el)=>{
                    el.addEventListener('mouseenter',(eve)=>{
                        eve.target.className='hoverTool'

                    })
                    el.addEventListener('mouseleave',(eve)=>{
                        eve.target.className='hovClose'
                    })
                }
            }))
        }
        return($({
            tag:'div',
            style:{
                 width:'98%',
                height:'68%',
                margin:'auto',
                marginTop:'2vh',
                overflowX:'hidden',
                borderTop:'solid 1px #555',
                borderBottom:'solid 1px #555',
                position:'relative',
                display:'flex'
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        width:'95%',
                        height:'100%',
                        backgroundColor:'#777',
                        borderRadius: '10px'
                    },
                    elementHandler:(el)=>{
                        inputPan=el
                    },
                    child:clipMap
                }),
                hoverTool()
            ]
        }))
    }
    return($({
        tag:'div',
        style:{
            width:'100%',
            height:'100%',
        },
        child:[
            $({
                tag:'div',
                text:'Comments',
                style:{
                    textAlign:'center',
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    fontSize:'1vw',
                    color:'#bbb',
                    marginTop:'1vh'
                }
            }),
            $({
                tag:'div',
                style:{
                    border:'solid thin #555',
                    backgroundColor:'#444',
                    borderRadius: '10px',
                    padding:'.5rem',
                    width:'90%',
                    margin:'auto',
                    marginTop: '2.5vh',
                    height:'fit-content',
                    maxHeight:'20%',
                    fontSize:'1vw',
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    color:'#aaa',
                    position:'relative'
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            position:'absolute',
                            top:'-2vh',
                            padding: '.1rem',
                            paddingLeft:'1vw',
                            paddingRight:'1vw',
                            borderRadius: '10px',
                            left:'1vw',
                            height:'fit-content',
                            width:'fit-content',
                            backgroundColor:'#222',
                            borderRadius:'.5rem',
                            fontWeight:'bold',
                            fontSize:'1vw'
                        },
                        text:'Entry Title'
                    })
                ],
                text:`" ${title} "`
            }),
            CommentBox()
        ]
    }))
}
