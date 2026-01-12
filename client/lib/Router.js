import {Error} from "../error.js";
import {Path} from "./lib.js";

export const Route=(path,component)=>{
    return{path,component}
}
export const Router=({indexPath,components})=>{


    for(let x=0;x<components.length;x++){
        if(components[x].path===Path(indexPath)){
            return components[x].component
        }
        if(components[x].path.toUpperCase()==='INDEX'&&(Path(indexPath)===undefined||Path(indexPath)==='')){

            return components[x].component
        }
    }
    return Error()
}

export const Switch=({indexPath,components})=>{

    for(let x=0;x<components.length;x++){
        if(components[x].path===Path(indexPath)){
            if(!components[x].component.auth){
                return [Error()]
            }
            return components[x].component.element
        }
        if(components[x].path.toUpperCase()==='INDEX'&&(Path(indexPath)===undefined||Path(indexPath)==='')){

            return components[x].component.element
        }
    }
    return [Error()]
}