import { PiEmptyDuotone } from "react-icons/pi";
const NoData = () => {
    return (
        <div  className="flex justify-center items-center h-[300px]">
            
            <div className="flex flex-col items-center">
                <div className="text-7xl">
                <PiEmptyDuotone />
                </div>
                <p className="text-xl font-bold text-muted-foreground mt-3">
                    NULL;
                </p>
            </div>
        </div>
    );
};

export default NoData;