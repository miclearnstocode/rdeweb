import {$, Request} from '../lib/lib.js';
import {Header} from "./otherComponent/header.js";
import {Box, HeaderTable, Search} from "./evaluatorComponent/script/listBox.js";

export const Evaluator=()=>{
    document.getElementById('root').appendChild(Header())
    let event ,category
    const Label=$({
        tag:'div',
        style:{
            height:'auto', // Changed to auto
            minHeight: '5vh', // Minimum height
            width:'100%',
            display:'flex',
            flexWrap: 'wrap', // Allow wrapping on smaller screens
            padding: '1vh 0',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1vw',
        },
        child:[
            $({
                tag:'div',
                text:'Submitted Entries',
                style:{
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    width:'fit-content',
                    height:'fit-content',
                    marginLeft:'1vw',
                    fontSize:'clamp(1rem, 1.5vw, 1.5rem)',
                    fontWeight:'bold',
                    color:'deepskyblue',
                    backgroundImage:'linear-gradient(to right, #555,transparent)',
                    padding: '0.5vh 2vw',
                    borderRadius:'.5vw',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,

                }
            }),
            $({
                tag:'div',
                style:{
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    width:'auto',
                    display:'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding:'0 1vw',
                    gap:'1vw',
                    flex: '1'
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            margin:'0',
                            width:'auto',
                            maxWidth:'45%',
                            flex: '0 1 auto',
                            minWidth:'150px',
                            height:'fit-content',
                            fontSize:'clamp(0.8rem, 1vw, 1.2rem)',
                            fontWeight:'bold',
                            color:'#777',
                            borderBottom:'solid thin deepskyblue',
                            paddingBottom: '0.5vh',
                            wordWrap:'break-word',
                            overflowWrap:'break-word',
                            whiteSpace:'normal',
                            textAlign: 'center',
                        },
                        elementHandler:(ev)=>{
                            (async function(){
                                const req= new Request('/evaluatorReg')
                                req.Post([
                                    {
                                        name:'evalLeb',
                                        value:'1'
                                    }
                                ])
                                req.Json()
                                req.Send().then(data=>{
                                    ev.innerHTML=`<span style="color:deepskyblue">CENTER :</span> ${data.category}`
                                }).catch(err=>{
                                    console.error('Error loading center info:', err)
                                    ev.innerHTML=`<span style="color:deepskyblue">CENTER :</span> <span style="color:red">Error loading</span>`
                                })
                            })()
                        }
                    }),
                    $({
                        tag:'div',
                        style:{
                            margin:'auto',
                            width:'fit-content',
                            maxWidth:'45%',
                            height:'fit-content',
                            fontSize:'1.1vw',
                            fontWeight:'bold',
                            color:'#777',
                            borderBottom:'solid thin deepskyblue',
                            wordWrap:'break-word',
                            overflowWrap:'break-word',
                            whiteSpace:'normal',
                            flexShrink:'1',
                            minWidth: '0'
                        },
                        elementHandler:(ev)=>{
                            (async function(){
                                const req= new Request('/evaluatorReg')
                                req.Post([
                                    {
                                        name:'evalLeb',
                                        value:'1'
                                    }
                                ])
                                req.Json()
                                req.Send().then(data=>{
                                    ev.innerHTML=`<span style="color:deepskyblue">EVENT :</span> ${data.event}`
                                }).catch(err=>{
                                    console.error('Error loading event info:', err)
                                    ev.innerHTML=`<span style="color:deepskyblue">EVENT :</span> <span style="color:red">Error loading</span>`
                                })
                            })()
                        }
                    })
                ]
            }),
        ]
    })

    let boxBody
    const getBox=(el)=>{
        boxBody=el
    }
    const searchMethod=(ev)=>{
        boxBody.childNodes.forEach(val=>{
            if(!val.innerText.toUpperCase().includes(ev.target.value.toUpperCase())&&ev.target.value!==''){
               val.style.display='none'
            }else {
                val.style.display=''
            }
        })
    }


    return($({
        tag:'div',
        externalStyle:'/client/component/evaluatorComponent/style/evaluator.css',
        att:{
            className:'evalPanel'
        },
        child:[
            Label,
            Search(searchMethod),
           // HeaderTable(),
            Box(getBox)
        ]

    }))
}
