import {$, Request} from '../lib/lib.js';
import {Header} from "./otherComponent/header.js";
import {Box, HeaderTable, Search} from "./evaluatorComponent/script/listBox.js";

export const Evaluator=()=>{
    document.getElementById('root').appendChild(Header())
    let event ,category
    const Label=$({
        tag:'div',
        style:{
            height:'5vh',
            width:'100%',
            display:'flex',
        },
        child:[
            $({
                tag:'div',
                text:'Submitted Entries',
                style:{
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    width:'fit-content',
                    height:'fit-content',
                    margin:'auto',
                    marginLeft:'5vw',
                    marginRight:'0',
                    fontSize:'1.5vw',
                    fontWeight:'bold',
                    color:'deepskyblue',
                    backgroundImage:'linear-gradient(to right, #555,transparent)',
                    paddingLeft:'5vw',
                    paddingRight:'5vw',
                    borderRadius:'.5vw 0 0 .5vw',

                }
            }),
            $({
                tag:'div',
                style:{
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    width:'fit-content',
                    height:'fit-content',
                    margin:'auto',
                    marginLeft:'0',
                    fontSize:'1.5vw',
                    display:'flex',
                    justifyContent: 'center',
                    padding:'.1rem',
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            margin:'auto',
                            width:'fit-content',
                            height:'fit-content',
                            fontSize:'1.1vw',
                            fontWeight:'bold',
                            color:'#777',
                            borderBottom:'solid thin deepskyblue'
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
                                })
                            })()
                        }
                    }),
                    $({
                        tag:'div',
                        style:{
                            margin:'auto',
                            marginLeft:'3vw',
                            width:'fit-content',
                            height:'fit-content',
                            fontSize:'1.1vw',
                            fontWeight:'bold',
                            color:'#777',
                            borderBottom:'solid thin deepskyblue'
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
