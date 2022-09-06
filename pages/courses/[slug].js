import {
    CourseHeroComponent,
    CourseKeypointsComponent,
    CourseLecturesComponent,
} from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import Web3Context from "store/contract-context";
import { retrieveData } from "store/course-context";
import { useContext } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import { wformat } from "utils/stringutils";

const GET_PURCHASE_STATUS_COURSE_QUERY = `
    query getPurchaseStatus{
        purchasedItems(where: {id:"%courseId", buyer:"%customerAddress"}) {
            id
        }
    }
`;

export default function Course() {
    const web3Context = useContext(Web3Context.Web3Context);
    const { account } = useMoralis();
    const router = useRouter();

    if (!web3Context || !web3Context?.isWeb3Enabled) {
        return (
            <div className="my-28 text-2xl text-center text-blue-900">
                Please connect an account...
            </div>
        );
    }

    const thisCourse = JSON.parse(retrieveData(router.query.id));
    const queryCoursePurchaseStatus = wformat(GET_PURCHASE_STATUS_COURSE_QUERY, {
        courseId: `${thisCourse.id}`,
        customerAddress: `${account}`,
    });

    const [res] = useQuery({
        query: queryCoursePurchaseStatus,
        requestPolicy: "cache-and-network",
    });
    if (res.fetching)
        return <div className="text-center my-28 text-2xl text-blue-900">Loading...</div>;
    if (res.error)
        return (
            <div className="text-center my-28 text-2xl text-blue-900">
                {res.error.message}
            </div>
        );
    if (!res.data)
        return (
            <div className="text-center my-28 text-2xl text-blue-900">
                {`There was an issue trying to fetch purchase status for course id: ${thisCourse.id}`}
            </div>
        );
    const hasBeenPurchased = res.data.purchasedItems.length == 1;

    return (
        <div>
            {web3Context.isChainSupported ? (
                <div className="py-10">
                    {thisCourse ? (
                        <div className="py-4">
                            <CourseHeroComponent
                                hasOwner={hasBeenPurchased}
                                courseItem={thisCourse}
                            />
                            <CourseKeypointsComponent points={thisCourse.wsl} />
                            <CourseLecturesComponent />{" "}
                        </div>
                    ) : (
                        <div>There was an error trying to fetch course</div>
                    )}
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
}

Course.Layout = BaseLayout;
