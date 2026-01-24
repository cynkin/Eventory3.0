'use client'
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/account/ProfileForm";
import ContactForm from "@/components/account/ContactForm";

type Data ={
    name: string | null | undefined;
    email: string | null | undefined;
    role: string | undefined;
    balance: number | undefined;
    bio: string;
    gender: string | null;
    dob: string | null;
    mobile_no: string | null;
    address: string | null;
    profile_pic: string | null;
}

function capitalize(str: string) {
    if (!str) return "";
    str = str.split(" ")[0];
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDate(dateStr: string){
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }); // "Jul"
    const year = date.getFullYear(); // 2025

    return `${day} ${month}, ${year}`;
}

export default function ProfilePage({data} : {data : Data}) {

    const searchParams = useSearchParams();
    const edit = searchParams.get('edit');

    return(
        <>
            {edit === 'basic-info' ?
                <div className="flex justify-center items-center w-full">
                    <ProfileForm data={data}/>
                </div>

                : edit === 'contact-info' ?
                    <div className="flex justify-center items-center w-full">
                        <ContactForm data={data}/>
                    </div>
                    :
                    <>
                        <div className="w-full border pt-13 pb-11 px-12 border-gray-300 rounded-xl m-5">
                            <div className="text-3xl font-bold">
                                {capitalize(data.name!)}
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <div className="text-[28px] font-medium mt-12">Basic Information</div>
                                    <Link href="/account/profile?edit=basic-info" className="font-[500] rounded-4xl px-2 py-2 transition-all duration-200  hover:bg-blue-50 text-blue-600 hover:cursor-pointer">Edit</Link>
                                </div>
                                <div className="text-sm mb-5">Make sure this information matches your travel ID, like your passport or licence</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10 text-[15px] text-[#0f172a]">
                                    <div>
                                        <div className="font-semibold">Name</div>
                                        <div>{data.name}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold">Bio</div>
                                        <div>{data.bio ? data.bio : "Not provided"}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold">Date of birth</div>
                                        <div>{data.dob ? formatDate(data.dob) : "Not provided"}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold">Gender</div>
                                        <div>{data.gender ? data.gender.toUpperCase() : "Not provided"}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold">Profile Picture</div>
                                        <div>{data.profile_pic
                                            ? <div className="rounded-full border-2 mt-5 w-20 h-20 relative overflow-hidden">
                                                <img alt="" className="scale-100 overflow-hidden transition-all ease-in-out duration-300"  style={{ objectFit:"cover", objectPosition: "center"}}
                                                     src={data.profile_pic}  />
                                            </div>
                                            : "Not provided"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-[28px] font-medium mt-12">Contact</div>
                                    <Link href="/account/profile?edit=contact-info" className="font-[500] rounded-3xl px-2 py-2 transition-all duration-200  hover:bg-blue-50 text-blue-600 hover:cursor-pointer">Edit</Link>
                                </div>
                                <div className="text-sm mb-5">Receive account activity alerts and trip updates by sharing this information</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10 text-[15px] text-[#0f172a]">
                                    <div>
                                        <div className="font-semibold">Mobile Number</div>
                                        <div>{data.mobile_no ? data.mobile_no : "Not provided"}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold">Email</div>
                                        <div>{data.email}</div>
                                    </div>
                                    {/*<div>*/}
                                    {/*    <div className="font-semibold">Emergency Contact</div>*/}
                                    {/*    <div>Not provided</div>*/}
                                    {/*</div>*/}
                                    <div>
                                        <div className="font-semibold">Address</div>
                                        <div>{data.address ? data.address : "Not provided"}</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </>
            }
        </>
    )
}