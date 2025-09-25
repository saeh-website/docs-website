import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

/**
 * A higher-order function to wrap API route handlers,
 * checking for a specific permission in the user's session.
 * @param {string} permission - The permission string to check for (e.g., 'doc_read').
 * @returns {function(handler: Function): Function}
 */
export function withPermission(permission) {
  return function (handler) {
    return async function (req, { params }) {
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userPermissions = session.user.currentDomain?.permissions || [];

      const hasPermission = userPermissions.some(p => p.name === permission);
      if (!hasPermission) {
        return NextResponse.json({ 
          error: "Forbidden", 
          details: `Missing permission: ${permission}`,
          userPermissions: userPermissions.map(p => p.name)
        }, { status: 403 });
      }

      // Pass session to the original handler
      return handler(req, { params, session });
    };
  };
}

/**
 * A higher-order function to wrap API route handlers,
 * checking only for a valid session.
 * @param {function} handler - The original API route handler.
 * @returns {Function}
 */
export function withAuth(handler) {
  return async function (req, { params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pass session to the original handler
    return handler(req, { params, session });
  };
}
