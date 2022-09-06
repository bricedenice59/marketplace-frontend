import { CourseStatusComponent } from "@components/ui/course/index";
import { EthPriceDisplayComponent } from "@components/ui/web3/index";
import { storeData, deleteData } from "store/course-context";
import Link from "next/link";
import Image from "next/image";
import { imgLoader } from "utils/imgLoader";
import { useState, useEffect, useRef } from "react";
const {
    execSQL,
    DB_SCHEMA_NAME,
    TABLE_COURSES,
} = require("marketplace-shared/lib/database/harperDbUtils");

export default function CourseListComponent({
    courseId,
    courseStatus,
    shouldDisplayStatus,
    shouldDisplayPrice,
}) {
    const [course, setCourse] = useState(null);
    const prevCourseIdRef = useRef();

    const getCourse = async (_courseId) => {
        const sql = `SELECT *
        FROM ${DB_SCHEMA_NAME}.${TABLE_COURSES}
        WHERE id = "${_courseId}"`;
        const response = await execSQL(sql);

        if (response.error) {
            console.error(response.error);
            return null;
        }
        var parsedResponse = JSON.parse(response);
        try {
            return parsedResponse[0];
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        if (prevCourseIdRef) {
            deleteData(prevCourseIdRef.current);
        }
        prevCourseIdRef.current = courseId;
        getCourse(courseId).then((_course) => {
            if (_course != null) {
                setCourse(_course);
            }
        });
    }, [courseId]);

    return (
        <div>
            {course ? (
                <div className="md:flex">
                    <div className="md:flex-shrink-0">
                        <Image
                            className="h-full w-full object-cover md:w-48"
                            loader={imgLoader}
                            src={course.coverImage}
                            alt="image"
                            width="150"
                            height="275"
                            unoptimized="true"
                        />
                    </div>
                    <div
                        className="p-8"
                        onClick={() => {
                            storeData(course.id, JSON.stringify(course));
                        }}
                    >
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                            {course.type}
                        </div>
                        <Link
                            href={{
                                pathname: `/courses/${course.slug}`,
                                query: { id: course.id },
                            }}
                        >
                            <a className="h-12 block mt-1 text-lg leading-tight font-medium text-black hover:underline">
                                {course.title}
                            </a>
                        </Link>
                        <p className="mt-2 py-5 text-gray-500">
                            {course.description?.substring(0, 70)}...
                        </p>
                        {shouldDisplayPrice ? (
                            <EthPriceDisplayComponent coursePrice={course.price} />
                        ) : (
                            <div></div>
                        )}
                    </div>
                    {shouldDisplayStatus ? (
                        <div className="p-8">
                            <CourseStatusComponent
                                courseId={course.id}
                                statusParam={courseStatus}
                            />
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
}
