import { auth } from "@/auth";
import SubmissionList from "./submissions-list";

const Submissions = async() => {
    const session = await auth()
    return (
        <div>
           {session?.user && <SubmissionList userId={session?.user?.id}/>}
        </div>
    );
};

export default Submissions;