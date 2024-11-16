import { auth } from "@/auth";
import AddProblemForm from "./add-problem-form";


const AddProblem = async () => {
    const session = await auth()
    const user = session?.user
    if (!user?.id) {
        return <div>Loading...</div>; // Or handle it in another way (e.g., redirect)
    }

    return (
        <div className="section">
            <AddProblemForm authorId={user.id}/>
        </div>
    );
};

export default AddProblem;
