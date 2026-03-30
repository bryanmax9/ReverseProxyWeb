export default async (request, context) => {
    // Check if the user has the 'calite_auth' cookie
    const authCookie = context.cookies.get("calite_auth");

    // If they haven't been verified by the Welcome Page, redirect them back to the Welcome Page
    if (authCookie !== "verified") {
        const url = new URL("/", request.url);
        return Response.redirect(url, 302);
    }

    // If they are verified, let the request pass through to the reverse proxy seamlessly
    return context.next();
};
