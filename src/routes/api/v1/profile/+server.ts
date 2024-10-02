import { db } from "$lib/server/auth";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { userProfileTable, userTable } from "../../../../schema";
import { eq } from "drizzle-orm";
import { profile_get } from "$lib/server/profile";

export const GET: RequestHandler = async ( event ) => {
    if (!event.locals.user) return error(401, 'Unauthorized');

    // Check the user can only access their own data
    const user = await db.select().from(userTable).where(eq(userTable.id, event.locals.user.id));

    if(user) {
        let profile = await profile_get(user[0]);
        return json(profile);
    }else{
        return error(401, 'Unauthorized');
    }
};