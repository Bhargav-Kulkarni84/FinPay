import Heading from "../components/Heading"
import Subheading from "../components/Subheading"
import Placeholder from "../components/Placeholder"

export default function SignUp(){

    return (
        <div >
            <Heading label={"Sign Up"}/>
            <Subheading label={"Sign up to continue"}/>
            <Placeholder label={"firstname"}/>
            <Placeholder label={"lastname"}/>
            <Placeholder label={"username"}/>
            <Placeholder label={"password"}/>

        </div>
    )
}