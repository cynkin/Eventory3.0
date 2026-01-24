'use server'
import { auth } from '@/auth';
import  prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

type profile = {
    name? : string,
    bio? : string,
    mobile_no? : string,
    dob? : string,
    gender? : string,
    emergency_email? : string,
    address? : string,
    profile_pic? : string,
}

export async function updateContact(data: profile) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    try{
        await prisma.contact.update({
            where : {id : session.user.id},
            data: {
                    mobile_no: data.mobile_no,
                    emergency_email: data.emergency_email,
                    address: data.address,
                },
        })

        revalidatePath('/account/profile');
        revalidatePath('/');
        return { success: true };
    }
    catch(err){
        return { success: false, error: err };
    }
}