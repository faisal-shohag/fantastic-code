import { auth } from "@/auth";
const session = await auth()
export default session?.user