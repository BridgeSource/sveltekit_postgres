import { lucia } from "$lib/server/auth";
import { type Handle, type HandleFetch } from "@sveltejs/kit";

// export const handleFetch: HandleFetch = async ({ request, fetch }) => {
// 	if (request.url.startsWith('https://api.yourapp.com/')) {
// 		// clone the original request, but change the URL
// 		request = new Request(
// 			request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
// 			request,
// 		);
// 	}

// 	return fetch(request);
// };

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		// sveltekit types deviates from the de-facto standard
		// you can use 'as any' too
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
