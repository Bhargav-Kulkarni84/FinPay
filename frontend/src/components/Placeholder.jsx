export default function Placeholder({label}){

    return(
        <div>
            <label htmlFor="Name"></label>
            <input className="w-full" type="text" value={label}/>
        </div>
    )

}