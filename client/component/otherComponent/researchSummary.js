import {$} from "../../lib/lib.js";


export const PrintResearch=({eventName,data})=>{

    return ($({
        tag:'div',
        att:{
            width: '100%',
        },
        child:[
            $({
                tag:'div',
                text:'Accepted Entries for '+eventName,
                style:{
                    margin:'2rem',
                    fontSize:'25px',
                    fontWeight:'bold',
                    textAlign:'center'
                }
            }),
            $({
                tag:'div',
                style:{
                    width: '100%',
                    marginTop:'10px'
                },
                child:data.map(val=>{
                    return($({
                        tag:'div',
                        style:{
                            marginTop: '10px',
                            width:'100%'
                        },
                        child:val.category.map(cat=>{
                            if(cat.docs.length===0){
                                return $({
                                    tag:'div'
                                })
                            }
                            return($({
                                tag:'div',
                                style:{
                                    marginTop: '10px',
                                    width:'100%'
                                },
                                child:[
                                    $({
                                        tag:'h3',
                                        text:cat.category
                                    }),
                                    $({
                                        tag:'ol',
                                        att:{
                                            start:'1'
                                        },
                                        child:cat.docs.map(doc=>{
                                            return ($({
                                                tag:'li',
                                                child:[
                                                    $({
                                                        tag:'span',
                                                        text:doc.title
                                                    }),
                                                    $({
                                                        tag:'i',
                                                        text:" by "+doc.authors.join(",")
                                                    }),
                                                    $({
                                                        tag:'b',
                                                        text:"-"+doc.campus
                                                    })
                                                ]
                                            }))
                                        })
                                    })
                                ]

                            }))
                        })
                    }))
                })
            })
        ]
    }))
}