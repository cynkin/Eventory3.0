'use server';

import prisma from "@/lib/db";
import {auth} from "@/auth";
import ProfilePage from "./ProfilePage";
import {redirect} from "next/navigation";

export default async function getProfileData(){
    const session = await auth();

    const res = await prisma.contact.findUnique({
        where : {id : session?.user.id},
    })

    if(!res){
        redirect("/auth/email");
    }
    const data = {
        name: session?.user.name,
        email: session?.user.email,
        role: session?.user.role,
        balance: session?.user.balance,
        bio: res.bio || "",
        gender : res.gender,
        dob : res.date_of_birth,
        mobile_no : res.mobile_no,
        address : res.address,
        profile_pic : res.profile_pic
    }
    return <ProfilePage data={data}/>
}

