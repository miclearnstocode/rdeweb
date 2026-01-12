 const LogRequest= async ()=>{
    const form= new FormData()
    form.append("sessionChecker", "true")
   return  await fetch("/sessionCheck", {
        method: 'POST',
        body: form
    }).then(response =>response.json())
}



export const CheckLogOut=async ()=>{
    setTimeout(()=>{
        LogRequest().then(data=>{
            if(data.status){
                window.location.replace('/')
            }else{
                CheckLogOut()
            }
        })

    },2000)
 }
 export const CheckLogIn=async ()=>{
     setTimeout(()=>{
         LogRequest().then(data=>{
             if(!data.status){
                 window.location.replace('/')
             }else {
                 CheckLogIn()
             }
         })
     },2000)
 }

 export const Socket=()=>{
    const sender=new WebSocket("wss://")
 }